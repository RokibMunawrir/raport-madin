import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { teachers } from '../../../db/schema';
import { count, eq, ilike, and, desc, asc, or } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const search = url.searchParams.get("search") || "";
    const statusFilter = url.searchParams.get("status") || "All";
    const page = parseInt(url.searchParams.get("page") || "1");
    const sortBy = url.searchParams.get("sortBy") || "name";
    const sortOrder = url.searchParams.get("sortOrder") || "asc";
    const limit = 10;
    const offset = (page - 1) * limit;

    const filters = [];
    if (search) {
      filters.push(or(
        ilike(teachers.name, `%${search}%`),
        ilike(teachers.nip, `%${search}%`)
      ));
    }
    if (statusFilter && statusFilter !== 'All') {
      filters.push(eq(teachers.status, statusFilter));
    }
    
    const filterQuery = filters.length > 0 ? and(...filters) : undefined;

    // Fetch Total Count
    const totalCountResult = await db
      .select({ total: count() })
      .from(teachers)
      .where(filterQuery);

    const totalCount = totalCountResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch Teachers
    const orderColumn = sortBy === 'nip' ? teachers.nip : teachers.name;

    const teachersData = await db
      .select()
      .from(teachers)
      .where(filterQuery)
      .limit(limit)
      .offset(offset)
      .orderBy(sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn));

    const results = teachersData.map(t => ({
      id: t.id,
      name: t.name,
      nip: t.nip || '-',
      gender: t.gender || 'Laki-laki',
      phone: t.phone || '-',
      email: t.email || '-',
      address: t.address || '-',
      birthPlace: t.birthPlace || '-',
      birthDate: t.birthDate || '-',
      status: t.status as any || 'Aktif',
      joinedDate: t.joinedDate || '-',
      province: t.province ?? null,
      regency: t.regency ?? null,
      district: t.district ?? null,
      village: t.village ?? null,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`
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
