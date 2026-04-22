import type { APIRoute } from 'astro';
import * as xlsx from 'xlsx';
import { db } from '../../../db';
import { students, activityLogs } from '../../../db/schema';
import { nanoid } from 'nanoid';
// we shouldn't fail if drizzle hasn't loaded fully, but import works
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'Tidak ada file yang diunggah' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Read the file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse Excel workbook
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    // header: 1 means give us a 2D array, we'll map custom column headers
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (!rawData || rawData.length <= 1) {
       return new Response(JSON.stringify({ error: 'Data kosong atau format salah' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // The first row is the header
    const dataRows = rawData.slice(1);
    const studentsToInsert: any[] = [];

    let successCount = 0;
    let skipCount = 0;

    for (const row of dataRows) {
      // Mapping based on template generating
      // [0] 'NIS (Wajib)'
      // [1] 'NISN'
      // [2] 'Nama Lengkap (Wajib)'
      // [3] 'Jenis Kelamin (Laki-laki/Perempuan)'
      // [4] 'Tempat Lahir'
      // [5] 'Tanggal Lahir (YYYY-MM-DD)'
      // [6] 'Nomor HP Wali'
      // [7] 'Nama Wali'
      // [8] 'Alamat'
      // [9] 'Desa/Kelurahan'
      // [10] 'Kecamatan'
      // [11] 'Kabupaten/Kota'
      // [12] 'Provinsi'
      // [13] 'Kode Kamar Asrama'
      // [14] 'Status (Aktif/Alumni/Keluar)'

      const nis = row[0] ? String(row[0]).trim() : null;
      const nama = row[2] ? String(row[2]).trim() : null;

      if (!nis || !nama) {
        // Skip invalid rows
        continue;
      }

      // Prepare date if exists
      let birthDateObj = null;
      if (row[5]) {
         const dateString = String(row[5]).trim();
         // Basic validation if it looks like a date
         if (!isNaN(Date.parse(dateString))) {
           // We just want YYYY-MM-DD string for DB
           birthDateObj = new Date(dateString).toISOString().split('T')[0];
         }
      }

      studentsToInsert.push({
        id: nanoid(),
        nis: nis,
        nisn: row[1] ? String(row[1]).trim() : null,
        name: nama,
        gender: row[3] ? String(row[3]).trim() : null,
        birthPlace: row[4] ? String(row[4]).trim() : null,
        birthDate: birthDateObj,
        phone: row[6] ? String(row[6]).trim() : null,
        parentName: row[7] ? String(row[7]).trim() : null,
        address: row[8] ? String(row[8]).trim() : null,
        village: row[9] ? String(row[9]).trim() : null,
        district: row[10] ? String(row[10]).trim() : null,
        regency: row[11] ? String(row[11]).trim() : null,
        province: row[12] ? String(row[12]).trim() : null,
        roomCode: row[13] ? String(row[13]).trim() : null,
        status: row[14] ? String(row[14]).trim() : 'Aktif',
      });
    }

    if (studentsToInsert.length === 0) {
      return new Response(JSON.stringify({ error: 'Tidak ada data valid yang bisa diimport. Pastikan NIS dan Nama terisi.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use transaction to ensure safe batch import
    await db.transaction(async (tx) => {
      // Insert in chunks or all at once depending on size
      // onConflictDoNothing prevents error if NIS already exists
      const inserted = await tx.insert(students)
        .values(studentsToInsert)
        .onConflictDoNothing({ target: students.nis })
        .returning({ id: students.id });
      
      successCount = inserted.length;
      skipCount = studentsToInsert.length - successCount;

      // Log the activity
      if (successCount > 0) {
        await tx.insert(activityLogs).values({
          title: 'Import Data Santri',
          description: `Berhasil import ${successCount} data santri dari Excel. (${skipCount} dilewati karena duplicate)`,
          type: 'success',
          module: 'Sistem'
        });
      }
    });

    return new Response(JSON.stringify({ 
      message: `Import selesai. ${successCount} data berhasil, ${skipCount} data diskip (duplikat).`,
      successCount,
      skipCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Terjadi kesalahan sistem' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
