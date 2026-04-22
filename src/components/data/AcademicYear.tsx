import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  LayoutGrid,
  FileText
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Pagination from '../ui/pagination';

// --- Types ---
type Semester = 'Ganjil' | 'Genap';
type AcademicYearStatus = 'Aktif' | 'Non-Aktif';

interface AcademicYear {
  id: string;
  year: string; // e.g. "2023/2024"
  semester: Semester;
  status: AcademicYearStatus;
  startDate: string;
  endDate: string;
  description: string;
}

// --- Mock Data ---
const initialAcademicYears: AcademicYear[] = [
  { 
    id: '1', 
    year: '2023/2024',
    semester: 'Genap',
    status: 'Aktif', 
    startDate: '2024-01-02', 
    endDate: '2024-06-20', 
    description: 'Semester Genap Tahun Pelajaran 2023/2024' 
  },
  { 
    id: '2', 
    year: '2023/2024', 
    semester: 'Ganjil', 
    status: 'Non-Aktif', 
    startDate: '2023-07-15', 
    endDate: '2023-12-20', 
    description: 'Semester Ganjil Tahun Pelajaran 2023/2024' 
  },
  { 
    id: '3', 
    year: '2022/2023', 
    semester: 'Genap', 
    status: 'Non-Aktif', 
    startDate: '2023-01-05', 
    endDate: '2023-06-15', 
    description: 'Semester Genap Tahun Pelajaran 2022/2023' 
  },
  { 
    id: '4', 
    year: '2022/2023', 
    semester: 'Ganjil', 
    status: 'Non-Aktif', 
    startDate: '2022-07-10', 
    endDate: '2022-12-15', 
    description: 'Semester Ganjil Tahun Pelajaran 2022/2023' 
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

import { useNotification } from '../ui/notification';
import Modal from '../ui/modal';

interface AcademicYearManagementProps {
  initialData?: AcademicYear[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  semesterFilter: string;
  statusFilter: string;
  user?: any;
}

const AcademicYearManagement: React.FC<AcademicYearManagementProps> = ({ 
  initialData = initialAcademicYears,
  currentPage,
  totalPages,
  totalCount,
  searchQuery: initialSearchQuery,
  semesterFilter: initialSemesterFilter,
  statusFilter: initialStatusFilter,
  user
}) => {


  const [data, setData] = useState<AcademicYear[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deletingYear, setDeletingYear] = useState<AcademicYear | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [semesterFilter, setSemesterFilter] = useState(initialSemesterFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const { success, error, info, warning } = useNotification();

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const toastStatus = urlParams.get('toast');
    if (toastStatus) {
      if (toastStatus === 'added') success("Berhasil menyimpan Tahun Ajaran baru!", 5000);
      else if (toastStatus === 'updated') info("Informasi Tahun Ajaran berhasil diperbarui.", 5000);
      else if (toastStatus === 'deleted') warning("Tahun Ajaran telah dihapus dari sistem.", 5000);

      // Clean the url so refresh doesn't trigger again
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({path:newurl}, '', newurl);
    }
  }, []);

  const stats = useMemo(() => {
    return { 
      totalYears: totalCount, 
      activePeriod: data.find(d => d.status === 'Aktif')?.year || '-', 
      activeSemester: data.find(d => d.status === 'Aktif')?.semester || '-', 
      totalPeriods: totalCount 
    };
  }, [totalCount, data]);

  const statusStyles: Record<AcademicYearStatus, string> = {
    'Aktif': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    'Non-Aktif': 'bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-500/20',
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
    <AdminPanel title="Master Data Tahun Ajaran" activeItem="Data Tahun Ajaran" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Tahun" value={stats.totalYears} icon={<Calendar size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
          <StatCard label="Tahun Aktif" value={stats.activePeriod} icon={<CheckCircle2 size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
          <StatCard label="Semester Aktif" value={stats.activeSemester} icon={<Clock size={24}/>} colorClass="text-amber-600" bgColor="bg-amber-600" />
          <StatCard label="Total Periode" value={stats.totalPeriods} icon={<LayoutGrid size={24}/>} colorClass="text-slate-600" bgColor="bg-slate-600" />
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
                  placeholder="Cari Tahun Ajaran..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters({ search: searchQuery })}
                />
              </div>

              {/* Semester Filter */}
              <div className="relative w-full sm:max-w-[180px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Filter size={18} />
                </span>
                <select 
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm outline-none transition-all dark:text-slate-300 appearance-none"
                  value={semesterFilter}
                  onChange={(e) => updateFilters({ semester: e.target.value })}
                >
                  <option value="All">Semua Semester</option>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative w-full sm:max-w-[180px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Filter size={18} />
                </span>
                <select 
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm outline-none transition-all dark:text-slate-300 appearance-none"
                  value={statusFilter}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                >
                  <option value="All">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setEditingYear(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95"
              >
                <Plus size={18} />
                <span>Tambah Tahun Ajaran</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tahun Ajaran</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode Waktu</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{item.year}</p>
                          <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.semester === 'Ganjil' ? 'bg-indigo-400' : 'bg-amber-400'}`}></div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.semester}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>{new Date(item.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <ArrowRight size={14} className="text-slate-300" />
                        <span>{new Date(item.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusStyles[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingYear(item);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        
                        <button 
                          onClick={() => setDeletingYear(item)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all" title="Hapus">
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Tidak ada data tahun ajaran ditemukan.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => updateFilters({ page: page.toString() })}
          />
        )}

        {/* Add/Edit Modal */}
        <Modal 
          isOpen={isModalOpen} 
          size="lg"
          onClose={() => { setIsModalOpen(false); setEditingYear(null); }}
          title={editingYear ? "Edit Tahun Ajaran" : "Tahun Ajaran Baru"}
          description={editingYear ? "Perbarui informasi periode akademik." : "Atur periode akademik sekolah baru."}
          footer={
             <>
               <button type="button" onClick={() => { setIsModalOpen(false); setEditingYear(null); }} className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all">Batal</button>
               <button type="submit" form="add-academic-year-form" className="px-10 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center gap-2">
                 <FileText size={18} />
                 <span>{editingYear ? "Simpan Perubahan" : "Simpan Data"}</span>
               </button>
             </>
           }
         >
           <form id="add-academic-year-form" action="/master-data/academic-years" method="POST" encType="application/x-www-form-urlencoded" className="space-y-6">
              <input type="hidden" name="_action" value={editingYear ? "edit" : "add"} />
              {editingYear && <input type="hidden" name="id" value={editingYear.id} />}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Tahun Ajaran</label>
                    <input type="text" name="yearName" defaultValue={editingYear?.year} required className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="Contoh: 2024/2025" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Semester</label>
                   <select name="semester" defaultValue={editingYear?.semester || "Ganjil"} required className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-slate-300">
                     <option value="Ganjil">Ganjil</option>
                     <option value="Genap">Genap</option>
                   </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Pelajaran Dimulai</label>
                   <input type="date" name="startDate" defaultValue={editingYear?.startDate} required className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-slate-300" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Pelajaran Berakhir</label>
                   <input type="date" name="endDate" defaultValue={editingYear?.endDate} required className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-slate-300" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Deskripsi</label>
                 <textarea rows={3} name="description" defaultValue={editingYear?.description} className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none" placeholder="Masukkan keterangan tambahan..."></textarea>
              </div>

             <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                    <AlertCircle size={16} />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-normal max-w-sm">
                       Menandai tahun ajaran ini sebagai <span className="font-bold text-indigo-600 dark:text-indigo-400">Aktif</span> akan menonaktifkan tahun ajaran aktif saat ini secara otomatis.
                   </p>
                   <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
                      <input type="checkbox" name="isActive" defaultChecked={editingYear?.status === 'Aktif'} className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Set sebagai Aktif</span>
                   </label>
                </div>
             </div>
           </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingYear}
          onClose={() => setDeletingYear(null)}
          title="Konfirmasi Hapus"
          description={`Apakah Anda yakin ingin menghapus data tahun ajaran ${deletingYear?.year}?`}
          footer={
            <>
               <button type="button" onClick={() => setDeletingYear(null)} className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all">Batal</button>
               <button type="submit" form="delete-academic-year-form" className="px-10 py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all transform active:scale-95 flex items-center gap-2">
                 <Trash2 size={18} />
                 <span>Hapus Data</span>
               </button>
            </>
          }
        >
          <form id="delete-academic-year-form" method="POST" action="/master-data/academic-years" className="space-y-4">
             <input type="hidden" name="_action" value="delete" />
             {deletingYear && <input type="hidden" name="id" value={deletingYear.id} />}
             <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                   Data yang dihapus tidak dapat dikembalikan. Ini mungkin akan berpengaruh pada history nilai dan kelas siswa yang terkait.
                </p>
             </div>
          </form>
        </Modal>
      </div>
    </AdminPanel>
  );
};

export default AcademicYearManagement;
