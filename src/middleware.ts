import { auth } from "./lib/auth";
import { defineMiddleware } from "astro:middleware";
import { db } from "./db";
import { classrooms } from "./db/schema";
import { eq } from "drizzle-orm";

export const onRequest = defineMiddleware(async (context, next) => {
    // 1. Define Public Routes
    const publicRoutes = ["/login", "/register", "/api/auth", "/guidelines"];
    const isPublicRoute = publicRoutes.some(route => context.url.pathname.startsWith(route));

    // 2. Try to get real session
    const isAuthed = await auth.api
        .getSession({
            headers: context.request.headers,
        });

    if (isAuthed) {
        // Real Session logic
        const user = isAuthed.user as any;
        let classroomName = null;

        if (user.role === 'Guru' && user.teacherId) {
            const [classroom] = await db.select({ name: classrooms.name })
                .from(classrooms)
                .where(eq(classrooms.teacherId, user.teacherId))
                .limit(1);
            
            if (classroom) {
                classroomName = classroom.name;
            }
        }

        context.locals.user = {
            ...user,
            classroomName
        };
        context.locals.session = isAuthed.session;
    } else {
        // Force redirect to login if not a public route
        if (!isPublicRoute && context.url.pathname !== "/") {
            return context.redirect("/login");
        }
        
        context.locals.user = null;
        context.locals.session = null;
    }

    return next();
});