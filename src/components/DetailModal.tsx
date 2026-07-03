import React, { useState } from 'react';
import { Device, RepairLog, UserRole } from '../types';
import { X, Wrench, Calendar, DollarSign, Tag, Cpu, Shield, Clock, Plus, PenTool } from 'lucide-react';

interface DetailModalProps {
  device: Device;
  onClose: () => void;
  currentUserRole: UserRole;
  onAddRepairLog: (deviceId: string, log: Omit<RepairLog, 'id' | 'deviceId' | 'deviceName'>) => void;
}

export default function DetailModal({ device, onClose, currentUserRole, onAddRepairLog }: DetailModalProps) {
  const [showAddLog, setShowAddLog] = useState(false);
  const [tanggalKerusakan, setTanggalKerusakan] = useState(new Date().toISOString().split('T')[0]);
  const [jenisKerusakan, setJenisKerusakan] = useState('');
  const [teknisi, setTeknisi] = useState('');
  const [tindakanPerbaikan, setTindakanPerbaikan] = useState('');
  const [statusPerbaikan, setStatusPerbaikan] = useState<'Pending' | 'Dalam Proses' | 'Selesai'>('Pending');
  const [biayaPerbaikan, setBiayaPerbaikan] = useState<number>(0);

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jenisKerusakan || !teknisi) {
      alert('Harap isi jenis kerusakan dan nama teknisi');
      return;
    }
    onAddRepairLog(device.id, {
      tanggalKerusakan,
      jenisKerusakan,
      teknisi,
      tindakanPerbaikan: tindakanPerbaikan || 'Menunggu tindakan',
      statusPerbaikan,
      biayaPerbaikan,
      tanggalPerbaikan: statusPerbaikan === 'Selesai' ? new Date().toISOString().split('T')[0] : undefined
    });
    // Reset form
    setJenisKerusakan('');
    setTeknisi('');
    setTindakanPerbaikan('');
    setStatusPerbaikan('Pending');
    setBiayaPerbaikan(0);
    setShowAddLog(false);
  };

  const conditionColors = {
    'Baik': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Rusak Ringan': 'bg-amber-50 text-amber-700 border-amber-200',
    'Rusak Berat': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="detail-modal-container"
        className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
          <div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-mono font-medium">
              {device.kodeInventaris}
            </span>
            <h3 className="text-xl font-bold mt-1">{device.namaPerangkat}</h3>
          </div>
          <button 
            id="close-detail-btn"
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/25 transition-colors focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Foto & Info Cepat */}
            <div className="md:col-span-2 space-y-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs relative">
                <img 
                  src={device.fotoPerangkat} 
                  alt={device.namaPerangkat}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=60";
                  }}
                  referrerPolicy="no-referrer"
                />
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${conditionColors[device.kondisi]}`}>
                  {device.kondisi}
                </span>
              </div>

              {/* Status Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
                <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-2">Status Ringkas</h4>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div className="text-slate-500">Lokasi / Ruang:</div>
                  <div className="text-slate-800 font-semibold text-right">{device.lokasiRuangan}</div>
                  
                  <div className="text-slate-500">Tahun Pembuatan:</div>
                  <div className="text-slate-800 font-medium text-right">{device.tahunPembuatan}</div>
                  
                  <div className="text-slate-500">Sumber Dana:</div>
                  <div className="text-slate-800 font-medium text-right">{device.sumberDana}</div>

                  <div className="text-slate-500">Merek / Seri:</div>
                  <div className="text-slate-800 font-medium text-right truncate" title={`${device.merk} / ${device.tipeModel}`}>{device.merk}</div>
                </div>
              </div>
            </div>

            {/* Spesifikasi Lengkap */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                Spesifikasi Teknis
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                <div className="space-y-1">
                  <span className="text-xs text-blue-700/80 uppercase font-semibold tracking-wider">Merek Perangkat</span>
                  <p className="text-sm font-semibold text-slate-800">{device.merk}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-blue-700/80 uppercase font-semibold tracking-wider">Tipe / Model</span>
                  <p className="text-sm font-semibold text-slate-800">{device.tipeModel || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-blue-700/80 uppercase font-semibold tracking-wider">Nomor Seri</span>
                  <p className="text-sm font-mono font-medium text-slate-700">{device.nomorSeri || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-blue-700/80 uppercase font-semibold tracking-wider">Processor / Chipset</span>
                  <p className="text-sm font-semibold text-slate-800">{device.processor || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-blue-700/80 uppercase font-semibold tracking-wider">Kapasitas RAM</span>
                  <p className="text-sm font-semibold text-slate-800">{device.ram || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-blue-700/80 uppercase font-semibold tracking-wider">Penyimpanan</span>
                  <p className="text-sm font-semibold text-slate-800">
                    {device.jenisPenyimpanan !== 'None' ? `${device.jenisPenyimpanan} ${device.kapasitasPenyimpanan}` : 'Tidak Ada'}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2 border-t border-blue-100/50 pt-2 mt-1">
                  <span className="text-xs text-blue-700/80 uppercase font-semibold tracking-wider">Tanggal Pembelian</span>
                  <p className="text-sm font-medium text-slate-800">
                    {device.tanggalPembelian ? new Date(device.tanggalPembelian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>

              {device.keteranganKerusakan && (
                <div className="p-4 bg-rose-50 border border-rose-150 rounded-xl">
                  <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">Keterangan Kerusakan Aktif:</h5>
                  <p className="text-sm text-slate-700 font-medium">{device.keteranganKerusakan}</p>
                </div>
              )}

              {device.catatanTambahan && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Tambahan:</h5>
                  <p className="text-xs text-slate-600 italic">{device.catatanTambahan}</p>
                </div>
              )}
            </div>

          </div>

          {/* Riwayat Perbaikan */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                Riwayat Perbaikan & Pemeliharaan ({device.logs.length})
              </h4>
              
              {currentUserRole !== 'Kepala Labor' && !showAddLog && (
                <button 
                  id="btn-add-repair-log"
                  onClick={() => setShowAddLog(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Perbaikan Baru
                </button>
              )}
            </div>

            {/* Add Repair Log Form (Collapsible) */}
            {showAddLog && (
              <form 
                onSubmit={handleSubmitLog}
                className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 animate-in slide-in-from-top-4 duration-200"
              >
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h5 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-blue-600" />
                    Input Form Riwayat Perbaikan
                  </h5>
                  <button 
                    type="button" 
                    onClick={() => setShowAddLog(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Kerusakan</label>
                    <input 
                      type="date" 
                      value={tanggalKerusakan} 
                      onChange={(e) => setTanggalKerusakan(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teknisi Penanggung Jawab</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Hendra Saputra"
                      value={teknisi} 
                      onChange={(e) => setTeknisi(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Biaya Perbaikan (Rp)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={biayaPerbaikan} 
                      onChange={(e) => setBiayaPerbaikan(parseInt(e.target.value) || 0)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Kerusakan / Kendala</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Port USB tidak mendeteksi flashdisk"
                    value={jenisKerusakan} 
                    onChange={(e) => setJenisKerusakan(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tindakan Perbaikan / Rencana Tindakan</label>
                  <textarea 
                    rows={2}
                    placeholder="Tuliskan tindakan yang telah atau akan diambil..."
                    value={tindakanPerbaikan} 
                    onChange={(e) => setTindakanPerbaikan(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-700">Status Perbaikan:</span>
                    <div className="flex gap-2">
                      {(['Pending', 'Dalam Proses', 'Selesai'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStatusPerbaikan(status)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            statusPerbaikan === status 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition-all"
                  >
                    Simpan Riwayat
                  </button>
                </div>
              </form>
            )}

            {/* Riwayat Table */}
            {device.logs.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-250 text-slate-400 text-sm">
                Tidak ada riwayat perbaikan terdaftar untuk perangkat ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Kerusakan</th>
                      <th className="p-3">Teknisi</th>
                      <th className="p-3">Tindakan</th>
                      <th className="p-3 text-right">Biaya</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {device.logs.map((log) => {
                      const statusBadges = {
                        'Selesai': 'bg-emerald-50 text-emerald-700 border-emerald-150',
                        'Dalam Proses': 'bg-amber-50 text-amber-700 border-amber-150',
                        'Pending': 'bg-rose-50 text-rose-700 border-rose-150'
                      };
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 whitespace-nowrap font-medium text-slate-600 flex flex-col">
                            <span>{new Date(log.tanggalKerusakan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {log.tanggalPerbaikan && (
                              <span className="text-[10px] text-slate-400 font-normal">Selesai: {new Date(log.tanggalPerbaikan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            )}
                          </td>
                          <td className="p-3 font-medium text-slate-800 max-w-xs break-words">{log.jenisKerusakan}</td>
                          <td className="p-3 text-slate-600">{log.teknisi}</td>
                          <td className="p-3 text-slate-600 max-w-xs break-words">{log.tindakanPerbaikan}</td>
                          <td className="p-3 text-right font-semibold text-slate-700 font-mono">
                            {log.biayaPerbaikan > 0 ? `Rp ${log.biayaPerbaikan.toLocaleString('id-ID')}` : 'Rp 0'}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${statusBadges[log.statusPerbaikan]}`}>
                              {log.statusPerbaikan}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            id="close-detail-modal-footer"
            onClick={onClose} 
            className="px-5 py-2 bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
