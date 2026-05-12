import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { toast } from './notification';

interface ResetPasswordProps {
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  // Simple password strength calculation
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Kata sandi minimal harus 8 karakter');
      return;
    }

    setIsLoading(true);
    
    try {
      // Logic for API call would go here
      // const res = await fetch('/api/auth/reset-password', { ... });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Kata sandi berhasil diperbarui');
      if (onSuccess) onSuccess();
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Gagal memperbarui kata sandi');
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

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-1">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 ring-8 ring-indigo-50/50 dark:ring-indigo-500/5">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Atur Ulang Sandi</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Gunakan kata sandi yang kuat untuk keamanan akun Anda.</p>
        </div>

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
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Sandi Baru</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <ShieldCheck size={18} />
              </span>
              <input
                type={showNew ? "text" : "password"}
                required
                className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="••••••••"
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
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Konfirmasi Sandi</label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <CheckCircle2 size={18} />
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

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || (newPassword !== confirmPassword && confirmPassword !== '')}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Perbarui Kata Sandi</span>
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
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
