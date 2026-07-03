import React, { useState } from 'react';
import { UserRole, AppNotification } from '../types';
import { Bell, Menu, User, Shield, AlertCircle, Check, Settings, Laptop } from 'lucide-react';

interface HeaderProps {
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onSelectNotificationDevice: (deviceId: string) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export default function Header({
  currentUserRole,
  setCurrentUserRole,
  notifications,
  onMarkAllRead,
  onSelectNotificationDevice,
  mobileSidebarOpen,
  setMobileSidebarOpen
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
      default: return <AlertCircle className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-xs">
      
      {/* Left side: Hamburger for mobile, and Page context */}
      <div className="flex items-center gap-4">
        <button
          id="btn-mobile-menu"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 text-xs font-bold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span>Sistem Aktif</span>
          </div>
          <span className="text-xs font-medium text-slate-350">•</span>
          <span className="text-xs font-medium text-slate-500">
            SMAN 1 Teluk Kuantan
          </span>
        </div>
      </div>

      {/* Right side: Role Quick Switch, Notification Bell, User profile */}
      <div className="flex items-center gap-4">
        
        {/* Role Quick Switcher / Guest Mode Indicator */}
        {currentUserRole === 'Tamu' ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-650">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden xs:inline">Mode Publik (Akses Baca)</span>
            <span className="xs:hidden">Publik</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="hidden xl:inline text-[10px] font-bold text-slate-500 uppercase px-2">
              Akses Akun:
            </span>
            <select
              id="role-switcher-select"
              value={currentUserRole}
              onChange={(e) => {
                setCurrentUserRole(e.target.value as UserRole);
              }}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              <option value="Administrator">Administrator (Rahmat)</option>
              <option value="Teknisi Labor">Teknisi Labor (Hendra)</option>
              <option value="Kepala Labor">Kepala Labor (Pak Siswo)</option>
            </select>
          </div>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex w-4 h-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white leading-none shadow-xs ring-2 ring-white animate-bounce">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <>
              {/* Dropdown overlay background to close */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifDropdown(false)} 
              />
              
              {/* Dropdown panel */}
              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-150">
                  <h4 className="text-xs font-bold text-slate-800">
                    Pemberitahuan ({unreadNotifs.length} Unread)
                  </h4>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={() => {
                        onMarkAllRead();
                      }}
                      className="text-[10px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark Read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-400">
                      Tidak ada notifikasi sistem saat ini.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-3.5 flex gap-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${notif.read ? 'opacity-65' : 'bg-sky-50/20'}`}
                        onClick={() => {
                          if (notif.deviceId) {
                            onSelectNotificationDevice(notif.deviceId);
                          }
                          setShowNotifDropdown(false);
                        }}
                      >
                        {getNotifIcon(notif.type)}
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800 flex items-center justify-between gap-1">
                            <span>{notif.title}</span>
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
                          </p>
                          <p className="text-[10px] text-slate-600 leading-normal">{notif.message}</p>
                          <span className="block text-[9px] text-slate-400 font-medium">
                            {new Date(notif.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 bg-slate-50 text-center border-t border-slate-150">
                  <span className="text-[10px] font-semibold text-slate-500">
                    Notifikasi Terkoneksi ke Modul Perawatan
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Identity Avatar */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
          <div className="text-right hidden md:block">
            <span className="block text-xs font-bold text-slate-800">
              {currentUserRole === 'Administrator' ? 'Rahmat Apriono' : currentUserRole === 'Teknisi Labor' ? 'Hendra S.' : 'Pak Siswo'}
            </span>
            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">
              SMAN 1 Teluk Kuantan
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {currentUserRole === 'Administrator' ? 'RA' : currentUserRole === 'Teknisi Labor' ? 'HS' : 'SW'}
          </div>
        </div>

      </div>

    </header>
  );
}
