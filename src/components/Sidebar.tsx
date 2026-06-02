import React from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Settings as SettingsIcon, LogOut, BarChart3, 
  ShieldCheck, UserCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useShopStore } from '../store';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { currentUser, logout } = useShopStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: ['ADMIN', 'MANAGER'] },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser?.role || ''));

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 z-40">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900">PROSHOP</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enterprise ERP</p>
          </div>
        </div>

        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                  isActive 
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-300" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-50 space-y-2">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
            <UserCircle size={24} className="text-slate-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-slate-900 truncate">{currentUser?.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser?.role}</p>
          </div>
        </div>

        <button 
          onClick={() => onViewChange('settings')}
          className={cn(
            "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group",
            activeView === 'settings' ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
          )}
        >
          <SettingsIcon size={20} />
          <span className="font-bold text-sm">Settings</span>
        </button>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
