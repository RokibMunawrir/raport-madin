import { db } from "../index";
import { achievements, students, activityLogs, academicYears, studentClassrooms, classrooms } from "../schema";
import { desc, eq, and, exists } from "drizzle-orm";

export async function getAchievements(teacherId?: string) {
  const teacherClass = teacherId 
    ? db.select({ id: classrooms.id }).from(classrooms).where(eq(classrooms.teacherId, teacherId))
    : null;

  const query = db
    .select({
      id: achievements.id,
      studentName: students.name,
      avatar: students.avatar,
      nis: students.nis,
      title: achievements.title,
      level: achievements.level,
      category: achievements.category,
      rank: achievements.rank,
      date: achievements.date,
      score: achievements.score,
      academicYear: academicYears.name,
    })
    .from(achievements)
    .innerJoin(students, eq(achievements.studentId, students.id))
    .innerJoin(academicYears, eq(achievements.academicYearId, academicYears.id))
    .where(
        teacherId && teacherClass
            ? exists(
                db.select()
                  .from(studentClassrooms)
                  .where(
                      and(
                          eq(studentClassrooms.studentId, achievements.studentId),
                          eq(studentClassrooms.classroomId, teacherClass)
                      )
                  )
            )
            : undefined
    );

  return await query.orderBy(desc(achievements.date));
}

export async function addAchievement(data: {
  studentId: string;
  academicYearId: string;
  category: string;
  title: string;
  level?: string;
  rank?: string;
  date: string;
  score?: number;
  description?: string;
}) {
  const result = await db.insert(achievements).values({
    ...data,
    score: data.score || 0,
  }).returning({ insertedId: achievements.id });

  // Get student name for log
  const student = await db.select({ name: students.name }).from(students).where(eq(students.id, data.studentId)).limit(1);
  
  await db.insert(activityLogs).values({
    title: 'Pencatatan Prestasi',
    description: `Prestasi "${data.title}" berhasil dicatat untuk santri ${student[0]?.name || 'Unknown'}.`,
    type: 'success',
    module: 'Akademik',
  });

  return result[0];
}

export async function deleteAchievement(id: string) {
  const target = await db.select({ title: achievements.title }).from(achievements).where(eq(achievements.id, id)).limit(1);
  
  if (target.length > 0) {
    await db.delete(achievements).where(eq(achievements.id, id));
    
    await db.insert(activityLogs).values({
      title: 'Hapus Prestasi',
      description: `Data prestasi "${target[0].title}" telah dihapus.`,
      type: 'warning',
      module: 'Akademik',
    });
  }
}
