import React from 'react';
import { UserRole } from '../types';
import { 
  Home, 
  Database, 
  PlusCircle, 
  Wrench, 
  FileText, 
  Shield, 
  User, 
  LogOut, 
  BookOpen, 
  Menu, 
  X,
  Server
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserRole: UserRole;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUserRole, 
  onLogout, 
  isOpen, 
  setIsOpen 
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, roles: ['Administrator', 'Teknisi Labor', 'Kepala Labor'] },
    { id: 'inventaris', name: 'Data Inventaris', icon: Database, roles: ['Administrator', 'Teknisi Labor', 'Kepala Labor'] },
    { id: 'form', name: 'Tambah Inventaris', icon: PlusCircle, roles: ['Administrator', 'Teknisi Labor'] },
    { id: 'perbaikan', name: 'Perbaikan Perangkat', icon: Wrench, roles: ['Administrator', 'Teknisi Labor'] },
    { id: 'laporan', name: 'Laporan', icon: FileText, roles: ['Administrator', 'Teknisi Labor', 'Kepala Labor'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentUserRole));

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Administrator': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Teknisi Labor': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Kepala Labor': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white text-slate-600 border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">LAB INFORMATIKA</h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">SMAN 1 Teluk Kuantan</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Profile info */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <User className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate" title={currentUserRole === 'Administrator' ? 'Rahmat Apriono' : currentUserRole}>
                {currentUserRole === 'Administrator' ? 'Rahmat Apriono' : currentUserRole === 'Teknisi Labor' ? 'Hendra (Teknisi)' : 'Kepala Lab (Bapak Siswo)'}
              </p>
              <span className={`inline-block text-[10px] px-2 py-0.5 mt-1 rounded-full border font-bold ${getRoleBadgeColor(currentUserRole)}`}>
                {currentUserRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Menu Utama
          </div>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); // Close mobile drawer on item click
                }}
                className={`
                  flex items-center w-full gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 group
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100/50 shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sistem
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-450 font-semibold font-sans">
              Sistem Inventaris v1.2
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">
              SMAN 1 Teluk Kuantan
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
