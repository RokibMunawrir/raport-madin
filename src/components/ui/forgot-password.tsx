import React, { useState } from 'react';
import { 
  Mail, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { authClient } from '../../lib/auth-client';
import madin from '../../assets/madin.png';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || 'Gagal mengirim email reset password. Pastikan email terdaftar.');
      } else {
        setIsSuccess(true);
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
              Kehilangan <br/> 
              <span className="text-indigo-200">Kata Sandi Anda?</span>
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
              Jangan khawatir. Cukup masukkan email terdaftar Anda, dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi dengan aman.
            </p>
          </div>
          
          <div className="relative z-10 md:block hidden">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center">
                <ChevronRight size={20} />
              </div>
              <p className="text-sm font-medium">Proses pemulihan sandi berlangsung secara terenkripsi</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            
            {isSuccess ? (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50 dark:ring-emerald-500/5">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Email Terkirim!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                  Kami telah mengirimkan instruksi dan tautan pengaturan ulang password ke <strong>{email}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <ArrowLeft size={18} />
                  Kembali ke Login
                </a>
              </div>
            ) : (
              <div>
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Lupa Password?</h2>
                  <p className="text-slate-500 dark:text-slate-400">Masukkan email Anda untuk menerima link atur ulang password</p>
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
                      Alamat Email
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all placeholder-slate-400 font-medium"
                        placeholder="nama@email.com"
                      />
                    </div>
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
                        Kirim Link Atur Ulang
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <ArrowLeft size={16} />
                    Kembali ke halaman login
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
