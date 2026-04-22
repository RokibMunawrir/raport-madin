import { db } from "../index";
import { 
  students, 
  classrooms, 
  teachers, 
  studentClassrooms, 
  academicYears, 
  scores, 
  subjects, 
  attendances, 
  studentNotes, 
  achievements 
} from "../schema";
import { eq, and, sql } from "drizzle-orm";

export async function getFullStudentReportData(studentId: string, academicYearId: string) {
  // 1. Get Student Personal Info & Academic Year Info
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);

  const [academicYear] = await db
    .select()
    .from(academicYears)
    .where(eq(academicYears.id, academicYearId))
    .limit(1);

  if (!student || !academicYear) return null;

  // 2. Get Classroom & Wali Kelas Info
  const [studentClass] = await db
    .select({
      classroomId: studentClassrooms.classroomId,
      className: classrooms.name,
      teacherName: teachers.name,
      teacherNip: teachers.nip
    })
    .from(studentClassrooms)
    .innerJoin(classrooms, eq(studentClassrooms.classroomId, classrooms.id))
    .leftJoin(teachers, eq(classrooms.teacherId, teachers.id))
    .where(and(
      eq(studentClassrooms.studentId, studentId),
      eq(studentClassrooms.academicYearId, academicYearId)
    ))
    .limit(1);

  // 3. Get All Subject Scores
  const studentScores = await db
    .select({
      id: scores.id,
      subjectName: subjects.name,
      subjectCategory: subjects.category,
      harian: scores.harian,
      semester: scores.semester,
    })
    .from(scores)
    .innerJoin(subjects, eq(scores.subjectId, subjects.id))
    .where(and(
      eq(scores.studentId, studentId),
      eq(scores.academicYearId, academicYearId)
    ));

  // 4. Get Attendance Summary
  const attendanceData = await db
    .select({
      status: attendances.status,
      count: sql<number>`count(${attendances.id})`
    })
    .from(attendances)
    .where(and(
      eq(attendances.studentId, studentId),
      eq(attendances.academicYearId, academicYearId)
    ))
    .groupBy(attendances.status);

  const attendanceSummary = {
    sakit: Number(attendanceData.find(a => a.status === 'Sakit')?.count || 0),
    izin: Number(attendanceData.find(a => a.status === 'Izin')?.count || 0),
    alpha: Number(attendanceData.find(a => a.status === 'Alpha')?.count || 0),
  };

  // 5. Get Student Note (Akhlak)
  const [studentNote] = await db
    .select()
    .from(studentNotes)
    .where(and(
      eq(studentNotes.studentId, studentId),
      eq(studentNotes.academicYearId, academicYearId)
    ))
    .limit(1);

  // 6. Get Achievements (Pengembangan Diri)
  const studentAchievements = await db
    .select()
    .from(achievements)
    .where(and(
      eq(achievements.studentId, studentId),
      eq(achievements.academicYearId, academicYearId)
    ));

  // 7. Get Headmaster Info (Wali Kelas with Headmaster role or highest rank)
  // For now, let's assume the first teacher or a placeholder if no dedicated field
  const [headmaster] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.status, 'Aktif')) // We could filter by role if it existed
    .limit(1);

  return {
    student,
    academicYear,
    classroom: studentClass,
    scores: studentScores,
    attendance: attendanceSummary,
    note: studentNote?.content || '-',
    achievements: studentAchievements,
    headmaster: headmaster || { name: 'Drs. H. Mulyadi, M.Pd', nip: '197001011995011001' } // Placeholder if none found
  };
}
