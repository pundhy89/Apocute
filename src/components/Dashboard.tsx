import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles, Clock, AlertTriangle, Users, Receipt, Package, Stethoscope, ArrowRight,
  TrendingUp, Activity, ShieldCheck, Heart, ArrowUpRight, DollarSign, ArrowDownRight
} from 'lucide-react';
import { Medicine, Customer, Sale, Doctor, Employee, AppSettings } from '../types';
import { formatRupiah } from '../utils';

interface DashboardProps {
  medicines: Medicine[];
  customers: Customer[];
  salesHistory: Sale[];
  doctors: Doctor[];
  activeEmployee: Employee;
  settings: AppSettings;
  setActiveTab: (tab: any) => void;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function Dashboard({
  medicines,
  customers,
  salesHistory,
  doctors,
  activeEmployee,
  settings,
  setActiveTab,
  theme
}: DashboardProps) {
  const [greeting, setGreeting] = useState('Selamat Datang');
  const [tipIndex, setTipIndex] = useState(0);

  // Health and business tip lists to show in rotating display
  const tips = [
    'ApoCute Tip: Berikan senyum ramah 3 detik saat menyapa pasien di kasir.',
    'ApoCute Tip: Pastikan obat dengan masa kedaluwarsa terdekat diletakkan di barisan paling depan (Sistem FEFO).',
    'ApoCute Tip: Selalu tanyakan nomor WA pelanggan setia untuk mengumpulkan poin loyalty!',
    'ApoCute Tip: Lakukan rekapitulasi pengeluaran operasional setiap sore hari demi akurasi keuangan apotek.',
    'ApoCute Tip: Cek status jaringan WhatsApp secara berkala untuk pengiriman struk digital tanpa hambatan.'
  ];

  useEffect(() => {
    // 1. Calculate greeting based on hour
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setGreeting('Selamat Pagi 🌅');
    else if (hour >= 11 && hour < 15) setGreeting('Selamat Siang ☀️');
    else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore 🌆');
    else setGreeting('Selamat Malam 🌙');

    // 2. Rotate tip of the day every 8 seconds
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Calculate statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = salesHistory.filter(s => s.date.startsWith(todayStr));
  const todayOmset = todaySales.reduce((acc, curr) => acc + curr.total, 0);
  const todayTransactionsCount = todaySales.length;

  const lowStockMedicines = medicines.filter(m => m.stock <= m.minStock);
  const lowStockCount = lowStockMedicines.length;

  const activeDoctors = doctors.filter(d => d.status === 'Aktif');

  // Load finance transactions to calculate total cash profit/loss context for the dashboard
  const [financeTransactions, setFinanceTransactions] = useState<any[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('apocute_finance_transactions');
      if (stored) {
        setFinanceTransactions(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const totalFinanceIncome = financeTransactions.filter(t => t.type === 'Pemasukan').reduce((acc, curr) => acc + curr.amount, 0);
  const totalFinanceExpense = financeTransactions.filter(t => t.type === 'Pengeluaran').reduce((acc, curr) => acc + curr.amount, 0);
  const totalNetFinance = totalFinanceIncome - totalFinanceExpense;

  // Theme setup
  const themeStyles = {
    lavender: {
      accent: 'border-indigo-100 bg-indigo-50/40 text-indigo-700',
      textAccent: 'text-indigo-600',
      welcomeCard: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
      btnAccent: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      glow: 'shadow-indigo-100'
    },
    minty: {
      accent: 'border-emerald-100 bg-emerald-50/40 text-emerald-700',
      textAccent: 'text-emerald-600',
      welcomeCard: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500',
      btnAccent: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      glow: 'shadow-emerald-100'
    },
    ocean: {
      accent: 'border-sky-100 bg-sky-50/40 text-sky-700',
      textAccent: 'text-sky-600',
      welcomeCard: 'bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500',
      btnAccent: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
      glow: 'shadow-sky-100'
    },
    sunset: {
      accent: 'border-amber-100 bg-amber-50/40 text-amber-700',
      textAccent: 'text-amber-600',
      welcomeCard: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500',
      btnAccent: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
      glow: 'shadow-amber-100'
    },
    cherry: {
      accent: 'border-rose-100 bg-rose-50/40 text-rose-700',
      textAccent: 'text-rose-600',
      welcomeCard: 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-500',
      btnAccent: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
      glow: 'shadow-rose-100'
    }
  }[theme];

  return (
    <div className="space-y-6">
      
      {/* 1. Welcome Card Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-[32px] text-white ${themeStyles.welcomeCard} relative overflow-hidden shadow-lg ${themeStyles.glow}`}
      >
        {/* Absolute Background Ornaments */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl transform translate-x-20 -translate-y-10" />
        <div className="absolute left-1/3 bottom-0 w-44 h-44 bg-white/5 rounded-full blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
                ApoCute Workspace v3.1
              </span>
            </div>
            
            <h2 className="font-display font-black text-2xl tracking-tight leading-none">
              {greeting}, {activeEmployee.username}! 🌟
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-lg leading-relaxed">
              Anda masuk sebagai <span className="font-bold underline">{activeEmployee.role}</span>. Mari tingkatkan pelayanan prima, jaga kesehatan diri, dan layani setiap pasien dengan sepenuh hati hari ini.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-xs text-white/95 max-w-xs flex items-start gap-2 h-auto md:h-20 justify-center flex-col shadow-inner">
            <span className="text-[9px] font-bold uppercase text-yellow-200 tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 animate-pulse" /> TIP HARI INI
            </span>
            <p className="font-semibold text-[11px] leading-tight transition-all duration-500 italic">
              "{tips[tipIndex]}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. Primary Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stats Card 1: Today Cashier Sales */}
        <div className="bg-white p-5 rounded-[28px] border border-slate-150 shadow-3xs flex items-center justify-between relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kasir Hari Ini</span>
            <h3 className="font-display font-black text-lg text-slate-800 leading-none">{formatRupiah(todayOmset)}</h3>
            <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {todayTransactionsCount} Transaksi Selesai
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Stats Card 2: Total Active Customers */}
        <div className="bg-white p-5 rounded-[28px] border border-slate-150 shadow-3xs flex items-center justify-between relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pelanggan Pasien</span>
            <h3 className="font-display font-black text-lg text-slate-800 leading-none">{customers.length} Orang</h3>
            <p className="text-[9px] text-slate-400 mt-1 font-mono font-bold">
              {customers.filter(c => c.points > 100).length} Pasien VIP Loyalty
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Stats Card 3: Low Stock Warning */}
        <div className={`bg-white p-5 rounded-[28px] border shadow-3xs flex items-center justify-between relative overflow-hidden group transition-all ${
          lowStockCount > 0 ? 'border-rose-200 bg-rose-50/20 hover:border-rose-400' : 'border-slate-150 hover:border-amber-300'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kritis / Habis</span>
            <h3 className={`font-display font-black text-lg leading-none ${lowStockCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
              {lowStockCount} Obat
            </h3>
            <p className={`text-[9px] mt-1 font-mono font-bold ${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              {lowStockCount > 0 ? 'Segera Restock Produk!' : 'Stok Aman Terkendali'}
            </p>
          </div>
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
            lowStockCount > 0 ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Stats Card 4: Doctors Active */}
        <div className="bg-white p-5 rounded-[28px] border border-slate-150 shadow-3xs flex items-center justify-between relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dokter Jaga</span>
            <h3 className="font-display font-black text-lg text-slate-800 leading-none">{activeDoctors.length} Dokter</h3>
            <p className="text-[9px] text-slate-400 mt-1 font-mono font-bold">
              {doctors.length} Total Mitra Terdaftar
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. Quick Actions & Quick Finance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Quick Actions Panel */}
        <div className="bg-white p-5 rounded-[32px] border border-slate-150 shadow-sm space-y-4">
          <h4 className="font-display font-black text-xs uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-500" />
            Akses Pintas Cepat (Quick Access)
          </h4>

          <div className="grid grid-cols-1 gap-2.5">
            
            {/* Quick Action 1: POS Cashier */}
            <button
              onClick={() => setActiveTab('pos')}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-2xl flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Receipt className="w-4.5 h-4.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-800 text-xs block leading-none">Kasir Kas Utama</span>
                  <span className="text-[9px] text-slate-400 mt-1 block">Buka POS Penjualan Obat</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Quick Action 2: Finance Trans */}
            <button
              onClick={() => setActiveTab('transactions')}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-2xl flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <DollarSign className="w-4.5 h-4.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-800 text-xs block leading-none">Keuangan Transaksi</span>
                  <span className="text-[9px] text-slate-400 mt-1 block">Catat Pemasukan & Pengeluaran</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Quick Action 3: Database Inventory */}
            <button
              onClick={() => setActiveTab('inventory')}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-2xl flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Package className="w-4.5 h-4.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-800 text-xs block leading-none">Stok Inventori</span>
                  <span className="text-[9px] text-slate-400 mt-1 block">Kelola Database Obat Apotek</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Quick Action 4: Doctor slider */}
            <button
              onClick={() => setActiveTab('doctors')}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-2xl flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <Stethoscope className="w-4.5 h-4.5" />
                </span>
                <div>
                  <span className="font-bold text-slate-800 text-xs block leading-none">Jadwal Jaga Dokter</span>
                  <span className="text-[9px] text-slate-400 mt-1 block">Atur Dokter Mitra Aktif</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </button>

          </div>
        </div>

        {/* Right 2 columns: Critical Low Stock and Quick Financial Chart Balance */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Financial Balance Summary */}
          <div className="bg-white p-5 rounded-[32px] border border-slate-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-black text-xs uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Tinjauan Keuangan Buku Kas
              </h4>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Buku Kas Lengkap <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-emerald-50/40 border border-emerald-100/60 rounded-2xl">
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest block">Omset Kasir + Pemasukan</span>
                <span className="font-display font-black text-base text-emerald-800 block mt-1">
                  {formatRupiah(todayOmset + totalFinanceIncome)}
                </span>
              </div>

              <div className="p-4 bg-rose-50/40 border border-rose-100/60 rounded-2xl">
                <span className="text-[9px] font-bold text-rose-700 uppercase tracking-widest block">Pengeluaran Kas</span>
                <span className="font-display font-black text-base text-rose-800 block mt-1">
                  {formatRupiah(totalFinanceExpense)}
                </span>
              </div>

              <div className="p-4 bg-indigo-50/40 border border-indigo-100/60 rounded-2xl">
                <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-widest block">Arus Bersih</span>
                <span className={`font-display font-black text-base block mt-1 ${
                  (todayOmset + totalNetFinance) >= 0 ? 'text-indigo-800' : 'text-rose-600'
                }`}>
                  {formatRupiah(todayOmset + totalNetFinance)}
                </span>
              </div>
            </div>

            {/* Custom pure HTML/CSS cute progress bar diagram for visually representing the P&L */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Rasio Pemasukan vs Pengeluaran</span>
                <span>{(todayOmset + totalFinanceIncome) > 0 ? Math.round(((todayOmset + totalFinanceIncome) / (todayOmset + totalFinanceIncome + totalFinanceExpense || 1)) * 100) : 0}% Pemasukan</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${(todayOmset + totalFinanceIncome) > 0 ? ((todayOmset + totalFinanceIncome) / (todayOmset + totalFinanceIncome + totalFinanceExpense || 1)) * 100 : 50}%` }}
                />
                <div 
                  className="bg-rose-400 h-full transition-all duration-500" 
                  style={{ width: `${(totalFinanceExpense) > 0 ? (totalFinanceExpense / (todayOmset + totalFinanceIncome + totalFinanceExpense || 1)) * 100 : 50}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Pemasukan & Penjualan</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Pengeluaran Kas</span>
              </div>
            </div>
          </div>

          {/* Section: Critical Stock Alert Carousel List */}
          <div className="bg-white p-5 rounded-[32px] border border-slate-150 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-black text-xs uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-rose-500 animate-pulse" />
                Alert Peringatan Stok Kritis ({lowStockCount})
              </h4>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-[10px] font-bold text-indigo-600 hover:underline"
              >
                Atur Database Stok
              </button>
            </div>

            {lowStockCount === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <p className="font-semibold text-slate-600">Semua stok obat aman!</p>
                <p className="text-[10px]">Seluruh item berada di atas batas safety threshold.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {lowStockMedicines.slice(0, 4).map((med) => {
                  const percent = Math.min(100, Math.round((med.stock / (med.minStock || 1)) * 100));
                  return (
                    <div key={med.id} className="p-3 border border-rose-100 hover:border-rose-200 bg-rose-50/20 rounded-2xl flex items-center justify-between gap-4 transition-all">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs truncate block">{med.name}</span>
                          <span className="text-[8px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-mono font-bold uppercase">Kritis</span>
                        </div>
                        
                        {/* Progress Bar of Stock */}
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${med.stock === 0 ? 'bg-red-600' : 'bg-rose-500'}`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono font-black text-slate-500">
                            Stok: <span className={med.stock === 0 ? 'text-red-600 font-bold' : 'text-rose-600 font-bold'}>{med.stock}</span> / {med.minStock} min
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('inventory')}
                        className="py-1 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-indigo-400 text-[10px] font-bold rounded-xl shadow-4xs transition-all shrink-0"
                      >
                        Restock
                      </button>
                    </div>
                  );
                })}
                {lowStockCount > 4 && (
                  <p className="text-center text-[10px] text-slate-400 font-semibold pt-1">
                    + {lowStockCount - 4} produk obat kritis lainnya. Buka stok inventori untuk melihat seluruh daftar.
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
