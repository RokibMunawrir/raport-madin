import type { APIRoute } from "astro";
import { getUserById, countSuperAdmins, updateUserRoleAndTeacher, deleteUser } from "../../../db/queries/users";

export const PATCH: APIRoute = async ({ params, request }) => {
    const id = params.id;
    if (!id) return new Response(null, { status: 400 });

    try {
        const body = await request.json();
        const { role, teacherId } = body;

        const targetUser = await getUserById(id);
        if (!targetUser) {
            return new Response(JSON.stringify({ error: "User tidak ditemukan" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Pastikan selalu ada minimal 1 user dengan role super admin saat mengubah role
        if (targetUser.role === 'Super Admin' && role !== 'Super Admin') {
            const superAdminCount = await countSuperAdmins();
            if (superAdminCount <= 1) {
                return new Response(JSON.stringify({ error: "Tidak dapat mengubah role. Harus ada minimal satu Super Admin di sistem." }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        await updateUserRoleAndTeacher(id, { role, teacherId });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error("API Error updating user:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const DELETE: APIRoute = async ({ params }) => {
    const id = params.id;
    if (!id) return new Response(null, { status: 400 });

    try {
        const targetUser = await getUserById(id);
        if (!targetUser) {
            return new Response(JSON.stringify({ error: "User tidak ditemukan" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Pastikan selalu ada minimal 1 user dengan role super admin saat menghapus user
        if (targetUser.role === 'Super Admin') {
            const superAdminCount = await countSuperAdmins();
            if (superAdminCount <= 1) {
                return new Response(JSON.stringify({ error: "Tidak dapat menghapus. Harus ada minimal satu Super Admin di sistem." }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        await deleteUser(id);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error("API Error deleting user:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

