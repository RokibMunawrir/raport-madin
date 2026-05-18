import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Trophy, 
  FileText, 
  Settings, 
  Database, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Home,
  GraduationCap,
  Users2,
  Search,
  Bell,
  HelpCircle,
  Calendar,
  Logs,
  LogOut
} from 'lucide-react';
import ThemeController from './themeController';
import { authClient } from '../../lib/auth-client';
import { NotificationProvider } from './notification';
import madin from '../../assets/madin.png';

interface AdminPanelProps {
  title?: string;
  children?: React.ReactNode;
  activeItem?: string;
  setActiveItem?: (item: string) => void;
  user?: {
    name: string;
    role: string;
    classroomName?: string;
  };
}


const AdminPanel: React.FC<AdminPanelProps> = ({ 
  title = 'MDT Al Amiriyyah', 
  children,
  activeItem: externalActiveItem,
  setActiveItem: externalSetActiveItem,
  user
}) => {

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [internalActiveItem, setInternalActiveItem] = useState('Dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  
  const activeItem = externalActiveItem || internalActiveItem;
  const setActiveItem = externalSetActiveItem || setInternalActiveItem;
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-minimized') === 'true';
    }
    return false;
  });

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/login';
        }
      }
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen) {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-minimized', String(isMinimized));
  }, [isMinimized]);

  // Idle Timer Logic (5 minutes)
  useEffect(() => {
    if (!user) return;

    let idleTimeout: NodeJS.Timeout;
    const IDLE_TIME = 5 * 60 * 1000; // 5 minutes

    const resetTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        handleLogout();
      }, IDLE_TIME);
    };

    // Events to track activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initial start
    resetTimer();

    return () => {
      // Cleanup
      clearTimeout(idleTimeout);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { name: 'Siswa', icon: <Users size={20} />, href: '/students' },
    { name: 'Keaktifan Siswa', icon: <Activity size={20} />, href: '/presence' },
    { name: 'Keaktifan Asatidz', icon: <Activity size={20} />, href: '/presence-asatidz' },
    { name: 'Prestasi', icon: <Trophy size={20} />, href: '/achievement' },
    { name: 'Nilai', icon: <FileText size={20} />, href: '/score' },
  ];

  const filteredNavItems = navItems.filter(item => {
    // Guru cannot see Keaktifan Asatidz
    if (user?.role === 'Guru' && item.href === '/presence-asatidz') {
      return false;
    }
    return true;
  });

  const masterDataItems = [
    { name: 'Data Tahun Ajaran', icon: <Calendar size={18} />, href: '/master-data/academic-years' },
    { name: 'Data Asatidz', icon: <Users size={18} />, href: '/master-data/teachers' },
    { name: 'Data Santri', icon: <Users size={18} />, href: '/master-data/students' },
    { name: 'Penempatan Kelas', icon: <GraduationCap size={18} />, href: '/master-data/placement' },
    { name: 'Data Asama', icon: <Home size={18} />, href: '/master-data/dormitory' },
    { name: 'Kelas', icon: <GraduationCap size={18} />, href: '/master-data/class' },
    { name: 'Pengajaran', icon: <Users2 size={18} />, href: '/master-data/teaching' },
    { name: 'Mata Pelajaran', icon: <Users2 size={18} />, href: '/master-data/subject' },
    { name: 'Target Hafalan', icon: <Users2 size={18} />, href: '/master-data/memorize' },
    { name: 'User', icon: <Users2 size={18} />, href: '/master-data/user' },
  ];

  const filteredMasterDataItems = masterDataItems.filter(subItem => {
    // Administrator cannot see User menu
    if (user?.role === 'Administrator' && subItem.href === '/master-data/user') {
      return false;
    }
    return true;
  });

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);
  const toggleMasterData = () => setIsMasterDataOpen(!isMasterDataOpen);
  const toggleMinimized = () => setIsMinimized(!isMinimized);

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
        {/* Mobile Menu Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 z-[45] md:hidden backdrop-blur-[2px] transition-all duration-300 animate-in fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`${
            isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 ${
            isMinimized ? 'md:w-20' : 'md:w-64'
          } w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-out md:relative md:translate-x-0 group`}
        >
          {/* Toggle Button on the line */}
          <button 
            onClick={toggleMinimized} 
            className="hidden md:flex absolute top-20 -right-3 z-40 w-6 h-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title={isMinimized ? "Expand Menu" : "Minimize Menu"}
          >
            {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Sidebar Content wrapper for scroll */}
          <div className="relative h-full flex flex-col overflow-y-auto overflow-x-hidden pt-4 md:pt-0">
            {/* Mobile Close Button - Positioned fully inside the drawer at the right edge */}
            <button 
              onClick={() => setIsMobileOpen(false)} 
              className="md:hidden absolute top-5 right-4 z-50 w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 transition-all active:scale-95"
              aria-label="Close Menu"
            >
              <X size={18} />
            </button>
            <div className={`flex items-center ${isMinimized && !isMobileOpen ? 'justify-center' : 'gap-3'} h-20 px-6 border-b border-slate-100 dark:border-slate-700/50 flex-shrink-0`}>
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <img src={madin.src} alt="Logo" className="w-10 h-10" />
              </div>
              {( !isMinimized || isMobileOpen ) && (
                <div className="flex flex-col min-w-0 transition-opacity duration-300">
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap leading-none mb-1">
                    RAPORT MADIN
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                    MDT AL AMIRIYYAH
                  </span>
                </div>
              )}
            </div>
              


            <nav className={`p-4 ${isMinimized ? 'px-2' : ''} space-y-1 flex-1`}>
            {filteredNavItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setActiveItem(item.name)}
                className={`flex items-center ${isMinimized && !isMobileOpen ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 group ${
                  activeItem === item.name 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={isMinimized && !isMobileOpen ? item.name : ""}
              >
                <span className={`${activeItem === item.name ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`}>
                  {item.icon}
                </span>
                {( !isMinimized || isMobileOpen ) && <span className="whitespace-nowrap">{item.name}</span>}
              </a>
            ))}

            {/* Master Data Dropdown */}
            {!(user?.role === 'Guru' || user?.role === 'Staf' || user?.role === 'Staff') && (
              <div className="pt-2">
                <button
                  onClick={toggleMasterData}
                  className={`w-full flex items-center ${isMinimized && !isMobileOpen ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-lg transition-all duration-200 group ${
                    isMasterDataOpen ? 'bg-slate-50 dark:bg-slate-700/30 text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title={isMinimized && !isMobileOpen ? "Master Data" : ""}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      <Database size={20} />
                    </span>
                    {( !isMinimized || isMobileOpen ) && <span>Master Data</span>}
                  </div>
                  {( !isMinimized || isMobileOpen ) && (
                    <span className={`transition-transform duration-200 ${isMasterDataOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={18} className="text-slate-400 dark:text-slate-500" />
                    </span>
                  )}
                </button>
                
                {isMasterDataOpen && !isMinimized && (
                  <div className="mt-1 ml-4 pl-4 border-l border-slate-100 dark:border-slate-700 space-y-1">
                    {filteredMasterDataItems.map((subItem) => (
                      <a
                        key={subItem.name}
                        href={subItem.href}
                        onClick={() => setActiveItem(subItem.name)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          activeItem === subItem.name 
                            ? 'text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50/50 dark:bg-indigo-900/20' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                        }`}
                      >
                        <span>{subItem.icon}</span>
                        <span>{subItem.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 my-4" />

            <a
              href="/settings"
              onClick={() => setActiveItem('Pengaturan')}
              className={`flex items-center ${isMinimized && !isMobileOpen ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 group ${
                activeItem === 'Pengaturan' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={isMinimized && !isMobileOpen ? "Pengaturan" : ""}
            >
              <span className={`${activeItem === 'Pengaturan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                <Settings size={20} />
              </span>
              {( !isMinimized || isMobileOpen ) && <span>Pengaturan</span>}
            </a>
            <a
              href="/log"
              onClick={() => setActiveItem('Log')}
              className={`flex items-center ${isMinimized && !isMobileOpen ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 group ${
                activeItem === 'Log' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={isMinimized && !isMobileOpen ? "Log" : ""}
            >
              <span className={`${activeItem === 'Log' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                <Logs size={20} />
              </span>
              {( !isMinimized || isMobileOpen ) && <span>Log</span>}
            </a>
          </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden dark:bg-slate-900/50 bg-slate-50/50">
          {/* Top Navbar */}
          <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 lg:px-8 transition-colors duration-300 flex-shrink-0 sticky top-0 z-40">
            <div className="flex items-center gap-4 lg:gap-6 flex-1">
              <button 
                onClick={toggleMobileMenu} 
                className="p-2.5 -ml-1 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 md:hidden flex-shrink-0 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                aria-label="Open Menu"
              >
                <Menu size={22} />
              </button>
              
              <h2 className="hidden lg:block text-xl font-bold text-indigo-900 dark:text-indigo-400 whitespace-nowrap">
                {title}
              </h2>

              {/* Search Bar */}
              <div className="hidden md:flex relative max-w-md w-full ml-4">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400" />
                </span>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-900/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all focus:bg-white dark:focus:bg-slate-900"
                  placeholder="Search students, records..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && globalSearch.trim()) {
                      window.location.href = `/students?search=${encodeURIComponent(globalSearch.trim())}`;
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-4 mr-1">
                <ThemeController />
                <button className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 relative transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                </button>
                <a href="/guidelines" className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer inline-flex items-center justify-center">
                  <HelpCircle size={20} />
                </a>
              </div>

              {/* Profile Dropdown Container */}
              <div className="relative">
                <div 
                  className="flex items-center gap-3 pl-2 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 p-1.5 rounded-2xl transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {user?.name || "Guest User"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                      {user?.role === 'Guru' && user?.classroomName 
                        ? `Wali Kelas ${user.classroomName}`
                        : (user?.role || "Staff")}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 shadow-md group-hover:shadow-lg transition-all overflow-hidden relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Guest'}`}
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} 
                  />
                </div>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">Sistem Manajemen Akademik</p>
                    </div>
                    <div className="p-2">
                       <a href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all">
                          <Settings size={18} className="text-slate-400" />
                          Pengaturan
                       </a>
                    </div>
                    <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                       <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                       >
                          <LogOut size={18} />
                          Keluar Sekarang
                       </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </header>

          {/* Content Body */}
          <div className="flex-1 px-8 pb-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
};

export default AdminPanel;
