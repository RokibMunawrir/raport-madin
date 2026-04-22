import { db } from "../index";
import { students, activityLogs, studentClassrooms, classrooms, dormitories } from "../schema";
import { desc, eq } from "drizzle-orm";

export async function getStudents() {
  return await db.select().from(students).orderBy(desc(students.createdAt));
}

export async function getStudentsWithClass(teacherId?: string) {
  const teacherClass = teacherId 
    ? db.select({ id: classrooms.id }).from(classrooms).where(eq(classrooms.teacherId, teacherId))
    : null;

  const query = db
    .select({
      id: students.id,
      nis: students.nis,
      nisn: students.nisn,
      name: students.name,
      gender: students.gender,
      status: students.status,
      createdAt: students.createdAt,
      className: classrooms.name,
      dormitoryName: dormitories.name,
      roomCode: students.roomCode,
    })
    .from(students)
    .leftJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
    .leftJoin(classrooms, eq(studentClassrooms.classroomId, classrooms.id))
    .leftJoin(dormitories, eq(students.dormitoryId, dormitories.id))
    .where(
        teacherId && teacherClass
            ? eq(studentClassrooms.classroomId, teacherClass)
            : undefined
    );

  return await query.orderBy(desc(students.createdAt));
}

export async function getStudentById(id: string) {
  const result = await db
    .select({
      id: students.id,
      nis: students.nis,
      nisn: students.nisn,
      name: students.name,
      gender: students.gender,
      birthPlace: students.birthPlace,
      birthDate: students.birthDate,
      address: students.address,
      province: students.province,
      regency: students.regency,
      district: students.district,
      village: students.village,
      parentName: students.parentName,
      phone: students.phone,
      dormitoryId: students.dormitoryId,
      status: students.status,
      classroomId: studentClassrooms.classroomId,
      className: classrooms.name,
      dormitoryName: dormitories.name,
      roomCode: students.roomCode,
    })
    .from(students)
    .leftJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
    .leftJoin(classrooms, eq(studentClassrooms.classroomId, classrooms.id))
    .leftJoin(dormitories, eq(students.dormitoryId, dormitories.id))
    .where(eq(students.id, id))
    .limit(1);
    
  return result[0];
}

export async function addStudent(data: { 
  nis: string;
  nisn?: string;
  name: string;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  parentName?: string;
  phone?: string;
  dormitoryId?: string;
  roomCode?: string;
  status?: string;
}) {
  const result = await db.insert(students).values({
    ...data,
    status: data.status || 'Aktif',
  }).returning({ insertedId: students.id });

  await db.insert(activityLogs).values({
    title: 'Penerimaan Santri Baru',
    description: `Santri ${data.name} (NIS: ${data.nis}) telah didaftarkan ke sistem.`,
    type: 'success',
    module: 'Santri',
  });

  return result[0];
}

export async function updateStudent(id: string, data: Partial<typeof students.$inferInsert>) {
  await db.update(students)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(students.id, id));

  await db.insert(activityLogs).values({
    title: 'Update Data Santri',
    description: `Profil santri dengan ID ${id} telah diperbarui.`,
    type: 'info',
    module: 'Santri',
  });
}

export async function deleteStudent(id: string) {
  const target = await db.select().from(students).where(eq(students.id, id)).limit(1);
  const info = target[0];

  if (info) {
    await db.delete(students).where(eq(students.id, id));
    
    await db.insert(activityLogs).values({
      title: 'Hapus Data Santri',
      description: `Data santri ${info.name} (NIS: ${info.nis}) telah dihapus dari sistem.`,
      type: 'warning',
      module: 'Santri',
    });
  }
}
