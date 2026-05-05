import type { APIRoute } from 'astro';
import * as xlsx from 'xlsx';
import { db } from '../../../db';
import { teachers } from '../../../db/schema';
import { desc, eq, and, or, like } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const search = url.searchParams.get("search") || "";
    const statusFilter = url.searchParams.get("status") || "All";

    const filters = [];
    if (search) {
      filters.push(or(
        like(teachers.name, `%${search}%`),
        like(teachers.nip, `%${search}%`)
      ));
    }
    if (statusFilter !== 'All') {
      filters.push(eq(teachers.status, statusFilter));
    }

    const filterQuery = filters.length > 0 ? and(...filters) : undefined;

    // 1. Fetch teachers with filters
    const data = await db
      .select()
      .from(teachers)
      .where(filterQuery)
      .orderBy(desc(teachers.createdAt));

    // 2. Map data for Excel
    const rows = data.map(t => ({
      'Nama': t.name,
      'NIP': t.nip || '-',
      'Gender': t.gender || '-',
      'Telepon': t.phone || '-',
      'Email': t.email || '-',
      'Alamat': t.address || '-',
      'Tempat Lahir': t.birthPlace || '-',
      'Tanggal Lahir': t.birthDate || '-',
      'Status': t.status || '-',
      'Mulai Bertugas': t.joinedDate || '-'
    }));

    // 3. Create worksheet
    const worksheet = xlsx.utils.json_to_sheet(rows);
    
    // Set column widths
    const headers = Object.keys(rows[0] || {});
    const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
    worksheet['!cols'] = colWidths;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Data Asatidz');

    // 4. Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 5. Return file
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="data_asatidz_export.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error exporting teachers:', error);
    return new Response(JSON.stringify({ error: 'Gagal mengekspor data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
