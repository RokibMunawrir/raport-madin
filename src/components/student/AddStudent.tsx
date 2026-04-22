import React, { useState, useEffect } from 'react';
import { 
  User, 
  Plus, 
  Calendar,
  UserPlus,
  ArrowLeft,
  MapPin,
  ChevronRight,
  Loader2
} from 'lucide-react';
import AdminPanel from '../ui/panel';
import { toast } from '../ui/notification';

interface Region {
  code: string;
  name: string;
}

interface Dormitory {
  id: string;
  name: string;
  roomCode?: string | null;
}

interface Classroom {
  id: string;
  name: string;
}

interface AcademicYear {
  id: string;
  name: string;
  semester: string;
}

interface AddStudentProps {
  dormitories: Dormitory[];
  classrooms: Classroom[];
  activeYear?: AcademicYear;
  user?: any;
}

const AddStudent: React.FC<AddStudentProps> = ({ dormitories, classrooms, activeYear, user }) => {
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  
  // Wilayah State
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [regencies, setRegencies] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  const [buildingCode, setBuildingCode] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const [loading, setLoading] = useState(false);

  // Fetch Provinces
  useEffect(() => {
    fetch('/api/wilayah/provinces.json')
      .then(res => res.json())
      .then(json => setProvinces(json.data || []))
      .catch(err => console.error("Error fetching provinces:", err));
  }, []);

  // Fetch Regencies
  useEffect(() => {
    if (selectedProvince) {
      setRegencies([]);
      setSelectedRegency("");
      fetch(`/api/wilayah/regencies/${selectedProvince}.json`)
        .then(res => res.json())
        .then(json => setRegencies(json.data || []))
        .catch(() => setRegencies([]));
    }
  }, [selectedProvince]);

  // Fetch Districts
  useEffect(() => {
    if (selectedRegency) {
      setDistricts([]);
      setSelectedDistrict("");
      fetch(`/api/wilayah/districts/${selectedRegency}.json`)
        .then(res => res.json())
        .then(json => setDistricts(json.data || []))
        .catch(() => setDistricts([]));
    }
  }, [selectedRegency]);

  // Fetch Villages
  useEffect(() => {
    if (selectedDistrict) {
      setVillages([]);
      setSelectedVillage("");
      fetch(`/api/wilayah/villages/${selectedDistrict}.json`)
        .then(res => res.json())
        .then(json => setVillages(json.data || []))
        .catch(() => setVillages([]));
    }
  }, [selectedDistrict]);

  const handleDormitoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const dorm = dormitories.find(d => d.id === id);
    if (dorm) {
      setBuildingCode(dorm.roomCode || "");
    } else {
      setBuildingCode("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    // Let the standard action handle it, but we can do validation here if needed
  };

  return (
    <AdminPanel title="Pendaftaran Santri Baru" activeItem="Siswa" user={user}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-5">
        
        {/* Header Action */}
        <div className="mb-6 flex items-center">
            <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95"
            >
                <ArrowLeft size={18} />
                <span className="text-sm font-bold">Kembali</span>
            </button>
        </div>

        {/* Main Form Card */}
        <form method="POST" onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 w-full rounded-[32px] shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-20">
            <input type="hidden" name="gender" value={gender} />
            <input type="hidden" name="roomCode" value={buildingCode && roomNumber ? `${buildingCode}.${roomNumber}` : buildingCode || roomNumber} />
            <div className="px-10 py-7 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Formulir Penerimaan</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lengkapi data santri dengan benar</p>
                </div>
            </div>
            
            <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Left Column: Visual & Basic Info */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-[32px] bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500">
                                <User size={48} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/30 border-4 border-white dark:border-slate-800 transition-transform active:scale-90 ring-1 ring-slate-100 dark:ring-slate-700">
                                <Plus size={16} />
                            </div>
                        </div>
                        <div className="w-full space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor Induk (NIS)</label>
                                <input name="nis" required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm" placeholder="2024xxxx" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gender</label>
                                <div className="flex items-center gap-2">
                                  <button 
                                    type="button"
                                    onClick={() => setGender('Laki-laki')}
                                    className={`flex-1 py-3 text-[11px] font-black rounded-2xl border transition-all ${gender === 'Laki-laki' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                  >
                                    Putra
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setGender('Perempuan')}
                                    className={`flex-1 py-3 text-[11px] font-black rounded-2xl border transition-all ${gender === 'Perempuan' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                  >
                                    Putri
                                  </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Personal & Academic */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap Santri</label>
                                <input name="name" required type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium dark:text-white" placeholder="Nama sesuai ijazah terakhir" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tempat Lahir</label>
                                <input name="birthPlace" type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-white" placeholder="Contoh: Semarang" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal Lahir</label>
                                <input name="birthDate" type="date" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-white" />
                            </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Penempatan Kelas</label>
                                <select name="classroomId" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none dark:text-slate-300 pointer-events-auto">
                                <option value="">Pilih Kelas</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Asrama</label>
                                <select 
                                    name="dormitoryId" 
                                    onChange={handleDormitoryChange}
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none dark:text-slate-300 pointer-events-auto"
                                >
                                <option value="">Pilih Asrama</option>
                                {dormitories.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kamar (Kode . No)</label>
                                <div className="flex gap-2">
                                     <input 
                                        type="text" 
                                        readOnly
                                        className="w-50 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-black text-center text-indigo-600 dark:text-indigo-400 cursor-not-allowed" 
                                        placeholder="Kode" 
                                        value={buildingCode}
                                    />
                                    <div className="flex items-center text-slate-400 font-bold">.</div>
                                    <input 
                                        type="text" 
                                        className="w-20 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold" 
                                        placeholder="01" 
                                        value={roomNumber}
                                        onChange={(e) => setRoomNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Wali Santri</label>
                                <input name="parentName" type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">No. HP Wali</label>
                                <input name="phone" type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm dark:text-white" placeholder="Contoh: 0812xxxx" />
                            </div>

                            {/* Wilayah Section */}
                            <div className="sm:col-span-2 pt-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin size={16} className="text-indigo-500" />
                                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Alamat Asal</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Provinsi</label>
                                        <input type="hidden" name="province" value={provinces.find(p => p.code === selectedProvince)?.name || ''} />
                                        <select 
                                            value={selectedProvince}
                                            onChange={(e) => setSelectedProvince(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs"
                                        >
                                            <option value="">Pilih Provinsi</option>
                                            {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kabupaten/Kota</label>
                                        <input type="hidden" name="regency" value={regencies.find(r => r.code === selectedRegency)?.name || ''} />
                                        <select 
                                            value={selectedRegency}
                                            onChange={(e) => setSelectedRegency(e.target.value)}
                                            disabled={!selectedProvince}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs disabled:opacity-50"
                                        >
                                            <option value="">Pilih Kabupaten</option>
                                            {regencies.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kecamatan</label>
                                        <input type="hidden" name="district" value={districts.find(d => d.code === selectedDistrict)?.name || ''} />
                                        <select 
                                            value={selectedDistrict}
                                            onChange={(e) => setSelectedDistrict(e.target.value)}
                                            disabled={!selectedRegency}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs disabled:opacity-50"
                                        >
                                            <option value="">Pilih Kecamatan</option>
                                            {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Desa/Kelurahan</label>
                                        <input type="hidden" name="village" value={villages.find(v => v.code === selectedVillage)?.name || ''} />
                                        <select 
                                            value={selectedVillage}
                                            onChange={(e) => setSelectedVillage(e.target.value)}
                                            disabled={!selectedDistrict}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs disabled:opacity-50"
                                        >
                                            <option value="">Pilih Desa</option>
                                            {villages.map(v => <option key={v.code} value={v.code}>{v.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 sm:col-span-2 pt-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Domisili (Jl. / Dusun / RT/RW)</label>
                                <textarea name="address" rows={2} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none dark:text-white" placeholder="Alamat lengkap..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="hidden sm:flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20">
                    <Calendar size={18} />
                    </div>
                     <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                     TAHUN AJARAN: <span className="text-indigo-600 dark:text-indigo-400">{activeYear?.name || 'BELUM DIATUR'} ({activeYear?.semester || '-'})</span>
                     </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button type="button" onClick={() => window.history.back()} className="flex-1 sm:flex-none px-8 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all">Batal</button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 sm:flex-none px-12 py-3.5 bg-indigo-600 text-white rounded-[20px] text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                    <span>Simpan Data</span>
                    </button>
                </div>
            </div>
        </form>

      </div>
    </AdminPanel>
  );
};

export default AddStudent;
