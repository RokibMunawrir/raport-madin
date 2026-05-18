import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { authClient } from '../../lib/auth-client';

interface ResetPasswordProps {
  /** Mode panel: digunakan dari halaman settings (ubah password dengan sesi aktif) */
  userId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  requireCurrentPassword?: boolean;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ 
  userId, 
  onSuccess, 
  onCancel,
  requireCurrentPassword = false 
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isTokenMode, setIsTokenMode] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strength, setStrength] = useState(0);

  // Deteksi token dari URL query params (link dari email)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      setIsTokenMode(true);
    }
  }, []);

  const calculateStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    setStrength(s);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    calculateStrength(val);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Kata sandi minimal harus 8 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      if (isTokenMode && token) {
        // Mode link email: gunakan token dari URL
        const { error: resetError } = await authClient.resetPassword({
          newPassword,
          token,
        });

        if (resetError) {
          if (resetError.message?.toLowerCase().includes('expired')) {
            setTokenError('Link pengaturan password telah kadaluarsa. Silakan daftar ulang atau minta link baru.');
          } else {
            setError(resetError.message || 'Gagal mengatur password. Pastikan link masih valid.');
          }
          return;
        }

        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        // Mode ubah password (dari settings dengan sesi aktif)
        // Update password menggunakan better-auth API
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: requireCurrentPassword ? currentPassword : undefined,
            newPassword,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Gagal memperbarui kata sandi.');
          return;
        }

        setIsSuccess(true);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError('Terjadi kesalahan sistem. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  const strengthLabels = ['Sangat Lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const strengthColors = [
    'bg-slate-200',
    'bg-rose-500',
    'bg-amber-500',
    'bg-indigo-500',
    'bg-emerald-500'
  ];

  // Tampilan jika token kadaluarsa
  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-10 rounded-[40px] shadow-2xl text-center">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Link Kadaluarsa</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{tokenError}</p>
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all"
          >
            Daftar Ulang
          </a>
        </div>
      </div>
    );
  }

  // Tampilan sukses
  if (isSuccess) {
    return (
      <div className={isTokenMode ? "min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4" : ""}>
        <div className={`bg-white dark:bg-slate-800 p-10 rounded-[40px] shadow-2xl text-center ${isTokenMode ? 'max-w-md w-full' : ''}`}>
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Password Berhasil Diatur!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {isTokenMode
              ? 'Password Anda telah berhasil diatur. Anda akan dialihkan ke halaman login...'
              : 'Kata sandi Anda berhasil diperbarui.'}
          </p>
          {isTokenMode && (
            <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Loader2 size={18} className="animate-spin" />
              <span>Mengalihkan ke halaman login...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isTokenMode && (
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-500/5">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Buat Password Baru</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Gunakan kata sandi yang kuat untuk keamanan akun Anda.</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {requireCurrentPassword && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Sandi Saat Ini</label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Lock size={18} />
            </span>
            <input
              type={showCurrent ? "text" : "password"}
              required
              className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
            {isTokenMode ? 'Password Baru' : 'Sandi Baru'}
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <ShieldCheck size={18} />
            </span>
            <input
              type={showNew ? "text" : "password"}
              required
              className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="Min. 8 karakter"
              value={newPassword}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {/* Strength Indicator */}
          {newPassword && (
            <div className="mt-3 px-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kekuatan Sandi</span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${strength > 0 ? 'text-indigo-500' : 'text-slate-300'}`}>
                  {strengthLabels[strength]}
                </span>
              </div>
              <div className="flex gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all duration-500 ${i <= strength ? strengthColors[strength] : 'bg-slate-100 dark:bg-slate-800'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Konfirmasi Sandi</label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Lock size={18} />
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              required
              className={`block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border rounded-2xl text-sm focus:ring-2 outline-none transition-all dark:text-white ${
                confirmPassword && newPassword !== confirmPassword 
                ? 'border-rose-500 focus:ring-rose-500' 
                : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
              }`}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1.5 ml-1">
              <AlertCircle size={12} />
              Konfirmasi sandi tidak sesuai
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading || (confirmPassword !== '' && newPassword !== confirmPassword)}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>{isTokenMode ? 'Simpan Password' : 'Perbarui Kata Sandi'}</span>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-4 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            Batalkan
          </button>
        )}

        {isTokenMode && (
          <a
            href="/login"
            className="text-center text-xs font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mt-1"
          >
            Kembali ke Login
          </a>
        )}
      </div>
    </form>
  );

  // Jika dalam mode token (halaman penuh), bungkus dengan layout
  if (isTokenMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8">
          {formContent}
        </div>
      </div>
    );
  }

  // Mode panel (dari settings)
  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-1">
      <div className="space-y-6 p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-500/5">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Atur Ulang Sandi</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Gunakan kata sandi yang kuat untuk keamanan akun Anda.</p>
        </div>
        {formContent}
      </div>
    </div>
  );
};

export default ResetPassword;
