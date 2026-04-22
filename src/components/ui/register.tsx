import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  UserPlus,
  Mail,
  ChevronRight, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { authClient } from "../../lib/auth-client";

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        callbackURL: "/login", // Redirect after success if using link
      }, {
        onSuccess: () => {
          setIsSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'Terjadi kesalahan saat pendaftaran.');
        }
      });
      
      if (error) {
        setError(error.message || 'Pendaftaran gagal.');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan sistem. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-10 rounded-[40px] shadow-2xl text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Pendaftaran Berhasil!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            Akun Anda telah berhasil dibuat. Silakan masuk menggunakan email dan password Anda.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm font-bold text-indigo-600 dark:text-indigo-400">
            <Loader2 size={18} className="animate-spin" />
            <span>Mengalihkan ke halaman login...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-5xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        
        {/* Left Side: Branding */}
        <div className="w-full md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <UserPlus size={28} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight">Raport Madin</span>
                <span className="text-xs font-medium text-indigo-100 uppercase tracking-widest">Wali Kelas Register</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold leading-tight mb-6">
              Bergabung Sebagai <br/> 
              <span className="text-indigo-200">Tenaga Pendidik</span>
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-md font-medium">
              Satu langkah lagi untuk mulai mengelola nilai, kehadiran, dan prestasi santri secara digital.
            </p>
          </div>
          
          <div className="relative z-10 md:block hidden">
            <div className="space-y-4">
              {[
                "Input nilai & rapor otomatis",
                "Manajemen kehadiran santri",
                "Pantau target hafalan",
                "Laporan aktivitas wali murid"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/50 flex items-center justify-center border border-white/20">
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-sm font-medium text-indigo-50">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-800">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Daftar Akun</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Lengkapi data di bawah untuk membuat akun baru</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0 mt-1" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all font-medium"
                    placeholder="Contoh: Ust. Ahmad"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email</label>
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
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all font-medium"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
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
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all font-medium"
                    placeholder="Min. 8 karakter"
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

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all font-medium"
                    placeholder="Ulangi password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group mt-6"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2">
              <span className="text-sm text-slate-500 font-medium">Sudah punya akun?</span>
              <a href="/login" className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                Masuk
              </a>
            </div>

            <div className="mt-6">
              <a href="/login" className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <ArrowLeft size={14} />
                Kembali ke Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
