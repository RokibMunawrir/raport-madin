import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { students, classrooms, studentClassrooms, dormitories } from '../../../db/schema';
import { count, eq, like, and, desc, asc, or } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const search = url.searchParams.get("search") || "";
    const statusFilter = url.searchParams.get("status") || "All";
    const genderFilter = url.searchParams.get("gender") || "All";
    const classFilter = url.searchParams.get("class") || "All";
    const page = parseInt(url.searchParams.get("page") || "1");
    const sortBy = url.searchParams.get("sortBy") || "name";
    const sortOrder = url.searchParams.get("sortOrder") || "asc";
    const limit = 10;
    const offset = (page - 1) * limit;

    const filters = [];
    if (search) {
      filters.push(or(
        like(students.name, `%${search}%`),
        like(students.nis, `%${search}%`)
      ));
    }
    if (statusFilter && statusFilter !== 'All') {
      filters.push(eq(students.status, statusFilter));
    }
    if (genderFilter && genderFilter !== 'All') {
      filters.push(eq(students.gender, genderFilter));
    }
    if (classFilter && classFilter !== 'All') {
      filters.push(eq(classrooms.name, classFilter));
    }
    
    const filterQuery = filters.length > 0 ? and(...filters) : undefined;

    // Fetch Total Count
    const totalCountResult = await db
      .select({ total: count() })
      .from(students)
      .leftJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
      .leftJoin(classrooms, eq(studentClassrooms.classroomId, classrooms.id))
      .where(filterQuery);

    const totalCount = totalCountResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch Students
    const query = db
      .select({
        id: students.id,
        nis: students.nis,
        name: students.name,
        gender: students.gender,
        parentName: students.parentName,
        phone: students.phone,
        status: students.status,
        address: students.address,
        birthDate: students.birthDate,
        className: classrooms.name,
        dormitoryName: dormitories.name,
      })
      .from(students)
      .leftJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
      .leftJoin(classrooms, eq(studentClassrooms.classroomId, classrooms.id))
      .leftJoin(dormitories, eq(students.dormitoryId, dormitories.id))
      .where(filterQuery);
      
    // If classFilter is active, we apply it to the query result or as a condition
    // In Drizzle with joins, it's better to add to where
    if (classFilter && classFilter !== 'All') {
        // Since where is already defined, we might need to wrap it
        // But for this API, let's keep it simple.
    }

    // Apply Sorting
    let orderBy;
    if (sortBy === 'nis') {
        orderBy = sortOrder === 'asc' ? asc(students.nis) : desc(students.nis);
    } else {
        orderBy = sortOrder === 'asc' ? asc(students.name) : desc(students.name);
    }

    const studentsData = await query
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy);

    const results = studentsData.map(s => ({
      id: s.id,
      nis: s.nis,
      name: s.name,
      gender: s.gender || 'Laki-laki',
      class: s.className || 'Belum Ada Kelas',
      dormitory: s.dormitoryName || 'Belum Ada Asrama',
      parentName: s.parentName || '-',
      phone: s.phone || '-',
      status: s.status || 'Aktif',
      address: s.address || '-',
      birthDate: s.birthDate || '-',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`
    }));

    return new Response(JSON.stringify({
      data: results,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
