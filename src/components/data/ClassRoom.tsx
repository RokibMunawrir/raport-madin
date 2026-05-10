import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  UserCheck, 
  GraduationCap, 
  X, 
  ChevronRight,
  School,
  UserPlus,
  CheckCircle2,
  AlertCircle} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Modal from '../ui/modal';
import { useNotification } from '../ui/notification';

// --- Types ---

interface SchoolClass {
  id: string;
  name: string;
  level: string | null;
  room: string | null;
  teacherId: string | null;
  teacherName: string | null;
  teacherNip: string | null;
  teacherAvatar: string | null;
  capacity: number | null;
}

interface Teacher {
  id: string;
  name: string;
  nip: string | null;
  avatar: string | null;
}

interface Student {
  id: string;
  nis: string;
  name: string;
  gender: string | null;
  avatar: string | null;
  status: string | null;
}

interface AcademicYear {
  id: string;
  name: string;
  semester: string;
}

interface ClassRoomManagementProps {
  initialClassrooms: SchoolClass[];
  teachers: Teacher[];
  initialStudents: Student[];
  unassignedStudents: Student[];
  activeYear: AcademicYear | null;
  initialSelectedClassId: string;
  user?: any;
}



// --- Sub-components ---
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; colorClass: string; bgColor: string; progress?: number }> = ({ label, value, icon, colorClass, bgColor, progress }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md relative overflow-hidden group">
    <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgColor} bg-opacity-10 dark:bg-opacity-20 ${colorClass} group-hover:scale-110 transition-transform`}>
        {icon}
        </div>
        <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{value}</h3>
        </div>
    </div>
    {progress !== undefined && (
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden mt-2">
            <div 
                className={`h-full transition-all duration-1000 ${colorClass.replace('text-', 'bg-')}`} 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    )}
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${bgColor} opacity-[0.03] dark:opacity-[0.05] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
  </div>
);

const ClassRoomManagement: React.FC<ClassRoomManagementProps> = ({ 
  initialClassrooms: classes,
  teachers: availableTeachers,
  initialStudents: classStudents,
  unassignedStudents,
  activeYear,
  initialSelectedClassId,
  user
}) => {

  const [selectedClassId, setSelectedClassId] = useState(initialSelectedClassId);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [searchUnassigned, setSearchUnassigned] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const { success, warning } = useNotification();

  useEffect(() => {
    const url = new URL(window.location.href);
    const toast = url.searchParams.get('toast');
    if (toast) {
      if (toast === 'homeroom_updated') success('Berhasil! Wali Kelas telah diperbarui.');
      if (toast === 'assigned') success('Berhasil! Santri telah ditempatkan ke kelas.');
      if (toast === 'unassigned') warning('Santri telah dikeluarkan dari kelas.');
      if (toast === 'no_active_year') warning('Peringatan! Tidak ada Tahun Ajaran yang aktif. Silakan aktifkan di menu Tahun Akademik.');
      
      url.searchParams.delete('toast');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const changeClass = (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('classId', id);
    window.location.href = url.pathname + url.search;
  };

  // Derrived Data
  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId) || classes[0], [selectedClassId, classes]);
  
  const filteredClassStudents = useMemo(() => {
    return classStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.nis.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = genderFilter === 'All' || s.gender === genderFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [classStudents, searchQuery, genderFilter, statusFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== 'All') count++;
    if (statusFilter !== 'All') count++;
    return count;
  }, [genderFilter, statusFilter]);

  const filteredUnassigned = useMemo(() => {
    return unassignedStudents.filter(s => 
      s.name.toLowerCase().includes(searchUnassigned.toLowerCase()) || 
      s.nis.toLowerCase().includes(searchUnassigned.toLowerCase())
    );
  }, [unassignedStudents, searchUnassigned]);

  const stats = useMemo(() => {
    const total = classStudents.length;
    const capacity = selectedClass?.capacity || 0;
    const male = classStudents.filter(s => s.gender === 'Laki-laki' || s.gender === 'Putra').length;
    const female = classStudents.filter(s => s.gender === 'Perempuan' || s.gender === 'Putri').length;
    const occupancy = capacity > 0 ? Math.round((total / capacity) * 100) : 0;
    return { total, capacity, male, female, occupancy };
  }, [classStudents, selectedClass]);

  if (!selectedClass) {
    return (
      <AdminPanel title="Manajemen Penempatan Kelas" activeItem="Penempatan Kelas" user={user}>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                <School size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 italic">Belum Ada Data Kelas</h3>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest max-w-sm">SiIakan tambahkan data kelas terlebih dahulu di menu Parameter Kelas.</p>
        </div>
      </AdminPanel>
    );
  }

  return (
    <AdminPanel title="Manajemen Penempatan Kelas" activeItem="Penempatan Kelas" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 mt-6 space-y-8 mt-5">
        
        {/* Class Selection Ribbon */}
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                        <School className="text-indigo-600" size={24} />
                        Pilih Kelas
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">TAHUN AJARAN: {activeYear?.name || '-'} / {activeYear?.semester || '-'}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                    <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-black text-indigo-900 dark:text-indigo-300 tracking-tighter">Sistem Penempatan Aktif</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                {classes.map(c => (
                    <button
                        key={c.id}
                        onClick={() => changeClass(c.id)}
                        className={`group relative flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-3xl border transition-all duration-300 active:scale-95 ${
                            selectedClassId === c.id 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/30' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/30'
                        }`}
                    >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                            selectedClassId === c.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-indigo-500'
                        }`}>
                            <GraduationCap size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black tracking-tight">{c.name}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedClassId === c.id ? 'text-white/70' : 'text-slate-400'}`}>{c.level}</p>
                        </div>
                        {selectedClassId === c.id && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* Action Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative w-full max-w-md group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-all duration-300">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="block w-full pl-12 pr-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all dark:text-white placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="Cari Nama atau NIS Santri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Toggle Button */}
              <button 
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold border transition-all active:scale-95 relative h-[52px] ${
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
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Tambah Santri</span>
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden transition-all duration-500 ease-in-out ${
            isFilterVisible ? 'max-h-[500px] mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50 opacity-100' : 'max-h-0 opacity-0 mt-0 pt-0'
          }`}>
            {/* Gender Filter */}
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Jenis Kelamin</label>
               <div className="relative group">
                <select 
                  className="block w-full pl-5 pr-12 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all dark:text-slate-200 appearance-none cursor-pointer"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
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
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Status Santri</label>
               <div className="relative group">
                <select 
                  className="block w-full pl-5 pr-12 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all dark:text-slate-200 appearance-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
               </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
               <button 
                 onClick={() => { setGenderFilter('All'); setStatusFilter('All'); setSearchQuery(''); }}
                 disabled={activeFilterCount === 0 && searchQuery === ''}
                 className="flex items-center justify-center gap-2.5 w-full py-3.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-500 transition-all border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-900/10"
               >
                 <X size={16} />
                 <span>Reset Filter</span>
               </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Stats and Teacher */}
            <div className="lg:col-span-1 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    <StatCard label="Total Santri" value={stats.total} icon={<Users size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" progress={stats.occupancy} />
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard label="Putra" value={stats.male} icon={<Users size={18}/>} colorClass="text-blue-500" bgColor="bg-blue-500" />
                        <StatCard label="Putri" value={stats.female} icon={<Users size={18}/>} colorClass="text-rose-500" bgColor="bg-rose-500" />
                    </div>
                </div>

                {/* Teacher Card */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wali Kelas</h4>
                            <button 
                                onClick={() => setIsTeacherModalOpen(true)}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-indigo-600 transition-all active:scale-90" 
                                title="Ganti Wali Kelas"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-slate-900 ring-4 ring-slate-50 dark:ring-slate-700/50 shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    <img 
                                        src={selectedClass.teacherAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedClass.teacherName}`} 
                                        alt={selectedClass.teacherName || 'Guru'} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg border-4 border-white dark:border-slate-800">
                                    <UserCheck size={16} />
                                </div>
                            </div>
                            <div>
                                <h5 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">{selectedClass.teacherName || 'Belum Ditentukan'}</h5>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">{selectedClass.teacherNip || '-'}</p>
                            </div>
                            
                            <div className="w-full pt-6 mt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ruangan</p>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">{selectedClass.room || '-'}</p>
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Maks Konten</p>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200">{selectedClass.capacity} Kursi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side: Students Table */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Santri</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Gender</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filteredClassStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-300 group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 ring-2 ring-slate-100 dark:ring-slate-700 shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105 transition-all">
                                                    <img 
                                                        src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} 
                                                        alt={student.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 transition-colors">{student.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{student.nis}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${student.gender === 'Laki-laki' ? 'text-blue-500' : 'text-rose-500'}`}>
                                                {student.gender}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <form action="/master-data/placement" method="POST">
                                                    <input type="hidden" name="_action" value="unassign_student" />
                                                    <input type="hidden" name="studentId" value={student.id} />
                                                    <input type="hidden" name="classroomId" value={selectedClass.id} />
                                                    <button 
                                                        type="submit"
                                                        className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all" 
                                                        title="Keluarkan dari kelas"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredClassStudents.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-300">
                                <Users size={40} />
                            </div>
                            <h6 className="text-sm font-black text-slate-500 tracking-tight">Tidak ada santri ditemukan</h6>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest text-center max-w-[200px]">Silakan tambah santri ke kelas ini menggunakan tombol di atas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Assign Student Modal (Supreme Landscape) */}
        <Modal
          isOpen={isAssignModalOpen}
          size="supreme"
          onClose={() => setIsAssignModalOpen(false)}
          title="Penempatan Santri Baru"
          description={`Daftar santri yang belum memiliki kelas di Tahun Ajaran ${activeYear?.name || '-'}.`}
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
              <div className="relative group flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Cari santri..."
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200"
                  value={searchUnassigned}
                  onChange={(e) => setSearchUnassigned(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedStudentIds.length === filteredUnassigned.length) {
                    setSelectedStudentIds([]);
                  } else {
                    setSelectedStudentIds(filteredUnassigned.map(s => s.id));
                  }
                }}
                className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-indigo-300 transition-all active:scale-95 whitespace-nowrap"
              >
                {selectedStudentIds.length === filteredUnassigned.length && filteredUnassigned.length > 0 ? "Batal Semua" : "Pilih Semua"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
              {filteredUnassigned.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center">
                  <CheckCircle2 size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">Semua santri telah memiliki kelas</p>
                </div>
              ) : (
                filteredUnassigned.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds([...selectedStudentIds, student.id]);
                            } else {
                              setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                            }
                          }}
                        />
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden ring-2 ring-slate-50 dark:ring-slate-700/50">
                        <img src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.nis} • {student.gender}</p>
                      </div>
                    </div>
                    <form action="/master-data/placement" method="POST">
                      <input type="hidden" name="_action" value="assign_student" />
                      <input type="hidden" name="studentId" value={student.id} />
                      <input type="hidden" name="classroomId" value={selectedClass.id} />
                      <button 
                        type="submit"
                        className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                      >
                        <Plus size={18} />
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>

            {selectedStudentIds.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center justify-between p-4 bg-indigo-600 rounded-2xl shadow-lg ring-4 ring-indigo-600/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{selectedStudentIds.length} Santri Terpilih</p>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Siap didaftarkan kolektif</p>
                  </div>
                </div>
                <form action="/master-data/placement" method="POST">
                  <input type="hidden" name="_action" value="bulk_assign_student" />
                  <input type="hidden" name="studentIds" value={selectedStudentIds.join(',')} />
                  <input type="hidden" name="classroomId" value={selectedClass.id} />
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95"
                  >
                    Daftarkan Kolektif
                  </button>
                </form>
              </div>
            )}
            
            <div className="p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-3xl flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600">
                  <AlertCircle size={20} />
               </div>
               <p className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-relaxed italic">
                 Santri yang sudah memiliki kelas di Tahun Ajaran ini tidak akan muncul di daftar ini. Kapasitas kelas saat ini: {stats.total} / {selectedClass?.capacity || 0}.
               </p>
            </div>
          </div>
        </Modal>

        {/* Change Wali Kelas Modal (Supreme Landscape) */}
        <Modal
          isOpen={isTeacherModalOpen}
          size="supreme"
          onClose={() => setIsTeacherModalOpen(false)}
          title="Pilih Wali Kelas"
          description={`Tentukan guru pendamping untuk kelas ${selectedClass.name}.`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto px-2 custom-scrollbar">
            {availableTeachers.map(teacher => (
              <form key={teacher.id} action="/master-data/placement" method="POST">
                <input type="hidden" name="_action" value="change_homeroom" />
                <input type="hidden" name="classId" value={selectedClass.id} />
                <input type="hidden" name="teacherId" value={teacher.id} />
                <button 
                  type="submit"
                  className={`w-full flex items-center justify-between p-5 rounded-[24px] border transition-all ${
                    teacher.id === selectedClass.teacherId
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 overflow-hidden ring-2 ring-slate-50 dark:ring-slate-700/50 shadow-sm">
                      <img src={teacher.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${teacher.name}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-black ${teacher.id === selectedClass.teacherId ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-100'}`}>{teacher.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{teacher.nip || '-'}</p>
                    </div>
                  </div>
                  {teacher.id === selectedClass.teacherId ? (
                    <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg ring-4 ring-indigo-600/20">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : (
                    <div className="text-slate-300 group-hover:text-indigo-400 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  )}
                </button>
              </form>
            ))}
          </div>
        </Modal>
      </div>
    </AdminPanel>
  );
};

export default ClassRoomManagement;
