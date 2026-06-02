import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem, Sale, User, ActivityLog, ShopSettings, PurchaseOrder } from './types';

interface ShopState {
  // Auth
  currentUser: User | null;
  login: (email: string, role: 'ADMIN' | 'MANAGER' | 'CASHIER') => void;
  logout: () => void;

  // Data
  products: Product[];
  cart: CartItem[];
  heldCarts: { id: string; items: CartItem[]; timestamp: string }[];
  sales: Sale[];
  activityLogs: ActivityLog[];
  purchaseOrders: PurchaseOrder[];
  settings: ShopSettings;

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  holdCart: () => void;
  restoreCart: (id: string) => void;
  clearCart: () => void;
  
  completeSale: (paymentMethod: Sale['paymentMethod'], discountTotal: number) => void;
  addActivityLog: (action: string, details: string) => void;
  updateSettings: (settings: Partial<ShopSettings>) => void;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'status'>) => void;
  receivePurchaseOrder: (id: string) => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      products: [
        { id: '1', sku: 'LAP-001', barcode: '123456789', name: 'MacBook Pro 14"', category: 'Electronics', costPrice: 1500, retailPrice: 1999, wholesalePrice: 1800, stock: 15, minStock: 5, supplier: 'Apple Inc' },
        { id: '2', sku: 'PHN-002', barcode: '987654321', name: 'iPhone 15 Pro', category: 'Electronics', costPrice: 700, retailPrice: 999, wholesalePrice: 900, stock: 25, minStock: 10, supplier: 'Apple Inc' },
      ],
      cart: [],
      heldCarts: [],
      sales: [],
      activityLogs: [],
      purchaseOrders: [],
      settings: {
        name: 'ProShop ERP',
        address: '123 Business Ave, Tech City',
        phone: '+1 234 567 890',
        taxId: 'TX-998877',
        currency: '$',
        taxRate: 0.08,
      },

      login: (email, role) => {
        const user: User = { id: Math.random().toString(36).substr(2, 9), name: email.split('@')[0], email, role };
        set({ currentUser: user });
        get().addActivityLog('LOGIN', `User ${email} logged in as ${role}`);
      },

      logout: () => {
        get().addActivityLog('LOGOUT', `User ${get().currentUser?.email} logged out`);
        set({ currentUser: null });
      },

      addActivityLog: (action, details) => {
        const { currentUser } = get();
        const log: ActivityLog = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: currentUser?.id || 'SYSTEM',
          userName: currentUser?.name || 'System',
          action,
          details,
        };
        set((state) => ({ activityLogs: [log, ...state.activityLogs].slice(0, 1000) }));
      },

      addProduct: (product) => {
        const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
        set((state) => ({ products: [...state.products, newProduct] }));
        get().addActivityLog('PRODUCT_ADD', `Added product ${newProduct.name}`);
      },

      updateProduct: (id, updatedFields) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
        }));
        get().addActivityLog('PRODUCT_UPDATE', `Updated product ID ${id}`);
      },

      deleteProduct: (id) => {
        const product = get().products.find(p => p.id === id);
        set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
        get().addActivityLog('PRODUCT_DELETE', `Deleted product ${product?.name}`);
      },

      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find((item) => item.id === product.id);
        if (existingItem) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1, discount: 0 }] };
      }),

      removeFromCart: (productId) => {
        set((state) => ({ cart: state.cart.filter((item) => item.id !== productId) }));
        get().addActivityLog('CART_REMOVE', `Removed item ${productId} from cart`);
      },

      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ).filter(item => item.quantity > 0)
      })),

      holdCart: () => {
        const { cart } = get();
        if (cart.length === 0) return;
        const heldCart = { id: `HELD-${Date.now()}`, items: [...cart], timestamp: new Date().toISOString() };
        set((state) => ({ heldCarts: [heldCart, ...state.heldCarts], cart: [] }));
        get().addActivityLog('CART_HOLD', `Held cart with ${cart.length} items`);
      },

      restoreCart: (id) => {
        const heldCart = get().heldCarts.find(c => c.id === id);
        if (!heldCart) return;
        set((state) => ({
          cart: heldCart.items,
          heldCarts: state.heldCarts.filter(c => c.id !== id)
        }));
        get().addActivityLog('CART_RESTORE', `Restored held cart ${id}`);
      },

      clearCart: () => set({ cart: [] }),

      completeSale: (paymentMethod, discountTotal) => {
        const { cart, products, settings, currentUser } = get();
        if (cart.length === 0) return;

        const subtotal = cart.reduce((acc, item) => acc + item.retailPrice * item.quantity, 0);
        const tax = (subtotal - discountTotal) * settings.taxRate;
        const total = subtotal - discountTotal + tax;

        const newSale: Sale = {
          id: `SALE-${Date.now()}`,
          date: new Date().toISOString(),
          cashierId: currentUser?.id || 'UNKNOWN',
          cashierName: currentUser?.name || 'Unknown',
          items: [...cart],
          subtotal,
          tax,
          discountTotal,
          total,
          paymentMethod,
        };

        const updatedProducts = products.map((p) => {
          const cartItem = cart.find((item) => item.id === p.id);
          if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          return p;
        });

        set((state) => ({
          sales: [...state.sales, newSale],
          products: updatedProducts,
          cart: [],
        }));
        get().addActivityLog('SALE_COMPLETE', `Completed sale ${newSale.id} via ${paymentMethod}`);
      },

      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      addPurchaseOrder: (po) => {
        const newPO: PurchaseOrder = { ...po, id: `PO-${Date.now()}`, status: 'PENDING' };
        set((state) => ({ purchaseOrders: [...state.purchaseOrders, newPO] }));
        get().addActivityLog('PO_CREATE', `Created purchase order for ${po.supplier}`);
      },

      receivePurchaseOrder: (id) => {
        const { purchaseOrders, products } = get();
        const po = purchaseOrders.find(p => p.id === id);
        if (!po || po.status === 'RECEIVED') return;

        const updatedProducts = products.map(p => {
          const poItem = po.items.find(item => item.productId === p.id);
          if (poItem) return { ...p, stock: p.stock + poItem.quantity };
          return p;
        });

        set((state) => ({
          products: updatedProducts,
          purchaseOrders: state.purchaseOrders.map(p => p.id === id ? { ...p, status: 'RECEIVED' } : p)
        }));
        get().addActivityLog('PO_RECEIVE', `Received purchase order ${id}`);
      },
    }),
    {
      name: 'proshop-erp-storage',
    }
  )
);
