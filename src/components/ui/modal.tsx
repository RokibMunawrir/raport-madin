import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, GraduationCap } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'supreme' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOutsideClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOutsideClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose?.();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  const onOutsideClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    supreme: 'max-w-[95vw] lg:max-w-6xl',
    full: 'max-w-[95vw]',
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500 overflow-hidden"
      onClick={onOutsideClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-slate-800 w-full ${sizeClasses[size]} rounded-[32px] sm:rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] relative`}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between flex-shrink-0 bg-white/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                <GraduationCap size={28} className="text-white" />
              </div>
              <div>
                {title && <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>}
                {description && <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-0.5">{description}</p>}
              </div>
            </div>
            {onClose && (
              <button 
                onClick={onClose} 
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-700 transition-all active:scale-90"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto supreme-scrollbar pr-1">
          <div className="p-10">
            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-10 py-8 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-5 flex-shrink-0">
            {footer}
          </div>
        )}

        {/* Decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600 opacity-[0.03] rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500 opacity-[0.03] rounded-full blur-3xl -z-10"></div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
