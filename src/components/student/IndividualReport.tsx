import React from 'react';
import { spellNumber } from '../../utils/terbilang';

interface ReportData {
  student: any;
  academicYear: any;
  classroom: any;
  scores: any[];
  attendance: {
    sakit: number;
    izin: number;
    alpha: number;
  };
  note: string;
  achievements: any[];
  headmaster: any;
}

interface IndividualReportProps {
  data: ReportData;
}

const IndividualReport: React.FC<IndividualReportProps> = ({ data }) => {
  const { student, academicYear, classroom, scores, attendance, note, achievements, headmaster } = data;

  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
  };

  const getKetercapaian = (score: number) => {
    return score >= 70 ? 'Tuntas' : 'Belum Tuntas';
  };

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div id="individual-report" className="hidden print:block bg-white text-black p-[10mm] font-serif text-[11pt] leading-tight min-h-screen">
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          #individual-report {
            display: block !important;
            width: 210mm;
            height: 297mm;
            box-sizing: border-box;
          }
        }
      `}</style>
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold uppercase underline">Laporan Hasil Belajar Sementara</h1>
        <p className="text-base font-bold">(Raport Madin)</p>
      </div>

      {/* Student Meta Info */}
      <div className="grid grid-cols-2 gap-x-12 mb-4 text-[10pt]">
        <div className="space-y-1">
          <div className="flex">
            <span className="w-40">Nama Peserta Didik</span>
            <span className="mr-2">:</span>
            <span className="font-bold uppercase">{student.name}</span>
          </div>
          <div className="flex">
            <span className="w-40">Nomor Induk</span>
            <span className="mr-2">:</span>
            <span>{student.nis}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex">
            <span className="w-40">Kelas / Semester</span>
            <span className="mr-2">:</span>
            <span>{classroom?.className || '-'} / {academicYear.semester === 'Ganjil' ? '1 (satu)' : '2 (dua)'}</span>
          </div>
          <div className="flex">
            <span className="w-40">Tahun Pelajaran</span>
            <span className="mr-2">:</span>
            <span>{academicYear.name}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse border-2 border-black mb-3 text-[9.5pt]">
        <thead>
          <tr>
            <th rowSpan={3} className="border-2 border-black px-1 py-1 w-8 text-center">No</th>
            <th rowSpan={3} className="border-2 border-black px-2 py-1 text-center">Komponen</th>
            <th rowSpan={3} className="border-2 border-black px-1 py-1 w-12 text-center">KKM</th>
            <th colSpan={5} className="border-2 border-black px-2 py-1 text-center uppercase tracking-wider">Nilai Hasil Belajar</th>
            <th rowSpan={3} className="border-2 border-black px-1 py-1 w-24 text-center">Ketercapaian</th>
          </tr>
          <tr>
            <th colSpan={2} className="border-2 border-black px-2 py-1 text-center">Pengetahuan</th>
            <th colSpan={2} className="border-2 border-black px-2 py-1 text-center">Praktek</th>
            <th rowSpan={2} className="border-2 border-black px-1 py-1 w-14 text-center">Sikap Predikat</th>
          </tr>
          <tr>
            <th className="border-2 border-black px-1 py-1 w-14 text-center italic">Angka</th>
            <th className="border-2 border-black px-2 py-1 text-center italic">Huruf</th>
            <th className="border-2 border-black px-1 py-1 w-14 text-center italic">Angka</th>
            <th className="border-2 border-black px-2 py-1 text-center italic">Huruf</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, index) => (
            <tr key={s.id}>
              <td className="border-2 border-black px-1 py-1.5 text-center">{index + 1}</td>
              <td className="border-2 border-black px-2 py-1.5 font-medium">{s.subjectName}</td>
              <td className="border-2 border-black px-1 py-1.5 text-center">75</td>
              <td className="border-2 border-black px-1 py-1.5 text-center font-bold">{s.harian}</td>
              <td className="border-2 border-black px-2 py-1.5 text-[9pt] leading-none capitalize">{spellNumber(s.harian)}</td>
              <td className="border-2 border-black px-1 py-1.5 text-center">{s.semester}</td>
              <td className="border-2 border-black px-2 py-1.5 text-[9pt] leading-none capitalize">{spellNumber(s.semester)}</td>
              <td className="border-2 border-black px-1 py-1.5 text-center font-bold">{getGrade((s.harian + s.semester) / 2)}</td>
              <td className="border-2 border-black px-1 py-1.5 text-center text-[9pt]">{getKetercapaian((s.harian + s.semester) / 2)}</td>
            </tr>
          ))}
          {/* Fill rows if less than 8 to save space */}
          {Array.from({ length: Math.max(0, 8 - scores.length) }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td className="border-2 border-black px-1 py-1.5 text-center">{scores.length + i + 1}</td>
              <td className="border-2 border-black px-2 py-1.5"></td>
              <td className="border-2 border-black px-1 py-1.5 text-center"></td>
              <td className="border-2 border-black px-1 py-1.5 text-center"></td>
              <td className="border-2 border-black px-2 py-1.5 text-center"></td>
              <td className="border-2 border-black px-1 py-1.5 text-center"></td>
              <td className="border-2 border-black px-2 py-1.5 text-center"></td>
              <td className="border-2 border-black px-1 py-1.5 text-center"></td>
              <td className="border-2 border-black px-1 py-1.5 text-center"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Section: Prestasi */}
      <p className="font-bold underline mb-1">Prestasi</p>
      <table className="w-full border-collapse border-2 border-black mb-3 text-[9.5pt]">
        <thead>
          <tr className="bg-slate-50">
            <th className="border-2 border-black px-2 py-1 w-12 text-center">No</th>
            <th className="border-2 border-black px-3 py-1 text-center">Jenis Prestasi</th>
            <th className="border-2 border-black px-3 py-1 text-center">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {achievements.length > 0 ? achievements.map((a, i) => (
            <tr key={a.id}>
              <td className="border-2 border-black px-2 py-2 text-center">{i + 1}</td>
              <td className="border-2 border-black px-3 py-2 font-medium">{a.title}</td>
              <td className="border-2 border-black px-3 py-2">{a.rank} {a.level}</td>
            </tr>
          )) : (
            <>
              <tr>
                <td className="border-2 border-black px-2 py-2 text-center">1</td>
                <td className="border-2 border-black px-3 py-2"></td>
                <td className="border-2 border-black px-3 py-2"></td>
              </tr>
              <tr>
                <td className="border-2 border-black px-2 py-2 text-center">2</td>
                <td className="border-2 border-black px-3 py-2"></td>
                <td className="border-2 border-black px-3 py-2"></td>
              </tr>
            </>
          )}
        </tbody>
      </table>


      {/* Section: Ketidakhadiran */}
      <p className="font-bold underline mb-1">Ketidakhadiran</p>
      <table className="w-full border-collapse border-2 border-black mb-3 text-[9.5pt]">
        <thead>
          <tr className="bg-slate-50">
            <th className="border-2 border-black px-2 py-1 w-12 text-center">No</th>
            <th className="border-2 border-black px-4 py-1 text-left">Alasan Ketidakhadiran</th>
            <th className="border-2 border-black px-4 py-1 w-40 text-center">Frekwensi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-2 border-black px-2 py-1 text-center">1</td>
            <td className="border-2 border-black px-4 py-1">Sakit</td>
            <td className="border-2 border-black px-4 py-1 text-center font-bold">{attendance.sakit} Hari</td>
          </tr>
          <tr>
            <td className="border-2 border-black px-2 py-1 text-center">2</td>
            <td className="border-2 border-black px-4 py-1">Izin</td>
            <td className="border-2 border-black px-4 py-1 text-center font-bold">{attendance.izin} Hari</td>
          </tr>
          <tr>
            <td className="border-2 border-black px-2 py-1 text-center">3</td>
            <td className="border-2 border-black px-4 py-1">Tanpa Keterangan</td>
            <td className="border-2 border-black px-4 py-1 text-center font-bold">{attendance.alpha} Hari</td>
          </tr>
        </tbody>
      </table>

      {/* Section: Catatan Wali Kelas */}
      <div className="border-2 border-black p-2 mb-6 text-[9.5pt]">
        <p className="font-bold mb-1">Catatan Wali Kelas / Mustahiq</p>
        <div className="border border-black p-2 min-h-[60px] italic leading-relaxed">
          {note || '................................................................................................................................................................................................................................................................................................................................'}
        </div>
      </div>

      {/* Section: Signatures */}
      <div className="grid grid-cols-2 text-center text-[10pt] mb-6">
        <div className="space-y-24">
          <p>Orang Tua/Wali Peserta Didik</p>
          <div className="flex flex-col items-center">
            <p className="font-bold uppercase">( {student.parentName || '...................................'} )</p>
          </div>
        </div>
        <div className="space-y-24">
          <div>
            <p>Raha, {today}</p>
            <p className="font-bold">Wali Kelas</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold underline uppercase">{classroom?.teacherName || '...................................'}</p>
            <p>NIP. {classroom?.teacherNip || '...................................'}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default IndividualReport;
