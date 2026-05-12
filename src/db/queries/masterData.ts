import { db } from "../index";
import { 
  subjects, 
  classrooms, 
  dormitories, 
  memorizeTargets, 
  teachingAssignments, 
  activityLogs,
  studentClassrooms
} from "../schema";
import { eq, and } from "drizzle-orm";

// --- SUBJECTS ---

export async function addSubject(data: typeof subjects.$inferInsert) {
  const result = await db.insert(subjects).values(data).returning({ id: subjects.id });
  await db.insert(activityLogs).values({
    title: 'Tambah Mata Pelajaran',
    description: `Mata pelajaran "${data.name}" (${data.code}) telah ditambahkan.`,
    type: 'success',
    module: 'Akademik',
  });
  return result[0];
}

export async function updateSubject(id: string, data: Partial<typeof subjects.$inferInsert>) {
  await db.update(subjects).set({ ...data, updatedAt: new Date() }).where(eq(subjects.id, id));
  await db.insert(activityLogs).values({
    title: 'Update Mata Pelajaran',
    description: `Data mata pelajaran "${data.name || id}" telah diperbarui.`,
    type: 'info',
    module: 'Akademik',
  });
}

export async function deleteSubject(id: string) {
  const target = await db.select().from(subjects).where(eq(subjects.id, id)).limit(1);
  if (target[0]) {
    await db.delete(subjects).where(eq(subjects.id, id));
    await db.insert(activityLogs).values({
      title: 'Hapus Mata Pelajaran',
      description: `Mata pelajaran "${target[0].name}" telah dihapus.`,
      type: 'warning',
      module: 'Akademik',
    });
  }
}

// --- CLASSROOMS ---

export async function addClassroom(data: typeof classrooms.$inferInsert) {
  const result = await db.insert(classrooms).values(data).returning({ id: classrooms.id });
  await db.insert(activityLogs).values({
    title: 'Tambah Kelas',
    description: `Kelas baru "${data.name}" (Level: ${data.level}) telah dibuat.`,
    type: 'success',
    module: 'Akademik',
  });
  return result[0];
}

export async function updateClassroom(id: string, data: Partial<typeof classrooms.$inferInsert>) {
  await db.update(classrooms).set({ ...data, updatedAt: new Date() }).where(eq(classrooms.id, id));
  await db.insert(activityLogs).values({
    title: 'Update Data Kelas',
    description: `Informasi kelas "${data.name || id}" telah diperbarui.`,
    type: 'info',
    module: 'Akademik',
  });
}

export async function deleteClassroom(id: string) {
  const target = await db.select().from(classrooms).where(eq(classrooms.id, id)).limit(1);
  if (target[0]) {
    await db.delete(classrooms).where(eq(classrooms.id, id));
    await db.insert(activityLogs).values({
      title: 'Hapus Kelas',
      description: `Kelas "${target[0].name}" telah dihapus dari sistem.`,
      type: 'warning',
      module: 'Akademik',
    });
  }
}

// --- DORMITORIES ---

export async function addDormitory(data: typeof dormitories.$inferInsert) {
  const result = await db.insert(dormitories).values(data).returning({ id: dormitories.id });
  await db.insert(activityLogs).values({
    title: 'Tambah Asrama',
    description: `Asrama "${data.name}" (${data.block}) telah ditambahkan.`,
    type: 'success',
    module: 'Santri',
  });
  return result[0];
}

export async function updateDormitory(id: string, data: Partial<typeof dormitories.$inferInsert>) {
  await db.update(dormitories).set({ ...data, updatedAt: new Date() }).where(eq(dormitories.id, id));
  await db.insert(activityLogs).values({
    title: 'Update Data Asrama',
    description: `Informasi asrama "${data.name || id}" telah diperbarui.`,
    type: 'info',
    module: 'Santri',
  });
}

export async function deleteDormitory(id: string) {
  const target = await db.select().from(dormitories).where(eq(dormitories.id, id)).limit(1);
  if (target[0]) {
    await db.delete(dormitories).where(eq(dormitories.id, id));
    await db.insert(activityLogs).values({
      title: 'Hapus Asrama',
      description: `Asrama "${target[0].name}" telah dihapus.`,
      type: 'warning',
      module: 'Santri',
    });
  }
}

// --- MEMORIZE TARGETS ---

export async function addMemorizeTarget(data: typeof memorizeTargets.$inferInsert) {
  const result = await db.insert(memorizeTargets).values(data).returning({ id: memorizeTargets.id });
  await db.insert(activityLogs).values({
    title: 'Tambah Target Hafalan',
    description: `Target hafalan "${data.title}" (${data.category}) telah ditambahkan.`,
    type: 'success',
    module: 'Akademik',
  });
  return result[0];
}

export async function updateMemorizeTarget(id: string, data: Partial<typeof memorizeTargets.$inferInsert>) {
  await db.update(memorizeTargets).set({ ...data, updatedAt: new Date() }).where(eq(memorizeTargets.id, id));
  await db.insert(activityLogs).values({
    title: 'Update Target Hafalan',
    description: `Data target hafalan "${data.title || id}" telah diperbarui.`,
    type: 'info',
    module: 'Akademik',
  });
}

export async function deleteMemorizeTarget(id: string) {
  const target = await db.select().from(memorizeTargets).where(eq(memorizeTargets.id, id)).limit(1);
  if (target[0]) {
    await db.delete(memorizeTargets).where(eq(memorizeTargets.id, id));
    await db.insert(activityLogs).values({
      title: 'Hapus Target Hafalan',
      description: `Target hafalan "${target[0].title}" telah dihapus.`,
      type: 'warning',
      module: 'Akademik',
    });
  }
}

// --- TEACHING ASSIGNMENTS ---

export async function addTeachingAssignment(data: typeof teachingAssignments.$inferInsert) {
  const result = await db.insert(teachingAssignments).values(data).returning({ id: teachingAssignments.id });
  await db.insert(activityLogs).values({
    title: 'Tambah Penugasan Mengajar',
    description: `Penugasan baru telah dibuat untuk pengajar di kelas.`,
    type: 'success',
    module: 'Akademik',
  });
  return result[0];
}

export async function addBulkTeachingAssignments(data: (typeof teachingAssignments.$inferInsert)[]) {
  const result = await db.insert(teachingAssignments).values(data).returning({ id: teachingAssignments.id });
  await db.insert(activityLogs).values({
    title: 'Tambah Penugasan Mengajar (Bulk)',
    description: `${data.length} penugasan baru telah dibuat.`,
    type: 'success',
    module: 'Akademik',
  });
  return result;
}

export async function updateTeachingAssignment(id: string, data: Partial<typeof teachingAssignments.$inferInsert>) {
    await db.update(teachingAssignments).set({ ...data, updatedAt: new Date() }).where(eq(teachingAssignments.id, id));
    await db.insert(activityLogs).values({
      title: 'Update Penugasan Mengajar',
      description: `Penugasan mengajar telah diperbarui.`,
      type: 'info',
      module: 'Akademik',
    });
}

export async function deleteTeachingAssignment(id: string) {
  await db.delete(teachingAssignments).where(eq(teachingAssignments.id, id));
  await db.insert(activityLogs).values({
    title: 'Hapus Penugasan Mengajar',
    description: `Penugasan mengajar telah dihapus dari sistem.`,
    type: 'warning',
    module: 'Akademik',
  });
}

// --- CLASS PLACEMENT (STUDENT CLASSROOMS) ---

export async function addStudentPlacement(data: typeof studentClassrooms.$inferInsert) {
  const result = await db.insert(studentClassrooms).values(data).returning({ id: studentClassrooms.id });
  await db.insert(activityLogs).values({
    title: 'Penempatan Kelas Santri',
    description: `Santri telah ditempatkan ke kelas untuk tahun ajaran terkait.`,
    type: 'success',
    module: 'Akademik',
  });
  return result[0];
}

export async function updateStudentPlacement(id: string, data: Partial<typeof studentClassrooms.$inferInsert>) {
    await db.update(studentClassrooms).set(data).where(eq(studentClassrooms.id, id));
    await db.insert(activityLogs).values({
      title: 'Update Penempatan Kelas',
      description: `Data penempatan kelas santri telah diperbarui.`,
      type: 'info',
      module: 'Akademik',
    });
}

export async function deleteStudentPlacement(id: string) {
    await db.delete(studentClassrooms).where(eq(studentClassrooms.id, id));
    await db.insert(activityLogs).values({
      title: 'Hapus Penempatan Kelas',
      description: `Data penempatan kelas santri telah dihapus.`,
      type: 'warning',
      module: 'Akademik',
    });
}
