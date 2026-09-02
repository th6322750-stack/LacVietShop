/**
 * Chặn dò mật khẩu.
 *
 * Đếm số lần đăng nhập THẤT BẠI theo khoá (IP + tên tài khoản). Quá ngưỡng trong
 * cửa sổ thời gian thì khoá tạm; đăng nhập đúng thì xoá bộ đếm nên người dùng gõ
 * đúng không bao giờ bị chặn.
 *
 * Bộ đếm lưu trong DB (qua db.ts) nên hiệu lực cả trên Vercel — nhiều máy chủ
 * serverless dùng chung một bộ đếm, khác với đếm trong bộ nhớ từng tiến trình.
 */
import { loginBlockedUntil, recordLoginFail, clearLoginAttempts } from "./db";

const WINDOW_MS = 15 * 60_000; // cửa sổ đếm 15 phút
const MAX_FAILS = 8; // quá 8 lần sai liên tiếp
const BLOCK_MS = 15 * 60_000; // thì khoá 15 phút

/** Lấy IP client sau proxy của Vercel. */
export function ipFromRequest(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  return xf?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Số giây còn bị khoá, 0 nếu chưa bị khoá. */
export async function loginBlocked(key: string): Promise<number> {
  const until = await loginBlockedUntil(key);
  const now = Date.now();
  return until > now ? Math.ceil((until - now) / 1000) : 0;
}

/** Ghi nhận một lần sai; đủ ngưỡng thì bật khoá. */
export async function noteLoginFail(key: string): Promise<void> {
  await recordLoginFail(key, WINDOW_MS, MAX_FAILS, BLOCK_MS);
}

/** Đăng nhập đúng: xoá bộ đếm cho khoá này. */
export async function clearLoginFails(key: string): Promise<void> {
  await clearLoginAttempts(key);
}
