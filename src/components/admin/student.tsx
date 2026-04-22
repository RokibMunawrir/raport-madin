import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

import AdminPanel from '../ui/panel';
import Modal from '../ui/modal';

interface Student {
  id: string;
  name: string;
  nis: string;
  nisn: string;
  class: string;
  dormitory: string;
  status: 'Aktif' | 'Nonaktif' | 'Lulus' | 'Keluar';
  roomCode: string;
  avatar: string;
  email: string;
  gender: string;
}

const mockStudents: Student[] = [
  { id: '1', name: 'Aditama Arya', nis: '2024101', nisn: '00239102', class: '12-A', dormitory: 'Asrama A', roomCode: 'A.01', status: 'Aktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditama', email: 'aditama@school.com', gender: 'Laki-laki' },
  { id: '2', name: 'Bela Permata', nis: '2024102', nisn: '00239105', class: '12-A', dormitory: 'Asrama B', roomCode: 'B.03', status: 'Aktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bela', email: 'bela@school.com', gender: 'Perempuan' },
  { id: '3', name: 'Candra Wijaya', nis: '2024103', nisn: '00239110', class: '11-B', dormitory: 'Asrama A', roomCode: 'A.05', status: 'Aktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Candra', email: 'candra@school.com', gender: 'Laki-laki' },
  { id: '4', name: 'Dina Lestari', nis: '2024104', nisn: '00239115', class: '10-C', dormitory: 'Asrama C', roomCode: 'C.01', status: 'Nonaktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dina', email: 'dina@school.com', gender: 'Perempuan' },
  { id: '5', name: 'Eko Prasetyo', nis: '2024105', nisn: '00239120', class: '12-B', dormitory: 'Asrama B', roomCode: 'B.02', status: 'Lulus', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eko', email: 'eko@school.com', gender: 'Laki-laki' },
  { id: '6', name: 'Fani Rahayu', nis: '2024106', nisn: '00239125', class: '11-A', dormitory: 'Asrama A', roomCode: 'A.02', status: 'Aktif', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fani', email: 'fani@school.com', gender: 'Perempuan' },
];

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 dark:bg-opacity-20`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{value}</h3>
    </div>
  </div>
);

const StudentManagement: React.FC<{ 
  initialData?: Student[];
  stats?: {
    total: number;
    aktif: number;
    alumni: number;
    keluar: number;
  };
  unassignedStudents?: any[];
  activeYear?: any;
  teacherClass?: any;
  user?: any;
}> = ({ initialData, stats = { total: 0, aktif: 0, alumni: 0, keluar: 0 }, unassignedStudents = [], activeYear, teacherClass, user }) => {

  const [students, setStudents] = useState<Student[]>(initialData || []);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const toastType = params.get('toast');
      if (toastType === 'added') {
        import('../ui/notification').then(({ toast }) => toast.success("Santri berhasil ditambahkan!"));
      }
      return params.get('search') || '';
    }
    return '';
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
  const [placementTab, setPlacementTab] = useState<'unassigned' | 'assigned'>('unassigned');
  const [searchUnassigned, setSearchUnassigned] = useState('');

  const filteredUnassigned = (unassignedStudents || []).filter(s => 
    s.name.toLowerCase().includes(searchUnassigned.toLowerCase()) || 
    s.nis.toLowerCase().includes(searchUnassigned.toLowerCase())
  );

  const filteredAssigned = (initialData || []).filter(s => 
    s.name.toLowerCase().includes(searchUnassigned.toLowerCase()) || 
    s.nis.toLowerCase().includes(searchUnassigned.toLowerCase())
  );

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (s.nis && s.nis.includes(searchQuery)) ||
                         (s.nisn && s.nisn.includes(searchQuery));
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <AdminPanel title="Siswa" activeItem="Siswa" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        {/* Mini Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Siswa" value={stats.total.toLocaleString()} icon={<Users className="text-indigo-600" size={24} />} color="bg-indigo-600" />
          <StatCard label="Aktif" value={stats.aktif.toLocaleString()} icon={<UserCheck className="text-emerald-600" size={24} />} color="bg-emerald-600" />
          <StatCard label="Alumni" value={stats.alumni.toLocaleString()} icon={<GraduationCap className="text-amber-600" size={24} />} color="bg-amber-600" />
          <StatCard label="Keluar" value={stats.keluar.toLocaleString()} icon={<Plus className="text-rose-600 rotate-45" size={24} />} color="bg-rose-600" />
        </div>

        {/* Action Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Cari Nama atau NISN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  className="block min-w-[140px] px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm outline-none transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Keluar">Keluar</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsPlacementModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95"
              >
                <Edit2 size={18} />
                <span>Edit Penempatan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Siswa</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIS / NISN</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Kelas</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900 transition-all">
                          <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{s.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tight">{s.nis || '-'}</span>
                        <span className="text-[10px] text-slate-400 font-medium">NISN: {s.nisn || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                          {s.class}
                        </span>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-400 font-medium italic leading-none">{s.dormitory || '-'}</span>
                            {s.roomCode && s.roomCode !== '-' && (
                                <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 mt-1 uppercase tracking-tighter shadow-sm bg-indigo-50 dark:bg-indigo-500/5 px-1.5 rounded-md border border-indigo-100 dark:border-indigo-500/10">
                                    KAMAR {s.roomCode}
                                </span>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        s.status === 'Aktif' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' 
                          : s.status === 'Lulus'
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20'
                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/students/detail/${s.id}`} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all" title="Detail">
                          <Eye size={16} />
                        </a>
                        <a href={`/students/edit/${s.id}`} className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all" title="Edit">
                          <Edit2 size={16} />
                        </a>
                        <button className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-700 rounded-lg transition-all" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} Santri
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  // Simple sliding window for pagination
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                  }
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button 
                      key={pageNum} 
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all transform active:scale-90 ${
                        pageNum === currentPage 
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' 
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Modal (Placement) */}
        <Modal
          isOpen={isPlacementModalOpen}
          size="supreme"
          onClose={() => setIsPlacementModalOpen(false)}
          title="Penempatan Santri Baru"
          description={`Kelola penempatan santri di Tahun Ajaran ${activeYear?.name || '-'}.`}
        >
          {!teacherClass && user?.role === 'Guru' ? (
            <div className="p-8 text-center flex flex-col items-center">
               <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
                  <AlertCircle size={32} />
               </div>
               <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 italic">Akses Terbatas</h4>
               <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest max-w-sm">Anda belum ditugaskan sebagai Wali Kelas pada ruangan manapun. Silakan hubungi operator akademik.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl max-w-sm mx-auto">
                <button 
                  onClick={() => setPlacementTab('unassigned')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    placementTab === 'unassigned' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Calon Santri
                </button>
                <button 
                  onClick={() => setPlacementTab('assigned')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    placementTab === 'assigned' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Siswa Terdaftar
                </button>
              </div>

              <div className="relative group max-w-md mx-auto">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder={placementTab === 'unassigned' ? "Cari calon santri..." : "Cari siswa terdaftar..."}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-bold dark:text-slate-200"
                  value={searchUnassigned}
                  onChange={(e) => setSearchUnassigned(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
                {placementTab === 'unassigned' ? (
                  filteredUnassigned.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center">
                      <CheckCircle2 size={48} className="mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">Semua santri telah memiliki kelas</p>
                    </div>
                  ) : (
                    filteredUnassigned.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden ring-2 ring-slate-50 dark:ring-slate-700/50">
                            <img src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.nis} • {student.gender}</p>
                          </div>
                        </div>
                        <form method="POST">
                          <input type="hidden" name="_action" value="assign_student" />
                          <input type="hidden" name="studentId" value={student.id} />
                          <input type="hidden" name="classroomId" value={teacherClass?.id || ""} />
                          <button 
                            type="submit"
                            disabled={!teacherClass?.id}
                            className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={18} />
                          </button>
                        </form>
                      </div>
                    ))
                  )
                ) : (
                  filteredAssigned.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center">
                      <Users size={48} className="mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">Belum ada santri di kelas ini</p>
                    </div>
                  ) : (
                    filteredAssigned.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all group shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden ring-2 ring-slate-50 dark:ring-slate-700/50">
                            <img src={student.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-rose-600 transition-colors">{student.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.nis} • {student.gender}</p>
                          </div>
                        </div>
                        <form method="POST">
                          <input type="hidden" name="_action" value="unassign_student" />
                          <input type="hidden" name="studentId" value={student.id} />
                          <input type="hidden" name="classroomId" value={teacherClass?.id || ""} />
                          <button 
                            type="submit"
                            disabled={!teacherClass?.id}
                            className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <X size={18} />
                          </button>
                        </form>
                      </div>
                    ))
                  )
                )}
              </div>
              
              <div className="p-6 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-3xl flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600">
                    <AlertCircle size={20} />
                 </div>
                 <p className="text-xs font-medium text-slate-700 dark:text-slate-400 leading-relaxed italic">
                   {placementTab === 'unassigned' 
                    ? `Menampilkan santri yang belum memiliki kelas di Tahun Ajaran ini. Anda sedang mengelola kelas: ${teacherClass?.name || '-'}.`
                    : `Menampilkan santri yang sudah terdaftar di kelas ${teacherClass?.name || '-'}. Gunakan tombol (X) untuk membatalkan penempatan.`}
                 </p>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </AdminPanel>
  );
};

export default StudentManagement;
