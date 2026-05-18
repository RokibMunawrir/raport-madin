import React, { useState } from 'react';
import { 
  Search as SearchIcon, 
  User, 
  BookOpen, 
  Calendar, 
  Award, 
  CheckCircle, 
  X, 
  Lock, 
  ArrowLeft, 
  Printer, 
  Sparkles, 
  AlertCircle,
  FileText,
  UserCheck,
  GraduationCap,
  TrendingUp,
  Star,
  Heart
} from 'lucide-react';
import ThemeController from './themeController';

interface StudentCandidate {
  id: string;
  name: string;
  maskedNis: string;
  gender: string;
}

interface SubjectScore {
  id: string;
  subjectName: string;
  subjectCategory: string;
  harian: number;
  semester: number;
}

interface ReportData {
  student: {
    id: string;
    nis: string;
    name: string;
    gender: string;
    avatar: string;
    address: string;
  };
  academicYear: {
    id: string;
    name: string;
  };
  classroom: {
    classroomId: string;
    className: string;
    teacherName: string;
    teacherNip: string;
  } | null;
  scores: SubjectScore[];
  attendance: {
    sakit: number;
    izin: number;
    alpha: number;
  };
  note: string;
  achievements: {
    id: string;
    title: string;
    description: string | null;
  }[];
  headmaster: {
    name: string;
    nip: string;
  };
}

export const StudentGradeSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [candidates, setCandidates] = useState<StudentCandidate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Verification state
  const [selectedCandidate, setSelectedCandidate] = useState<StudentCandidate | null>(null);
  const [verifyNis, setVerifyNis] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Report state
  const [report, setReport] = useState<ReportData | null>(null);

  // Search function (by Name or NIS)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setCandidates([]);
    setReport(null);
    setSelectedCandidate(null);
    setVerifyNis('');
    setVerificationError(null);

    try {
      const isNisInput = /^\d+$/.test(searchQuery.trim());
      
      let url = `/api/public/report?search=${encodeURIComponent(searchQuery.trim())}`;
      if (isNisInput) {
        url = `/api/public/report?nis=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url);
      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Terjadi kesalahan saat mencari');
      }

      if (resData.type === 'report') {
        setReport(resData.data);
      } else if (resData.type === 'search') {
        setCandidates(resData.data);
        setHasSearched(true);
        if (resData.data.length === 0) {
          setError('Santri tidak ditemukan. Periksa kembali nama atau NIS.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Santri tidak ditemukan atau terjadi gangguan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify NIS for selected name candidate
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !verifyNis.trim()) return;

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await fetch(`/api/public/report?nis=${encodeURIComponent(verifyNis.trim())}`);
      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'NIS yang dimasukkan salah');
      }

      if (resData.data.student.id !== selectedCandidate.id) {
        throw new Error('NIS tidak cocok dengan nama santri yang dipilih.');
      }

      setReport(resData.data);
      setSelectedCandidate(null);
    } catch (err: any) {
      setVerificationError(err.message || 'Verifikasi gagal.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setCandidates([]);
    setHasSearched(false);
    setReport(null);
    setSelectedCandidate(null);
    setVerifyNis('');
    setError(null);
    setVerificationError(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for scoring badge styles
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'emerald';
    if (score >= 75) return 'indigo';
    if (score >= 60) return 'amber';
    return 'rose';
  };

  const getScoreBadgeClass = (score: number) => {
    const c = getScoreColor(score);
    if (c === 'emerald') return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border-emerald-250 dark:border-emerald-900/50';
    if (c === 'indigo') return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-405 border-indigo-250 dark:border-indigo-900/50';
    if (c === 'amber') return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 border-amber-250 dark:border-amber-900/50';
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 border-rose-250 dark:border-rose-900/50';
  };

  const getScorePredicate = (score: number) => {
    if (score >= 85) return 'A (Sangat Baik)';
    if (score >= 75) return 'B (Baik)';
    if (score >= 60) return 'C (Cukup)';
    return 'D (Kurang)';
  };

  // Calculate overall average
  const calculateGPAData = () => {
    if (!report || report.scores.length === 0) return { avg: 0, text: 'N/A', class: 'text-slate-400' };
    const total = report.scores.reduce((acc, curr) => acc + Math.round((curr.harian + curr.semester) / 2), 0);
    const avg = Math.round(total / report.scores.length);
    let pred = 'D';
    let colorClass = 'text-rose-500';
    if (avg >= 85) {
      pred = 'A (Sangat Baik)';
      colorClass = 'text-emerald-500';
    } else if (avg >= 75) {
      pred = 'B (Baik)';
      colorClass = 'text-indigo-500';
    } else if (avg >= 60) {
      pred = 'C (Cukup)';
      colorClass = 'text-amber-500';
    }
    return { avg, text: pred, class: colorClass };
  };

  const gpa = calculateGPAData();

  // Get dynamic name initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 transition-colors duration-500 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Premium Background Ambient Glow Meshes */}
      <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[70%] rounded-full bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 dark:from-indigo-600/5 dark:to-violet-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[70%] rounded-full bg-gradient-to-bl from-emerald-500/10 to-teal-500/10 dark:from-emerald-600/5 dark:to-teal-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-500/5 dark:bg-pink-600/3 blur-[100px] pointer-events-none" />

      {/* Top Header Capsule Bar (Spotlight Layout) */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12 py-3 px-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-850/50 shadow-lg shadow-slate-100/50 dark:shadow-none no-print transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 font-black tracking-tighter text-lg scale-95 hover:scale-100 transition-all duration-300">
            A
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none tracking-tight flex items-center gap-1.5">
              RAPORT MADIN 
              <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md font-extrabold">ONLINE</span>
            </h1>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-0.5 block">MDT AL-AMIRIYYAH</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeController />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <a 
            href="/login" 
            className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-1.5 group"
          >
            <UserCheck size={13} className="group-hover:rotate-12 transition-transform" />
            Portal Admin
          </a>
        </div>
      </header>

      {/* SEARCH SYSTEM ROOT CONTAINER */}
      {!report && !selectedCandidate && (
        <div className="max-w-4xl mx-auto text-center no-print mt-12 mb-20">
          
          {/* Animated Premium Micro Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-150/40 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm">
            <Sparkles size={11} className="text-violet-500 dark:text-violet-400 animate-spin-slow" />
            Pencarian Raport PAS Digital
          </div>

          {/* Hero Section Headlines */}
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-6">
            Hasil Penilaian <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 bg-clip-text text-transparent">Akademik Santri Madin</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-12 font-medium leading-relaxed">
            Akses cepat, transparan, dan aman untuk melacak perkembangan hasil studi, hafalan, serta catatan karakter santri MDT Al-Amiriyyah.
          </p>

          {/* Raycast-style Spotlight Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-12">
            {/* Glowing Focus Backdrop */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none" />
            
            <form onSubmit={handleSearch} className="relative group bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-none overflow-hidden transition-all duration-300">
              <div className="flex items-center pl-5 pr-3 py-4">
                <SearchIcon className="text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors mr-4" size={22} />
                <input
                  type="text"
                  className="block w-full bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none sm:text-base font-medium"
                  placeholder="Ketik Nama Santri atau Nomor NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                />
                
                <div className="flex items-center gap-3">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                  
                  {/* Spotlight Command Badge */}
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-[10px] font-black text-slate-400 tracking-tight dark:text-slate-500">
                    ENTER ↵
                  </span>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !searchQuery.trim()}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-indigo-600 dark:hover:bg-indigo-50 hover:text-white dark:hover:text-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 rounded-xl text-xs font-black tracking-wide shadow-md transition-all duration-300 flex items-center gap-1.5 active:scale-95"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent dark:border-slate-600 rounded-full animate-spin" />
                    ) : (
                      'Temukan'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Search Error Indicator */}
          {error && (
            <div className="max-w-2xl mx-auto mt-2 px-5 py-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-455 text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-1.5 duration-300">
              <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                <AlertCircle size={16} />
              </div>
              <span className="text-left">{error}</span>
            </div>
          )}

          {/* CANDIDATES RESULTS GRID VIEW */}
          {hasSearched && candidates.length > 0 && (
            <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-left animate-in fade-in slide-in-from-bottom-4 duration-400 transition-all">
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 bg-indigo-600 rounded-full" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Daftar Santri yang Cocok ({candidates.length})</span>
                </div>
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/20">Klik untuk Buka</span>
              </div>
              
              <div className="p-2 space-y-1 bg-white/50 dark:bg-transparent">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all duration-300 text-left group border border-transparent hover:border-slate-100 dark:hover:border-slate-750"
                  >
                    <div className="flex items-center gap-4">
                      {/* Vibrant Initials Avatar Orb */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight mb-1">
                          {c.name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                          NIS: {c.maskedNis} <span className="mx-1 text-slate-300 dark:text-slate-700">•</span> {c.gender}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-550 dark:text-slate-400 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white group-hover:border-transparent shadow-sm group-hover:shadow-md transition-all duration-300">
                      <Lock size={11} className="mr-0.5 group-hover:scale-110" />
                      Verifikasi
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ULTRA-PREMIUM VERIFICATION MODAL FRAME */}
      {selectedCandidate && !report && (
        <div className="max-w-md mx-auto no-print mt-12 bg-white/90 dark:bg-slate-850/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-400 relative overflow-hidden transition-all">
          {/* Top Decorative Line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10 border border-amber-200/50 dark:border-amber-900/30 relative">
            <div className="absolute inset-0 rounded-2xl border border-amber-500 animate-ping opacity-15" />
            <Lock size={28} />
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Verifikasi Pemilik Raport</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs px-2 mb-8 leading-relaxed font-medium">
            Laporan perkembangan nilai dilindungi oleh privasi data. Mohon masukkan **NIS lengkap** untuk santri <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{selectedCandidate.name}</strong>.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <input
                type="text"
                className="block w-full px-4 py-4 border border-slate-200 dark:border-slate-750 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-center font-extrabold text-base sm:text-lg tracking-widest shadow-inner transition-all"
                placeholder="00000000"
                value={verifyNis}
                onChange={(e) => setVerifyNis(e.target.value)}
                disabled={isVerifying}
                autoFocus
              />
            </div>

            {verificationError && (
              <div className="px-4 py-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 rounded-xl text-rose-600 dark:text-rose-455 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCandidate(null);
                  setVerifyNis('');
                  setVerificationError(null);
                }}
                disabled={isVerifying}
                className="flex-1 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isVerifying || !verifyNis.trim()}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/15 disabled:shadow-none hover:scale-[1.02] disabled:scale-100 transition-all"
              >
                {isVerifying ? 'Memproses...' : 'Buka Raport'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REPORT SHEET CORE VIEW */}
      {report && (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-600 transition-all">
          
          {/* Action Toolbar Panel */}
          <div className="no-print flex justify-between items-center mb-8 gap-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl shadow-lg transition-all duration-300">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-wider text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 hover:scale-[1.01]"
            >
              <ArrowLeft size={13} />
              Cari Lainnya
            </button>
            
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-600/15 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2"
            >
              <Printer size={13} />
              Cetak Raport
            </button>
          </div>

          {/* Premium Report Card Layout */}
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-8 sm:p-12 md:p-14 relative overflow-hidden transition-all duration-300 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
            
            {/* Top Tri-Color Accent Line */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />
            
            {/* Elegant Background Watermark (Only screen) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/5 to-transparent dark:from-indigo-400/5 pointer-events-none rounded-bl-[10rem] no-print" />

            {/* School Header Identity Block */}
            <div className="border-b-4 border-double border-slate-250 dark:border-slate-700/80 pb-6 mb-10 text-center print:border-slate-800">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide uppercase leading-tight print:text-black">
                MADRASAH DINIYAH TAKMILIYAH (MDT) AL-AMIRIYYAH
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-extrabold tracking-wider mt-1.5 print:text-slate-600">
                BLOKAGUNG - TEGALSARI - BANYUWANGI - JAWA TIMUR
              </p>
              
              <div className="inline-block mt-4 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 print:border-slate-200">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest print:text-black">
                  LAPORAN HASIL BELAJAR AKADEMIK
                </span>
              </div>
            </div>

            {/* Student & Class Profiles Header Info Card */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-10 bg-slate-50/50 dark:bg-slate-900/35 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-3xl print:bg-white print:border-slate-200 print:flex-row print:p-4">
              {/* Profile Orb Display */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600 text-white text-3xl font-black flex items-center justify-center shadow-lg shadow-indigo-500/10 flex-shrink-0">
                {getInitials(report.student.name)}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300 print:text-black print:grid-cols-2 flex-1 w-full">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 print:border-slate-200">
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] print:text-slate-600">Nama Santri</span>
                    <span className="font-extrabold text-slate-850 dark:text-white print:text-black">{report.student.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 print:border-slate-200">
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] print:text-slate-600">Nomor Induk (NIS)</span>
                    <span className="font-extrabold text-slate-850 dark:text-white print:text-black">{report.student.nis}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 print:border-slate-200">
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] print:text-slate-600">Jenis Kelamin</span>
                    <span className="font-bold text-slate-750 dark:text-slate-200 print:text-black">{report.student.gender}</span>
                  </div>
                </div>
                
                <div className="space-y-2 col-span-1">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 print:border-slate-200">
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] print:text-slate-600">Kelas Santri</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400 print:text-black">{report.classroom?.className || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 print:border-slate-200">
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] print:text-slate-600">Tahun Ajaran</span>
                    <span className="font-bold text-slate-800 dark:text-white print:text-black">{report.academicYear.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 print:border-slate-200">
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] print:text-slate-600">Wali Kelas</span>
                    <span className="font-bold text-slate-750 dark:text-slate-200 print:text-black">{report.classroom?.teacherName || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW ADDITION: KEY STATISTICS / GPA INSIGHT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 no-print">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 dark:from-indigo-950/20 dark:to-indigo-950/5 border border-indigo-200/40 dark:border-indigo-900/30 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Rerata Nilai (GPA)</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block mt-0.5">{gpa.avg} <span className="text-xs text-slate-400 font-bold">/ 100</span></span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-950/5 border border-amber-200/40 dark:border-amber-900/30 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Star size={20} className="fill-amber-500/20" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Predikat Prestasi</span>
                  <span className={`text-sm font-black block mt-1 tracking-tight ${gpa.class}`}>{gpa.text}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-950/5 border border-emerald-200/40 dark:border-emerald-900/30 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Jumlah Mata Pelajaran</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">{report.scores.length} <span className="text-xs text-slate-400 font-bold">Mapel</span></span>
                </div>
              </div>
            </div>

            {/* GRADES TABLE CONTAINER */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center no-print border border-indigo-100 dark:border-indigo-900/20">
                  <BookOpen size={14} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white print:text-black">Laporan Nilai Akademik</h3>
              </div>

              {report.scores.length === 0 ? (
                <div className="px-6 py-10 border border-dashed border-slate-200 dark:border-slate-750 rounded-2xl text-center text-slate-400 dark:text-slate-500">
                  <FileText size={36} className="mx-auto mb-2 opacity-50 text-indigo-500" />
                  <p className="text-xs">Nilai akademik belum diunggah untuk tahun ajaran aktif ini.</p>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:border-slate-800 shadow-sm">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm print:text-black">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 text-slate-450 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider print:bg-slate-100 print:border-slate-800 print:text-black">
                          <th className="px-6 py-4 text-center w-12">No.</th>
                          <th className="px-6 py-4">Mata Pelajaran</th>
                          <th className="px-6 py-4 hidden sm:table-cell">Kategori</th>
                          <th className="px-6 py-4 text-center w-24">Nilai Harian</th>
                          <th className="px-6 py-4 text-center w-24">Nilai PAS</th>
                          <th className="px-6 py-4 text-center w-36 no-print">Visual Indikator</th>
                          <th className="px-6 py-4 text-center w-24">Rerata</th>
                          <th className="px-6 py-4 text-center w-28 hidden sm:table-cell">Predikat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 dark:divide-slate-800 print:divide-slate-800">
                        {report.scores.map((s, index) => {
                          const average = Math.round((s.harian + s.semester) / 2);
                          const sc = getScoreColor(average);
                          const progressColorClass = 
                            sc === 'emerald' ? 'bg-emerald-500' :
                            sc === 'indigo' ? 'bg-indigo-500' :
                            sc === 'amber' ? 'bg-amber-500' : 'bg-rose-500';

                          return (
                            <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="px-6 py-4 text-center font-bold text-slate-400 print:text-black">{index + 1}</td>
                              <td className="px-6 py-4">
                                <span className="font-extrabold text-slate-850 dark:text-white print:text-black block text-sm">{s.subjectName}</span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell print:text-black">{s.subjectCategory}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300 print:text-black">{s.harian}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300 print:text-black">{s.semester}</td>
                              
                              {/* Horizontal Visual Gauge Bar (Only screen) */}
                              <td className="px-6 py-4 text-center no-print">
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/10 shadow-inner">
                                  <div 
                                    className={`h-full rounded-full ${progressColorClass}`} 
                                    style={{ width: `${average}%` }} 
                                  />
                                </div>
                              </td>

                              <td className="px-6 py-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black border ${getScoreBadgeClass(average)} print:border-none print:p-0 print:text-black`}>
                                  {average}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center font-black text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell print:text-black">
                                {getScorePredicate(average)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ATTENDANCE & ACHIEVEMENTS DUAL BLOCKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 print:grid-cols-2">
              
              {/* Modern Grid Badges for Attendance */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center no-print border border-indigo-100 dark:border-indigo-900/20">
                    <Calendar size={14} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white print:text-black">Catatan Kehadiran</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl print:border-slate-800 shadow-sm bg-white dark:bg-transparent">
                  <div className="text-center group">
                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-3.5 print:text-slate-600">Sakit</span>
                    <div className="w-14 h-14 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/10 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 print:text-black">{report.attendance.sakit}</span>
                    </div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-2 font-bold uppercase tracking-wider">Hari</span>
                  </div>
                  
                  <div className="text-center group">
                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-3.5 print:text-slate-600">Izin</span>
                    <div className="w-14 h-14 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 print:text-black">{report.attendance.izin}</span>
                    </div>
                    <span className="text-[10px] text-slate-455 dark:text-slate-500 block mt-2 font-bold uppercase tracking-wider">Hari</span>
                  </div>

                  <div className="text-center group">
                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-3.5 print:text-slate-600">Alpha</span>
                    <div className="w-14 h-14 rounded-2xl border-2 border-amber-100 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <span className="text-lg font-black text-amber-600 dark:text-amber-400 print:text-black">{report.attendance.alpha}</span>
                    </div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-2 font-bold uppercase tracking-wider">Hari</span>
                  </div>
                </div>
              </div>

              {/* Gilded List for Achievements */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center no-print border border-indigo-100 dark:border-indigo-900/20">
                    <Award size={14} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white print:text-black">Catatan Prestasi</h3>
                </div>

                <div className="border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl print:border-slate-800 h-[126px] overflow-y-auto print:h-auto shadow-sm bg-white dark:bg-transparent">
                  {report.achievements.length === 0 ? (
                    <div className="text-center py-7">
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Belum ada prestasi khusus yang dicatat pada semester ini.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3 text-xs sm:text-sm">
                      {report.achievements.map((ach) => (
                        <li key={ach.id} className="flex gap-3 items-start text-slate-700 dark:text-slate-300 print:text-black group">
                          <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mt-0.5">
                            <CheckCircle size={13} className="fill-emerald-500/10" />
                          </div>
                          <div>
                            <strong className="text-slate-900 dark:text-white print:text-black font-extrabold block">{ach.title}</strong>
                            {ach.description && <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5 leading-tight">{ach.description}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Cozy quote box for Wali Kelas comments */}
            <div className="border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl mb-12 shadow-sm bg-slate-50/20 dark:bg-slate-900/20 print:border-slate-800 print:bg-white">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Heart size={13} className="text-rose-500 fill-rose-500/25" />
                <h4 className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest print:text-slate-600">
                  Ulasan Karakter / Catatan Guru Wali Kelas
                </h4>
              </div>
              <p className="text-xs sm:text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-1">
                "{report.note}"
              </p>
            </div>

            {/* Standard Signature Panel */}
            <div className="grid grid-cols-3 gap-6 text-center text-xs mt-20 print:text-black w-full">
              <div>
                <p className="text-slate-450 dark:text-slate-500 print:text-slate-650 mb-16 uppercase tracking-wider font-extrabold text-[9px]">Orang Tua / Wali Santri</p>
                <div className="border-b border-slate-350 dark:border-slate-700 mx-auto w-32 pb-2" />
                <p className="text-slate-400 dark:text-slate-500 mt-1.5 font-bold uppercase text-[9px] tracking-wider">Nama Jelas</p>
              </div>

              <div>
                <p className="text-slate-450 dark:text-slate-500 print:text-slate-655 mb-16 uppercase tracking-wider font-extrabold text-[9px]">Guru Wali Kelas</p>
                <p className="font-extrabold text-slate-900 dark:text-white print:text-black leading-none">{report.classroom?.teacherName || '-'}</p>
                <div className="border-b border-slate-350 dark:border-slate-700 mx-auto w-36 pb-1 mt-2.5" />
                <p className="text-slate-400 dark:text-slate-500 mt-1.5 font-bold text-[9px] uppercase tracking-wider">NIP: {report.classroom?.teacherNip || '-'}</p>
              </div>

              <div>
                <p className="text-slate-450 dark:text-slate-500 print:text-slate-655 mb-16 uppercase tracking-wider font-extrabold text-[9px]">Kepala Madrasah</p>
                <p className="font-extrabold text-slate-900 dark:text-white print:text-black leading-none">{report.headmaster.name}</p>
                <div className="border-b border-slate-350 dark:border-slate-700 mx-auto w-40 pb-1 mt-2.5" />
                <p className="text-slate-400 dark:text-slate-500 mt-1.5 font-bold text-[9px] uppercase tracking-wider">NIP: {report.headmaster.nip}</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
