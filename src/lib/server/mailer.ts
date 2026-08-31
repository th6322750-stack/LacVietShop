/**
 * Gửi thư qua SMTP. Giai đoạn kiểm thử dùng Gmail + App Password.
 *
 * Cấu hình trong .env.local (không commit):
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=465
 *   SMTP_USER=lacvietmedia.agency@gmail.com
 *   SMTP_PASS=<App Password 16 ký tự, KHÔNG phải mật khẩu Gmail>
 *   SMTP_FROM=Lạc Việt Media <lacvietmedia.agency@gmail.com>
 *
 * Chưa cấu hình thì không im lặng nuốt: hàm trả về delivery "console" và mã được
 * in ra cửa sổ chạy máy chủ để vẫn kiểm thử được luồng.
 *
 * Lưu ý khi chạy thật: Gmail thường giới hạn ~500 thư/ngày và người nhận thấy
 * địa chỉ @gmail.com. Đổi sang nhà cung cấp thư giao dịch với tên miền riêng chỉ
 * cần sửa mấy biến trên, code không phải đổi.
 */
import nodemailer from "nodemailer";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/mailer.ts chỉ được dùng phía server.");
}

export const smtpConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let cached: nodemailer.Transporter | null = null;

function transporter() {
  if (cached) return cached;
  const port = Number(process.env.SMTP_PORT ?? 465);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return cached;
}

export type Delivery = "smtp" | "console";

export async function sendResetCode(
  to: string,
  name: string,
  code: string,
): Promise<{ delivery: Delivery; error?: string }> {
  if (!smtpConfigured()) {
    console.log(`\n[Lạc Việt] SMTP chưa cấu hình. Mã đặt lại cho ${to}: ${code} (hạn 15 phút)\n`);
    return { delivery: "console" };
  }

  const from = process.env.SMTP_FROM || `Lạc Việt Media <${process.env.SMTP_USER}>`;
  try {
    await transporter().sendMail({
      from,
      to,
      subject: `${code} là mã đặt lại mật khẩu Lạc Việt`,
      text: [
        `Chào ${name},`,
        "",
        `Mã đặt lại mật khẩu của bạn là: ${code}`,
        "Mã có hiệu lực trong 15 phút và chỉ dùng được một lần.",
        "",
        "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua thư này — tài khoản của bạn vẫn an toàn.",
        "",
        "Lạc Việt Media Agency",
      ].join("\n"),
      html: `
        <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e293b">
          <p style="margin:0 0 16px">Chào <strong>${escapeHtml(name)}</strong>,</p>
          <p style="margin:0 0 12px">Mã đặt lại mật khẩu của bạn là:</p>
          <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px;color:#b45309">${code}</p>
          <p style="margin:0 0 12px">Mã có hiệu lực trong <strong>15 phút</strong> và chỉ dùng được một lần.</p>
          <p style="margin:0 0 20px;color:#64748b;font-size:14px">
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua thư này — tài khoản của bạn vẫn an toàn.
          </p>
          <p style="margin:0;color:#64748b;font-size:13px">Lạc Việt Media Agency</p>
        </div>
      `,
    });
    return { delivery: "smtp" };
  } catch (e) {
    // Gửi hỏng thì vẫn cho kiểm thử tiếp, nhưng nói rõ là hỏng.
    const error = e instanceof Error ? e.message : "Không gửi được thư.";
    console.log(`\n[Lạc Việt] Gửi thư hỏng (${error}). Mã đặt lại cho ${to}: ${code}\n`);
    return { delivery: "console", error };
  }
}

function escapeHtml(v: string) {
  return v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
