import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as authSchema from "../db/auth-schema";
import nodemailer from "nodemailer";

// Konfigurasi transporter email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const auth = betterAuth({
    baseUrl: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.BETTER_AUTH_URL!],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: authSchema,
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            try {
                await transporter.sendMail({
                    from: `"Raport MDT Al-Amiriyyah" <${process.env.SMTP_USER}>`,
                    to: user.email,
                    subject: "Atur Password Akun Anda – Raport Madin",
                    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 40px 32px;text-align:center;">
            <p style="margin:0;color:#e0e7ff;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;">MDT Al Amiriyyah</p>
            <h1 style="margin:12px 0 0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Raport Madin</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;">Halo, ${user.name}!</p>
            <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#1e293b;">Atur Password Akun Anda</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.7;">
              Akun Anda sebagai pengajar di sistem Raport Madin telah berhasil dibuat. 
              Klik tombol di bawah untuk mengatur password dan mulai menggunakan sistem.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${url}" 
                 style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:14px;letter-spacing:0.3px;">
                🔐 Atur Password Sekarang
              </a>
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                ⏰ <strong style="color:#64748b;">Link ini berlaku selama 1 jam.</strong><br/>
                Jika Anda tidak mendaftar, abaikan email ini.
              </p>
            </div>
            <p style="margin:0;font-size:13px;color:#cbd5e1;">
              Atau salin link berikut ke browser Anda:<br/>
              <a href="${url}" style="color:#6366f1;word-break:break-all;font-size:12px;">${url}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} MDT Al Amiriyyah · Raport Madin System<br/>
              Email ini dikirim secara otomatis, mohon tidak membalas.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
                });
            } catch (err) {
                console.error("Gagal mengirim email reset password:", err);
            }
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "Guru",
            },
            teacherId: {
                type: "string",
                required: false,
            },
        },
    },
})