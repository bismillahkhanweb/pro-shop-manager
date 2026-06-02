import React, { useState, useEffect, useRef } from 'react';
import { useShopStore } from '../store';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, 
  CheckCircle2, CreditCard, Banknote, QrCode,
  PauseCircle, History, Tag, Receipt, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const POS: React.FC = () => {
  const { 
    products, cart, heldCarts, settings, currentUser,
    addToCart, removeFromCart, updateCartQuantity, 
    completeSale, holdCart, restoreCart 
  } = useShopStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [discount, setDiscount] = useState(0);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Barcode scanner support
  useEffect(() => {
    let buffer = '';
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const product = products.find(p => p.barcode === buffer || p.sku === buffer);
        if (product) addToCart(product);
        buffer = '';
      } else {
        buffer += e.key;
      }
      // Clear buffer after 500ms of inactivity
      setTimeout(() => buffer = '', 500);
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [products, addToCart]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.barcode.includes(searchQuery)
  );

  const subtotal = cart.reduce((acc, item) => acc + item.retailPrice * item.quantity, 0);
  const tax = (subtotal - discount) * settings.taxRate;
  const total = subtotal - discount + tax;

  const handleCheckout = async (method: 'CASH' | 'CARD' | 'QR') => {
    // Generate PDF before clearing state
    await generateReceipt();
    completeSale(method, discount);
    setShowPaymentModal(false);
    setShowSuccess(true);
    setDiscount(0);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const generateReceipt = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200] // Thermal receipt size
    });
    pdf.addImage(imgData, 'PNG', 0, 0, 80, (canvas.height * 80) / canvas.width);
    pdf.save(`Receipt-${Date.now()}.pdf`);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Scan barcode or search products..."
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => holdCart()} className="btn-secondary flex items-center gap-2">
              <PauseCircle size={18} /> Hold
            </button>
            <div className="relative group">
              <button className="btn-secondary flex items-center gap-2">
                <History size={18} /> Held ({heldCarts.length})
              </button>
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 hidden group-hover:block z-50 p-4">
                <h4 className="text-sm font-bold mb-2">Held Transactions</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {heldCarts.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => restoreCart(c.id)}
                      className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-xs"
                    >
                      <div className="font-bold">{c.id}</div>
                      <div className="text-slate-500">{new Date(c.timestamp).toLocaleTimeString()} - {c.items.length} items</div>
                    </button>
                  ))}
                  {heldCarts.length === 0 && <p className="text-xs text-slate-400">No held carts</p>}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <motion.button
                key={product.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="glass-card p-4 rounded-3xl text-left transition-all hover:border-slate-900 disabled:opacity-50"
              >
                <div className="aspect-square bg-slate-50 rounded-2xl mb-3 flex items-center justify-center text-slate-300">
                  <Package size={40} strokeWidth={1} />
                </div>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h4>
                <p className="text-xs text-slate-500 mb-2 font-mono">{product.sku}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900">{settings.currency}{product.retailPrice}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {product.stock} Stock
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[400px] glass-card rounded-[32px] flex flex-col overflow-hidden shadow-2xl border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Checkout</h3>
            <p className="text-xs text-slate-500">Cashier: {currentUser?.name}</p>
          </div>
          <Receipt size={24} className="text-slate-400" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group"
              >
                <div className="flex-1">
                  <h5 className="font-bold text-slate-900 text-sm">{item.name}</h5>
                  <p className="text-xs text-slate-500">{settings.currency}{item.retailPrice.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1">
                  <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-slate-50 rounded-lg"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-slate-50 rounded-lg"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
              <ShoppingCart size={64} strokeWidth={1} />
              <p className="font-medium">Cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-900 text-white space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Subtotal</span>
              <span>{settings.currency}{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-sm">
              <span className="flex items-center gap-2"><Tag size={14} /> Discount</span>
              <input 
                type="number" 
                className="w-20 bg-slate-800 border-none rounded px-2 py-1 text-right text-white text-xs"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Tax ({settings.taxRate * 100}%)</span>
              <span>{settings.currency}{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-black text-3xl pt-4 border-t border-slate-800">
              <span>Total</span>
              <span>{settings.currency}{total.toLocaleString()}</span>
            </div>
          </div>

          <button 
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0}
            className="w-full bg-white text-slate-900 py-4 rounded-2xl text-lg font-black hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Pay Now
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
              <h3 className="text-3xl font-black text-slate-900 mb-2">Payment</h3>
              <p className="text-slate-500 mb-8">Select preferred payment method for {settings.currency}{total.toLocaleString()}</p>
              
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleCheckout('CASH')} className="flex items-center gap-4 p-6 rounded-3xl border-2 border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all group">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Banknote size={32} /></div>
                  <div className="text-left"><p className="font-black text-slate-900">Cash Payment</p><p className="text-xs text-slate-500">Physical currency transaction</p></div>
                </button>
                <button onClick={() => handleCheckout('CARD')} className="flex items-center gap-4 p-6 rounded-3xl border-2 border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all group">
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><CreditCard size={32} /></div>
                  <div className="text-left"><p className="font-black text-slate-900">Credit / Debit Card</p><p className="text-xs text-slate-500">Visa, Mastercard, AMEX</p></div>
                </button>
                <button onClick={() => handleCheckout('QR')} className="flex items-center gap-4 p-6 rounded-3xl border-2 border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all group">
                  <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors"><QrCode size={32} /></div>
                  <div className="text-left"><p className="font-black text-slate-900">Mobile QR Pay</p><p className="text-xs text-slate-500">Apple Pay, Google Pay, Scan</p></div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Receipt for PDF Generation */}
      <div className="hidden">
        <div ref={receiptRef} className="w-[80mm] bg-white p-4 text-slate-900 font-mono text-[10px]">
          <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
            <h2 className="text-lg font-black uppercase">{settings.name}</h2>
            <p>{settings.address}</p>
            <p>Tel: {settings.phone}</p>
            <p>Tax ID: {settings.taxId}</p>
          </div>
          <div className="mb-4">
            <p>Date: {new Date().toLocaleString()}</p>
            <p>Cashier: {currentUser?.name}</p>
            <p>Order: #{Date.now()}</p>
          </div>
          <div className="border-b border-dashed border-slate-300 mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between mb-1">
                <span>{item.name} x{item.quantity}</span>
                <span>{settings.currency}{(item.retailPrice * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 text-right">
            <p>Subtotal: {settings.currency}{subtotal.toLocaleString()}</p>
            <p>Discount: -{settings.currency}{discount.toLocaleString()}</p>
            <p>Tax ({settings.taxRate * 100}%): {settings.currency}{tax.toLocaleString()}</p>
            <p className="text-sm font-black pt-2">TOTAL: {settings.currency}{total.toLocaleString()}</p>
          </div>
          <div className="text-center mt-8 pt-4 border-t border-dashed border-slate-300">
            <p className="font-bold">THANK YOU FOR YOUR BUSINESS</p>
            <p>Please visit us again!</p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <div className="bg-emerald-600 text-white p-12 rounded-[48px] shadow-2xl flex flex-col items-center gap-4">
              <CheckCircle2 size={80} />
              <h2 className="text-4xl font-black">SALE COMPLETE</h2>
              <p className="text-emerald-100">Receipt generated and stock updated.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POS;
