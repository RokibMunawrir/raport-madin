import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  School, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCheck,
  ChevronDown,
  LayoutGrid,
  Check,
  AlertCircle,
  HelpCircle,
  MoreVertical} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Pagination from '../ui/pagination';
import Modal from '../ui/modal';
import { toast } from '../ui/notification';

// --- Types ---
type ClassLevel = 'MDT ULA' | 'MDT WUSTHA' | 'MDT ULYA';
type Gender = 'Putra' | 'Putri';

export interface SchoolClass {
  id: string;
  name: string;
  level: string;
  room: string;
  teacherId: string | null;
  teacherName: string | null;
  studentCount: number;
  capacity: number;
  gender: string;
}

interface Teacher {
  id: string;
  name: string;
}

interface ClassManagementProps {
  initialClasses: SchoolClass[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  putraCount: number;
  putriCount: number;
  teachers: Teacher[];
  searchQuery?: string;
  levelFilter?: string;
  genderFilter?: string;
  user?: any;
}


// --- Sub-components ---
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; colorClass: string; bgColor: string }> = ({ label, value, icon, colorClass, bgColor }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-md relative overflow-hidden group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgColor} bg-opacity-10 dark:bg-opacity-20 ${colorClass} group-hover:rotate-6 transition-transform`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{value}</h3>
    </div>
    <div className={`absolute -right-4 -bottom-4 w-16 h-16 ${bgColor} opacity-[0.03] rounded-full blur-xl`}></div>
  </div>
);

// --- Searchable Teacher Select ---
const SearchableTeacherSelect: React.FC<{ 
  teachers: Teacher[]; 
  value: string; 
  onChange: (id: string, name: string) => void;
}> = ({ teachers, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTeacher = teachers.find(t => t.id === value);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-200"
      >
        <span className={selectedTeacher ? "" : "text-slate-400"}>
          {selectedTeacher ? selectedTeacher.name : "Pilih Wali Kelas"}
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[60] w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                autoFocus
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-xs"
                placeholder="Cari nama guru..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map(teacher => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => {
                    onChange(teacher.id, teacher.name);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left text-xs font-bold ${
                    value === teacher.id ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{teacher.name}</span>
                  {value === teacher.id && <Check size={14} className="text-indigo-600" />}
                </button>
              ))
            ) : (
              <div className="p-5 text-center text-xs text-slate-400">Guru tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ClassManagement: React.FC<ClassManagementProps> = ({
  initialClasses,
  currentPage,
  totalPages,
  totalCount,
  putraCount,
  putriCount,
  teachers,
  searchQuery: initialSearchQuery = '',
  levelFilter: initialLevelFilter = 'All',
  genderFilter: initialGenderFilter = 'All',
  user
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [levelFilter, setLevelFilter] = useState(initialLevelFilter);
  const [genderFilter, setGenderFilter] = useState(initialGenderFilter);

  // Stats calculate based on visible data or passed from server - here we use the totalCount for display
  const stats = useMemo(() => {
    const total = totalCount;
    const totalStudents = initialClasses.reduce((acc, curr) => acc + curr.studentCount, 0); 
    return { total, totalStudents };
  }, [totalCount, initialClasses]);

  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const toastType = url.searchParams.get("toast");
    if (toastType) {
      if (toastType === "created") toast.success("Kelas berhasil didaftarkan");
      if (toastType === "updated") toast.success("Konfigurasi kelas telah diperbarui");
      if (toastType === "deleted") toast.success("Kelas telah dihapus dari sistem");
      
      url.searchParams.delete("toast");
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const [formState, setFormState] = useState<Partial<SchoolClass>>({
    name: '',
    level: 'MDT ULA',
    room: '',
    teacherId: '',
    teacherName: '',
    capacity: 30,
    gender: 'Putra'
  });

  const handleAddMode = () => {
    setEditingClass(null);
    setFormState({
      name: '',
      level: 'MDT ULA',
      room: '',
      teacherId: '',
      teacherName: '',
      capacity: 30,
      gender: 'Putra'
    });
    setIsModalOpen(true);
  };

  const handleEditMode = (cls: SchoolClass) => {
    setEditingClass(cls);
    setFormState(cls);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan.")) {
        const formData = new FormData();
        formData.append("_action", "delete_class");
        formData.append("id", id);
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = window.location.pathname + window.location.search;
        for (const [key, value] of formData.entries()) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
    }
  };

  const levelStyles: Record<string, string> = {
    'MDT ULA': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    'MDT WUSTHA': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
    'MDT ULYA': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
  };

  const genderStyles: Record<string, string> = {
    'Putra': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    'Putri': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
  };

  const updateFilters = (newParams: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === 'All' || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    // Reset to page 1 when filter changes
    if (!newParams.page) url.searchParams.set('page', '1');
    window.location.href = url.pathname + url.search;
  };


  return (
    <AdminPanel title="Master Data Kelas" activeItem="Akademik" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Kelas" value={stats.total} icon={<School size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
          <StatCard label="Kelas Putra" value={putraCount} icon={<Users size={24}/>} colorClass="text-blue-600" bgColor="bg-blue-600" />
          <StatCard label="Kelas Putri" value={putriCount} icon={<Users size={24}/>} colorClass="text-rose-600" bgColor="bg-rose-600" />
          <StatCard label="Total Santri" value={stats.totalStudents} icon={<GraduationCap size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
        </div>

        {/* Action Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="Cari Kelas atau Wali..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters({ search: searchQuery })}
                />
              </div>

              {/* Level Filter */}
              <div className="relative w-full sm:max-w-[180px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Filter size={18} />
                </span>
                <select 
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-sm font-bold outline-none transition-all dark:text-slate-300 appearance-none focus:ring-4 focus:ring-indigo-500/10"
                  value={levelFilter}
                  onChange={(e) => updateFilters({ level: e.target.value })}
                >
                  <option value="All">Semua Jenjang</option>
                  <option value="MDT ULA">MDT ULA</option>
                  <option value="MDT WUSTHA">MDT WUSTHA</option>
                  <option value="MDT ULYA">MDT ULYA</option>
                </select>
              </div>

              {/* Gender Filter */}
              <div className="relative w-full sm:max-w-[150px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LayoutGrid size={18} />
                </span>
                <select 
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-sm font-bold outline-none transition-all dark:text-slate-300 appearance-none focus:ring-4 focus:ring-indigo-500/10"
                  value={genderFilter}
                  onChange={(e) => updateFilters({ gender: e.target.value })}
                >
                  <option value="All">Semua Tipe</option>
                  <option value="Putra">Putra</option>
                  <option value="Putri">Putri</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleAddMode}
              className="flex items-center justify-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-[20px] text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all transform active:scale-95"
            >
              <Plus size={20} />
              <span>Tambah Kelas</span>
            </button>
          </div>
        </div>

        {/* Class Table */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Informasi Kelas</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Karakteristik</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wali Kelas</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Kapasitas</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {initialClasses.map((item) => {
                  const isFull = item.studentCount >= item.capacity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all duration-300 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 ${item.gender === 'Putra' ? 'text-blue-500' : 'text-rose-500'}`}>
                            <BookOpen size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-indigo-600 transition-colors uppercase">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.room}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border w-fit ${levelStyles[item.level] || ''}`}>
                            {item.level}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border w-fit ${genderStyles[item.gender] || ''}`}>
                            {item.gender}
                            </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 border-2 border-white dark:border-slate-800 shadow-sm">
                              {item.teacherName?.split(' ')[1]?.[0] || '?'}{item.teacherName?.split(' ')[2]?.[0] || ''}
                           </div>
                           <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.teacherName || 'Belum ditunjuk'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`text-xs font-black ${isFull ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
                            {item.studentCount} / {item.capacity}
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-[1px]">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} 
                              style={{ width: `${(item.studentCount / item.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button 
                            onClick={() => handleEditMode(item)}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm transition-all active:scale-90" title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm transition-all active:scale-90" title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Integration */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400">
                Menampilkan <span className="text-slate-800 dark:text-slate-100 font-black">{initialClasses.length}</span> dari <span className="text-slate-800 dark:text-slate-100 font-black">{totalCount}</span> Kelas
            </p>
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                baseUrl={window.location.pathname + window.location.search}
            />
        </div>

        {/* Refactored Add Class Modal using Supreme Modal Component */}
        <Modal
          isOpen={isModalOpen}
          size="supreme"
          onClose={() => setIsModalOpen(false)}
          title={editingClass ? "Edit Konfigurasi Kelas" : "Tambah Kelas Baru"}
          description={editingClass ? "Perbarui parameter dan wali kelas pengampu" : "Lengkapi identitas kelompok belajar pangkalan data"}
          footer={
            <>
              <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-8 py-3.5 text-sm font-black text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-all uppercase tracking-widest"
              >
                  Batal
              </button>
              <button 
                  type="submit"
                  form="class-form"
                  className="px-12 py-4 bg-indigo-600 text-white rounded-[22px] text-sm font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center gap-3"
              >
                  <UserCheck size={20} />
                  <span>Resmikan Kelas</span>
              </button>
            </>
          }
        >
          <form id="class-form" method="POST" action={window.location.pathname + window.location.search}>
            <input type="hidden" name="_action" value={editingClass ? "update_class" : "add_class"} />
            {editingClass && <input type="hidden" name="id" value={editingClass.id} />}
            <input type="hidden" name="gender" value={formState.gender} />
            <input type="hidden" name="teacherId" value={formState.teacherId || ''} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {/* Left Column: Basic Identity */}
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between pl-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Kelas</label>
                            <span className="text-[9px] font-bold text-indigo-500 italic">Contoh: 1 A ULA</span>
                        </div>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <BookOpen size={20} />
                            </span>
                            <input 
                                type="text" 
                                required
                                className="w-full pl-14 pr-5 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-black text-slate-700 dark:text-slate-200" 
                                placeholder="Masukkan Nama Kelas"
                                name="name"
                                value={formState.name}
                                onChange={(e) => setFormState({...formState, name: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Jenjang Madrasah</label>
                            <div className="relative">
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-300 appearance-none pointer-events-auto"
                                    value={formState.level}
                                    name="level"
                                    onChange={(e) => setFormState({...formState, level: e.target.value as ClassLevel})}
                                >
                                    <option value="MDT ULA">MDT ULA</option>
                                    <option value="MDT WUSTHA">MDT WUSTHA</option>
                                    <option value="MDT ULYA">MDT ULYA</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Tipe Kelas</label>
                            <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 min-h-[64px]">
                                <button 
                                    type="button"
                                    onClick={() => setFormState({...formState, gender: 'Putra'})}
                                    className={`flex-1 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formState.gender === 'Putra' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Putra
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormState({...formState, gender: 'Putri'})}
                                    className={`flex-1 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formState.gender === 'Putri' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Putri
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Alokasi Ruangan</label>
                        <input 
                            type="text" 
                            name="room"
                            className="w-full px-6 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" 
                            placeholder="Contoh: Gedung Lantai 1" 
                            value={formState.room}
                            onChange={(e) => setFormState({...formState, room: e.target.value})}
                        />
                    </div>
                </div>

                {/* Right Column: Wali Kelas & Capacity */}
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pl-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wali Kelas (Asatidz)</label>
                            <HelpCircle size={14} className="text-slate-300" />
                        </div>
                        <SearchableTeacherSelect 
                            teachers={teachers} 
                            value={formState.teacherId || ''} 
                            onChange={(id, name) => setFormState({...formState, teacherId: id, teacherName: name})}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Maksimum Kapasitas</label>
                        <div className="flex items-center gap-5">
                            <input 
                                type="range" 
                                min="15" 
                                max="50" 
                                step="1"
                                className="flex-1 accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-900 rounded-full appearance-none cursor-pointer"
                                value={formState.capacity}
                                onChange={(e) => setFormState({...formState, capacity: parseInt(e.target.value)})}
                            />
                            <input type="hidden" name="capacity" value={formState.capacity} />
                            <div className="w-20 text-center px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-500/30 rounded-2xl">
                                <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">{formState.capacity}</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 italic">Disarankan 25-30 kursi per kelas untuk kenyamanan belajar.</p>
                    </div>

                    {/* Information Preview */}
                    <div className="p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-4 shadow-inner">
                        <div className="flex items-start gap-4">
                            <AlertCircle size={20} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-black text-slate-700 dark:text-slate-200 tracking-tight">Ringkasan Konfigurasi</p>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                Kelas <span className="font-bold text-indigo-600">{formState.name || '...'}</span> ({formState.gender}) di jenjang <span className="font-bold text-indigo-600">{formState.level}</span> akan diampu oleh <span className="font-bold text-indigo-600">{formState.teacherName || '...'}</span> dengan kapasitas <span className="font-bold text-indigo-600">{formState.capacity} santri</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </form>
        </Modal>
      </div>
    </AdminPanel>
  );
};

export default ClassManagement;

