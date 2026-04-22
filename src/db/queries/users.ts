import { db } from "../index";
import { user } from "../auth-schema";
import { teachers } from "../schema";
import { desc, eq, sql } from "drizzle-orm";

export async function getUsers() {
    return await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        teacherId: user.teacherId,
        createdAt: user.createdAt,
        teacherName: teachers.name,
    })
    .from(user)
    .leftJoin(teachers, eq(user.teacherId, teachers.id))
    .orderBy(desc(user.createdAt));
}

export async function updateUserRoleAndTeacher(id: string, data: { role: string, teacherId?: string | null }) {
    return await db.update(user)
        .set({
            role: data.role,
            teacherId: data.teacherId === "" ? null : data.teacherId,
            updatedAt: new Date(),
        })
        .where(eq(user.id, id));
}

export async function deleteUser(id: string) {
    return await db.delete(user).where(eq(user.id, id));
}
