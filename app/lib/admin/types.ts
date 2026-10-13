// ─── Roles & Users ────────────────────────────────────────────────────────────

export type Role = 'admin' | 'manager' | 'staff';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  lastActive?: string;
}

export interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
}

// ─── Customers ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  customerId: string; // DO-2026-001 format
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastVisit?: string;
}

// ─── Eye Testing & Prescriptions ──────────────────────────────────────────────

export interface EyeEntry {
  sph: string;
  cyl: string;
  axis: string;
  add?: string;
  pd?: string;
}

export interface EyeTest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  testedBy: string;
  rightEye: EyeEntry;
  leftEye: EyeEntry;
  visualAcuityRight?: string;
  visualAcuityLeft?: string;
  recommendation?: string;
  notes?: string;
  createdAt: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export type ProductCategory = 'frame' | 'lens' | 'sunglass' | 'accessory' | 'service';

export interface Product {
  id: string;
  productCode: string;
  name: string;
  brand: string;
  model?: string;
  category: ProductCategory;
  color?: string;
  size?: string;
  material?: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  stock: number;
  lowStockThreshold: number;
  imageUrl?: string;
  image_url?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// ─── Invoices & Billing ───────────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank';
export type InvoiceStatus = 'paid' | 'partially_paid' | 'pending' | 'cancelled';
export type OrderStatus = 'new' | 'lens_ordered' | 'in_process' | 'ready' | 'delivered' | 'cancelled';

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
  receivedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // DO-2026-00125
  customerId: string;
  customerName: string;
  customerPhone: string;
  eyeTestId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  total: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  payments: Payment[];
  orderStatus?: OrderStatus;
  frameProduct?: string;
  lensProduct?: string;
  expectedDate?: string;
  deliveredAt?: string;
  createdBy: string;
  createdAt: string;
  notes?: string;
}

// ─── Suppliers & Purchases ────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gst?: string;
  balance: number; // positive = we owe them
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  purchasePrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  supplierBillNumber: string;
  items: PurchaseItem[];
  total: number;
  paid: number;
  balance: number;
  status: 'paid' | 'partially_paid' | 'pending';
  createdBy: string;
  createdAt: string;
  notes?: string;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'rent'
  | 'electricity'
  | 'salary'
  | 'transport'
  | 'maintenance'
  | 'marketing'
  | 'supplies'
  | 'other';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  reference?: string;
  createdBy: string;
  createdAt: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type StockMovementType = 'purchase' | 'sale' | 'damage' | 'return' | 'adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: StockMovementType;
  quantity: number; // positive = in, negative = out
  reason?: string;
  reference?: string;
  createdBy: string;
  createdAt: string;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  performedBy: string;
  performedByRole: Role;
  createdAt: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst: string;
  invoicePrefix: string;
  customerIdPrefix: string;
  lowStockThreshold: number;
  taxEnabled: boolean;
  taxRate: number;
  invoiceFooter: string;
  invoiceTerms: string;
  maxDiscountAdmin: number;
  maxDiscountManager: number;
  maxDiscountStaff: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface AdminStore {
  customers: Customer[];
  eyeTests: EyeTest[];
  products: Product[];
  invoices: Invoice[];
  suppliers: Supplier[];
  purchases: Purchase[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  auditLogs: AuditLog[];
  staff: AdminUser[];
  settings: ShopSettings;
  initialized: boolean;
}
