/**
 * Kho dữ liệu tài khoản phía máy chủ.
 *
 * Giai đoạn kiểm thử: một tệp JSON trong data/. Đủ dùng cho vài chục tài khoản,
 * không cần cài thêm gì. Khi cần chạy thật thì thay thân các hàm đọc/ghi bằng
 * truy vấn cơ sở dữ liệu — phần còn lại của ứng dụng không phải sửa.
 *
 * Tệp này chứa băm mật khẩu và thông tin người dùng nên data/ đã được gitignore.
 */
import fs from "node:fs";
import path from "node:path";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/store.ts chỉ được dùng phía server.");
}

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "lacviet-auth.json");

export interface Account {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  /** bcrypt — không bao giờ lưu mật khẩu gốc. */
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  token: string;
  accountId: string;
  expiresAt: number;
}

export interface ResetCode {
  email: string;
  /** bcrypt của mã 6 số — tệp có rò ra cũng không đọc được mã. */
  codeHash: string;
  expiresAt: number;
  /** Số lần nhập sai, quá ngưỡng thì huỷ mã. */
  attempts: number;
  sentAt: number;
}

interface Db {
  accounts: Account[];
  sessions: Session[];
  resetCodes: ResetCode[];
}

const empty = (): Db => ({ accounts: [], sessions: [], resetCodes: [] });

export function readDb(): Db {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    return { ...empty(), ...(JSON.parse(raw) as Partial<Db>) };
  } catch {
    return empty();
  }
}

export function writeDb(db: Db) {
  const now = Date.now();
  // Dọn phiên và mã đã hết hạn mỗi lần ghi, khỏi phình tệp.
  const next: Db = {
    accounts: db.accounts,
    sessions: db.sessions.filter((s) => s.expiresAt > now),
    resetCodes: db.resetCodes.filter((c) => c.expiresAt > now),
  };
  fs.mkdirSync(DIR, { recursive: true });
  // Ghi ra tệp tạm rồi đổi tên: mất điện giữa chừng không làm hỏng tệp gốc.
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2), "utf8");
  fs.renameSync(tmp, FILE);
}
