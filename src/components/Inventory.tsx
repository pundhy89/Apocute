import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit2, Trash2, AlertTriangle, Search, Package, Calendar, MapPin,
  DollarSign, FileText, Barcode, HelpCircle, Truck, UserCheck, X, CheckCircle
} from 'lucide-react';
import { Medicine, Supplier, StockInflow } from '../types';
import { formatRupiah } from '../utils';

interface InventoryProps {
  medicines: Medicine[];
  suppliers: Supplier[];
  stockInflows: StockInflow[];
  onAddMedicine: (med: Medicine) => void;
  onUpdateMedicine: (med: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
  onAddStockInflow: (inflow: StockInflow) => void;
  onUpdateSupplierDebt: (supplierId: string, amountToAdd: number) => void;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function Inventory({
  medicines,
  suppliers,
  stockInflows,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
  onAddStockInflow,
  onUpdateSupplierDebt,
  theme
}: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Scanner simulation states
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'add-med' | 'inflow-med' | null>(null);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.log('AudioContext not supported or blocked');
    }
  };

  // Incoming Stock (Barang Datang) State
  const [showInflowModal, setShowInflowModal] = useState(false);
  const [selectedMedForInflow, setSelectedMedForInflow] = useState('');
  const [selectedSupplierForInflow, setSelectedSupplierForInflow] = useState('');
  const [inflowQuantity, setInflowQuantity] = useState('');
  const [inflowCost, setInflowCost] = useState('');
  const [inflowArrivalDate, setInflowArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [inflowPaymentStatus, setInflowPaymentStatus] = useState<'Lunas' | 'Hutang'>('Lunas');

  // New Medicine form states
  const [medName, setMedName] = useState('');
  const [medCode, setMedCode] = useState('');
  const [medCategory, setMedCategory] = useState('Obat Bebas');
  const [medBuyPrice, setMedBuyPrice] = useState('');
  const [medSellPrice, setMedSellPrice] = useState('');
  const [medStock, setMedStock] = useState('');
  const [medMinStock, setMedMinStock] = useState('10');
  const [medExpiryDate, setMedExpiryDate] = useState('');
  const [medLocation, setMedLocation] = useState('');
  const [medSupplierId, setMedSupplierId] = useState('');

  // Categories list
  const CATEGORIES = ['Obat Bebas', 'Obat Keras', 'Vitamin & Suplemen', 'Herbal & Jamu', 'Alat Kesehatan'];

  // Filter medicines
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.includes(searchTerm);
    const matchesCategory = selectedCategory === 'Semua' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Open modal for editing
  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setMedName(med.name);
    setMedCode(med.code);
    setMedCategory(med.category);
    setMedBuyPrice(med.buyPrice.toString());
    setMedSellPrice(med.sellPrice.toString());
    setMedStock(med.stock.toString());
    setMedMinStock(med.minStock.toString());
    setMedExpiryDate(med.expiryDate);
    setMedLocation(med.location);
    setMedSupplierId(med.supplierId || '');
    setShowAddModal(true);
  };

  // Save new or edited medicine
  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medCode || !medBuyPrice || !medSellPrice || !medStock) {
      alert('Mohon lengkapi data wajib!');
      return;
    }

    const medData: Medicine = {
      id: editingMedicine ? editingMedicine.id : `med-${Date.now()}`,
      name: medName,
      code: medCode,
      category: medCategory,
      buyPrice: parseFloat(medBuyPrice),
      sellPrice: parseFloat(medSellPrice),
      stock: parseInt(medStock),
      minStock: parseInt(medMinStock),
      expiryDate: medExpiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: medLocation || 'Rak Utama',
      supplierId: medSupplierId || undefined
    };

    if (editingMedicine) {
      onUpdateMedicine(medData);
    } else {
      // Check duplicate barcode
      if (medicines.some(m => m.code === medCode)) {
        alert('Barcode ini sudah terdaftar pada obat lain!');
        return;
      }
      onAddMedicine(medData);
    }

    closeMedModal();
  };

  const closeMedModal = () => {
    setShowAddModal(false);
    setEditingMedicine(null);
    setMedName('');
    setMedCode('');
    setMedCategory('Obat Bebas');
    setMedBuyPrice('');
    setMedSellPrice('');
    setMedStock('');
    setMedMinStock('10');
    setMedExpiryDate('');
    setMedLocation('');
    setMedSupplierId('');
  };

  // Register Incoming Stock Delivery
  const handleRegisterInflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedForInflow || !selectedSupplierForInflow || !inflowQuantity || !inflowCost) {
      alert('Mohon lengkapi semua data barang datang!');
      return;
    }

    const qty = parseInt(inflowQuantity);
    const cost = parseFloat(inflowCost);

    const inflowRecord: StockInflow = {
      id: `inflow-${Date.now()}`,
      medicineId: selectedMedForInflow,
      supplierId: selectedSupplierForInflow,
      quantity: qty,
      arrivalDate: inflowArrivalDate,
      cost,
      paymentStatus: inflowPaymentStatus
    };

    // 1. Add record
    onAddStockInflow(inflowRecord);

    // 2. Add quantities to existing medicine stock
    const targetMed = medicines.find(m => m.id === selectedMedForInflow);
    if (targetMed) {
      onUpdateMedicine({
        ...targetMed,
        stock: targetMed.stock + qty,
        supplierId: selectedSupplierForInflow // bind supplier to this medicine
      });
    }

    // 3. Update debt (piutang) to sales supplier if paymentStatus is "Hutang"
    if (inflowPaymentStatus === 'Hutang') {
      onUpdateSupplierDebt(selectedSupplierForInflow, cost);
    }

    alert('Barang datang berhasil dicatat! Stok obat otomatis terupdate.');
    closeInflowModal();
  };

  const closeInflowModal = () => {
    setShowInflowModal(false);
    setSelectedMedForInflow('');
    setSelectedSupplierForInflow('');
    setInflowQuantity('');
    setInflowCost('');
    setInflowArrivalDate(new Date().toISOString().split('T')[0]);
    setInflowPaymentStatus('Lunas');
  };

  // Theme styling mapping
  const getThemeStyles = () => {
    switch (theme) {
      case 'lavender':
        return {
          primary: 'bg-indigo-600 hover:bg-indigo-700 text-indigo-50',
          accent: 'indigo',
          badge: 'bg-indigo-100 text-indigo-800',
          gradient: 'from-indigo-500 to-purple-600',
          btnLight: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600',
          border: 'border-indigo-100'
        };
      case 'minty':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50',
          accent: 'emerald',
          badge: 'bg-emerald-100 text-emerald-800',
          gradient: 'from-emerald-400 to-teal-600',
          btnLight: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600',
          border: 'border-emerald-100'
        };
      case 'ocean':
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-sky-50',
          accent: 'sky',
          badge: 'bg-sky-100 text-sky-800',
          gradient: 'from-sky-400 to-blue-600',
          btnLight: 'bg-sky-50 hover:bg-sky-100 text-sky-600',
          border: 'border-sky-100'
        };
      case 'sunset':
        return {
          primary: 'bg-orange-500 hover:bg-orange-600 text-orange-50',
          accent: 'orange',
          badge: 'bg-orange-100 text-orange-800',
          gradient: 'from-orange-400 to-amber-600',
          btnLight: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
          border: 'border-orange-100'
        };
      case 'cherry':
        return {
          primary: 'bg-rose-500 hover:bg-rose-600 text-rose-50',
          accent: 'rose',
          badge: 'bg-rose-100 text-rose-800',
          gradient: 'from-pink-400 to-rose-600',
          btnLight: 'bg-rose-50 hover:bg-rose-100 text-rose-600',
          border: 'border-rose-100'
        };
    }
  };

  const style = getThemeStyles();

  // Find low stock medicines
  const lowStockMedicines = medicines.filter(m => m.stock <= m.minStock);

  return (
    <div className="space-y-6">
      {/* Alert Panel for running low items */}
      {lowStockMedicines.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <h4 className="text-xs font-display font-bold text-amber-900">Perhatian: {lowStockMedicines.length} Obat Hampir Habis!</h4>
            <p className="text-[11px] text-amber-700 font-sans mt-0.5">Segera hubungi sales supplier masing-masing obat untuk memesan stok baru. Obat: {lowStockMedicines.map(m => m.name).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Main Filter & Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex gap-2 shrink-0">
          <button
            id="register-inflow-btn"
            onClick={() => setShowInflowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-semibold text-xs border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-xs"
          >
            <Truck className="w-4 h-4" />
            Catat Barang Datang (Sales)
          </button>
          <button
            id="add-medicine-btn"
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-bold text-xs shadow-md transition-all ${style.primary}`}
          >
            <Plus className="w-4 h-4" />
            Tambah Obat Baru
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari obat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl py-2 pl-9 pr-4 text-xs font-sans focus:outline-none focus:border-indigo-500 w-full sm:w-44"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-2xl py-2 px-3 text-xs font-semibold focus:outline-none text-slate-700"
          >
            <option value="Semua">Semua Kategori</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-800 text-md">Daftar Manajemen Stok Real-Time</h3>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">Real-Time Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50/55 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider text-[9px]">
                <th className="p-4">Obat & Kategori</th>
                <th className="p-4">Kode Barcode</th>
                <th className="p-4">Harga Beli / Jual</th>
                <th className="p-4 text-center">Stok</th>
                <th className="p-4">Kedaluwarsa</th>
                <th className="p-4">Lokasi Rak</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredMedicines.map((med) => {
                const isLowStock = med.stock <= med.minStock;
                const isExpiryNear = new Date(med.expiryDate).getTime() - Date.now() < (90 * 24 * 60 * 60 * 1000); // 3 months
                const supplier = suppliers.find(s => s.id === med.supplierId);

                return (
                  <tr key={med.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-display font-bold text-slate-800 block text-xs">{med.name}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{med.category}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5 text-slate-400" />
                        {med.code}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="text-slate-400 block text-[9px]">Beli: {formatRupiah(med.buyPrice)}</span>
                        <span className="font-semibold text-slate-700 block mt-0.5">Jual: {formatRupiah(med.sellPrice)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-block">
                        <span className={`px-2 py-1 rounded-lg text-xs font-mono font-bold block ${
                          isLowStock
                            ? 'bg-rose-50 text-rose-600 border border-rose-100/60'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100/60'
                        }`}>
                          {med.stock} Unit
                        </span>
                        {supplier && (
                          <span className="text-[8px] text-slate-400 block mt-0.5 truncate max-w-[100px]">{supplier.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className={`w-3.5 h-3.5 ${isExpiryNear ? 'text-rose-500' : 'text-slate-400'}`} />
                        <span className={isExpiryNear ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {new Date(med.expiryDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[10px]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {med.location}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="p-1.5 rounded-lg border border-slate-150 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus ${med.name}?`)) {
                              onDeleteMedicine(med.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-150 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL A: Add/Edit Medicine */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className={`bg-gradient-to-r ${style.gradient} p-5 text-white flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-white/90" />
                  <span className="font-display font-bold text-sm">
                    {editingMedicine ? 'Ubah Informasi Obat' : 'Tambah Obat Baru'}
                  </span>
                </div>
                <button onClick={closeMedModal} className="text-white/75 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMedicine} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Obat *</label>
                    <input
                      id="med-name-input"
                      type="text"
                      required
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder="Contoh: Paracetamol 500mg"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
                    />
                  </div>

                  {/* Barcode & Category */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kode Barcode *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setScannerTarget('add-med');
                          setScannerActive(true);
                        }}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Barcode className="w-3.5 h-3.5" />
                        <span>Scan Barcode</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="med-barcode-input"
                        type="text"
                        required
                        value={medCode}
                        onChange={(e) => setMedCode(e.target.value)}
                        placeholder="Barcode 13 Digit"
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Obat</label>
                    <select
                      value={medCategory}
                      onChange={(e) => setMedCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700 font-semibold"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Buying / Selling Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harga Beli (Rp) *</label>
                    <input
                      id="med-buy-price-input"
                      type="number"
                      required
                      value={medBuyPrice}
                      onChange={(e) => setMedBuyPrice(e.target.value)}
                      placeholder="Harga dari Sales"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harga Jual (Rp) *</label>
                    <input
                      id="med-sell-price-input"
                      type="number"
                      required
                      value={medSellPrice}
                      onChange={(e) => setMedSellPrice(e.target.value)}
                      placeholder="Harga ke Pelanggan"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700 font-bold"
                    />
                  </div>

                  {/* Stock & Minimum warning */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stok Awal *</label>
                    <input
                      id="med-stock-input"
                      type="number"
                      required
                      value={medStock}
                      onChange={(e) => setMedStock(e.target.value)}
                      placeholder="Jumlah stok"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Minimal Pengingat Stok</label>
                    <input
                      id="med-min-stock-input"
                      type="number"
                      value={medMinStock}
                      onChange={(e) => setMedMinStock(e.target.value)}
                      placeholder="10"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                    />
                  </div>

                  {/* Expiry, Location, Supplier */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Kedaluwarsa</label>
                    <input
                      id="med-expiry-input"
                      type="date"
                      value={medExpiryDate}
                      onChange={(e) => setMedExpiryDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700 font-mono font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi Rak Obat</label>
                    <input
                      id="med-location-input"
                      type="text"
                      value={medLocation}
                      onChange={(e) => setMedLocation(e.target.value)}
                      placeholder="Contoh: Rak A-2"
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Sales Supplier (Opsional)</label>
                    <select
                      value={medSupplierId}
                      onChange={(e) => setMedSupplierId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-700"
                    >
                      <option value="">-- Hubungkan Sales Supplier --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.company})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeMedModal}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-display font-semibold text-xs text-slate-600 transition-all text-center"
                  >
                    Batal
                  </button>
                  <button
                    id="save-med-submit-btn"
                    type="submit"
                    className={`flex-1 py-2.5 rounded-xl font-display font-bold text-xs shadow-md text-center transition-all ${style.primary}`}
                  >
                    Simpan Obat
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL B: Incoming Stock (Barang Datang) */}
      <AnimatePresence>
        {showInflowModal && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-indigo-900 p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-white/90 animate-pulse" />
                  <span className="font-display font-bold text-sm">Registrasi Barang Datang & Hutang Sales</span>
                </div>
                <button onClick={closeInflowModal} className="text-white/75 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterInflow} className="p-6 space-y-4 font-sans text-xs">
                {/* 1. Select Medicine */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Obat yang Datang *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setScannerTarget('inflow-med');
                        setScannerActive(true);
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Barcode className="w-3.5 h-3.5" />
                      <span>Scan Paket Obat</span>
                    </button>
                  </div>
                  <select
                    required
                    value={selectedMedForInflow}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMedForInflow(val);
                      const targetMed = medicines.find(m => m.id === val);
                      if (targetMed) {
                        if (targetMed.supplierId) {
                          setSelectedSupplierForInflow(targetMed.supplierId);
                        }
                        const qty = inflowQuantity ? parseInt(inflowQuantity) : 10;
                        if (!inflowQuantity) setInflowQuantity('10');
                        setInflowCost((targetMed.buyPrice * qty).toString());
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Pilih Obat --</option>
                    {medicines.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (Stok saat ini: {m.stock})</option>
                    ))}
                  </select>
                </div>

                {/* 2. Select Supplier/Sales */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengirim / Salesperson *</label>
                  <select
                    required
                    value={selectedSupplierForInflow}
                    onChange={(e) => setSelectedSupplierForInflow(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Pilih Sales Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {s.company}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Quantity Inflow */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Datang (Unit) *</label>
                    <input
                      id="inflow-qty-input"
                      type="number"
                      required
                      min="1"
                      value={inflowQuantity}
                      onChange={(e) => {
                        const qtyStr = e.target.value;
                        setInflowQuantity(qtyStr);
                        const targetMed = medicines.find(m => m.id === selectedMedForInflow);
                        if (targetMed && qtyStr) {
                          setInflowCost((targetMed.buyPrice * parseInt(qtyStr)).toString());
                        }
                      }}
                      placeholder="Masukkan kuantitas"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Cost Inflow */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Nominal Nota (Rp) *</label>
                    <input
                      id="inflow-cost-input"
                      type="number"
                      required
                      value={inflowCost}
                      onChange={(e) => setInflowCost(e.target.value)}
                      placeholder="Total harga kulakan"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Arrival Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Datang</label>
                    <input
                      id="inflow-date-input"
                      type="date"
                      value={inflowArrivalDate}
                      onChange={(e) => setInflowArrivalDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-mono font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Payment Status (Cash / Debt) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Pembayaran Nota</label>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setInflowPaymentStatus('Lunas')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-display font-bold border transition-all text-center ${
                          inflowPaymentStatus === 'Lunas'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Lunas
                      </button>
                      <button
                        type="button"
                        onClick={() => setInflowPaymentStatus('Hutang')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-display font-bold border transition-all text-center ${
                          inflowPaymentStatus === 'Hutang'
                            ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Hutang Sales
                      </button>
                    </div>
                  </div>
                </div>

                {inflowPaymentStatus === 'Hutang' && selectedSupplierForInflow && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/50 text-[10px] text-amber-800 font-semibold">
                    * Perhatian: Total nominal nota ({formatRupiah(parseFloat(inflowCost) || 0)}) otomatis akan ditambahkan ke catatan Hutang Piutang Apotek Anda kepada sales supplier yang dipilih.
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeInflowModal}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-display font-semibold text-xs text-slate-600 transition-all text-center"
                  >
                    Batal
                  </button>
                  <button
                    id="save-inflow-submit-btn"
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-950 text-white font-display font-bold text-xs shadow-md hover:bg-slate-800 text-center transition-all"
                  >
                    Catat Barang Datang
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* simulated barcode scanner modal */}
      <AnimatePresence>
        {scannerActive && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-center space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Barcode className="w-5 h-5 animate-pulse" />
                  <span className="font-display font-bold text-sm text-slate-100">Smart Camera Barcode Scanner</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setScannerActive(false);
                    setScannerTarget(null);
                  }}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewfinder simulation */}
              <div className="relative aspect-video rounded-2xl bg-black border-2 border-slate-800 overflow-hidden flex items-center justify-center">
                {/* Simulated camera grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
                
                {/* Laser scan line */}
                <motion.div 
                  animate={{ y: [-60, 60] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute left-4 right-4 h-0.5 bg-rose-500 shadow-lg shadow-rose-500/50 z-10"
                />

                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-md" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-md" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-md" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-md" />

                {/* Content based on scan target */}
                {scannerTarget === 'add-med' ? (
                  <div className="space-y-3 z-10 p-4">
                    <p className="text-[11px] text-slate-300 font-medium">Dekatkan barcode produk obat ke area kamera...</p>
                    <div className="inline-flex gap-2 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                      <div className="w-16 h-8 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-[10px] font-mono text-slate-400">
                        [ |||||| ]
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const randomCode = '899' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
                          setMedCode(randomCode);
                          playBeep();
                          setScanSuccessMessage(`Scanned: ${randomCode}`);
                          setTimeout(() => {
                            setScanSuccessMessage('');
                            setScannerActive(false);
                            setScannerTarget(null);
                          }, 1200);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] cursor-pointer"
                      >
                        Pindai Barcode Acak
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 z-10 p-4 w-full">
                    <p className="text-[11px] text-slate-300 font-medium font-sans">Pilih kemasan obat yang datang untuk dipindai:</p>
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                      {medicines.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedMedForInflow(m.id);
                            if (m.supplierId) {
                              setSelectedSupplierForInflow(m.supplierId);
                            }
                            const qty = inflowQuantity ? parseInt(inflowQuantity) : 10;
                            if (!inflowQuantity) {
                              setInflowQuantity('10');
                            }
                            setInflowCost((m.buyPrice * qty).toString());
                            
                            playBeep();
                            setScanSuccessMessage(`Scanned: ${m.name}`);
                            setTimeout(() => {
                              setScanSuccessMessage('');
                              setScannerActive(false);
                              setScannerTarget(null);
                            }, 1200);
                          }}
                          className="p-2 bg-slate-950/80 hover:bg-indigo-950 hover:border-indigo-500/50 border border-slate-800 rounded-xl text-left flex flex-col gap-0.5 cursor-pointer transition-all"
                        >
                          <span className="font-bold text-[10px] text-slate-200 truncate">{m.name}</span>
                          <span className="text-[8px] text-slate-500 font-mono">{m.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {scanSuccessMessage && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center z-20 space-y-2 text-emerald-300"
                  >
                    <CheckCircle className="w-8 h-8 animate-bounce text-emerald-400" />
                    <span className="font-bold text-xs">Pindaian Berhasil!</span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">{scanSuccessMessage}</span>
                  </motion.div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Fitur ini mensimulasikan pembaca barcode laser pintar apotek. Pada perangkat fisik, alat scanner akan otomatis membaca input tanpa perlu mengetik kode secara manual.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
