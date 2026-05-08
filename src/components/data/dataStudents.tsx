import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  User, 
  Home, 
  X, 
  Phone, 
  GraduationCap,
  Baby,
  ChevronRight,
  Eye,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Pagination from '../ui/pagination';
import Modal from '../ui/modal';


// --- Types ---
type StudentStatus = 'Aktif' | 'Alumni' | 'Drop Out';
type Gender = 'Laki-laki' | 'Perempuan';

interface Student {
  id: string;
  nis: string;
  name: string;
  gender: Gender;
  class: string;
  dormitory: string;
  parentName: string;
  phone: string;
  status: StudentStatus;
  address: string;
  avatar?: string;
  birthDate: string;
}

// --- Mock Data ---
const initialStudents: Student[] = [
  { 
    id: '1', 
    nis: '2023001', 
    name: 'Muhammad Al-Fatih', 
    gender: 'Laki-laki', 
    class: '1-Ula A', 
    dormitory: 'Sunan Ampel',
    parentName: 'Budi Santoso', 
    phone: '081234567890', 
    status: 'Aktif', 
    address: 'Jl. Merdeka No. 10, Semarang',
    birthDate: '2010-05-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatih'
  },
  { 
    id: '2', 
    nis: '2023002', 
    name: 'Siti Aminah', 
    gender: 'Perempuan', 
    class: '1-Ula B', 
    dormitory: 'Siti Khadijah',
    parentName: 'Ahmad Dahlan', 
    phone: '081398765432', 
    status: 'Aktif', 
    address: 'Perum Gading Elok Blok B-02',
    birthDate: '2011-08-20',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminah'
  },
  { 
    id: '3', 
    nis: '2022045', 
    name: 'Zaid bin Haritsah', 
    gender: 'Laki-laki', 
    class: '2-Wustha A', 
    dormitory: 'Sunan Kalijaga',
    parentName: 'Umar bin Khattab', 
    phone: '081555443322', 
    status: 'Aktif', 
    address: 'Dusun Krajan RT 01 RW 02',
    birthDate: '2009-02-10',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zaid'
  },
  { 
    id: '4', 
    nis: '2021102', 
    name: 'Fathimah Az-Zahra', 
    gender: 'Perempuan', 
    class: '1-Ulya A', 
    dormitory: 'Siti Aisyah',
    parentName: 'Ali bin Abi Thalib', 
    phone: '082233445566', 
    status: 'Aktif', 
    address: 'Jl. Pemuda No. 45',
    birthDate: '2008-11-25',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fathimah'
  },
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

interface StudentManagementProps {
  initialData?: Student[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  statusFilter: string;
  genderFilter: string;
  classFilter: string;
  uniqueClasses: string[];
  user?: any;
}


const StudentManagement: React.FC<StudentManagementProps> = ({ 
  initialData,
  currentPage: initialCurrentPage,
  totalPages: initialTotalPages,
  totalCount: initialTotalCount,
  searchQuery: initialSearchQuery = '',
  statusFilter: initialStatusFilter = 'All',
  genderFilter: initialGenderFilter = 'All',
  classFilter: initialClassFilter = 'All',
  uniqueClasses,
  user
}) => {

  const [students, setStudents] = useState<Student[]>(initialData || []);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [genderFilter, setGenderFilter] = useState(initialGenderFilter);
  const [classFilter, setClassFilter] = useState(initialClassFilter);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{message?: string, error?: string, details?: {row: number, column: string, message: string}[]} | null>(null);

  // Live Search Effect
  useEffect(() => {
    // If everything matches initial state AND we are on page 1, we can use initialData instantly
    const isInitialState = searchQuery === '' && 
                          statusFilter === 'All' && 
                          genderFilter === 'All' && 
                          classFilter === 'All' && 
                          currentPage === 1;

    if (isInitialState && initialData) {
        setStudents(initialData);
        setTotalPages(initialTotalPages);
        setTotalCount(initialTotalCount);
        // Update URL to clean state
        const url = new URL(window.location.href);
        ['search', 'status', 'gender', 'class', 'page'].forEach(k => url.searchParams.delete(k));
        window.history.pushState({}, '', url.toString());
        return;
    }

    // Skip first run if query is same as initial to avoid redundant fetch on mount
    if (searchQuery === initialSearchQuery && 
        statusFilter === initialStatusFilter && 
        genderFilter === initialGenderFilter && 
        classFilter === initialClassFilter && 
        currentPage === initialCurrentPage) {
        return;
    }

    const fetchStudents = async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (statusFilter !== 'All') params.set('status', statusFilter);
        if (genderFilter !== 'All') params.set('gender', genderFilter);
        if (classFilter !== 'All') params.set('class', classFilter);
        params.set('page', currentPage.toString());

        const response = await fetch(`/api/students/search?${params.toString()}`);
        const result = await response.json();
        
        if (response.ok) {
          setStudents(result.data);
          setTotalPages(result.pagination.totalPages);
          setTotalCount(result.pagination.totalCount);
          
          // Update URL without reload
          const url = new URL(window.location.href);
          params.forEach((value, key) => url.searchParams.set(key, value));
          
          // Cleanup URL
          if (statusFilter === 'All') url.searchParams.delete('status');
          if (genderFilter === 'All') url.searchParams.delete('gender');
          if (classFilter === 'All') url.searchParams.delete('class');
          if (!searchQuery) url.searchParams.delete('search');
          if (currentPage === 1) url.searchParams.delete('page');
          
          window.history.pushState({}, '', url.toString());
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsSearching(false);
      }
    };

    // If search is cleared, fetch immediately. Otherwise debounce.
    const delay = searchQuery === '' ? 0 : 500;
    const timer = setTimeout(() => {
      fetchStudents();
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, genderFilter, classFilter, currentPage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const response = await fetch('/api/students/import', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));
      setImportResult({ message: data.message });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      try {
        const errorData = JSON.parse(err.message);
        setImportResult({ error: errorData.error || 'Gagal melakukan import', details: errorData.details });
      } catch { setImportResult({ error: err.message }); }
    } finally { setIsImporting(false); }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter !== 'All') params.set('status', statusFilter);
    if (genderFilter !== 'All') params.set('gender', genderFilter);
    if (classFilter !== 'All') params.set('class', classFilter);
    window.location.href = `/api/students/export?${params.toString()}`;
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'All') count++;
    if (genderFilter !== 'All') count++;
    if (classFilter !== 'All') count++;
    return count;
  }, [statusFilter, genderFilter, classFilter]);

  const updateFilters = (newParams: Record<string, string>) => {
    if (newParams.search !== undefined) setSearchQuery(newParams.search);
    if (newParams.status !== undefined) setStatusFilter(newParams.status);
    if (newParams.gender !== undefined) setGenderFilter(newParams.gender);
    if (newParams.class !== undefined) setClassFilter(newParams.class);
    if (newParams.page !== undefined) setCurrentPage(parseInt(newParams.page));
    // Reset page to 1 if filter changes but not page
    if (newParams.page === undefined) setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setGenderFilter('All');
    setClassFilter('All');
    setCurrentPage(1);
  };

  const stats = useMemo(() => {
    return { 
      total: totalCount, 
      active: students.filter(s => s.status === 'Aktif').length, 
      male: students.filter(s => s.gender === 'Laki-laki').length, 
      female: students.filter(s => s.gender === 'Perempuan').length 
    };
  }, [totalCount, students]);

  const statusStyles: Record<StudentStatus, string> = {
    'Aktif': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    'Alumni': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
    'Drop Out': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
  };

  return (
    <AdminPanel title="Master Data Santri" activeItem="Data Santri" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Santri" value={stats.total} icon={<Users size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
          <StatCard label="Santri Aktif" value={stats.active} icon={<GraduationCap size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
          <StatCard label="Santri Putra" value={stats.male} icon={<User size={24}/>} colorClass="text-blue-600" bgColor="bg-blue-600" />
          <StatCard label="Santri Putri" value={stats.female} icon={<Baby size={24}/>} colorClass="text-rose-600" bgColor="bg-rose-600" />
        </div>

        {/* Action Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative w-full max-w-md group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all duration-300">
                  {isSearching ? <span className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></span> : <Search size={18} />}
                </span>
                <input
                  type="text"
                  className="block w-full pl-12 pr-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all dark:text-white placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="Cari Nama atau NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Toggle Button */}
              <button 
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold border transition-all active:scale-95 relative h-[50px] ${
                  isFilterVisible || activeFilterCount > 0
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Filter size={18} className={isFilterVisible || activeFilterCount > 0 ? 'text-white' : 'text-slate-400'} />
                <span>Filter</span>
                {activeFilterCount > 0 && !isFilterVisible && (
                  <span className="ml-1 w-5 h-5 bg-white text-indigo-600 text-[10px] flex items-center justify-center rounded-full font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsImportModalOpen(true); setImportResult(null); setImportFile(null); }}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <a 
                href="/students/add"
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Tambah Santri</span>
              </a>
            </div>

          </div>

          {/* Expanded Filters */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden transition-all duration-500 ease-in-out ${
            isFilterVisible ? 'max-h-[500px] mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50 opacity-100' : 'max-h-0 opacity-0 mt-0 pt-0'
          }`}>
            {/* Class Filter */}
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Jenjang / Kelas</label>
               <div className="relative group">
                <select 
                  className="block w-full pl-5 pr-12 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all dark:text-slate-200 appearance-none cursor-pointer"
                  value={classFilter}
                  onChange={(e) => updateFilters({ class: e.target.value })}
                >
                  <option value="All">Semua Kelas</option>
                  {uniqueClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
               </div>
            </div>

            {/* Gender Filter */}
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Jenis Kelamin</label>
               <div className="relative group">
                <select 
                  className="block w-full pl-5 pr-12 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all dark:text-slate-200 appearance-none cursor-pointer"
                  value={genderFilter}
                  onChange={(e) => updateFilters({ gender: e.target.value })}
                >
                  <option value="All">Semua Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
               </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Status Keaktifan</label>
               <div className="relative group">
                <select 
                  className="block w-full pl-5 pr-12 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all dark:text-slate-200 appearance-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                >
                  <option value="All">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Drop Out">Drop Out</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
               </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
               <button 
                 onClick={clearFilters}
                 disabled={activeFilterCount === 0 && searchQuery === ''}
                 className="flex items-center justify-center gap-2.5 w-full py-3.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-500 transition-all border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-900/10"
               >
                 <X size={16} />
                 <span>Reset Filter</span>
               </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Santri</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penempatan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Detail & Wali</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {students.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all duration-300 group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm overflow-hidden flex-shrink-0 group-hover:shadow-md group-hover:scale-105 transition-all duration-500">
                            <img 
                              src={item.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${item.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-md">{item.nis}</span>
                             <span className={`text-[10px] font-bold ${item.gender === 'Laki-laki' ? 'text-blue-500' : 'text-rose-500'}`}>{item.gender}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-transform group-hover:rotate-12">
                              <GraduationCap size={14} />
                           </div>
                           <span className="text-xs font-black text-slate-700 dark:text-slate-200 tracking-tight">{item.class}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:-rotate-12">
                              <Home size={14} />
                           </div>
                           <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.dormitory}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-indigo-400 opacity-50"></div>
                             <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">Wali: {item.parentName}</span>
                          </div>
                          <div className="flex items-center gap-2 pl-4">
                             <Phone size={12} className="text-slate-300" />
                             <span className="text-[11px] font-bold text-slate-400 tracking-wider font-mono">{item.phone}</span>
                          </div>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border-2 shadow-sm inline-block min-w-[90px] ${statusStyles[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                          <a href={`/students/detail/${item.id}`} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700" title="Detail">
                            <Eye size={16} />
                          </a>
                          <a href={`/students/edit/${item.id}`} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700" title="Edit">
                            <Edit2 size={16} />
                          </a>
                          <button className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700" title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length > 0 && (
            <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalCount)} dari {totalCount} Santri
              </p>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page: number) => updateFilters({ page: page.toString() })}
              />
            </div>
          )}
          {students.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
               <Users size={64} className="mb-4 opacity-10" />
               <p className="text-sm font-bold">Data santri tidak ditemukan</p>
               <p className="text-xs font-medium opacity-60">Coba gunakan kata kunci pencarian lain.</p>
            </div>
          )}
        </div>

        {/* Import Modal */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => !isImporting && setIsImportModalOpen(false)}
          title="Import Data Santri"
          description="Tambahkan data santri secara massal melalui file Excel."
          size="xl"
        >
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Side: Instructions & Template */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                    Instruksi Import
                  </h4>
                  <ul className="space-y-3">
                    {[
                      "Gunakan template resmi yang tersedia di bawah.",
                      "Pastikan kolom NIS dan Nama Lengkap terisi.",
                      "Format tanggal lahir adalah YYYY-MM-DD.",
                      "Maksimal ukuran file adalah 5MB."
                    ].map((text, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-[10px] font-black text-slate-400">{i + 1}</span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-500/5 dark:to-transparent border border-indigo-100/50 dark:border-indigo-500/10 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-indigo-600/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-50 dark:border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                      <FileSpreadsheet size={28} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-black text-slate-800 dark:text-slate-200 leading-tight">Template Excel</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Unduh format yang didukung</p>
                    </div>
                    <a 
                      href="/api/students/template" 
                      download
                      className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 transition-all active:scale-90"
                      title="Download Template"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                </div>
              </div>

              {/* Right Side: Upload Area */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Unggah File
                </h4>
                
                <div className={`relative h-full group`}>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    id="excel-upload"
                    disabled={isImporting}
                  />
                  <div className={`h-full border-3 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center text-center transition-all duration-500 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden relative ${
                    importFile 
                      ? 'border-emerald-500/50 bg-emerald-50/30 dark:border-emerald-500/30 dark:bg-emerald-500/5' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5'
                  }`}>
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 ${
                      importFile 
                        ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 rotate-12' 
                        : 'bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-400 group-hover:scale-110 group-hover:-rotate-6'
                    }`}>
                      {importFile ? <FileSpreadsheet size={36} /> : <Upload size={36} />}
                    </div>

                    {importFile ? (
                      <div className="animate-in fade-in zoom-in duration-500">
                        <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[250px]">{importFile.name}</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-bold px-4 py-1.5 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-full inline-block">File Siap Diproses</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-black text-slate-700 dark:text-slate-300">Tarik file ke sini</p>
                        <p className="text-sm text-slate-400 mt-2 font-medium">atau klik untuk menelusuri folder</p>
                        <div className="mt-6 px-5 py-2 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-700">Format .xlsx • Max 5MB</div>
                      </>
                    )}
                    
                    {/* Animated background shapes */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback & Actions */}
            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
              {(importResult?.error || importResult?.message) && (
                <div className={`p-5 rounded-2xl text-sm font-bold border animate-in slide-in-from-top-2 duration-500 ${
                  importResult.error 
                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' 
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                }`}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${importResult.error ? 'bg-rose-100 dark:bg-rose-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'}`}>
                        {importResult.error ? <X size={18} /> : <GraduationCap size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-black">{importResult.error || importResult.message}</p>
                        {importResult.message && <p className="text-[10px] opacity-70 mt-0.5 italic font-medium">Halaman akan dimuat ulang secara otomatis...</p>}
                      </div>
                    </div>

                    {importResult.details && importResult.details.length > 0 && (
                      <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto pr-2 supreme-scrollbar">
                        <p className="text-[10px] uppercase tracking-widest text-rose-400 font-black mb-2">Detail Kesalahan Kolom:</p>
                        {importResult.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-rose-100/50 dark:border-rose-500/10 group hover:border-rose-300 transition-colors">
                            <div className="flex-shrink-0 w-12 text-center py-1 bg-rose-100 dark:bg-rose-500/20 rounded-lg text-[10px] font-black text-rose-600">
                              Baris {detail.row}
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-none mb-1">{detail.column}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">{detail.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-8 py-4 text-sm font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95 uppercase tracking-widest"
                  disabled={isImporting}
                >
                  Batal
                </button>
                <button 
                  onClick={handleImport}
                  disabled={!importFile || isImporting}
                  className={`flex-1 py-4 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest rounded-2xl transition-all text-white shadow-2xl ${
                    !importFile || isImporting 
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 active:scale-[0.98]'
                  }`}
                >
                  {isImporting ? (
                    <>
                      <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Memproses Data...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Mulai Proses Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Modal>

      </div>
    </AdminPanel>
  );
};

export default StudentManagement;

