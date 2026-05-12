import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  School, 
  Clock, 
  Calendar,
  ChevronRight,
  LayoutGrid,
  Library,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Modal from '../ui/modal';
import Pagination from '../ui/pagination';
import { useNotification } from '../ui/notification';

interface SchoolClass {
  id: string;
  name: string;
  level: string | null;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string | null;
}

interface Teacher {
  id: string;
  name: string;
  nip: string | null;
  avatar: string | null;
}

interface TeachingAssignment {
  id: string;
  teacherId: string;
  teacher: Teacher;
  subject: Subject;
  class: SchoolClass;
  day: string;
  period: string;
  session: number;
}
interface TeachingManagementProps {
  initialData: TeachingAssignment[];
  totalCount: number;
  subjects: Subject[];
  teachers: Teacher[];
  classrooms: SchoolClass[];
  currentPage: number;
  totalPages: number;
  searchQuery?: string;
  classFilter?: string;
  user?: any;
}



// --- Sub-components ---
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; colorClass: string; bgColor: string }> = ({ label, value, icon, colorClass, bgColor }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4 group transition-all hover:shadow-md relative overflow-hidden">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgColor} bg-opacity-10 dark:bg-opacity-20 ${colorClass} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">{label}</p>
      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{value}</h3>
    </div>
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${bgColor} opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
  </div>
);

const TeachingManagement: React.FC<TeachingManagementProps> = ({
  initialData,
  totalCount,
  subjects,
  teachers,
  classrooms,
  currentPage,
  totalPages,
  searchQuery: initialSearchQuery = '',
  classFilter: initialClassFilter = 'All',
  user
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeachingAssignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<TeachingAssignment | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [classFilter, setClassFilter] = useState(initialClassFilter);
  
  const { success, warning } = useNotification();

  useEffect(() => {
    const url = new URL(window.location.href);
    const toast = url.searchParams.get('toast');
    if (toast) {
      if (toast === 'added') success('Berhasil! Penugasan pengajar telah ditambahkan.');
      if (toast === 'updated') success('Berhasil! Penugasan pengajar telah diperbarui.');
      if (toast === 'deleted') warning('Terhapus! Penugasan telah dihapus dari jadwal.');
      
      url.searchParams.delete('toast');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const updateFilters = (newParams: Record<string, string>) => {
    const url = new URL(window.location.href);
    if (!newParams.page) url.searchParams.delete('page');
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === 'All' || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.location.href = url.pathname + url.search;
  };

  const stats = useMemo(() => ({
    total: totalCount,
    subjects: subjects.length,
    teachers: teachers.length,
    classes: classrooms.length,
  }), [totalCount, subjects, teachers, classrooms]);

  const getSubjectIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Library': return <Library size={18} />;
      case 'BookOpen': return <BookOpen size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  return (
    <AdminPanel title="Manajemen Pengajaran" activeItem="Pengajaran" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 mt-5 space-y-8">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Pengajaran" value={stats.total} icon={<LayoutGrid size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
          <StatCard label="Mata Pelajaran" value={stats.subjects} icon={<BookOpen size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
          <StatCard label="Guru Aktif" value={stats.teachers} icon={<Users size={24}/>} colorClass="text-amber-600" bgColor="bg-amber-600" />
          <StatCard label="Kelas Pengajaran" value={stats.classes} icon={<School size={24}/>} colorClass="text-slate-600" bgColor="bg-slate-600" />
        </div>

        {/* Action Header */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              <div className="relative w-full max-w-md group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="block w-full pl-12 pr-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none dark:text-slate-200"
                  placeholder="Cari guru..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters({ search: searchQuery })}
                />
              </div>

              <div className="relative w-full sm:max-w-[200px] group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                   <Filter size={18} />
                </span>
                <select 
                  className="block w-full pl-11 pr-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-sm font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-slate-200"
                  value={classFilter}
                  onChange={(e) => updateFilters({ class: e.target.value })}
                >
                  <option value="All">Semua Kelas</option>
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setEditingAssignment(null); setIsModalOpen(true); }}
              className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap h-[50px]"
            >
              <Plus size={20} />
              <span>Tambah Penempatan</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pengajar</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mata Pelajaran</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Kelas</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Penugasan</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {initialData.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-300 group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 ring-2 ring-slate-100 dark:ring-slate-700 shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105 transition-all">
                          <img 
                            src={assignment.teacher?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${assignment.teacher?.name}`} 
                            alt={assignment.teacher?.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{assignment.teacher?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{assignment.teacher?.nip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          {getSubjectIcon(assignment.subject?.icon)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight uppercase">{assignment.subject?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 tracking-widest">{assignment.subject?.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 inline-block min-w-[70px]">
                        {assignment.class?.name}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{assignment.day}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Clock size={12} className="text-slate-400" />
                          <span>{assignment.period} (Jam Ke-{assignment.session})</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => { setEditingAssignment(assignment); setIsModalOpen(true); }}
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeletingAssignment(assignment)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700" 
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        {initialData.length > 0 && (
          <div className="px-10 py-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[32px] shadow-sm mb-12">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalCount)} dari {totalCount} Penugasan
            </p>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => updateFilters({ page: p.toString() })}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingAssignment && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-xl shadow-rose-500/10">
                  <Trash2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 text-center">Hapus Penugasan?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-4 text-center">
                  Anda akan menghapus jadwal pengajaran <span className="font-bold text-slate-800 dark:text-slate-200">{deletingAssignment.teacher?.name}</span> untuk mapel <span className="font-bold text-slate-800 dark:text-slate-200">{deletingAssignment.subject?.name}</span>.
                </p>
              </div>
              <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
                <button onClick={() => setDeletingAssignment(null)} className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Batal</button>
                <form action="/master-data/teaching" method="POST" className="flex-1">
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="id" value={deletingAssignment.id} />
                  <button type="submit" className="w-full px-6 py-3.5 bg-rose-600 text-white rounded-2xl text-sm font-black hover:bg-rose-700 shadow-xl shadow-rose-600/20 transition-all transform active:scale-95">Hapus Data</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal (Supreme Landscape) */}
        <Modal
          isOpen={isModalOpen}
          size="supreme"
          onClose={() => { setIsModalOpen(false); setEditingAssignment(null); }}
          title={editingAssignment ? "Edit Penempatan Pengajar" : "Atur Pengajaran Baru"}
          description={editingAssignment ? "Perbarui informasi jadwal pengajaran guru." : "Hubungkan guru, mata pelajaran, dan kelas dalam satu sistem."}
          footer={
            <>
              <button 
                type="button" 
                onClick={() => { setIsModalOpen(false); setEditingAssignment(null); }} 
                className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="teaching-form" 
                className="px-10 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center gap-2"
              >
                <Plus size={18} />
                <span>{editingAssignment ? "Simpan Perubahan" : "Simpan Penugasan"}</span>
              </button>
            </>
          }
        >
          <form id="teaching-form" action="/master-data/teaching" method="POST" className="space-y-8">
            <input type="hidden" name="_action" value={editingAssignment ? "edit" : "add"} />
            {editingAssignment && <input type="hidden" name="id" value={editingAssignment.id} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: People & Subject */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <UserCheck size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Guru & Mata Pelajaran</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Guru Pengajar</label>
                    <select 
                      name="teacherId"
                      defaultValue={editingAssignment?.teacherId}
                      required
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200 appearance-none pointer-events-auto"
                    >
                      <option disabled selected={!editingAssignment}>Pilih Asatidz...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Mata Pelajaran</label>
                    <select 
                      name="subjectId"
                      defaultValue={editingAssignment?.subject.id}
                      required
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200 appearance-none pointer-events-auto"
                    >
                      <option disabled selected={!editingAssignment}>Pilih Pelajaran...</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Class & Time */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <School size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Target Kelas & Jadwal</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Target Kelas</label>
                    <select 
                      name="classroomId"
                      defaultValue={editingAssignment?.class.id}
                      required
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200 appearance-none pointer-events-auto"
                    >
                      <option disabled selected={!editingAssignment}>Pilih Kelas...</option>
                      {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Hari</label>
                      <select 
                        name="day"
                        defaultValue={editingAssignment?.day || "Senin"}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200 appearance-none pointer-events-auto"
                      >
                        <option>Senin</option>
                        <option>Selasa</option>
                        <option>Rabu</option>
                        <option>Kamis</option>
                        <option>Sabtu</option>
                        <option>Ahad</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Waktu / Jam</label>
                      <input 
                        name="period"
                        type="text" 
                        defaultValue={editingAssignment?.period}
                        required
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200" 
                        placeholder="07:30 - 09:00" 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between pl-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sesi (Jam Ke)</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const checkboxes = document.querySelectorAll<HTMLInputElement>('input[name="session"]');
                          const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                          checkboxes.forEach(cb => cb.checked = !allChecked);
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider transition-colors"
                      >
                        Pilih Semua
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((num) => (
                        <label key={num} className="relative flex items-center justify-center p-4 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all has-[:checked]:bg-indigo-600 has-[:checked]:border-indigo-600 has-[:checked]:text-white group">
                          <input 
                            type="checkbox" 
                            name="session" 
                            value={num} 
                            defaultChecked={editingAssignment?.session === num || (!editingAssignment && num === 1)}
                            className="sr-only" 
                          />
                          <span className="text-sm font-black uppercase tracking-widest">Jam {num}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-3xl flex items-start gap-4 transition-all hover:bg-white dark:hover:bg-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 leading-relaxed italic text-center">
                    Periksa kembali jadwal bentrok untuk guru yang sama pada hari dan waktu yang direncanakan.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </AdminPanel>
  );
};

export default TeachingManagement;
