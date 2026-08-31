/**
 * Máy gọi API nhà cung cấp (chuẩn SMM panel API v2).
 *
 * Mọi lời gọi là POST form-urlencoded tới một endpoint duy nhất, phân biệt bằng
 * tham số `action`. Khoá API đi kèm mỗi lời gọi nên hàm này CHỈ chạy phía server.
 *
 * Các action đã kiểm chứng trên tài khoản thật:
 *   balance   → { balance, currency }
 *   services  → [ { service, name, rate, type, platform, category, package_name,
 *                   description, min, max, limit_day, currency } ]
 *   add       → { order } | { error }
 *   status    → { charge, start_count, status, remains, currency } | { error }
 *   refill / cancel → tuỳ dịch vụ có hỗ trợ hay không
 */
import { thatimConfig, isThatimConfigured } from "./config";

if (typeof window !== "undefined") {
  throw new Error("src/lib/thatim/client.ts chỉ được dùng phía server.");
}

export interface ThatimService {
  service: number;
  name: string;
  rate: number;
  type: string;
  platform: string;
  category: string;
  package_name?: string;
  description?: string;
  min: number;
  max: number;
  limit_day?: string;
  currency?: string;
}

export interface ThatimBalance {
  balance: number;
  currency: string;
}

export type ThatimResult<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

const TIMEOUT_MS = 20_000;

export async function callThatim<T>(
  action: string,
  params: Record<string, string | number> = {},
): Promise<ThatimResult<T>> {
  if (!isThatimConfigured()) {
    return { ok: false, error: "Chưa cấu hình THATIM_API_KEY trong .env.local." };
  }

  const body = new URLSearchParams({ key: thatimConfig.key, action });
  for (const [k, v] of Object.entries(params)) body.set(k, String(v));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(thatimConfig.url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return { ok: false, error: `Nhà cung cấp trả HTTP ${res.status}.`, status: res.status };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { ok: false, error: "Nhà cung cấp trả về nội dung không phải JSON." };
    }

    // API dùng { error: "..." } cho mọi lỗi nghiệp vụ, kèm HTTP 200.
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "error" in parsed) {
      return { ok: false, error: String((parsed as { error: unknown }).error) };
    }
    return { ok: true, data: parsed as T };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return { ok: false, error: aborted ? "Nhà cung cấp không phản hồi trong 20 giây." : "Không gọi được API nhà cung cấp." };
  } finally {
    clearTimeout(timer);
  }
}

export const getBalance = () => callThatim<ThatimBalance>("balance");
export const getServices = () => callThatim<ThatimService[]>("services");

export const addOrder = (params: { service: string; link: string; quantity: number } & Record<string, string | number>) =>
  callThatim<{ order: number }>("add", params);

export const getOrderStatus = (order: string) =>
  callThatim<{ charge: string; start_count: string; status: string; remains: string; currency: string }>("status", {
    order,
  });
