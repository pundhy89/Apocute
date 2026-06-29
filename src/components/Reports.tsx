import React, { useState } from 'react';
import {
  TrendingUp, DollarSign, ShoppingCart, Award, ArrowUpRight,
  BarChart2, Calendar, FileText, CheckCircle
} from 'lucide-react';
import { Sale, Medicine, Supplier } from '../types';
import { formatRupiah } from '../utils';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Cell, Legend, PieChart, Pie
} from 'recharts';

interface ReportsProps {
  salesHistory: Sale[];
  medicines: Medicine[];
  suppliers: Supplier[];
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function Reports({ salesHistory, medicines, suppliers, theme }: ReportsProps) {
  const [reportScope, setReportScope] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Filter helper based on scopes
  const getFilteredSales = () => {
    const now = new Date();
    return salesHistory.filter((s) => {
      const saleDate = new Date(s.date);
      const diffMs = now.getTime() - saleDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (reportScope === 'daily') {
        // Today's sales
        return diffDays <= 1;
      } else if (reportScope === 'weekly') {
        // Last 7 days
        return diffDays <= 7;
      } else {
        // Last 30 days
        return diffDays <= 30;
      }
    });
  };

  const activeSales = getFilteredSales();

  // Calculate metrics
  const totalRevenue = activeSales.reduce((acc, curr) => acc + curr.total, 0);
  
  // Calculate profits based on buying prices
  const totalProfit = activeSales.reduce((acc, curr) => {
    const saleProfit = curr.items.reduce((itemAcc, item) => {
      const med = medicines.find(m => m.id === item.medicineId);
      const buyPrice = med ? med.buyPrice : item.price * 0.7; // default 30% margin fallback
      const costOfItem = buyPrice * item.quantity;
      const profit = item.total - costOfItem;
      return itemAcc + profit;
    }, 0);
    return acc + (saleProfit - curr.discount);
  }, 0);

  const avgBasketSize = activeSales.length > 0 ? Math.round(totalRevenue / activeSales.length) : 0;
  const totalSalesCount = activeSales.length;

  // Prepare chart data: Sales Trend
  const getSalesTrendData = () => {
    // Group by date
    const grouped: { [key: string]: { date: string; omset: number; profit: number } } = {};
    activeSales.forEach(sale => {
      const dateStr = new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (!grouped[dateStr]) {
        grouped[dateStr] = { date: dateStr, omset: 0, profit: 0 };
      }
      grouped[dateStr].omset += sale.total;

      // Profit for this sale
      const saleProfit = sale.items.reduce((acc, item) => {
        const med = medicines.find(m => m.id === item.medicineId);
        const buyPrice = med ? med.buyPrice : item.price * 0.7;
        return acc + (item.total - (buyPrice * item.quantity));
      }, 0) - sale.discount;

      grouped[dateStr].profit += Math.max(0, saleProfit);
    });

    return Object.values(grouped).reverse();
  };

  const salesTrendData = getSalesTrendData();

  // Prepare chart data: Category Popularity
  const getCategoryData = () => {
    const counts: { [key: string]: number } = {};
    activeSales.forEach(sale => {
      sale.items.forEach(it => {
        const med = medicines.find(m => m.id === it.medicineId);
        const cat = med ? med.category : 'Lain-lain';
        counts[cat] = (counts[cat] || 0) + it.quantity;
      });
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const categoryData = getCategoryData();

  // Theme colors for visual charts
  const getThemePalette = () => {
    switch (theme) {
      case 'lavender': return ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#14b8a6'];
      case 'minty': return ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#ec4899'];
      case 'ocean': return ['#0284c7', '#3b82f6', '#6366f1', '#10b981', '#06b6d4'];
      case 'sunset': return ['#f97316', '#eab308', '#f43f5e', '#a855f7', '#3b82f6'];
      case 'cherry': return ['#ec4899', '#f43f5e', '#a855f7', '#06b6d4', '#f97316'];
    }
  };

  const palette = getThemePalette();

  const getThemeStyles = () => {
    switch (theme) {
      case 'lavender':
        return {
          primary: 'bg-indigo-600 hover:bg-indigo-700 text-indigo-50',
          accent: 'indigo',
          border: 'border-indigo-100',
          gradient: 'from-indigo-500 to-purple-600',
          lightBg: 'bg-indigo-50/20'
        };
      case 'minty':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50',
          accent: 'emerald',
          border: 'border-emerald-100',
          gradient: 'from-emerald-400 to-teal-600',
          lightBg: 'bg-emerald-50/20'
        };
      case 'ocean':
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-sky-50',
          accent: 'sky',
          border: 'border-sky-100',
          gradient: 'from-sky-400 to-blue-600',
          lightBg: 'bg-sky-50/20'
        };
      case 'sunset':
        return {
          primary: 'bg-orange-500 hover:bg-orange-600 text-orange-50',
          accent: 'orange',
          border: 'border-orange-100',
          gradient: 'from-orange-400 to-amber-600',
          lightBg: 'bg-orange-50/20'
        };
      case 'cherry':
        return {
          primary: 'bg-rose-500 hover:bg-rose-600 text-rose-50',
          accent: 'rose',
          border: 'border-rose-100',
          gradient: 'from-pink-400 to-rose-600',
          lightBg: 'bg-rose-50/20'
        };
    }
  };

  const style = getThemeStyles();

  // Debt total
  const totalDebt = suppliers.reduce((acc, curr) => acc + curr.debt, 0);

  return (
    <div className="space-y-6">
      {/* Scope Toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">Laporan Penjualan Otomatis</h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Analisis omset keuangan, laba bersih apotek, dan tingkat popularitas produk.</p>
        </div>

        <div className="bg-slate-50 p-1 rounded-2xl border border-slate-150 flex gap-1">
          {(['daily', 'weekly', 'monthly'] as const).map((scope) => (
            <button
              key={scope}
              onClick={() => setReportScope(scope)}
              className={`py-1.5 px-4 rounded-xl font-display font-bold text-xs capitalize transition-all ${
                reportScope === scope
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {scope === 'daily' ? 'Harian' : scope === 'weekly' ? 'Mingguan' : 'Bulanan'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Omset</span>
            <span className="font-display font-black text-slate-800 text-base block">{formatRupiah(totalRevenue)}</span>
            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +12.4% vs kemarin
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Laba Bersih</span>
            <span className="font-display font-black text-emerald-600 text-base block">{formatRupiah(totalProfit)}</span>
            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +8.2% margin profit
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Rata-rata Basket */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rata-rata Nota</span>
            <span className="font-display font-black text-slate-800 text-base block">{formatRupiah(avgBasketSize)}</span>
            <span className="text-[9px] text-slate-400 block font-semibold font-sans">Per kunjungan kasir</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* Transaksi Penjualan */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah Nota</span>
            <span className="font-display font-black text-slate-800 text-base block">{totalSalesCount} Nota</span>
            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 font-sans">
              <CheckCircle className="w-3 h-3" /> 100% sukses
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Graphs section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Grafik Omset & Keuntungan Bersih
          </h4>

          <div className="h-64">
            {salesTrendData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                Belum ada transaksi di periode ini.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="omsetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `Rp ${v/1000}k`} />
                  <Tooltip formatter={(v: any) => formatRupiah(v)} contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="omset" name="Total Omset" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#omsetGrad)" />
                  <Area type="monotone" dataKey="profit" name="Laba Bersih" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Categories Bar chart */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            Kategori Paling Laris
          </h4>

          <div className="h-64">
            {categoryData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                Belum ada data barang terjual.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Bar dataKey="value" name="Kuantitas (Unit)" radius={[0, 8, 8, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Credit / Supplier Liability visual metrics */}
      <div className="p-5 bg-white border border-slate-100 rounded-3xl grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <h4 className="text-xs font-display font-bold text-slate-800">Analisis Hutang Apotek Ke Sales Supplier</h4>
          <p className="text-[11px] text-slate-500 font-sans leading-relaxed">Periksa rasio total kewajiban hutang apotek yang belum terselesaikan. Melunasi hutang tepat waktu menjaga hubungan logistik distribusi obat tetap prima.</p>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
          <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block">Total Hutang Berjalan</span>
          <span className="font-mono font-black text-amber-700 text-lg block mt-0.5">{formatRupiah(totalDebt)}</span>
          <span className="text-[9px] text-slate-400 block mt-1 font-sans">Dari {suppliers.filter(s => s.debt > 0).length} salesperson distributor</span>
        </div>
      </div>
    </div>
  );
}
