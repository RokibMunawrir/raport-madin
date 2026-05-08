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
    const importErrors: { row: number; column: string; message: string }[] = [];

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowIndex = i + 2; // +1 for header, +1 for 1-based indexing in Excel

      const nis = row[0] ? String(row[0]).trim() : null;
      const nama = row[2] ? String(row[2]).trim() : null;
      const gender = row[3] ? String(row[3]).trim() : null;
      const status = row[14] ? String(row[14]).trim() : 'Aktif';

      // Validation
      if (!nis) {
        importErrors.push({ row: rowIndex, column: 'NIS', message: 'NIS wajib diisi' });
      }
      if (!nama) {
        importErrors.push({ row: rowIndex, column: 'Nama Lengkap', message: 'Nama Lengkap wajib diisi' });
      }
      if (gender && !['Laki-laki', 'Perempuan'].includes(gender)) {
        importErrors.push({ row: rowIndex, column: 'Jenis Kelamin', message: 'Gunakan "Laki-laki" atau "Perempuan"' });
      }
      if (status && !['Aktif', 'Alumni', 'Drop Out', 'Keluar'].includes(status)) {
        importErrors.push({ row: rowIndex, column: 'Status', message: 'Status tidak valid' });
      }

      // Date validation
      let birthDateObj = null;
      if (row[5]) {
         const dateString = String(row[5]).trim();
         if (!isNaN(Date.parse(dateString))) {
           birthDateObj = new Date(dateString).toISOString().split('T')[0];
         } else {
           importErrors.push({ row: rowIndex, column: 'Tanggal Lahir', message: 'Format tanggal salah (YYYY-MM-DD)' });
         }
      }

      // If we already have too many errors, stop collecting to prevent huge response
      if (importErrors.length >= 20) break;

      // Only add to insert list if there are no errors for this row
      const hasRowError = importErrors.some(e => e.row === rowIndex);
      if (!hasRowError && nis && nama) {
        studentsToInsert.push({
          id: nanoid(),
          nis: nis,
          nisn: row[1] ? String(row[1]).trim() : null,
          name: nama,
          gender: gender,
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
          status: status,
        });
      }
    }

    if (importErrors.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Terdapat kesalahan pada data Excel Anda', 
        details: importErrors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (studentsToInsert.length === 0) {
      return new Response(JSON.stringify({ error: 'Tidak ada data valid yang bisa diimport.' }), {
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
      message: `Import berhasil! ${successCount} data ditambahkan, ${skipCount} data dilewati (duplikat).`,
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
