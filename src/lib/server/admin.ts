/**
 * Phiên quản trị phía máy chủ.
 *
 * Lý do phải có: bảng giá bán là dữ liệu chung, ai sửa được là đổi giá của cả
 * hệ thống. Phần phân quyền chi tiết trong giao diện vẫn nằm ở trình duyệt (tiện
 * cho việc ẩn/hiện nút), nhưng MỌI đường ghi đều phải qua chốt chặn ở đây.
 *
 * Mật khẩu quản trị đọc từ ADMIN_ACCOUNTS trong biến môi trường, dạng
 *   ADMIN_ACCOUNTS=admin:matkhau1,hotro:matkhau2
 * Chưa đặt thì dùng tài khoản trình diễn — chỉ hợp giai đoạn kiểm thử.
 */
import crypto from "node:crypto";
import { deleteSession, findSession, insertSession } from "./db";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/admin.ts chỉ được dùng phía server.");
}

export const ADMIN_COOKIE = "lv_admin";
const ADMIN_DAYS = 7;

/** Tài khoản trình diễn dùng khi chưa cấu hình ADMIN_ACCOUNTS. */
const DEMO_ADMINS: Record<string, string> = {
  admin: "admin123",
  hotro: "hotro123",
  ketoan: "ketoan123",
};

function adminAccounts(): Record<string, string> {
  const raw = process.env.ADMIN_ACCOUNTS?.trim();
  if (!raw) return DEMO_ADMINS;
  const out: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [u, p] = pair.split(":");
    if (u && p) out[u.trim().toLowerCase()] = p;
  }
  return Object.keys(out).length ? out : DEMO_ADMINS;
}

/** So sánh theo thời gian cố định, không để lộ độ dài khớp. */
function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

export async function loginAdmin(username: string, password: string) {
  const accounts = adminAccounts();
  const key = username.trim().toLowerCase();
  const expected = accounts[key];
  if (!expected || !sameSecret(password, expected)) return null;

  const token = crypto.randomBytes(32).toString("hex");
  await insertSession({ token, accountId: key, kind: "admin", expiresAt: Date.now() + ADMIN_DAYS * 86_400_000 });
  return { token, username: key };
}

/** Tên quản trị viên của phiên, hoặc null nếu không hợp lệ. */
export async function adminForToken(token: string | undefined) {
  if (!token) return null;
  const s = await findSession(token, "admin");
  return s ? s.accountId : null;
}

export async function logoutAdmin(token: string | undefined) {
  if (token) await deleteSession(token);
}

export const adminMaxAge = ADMIN_DAYS * 86_400;
