import { z } from "zod";

/**
 * Đăng ký chỉ hỏi ba thứ: tên đăng nhập, email, mật khẩu.
 *
 * Bỏ họ tên và số điện thoại vì mỗi ô thêm là thêm một cớ để khách bỏ dở.
 * Ai muốn điền thì vào trang Tài khoản bổ sung sau.
 */
export const registerSchema = z.object({
  username: z.string().trim().min(4).max(24).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email().max(160),
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
