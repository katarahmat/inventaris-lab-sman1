import React, { useState, useEffect } from 'react';
import { Device, DeviceType, DeviceCondition, LabRoom } from '../types';
import { Save, RefreshCw, Upload, Image as ImageIcon, Sliders, Info, Cpu, FileText } from 'lucide-react';
import { INITIAL_ROOMS } from '../mockData';

interface FormViewProps {
  editDevice: Device | null;
  onSaveDevice: (device: Omit<Device, 'logs'>) => void;
  onCancelEdit: () => void;
  rooms: LabRoom[];
}

const CATEGORY_PRESETS: Record<string, string[]> = {
  'Laptop': [
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400&auto=format&fit=crop&q=60'
  ],
  'Komputer Desktop': [
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&auto=format&fit=crop&q=60'
  ],
  'Interactive Flat Panel (IFP)': [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=60'
  ],
  'Perangkat Jaringan': [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=400&auto=format&fit=crop&q=60'
  ]
};

export default function FormView({ editDevice, onSaveDevice, onCancelEdit, rooms }: FormViewProps) {
  
  // List of available device types (persisted in localStorage)
  const [deviceTypes, setDeviceTypes] = useState<string[]>(() => {
    const local = localStorage.getItem('inv_custom_device_types');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return ['Laptop', 'Komputer Desktop', 'Interactive Flat Panel (IFP)', 'Perangkat Jaringan'];
  });

  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  // Local Form state fields
  const [kodeInventaris, setKodeInventaris] = useState('');
  const [namaPerangkat, setNamaPerangkat] = useState('');
  const [jenisPerangkat, setJenisPerangkat] = useState<DeviceType>('Laptop');
  const [merk, setMerk] = useState('');
  const [tipeModel, setTipeModel] = useState('');
  const [nomorSeri, setNomorSeri] = useState('');
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('8 GB');
  const [jenisPenyimpanan, setJenisPenyimpanan] = useState<'HDD' | 'SSD' | 'None' | string>('SSD');
  const [kapasitasPenyimpanan, setKapasitasPenyimpanan] = useState('512 GB');
  const [tahunPembuatan, setTahunPembuatan] = useState<number>(2025);
  const [lokasiRuangan, setLokasiRuangan] = useState('Labor Komputer 1');
  const [kondisi, setKondisi] = useState<DeviceCondition>('Baik');
  const [keteranganKerusakan, setKeteranganKerusakan] = useState('');
  const [tanggalPembelian, setTanggalPembelian] = useState(new Date().toISOString().split('T')[0]);
  const [sumberDana, setSumberDana] = useState('Dana BOS');
  const [fotoPerangkat, setFotoPerangkat] = useState('');
  const [catatanTambahan, setCatatanTambahan] = useState('');

  // Synchronize form when editDevice changes
  useEffect(() => {
    if (editDevice) {
      setKodeInventaris(editDevice.kodeInventaris);
      setNamaPerangkat(editDevice.namaPerangkat);
      
      // Auto-append dynamic types if they are missing from list
      if (editDevice.jenisPerangkat && !deviceTypes.includes(editDevice.jenisPerangkat)) {
        const updated = [...deviceTypes, editDevice.jenisPerangkat];
        setDeviceTypes(updated);
        localStorage.setItem('inv_custom_device_types', JSON.stringify(updated));
      }

      setJenisPerangkat(editDevice.jenisPerangkat);
      setMerk(editDevice.merk);
      setTipeModel(editDevice.tipeModel);
      setNomorSeri(editDevice.nomorSeri);
      setProcessor(editDevice.processor);
      setRam(editDevice.ram);
      setJenisPenyimpanan(editDevice.jenisPenyimpanan);
      setKapasitasPenyimpanan(editDevice.kapasitasPenyimpanan);
      setTahunPembuatan(editDevice.tahunPembuatan);
      setLokasiRuangan(editDevice.lokasiRuangan);
      setKondisi(editDevice.kondisi);
      setKeteranganKerusakan(editDevice.keteranganKerusakan || '');
      setTanggalPembelian(editDevice.tanggalPembelian || new Date().toISOString().split('T')[0]);
      setSumberDana(editDevice.sumberDana || 'Dana BOS');
      setFotoPerangkat(editDevice.fotoPerangkat);
      setCatatanTambahan(editDevice.catatanTambahan || '');
    } else {
      // Clear or set new defaults
      resetForm();
    }
  }, [editDevice]);

  // Handle auto-generation of inventory codes
  const generateKodeInventaris = () => {
    const customAbbr = jenisPerangkat ? jenisPerangkat.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() : 'EQP';
    const typeAbbr = {
      'Laptop': 'LPT',
      'Komputer Desktop': 'PC',
      'Interactive Flat Panel (IFP)': 'IFP',
      'Perangkat Jaringan': 'NET'
    }[jenisPerangkat] || (customAbbr || 'EQP');

    const roomIndex = rooms.findIndex(r => r.nama === lokasiRuangan) + 1;
    const roomCode = roomIndex > 0 ? `LAB-0${roomIndex}` : 'LAB-01';
    
    const randomNum = Math.floor(100 + Math.random() * 900); // 3 digit number
    const generated = `INV/${roomCode}/${typeAbbr}/${tahunPembuatan}/${randomNum}`;
    setKodeInventaris(generated);
  };

  // Run auto code generator on mount or when category changes (only for new devices)
  useEffect(() => {
    if (!editDevice) {
      generateKodeInventaris();
      // Also update default photo preset matching category
      const presets = CATEGORY_PRESETS[jenisPerangkat];
      if (presets && presets.length > 0) {
        setFotoPerangkat(presets[0]);
      } else {
        setFotoPerangkat('https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=60');
      }
    }
  }, [jenisPerangkat, lokasiRuangan, tahunPembuatan]);

  const resetForm = () => {
    setNamaPerangkat('');
    setJenisPerangkat('Laptop');
    setMerk('');
    setTipeModel('');
    setNomorSeri('');
    setProcessor('');
    setRam('8 GB');
    setJenisPenyimpanan('SSD');
    setKapasitasPenyimpanan('512 GB');
    setTahunPembuatan(2025);
    setLokasiRuangan('Labor Komputer 1');
    setKondisi('Baik');
    setKeteranganKerusakan('');
    setTanggalPembelian(new Date().toISOString().split('T')[0]);
    setSumberDana('Dana BOS');
    setFotoPerangkat(CATEGORY_PRESETS['Laptop'][0]);
    setCatatanTambahan('');
  };

  // File drag-and-drop simulation / base64 reading
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerangkat(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetPhoto = (url: string) => {
    setFotoPerangkat(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPerangkat || !merk || !kodeInventaris) {
      alert('Mohon isi field wajib (Nama, Merek, Kode Inventaris)');
      return;
    }

    onSaveDevice({
      id: editDevice ? editDevice.id : `D_${Date.now()}`,
      kodeInventaris,
      namaPerangkat,
      jenisPerangkat,
      merk,
      tipeModel,
      nomorSeri,
      processor,
      ram,
      jenisPenyimpanan,
      kapasitasPenyimpanan,
      tahunPembuatan,
      lokasiRuangan,
      kondisi,
      keteranganKerusakan: kondisi !== 'Baik' ? keteranganKerusakan : undefined,
      tanggalPembelian,
      sumberDana,
      fotoPerangkat: fotoPerangkat || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=60',
      catatanTambahan: catatanTambahan || undefined
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden max-w-4xl mx-auto">
      
      {/* Form header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
        <div>
          <h2 className="text-base font-black tracking-wide uppercase">
            {editDevice ? 'Edit Data Inventaris' : 'Form Input Inventaris Baru'}
          </h2>
          <p className="text-xs text-indigo-100 font-medium">
            {editDevice ? `Mengubah data perangkat: ${editDevice.namaPerangkat}` : 'Masukkan data lengkap perangkat laboratorium komputer'}
          </p>
        </div>
        
        {editDevice && (
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg"
          >
            Batal Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs text-slate-700">
        
        {/* Section 1: Data Utama */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            1. Informasi Utama Perangkat
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Nama Perangkat */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Perangkat <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="Contoh: Asus ExpertBook B1400"
                value={namaPerangkat}
                onChange={(e) => setNamaPerangkat(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50"
                required
              />
            </div>

            {/* Jenis Perangkat */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700">Jenis Perangkat</label>
                {!editDevice && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewType(prev => !prev);
                      setNewTypeName('');
                    }}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-all"
                  >
                    {isAddingNewType ? 'Pilih List' : '+ Tambah Baru'}
                  </button>
                )}
              </div>
              
              {isAddingNewType ? (
                <div className="flex gap-1.5 animate-in slide-in-from-top-1 duration-150">
                  <input
                    type="text"
                    placeholder="Masukkan jenis baru (e.g. Printer, Projector)"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    className="flex-1 rounded-xl border border-blue-200 p-2 focus:outline-none focus:border-blue-500 bg-blue-50/10 font-semibold text-slate-800"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newTypeName.trim();
                      if (!trimmed) {
                        alert('Mohon ketikkan nama jenis perangkat baru');
                        return;
                      }
                      // Normalise check
                      if (deviceTypes.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
                        alert('Jenis perangkat ini sudah ada di dalam pilihan!');
                        return;
                      }
                      const updated = [...deviceTypes, trimmed];
                      setDeviceTypes(updated);
                      localStorage.setItem('inv_custom_device_types', JSON.stringify(updated));
                      setJenisPerangkat(trimmed);
                      setNewTypeName('');
                      setIsAddingNewType(false);
                    }}
                    className="px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs transition-all text-[11px]"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select
                  value={jenisPerangkat}
                  onChange={(e) => setJenisPerangkat(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50 cursor-pointer font-medium"
                  disabled={!!editDevice} // Disable type changes on edit
                >
                  {deviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Kode Inventaris */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex justify-between items-center">
                <span>Kode Inventaris <span className="text-rose-500">*</span></span>
                {!editDevice && (
                  <button 
                    type="button" 
                    onClick={generateKodeInventaris}
                    className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                    title="Generate Baru"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Acak
                  </button>
                )}
              </label>
              <input 
                type="text" 
                placeholder="INV/LAB-01/LPT/2026/001"
                value={kodeInventaris}
                onChange={(e) => setKodeInventaris(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono bg-slate-100 font-semibold"
                required
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Merk */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Merek / Brand <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="Contoh: Asus, Dell, Cisco"
                value={merk}
                onChange={(e) => setMerk(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50"
                required
              />
            </div>

            {/* Tipe / Model */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipe / Model</label>
              <input 
                type="text" 
                placeholder="Contoh: B1400CPE, OptiPlex 3000"
                value={tipeModel}
                onChange={(e) => setTipeModel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Nomor Seri */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Seri (S/N)</label>
              <input 
                type="text" 
                placeholder="Contoh: PF2XG8K5, S1004381A"
                value={nomorSeri}
                onChange={(e) => setNomorSeri(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Tahun Pembuatan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Pembuatan / Pengadaan</label>
              <select
                value={tahunPembuatan}
                onChange={(e) => setTahunPembuatan(parseInt(e.target.value) || 2025)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50 cursor-pointer"
              >
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Spesifikasi Teknis */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            2. Spesifikasi Teknis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Processor */}
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Processor / SoC / Engine</label>
              <input 
                type="text" 
                placeholder="Contoh: Intel Core i5-1135G7, AMD Ryzen 5, ARM Quad"
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* RAM */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kapasitas RAM</label>
              <input 
                type="text" 
                placeholder="Contoh: 8 GB, 16 GB DDR4"
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Penyimpanan Dropdown */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Penyimpanan</label>
              <div className="flex gap-1.5">
                <select
                  value={jenisPenyimpanan}
                  onChange={(e) => setJenisPenyimpanan(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="SSD">SSD</option>
                  <option value="HDD">HDD</option>
                  <option value="None">Tidak Ada</option>
                </select>
                
                {jenisPenyimpanan !== 'None' && (
                  <input 
                    type="text" 
                    placeholder="512 GB"
                    value={kapasitasPenyimpanan}
                    onChange={(e) => setKapasitasPenyimpanan(e.target.value)}
                    className="w-20 rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50"
                  />
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Status, Lokasi & Dana */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            3. Kondisi, Lokasi, Pembelian & Sumber Dana
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Lokasi Ruangan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lokasi Ruangan Labor</label>
              <select
                value={lokasiRuangan}
                onChange={(e) => setLokasiRuangan(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50 cursor-pointer"
              >
                {rooms.map(room => (
                  <option key={room.id} value={room.nama}>{room.nama} ({room.kode})</option>
                ))}
              </select>
            </div>

            {/* Kondisi Perangkat */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kondisi Perangkat</label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value as DeviceCondition)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50 cursor-pointer"
              >
                <option value="Baik">Baik (Layak Pakai)</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>

            {/* Tanggal Pembelian */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Pembelian</label>
              <input 
                type="date" 
                value={tanggalPembelian}
                onChange={(e) => setTanggalPembelian(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Sumber Dana */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sumber Dana</label>
              <select
                value={sumberDana}
                onChange={(e) => setSumberDana(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50 cursor-pointer"
              >
                <option value="Dana BOS">Dana BOS</option>
                <option value="Komite Sekolah">Komite Sekolah</option>
                <option value="APBD Provinsi">APBD Provinsi</option>
                <option value="Hibah / Bantuan">Hibah / Bantuan</option>
              </select>
            </div>

          </div>

          {/* Conditional Field: Keterangan Kerusakan */}
          {(kondisi === 'Rusak Ringan' || kondisi === 'Rusak Berat') && (
            <div className="bg-rose-50 p-4 border border-rose-150 rounded-xl space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="block font-bold text-rose-800 flex items-center gap-1">
                <Info className="w-4 h-4 text-rose-600" />
                Deskripsi / Keterangan Kerusakan <span className="text-rose-500">*</span>
              </label>
              <textarea 
                rows={2}
                placeholder="Tuliskan komponen yang rusak atau masalah teknis secara detail..."
                value={keteranganKerusakan}
                onChange={(e) => setKeteranganKerusakan(e.target.value)}
                className="w-full text-xs rounded-xl border border-rose-250 p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white text-slate-800 font-medium"
                required
              />
            </div>
          )}
        </div>

        {/* Section 4: Foto & Catatan */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            4. Foto Perangkat & Catatan Tambahan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Foto Upload simulation */}
            <div className="space-y-3">
              <label className="block font-bold text-slate-700">Foto Perangkat</label>
              
              <div className="border-2 border-dashed border-slate-250 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 text-center relative group min-h-[140px]">
                {fotoPerangkat ? (
                  <div className="relative w-full max-h-[160px] rounded-lg overflow-hidden flex items-center justify-center">
                    <img 
                      src={fotoPerangkat} 
                      alt="Pratinjau" 
                      className="max-h-[160px] object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      type="button"
                      onClick={() => setFotoPerangkat('')}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full text-[10px] font-bold hover:bg-black"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-full bg-slate-100 text-slate-500 inline-block">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">Tarik berkas atau klik di sini</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Dukungan: PNG, JPG (Maks. 2MB)</p>
                    </div>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={!!fotoPerangkat}
                />
              </div>

              {/* Preset suggestions selection */}
              <div className="space-y-1.5">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Atau Pilih Preset Gambar Sesuai Kategori:</span>
                <div className="flex gap-2">
                  {CATEGORY_PRESETS[jenisPerangkat]?.map((presetUrl, idx) => (
                    <button
                      key={presetUrl}
                      type="button"
                      onClick={() => handleSelectPresetPhoto(presetUrl)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${fotoPerangkat === presetUrl ? 'border-blue-500 scale-105 shadow-sm' : 'border-slate-200'}`}
                    >
                      <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan / Keterangan Lain</label>
              <textarea 
                rows={5}
                placeholder="Tuliskan nomor ruangan terperinci, kondisi kelengkapan aksesoris, lisensi sistem, dll..."
                value={catatanTambahan}
                onChange={(e) => setCatatanTambahan(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-blue-500 bg-slate-50/50"
              />
            </div>

          </div>
        </div>

        {/* Form actions */}
        <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
          <button 
            type="button"
            onClick={() => {
              if (editDevice) onCancelEdit();
              else resetForm();
            }}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
          >
            {editDevice ? 'Batal' : 'Atur Ulang'}
          </button>
          
          <button 
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {editDevice ? 'Simpan Perubahan' : 'Daftarkan Perangkat'}
          </button>
        </div>

      </form>
    </div>
  );
}
