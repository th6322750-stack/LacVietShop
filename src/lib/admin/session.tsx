"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { type AdminPermission } from "./data";

/**
 * Phiên đăng nhập quản trị.
 *
 * CẢNH BÁO: bản dựng này chưa có backend xác thực (gap `auth.provider` trong
 * .webby/FINAL_GAPS_REPORT.md). Phiên chỉ nằm trong localStorage của trình duyệt và
 * danh sách tài khoản nằm trong mã nguồn, nên đây là lớp PHÂN VAI TRÒ khi thao tác,
 * không phải bảo mật thật. Trang đăng nhập nói rõ điều này cho người dùng.
 */

const KEY = "lacviet_admin_session_v1";

export interface AdminSession {
  id: number;
  username: string;
  name: string;
  role: string;
  email: string;
  permissions: AdminPermission[];
  loginAt: string;
}

interface SessionContextValue {
  session: AdminSession | null;
  /** `false` khi chưa đọc xong localStorage — tránh nháy nội dung trước khi biết đã đăng nhập chưa. */
  ready: boolean;
  login: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  can: (permission: AdminPermission) => boolean;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AdminSession | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let local: AdminSession | null = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) local = JSON.parse(raw) as AdminSession;
    } catch {
      /* trình duyệt chặn storage — coi như chưa đăng nhập */
    }

    if (!local) {
      setReady(true);
      return;
    }

    // Máy chủ mới là nơi quyết định. Phiên trong trình duyệt có thể còn trong khi
    // cookie phía máy chủ đã hết hạn hoặc bị xoá — lúc đó giao diện tưởng đã đăng
    // nhập nhưng mọi lời gọi đều bị từ chối, người dùng không hiểu vì sao.
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (d?.admin) {
          setSession(d.profile?.permissions?.length ? { ...local, ...d.profile } : local);
        } else {
          try {
            window.localStorage.removeItem(KEY);
          } catch {
            /* bỏ qua */
          }
          setSession(null);
        }
      })
      .catch(() => {
        // Không hỏi được máy chủ thì cứ giữ phiên, để mất mạng tạm thời không
        // đá người dùng ra ngoài.
        setSession(local);
      })
      .finally(() => setReady(true));
  }, []);

  const login = React.useCallback(async (username: string, password: string) => {
    // Máy chủ mới là nơi quyết định: cookie httpOnly do nó cấp mở khoá các đường
    // ghi dữ liệu chung (bảng giá). Danh sách quyền dưới đây chỉ để ẩn/hiện nút.
    const server = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));

    if (!server.ok) return { ok: false as const, error: String(server.error ?? "Đăng nhập không thành công.") };

    // Bộ quyền do máy chủ trả về. Trước đây trình duyệt tự tra tên đăng nhập
    // trong một danh sách cắm cứng, nên đổi tên tài khoản trong ADMIN_ACCOUNTS là
    // đúng mật khẩu vẫn bị chặn — cái bẫy chỉ nổ trên bản chạy thật.
    const account = server.profile;
    if (!account || !Array.isArray(account.permissions) || account.permissions.length === 0) {
      return { ok: false as const, error: "Tài khoản này chưa được gán quyền quản trị." };
    }

    const next: AdminSession = {
      id: account.id,
      username: account.username,
      name: account.name,
      role: account.role,
      email: account.email,
      permissions: account.permissions,
      loginAt: new Date().toISOString(),
    };
    setSession(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* bỏ qua */
    }
    return { ok: true as const };
  }, []);

  const logout = React.useCallback(() => {
    void fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
    setSession(null);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* bỏ qua */
    }
  }, []);

  const can = React.useCallback(
    (permission: AdminPermission) => Boolean(session?.permissions.includes(permission)),
    [session],
  );

  const value = React.useMemo(
    () => ({ session, ready, login, logout, can }),
    [session, ready, login, logout, can],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAdminSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useAdminSession phải nằm trong <AdminSessionProvider>");
  return ctx;
}

/** Chưa đăng nhập thì chuyển về trang login, kèm đường dẫn để quay lại. */
export function useRequireAdmin(currentPath: string) {
  const { session, ready } = useAdminSession();
  const router = useRouter();

  React.useEffect(() => {
    if (ready && !session) {
      router.replace(`/admin/login?next=${encodeURIComponent(currentPath)}`);
    }
  }, [ready, session, router, currentPath]);

  return { session, ready };
}
