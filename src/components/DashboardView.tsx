import React from 'react';
import { Device, DeviceType, DeviceCondition } from '../types';
import { 
  Laptop, 
  Monitor, 
  Tv, 
  Network, 
  Cpu, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Activity, 
  History, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface DashboardViewProps {
  devices: Device[];
  onSelectDevice: (device: Device) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({ devices, onSelectDevice, onNavigateToTab }: DashboardViewProps) {
  
  // Calculate statistics
  const totalCount = devices.length;
  
  const laptops = devices.filter(d => d.jenisPerangkat === 'Laptop');
  const laptopsUsable = laptops.filter(d => d.kondisi === 'Baik').length;
  const laptopsBroken = laptops.filter(d => d.kondisi !== 'Baik').length;
  
  const desktops = devices.filter(d => d.jenisPerangkat === 'Komputer Desktop');
  const desktopsUsable = desktops.filter(d => d.kondisi === 'Baik').length;
  const desktopsBroken = desktops.filter(d => d.kondisi !== 'Baik').length;

  const desktopsCount = desktops.length;
  const networkCount = devices.filter(d => d.jenisPerangkat === 'Perangkat Jaringan').length;
  const ifpCount = devices.filter(d => d.jenisPerangkat === 'Interactive Flat Panel (IFP)').length;

  const countByCondition = (cond: DeviceCondition) => devices.filter(d => d.kondisi === cond).length;
  const totalBaik = countByCondition('Baik');
  const totalRusakRingan = countByCondition('Rusak Ringan');
  const totalRusakBerat = countByCondition('Rusak Berat');
  const totalRusak = totalRusakRingan + totalRusakBerat;

  const percentLayak = totalCount > 0 ? Math.round((totalBaik / totalCount) * 100) : 0;
  const percentRusak = totalCount > 0 ? Math.round((totalRusak / totalCount) * 100) : 0;

  // Acquisition by Year
  const years = [2021, 2022, 2023, 2024, 2025];
  const yearCounts = years.map(yr => ({
    year: yr,
    count: devices.filter(d => d.tahunPembuatan === yr).length
  }));
  const maxYearCount = Math.max(...yearCounts.map(y => y.count), 1);

  // Lists
  const brokenDevices = devices.filter(d => d.kondisi !== 'Baik').slice(0, 5);
  
  // Sort devices by date or id for newest
  const sortedByNewest = [...devices].sort((a, b) => {
    return b.id.localeCompare(a.id); // Simulating newest
  }).slice(0, 10);

  // Pie chart calculation helper
  const totalAngles = totalBaik + totalRusakRingan + totalRusakBerat;
  const angleBaik = totalAngles > 0 ? (totalBaik / totalAngles) * 360 : 0;
  const angleRingan = totalAngles > 0 ? (totalRusakRingan / totalAngles) * 360 : 0;
  
  // Coordinates for SVG donut slices (simulating pie segments)
  // To avoid complex math, we can display highly structured and clean progress rings and percentage arcs which are exceptionally modern.
  
  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 hidden md:block">
          <svg className="w-full h-full text-white" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor">
            <path d="M0 100 C 20 0, 50 0, 100 80 L 100 100 Z" />
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            SMAN 1 Teluk Kuantan
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mt-1">Sistem Inventaris Laboratorium Informatika</h2>
          <p className="text-indigo-100 text-sm font-medium">
            Selamat datang di panel utama. Kelola data perangkat, catat status perbaikan dan pemeliharaan laboratorium komputer SMAN 1 Teluk Kuantan secara efisien.
          </p>
        </div>
      </div>

      {/* Quick Summary Section for Principal (Kepala Sekolah) */}
      <div className="bg-white p-5 rounded-2xl border-2 border-emerald-150 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
              Status Kesiapan Laboratorium (Kunjungan Kepala Sekolah)
            </h3>
            <p className="text-[10px] text-slate-400">Ringkasan cepat ketersediaan workstation komputer siap pakai & laptop yang butuh perbaikan.</p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-md self-start sm:self-auto">
            Update Terkini: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Komputer desktop yang bisa digunakan */}
          <div className="bg-emerald-50/50 border border-emerald-150 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">KOMPUTER YANG BISA DIGUNAKAN</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sebanyak <strong className="text-emerald-700 font-extrabold">{desktopsUsable} unit</strong> Komputer Desktop berada dalam kondisi <strong className="text-emerald-700 font-bold">Baik/Layak</strong> dan siap dipakai penuh untuk praktek siswa di labor.
              </p>
            </div>
            <div className="text-center shrink-0 min-w-[75px] bg-white border border-emerald-200 px-3 py-2.5 rounded-xl shadow-xs">
              <span className="block text-3xl font-black text-emerald-600 leading-none">{desktopsUsable}</span>
              <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block tracking-wider">UNIT SIAP</span>
            </div>
          </div>
          
          {/* Card 2: Laptop yang rusak */}
          <div className="bg-rose-50/50 border border-rose-150 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest block">LAPTOP YANG RUSAK</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Terdapat <strong className="text-rose-700 font-extrabold">{laptopsBroken} unit</strong> Laptop terdeteksi <strong className="text-rose-700 font-bold">Rusak</strong> dan membutuhkan perbaikan/pemeliharaan berkala.
              </p>
            </div>
            <div className="text-center shrink-0 min-w-[75px] bg-white border border-rose-200 px-3 py-2.5 rounded-xl shadow-xs">
              <span className="block text-3xl font-black text-rose-600 leading-none">{laptopsBroken}</span>
              <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block tracking-wider">UNIT RUSAK</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Main Stats Bento-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Total Devices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Seluruh Perangkat</span>
            <span className="text-2xl font-black text-slate-800">{totalCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Semua tipe lab</span>
          </div>
        </div>

        {/* Usable Laptops */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Laptop Layak</span>
            <span className="text-2xl font-black text-slate-800">{laptopsUsable}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">Dari {laptops.length} Laptop</span>
          </div>
        </div>

        {/* Broken Laptops */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Laptop Rusak</span>
            <span className="text-2xl font-black text-rose-600">{laptopsBroken}</span>
            <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">Butuh Perbaikan</span>
          </div>
        </div>

        {/* Desktops */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Komputer Desktop</span>
            <span className="text-2xl font-black text-slate-800">{desktopsCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Workstation PC</span>
          </div>
        </div>

        {/* Network Devices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Perangkat Jaringan</span>
            <span className="text-2xl font-black text-slate-800">{networkCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Router, Switch & AP</span>
          </div>
        </div>

        {/* Interactive Flat Panel (IFP) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Interactive Board</span>
            <span className="text-2xl font-black text-slate-800">{ifpCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">IFP Layar Sentuh</span>
          </div>
        </div>

      </div>

      {/* Modern Circular KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Usable Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle 
                cx="56" 
                cy="56" 
                r="46" 
                stroke="#10b981" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - percentLayak / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-slate-800">{percentLayak}%</span>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">LAYAK</span>
            </div>
          </div>
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-800">Persentase Perangkat Layak Pakai</h3>
            <p className="text-xs text-slate-600">
              Sebanyak <strong className="text-emerald-600 font-semibold">{totalBaik} unit</strong> perangkat dalam kondisi prima dan siap digunakan untuk kegiatan belajar-mengajar atau ujian siswa di laboratorium.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> Standar Akreditasi Baik
            </div>
          </div>
        </div>

        {/* Broken Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
              <circle 
                cx="56" 
                cy="56" 
                r="46" 
                stroke="#f43f5e" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - percentRusak / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-rose-600">{percentRusak}%</span>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">RUSAK</span>
            </div>
          </div>
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-800">Persentase Perangkat Rusak</h3>
            <p className="text-xs text-slate-600">
              Sebanyak <strong className="text-rose-600 font-semibold">{totalRusak} unit</strong> terdeteksi memiliki kerusakan, di antaranya {totalRusakRingan} rusak ringan dan {totalRusakBerat} rusak berat.
            </p>
            <button 
              id="btn-navigate-perbaikan"
              onClick={() => onNavigateToTab('perbaikan')}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full font-bold transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Lihat Perbaikan Perangkat
            </button>
          </div>
        </div>

      </div>

      {/* Visual Analytics / Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Kondisi Perangkat (Pie / Donut distribution) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Distribusi Kondisi Perangkat</h3>
              <p className="text-[11px] text-slate-400">Rasio kelayakan seluruh inventaris laboratorium</p>
            </div>
            <Activity className="w-5 h-5 text-sky-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Visual Arc representation */}
            <div className="flex justify-center p-4">
              <div className="relative w-40 h-40">
                {/* Simulated multi-segment chart using nested circles or simple customized layout */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Outer circle - background */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  
                  {/* Segment 1: Baik (Green) */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3.2" 
                    strokeDasharray={`${(totalBaik/totalCount)*100} ${100 - (totalBaik/totalCount)*100}`}
                    strokeDashoffset="0"
                  />
                  
                  {/* Segment 2: Rusak Ringan (Yellow) */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="3.2" 
                    strokeDasharray={`${(totalRusakRingan/totalCount)*100} ${100 - (totalRusakRingan/totalCount)*100}`}
                    strokeDashoffset={`${-((totalBaik/totalCount)*100)}`}
                  />
                  
                  {/* Segment 3: Rusak Berat (Red) */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="3.2" 
                    strokeDasharray={`${(totalRusakBerat/totalCount)*100} ${100 - (totalRusakBerat/totalCount)*100}`}
                    strokeDashoffset={`${-(((totalBaik + totalRusakRingan)/totalCount)*100)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-black text-slate-800">{totalCount}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Perangkat</span>
                </div>
              </div>
            </div>

            {/* Labels and values */}
            <div className="space-y-4">
              {/* Baik */}
              <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-3">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Kondisi Baik (Layak)</span>
                  <span className="text-lg font-extrabold text-slate-800">{totalBaik} unit</span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {totalCount > 0 ? Math.round((totalBaik/totalCount)*100) : 0}%
                </span>
              </div>
              {/* Rusak Ringan */}
              <div className="flex items-center justify-between border-l-4 border-amber-500 pl-3">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Rusak Ringan</span>
                  <span className="text-lg font-extrabold text-slate-800">{totalRusakRingan} unit</span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {totalCount > 0 ? Math.round((totalRusakRingan/totalCount)*100) : 0}%
                </span>
              </div>
              {/* Rusak Berat */}
              <div className="flex items-center justify-between border-l-4 border-rose-500 pl-3">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Rusak Berat</span>
                  <span className="text-lg font-extrabold text-slate-800">{totalRusakBerat} unit</span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {totalCount > 0 ? Math.round((totalRusakBerat/totalCount)*100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Perangkat Berdasarkan Tahun Pembuatan (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Grafik Perangkat Berdasarkan Tahun</h3>
              <p className="text-[11px] text-slate-400">Akuisisi inventaris dalam rentang 5 tahun terakhir</p>
            </div>
            <Calendar className="w-5 h-5 text-indigo-500" />
          </div>

          {/* Handcrafted Responsive SVG Bar Chart */}
          <div className="space-y-4 pt-2">
            <div className="h-44 w-full flex items-end gap-3 justify-between px-2">
              {yearCounts.map((item) => {
                const heightPercent = (item.count / maxYearCount) * 100;
                return (
                  <div key={item.year} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-extrabold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count} unit
                    </span>
                    <div 
                      style={{ height: `${Math.max(heightPercent, 5)}%` }} 
                      className="w-full bg-gradient-to-t from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-t-lg transition-all duration-300 relative shadow-xs"
                    >
                      <div className="absolute inset-0 bg-white/10 rounded-t-lg" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.year}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Legend info */}
            <div className="border-t border-slate-100 pt-3 text-center">
              <span className="text-[10px] font-semibold text-slate-400">
                Peningkatan inventaris tertinggi terjadi pada tahun <strong className="text-slate-600">2024</strong> (Bantuan BOS).
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Tables Row: Broken Equipment List vs Newest registered devices */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Broken Equipment List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Daftar Perangkat Rusak Terbaru</h3>
              <p className="text-[11px] text-slate-400">Butuh verifikasi dan tindakan pemeliharaan segera</p>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {totalRusak} Item Rusak
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {brokenDevices.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Luar biasa! Tidak ada perangkat dalam status rusak saat ini.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Nama Perangkat</th>
                    <th className="py-2.5">Ruangan</th>
                    <th className="py-2.5 text-center">Kondisi</th>
                    <th className="py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brokenDevices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">
                        <div className="font-bold">{dev.namaPerangkat}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{dev.kodeInventaris}</div>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">{dev.lokasiRuangan}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                          dev.kondisi === 'Rusak Berat' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {dev.kondisi}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onSelectDevice(dev)}
                          className="p-1 px-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-bold text-[10px] inline-flex items-center gap-0.5"
                        >
                          Detail <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Newest Assets Registered */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">10 Perangkat Terbaru</h3>
              <p className="text-[11px] text-slate-400">Daftar pendaftaran perangkat paling baru ke sistem</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Paling Baru
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5">Nama Perangkat</th>
                  <th className="py-2.5">Jenis</th>
                  <th className="py-2.5">Tahun</th>
                  <th className="py-2.5 text-right">Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedByNewest.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => onSelectDevice(dev)}>
                    <td className="py-2.5 font-semibold text-slate-800">
                      <div className="font-bold hover:text-sky-600 transition-colors">{dev.namaPerangkat}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{dev.kodeInventaris}</div>
                    </td>
                    <td className="py-2.5 text-slate-500 font-medium">{dev.jenisPerangkat}</td>
                    <td className="py-2.5 text-slate-600 font-bold">{dev.tahunPembuatan}</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${
                        dev.kondisi === 'Baik'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                          : dev.kondisi === 'Rusak Ringan'
                          ? 'bg-amber-50 text-amber-700 border-amber-150'
                          : 'bg-rose-50 text-rose-700 border-rose-150'
                      }`}>
                        {dev.kondisi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
