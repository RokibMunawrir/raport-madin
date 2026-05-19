import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { students, academicYears } from '../../../db/schema';
import { eq, and, or, ilike } from 'drizzle-orm';
import { getFullStudentReportData } from '../../../db/queries/reports';

export const GET: APIRoute = async ({ url }) => {
  try {
    const search = url.searchParams.get("search") || "";
    const nis = url.searchParams.get("nis") || "";

    // 1. Get active academic year
    const [activeYear] = await db
      .select()
      .from(academicYears)
      .where(eq(academicYears.isActive, 1))
      .limit(1);

    if (!activeYear) {
      return new Response(JSON.stringify({ error: "Tahun ajaran aktif tidak ditemukan" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mode 1: Exact NIS lookup to unlock full report card
    if (nis) {
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.nis, nis))
        .limit(1);

      if (!student) {
        return new Response(JSON.stringify({ error: "Santri dengan NIS tersebut tidak ditemukan" }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const reportData = await getFullStudentReportData(student.id, activeYear.id);
      if (!reportData) {
        return new Response(JSON.stringify({ error: "Data raport belum tersedia untuk tahun ajaran aktif" }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ type: "report", data: reportData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mode 2: Search by Name/NIS to list candidates (with masked NIS for privacy)
    if (search) {
      const matchedStudents = await db
        .select({
          id: students.id,
          name: students.name,
          nis: students.nis,
          gender: students.gender,
        })
        .from(students)
        .where(or(
          ilike(students.name, `%${search}%`),
          eq(students.nis, search)
        ))
        .limit(5);

      const results = matchedStudents.map(s => {
        // Mask NIS for privacy: e.g. "123456" -> "12****"
        const maskedNis = s.nis ? s.nis.slice(0, 2) + "*".repeat(Math.max(0, s.nis.length - 2)) : "";
        return {
          id: s.id,
          name: s.name,
          maskedNis,
          gender: s.gender || 'Laki-laki',
        };
      });

      return new Response(JSON.stringify({ type: "search", data: results }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: "Parameter pencarian tidak valid" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Terjadi kesalahan internal" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
