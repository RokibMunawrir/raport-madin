import { db } from "../../../db";
import { attendances, students, studentClassrooms, teacherAttendances, teachingAssignments, teachers, subjects } from "../../../db/schema";
import { eq, and, sql, between } from "drizzle-orm";
import type { APIContext } from "astro";

export async function GET({ url }: APIContext) {
  const classId = url.searchParams.get("classId");
  const type = url.searchParams.get("type"); // "monthly", "weekly", "semester"
  const date = url.searchParams.get("date"); // e.g. "2026-05-05"
  const userType = url.searchParams.get("userType") || "student"; // "student" or "teacher"
  
  if (!classId || !type || !date) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
  }

  const selectedDate = new Date(date);
  let startDate: string;
  let endDate: string;

  if (type === "monthly") {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    startDate = new Date(year, month, 1).toISOString().split('T')[0];
    endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  } else if (type === "weekly") {
    const day = selectedDate.getDay();
    const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1); 
    const start = new Date(selectedDate.setDate(diff));
    startDate = start.toISOString().split('T')[0];
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    endDate = end.toISOString().split('T')[0];
  } else if (type === "semester") {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    if (month >= 6) { // July - Dec (Ganjil)
      startDate = `${year}-07-01`;
      endDate = `${year}-12-31`;
    } else { // Jan - June (Genap)
      startDate = `${year}-01-01`;
      endDate = `${year}-06-30`;
    }
  } else {
    return new Response(JSON.stringify({ error: "Invalid rekap type" }), { status: 400 });
  }

  try {
    if (userType === "student") {
      const studentsInClass = await db
        .select({
          id: students.id,
          name: students.name,
          nis: students.nis,
        })
        .from(students)
        .innerJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
        .where(eq(studentClassrooms.classroomId, classId))
        .orderBy(students.name);

      const rangeAttendance = await db
        .select()
        .from(attendances)
        .where(and(
          between(attendances.date, startDate, endDate),
          sql`${attendances.studentId} IN (
            SELECT student_id FROM student_classrooms WHERE classroom_id = ${classId}
          )`
        ));

      return new Response(JSON.stringify({
        students: studentsInClass,
        attendance: rangeAttendance,
        startDate,
        endDate
      }), { status: 200 });
    } else {
      // Teacher Rekap
      const teacherAssignments = await db
        .select({
          id: teachingAssignments.id,
          teacherId: teachingAssignments.teacherId,
          teacherName: teachers.name,
          subjectId: teachingAssignments.subjectId,
          subjectName: subjects.name,
        })
        .from(teachingAssignments)
        .innerJoin(teachers, eq(teachingAssignments.teacherId, teachers.id))
        .innerJoin(subjects, eq(teachingAssignments.subjectId, subjects.id))
        .where(eq(teachingAssignments.classroomId, classId));

      const rangeAttendance = await db
        .select()
        .from(teacherAttendances)
        .where(and(
          between(teacherAttendances.date, startDate, endDate),
          eq(teacherAttendances.classroomId, classId)
        ));

      return new Response(JSON.stringify({
        assignments: teacherAssignments,
        attendance: rangeAttendance,
        startDate,
        endDate
      }), { status: 200 });
    }
  } catch (error) {
    console.error("Rekap API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
