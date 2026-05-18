import type { APIRoute } from "astro";
import { db } from "../../../db";
import { teachers, activityLogs } from "../../../db/schema";
import { user as userTable } from "../../../db/auth-schema";
import { eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { nip, email } = body;

    if (!nip || !email) {
      return new Response(
        JSON.stringify({ error: "NIP dan email wajib diisi." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Cari guru berdasarkan NIP
    const teacherList = await db
      .select()
      .from(teachers)
      .where(eq(teachers.nip, nip.trim()))
      .limit(1);

    if (teacherList.length === 0) {
      return new Response(
        JSON.stringify({ error: "NIP tidak ditemukan dalam sistem. Hubungi administrator." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const teacher = teacherList[0];

    // 2. Validasi email cocok dengan data guru (jika sudah ada email di data guru)
    if (teacher.email && teacher.email.toLowerCase() !== normalizedEmail) {
      return new Response(
        JSON.stringify({ error: "Email tidak sesuai dengan data yang terdaftar untuk NIP ini." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Buat akun user dengan password sementara (random, tidak akan digunakan)
    const tempPassword = `Tmp_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}_Aa1!`;

    let newUserId: string;

    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: normalizedEmail,
          password: tempPassword,
          name: teacher.name,
        },
      });

      if (!result?.user?.id) {
        throw new Error("Respons pembuatan akun tidak valid.");
      }

      newUserId = result.user.id;
    } catch (err: any) {
      const errMsg: string = String(err?.message ?? "");
      const isExists =
        errMsg.toLowerCase().includes("already") ||
        errMsg.toLowerCase().includes("exist") ||
        errMsg.toLowerCase().includes("duplicate") ||
        errMsg.toLowerCase().includes("unique");

      if (isExists) {
        return new Response(
          JSON.stringify({
            error: "Email ini sudah terdaftar. Gunakan fitur 'Lupa Password' di halaman login untuk masuk.",
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      throw err;
    }

    // 4. Update teacherId & role di tabel user (langsung via Drizzle)
    await db
      .update(userTable)
      .set({
        teacherId: teacher.id,
        role: "Guru",
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, newUserId));

    // Juga update email di tabel teachers jika belum ada
    if (!teacher.email) {
      await db
        .update(teachers)
        .set({ email: normalizedEmail, updatedAt: new Date() })
        .where(eq(teachers.id, teacher.id));
    }

    // 5. Kirim email reset/set password melalui better-auth forget-password endpoint
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:4321";
    const resetRes = await fetch(`${baseUrl}/api/auth/forget-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        redirectTo: `${baseUrl}/reset-password`,
      }),
    });

    if (!resetRes.ok) {
      console.error(
        "Gagal memicu pengiriman email reset password:",
        await resetRes.text()
      );
      // Tetap kembalikan sukses karena akun sudah dibuat — user bisa request ulang
    }

    // 6. Log aktivitas
    await db.insert(activityLogs).values({
      title: "Registrasi Akun Pengajar",
      description: `Akun untuk Asatidz ${teacher.name} (NIP: ${nip}) berhasil dibuat. Link pengaturan password dikirim ke ${normalizedEmail}.`,
      type: "success",
      module: "Sistem",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Akun berhasil dibuat! Link pengaturan password telah dikirim ke ${normalizedEmail}. Silakan periksa inbox atau folder spam Anda.`,
        teacherName: teacher.name,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error [register-teacher]:", err);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan pada server. Silakan coba lagi nanti." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
