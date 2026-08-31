/**
 * Nghiệp vụ tài khoản khách hàng — chạy phía máy chủ.
 *
 * Mật khẩu băm bằng bcrypt (thuật toán chậm có muối sẵn), phiên đăng nhập là
 * chuỗi ngẫu nhiên lưu trong cookie httpOnly nên JavaScript ở trình duyệt không
 * đọc được. Mã đặt lại mật khẩu cũng băm trước khi lưu.
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { readDb, writeDb, type Account } from "./store";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/auth.ts chỉ được dùng phía server.");
}

export const SESSION_COOKIE = "lv_session";
const SESSION_DAYS = 30;
const BCRYPT_ROUNDS = 10;

/** Mã đặt lại: 6 số, sống 15 phút, sai 5 lần là huỷ, gửi lại cách nhau 60 giây. */
const CODE_TTL_MS = 15 * 60_000;
const CODE_MAX_ATTEMPTS = 5;
const CODE_RESEND_MS = 60_000;

export interface PublicAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
}

const toPublic = (a: Account): PublicAccount => ({
  id: a.id,
  name: a.name,
  username: a.username,
  email: a.email,
  phone: a.phone,
});

type Fail = { ok: false; error: string; field?: string };

// ---------------------------------------------------------------------------
// Đăng ký / đăng nhập
// ---------------------------------------------------------------------------
export async function registerAccount(input: {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ ok: true; account: PublicAccount; token: string } | Fail> {
  const db = readDb();
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();

  if (db.accounts.some((a) => a.username === username)) {
    return { ok: false, error: "Tên đăng nhập này đã có người dùng.", field: "username" };
  }
  if (db.accounts.some((a) => a.email === email)) {
    return { ok: false, error: "Email này đã được đăng ký.", field: "email" };
  }

  const account: Account = {
    id: `kh-${crypto.randomBytes(8).toString("hex")}`,
    name: input.name.trim(),
    username,
    email,
    phone: input.phone.trim(),
    passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    createdAt: new Date().toISOString(),
  };

  const token = newSessionToken();
  db.accounts.push(account);
  db.sessions.push({ token, accountId: account.id, expiresAt: Date.now() + SESSION_DAYS * 86_400_000 });
  writeDb(db);

  return { ok: true, account: toPublic(account), token };
}

export async function loginAccount(
  identifier: string,
  password: string,
): Promise<{ ok: true; account: PublicAccount; token: string } | Fail> {
  const db = readDb();
  const id = identifier.trim().toLowerCase();
  const account = db.accounts.find((a) => a.username === id || a.email === id);

  // So sánh với một băm giả khi không tìm thấy tài khoản, để thời gian phản hồi
  // giống nhau — không cho dò xem email nào đã đăng ký qua tốc độ trả lời.
  const hash = account?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const matched = await bcrypt.compare(password, hash);

  if (!account || !matched) {
    return { ok: false, error: "Tên đăng nhập hoặc mật khẩu không đúng." };
  }

  const token = newSessionToken();
  db.sessions.push({ token, accountId: account.id, expiresAt: Date.now() + SESSION_DAYS * 86_400_000 });
  writeDb(db);

  return { ok: true, account: toPublic(account), token };
}

// ---------------------------------------------------------------------------
// Phiên
// ---------------------------------------------------------------------------
function newSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function accountForToken(token: string | undefined): PublicAccount | null {
  if (!token) return null;
  const db = readDb();
  const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  if (!session) return null;
  const account = db.accounts.find((a) => a.id === session.accountId);
  return account ? toPublic(account) : null;
}

export function destroySession(token: string | undefined) {
  if (!token) return;
  const db = readDb();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  writeDb(db);
}

export const sessionMaxAge = SESSION_DAYS * 86_400;

// ---------------------------------------------------------------------------
// Quên mật khẩu
// ---------------------------------------------------------------------------
/**
 * Sinh mã đặt lại. Trả về mã gốc để gửi đi; chỉ bản băm được lưu.
 * `null` nghĩa là không có tài khoản nào khớp hoặc đang trong thời gian chờ gửi lại —
 * nơi gọi phải trả về cùng một thông điệp cho mọi trường hợp, không tiết lộ email
 * nào đã đăng ký.
 */
export async function createResetCode(email: string): Promise<{ code: string; account: Account } | null> {
  const db = readDb();
  const key = email.trim().toLowerCase();
  const account = db.accounts.find((a) => a.email === key);
  if (!account) return null;

  const existing = db.resetCodes.find((c) => c.email === key);
  if (existing && Date.now() - existing.sentAt < CODE_RESEND_MS) return null;

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const entry = {
    email: key,
    codeHash: await bcrypt.hash(code, BCRYPT_ROUNDS),
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
    sentAt: Date.now(),
  };

  db.resetCodes = [...db.resetCodes.filter((c) => c.email !== key), entry];
  writeDb(db);
  return { code, account };
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ ok: true } | Fail> {
  const db = readDb();
  const key = email.trim().toLowerCase();
  const entry = db.resetCodes.find((c) => c.email === key);

  if (!entry || entry.expiresAt <= Date.now()) {
    return { ok: false, error: "Mã đã hết hạn hoặc không tồn tại. Hãy yêu cầu mã mới." };
  }
  if (entry.attempts >= CODE_MAX_ATTEMPTS) {
    return { ok: false, error: "Nhập sai quá nhiều lần. Hãy yêu cầu mã mới." };
  }
  if (!(await bcrypt.compare(code.trim(), entry.codeHash))) {
    entry.attempts += 1;
    writeDb(db);
    const left = CODE_MAX_ATTEMPTS - entry.attempts;
    return { ok: false, error: `Mã không đúng. Còn ${left} lần thử.`, field: "code" };
  }

  const account = db.accounts.find((a) => a.email === key);
  if (!account) return { ok: false, error: "Không tìm thấy tài khoản." };

  account.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  db.resetCodes = db.resetCodes.filter((c) => c.email !== key);
  // Đổi mật khẩu thì đăng xuất mọi thiết bị đang đăng nhập tài khoản đó.
  db.sessions = db.sessions.filter((s) => s.accountId !== account.id);
  writeDb(db);

  return { ok: true };
}
