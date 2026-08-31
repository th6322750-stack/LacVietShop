import { z } from "zod";

/** Cùng bộ luật với form ở trình duyệt — trình duyệt kiểm cho nhanh, server kiểm để chắc. */
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z.string().trim().min(4).max(24).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().regex(/^0\d{9}$/),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(160),
  password: z.string().min(1).max(128),
});

export const forgotSchema = z.object({ email: z.string().trim().email().max(160) });

export const resetSchema = z.object({
  email: z.string().trim().email().max(160),
  code: z.string().trim().regex(/^\d{6}$/),
  password: z.string().min(8).max(128),
});
