import React, { useState, useMemo } from 'react';
import { Device, RepairLog, RepairStatus, UserRole } from '../types';
import { 
  Wrench, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  Filter, 
  Sliders,
  Settings,
  Edit,
  Eye,
  RotateCcw
} from 'lucide-react';

interface PerbaikanViewProps {
  devices: Device[];
  currentUserRole: UserRole;
  onUpdateRepairStatus: (
    deviceId: string, 
    logId: string, 
    newStatus: RepairStatus, 
    actionTaken: string, 
    cost: number
  ) => void;
  onSelectDevice: (device: Device) => void;
}

export default function PerbaikanView({
  devices,
  currentUserRole,
  onUpdateRepairStatus,
  onSelectDevice
}: PerbaikanViewProps) {
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Selected log for inline editing
  const [editingLog, setEditingLog] = useState<{
    deviceId: string;
    log: RepairLog;
  } | null>(null);

  // Edit fields
  const [editActionTaken, setEditActionTaken] = useState('');
  const [editCost, setEditCost] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<RepairStatus>('Pending');

  // Compile all repair logs from all devices
  const allLogs = useMemo(() => {
    const list: { deviceId: string; deviceName: string; log: RepairLog }[] = [];
    devices.forEach(device => {
      device.logs.forEach(log => {
        list.push({
          deviceId: device.id,
          deviceName: device.namaPerangkat,
          log
        });
      });
    });
    // Sort by status priority (Pending first, then In Process, then Completed) or newest date
    return list.sort((a, b) => {
      if (a.log.statusPerbaikan !== b.log.statusPerbaikan) {
        const priority = { 'Pending': 1, 'Dalam Proses': 2, 'Selesai': 3 };
        return priority[a.log.statusPerbaikan] - priority[b.log.statusPerbaikan];
      }
      return b.log.tanggalKerusakan.localeCompare(a.log.tanggalKerusakan);
    });
  }, [devices]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter(item => {
      const matchesSearch = 
        item.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.log.jenisKerusakan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.log.teknisi.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === '' || item.log.statusPerbaikan === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [allLogs, searchQuery, filterStatus]);

  // Calculate total costs spent
  const totalRepairCost = useMemo(() => {
    return allLogs
      .filter(item => item.log.statusPerbaikan === 'Selesai')
      .reduce((sum, item) => sum + item.log.biayaPerbaikan, 0);
  }, [allLogs]);

  const activeRepairsCount = useMemo(() => {
    return allLogs.filter(item => item.log.statusPerbaikan !== 'Selesai').length;
  }, [allLogs]);

  // Handle saving the edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    onUpdateRepairStatus(
      editingLog.deviceId,
      editingLog.log.id,
      editStatus,
      editActionTaken,
      editCost
    );

    setEditingLog(null);
  };

  const handleStartEdit = (deviceId: string, log: RepairLog) => {
    setEditingLog({ deviceId, log });
    setEditActionTaken(log.tindakanPerbaikan);
    setEditCost(log.biayaPerbaikan);
    setEditStatus(log.statusPerbaikan);
  };

  const statusBadges = {
    'Selesai': 'bg-emerald-50 text-emerald-700 border-emerald-150',
    'Dalam Proses': 'bg-amber-50 text-amber-700 border-amber-150',
    'Pending': 'bg-rose-50 text-rose-700 border-rose-150'
  };

  const statusIcons = {
    'Selesai': <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />,
    'Dalam Proses': <Clock className="w-4 h-4 text-amber-600 shrink-0" />,
    'Pending': <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Title panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs md:col-span-1 flex flex-col justify-center">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600 animate-spin-slow" />
            Pemeliharaan & Perbaikan
          </h2>
          <p className="text-xs text-slate-400 mt-1">Monitoring dan penyelesaian kerusakan perangkat laboratorium komputer.</p>
        </div>

        {/* Statistic 1: Active repairs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Perbaikan Aktif</span>
            <span className="text-2xl font-black text-slate-800">{activeRepairsCount} Perangkat</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Sedang dalam antrean / perbaikan</span>
          </div>
        </div>

        {/* Statistic 2: Total Maintenance Cost spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Biaya Terealisasi</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              Rp {totalRepairCost.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Akumulasi biaya perbaikan selesai</span>
          </div>
        </div>

      </div>

      {/* Main layout divided if editing, or full width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Interactive Table (Takes 2 cols) */}
        <div className={`lg:col-span-${editingLog ? '2' : '3'} space-y-4`}>
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Cari perangkat, kerusakan, teknisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700 font-medium"
            >
              <option value="">Semua Status Proses</option>
              <option value="Pending">Pending (Baru Dilaporkan)</option>
              <option value="Dalam Proses">Dalam Proses</option>
              <option value="Selesai">Selesai (Diperbaiki)</option>
            </select>

            {(searchQuery || filterStatus) && (
              <button 
                onClick={() => { setSearchQuery(''); setFilterStatus(''); }}
                className="p-2.5 border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-4.5 h-4.5" />
              </button>
            )}

          </div>

          {/* List Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="p-4 pl-6">Perangkat</th>
                    <th className="p-4">Tanggal Kerusakan</th>
                    <th className="p-4">Jenis Kerusakan</th>
                    <th className="p-4">Teknisi</th>
                    <th className="p-4">Tindakan Diambil</th>
                    <th className="p-4 text-right">Biaya</th>
                    <th className="p-4 text-center">Status</th>
                    {currentUserRole !== 'Kepala Labor' && (
                      <th className="p-4 text-right pr-6">Kelola</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={currentUserRole !== 'Kepala Labor' ? 8 : 7} className="text-center py-12 text-slate-400 font-medium">
                        Tidak ada riwayat atau antrean perbaikan aktif sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(({ deviceId, deviceName, log }) => {
                      const associatedDevice = devices.find(d => d.id === deviceId);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* Perangkat */}
                          <td className="p-4 pl-6 font-bold text-slate-800">
                            <button 
                              onClick={() => associatedDevice && onSelectDevice(associatedDevice)}
                              className="hover:text-indigo-600 block text-left"
                            >
                              {deviceName}
                            </button>
                            <span className="text-[9px] text-slate-400 font-mono font-medium block">ID: {deviceId}</span>
                          </td>

                          {/* Tanggal */}
                          <td className="p-4 whitespace-nowrap text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(log.tanggalKerusakan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </td>

                          {/* Kerusakan */}
                          <td className="p-4 max-w-xs break-words font-medium text-slate-700">
                            {log.jenisKerusakan}
                          </td>

                          {/* Teknisi */}
                          <td className="p-4 text-slate-600 font-medium whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {log.teknisi}
                            </span>
                          </td>

                          {/* Tindakan */}
                          <td className="p-4 max-w-xs break-words text-slate-600 italic">
                            {log.tindakanPerbaikan || '-'}
                          </td>

                          {/* Biaya */}
                          <td className="p-4 text-right font-semibold font-mono text-slate-800">
                            {log.biayaPerbaikan > 0 ? `Rp ${log.biayaPerbaikan.toLocaleString('id-ID')}` : 'Rp 0'}
                          </td>

                          {/* Status */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusBadges[log.statusPerbaikan]}`}>
                              {statusIcons[log.statusPerbaikan]}
                              <span>{log.statusPerbaikan}</span>
                            </span>
                          </td>

                          {/* Action update */}
                          {currentUserRole !== 'Kepala Labor' && (
                            <td className="p-4 text-right pr-6">
                              <button
                                onClick={() => handleStartEdit(deviceId, log)}
                                className="p-1 px-2 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                              >
                                <Edit className="w-3 h-3" /> Update
                              </button>
                            </td>
                          )}

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Quick Action Status Modifier form (Takes 1 col, only displays if editing) */}
        {editingLog && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 h-fit space-y-4 animate-in slide-in-from-right-4 duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                Update Progres Perbaikan
              </h3>
              <button 
                onClick={() => setEditingLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                Batal
              </button>
            </div>

            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 space-y-1">
              <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">Target Perangkat:</span>
              <p className="text-xs font-extrabold text-slate-800">{editingLog.deviceName}</p>
              <p className="text-[10px] text-slate-500 mt-1 italic">"{editingLog.log.jenisKerusakan}"</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              {/* Select Status */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Status Penyelesaian</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(['Pending', 'Dalam Proses', 'Selesai'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`text-[10px] py-1.5 rounded-lg font-bold transition-all ${
                        editStatus === st 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-white/50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Taken */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tindakan Perbaikan Diambil <span className="text-rose-500">*</span></label>
                <textarea
                  rows={3}
                  value={editActionTaken}
                  onChange={(e) => setEditActionTaken(e.target.value)}
                  placeholder="Contoh: Mengganti thermal paste dan membersihkan debu heatsink processor..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-slate-800 font-medium"
                  required
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Biaya Perbaikan (Rp)</label>
                <input 
                  type="number"
                  min="0"
                  value={editCost}
                  onChange={(e) => setEditCost(parseInt(e.target.value) || 0)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:border-indigo-500 bg-slate-50/50 font-mono text-slate-800 font-semibold"
                />
              </div>

              {editStatus === 'Selesai' && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-150 text-[10px] font-medium leading-normal">
                  💡 <strong>Sinkronisasi Otomatis:</strong> Menyelesaikan perbaikan ini otomatis mengubah kondisi perangkat terkait kembali menjadi <strong>"Baik"</strong>.
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="flex-1 py-2 text-slate-600 bg-slate-100 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white bg-indigo-600 font-extrabold rounded-xl hover:bg-indigo-700 shadow-md transition-colors"
                >
                  Simpan Progres
                </button>
              </div>

            </form>

          </div>
        )}

      </div>

    </div>
  );
}
