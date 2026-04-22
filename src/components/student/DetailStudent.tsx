import React from 'react';
import { 
  User, 
  Calendar,
  ArrowLeft,
  MapPin,
  Phone,
  Home,
  GraduationCap,
  Baby,
  Edit2,
  Building2,
  Printer
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import IndividualReport from './IndividualReport';

interface StudentData {
  id: string;
  nis: string;
  nisn: string | null;
  name: string;
  gender: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  address: string | null;
  province: string | null;
  regency: string | null;
  district: string | null;
  village: string | null;
  parentName: string | null;
  phone: string | null;
  dormitoryId: string | null;
  roomCode: string | null;
  status: string | null;
  classroomId: string | null;
  className?: string | null;
  dormitoryName?: string | null;
}

interface DetailStudentProps {
  student: StudentData;
  user?: any;
  reportData?: any;
}

const InfoRow: React.FC<{ label: string; value: string | null | undefined; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value || '-'}</p>
    </div>
  </div>
);

const DetailStudent: React.FC<DetailStudentProps> = ({ student, user, reportData }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminPanel title="Profil Santri" activeItem="Siswa" user={user}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Header Action */}
        <div className="mb-6 flex items-center justify-between">
            <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95"
            >
                <ArrowLeft size={18} />
                <span className="text-sm font-bold">Kembali</span>
            </button>
            <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrint}
                  disabled={!reportData}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Printer size={18} className="text-indigo-600" />
                    <span>Cetak Rapor</span>
                </button>
                <a 
                  href={`/students/edit/${student.id}`}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95"
                >
                    <Edit2 size={18} />
                    <span>Edit Profil</span>
                </a>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {/* Left Box: Summary Card */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                    <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                    </div>
                    <div className="px-8 pb-10 flex flex-col items-center -mt-16 relative">
                        <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-slate-800 p-2 shadow-2xl mb-4 relative z-10 transition-transform group-hover:scale-105 duration-500">
                            <div className="w-full h-full rounded-[32px] bg-slate-100 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                {student.name ? (
                                  <img 
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} 
                                    alt={student.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={64} className="text-slate-300" />
                                )}
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 text-center uppercase tracking-tight mb-1">{student.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{student.nis || '-'}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                             <span className={`text-[11px] font-black uppercase tracking-widest ${student.gender === 'Laki-laki' ? 'text-blue-500' : 'text-rose-500'}`}>
                                {student.gender === 'Laki-laki' ? 'Putra' : 'Putri'}
                             </span>
                        </div>
                        
                        <div className="w-full flex items-center justify-center gap-2 py-4 border-y border-slate-50 dark:border-slate-700/50 mb-6">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                              student.status === 'Aktif' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                                {student.status}
                            </span>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4">
                            <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Kelas Aktif</p>
                                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{student.className || '-'}</p>
                            </div>
                            <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Asrama</p>
                                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                    {student.dormitoryName || '-'}
                                    {student.roomCode && student.roomCode !== '-' && (
                                        <span className="ml-1 text-slate-400 font-bold">({student.roomCode})</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Detailed Data Tabs-like layout */}
            <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-700 p-8 shadow-indigo-100/10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">
                             <GraduationCap size={20} />
                        </div>
                        <div>
                             <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Informasi Akademik & Pribadi</h4>
                             <p className="text-xs font-bold text-slate-400 mt-0.5">Detail pendaftaran dan data diri santri</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <InfoRow label="NISN (Nasional)" value={student.nisn} icon={<User size={18} />} />
                        <InfoRow label="Status Saat Ini" value={student.status} icon={<GraduationCap size={18} />} />
                        <InfoRow label="Tempat Lahir" value={student.birthPlace} icon={<MapPin size={18} />} />
                        <InfoRow label="Tanggal Lahir" value={student.birthDate ? new Date(student.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} icon={<Calendar size={18} />} />
                        <InfoRow label="Nama Wali" value={student.parentName} icon={<Baby size={18} />} />
                        <InfoRow label="HP Wali" value={student.phone} icon={<Phone size={18} />} />
                    </div>
                </div>

                {/* Address Information */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-700 p-8 shadow-emerald-100/10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
                             <Home size={20} />
                        </div>
                        <div>
                             <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Informasi Domisili</h4>
                             <p className="text-xs font-bold text-slate-400 mt-0.5">Detail alamat asal dan asrama santri</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-2">
                        <div className="sm:col-span-2">
                            <InfoRow label="Alamat Lengkap" value={student.address} icon={<MapPin size={18} />} />
                        </div>
                        <InfoRow label="Asrama" value={student.dormitoryName} icon={<Home size={18} />} />
                        <InfoRow label="No. Kamar" value={student.roomCode} icon={<Building2 size={18} />} />
                        <InfoRow label="Jenjang/Kelas" value={student.className} icon={<GraduationCap size={18} />} />
                    </div>
                </div>
            </div>
        </div>

      </div>
      
      {/* Hidden printable report */}
      {reportData && <IndividualReport data={reportData} />}
    </AdminPanel>
  );
};

export default DetailStudent;
