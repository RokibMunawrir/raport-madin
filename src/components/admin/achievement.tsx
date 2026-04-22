import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Medal,
  Award,
  Globe,
  Map,
  X,
  Target
} from 'lucide-react';
import AdminPanel from '../ui/panel';

// --- Types ---
type AchievementLevel = 'Internasional' | 'Nasional' | 'Provinsi' | 'Kota/Kab' | 'Sekolah';
type AchievementCategory = 'Akademik' | 'Non-Akademik' | 'Hafalan';

interface StudentAchievement {
  id: string;
  studentName: string;
  avatar: string;
  nisn: string;
  title: string;
  level: AchievementLevel;
  category: AchievementCategory[];
  rank: string;
  date: string;
  points: number;
}

// --- Mock Data ---
const mockAchievements: StudentAchievement[] = [
  { id: '1', studentName: 'Aditama Arya', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditama', nisn: '00239102', title: 'Olimpiade Matematika Nasional', level: 'Nasional', category: ['Akademik'], rank: 'Juara 1', date: '2024-03-15', points: 100 },
  { id: '2', studentName: 'Bela Permata', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bela', nisn: '00239105', title: 'Lomba Pidato Bahasa Arab', level: 'Provinsi', category: ['Akademik'], rank: 'Juara 2', date: '2024-02-10', points: 75 },
  { id: '3', studentName: 'Candra Wijaya', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Candra', nisn: '00239110', title: 'Turnamen Futsal Cup', level: 'Kota/Kab', category: ['Non-Akademik'], rank: 'Juara 1', date: '2024-01-20', points: 50 },
  { id: '4', studentName: 'Dina Lestari', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dina', nisn: '00239115', title: 'Lomba Tahfidz Al-Quran', level: 'Internasional', category: ['Akademik', 'Hafalan'], rank: 'Finalis', date: '2024-03-01', points: 150 },
  { id: '5', studentName: 'Eko Prasetyo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eko', nisn: '00239120', title: 'Lomba Kaligrafi Kontemporer', level: 'Sekolah', category: ['Non-Akademik'], rank: 'Juara 3', date: '2023-12-15', points: 20 },
  { id: '6', studentName: 'Fani Rahayu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fani', nisn: '00239125', title: 'Lomba Karya Ilmiah Remaja', level: 'Provinsi', category: ['Akademik'], rank: 'Juara Harapan 1', date: '2024-03-20', points: 40 },
  { id: '7', studentName: 'Gilang Ramadhan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gilang', nisn: '00239130', title: 'Hafalan Juz 30', level: 'Sekolah', category: ['Hafalan'], rank: 'Lulus Mumtaz', date: '2024-04-05', points: 50 },
];

// --- Sub-components ---
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; colorClass: string; bgColor: string }> = ({ label, value, icon, colorClass, bgColor }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-md">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} bg-opacity-10 dark:bg-opacity-20 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{value}</h3>
    </div>
  </div>
);

interface StudentOption {
  id: string;
  name: string;
  nis: string;
}

interface AchievementManagementProps {
  initialData?: StudentAchievement[];
  students?: StudentOption[];
  memorizeTargets?: any[];
  activeYear?: { id: string; name: string };
  stats?: {
    total: number;
    akademikPoin: number;
    nonAkademikCount: number;
    nasionalCount: number;
  };
  user?: any;
}


const AchievementManagement: React.FC<AchievementManagementProps> = ({ 
  initialData = [], 
  students = [], 
  memorizeTargets = [],
  activeYear,
  stats = { total: 0, akademikPoin: 0, nonAkademikCount: 0, nasionalCount: 0 },
  user
}) => {

  const [achievements, setAchievements] = useState<StudentAchievement[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('toast') === 'added') import('../ui/notification').then(m => m.toast.success('Prestasi berhasil dicatat!'));
      if (params.get('toast') === 'deleted') import('../ui/notification').then(m => m.toast.warning('Prestasi berhasil dihapus!'));
      return '';
    }
    return '';
  });
  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "">("");
  
  const [formTitle, setFormTitle] = useState("");
  const [formPoints, setFormPoints] = useState(0);
  const [formRank, setFormRank] = useState("");
  const [formLevel, setFormLevel] = useState("Sekolah");
  const [selectedMemorizeTarget, setSelectedMemorizeTarget] = useState("");
  
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return [];
    return students.filter(s => 
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.nis.includes(studentSearch)
    ).slice(0, 5);
  }, [studentSearch, students]);
  
  const toggleCategory = (cat: AchievementCategory) => {
    setSelectedCategory(cat);
    if (cat !== 'Hafalan') {
        setSelectedMemorizeTarget("");
    }
  };

  const handleMemorizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    setSelectedMemorizeTarget(targetId);
    const target = memorizeTargets.find(t => t.id === targetId);
    if (target) {
        setFormTitle(`Hafal ${target.title}`);
        setFormPoints(target.points || 0);
    }
  };

  const handleRankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Muhafadzoh') {
        setFormRank('Selesai');
    } else {
        setFormRank(val);
    }
  };

  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      const matchesSearch = a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || a.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || a.category.includes(categoryFilter as AchievementCategory);
      const matchesLevel = levelFilter === 'All' || a.level === levelFilter;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchQuery, categoryFilter, levelFilter, achievements]);

  const levelStyles: Record<AchievementLevel, string> = {
    'Internasional': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
    'Nasional': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    'Provinsi': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    'Kota/Kab': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    'Sekolah': 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-500/20',
  };

  return (
    <AdminPanel title="Prestasi Siswa" activeItem="Prestasi" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Prestasi" value={stats.total} icon={<Trophy size={24}/>} colorClass="text-amber-600" bgColor="bg-amber-600" />
          <StatCard label="Poin Akademik" value={stats.akademikPoin} icon={<GraduationCap size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
          <StatCard label="Non-Akademik" value={stats.nonAkademikCount} icon={<Award size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
          <StatCard label="Tingkat Nasional" value={stats.nasionalCount} icon={<Target size={24}/>} colorClass="text-rose-600" bgColor="bg-rose-600" />
        </div>

        {/* Action Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="Cari Siswa atau Lomba..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  className="block min-w-[140px] px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm outline-none transition-all dark:text-slate-300"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Non-Akademik">Non-Akademik</option>
                  <option value="Hafalan">Hafalan</option>
                </select>
                
                <select 
                  className="block min-w-[140px] px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm outline-none transition-all dark:text-slate-300"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="All">Semua Tingkat</option>
                  <option value="Internasional">Internasional</option>
                  <option value="Nasional">Nasional</option>
                  <option value="Provinsi">Provinsi</option>
                  <option value="Kota/Kab">Kota/Kab</option>
                  <option value="Sekolah">Sekolah</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95"
              >
                <Plus size={18} />
                <span>Tambah Prestasi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Achievement Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Siswa & Prestasi</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tingkat</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Hasil</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Poin</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredAchievements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900 transition-all">
                          <img src={item.avatar} alt={item.studentName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 flex items-center flex-wrap gap-2">
                            {item.title}
                            <span className="flex items-center gap-1">
                              {item.category.map(cat => (
                                <span key={cat} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                                  {cat}
                                </span>
                              ))}
                            </span>
                          </p>
                          <p className="text-xs text-slate-400 font-medium">{item.studentName} • {item.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${levelStyles[item.level]}`}>
                        {item.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                        {item.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10"></div>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200">+{item.points}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all" title="Detail">
                          <Eye size={16} />
                        </button>
                        <form method="POST">
                          <input type="hidden" name="action" value="delete" />
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all" title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Achievement Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Catat Prestasi Baru</h3>
                    <p className="text-xs font-medium text-slate-400">Dokumentasikan pencapaian gemilang siswa.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-700 transition-all">
                    <X size={20} />
                </button>
              </div>
              <form method="POST" className="p-8 space-y-6">
                 <input type="hidden" name="action" value="add" />
                 <input type="hidden" name="studentId" value={selectedStudent} />
                 <input type="hidden" name="category" value={selectedCategory} />

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Student Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Pilih Siswa</label>
                            <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Search size={16} />
                            </span>
                            <input 
                                type="text" 
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                                placeholder="Cari nama siswa..." 
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                            />
                            
                            {filteredStudents.length > 0 && !selectedStudent && (
                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                                {filteredStudents.map(s => (
                                    <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedStudent(s.id);
                                        setStudentSearch(s.name);
                                    }}
                                    className="w-full px-5 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border-b border-slate-100 last:border-0"
                                    >
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{s.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">NIS: {s.nis}</p>
                                    </button>
                                ))}
                                </div>
                            )}
                            </div>
                            {selectedStudent && (
                            <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 italic">Siswa Terpilih: {students.find(s => s.id === selectedStudent)?.name}</span>
                                <button type="button" onClick={() => setSelectedStudent("")} className="text-rose-500 hover:text-rose-600"><X size={14}/></button>
                            </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Kategori Prestasi</label>
                            <div className="flex flex-wrap gap-2">
                            {(['Akademik', 'Non-Akademik', 'Hafalan'] as AchievementCategory[]).map(cat => (
                                <button
                                key={cat}
                                type="button"
                                onClick={() => toggleCategory(cat)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                    selectedCategory === cat
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                                }`}
                                >
                                {cat}
                                </button>
                            ))}
                            </div>
                        </div>

                        {selectedCategory === 'Hafalan' && (
                            <div className="space-y-2 animate-in slide-in-from-left-2 duration-300">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Target Hafalan</label>
                                <select 
                                    className="w-full px-4 py-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-bold text-emerald-700 dark:text-emerald-400 appearance-none"
                                    value={selectedMemorizeTarget}
                                    onChange={handleMemorizeChange}
                                >
                                    <option value="">Pilih Target Hafalan</option>
                                    {memorizeTargets.map(t => <option key={t.id} value={t.id}>{t.title} ({t.points} Poin)</option>)}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Judul Prestasi / Hafalan</label>
                            <input 
                                name="title" 
                                required 
                                type="text" 
                                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium" 
                                placeholder="Contoh: Juara 1 MTK / Hafalan Juz 30" 
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Tingkat</label>
                                <select 
                                    name="level" 
                                    value={formLevel}
                                    onChange={(e) => setFormLevel(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-slate-300"
                                >
                                    <option>Sekolah</option>
                                    <option>Kota/Kab</option>
                                    <option>Provinsi</option>
                                    <option>Nasional</option>
                                    <option>Internasional</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Hasil / Peringkat</label>
                                <div className="space-y-2">
                                    <select 
                                        className="w-full px-4 py-3 text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none text-slate-600 dark:text-slate-300 mb-1"
                                        onChange={handleRankChange}
                                    >
                                        <option value="">Cepat pilih...</option>
                                        <option value="Muhafadzoh">Muhafadzoh (Selesai)</option>
                                        <option value="Juara 1">Juara 1</option>
                                        <option value="Juara 2">Juara 2</option>
                                        <option value="Juara 3">Juara 3</option>
                                        <option value="Harapan 1">Harapan 1</option>
                                        <option value="Finalis">Finalis</option>
                                    </select>
                                    <input 
                                        name="rank" 
                                        required 
                                        type="text" 
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                                        placeholder="Tulis manual jika perlu..." 
                                        value={formRank}
                                        onChange={(e) => setFormRank(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Tanggal</label>
                                <input name="date" required type="date" className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-slate-300" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Poin Apresiasi</label>
                                <input 
                                    name="score" 
                                    required 
                                    type="number" 
                                    className="w-full px-4 py-3.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-black text-indigo-600 dark:text-indigo-400" 
                                    placeholder="0" 
                                    value={formPoints}
                                    onChange={(e) => setFormPoints(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Keterangan Tambahan (Opsional)</label>
                            <textarea name="description" rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none" placeholder="Detail prestasi..."></textarea>
                        </div>
                    </div>
                 </div>

                  <div className="px-0 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3 -mx-8 -mb-6 px-8 rounded-b-3xl">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all">Batal</button>
                      <button type="submit" disabled={!selectedStudent} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50">
                        <Award size={18} />
                        <span>Simpan Prestasi</span>
                      </button>
                  </div>
               </form>
            </div>
          </div>
        )}
      </div>
    </AdminPanel>
  );
};

export default AchievementManagement;
