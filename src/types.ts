export interface Medicine {
  id: string;
  name: string;
  code: string; // Barcode
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number; // For low stock warning
  expiryDate: string;
  location: string; // Shelf location e.g. "Rak A-1"
  supplierId?: string; // Associated salesperson
}

export interface Checkup {
  id: string;
  date: string;
  systolic: number; // Tensi darah sistolik (e.g. 120)
  diastolic: number; // Tensi darah diastolik (e.g. 80)
  bloodSugar: number; // Gula darah mg/dL
  cholesterol: number; // Kolesterol mg/dL
  weight: number; // Berat badan kg
  complaints: string; // Keluhan
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  birthdate: string; // For promo notifications
  points: number;
  joinedAt: string;
  checkups?: Checkup[];
  medicalHistory?: string[]; // Riwayat penyakit pelanggan
}

export interface Supplier {
  id: string;
  name: string;
  company: string; // Supplier company
  phone: string;
  debt: number; // Hutang piutang ke supplier
}

export interface StockInflow {
  id: string;
  medicineId: string;
  supplierId: string;
  quantity: number;
  arrivalDate: string;
  cost: number;
  paymentStatus: 'Lunas' | 'Hutang';
}

export interface SaleItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string; // QRIS, GoPay, OVO, Dana, Cash, dll.
  customerId?: string;
  customerName?: string;
  cashierName: string;
  whatsappStatus?: 'sent' | 'pending' | 'failed' | 'unsent';
}

export interface Employee {
  id: string;
  username: string;
  role: 'Admin' | 'Kasir';
  pinHash: string; // Simulated secure encrypted hash
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  scheduleHours: string; // e.g., "08:00 - 14:00"
  dutyDays: string[]; // e.g., ["Senin", "Rabu", "Jumat"]
  status: 'Aktif' | 'Istirahat' | 'Libur';
  gender?: 'Laki-laki' | 'Perempuan';
  photoUrl?: string; // Optional custom doctor avatar photo URL or file upload
}

export interface WhatsappLog {
  id: string;
  timestamp: string;
  recipient: string;
  recipientName: string;
  message: string;
  type: 'stok_habis' | 'ultah' | 'promo' | 'struk_digital' | 'shift_jaga';
  status: 'success' | 'failed';
}

export interface FinanceTransaction {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD or full ISO string)
  type: 'Pemasukan' | 'Pengeluaran';
  category: string;
  subCategory: string;
  item: string;
  amount: number;
  notes?: string;
}

export interface AppSettings {
  companyName: string;
  companyLogoType: 'cute-pill' | 'cute-cross' | 'cute-heart' | 'cute-sparkle';
  companyLogoUrl?: string; // Custom uploaded image or URL
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
  printerConnected: boolean;
  printerName: string;
  // WhatsApp API Configuration Settings
  whatsappGatewayUrl: string;
  whatsappApiKey: string;
  whatsappAutoPromo: boolean;
  whatsappAutoReceipt: boolean;
  whatsappAutoStockAlert: boolean;
}

export type ThemeColors = {
  primary: string;
  primaryHover: string;
  primaryBg: string;
  gradientFrom: string;
  gradientTo: string;
  accent: string;
  text: string;
};
