import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Camera, 
  Save, 
  ShieldCheck, 
  Key,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminPanel from '../ui/panel';

interface SettingsProfileProps {
  user?: any;
}

const SettingsProfile: React.FC<SettingsProfileProps> = ({ user }) => {
  // --- States ---
  const [profile, setProfile] = useState({
    name: user?.name || 'Admin Utama',
    email: user?.email || 'admin@pondokmadin.edu',
    username: user?.email?.split('@')[0] || 'admin_madin',
    avatar: user?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`
  });


  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // --- Handlers ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    alert('Profil berhasil diperbarui!');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('Password baru dan konfirmasi tidak cocok!');
      return;
    }
    // Simulate save
    alert('Informasi keamanan berhasil diperbarui!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <AdminPanel title="Pengaturan Akun" activeItem="Pengaturan" user={user}>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Bagian Profil */}
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Header Cover */}
              <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-white">
                      <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm shadow-sm scale-95 group-hover:scale-100">
                      <Camera size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Detail */}
              <div className="pt-16 pb-6 px-6 text-center">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1">{profile.name}</h3>
                <p className="text-sm font-medium text-slate-500 flex items-center justify-center gap-1.5 mb-6">
                  <ShieldCheck size={14} className="text-emerald-500" /> Administrator
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                      <Mail size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Email Utama</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                      <User size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Username</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">@{profile.username}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Form */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Form Informasi Personal */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <User size={20} className="text-indigo-500" />
                  Informasi Personal
                </h2>
                <p className="text-sm text-slate-500 mt-1">Perbarui nama lengkap dan alamat email yang Anda gunakan.</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Alamat Email</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95">
                      <Save size={16} />
                      Simpan Profil
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Form Keamanan Akun */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Key size={20} className="text-indigo-500" />
                  Keamanan Akun
                </h2>
                <p className="text-sm text-slate-500 mt-1">Amankan akun Anda dengan menggunakan password kombinasi yang kuat.</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSaveSecurity} className="space-y-5">
                  
                  {/* Peringatan */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Anda akan otomatis logout (keluar) dari perangkat lain setelah mengubah password Anda sebagai langkah pengamanan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ubah Username</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          name="username"
                          value={profile.username}
                          onChange={handleProfileChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password Saat Ini</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock size={18} />
                        </span>
                        <input
                          type={showPassword.current ? "text" : "password"}
                          name="current"
                          value={passwords.current}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className="w-full px-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                        />
                        <button 
                          type="button" 
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password Baru</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock size={18} />
                        </span>
                        <input
                          type={showPassword.new ? "text" : "password"}
                          name="new"
                          value={passwords.new}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className="w-full px-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all dark:text-white"
                        />
                         <button 
                          type="button" 
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock size={18} />
                        </span>
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          name="confirm"
                          value={passwords.confirm}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className={`w-full px-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border ${passwords.new && passwords.confirm && passwords.new !== passwords.confirm ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'} rounded-xl text-sm outline-none focus:ring-2 focus:border-transparent transition-all dark:text-white`}
                        />
                         <button 
                          type="button" 
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white dark:bg-indigo-600 border border-transparent dark:border-indigo-500/30 rounded-xl text-sm font-bold hover:bg-slate-900 dark:hover:bg-indigo-700 shadow-lg shadow-slate-900/10 dark:shadow-indigo-600/20 transition-all transform active:scale-95">
                      <Save size={16} />
                      Simpan Keamanan
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminPanel>
  );
};

export default SettingsProfile;
