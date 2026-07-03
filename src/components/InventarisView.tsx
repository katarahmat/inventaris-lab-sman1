import React, { useState, useMemo } from 'react';
import { Device, DeviceType, DeviceCondition, UserRole } from '../types';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Filter, 
  Sliders, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Printer, 
  FileSpreadsheet, 
  FileDown, 
  ChevronLeft, 
  ChevronRight, 
  X,
  RotateCcw,
  Tag,
  Laptop,
  Monitor,
  Tv,
  Network,
  Upload,
  Download,
  AlertTriangle
} from 'lucide-react';

interface InventarisViewProps {
  devices: Device[];
  currentUserRole: UserRole;
  onSelectDevice: (device: Device) => void;
  onEditDevice: (device: Device) => void;
  onDeleteDevice: (deviceId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onImportDevices: (newDevices: Device[]) => void;
}

export default function InventarisView({
  devices,
  currentUserRole,
  onSelectDevice,
  onEditDevice,
  onDeleteDevice,
  onNavigateToTab,
  onImportDevices
}: InventarisViewProps) {
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMerk, setFilterMerk] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Print overlay simulation state
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Import Excel states
  const [importedDevices, setImportedDevices] = useState<Device[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState<string | null>(null);

  // Dynamic Template Downloader
  const handleDownloadTemplate = () => {
    const headers = [
      'Kode Inventaris',
      'Nama Perangkat',
      'Jenis Perangkat',
      'Merk',
      'Tipe Model',
      'Nomor Seri',
      'Processor',
      'RAM',
      'Jenis Penyimpanan',
      'Kapasitas Penyimpanan',
      'Tahun Pembuatan',
      'Lokasi Ruangan',
      'Kondisi',
      'Sumber Dana',
      'Tanggal Pembelian',
      'Catatan'
    ];
    
    const sampleData = [
      {
        'Kode Inventaris': 'INV-LAP-2026-001',
        'Nama Perangkat': 'Laptop Acer Aspire 5',
        'Jenis Perangkat': 'Laptop',
        'Merk': 'Acer',
        'Tipe Model': 'A514-54G',
        'Nomor Seri': 'NXA17SN0028192A',
        'Processor': 'Intel Core i5-1135G7',
        'RAM': '8 GB DDR4',
        'Jenis Penyimpanan': 'SSD',
        'Kapasitas Penyimpanan': '512 GB',
        'Tahun Pembuatan': 2024,
        'Lokasi Ruangan': 'Laboratorium Utama',
        'Kondisi': 'Baik',
        'Sumber Dana': 'BOS Reguler 2024',
        'Tanggal Pembelian': '2024-03-15',
        'Catatan': 'Pengadaan barang baru dari dana hibah.'
      },
      {
        'Kode Inventaris': 'INV-PC-2026-015',
        'Nama Perangkat': 'PC Workstation ASUS ExpertCenter',
        'Jenis Perangkat': 'Komputer Desktop',
        'Merk': 'ASUS',
        'Tipe Model': 'D700MC',
        'Nomor Seri': 'M9N0CX01A51239F',
        'Processor': 'Intel Core i7-11700',
        'RAM': '16 GB DDR4',
        'Jenis Penyimpanan': 'SSD',
        'Kapasitas Penyimpanan': '1 TB',
        'Tahun Pembuatan': 2025,
        'Lokasi Ruangan': 'Laboratorium Utama',
        'Kondisi': 'Baik',
        'Sumber Dana': 'BOS Reguler 2025',
        'Tanggal Pembelian': '2025-01-20',
        'Catatan': 'PC khusus untuk editing grafis.'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Inventaris');
    XLSX.writeFile(wb, 'Template_Import_Inventaris_Labor.xlsx');
  };

  // Helper to map dynamic column names from spreadsheet
  const mapRowToDevice = (row: any, index: number): Device => {
    const findValue = (keys: string[]): any => {
      for (const k of Object.keys(row)) {
        const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
        if (keys.some(key => key.toLowerCase().replace(/[\s_-]/g, '') === cleanK)) {
          return row[k];
        }
      }
      return undefined;
    };

    const namaPerangkat = findValue(['nama', 'namaperangkat', 'perangkat', 'device', 'devicename']) || `Perangkat Baru ${index + 1}`;
    const kodeInventaris = findValue(['kode', 'kodeinventaris', 'kode_inventaris', 'barcode', 'code']) || `INV-IMP-${Date.now().toString().slice(-6)}-${index + 1}`;
    
    // Normalize jenisPerangkat
    let jenisPerangkat: DeviceType = 'Laptop';
    const rawJenis = findValue(['jenis', 'jenisperangkat', 'jenis_perangkat', 'kategori', 'category', 'type']);
    if (rawJenis) {
      const lower = rawJenis.toString().toLowerCase();
      if (lower.includes('laptop') || lower.includes('notebook')) {
        jenisPerangkat = 'Laptop';
      } else if (lower.includes('desktop') || lower.includes('komputer') || lower.includes('pc') || lower.includes('workstation')) {
        jenisPerangkat = 'Komputer Desktop';
      } else if (lower.includes('flat panel') || lower.includes('ifp') || lower.includes('smartboard') || lower.includes('tv') || lower.includes('interactive')) {
        jenisPerangkat = 'Interactive Flat Panel (IFP)';
      } else if (lower.includes('jaringan') || lower.includes('network') || lower.includes('router') || lower.includes('switch') || lower.includes('wifi') || lower.includes('access point')) {
        jenisPerangkat = 'Perangkat Jaringan';
      }
    }

    const merk = findValue(['merk', 'merek', 'brand', 'manufacturer']) || 'OEM';
    const tipeModel = findValue(['tipe', 'model', 'tipemodel', 'tipe_model', 'series']) || 'Standard';
    const nomorSeri = findValue(['nomorseri', 'no_seri', 'sn', 'serial', 'serialnumber']) || `SN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const processor = findValue(['processor', 'prosesor', 'cpu']) || 'Intel Core i5';
    const ram = findValue(['ram', 'memori', 'memory']) || '8 GB';
    const jenisPenyimpanan = findValue(['jenispenyimpanan', 'jenis_penyimpanan', 'storage_type', 'penyimpanan']) || 'SSD';
    const kapasitasPenyimpanan = findValue(['kapasitas', 'kapasitaspenyimpanan', 'kapasitas_penyimpanan', 'storage_size']) || '256 GB';
    
    let tahunPembuatan = new Date().getFullYear();
    const rawTahun = findValue(['tahun', 'tahunpembuatan', 'tahun_pembuatan', 'year']);
    if (rawTahun) {
      const num = parseInt(rawTahun, 10);
      if (!isNaN(num)) tahunPembuatan = num;
    }

    const lokasiRuangan = findValue(['lokasi', 'ruangan', 'lokasiruangan', 'lokasi_ruangan', 'room']) || 'Laboratorium Utama';
    
    let kondisi: DeviceCondition = 'Baik';
    const rawKondisi = findValue(['kondisi', 'status', 'condition']);
    if (rawKondisi) {
      const lower = rawKondisi.toString().toLowerCase();
      if (lower.includes('baik') || lower.includes('ok') || lower.includes('normal')) {
        kondisi = 'Baik';
      } else if (lower.includes('ringan') || lower.includes('light') || lower.includes('minor')) {
        kondisi = 'Rusak Ringan';
      } else if (lower.includes('berat') || lower.includes('major') || lower.includes('broken')) {
        kondisi = 'Rusak Berat';
      }
    }

    const keteranganKerusakan = findValue(['keterangankerusakan', 'kerusakan', 'defect_description']);
    const tanggalPembelian = findValue(['tanggalpembelian', 'tanggal_pembelian', 'tanggal', 'date', 'purchased_date']) || new Date().toISOString().split('T')[0];
    const sumberDana = findValue(['sumberdana', 'sumber_dana', 'dana', 'source', 'funding']) || 'BOS';
    const fotoPerangkat = findValue(['foto', 'gambar', 'image', 'photo', 'fotoperangkat']) || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&auto=format&fit=crop&q=60';
    const catatanTambahan = findValue(['catatan', 'keterangan', 'notes', 'comment']);

    return {
      id: `DEV_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`,
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
      keteranganKerusakan,
      tanggalPembelian,
      sumberDana,
      fotoPerangkat,
      catatanTambahan,
      logs: []
    };
  };

  // Parser of the Excel File
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) throw new Error("Gagal membaca file");

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          throw new Error("File Excel kosong atau tidak memiliki baris data.");
        }

        const parsed = jsonData.map((row, index) => mapRowToDevice(row, index));
        setImportedDevices(parsed);
      } catch (err: any) {
        setImportError(err.message || "Gagal mengimpor file Excel. Pastikan format file benar.");
        setImportedDevices(null);
      }
    };

    reader.onerror = () => {
      setImportError("Gagal membaca file.");
    };

    reader.readAsBinaryString(file);
    
    // Clear input so same file can be chosen again
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (importedDevices && importedDevices.length > 0) {
      onImportDevices(importedDevices);
      setImportedDevices(null);
      setImportFileName(null);
    }
  };

  // Extract unique filter options dynamically from devices list
  const uniqueMerks = useMemo(() => {
    const brands = devices.map(d => d.merk).filter(Boolean);
    return Array.from(new Set(brands)).sort();
  }, [devices]);

  const uniqueTahuns = useMemo(() => {
    const years = devices.map(d => d.tahunPembuatan);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [devices]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterMerk('');
    setFilterKondisi('');
    setFilterTahun('');
    setFilterJenis('');
    setCurrentPage(1);
  };

  // Filtered devices list
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = 
        device.namaPerangkat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.kodeInventaris.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.nomorSeri.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.tipeModel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMerk = filterMerk === '' || device.merk === filterMerk;
      const matchesKondisi = filterKondisi === '' || device.kondisi === filterKondisi;
      const matchesTahun = filterTahun === '' || device.tahunPembuatan.toString() === filterTahun;
      const matchesJenis = filterJenis === '' || device.jenisPerangkat === filterJenis;

      return matchesSearch && matchesMerk && matchesKondisi && matchesTahun && matchesJenis;
    });
  }, [devices, searchQuery, filterMerk, filterKondisi, filterTahun, filterJenis]);

  // Paginated devices list
  const totalPages = Math.max(Math.ceil(filteredDevices.length / itemsPerPage), 1);
  
  const paginatedDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDevices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDevices, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Simulation handlers for Export
  const handleExportExcel = () => {
    // Creating realistic CSV content and triggering download
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Kode Inventaris,Nama Perangkat,Jenis,Merk,Tipe,No Seri,Kondisi,Ruangan,Tahun\n";
    
    filteredDevices.forEach((d, idx) => {
      csvContent += `${idx + 1},"${d.kodeInventaris}","${d.namaPerangkat}","${d.jenisPerangkat}","${d.merk}","${d.tipeModel}","${d.nomorSeri}","${d.kondisi}","${d.lokasiRuangan}",${d.tahunPembuatan}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventaris_Labor_Informatika_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    // Generate styled mock receipt / text and trigger download
    let docText = "========================================================================\n";
    docText += "       SISTEM INVENTARIS LABORATORIUM INFORMATIKA SMAN 1 TELUK KUANTAN\n";
    docText += "                     LAPORAN DATA INVENTARIS PERANGKAT\n";
    docText += `                     Dicetak Pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    docText += "========================================================================\n\n";
    docText += "DAFTAR INVENTARIS AKTIF:\n\n";

    filteredDevices.forEach((d, idx) => {
      docText += `${idx + 1}. [${d.kodeInventaris}] ${d.namaPerangkat}\n`;
      docText += `   Tipe: ${d.jenisPerangkat} | Merek: ${d.merk} (${d.tipeModel}) | S/N: ${d.nomorSeri}\n`;
      docText += `   Kondisi: ${d.kondisi} | Ruang: ${d.lokasiRuangan} | Pengadaan: ${d.tahunPembuatan} (Dana: ${d.sumberDana})\n`;
      if (d.keteranganKerusakan) docText += `   Kerusakan: ${d.keteranganKerusakan}\n`;
      docText += "   ---------------------------------------------------------------------\n";
    });

    docText += `\nTotal Terfilter: ${filteredDevices.length} Unit Perangkat.\n`;
    docText += "Penanggung Jawab: Rahmat Apriono, S.Kom.\n";

    const element = document.createElement("a");
    const file = new Blob([docText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Laporan_Inventaris_Labor_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'Laptop': return <Laptop className="w-4 h-4 text-sky-600" />;
      case 'Komputer Desktop': return <Monitor className="w-4 h-4 text-indigo-600" />;
      case 'Interactive Flat Panel (IFP)': return <Tv className="w-4 h-4 text-amber-600" />;
      case 'Perangkat Jaringan': return <Network className="w-4 h-4 text-emerald-600" />;
      default: return <Tag className="w-4 h-4 text-slate-500" />;
    }
  };

  const conditionBadges = {
    'Baik': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Rusak Ringan': 'bg-amber-50 text-amber-700 border-amber-200',
    'Rusak Berat': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-800">Daftar Inventaris Aktif</h2>
          <p className="text-xs text-slate-400">Total terfilter: <span className="font-bold text-slate-600">{filteredDevices.length} unit</span> dari {devices.length} perangkat</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentUserRole !== 'Kepala Labor' && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-tambah-inventaris-quick"
                onClick={() => onNavigateToTab('form')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Perangkat
              </button>

              <button
                id="btn-trigger-import-excel"
                onClick={() => document.getElementById('excel-import-input')?.click()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                title="Impor Data Perangkat dari File Excel (.xlsx, .xls)"
              >
                <Upload className="w-4 h-4" /> Import Excel
              </button>

              <button
                id="btn-download-template"
                onClick={handleDownloadTemplate}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                title="Unduh Template Format Excel"
              >
                <Download className="w-3.5 h-3.5" /> Template Excel
              </button>

              <input 
                type="file" 
                id="excel-import-input" 
                accept=".xlsx,.xls" 
                onChange={handleFileImport} 
                className="hidden" 
              />
            </div>
          )}

          <div className="flex gap-1.5 shrink-0">
            <button 
              id="btn-export-excel"
              onClick={handleExportExcel}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
              title="Ekspor ke Excel (CSV)"
            >
              <FileSpreadsheet className="w-4.5 h-4.5" />
            </button>
            <button 
              id="btn-export-pdf"
              onClick={handleExportPDF}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
              title="Ekspor ke PDF (Laporan Teks)"
            >
              <FileDown className="w-4.5 h-4.5" />
            </button>
            <button 
              id="btn-print-inventaris"
              onClick={() => setIsPrintPreview(true)}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
              title="Cetak Laporan Inventaris"
            >
              <Printer className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Block */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter & Pencarian Data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Quick Search */}
          <div className="relative lg:col-span-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Cari nama, NS, kode..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Filter Jenis */}
          <select
            value={filterJenis}
            onChange={(e) => {
              setFilterJenis(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700 font-medium"
          >
            <option value="">Semua Jenis Perangkat</option>
            <option value="Laptop">Laptop</option>
            <option value="Komputer Desktop">Komputer Desktop</option>
            <option value="Interactive Flat Panel (IFP)">Interactive Flat Panel</option>
            <option value="Perangkat Jaringan">Perangkat Jaringan</option>
          </select>

          {/* Filter Kondisi */}
          <select
            value={filterKondisi}
            onChange={(e) => {
              setFilterKondisi(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700 font-medium"
          >
            <option value="">Semua Kondisi</option>
            <option value="Baik">Kondisi: Baik</option>
            <option value="Rusak Ringan">Kondisi: Rusak Ringan</option>
            <option value="Rusak Berat">Kondisi: Rusak Berat</option>
          </select>

          {/* Filter Merk */}
          <select
            value={filterMerk}
            onChange={(e) => {
              setFilterMerk(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700 font-medium"
          >
            <option value="">Semua Merek</option>
            {uniqueMerks.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Filter Tahun */}
          <select
            value={filterTahun}
            onChange={(e) => {
              setFilterTahun(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700 font-medium"
          >
            <option value="">Semua Tahun Pembuatan</option>
            {uniqueTahuns.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

        </div>

        {/* Clear filter shortcut */}
        {(searchQuery || filterMerk || filterKondisi || filterTahun || filterJenis) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Atur Ulang Filter
            </button>
          </div>
        )}
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="p-4 pl-6">Kode & Nama Perangkat</th>
                <th className="p-4">Kategori Tipe</th>
                <th className="p-4">Merek / Seri</th>
                <th className="p-4">Lokasi Ruang</th>
                <th className="p-4">Tahun</th>
                <th className="p-4 text-center">Kondisi</th>
                <th className="p-4 text-right pr-6">Aksi Operasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 font-medium">
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-slate-500">Tidak ada data perangkat ditemukan</p>
                      <p className="text-xs text-slate-400">Cobalah menyesuaikan kata kunci pencarian atau matikan filter aktif.</p>
                      <button 
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg"
                      >
                        Atur Ulang
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-slate-50/50 transition-all group">
                    
                    {/* Kode & Nama */}
                    <td className="p-4 pl-6 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative hidden sm:block">
                          <img 
                            src={device.fotoPerangkat} 
                            alt={device.namaPerangkat}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&auto=format&fit=crop&q=60";
                            }}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="overflow-hidden">
                          <button 
                            onClick={() => onSelectDevice(device)}
                            className="font-bold text-slate-800 hover:text-blue-600 transition-colors block text-left truncate max-w-[180px] sm:max-w-xs"
                          >
                            {device.namaPerangkat}
                          </button>
                          <span className="block text-[10px] text-slate-400 font-mono tracking-tight font-medium mt-0.5">
                            {device.kodeInventaris}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                        {getDeviceIcon(device.jenisPerangkat)}
                        <span>{device.jenisPerangkat}</span>
                      </span>
                    </td>

                    {/* Merek & Seri */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{device.merk}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]" title={device.tipeModel}>{device.tipeModel}</div>
                    </td>

                    {/* Lokasi */}
                    <td className="p-4 font-semibold text-slate-600 whitespace-nowrap">
                      {device.lokasiRuangan}
                    </td>

                    {/* Tahun */}
                    <td className="p-4 font-bold text-slate-700">
                      {device.tahunPembuatan}
                    </td>

                    {/* Kondisi */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${conditionBadges[device.kondisi]}`}>
                        {device.kondisi}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="p-4 text-right pr-6 whitespace-nowrap">
                      <div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelectDevice(device)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-100"
                          title="Lihat Detail Lengkap"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {currentUserRole !== 'Kepala Labor' && (
                          <button
                            onClick={() => onEditDevice(device)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-100"
                            title="Edit Data"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {currentUserRole === 'Administrator' && (
                          <button
                            onClick={() => onDeleteDevice(device.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-100"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination bar */}
        {filteredDevices.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-250 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</strong> hingga{' '}
              <strong className="text-slate-700">
                {Math.min(currentPage * itemsPerPage, filteredDevices.length)}
              </strong>{' '}
              dari <strong className="text-slate-700">{filteredDevices.length}</strong> entri terfilter
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white' 
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styled Printable Overlay (Print Preview Simulation) */}
      {isPrintPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 overflow-y-auto p-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white max-w-5xl w-full rounded-2xl shadow-2xl p-8 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-150">
            
            {/* Action Bar inside Preview */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6 shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-800">Pratinjau Cetak Laporan</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Cetak Sekarang
                </button>
                <button 
                  onClick={() => setIsPrintPreview(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>

            {/* Printable Content area */}
            <div className="flex-1 overflow-y-auto p-4 border border-slate-100 rounded-xl bg-slate-50/50 print:bg-white print:border-none font-sans" id="printable-report-area">
              
              {/* Header KOP SURAT */}
              <div className="text-center space-y-1.5 border-b-2 border-double border-slate-800 pb-4 mb-6">
                <h1 className="text-lg font-black text-slate-900 uppercase">PEMERINTAH PROVINSI RIAU</h1>
                <h2 className="text-md font-bold text-slate-900 uppercase leading-none">DINAS PENDIDIKAN</h2>
                <h3 className="text-xl font-extrabold text-slate-900 leading-none">SMAN 1 TELUK KUANTAN</h3>
                <p className="text-[10px] text-slate-500 italic">Jalan Sipado No.1 Teluk Kuantan, Kuantan Singingi, Riau - Kode Pos: 29562</p>
                <p className="text-[10px] text-slate-400 font-medium">Email: sman1telukkuantan@gmail.sch.id | Website: sman1telukkuantan.sch.id</p>
              </div>

              {/* Laporan Title */}
              <div className="text-center mb-6 space-y-1">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">LAPORAN REKAPITULASI INVENTARIS LABORATORIUM KOMPUTER</h4>
                <p className="text-xs text-slate-500 font-medium">Periode Pengamatan: Semester Genap Tahun Ajaran 2025/2026</p>
                <p className="text-[10px] text-slate-400">Dicetak Pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Statistics Overview */}
              <div className="grid grid-cols-4 gap-4 p-4 border border-slate-300 rounded-xl bg-white mb-6 text-xs">
                <div>
                  <span className="block text-slate-500 font-medium">Total Perangkat:</span>
                  <strong className="text-lg text-slate-800 font-black">{filteredDevices.length} Unit</strong>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Kondisi Baik:</span>
                  <strong className="text-lg text-emerald-600 font-black">{filteredDevices.filter(d => d.kondisi === 'Baik').length} Unit</strong>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Rusak Ringan:</span>
                  <strong className="text-lg text-amber-600 font-black">{filteredDevices.filter(d => d.kondisi === 'Rusak Ringan').length} Unit</strong>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Rusak Berat:</span>
                  <strong className="text-lg text-rose-600 font-black">{filteredDevices.filter(d => d.kondisi === 'Rusak Berat').length} Unit</strong>
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full text-left border-collapse text-[10px] border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-slate-800 font-bold uppercase">
                    <th className="p-2 border-r border-slate-400 text-center w-8">No</th>
                    <th className="p-2 border-r border-slate-400">Kode Inventaris</th>
                    <th className="p-2 border-r border-slate-400">Nama Perangkat</th>
                    <th className="p-2 border-r border-slate-400">Jenis</th>
                    <th className="p-2 border-r border-slate-400">Merek / Seri</th>
                    <th className="p-2 border-r border-slate-400">Tahun</th>
                    <th className="p-2 border-r border-slate-400">Kondisi</th>
                    <th className="p-2">Lokasi Ruang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {filteredDevices.map((device, idx) => (
                    <tr key={device.id} className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-400 text-center font-bold text-slate-700">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-400 font-mono text-slate-800">{device.kodeInventaris}</td>
                      <td className="p-2 border-r border-slate-400 font-bold text-slate-900">{device.namaPerangkat}</td>
                      <td className="p-2 border-r border-slate-400 font-medium">{device.jenisPerangkat}</td>
                      <td className="p-2 border-r border-slate-400 text-slate-600">{device.merk} ({device.tipeModel})</td>
                      <td className="p-2 border-r border-slate-400 font-semibold text-center text-slate-700">{device.tahunPembuatan}</td>
                      <td className="p-2 border-r border-slate-400 font-bold text-center text-slate-800">{device.kondisi}</td>
                      <td className="p-2 font-semibold text-slate-700">{device.lokasiRuangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="mt-12 grid grid-cols-2 text-xs pt-4">
                <div className="space-y-16">
                  <div>
                    <p className="font-medium text-slate-500">Mengetahui,</p>
                    <p className="font-bold text-slate-800">Kepala Laboratorium Informatika</p>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 underline">Bapak Siswo, S.Kom.</p>
                    <p className="text-[10px] text-slate-400 font-medium">NIP. 19780512 200501 1 004</p>
                  </div>
                </div>

                <div className="space-y-16 text-right">
                  <div>
                    <p className="font-medium text-slate-500">Teluk Kuantan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold text-slate-800">Tenaga Teknisi / Administrator</p>
                  </div>
                  <div>
                    <p className="font-black text-slate-900 underline">Rahmat Apriono, S.Kom.</p>
                    <p className="text-[10px] text-slate-400 font-medium">NIP / NUPTK. -</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Excel Import Preview Modal overlay */}
      {importedDevices && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 overflow-y-auto p-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white max-w-6xl w-full rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-150 text-emerald-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base leading-tight">Pratinjau Impor Data Excel</h3>
                  <p className="text-[10px] text-slate-400">File: <span className="font-bold text-slate-600">{importFileName}</span> | Terdeteksi <span className="font-bold text-emerald-600">{importedDevices.length} perangkat</span></p>
                </div>
              </div>
              <button 
                onClick={() => { setImportedDevices(null); setImportFileName(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert info */}
            <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs flex items-start gap-2.5 mb-4 leading-relaxed font-medium">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                Silakan tinjau hasil pemetaan kolom dari berkas Excel Anda di bawah ini sebelum disimpan ke dalam sistem. 
                <span className="block text-[10px] text-amber-700/80 font-bold mt-0.5">Note: Kolom yang kosong akan diisi dengan data default sistem secara otomatis.</span>
              </div>
            </div>

            {/* Scrollable Preview Table */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-xl bg-slate-50/50 mb-6">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-250 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10">
                    <th className="p-3 pl-4">No</th>
                    <th className="p-3">Kode Inventaris</th>
                    <th className="p-3">Nama Perangkat</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Merek / Seri</th>
                    <th className="p-3">Lokasi</th>
                    <th className="p-3">Kondisi</th>
                    <th className="p-3">Pengadaan</th>
                    <th className="p-3">Sumber Dana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 bg-white">
                  {importedDevices.map((device, idx) => (
                    <tr key={device.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 pl-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-700 font-medium">{device.kodeInventaris}</td>
                      <td className="p-3 font-bold text-slate-800">{device.namaPerangkat}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md text-slate-600 font-semibold text-[10px]">
                          {getDeviceIcon(device.jenisPerangkat)}
                          <span>{device.jenisPerangkat}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-700">{device.merk}</span>
                        <span className="text-slate-400 font-medium block text-[9px]">{device.tipeModel}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600">{device.lokasiRuangan}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold ${conditionBadges[device.kondisi]}`}>
                          {device.kondisi}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-600">{device.tahunPembuatan}</td>
                      <td className="p-3 font-semibold text-slate-500">{device.sumberDana}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 shrink-0">
              <button 
                onClick={() => { setImportedDevices(null); setImportFileName(null); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmImport}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Simpan {importedDevices.length} Perangkat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Excel Import Error Alert overlay */}
      {importError && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 border border-rose-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Gagal Mengimpor Excel</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-5">{importError}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setImportError(null)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
