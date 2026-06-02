import React, { useState } from 'react';
import { useShopStore } from '../store';
import { motion } from 'motion/react';
import { LogIn, Shield, User, Key } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useShopStore();
  const [email, setEmail] = useState('admin@proshop.com');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'CASHIER'>('ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-slate-900" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">ProShop ERP</h1>
          <p className="text-slate-400">Enterprise Resource Planning</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User size={16} /> Email Address
            </label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Key size={16} /> Access Role
            </label>
            <select 
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="ADMIN">Administrator (Full Access)</option>
              <option value="MANAGER">Manager (Inventory & Reports)</option>
              <option value="CASHIER">Cashier (POS Only)</option>
            </select>
          </div>

          <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2">
            <LogIn size={20} />
            Sign In to Dashboard
          </button>

          <div className="pt-4 text-center">
            <p className="text-xs text-slate-400">
              Demo Mode: Any email works. Select role to test RBAC.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
