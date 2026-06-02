import React from 'react';
import { useShopStore } from '../store';
import { 
  Settings as SettingsIcon, Globe, Shield, 
  Bell, Database, CreditCard, Save, Moon, Sun
} from 'lucide-react';
import { motion } from 'motion/react';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useShopStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a backend
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl">
      <header>
        <h2 className="text-3xl font-black text-slate-900">System Settings</h2>
        <p className="text-slate-500">Configure your enterprise environment and localization.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
            <Globe size={20} /> <span className="font-bold">General</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-white rounded-2xl text-slate-500 transition-all">
            <Shield size={20} /> <span className="font-bold">Security</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-white rounded-2xl text-slate-500 transition-all">
            <Bell size={20} /> <span className="font-bold">Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-white rounded-2xl text-slate-500 transition-all">
            <Database size={20} /> <span className="font-bold">Backup</span>
          </button>
        </div>

        <div className="md:col-span-2 glass-card p-10 rounded-[40px] space-y-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Shop Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={settings.name}
                  onChange={e => updateSettings({ name: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Business Address</label>
                <textarea 
                  className="input-field min-h-[100px]" 
                  value={settings.address}
                  onChange={e => updateSettings({ address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Currency Symbol</label>
                <select 
                  className="input-field"
                  value={settings.currency}
                  onChange={e => updateSettings({ currency: e.target.value })}
                >
                  <option value="$">USD ($)</option>
                  <option value="£">GBP (£)</option>
                  <option value="€">EUR (€)</option>
                  <option value="Rs">INR (Rs)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tax Rate (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="input-field" 
                  value={settings.taxRate * 100}
                  onChange={e => updateSettings({ taxRate: Number(e.target.value) / 100 })}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button type="button" className="p-3 bg-slate-100 rounded-xl text-slate-600"><Moon size={20} /></button>
                <span className="text-sm font-bold text-slate-500">Dark Mode</span>
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 px-8">
                <Save size={20} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
