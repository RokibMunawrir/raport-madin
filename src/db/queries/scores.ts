import { db } from "../index";
import { students, studentClassrooms, scores, studentNotes, subjects, activityLogs } from "../schema";
import { eq, and, sql } from "drizzle-orm";

export async function getGradingData(academicYearId: string, subjectId: string, classroomId: string) {
  // 1. Get all students in the class
  const studentsInClass = await db
    .select({
      id: students.id,
      name: students.name,
      nisn: students.nisn,
      classroomId: studentClassrooms.classroomId,
    })
    .from(students)
    .innerJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
    .where(and(
        eq(studentClassrooms.classroomId, classroomId),
        eq(studentClassrooms.academicYearId, academicYearId)
    ));

  // 2. Get scores for the selected subject and year
  const existingScores = await db
    .select()
    .from(scores)
    .where(and(
        eq(scores.subjectId, subjectId),
        eq(scores.academicYearId, academicYearId)
    ));

  // 3. Get student notes for the year
  const existingNotes = await db
    .select()
    .from(studentNotes)
    .where(eq(studentNotes.academicYearId, academicYearId));

  return {
    students: studentsInClass,
    scores: existingScores,
    notes: existingNotes,
  };
}

export async function saveBulkGrading(
    academicYearId: string,
    subjectId: string,
    data: {
        scores: {
            studentId: string;
            harian: number;
            semester: number;
        }[];
        notes: {
            studentId: string;
            content: string;
        }[];
    }
) {
  return await db.transaction(async (tx) => {
    // Save Scores
    for (const s of data.scores) {
      const existing = await tx
        .select()
        .from(scores)
        .where(and(
          eq(scores.studentId, s.studentId),
          eq(scores.subjectId, subjectId),
          eq(scores.academicYearId, academicYearId)
        ))
        .limit(1);

      if (existing.length > 0) {
        await tx.update(scores)
          .set({ 
            harian: s.harian, 
            semester: s.semester,
            updatedAt: new Date()
          })
          .where(eq(scores.id, existing[0].id));
      } else {
        await tx.insert(scores).values({
          studentId: s.studentId,
          subjectId: subjectId,
          academicYearId: academicYearId,
          harian: s.harian,
          semester: s.semester,
        });
      }
    }

    // Save Notes
    for (const n of data.notes) {
      const existing = await tx
        .select()
        .from(studentNotes)
        .where(and(
          eq(studentNotes.studentId, n.studentId),
          eq(studentNotes.academicYearId, academicYearId)
        ))
        .limit(1);

      if (existing.length > 0) {
        await tx.update(studentNotes)
          .set({ 
            content: n.content,
            updatedAt: new Date()
          })
          .where(eq(studentNotes.id, existing[0].id));
      } else {
        await tx.insert(studentNotes).values({
          studentId: n.studentId,
          academicYearId: academicYearId,
          content: n.content,
        });
      }
    }

    await tx.insert(activityLogs).values({
      title: 'Update Nilai Santri',
      description: `Rekapitulasi nilai mata pelajaran telah diperbarui.`,
      type: 'success',
      module: 'Akademik',
    });
  });
}
