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
import IndividualReport from '../student/IndividualReport';


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
  classReports?: any[];
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
    user,
    classReports
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
    const fullPrint = document.getElementById('class-report-print');
    if(fullPrint) fullPrint.style.display = 'block';
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
                disabled={!classReports || classReports.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Cetak Laporan Pembelajaran Kelas"
              >
                <Printer size={18} className="text-indigo-600" />
                <span>Cetak Laporan</span>
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
              <p className="text-xs font-medium text-slate-400 tracking-tighter">
                Klik <span className="font-bold text-indigo-600">Simpan Nilai</span> untuk menyimpan permanen ke database.
              </p>
          </div>
        </div>
      </div>

      {/* ===== PRINTABLE CLASS REPORT AREA (hidden on screen, visible on print) ===== */}
      <div id="class-report-print" style={{ display: 'none' }}>
        {classReports && classReports.map((report) => (
          <div key={report.student.id} className="print-page-wrapper">
            <IndividualReport data={report} isPrintWrapper={false} />
          </div>
        ))}
      </div>
    </AdminPanel>
  );
};

export default ScoreManagement;
