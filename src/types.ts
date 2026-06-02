export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  minStock: number;
  supplier: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
  discount: number;
}

export interface Sale {
  id: string;
  date: string;
  cashierId: string;
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discountTotal: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'QR';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface PurchaseOrder {
  id: string;
  date: string;
  supplier: string;
  items: { productId: string; name: string; quantity: number; cost: number }[];
  total: number;
  status: 'PENDING' | 'RECEIVED';
}

export interface ShopSettings {
  name: string;
  address: string;
  phone: string;
  taxId: string;
  currency: string;
  taxRate: number;
  logo?: string;
}
