import type { APIRoute } from 'astro';
import * as xlsx from 'xlsx';
import { db } from '../../../db';
import { teachers, activityLogs } from '../../../db/schema';
import { nanoid } from 'nanoid';

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (!rawData || rawData.length <= 1) {
       return new Response(JSON.stringify({ error: 'Data kosong atau format salah' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dataRows = rawData.slice(1);
    const teachersToInsert: any[] = [];
    const importErrors: { row: number; column: string; message: string }[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowIndex = i + 2;

      const name = row[0] ? String(row[0]).trim() : null;
      const gender = row[2] ? String(row[2]).trim() : null;
      const status = row[12] ? String(row[12]).trim() : 'Aktif';

      if (!name) {
        importErrors.push({ row: rowIndex, column: 'Nama Lengkap', message: 'Nama wajib diisi' });
      }
      if (gender && !['Laki-laki', 'Perempuan'].includes(gender)) {
        importErrors.push({ row: rowIndex, column: 'Jenis Kelamin', message: 'Gunakan "Laki-laki" atau "Perempuan"' });
      }
      if (status && !['Aktif', 'Cuti', 'Non-Aktif'].includes(status)) {
        importErrors.push({ row: rowIndex, column: 'Status', message: 'Status tidak valid' });
      }

      let bDate = null;
      if (row[11]) {
        const ds = String(row[11]).trim();
        if (!isNaN(Date.parse(ds))) {
          bDate = new Date(ds).toISOString().split('T')[0];
        } else {
          importErrors.push({ row: rowIndex, column: 'Tanggal Lahir', message: 'Format tanggal salah (YYYY-MM-DD)' });
        }
      }

      let jDate = null;
      if (row[13]) {
        const ds = String(row[13]).trim();
        if (!isNaN(Date.parse(ds))) {
          jDate = new Date(ds).toISOString().split('T')[0];
        } else {
          importErrors.push({ row: rowIndex, column: 'Tanggal Bergabung', message: 'Format tanggal salah (YYYY-MM-DD)' });
        }
      }

      if (importErrors.length >= 20) break;

      const hasRowError = importErrors.some(e => e.row === rowIndex);
      if (!hasRowError && name) {
        teachersToInsert.push({
          id: nanoid(),
          name: name,
          nip: row[1] ? String(row[1]).trim() : null,
          gender: gender,
          phone: row[3] ? String(row[3]).trim() : null,
          email: row[4] ? String(row[4]).trim() : null,
          address: row[5] ? String(row[5]).trim() : null,
          village: row[6] ? String(row[6]).trim() : null,
          district: row[7] ? String(row[7]).trim() : null,
          regency: row[8] ? String(row[8]).trim() : null,
          province: row[9] ? String(row[9]).trim() : null,
          birthPlace: row[10] ? String(row[10]).trim() : null,
          birthDate: bDate,
          status: status,
          joinedDate: jDate,
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

    if (teachersToInsert.length === 0) {
      return new Response(JSON.stringify({ error: 'Tidak ada data valid yang bisa diimport.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let successCount = 0;

    await db.transaction(async (tx) => {
      const inserted = await tx.insert(teachers)
        .values(teachersToInsert)
        .returning({ id: teachers.id });
      
      successCount = inserted.length;

      if (successCount > 0) {
        await tx.insert(activityLogs).values({
          title: 'Import Data Asatidz',
          description: `Berhasil import ${successCount} data asatidz dari Excel.`,
          type: 'success',
          module: 'Sistem'
        });
      }
    });

    return new Response(JSON.stringify({ 
      message: `Import berhasil! ${successCount} data asatidz telah ditambahkan.`,
      successCount
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
