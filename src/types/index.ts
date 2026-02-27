// Dashboard Types
export interface TodaysResume {
    todaySales:           number;
    orders:               Orders;
    lowStock:             number;
    yesterdayComparation: string;
}

export interface Orders {
    pending:          number;
    inProduction:     number;
    readyForDelivery: number;
    completedToday:   number;
}

export type ProductStatus =
  | 'pending'
  | 'baking'
  | 'assembling'
  | 'decorating'
  | 'ready'
  | 'delivered'

export interface RecentOrders {
    id:       string;
    customer: string;
    product:  string;
    status:   ProductStatus;
    time:     string;
}

// Sales Types

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

// User & Authentication Types
export type UserRole = 
  | 'admin' 
  | 'seller' 
  | 'baker' 
  | 'designer' 
  | 'assembler' 
  | 'delivery';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  avatar?: string;
  createdAt: Date;
}

// Inventory Types
export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minStock: number;
  category: 'flour' | 'dairy' | 'sugar' | 'eggs' | 'flavoring' | 'decoration' | 'other';
  lastUpdated: Date;
}

export interface BakedProduct {
  id: string;
  name: string;
  type: 'cake_base' | 'cupcake' | 'cookie' | 'bread' | 'pastry';
  quantity: number;
  minStock: number;
  expiresAt?: Date;
  createdAt: Date;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: 'cake' | 'cupcake' | 'dessert' | 'bread' | 'special';
  image?: string;
  portionSizes: number[];
  pricePerPortion: number;
  isActive: boolean;
  location: 'production' | 'store';
  stock: number;
  minStock: number;
}

// Flavor Types
export interface Flavor {
  id: string;
  name: string;
  type: 'cake' | 'filling';
  isActive: boolean;
}

// Menu Types
export interface SpecialMenu {
  id: string;
  name: string;
  eventDate: Date;
  startDate: Date;
  endDate: Date;
  products: MenuProduct[];
  isActive: boolean;
}

export interface MenuProduct {
  productId: string;
  product: Product;
  specialPrice?: number;
  isExclusive: boolean;
}

// Sweet Table Combo Types
export interface SweetTableCombo {
  id: string;
  name: string;
  totalQuantity: number;
  fixedPrice?: number;
  products: ComboProduct[];
  isPreset: boolean;
}

export interface ComboProduct {
  productId: string;
  product: Product;
  quantity: number;
  pricePerUnit: number;
}

// Order Types
export type OrderStatus = 
  | 'pending' 
  | 'baking' 
  | 'assembling' 
  | 'decorating' 
  | 'ready' 
  | 'delivered' 
  | 'cancelled';

export type PaymentMethod = 'cash' | 'qr';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupDate: Date;
  pickupTime: string;
  status: OrderStatus;
  items: OrderItem[];
  customCakes: CustomCake[];
  sweetTableCombo?: OrderCombo;
  deliveryAddress?: string;
  deliveryCost: number;
  deposit: number;
  depositMethod?: PaymentMethod;
  total: number;
  discount?: number;
  couponCode?: string;
  guarantee?: OrderGuarantee;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface OrderItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface CustomCake {
  id: string;
  portions: number;
  shape?: string;
  cakeFlavor: string;
  fillingFlavors: string[];
  design?: string;
  dedication?: string;
  referenceImages: string[];
  price: number;
  quantity: number;
}

export interface OrderCombo {
  comboId?: string;
  products: ComboProduct[];
  totalQuantity: number;
  price: number;
}

export interface OrderGuarantee {
  amount: number;
  items: string;
}

// Cash Register Types
export interface CashRegister {
  id: string;
  date: Date;
  openingBalance: number;
  closingBalance?: number;
  transactions: Transaction[];
  status: 'open' | 'closed';
}

export interface Transaction {
  id: string;
  type: 'sale' | 'deposit' | 'expense' | 'adjustment';
  amount: number;
  method: PaymentMethod;
  orderId?: string;
  description: string;
  createdAt: Date;
  createdBy: string;
}

// Branch Types
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isMain: boolean;
}
