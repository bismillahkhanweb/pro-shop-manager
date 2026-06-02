import React, { useState } from 'react';
import { useShopStore } from '../store';
import { 
  Search, Plus, Edit2, Trash2, Download, Upload, 
  Filter, Package, DollarSign, Truck, Barcode,
  AlertCircle, ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, settings, currentUser } = useShopStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const canEditPrices = currentUser?.role === 'ADMIN';

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    costPrice: 0,
    retailPrice: 0,
    wholesalePrice: 0,
    stock: 0,
    minStock: 5,
    supplier: ''
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.includes(searchQuery)
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', sku: '', barcode: '', category: '',
        costPrice: 0, retailPrice: 0, wholesalePrice: 0,
        stock: 0, minStock: 5, supplier: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'SKU', 'Barcode', 'Category', 'Cost Price', 'Retail Price', 'Stock', 'Supplier'];
    const rows = products.map(p => [p.name, p.sku, p.barcode, p.category, p.costPrice, p.retailPrice, p.stock, p.supplier]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Master Inventory</h2>
          <p className="text-slate-500">Enterprise stock management & supplier profiles.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2">
            <Download size={18} /> Export CSV
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Upload size={18} /> Import Data
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Product
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card rounded-[32px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by Name, SKU, or Barcode..." 
                  className="input-field pl-12 py-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <Filter size={18} /> Advanced Filters
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                    <th className="px-8 py-4">Product Details</th>
                    <th className="px-8 py-4">Category</th>
                    <th className="px-8 py-4">Pricing ({settings.currency})</th>
                    <th className="px-8 py-4">Stock Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                            <Package size={24} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-400 font-mono">SKU: {product.sku} | BC: {product.barcode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-900">Retail: {settings.currency}{product.retailPrice}</div>
                          <div className="text-[10px] text-slate-400">Cost: {settings.currency}{product.costPrice} | Whl: {settings.currency}{product.wholesalePrice}</div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                            <div 
                              className={`h-full rounded-full ${product.stock <= product.minStock ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (product.stock / (product.minStock * 3)) * 100)}%` }}
                            />
                          </div>
                          <span className={`font-black text-sm ${product.stock <= product.minStock ? 'text-red-600' : 'text-slate-900'}`}>
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-slate-900"><Edit2 size={18} /></button>
                          <button onClick={() => deleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-[32px]">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck size={20} /> Supplier Overview
            </h3>
            <div className="space-y-3">
              {Array.from(new Set(products.map(p => p.supplier))).map(supplier => (
                <div key={supplier} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-700">{supplier}</span>
                  <span className="text-[10px] bg-white px-2 py-1 rounded-lg border border-slate-200">
                    {products.filter(p => p.supplier === supplier).length} SKUs
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-[32px] bg-slate-900 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-400" /> Reorder Needed
            </h3>
            <div className="space-y-3">
              {products.filter(p => p.stock <= p.minStock).map(p => (
                <div key={p.id} className="flex justify-between items-center text-xs">
                  <span>{p.name}</span>
                  <span className="font-bold text-red-400">{p.stock} / {p.minStock}</span>
                </div>
              ))}
              <button className="w-full mt-4 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm">
                Generate Purchase Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-3xl font-black text-slate-900 mb-8">{editingProduct ? 'Edit Product Profile' : 'New Product Entry'}</h3>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Product Name</label>
                  <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">SKU Code</label>
                  <input required type="text" className="input-field" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Barcode / EAN</label>
                  <div className="relative">
                    <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input required type="text" className="input-field" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Category</label>
                  <input required type="text" className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Supplier</label>
                  <input required type="text" className="input-field" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl col-span-2 grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Cost Price</label>
                    <input required type="number" step="0.01" className="input-field" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} disabled={!canEditPrices} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Retail Price</label>
                    <input required type="number" step="0.01" className="input-field" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: Number(e.target.value)})} disabled={!canEditPrices} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Wholesale</label>
                    <input required type="number" step="0.01" className="input-field" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: Number(e.target.value)})} disabled={!canEditPrices} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Initial Stock</label>
                  <input required type="number" className="input-field" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Min Stock Alert</label>
                  <input required type="number" className="input-field" value={formData.minStock} onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} />
                </div>

                <div className="col-span-2 flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary py-4">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary py-4">Confirm & Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Inventory;
