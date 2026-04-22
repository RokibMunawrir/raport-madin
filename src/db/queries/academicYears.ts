import { db } from "../index";
import { academicYears, activityLogs } from "../schema";
import { desc, eq } from "drizzle-orm";

export async function getAcademicYears() {
  return await db.select().from(academicYears).orderBy(desc(academicYears.createdAt));
}

export async function addAcademicYear(data: { name: string; semester: "Ganjil" | "Genap"; isActive: number; description?: string }) {
  if (data.isActive === 1) {
    await db.update(academicYears).set({ isActive: 0 });
  }

  await db.insert(academicYears).values({
    name: data.name,
    semester: data.semester,
    isActive: data.isActive,
  });

  await db.insert(activityLogs).values({
    title: 'Tambah Tahun Ajaran Baru',
    description: `Tahun Ajaran ${data.name} Semester ${data.semester} ditambahkan.`,
    type: 'success',
    module: 'Akademik',
  });
}

export async function updateAcademicYear(id: string, data: { name: string; semester: "Ganjil" | "Genap"; isActive: number; description?: string }) {
  if (data.isActive === 1) {
    await db.update(academicYears).set({ isActive: 0 });
  }

  await db.update(academicYears)
    .set({
      name: data.name,
      semester: data.semester,
      isActive: data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(academicYears.id, id));

  await db.insert(activityLogs).values({
    title: 'Update Tahun Ajaran',
    description: `Data Tahun Ajaran ${data.name} Semester ${data.semester} telah diperbarui.`,
    type: 'info',
    module: 'Akademik',
  });
}

export async function deleteAcademicYear(id: string) {
  const target = await db.select().from(academicYears).where(eq(academicYears.id, id)).limit(1);
  const info = target[0];

  if (info) {
    await db.delete(academicYears).where(eq(academicYears.id, id));
    
    await db.insert(activityLogs).values({
      title: 'Hapus Tahun Ajaran',
      description: `Data Tahun Ajaran ${info.name} Semester ${info.semester} telah dihapus.`,
      type: 'warning',
      module: 'Akademik',
    });
  }
}
