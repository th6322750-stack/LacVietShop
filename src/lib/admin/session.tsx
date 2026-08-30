"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { adminAccounts, type AdminPermission } from "./data";

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
  login: (username: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  can: (permission: AdminPermission) => boolean;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<AdminSession | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw) as AdminSession);
    } catch {
      /* trình duyệt chặn storage — coi như chưa đăng nhập */
    }
    setReady(true);
  }, []);

  const login = React.useCallback((username: string, password: string) => {
    const account = adminAccounts.find((a) => a.username === username.trim().toLowerCase());
    if (!account) return { ok: false as const, error: "Không tìm thấy tài khoản này." };
    if (account.password !== password) return { ok: false as const, error: "Mật khẩu không đúng." };

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
