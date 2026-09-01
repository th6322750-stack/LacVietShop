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
import { adminAccounts as adminRoleProfiles } from "@/lib/admin/data";
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

/** Tên đăng nhập theo đúng thứ tự khai trong ADMIN_ACCOUNTS. */
function adminOrder(): string[] {
  const raw = process.env.ADMIN_ACCOUNTS?.trim();
  const src = raw ? raw.split(",") : Object.keys(DEMO_ADMINS).map((u) => `${u}:x`);
  return src.map((pair) => pair.split(":")[0]?.trim().toLowerCase()).filter(Boolean) as string[];
}

/**
 * Bộ quyền của một tài khoản quản trị.
 *
 * Trước đây trình duyệt tự tra tên đăng nhập trong một danh sách cắm cứng. Đổi
 * tên tài khoản trong ADMIN_ACCOUNTS là đăng nhập đúng mật khẩu vẫn bị chặn ở
 * bước tra quyền — một cái bẫy chỉ nổ trên bản chạy thật. Nay máy chủ tự trả về
 * bộ quyền: khớp tên thì lấy đúng vai trò, còn tài khoản ĐẦU TIÊN trong cấu hình
 * luôn là chủ hệ thống dù đặt tên gì. Tên lạ không nằm trong hai diện đó thì
 * không được quyền nào — thà không vào được còn hơn vào với quyền không rõ.
 */
export function adminProfile(username: string) {
  const key = username.trim().toLowerCase();
  const known = ROLE_PROFILES.find((a) => a.username === key);
  if (known) return { ...known, username: key };

  const first = adminOrder()[0];
  if (first && key === first) {
    const owner = ROLE_PROFILES[0];
    return { ...owner, username: key, name: owner?.name ?? "Quản trị viên" };
  }
  return { username: key, id: 0, name: key, role: "Không rõ vai trò", email: "", permissions: [] };
}

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

/** Danh sách vai trò; nhập trễ để tệp dữ liệu không kéo theo lúc khởi động. */
const ROLE_PROFILES: {
  id: number;
  username: string;
  name: string;
  role: string;
  email: string;
  permissions: readonly string[];
}[] = adminRoleProfiles;

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
