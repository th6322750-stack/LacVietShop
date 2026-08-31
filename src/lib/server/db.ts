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
}

const emptyFile = (): FileDb => ({ accounts: [], sessions: [], resetCodes: [], pricing: null, deposits: [] });

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
