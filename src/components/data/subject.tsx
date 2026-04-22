import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Library, 
  Award, 
  X, 
  CheckCircle2, 
  GraduationCap, 
  ChevronRight,
  LayoutGrid,
  Bookmark,
  FileText,
  BadgeCheck
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Modal from '../ui/modal';
import { useNotification } from '../ui/notification';

// --- Types ---
type SubjectCategory = 'Fiqh' | 'Hadits' | 'Aqidah' | 'Alat (Nahwu/Shorof)' | 'Sejarah' | 'Umum';

interface Subject {
  id: string;
  name: string;
  code: string;
  category: SubjectCategory | string | null;
  level: string | null;
  description: string | null;
  status: string | null;
  icon: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

interface SubjectManagementProps {
  initialSubjects: Subject[];
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

const SubjectManagement: React.FC<SubjectManagementProps> = ({ initialSubjects: subjects, user }) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const { success } = useNotification();

  useEffect(() => {
    const url = new URL(window.location.href);
    const toast = url.searchParams.get('toast');
    if (toast) {
      if (toast === 'created') success('Berhasil! Mata pelajaran baru telah ditambahkan.');
      if (toast === 'updated') success('Berhasil! Data mata pelajaran telah diperbarui.');
      if (toast === 'deleted') success('Berhasil! Mata pelajaran telah dihapus.');
      
      url.searchParams.delete('toast');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const handleEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const categoryStyles: Record<SubjectCategory, string> = {
    'Fiqh': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    'Hadits': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    'Aqidah': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
    'Alat (Nahwu/Shorof)': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
    'Sejarah': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    'Umum': 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-500/20',
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [subjects, searchQuery, categoryFilter]);

  const stats = useMemo(() => {
    const total = subjects.length;
    const categories = new Set(subjects.map(s => s.category)).size;
    const levels = new Set(subjects.flatMap(s => s.level?.split(',').map(l => l.trim()).filter(Boolean) || [])).size;
    const active = subjects.filter(s => s.status === 'Aktif').length;
    return { total, categories, levels, active };
  }, [subjects]);

  return (
    <AdminPanel title="Mata Pelajaran" activeItem="Mata Pelajaran" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 mt-5 space-y-8">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Mapel" value={stats.total} icon={<Library size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
          <StatCard label="Kategori" value={stats.categories} icon={<Bookmark size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
          <StatCard label="Jenjang" value={stats.levels} icon={<GraduationCap size={24}/>} colorClass="text-amber-600" bgColor="bg-amber-600" />
          <StatCard label="Aktif" value={stats.active} icon={<BadgeCheck size={24}/>} colorClass="text-slate-600" bgColor="bg-slate-600" />
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
                  className="block w-full pl-12 pr-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Cari nama atau kode mapel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative w-full sm:max-w-[200px] group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Filter size={18} />
                </span>
                <select 
                  className="block w-full pl-11 pr-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-sm font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Fiqh">Fiqh</option>
                  <option value="Hadits">Hadits</option>
                  <option value="Aqidah">Aqidah</option>
                  <option value="Alat (Nahwu/Shorof)">Nahwu/Shorof</option>
                  <option value="Sejarah">Sejarah</option>
                  <option value="Umum">Umum</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleAdd}
              className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap h-[50px]"
            >
              <Plus size={20} />
              <span>Tambah Mapel</span>
            </button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredSubjects.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-800 p-7 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${categoryStyles[item.category as SubjectCategory] || 'bg-slate-50 text-slate-500'}`}>
                            {item.category || 'Umum'}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-900 rounded-xl transition-all"><Edit2 size={16} /></button>
                            <form action="/master-data/subject" method="POST" onSubmit={(e) => !confirm('Hapus mata pelajaran ini?') && e.preventDefault()}>
                                <input type="hidden" name="_action" value="delete_subject" />
                                <input type="hidden" name="id" value={item.id} />
                                <button type="submit" className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-900 rounded-xl transition-all"><Trash2 size={16} /></button>
                            </form>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-tight">{item.name}</h4>
                            <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] mt-1">{item.code}</p>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                        {item.level?.split(',').map(l => l.trim()).filter(Boolean).map(l => (
                             <span key={l} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                                <GraduationCap size={12} />
                                {l}
                             </span>
                        ))}
                    </div>

                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-indigo-900 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700 pointer-events-none">
                        <FileText size={80} />
                    </div>
                </div>
            ))}

            {filteredSubjects.length === 0 && (
                 <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 border-dashed">
                    <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 text-slate-300">
                        <Bookmark size={40} />
                    </div>
                    <h6 className="text-sm font-black text-slate-500 tracking-tight">Tidak ada mata pelajaran ditemukan</h6>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Coba sesuaikan kata kunci atau filter categories.</p>
                 </div>
            )}
        </div>

        {/* Add/Edit Modal (Supreme Landscape) */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          size="supreme"
          title={editingSubject ? "Edit Mata Pelajaran" : "Mapel Baru"}
          description="Lengkapi detail mata pelajaran dan asatidz pengampu di bawah ini."
          footer={
            <>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="subject-form" 
                className="px-10 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                <FileText size={18} />
                <span>{editingSubject ? 'Simpan Perubahan' : 'Tambah Mapel'}</span>
              </button>
            </>
          }
        >
          <form id="subject-form" action="/master-data/subject" method="POST" className="space-y-8">
            <input type="hidden" name="_action" value={editingSubject ? "update_subject" : "add_subject"} />
            {editingSubject && <input type="hidden" name="id" value={editingSubject.id} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Mata Pelajaran</label>
                  <input 
                    name="name"
                    required
                    defaultValue={editingSubject?.name}
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm" 
                    placeholder="Masukkan nama mapel..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kode Mapel</label>
                    <input 
                      name="code"
                      required
                      defaultValue={editingSubject?.code}
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm uppercase" 
                      placeholder="CONTOH: FIQ-01" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
                    <select 
                      name="category"
                      defaultValue={editingSubject?.category || 'Umum'}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm appearance-none cursor-pointer"
                    >
                      <option>Fiqh</option>
                      <option>Hadits</option>
                      <option>Aqidah</option>
                      <option>Alat (Nahwu/Shorof)</option>
                      <option>Sejarah</option>
                      <option>Umum</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Jenjang (Pisahkan dengan koma)</label>
                  <input 
                    name="level"
                    defaultValue={editingSubject?.level || ''}
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm" 
                    placeholder="Contoh: Madrasah Ula, Madrasah Wustha" 
                  />
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Deskripsi Singkat</label>
                  <textarea 
                    name="description"
                    defaultValue={editingSubject?.description || ''}
                    rows={6} 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium resize-none leading-relaxed" 
                    placeholder="Masukkan keterangan lengkap mengenai mata pelajaran ini..."
                  ></textarea>
                </div>

                <div className="p-6 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600">
                    <BookOpen size={20} />
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    Gunakan kode yang unik untuk setiap mata pelajaran untuk mempermudah pencarian dan penugasan pengajar di masa mendatang.
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

export default SubjectManagement;

