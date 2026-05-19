import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  FileCheck, 
  AlertCircle, 
  Info,
  Clock,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';
import AdminPanel from '../ui/panel';

interface Log {
  id: string;
  title: string;
  description: string | null;
  type: string;
  module: string | null;
  createdAt: Date | string;
}

interface SystemLogProps {
  initialLogs: Log[];
  total: number;
  totalPages: number;
  currentPage: number;
  stats: {
    total: number;
    success: number;
    warning: number;
    error: number;
  };
  user?: any;
}


const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{value.toLocaleString()}</h3>
      </div>
    </div>
  </div>
);

const getStatusStyles = (type: string) => {
  switch (type) {
    case 'success':
      return {
        icon: <FileCheck size={16} className="text-emerald-600 dark:text-emerald-400" />,
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        text: 'text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500'
      };
    case 'warning':
      return {
        icon: <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />,
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500'
      };
    case 'error':
      return {
        icon: <AlertCircle size={16} className="text-red-600 dark:text-red-400" />,
        bg: 'bg-red-50 dark:bg-red-500/10',
        text: 'text-red-700 dark:text-red-400',
        dot: 'bg-red-500'
      };
    default:
      return {
        icon: <Info size={16} className="text-indigo-600 dark:text-indigo-400" />,
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        text: 'text-indigo-700 dark:text-indigo-400',
        dot: 'bg-indigo-500'
      };
  }
};

const formatTime = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  });
};

const SystemLog: React.FC<SystemLogProps> = ({ initialLogs, total, totalPages, currentPage, stats, user }) => {

  const [showFilter, setShowFilter] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('Semua');

  const modules = ['Semua', 'Sistem', 'Akademik', 'Admin', 'Kesiswaan'];

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', pageNum.toString());
    window.location.href = url.toString();
  };

  const getPagesToShow = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <AdminPanel title="System Activity Log" activeItem="System Activity Log" user={user}>

        <div className="mt-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Management Utilities
            </div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                System Activity Log
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-800">
                {total} Total
                </span>
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Audit trail lengkap untuk setiap aktifitas di dalam sistem.
            </p>
            </div>

            <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                showFilter 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:shadow-md'
                }`}
            >
                <Filter size={18} />
                <span>Filter</span>
            </button>
            </div>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Logs" value={stats.total} icon={<History size={24} className="text-indigo-600" />} color="bg-indigo-600" />
            <StatCard title="Berhasil" value={stats.success} icon={<ShieldCheck size={24} className="text-emerald-600" />} color="bg-emerald-600" />
            <StatCard title="Peringatan" value={stats.warning} icon={<AlertCircle size={24} className="text-amber-600" />} color="bg-amber-600" />
            <StatCard title="Error" value={stats.error} icon={<AlertCircle size={24} className="text-red-600" />} color="bg-red-600" />
        </div>

        {/* Filter Bar */}
        {showFilter && (
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Search Activity</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                    type="text"
                    placeholder="Cari berdasarkan judul atau deskripsi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                </div>
                </div>

                <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Module</label>
                <select 
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                >
                    {modules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                </select>
                </div>

                <div className="flex items-end">
                <button 
                    onClick={() => {
                    setSearch('');
                    setSelectedModule('Semua');
                    }}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold rounded-xl text-sm transition-all"
                >
                    Reset Filter
                </button>
                </div>
            </div>
            </div>
        )}

        {/* Main Content: Log List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-bottom border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Aktifitas</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modul</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Waktu Kejadian</th>
                    <th className="px-4 py-4 w-10"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {initialLogs.map((log) => {
                    const styles = getStatusStyles(log.type);
                    return (
                    <tr key={log.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                        <td className="px-6 py-4">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${styles.bg} mt-1`}>
                            {styles.icon}
                            </div>
                            <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1">{log.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-lg">{log.description || 'Tidak ada detail tambahan.'}</p>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md uppercase tracking-tighter">
                            {log.module || 'System'}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatTime(log.createdAt)}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                            <Clock size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-400 font-medium tracking-tight italic">Audit verified</span>
                            </div>
                        </div>
                        </td>
                        <td className="px-4 py-4">
                        <button className="p-1 text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 transition-all">
                            <MoreVertical size={18} />
                        </button>
                        </td>
                    </tr>
                    );
                })}

                {initialLogs.length === 0 && (
                    <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-full">
                            <History size={48} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 text-sm italic font-medium tracking-tight">Belum ada aktifitas yang terekam.</p>
                        </div>
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-500 tracking-tight">
                Menampilkan <span className="text-slate-800 dark:text-slate-200">{initialLogs.length}</span> dari <span className="text-slate-800 dark:text-slate-200">{total}</span> rekaman
            </p>
            
            <div className="flex items-center gap-2">
                <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1">
                {getPagesToShow().map((pageNum) => {
                    return (
                    <button 
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[32px] h-8 text-[10px] font-black rounded-lg transition-all ${
                        currentPage === pageNum 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {pageNum}
                    </button>
                    );
                })}
                </div>
                <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                <ChevronRight size={16} />
                </button>
            </div>
            </div>
        </div>
        </div>
    </AdminPanel>
  );
};

export default SystemLog;
