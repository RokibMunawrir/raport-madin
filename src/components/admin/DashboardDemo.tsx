import React, { useState, useMemo } from 'react';

import AdminPanel from '../ui/panel';
import Dashboard from './dashboard';
import StudentManagement from './student';

interface DashboardDemoProps {
  stats?: any;
  recentLogs?: any[];
  systemMetrics?: any[];
  academicYear?: any;
  waliKelasData?: any;
  teacherData?: any;
  staffData?: any;
  user?: any;
}


const DashboardDemo: React.FC<DashboardDemoProps> = ({ stats, recentLogs, systemMetrics, academicYear, waliKelasData, teacherData, staffData, user }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  
  // 1. Map database role to dashboard roles
  const mappedRole = useMemo(() => {
    const dbRole = user?.role?.toLowerCase() || '';
    if (dbRole === 'super admin' || dbRole === 'admin') return 'admin';
    if (dbRole === 'guru') {
       if (waliKelasData?.classroom) return 'wali_kelas';
       return 'guru';
    }
    return 'staff';
  }, [user, waliKelasData]);

  // 2. Local state for manual switching (for admins/demo)
  const [overrideRole, setOverrideRole] = useState<'admin' | 'wali_kelas' | 'guru' | 'staff' | null>(null);
  const activeRole = overrideRole || mappedRole;

  const roleLabels = {
    admin: 'Administrator',
    wali_kelas: 'Wali Kelas',
    guru: 'Guru / Pengajar',
    staff: 'Staff Operasional'
  };

  return (
    <AdminPanel 
      title={activeItem === 'Dashboard' ? roleLabels[activeRole] : activeItem}
      activeItem={activeItem}
      setActiveItem={setActiveItem}
      user={user}
    >
      <div className="mt-6">
        {/* Role Switcher for Demo Purposes - only show on Dashboard */}
        {activeItem === 'Dashboard' && (user?.role === 'Super Admin' || user?.role === 'admin') && (
          <div className="mb-8 flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
            {(['admin', 'wali_kelas', 'guru', 'staff'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setOverrideRole(r)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeRole === r 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        )}

        {activeItem === 'Dashboard' ? (
          <Dashboard 
            role={activeRole} 
            stats={stats} 
            recentLogs={recentLogs} 
            systemMetrics={systemMetrics} 
            academicYear={academicYear}
            waliKelasData={waliKelasData}
            teacherData={teacherData}
            staffData={staffData}
            user={user}
          />
        ) : activeItem === 'Siswa' ? (
          <StudentManagement />
        ) : (
          <div className="p-12 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400">Halaman {activeItem} sedang dalam pengembangan.</p>
          </div>
        )}
      </div>
    </AdminPanel>
  );
};

export default DashboardDemo;
