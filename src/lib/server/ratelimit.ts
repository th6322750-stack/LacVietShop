/**
 * Chặn dò mật khẩu.
 *
 * Đếm số lần đăng nhập THẤT BẠI theo khoá (IP + tên tài khoản). Quá ngưỡng trong
 * cửa sổ thời gian thì khoá tạm; đăng nhập đúng thì xoá bộ đếm nên người dùng gõ
 * đúng không bao giờ bị chặn.
 *
 * Lưu trong bộ nhớ tiến trình. Trên Vercel mỗi máy chủ một bộ đếm nên không
 * tuyệt đối, nhưng chặn được đợt dò dồn dập cùng một máy; ở local thì hiệu quả
 * hoàn toàn. Muốn chặt hơn cần đếm trong DB (việc về sau).
 */

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/ratelimit.ts chỉ được dùng phía server.");
}

type Bucket = { fails: number; resetAt: number; blockedUntil: number };
const store = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60_000; // cửa sổ đếm 15 phút
const MAX_FAILS = 8; // quá 8 lần sai liên tiếp
const BLOCK_MS = 15 * 60_000; // thì khoá 15 phút

/** Dọn các bộ đếm đã hết hạn khi Map phình to, để không rò rỉ bộ nhớ. */
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [k, b] of store) {
    if (b.resetAt <= now && b.blockedUntil <= now) store.delete(k);
  }
}

/** Lấy IP client sau proxy của Vercel. */
export function ipFromRequest(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  return xf?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Số giây còn bị khoá, 0 nếu chưa bị khoá. */
export function loginBlocked(key: string): number {
  const now = Date.now();
  const b = store.get(key);
  if (b && b.blockedUntil > now) return Math.ceil((b.blockedUntil - now) / 1000);
  return 0;
}

/** Ghi nhận một lần sai; đủ ngưỡng thì bật khoá. */
export function noteLoginFail(key: string): void {
  const now = Date.now();
  sweep(now);
  let b = store.get(key);
  if (!b || b.resetAt <= now) {
    b = { fails: 0, resetAt: now + WINDOW_MS, blockedUntil: 0 };
    store.set(key, b);
  }
  b.fails += 1;
  if (b.fails >= MAX_FAILS) {
    b.blockedUntil = now + BLOCK_MS;
    b.fails = 0;
    b.resetAt = now + BLOCK_MS;
  }
}

/** Đăng nhập đúng: xoá bộ đếm cho khoá này. */
export function clearLoginFails(key: string): void {
  store.delete(key);
}
