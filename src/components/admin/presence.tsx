import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  UserX, 
  AlertCircle, 
  Thermometer, 
  Printer,
  Check,
  Loader2,
  FileText,
  Layout,
  BookOpen
} from 'lucide-react';
import Modal from '../ui/modal';

import kop from '../../assets/kop.png';

import AdminPanel from '../ui/panel';
import { toast } from '../ui/notification';

// --- Types ---
type PresenceStatus = 'H' | 'I' | 'S' | 'A'; // Hadir, Izin, Sakit, Alpa

interface Student {
  id: string;
  name: string;
  nis: string;
  class: string;
  avatar: string;
}

type DailyPresence = [PresenceStatus, PresenceStatus, PresenceStatus];

interface PresenceData {
  [studentId: string]: DailyPresence;
}

interface Classroom {
  id: string;
  name: string;
  teacherId?: string | null;
  teacherName?: string | null;
  teacherNip?: string | null;
}

interface PresenceManagementProps {
  initialStudents: Student[];
  initialPresence: PresenceData;
  classrooms: Classroom[];
  selectedDate: string;
  selectedClassId: string;
  user?: any;
}


// --- Utilities ---
const formatName = (name: string) => {
  const words = name.trim().split(/\s+/);
  if (words.length <= 3) return name;
  
  return [
    ...words.slice(0, 3),
    ...words.slice(3).map(word => word.charAt(0).toUpperCase() + '.')
  ].join(' ');
};

// --- Sub-components ---
const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; colorClass: string; bgColor: string }> = ({ label, value, icon, colorClass, bgColor }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02]">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} bg-opacity-10 dark:bg-opacity-20 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{value}</h3>
    </div>
  </div>
);

const PresenceItem: React.FC<{ 
  student: Student; 
  status: DailyPresence; 
  onStatusChange: (hourIndex: number, status: PresenceStatus) => void 
}> = ({ student, status, onStatusChange }) => {
  const commonBtnClass = "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border-2";
  
  const statusConfig = {
    H: { label: 'H', active: "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20", inactive: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-200 dark:hover:border-emerald-900" },
    I: { label: 'I', active: "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20", inactive: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-900" },
    S: { label: 'S', active: "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20", inactive: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-amber-200 dark:hover:border-amber-900" },
    A: { label: 'A', active: "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20", inactive: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-rose-200 dark:hover:border-rose-900" },
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900 transition-all">
            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{formatName(student.name)}</p>
            <p className="text-xs text-slate-400 font-medium font-mono">{student.nis}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
          {student.class}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap 2xl:flex-nowrap items-center justify-center gap-4 lg:gap-6">
          {[0, 1, 2].map((hourIndex) => (
            <div key={hourIndex} className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Jam Ke-{hourIndex + 1}</p>
              <div className="flex items-center gap-1.5">
                {(['H', 'I', 'S', 'A'] as PresenceStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onStatusChange(hourIndex, s)}
                    className={`${commonBtnClass} ${status[hourIndex] === s ? statusConfig[s].active : statusConfig[s].inactive}`}
                    title={s === 'H' ? 'Hadir' : s === 'I' ? 'Izin' : s === 'S' ? 'Sakit' : 'Alpa'}
                  >
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
};

// --- Main Component ---
const PresenceManagement: React.FC<PresenceManagementProps> = ({ 
    initialStudents, 
    initialPresence, 
    classrooms, 
    selectedDate: propDate, 
    selectedClassId: propClassId,
    user
}) => {

  const [date, setDate] = useState(propDate);
  const [classId, setClassId] = useState(propClassId);
  const [searchQuery, setSearchQuery] = useState('');
  const [presence, setPresence] = useState<PresenceData>(initialPresence);
  const [loading, setLoading] = useState(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState<'daily' | 'weekly' | 'monthly' | 'semester'>('daily');
  const [rekapData, setRekapData] = useState<any>(null);
  const [isFetchingRekap, setIsFetchingRekap] = useState(false);

  const handlePrint = async () => {
    if (printType === 'daily') {
      window.print();
      setIsPrintModalOpen(false);
    } else {
      setIsFetchingRekap(true);
      try {
        const response = await fetch(`/api/presence/rekap?classId=${classId}&type=${printType}&date=${date}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        setRekapData(data);
        // Wait for state to update and DOM to render
        setTimeout(() => {
          window.print();
          setIsFetchingRekap(false);
          setIsPrintModalOpen(false);
        }, 500);
      } catch (error) {
        toast.error('Gagal mengambil data rekap');
        setIsFetchingRekap(false);
      }
    }
  };

  // Sync state with props when they change
  useEffect(() => {
    setPresence(initialPresence);
  }, [initialPresence]);

  // Handle URL updates when date or class changes
  const handleFilterChange = (newDate: string, newClassId: string) => {
    window.location.href = `/presence?date=${newDate}&classroom=${newClassId}`;
  };

  // Stats calculation
  const stats = useMemo(() => {
    const counts = { total: initialStudents.length, H: 0, I: 0, S: 0, A: 0 };
    Object.values(presence).forEach((statuses) => {
      statuses.forEach(status => {
         counts[status]++;
      });
    });
    return counts;
  }, [presence, initialStudents]);

  // Filtering
  const filteredStudents = useMemo(() => {
    return initialStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery);
      return matchesSearch;
    });
  }, [searchQuery, initialStudents]);

  const handleStatusChange = (studentId: string, hourIndex: number, status: PresenceStatus) => {
    setPresence(prev => {
       const currentFocus = prev[studentId] ? [...prev[studentId]] as DailyPresence : ['H', 'H', 'H'] as DailyPresence;
       currentFocus[hourIndex] = status;
       return { ...prev, [studentId]: currentFocus };
    });
  };

  const handleMarkAllPresent = () => {
    const newPresence = { ...presence };
    filteredStudents.forEach(s => {
      newPresence[s.id] = ['H', 'H', 'H'];
    });
    setPresence(newPresence);
  };

  const handleSave = async () => {
    setLoading(true);
    // Optimized: Only send changes
    const changes: PresenceData = {};
    let changeCount = 0;
    
    // We check all students in the current presence state
    Object.keys(presence).forEach(studentId => {
        const current = presence[studentId];
        const initial = initialPresence[studentId];
        
        if (!initial) {
            // If not in initial, it's new data. 
            // We save it if it's been initialized in the state.
            changes[studentId] = current;
            changeCount++;
        } else {
            // Compare each session status
            const isDifferent = current.some((status, idx) => status !== initial[idx]);
            if (isDifferent) {
                changes[studentId] = current;
                changeCount++;
            }
        }
    });

    if (changeCount === 0) {
        toast.info('Tidak ada perubahan untuk disimpan');
        setLoading(false);
        return;
    }

    try {
        const response = await fetch('/presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: date,
                presenceData: changes
            })
        });

        const result = await response.json();
        if (result.success) {
            toast.success('Presensi berhasil disimpan');
        } else {
            toast.error('Gagal menyimpan presensi');
        }
    } catch (error) {
        toast.error('Terjadi kesalahan sistem');
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
    <AdminPanel title="Kehadiran" activeItem="Kehadiran" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard label="Siswa Terdaftar" value={stats.total} icon={<Users size={24} />} colorClass="text-slate-600" bgColor="bg-slate-600" />
            <StatCard label="Hadir (H)" value={stats.H} icon={<CheckCircle size={24} />} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
            <StatCard label="Izin (I)" value={stats.I} icon={<AlertCircle size={24} />} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
            <StatCard label="Sakit (S)" value={stats.S} icon={<Thermometer size={24} />} colorClass="text-amber-600" bgColor="bg-amber-600" />
            <StatCard label="Alpa (A)" value={stats.A} icon={<UserX size={24} />} colorClass="text-rose-600" bgColor="bg-rose-600" />
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
                {/* Date Picker */}
                <div className="relative w-full sm:max-w-[200px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                </span>
                <input
                    type="date"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-300"
                    value={date}
                    onChange={(e) => handleFilterChange(e.target.value, classId)}
                />
                </div>

                {/* Class Filter */}
                <div className="relative w-full sm:max-w-[180px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Filter size={18} />
                </span>
                <select
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-300 appearance-none"
                    value={classId}
                    onChange={(e) => handleFilterChange(date, e.target.value)}
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
                onClick={handleMarkAllPresent}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all active:scale-95"
                >
                <CheckCircle size={16} />
                <span>Semua Hadir</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsPrintModalOpen(true)}
                  className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95" 
                  title="Cetak Presensi"
                >
                <Printer size={18} />
                </button>
                <button 
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 disabled:opacity-50"
                 >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                <span>Simpan Rekap</span>
                </button>
            </div>
            </div>
        </div>

        {/* Main Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siswa</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Kelas</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Kehadiran (H/I/S/A)</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                    <PresenceItem 
                        key={s.id} 
                        student={s} 
                        status={presence[s.id] || ['H', 'H', 'H']} 
                        onStatusChange={(hourIndex, status) => handleStatusChange(s.id, hourIndex, status)} 
                    />
                    ))
                ) : (
                    <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                        <Search size={40} className="text-slate-200 dark:text-slate-700" />
                        <p className="text-sm font-bold text-slate-400">Data tidak tersedia untuk filter ini</p>
                        </div>
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>

            {/* Footer Info */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-400">
                Menampilkan <span className="font-bold text-slate-600 dark:text-slate-300">{filteredStudents.length}</span> Siswa untuk tanggal <span className="font-bold text-indigo-600 dark:text-indigo-400">{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </p>
                <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-emerald-600">Hadir</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-indigo-600">Izin</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-amber-600">Sakit</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-rose-600">Alpa</span></div>
                </div>
                </div>
            </div>
            </div>
        </div>
      </div>
    </AdminPanel>
    
    {/* Printable Area */}
    <div id="presence-print" className="hidden print:block bg-white text-black p-[10mm] font-serif text-[11pt] leading-tight min-h-screen">
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <img src={kop.src} alt="kop" className="w-full h-auto mb-2" />
          <h1 className="text-xl font-bold uppercase">Rekapitulasi Kehadiran Santri</h1>
          <p className="text-sm font-bold uppercase">Madrasah Diniyah Takmiliyyah Al Amiriyyah</p>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-24">Kelas</span>
              <span className="mr-2">:</span>
              <span className="font-bold">{classrooms.find(c => c.id === classId)?.name || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-24">Tanggal</span>
              <span className="mr-2">:</span>
              <span>{new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-black text-[10pt]">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-black px-2 py-2 w-10 text-center">No</th>
              <th className="border border-black px-4 py-2 w-32 text-center">NIS</th>
              <th className="border border-black px-4 py-2 text-left">Nama Lengkap</th>
              <th colSpan={3} className="border border-black px-4 py-2 text-center">Kehadiran (Jam Ke-)</th>
            </tr>
            <tr className="bg-slate-50 text-[9pt]">
              <th colSpan={3} className="border border-black px-2 py-1"></th>
              <th className="border border-black px-2 py-1 w-12 text-center">1</th>
              <th className="border border-black px-2 py-1 w-12 text-center">2</th>
              <th className="border border-black px-2 py-1 w-12 text-center">3</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, index) => (
              <tr key={s.id}>
                <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
                <td className="border border-black px-4 py-2 text-center font-mono">{s.nis}</td>
                <td className="border border-black px-4 py-2 uppercase font-medium">{s.name}</td>
                <td className="border border-black px-2 py-2 text-center font-bold">{presence[s.id]?.[0] || 'H'}</td>
                <td className="border border-black px-2 py-2 text-center font-bold">{presence[s.id]?.[1] || 'H'}</td>
                <td className="border border-black px-2 py-2 text-center font-bold">{presence[s.id]?.[2] || 'H'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Stats Summary */}
        <div className="mt-6 flex gap-8 text-[9pt]">
          <p><span className="font-bold">H:</span> Hadir</p>
          <p><span className="font-bold">I:</span> Izin</p>
          <p><span className="font-bold">S:</span> Sakit</p>
          <p><span className="font-bold">A:</span> Alpha (Tanpa Keterangan)</p>
        </div>

        {/* Signature */}
        <div className="mt-12 grid grid-cols-2 text-center">
          <div></div>
          <div className="space-y-20">
            <div>
              <p>Banyuwangi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold">Wali Kelas</p>
            </div>
            <div>
              <p className="font-bold underline">{classrooms.find(c => c.id === classId)?.teacherName || '................................................'}</p>
              <p>NIPY. {classrooms.find(c => c.id === classId)?.teacherNip || '....................................'}</p>
            </div>
          </div>
        </div>
    </div>

    {/* Range Printable Area (Monthly/Weekly) */}
    {rekapData && (
      <div id="presence-rekap-print" className="hidden print:block bg-white text-black p-[10mm] font-serif text-[10pt] leading-tight min-h-screen">
          <div className="text-center mb-6 border-b-2 border-black pb-4">
            <img src={kop.src} alt="kop" className="w-full h-auto mb-2" />
            <h1 className="text-lg font-bold uppercase">Rekapitulasi Kehadiran Santri ({
              printType === 'monthly' ? 'Bulanan' : 
              printType === 'weekly' ? 'Mingguan' : 'Semester'
            })</h1>
            <p className="text-sm font-bold uppercase">Madrasah Diniyah Takmiliyyah Al Amiriyyah</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-[9pt]">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-24">Kelas</span>
                <span className="mr-2">:</span>
                <span className="font-bold">{classrooms.find(c => c.id === classId)?.name || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-24">Periode</span>
                <span className="mr-2">:</span>
                <span>{new Date(rekapData.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} s/d {new Date(rekapData.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse border border-black text-[8pt]">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-black px-1 py-2 w-8 text-center">No</th>
                <th className="border border-black px-2 py-2 text-left">Nama Lengkap</th>
                
                {/* Mode: Mingguan/Bulanan (Daily Grid) */}
                {printType !== 'semester' && Array.from({ length: (new Date(rekapData.endDate).getDate() - new Date(rekapData.startDate).getDate() + 1) }).map((_, i) => (
                  <th key={i} className="border border-black px-0.5 py-2 w-6 text-center">
                    {new Date(new Date(rekapData.startDate).getTime() + i * 24 * 60 * 60 * 1000).getDate()}
                  </th>
                ))}

                {/* Mode: Semester (Monthly Totals) */}
                {printType === 'semester' && (() => {
                  const months = [];
                  const curr = new Date(rekapData.startDate);
                  while (curr <= new Date(rekapData.endDate)) {
                    months.push(new Date(curr));
                    curr.setMonth(curr.getMonth() + 1);
                  }
                  return months.map((m, i) => (
                    <th key={i} className="border border-black px-1 py-2 text-center text-[7pt]">
                      {m.toLocaleDateString('id-ID', { month: 'short' })}
                      <div className="flex justify-between mt-1 border-t border-black/20 pt-1">
                        <span className="w-1/4">H</span>
                        <span className="w-1/4">I</span>
                        <span className="w-1/4">S</span>
                        <span className="w-1/4">A</span>
                      </div>
                    </th>
                  ));
                })()}

                <th className="border border-black px-1 py-2 w-10 text-center">Total
                  <div className="flex justify-between mt-1 border-t border-black/20 pt-1">
                    <span className="w-1/4">H</span>
                    <span className="w-1/4">I</span>
                    <span className="w-1/4">S</span>
                    <span className="w-1/4">A</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rekapData.students.map((s: any, index: number) => {
                const studentAttendance = rekapData.attendance.filter((a: any) => a.studentId === s.id);
                const semesterTotals = { H: 0, I: 0, S: 0, A: 0 };
                
                // Group by date to get daily status (Alpha > Sakit > Izin > Hadir)
                const dailyStatuses: Record<string, string> = {};
                studentAttendance.forEach((a: any) => {
                  if (!dailyStatuses[a.date]) {
                    dailyStatuses[a.date] = a.status;
                  } else {
                    const order = { 'Alpha': 4, 'Sakit': 3, 'Izin': 2, 'Hadir': 1 };
                    if (order[a.status as keyof typeof order] > order[dailyStatuses[a.date] as keyof typeof order]) {
                      dailyStatuses[a.date] = a.status;
                    }
                  }
                });

                // Calculate Totals
                Object.values(dailyStatuses).forEach(status => {
                  if (status === 'Hadir') semesterTotals.H++;
                  else if (status === 'Izin') semesterTotals.I++;
                  else if (status === 'Sakit') semesterTotals.S++;
                  else if (status === 'Alpha') semesterTotals.A++;
                });

                return (
                  <tr key={s.id}>
                    <td className="border border-black px-1 py-1 text-center">{index + 1}</td>
                    <td className="border border-black px-2 py-1 uppercase text-[7pt] font-medium truncate max-w-[120px]">{s.name}</td>
                    
                    {/* Weekly/Monthly Daily Cells */}
                    {printType !== 'semester' && Array.from({ length: Math.floor((new Date(rekapData.endDate).getTime() - new Date(rekapData.startDate).getTime()) / (1000 * 3600 * 24) + 1) }).map((_, i) => {
                      const currentDate = new Date(new Date(rekapData.startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      const displayStatus = dailyStatuses[currentDate] || "";
                      const statusMap: Record<string, string> = { 'Hadir': 'H', 'Izin': 'I', 'Sakit': 'S', 'Alpha': 'A' };
                      return (
                        <td key={i} className={`border border-black px-0.5 py-1 text-center text-[7pt] ${displayStatus === 'Alpha' ? 'bg-red-50' : ''}`}>
                          {statusMap[displayStatus] || ""}
                        </td>
                      );
                    })}

                    {/* Semester Monthly Summaries */}
                    {printType === 'semester' && (() => {
                      const months = [];
                      const curr = new Date(rekapData.startDate);
                      while (curr <= new Date(rekapData.endDate)) {
                        months.push(new Date(curr));
                        curr.setMonth(curr.getMonth() + 1);
                      }
                      
                      return months.map((m, i) => {
                        const monthTotals = { H: 0, I: 0, S: 0, A: 0 };
                        const monthKey = m.toISOString().substring(0, 7); // "YYYY-MM"
                        
                        Object.keys(dailyStatuses).forEach(date => {
                          if (date.startsWith(monthKey)) {
                            const status = dailyStatuses[date];
                            if (status === 'Hadir') monthTotals.H++;
                            else if (status === 'Izin') monthTotals.I++;
                            else if (status === 'Sakit') monthTotals.S++;
                            else if (status === 'Alpha') monthTotals.A++;
                          }
                        });

                        return (
                          <td key={i} className="border border-black px-1 py-1 text-center text-[7pt]">
                            <div className="flex justify-between gap-1">
                              <span className="w-1/4">{monthTotals.H || "-"}</span>
                              <span className="w-1/4 text-indigo-600">{monthTotals.I || "-"}</span>
                              <span className="w-1/4 text-amber-600">{monthTotals.S || "-"}</span>
                              <span className="w-1/4 text-red-600 font-bold">{monthTotals.A || "-"}</span>
                            </div>
                          </td>
                        );
                      });
                    })()}

                    {/* Semester/Range Totals */}
                    <td className="border border-black px-1 py-1 text-center bg-slate-50">
                      <div className="flex justify-between gap-1 text-[7pt] font-black">
                        <span className="w-1/4">{semesterTotals.H}</span>
                        <span className="w-1/4 text-indigo-600">{semesterTotals.I}</span>
                        <span className="w-1/4 text-amber-600">{semesterTotals.S}</span>
                        <span className="w-1/4 text-red-600">{semesterTotals.A}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-8 grid grid-cols-2 text-center text-[9pt]">
            <div></div>
            <div className="space-y-16">
              <div>
                <p>Banyuwangi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold">Wali Kelas</p>
              </div>
              <div>
                <p className="font-bold underline">{classrooms.find(c => c.id === classId)?.teacherName || '................................................'}</p>
                <p>NIPY. {classrooms.find(c => c.id === classId)?.teacherNip || '....................................'}</p>
              </div>
            </div>
          </div>
      </div>
    )}

    <Modal
      isOpen={isPrintModalOpen}
      onClose={() => setIsPrintModalOpen(false)}
      title="Opsi Cetak Presensi"
      size="xl"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button 
            onClick={() => setPrintType('daily')}
            className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border-2 transition-all group ${printType === 'daily' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-2xl shadow-indigo-600/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 bg-white dark:bg-slate-900'}`}
          >
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${printType === 'daily' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              <Calendar size={32} strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p className={`text-lg font-black tracking-tight ${printType === 'daily' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>Harian</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Satu Hari</p>
            </div>
          </button>

          <button 
            onClick={() => setPrintType('weekly')}
            className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border-2 transition-all group ${printType === 'weekly' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-2xl shadow-indigo-600/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 bg-white dark:bg-slate-900'}`}
          >
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${printType === 'weekly' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              <Layout size={32} strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p className={`text-lg font-black tracking-tight ${printType === 'weekly' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>Mingguan</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tujuh Hari</p>
            </div>
          </button>

          <button 
            onClick={() => setPrintType('monthly')}
            className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border-2 transition-all group ${printType === 'monthly' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-2xl shadow-indigo-600/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 bg-white dark:bg-slate-900'}`}
          >
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${printType === 'monthly' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              <FileText size={32} strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p className={`text-lg font-black tracking-tight ${printType === 'monthly' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>Bulanan</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Satu Bulan</p>
            </div>
          </button>

          <button 
            onClick={() => setPrintType('semester')}
            className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border-2 transition-all group ${printType === 'semester' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-2xl shadow-indigo-600/10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 bg-white dark:bg-slate-900'}`}
          >
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${printType === 'semester' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
              <BookOpen size={32} strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <p className={`text-lg font-black tracking-tight ${printType === 'semester' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>Semester</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enam Bulan</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={() => setIsPrintModalOpen(false)}
            className="flex-1 px-8 py-4.5 rounded-[1.5rem] text-sm font-black text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
          >
            Batalkan
          </button>
          <button 
            onClick={handlePrint}
            disabled={isFetchingRekap}
            className="flex-[2] flex items-center justify-center gap-3 px-8 py-4.5 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {isFetchingRekap ? <Loader2 className="animate-spin" size={22} /> : <Printer size={22} strokeWidth={2.5} />}
            <span>Konfirmasi & Cetak Laporan</span>
          </button>
        </div>
      </div>
    </Modal>
</>
  );
};

export default PresenceManagement;
