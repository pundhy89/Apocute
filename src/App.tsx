import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Receipt, Package, Users, BarChart2, Settings, LogOut, Building,
  Wifi, Bluetooth, Sparkles, Clock, ShieldAlert, Heart, RefreshCw, AlertCircle, Stethoscope, MessageSquare,
  Menu, ChevronDown, Bell, Check, LayoutDashboard, Coins
} from 'lucide-react';

import {
  Medicine, Customer, Supplier, StockInflow, Sale, Employee, AppSettings, Doctor
} from './types';

import {
  INITIAL_MEDICINES, INITIAL_CUSTOMERS, INITIAL_SUPPLIERS,
  INITIAL_STOCK_INFLOWS, INITIAL_SALES, INITIAL_DOCTORS
} from './data';

import Login from './components/Login';
import POS from './components/POS';
import Inventory from './components/Inventory';
import SalesSuppliers from './components/SalesSuppliers';
import Customers from './components/Customers';
import Doctors from './components/Doctors';
import Reports from './components/Reports';
import SettingsComponent from './components/Settings';
import WhatsappSettings from './components/WhatsappSettings';
import CuteLogo from './components/CuteLogo';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';

export default function App() {
  // 1. Core State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockInflows, setStockInflows] = useState<StockInflow[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'ApoCute Ceria',
    companyLogoType: 'cute-pill',
    theme: 'lavender',
    printerConnected: true,
    printerName: 'ApoCute Thermal BT-58',
    whatsappGatewayUrl: 'https://api.apocute.com/v1/messages',
    whatsappApiKey: 'ac_test_key_abc123',
    whatsappAutoPromo: true,
    whatsappAutoReceipt: true,
    whatsappAutoStockAlert: true
  });

  // 2. Authentication State
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  // 3. Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'transactions' | 'inventory' | 'suppliers' | 'customers' | 'doctors' | 'reports' | 'whatsapp' | 'settings'>('dashboard');
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // 10-second auto-close menu timer
  const menuTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startMenuTimer = () => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    menuTimerRef.current = setTimeout(() => {
      setShowMenuDropdown(false);
    }, 10000);
  };

  const handleMenuInteraction = () => {
    if (showMenuDropdown) {
      startMenuTimer();
    }
  };

  useEffect(() => {
    if (showMenuDropdown) {
      startMenuTimer();
    } else {
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
        menuTimerRef.current = null;
      }
    }
    return () => {
      if (menuTimerRef.current) {
        clearTimeout(menuTimerRef.current);
      }
    };
  }, [showMenuDropdown, activeTab]);

  // 4. Load initial database state from local storage or static seed data
  useEffect(() => {
    try {
      const storedMedicines = localStorage.getItem('apocute_medicines');
      const storedCustomers = localStorage.getItem('apocute_customers');
      const storedSuppliers = localStorage.getItem('apocute_suppliers');
      const storedInflows = localStorage.getItem('apocute_inflows');
      const storedSales = localStorage.getItem('apocute_sales');
      const storedDoctors = localStorage.getItem('apocute_doctors');
      const storedSettings = localStorage.getItem('apocute_settings');
      const storedEmployee = sessionStorage.getItem('apocute_active_employee');

      if (storedMedicines) setMedicines(JSON.parse(storedMedicines));
      else {
        setMedicines(INITIAL_MEDICINES);
        localStorage.setItem('apocute_medicines', JSON.stringify(INITIAL_MEDICINES));
      }

      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
      else {
        setCustomers(INITIAL_CUSTOMERS);
        localStorage.setItem('apocute_customers', JSON.stringify(INITIAL_CUSTOMERS));
      }

      if (storedSuppliers) setSuppliers(JSON.parse(storedSuppliers));
      else {
        setSuppliers(INITIAL_SUPPLIERS);
        localStorage.setItem('apocute_suppliers', JSON.stringify(INITIAL_SUPPLIERS));
      }

      if (storedInflows) setStockInflows(JSON.parse(storedInflows));
      else {
        setStockInflows(INITIAL_STOCK_INFLOWS);
        localStorage.setItem('apocute_inflows', JSON.stringify(INITIAL_STOCK_INFLOWS));
      }

      if (storedSales) setSalesHistory(JSON.parse(storedSales));
      else {
        setSalesHistory(INITIAL_SALES);
        localStorage.setItem('apocute_sales', JSON.stringify(INITIAL_SALES));
      }

      if (storedDoctors) {
        setDoctors(JSON.parse(storedDoctors));
      } else {
        setDoctors(INITIAL_DOCTORS);
        localStorage.setItem('apocute_doctors', JSON.stringify(INITIAL_DOCTORS));
      }

      if (storedSettings) setSettings(JSON.parse(storedSettings));

      if (storedEmployee) setActiveEmployee(JSON.parse(storedEmployee));
    } catch (e) {
      console.error('Gagal memuat local storage database', e);
    }
  }, []);

  // 5. Automatic background saving (Offline-first persistence)
  useEffect(() => {
    if (medicines.length > 0) localStorage.setItem('apocute_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    if (customers.length > 0) localStorage.setItem('apocute_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    if (suppliers.length > 0) localStorage.setItem('apocute_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    if (stockInflows.length > 0) localStorage.setItem('apocute_inflows', JSON.stringify(stockInflows));
  }, [stockInflows]);

  useEffect(() => {
    if (salesHistory.length > 0) localStorage.setItem('apocute_sales', JSON.stringify(salesHistory));
  }, [salesHistory]);

  useEffect(() => {
    if (doctors.length > 0) localStorage.setItem('apocute_doctors', JSON.stringify(doctors));
  }, [doctors]);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('apocute_settings', JSON.stringify(newSettings));
  };

  // 6. Security login actions
  const handleLoginSuccess = (employee: Employee) => {
    setActiveEmployee(employee);
    sessionStorage.setItem('apocute_active_employee', JSON.stringify(employee));
  };

  const handleLogout = () => {
    setActiveEmployee(null);
    sessionStorage.removeItem('apocute_active_employee');
  };

  // 7. Inventory update handlers
  const handleNewSale = (sale: Sale) => {
    setSalesHistory([sale, ...salesHistory]);
  };

  const updateMedicineStock = (id: string, newStock: number) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, stock: Math.max(0, newStock) } : m));
  };

  const updateCustomerPoints = (id: string, newPoints: number) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, points: newPoints } : c));
  };

  // 8. Stock Inflow & Debt update handlers
  const addStockInflow = (inflow: StockInflow) => {
    setStockInflows([inflow, ...stockInflows]);
  };

  const updateSupplierDebt = (supplierId: string, amountToAdd: number) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, debt: s.debt + amountToAdd } : s));
  };

  const handlePaySupplierDebt = (supplierId: string, amountToPay: number) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, debt: Math.max(0, s.debt - amountToPay) } : s));
  };

  // 9. Customer management handlers
  const addCustomer = (cust: Customer) => {
    setCustomers([cust, ...customers]);
  };

  const updateCustomer = (cust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === cust.id ? cust : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // 10. Medicine management handlers
  const addMedicine = (med: Medicine) => {
    setMedicines([med, ...medicines]);
  };

  const updateMedicine = (med: Medicine) => {
    setMedicines(prev => prev.map(m => m.id === med.id ? med : m));
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  // 11. Supplier management handlers
  const addSupplier = (sup: Supplier) => {
    setSuppliers([sup, ...suppliers]);
  };

  const updateSupplier = (sup: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === sup.id ? sup : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // 11.5. Doctor management handlers
  const addDoctor = (doc: Doctor) => {
    setDoctors([doc, ...doctors]);
  };

  const updateDoctor = (doc: Doctor) => {
    setDoctors(prev => prev.map(d => d.id === doc.id ? doc : d));
  };

  const deleteDoctor = (id: string) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
  };

  // 12. Backup & Restore logic
  const handleBackupData = () => {
    const dataToBackup = {
      medicines,
      customers,
      suppliers,
      stockInflows,
      salesHistory,
      doctors,
      settings
    };
    const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apocute_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.medicines && parsed.customers && parsed.suppliers && parsed.salesHistory) {
          setMedicines(parsed.medicines);
          setCustomers(parsed.customers);
          setSuppliers(parsed.suppliers);
          setStockInflows(parsed.stockInflows || []);
          setSalesHistory(parsed.salesHistory);
          if (parsed.doctors) setDoctors(parsed.doctors);
          if (parsed.settings) setSettings(parsed.settings);
          alert('Data ApoCute berhasil dipulihkan dari file backup!');
        } else {
          alert('Format file backup tidak valid! Pastikan Anda memulihkan berkas JSON ApoCute.');
        }
      } catch (err) {
        alert('Gagal membaca file backup!');
      }
    };
    reader.readAsText(file);
  };

  // 13. Theme definitions mapper
  const getThemeConfig = () => {
    switch (settings.theme) {
      case 'lavender':
        return {
          bg: 'bg-indigo-50/20',
          sidebarBg: 'bg-indigo-950 text-indigo-100',
          sidebarGlass: 'bg-indigo-950/50 text-indigo-100 border border-white/20 backdrop-blur-md',
          activeItem: 'bg-indigo-800 text-white shadow-md shadow-indigo-950/20',
          primaryText: 'text-indigo-900',
          accent: 'text-indigo-600',
          gradient: 'from-indigo-500 to-purple-600',
          glow: 'shadow-indigo-100'
        };
      case 'minty':
        return {
          bg: 'bg-emerald-50/20',
          sidebarBg: 'bg-emerald-950 text-emerald-100',
          sidebarGlass: 'bg-emerald-950/50 text-emerald-100 border border-white/20 backdrop-blur-md',
          activeItem: 'bg-emerald-800 text-white shadow-md shadow-emerald-950/20',
          primaryText: 'text-emerald-900',
          accent: 'text-emerald-600',
          gradient: 'from-emerald-400 to-teal-600',
          glow: 'shadow-emerald-100'
        };
      case 'ocean':
        return {
          bg: 'bg-sky-50/20',
          sidebarBg: 'bg-sky-950 text-sky-100',
          sidebarGlass: 'bg-sky-950/50 text-sky-100 border border-white/20 backdrop-blur-md',
          activeItem: 'bg-sky-800 text-white shadow-md shadow-sky-950/20',
          primaryText: 'text-sky-900',
          accent: 'text-sky-600',
          gradient: 'from-sky-400 to-blue-600',
          glow: 'shadow-sky-100'
        };
      case 'sunset':
        return {
          bg: 'bg-orange-50/20',
          sidebarBg: 'bg-orange-950 text-orange-100',
          sidebarGlass: 'bg-orange-950/50 text-orange-100 border border-white/20 backdrop-blur-md',
          activeItem: 'bg-orange-800 text-white shadow-md shadow-orange-950/20',
          primaryText: 'text-orange-900',
          accent: 'text-orange-600',
          gradient: 'from-orange-400 to-amber-600',
          glow: 'shadow-orange-100'
        };
      case 'cherry':
        return {
          bg: 'bg-rose-50/20',
          sidebarBg: 'bg-rose-950 text-rose-100',
          sidebarGlass: 'bg-rose-950/50 text-rose-100 border border-white/20 backdrop-blur-md',
          activeItem: 'bg-rose-800 text-white shadow-md shadow-rose-950/20',
          primaryText: 'text-rose-900',
          accent: 'text-rose-600',
          gradient: 'from-pink-500 via-rose-500 to-red-500',
          glow: 'shadow-rose-100'
        };
    }
  };

  const themeStyle = getThemeConfig();

  // If user is not logged in, show security gate
  if (!activeEmployee) {
    return <Login onLoginSuccess={handleLoginSuccess} theme={settings.theme} />;
  }

  // Low Stock Items summary badge
  const lowStockCount = medicines.filter(m => m.stock <= m.minStock).length;

  return (
    <div className={`min-h-screen flex flex-col ${themeStyle.bg} transition-colors duration-300 font-sans`}>
      
      {/* TOP STATUS BAR / HEADER (Menu & Notifikasi Dropdown) */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 flex items-center justify-between shadow-sm">
        {/* Left Side: Brand Logo and Title */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none transition-all duration-200 hover:opacity-90"
          title="Ke Dasbor Utama"
        >
          <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-150 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 group-hover:border-indigo-300 transition-all duration-300">
            <CuteLogo type={settings.companyLogoType} theme={settings.theme} size={28} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-black text-xs sm:text-sm tracking-tight text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">
                {settings.companyName}
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Sistem Aktif" />
            </div>
            <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block mt-1 leading-none">
              Panel: {activeTab === 'dashboard' ? 'Dasbor Utama' : activeTab === 'pos' ? 'Kasir Kas Utama' : activeTab === 'transactions' ? 'Transaksi Keuangan' : activeTab === 'inventory' ? 'Database Inventori' : activeTab === 'suppliers' ? 'Sales Representative' : activeTab === 'customers' ? 'Loyalty Pelanggan' : activeTab === 'doctors' ? 'Jadwal & Dokter Jaga' : activeTab === 'reports' ? 'Analitis Keuangan' : activeTab === 'whatsapp' ? 'WhatsApp API & Template' : 'Pengaturan Identitas'}
            </span>
          </div>
        </div>

        {/* Right Side: Notification Icon & Menu Dropdown Icon */}
        <div className="flex items-center gap-2.5">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown);
                setShowMenuDropdown(false);
              }}
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-600 transition-all flex items-center justify-center cursor-pointer"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce">
                  {lowStockCount}
                </span>
              )}
            </button>
          </div>

          {/* Menu Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMenuDropdown(!showMenuDropdown);
                setShowNotificationDropdown(false);
              }}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-600 transition-all flex items-center justify-center cursor-pointer"
              title="Menu Navigasi"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Menu Dropdown Panel */}
            <AnimatePresence>
              {showMenuDropdown && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMenuDropdown(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[90]"
                  />
                  
                  {/* Sliding Sidebar Drawer (Edge Panel Capsule Theme - Narrowed to 96px) */}
                  <motion.div
                    initial={{ opacity: 0, x: 60, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 60, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                    onMouseEnter={handleMenuInteraction}
                    onMouseMove={handleMenuInteraction}
                    onClick={handleMenuInteraction}
                    className="fixed right-2 md:right-4 top-2 bottom-2 w-[96px] h-[calc(100vh-16px)] bg-white/98 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border-[3px] border-slate-300/95 rounded-[30px] py-3.5 px-1.5 z-[100] text-slate-800 flex flex-col justify-between items-center overflow-hidden"
                  >
                    {/* Close button & role info */}
                    <div className="flex flex-col items-center w-full">
                      <button 
                        onClick={() => setShowMenuDropdown(false)}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 duration-200 border border-slate-200"
                        title="Tutup Menu"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className="text-[7.5px] font-mono font-black text-slate-400 mt-1 uppercase tracking-wider truncate max-w-full px-1">
                        {activeEmployee.role}
                      </span>
                      
                      {/* Samsung Edge-style Dotted Separator */}
                      <div className="w-full border-t-[2px] border-dotted border-slate-300/80 my-2" />
                    </div>

                    {/* Nav Items Scroll Container */}
                    <div className="flex-1 w-full flex flex-col items-center gap-2.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 px-0.5">
                      {/* Dashboard */}
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                          activeTab === 'dashboard' 
                            ? 'bg-indigo-50 border-indigo-400 shadow-sm' 
                            : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                        } p-0.5`}>
                          <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                            activeTab === 'dashboard' 
                              ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md' 
                              : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                          }`}>
                            <LayoutDashboard className="w-3.5 h-3.5" />
                          </span>
                        </span>
                        <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                          activeTab === 'dashboard' ? 'text-indigo-600 font-black' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          Dasbor
                        </span>
                      </button>

                      {/* POS */}
                      <button
                        onClick={() => {
                          setActiveTab('pos');
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                          activeTab === 'pos' 
                            ? 'bg-amber-50 border-amber-400 shadow-sm' 
                            : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                        } p-0.5`}>
                          <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                            activeTab === 'pos' 
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md' 
                              : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                          }`}>
                            <Receipt className="w-3.5 h-3.5" />
                          </span>
                        </span>
                        <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                          activeTab === 'pos' ? 'text-orange-600 font-black' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          Kasir
                        </span>
                      </button>

                      {/* Transaksi */}
                      <button
                        onClick={() => {
                          setActiveTab('transactions');
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                          activeTab === 'transactions' 
                            ? 'bg-emerald-50 border-emerald-400 shadow-sm' 
                            : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                        } p-0.5`}>
                          <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                            activeTab === 'transactions' 
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md' 
                              : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                          }`}>
                            <Coins className="w-3.5 h-3.5" />
                          </span>
                        </span>
                        <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                          activeTab === 'transactions' ? 'text-emerald-600 font-black' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          Transaksi
                        </span>
                      </button>

                      {/* Inventory */}
                      <button
                        onClick={() => {
                          setActiveTab('inventory');
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                          activeTab === 'inventory' 
                            ? 'bg-emerald-50 border-emerald-400 shadow-sm' 
                            : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                        } p-0.5`}>
                          <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                            activeTab === 'inventory' 
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md' 
                              : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                          }`}>
                            <Package className="w-3.5 h-3.5" />
                          </span>
                        </span>
                        <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                          activeTab === 'inventory' ? 'text-emerald-600 font-black' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          Stok
                        </span>
                      </button>

                      {/* Suppliers */}
                      <button
                        onClick={() => {
                          setActiveTab('suppliers');
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                          activeTab === 'suppliers' 
                            ? 'bg-sky-50 border-sky-400 shadow-sm' 
                            : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                        } p-0.5`}>
                          <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                            activeTab === 'suppliers' 
                              ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md' 
                              : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                          }`}>
                            <Building className="w-3.5 h-3.5" />
                          </span>
                        </span>
                        <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                          activeTab === 'suppliers' ? 'text-blue-600 font-black' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          Sales
                        </span>
                      </button>

                      {/* Customers */}
                      <button
                        onClick={() => {
                          setActiveTab('customers');
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                          activeTab === 'customers' 
                            ? 'bg-pink-50 border-pink-400 shadow-sm' 
                            : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                        } p-0.5`}>
                          <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                            activeTab === 'customers' 
                              ? 'bg-gradient-to-tr from-pink-500 to-rose-600 text-white shadow-md' 
                              : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                          }`}>
                            <Users className="w-3.5 h-3.5" />
                          </span>
                        </span>
                        <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                          activeTab === 'customers' ? 'text-rose-600 font-black' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          Pasien
                        </span>
                      </button>

                      {/* Doctors */}
                      <button
                        onClick={() => {
                          setActiveTab('doctors');
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                          activeTab === 'doctors' 
                            ? 'bg-purple-50 border-purple-400 shadow-sm' 
                            : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                        } p-0.5`}>
                          <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                            activeTab === 'doctors' 
                              ? 'bg-gradient-to-tr from-purple-500 to-fuchsia-600 text-white shadow-md' 
                              : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                          }`}>
                            <Stethoscope className="w-3.5 h-3.5" />
                          </span>
                        </span>
                        <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                          activeTab === 'doctors' ? 'text-purple-600 font-black' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          Dokter
                        </span>
                      </button>

                      {/* WhatsApp */}
                      <button
                        onClick={() => {
                          setActiveTab('whatsapp');
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                          activeTab === 'whatsapp' 
                            ? 'bg-teal-50 border-teal-400 shadow-sm' 
                            : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                        } p-0.5`}>
                          <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                            activeTab === 'whatsapp' 
                              ? 'bg-gradient-to-tr from-teal-500 to-green-600 text-white shadow-md' 
                              : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                          }`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                          </span>
                        </span>
                        <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                          activeTab === 'whatsapp' ? 'text-teal-600 font-black' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          WA API
                        </span>
                      </button>

                      {/* Reports (Admin only) */}
                      {activeEmployee && activeEmployee.role === 'admin' && (
                        <button
                          onClick={() => {
                            setActiveTab('reports');
                            setShowMenuDropdown(false);
                          }}
                          className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                        >
                          <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                            activeTab === 'reports' 
                              ? 'bg-rose-50 border-rose-400 shadow-sm' 
                              : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                          } p-0.5`}>
                            <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                              activeTab === 'reports' 
                                ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-md' 
                                : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                            }`}>
                              <BarChart2 className="w-3.5 h-3.5" />
                            </span>
                          </span>
                          <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                            activeTab === 'reports' ? 'text-rose-600 font-black' : 'text-slate-500 group-hover:text-slate-800'
                          }`}>
                            Laporan
                          </span>
                        </button>
                      )}

                      {/* Settings */}
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                          activeTab === 'settings' 
                            ? 'bg-slate-200 border-slate-400 shadow-sm' 
                            : 'bg-slate-100 border-slate-200/60 group-hover:bg-slate-200/50 group-hover:border-slate-300'
                        } p-0.5`}>
                          <span className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shadow-3xs ${
                            activeTab === 'settings' 
                              ? 'bg-gradient-to-tr from-slate-600 to-slate-800 text-white shadow-md' 
                              : 'bg-white text-slate-500 border border-slate-100 group-hover:text-slate-800'
                          }`}>
                            <Settings className="w-3.5 h-3.5" />
                          </span>
                        </span>
                        <span className={`text-[7.5px] font-black tracking-tight leading-none text-center truncate w-full px-0.5 mt-0.5 transition-colors ${
                          activeTab === 'settings' ? 'text-slate-800 font-black' : 'text-slate-500 group-hover:text-slate-800'
                        }`}>
                          Sistem
                        </span>
                      </button>
                    </div>

                    {/* Logout Button */}
                    <div className="w-full mt-2 flex flex-col items-center">
                      {/* Samsung Edge-style Dotted Separator */}
                      <div className="w-full border-t-[2px] border-dotted border-slate-300/80 mb-2" />
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowMenuDropdown(false);
                        }}
                        className="flex flex-col items-center text-center gap-0.5 cursor-pointer w-full group outline-none"
                      >
                        <span className="w-9 h-9 rounded-full flex items-center justify-center p-0.5 bg-rose-50 border-2 border-rose-200 group-hover:bg-rose-100 group-hover:border-rose-300 transition-all duration-300 shrink-0 shadow-3xs">
                          <span className="w-6.5 h-6.5 rounded-full flex items-center justify-center bg-white text-rose-600 border border-rose-100 shadow-2xs group-hover:scale-105 duration-200">
                            <LogOut className="w-3 h-3" />
                          </span>
                        </span>
                        <span className="text-[7.5px] font-black tracking-tight leading-none text-rose-500 group-hover:text-rose-700 mt-0.5">
                          Logout
                        </span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT STAGE */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">

        {/* Tab Router Switch */}
        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && (
            <Dashboard
              medicines={medicines}
              customers={customers}
              salesHistory={salesHistory}
              doctors={doctors}
              activeEmployee={activeEmployee!}
              settings={settings}
              setActiveTab={setActiveTab}
              theme={settings.theme}
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions
              salesHistory={salesHistory}
              theme={settings.theme}
              settings={settings}
            />
          )}

          {activeTab === 'pos' && (
            <POS
              medicines={medicines}
              customers={customers}
              onNewSale={handleNewSale}
              onUpdateMedicineStock={updateMedicineStock}
              onUpdateCustomerPoints={updateCustomerPoints}
              activeEmployee={activeEmployee}
              settings={settings}
              theme={settings.theme}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              medicines={medicines}
              suppliers={suppliers}
              stockInflows={stockInflows}
              onAddMedicine={addMedicine}
              onUpdateMedicine={updateMedicine}
              onDeleteMedicine={deleteMedicine}
              onAddStockInflow={addStockInflow}
              onUpdateSupplierDebt={updateSupplierDebt}
              theme={settings.theme}
            />
          )}

          {activeTab === 'suppliers' && (
            <SalesSuppliers
              suppliers={suppliers}
              stockInflows={stockInflows}
              medicines={medicines}
              onAddSupplier={addSupplier}
              onUpdateSupplier={updateSupplier}
              onDeleteSupplier={deleteSupplier}
              onPayDebt={handlePaySupplierDebt}
              theme={settings.theme}
            />
          )}

          {activeTab === 'customers' && (
            <Customers
              customers={customers}
              salesHistory={salesHistory}
              onAddCustomer={addCustomer}
              onUpdateCustomer={updateCustomer}
              onDeleteCustomer={deleteCustomer}
              theme={settings.theme}
            />
          )}

          {activeTab === 'doctors' && (
            <Doctors
              doctors={doctors}
              onAddDoctor={addDoctor}
              onUpdateDoctor={updateDoctor}
              onDeleteDoctor={deleteDoctor}
              settings={settings}
              theme={settings.theme}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              salesHistory={salesHistory}
              medicines={medicines}
              suppliers={suppliers}
              theme={settings.theme}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsappSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              theme={settings.theme}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsComponent
              settings={settings}
              onUpdateSettings={updateSettings}
              activeEmployee={activeEmployee}
              onLogout={handleLogout}
              onBackupData={handleBackupData}
              onRestoreData={handleRestoreData}
              theme={settings.theme}
            />
          )}
        </div>
      </main>

      {/* Center Popup Notification */}
      <AnimatePresence>
        {showNotificationDropdown && (
          <>
            {/* Full screen backdrop for centering */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[998] flex items-center justify-center p-4"
              onClick={() => setShowNotificationDropdown(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-slate-200/80 p-6 text-slate-800 space-y-4 z-[999]"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <span className="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">Notifikasi Sistem</span>
                  <button onClick={() => setShowNotificationDropdown(false)} className="text-[10px] text-indigo-600 font-bold hover:underline">Tutup</button>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin">
                  {/* Low Stock Alerts */}
                  {lowStockCount > 0 ? (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                        <span>{lowStockCount} Obat Butuh Restock</span>
                      </div>
                      <p className="text-[10px] text-rose-600 leading-tight">
                        Beberapa obat telah mencapai atau di bawah batas minimum stok yang ditentukan. Segera lakukan pemesanan ke Sales Representative.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>Stok Obat Aman</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 leading-tight">
                        Seluruh katalog obat memiliki stok di atas ambang minimum. Kinerja operasional optimal.
                      </p>
                    </div>
                  )}

                  {/* Printer status info */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Bluetooth className={`w-4 h-4 ${settings.printerConnected ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-bold block text-slate-700">Bluetooth Printer</span>
                        <span className="text-slate-400 font-mono text-[9px]">{settings.printerName}</span>
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold ${settings.printerConnected ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                      {settings.printerConnected ? 'Connected' : 'Offline'}
                    </span>
                  </div>

                  {/* Employee Status */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <div>
                        <span className="font-bold block text-slate-700">Karyawan Aktif</span>
                        <span className="text-slate-400 capitalize">{activeEmployee.role} - {activeEmployee.username}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
