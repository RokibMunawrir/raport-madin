import { db } from "../index";
import { attendances, students, studentClassrooms, activityLogs } from "../schema";
import { eq, and, sql } from "drizzle-orm";

export async function getAttendanceByDateAndClass(dateStr: string, classroomId: string) {
  // 1. Get all students in that class
  const studentsInClass = await db
    .select({
      id: students.id,
      name: students.name,
      nis: students.nis,
      nisn: students.nisn,
      classroomId: studentClassrooms.classroomId,
    })
    .from(students)
    .innerJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
    .where(eq(studentClassrooms.classroomId, classroomId));

  // 2. Get attendance for those students on that date
  const existingAttendance = await db
    .select()
    .from(attendances)
    .where(eq(attendances.date, dateStr));

  return {
    students: studentsInClass,
    attendance: existingAttendance,
  };
}

export async function saveBulkAttendance(data: {
  studentId: string;
  academicYearId: string;
  date: string;
  session: number;
  status: "Hadir" | "Izin" | "Sakit" | "Alpha";
  notes?: string;
}[]) {
  return await db.transaction(async (tx) => {
    // Bulk Upsert: Inserts new records or updates existing ones based on the unique index
    await tx.insert(attendances)
      .values(data)
      .onConflictDoUpdate({
        target: [attendances.studentId, attendances.date, attendances.session],
        set: {
          status: sql`excluded.status`,
          notes: sql`excluded.notes`,
          updatedAt: new Date()
        }
      });

    await tx.insert(activityLogs).values({
      title: 'Update Presensi',
      description: `Rekapitulasi presensi untuk tanggal ${data[0]?.date || '-'} telah diperbarui.`,
      type: 'success',
      module: 'Akademik',
    });
  });
}
