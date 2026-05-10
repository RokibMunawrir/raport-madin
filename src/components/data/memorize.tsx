import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  BookMarked,
  LayoutGrid,
  FileText,
  Target,
  Award,
  ArrowUpDown
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Modal from '../ui/modal';
import { useNotification } from '../ui/notification';

// --- Types ---
type MemorizeCategory = 'Al-Quran' | 'Surat Pendek' | 'Doa Harian' | 'Hadits';
type ClassLevel = 'Madrasah Ula' | 'Madrasah Wustha' | 'Madrasah Ulya';

interface MemorizeTarget {
  id: string;
  title: string;
  category: MemorizeCategory | string;
  levels: string | null; // Comma separated in DB
  points: number | null;
  description: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

interface MemorizeManagementProps {
  initialTargets: MemorizeTarget[];
  sortBy?: string;
  sortOrder?: string;
  user?: any;
}



// --- Sub-components ---
const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; colorClass: string; bgColor: string }> = ({ label, value, icon, colorClass, bgColor }) => (
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
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${bgColor} opacity-[0.03] dark:opacity-[0.05] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
  </div>
);

const MemorizeManagement: React.FC<MemorizeManagementProps> = ({ 
  initialTargets: data, 
  sortBy = 'title',
  sortOrder = 'asc',
  user 
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MemorizeTarget | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const updateFilters = (newParams: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === 'All' || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.location.href = url.pathname + url.search;
  };

  const { success } = useNotification();

  useEffect(() => {
    const url = new URL(window.location.href);
    const toast = url.searchParams.get('toast');
    if (toast) {
      if (toast === 'created') success('Berhasil! Target hafalan baru telah ditambahkan.');
      if (toast === 'updated') success('Berhasil! Data target hafalan telah diperbarui.');
      if (toast === 'deleted') success('Berhasil! Target hafalan telah dihapus.');
      
      url.searchParams.delete('toast');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MemorizeTarget) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [data, searchQuery, categoryFilter]);

  const stats = useMemo(() => {
    const total = data.length;
    const quran = data.filter(d => d.category === 'Al-Quran').length;
    const doa = data.filter(d => d.category === 'Doa Harian' || d.category === 'Surat Pendek').length;
    const avgPoints = data.length ? Math.round(data.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0) / data.length) : 0;
    return { total, quran, doa, avgPoints };
  }, [data]);

  return (
    <AdminPanel title="Target Hafalan" activeItem="Master Data" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 mt-6 space-y-8">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Target" value={stats.total} icon={<BookOpen size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
          <StatCard label="Target Al-Quran" value={stats.quran} icon={<BookMarked size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
          <StatCard label="Opsi Pendek & Doa" value={stats.doa} icon={<CheckCircle2 size={24}/>} colorClass="text-amber-600" bgColor="bg-amber-600" />
          <StatCard label="Rata-rata Poin" value={stats.avgPoints} icon={<Award size={24}/>} colorClass="text-rose-600" bgColor="bg-rose-600" />
        </div>

        {/* Action Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative w-full sm:max-w-xs group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="Cari Target Hafalan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="relative w-full sm:max-w-[200px] group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Filter size={18} />
                </span>
                <select 
                  className="block w-full pl-12 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all dark:text-slate-300 appearance-none"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Al-Quran">Al-Quran</option>
                  <option value="Surat Pendek">Surat Pendek</option>
                  <option value="Doa Harian">Doa Harian</option>
                  <option value="Hadits">Hadits</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all transform active:scale-95"
              >
                <Plus size={18} />
                <span>Tambah Target</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <button 
                      onClick={() => updateFilters({ sortBy: 'title', sortOrder: sortBy === 'title' && sortOrder === 'asc' ? 'desc' : 'asc' })}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      Judul Hafalan
                      <ArrowUpDown size={12} className={sortBy === 'title' ? 'text-indigo-600' : 'opacity-30'} />
                    </button>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Tingkat</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reward Poin</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</p>
                          <p className="text-[11px] font-medium text-slate-400 mt-1 truncate max-w-[200px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.levels?.split(',').map(lvl => lvl.trim()).filter(Boolean).map((lvl) => (
                          <span key={lvl} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-100 dark:border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest">
                            {lvl.replace('Madrasah ', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className="inline-flex items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-500/20">
                          <Target size={12} />
                          <span className="text-xs font-black">{item.points} PTS</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(item)} className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl transition-all" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <form action="/master-data/memorize" method="POST" onSubmit={(e) => !confirm('Hapus target hafalan ini?') && e.preventDefault()}>
                            <input type="hidden" name="_action" value="delete_target" />
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-all" title="Hapus">
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
          {filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Tidak ada target hafalan ditemukan.</p>
            </div>
          )}
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          size="supreme"
          title={editingItem ? "Edit Target Hafalan" : "Target Hafalan Baru"}
          description="Atur jenis hafalan dan kelas berapa saja yang wajib menyelesaikannya."
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
                form="memorize-form" 
                className="px-10 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                <FileText size={18} />
                <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Target'}</span>
              </button>
            </>
          }
        >
          <form id="memorize-form" action="/master-data/memorize" method="POST" className="space-y-8">
            <input type="hidden" name="_action" value={editingItem ? "update_target" : "add_target"} />
            {editingItem && <input type="hidden" name="id" value={editingItem.id} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Judul Hafalan</label>
                  <input 
                    name="title"
                    defaultValue={editingItem?.title}
                    required
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" 
                    placeholder="Contoh: Surat Al-Mulk" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
                    <select 
                      name="category"
                      defaultValue={editingItem?.category || 'Al-Quran'}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold dark:text-white appearance-none cursor-pointer"
                    >
                      <option>Al-Quran</option>
                      <option>Surat Pendek</option>
                      <option>Doa Harian</option>
                      <option>Hadits</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Reward Poin</label>
                    <input 
                      name="points"
                      defaultValue={editingItem?.points ?? 0}
                      type="number" 
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Penempatan Kelas (Pisahkan dengan koma)</label>
                  <input 
                    name="levels"
                    defaultValue={editingItem?.levels || ''}
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" 
                    placeholder="Contoh: Ula, Wustha, Ulya" 
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Deskripsi Tambahan</label>
                  <textarea 
                    name="description"
                    defaultValue={editingItem?.description || ''}
                    rows={8} 
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium resize-none leading-relaxed" 
                    placeholder="Masukkan batas minimal hafalan, halaman, atau penjelasan rinci..."
                  ></textarea>
                </div>
              </div>
            </div>

          </form>
        </Modal>
      </div>
    </AdminPanel>
  );
};

export default MemorizeManagement;

