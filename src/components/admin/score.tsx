import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Save, 
  Printer, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen,
  Users,
  Edit3,
  Loader2,
  Calendar
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import { toast } from '../ui/notification';

// --- Types ---
interface SubjectScore {
  harian: number;
  semester: number;
}

interface StudentScore {
  id: string;
  name: string;
  avatar: string;
  nisn: string;
  class: string;
  harian: number;
  semester: number;
  note: string;
}

interface Subject {
  id: string;
  name: string;
}

interface AcademicYear {
  id: string;
  name: string;
  semester: string;
}

interface Classroom {
  id: string;
  name: string;
}

interface ScoreManagementProps {
  initialStudentScores: StudentScore[];
  subjects: Subject[];
  academicYears: AcademicYear[];
  classrooms: Classroom[];
  selectedYearId: string;
  selectedSubjectId: string;
  selectedClassId: string;
  user?: any;
}


// --- Sub-components ---
const StatCard: React.FC<{ label: string; value: string | number; subtext: string; icon: React.ReactNode; colorClass: string; bgColor: string }> = ({ label, value, subtext, icon, colorClass, bgColor }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-md">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} bg-opacity-10 dark:bg-opacity-20 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{value}</h3>
      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{subtext}</p>
    </div>
  </div>
);

const ScoreManagement: React.FC<ScoreManagementProps> = ({ 
    initialStudentScores, 
    subjects, 
    academicYears, 
    classrooms, 
    selectedYearId, 
    selectedSubjectId, 
    selectedClassId,
    user
}) => {

  const [studentScores, setStudentScores] = useState<StudentScore[]>(initialStudentScores);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStudentScores(initialStudentScores);
  }, [initialStudentScores]);

  const handleFilterChange = (yearId: string, subjectId: string, classroomId: string) => {
    window.location.href = `/score?year=${yearId}&subject=${subjectId}&classroom=${classroomId}`;
  };

  // Weighted score calculation (Harian 50%, Semester 50%)
  const calculateFinal = (harian: number, semester: number) => Math.round((harian * 0.5) + (semester * 0.5));

  const getGrade = (score: number) => {
    if (score >= 90) return { label: 'A', color: 'text-emerald-500 bg-emerald-500/10' };
    if (score >= 80) return { label: 'B', color: 'text-indigo-500 bg-indigo-500/10' };
    if (score >= 70) return { label: 'C', color: 'text-amber-500 bg-amber-500/10' };
    return { label: 'D', color: 'text-rose-500 bg-rose-500/10' };
  };

  const handleScoreChange = (id: string, field: 'harian' | 'semester', value: string) => {
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setStudentScores(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: numValue };
      }
      return s;
    }));
  };
  
  const handleNoteChange = (id: string, value: string) => {
    setStudentScores(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, note: value };
      }
      return s;
    }));
  };

  const filteredScores = useMemo(() => {
    return studentScores.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery);
      return matchesSearch;
    });
  }, [studentScores, searchQuery]);

  const stats = useMemo(() => {
    const total = filteredScores.length;
    if (total === 0) return { avg: 0, top: 0, remedial: 0 };
    
    const finalScores = filteredScores.map(s => calculateFinal(s.harian, s.semester));
    const avg = Math.round(finalScores.reduce((acc, curr) => acc + curr, 0) / total);
    const top = Math.max(...finalScores);
    const remedial = finalScores.filter(s => s < 70).length;
    
    return { avg, top, remedial };
  }, [filteredScores]);

  const handleSave = async () => {
    setLoading(true);
    try {
        const response = await fetch('/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                yearId: selectedYearId,
                subjectId: selectedSubjectId,
                data: {
                    scores: studentScores.map(s => ({
                        studentId: s.id,
                        harian: s.harian,
                        semester: s.semester
                    })),
                    notes: studentScores.map(s => ({
                        studentId: s.id,
                        content: s.note
                    }))
                }
            })
        });

        const result = await response.json();
        if (result.success) {
            toast.success('Nilai berhasil disimpan');
        } else {
            toast.error('Gagal menyimpan nilai');
        }
    } catch (error) {
        toast.error('Terjadi kesalahan sistem');
    } finally {
        setLoading(false);
    }
  };

  const currentSubjectName = subjects.find(s => s.id === selectedSubjectId)?.name || 'Mata Pelajaran';
  const currentClassName = classrooms.find(c => c.id === selectedClassId)?.name || 'Kelas';
  const currentYear = academicYears.find(y => y.id === selectedYearId);
  const currentYearLabel = currentYear ? `${currentYear.name} — Semester ${currentYear.semester}` : '-';

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminPanel title="Manajemen Nilai" activeItem="Nilai" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Statistics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Rata-rata Kelas" 
            value={`${stats.avg}`} 
            subtext={`${currentSubjectName} - ${currentClassName}`} 
            icon={<TrendingUp size={24}/>} 
            colorClass="text-indigo-600" 
            bgColor="bg-indigo-600" 
          />
          <StatCard 
            label="Nilai Tertinggi" 
            value={stats.top} 
            subtext="Pencapaian Terbaik" 
            icon={<CheckCircle2 size={24}/>} 
            colorClass="text-emerald-600" 
            bgColor="bg-emerald-600" 
          />
          <StatCard 
            label="Siswa Remedial" 
            value={stats.remedial} 
            subtext="Perlu Bimbingan" 
            icon={<AlertCircle size={24}/>} 
            colorClass="text-rose-600" 
            bgColor="bg-rose-600" 
          />
          <StatCard 
            label="Total Terdata" 
            value={filteredScores.length} 
            subtext="Siswa Dimasukkan" 
            icon={<Users size={24}/>} 
            colorClass="text-slate-600" 
            bgColor="bg-slate-600" 
          />
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              
              {/* Year Select */}
              <div className="relative w-full sm:max-w-[180px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar size={18} />
                </span>
                <select
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-300 appearance-none"
                  value={selectedYearId}
                  onChange={(e) => handleFilterChange(e.target.value, selectedSubjectId, selectedClassId)}
                >
                  {academicYears.map(p => <option key={p.id} value={p.id}>{p.name} - {p.semester}</option>)}
                </select>
              </div>

              {/* Subject Select */}
              <div className="relative w-full sm:max-w-[180px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen size={18} />
                </span>
                <select
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-300 appearance-none"
                  value={selectedSubjectId}
                  onChange={(e) => handleFilterChange(selectedYearId, e.target.value, selectedClassId)}
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Class Select */}
              <div className="relative w-full sm:max-w-[150px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Filter size={18} />
                </span>
                <select
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-300 appearance-none"
                  value={selectedClassId}
                  onChange={(e) => handleFilterChange(selectedYearId, selectedSubjectId, e.target.value)}
                >
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="Cari Siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={filteredScores.length === 0}
                className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 dark:hover:border-indigo-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Cetak Laporan Nilai PDF"
              >
                <Printer size={18} />
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>Simpan Nilai</span>
              </button>
            </div>
          </div>
        </div>

        {/* Score Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siswa</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Harian (50%)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Semester (50%)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Final Score</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Grade</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Catatan Wali Kelas</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredScores.length > 0 ? filteredScores.map((s) => {
                  const final = calculateFinal(s.harian, s.semester);
                  const grade = getGrade(final);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-700 transition-all">
                            <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{s.name}</p>
                            <p className="text-xs text-slate-400 font-medium">{s.class} • {s.nisn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <input 
                            type="number" 
                            className="w-16 h-10 text-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                            value={s.harian}
                            onChange={(e) => handleScoreChange(s.id, 'harian', e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <input 
                            type="number" 
                            className="w-16 h-10 text-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                            value={s.semester}
                            onChange={(e) => handleScoreChange(s.id, 'semester', e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                           <span className={`text-lg font-black ${final >= 70 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-500'}`}>{final}</span>
                           <div className="w-12 h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${final >= 70 ? 'bg-indigo-500' : 'bg-rose-500'}`} 
                                style={{ width: `${final}%` }}
                              ></div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-4 py-1.5 rounded-lg text-sm font-black transition-all ${grade.color}`}>
                           {grade.label}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <textarea
                            rows={1}
                            className="w-48 text-sm px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none dark:text-white placeholder-slate-400"
                            placeholder="Tulis catatan..."
                            value={s.note}
                            onChange={(e) => handleNoteChange(s.id, e.target.value)}
                         />
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                            <Edit3 size={18} />
                         </button>
                      </td>
                    </tr>
                  );
                }) : (
                    <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">
                            Tidak ada data santri untuk filter ini
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Grade A (90-100)</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Grade B (80-89)</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Grade C (70-79)</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Grade D (&lt;70)</div>
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">
                Klik <span className="font-bold text-indigo-600">Simpan Nilai</span> untuk menyimpan permanen ke database.
              </p>
          </div>
        </div>
      </div>

      {/* ===== PRINTABLE REPORT AREA (hidden on screen, visible on print) ===== */}
      <div id="print-report" style={{ display: 'none' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '3px double #312e81', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '28px', fontWeight: 900 }}>R</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Madrasah Diniyah</p>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e1b4b', margin: '2px 0' }}>Raport Madin</h1>
              <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Sistem Informasi Akademik Madrasah</p>
            </div>
          </div>
          <div style={{ background: '#f0f0ff', borderRadius: '12px', padding: '10px 24px', display: 'inline-block', marginTop: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: 900, color: '#3730a3', margin: 0 }}>LAPORAN NILAI HASIL BELAJAR SANTRI</p>
          </div>
        </div>

        {/* Meta Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Kelas', value: currentClassName },
            { label: 'Mata Pelajaran', value: currentSubjectName },
            { label: 'Tahun Ajaran / Semester', value: currentYearLabel },
          ].map(item => (
            <div key={item.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', borderLeft: '4px solid #4f46e5' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 4px 0' }}>{item.label}</p>
              <p style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Score Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#312e81', color: 'white' }}>
              {['No', 'Nama Santri', 'NISN', 'Nilai Harian (50%)', 'Nilai Semester (50%)', 'Nilai Akhir', 'Grade', 'Catatan Wali Kelas'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: h === 'No' ? 'center' : (h === 'Nama Santri' || h === 'Catatan Wali Kelas') ? 'left' : 'center', fontWeight: 800, letterSpacing: '0.05em', fontSize: '9px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredScores.map((s, i) => {
              const final = calculateFinal(s.harian, s.semester);
              const grade = getGrade(final);
              const isOdd = i % 2 === 0;
              return (
                <tr key={s.id} style={{ background: isOdd ? '#ffffff' : '#f8f9ff', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>{i + 1}</td>
                  <td style={{ padding: '9px 12px', fontWeight: 700, color: '#1e293b' }}>{s.name}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', fontFamily: 'monospace' }}>{s.nisn}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 800, color: '#3730a3' }}>{s.harian}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 800, color: '#3730a3' }}>{s.semester}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 900, fontSize: '14px', color: final >= 70 ? '#1e293b' : '#ef4444' }}>{final}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '11px', background: grade.label === 'A' ? '#d1fae5' : grade.label === 'B' ? '#e0e7ff' : grade.label === 'C' ? '#fef3c7' : '#fee2e2', color: grade.label === 'A' ? '#065f46' : grade.label === 'B' ? '#3730a3' : grade.label === 'C' ? '#92400e' : '#991b1b' }}>
                      {grade.label}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', color: '#64748b', fontSize: '10px', fontStyle: s.note ? 'normal' : 'italic' }}>{s.note || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Stats Summary + Signature */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
          {/* Stats */}
          <div style={{ background: '#f0f0ff', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', borderBottom: '1px solid #c7d2fe', paddingBottom: '8px' }}>Rekap Statistik</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Total Santri', value: filteredScores.length },
                { label: 'Rata-rata Kelas', value: stats.avg },
                { label: 'Nilai Tertinggi', value: stats.top },
                { label: 'Perlu Remedial', value: stats.remedial },
              ].map(item => (
                <div key={item.label} style={{ background: 'white', padding: '10px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 2px 0' }}>{item.label}</p>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b', margin: 0 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div></div>
            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <p style={{ fontSize: '11px', color: '#374151', marginBottom: '4px' }}>Mengetahui,</p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '60px' }}>Wali Kelas {currentClassName}</p>
              <div style={{ borderTop: '1px solid #374151', paddingTop: '6px' }}>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>( _____________________________ )</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', borderTop: '1px dashed #c7d2fe', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0 }}>Dicetak oleh Sistem Raport Madin • {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style={{ fontSize: '9px', color: '#c7d2fe', margin: 0 }}>★ A ≥90  ★ B ≥80  ★ C ≥70  ★ D &lt;70</p>
        </div>
      </div>
    </AdminPanel>
  );
};

export default ScoreManagement;
