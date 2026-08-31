"use client";

import * as React from "react";

/**
 * Tài khoản và phiên đăng nhập của KHÁCH HÀNG.
 *
 * CẢNH BÁO: bản dựng này chưa có backend xác thực (gap `auth.provider`).
 * Tài khoản nằm trong localStorage của từng trình duyệt, nên:
 *   - đăng ký ở máy này thì máy khác không đăng nhập được;
 *   - không có xác minh email/số điện thoại, không có khôi phục mật khẩu thật;
 *   - băm mật khẩu ở phía trình duyệt KHÔNG phải bảo mật — ai mở DevTools cũng
 *     sửa được dữ liệu. Nó chỉ để không lưu mật khẩu dạng chữ thường nhìn thấy ngay.
 *
 * Khi có backend thật, thay phần thân register/login bằng lời gọi API; giao diện
 * và luồng màn hình giữ nguyên.
 */

const ACCOUNTS_KEY = "lacviet_customer_accounts_v1";
const SESSION_KEY = "lacviet_customer_session_v1";

export interface CustomerAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  /** Muối ngẫu nhiên cho từng tài khoản. */
  salt: string;
  /** SHA-256 của (muối + mật khẩu), dạng hex. */
  hash: string;
  createdAt: string;
}

export interface CustomerSession {
  id: string;
  name: string;
  username: string;
  email: string;
  loginAt: string;
}

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

type Result = { ok: true } | { ok: false; error: string; field?: keyof RegisterInput };

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function digest(salt: string, password: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface AuthContextValue {
  session: CustomerSession | null;
  /** `false` khi chưa đọc xong localStorage — tránh nháy nút đăng nhập rồi lại đổi. */
  ready: boolean;
  /** Số tài khoản đã đăng ký trên trình duyệt này. */
  accountCount: number;
  register: (input: RegisterInput) => Promise<Result>;
  login: (identifier: string, password: string) => Promise<Result>;
  logout: () => void;
  /** Có nội dung khi trình duyệt từ chối lưu. */
  storageError: string | null;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<CustomerSession | null>(null);
  const [accounts, setAccounts] = React.useState<CustomerAccount[]>([]);
  const [ready, setReady] = React.useState(false);
  const [storageError, setStorageError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setAccounts(readJson<CustomerAccount[]>(ACCOUNTS_KEY) ?? []);
    setSession(readJson<CustomerSession>(SESSION_KEY));
    setReady(true);
  }, []);

  const persistAccounts = React.useCallback((next: CustomerAccount[]) => {
    setAccounts(next);
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
      setStorageError(null);
    } catch {
      // Không nuốt lỗi: người dùng phải biết tài khoản vừa tạo sẽ mất khi tải lại.
      setStorageError("Trình duyệt không lưu được dữ liệu. Tài khoản vừa tạo chỉ tồn tại trong phiên này.");
    }
  }, []);

  const startSession = React.useCallback((account: CustomerAccount) => {
    const next: CustomerSession = {
      id: account.id,
      name: account.name,
      username: account.username,
      email: account.email,
      loginAt: new Date().toISOString(),
    };
    setSession(next);
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {
      /* phiên vẫn dùng được cho tới khi tải lại trang */
    }
  }, []);

  const register = React.useCallback(
    async (input: RegisterInput): Promise<Result> => {
      if (!crypto?.subtle) {
        return { ok: false, error: "Trình duyệt không hỗ trợ mã hoá, không tạo được tài khoản." };
      }
      const username = input.username.trim().toLowerCase();
      const email = input.email.trim().toLowerCase();

      if (accounts.some((a) => a.username === username)) {
        return { ok: false, error: "Tên đăng nhập này đã có người dùng.", field: "username" };
      }
      if (accounts.some((a) => a.email === email)) {
        return { ok: false, error: "Email này đã được đăng ký.", field: "email" };
      }

      const salt = randomSalt();
      const account: CustomerAccount = {
        id: `kh-${Date.now().toString(36)}`,
        name: input.name.trim(),
        username,
        email,
        phone: input.phone.trim(),
        salt,
        hash: await digest(salt, input.password),
        createdAt: new Date().toISOString(),
      };

      persistAccounts([...accounts, account]);
      startSession(account);
      return { ok: true };
    },
    [accounts, persistAccounts, startSession],
  );

  const login = React.useCallback(
    async (identifier: string, password: string): Promise<Result> => {
      if (!crypto?.subtle) {
        return { ok: false, error: "Trình duyệt không hỗ trợ mã hoá, không đăng nhập được." };
      }
      const id = identifier.trim().toLowerCase();
      const account = accounts.find((a) => a.username === id || a.email === id);
      if (!account) {
        return { ok: false, error: "Không tìm thấy tài khoản trên trình duyệt này." };
      }
      if ((await digest(account.salt, password)) !== account.hash) {
        return { ok: false, error: "Mật khẩu không đúng." };
      }
      startSession(account);
      return { ok: true };
    },
    [accounts, startSession],
  );

  const logout = React.useCallback(() => {
    setSession(null);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* bỏ qua */
    }
  }, []);

  const value = React.useMemo(
    () => ({ session, ready, accountCount: accounts.length, register, login, logout, storageError }),
    [session, ready, accounts.length, register, login, logout, storageError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useCustomerAuth phải nằm trong <CustomerAuthProvider>");
  return ctx;
}
