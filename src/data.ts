import { Medicine, Customer, Supplier, Sale, StockInflow, Doctor } from './types';

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Paracetamol 500mg',
    code: '8991001100223',
    category: 'Obat Bebas',
    buyPrice: 3500,
    sellPrice: 5000,
    stock: 120,
    minStock: 20,
    expiryDate: '2027-12-15',
    location: 'Rak A-1',
    supplierId: 'sup-1',
  },
  {
    id: 'med-2',
    name: 'Amoxicillin 500mg',
    code: '8992002200334',
    category: 'Obat Keras',
    buyPrice: 8000,
    sellPrice: 12000,
    stock: 15, // Low stock!
    minStock: 25,
    expiryDate: '2026-10-22',
    location: 'Rak B-3',
    supplierId: 'sup-2',
  },
  {
    id: 'med-3',
    name: 'Vitamin C 1000mg Sweet',
    code: '8993003300445',
    category: 'Vitamin & Suplemen',
    buyPrice: 15000,
    sellPrice: 22000,
    stock: 80,
    minStock: 15,
    expiryDate: '2028-05-01',
    location: 'Etalase Depan',
    supplierId: 'sup-1',
  },
  {
    id: 'med-4',
    name: 'Sari Kurma Cough Syrup',
    code: '8994004400556',
    category: 'Herbal & Jamu',
    buyPrice: 21000,
    sellPrice: 29500,
    stock: 8, // Low stock!
    minStock: 10,
    expiryDate: '2027-02-18',
    location: 'Rak C-2',
    supplierId: 'sup-3',
  },
  {
    id: 'med-5',
    name: 'Betadine Antiseptic 15ml',
    code: '8995005500667',
    category: 'Alat Kesehatan',
    buyPrice: 9500,
    sellPrice: 14000,
    stock: 45,
    minStock: 10,
    expiryDate: '2028-09-10',
    location: 'Rak D-1',
    supplierId: 'sup-3',
  },
  {
    id: 'med-6',
    name: 'Minyak Kayu Putih Cap Lang 120ml',
    code: '8996006600778',
    category: 'Herbal & Jamu',
    buyPrice: 32000,
    sellPrice: 41000,
    stock: 35,
    minStock: 8,
    expiryDate: '2029-01-30',
    location: 'Etalase Depan',
    supplierId: 'sup-2',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Budi Santoso',
    phone: '081234567890',
    birthdate: '1990-06-29', // birthday is near
    points: 120,
    joinedAt: '2025-01-10',
  },
  {
    id: 'cust-2',
    name: 'Siti Rahma',
    phone: '085678901234',
    birthdate: '1995-12-05',
    points: 340,
    joinedAt: '2024-11-20',
  },
  {
    id: 'cust-3',
    name: 'Aditya Pratama',
    phone: '087890123456',
    birthdate: '1988-06-28', // birthday today/tomorrow!
    points: 50,
    joinedAt: '2025-03-15',
  },
  {
    id: 'cust-4',
    name: 'Dewi Lestari',
    phone: '082134567891',
    birthdate: '2001-07-02',
    points: 15,
    joinedAt: '2026-05-12',
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Rian Wijaya (Sales)',
    company: 'PT Indo Medika Distribusi',
    phone: '081122334455',
    debt: 1250000, // Hutang piutang apotek ke sales
  },
  {
    id: 'sup-2',
    name: 'Lina Marlina (Sales)',
    company: 'PT Phapros Utama',
    phone: '082233445566',
    debt: 0,
  },
  {
    id: 'sup-3',
    name: 'Heri Kurniawan (Sales)',
    company: 'PT Kimia Sehat Jaya',
    phone: '083344556677',
    debt: 850000,
  },
];

export const INITIAL_STOCK_INFLOWS: StockInflow[] = [
  {
    id: 'in-1',
    medicineId: 'med-1',
    supplierId: 'sup-1',
    quantity: 100,
    arrivalDate: '2026-06-20',
    cost: 350000,
    paymentStatus: 'Lunas',
  },
  {
    id: 'in-2',
    medicineId: 'med-2',
    supplierId: 'sup-2',
    quantity: 50,
    arrivalDate: '2026-06-24',
    cost: 400000,
    paymentStatus: 'Lunas',
  },
  {
    id: 'in-3',
    medicineId: 'med-4',
    supplierId: 'sup-3',
    quantity: 20,
    arrivalDate: '2026-06-25',
    cost: 420000,
    paymentStatus: 'Hutang',
  },
];

// Generates simulated sales history for daily/weekly/monthly reports
export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'INV/20260625/001',
    date: '2026-06-25T09:30:00Z',
    items: [
      { medicineId: 'med-1', name: 'Paracetamol 500mg', quantity: 2, price: 5000, total: 10000 },
      { medicineId: 'med-3', name: 'Vitamin C 1000mg Sweet', quantity: 1, price: 22000, total: 22000 },
    ],
    subtotal: 32000,
    discount: 2000,
    total: 30000,
    paymentMethod: 'GoPay',
    customerId: 'cust-1',
    customerName: 'Budi Santoso',
    cashierName: 'Apoteker Rina',
  },
  {
    id: 'sale-2',
    invoiceNumber: 'INV/20260625/002',
    date: '2026-06-25T14:15:00Z',
    items: [
      { medicineId: 'med-5', name: 'Betadine Antiseptic 15ml', quantity: 1, price: 14000, total: 14000 },
    ],
    subtotal: 14000,
    discount: 0,
    total: 14000,
    paymentMethod: 'Cash',
    cashierName: 'Apoteker Rina',
  },
  {
    id: 'sale-3',
    invoiceNumber: 'INV/20260626/001',
    date: '2026-06-26T10:05:00Z',
    items: [
      { medicineId: 'med-1', name: 'Paracetamol 500mg', quantity: 10, price: 5000, total: 50000 },
      { medicineId: 'med-6', name: 'Minyak Kayu Putih Cap Lang 120ml', quantity: 1, price: 41000, total: 41000 },
    ],
    subtotal: 91000,
    discount: 5000,
    total: 86000,
    paymentMethod: 'QRIS',
    customerId: 'cust-2',
    customerName: 'Siti Rahma',
    cashierName: 'Apoteker Rina',
  },
  {
    id: 'sale-4',
    invoiceNumber: 'INV/20260627/001',
    date: '2026-06-27T08:20:00Z',
    items: [
      { medicineId: 'med-3', name: 'Vitamin C 1000mg Sweet', quantity: 2, price: 22000, total: 44000 },
    ],
    subtotal: 44000,
    discount: 4000,
    total: 40000,
    paymentMethod: 'Dana',
    customerId: 'cust-3',
    customerName: 'Aditya Pratama',
    cashierName: 'Apoteker Rina',
  },
  {
    id: 'sale-5',
    invoiceNumber: 'INV/20260627/002',
    date: '2026-06-27T12:40:00Z',
    items: [
      { medicineId: 'med-2', name: 'Amoxicillin 500mg', quantity: 3, price: 12000, total: 36000 },
      { medicineId: 'med-1', name: 'Paracetamol 500mg', quantity: 4, price: 5000, total: 20000 },
    ],
    subtotal: 56000,
    discount: 0,
    total: 56000,
    paymentMethod: 'OVO',
    cashierName: 'Apoteker Rina',
  },
  // Adding older data for monthly reports (May 2026)
  {
    id: 'sale-old-1',
    invoiceNumber: 'INV/20260515/001',
    date: '2026-05-15T11:00:00Z',
    items: [
      { medicineId: 'med-6', name: 'Minyak Kayu Putih Cap Lang 120ml', quantity: 3, price: 41000, total: 123000 },
    ],
    subtotal: 123000,
    discount: 10000,
    total: 113000,
    paymentMethod: 'ShopeePay',
    customerId: 'cust-2',
    customerName: 'Siti Rahma',
    cashierName: 'Apoteker Rina',
  },
  {
    id: 'sale-old-2',
    invoiceNumber: 'INV/20260520/001',
    date: '2026-05-20T16:30:00Z',
    items: [
      { medicineId: 'med-1', name: 'Paracetamol 500mg', quantity: 15, price: 5000, total: 75000 },
    ],
    subtotal: 75000,
    discount: 5000,
    total: 70000,
    paymentMethod: 'Cash',
    cashierName: 'Apoteker Rina',
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'dr. Ahmad Fauzi, Sp.A',
    specialization: 'Spesialis Anak',
    phone: '081299887766',
    scheduleHours: '08:00 - 13:00',
    dutyDays: ['Senin', 'Rabu', 'Jumat'],
    status: 'Aktif',
    gender: 'Laki-laki'
  },
  {
    id: 'doc-2',
    name: 'dr. Amalia Putri, Sp.PD',
    specialization: 'Spesialis Penyakit Dalam',
    phone: '085611223344',
    scheduleHours: '13:00 - 18:00',
    dutyDays: ['Selasa', 'Kamis', 'Sabtu'],
    status: 'Aktif',
    gender: 'Perempuan'
  },
  {
    id: 'doc-3',
    name: 'drg. Rian Hermawan',
    specialization: 'Dokter Gigi',
    phone: '087755443322',
    scheduleHours: '09:00 - 14:00',
    dutyDays: ['Senin', 'Selasa', 'Kamis'],
    status: 'Istirahat',
    gender: 'Laki-laki'
  },
  {
    id: 'doc-4',
    name: 'dr. Sarah Wijaya, Sp.KK',
    specialization: 'Spesialis Kulit & Kelamin',
    phone: '081122338899',
    scheduleHours: '15:00 - 20:00',
    dutyDays: ['Rabu', 'Jumat'],
    status: 'Libur',
    gender: 'Perempuan'
  }
];
