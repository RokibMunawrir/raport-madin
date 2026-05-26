import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Database, 
  ChevronRight, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { authClient } from '../../lib/auth-client';
import madin from '../../assets/madin.png';

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      }, {
        onSuccess: () => {
          window.location.href = '/dashboard';
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'Email atau password salah. Silakan coba lagi.');
        }
      });

      if (error) {
          setError(error.message || 'Login gagal.');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan pada sistem. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-5xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Illustration & Brand */}
        <div className="w-full md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={madin.src} alt="Logo" className="w-12 h-12" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight">Raport Madin</span>
                <span className="text-xs font-medium text-indigo-100 uppercase tracking-widest">MDT Al Amiriyyah</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold leading-tight mb-6">
              Kelola Data Akademik <br/> 
              <span className="text-indigo-200">Lebih Mudah & Modern</span>
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
              Platform manajemen pendidikan terintegrasi untuk Madrasah Diniyyah Takmiliyyah Al Amiriyyah. Pantau perkembangan santri secara real-time.
            </p>
          </div>
          
          <div className="relative z-10 md:block hidden">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center">
                <ChevronRight size={20} />
              </div>
              <p className="text-sm font-medium">Masuk untuk mengakses Dashboard Admin</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Selamat Datang</h2>
              <p className="text-slate-500 dark:text-slate-400">Silakan masukkan akun Anda untuk melanjutkan</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Email / Username
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all placeholder-slate-400 font-medium"
                    placeholder="Masukkan email Anda"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a href="/forgot-password" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Lupa Password?
                  </a>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all placeholder-slate-400 font-medium"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 bg-slate-50 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  Ingat saya di perangkat ini
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Masuk Sekarang
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Belum punya akun? <a href="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Daftar Sekarang</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
