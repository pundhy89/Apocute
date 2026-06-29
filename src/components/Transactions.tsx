import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit2, Trash2, Calendar, FileText, DollarSign, ArrowDownCircle, ArrowUpCircle,
  Tag, Folder, Box, PlusCircle, Filter, RefreshCw, Printer, X, Bluetooth, Check, Search, TrendingUp, TrendingDown
} from 'lucide-react';
import { FinanceTransaction, Sale, AppSettings } from '../types';
import { formatRupiah } from '../utils';

interface TransactionsProps {
  salesHistory: Sale[];
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
  settings: AppSettings;
}

// Preseeded categories structure
interface CategoryTree {
  id: string;
  name: string;
  type: 'Pemasukan' | 'Pengeluaran';
  subCategories: {
    id: string;
    name: string;
    items: string[];
  }[];
}

const DEFAULT_CATEGORIES: CategoryTree[] = [
  {
    id: 'cat_operasional_in',
    name: 'Operasional Apotek',
    type: 'Pemasukan',
    subCategories: [
      {
        id: 'sub_konsul',
        name: 'Konsultasi Dokter',
        items: ['Jasa Konsultasi Umum', 'Jasa Konsultasi Spesialis', 'Tindakan Medis Ringan']
      },
      {
        id: 'sub_sewa_in',
        name: 'Sewa Tenant',
        items: ['Sewa Counter Depan', 'Sewa Kursi Pijat']
      }
    ]
  },
  {
    id: 'cat_penjualan_in',
    name: 'Penjualan Apotek',
    type: 'Pemasukan',
    subCategories: [
      {
        id: 'sub_obat',
        name: 'Obat & Alkes',
        items: ['Obat Bebas', 'Obat Resep', 'Alat Kesehatan', 'Herbal & Vitamin']
      }
    ]
  },
  {
    id: 'cat_operasional_out',
    name: 'Operasional Bulanan',
    type: 'Pengeluaran',
    subCategories: [
      {
        id: 'sub_gaji',
        name: 'Gaji Staf',
        items: ['Gaji Apoteker', 'Gaji Asisten Apoteker', 'Gaji Kasir', 'Bonus Bulanan']
      },
      {
        id: 'sub_utilitas',
        name: 'Utilitas & Layanan',
        items: ['Tagihan Listrik PLN', 'Tagihan Air PDAM', 'Langganan Internet & Wifi', 'Retribusi Kebersihan']
      }
    ]
  },
  {
    id: 'cat_pengadaan_out',
    name: 'Pengadaan & Logistik',
    type: 'Pengeluaran',
    subCategories: [
      {
        id: 'sub_stok_out',
        name: 'Pembelian Obat',
        items: ['Obat Generik', 'Obat Paten', 'Vitamin & Suplemen', 'Alat Pelindung Diri (APD)']
      }
    ]
  },
  {
    id: 'cat_sewa_out',
    name: 'Sewa & Perawatan',
    type: 'Pengeluaran',
    subCategories: [
      {
        id: 'sub_gedung',
        name: 'Sewa Gedung',
        items: ['Sewa Ruko Bulanan', 'Perbaikan Pintu & Atap', 'Pengecatan Ulang']
      }
    ]
  }
];

export default function Transactions({ salesHistory, theme, settings }: TransactionsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'keuangan' | 'kategori' | 'laporan-kasir'>('keuangan');
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [categories, setCategories] = useState<CategoryTree[]>(DEFAULT_CATEGORIES);

  // Filter states
  const [filterType, setFilterType] = useState<'Semua' | 'Pemasukan' | 'Pengeluaran'>('Semua');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Add Finance Transaction modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState<'Pemasukan' | 'Pengeluaran'>('Pengeluaran');
  const [formCategory, setFormCategory] = useState('');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formItem, setFormItem] = useState('');
  const [formCustomItem, setFormCustomItem] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Add Category form states
  const [showCatModal, setShowCatModal] = useState(false);
  const [catFormType, setCatFormType] = useState<'Pemasukan' | 'Pengeluaran'>('Pengeluaran');
  const [catName, setCatName] = useState('');
  const [subCatName, setSubCatName] = useState('');
  const [itemName, setItemName] = useState('');

  // Bluetooth printing mock states
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<Sale | null>(null);
  const [isPrinterConnected, setIsPrinterConnected] = useState(settings.printerConnected);
  const [selectedPrinter, setSelectedPrinter] = useState(settings.printerName || 'ApoCute Thermal BT-58');
  const [searchingPrinters, setSearchingPrinters] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);

  // Load finance transactions and custom categories on mount
  useEffect(() => {
    const storedTrans = localStorage.getItem('apocute_finance_transactions');
    if (storedTrans) {
      setTransactions(JSON.parse(storedTrans));
    } else {
      // Pre-seed some default financial history for presentation
      const initialHistory: FinanceTransaction[] = [
        {
          id: 'ft_1',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
          type: 'Pengeluaran',
          category: 'Operasional Bulanan',
          subCategory: 'Utilitas & Layanan',
          item: 'Tagihan Listrik PLN',
          amount: 450000,
          notes: 'Tagihan PLN Bulan Juni'
        },
        {
          id: 'ft_2',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString().split('T')[0],
          type: 'Pemasukan',
          category: 'Operasional Apotek',
          subCategory: 'Konsultasi Dokter',
          item: 'Jasa Konsultasi Spesialis',
          amount: 250000,
          notes: 'Spesialis Anak Sore'
        },
        {
          id: 'ft_3',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 1).toISOString().split('T')[0],
          type: 'Pengeluaran',
          category: 'Sewa & Perawatan',
          subCategory: 'Sewa Gedung',
          item: 'Pemeliharaan Gedung',
          amount: 150000,
          notes: 'Perbaikan Keran Wastafel'
        }
      ];
      setTransactions(initialHistory);
      localStorage.setItem('apocute_finance_transactions', JSON.stringify(initialHistory));
    }

    const storedCats = localStorage.getItem('apocute_finance_categories');
    if (storedCats) {
      setCategories(JSON.parse(storedCats));
    }
  }, []);

  // Sync state changes with localStorage
  const saveTransactions = (newTrans: FinanceTransaction[]) => {
    setTransactions(newTrans);
    localStorage.setItem('apocute_finance_transactions', JSON.stringify(newTrans));
  };

  const saveCategories = (newCats: CategoryTree[]) => {
    setCategories(newCats);
    localStorage.setItem('apocute_finance_categories', JSON.stringify(newCats));
  };

  // Add new finance transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formSubCategory || (!formItem && !formCustomItem) || !formAmount) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    const resolvedItem = formItem === 'custom' ? formCustomItem : formItem;

    const newTrans: FinanceTransaction = {
      id: 'ft_' + Date.now(),
      date: formDate,
      type: formType,
      category: formCategory,
      subCategory: formSubCategory,
      item: resolvedItem,
      amount: parseFloat(formAmount),
      notes: formNotes
    };

    const updated = [newTrans, ...transactions];
    saveTransactions(updated);
    setShowAddModal(false);

    // Reset Form
    setFormNotes('');
    setFormAmount('');
    setFormCustomItem('');
  };

  // Delete finance transaction
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?')) {
      const filtered = transactions.filter(t => t.id !== id);
      saveTransactions(filtered);
    }
  };

  // Add Category/SubCategory/Item structure
  const handleAddCategoryTree = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) {
      alert('Nama Kategori wajib diisi!');
      return;
    }

    const existingCat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase() && c.type === catFormType);

    let updatedCats = [...categories];

    if (existingCat) {
      // Category exists, check subcategory
      if (subCatName) {
        const existingSub = existingCat.subCategories.find(s => s.name.toLowerCase() === subCatName.toLowerCase());
        if (existingSub) {
          // Subcategory exists, add item
          if (itemName && !existingSub.items.includes(itemName)) {
            existingSub.items.push(itemName);
          }
        } else {
          // Add new subcategory and optional item
          existingCat.subCategories.push({
            id: 'sub_' + Date.now(),
            name: subCatName,
            items: itemName ? [itemName] : []
          });
        }
      }
    } else {
      // Create new Category
      const newCatId = 'cat_' + Date.now();
      const newSubCatId = 'sub_' + Date.now();
      updatedCats.push({
        id: newCatId,
        name: catName,
        type: catFormType,
        subCategories: subCatName ? [
          {
            id: newSubCatId,
            name: subCatName,
            items: itemName ? [itemName] : []
          }
        ] : []
      });
    }

    saveCategories(updatedCats);
    setShowCatModal(false);
    setCatName('');
    setSubCatName('');
    setItemName('');
  };

  // Get dynamic options based on current category tree selections
  const availableCategoriesForForm = categories.filter(c => c.type === formType);
  const selectedCatObj = categories.find(c => c.name === formCategory && c.type === formType);
  const availableSubCategories = selectedCatObj ? selectedCatObj.subCategories : [];
  const selectedSubCatObj = availableSubCategories.find(s => s.name === formSubCategory);
  const availableItems = selectedSubCatObj ? selectedSubCatObj.items : [];

  // Whenever type changes, reset selections
  useEffect(() => {
    const cats = categories.filter(c => c.type === formType);
    if (cats.length > 0) {
      setFormCategory(cats[0].name);
      if (cats[0].subCategories.length > 0) {
        setFormSubCategory(cats[0].subCategories[0].name);
        if (cats[0].subCategories[0].items.length > 0) {
          setFormItem(cats[0].subCategories[0].items[0]);
        } else {
          setFormItem('custom');
        }
      } else {
        setFormSubCategory('');
        setFormItem('custom');
      }
    } else {
      setFormCategory('');
      setFormSubCategory('');
      setFormItem('custom');
    }
  }, [formType, categories]);

  // Whenever Category changes, reset sub-category
  const handleCategoryChange = (catNameVal: string) => {
    setFormCategory(catNameVal);
    const cat = categories.find(c => c.name === catNameVal && c.type === formType);
    if (cat && cat.subCategories.length > 0) {
      setFormSubCategory(cat.subCategories[0].name);
      if (cat.subCategories[0].items.length > 0) {
        setFormItem(cat.subCategories[0].items[0]);
      } else {
        setFormItem('custom');
      }
    } else {
      setFormSubCategory('');
      setFormItem('custom');
    }
  };

  // Whenever Sub-Category changes, reset item
  const handleSubCategoryChange = (subCatNameVal: string) => {
    setFormSubCategory(subCatNameVal);
    const sub = availableSubCategories.find(s => s.name === subCatNameVal);
    if (sub && sub.items.length > 0) {
      setFormItem(sub.items[0]);
    } else {
      setFormItem('custom');
    }
  };

  // Filtered transactions list
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'Semua' || t.type === filterType;
    const matchesCategory = filterCategory === 'Semua' || t.category === filterCategory;
    
    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        t.category.toLowerCase().includes(query) ||
        t.subCategory.toLowerCase().includes(query) ||
        t.item.toLowerCase().includes(query) ||
        (t.notes && t.notes.toLowerCase().includes(query));
    }

    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && t.date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && t.date <= endDate;
    }

    return matchesType && matchesCategory && matchesSearch && matchesDate;
  });

  // Calculate stats
  const totalIncome = filteredTransactions.filter(t => t.type === 'Pemasukan').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'Pengeluaran').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  // Filter today's sales history (moved from POS cashier)
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = salesHistory.filter(s => s.date.startsWith(todayStr));
  const totalTodayCashierSalesAmount = todaySales.reduce((acc, curr) => acc + curr.total, 0);

  // Theme setup
  const themeStyles = {
    lavender: {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
      text: 'text-indigo-600',
      badgeIn: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badgeOut: 'bg-rose-50 text-rose-700 border-rose-100',
      cardIn: 'from-emerald-50 to-teal-50 border-emerald-100',
      cardOut: 'from-rose-50 to-pink-50 border-rose-100',
      accent: 'border-indigo-100 bg-indigo-50/50',
      accentText: 'text-indigo-600',
      btnAccent: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
    },
    minty: {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
      text: 'text-emerald-600',
      badgeIn: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badgeOut: 'bg-rose-50 text-rose-700 border-rose-100',
      cardIn: 'from-emerald-50/70 to-teal-50/70 border-emerald-100',
      cardOut: 'from-rose-50 to-pink-50 border-rose-100',
      accent: 'border-emerald-100 bg-emerald-50/50',
      accentText: 'text-emerald-600',
      btnAccent: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
    },
    ocean: {
      primary: 'bg-sky-600 text-white hover:bg-sky-700',
      text: 'text-sky-600',
      badgeIn: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badgeOut: 'bg-rose-50 text-rose-700 border-rose-100',
      cardIn: 'from-emerald-50 to-teal-50 border-emerald-100',
      cardOut: 'from-rose-50 to-pink-50 border-rose-100',
      accent: 'border-sky-100 bg-sky-50/50',
      accentText: 'text-sky-600',
      btnAccent: 'bg-sky-50 text-sky-700 hover:bg-sky-100'
    },
    sunset: {
      primary: 'bg-amber-600 text-white hover:bg-amber-700',
      text: 'text-amber-600',
      badgeIn: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badgeOut: 'bg-rose-50 text-rose-700 border-rose-100',
      cardIn: 'from-emerald-50 to-teal-50 border-emerald-100',
      cardOut: 'from-rose-50 to-pink-50 border-rose-100',
      accent: 'border-amber-100 bg-amber-50/50',
      accentText: 'text-amber-600',
      btnAccent: 'bg-amber-50 text-amber-700 hover:bg-amber-100'
    },
    cherry: {
      primary: 'bg-rose-600 text-white hover:bg-rose-700',
      text: 'text-rose-600',
      badgeIn: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badgeOut: 'bg-rose-50 text-rose-700 border-rose-100',
      cardIn: 'from-emerald-50 to-teal-50 border-emerald-100',
      cardOut: 'from-rose-50 to-pink-50 border-rose-100',
      accent: 'border-rose-100 bg-rose-50/50',
      accentText: 'text-rose-600',
      btnAccent: 'bg-rose-50 text-rose-700 hover:bg-rose-100'
    }
  }[theme];

  // Bluetooth printing mock methods
  const connectBluetoothPrinter = () => {
    setSearchingPrinters(true);
    setPrinters([]);
    setTimeout(() => {
      setPrinters(['ApoCute Thermal BT-58', 'Panda Printer POS-58', 'Rongta RP58A']);
      setSearchingPrinters(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Sub-Tab Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-display font-black text-lg text-slate-800 tracking-tight">TRANSAKSI & KEUANGAN</h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-mono uppercase mt-0.5 tracking-wider">
            Manajemen Pemasukan, Pengeluaran, Kategori, & Laporan Kasir
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 w-full sm:w-auto shrink-0 overflow-x-auto gap-0.5">
          <button
            onClick={() => setActiveSubTab('keuangan')}
            className={`flex-1 sm:flex-none text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeSubTab === 'keuangan' ? 'bg-white text-slate-800 shadow-3xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
            Alur Keuangan
          </button>
          <button
            onClick={() => setActiveSubTab('kategori')}
            className={`flex-1 sm:flex-none text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeSubTab === 'kategori' ? 'bg-white text-slate-800 shadow-3xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            Kategori & Item
          </button>
          <button
            onClick={() => setActiveSubTab('laporan-kasir')}
            className={`flex-1 sm:flex-none text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeSubTab === 'laporan-kasir' ? 'bg-white text-slate-800 shadow-3xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-sky-500" />
            Laporan Kasir Hari Ini
          </button>
        </div>
      </div>

      {/* 2. TAB 1: ALUR KEUANGAN */}
      {activeSubTab === 'keuangan' && (
        <div className="space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center justify-between overflow-hidden relative">
              <div className="absolute -right-2 -bottom-2 opacity-5 text-emerald-600">
                <ArrowDownCircle className="w-24 h-24" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Total Pemasukan</span>
                <h3 className="font-display font-black text-xl text-slate-800 leading-none">{formatRupiah(totalIncome)}</h3>
                <span className="text-[9px] text-slate-400 font-mono block mt-1">Berdasarkan filter saat ini</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-3xs">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs flex items-center justify-between overflow-hidden relative">
              <div className="absolute -right-2 -bottom-2 opacity-5 text-rose-600">
                <ArrowUpCircle className="w-24 h-24" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block">Total Pengeluaran</span>
                <h3 className="font-display font-black text-xl text-slate-800 leading-none">{formatRupiah(totalExpense)}</h3>
                <span className="text-[9px] text-slate-400 font-mono block mt-1">Berdasarkan filter saat ini</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-3xs">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            <div className={`bg-white p-5 rounded-3xl border shadow-xs flex items-center justify-between overflow-hidden relative ${balance >= 0 ? 'border-indigo-100' : 'border-red-100'}`}>
              <div className="absolute -right-2 -bottom-2 opacity-5 text-slate-400">
                <DollarSign className="w-24 h-24" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Saldo Bersih</span>
                <h3 className={`font-display font-black text-xl leading-none ${balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {formatRupiah(balance)}
                </h3>
                <span className="text-[9px] text-slate-400 font-mono block mt-1">Selisih Pemasukan & Pengeluaran</span>
              </div>
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 shadow-3xs ${balance >= 0 ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filtering and Actions Panel */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-500" />
                Filter Catatan Kas Keuangan
              </h3>
              
              <button
                onClick={() => {
                  setFormType('Pengeluaran');
                  setShowAddModal(true);
                }}
                className={`text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${themeStyles.primary}`}
              >
                <Plus className="w-4 h-4" />
                Catat Transaksi Kas
              </button>
            </div>

            {/* Filters Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* Type Filter */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tipe</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl outline-none focus:border-indigo-400 transition-all cursor-pointer"
                >
                  <option value="Semua">Semua Aliran</option>
                  <option value="Pemasukan">Pemasukan (Income)</option>
                  <option value="Pengeluaran">Pengeluaran (Expense)</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kategori Utama</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl outline-none focus:border-indigo-400 transition-all cursor-pointer"
                >
                  <option value="Semua">Semua Kategori</option>
                  {/* Pull unique categories present in history or template */}
                  {Array.from(new Set(categories.map(c => c.name))).map(catName => (
                    <option key={catName} value={catName}>{catName}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.2 rounded-xl outline-none focus:border-indigo-400 transition-all"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hingga Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.2 rounded-xl outline-none focus:border-indigo-400 transition-all"
                />
              </div>

              {/* Search text query */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cari Keterangan / Item</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik kata kunci..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold pl-8 pr-2.5 py-1.5 rounded-xl outline-none focus:border-indigo-400 transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Table list of financial records */}
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Catatan Transaksi ({filteredTransactions.length} baris data ditemukan)
              </span>
              <button
                onClick={() => {
                  setFilterType('Semua');
                  setFilterCategory('Semua');
                  setStartDate('');
                  setEndDate('');
                  setSearchQuery('');
                }}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-3 h-3" /> RESET
              </button>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300 animate-pulse" />
                <p>Belum ada catatan transaksi keuangan yang cocok dengan filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/55 border-b border-slate-150 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Tanggal</th>
                      <th className="py-3.5 px-4">Aliran</th>
                      <th className="py-3.5 px-4">Kategori Utama</th>
                      <th className="py-3.5 px-4">Sub Kategori</th>
                      <th className="py-3.5 px-4">Item Transaksi</th>
                      <th className="py-3.5 px-4">Keterangan</th>
                      <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                      <th className="py-3.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{t.date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                            t.type === 'Pemasukan' ? themeStyles.badgeIn : themeStyles.badgeOut
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800">{t.category}</td>
                        <td className="py-3 px-4 text-slate-500">{t.subCategory}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{t.item}</td>
                        <td className="py-3 px-4 text-slate-400 italic font-normal text-[10px] max-w-[200px] truncate" title={t.notes}>
                          {t.notes || '-'}
                        </td>
                        <td className={`py-3 px-4 text-right font-display font-black text-xs ${
                          t.type === 'Pemasukan' ? 'text-emerald-600' : 'text-slate-700'
                        }`}>
                          {t.type === 'Pemasukan' ? '+' : '-'} {formatRupiah(t.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-all inline-block"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB 2: KATEGORI & ITEM MANAGEMENT */}
      {activeSubTab === 'kategori' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-indigo-500" />
                  Struktur Kategori Transaksi
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                  Sistem klasifikasi multi-tingkat: Kategori Utama → Sub Kategori → Item Transaksi
                </p>
              </div>
              <button
                onClick={() => {
                  setCatFormType('Pengeluaran');
                  setShowCatModal(true);
                }}
                className={`text-[10px] sm:text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${themeStyles.primary}`}
              >
                <PlusCircle className="w-4 h-4" />
                Tambah Kategori / Item
              </button>
            </div>

            {/* Tree Rendering of categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Categories */}
              <div className="space-y-3">
                <div className="bg-emerald-50/50 border border-emerald-100/80 p-3 rounded-2xl flex items-center gap-2">
                  <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-display font-black text-emerald-800 text-xs uppercase tracking-wider">Kategori Pemasukan (Income)</span>
                </div>

                <div className="space-y-3.5">
                  {categories.filter(c => c.type === 'Pemasukan').map((cat) => (
                    <div key={cat.id} className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-3 shadow-3xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-display font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-indigo-400" />
                          {cat.name}
                        </span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono uppercase font-bold">Kategori Utama</span>
                      </div>

                      {cat.subCategories.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">Belum ada sub-kategori di bawah kategori ini.</p>
                      ) : (
                        <div className="space-y-3 pl-3 border-l-2 border-dashed border-slate-200">
                          {cat.subCategories.map((sub) => (
                            <div key={sub.id} className="space-y-1.5">
                              <h5 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                {sub.name}
                                <span className="text-[8px] text-slate-400 font-mono italic">(Sub-Kategori)</span>
                              </h5>
                              <div className="flex flex-wrap gap-1.5 pl-3">
                                {sub.items.map((item, idx) => (
                                  <span key={idx} className="bg-slate-50 border border-slate-150 text-slate-600 text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold">
                                    <Box className="w-2.5 h-2.5 text-slate-400" />
                                    {item}
                                  </span>
                                ))}
                                {sub.items.length === 0 && (
                                  <span className="text-[9px] text-slate-400 italic">Belum ada item terdaftar</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Categories */}
              <div className="space-y-3">
                <div className="bg-rose-50/50 border border-rose-100/80 p-3 rounded-2xl flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-rose-600" />
                  <span className="font-display font-black text-rose-800 text-xs uppercase tracking-wider">Kategori Pengeluaran (Expense)</span>
                </div>

                <div className="space-y-3.5">
                  {categories.filter(c => c.type === 'Pengeluaran').map((cat) => (
                    <div key={cat.id} className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-3 shadow-3xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-display font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-rose-400" />
                          {cat.name}
                        </span>
                        <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-mono uppercase font-bold">Kategori Utama</span>
                      </div>

                      {cat.subCategories.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">Belum ada sub-kategori di bawah kategori ini.</p>
                      ) : (
                        <div className="space-y-3 pl-3 border-l-2 border-dashed border-slate-200">
                          {cat.subCategories.map((sub) => (
                            <div key={sub.id} className="space-y-1.5">
                              <h5 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                {sub.name}
                                <span className="text-[8px] text-slate-400 font-mono italic">(Sub-Kategori)</span>
                              </h5>
                              <div className="flex flex-wrap gap-1.5 pl-3">
                                {sub.items.map((item, idx) => (
                                  <span key={idx} className="bg-slate-50 border border-slate-150 text-slate-600 text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold">
                                    <Box className="w-2.5 h-2.5 text-slate-400" />
                                    {item}
                                  </span>
                                ))}
                                {sub.items.length === 0 && (
                                  <span className="text-[9px] text-slate-400 italic">Belum ada item terdaftar</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 3: LAPORAN KASIR HARI INI (DIRELOAD DARI KASIR POS UNTUK MEMENUHI REQUEST) */}
      {activeSubTab === 'laporan-kasir' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-sky-500" />
                  Riwayat Kasir Hari Ini
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Daftar transaksi penjualan obat di kasir hari ini. Laba/profit disembunyikan untuk keamanan staf kasir.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block">Total Omset Kasir Hari Ini</span>
                <span className="font-display font-black text-base text-indigo-600 block">{formatRupiah(totalTodayCashierSalesAmount)}</span>
              </div>
            </div>

            {todaySales.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <Printer className="w-8 h-8 mx-auto text-slate-300 animate-pulse" />
                <p>Belum ada transaksi penjualan yang dicatatkan di kasir hari ini ({todayStr}).</p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Daftar Nota Transaksi Terbit ({todaySales.length} Transaksi)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {todaySales.map((sale) => (
                    <div key={sale.id} className="p-4 border border-slate-200/80 hover:border-indigo-300 bg-slate-50/40 rounded-2xl flex flex-col justify-between gap-3 transition-all shadow-3xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-800 text-xs">{sale.invoiceNumber}</span>
                          <span className="text-[9px] bg-slate-200/60 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            {new Date(sale.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-[11px] text-slate-500">
                          <p>Customer: <span className="font-bold text-slate-700">{sale.customerName || 'Umum / Walk-in'}</span></p>
                          <p>Metode: <span className="font-bold text-slate-700 uppercase">{sale.paymentMethod}</span></p>
                          <p>Produk: <span className="font-mono font-bold text-indigo-600">{sale.items.length} item obat</span></p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                        <div>
                          <span className="text-[8px] text-slate-400 uppercase tracking-wider block font-mono">Jumlah Pembayaran</span>
                          <span className="font-display font-black text-slate-800 text-sm block">{formatRupiah(sale.total)}</span>
                        </div>

                        <button
                          onClick={() => {
                            setPrintedReceipt(sale);
                            setShowPrinterModal(true);
                          }}
                          className="flex items-center gap-1 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-[10px] font-bold transition-all shadow-4xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-sky-500" />
                          Cetak Struk
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL FORM: CATAT TRANSAKSI BARU (INCOME / EXPENSE) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.form
              onSubmit={handleAddTransaction}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-150 flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-500" />
                  Catat Keuangan Alur Kas
                </h4>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* Type Selection Tabs */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tipe Aliran Dana</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setFormType('Pemasukan')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        formType === 'Pemasukan' ? 'bg-white text-emerald-600 shadow-3xs' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Pemasukan (Income)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType('Pengeluaran')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        formType === 'Pengeluaran' ? 'bg-white text-rose-500 shadow-3xs' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Pengeluaran (Expense)
                    </button>
                  </div>
                </div>

                {/* Date Input */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kategori Utama</label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all cursor-pointer"
                  >
                    <option value="">-- Pilih Kategori Utama --</option>
                    {availableCategoriesForForm.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* SubCategory Dropdown */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sub Kategori</label>
                  <select
                    value={formSubCategory}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    disabled={!formCategory}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Pilih Sub Kategori --</option>
                    {availableSubCategories.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Item Select / Text Input */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Item Spesifik</label>
                  <select
                    value={formItem}
                    onChange={(e) => setFormItem(e.target.value)}
                    disabled={!formSubCategory}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {availableItems.map((item, idx) => (
                      <option key={idx} value={item}>{item}</option>
                    ))}
                    <option value="custom">-- Tulis Item Custom Sendiri --</option>
                  </select>
                </div>

                {/* Custom Item free input */}
                {formItem === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1"
                  >
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Item Kustom</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pembelian Sabun Cuci Tangan"
                      value={formCustomItem}
                      onChange={(e) => setFormCustomItem(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all"
                    />
                  </motion.div>
                )}

                {/* Amount input */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nominal Transaksi (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Contoh: 150000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all text-indigo-600"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Catatan Tambahan (Keterangan)</label>
                  <textarea
                    placeholder="Tulis keterangan opsional..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all text-xs font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${themeStyles.primary}`}
                >
                  Simpan Transaksi
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL FORM: TAMBAH STRUKTUR KATEGORI & ITEM */}
      <AnimatePresence>
        {showCatModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.form
              onSubmit={handleAddCategoryTree}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-150"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-500" />
                  Tambah Kategori & Item Keuangan
                </h4>
                <button type="button" onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Type selection */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Untuk Aliran</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setCatFormType('Pemasukan')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        catFormType === 'Pemasukan' ? 'bg-white text-emerald-600 shadow-3xs' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatFormType('Pengeluaran')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        catFormType === 'Pengeluaran' ? 'bg-white text-rose-500 shadow-3xs' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Category name */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Kategori Utama</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Operasional Apotek"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all"
                    list="existing-cats-list"
                  />
                  <datalist id="existing-cats-list">
                    {categories.filter(c => c.type === catFormType).map(c => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                  <span className="text-[8px] text-slate-400 block mt-1 leading-normal">
                    Ketik nama baru untuk membuat Kategori Baru, atau ketik nama lama yang cocok untuk menambahkan sub-kategori ke dalamnya.
                  </span>
                </div>

                {/* Sub-Category name */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Sub Kategori (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tagihan Utilitas"
                    value={subCatName}
                    onChange={(e) => setSubCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all"
                  />
                </div>

                {/* Item name */}
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Item Spesifik (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tagihan Listrik PLN"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all text-xs font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${themeStyles.primary}`}
                >
                  Simpan Struktur
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* 7. MODAL: SIMULASI PRINTER THERMAL (PILIHAN UNTUK REPRINT INVOICE KASIR) */}
      <AnimatePresence>
        {showPrinterModal && printedReceipt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-400" />
                  <span className="font-display font-bold text-xs uppercase">ApoCute Thermal BT-58</span>
                </div>
                <button onClick={() => setShowPrinterModal(false)} className="text-white/75 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* BT settings */}
              <div className="bg-slate-50 p-3 border-b border-slate-150 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <Bluetooth className={`w-3.5 h-3.5 ${isPrinterConnected ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">
                    {isPrinterConnected ? `${selectedPrinter}` : 'Printer Terputus'}
                  </span>
                </div>
                {!isPrinterConnected ? (
                  <button
                    onClick={connectBluetoothPrinter}
                    disabled={searchingPrinters}
                    className="text-[9px] bg-indigo-600 text-white font-black px-2 py-1 rounded-md hover:bg-indigo-700 transition-all flex items-center gap-1"
                  >
                    {searchingPrinters ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Plus className="w-2.5 h-2.5" />}
                    Cari
                  </button>
                ) : (
                  <button onClick={() => setIsPrinterConnected(false)} className="text-[9px] text-rose-500 font-bold hover:underline">
                    Putuskan
                  </button>
                )}
              </div>

              {/* BT scan results list */}
              {printers.length > 0 && !isPrinterConnected && (
                <div className="bg-amber-50 p-3 border-b border-slate-150 space-y-1.5 shrink-0">
                  <span className="text-[9px] font-bold text-amber-800 uppercase block">Pilih Perangkat Terdeteksi:</span>
                  <div className="space-y-1">
                    {printers.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPrinter(p);
                          setIsPrinterConnected(true);
                          setPrinters([]);
                        }}
                        className="w-full text-left p-1.5 bg-white rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-700 hover:bg-indigo-50/50 flex justify-between"
                      >
                        <span>{p}</span>
                        <Check className="w-3 h-3 text-indigo-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Print View */}
              <div className="bg-slate-100 p-4 overflow-y-auto flex-1 flex justify-center items-start">
                <div className="w-56 bg-white shadow-sm border border-slate-200 p-3 font-mono text-[9px] text-slate-800 space-y-3 relative leading-relaxed">
                  {/* Jagged teeth edge simulation */}
                  <div className="absolute top-0 left-0 right-0 h-1 flex justify-between overflow-hidden">
                    {Array.from({ length: 22 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-slate-100 rotate-45 transform -translate-y-1" />
                    ))}
                  </div>

                  <div className="text-center space-y-0.5 pt-1.5">
                    <h4 className="font-bold text-[10px] uppercase">{settings.companyName || 'APOCUTE CERIA'}</h4>
                    <p className="text-[7.5px] text-slate-400">APOTEK KELUARGA BAHAGIA</p>
                    <p className="text-[7.5px] text-slate-400">TELP: (022) 12345678</p>
                    <div className="border-t border-slate-300 border-dashed my-1.5" />
                  </div>

                  <div className="space-y-0.5 text-[8px]">
                    <div className="flex justify-between">
                      <span>No: {printedReceipt.invoiceNumber}</span>
                      <span>Kasir: {printedReceipt.cashierName || 'Kasir'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tgl: {new Date(printedReceipt.date).toLocaleDateString('id-ID')}</span>
                      <span>Jam: {new Date(printedReceipt.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between text-[7.5px] text-slate-500">
                      <span>Cust: {printedReceipt.customerName || 'Umum'}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-300 border-dashed my-1.5" />

                  {/* Items table */}
                  <div className="space-y-1 text-[8px]">
                    {printedReceipt.items.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between">
                          <span className="font-bold">{item.name}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>{item.quantity} x {formatRupiah(item.price)}</span>
                          <span>{formatRupiah(item.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-300 border-dashed my-1.5" />

                  {/* Calculations */}
                  <div className="space-y-0.5 text-[8px] font-bold">
                    <div className="flex justify-between font-normal text-slate-500">
                      <span>Subtotal:</span>
                      <span>{formatRupiah(printedReceipt.subtotal)}</span>
                    </div>
                    {printedReceipt.discount > 0 && (
                      <div className="flex justify-between font-normal text-slate-500">
                        <span>Diskon:</span>
                        <span>-{formatRupiah(printedReceipt.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] text-slate-900 pt-0.5 border-t border-slate-200 border-dotted">
                      <span>TOTAL:</span>
                      <span>{formatRupiah(printedReceipt.total)}</span>
                    </div>
                    <div className="flex justify-between font-normal text-slate-400 text-[7.5px] pt-1">
                      <span>Metode:</span>
                      <span className="uppercase">{printedReceipt.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-300 border-dashed my-1.5" />

                  <div className="text-center text-[7.5px] text-slate-400 space-y-0.5 pt-1">
                    <p className="font-bold uppercase">Terima Kasih</p>
                    <p>Semoga Lekas Sembuh & Sehat Selalu</p>
                    <p className="font-mono text-[6px]">ApoCute POS System v3.1</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPrinterModal(false)}
                  className="flex-1 py-1.5 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={!isPrinterConnected}
                  onClick={() => {
                    alert('Berhasil mencetak ulang tanda terima ke printer bluetooth BT-58!');
                    setShowPrinterModal(false);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${themeStyles.primary}`}
                >
                  Cetak Ulang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
