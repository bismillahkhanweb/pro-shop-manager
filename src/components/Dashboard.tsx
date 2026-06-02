import React from 'react';
import { useShopStore } from '../store';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, Package, DollarSign, AlertTriangle, 
  ShoppingCart, Users, ArrowUpRight, ArrowDownRight,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { products, sales, settings } = useShopStore();

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalCost = sales.reduce((acc, sale) => {
    return acc + sale.items.reduce((itemAcc, item) => itemAcc + (item.costPrice * item.quantity), 0);
  }, 0);
  const netProfit = totalRevenue - totalCost;
  const stockValue = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Category data for Donut Chart
  const categoryData = products.reduce((acc: any[], p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) {
      existing.value += p.stock;
    } else {
      acc.push({ name: p.category, value: p.stock });
    }
    return acc;
  }, []);

  const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'];

  // Sales trend data
  const salesTrend = sales.slice(-10).map(s => ({
    date: format(new Date(s.date), 'MMM dd'),
    revenue: s.total,
    profit: s.total - s.items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0)
  }));

  const kpis = [
    { label: 'Gross Revenue', value: `${settings.currency}${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', isUp: true },
    { label: 'Net Profit', value: `${settings.currency}${netProfit.toLocaleString()}`, icon: TrendingUp, trend: '+8.2%', isUp: true },
    { label: 'Total Transactions', value: sales.length, icon: ShoppingCart, trend: '+5.4%', isUp: true },
    { label: 'Stock Value', value: `${settings.currency}${stockValue.toLocaleString()}`, icon: Package, trend: '-2.1%', isUp: false },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Business Intelligence</h2>
          <p className="text-slate-500">Real-time enterprise performance metrics.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm">Export Report</button>
          <button className="btn-primary text-sm">Refresh Data</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-3xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-900 rounded-2xl text-white">
                <kpi.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpi.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
            <h4 className="text-2xl font-bold text-slate-900">{kpi.value}</h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900">Weekly Sales & Profit Trends</h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-900" /> Revenue</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400" /> Profit</div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend.length > 0 ? salesTrend : [{date: 'N/A', revenue: 0, profit: 0}]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#94a3b8" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Inventory Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.length > 0 ? categoryData : [{name: 'Empty', value: 1}]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Critical Alerts
            </h4>
            <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-700">{p.name}</span>
                  <span className="font-bold text-red-600">{p.stock} left</span>
                </div>
              ))}
              {lowStockProducts.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No stock alerts</p>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
