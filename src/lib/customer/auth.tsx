"use client";

import * as React from "react";

/**
 * Phiên đăng nhập của KHÁCH HÀNG.
 *
 * Tài khoản nằm ở máy chủ (src/lib/server/*), trình duyệt chỉ gọi API. Phiên là
 * cookie httpOnly nên mã JavaScript ở trang không đọc được — kể cả khi có lỗi XSS.
 * Mật khẩu băm bằng bcrypt phía máy chủ, không bao giờ rời khỏi đó.
 *
 * Giai đoạn kiểm thử, kho dữ liệu là một tệp JSON trong data/ (xem
 * src/lib/server/store.ts). Đổi sang cơ sở dữ liệu thật không phải sửa tệp này.
 */

export interface CustomerSession {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  /** Số dư thật, do máy chủ trả về. Đừng bao giờ đọc số dư từ dữ liệu mẫu. */
  balance: number;
  createdAt: string;
}

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export type AuthResult = { ok: true } | { ok: false; error: string; field?: keyof RegisterInput };

/** Kênh mà mã đặt lại được gửi đi — "console" là SMTP chưa cấu hình. */
export type Delivery = "smtp" | "console";

/** Mọi route auth đều trả cùng một hình dạng, nên gom về một kiểu cho gọn. */
interface ApiReply {
  ok: boolean;
  error?: string;
  field?: string;
  account?: CustomerSession;
  delivery?: Delivery;
}

async function post(url: string, body: unknown): Promise<ApiReply> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as ApiReply;
  } catch {
    return { ok: false, error: "Không gọi được máy chủ." };
  }
}

interface AuthContextValue {
  session: CustomerSession | null;
  /** `false` khi chưa hỏi xong máy chủ — tránh nháy nút đăng nhập rồi lại đổi. */
  ready: boolean;
  register: (input: RegisterInput) => Promise<AuthResult>;
  login: (identifier: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  /** Hỏi lại máy chủ, chủ yếu để số dư trên thanh trên cùng khớp sau khi mua/nạp. */
  refresh: () => Promise<void>;
  requestResetCode: (email: string) => Promise<{ ok: true; delivery: Delivery } | { ok: false; error: string }>;
  resetPassword: (
    email: string,
    code: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string; field?: string }>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<CustomerSession | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { account: CustomerSession | null }) => {
        if (alive) setSession(d.account ?? null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const register = React.useCallback(async (input: RegisterInput): Promise<AuthResult> => {
    const res = await post("/api/auth/register", input);
    if (!res.ok) {
      return { ok: false, error: res.error ?? "Không tạo được tài khoản.", field: res.field as keyof RegisterInput };
    }
    setSession(res.account ?? null);
    return { ok: true };
  }, []);

  const login = React.useCallback(async (identifier: string, password: string): Promise<AuthResult> => {
    const res = await post("/api/auth/login", { identifier, password });
    if (!res.ok) return { ok: false, error: res.error ?? "Đăng nhập không thành công." };
    setSession(res.account ?? null);
    return { ok: true };
  }, []);

  const logout = React.useCallback(async () => {
    await post("/api/auth/logout", {});
    setSession(null);
  }, []);

  const requestResetCode = React.useCallback(async (email: string) => {
    const res = await post("/api/auth/forgot", { email });
    if (!res.ok) return { ok: false as const, error: res.error ?? "Không gửi được yêu cầu." };
    return { ok: true as const, delivery: res.delivery ?? ("smtp" as Delivery) };
  }, []);

  const refresh = React.useCallback(async () => {
    const d = await fetch("/api/auth/me")
      .then((r) => r.json())
      .catch(() => null);
    if (d) setSession(d.account ?? null);
  }, []);

  const resetPassword = React.useCallback(async (email: string, code: string, password: string) => {
    const res = await post("/api/auth/reset", { email, code, password });
    if (!res.ok) return { ok: false as const, error: res.error ?? "Không đặt lại được mật khẩu.", field: res.field };
    return { ok: true as const };
  }, []);

  const value = React.useMemo(
    () => ({ session, ready, register, login, logout, refresh, requestResetCode, resetPassword }),
    [session, ready, register, login, logout, refresh, requestResetCode, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useCustomerAuth phải nằm trong <CustomerAuthProvider>");
  return ctx;
}
