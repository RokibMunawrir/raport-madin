import type { APIRoute } from 'astro';
import * as xlsx from 'xlsx';
import { db } from '../../../db';
import { students, studentClassrooms, classrooms, dormitories } from '../../../db/schema';
import { eq, and, or, ilike, desc } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
  try {
    const search = url.searchParams.get("search") || "";
    const statusFilter = url.searchParams.get("status") || "All";
    const genderFilter = url.searchParams.get("gender") || "All";
    const classFilter = url.searchParams.get("class") || "All";

    const filters = [];
    if (search) {
      filters.push(or(
        ilike(students.name, `%${search}%`),
        ilike(students.nis, `%${search}%`)
      ));
    }
    if (statusFilter !== 'All') {
      filters.push(eq(students.status, statusFilter));
    }
    if (genderFilter !== 'All') {
      filters.push(eq(students.gender, genderFilter));
    }

    const filterQuery = filters.length > 0 ? and(...filters) : undefined;

    // Fetch data with joins
    const data = await db
      .select({
        nis: students.nis,
        nisn: students.nisn,
        name: students.name,
        gender: students.gender,
        className: classrooms.name,
        dormitoryName: dormitories.name,
        parentName: students.parentName,
        phone: students.phone,
        status: students.status,
        address: students.address,
        village: students.village,
        district: students.district,
        regency: students.regency,
        province: students.province,
        birthPlace: students.birthPlace,
        birthDate: students.birthDate,
      })
      .from(students)
      .leftJoin(studentClassrooms, eq(students.id, studentClassrooms.studentId))
      .leftJoin(classrooms, eq(studentClassrooms.classroomId, classrooms.id))
      .leftJoin(dormitories, eq(students.dormitoryId, dormitories.id))
      .where(filterQuery)
      .orderBy(desc(students.createdAt));

    // Filter by class name if needed (since it's a join field)
    let filteredData = data;
    if (classFilter !== 'All') {
      filteredData = data.filter(s => s.className === classFilter);
    }

    // Map data for Excel
    const rows = filteredData.map(s => ({
      'NIS': s.nis,
      'NISN': s.nisn || '-',
      'Nama Lengkap': s.name,
      'L/P': s.gender === 'Laki-laki' ? 'L' : 'P',
      'Kelas': s.className || '-',
      'Asrama': s.dormitoryName || '-',
      'Nama Wali': s.parentName || '-',
      'No. HP': s.phone || '-',
      'Status': s.status || '-',
      'Tempat Lahir': s.birthPlace || '-',
      'Tanggal Lahir': s.birthDate || '-',
      'Alamat': s.address || '-',
      'Desa/Kelurahan': s.village || '-',
      'Kecamatan': s.district || '-',
      'Kabupaten/Kota': s.regency || '-',
      'Provinsi': s.province || '-',
    }));

    // Create worksheet
    const worksheet = xlsx.utils.json_to_sheet(rows);
    
    // Set column widths
    const headers = Object.keys(rows[0] || {});
    const colWidths = headers.map(h => ({ wch: Math.max(h.length, 12) }));
    worksheet['!cols'] = colWidths;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Data Santri');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="data_santri_export_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting students:', error);
    return new Response(JSON.stringify({ error: 'Gagal mengekspor data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
