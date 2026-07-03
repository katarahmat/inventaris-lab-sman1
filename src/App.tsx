import React, { useState, useEffect } from 'react';
import { Device, RepairLog, AppNotification, UserRole, RepairStatus } from './types';
import { INITIAL_DEVICES, INITIAL_NOTIFICATIONS, INITIAL_ROOMS } from './mockData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import InventarisView from './components/InventarisView';
import FormView from './components/FormView';
import PerbaikanView from './components/PerbaikanView';
import LaporanView from './components/LaporanView';
import DetailModal from './components/DetailModal';
import { 
  Server, 
  Shield, 
  User, 
  Lock, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function App() {
  
  // -----------------------------------------
  // State Initialization
  // -----------------------------------------
  
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('inv_logged_in') === 'true';
  });
  
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const logged = localStorage.getItem('inv_logged_in') === 'true';
    if (!logged) return 'Tamu';
    return (localStorage.getItem('inv_user_role') as UserRole) || 'Administrator';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // App core states
  const [devices, setDevices] = useState<Device[]>(() => {
    const local = localStorage.getItem('inv_devices_data');
    if (local) {
      try { return JSON.parse(local); } catch (e) { console.error(e); }
    }
    return INITIAL_DEVICES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const local = localStorage.getItem('inv_notifications_data');
    if (local) {
      try { return JSON.parse(local); } catch (e) { console.error(e); }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [rooms] = useState(INITIAL_ROOMS);

  // Active view tab state - default is dashboard
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Active editing device
  const [editDevice, setEditDevice] = useState<Device | null>(null);

  // Active selected device for specification modal drawer
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Responsive sidebar open on mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // -----------------------------------------
  // LocalStorage Persistence Sync
  // -----------------------------------------
  useEffect(() => {
    localStorage.setItem('inv_devices_data', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('inv_notifications_data', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('inv_logged_in', isLoggedIn ? 'true' : 'false');
    localStorage.setItem('inv_user_role', currentUserRole);
  }, [isLoggedIn, currentUserRole]);

  // Handle focus on notification item click
  const handleSelectNotificationDevice = (deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    if (dev) {
      // Mark notification as read
      setNotifications(prev => prev.map(n => n.deviceId === deviceId ? { ...n, read: true } : n));
      // Open detail modal
      setSelectedDevice(dev);
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // -----------------------------------------
  // Authentication Handlers
  // -----------------------------------------
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const formattedUsername = username.trim().toLowerCase();
    
    // Simple validation matches
    if (formattedUsername === 'admin' && password === 'admin123') {
      setCurrentUserRole('Administrator');
      setIsLoggedIn(true);
      setActiveTab('dashboard');
    } else if (formattedUsername === 'teknisi' && password === 'teknisi123') {
      setCurrentUserRole('Teknisi Labor');
      setIsLoggedIn(true);
      setActiveTab('dashboard');
    } else if (formattedUsername === 'kepalalab' && password === 'kepalalab123') {
      setCurrentUserRole('Kepala Labor');
      setIsLoggedIn(true);
      setActiveTab('dashboard');
    } else {
      setLoginError('Username atau password yang Anda masukkan salah!');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    setCurrentUserRole(role);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
    
    // Push an access alert to notifications
    const newNotif: AppNotification = {
      id: `N_${Date.now()}`,
      title: 'Akses Sistem Diberikan',
      message: `Anda masuk sebagai ${role} untuk SMAN 1 Teluk Kuantan.`,
      type: 'info',
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserRole('Tamu');
    setUsername('');
    setPassword('');
    setEditDevice(null);
    setSelectedDevice(null);
    setActiveTab('dashboard');
  };

  // -----------------------------------------
  // Device Mutations / Operations
  // -----------------------------------------
  const handleSaveDevice = (deviceData: Omit<Device, 'logs'>) => {
    const existingIndex = devices.findIndex(d => d.id === deviceData.id);
    
    let updatedDevices = [...devices];
    let alertMsg = '';

    if (existingIndex > -1) {
      // Edit mode
      const oldDevice = devices[existingIndex];
      const logs = oldDevice.logs || [];
      
      // Smart sync: if condition changed back to "Baik", resolve outstanding repair logs
      let resolvedLogs = [...logs];
      if (deviceData.kondisi === 'Baik' && oldDevice.kondisi !== 'Baik') {
        resolvedLogs = logs.map(l => {
          if (l.statusPerbaikan !== 'Selesai') {
            return {
              ...l,
              statusPerbaikan: 'Selesai',
              tindakanPerbaikan: l.tindakanPerbaikan + ' (Diselesaikan via edit kondisi perangkat)',
              tanggalPerbaikan: new Date().toISOString().split('T')[0]
            };
          }
          return l;
        });
      }

      updatedDevices[existingIndex] = {
        ...deviceData,
        logs: resolvedLogs
      };
      
      alertMsg = `Perangkat "${deviceData.namaPerangkat}" berhasil diperbarui.`;
    } else {
      // Add mode
      const newDevice: Device = {
        ...deviceData,
        logs: []
      };
      updatedDevices = [newDevice, ...updatedDevices];
      alertMsg = `Perangkat "${deviceData.namaPerangkat}" berhasil didaftarkan ke sistem.`;
    }

    setDevices(updatedDevices);
    setEditDevice(null);
    
    // Add success notification
    const newNotif: AppNotification = {
      id: `N_SAVE_${Date.now()}`,
      title: existingIndex > -1 ? 'Data Perangkat Diperbarui' : 'Perangkat Baru Terdaftar',
      message: alertMsg,
      type: 'info',
      date: new Date().toISOString().split('T')[0],
      read: false,
      deviceId: deviceData.id
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Go back to list
    setActiveTab('inventaris');
  };

  const handleDeleteDevice = (deviceId: string) => {
    const target = devices.find(d => d.id === deviceId);
    if (!target) return;

    if (window.confirm(`Apakah Anda yakin ingin menghapus perangkat "${target.namaPerangkat}" dari database? Tindakan ini permanen.`)) {
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      
      // Register notification
      const newNotif: AppNotification = {
        id: `N_DEL_${Date.now()}`,
        title: 'Perangkat Dihapus',
        message: `Perangkat "${target.namaPerangkat}" (${target.kodeInventaris}) telah dihapus oleh administrator.`,
        type: 'warning',
        date: new Date().toISOString().split('T')[0],
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleImportDevices = (imported: Device[]) => {
    setDevices(prev => [...imported, ...prev]);
    
    // Register success notification
    const newNotif: AppNotification = {
      id: `N_IMP_ALL_${Date.now()}`,
      title: 'Data Perangkat Diimpor',
      message: `Sebanyak ${imported.length} perangkat berhasil diimpor dari file Excel ke sistem.`,
      type: 'info',
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleEditDeviceTrigger = (device: Device) => {
    setEditDevice(device);
    setActiveTab('form');
  };

  // -----------------------------------------
  // Repair Log Operations
  // -----------------------------------------
  const handleAddRepairLog = (deviceId: string, logData: Omit<RepairLog, 'id' | 'deviceId' | 'deviceName'>) => {
    setDevices(prevDevices => {
      return prevDevices.map(device => {
        if (device.id === deviceId) {
          const newLog: RepairLog = {
            id: `L_${Date.now()}`,
            deviceId,
            deviceName: device.namaPerangkat,
            ...logData
          };

          // If repair status is marked Completed ('Selesai'), reset device condition back to "Baik"
          let updatedCondition = device.kondisi;
          let updatedDamageDesc = device.keteranganKerusakan;
          if (logData.statusPerbaikan === 'Selesai') {
            updatedCondition = 'Baik';
            updatedDamageDesc = undefined;
          } else if (logData.statusPerbaikan === 'Dalam Proses' && device.kondisi === 'Baik') {
            // If repair started, ensure status is reflecting damage
            updatedCondition = 'Rusak Ringan';
          }

          return {
            ...device,
            kondisi: updatedCondition,
            keteranganKerusakan: updatedDamageDesc,
            logs: [newLog, ...(device.logs || [])]
          };
        }
        return device;
      });
    });

    // Create notification
    const targetDevice = devices.find(d => d.id === deviceId);
    const newNotif: AppNotification = {
      id: `N_REP_${Date.now()}`,
      title: 'Tindakan Perbaikan Dicatat',
      message: `Log perbaikan baru ditambahkan untuk "${targetDevice?.namaPerangkat}" oleh teknisi. Status: ${logData.statusPerbaikan}.`,
      type: logData.statusPerbaikan === 'Selesai' ? 'info' : 'warning',
      date: new Date().toISOString().split('T')[0],
      read: false,
      deviceId
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Update selected modal device in realtime
    setTimeout(() => {
      setSelectedDevice(prev => {
        if (prev && prev.id === deviceId) {
          const reloaded = devices.find(d => d.id === deviceId);
          return reloaded ? { 
            ...reloaded, 
            kondisi: logData.statusPerbaikan === 'Selesai' ? 'Baik' : reloaded.kondisi,
            logs: [{ id: `L_${Date.now()}`, deviceId, deviceName: reloaded.namaPerangkat, ...logData }, ...reloaded.logs]
          } : prev;
        }
        return prev;
      });
    }, 100);
  };

  const handleUpdateRepairStatus = (
    deviceId: string, 
    logId: string, 
    newStatus: RepairStatus, 
    actionTaken: string, 
    cost: number
  ) => {
    setDevices(prevDevices => {
      return prevDevices.map(device => {
        if (device.id === deviceId) {
          const updatedLogs = device.logs.map(log => {
            if (log.id === logId) {
              return {
                ...log,
                statusPerbaikan: newStatus,
                tindakanPerbaikan: actionTaken,
                biayaPerbaikan: cost,
                tanggalPerbaikan: newStatus === 'Selesai' ? new Date().toISOString().split('T')[0] : undefined
              };
            }
            return log;
          });

          // Sync device condition based on repair status
          let updatedCondition = device.kondisi;
          let updatedDamageDesc = device.keteranganKerusakan;
          if (newStatus === 'Selesai') {
            updatedCondition = 'Baik';
            updatedDamageDesc = undefined;
          } else if (newStatus === 'Dalam Proses') {
            updatedCondition = 'Rusak Ringan';
          } else if (newStatus === 'Pending') {
            updatedCondition = 'Rusak Berat';
          }

          return {
            ...device,
            kondisi: updatedCondition,
            keteranganKerusakan: updatedDamageDesc,
            logs: updatedLogs
          };
        }
        return device;
      });
    });

    // Add alert notification
    const targetDevice = devices.find(d => d.id === deviceId);
    const newNotif: AppNotification = {
      id: `N_REP_UPD_${Date.now()}`,
      title: newStatus === 'Selesai' ? 'Perbaikan Selesai' : 'Progres Perbaikan Diperbarui',
      message: `Status perbaikan "${targetDevice?.namaPerangkat}" kini "${newStatus}". Tindakan: ${actionTaken}.`,
      type: newStatus === 'Selesai' ? 'info' : 'warning',
      date: new Date().toISOString().split('T')[0],
      read: false,
      deviceId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Helper to trigger direct tab switch
  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      
      {/* ------------------------------------------------------------------- */}
      {/* 1. AUTHENTICATION LOGIN PAGE SCREEN */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'login' && !isLoggedIn ? (
        <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-100 animate-in fade-in duration-200">
          
          {/* Brand Left Section (Decorative) - Compacted as requested */}
          <div className="flex-1 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white flex flex-col justify-between p-7 md:p-10 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 left-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/15 shadow-sm">
                <Server className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wider leading-none">LAB INFORMATIKA</h1>
                <span className="text-[9px] text-blue-300 font-bold tracking-tight uppercase">SMAN 1 Teluk Kuantan</span>
              </div>
            </div>

            <div className="space-y-3.5 max-w-sm mt-8 md:mt-0 relative z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-extrabold border border-white/15 tracking-wide text-amber-300">
                <Award className="w-3 h-3 text-amber-300" /> SMAN 1 Unggul & Berprestasi
              </span>
              <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight text-white">
                Sistem Informasi Inventaris Laboratorium
              </h2>
              <p className="text-indigo-100/80 text-[11px] leading-relaxed">
                Pendataan terintegrasi, pemantauan kelayakan hardware laptop, workstation PC, Interactive Smartboard, dan infrastruktur jaringan lab secara real-time.
              </p>
            </div>

            <div className="text-[9px] text-indigo-200/50 font-bold mt-8 md:mt-0 relative z-10 uppercase tracking-wider">
              © 2026 RahmatApriono • SMAN 1 Teluk Kuantan
            </div>
          </div>

          {/* Login Form Right Section */}
          <div className="w-full md:w-[450px] bg-white flex flex-col justify-center px-8 py-10 md:p-10 shadow-2xl relative z-10">
            <div className="max-w-md w-full mx-auto space-y-6">
              
              <div>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">ADMIN LOGIN PORTAL</span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">Selamat Datang</h3>
                <p className="text-[11px] text-slate-400 mt-1">Silakan masukkan username dan sandi akses labor SMAN 1 Anda.</p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                
                {/* Username */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Username Akun</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Masukkan username (contoh: admin)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-slate-700 font-bold">Kata Sandi</label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type="password" 
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-600/10 hover:shadow-lg transition-all"
                  >
                    Masuk Aplikasi
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-150 text-slate-600 font-bold rounded-xl transition-all border border-slate-200"
                  >
                    Batal, Akses Tamu
                  </button>
                </div>

              </form>

              {/* DEMO ACCOUNTS QUICK SWITCH (Highly recommended for examiner ease of testing!) */}
              <div className="border-t border-slate-100 pt-5 space-y-2.5">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Akun Demo Cepat (Klik untuk Masuk):</span>
                
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleQuickLogin('Administrator')}
                    className="p-2 rounded-xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50 text-slate-700 hover:border-blue-300 transition-all text-center space-y-0.5 group"
                  >
                    <span className="block text-[9px] font-extrabold text-blue-700 leading-tight">Admin</span>
                    <span className="block text-[7px] text-slate-400 leading-none">admin / admin123</span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('Teknisi Labor')}
                    className="p-2 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 text-slate-700 hover:border-emerald-300 transition-all text-center space-y-0.5 group"
                  >
                    <span className="block text-[9px] font-extrabold text-emerald-700 leading-tight">Teknisi</span>
                    <span className="block text-[7px] text-slate-400 leading-none">teknisi / teknisi123</span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('Kepala Labor')}
                    className="p-2 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50 text-slate-700 hover:border-amber-300 transition-all text-center space-y-0.5 group"
                  >
                    <span className="block text-[9px] font-extrabold text-amber-700 leading-tight">Kepala Lab</span>
                    <span className="block text-[7px] text-slate-400 leading-none">kepalalab / kepalalab123</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        
        // -------------------------------------------------------------------
        // 2. MAIN LOGGED-IN APPLICATION SHELL WORKSPACE
        // -------------------------------------------------------------------
        <>
          {/* Left Navigation Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'form') {
                setEditDevice(null); // Clear editing if navigating away
              }
            }}
            currentUserRole={currentUserRole}
            onLogout={handleLogout}
            isOpen={mobileSidebarOpen}
            setIsOpen={setMobileSidebarOpen}
          />

          {/* Central Workspace area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            
            {/* Top Bar Utilities */}
            <Header 
              currentUserRole={currentUserRole}
              setCurrentUserRole={setCurrentUserRole}
              notifications={notifications}
              onMarkAllRead={handleMarkNotificationsAllRead}
              onSelectNotificationDevice={handleSelectNotificationDevice}
              mobileSidebarOpen={mobileSidebarOpen}
              setMobileSidebarOpen={setMobileSidebarOpen}
            />

            {/* Scrollable Work View Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-12 space-y-6">
              
              {/* Dynamic Views rendering */}
              {activeTab === 'dashboard' && (
                <DashboardView 
                  devices={devices} 
                  onSelectDevice={setSelectedDevice}
                  onNavigateToTab={handleNavigateToTab}
                />
              )}

              {activeTab === 'inventaris' && (
                <InventarisView 
                  devices={devices}
                  currentUserRole={currentUserRole}
                  onSelectDevice={setSelectedDevice}
                  onEditDevice={handleEditDeviceTrigger}
                  onDeleteDevice={handleDeleteDevice}
                  onNavigateToTab={handleNavigateToTab}
                  onImportDevices={handleImportDevices}
                />
              )}

              {activeTab === 'form' && (
                <FormView 
                  editDevice={editDevice}
                  onSaveDevice={handleSaveDevice}
                  onCancelEdit={() => {
                    setEditDevice(null);
                    setActiveTab('inventaris');
                  }}
                  rooms={rooms}
                />
              )}

              {activeTab === 'perbaikan' && (
                <PerbaikanView 
                  devices={devices}
                  currentUserRole={currentUserRole}
                  onUpdateRepairStatus={handleUpdateRepairStatus}
                  onSelectDevice={setSelectedDevice}
                />
              )}

              {activeTab === 'laporan' && (
                <LaporanView 
                  devices={devices}
                  rooms={rooms}
                  onSelectDevice={setSelectedDevice}
                />
              )}

            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-3.5 px-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-medium">
              <div>
                © 2026 <strong className="text-slate-600 font-bold">RahmatApriono</strong>. SMAN 1 Teluk Kuantan. All rights reserved.
              </div>
              <div className="text-slate-400 font-bold block tracking-tight uppercase">
                "SILISA (Sistem Inventaris Labor Informatika SMANSA)"
              </div>
            </footer>

          </div>

          {/* Selected Device Specification modal Drawer overlay */}
          {selectedDevice && (
            <DetailModal 
              device={selectedDevice}
              onClose={() => setSelectedDevice(null)}
              currentUserRole={currentUserRole}
              onAddRepairLog={handleAddRepairLog}
            />
          )}

        </>
      )}

    </div>
  );
}
