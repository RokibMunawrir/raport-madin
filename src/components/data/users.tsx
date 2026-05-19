import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  UserCheck, 
  ShieldCheck, 
  X, 
  Mail, 
  Calendar, 
  MoreHorizontal,
  Key,
  LogOut,
  UserPlus,
  Shield,
  Activity,
  ChevronRight,
  GraduationCap,
  Send,
  Loader2
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import Modal from '../ui/modal';
import { useNotification } from '../ui/notification';


// --- Types ---
type UserRole = 'Super Admin' | 'Administrator' | 'Guru' | 'Staf';
type UserStatus = 'Aktif' | 'Non-Aktif';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  avatar?: string;
  teacherId?: string;
  teacherName?: string;
}

interface UserManagementProps {
  initialData?: User[];
  teachers?: any[];
  user?: any;
}


// --- Mock Data ---
const initialUsers: User[] = [
  { 
    id: '1', 
    name: 'Admin Utama', 
    username: 'superadmin', 
    email: 'admin@madin.ac.id', 
    role: 'Super Admin', 
    status: 'Aktif', 
    lastLogin: '2024-04-01 08:30',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Super'
  },
  { 
    id: '2', 
    name: 'Pak Budi Santoso', 
    username: 'budi.s', 
    email: 'budi.s@madin.ac.id', 
    role: 'Guru', 
    status: 'Aktif', 
    lastLogin: '2024-03-31 15:45',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi'
  },
  { 
    id: '3', 
    name: 'Siti Aminah, S.Pd.', 
    username: 'siti.a', 
    email: 'siti.a@madin.ac.id', 
    role: 'Guru', 
    status: 'Aktif', 
    lastLogin: '2024-04-01 09:15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aminah'
  },
  { 
    id: '4', 
    name: 'Zaini Mansur', 
    username: 'zaini.m', 
    email: 'zaini.m@madin.ac.id', 
    role: 'Staf', 
    status: 'Aktif', 
    lastLogin: '2024-03-30 14:00'
  },
  { 
    id: '5', 
    name: 'Admin Akademik', 
    username: 'admin.aka', 
    email: 'akademik@madin.ac.id', 
    role: 'Administrator', 
    status: 'Non-Aktif', 
    lastLogin: '2024-02-15 10:20'
  },
];

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

const UserManagement: React.FC<UserManagementProps> = ({ initialData = [], teachers = [], user }) => {

  const [users, setUsers] = useState<User[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resendingUserId, setResendingUserId] = useState<string | null>(null);
  const notification = useNotification();
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    role: 'Guru' as UserRole,
    teacherId: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
        role: user.role,
        teacherId: user.teacherId || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
        const response = await fetch(`/api/users/${editingUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            window.location.reload();
        } else {
            const errData = await response.json().catch(() => ({}));
            alert(errData.error || 'Gagal menyimpan perubahan');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        alert('Terjadi kesalahan saat menyimpan');
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteClick = (userToDel: User) => {
    setDeleteError(null);
    if (userToDel.id === user?.id) {
      setDeleteError('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      setUserToDelete(userToDel);
      setIsDeleteModalOpen(true);
      return;
    }

    if (userToDel.role === 'Super Admin') {
      const superAdmins = users.filter(u => u.role === 'Super Admin');
      if (superAdmins.length <= 1) {
        setDeleteError('Tidak dapat menghapus. Harus ada minimal satu Super Admin di sistem.');
        setUserToDelete(userToDel);
        setIsDeleteModalOpen(true);
        return;
      }
    }

    setUserToDelete(userToDel);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || deleteError) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const errData = await response.json().catch(() => ({}));
        setDeleteError(errData.error || 'Gagal menghapus pengguna');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeleteError('Terjadi kesalahan saat menghapus pengguna');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResendEmail = async (targetUser: User) => {
    setResendingUserId(targetUser.id);
    try {
      const response = await fetch(`/api/users/${targetUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (response.ok) {
        notification.success(result.message || 'Email link setup password berhasil dikirim.');
      } else {
        notification.error(result.error || 'Gagal mengirim ulang email.');
      }
    } catch (err) {
      console.error('Error resending email:', err);
      notification.error('Terjadi kesalahan saat mengirim ulang email.');
    } finally {
      setResendingUserId(null);
    }
  };

  const roleStyles: Record<UserRole, string> = {
    'Super Admin': 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
    'Administrator': 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
    'Guru': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    'Staf': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admin = users.filter(u => u.role === 'Super Admin' || u.role === 'Administrator').length;
    const guru = users.filter(u => u.role === 'Guru').length;
    const aktif = users.filter(u => u.status === 'Aktif').length;
    return { total, admin, guru, aktif };
  }, [users]);

  return (
    <AdminPanel title="Manajemen Pengguna Sistem" activeItem="User" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 mt-5 space-y-8">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Pengguna" value={stats.total} icon={<Users size={24}/>} colorClass="text-indigo-600" bgColor="bg-indigo-600" />
          <StatCard label="Administrator" value={stats.admin} icon={<ShieldCheck size={24}/>} colorClass="text-rose-600" bgColor="bg-rose-600" />
          <StatCard label="Asatidz/Guru" value={stats.guru} icon={<GraduationCap size={24}/>} colorClass="text-emerald-600" bgColor="bg-emerald-600" />
          <StatCard label="Akun Aktif" value={stats.aktif} icon={<UserCheck size={24}/>} colorClass="text-blue-600" bgColor="bg-blue-600" />
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
                  placeholder="Cari nama, user, atau email..."
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
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="All">Semua Role</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Guru">Guru</option>
                  <option value="Staf">Staf</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap h-[50px]"
            >
              <UserPlus size={20} />
              <span>Tambah Pengguna</span>
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identitas Pengguna</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hak Akses & Relasi</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email & Kontak</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-300 group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 ring-2 ring-slate-100 dark:ring-slate-700 shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105 transition-all">
                          <img 
                            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{user.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm inline-block min-w-[110px] text-center ${roleStyles[user.role]}`}>
                            {user.role}
                        </span>
                        {user.teacherName && (
                            <div className="flex items-center gap-1.5 pl-1">
                                <GraduationCap size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{user.teacherName}</span>
                            </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                <Mail size={14} className="text-slate-400" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <Activity size={12} className="text-emerald-500" />
                                <span>Aktif: {user.lastLogin}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className="flex items-center justify-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Aktif' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'Aktif' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                {user.status}
                            </span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                            onClick={() => handleResendEmail(user)}
                            disabled={resendingUserId !== null}
                            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 disabled:opacity-50" 
                            title="Kirim Ulang Email Aktivasi/Reset Password"
                        >
                          {resendingUserId === user.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                        <button 
                            onClick={() => handleEdit(user)}
                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700" 
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

        {/* Add/Edit Modal (Supreme Landscape) */}
        <Modal
          isOpen={isModalOpen}
          size="supreme"
          onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
          title={editingUser ? "Edit Hak Akses" : "Akun Pengguna Baru"}
          description={editingUser ? `Mengatur akses untuk ${editingUser.name}` : "Daftarkan akses sistem baru untuk asatidz atau staf."}
          footer={
            <>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingUser(null); }} 
                className="px-8 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-12 py-3.5 bg-indigo-600 text-white rounded-[20px] text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Shield size={20} />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Hak Akses'}</span>
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Identity Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <UserPlus size={20} />
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Identitas Pengguna</h4>
              </div>

              {editingUser ? (
                <div className="flex items-center gap-4 p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                        <img src={editingUser.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{editingUser.name}</p>
                        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">{editingUser.email}</p>
                    </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="Nama lengkap pengguna..." />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Username</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="user_akses" />
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Email</label>
                  <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                          <Mail size={18} />
                      </span>
                      <input type="email" className="w-full pl-11 pr-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="email@madin.ac.id" />
                  </div>
              </div>
            </div>

            {/* Right Column: Security & Role */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Akses & Keamanan</h4>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Akses Sistem (Role)</label>
                    <select 
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm appearance-none"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    >
                        <option value="Administrator">Administrator</option>
                        <option value="Guru">Guru</option>
                        <option value="Staf">Staf</option>
                        <option value="Super Admin">Super Admin</option>
                    </select>
                </div>

                {formData.role === 'Guru' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Hubungkan dengan Pengajar</label>
                        <select 
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm appearance-none"
                            value={formData.teacherId}
                            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                        >
                            <option value="">— Pilih Pengajar —</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.nip || 'No NIP'})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password Baru</label>
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                            <Key size={18} />
                        </span>
                        <input type="password" className="w-full pl-11 pr-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm" placeholder="••••••••" />
                    </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          variant={deleteError ? "warning" : "danger"}
          size="md"
          onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); setDeleteError(null); }}
          title={deleteError ? "Tindakan Ditolak" : "Konfirmasi Hapus Pengguna"}
          description={deleteError ? "Akses tidak diizinkan oleh sistem" : "Hapus akses pengguna sistem"}
          icon={deleteError ? <Shield size={28} className="text-white" /> : <Trash2 size={28} className="text-white" />}
          footer={
            <>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setUserToDelete(null); setDeleteError(null); }} 
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all"
              >
                {deleteError ? "Tutup" : "Batal"}
              </button>
              {!deleteError && (
                <button 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-8 py-3 bg-rose-600 text-white rounded-2xl text-sm font-black hover:bg-rose-700 shadow-xl shadow-rose-600/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Pengguna'}</span>
                </button>
              )}
            </>
          }
        >
          {deleteError ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto border border-amber-100 dark:border-amber-500/20">
                <Shield size={32} />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-black text-slate-800 dark:text-slate-100">Pelanggaran Aturan Sistem</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{deleteError}</p>
              </div>
            </div>
          ) : (
            userToDelete && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                    <img 
                      src={userToDelete.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userToDelete.name}`} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-md font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight truncate">{userToDelete.name}</p>
                    <p className="text-xs font-bold text-slate-400 tracking-widest uppercase truncate">{userToDelete.email}</p>
                    <span className="inline-block px-2.5 py-0.5 mt-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-rose-100/60 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      {userToDelete.role}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Apakah Anda benar-benar yakin?</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tindakan ini akan menghapus akun pengguna secara permanen dari sistem. Pengguna ini tidak akan dapat login lagi dan semua sesi aktifnya akan segera dihentikan.
                  </p>
                </div>
              </div>
            )
          )}
        </Modal>

      </div>
    </AdminPanel>
  );
};

export default UserManagement;
