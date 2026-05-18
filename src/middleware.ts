import { auth } from "./lib/auth";
import { defineMiddleware } from "astro:middleware";
import { db } from "./db";
import { classrooms } from "./db/schema";
import { eq } from "drizzle-orm";

export const onRequest = defineMiddleware(async (context, next) => {
    // 1. Define Public Routes
    const publicRoutes = ["/login", "/register", "/api/auth", "/guidelines", "/api/public"];
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

    // 3. Role-Based Authorization Guard
    if (context.locals.user) {
        const user = context.locals.user;
        const role = user.role;
        const pathname = context.url.pathname;

        const isForbidden = 
            // Staff & Guru cannot access master data pages/APIs (except general student searches)
            ((role === 'Guru' || role === 'Staf' || role === 'Staff') && (pathname.startsWith('/master-data') || pathname.startsWith('/api/teachers') || (pathname.startsWith('/api/students') && !pathname.startsWith('/api/students/search')))) ||
            // Guru cannot access presence-asatidz
            (role === 'Guru' && (pathname.startsWith('/presence-asatidz') || pathname.startsWith('/api/presence-asatidz'))) ||
            // Administrator cannot access user pages/APIs
            (role === 'Administrator' && (pathname.startsWith('/master-data/user') || pathname.startsWith('/api/users')));

        if (isForbidden) {
            if (pathname.startsWith('/api/')) {
                return new Response(JSON.stringify({ error: 'Akses Ditolak (Forbidden)' }), { 
                    status: 403, 
                    headers: { 'Content-Type': 'application/json' } 
                });
            }
            return context.redirect('/dashboard');
        }
    }

    return next();
});