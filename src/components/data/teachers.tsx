import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  UserCheck, 
  BookOpen, 
  Phone, 
  MapPin, 
  UserPlus,
  GraduationCap,
  AlertCircle,
  Loader2,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Modal from '../ui/modal';
import Pagination from '../ui/pagination';
import { useNotification } from '../ui/notification';

// --- Types ---
type TeacherStatus = 'Aktif' | 'Cuti' | 'Non-Aktif';

interface WilayahItem {
  code: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
  nip: string;
  gender?: string;
  phone: string;
  email: string;
  address: string;
  province: string | null;
  regency: string | null;
  district: string | null;
  village: string | null;
  birthPlace: string;
  birthDate: string;
  status: TeacherStatus;
  joinedDate: string;
  avatar?: string;
}

// --- Mock Data ---
const initialTeachers: Teacher[] = [
  { 
    id: '1', 
    name: 'Ust. Ahmad Fauzi, M.Pd.', 
    nip: '198501012010011001', 
    phone: '081234567890', 
    email: 'ahmad.fauzi@madin.ac.id',
    address: 'Jl. Kebon Jeruk No. 12, Semarang', 
    birthPlace: 'Semarang',
    birthDate: '1985-01-01',
    status: 'Aktif', 
    joinedDate: '2010-01-01',
    province: null,
    regency: null,
    district: null,
    village: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad'
  },
  { 
    id: '2', 
    name: 'Usth. Maryam Shaleha, S.Ag.', 
    nip: '199005122015022003', 
    phone: '081398765432', 
    email: 'maryam.s@madin.ac.id',
    address: 'Perum Gading Elok Blok A-05', 
    birthPlace: 'Solo',
    birthDate: '1990-05-12',
    status: 'Aktif', 
    joinedDate: '2015-02-12',
    province: null,
    regency: null,
    district: null,
    village: null
  },
  { 
    id: '3', 
    name: 'Ust. Harun Ar-Rasyid', 
    nip: '198211232008011005', 
    phone: '081555443322', 
    email: 'harun.rasyid@madin.ac.id',
    address: 'Dusun Krajan RT 02 RW 01', 
    birthPlace: 'Surabaya',
    birthDate: '1982-11-23',
    status: 'Cuti', 
    joinedDate: '2008-01-23',
    province: null,
    regency: null,
    district: null,
    village: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harun'
  },
  { 
    id: '4', 
    name: 'Ust. Zaini Mansur', 
    nip: '199203152018021002', 
    phone: '082233445566', 
    email: 'zaini.m@madin.ac.id',
    address: 'Jl. Merdeka No. 45', 
    birthPlace: 'Malang',
    birthDate: '1992-03-15',
    status: 'Aktif', 
    joinedDate: '2018-02-15',
    province: null,
    regency: null,
    district: null,
    village: null
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

interface TeacherManagementProps {
  initialData?: Teacher[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  statusFilter: string;
  user?: any;
}


const TeacherManagement: React.FC<TeacherManagementProps> = ({ 
  initialData = initialTeachers,
  currentPage,
  totalPages,
  totalCount,
  searchQuery: initialSearchQuery,
  statusFilter: initialStatusFilter,
  user
}) => {

  const [data, setData] = useState<Teacher[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{message?: string, error?: string, details?: {row: number, column: string, message: string}[]} | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const { success, error, info, warning } = useNotification();

  const handleImport = async () => {
    if (!importFile) return;
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await fetch('/api/teachers/import', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }
      
      setImportResult({ message: data.message });
      success(data.message || "Import berhasil!");
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err: any) {
      try {
        const errorData = JSON.parse(err.message);
        setImportResult({ 
          error: errorData.error || 'Gagal melakukan import',
          details: errorData.details
        });
      } catch {
        setImportResult({ error: err.message });
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      
      const response = await fetch(`/api/teachers/export?${params.toString()}`);
      if (!response.ok) throw new Error('Gagal mengekspor data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Asatidz_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      success("Data berhasil diekspor!");
    } catch (err: any) {
      error(err.message || "Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };

  // --- Wilayah State ---
  const [provinces, setProvinces] = useState<WilayahItem[]>([]);
  const [regencies, setRegencies] = useState<WilayahItem[]>([]);
  const [districts, setDistricts] = useState<WilayahItem[]>([]);
  const [villages, setVillages] = useState<WilayahItem[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedRegency, setSelectedRegency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [wilayahLoading, setWilayahLoading] = useState({ prov: false, reg: false, dist: false, vil: false });

  // Helper for flexible name matching (consistent with EditStudent.tsx)
  const matchRegionName = (listName: string, selectedName: string) => {
    if (!listName || !selectedName) return false;
    const clean = (s: string) => s.toUpperCase()
      .replace(/PROVINSI|KABUPATEN|KOTA|KECAMATAN|DESA|KELURAHAN|KAB\.|KOT\.|KEC\./g, '')
      .replace(/\s+/g, '')
      .trim();
    return clean(listName) === clean(selectedName);
  };

  // Sync states when editing
  useEffect(() => {
    if (editingTeacher) {
      setSelectedProvince(editingTeacher.province || '');
      setSelectedRegency(editingTeacher.regency || '');
      setSelectedDistrict(editingTeacher.district || '');
      setSelectedVillage(editingTeacher.village || '');
    } else {
      setSelectedProvince('');
      setSelectedRegency('');
      setSelectedDistrict('');
      setSelectedVillage('');
    }
  }, [editingTeacher]);

  // Fetch provinces on mount
  useEffect(() => {
    setWilayahLoading(prev => ({ ...prev, prov: true }));
    fetch('/api/wilayah/provinces.json')
      .then(res => res.json())
      .then(json => setProvinces(json.data || []))
      .catch(() => setProvinces([]))
      .finally(() => setWilayahLoading(prev => ({ ...prev, prov: false })));
  }, []);

  // Fetch regencies when province changes
  useEffect(() => {
    // 1. Resolve Province Code if it was stored as a Name
    if (provinces.length > 0 && selectedProvince && !selectedProvince.match(/^[0-9.]+$/)) {
      const matched = provinces.find(p => matchRegionName(p.name, selectedProvince));
      if (matched) {
        setSelectedProvince(matched.code);
        return; // Wait for next run with code
      }
    }

    if (!selectedProvince || !selectedProvince.match(/^[0-9.]+$/)) {
      setRegencies([]);
      return;
    }

    setWilayahLoading(prev => ({ ...prev, reg: true }));
    fetch(`/api/wilayah/regencies/${selectedProvince}.json`)
      .then(res => res.json())
      .then(json => setRegencies(json.data || []))
      .catch(() => setRegencies([]))
      .finally(() => setWilayahLoading(prev => ({ ...prev, reg: false })));
  }, [selectedProvince, provinces]);

  // Fetch districts when regency changes
  useEffect(() => {
    // 1. Resolve Regency Code if it was stored as a Name
    if (regencies.length > 0 && selectedRegency && !selectedRegency.match(/^[0-9.]+$/)) {
      const matched = regencies.find(r => matchRegionName(r.name, selectedRegency));
      if (matched) {
        setSelectedRegency(matched.code);
        return;
      }
    }

    if (!selectedRegency || !selectedRegency.match(/^[0-9.]+$/)) {
      setDistricts([]);
      return;
    }

    setWilayahLoading(prev => ({ ...prev, dist: true }));
    fetch(`/api/wilayah/districts/${selectedRegency}.json`)
      .then(res => res.json())
      .then(json => setDistricts(json.data || []))
      .catch(() => setDistricts([]))
      .finally(() => setWilayahLoading(prev => ({ ...prev, dist: false })));
  }, [selectedRegency, regencies]);

  // Fetch villages when district changes
  useEffect(() => {
    // 1. Resolve District Code if it was stored as a Name
    if (districts.length > 0 && selectedDistrict && !selectedDistrict.match(/^[0-9.]+$/)) {
      const matched = districts.find(d => matchRegionName(d.name, selectedDistrict));
      if (matched) {
        setSelectedDistrict(matched.code);
        return;
      }
    }

    if (!selectedDistrict || !selectedDistrict.match(/^[0-9.]+$/)) {
      setVillages([]);
      return;
    }

    setWilayahLoading(prev => ({ ...prev, vil: true }));
    fetch(`/api/wilayah/villages/${selectedDistrict}.json`)
      .then(res => res.json())
      .then(json => setVillages(json.data || []))
      .catch(() => setVillages([]))
      .finally(() => setWilayahLoading(prev => ({ ...prev, vil: false })));
  }, [selectedDistrict, districts]);

  // Resolve Village Code if it was stored as a Name
  useEffect(() => {
    if (villages.length > 0 && selectedVillage && !selectedVillage.match(/^[0-9.]+$/)) {
      const matched = villages.find(v => matchRegionName(v.name, selectedVillage));
      if (matched) setSelectedVillage(matched.code);
    }
  }, [selectedVillage, villages]);

  // Reset wilayah selections when modal opens for editing
  useEffect(() => {
    if (isModalOpen && editingTeacher) {
      setSelectedProvince(editingTeacher.province || '');
      setSelectedRegency(editingTeacher.regency || '');
      setSelectedDistrict(editingTeacher.district || '');
      setSelectedVillage(editingTeacher.village || '');
    } else if (isModalOpen && !editingTeacher) {
      setSelectedProvince('');
      setSelectedRegency('');
      setSelectedDistrict('');
      setSelectedVillage('');
    }
  }, [isModalOpen, editingTeacher]);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const toastStatus = urlParams.get('toast');
    if (toastStatus) {
      if (toastStatus === 'added') success("Berhasil mendaftarkan Asatidz baru!", 5000);
      else if (toastStatus === 'updated') info("Profil Asatidz berhasil diperbarui.", 5000);
      else if (toastStatus === 'deleted') warning("Data Asatidz telah dihapus dari sistem.", 5000);
      else if (toastStatus === 'error') error(urlParams.get('message') || "Gagal menyimpan data.", 5000);

      // Clean the url so refresh doesn't trigger again
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({path:newurl}, '', newurl);
    }
  }, []);

  const statusStyles: Record<TeacherStatus, string> = {
    'Aktif': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    'Cuti': 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
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

  const stats = useMemo(() => {
    return {
      total: totalCount,
      active: data.filter(t => t.status === 'Aktif').length, // This might be partial, but okay for breadcrumb-like context
      off: data.filter(t => t.status === 'Non-Aktif').length,
    };
  }, [totalCount, data]);

  return (
    <AdminPanel title="Master Data Asatidz" activeItem="Data Asatidz" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Asatidz Aktif" value={stats.active} icon={<UserCheck size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
          <StatCard label="Rerata Masa Kerja" value={`5 Th`} icon={<GraduationCap size={24}/>} colorClass="text-slate-600" bgColor="bg-slate-600" />
          <StatCard label="Hadir Hari Ini" value={stats.active} icon={<UserPlus size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
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
                  placeholder="Cari Nama atau NIP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters({ search: searchQuery })}
                />
              </div>

              {/* Status Filter */}
              <div className="relative w-full sm:max-w-[180px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Filter size={18} />
                </span>
                <select 
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm outline-none transition-all dark:text-slate-300 appearance-none focus:ring-2 focus:ring-indigo-500"
                  value={statusFilter}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                >
                  <option value="All">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span className="hidden sm:inline">Export</span>
              </button>
              <button 
                onClick={() => {
                  setEditingTeacher(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95"
              >
                <Plus size={18} />
                <span>Tambah Asatidz</span>
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
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Asatidz</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kontak</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose w-64">Tempat, Tgl Lahir</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-28">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                          <img 
                            src={item.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.nip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <Phone size={14} className="text-slate-400" />
                          <span>{item.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="truncate max-w-[150px]">{item.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="space-y-1">
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.birthPlace}</span>
                             <p className="text-[10px] text-slate-400 font-bold">{item.birthDate}</p>
                        </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusStyles[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingTeacher(item);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeletingTeacher(item)}
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
        </div>

        {/* Pagination */}
        {data.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page: number) => updateFilters({ page: page.toString() })}
          />
        )}

        {/* Add/Edit Modal (Landscape) */}
        <Modal 
          isOpen={isModalOpen} 
          size="supreme"
          onClose={() => { setIsModalOpen(false); setEditingTeacher(null); }}
          title={editingTeacher ? "Edit Profil Asatidz" : "Pendaftaran Asatidz Baru"}
          description={editingTeacher ? "Perbarui informasi profil dan detail kepegawaian tenaga pendidik" : "Daftarkan pengajar baru ke dalam pangkalan data madrasah"}
          footer={
             <>
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingTeacher(null); }} 
                  className="px-8 py-3.5 text-sm font-black text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-all uppercase tracking-widest"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  form="teacher-form" 
                  disabled={!!(wilayahLoading.prov || wilayahLoading.reg || wilayahLoading.dist || wilayahLoading.vil)}
                  className={`px-12 py-4 bg-indigo-600 text-white rounded-[22px] text-sm font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {(wilayahLoading.prov || wilayahLoading.reg || wilayahLoading.dist || wilayahLoading.vil) ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <UserCheck size={20} />
                  )}
                  <span>
                    {(wilayahLoading.prov || wilayahLoading.reg || wilayahLoading.dist || wilayahLoading.vil) 
                      ? "Memproses Wilayah..." 
                      : (editingTeacher ? "Simpan Perubahan" : "Resmikan Pengajar")}
                  </span>
                </button>
             </>
          }
        >
          <form id="teacher-form" method="POST" action="/master-data/teachers" encType="application/x-www-form-urlencoded" className="space-y-12">
             <input type="hidden" name="_action" value={editingTeacher ? "edit" : "add"} />
             {editingTeacher && <input type="hidden" name="id" value={editingTeacher.id} />}
             
             <div className="space-y-12">
                {/* SECTION 1: IDENTITAS UTAMA */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identitas Pendidik</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="space-y-3 md:col-span-8">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap & Gelar</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                            <BookOpen size={20} />
                          </span>
                          <input 
                            type="text" 
                            name="name" 
                            defaultValue={editingTeacher?.name}
                            required 
                            className="w-full pl-14 pr-5 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-black text-slate-700 dark:text-slate-200" 
                            placeholder="Contoh: Ust. Ahmad Fauzi, M.Pd." 
                          />
                        </div>
                    </div>
                    <div className="space-y-3 md:col-span-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor Induk Pendidik (NIP)</label>
                        <input 
                          type="text" 
                          name="nip" 
                          defaultValue={editingTeacher?.nip}
                          className="w-full px-6 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-black text-slate-700 dark:text-slate-200" 
                          placeholder="19xxxxxxxxxxxxxx" 
                        />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: DETAIL PRIBADI */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Informasi Personal</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Jenis Kelamin</label>
                        <div className="flex bg-slate-50 dark:bg-slate-900 p-1.5 rounded-[22px] border border-slate-100 dark:border-slate-700 min-h-[64px]">
                          <select 
                            name="gender" 
                            defaultValue={editingTeacher?.gender || 'Laki-laki'}
                            className="w-full px-5 bg-transparent outline-none text-sm font-bold dark:text-slate-300 appearance-none cursor-pointer"
                          >
                             <option value="Laki-laki">Laki-laki</option>
                             <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tempat Lahir</label>
                        <input 
                          type="text" 
                          name="birthPlace" 
                          defaultValue={editingTeacher?.birthPlace}
                          className="w-full px-6 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-200" 
                          placeholder="Contoh: Semarang" 
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal Lahir</label>
                        <input 
                          type="date" 
                          name="birthDate" 
                          defaultValue={editingTeacher?.birthDate}
                          className="w-full px-6 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-200" 
                        />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: KONTAK & KEPEGAWAIAN */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Komunikasi & Status</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-3 font-medium">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">No. WhatsApp</label>
                        <div className="relative group">
                           <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 text-sm font-black">+62</span>
                           <input 
                             type="text" 
                             name="phone" 
                             defaultValue={editingTeacher?.phone?.startsWith('+62') ? editingTeacher.phone.slice(3) : editingTeacher?.phone}
                             className="w-full pl-14 pr-5 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" 
                             placeholder="812xxxxxxxx" 
                           />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          defaultValue={editingTeacher?.email}
                          className="w-full px-6 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" 
                          placeholder="nama@madin.ac.id" 
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status Keaktifan</label>
                        <div className="relative">
                          <select 
                            name="status" 
                            defaultValue={editingTeacher?.status || 'Aktif'}
                            className="w-full px-6 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-black text-slate-700 dark:text-slate-300 appearance-none"
                          >
                             <option value="Aktif">Aktif</option>
                             <option value="Cuti">Cuti</option>
                             <option value="Non-Aktif">Non-Aktif</option>
                          </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mulai Bertugas</label>
                        <input 
                          type="date" 
                          name="joinedDate" 
                          defaultValue={editingTeacher?.joinedDate}
                          className="w-full px-6 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" 
                        />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: DOMISILI */}
                <div className="space-y-8 pt-4">
                  <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Domisili & Alamat</h4>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Detail Alamat (Gedung/Dusun/Jalan)</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-rose-500 transition-colors">
                            <MapPin size={20} />
                          </span>
                          <input 
                            type="text" 
                            name="address" 
                            defaultValue={editingTeacher?.address}
                            className="w-full pl-14 pr-5 py-5 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" 
                            placeholder="Contoh: Jl. Diponegoro No. 123" 
                          />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Provinsi</label>
                          <div className="relative group">
                            <input type="hidden" name="province" value={provinces.find(p => p.code === selectedProvince)?.name || selectedProvince} />
                            <select 
                              value={selectedProvince}
                              onChange={(e) => {
                                setSelectedProvince(e.target.value);
                                setSelectedRegency('');
                                setSelectedDistrict('');
                                setSelectedVillage('');
                              }}
                              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none text-xs font-bold dark:text-slate-300 transition-all"
                            >
                              <option value="">— Pilih Provinsi —</option>
                              {provinces.map(p => (
                                <option key={p.code} value={p.code}>{p.name}</option>
                              ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                              {wilayahLoading.prov ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                      </div>
                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kota/Kabupaten</label>
                          <div className="relative group">
                            <input type="hidden" name="regency" value={regencies.find(r => r.code === selectedRegency)?.name || selectedRegency} />
                            <select 
                              value={selectedRegency}
                              onChange={(e) => {
                                setSelectedRegency(e.target.value);
                                setSelectedDistrict('');
                                setSelectedVillage('');
                              }}
                              disabled={!selectedProvince || !selectedProvince.match(/^[0-9.]+$/)}
                              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none text-xs font-bold dark:text-slate-300 disabled:opacity-50 transition-all"
                            >
                              <option value="">— Pilih Kota/Kab —</option>
                              {regencies.map(r => (
                                <option key={r.code} value={r.code}>{r.name}</option>
                              ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                              {wilayahLoading.reg ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                      </div>
                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kecamatan</label>
                          <div className="relative group">
                            <input type="hidden" name="district" value={districts.find(d => d.code === selectedDistrict)?.name || selectedDistrict} />
                            <select 
                              value={selectedDistrict}
                              onChange={(e) => {
                                setSelectedDistrict(e.target.value);
                                setSelectedVillage('');
                              }}
                              disabled={!selectedRegency || !selectedRegency.match(/^[0-9.]+$/)}
                              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none text-xs font-bold dark:text-slate-300 disabled:opacity-50 transition-all"
                            >
                              <option value="">— Pilih Kecamatan —</option>
                              {districts.map(d => (
                                <option key={d.code} value={d.code}>{d.name}</option>
                              ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                              {wilayahLoading.dist ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                      </div>
                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Desa/Kelurahan</label>
                          <div className="relative group">
                            <input type="hidden" name="village" value={villages.find(v => v.code === selectedVillage)?.name || selectedVillage} />
                            <select 
                              value={selectedVillage}
                              onChange={(e) => setSelectedVillage(e.target.value)}
                              disabled={!selectedDistrict || !selectedDistrict.match(/^[0-9.]+$/)}
                              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none text-xs font-bold dark:text-slate-300 disabled:opacity-50 transition-all"
                            >
                              <option value="">— Pilih Desa —</option>
                              {villages.map(v => (
                                <option key={v.code} value={v.code}>{v.name}</option>
                              ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                              {wilayahLoading.vil ? <Loader2 size={16} className="animate-spin text-indigo-500" /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </form>
        </Modal>
        
        {/* Import Modal */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Import Data Asatidz"
          description="Unggah file Excel untuk pendaftaran pengajar secara kolektif"
          size="xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Side: Template Instructions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4 py-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Langkah 1: Siapkan Data</h4>
              </div>
              <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 space-y-6">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText size={28} className="text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100">Unduh & Isi Template</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Gunakan template resmi kami. Jangan mengubah urutan kolom atau menghapus judul kolom agar sistem dapat membaca data dengan akurat.</p>
                </div>
                <a 
                  href="/api/teachers/template" 
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
                >
                  <Download size={16} />
                  UNDUH TEMPLATE (.XLSX)
                </a>
              </div>
            </div>

            {/* Right Side: File Upload */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4 py-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Langkah 2: Unggah File</h4>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".xlsx"
                  className="hidden" 
                  id="excel-upload"
                  disabled={isImporting}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setImportFile(e.target.files[0]);
                      setImportResult(null);
                    }
                  }} 
                />
                <label 
                  htmlFor="excel-upload"
                  className={`flex flex-col items-center justify-center gap-5 p-12 rounded-[40px] border-2 border-dashed transition-all group cursor-pointer ${
                    importFile 
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5'
                  }`}
                >
                   <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-md transition-all ${
                     importFile ? 'bg-emerald-500 text-white shadow-emerald-500/20 rotate-6' : 'bg-white dark:bg-slate-800'
                   }`}>
                      {importFile ? <FileText size={36} /> : <Upload size={36} className="text-slate-400 group-hover:text-emerald-500" />}
                   </div>
                   <div className="text-center">
                      <p className="text-base font-black text-slate-700 dark:text-slate-100 italic">
                        {importFile ? importFile.name : 'Pilih file .xlsx'}
                      </p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {importFile ? 'File siap diimport' : 'Atau Seret File Kesini'}
                      </p>
                   </div>
                </label>
              </div>

              {/* Feedback Area */}
              {(importResult?.error || importResult?.message) && (
                <div className={`p-5 rounded-2xl text-sm font-bold border animate-in slide-in-from-top-2 duration-500 ${
                  importResult.error 
                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' 
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                }`}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${importResult.error ? 'bg-rose-100 dark:bg-rose-500/20' : 'bg-emerald-100 dark:bg-emerald-500/20'}`}>
                        {importResult.error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-black">{importResult.error || importResult.message}</p>
                      </div>
                    </div>

                    {importResult.details && (
                      <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto pr-2 supreme-scrollbar">
                        {importResult.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-rose-100/50 dark:border-rose-500/10">
                            <span className="text-[10px] font-black text-rose-600 bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 rounded">Baris {detail.row}</span>
                            <div className="flex-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{detail.column}</p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">{detail.message}</p>
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
                   disabled={isImporting}
                   className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={handleImport}
                   disabled={!importFile || isImporting}
                   className={`flex-[2] py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                     !importFile || isImporting 
                       ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                       : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-[0.98]'
                   }`}
                 >
                   {isImporting ? 'Memproses...' : 'Mulai Import'}
                 </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingTeacher}
          onClose={() => setDeletingTeacher(null)}
          title="Konfirmasi Hapus"
          description={`Apakah Anda yakin ingin menghapus data asatidz ${deletingTeacher?.name}?`}
          footer={
            <>
               <button type="button" onClick={() => setDeletingTeacher(null)} className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all">Batal</button>
               <button type="submit" form="delete-teacher-form" className="px-10 py-3 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all transform active:scale-95 flex items-center gap-2">
                 <Trash2 size={18} />
                 <span>Hapus Permanen</span>
               </button>
            </>
          }
        >
          <form id="delete-teacher-form" method="POST" action="/master-data/teachers" className="space-y-4">
             <input type="hidden" name="_action" value="delete" />
             {deletingTeacher && <input type="hidden" name="id" value={deletingTeacher.id} />}
             <div className="flex items-start gap-4 p-5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                   Tindakan ini tidak dapat dibatalkan. Menghapus data pengajar juga akan menghilangkan riwayat Wali Kelas yang terkait dengan beliau di sistem.
                </p>
             </div>
          </form>
        </Modal>
      </div>
    </AdminPanel>
  );
};

export default TeacherManagement;
