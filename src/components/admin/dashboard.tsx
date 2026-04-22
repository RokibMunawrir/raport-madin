import React from 'react';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  TrendingUp, 
  Calendar, 
  Download, 
  FileCheck, 
  AlertCircle,
  Clock,
  LayoutDashboard
} from 'lucide-react';

type Role = 'admin' | 'wali_kelas' | 'guru' | 'staff';

interface DashboardProps {
  role: Role;
  stats?: {
    totalStudents: number;
    totalTeachers: number;
    totalClassrooms: number;
    unvalidatedData: number;
  };
  recentLogs?: any[];
  systemMetrics?: any[];
  academicYear?: any;
  waliKelasData?: any;
  teacherData?: any;
  staffData?: any;
  user?: any;
}



const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}> = ({ title, value, icon, trend, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        {icon}
      </div>
      {trend && (
        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
          <TrendingUp size={12} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{value}</h3>
  </div>
);

const SubHeader: React.FC<{ 
  title: string; 
  subtitle: string; 
  breadcrumb: string; 
  academicYear?: string;
  showActions?: boolean 
}> = ({ title, subtitle, breadcrumb, academicYear, showActions = true }) => (
  <section className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div className="space-y-1">
      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-2 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
        {breadcrumb}
      </div>
      <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
        {title}
      </h1>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </div>

    {showActions && (
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:shadow-md transition-all">
          <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span>{academicYear || 'Pilih Periode'}</span>
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-900 border border-indigo-950 rounded-xl text-sm font-bold text-white hover:bg-indigo-950 shadow-lg shadow-indigo-900/20 transition-all">
          <Download size={18} />
          <span>Export Report</span>
        </button>
      </div>
    )}
  </section>
);

const formatTime = (date: Date | string) => {
  const d = new Date(date);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);
  
  if (diffInMinutes < 1) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam yang lalu`;
  
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const ActivityItem: React.FC<{
  title: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, time, icon, color }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
    <div className={`p-2 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
        <Clock size={12} />
        {time}
      </p>
    </div>
  </div>
);

const WaliKelasDashboard: React.FC<{ waliKelasData?: any, academicYear?: any, user?: any }> = ({ waliKelasData, academicYear, user }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <SubHeader 
      breadcrumb="OVERVIEW WALI KELAS"
      title={waliKelasData?.classroom ? `Selamat Pagi, ${user?.name || 'Wali Kelas'} (${waliKelasData.classroom.name}).` : `Selamat Pagi, ${user?.name || 'Wali Kelas'}.`}
      subtitle={waliKelasData?.classroom ? `Berikut adalah ringkasan performa kelas ${waliKelasData.classroom.name} hari ini.` : "Berikut adalah ringkasan performa kelas Anda hari ini."}
      academicYear={academicYear ? `${academicYear.name} - ${academicYear.semester}` : undefined}
    />

    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Siswa" 
        value={waliKelasData?.totalStudents || 0} 
        icon={<Users size={24} className="text-indigo-600" />} 
        trend="Sandi"
        color="bg-indigo-600"
      />
      <StatCard 
        title="Rerata Kehadiran" 
        value={waliKelasData?.avgAttendance || "0%"} 
        icon={<UserCheck size={24} className="text-emerald-600" />} 
        trend="Stabil"
        color="bg-emerald-600"
      />
      <StatCard 
        title="Prestasi Terbaru" 
        value={waliKelasData?.latestAchievement || "-"} 
        icon={<TrendingUp size={24} className="text-amber-600" />} 
        color="bg-amber-600"
      />
      <StatCard 
        title="Rata-rata Nilai" 
        value={waliKelasData?.avgScore || "0"} 
        icon={<GraduationCap size={24} className="text-rose-600" />} 
        trend="+1.2%"
        color="bg-rose-600"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 px-2">Monitor Kehadiran Harian</h2>
        <div className="space-y-2">
           {waliKelasData?.todayAttendance && waliKelasData.todayAttendance.length > 0 ? waliKelasData.todayAttendance.map((student: any) => (
             <div key={student.nisn} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                    {student.name.substring(0, 2).toUpperCase()}
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{student.name}</p>
                   <p className="text-[10px] text-slate-400 font-medium tracking-tight">NISN: {student.nisn}</p>
                 </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{student.time}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Status</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    student.status === 'Hadir' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' 
                      : student.status === 'Izin' || student.status === 'Sakit'
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20'
                  }`}>
                    {student.status || 'Belum Absen'}
                  </span>
               </div>
             </div>
           )) : (
             <div className="p-8 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
               Belum ada data kehadiran untuk hari ini.
             </div>
           )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Aktivitas Terbaru</h2>
          <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline">Lihat Semua</button>
        </div>
        <div className="space-y-1 relative before:absolute before:left-8 before:top-8 before:bottom-8 before:w-px before:bg-slate-100 dark:before:bg-slate-700">
          {waliKelasData?.classLogs && waliKelasData.classLogs.length > 0 ? waliKelasData.classLogs.map((log: any) => (
            <ActivityItem 
              key={log.id}
              title={log.title} 
              time={formatTime(log.createdAt)} 
              icon={
                log.type === 'success' ? <FileCheck size={18} className="text-emerald-600" /> :
                log.type === 'warning' ? <AlertCircle size={18} className="text-red-600" /> :
                <Users size={18} className="text-indigo-600" />
              } 
              color={
                log.type === 'success' ? 'bg-emerald-600' :
                log.type === 'warning' ? 'bg-red-600' :
                'bg-indigo-600'
              }
            />
          )) : (
            <div className="p-8 text-center text-slate-400 text-sm italic">Belum ada aktifitas terbaru</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard: React.FC<{ stats?: any, logs?: any[], metrics?: any[], academicYear?: any, user?: any }> = ({ stats, logs, metrics, academicYear, user }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <SubHeader 
      breadcrumb="SYSTEM ADMINISTRATION"
      title={`Selamat Pagi, ${user?.name || 'Administrator'}.`}
      subtitle="Memantau operasional madin secara menyeluruh."
      academicYear={academicYear ? `${academicYear.name} - ${academicYear.semester}` : undefined}
    />

    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard 
        title="Total Seluruh Siswa" 
        value={stats?.totalStudents || 0} 
        icon={<Users size={24} className="text-indigo-600" />} 
        trend="+42 Bulan Ini"
        color="bg-indigo-600"
      />
      <StatCard 
        title="Guru & Tenaga Ahli" 
        value={stats?.totalTeachers || 0} 
        icon={<GraduationCap size={24} className="text-emerald-600" />} 
        color="bg-emerald-600"
      />
      <StatCard 
        title="Data Belum Tervalidasi" 
        value={stats?.unvalidatedData || 0} 
        icon={<AlertCircle size={24} className="text-amber-600" />} 
        color="bg-amber-600"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Log Aktifitas */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Log Aktifitas Administrator</h2>
          <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline">Lihat Semua</button>
        </div>
        <div className="space-y-1 relative before:absolute before:left-8 before:top-8 before:bottom-8 before:w-px before:bg-slate-100 dark:before:bg-slate-700">
          {logs && logs.length > 0 ? logs.map((log) => (
            <ActivityItem 
              key={log.id}
              title={log.title} 
              time={formatTime(log.createdAt)} 
              icon={
                log.type === 'success' ? <FileCheck size={18} className="text-emerald-600" /> :
                log.type === 'warning' ? <AlertCircle size={18} className="text-red-600" /> :
                log.type === 'error' ? <AlertCircle size={18} className="text-red-600" /> :
                <Users size={18} className="text-indigo-600" />
              } 
              color={
                log.type === 'success' ? 'bg-emerald-600' :
                log.type === 'warning' ? 'bg-red-600' :
                log.type === 'error' ? 'bg-red-600' :
                'bg-indigo-600'
              }
            />
          )) : (
            <div className="p-8 text-center text-slate-400 text-sm italic">Belum ada aktifitas terbaru</div>
          )}
        </div>
      </div>

      {/* Status Sistem */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 px-2">Status Sistem</h2>
        <div className="space-y-4">
          {metrics && metrics.length > 0 ? metrics.map((metric) => (
            <div key={metric.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${
                  metric.status === 'Online' || metric.status === 'Stabil' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
                  metric.status === 'Peringatan' ? 'bg-amber-50 dark:bg-amber-500/10' :
                  'bg-slate-50 dark:bg-slate-500/10'
                } flex items-center justify-center`}>
                  {metric.component.includes('Database') ? (
                    <LayoutDashboard size={20} className="text-emerald-600 dark:text-emerald-400" />
                  ) : metric.component.includes('Lalu Lintas') ? (
                    <Users size={20} className="text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Clock size={20} className="text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{metric.component}</p>
                  <p className="text-xs text-slate-500">{metric.description}</p>
                </div>
              </div>
              <span className={`text-xs font-bold ${
                metric.status === 'Online' || metric.status === 'Stabil' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' :
                metric.status === 'Peringatan' ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' :
                'text-slate-600 bg-slate-50 dark:bg-slate-500/10'
              } px-3 py-1 rounded-full`}>{metric.status}</span>
            </div>
          )) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <LayoutDashboard size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Database Server</p>
                    <p className="text-xs text-slate-500">Normal • Latency 12ms</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">Online</span>
              </div>
              
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Users size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Lalu Lintas Pengguna</p>
                    <p className="text-xs text-slate-500">Normal • Stabil</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">Stabil</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const StaffDashboard: React.FC<{ staffData?: any, user?: any }> = ({ staffData, user }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <SubHeader 
      breadcrumb="STAFF DASHBOARD"
      title={`Halo, ${user?.name || 'Tim Operasional'}.`}
      subtitle="Siap untuk membantu administrasi sekolah hari ini?"
    />

    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard 
        title="Log Aktifitas Hari Ini" 
        value={staffData?.entriesToday || 0} 
        icon={<FileCheck size={24} className="text-emerald-600" />} 
        color="bg-emerald-600"
      />
      <StatCard 
        title="Siswa Bermasalah (Draft)" 
        value={staffData?.draftStudents || 0} 
        icon={<AlertCircle size={24} className="text-amber-600" />} 
        color="bg-amber-600"
      />
      <StatCard 
        title="Pencatatan Achievement" 
        value={staffData?.readyCertificates || 0} 
        icon={<Download size={24} className="text-indigo-600" />} 
        color="bg-indigo-600"
      />
    </div>

    <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
        <LayoutDashboard size={32} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Cepat, Mudah, Akurat.</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-8">Pantau dan kelola data operasional madrasah dengan lebih efisien melalui dashboard ini.</p>
      <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95">
        Mulai Pengisian Data
      </button>
    </div>
  </div>
);

const TeacherDashboard: React.FC<{ teacherData?: any, academicYear?: any, user?: any }> = ({ teacherData, academicYear, user }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <SubHeader 
      breadcrumb="DASHBOARD PENGAJAR"
      title={`Selamat Pagi, ${user?.name || 'Asatidz'}.`}
      subtitle="Berikut adalah ringkasan kegiatan belajar mengajar Anda."
      academicYear={academicYear ? `${academicYear.name} - ${academicYear.semester}` : undefined}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard 
        title="Mata Pelajaran" 
        value={teacherData?.totalSubjects || 0} 
        icon={<LayoutDashboard size={24} className="text-indigo-600" />} 
        color="bg-indigo-600"
      />
      <StatCard 
        title="Total Kelas Diampu" 
        value={teacherData?.totalClasses || 0} 
        icon={<Users size={24} className="text-emerald-600" />} 
        color="bg-emerald-600"
      />
      <StatCard 
        title="Penugasan Aktif" 
        value={teacherData?.assignments?.length || 0} 
        icon={<FileCheck size={24} className="text-amber-600" />} 
        color="bg-amber-600"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 px-2">Jadwal & Penugasan Mengajar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teacherData?.assignments && teacherData.assignments.length > 0 ? teacherData.assignments.map((assignment: any) => (
            <div key={assignment.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
               <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{assignment.category}</p>
               <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-1">{assignment.subject}</h3>
               <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                 <Users size={14} className="text-slate-400" />
                 <span>Kelas: {assignment.classroom} (Level {assignment.level})</span>
               </div>
            </div>
          )) : (
            <div className="col-span-2 p-12 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
              Tidak ada penugasan mengajar aktif saat ini.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 px-2 text-center">Quick Actions</h2>
        <div className="space-y-3">
          <button className="w-full py-4 px-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center gap-3">
            <GraduationCap size={18} />
            Input Nilai Siswa
          </button>
          <button className="w-full py-4 px-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all flex items-center gap-3">
            <UserCheck size={18} />
            Presensi Kelas
          </button>
          <button className="w-full py-4 px-4 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-sm hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all flex items-center gap-3">
            <TrendingUp size={18} />
            Input Hafalan
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ role, stats, recentLogs, systemMetrics, academicYear, waliKelasData, teacherData, staffData, user }) => {
  return (
    <div className="min-h-full">
      {role === 'admin' && <AdminDashboard stats={stats} logs={recentLogs} metrics={systemMetrics} academicYear={academicYear} user={user} />}
      {role === 'wali_kelas' && <WaliKelasDashboard waliKelasData={waliKelasData} academicYear={academicYear} user={user} />}
      {role === 'guru' && <TeacherDashboard teacherData={teacherData} academicYear={academicYear} user={user} />}
      {role === 'staff' && <StaffDashboard staffData={staffData} user={user} />}
    </div>
  );
};


export default Dashboard;
