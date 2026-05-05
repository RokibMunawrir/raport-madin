import { db } from "../index";
import { teacherAttendances, teachingAssignments, teachers, subjects, activityLogs } from "../schema";
import { eq, and, sql } from "drizzle-orm";

export async function getTeacherAttendanceByDateAndClass(dateStr: string, classroomId: string) {
  // 1. Get all teaching assignments for this class
  const assignments = await db
    .select({
      id: teachingAssignments.id,
      teacherId: teachingAssignments.teacherId,
      teacherName: teachers.name,
      teacherAvatar: teachers.avatar,
      subjectId: teachingAssignments.subjectId,
      subjectName: subjects.name,
      classroomId: teachingAssignments.classroomId,
      academicYearId: teachingAssignments.academicYearId,
      day: teachingAssignments.day,
      period: teachingAssignments.period,
      session: teachingAssignments.session,
    })
    .from(teachingAssignments)
    .innerJoin(teachers, eq(teachingAssignments.teacherId, teachers.id))
    .innerJoin(subjects, eq(teachingAssignments.subjectId, subjects.id))
    .where(eq(teachingAssignments.classroomId, classroomId));

  // 2. Get attendance for those assignments on that date
  const existingAttendance = await db
    .select()
    .from(teacherAttendances)
    .where(and(
        eq(teacherAttendances.classroomId, classroomId),
        eq(teacherAttendances.date, dateStr)
    ));

  return {
    assignments,
    attendance: existingAttendance,
  };
}

export async function saveBulkTeacherAttendance(data: any[]) {
  if (data.length === 0) return;

  return await db.transaction(async (tx) => {
    // Bulk Upsert using the unique index
    await tx.insert(teacherAttendances)
      .values(data)
      .onConflictDoUpdate({
        target: [
          teacherAttendances.teacherId, 
          teacherAttendances.subjectId, 
          teacherAttendances.classroomId, 
          teacherAttendances.date, 
          teacherAttendances.session
        ],
        set: {
          status: sql`excluded.status`,
          notes: sql`excluded.notes`,
          updatedAt: new Date()
        }
      });

    await tx.insert(activityLogs).values({
      title: 'Update Presensi Asatidz',
      description: `Rekapitulasi presensi pengajar untuk tanggal ${data[0]?.date || '-'} telah diperbarui.`,
      type: 'success',
      module: 'Akademik',
    });
  });
}
