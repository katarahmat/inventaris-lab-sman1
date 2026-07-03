export type DeviceType = 'Laptop' | 'Komputer Desktop' | 'Interactive Flat Panel (IFP)' | 'Perangkat Jaringan';

export type DeviceCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';

export type UserRole = 'Administrator' | 'Teknisi Labor' | 'Kepala Labor';

export type RepairStatus = 'Pending' | 'Dalam Proses' | 'Selesai';

export interface RepairLog {
  id: string;
  deviceId: string;
  deviceName: string;
  tanggalKerusakan: string;
  jenisKerusakan: string;
  teknisi: string;
  tindakanPerbaikan: string;
  statusPerbaikan: RepairStatus;
  biayaPerbaikan: number;
  tanggalPerbaikan?: string;
}

export interface Device {
  id: string;
  kodeInventaris: string;
  namaPerangkat: string;
  jenisPerangkat: DeviceType;
  merk: string;
  tipeModel: string;
  nomorSeri: string;
  processor: string;
  ram: string;
  jenisPenyimpanan: 'HDD' | 'SSD' | 'None' | string;
  kapasitasPenyimpanan: string;
  tahunPembuatan: number;
  lokasiRuangan: string;
  kondisi: DeviceCondition;
  keteranganKerusakan?: string;
  tanggalPembelian: string;
  sumberDana: string;
  fotoPerangkat: string;
  catatanTambahan?: string;
  logs: RepairLog[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  date: string;
  read: boolean;
  deviceId?: string;
}

export interface LabRoom {
  id: string;
  nama: string;
  kode: string;
  deskripsi: string;
  kapasitas: number;
}
