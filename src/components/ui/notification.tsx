import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle, Loader2 } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

// --- Observable Store ---
type Listener = (notifications: Notification[]) => void;
class NotificationStore {
  private notifications: Notification[] = [];
  private listeners: Listener[] = [];

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  add(message: string, type: NotificationType, duration = 5000) {
    const id = Math.random().toString(36).substring(2, 9);
    this.notifications = [...this.notifications, { id, message, type, duration }];
    this.emit();

    if (type !== 'loading') {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
    return id;
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.emit();
  }

  success(message: string, duration?: number) { return this.add(message, 'success', duration); }
  error(message: string, duration?: number) { return this.add(message, 'error', duration); }
  info(message: string, duration?: number) { return this.add(message, 'info', duration); }
  warning(message: string, duration?: number) { return this.add(message, 'warning', duration); }
}

export const toast = new NotificationStore();

// --- Hook ---
export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    return toast.subscribe(setNotifications);
  }, []);

  return {
    success: (msg: string, dur?: number) => toast.success(msg, dur),
    error: (msg: string, dur?: number) => toast.error(msg, dur),
    info: (msg: string, dur?: number) => toast.info(msg, dur),
    warning: (msg: string, dur?: number) => toast.warning(msg, dur),
    show: (msg: string, type: NotificationType, dur?: number) => toast.add(msg, type, dur),
    remove: (id: string) => toast.remove(id)
  };
};

// --- Toaster Component ---
export const Toaster: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    return toast.subscribe(setNotifications);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

// --- Toast Item Component ---
const Toast: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { id, message, type, duration = 5000 } = notification;
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type === 'loading') return;
    if (progressRef.current) {
      progressRef.current.style.transition = `width ${duration}ms linear`;
      progressRef.current.style.width = '0%';
    }
  }, [type, duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => toast.remove(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'error': return <AlertCircle className="text-rose-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'info': return <Info className="text-indigo-500" size={20} />;
      case 'loading': return <Loader2 className="text-indigo-500 animate-spin" size={20} />;
    }
  };

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/20 shadow-emerald-200/20',
    error: 'border-rose-500/20 bg-rose-50/70 dark:bg-rose-950/20 shadow-rose-200/20',
    warning: 'border-amber-500/20 bg-amber-50/70 dark:bg-amber-950/20 shadow-amber-200/20',
    info: 'border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/20 shadow-indigo-200/20',
    loading: 'border-slate-500/20 bg-slate-50/70 dark:bg-slate-900/50 shadow-slate-200/20',
  };

  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-indigo-500',
    loading: 'bg-indigo-500',
  };

  return (
    <div 
      className={`
        relative overflow-hidden group pointer-events-auto
        ${isExiting ? 'animate-out fade-out slide-out-to-right-10 scale-95' : 'animate-in fade-in slide-in-from-right-10 scale-100'}
        flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300
        ${colors[type]}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">
          {message}
        </p>
      </div>

      <button 
        onClick={handleRemove}
        className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      {type !== 'loading' && (
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-slate-200/30 dark:bg-slate-700/30">
          <div 
            ref={progressRef}
            className={`h-full ${progressColors[type]} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

// NotificationProvider kept for backward compatibility if needed, but no longer essential
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};

export default toast;
