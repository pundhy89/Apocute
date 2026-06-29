import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit2, Trash2, Phone, Building, DollarSign, Calendar, Truck,
  CheckCircle, ArrowDownCircle, RefreshCw, X
} from 'lucide-react';
import { Supplier, StockInflow, Medicine } from '../types';
import { formatRupiah } from '../utils';

interface SalesSuppliersProps {
  suppliers: Supplier[];
  stockInflows: StockInflow[];
  medicines: Medicine[];
  onAddSupplier: (sup: Supplier) => void;
  onUpdateSupplier: (sup: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onPayDebt: (supplierId: string, amountToPay: number) => void;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function SalesSuppliers({
  suppliers,
  stockInflows,
  medicines,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onPayDebt,
  theme
}: SalesSuppliersProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Pay Debt states
  const [showPayDebtModal, setShowPayDebtModal] = useState(false);
  const [selectedSupplierForPayment, setSelectedSupplierForPayment] = useState<Supplier | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Form states
  const [supName, setSupName] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supDebt, setSupDebt] = useState('0');

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupName(sup.name);
    setSupCompany(sup.company);
    setSupPhone(sup.phone);
    setSupDebt(sup.debt.toString());
    setShowAddModal(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supCompany || !supPhone) {
      alert('Mohon lengkapi semua data wajib!');
      return;
    }

    const supplierData: Supplier = {
      id: editingSupplier ? editingSupplier.id : `sup-${Date.now()}`,
      name: supName,
      company: supCompany,
      phone: supPhone,
      debt: parseFloat(supDebt) || 0
    };

    if (editingSupplier) {
      onUpdateSupplier(supplierData);
    } else {
      onAddSupplier(supplierData);
    }

    closeModal();
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingSupplier(null);
    setSupName('');
    setSupCompany('');
    setSupPhone('');
    setSupDebt('0');
  };

  const handlePayDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPayment || !paymentAmount) return;

    const payVal = parseFloat(paymentAmount);
    if (payVal <= 0) {
      alert('Jumlah pembayaran harus lebih besar dari 0!');
      return;
    }

    if (payVal > selectedSupplierForPayment.debt) {
      alert(`Pembayaran melebihi sisa hutang Anda (${formatRupiah(selectedSupplierForPayment.debt)}).`);
      return;
    }

    onPayDebt(selectedSupplierForPayment.id, payVal);
    alert(`Pembayaran hutang sebesar ${formatRupiah(payVal)} ke sales ${selectedSupplierForPayment.name} berhasil dicatat.`);
    closePayDebtModal();
  };

  const closePayDebtModal = () => {
    setShowPayDebtModal(false);
    setSelectedSupplierForPayment(null);
    setPaymentAmount('');
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'lavender':
        return {
          primary: 'bg-indigo-600 hover:bg-indigo-700 text-indigo-50',
          accent: 'indigo',
          border: 'border-indigo-100',
          gradient: 'from-indigo-500 to-purple-600'
        };
      case 'minty':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50',
          accent: 'emerald',
          border: 'border-emerald-100',
          gradient: 'from-emerald-400 to-teal-600'
        };
      case 'ocean':
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-sky-50',
          accent: 'sky',
          border: 'border-sky-100',
          gradient: 'from-sky-400 to-blue-600'
        };
      case 'sunset':
        return {
          primary: 'bg-orange-500 hover:bg-orange-600 text-orange-50',
          accent: 'orange',
          border: 'border-orange-100',
          gradient: 'from-orange-400 to-amber-600'
        };
      case 'cherry':
        return {
          primary: 'bg-rose-500 hover:bg-rose-600 text-rose-50',
          accent: 'rose',
          border: 'border-rose-100',
          gradient: 'from-pink-400 to-rose-600'
        };
    }
  };

  const style = getThemeStyles();

  return (
    <div className="space-y-6">
      {/* Supplier Top panel */}
      <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">Manajemen Sales & Hutang Piutang</h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Kelola data kunjungan sales, tanggal pengiriman barang, dan sisa pembayaran hutang obat.</p>
        </div>
        <button
          id="add-supplier-btn"
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-bold text-xs shadow-md transition-all ${style.primary}`}
        >
          <Plus className="w-4 h-4" />
          Tambah Salesperson Baru
        </button>
      </div>

      {/* Grid of Suppliers with stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* List of suppliers */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-500" />
            Daftar Sales & Distributor Aktif
          </h4>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-4 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-200 transition-all bg-slate-50/20"
              >
                <div>
                  <h5 className="font-display font-bold text-slate-800 text-xs">{sup.name}</h5>
                  <p className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5 flex items-center gap-1">
                    <Building className="w-3 h-3" /> {sup.company}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold font-sans flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {sup.phone}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Sisa Hutang Nota</span>
                    <span className={`font-mono font-bold text-xs block ${sup.debt > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {formatRupiah(sup.debt)}
                    </span>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {sup.debt > 0 && (
                      <button
                        onClick={() => {
                          setSelectedSupplierForPayment(sup);
                          setShowPayDebtModal(true);
                        }}
                        className="py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-[10px] shadow-xs flex items-center gap-1"
                      >
                        <DollarSign className="w-3 h-3" /> Bayar
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(sup)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-150 text-slate-600 transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus sales ${sup.name}? Semua data hutang akan hilang.`)) {
                          onDeleteSupplier(sup.id);
                        }
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-300 hover:text-rose-600 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Delivery Logistics & Logs of arrivals */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-500 animate-pulse" />
            Riwayat Barang Datang & Pengiriman
          </h4>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {stockInflows.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <Truck className="w-8 h-8 stroke-1 text-slate-300" />
                <p className="text-xs font-semibold">Belum Ada Riwayat Kiriman</p>
              </div>
            ) : (
              stockInflows.map((inflow) => {
                const targetMed = medicines.find(m => m.id === inflow.medicineId);
                const targetSup = suppliers.find(s => s.id === inflow.supplierId);

                return (
                  <div key={inflow.id} className="p-3 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-display font-bold text-slate-800 block text-xs">
                          {targetMed ? targetMed.name : 'Produk Obat'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">
                          Dikirim oleh: <strong className="text-slate-600">{targetSup ? targetSup.name : 'Sales'}</strong>
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        inflow.paymentStatus === 'Lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {inflow.paymentStatus}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100/60">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(inflow.arrivalDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="font-mono">
                        Kuantitas: <strong className="text-slate-700">{inflow.quantity} Unit</strong>
                      </span>
                      <span className="font-mono font-bold text-slate-700">
                        Total: {formatRupiah(inflow.cost)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Add/Edit Salesperson Supplier */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className={`bg-gradient-to-r ${style.gradient} p-5 text-white flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-white/90" />
                  <span className="font-display font-bold text-sm">
                    {editingSupplier ? 'Ubah Informasi Sales' : 'Registrasi Sales Baru'}
                  </span>
                </div>
                <button onClick={closeModal} className="text-white/75 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSupplier} className="p-6 space-y-4 text-xs font-sans">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Salesperson *</label>
                  <input
                    id="supplier-name-input"
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="Contoh: Rian Wijaya"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Perusahaan / Distributor *</label>
                  <input
                    id="supplier-company-input"
                    type="text"
                    required
                    value={supCompany}
                    onChange={(e) => setSupCompany(e.target.value)}
                    placeholder="PT Indo Medika Distribusi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Telepon Sales *</label>
                  <input
                    id="supplier-phone-input"
                    type="tel"
                    required
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="0811xxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                  />
                </div>

                {/* Initial Debt */}
                {!editingSupplier && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo Hutang Awal (Opsional)</label>
                    <input
                      id="supplier-debt-input"
                      type="number"
                      value={supDebt}
                      onChange={(e) => setSupDebt(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-display font-semibold text-xs text-slate-600 transition-all text-center"
                  >
                    Batal
                  </button>
                  <button
                    id="save-supplier-submit-btn"
                    type="submit"
                    className={`flex-1 py-2.5 rounded-xl font-display font-bold text-xs shadow-md text-center transition-all ${style.primary}`}
                  >
                    Simpan Sales
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Pay Debt Form */}
      <AnimatePresence>
        {showPayDebtModal && selectedSupplierForPayment && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-amber-600 p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-white/90" />
                  <span className="font-display font-bold text-sm">Bayar Hutang Nota Obat</span>
                </div>
                <button onClick={closePayDebtModal} className="text-white/75 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePayDebtSubmit} className="p-6 space-y-4 text-xs font-sans">
                <div className="space-y-1.5 p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Sales & Distributor</span>
                  <span className="font-display font-bold text-slate-800 text-xs block">{selectedSupplierForPayment.name}</span>
                  <span className="text-[9px] text-slate-500 block font-semibold">{selectedSupplierForPayment.company}</span>
                  <div className="border-t border-amber-200/50 my-1.5" />
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Total Sisa Hutang Anda</span>
                  <span className="font-mono font-black text-amber-700 text-sm block">{formatRupiah(selectedSupplierForPayment.debt)}</span>
                </div>

                {/* Amount to pay */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Pembayaran Hutang (Rp) *</label>
                  <div className="relative">
                    <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">Rp</span>
                    <input
                      id="pay-amount-input"
                      type="number"
                      required
                      max={selectedSupplierForPayment.debt}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Masukkan nominal"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-4 text-xs text-slate-700 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closePayDebtModal}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-display font-semibold text-xs text-slate-600 transition-all text-center"
                  >
                    Batal
                  </button>
                  <button
                    id="pay-debt-submit-btn"
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-xs shadow-md text-center transition-all"
                  >
                    Simpan Pembayaran
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
