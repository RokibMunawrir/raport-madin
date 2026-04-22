import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Activity, 
  Trophy, 
  Settings, 
  Database,
  HelpCircle,
  PlayCircle,
  FileText
} from 'lucide-react';
import AdminPanel from '../ui/panel';

const categories = [
  { id: 'getting-started', name: 'Mulai Menggunakan', icon: <PlayCircle size={20} /> },
  { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'students', name: 'Manajemen Siswa', icon: <Users size={20} /> },
  { id: 'presence', name: 'Keaktifan & Absensi', icon: <Activity size={20} /> },
  { id: 'achievements', name: 'Prestasi & Hafalan', icon: <Trophy size={20} /> },
  { id: 'master-data', name: 'Data Master', icon: <Database size={20} /> },
  { id: 'settings', name: 'Pengaturan', icon: <Settings size={20} /> },
];

const articles = [
  {
    id: 1,
    category: 'getting-started',
    title: 'Pengenalan Aplikasi Raport Madin',
    content: 'Selamat datang di Raport Madin. Aplikasi ini dirancang khusus untuk mempermudah Madrasah Diniyah dalam mengelola data akademik santri secara terpusat, modern, dan mudah dipahami. Sistem ini mencakup pencatatan nilai, presensi harian, prestasi hafalan, hingga pengelolaan kelas.',
    readTime: '2 min read',
  },
  {
    id: 2,
    category: 'students',
    title: 'Cara Menambahkan Siswa Baru',
    content: 'Untuk menambahkan siswa baru, navigasi ke menu "Siswa", kemudian klik tombol "Tambah Siswa" di sudut kanan atas. Anda akan diminta untuk melengkapi formulir pendaftaran, mulai dari identitas dasar, wali/orang tua, hingga penempatan asrama dan kelas.',
    readTime: '3 min read',
  },
  {
    id: 3,
    category: 'students',
    title: 'Mengelola Status Kelulusan Siswa',
    content: 'Siswa dapat diubah statusnya menjadi Lulus, Non-aktif, atau Pindah. Klik icon Edit pada tabel Siswa yang bersangkutan, kemudian ubah "Status" di bagian profil akademik.',
    readTime: '1 min read',
  },
  {
    id: 4,
    category: 'presence',
    title: 'Melakukan Presensi Harian 3 Jam',
    content: 'Modul keaktifan mendukung fitur presensi harian dengan skema 3 slot jam. Silakan pilih kelas, lalu tentukan hari dan tanggal. Klik indikator pada masing-masing jam untuk mengatur status absen santri (Hadir, Sakit, Izin, Alpha).',
    readTime: '4 min read',
  },
  {
    id: 5,
    category: 'master-data',
    title: 'Mengatur Wali Kelas & Tahun Ajaran',
    content: 'Semua konfigurasi utama (seperti Tahun Ajaran Baru atau penunjukan Guru menjadi Wali Kelas) wajib dilakukan melalui menu Data Master. Perubahan di menu Data Master akan otomatis memengaruhi *dropdown* pilihan pada menu operasional lainnya.',
    readTime: '2 min read',
  },
  {
    id: 6,
    category: 'achievements',
    title: 'Sistem Pencatatan Hafalan Santri',
    content: 'Catat capaian hafalan Al-Qur\'an atau kitab kuning pada menu Prestasi. Setiap hafalan yang telah disetorkan dapat diverifikasi dan dinilai oleh asatidz, yang kemudian akan langsung terkalkulasi ke dalam Raport di akhir semester.',
    readTime: '3 min read',
  }
];

const Guidelines: React.FC<{ user?: any }> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = searchQuery !== '' ? true : article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminPanel title="Panduan Aplikasi" activeItem="Panduan" user={user}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-indigo-600 dark:bg-indigo-900 border border-indigo-500 shadow-lg shadow-indigo-600/20 mb-8 p-8 md:p-10">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-indigo-700/40 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white max-w-xl">
              <div className="flex items-center gap-3 mb-4 opacity-90">
                <BookOpen size={24} className="text-indigo-200" />
                <span className="text-sm font-bold uppercase tracking-widest text-indigo-100">Pusat Bantuan & Panduan</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                Pelajari Cara Menggunakan <br/><span className="text-indigo-200">Raport Madin</span>
              </h1>
              <p className="text-indigo-100 leading-relaxed text-sm md:text-base font-medium opacity-90 shadow-sm">
                Temukan panduan, tips, dan penjelasan mendalam untuk menavigasi setiap fitur sistem manajemen madrasah ini dengan efisien. 
              </p>
            </div>

            {/* Search Input on Hero */}
            <div className="w-full md:w-96 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-200">
                  <Search size={20} />
                </span>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/10 border-transparent rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium"
                  placeholder="Cari topik panduan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation (Hidden if searching globally) */}
          <div className={`w-full lg:w-72 flex-shrink-0 transition-all duration-300 ${searchQuery !== '' ? 'hidden lg:block opacity-50 pointer-events-none' : ''}`}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sticky top-24">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-3 mt-2">Kategori Panduan</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                      activeCategory === category.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${activeCategory === category.id ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'}`}>
                        {category.icon}
                      </span>
                      <span className="font-semibold text-sm">{category.name}</span>
                    </div>
                    {activeCategory === category.id && (
                      <ChevronRight size={16} className="text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Article List / Results */}
          <div className="flex-1">
            {searchQuery !== '' && (
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Hasil Pencarian untuk: <span className="text-indigo-600 dark:text-indigo-400">"{searchQuery}"</span>
                </h2>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Bersihkan
                </button>
              </div>
            )}

            {filteredArticles.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
                <HelpCircle size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Panduan tidak ditemukan</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                  Kami tidak bisa menemukan artikel panduan yang cocok dengan pencarian Anda. Coba gunakan kata kunci berbeda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredArticles.map((article) => {
                  const categoryInfo = categories.find(c => c.id === article.category);
                  
                  return (
                    <div 
                      key={article.id} 
                      className="bg-white dark:bg-slate-800 group rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col sm:flex-row"
                    >
                      <div className="p-6 sm:p-8 flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400">
                            {categoryInfo?.icon}
                            {categoryInfo?.name}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                            <FileText size={12} />
                            {article.readTime}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                          {article.content}
                        </p>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-bold opacity-0 lg:opacity-100 -translate-x-4 lg:translate-x-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          Baca Selengkapnya <ChevronRight size={16} />
                        </div>
                      </div>
                      
                      <div className="hidden sm:block w-2 sm:w-3 bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Can't find help card */}
            <div className="mt-8 bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Masih kebingungan?</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Hubungi tim administrator madrasah untuk panduan lebih lanjut.</p>
              </div>
              <button className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm transition-all whitespace-nowrap">
                Hubungi Support
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </AdminPanel>
  );
};

export default Guidelines;
