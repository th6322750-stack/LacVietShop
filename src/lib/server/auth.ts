/**
 * Nghiệp vụ tài khoản khách hàng — chạy phía máy chủ.
 *
 * Mật khẩu băm bcrypt (thuật toán chậm có muối sẵn), phiên đăng nhập là chuỗi
 * ngẫu nhiên lưu trong cookie httpOnly nên JavaScript ở trình duyệt không đọc
 * được. Mã đặt lại mật khẩu cũng băm trước khi lưu.
 *
 * Kho dữ liệu do src/lib/server/db.ts lo: Postgres khi có DATABASE_URL, tệp JSON
 * khi chạy ở máy nhà.
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import {
  addBalance,
  bumpResetAttempts,
  deleteResetCode,
  deleteSession,
  deleteSessionsOfAccount,
  findAccount,
  findAccountByLogin,
  findSession,
  getResetCode,
  insertAccount,
  insertSession,
  putResetCode,
  setAccountPassword,
  type Account,
} from "./db";

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
  balance: number;
  /** Ngày mở tài khoản — trang Tài khoản hiện "Tham gia", không được bịa. */
  createdAt: string;
}

const toPublic = (a: Account): PublicAccount => ({
  id: a.id,
  name: a.name,
  username: a.username,
  email: a.email,
  phone: a.phone,
  balance: a.balance,
  createdAt: a.createdAt,
});

type Fail = { ok: false; error: string; field?: string };

export function newToken() {
  return crypto.randomBytes(32).toString("hex");
}

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
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();

  if (await findAccount({ username })) {
    return { ok: false, error: "Tên đăng nhập này đã có người dùng.", field: "username" };
  }
  if (await findAccount({ email })) {
    return { ok: false, error: "Email này đã được đăng ký.", field: "email" };
  }

  const account: Account = {
    id: `kh-${crypto.randomBytes(8).toString("hex")}`,
    name: input.name.trim(),
    username,
    email,
    phone: input.phone.trim(),
    passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  await insertAccount(account);

  const token = newToken();
  await insertSession({
    token,
    accountId: account.id,
    kind: "customer",
    expiresAt: Date.now() + SESSION_DAYS * 86_400_000,
  });

  return { ok: true, account: toPublic(account), token };
}

export async function loginAccount(
  identifier: string,
  password: string,
): Promise<{ ok: true; account: PublicAccount; token: string } | Fail> {
  const account = await findAccountByLogin(identifier);

  // So sánh với một băm giả khi không tìm thấy tài khoản, để thời gian phản hồi
  // giống nhau — không cho dò xem email nào đã đăng ký qua tốc độ trả lời.
  const hash = account?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const matched = await bcrypt.compare(password, hash);

  if (!account || !matched) {
    return { ok: false, error: "Tên đăng nhập hoặc mật khẩu không đúng." };
  }

  const token = newToken();
  await insertSession({
    token,
    accountId: account.id,
    kind: "customer",
    expiresAt: Date.now() + SESSION_DAYS * 86_400_000,
  });

  return { ok: true, account: toPublic(account), token };
}

/**
 * Đổi mật khẩu khi đang đăng nhập.
 *
 * Bắt nhập lại mật khẩu hiện tại: máy ai đó quên đăng xuất thì người lạ cũng
 * không chiếm được tài khoản. Đổi xong huỷ mọi phiên rồi dựng lại đúng phiên
 * đang thao tác — mật khẩu đã lộ thì kẻ kia phải bị đá ra.
 */
export async function changePassword(
  accountId: string,
  current: string,
  next: string,
  keepToken: string,
): Promise<{ ok: true } | Fail> {
  const account = await findAccount({ id: accountId });
  if (!account) return { ok: false, error: "Không tìm thấy tài khoản." };

  const matched = await bcrypt.compare(current, account.passwordHash);
  if (!matched) return { ok: false, error: "Mật khẩu hiện tại không đúng.", field: "current" };

  if (await bcrypt.compare(next, account.passwordHash)) {
    return { ok: false, error: "Mật khẩu mới trùng mật khẩu cũ.", field: "next" };
  }

  await setAccountPassword(accountId, await bcrypt.hash(next, BCRYPT_ROUNDS));
  await deleteSessionsOfAccount(accountId);
  await insertSession({
    token: keepToken,
    accountId,
    kind: "customer",
    expiresAt: Date.now() + SESSION_DAYS * 86_400_000,
  });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Phiên
// ---------------------------------------------------------------------------
export async function accountForToken(token: string | undefined): Promise<PublicAccount | null> {
  if (!token) return null;
  const session = await findSession(token, "customer");
  if (!session) return null;
  const account = await findAccount({ id: session.accountId });
  return account ? toPublic(account) : null;
}

export async function destroySession(token: string | undefined) {
  if (token) await deleteSession(token);
}

export const sessionMaxAge = SESSION_DAYS * 86_400;

// ---------------------------------------------------------------------------
// Quên mật khẩu
// ---------------------------------------------------------------------------
/**
 * Sinh mã đặt lại. Trả về mã gốc để gửi đi; chỉ bản băm được lưu.
 * `null` nghĩa là không có tài khoản khớp hoặc đang trong thời gian chờ gửi lại —
 * nơi gọi phải trả cùng một thông điệp cho mọi trường hợp, không tiết lộ email
 * nào đã đăng ký.
 */
export async function createResetCode(email: string) {
  const key = email.trim().toLowerCase();
  const account = await findAccount({ email: key });
  if (!account) return null;

  const existing = await getResetCode(key);
  if (existing && Date.now() - existing.sentAt < CODE_RESEND_MS) return null;

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  await putResetCode({
    email: key,
    codeHash: await bcrypt.hash(code, BCRYPT_ROUNDS),
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
    sentAt: Date.now(),
  });
  return { code, account };
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ ok: true } | Fail> {
  const key = email.trim().toLowerCase();
  const entry = await getResetCode(key);

  if (!entry || entry.expiresAt <= Date.now()) {
    return { ok: false, error: "Mã đã hết hạn hoặc không tồn tại. Hãy yêu cầu mã mới." };
  }
  if (entry.attempts >= CODE_MAX_ATTEMPTS) {
    return { ok: false, error: "Nhập sai quá nhiều lần. Hãy yêu cầu mã mới." };
  }
  if (!(await bcrypt.compare(code.trim(), entry.codeHash))) {
    await bumpResetAttempts(key);
    const left = CODE_MAX_ATTEMPTS - (entry.attempts + 1);
    return { ok: false, error: `Mã không đúng. Còn ${left} lần thử.`, field: "code" };
  }

  const account = await findAccount({ email: key });
  if (!account) return { ok: false, error: "Không tìm thấy tài khoản." };

  await setAccountPassword(account.id, await bcrypt.hash(newPassword, BCRYPT_ROUNDS));
  await deleteResetCode(key);
  // Đổi mật khẩu thì đăng xuất mọi thiết bị đang đăng nhập tài khoản đó.
  await deleteSessionsOfAccount(account.id);

  return { ok: true };
}

export { addBalance };
