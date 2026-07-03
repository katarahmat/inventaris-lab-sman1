import React, { useState, useMemo } from 'react';
import { Device, LabRoom, RepairLog } from '../types';
import { 
  FileText, 
  Printer, 
  FileSpreadsheet, 
  FileDown, 
  MapPin, 
  Calendar, 
  AlertOctagon, 
  ClipboardList, 
  Database,
  Search,
  CheckCircle,
  Eye
} from 'lucide-react';
import { INITIAL_ROOMS } from '../mockData';

interface LaporanViewProps {
  devices: Device[];
  rooms: LabRoom[];
  onSelectDevice: (device: Device) => void;
}

type ReportType = 'keseluruhan' | 'rusak' | 'tahun' | 'ruangan' | 'perbaikan';

export default function LaporanView({ devices, rooms, onSelectDevice }: LaporanViewProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>('keseluruhan');
  
  // Custom filters inside reporting
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');

  // Extract unique years dynamically
  const uniqueYears = useMemo(() => {
    const years = devices.map(d => d.tahunPembuatan);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [devices]);

  // Compute filtered reports dataset
  const reportData = useMemo(() => {
    switch (selectedReport) {
      case 'keseluruhan':
        return devices.filter(d => {
          const roomMatch = filterRoom === '' || d.lokasiRuangan === filterRoom;
          const yearMatch = filterYear === '' || d.tahunPembuatan.toString() === filterYear;
          return roomMatch && yearMatch;
        });

      case 'rusak':
        return devices.filter(d => {
          const roomMatch = filterRoom === '' || d.lokasiRuangan === filterRoom;
          const yearMatch = filterYear === '' || d.tahunPembuatan.toString() === filterYear;
          return d.kondisi !== 'Baik' && roomMatch && yearMatch;
        });

      case 'tahun':
        // Focus on a specific year or all years
        return devices.filter(d => {
          const roomMatch = filterRoom === '' || d.lokasiRuangan === filterRoom;
          if (filterYear !== '') {
            return d.tahunPembuatan.toString() === filterYear && roomMatch;
          }
          return roomMatch;
        }).sort((a, b) => b.tahunPembuatan - a.tahunPembuatan);

      case 'ruangan':
        // Focus on a specific room or all rooms
        return devices.filter(d => {
          const yearMatch = filterYear === '' || d.tahunPembuatan.toString() === filterYear;
          if (filterRoom !== '') {
            return d.lokasiRuangan === filterRoom && yearMatch;
          }
          return yearMatch;
        }).sort((a, b) => a.lokasiRuangan.localeCompare(b.lokasiRuangan));

      case 'perbaikan':
        // Generate dataset based on logs
        const logs: { deviceName: string; kode: string; log: RepairLog }[] = [];
        devices.forEach(d => {
          const roomMatch = filterRoom === '' || d.lokasiRuangan === filterRoom;
          const yearMatch = filterYear === '' || d.tahunPembuatan.toString() === filterYear;
          
          if (roomMatch && yearMatch) {
            d.logs.forEach(l => {
              logs.push({
                deviceName: d.namaPerangkat,
                kode: d.kodeInventaris,
                log: l
              });
            });
          }
        });
        return logs;

      default:
        return [];
    }
  }, [selectedReport, devices, filterRoom, filterYear]);

  // Calculations for summary card
  const totalFinancialCost = useMemo(() => {
    if (selectedReport === 'perbaikan') {
      return (reportData as any[]).reduce((sum, item) => sum + item.log.biayaPerbaikan, 0);
    }
    return 0;
  }, [reportData, selectedReport]);

  const reportTitles = {
    keseluruhan: 'Laporan Inventaris Keseluruhan',
    rusak: 'Laporan Perangkat Rusak',
    tahun: 'Laporan Inventaris Berdasarkan Tahun',
    ruangan: 'Laporan Inventaris Berdasarkan Ruangan',
    perbaikan: 'Laporan Riwayat & Biaya Perbaikan'
  };

  const reportDescriptions = {
    keseluruhan: 'Rekapitulasi lengkap seluruh perangkat keras laboratorium komputer aktif.',
    rusak: 'Daftar inventaris dalam status rusak ringan dan rusak berat yang membutuhkan tindakan perbaikan cepat.',
    tahun: 'Penyusunan data inventaris yang dikelompokkan berdasarkan tahun pembelian/pengadaan perangkat.',
    ruangan: 'Distribusi perangkat komputer dan jaringan yang dipecah berdasarkan ruangan laboratorium aktif.',
    perbaikan: 'Analisis laporan biaya, teknisi penanggung jawab, dan tindakan perbaikan kelayakan perangkat.'
  };

  // Export handlers
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (selectedReport === 'perbaikan') {
      csvContent += "No,Perangkat,Kode,Tanggal Kerusakan,Keterangan Kerusakan,Teknisi,Tindakan,Biaya,Status\n";
      (reportData as any[]).forEach((item, idx) => {
        csvContent += `${idx + 1},"${item.deviceName}","${item.kode}","${item.log.tanggalKerusakan}","${item.log.jenisKerusakan}","${item.log.teknisi}","${item.log.tindakanPerbaikan}",${item.log.biayaPerbaikan},"${item.log.statusPerbaikan}"\n`;
      });
    } else {
      csvContent += "No,Kode Inventaris,Nama Perangkat,Jenis,Merek,Tipe,S/N,Kondisi,Ruang,Tahun\n";
      (reportData as Device[]).forEach((d, idx) => {
        csvContent += `${idx + 1},"${d.kodeInventaris}","${d.namaPerangkat}","${d.jenisPerangkat}","${d.merk}","${d.tipeModel}","${d.nomorSeri}","${d.kondisi}","${d.lokasiRuangan}",${d.tahunPembuatan}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_${selectedReport}_Labor_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* 5 Cards Selection Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Keseluruhan */}
        <button
          onClick={() => { setSelectedReport('keseluruhan'); setFilterRoom(''); setFilterYear(''); }}
          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 h-28 group ${
            selectedReport === 'keseluruhan' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
          }`}
        >
          <Database className={`w-6 h-6 ${selectedReport === 'keseluruhan' ? 'text-white' : 'text-blue-600'}`} />
          <div>
            <span className="text-xs font-bold block">Keseluruhan</span>
            <span className={`text-[9px] block mt-0.5 ${selectedReport === 'keseluruhan' ? 'text-blue-100' : 'text-slate-400'}`}>Semua Perangkat</span>
          </div>
        </button>

        {/* Rusak */}
        <button
          onClick={() => { setSelectedReport('rusak'); setFilterRoom(''); setFilterYear(''); }}
          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 h-28 group ${
            selectedReport === 'rusak' 
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/10' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
          }`}
        >
          <AlertOctagon className={`w-6 h-6 ${selectedReport === 'rusak' ? 'text-white' : 'text-rose-600'}`} />
          <div>
            <span className="text-xs font-bold block">Perangkat Rusak</span>
            <span className={`text-[9px] block mt-0.5 ${selectedReport === 'rusak' ? 'text-rose-100' : 'text-slate-400'}`}>Kondisi Abnormal</span>
          </div>
        </button>

        {/* Tahun */}
        <button
          onClick={() => { setSelectedReport('tahun'); setFilterRoom(''); setFilterYear(''); }}
          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 h-28 group ${
            selectedReport === 'tahun' 
              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
          }`}
        >
          <Calendar className={`w-6 h-6 ${selectedReport === 'tahun' ? 'text-white' : 'text-amber-500'}`} />
          <div>
            <span className="text-xs font-bold block">Kategori Tahun</span>
            <span className={`text-[9px] block mt-0.5 ${selectedReport === 'tahun' ? 'text-amber-100' : 'text-slate-400'}`}>Urut Periode Pengadaan</span>
          </div>
        </button>

        {/* Ruangan */}
        <button
          onClick={() => { setSelectedReport('ruangan'); setFilterRoom(''); setFilterYear(''); }}
          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 h-28 group ${
            selectedReport === 'ruangan' 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
          }`}
        >
          <MapPin className={`w-6 h-6 ${selectedReport === 'ruangan' ? 'text-white' : 'text-indigo-600'}`} />
          <div>
            <span className="text-xs font-bold block">Kategori Ruangan</span>
            <span className={`text-[9px] block mt-0.5 ${selectedReport === 'ruangan' ? 'text-indigo-100' : 'text-slate-400'}`}>Terbagi per Labor</span>
          </div>
        </button>

        {/* Perbaikan */}
        <button
          onClick={() => { setSelectedReport('perbaikan'); setFilterRoom(''); setFilterYear(''); }}
          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 h-28 group ${
            selectedReport === 'perbaikan' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
          }`}
        >
          <ClipboardList className={`w-6 h-6 ${selectedReport === 'perbaikan' ? 'text-white' : 'text-emerald-600'}`} />
          <div>
            <span className="text-xs font-bold block">Laporan Perbaikan</span>
            <span className={`text-[9px] block mt-0.5 ${selectedReport === 'perbaikan' ? 'text-emerald-100' : 'text-slate-400'}`}>Biaya & Log Maintenance</span>
          </div>
        </button>

      </div>

      {/* Selected Report Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        
        {/* Title details */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800">{reportTitles[selectedReport]}</h3>
            <p className="text-xs text-slate-400 font-medium">{reportDescriptions[selectedReport]}</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Ekspor CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Laporan
            </button>
          </div>
        </div>

        {/* Secondary parameters inside workspace */}
        <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
          <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Filter Parameter Laporan:</span>
          
          {/* Room Filter */}
          <div className="flex items-center gap-2">
            <span>Lokasi:</span>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold text-slate-800"
            >
              <option value="">Semua Lokasi / Labor</option>
              {rooms.map(r => (
                <option key={r.id} value={r.nama}>{r.nama}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <span>Tahun Pengadaan:</span>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold text-slate-800"
            >
              <option value="">Semua Tahun</option>
              {uniqueYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-slate-500 font-medium">
            Ditemukan: <strong className="text-slate-700">{reportData.length} records</strong>
          </div>
        </div>

        {/* Laporan Perbaikan Financial Summary box */}
        {selectedReport === 'perbaikan' && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
            <div>
              <span className="block text-emerald-700/80 uppercase font-bold tracking-wider text-[10px]">Total Investasi Perbaikan Selesai:</span>
              <p className="text-lg font-black text-emerald-700 font-mono mt-0.5">
                Rp {totalFinancialCost.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-right">
              <span className="block text-emerald-700/80 font-semibold">Total Tindakan Pemeliharaan:</span>
              <strong className="text-base font-bold text-slate-800">{reportData.length} Kegiatan</strong>
            </div>
          </div>
        )}

        {/* Live dynamic preview ledger */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            {selectedReport === 'perbaikan' ? (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="p-3 pl-4">No</th>
                    <th className="p-3">Perangkat</th>
                    <th className="p-3">Kode Inventaris</th>
                    <th className="p-3">Tanggal Kerusakan</th>
                    <th className="p-3">Keterangan Kerusakan</th>
                    <th className="p-3">Teknisi</th>
                    <th className="p-3">Tindakan Diambil</th>
                    <th className="p-3 text-right">Biaya Perbaikan</th>
                    <th className="p-3 text-center pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">Tidak ada riwayat perbaikan terdaftar.</td>
                    </tr>
                  ) : (
                    (reportData as any[]).map((item, idx) => {
                      const statusBadges = {
                        'Selesai': 'bg-emerald-50 text-emerald-700 border-emerald-150',
                        'Dalam Proses': 'bg-amber-50 text-amber-700 border-amber-150',
                        'Pending': 'bg-rose-50 text-rose-700 border-rose-150'
                      };
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 pl-4 font-bold text-slate-500 text-center">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{item.deviceName}</td>
                          <td className="p-3 font-mono font-medium text-slate-400">{item.kode}</td>
                          <td className="p-3 text-slate-600">{new Date(item.log.tanggalKerusakan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="p-3 text-slate-700 font-medium">{item.log.jenisKerusakan}</td>
                          <td className="p-3 text-slate-600">{item.log.teknisi}</td>
                          <td className="p-3 text-slate-600 italic">{item.log.tindakanPerbaikan || '-'}</td>
                          <td className="p-3 text-right font-semibold text-slate-800 font-mono">Rp {item.log.biayaPerbaikan.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center pr-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusBadges[item.log.statusPerbaikan]}`}>
                              {item.log.statusPerbaikan}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="p-3 pl-4 text-center">No</th>
                    <th className="p-3">Kode Inventaris</th>
                    <th className="p-3">Nama Perangkat</th>
                    <th className="p-3">Kategori Jenis</th>
                    <th className="p-3">Merek / Seri</th>
                    <th className="p-3 text-center">Tahun</th>
                    <th className="p-3">Sumber Dana</th>
                    <th className="p-3 text-center">Kondisi</th>
                    <th className="p-3 pr-4">Lokasi Ruang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">Tidak ada data perangkat yang sesuai kriteria laporan.</td>
                    </tr>
                  ) : (
                    (reportData as Device[]).map((device, idx) => {
                      const conditionBadges = {
                        'Baik': 'bg-emerald-50 text-emerald-700 border-emerald-150',
                        'Rusak Ringan': 'bg-amber-50 text-amber-700 border-amber-150',
                        'Rusak Berat': 'bg-rose-50 text-rose-700 border-rose-150'
                      };
                      return (
                        <tr key={device.id} className="hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => onSelectDevice(device)}>
                          <td className="p-3 pl-4 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-mono font-semibold text-slate-800">{device.kodeInventaris}</td>
                          <td className="p-3 font-bold text-slate-900">{device.namaPerangkat}</td>
                          <td className="p-3 font-medium text-slate-600">{device.jenisPerangkat}</td>
                          <td className="p-3 text-slate-600">{device.merk} ({device.tipeModel})</td>
                          <td className="p-3 text-center font-bold text-slate-700">{device.tahunPembuatan}</td>
                          <td className="p-3 text-slate-500 font-medium">{device.sumberDana}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${conditionBadges[device.kondisi]}`}>
                              {device.kondisi}
                            </span>
                          </td>
                          <td className="p-3 pr-4 font-semibold text-slate-600">{device.lokasiRuangan}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
