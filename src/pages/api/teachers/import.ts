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

    for (const row of dataRows) {
      const name = row[0] ? String(row[0]).trim() : null;

      if (!name) continue;

      let bDate = null;
      if (row[7]) {
        const ds = String(row[7]).trim();
        if (!isNaN(Date.parse(ds))) bDate = new Date(ds).toISOString().split('T')[0];
      }

      let jDate = null;
      if (row[9]) {
        const ds = String(row[9]).trim();
        if (!isNaN(Date.parse(ds))) jDate = new Date(ds).toISOString().split('T')[0];
      }

      teachersToInsert.push({
        id: nanoid(),
        name: name,
        nip: row[1] ? String(row[1]).trim() : null,
        gender: row[2] ? String(row[2]).trim() : null,
        phone: row[3] ? String(row[3]).trim() : null,
        email: row[4] ? String(row[4]).trim() : null,
        address: row[5] ? String(row[5]).trim() : null,
        birthPlace: row[6] ? String(row[6]).trim() : null,
        birthDate: bDate,
        status: row[8] ? String(row[8]).trim() : 'Aktif',
        joinedDate: jDate,
      });
    }

    if (teachersToInsert.length === 0) {
      return new Response(JSON.stringify({ error: 'Tidak ada data valid yang bisa diimport. Pastikan Nama terisi.' }), {
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
      message: `Import selesai. ${successCount} data berhasil diimport.`,
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
