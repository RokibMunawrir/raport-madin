import { db } from "../index";
import { 
  students, 
  teachers, 
  classrooms, 
  activityLogs, 
  systemMetrics,
  academicYears,
  attendances,
  studentClassrooms,
  achievements,
  scores,
  subjects,
  teachingAssignments
} from "../schema";
import { count, desc, eq, and, sql } from "drizzle-orm";

export async function getAdminStats() {
  const [studentCount] = await db.select({ value: count() }).from(students);
  const [teacherCount] = await db.select({ value: count() }).from(teachers);
  const [classroomCount] = await db.select({ value: count() }).from(classrooms);
  
  // Example of unvalidated data: student with missing NISN or something
  // For now, let's just return a static number or count students with no classroom
  const [invalidDataCount] = await db.select({ value: count() })
    .from(students)
    .where(eq(students.status, 'Draft' as any)); // Assuming draft status means unvalidated

  return {
    totalStudents: studentCount.value,
    totalTeachers: teacherCount.value,
    totalClassrooms: classroomCount.value,
    unvalidatedData: invalidDataCount.value || 0
  };
}

export async function getRecentActivityLogs(limit = 5) {
  return await db.select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function getSystemStatus() {
  return await db.select()
    .from(systemMetrics)
    .orderBy(desc(systemMetrics.lastUpdated));
}

export async function getWaliKelasData(teacherId: string) {
  // 1. Get classroom managed by teacher
  const [classroom] = await db.select()
    .from(classrooms)
    .where(eq(classrooms.teacherId, teacherId))
    .limit(1);

  if (!classroom) return null;

  // 2. Get active academic year
  const activeYear = await getActiveAcademicYear();
  if (!activeYear) return { classroom };

  // 3. Count students in this classroom
  const activeStudents = await db.select({ id: students.id })
    .from(students)
    .innerJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
    .where(and(
      eq(studentClassrooms.classroomId, classroom.id),
      eq(studentClassrooms.academicYearId, activeYear.id)
    ));
  
  const studentIds = activeStudents.map(s => s.id);
  if (studentIds.length === 0) return { classroom, totalStudents: 0 };

  // 4. Calculate average attendance for this class
  const [attendanceStats] = await db.select({
      total: count(attendances.id),
      present: sql<number>`count(case when ${attendances.status} = 'Hadir' then 1 end)`
    })
    .from(attendances)
    .where(and(
      sql`${attendances.studentId} IN ${studentIds}`,
      eq(attendances.academicYearId, activeYear.id)
    ));
  
  const avgAttendance = attendanceStats.total > 0 
    ? (attendanceStats.present / attendanceStats.total * 100).toFixed(1)
    : "0";

  // 5. Get latest achievement for students in this class
  const [latestAchievement] = await db.select()
    .from(achievements)
    .where(sql`${achievements.studentId} IN ${studentIds}`)
    .orderBy(desc(achievements.date))
    .limit(1);

  // 6. Calculate average score for the class
  const [scoreStats] = await db.select({
      avg: sql<number>`avg((${scores.harian} + ${scores.semester}) / 2.0)`
    })
    .from(scores)
    .where(sql`${scores.studentId} IN ${studentIds}`);

  // 7. Get today's attendance for these students
  const today = new Date().toISOString().split('T')[0];
  const attendanceList = await db.select({
      name: students.name,
      nisn: students.nisn,
      status: attendances.status,
      time: attendances.createdAt
    })
    .from(students)
    .innerJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
    .leftJoin(attendances, and(
      eq(students.id, attendances.studentId),
      eq(attendances.date, today)
    ))
    .where(and(
      eq(studentClassrooms.classroomId, classroom.id),
      eq(studentClassrooms.academicYearId, activeYear.id)
    ))
    .limit(5);

  // 8. Get recent logs related to "Akademik" or this class (mocked link for now)
  const classLogs = await db.select()
    .from(activityLogs)
    .where(eq(activityLogs.module, 'Akademik'))
    .orderBy(desc(activityLogs.createdAt))
    .limit(3);

  return {
    classroom,
    totalStudents: studentIds.length,
    avgAttendance: `${avgAttendance}%`,
    latestAchievement: latestAchievement?.title || "-",
    avgScore: scoreStats.avg ? Number(scoreStats.avg).toFixed(1) : "0",
    todayAttendance: attendanceList.map(a => ({
      ...a,
      time: a.time ? new Date(a.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'
    })),
    classLogs
  };
}

export async function getStaffData() {
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Count entries made today (using activityLogs as proxy)
  const [entriesToday] = await db.select({ value: count() })
    .from(activityLogs)
    .where(sql`DATE(${activityLogs.createdAt}) = ${today}`);

  // 2. Count Draft students
  const [draftStudents] = await db.select({ value: count() })
    .from(students)
    .where(eq(students.status, 'Draft' as any));

  // 3. Count awards/certificates ready (mocking for now based on achievements)
  const [readyCertificates] = await db.select({ value: count() })
    .from(achievements);

  return {
    entriesToday: entriesToday.value,
    draftStudents: draftStudents.value,
    readyCertificates: readyCertificates.value
  };
}

export async function getTeacherDashboardData(teacherId: string) {
  // 1. Get Teaching Assignments
  const assignments = await db.select({
      id: teachingAssignments.id,
      classroom: classrooms.name,
      subject: subjects.name,
      level: classrooms.level,
      category: subjects.category,
      day: teachingAssignments.day,
      period: teachingAssignments.period,
      session: teachingAssignments.session
    })
    .from(teachingAssignments)
    .innerJoin(classrooms, eq(teachingAssignments.classroomId, classrooms.id))
    .innerJoin(subjects, eq(teachingAssignments.subjectId, subjects.id))
    .where(eq(teachingAssignments.teacherId, teacherId));

  // 2. Count Subjects and Classes
  const uniqueSubjects = new Set(assignments.map(a => a.subject)).size;
  const uniqueClasses = new Set(assignments.map(a => a.classroom)).size;

  // 3. Get recent logs (academic only)
  const academicLogs = await db.select()
    .from(activityLogs)
    .where(eq(activityLogs.module, 'Akademik'))
    .orderBy(desc(activityLogs.createdAt))
    .limit(5);

  return {
    assignments,
    totalSubjects: uniqueSubjects,
    totalClasses: uniqueClasses,
    academicLogs
  };
}

export async function getActiveAcademicYear() {
  const result = await db.select()
    .from(academicYears)
    .where(eq(academicYears.isActive, 1))
    .limit(1);
  return result[0];
}
