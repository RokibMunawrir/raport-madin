import React, { useState } from 'react';
import { 
  UserPlus,
  Mail,
  ChevronRight, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  BadgeCheck,
  Hash
} from 'lucide-react';
import madin from '../../assets/madin.png';

const RegisterForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [formData, setFormData] = useState({
    nip: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nip: formData.nip.trim(),
          email: formData.email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
        return;
      }

      setTeacherName(data.teacherName || '');
      setIsSuccess(true);
    } catch (err: any) {
      setError('Terjadi kesalahan jaringan. Periksa koneksi Anda dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-10 rounded-[40px] shadow-2xl text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">
            Pendaftaran Berhasil!
          </h2>
          {teacherName && (
            <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-2">
              Halo, {teacherName}!
            </p>
          )}
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
            Link pengaturan password telah dikirim ke{' '}
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {formData.email}
            </span>
            . Silakan cek inbox atau folder spam Anda.
          </p>
          
          {/* Info box */}
          <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <BadgeCheck size={20} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-1">Langkah selanjutnya:</p>
                <ol className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1 list-decimal list-inside">
                  <li>Buka email yang Anda daftarkan</li>
                  <li>Klik tombol "Atur Password Sekarang"</li>
                  <li>Buat password baru yang kuat</li>
                  <li>Login menggunakan email dan password baru</li>
                </ol>
              </div>
            </div>
          </div>

          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all"
          >
            Kembali ke Halaman Login
            <ChevronRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-5xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Branding */}
        <div className="w-full md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={madin.src} alt="Logo Raport Madin" className="w-12 h-12" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight">Raport Madin</span>
                <span className="text-xs font-medium text-indigo-100 uppercase tracking-widest">MDT Al Amiriyyah</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold leading-tight mb-6">
              Daftar Akun <br/> 
              <span className="text-indigo-200">Pengajar</span>
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-md font-medium">
              Masukkan NIPY dan email Anda yang terdaftar. Link pengaturan password akan dikirimkan ke email tersebut.
            </p>
          </div>
          
          <div className="relative z-10 md:block hidden">
            <div className="space-y-3">
              {[
                { icon: "01", label: "Masukkan NIPY & Email terdaftar" },
                { icon: "02", label: "Cek email untuk link pengaturan password" },
                { icon: "03", label: "Buat password & mulai gunakan sistem" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-black shrink-0 border border-white/30">
                    {step.icon}
                  </div>
                  <span className="text-sm font-medium text-indigo-50">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-slate-800">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
                <UserPlus size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Daftar Akun</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                Masukkan NIPY Anda dan email aktif yang ingin digunakan untuk menerima link pengaturan password.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* NIP Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                  NIPY (Nomor Induk Pegawai Yayasan)
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Hash size={18} />
                  </span>
                  <input
                    type="text"
                    name="nip"
                    id="reg-nip"
                    required
                    value={formData.nip}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all font-medium placeholder-slate-400"
                    placeholder="Contoh: 198501012010011001"
                  />
                </div>
                <p className="text-xs text-slate-400 ml-1">NIPY harus sesuai dengan data yang terdaftar di sistem.</p>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                  Email
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    id="reg-email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200 transition-all font-medium placeholder-slate-400"
                    placeholder="nama@email.com"
                  />
                </div>
                <p className="text-xs text-slate-400 ml-1">Link pengaturan password akan dikirim ke email ini dan otomatis memperbarui data profil Anda.</p>
              </div>

              {/* Info box */}
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    <strong>Informasi:</strong> Masukkan email aktif Anda. Sistem akan otomatis memperbarui email dummy di profil guru Anda dengan email aktif ini agar tetap terhubung.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Link Password</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2">
              <span className="text-sm text-slate-500 font-medium">Sudah punya akun?</span>
              <a href="/login" className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline">
                Masuk
              </a>
            </div>

            <div className="mt-4">
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
