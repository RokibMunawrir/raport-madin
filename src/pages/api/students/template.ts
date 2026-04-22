import type { APIRoute } from 'astro';
import * as xlsx from 'xlsx';

export const GET: APIRoute = async () => {
  try {
    // 1. Define columns based on database schema
    const headers = [
      'NIS (Wajib)',
      'NISN',
      'Nama Lengkap (Wajib)',
      'Jenis Kelamin (Laki-laki/Perempuan)',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Nomor HP Wali',
      'Nama Wali',
      'Alamat',
      'Desa/Kelurahan',
      'Kecamatan',
      'Kabupaten/Kota',
      'Provinsi',
      'Kode Kamar Asrama', // e.g. "A.01"
      'Status (Aktif/Alumni/Keluar)'
    ];

    // 2. Add an example row to guide the user
    const exampleRow = [
      '20240001',
      '1234567890',
      'Ahmad Abdullah',
      'Laki-laki',
      'Banyuwangi',
      '2010-05-14',
      '081234567890',
      'Abdullah',
      'Jl. Pesantren No. 1',
      'Karangmulyo',
      'Tegalsari',
      'Banyuwangi',
      'Jawa Timur',
      'A.01',
      'Aktif'
    ];

    // 3. Create worksheet
    const worksheet = xlsx.utils.aoa_to_sheet([headers, exampleRow]);
    
    // Set column widths for better readability
    const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
    worksheet['!cols'] = colWidths;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Data Santri');

    // 4. Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 5. Return Excel file
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template_import_santri.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return new Response(JSON.stringify({ error: 'Gagal membuat template' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
