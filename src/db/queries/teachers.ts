import { db } from "../index";
import { teachers, activityLogs } from "../schema";
import { desc, eq } from "drizzle-orm";

export async function getTeachers() {
  return await db.select().from(teachers).orderBy(desc(teachers.createdAt));
}

export async function addTeacher(data: { 
  name: string; 
  nip?: string | null; 
  phone?: string | null; 
  email?: string | null; 
  address?: string | null; 
  birthPlace?: string | null; 
  birthDate?: string | null; 
  status?: string | null;
  gender?: string | null;
  joinedDate?: string | null;
  province?: string | null;
  regency?: string | null;
  district?: string | null;
  village?: string | null;
}) {
  const result = await db.insert(teachers).values({
    ...data,
    joinedDate: data.joinedDate ? data.joinedDate : new Date().toISOString().split('T')[0],
  }).returning({ insertedId: teachers.id });

  await db.insert(activityLogs).values({
    title: 'Tambah Pengajar Baru',
    description: `Asatidz ${data.name} telah didaftarkan ke sistem.`,
    type: 'success',
    module: 'Akademik',
  });

  return result[0];
}

export async function updateTeacher(id: string, data: { 
  name: string; 
  nip?: string | null; 
  phone?: string | null; 
  email?: string | null; 
  address?: string | null; 
  birthPlace?: string | null; 
  birthDate?: string | null; 
  status?: string | null;
  gender?: string | null;
  joinedDate?: string | null;
  province?: string | null;
  regency?: string | null;
  district?: string | null;
  village?: string | null;
}) {
  await db.update(teachers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(teachers.id, id));

  await db.insert(activityLogs).values({
    title: 'Update Data Pengajar',
    description: `Profil Asatidz ${data.name} telah diperbarui.`,
    type: 'info',
    module: 'Akademik',
  });
}

export async function deleteTeacher(id: string) {
  const target = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
  const info = target[0];

  if (info) {
    await db.delete(teachers).where(eq(teachers.id, id));
    
    await db.insert(activityLogs).values({
      title: 'Hapus Data Pengajar',
      description: `Data Asatidz ${info.name} telah dihapus dari sistem.`,
      type: 'warning',
      module: 'Akademik',
    });
  }
}
