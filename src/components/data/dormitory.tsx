import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  MapPin, 
  X, 
  Building2, 
  ArrowUpRight,
  LayoutGrid,
  MoreHorizontal,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Modal from '../ui/modal';
import Pagination from '../ui/pagination';
import { useNotification } from '../ui/notification';

interface Dormitory {
  id: string;
  name: string;
  block: string;
  category: 'Putra' | 'Putri';
  capacity: number;
  filled: number;
  supervisor: string;
  roomCode: string;
}
interface DormitoryManagementProps {
  initialData: Dormitory[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  searchQuery?: string;
  blockFilter?: string;
  categoryFilter?: string;
  sortBy?: string;
  sortOrder?: string;
  user?: any;
}


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

const DormitoryManagement: React.FC<DormitoryManagementProps> = ({
  initialData,
  totalCount,
  totalPages,
  currentPage,
  searchQuery: initialSearchQuery = '',
  blockFilter: initialBlockFilter = 'All',
  categoryFilter: initialCategoryFilter = 'All',
  sortBy = 'name',
  sortOrder = 'asc',
  user
}) => {

  const [dorms, setDorms] = useState<Dormitory[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDorm, setEditingDorm] = useState<Dormitory | null>(null);
  const [deletingDorm, setDeletingDorm] = useState<Dormitory | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [blockFilter, setBlockFilter] = useState(initialBlockFilter);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
  
  const { success, error, info, warning } = useNotification();

  useEffect(() => {
    const url = new URL(window.location.href);
    const toast = url.searchParams.get('toast');
    if (toast) {
      if (toast === 'added') success('Berhasil! Data asrama baru telah ditambahkan.');
      if (toast === 'updated') success('Berhasil! Informasi asrama telah diperbarui.');
      if (toast === 'deleted') warning('Terhapus! Data asrama telah dihapus dari sistem.');
      
      // Cleanup URL
      url.searchParams.delete('toast');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const updateFilters = (newParams: Record<string, string>) => {
    const url = new URL(window.location.href);
    
    // Reset to page 1 if any filter (search, block, category) changes
    if (!newParams.page) {
      url.searchParams.delete('page');
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === 'All' || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.location.href = url.pathname + url.search;
  };

  const blockOptions = useMemo(() => {
    const nums = Array.from({ length: 15 }, (_, i) => (i + 1).toString());
    return [...nums, 'Induk Putra', 'Induk Putri Selatan', 'Induk Putri Utara'];
  }, []);

  const stats = useMemo(() => {
    const total = dorms.length;
    const capacity = dorms.reduce((acc, curr) => acc + curr.capacity, 0);
    const filled = dorms.reduce((acc, curr) => acc + curr.filled, 0);
    const available = capacity - filled;
    return { total, capacity, filled, available };
  }, [dorms]);

  return (
    <AdminPanel title="Master Data Asrama" activeItem="Data Asrama" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Resource Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Asrama" value={stats.total} icon={<Home size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
          <StatCard label="Total Kapasitas" value={stats.capacity} icon={<LayoutGrid size={24}/>} colorClass="text-slate-600" bgColor="bg-slate-600" />
          <StatCard label="Terisi" value={stats.filled} icon={<Users size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
          <StatCard label="Tersedia" value={stats.available} icon={<ArrowUpRight size={24}/>} colorClass="text-amber-600" bgColor="bg-amber-600" />
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
                  placeholder="Cari Asrama atau Kepala Asrama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters({ search: searchQuery })}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  className="block min-w-[140px] px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm outline-none transition-all dark:text-slate-300"
                  value={blockFilter}
                  onChange={(e) => updateFilters({ block: e.target.value })}
                >
                  <option value="All">Semua Blok</option>
                  {blockOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                
                <select 
                  className="block min-w-[120px] px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm outline-none transition-all dark:text-slate-300"
                  value={categoryFilter}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                >
                  <option value="All">Semua Tipe</option>
                  <option value="Putra">Putra</option>
                  <option value="Putri">Putri</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95"
              >
                <Plus size={18} />
                <span>Tambah Asrama</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dormitory Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <button 
                      onClick={() => updateFilters({ sortBy: 'name', sortOrder: sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc' })}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      Informasi Asrama
                      <ArrowUpDown size={12} className={sortBy === 'name' ? 'text-indigo-600' : 'opacity-30'} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Kode Kamar</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lokasi Blok</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipe</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Okupansi</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {dorms.map((item) => {
                  const percentage = Math.round((item.filled / item.capacity) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{item.name}</p>
                            <p className="text-xs text-slate-400 font-medium">{item.supervisor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{item.roomCode}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <MapPin size={14} className="text-slate-400" />
                           <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.block}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.category === 'Putra' 
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20' 
                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                          <div className="flex items-center justify-between w-full text-[10px] font-bold">
                            <span className={percentage > 90 ? 'text-rose-500' : 'text-slate-400'}>{item.filled}/{item.capacity}</span>
                            <span className={percentage > 90 ? 'text-rose-500' : 'text-slate-400'}>{percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                percentage > 90 ? 'bg-rose-500' : percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingDorm(item); setIsModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeletingDorm(item)}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all"
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

        {/* Pagination Footer */}
        {dorms.length > 0 && (
          <div className="px-10 py-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Menampilkan {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalCount)} dari {totalCount} Asrama
            </p>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => updateFilters({ page: page.toString() })}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingDorm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-xl shadow-rose-500/10">
                  <Trash2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Hapus Asrama?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-4">
                  Anda akan menghapus <span className="font-bold text-slate-800 dark:text-slate-200">{deletingDorm.name}</span>. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
                <button onClick={() => setDeletingDorm(null)} className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Batal</button>
                <form action="/master-data/dormitory" method="POST" className="flex-1">
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="id" value={deletingDorm.id} />
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
          onClose={() => { setIsModalOpen(false); setEditingDorm(null); }}
          title={editingDorm ? "Edit Unit Asrama" : "Unit Asrama Baru"}
          description={editingDorm ? "Perbarui informasi ketersediaan asrama." : "Tambahkan kapasitas akomodasi santri baru."}
          footer={
            <>
              <button 
                type="button" 
                onClick={() => { setIsModalOpen(false); setEditingDorm(null); }} 
                className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="dormitory-form" 
                className="px-10 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center gap-2"
              >
                <Plus size={18} />
                <span>{editingDorm ? "Simpan Perubahan" : "Simpan Data"}</span>
              </button>
            </>
          }
        >
          <form id="dormitory-form" action="/master-data/dormitory" method="POST" className="space-y-8">
            <input type="hidden" name="_action" value={editingDorm ? "edit" : "add"} />
            {editingDorm && <input type="hidden" name="id" value={editingDorm.id} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <Building2 size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Identifikasi asrama</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Nama Gedung / Asrama</label>
                    <input 
                      name="name"
                      type="text" 
                      defaultValue={editingDorm?.name}
                      required
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200" 
                      placeholder="Contoh: Asrama Al-Hikmah" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Kode Kamar</label>
                    <input 
                      name="roomCode"
                      type="text" 
                      defaultValue={editingDorm?.roomCode}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200" 
                      placeholder="Contoh: A" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Lokasi Blok</label>
                      <select 
                        name="block"
                        defaultValue={editingDorm?.block || "1"}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200 appearance-none pointer-events-auto"
                      >
                        {blockOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Tipe Asrama</label>
                      <select 
                        name="gender"
                        defaultValue={editingDorm?.category || "Putra"}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200 appearance-none"
                      >
                        <option value="Putra">Asrama Putra</option>
                        <option value="Putri">Asrama Putri</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Personnel & Capacity */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
                    <Users size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Pengelolaan & Kapasitas</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Nama Kepala Asrama</label>
                    <input 
                      name="head"
                      type="text" 
                      defaultValue={editingDorm?.supervisor}
                      required
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200" 
                      placeholder="Nama ustadz pengampu" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">Kapasitas Maksimal (Santri)</label>
                    <div className="relative">
                      <input 
                        name="capacity"
                        type="number" 
                        defaultValue={editingDorm?.capacity || 0}
                        required
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200" 
                        placeholder="0" 
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempat Tidur</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                    Pastikan kapasitas asrama mencukupi untuk jumlah santri yang akan ditempatkan. Data ini akan mempengaruhi perhitungan okupansi gedung secara keseluruhan.
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

export default DormitoryManagement;
