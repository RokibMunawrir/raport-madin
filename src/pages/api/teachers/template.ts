import type { APIRoute } from 'astro';
import * as xlsx from 'xlsx';

export const GET: APIRoute = async () => {
  try {
    const headers = [
      'Nama Lengkap (Wajib)',
      'NIP',
      'Jenis Kelamin (Laki-laki/Perempuan)',
      'No. Telepon',
      'Email',
      'Alamat',
      'Desa/Kelurahan',
      'Kecamatan',
      'Kabupaten/Kota',
      'Provinsi',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Status (Aktif/Cuti/Non-Aktif)',
      'Mulai Bertugas (YYYY-MM-DD)'
    ];

    const exampleRow = [
      'Ust. Ahmad Fauzi, M.Pd.',
      '198501012010011001',
      'Laki-laki',
      '081234567890',
      'ahmad.fauzi@madin.ac.id',
      'Jl. Kebon Jeruk No. 12',
      'Karangmulyo',
      'Tegalsari',
      'Banyuwangi',
      'Jawa Timur',
      'Semarang',
      '1985-01-01',
      'Aktif',
      '2010-01-01'
    ];

    const worksheet = xlsx.utils.aoa_to_sheet([headers, exampleRow]);
    
    const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
    worksheet['!cols'] = colWidths;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Data Asatidz');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template_import_asatidz.xlsx"',
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
