/**
 * Lớp dữ liệu chung.
 *
 * Có DATABASE_URL  → dùng Postgres (Neon). Đây là chế độ chạy trên Vercel, vì
 *                    Vercel không cho ghi tệp và mỗi lần deploy là mất sạch.
 * Không có          → dùng tệp JSON trong data/ như khi chạy ở máy nhà.
 *
 * Hai chế độ cùng một bộ hàm nên phần còn lại của ứng dụng không cần biết đang
 * chạy ở đâu. Bảng được tạo tự động ở lần gọi đầu tiên.
 */
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/db.ts chỉ được dùng phía server.");
}

export const usingPostgres = Boolean(process.env.DATABASE_URL);

// ---------------------------------------------------------------------------
// Kiểu dữ liệu
// ---------------------------------------------------------------------------
export interface Account {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  /** Số dư, đơn vị đồng. */
  balance: number;
  createdAt: string;
}

export interface Session {
  token: string;
  accountId: string;
  /** "customer" cho khách, "admin" cho quản trị. */
  kind: "customer" | "admin";
  expiresAt: number;
}

export interface ResetCode {
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  sentAt: number;
}

export type PriceRule = { type: "percent"; value: number } | { type: "fixed"; value: number };

export interface PricingRules {
  globalMarkup: number;
  overrides: Record<string, PriceRule>;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Đơn mua tài khoản premium.
 *
 * Khác với dịch vụ tương tác (đẩy thẳng sang API nhà cung cấp), hàng premium là
 * của mình: khách trả tiền xong đơn nằm ở trạng thái "pending", quản trị viên
 * điền thông tin tài khoản rồi chuyển sang "delivered".
 */
export interface ProductOrder {
  id: string;
  accountId: string;
  productSlug: string;
  productName: string;
  packageId: string;
  packageName: string;
  amount: number;
  status: "pending" | "delivered" | "canceled";
  createdAt: string;
  deliveredAt?: string | null;
  /** Thông tin giao cho khách, ví dụ email/mật khẩu. Rỗng khi chưa giao. */
  credentials: { label: string; value: string }[];
  /** Ghi chú của quản trị viên gửi kèm, ví dụ hạn bảo hành. */
  note?: string | null;
  /** Yêu cầu riêng khách nhập lúc đặt, ví dụ email cần nâng cấp. */
  customerNote?: string | null;
}

/** Giá, tồn kho và định dạng hàng do quản trị đặt, ghi đè lên catalog tĩnh. */
export interface ProductSetting {
  /** Khoá dạng "<slug>/<packageId>". */
  key: string;
  price: number | null;
  /** Giới hạn bán thủ công; null = không giới hạn. Chỉ dùng khi kho trống. */
  stock: number | null;
  active: boolean;
  /**
   * Định dạng một món hàng, ví dụ ["Email", "Mật khẩu", "Hồ sơ"].
   * Dùng để tách mỗi dòng khi nạp kho hàng loạt.
   */
  format: string[];
  /** Đánh dấu gói phổ biến — trang khách sẽ làm nổi gói này lên. */
  highlight: boolean;
  /** Nhãn nhỏ hiện trên thẻ gói, ví dụ "Bán chạy". Null là không hiện. */
  badge: string | null;
  /** Tên gói hiển thị. Null là dùng tên trong catalog. */
  name: string | null;
  /** Thời hạn hiển thị, ví dụ "6 tháng". Null là dùng catalog. */
  duration: string | null;
  /** Các dòng mô tả trong thẻ gói. Rỗng là dùng catalog. */
  bullets: string[];
}

/** Chữ nghĩa trên trang sản phẩm, quản trị sửa trực tiếp ngoài trang. */
export interface ProductContent {
  slug: string;
  name: string | null;
  tagline: string | null;
  description: string | null;
  badges: string[];
  updatedAt: string;
}

/**
 * Một món hàng có sẵn trong kho.
 *
 * Quản trị nạp trước hàng loạt; khách mua là hệ thống lấy một món ra giao ngay,
 * không phải chờ người. Hết kho thì đơn nằm chờ giao tay.
 */
export interface StockItem {
  id: string;
  key: string;
  fields: { label: string; value: string }[];
  status: "available" | "used";
  createdAt: string;
  usedAt?: string | null;
  orderId?: string | null;
}

/**
 * Popup thông báo cho khách, do quản trị đặt.
 *
 * Phải nằm ở máy chủ chứ không phải localStorage của máy quản trị: thông báo là
 * để KHÁCH thấy, mà khách dùng máy khác.
 */
export interface Announcement {
  enabled: boolean;
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "danger";
  /** Ảnh minh hoạ tuỳ chọn, data URL đã thu nhỏ. */
  imageSrc?: string;
  ctaLabel?: string;
  ctaHref?: string;
  frequency: "once" | "daily" | "always";
  /** Tăng số này là mọi khách thấy lại, kể cả người đã tắt. */
  version: number;
  snoozeHours: number;
  startAt?: string | null;
  endAt?: string | null;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Đơn dịch vụ tương tác (SMM).
 *
 * Khác hàng premium (hàng của mình, lấy từ kho), đơn này đẩy sang nhà cung cấp.
 * Lưu cả GIÁ VỐN lẫn GIÁ BÁN tại thời điểm đặt: nhà cung cấp đổi giá sau đó thì
 * lãi của đơn cũ vẫn tra ra được đúng.
 */
export interface ServiceOrder {
  id: string;
  accountId: string;
  platformName: string;
  serviceName: string;
  serverName: string;
  /** Mã dịch vụ bên nhà cung cấp — thiếu là không đẩy đơn được. */
  apiServiceId: string;
  link: string;
  quantity: number;
  /** Đồng/tương tác, chốt lúc đặt. */
  unitPrice: number;
  unitCost: number;
  /** Tiền khách trả và tiền mình trả nhà cung cấp, đều là tổng. */
  amount: number;
  cost: number;
  status: "pending" | "processing" | "running" | "completed" | "partial" | "canceled" | "refunded";
  /** Mã đơn bên nhà cung cấp; null khi chưa đẩy được. */
  providerOrderId: string | null;
  /** Số liệu tiến độ do nhà cung cấp trả về. */
  startCount: number;
  remains: number;
  createdAt: string;
  updatedAt: string;
  /** Số tiền đã hoàn lại cho khách, nếu có. */
  refunded: number;
  note?: string | null;
}

/**
 * Công tắc vận hành do quản trị bật/tắt.
 *
 * Phải nằm ở cơ sở dữ liệu chứ không phải biến môi trường: đổi biến môi trường
 * là phải sửa tệp rồi khởi động lại máy chủ, quản trị không tự làm được, mà lúc
 * ví nhà cung cấp hết tiền thì cần tắt ngay trong một cái bấm.
 */
export interface OpsSettings {
  /** Bật: đơn dịch vụ tự đẩy sang nhà cung cấp. Tắt: đơn về hàng đợi chạy tay. */
  autoPushOrders: boolean;
  /**
   * Kênh liên hệ hiện ở thanh bên cho khách.
   *
   * Để trống thì KHÔNG hiện — thà không có nút còn hơn có nút bấm vào chẳng đi
   * đâu. Giờ hỗ trợ cũng để trống được nếu không muốn cam kết khung giờ.
   */
  contact?: {
    hours?: string;
    zalo?: string;
    facebook?: string;
    telegram?: string;
  };
  updatedAt: string;
  updatedBy?: string;
}

export interface Deposit {
  id: string;
  accountId: string | null;
  /** Nội dung chuyển khoản, dùng để khớp giao dịch về. */
  code: string;
  amount: number;
  status: "pending" | "success" | "canceled";
  method: string;
  createdAt: string;
  paidAt?: string | null;
  /** Mã giao dịch bên SePay — khoá duy nhất để không cộng tiền hai lần. */
  sepayId?: string | null;
  note?: string | null;
}

// ---------------------------------------------------------------------------
// Chế độ tệp (chạy ở máy nhà)
// ---------------------------------------------------------------------------
const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "lacviet-db.json");

interface FileDb {
  accounts: Account[];
  sessions: Session[];
  resetCodes: ResetCode[];
  pricing: PricingRules | null;
  deposits: Deposit[];
  productOrders: ProductOrder[];
  productSettings: ProductSetting[];
  stockItems: StockItem[];
  productContent: ProductContent[];
  serviceOrders: ServiceOrder[];
  announcement: Announcement | null;
  ops: OpsSettings | null;
}

const emptyFile = (): FileDb => ({
  announcement: null,
  ops: null,
  serviceOrders: [],
  accounts: [],
  sessions: [],
  resetCodes: [],
  pricing: null,
  deposits: [],
  productOrders: [],
  productSettings: [],
  stockItems: [],
  productContent: [],
});

function readFile(): FileDb {
  try {
    return { ...emptyFile(), ...(JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<FileDb>) };
  } catch {
    return emptyFile();
  }
}

function writeFile(db: FileDb) {
  const now = Date.now();
  const next: FileDb = {
    ...db,
    sessions: db.sessions.filter((s) => s.expiresAt > now),
    resetCodes: db.resetCodes.filter((c) => c.expiresAt > now),
  };
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2), "utf8");
  fs.renameSync(tmp, FILE);
}

// ---------------------------------------------------------------------------
// Chế độ Postgres (Vercel)
// ---------------------------------------------------------------------------
const sql = usingPostgres ? neon(process.env.DATABASE_URL!) : null;

let schemaReady: Promise<void> | null = null;

function ensureSchema() {
  if (!sql) return Promise.resolve();
  schemaReady ??= (async () => {
    await sql`create table if not exists accounts (
      id text primary key,
      name text not null,
      username text unique not null,
      email text unique not null,
      phone text not null,
      password_hash text not null,
      balance bigint not null default 0,
      created_at timestamptz not null default now()
    )`;
    await sql`create table if not exists sessions (
      token text primary key,
      account_id text not null,
      kind text not null default 'customer',
      expires_at timestamptz not null
    )`;
    await sql`create table if not exists reset_codes (
      email text primary key,
      code_hash text not null,
      expires_at timestamptz not null,
      attempts int not null default 0,
      sent_at timestamptz not null default now()
    )`;
    await sql`create table if not exists pricing (
      id int primary key,
      global_markup numeric not null default 1,
      overrides jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now(),
      updated_by text
    )`;
    await sql`create table if not exists deposits (
      id text primary key,
      account_id text,
      code text unique not null,
      amount bigint not null,
      status text not null default 'pending',
      method text not null,
      created_at timestamptz not null default now(),
      paid_at timestamptz,
      sepay_id text unique,
      note text
    )`;
    await sql`create table if not exists product_orders (
      id text primary key,
      account_id text not null,
      product_slug text not null,
      product_name text not null,
      package_id text not null,
      package_name text not null,
      amount bigint not null,
      status text not null default 'pending',
      created_at timestamptz not null default now(),
      delivered_at timestamptz,
      credentials jsonb not null default '[]'::jsonb,
      note text,
      customer_note text
    )`;
    await sql`create table if not exists product_settings (
      key text primary key,
      price bigint,
      stock int,
      active boolean not null default true,
      format jsonb not null default '[]'::jsonb
    )`;
    // Cột format thêm sau nên bảng cũ có thể chưa có.
    await sql`alter table product_settings add column if not exists format jsonb not null default '[]'::jsonb`;
    await sql`alter table product_settings add column if not exists highlight boolean not null default false`;
    await sql`alter table product_settings add column if not exists badge text`;
    await sql`alter table product_settings add column if not exists name text`;
    await sql`alter table product_settings add column if not exists duration text`;
    await sql`alter table product_settings add column if not exists bullets jsonb not null default '[]'::jsonb`;
    await sql`create table if not exists product_content (
      slug text primary key,
      name text,
      tagline text,
      description text,
      badges jsonb not null default '[]'::jsonb,
      updated_at timestamptz not null default now()
    )`;
    await sql`create table if not exists stock_items (
      id text primary key,
      key text not null,
      fields jsonb not null,
      status text not null default 'available',
      created_at timestamptz not null default now(),
      used_at timestamptz,
      order_id text
    )`;
    await sql`create index if not exists stock_items_key_status on stock_items (key, status)`;
    await sql`create table if not exists service_orders (
      id text primary key,
      account_id text not null,
      platform_name text not null,
      service_name text not null,
      server_name text not null,
      api_service_id text not null,
      link text not null,
      quantity bigint not null,
      unit_price numeric not null,
      unit_cost numeric not null,
      amount bigint not null,
      cost bigint not null,
      status text not null default 'pending',
      provider_order_id text,
      start_count bigint not null default 0,
      remains bigint not null default 0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      refunded bigint not null default 0,
      note text
    )`;
    await sql`create index if not exists service_orders_account on service_orders (account_id, created_at desc)`;
    await sql`create table if not exists ops_settings (
      id int primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )`;
    await sql`create table if not exists announcement (
      id int primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )`;
    // Dọn phiên và mã hết hạn mỗi lần khởi động.
    await sql`delete from sessions where expires_at < now()`;
    await sql`delete from reset_codes where expires_at < now()`;
  })();
  return schemaReady;
}

const ms = (v: unknown) => new Date(v as string).getTime();

const rowToAccount = (r: Record<string, unknown>): Account => ({
  id: String(r.id),
  name: String(r.name),
  username: String(r.username),
  email: String(r.email),
  phone: String(r.phone),
  passwordHash: String(r.password_hash),
  balance: Number(r.balance),
  createdAt: new Date(r.created_at as string).toISOString(),
});

const rowToDeposit = (r: Record<string, unknown>): Deposit => ({
  id: String(r.id),
  accountId: r.account_id ? String(r.account_id) : null,
  code: String(r.code),
  amount: Number(r.amount),
  status: r.status as Deposit["status"],
  method: String(r.method),
  createdAt: new Date(r.created_at as string).toISOString(),
  paidAt: r.paid_at ? new Date(r.paid_at as string).toISOString() : null,
  sepayId: r.sepay_id ? String(r.sepay_id) : null,
  note: r.note ? String(r.note) : null,
});

// ---------------------------------------------------------------------------
// Tài khoản
// ---------------------------------------------------------------------------
export async function findAccount(by: { username?: string; email?: string; id?: string }) {
  if (sql) {
    await ensureSchema();
    const rows = by.id
      ? await sql`select * from accounts where id = ${by.id}`
      : by.username
        ? await sql`select * from accounts where username = ${by.username}`
        : await sql`select * from accounts where email = ${by.email}`;
    return rows[0] ? rowToAccount(rows[0]) : null;
  }
  const db = readFile();
  return (
    db.accounts.find(
      (a) => (by.id && a.id === by.id) || (by.username && a.username === by.username) || (by.email && a.email === by.email),
    ) ?? null
  );
}

/** Toàn bộ tài khoản khách, mới nhất trước. Chỉ trang quản trị dùng. */
export async function listAccounts(limit = 1000): Promise<Account[]> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from accounts order by created_at desc limit ${limit}`;
    return rows.map(rowToAccount);
  }
  return [...readFile().accounts]
    .sort((x, y) => (x.createdAt < y.createdAt ? 1 : x.createdAt > y.createdAt ? -1 : 0))
    .slice(0, limit);
}

/** Tìm theo tên đăng nhập HOẶC email — dùng cho màn đăng nhập. */
export async function findAccountByLogin(identifier: string) {
  const id = identifier.trim().toLowerCase();
  return (await findAccount({ username: id })) ?? (await findAccount({ email: id }));
}

export async function insertAccount(a: Account) {
  if (sql) {
    await ensureSchema();
    await sql`insert into accounts (id, name, username, email, phone, password_hash, balance, created_at)
      values (${a.id}, ${a.name}, ${a.username}, ${a.email}, ${a.phone}, ${a.passwordHash}, ${a.balance}, ${a.createdAt})`;
    return;
  }
  const db = readFile();
  db.accounts.push(a);
  writeFile(db);
}

export async function setAccountPassword(id: string, passwordHash: string) {
  if (sql) {
    await ensureSchema();
    await sql`update accounts set password_hash = ${passwordHash} where id = ${id}`;
    return;
  }
  const db = readFile();
  const a = db.accounts.find((x) => x.id === id);
  if (a) a.passwordHash = passwordHash;
  writeFile(db);
}

/**
 * Đổi tên hiển thị và số điện thoại.
 *
 * Không cho đổi email ở đây: email là thứ nhận mã đặt lại mật khẩu, đổi mà không
 * xác minh thì mất tài khoản như chơi.
 */
export async function updateAccountProfile(id: string, patch: { name: string; phone: string }) {
  if (sql) {
    await ensureSchema();
    await sql`update accounts set name = ${patch.name}, phone = ${patch.phone} where id = ${id}`;
    return;
  }
  const db = readFile();
  const a = db.accounts.find((x) => x.id === id);
  if (a) {
    a.name = patch.name;
    a.phone = patch.phone;
  }
  writeFile(db);
}

/** Cộng (hoặc trừ) số dư, trả về số dư mới. */
export async function addBalance(accountId: string, delta: number) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`update accounts set balance = balance + ${delta} where id = ${accountId} returning balance`;
    return rows[0] ? Number(rows[0].balance) : null;
  }
  const db = readFile();
  const a = db.accounts.find((x) => x.id === accountId);
  if (!a) return null;
  a.balance += delta;
  writeFile(db);
  return a.balance;
}

// ---------------------------------------------------------------------------
// Phiên
// ---------------------------------------------------------------------------
export async function insertSession(s: Session) {
  if (sql) {
    await ensureSchema();
    await sql`insert into sessions (token, account_id, kind, expires_at)
      values (${s.token}, ${s.accountId}, ${s.kind}, ${new Date(s.expiresAt).toISOString()})`;
    return;
  }
  const db = readFile();
  db.sessions.push(s);
  writeFile(db);
}

export async function findSession(token: string, kind: Session["kind"]) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from sessions where token = ${token} and kind = ${kind} and expires_at > now()`;
    const r = rows[0];
    return r ? { token: String(r.token), accountId: String(r.account_id), kind, expiresAt: ms(r.expires_at) } : null;
  }
  const db = readFile();
  return db.sessions.find((s) => s.token === token && s.kind === kind && s.expiresAt > Date.now()) ?? null;
}

export async function deleteSession(token: string) {
  if (sql) {
    await ensureSchema();
    await sql`delete from sessions where token = ${token}`;
    return;
  }
  const db = readFile();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  writeFile(db);
}

/** Đổi mật khẩu thì đăng xuất mọi thiết bị của tài khoản đó. */
export async function deleteSessionsOfAccount(accountId: string) {
  if (sql) {
    await ensureSchema();
    await sql`delete from sessions where account_id = ${accountId} and kind = 'customer'`;
    return;
  }
  const db = readFile();
  db.sessions = db.sessions.filter((s) => !(s.accountId === accountId && s.kind === "customer"));
  writeFile(db);
}

// ---------------------------------------------------------------------------
// Mã đặt lại mật khẩu
// ---------------------------------------------------------------------------
export async function getResetCode(email: string) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from reset_codes where email = ${email}`;
    const r = rows[0];
    return r
      ? {
          email,
          codeHash: String(r.code_hash),
          expiresAt: ms(r.expires_at),
          attempts: Number(r.attempts),
          sentAt: ms(r.sent_at),
        }
      : null;
  }
  return readFile().resetCodes.find((c) => c.email === email) ?? null;
}

export async function putResetCode(c: ResetCode) {
  if (sql) {
    await ensureSchema();
    await sql`insert into reset_codes (email, code_hash, expires_at, attempts, sent_at)
      values (${c.email}, ${c.codeHash}, ${new Date(c.expiresAt).toISOString()}, ${c.attempts}, ${new Date(c.sentAt).toISOString()})
      on conflict (email) do update set code_hash = excluded.code_hash, expires_at = excluded.expires_at,
        attempts = excluded.attempts, sent_at = excluded.sent_at`;
    return;
  }
  const db = readFile();
  db.resetCodes = [...db.resetCodes.filter((x) => x.email !== c.email), c];
  writeFile(db);
}

export async function bumpResetAttempts(email: string) {
  if (sql) {
    await ensureSchema();
    await sql`update reset_codes set attempts = attempts + 1 where email = ${email}`;
    return;
  }
  const db = readFile();
  const c = db.resetCodes.find((x) => x.email === email);
  if (c) c.attempts += 1;
  writeFile(db);
}

export async function deleteResetCode(email: string) {
  if (sql) {
    await ensureSchema();
    await sql`delete from reset_codes where email = ${email}`;
    return;
  }
  const db = readFile();
  db.resetCodes = db.resetCodes.filter((c) => c.email !== email);
  writeFile(db);
}

// ---------------------------------------------------------------------------
// Bảng giá
// ---------------------------------------------------------------------------
export async function getPricing(): Promise<PricingRules | null> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from pricing where id = 1`;
    const r = rows[0];
    return r
      ? {
          globalMarkup: Number(r.global_markup),
          overrides: (r.overrides ?? {}) as Record<string, PriceRule>,
          updatedAt: new Date(r.updated_at as string).toISOString(),
          updatedBy: r.updated_by ? String(r.updated_by) : undefined,
        }
      : null;
  }
  return readFile().pricing;
}

export async function putPricing(rules: PricingRules) {
  if (sql) {
    await ensureSchema();
    await sql`insert into pricing (id, global_markup, overrides, updated_at, updated_by)
      values (1, ${rules.globalMarkup}, ${JSON.stringify(rules.overrides)}::jsonb, ${rules.updatedAt}, ${rules.updatedBy ?? null})
      on conflict (id) do update set global_markup = excluded.global_markup, overrides = excluded.overrides,
        updated_at = excluded.updated_at, updated_by = excluded.updated_by`;
    return;
  }
  const db = readFile();
  db.pricing = rules;
  writeFile(db);
}

// ---------------------------------------------------------------------------
// Lệnh nạp tiền
// ---------------------------------------------------------------------------
export async function insertDeposit(d: Deposit) {
  if (sql) {
    await ensureSchema();
    await sql`insert into deposits (id, account_id, code, amount, status, method, created_at)
      values (${d.id}, ${d.accountId}, ${d.code}, ${d.amount}, ${d.status}, ${d.method}, ${d.createdAt})`;
    return;
  }
  const db = readFile();
  db.deposits.push(d);
  writeFile(db);
}

export async function findPendingDepositByCode(code: string) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from deposits where code = ${code} and status = 'pending'`;
    return rows[0] ? rowToDeposit(rows[0]) : null;
  }
  return readFile().deposits.find((d) => d.code === code && d.status === "pending") ?? null;
}

/**
 * Đánh dấu lệnh nạp đã nhận tiền.
 * `sepayId` là khoá duy nhất: SePay gửi lại cùng một giao dịch cũng chỉ cộng một lần.
 */
export async function markDepositPaid(id: string, sepayId: string, note: string) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`update deposits set status = 'success', paid_at = now(), sepay_id = ${sepayId}, note = ${note}
      where id = ${id} and status = 'pending' returning *`;
    return rows[0] ? rowToDeposit(rows[0]) : null;
  }
  const db = readFile();
  if (db.deposits.some((d) => d.sepayId === sepayId)) return null;
  const d = db.deposits.find((x) => x.id === id && x.status === "pending");
  if (!d) return null;
  d.status = "success";
  d.paidAt = new Date().toISOString();
  d.sepayId = sepayId;
  d.note = note;
  writeFile(db);
  return d;
}

export async function depositBySepayId(sepayId: string) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from deposits where sepay_id = ${sepayId}`;
    return rows[0] ? rowToDeposit(rows[0]) : null;
  }
  return readFile().deposits.find((d) => d.sepayId === sepayId) ?? null;
}

export async function listDeposits(accountId?: string, limit = 50) {
  if (sql) {
    await ensureSchema();
    const rows = accountId
      ? await sql`select * from deposits where account_id = ${accountId} order by created_at desc limit ${limit}`
      : await sql`select * from deposits order by created_at desc limit ${limit}`;
    return rows.map(rowToDeposit);
  }
  return readFile()
    .deposits.filter((d) => !accountId || d.accountId === accountId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Hàng premium: cấu hình giá/tồn kho và đơn mua
// ---------------------------------------------------------------------------
const rowToProductOrder = (r: Record<string, unknown>): ProductOrder => ({
  id: String(r.id),
  accountId: String(r.account_id),
  productSlug: String(r.product_slug),
  productName: String(r.product_name),
  packageId: String(r.package_id),
  packageName: String(r.package_name),
  amount: Number(r.amount),
  status: r.status as ProductOrder["status"],
  createdAt: new Date(r.created_at as string).toISOString(),
  deliveredAt: r.delivered_at ? new Date(r.delivered_at as string).toISOString() : null,
  credentials: (r.credentials ?? []) as { label: string; value: string }[],
  note: r.note ? String(r.note) : null,
  customerNote: r.customer_note ? String(r.customer_note) : null,
});

export async function listProductSettings(): Promise<ProductSetting[]> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from product_settings`;
    return rows.map((r) => ({
      key: String(r.key),
      price: r.price === null ? null : Number(r.price),
      stock: r.stock === null ? null : Number(r.stock),
      active: Boolean(r.active),
      format: (r.format ?? []) as string[],
      highlight: Boolean(r.highlight),
      badge: r.badge ? String(r.badge) : null,
      name: r.name ? String(r.name) : null,
      duration: r.duration ? String(r.duration) : null,
      bullets: (r.bullets ?? []) as string[],
    }));
  }
  return readFile().productSettings;
}

export async function putProductSetting(s: ProductSetting) {
  if (sql) {
    await ensureSchema();
    await sql`insert into product_settings (key, price, stock, active, format, highlight, badge, name, duration, bullets)
      values (${s.key}, ${s.price}, ${s.stock}, ${s.active}, ${JSON.stringify(s.format ?? [])}::jsonb,
        ${s.highlight}, ${s.badge}, ${s.name}, ${s.duration}, ${JSON.stringify(s.bullets ?? [])}::jsonb)
      on conflict (key) do update set price = excluded.price, stock = excluded.stock,
        active = excluded.active, format = excluded.format,
        highlight = excluded.highlight, badge = excluded.badge,
        name = excluded.name, duration = excluded.duration, bullets = excluded.bullets`;
    return;
  }
  const db = readFile();
  db.productSettings = [...db.productSettings.filter((x) => x.key !== s.key), s];
  writeFile(db);
}

/** Trừ tồn kho đúng một đơn vị, chỉ khi còn hàng. `false` = hết hàng. */
export async function decrementStock(key: string) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`update product_settings set stock = stock - 1
      where key = ${key} and stock is not null and stock > 0 returning stock`;
    if (rows.length) return true;
    // Chưa có dòng cấu hình nghĩa là chưa đặt giới hạn tồn kho.
    const exists = await sql`select 1 from product_settings where key = ${key} and stock is not null`;
    return exists.length === 0;
  }
  const db = readFile();
  const s = db.productSettings.find((x) => x.key === key);
  if (!s || s.stock === null) return true;
  if (s.stock <= 0) return false;
  s.stock -= 1;
  writeFile(db);
  return true;
}

export async function insertProductOrder(o: ProductOrder) {
  if (sql) {
    await ensureSchema();
    await sql`insert into product_orders
      (id, account_id, product_slug, product_name, package_id, package_name, amount, status, created_at, credentials, customer_note)
      values (${o.id}, ${o.accountId}, ${o.productSlug}, ${o.productName}, ${o.packageId}, ${o.packageName},
        ${o.amount}, ${o.status}, ${o.createdAt}, ${JSON.stringify(o.credentials)}::jsonb, ${o.customerNote ?? null})`;
    return;
  }
  const db = readFile();
  db.productOrders.push(o);
  writeFile(db);
}

export async function listProductOrders(accountId?: string, limit = 100): Promise<ProductOrder[]> {
  if (sql) {
    await ensureSchema();
    const rows = accountId
      ? await sql`select * from product_orders where account_id = ${accountId} order by created_at desc limit ${limit}`
      : await sql`select * from product_orders order by created_at desc limit ${limit}`;
    return rows.map(rowToProductOrder);
  }
  return readFile()
    .productOrders.filter((o) => !accountId || o.accountId === accountId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

export async function findProductOrder(id: string): Promise<ProductOrder | null> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from product_orders where id = ${id}`;
    return rows[0] ? rowToProductOrder(rows[0]) : null;
  }
  return readFile().productOrders.find((o) => o.id === id) ?? null;
}

/** Giao hàng: ghi thông tin tài khoản và chuyển sang đã giao. */
export async function deliverProductOrder(
  id: string,
  credentials: { label: string; value: string }[],
  note: string,
): Promise<ProductOrder | null> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`update product_orders
      set status = 'delivered', delivered_at = now(), credentials = ${JSON.stringify(credentials)}::jsonb, note = ${note}
      where id = ${id} and status = 'pending' returning *`;
    return rows[0] ? rowToProductOrder(rows[0]) : null;
  }
  const db = readFile();
  const o = db.productOrders.find((x) => x.id === id && x.status === "pending");
  if (!o) return null;
  o.status = "delivered";
  o.deliveredAt = new Date().toISOString();
  o.credentials = credentials;
  o.note = note;
  writeFile(db);
  return o;
}

/** Huỷ đơn và hoàn tiền vào số dư. */
export async function cancelProductOrder(id: string, note: string): Promise<ProductOrder | null> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`update product_orders set status = 'canceled', note = ${note}
      where id = ${id} and status = 'pending' returning *`;
    return rows[0] ? rowToProductOrder(rows[0]) : null;
  }
  const db = readFile();
  const o = db.productOrders.find((x) => x.id === id && x.status === "pending");
  if (!o) return null;
  o.status = "canceled";
  o.note = note;
  writeFile(db);
  return o;
}

// ---------------------------------------------------------------------------
// Kho hàng có sẵn
// ---------------------------------------------------------------------------
const rowToStock = (r: Record<string, unknown>): StockItem => ({
  id: String(r.id),
  key: String(r.key),
  fields: (r.fields ?? []) as { label: string; value: string }[],
  status: r.status as StockItem["status"],
  createdAt: new Date(r.created_at as string).toISOString(),
  usedAt: r.used_at ? new Date(r.used_at as string).toISOString() : null,
  orderId: r.order_id ? String(r.order_id) : null,
});

export async function insertStockItems(items: StockItem[]) {
  if (!items.length) return;
  if (sql) {
    await ensureSchema();
    for (const it of items) {
      await sql`insert into stock_items (id, key, fields, status, created_at)
        values (${it.id}, ${it.key}, ${JSON.stringify(it.fields)}::jsonb, 'available', ${it.createdAt})`;
    }
    return;
  }
  const db = readFile();
  db.stockItems.push(...items);
  writeFile(db);
}

/** Đếm số món còn dùng được, theo từng khoá gói. */
export async function stockCounts(): Promise<Record<string, number>> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select key, count(*)::int as n from stock_items where status = 'available' group by key`;
    return Object.fromEntries(rows.map((r) => [String(r.key), Number(r.n)]));
  }
  const out: Record<string, number> = {};
  for (const it of readFile().stockItems) {
    if (it.status === "available") out[it.key] = (out[it.key] ?? 0) + 1;
  }
  return out;
}

/**
 * Lấy một món khỏi kho và đánh dấu đã dùng.
 * Dùng câu update có điều kiện nên hai đơn cùng lúc không lấy trúng một món.
 */
export async function claimStockItem(key: string, orderId: string): Promise<StockItem | null> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`update stock_items set status = 'used', used_at = now(), order_id = ${orderId}
      where id = (select id from stock_items where key = ${key} and status = 'available'
                  order by created_at limit 1 for update skip locked)
      returning *`;
    return rows[0] ? rowToStock(rows[0]) : null;
  }
  const db = readFile();
  const it = db.stockItems.find((x) => x.key === key && x.status === "available");
  if (!it) return null;
  it.status = "used";
  it.usedAt = new Date().toISOString();
  it.orderId = orderId;
  writeFile(db);
  return it;
}

export async function listStockItems(key?: string, limit = 200): Promise<StockItem[]> {
  if (sql) {
    await ensureSchema();
    const rows = key
      ? await sql`select * from stock_items where key = ${key} order by created_at desc limit ${limit}`
      : await sql`select * from stock_items order by created_at desc limit ${limit}`;
    return rows.map(rowToStock);
  }
  return readFile()
    .stockItems.filter((x) => !key || x.key === key)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

/** Chỉ xoá được món chưa dùng — món đã giao là chứng từ, không xoá. */
export async function deleteStockItem(id: string) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`delete from stock_items where id = ${id} and status = 'available' returning id`;
    return rows.length > 0;
  }
  const db = readFile();
  const before = db.stockItems.length;
  db.stockItems = db.stockItems.filter((x) => !(x.id === id && x.status === "available"));
  writeFile(db);
  return db.stockItems.length < before;
}

// ---------------------------------------------------------------------------
// Chữ nghĩa trên trang sản phẩm
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Đơn dịch vụ
// ---------------------------------------------------------------------------
const rowToServiceOrder = (r: Record<string, unknown>): ServiceOrder => ({
  id: String(r.id),
  accountId: String(r.account_id),
  platformName: String(r.platform_name),
  serviceName: String(r.service_name),
  serverName: String(r.server_name),
  apiServiceId: String(r.api_service_id),
  link: String(r.link),
  quantity: Number(r.quantity),
  unitPrice: Number(r.unit_price),
  unitCost: Number(r.unit_cost),
  amount: Number(r.amount),
  cost: Number(r.cost),
  status: r.status as ServiceOrder["status"],
  providerOrderId: r.provider_order_id ? String(r.provider_order_id) : null,
  startCount: Number(r.start_count),
  remains: Number(r.remains),
  createdAt: new Date(r.created_at as string).toISOString(),
  updatedAt: new Date(r.updated_at as string).toISOString(),
  refunded: Number(r.refunded),
  note: r.note ? String(r.note) : null,
});

export async function insertServiceOrder(o: ServiceOrder) {
  if (sql) {
    await ensureSchema();
    await sql`insert into service_orders (id, account_id, platform_name, service_name, server_name, api_service_id,
      link, quantity, unit_price, unit_cost, amount, cost, status, provider_order_id, start_count, remains,
      created_at, updated_at, refunded, note)
      values (${o.id}, ${o.accountId}, ${o.platformName}, ${o.serviceName}, ${o.serverName}, ${o.apiServiceId},
      ${o.link}, ${o.quantity}, ${o.unitPrice}, ${o.unitCost}, ${o.amount}, ${o.cost}, ${o.status},
      ${o.providerOrderId}, ${o.startCount}, ${o.remains}, ${o.createdAt}, ${o.updatedAt}, ${o.refunded},
      ${o.note ?? null})`;
    return;
  }
  const db = readFile();
  db.serviceOrders.unshift(o);
  writeFile(db);
}

export async function listServiceOrders(accountId?: string, limit = 200): Promise<ServiceOrder[]> {
  if (sql) {
    await ensureSchema();
    const rows = accountId
      ? await sql`select * from service_orders where account_id = ${accountId} order by created_at desc limit ${limit}`
      : await sql`select * from service_orders order by created_at desc limit ${limit}`;
    return rows.map(rowToServiceOrder);
  }
  const all = readFile().serviceOrders;
  return (accountId ? all.filter((o) => o.accountId === accountId) : all).slice(0, limit);
}

export async function findServiceOrder(id: string): Promise<ServiceOrder | null> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from service_orders where id = ${id}`;
    return rows[0] ? rowToServiceOrder(rows[0]) : null;
  }
  return readFile().serviceOrders.find((o) => o.id === id) ?? null;
}

/** Cập nhật một phần đơn; trả về bản mới hoặc null nếu không tìm thấy. */
export async function updateServiceOrder(
  id: string,
  patch: Partial<Pick<ServiceOrder, "status" | "providerOrderId" | "startCount" | "remains" | "refunded" | "note">>,
): Promise<ServiceOrder | null> {
  const now = new Date().toISOString();
  if (sql) {
    await ensureSchema();
    const cur = await findServiceOrder(id);
    if (!cur) return null;
    const next = { ...cur, ...patch, updatedAt: now };
    await sql`update service_orders set status = ${next.status}, provider_order_id = ${next.providerOrderId},
      start_count = ${next.startCount}, remains = ${next.remains}, refunded = ${next.refunded},
      note = ${next.note ?? null}, updated_at = now() where id = ${id}`;
    return next;
  }
  const db = readFile();
  const o = db.serviceOrders.find((x) => x.id === id);
  if (!o) return null;
  Object.assign(o, patch, { updatedAt: now });
  writeFile(db);
  return o;
}

// ---------------------------------------------------------------------------
// Công tắc vận hành
// ---------------------------------------------------------------------------
export async function getOps(): Promise<OpsSettings | null> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select data from ops_settings where id = 1`;
    return rows[0] ? (rows[0].data as OpsSettings) : null;
  }
  return readFile().ops;
}

export async function putOps(o: OpsSettings) {
  if (sql) {
    await ensureSchema();
    await sql`insert into ops_settings (id, data, updated_at) values (1, ${JSON.stringify(o)}::jsonb, now())
      on conflict (id) do update set data = excluded.data, updated_at = now()`;
    return;
  }
  const db = readFile();
  db.ops = o;
  writeFile(db);
}

// ---------------------------------------------------------------------------
// Thông báo
// ---------------------------------------------------------------------------
export async function getAnnouncement(): Promise<Announcement | null> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select data from announcement where id = 1`;
    return rows[0] ? (rows[0].data as Announcement) : null;
  }
  return readFile().announcement;
}

export async function putAnnouncement(a: Announcement) {
  if (sql) {
    await ensureSchema();
    await sql`insert into announcement (id, data, updated_at) values (1, ${JSON.stringify(a)}::jsonb, now())
      on conflict (id) do update set data = excluded.data, updated_at = now()`;
    return;
  }
  const db = readFile();
  db.announcement = a;
  writeFile(db);
}

export async function listProductContent(): Promise<ProductContent[]> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`select * from product_content`;
    return rows.map((r) => ({
      slug: String(r.slug),
      name: r.name ? String(r.name) : null,
      tagline: r.tagline ? String(r.tagline) : null,
      description: r.description ? String(r.description) : null,
      badges: (r.badges ?? []) as string[],
      updatedAt: new Date(r.updated_at as string).toISOString(),
    }));
  }
  return readFile().productContent;
}

export async function putProductContent(c: ProductContent) {
  if (sql) {
    await ensureSchema();
    await sql`insert into product_content (slug, name, tagline, description, badges, updated_at)
      values (${c.slug}, ${c.name}, ${c.tagline}, ${c.description}, ${JSON.stringify(c.badges)}::jsonb, ${c.updatedAt})
      on conflict (slug) do update set name = excluded.name, tagline = excluded.tagline,
        description = excluded.description, badges = excluded.badges, updated_at = excluded.updated_at`;
    return;
  }
  const db = readFile();
  db.productContent = [...db.productContent.filter((x) => x.slug !== c.slug), c];
  writeFile(db);
}
