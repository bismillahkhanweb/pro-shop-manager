import React from 'react';
import { useShopStore } from '../store';
import { 
  FileText, History, User, Calendar, 
  Download, Printer, Search, ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

const Reports: React.FC = () => {
  const { sales, activityLogs, settings } = useShopStore();

  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date.startsWith(today));
  
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);
  const todayTax = todaySales.reduce((acc, s) => acc + s.tax, 0);
  const todayDiscounts = todaySales.reduce((acc, s) => acc + s.discountTotal, 0);
  
  const paymentBreakdown = todaySales.reduce((acc: any, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.total;
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Reports & Audits</h2>
          <p className="text-slate-500">Financial summaries and system activity logs.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2"><Printer size={18} /> Print Z-Report</button>
          <button className="btn-primary flex items-center gap-2"><Download size={18} /> Export PDF</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Closing Report (Z-Report) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 rounded-[40px] border-2 border-slate-900">
            <div className="text-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-widest">Daily Closing Report</h3>
              <p className="text-xs text-slate-400">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
            </div>

            <div className="space-y-4 border-b border-dashed border-slate-200 pb-6 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Transactions</span>
                <span className="font-bold">{todaySales.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Gross Sales</span>
                <span className="font-bold">{settings.currency}{todayRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Tax Collected</span>
                <span className="font-bold">{settings.currency}{todayTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Total Discounts</span>
                <span className="font-bold">-{settings.currency}{todayDiscounts.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Breakdown</h4>
              {Object.entries(paymentBreakdown).map(([method, amount]: any) => (
                <div key={method} className="flex justify-between text-sm">
                  <span className="text-slate-500">{method}</span>
                  <span className="font-bold">{settings.currency}{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl text-white text-center">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Net Cash in Drawer</p>
              <h4 className="text-3xl font-black">{settings.currency}{todayRevenue.toLocaleString()}</h4>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-[40px] overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <History size={24} /> System Activity Log
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Filter logs..." className="input-field pl-10 py-2 text-sm" />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-4">Timestamp</th>
                    <th className="px-8 py-4">User</th>
                    <th className="px-8 py-4">Action</th>
                    <th className="px-8 py-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-xs text-slate-500">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {log.userName.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{log.userName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                          log.action.includes('DELETE') ? 'bg-red-100 text-red-600' : 
                          log.action.includes('SALE') ? 'bg-emerald-100 text-emerald-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-500">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;
