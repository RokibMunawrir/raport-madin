import type { APIRoute } from "astro";
import { updateUserRoleAndTeacher } from "../../../db/queries/users";

export const PATCH: APIRoute = async ({ params, request }) => {
    const id = params.id;
    if (!id) return new Response(null, { status: 400 });

    try {
        const body = await request.json();
        const { role, teacherId } = body;

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
