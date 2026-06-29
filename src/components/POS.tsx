import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Barcode, Plus, Minus, Trash2, Search, Receipt, Printer, QrCode,
  UserCheck, Percent, Wifi, Smartphone, Bluetooth, Check, RefreshCw, X, Camera, Sparkles, Delete, Clock
} from 'lucide-react';
import { Medicine, Customer, Sale, AppSettings } from '../types';
import { formatRupiah, generateInvoiceNumber, calculateLoyaltyPoints } from '../utils';
import { sendWhatsAppMessage } from '../utils/whatsapp';

interface POSProps {
  medicines: Medicine[];
  customers: Customer[];
  onNewSale: (sale: Sale) => void;
  onUpdateMedicineStock: (id: string, newStock: number) => void;
  onUpdateCustomerPoints: (id: string, newPoints: number) => void;
  activeEmployee: any;
  settings: AppSettings;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function POS({
  medicines,
  customers,
  onNewSale,
  onUpdateMedicineStock,
  onUpdateCustomerPoints,
  activeEmployee,
  settings,
  theme
}: POSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ medicine: Medicine; quantity: number }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashAmount, setCashAmount] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedCode, setScannedCode] = useState('');

  // Camera integration state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Bluetooth Print state
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [searchingPrinters, setSearchingPrinters] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState(settings.printerName || '');
  const [isPrinterConnected, setIsPrinterConnected] = useState(settings.printerConnected);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<Sale | null>(null);

  // Digital Payment State
  const [showQRModal, setShowQRModal] = useState(false);

  // Today's Sales State (For cashier dashboard)
  const [todaySales, setTodaySales] = useState<Sale[]>([]);

  // Focus scanner ref or search ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load today's transactions
  const loadTodaySales = () => {
    try {
      const stored = localStorage.getItem('apocute_sales');
      if (stored) {
        const parsed: Sale[] = JSON.parse(stored);
        const todayStr = new Date().toISOString().split('T')[0];
        const filtered = parsed.filter(s => s.date.startsWith(todayStr));
        setTodaySales(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTodaySales();
  }, []);

  // Filter medicines based on search term (name, code, category)
  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.includes(searchTerm) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add item to cart
  const addToCart = (medicine: Medicine) => {
    if (medicine.stock <= 0) {
      alert(`Maaf, stok ${medicine.name} habis!`);
      return;
    }

    const existing = cart.find(item => item.medicine.id === medicine.id);
    if (existing) {
      if (existing.quantity >= medicine.stock) {
        alert(`Tidak bisa menambah lebih banyak. Stok maksimum adalah ${medicine.stock}.`);
        return;
      }
      setCart(cart.map(item =>
        item.medicine.id === medicine.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { medicine, quantity: 1 }]);
    }
  };

  // Modify quantity
  const updateQuantity = (medicineId: string, delta: number) => {
    const item = cart.find(i => i.medicine.id === medicineId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.medicine.id !== medicineId));
    } else {
      if (newQty > item.medicine.stock) {
        alert(`Stok hanya tersedia ${item.medicine.stock} unit.`);
        return;
      }
      setCart(cart.map(i =>
        i.medicine.id === medicineId ? { ...i, quantity: newQty } : i
      ));
    }
  };

  // Remove from cart
  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter(i => i.medicine.id !== medicineId));
  };

  // Calculate totals
  const subtotal = cart.reduce((acc, curr) => acc + (curr.medicine.sellPrice * curr.quantity), 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = Math.max(0, subtotal - discountAmount);
  const changeAmount = cashAmount ? Math.max(0, parseInt(cashAmount) - total) : 0;

  // Simulate scanning code
  const triggerScanCode = (code: string) => {
    setScanStatus('scanning');
    setScannedCode(code);
    setTimeout(() => {
      const match = medicines.find(m => m.code === code);
      if (match) {
        setScanStatus('success');
        addToCart(match);
        setTimeout(() => {
          setShowScanner(false);
          setScanStatus('idle');
          setScannedCode('');
        }, 1000);
      } else {
        alert(`Produk dengan Barcode ${code} tidak ditemukan!`);
        setScanStatus('idle');
        setScannedCode('');
      }
    }, 1200);
  };

  // Camera integration effects
  const startCameraScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      setCameraActive(false);
    }
  };

  const stopCameraScan = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setCameraActive(false);
  };

  useEffect(() => {
    if (showScanner) {
      startCameraScan();
    } else {
      stopCameraScan();
    }
    return () => {
      stopCameraScan();
    };
  }, [showScanner]);

  // Bind stream to video element when stream is ready
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Touch Calculator keypad handler
  const handleNumpadPress = (val: string) => {
    if (val === 'C') {
      setCashAmount('');
    } else if (val === '00') {
      setCashAmount(prev => prev ? prev + '00' : '');
    } else if (val.startsWith('+')) {
      const addValue = parseInt(val.replace(/[^\d]/g, '')) || 0;
      setCashAmount(prev => {
        const current = parseInt(prev) || 0;
        return (current + addValue).toString();
      });
    } else {
      setCashAmount(prev => {
        // Prevent typing more than 9 digits (billion rupiah range) for safety
        if (prev.length >= 9) return prev;
        return prev + val;
      });
    }
  };

  // Connect Bluetooth Printer
  const connectBluetoothPrinter = async () => {
    setSearchingPrinters(true);
    // Real Web Bluetooth API implementation in a try/catch block
    try {
      if ('bluetooth' in navigator) {
        // Since we are in an iframe sandbox, requestDevice will usually reject with SecurityError
        const device = await (navigator as any).bluetooth.requestDevice({
          filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }] // Standard printer service UUID
        });
        setSelectedPrinter(device.name || 'Bluetooth Printer');
        setIsPrinterConnected(true);
      } else {
        throw new Error('Bluetooth not supported');
      }
    } catch (err) {
      // Elegant simulated fallback connecting with beautiful thermal printer options
      setTimeout(() => {
        setPrinters([
          'ApoCute Thermal BT-58 (Terhubung)',
          'Thermal Printer PT-210',
          'Panda BT-Receipt-Printer'
        ]);
        setSearchingPrinters(false);
      }, 1500);
    }
  };

  // Handle finalize sale
  const handleCheckout = (shouldPrint: boolean = false) => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    if (paymentMethod === 'Cash' && (!cashAmount || parseInt(cashAmount) < total)) {
      alert('Masukkan jumlah uang tunai pembayaran yang cukup!');
      return;
    }

    // Capture customer name
    const customer = customers.find(c => c.id === selectedCustomerId);

    const saleRecord: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      items: cart.map(item => ({
        medicineId: item.medicine.id,
        name: item.medicine.name,
        quantity: item.quantity,
        price: item.medicine.sellPrice,
        total: item.medicine.sellPrice * item.quantity
      })),
      subtotal,
      discount: discountAmount,
      total,
      paymentMethod,
      customerId: selectedCustomerId || undefined,
      customerName: customer ? customer.name : undefined,
      cashierName: activeEmployee ? activeEmployee.username : 'Kasir ApoCute'
    };

    // Deduct stock and grant points
    cart.forEach(item => {
      onUpdateMedicineStock(item.medicine.id, item.medicine.stock - item.quantity);
    });

    if (customer) {
      const earnedPoints = calculateLoyaltyPoints(total);
      onUpdateCustomerPoints(customer.id, customer.points + earnedPoints);
    }

    onNewSale(saleRecord);
    setPrintedReceipt(saleRecord);
    setTimeout(() => {
      loadTodaySales();
    }, 100);

    // If QRIS or digital, maybe show success screen first
    if (paymentMethod !== 'Cash' && paymentMethod !== 'Transfer') {
      setShowQRModal(false);
    }

    // Automatically send WhatsApp digital receipt if customer has phone number
    if (customer && customer.phone) {
      const receiptMessage = `Halo *${customer.name}*,\n\nTerima kasih telah berbelanja obat di *${settings.companyName || 'ApoCute Ceria'}*.\nBerikut adalah *Struk Nota Digital* Anda:\n\nNo. Invoice: *${saleRecord.invoiceNumber}*\nTanggal: ${new Date(saleRecord.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n*Rincian Belanja:*\n${cart.map(item => `- ${item.medicine.name} (${item.quantity} unit) @ ${formatRupiah(item.medicine.sellPrice)}: ${formatRupiah(item.medicine.sellPrice * item.quantity)}`).join('\n')}\n\n*Subtotal:* ${formatRupiah(subtotal)}\n*Diskon (${discountPercent}%):* -${formatRupiah(discountAmount)}\n*Total Pembayaran:* *${formatRupiah(total)}*\n*Metode:* ${paymentMethod}\n\n*Loyalty Poin:* +${calculateLoyaltyPoints(total)} Poin\n\n_Semoga lekas sembuh dan sehat selalu ya! ❤️_\n-- Layanan Pelanggan ${settings.companyName || 'ApoCute Ceria'}`;
      
      sendWhatsAppMessage(settings, customer.phone, customer.name, receiptMessage, 'struk_digital')
        .then(() => {
          console.log(`Digital receipt sent successfully to ${customer.name} (${customer.phone})`);
        })
        .catch(err => {
          console.error('WhatsApp sending failed:', err);
        });
    }

    if (shouldPrint) {
      setIsPrinting(true);
      setTimeout(() => {
        setIsPrinting(false);
        alert('Resi berhasil dicetak via printer Bluetooth ApoCute BT-58!');
        resetPOS();
      }, 2000);
    } else {
      setPrintedReceipt(saleRecord);
      setShowPrinterModal(true); // Open simulated receipt printing modal
    }
  };

  const resetPOS = () => {
    setCart([]);
    setSelectedCustomerId('');
    setDiscountPercent(0);
    setPaymentMethod('Cash');
    setCashAmount('');
    setPrintedReceipt(null);
  };

  // Theme styling helpers
  const getThemeStyles = () => {
    switch (theme) {
      case 'lavender':
        return {
          primary: 'bg-indigo-600 hover:bg-indigo-700 text-indigo-50',
          accent: 'indigo',
          border: 'border-indigo-100',
          bg: 'bg-indigo-50/40',
          gradient: 'from-indigo-500 to-purple-600',
          btnLight: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600',
          glow: 'shadow-indigo-100'
        };
      case 'minty':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50',
          accent: 'emerald',
          border: 'border-emerald-100',
          bg: 'bg-emerald-50/40',
          gradient: 'from-emerald-400 to-teal-600',
          btnLight: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600',
          glow: 'shadow-emerald-100'
        };
      case 'ocean':
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-sky-50',
          accent: 'sky',
          border: 'border-sky-100',
          bg: 'bg-sky-50/40',
          gradient: 'from-sky-400 to-blue-600',
          btnLight: 'bg-sky-50 hover:bg-sky-100 text-sky-600',
          glow: 'shadow-sky-100'
        };
      case 'sunset':
        return {
          primary: 'bg-orange-500 hover:bg-orange-600 text-orange-50',
          accent: 'orange',
          border: 'border-orange-100',
          bg: 'bg-orange-50/40',
          gradient: 'from-orange-400 to-amber-600',
          btnLight: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
          glow: 'shadow-orange-100'
        };
      case 'cherry':
        return {
          primary: 'bg-rose-500 hover:bg-rose-600 text-rose-50',
          accent: 'rose',
          border: 'border-rose-100',
          bg: 'bg-rose-50/40',
          gradient: 'from-pink-400 to-rose-600',
          btnLight: 'bg-rose-50 hover:bg-rose-100 text-rose-600',
          glow: 'shadow-rose-100'
        };
    }
  };

  const themeStyle = getThemeStyles();

  const accentTextColor = 
    theme === 'lavender' ? 'text-indigo-600' :
    theme === 'minty' ? 'text-emerald-600' :
    theme === 'ocean' ? 'text-sky-600' :
    theme === 'sunset' ? 'text-orange-600' :
    'text-rose-600'; // cherry

  return (
    <div className="space-y-6 pb-24 relative min-h-[85vh] font-sans">
      
      {/* 1. TOP SECTION: KERANJANG BELANJA (Keranjang Berada Paling Atas) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-3">
            <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-500" />
              Keranjang Belanja Utama
            </h4>
            <button
              onClick={resetPOS}
              className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-rose-600 px-2.5 py-1 rounded-lg font-bold border border-slate-150 transition-all cursor-pointer"
            >
              Kosongkan Keranjang
            </button>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-1">
                <Receipt className="w-8 h-8 mx-auto stroke-1 text-slate-300 animate-pulse" />
                <p className="text-xs font-bold text-slate-500">Keranjang Masih Kosong</p>
                <p className="text-[10px] text-slate-400">Scan obat atau gunakan bar pencarian di bawah untuk tebus obat.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.medicine.id} className="flex items-center justify-between gap-3 border-b border-slate-100/60 pb-2.5">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-display font-bold text-slate-800 text-xs truncate">{item.medicine.name}</h5>
                    <span className="text-[9px] text-slate-450 font-mono block mt-0.5">
                      {formatRupiah(item.medicine.sellPrice)} × {item.quantity} = <span className="font-bold text-slate-700">{formatRupiah(item.medicine.sellPrice * item.quantity)}</span>
                    </span>
                  </div>

                  {/* Quantity Selector on the right */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.medicine.id, -1)}
                      className="w-5 h-5 rounded-md bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all border border-slate-150 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-[11px] text-slate-700 w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.medicine.id, 1)}
                      className="w-5 h-5 rounded-md bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all border border-slate-150 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.medicine.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition-all shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subtotal Display inside top card */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>Subtotal Item ({cart.reduce((a, b) => a + b.quantity, 0)} unit):</span>
            <span className="font-bold text-slate-700">{formatRupiah(subtotal)}</span>
          </div>
        )}
      </div>

      {/* 2. MIDDLE SECTION: PRISTINE WHITE TACTILE CASH CALCULATOR (Kalkulator Warna Putih Bersih di Tengah) */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-amber-50 rounded-lg text-amber-500">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </span>
            <h3 className="font-display font-bold text-slate-800 text-sm">Register Kalkulator Pembayaran Kasir</h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full font-mono">Tunai / Non-Tunai</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LCD Digital Display (Total Bill, Cash received, Change amount) */}
          <div className="lg:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-col justify-between font-mono text-slate-800 relative overflow-hidden shadow-inner">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span className="font-sans font-bold">TOTAL TAGIHAN</span>
                <span className="font-black text-slate-700">{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-200/50 pt-2">
                <span className="font-sans font-bold">JUMLAH DITERIMA</span>
                <span className="font-black text-emerald-600">
                  {cashAmount ? formatRupiah(parseInt(cashAmount)) : 'Rp 0'}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200/80 pt-3 mt-3 flex justify-between items-end">
              <span className="text-[10px] text-slate-400 font-sans font-black uppercase">Uang Kembalian</span>
              <span className={`font-black text-xl leading-none ${cashAmount && parseInt(cashAmount) >= total ? 'text-amber-500' : 'text-slate-400'}`}>
                {cashAmount && parseInt(cashAmount) >= total ? formatRupiah(changeAmount) : 'Rp 0'}
              </span>
            </div>
          </div>

          {/* Clean White Tactile Numpad Grid */}
          <div className="lg:col-span-8 grid grid-cols-4 sm:grid-cols-8 gap-2">
            {/* Keys */}
            {['7', '8', '9'].map(num => (
              <button key={num} type="button" onClick={() => handleNumpadPress(num)} className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-150 transition-all active:scale-95 cursor-pointer">{num}</button>
            ))}
            <button type="button" onClick={() => handleNumpadPress('+10000')} className="h-10 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100 transition-all active:scale-95 cursor-pointer">+10k</button>
            <button type="button" onClick={() => handleNumpadPress('+20000')} className="h-10 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100 transition-all active:scale-95 cursor-pointer">+20k</button>

            {['4', '5', '6'].map(num => (
              <button key={num} type="button" onClick={() => handleNumpadPress(num)} className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-150 transition-all active:scale-95 cursor-pointer">{num}</button>
            ))}
            <button type="button" onClick={() => handleNumpadPress('+50000')} className="h-10 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100 transition-all active:scale-95 cursor-pointer">+50k</button>

            {['1', '2', '3'].map(num => (
              <button key={num} type="button" onClick={() => handleNumpadPress(num)} className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-150 transition-all active:scale-95 cursor-pointer">{num}</button>
            ))}
            <button type="button" onClick={() => handleNumpadPress('+100000')} className="h-10 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100 transition-all active:scale-95 cursor-pointer">+100k</button>

            <button type="button" onClick={() => handleNumpadPress('C')} className="h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-150 transition-all active:scale-95 cursor-pointer">C</button>
            <button type="button" onClick={() => handleNumpadPress('0')} className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-150 transition-all active:scale-95 cursor-pointer">0</button>
            <button type="button" onClick={() => handleNumpadPress('00')} className="h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-150 transition-all active:scale-95 cursor-pointer">00</button>
            
            <button
              type="button"
              onClick={() => setCashAmount(total.toString())}
              className="col-span-2 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 font-display font-bold text-[10px] transition-all active:scale-95 cursor-pointer"
            >
              Uang Pas
            </button>
            <button
              type="button"
              onClick={() => {
                const roundedUp = Math.ceil(total / 50000) * 50000;
                setCashAmount(roundedUp.toString());
              }}
              className="col-span-2 h-10 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-100 text-sky-700 font-display font-bold text-[10px] transition-all active:scale-95 cursor-pointer"
            >
              Pecahan Terdekat
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: CARA PEMBAYARAN, PELANGGAN, DISKON & PROSES BAYAR (Cara Pembayaran Berada Paling Bawah) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-50 pb-2.5">
          Proses & Cara Pembayaran Penjualan
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Column Left: Select Payment Method Button Group */}
          <div className="lg:col-span-6 space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Cash', label: 'Uang Tunai', icon: Receipt, color: 'bg-emerald-500' },
                { name: 'QRIS', label: 'QRIS Dinamis', icon: QrCode, color: 'bg-indigo-500' },
                { name: 'GoPay', label: 'E-Wallet GoPay', icon: Smartphone, color: 'bg-sky-500' },
                { name: 'OVO', label: 'E-Wallet OVO', icon: Smartphone, color: 'bg-purple-500' }
              ].map((m) => {
                const IconComp = m.icon;
                const isActive = paymentMethod === m.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.name);
                      if (m.name !== 'Cash') {
                        setCashAmount(total.toString());
                      } else {
                        setCashAmount('');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      isActive 
                        ? 'border-slate-800 bg-slate-50 text-slate-800 ring-2 ring-slate-800/10' 
                        : 'border-slate-150 hover:border-slate-200 text-slate-600 bg-white'
                    }`}
                  >
                    <span className={`p-1 rounded-lg ${m.color} text-white shrink-0`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <span className="font-display font-bold text-xs block leading-none">{m.name}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{m.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500">
              Pilih <span className="font-bold text-slate-700">QRIS</span> atau <span className="font-bold text-slate-700">E-Wallet</span> untuk sinkronisasi QR digital instant otomatis ke layar kasir.
            </div>
          </div>

          {/* Column Right: Customer Select, Discount, and Pay Button */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer Select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pelanggan ApoCute Loyalty</label>
                <div className="relative">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-700 font-sans cursor-pointer"
                  >
                    <option value="">-- Umum / Walk-in --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</option>
                    ))}
                  </select>
                </div>
                {selectedCustomerId && (
                  <div className="text-[9px] text-indigo-700 font-bold bg-indigo-50 p-1.5 rounded-lg mt-1 inline-block">
                    Loyalty Poin: +{calculateLoyaltyPoints(total)} Poin didapatkan!
                  </div>
                )}
              </div>

              {/* Discount Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Potongan Diskon Tebus Obat (%)</label>
                <div className="relative">
                  <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent || ''}
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-indigo-500 text-slate-700"
                    placeholder="Masukkan diskon tebus"
                  />
                </div>
                {discountPercent > 0 && (
                  <div className="text-[9px] text-rose-600 font-bold bg-rose-50 p-1.5 rounded-lg mt-1 inline-block">
                    Hemat: -{formatRupiah(discountAmount)} ({discountPercent}% potongan)
                  </div>
                )}
              </div>
            </div>

            {/* Final Checkout Button */}
            <div className="pt-2">
              {paymentMethod === 'QRIS' ? (
                <button
                  id="qris-checkout-btn"
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className={`w-full py-3.5 rounded-2xl font-display font-black text-sm text-center shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${themeStyle.primary}`}
                >
                  <QrCode className="w-4 h-4" />
                  Tampilkan QRIS & Selesaikan Pembayaran
                </button>
              ) : (
                <button
                  id="pos-checkout-btn"
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => handleCheckout(false)}
                  className={`w-full py-3.5 rounded-2xl font-display font-black text-sm text-center shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${themeStyle.primary} disabled:opacity-40 disabled:pointer-events-none`}
                >
                  <Receipt className="w-4 h-4" />
                  Bayar & Simpan Penjualan Ke Kas Utama
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. FLOATING BOTTOM SEARCH & BARCODE BAR (Border Search & Barcode mengambang di bawah - tidak ikut discroll) */}
      <div className="fixed bottom-4 left-4 right-4 lg:left-6 lg:right-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3 z-40 flex items-center gap-3 transition-all">
        
        {/* POPUP OVERLAY ON TYPING (Menampilkan popup produk jika diketik) */}
        <AnimatePresence>
          {searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-full mb-3.5 left-0 right-0 max-h-[300px] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 flex flex-col gap-2.5 z-50 scrollbar-thin"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Popup Hasil Pencarian</span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-[10px] text-rose-500 font-bold hover:underline"
                >
                  Tutup Popup
                </button>
              </div>

              {filteredMedicines.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Tidak ada produk obat yang cocok dengan "{searchTerm}"
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredMedicines.map((med) => {
                    const isLowStock = med.stock <= med.minStock;
                    return (
                      <div
                        key={med.id}
                        onClick={() => {
                          addToCart(med);
                          setSearchTerm(''); // Clear search on item click
                        }}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-50/70 hover:border-slate-300 ${
                          isLowStock ? 'bg-rose-50/30 border-rose-100' : 'bg-slate-50/30 border-slate-150'
                        }`}
                      >
                        <div className="min-w-0">
                          <h5 className="font-display font-bold text-slate-800 text-xs truncate">{med.name}</h5>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono">{med.code}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-display font-bold text-slate-700 text-xs block">{formatRupiah(med.sellPrice)}</span>
                          <span className="text-[8.5px] font-bold text-slate-400">Stok: {med.stock}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Input Control */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari & ketik tebus obat (menampilkan popup produk)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-150 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-slate-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Floating Scan Button */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className={`flex items-center gap-1.5 py-2 px-4 rounded-xl font-display font-black text-[11px] border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all shrink-0`}
        >
          <Barcode className="w-4 h-4 text-indigo-600 animate-pulse" />
          Scan Barcode Camera
        </button>
      </div>

      {/* MODAL 1: Barcode Scanner with Live Camera Support */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-white px-5 py-4 flex justify-between items-center border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Camera className={`w-5 h-5 ${accentTextColor} animate-pulse`} />
                  <span className="font-display font-black text-sm text-slate-800">Scan Barcode Kamera</span>
                </div>
                <button
                  onClick={() => {
                    stopCameraScan();
                    setShowScanner(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 text-center space-y-4">
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  Arahkan barcode pada kemasan obat ke area kamera di bawah ini, atau gunakan tombol simulasi hardware di bawah jika kamera laptop Anda mati.
                </p>

                {/* Laser scan simulator and live video view */}
                <div className="relative w-full h-48 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-4 border-slate-900 shadow-inner">
                  {/* Camera view if active */}
                  {cameraActive ? (
                    <video
                      ref={(el) => {
                        videoRef.current = el;
                        if (el && cameraStream) {
                          el.srcObject = cameraStream;
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover opacity-85"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2 z-0">
                      <Camera className="w-8 h-8 text-slate-600 animate-pulse" />
                      <span className="text-[10px] font-semibold text-slate-400">Menghubungkan Kamera...</span>
                    </div>
                  )}

                  {/* Laser bar animation overlay */}
                  {scanStatus === 'scanning' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/30 z-10">
                      <div className="absolute w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-bounce top-1/2 left-0" />
                      <span className="bg-emerald-500/90 text-slate-950 font-black px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-mono animate-pulse">
                        Scanning: {scannedCode}
                      </span>
                    </div>
                  ) : scanStatus === 'success' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/80 z-20 space-y-2">
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="p-3 bg-emerald-500 rounded-full text-slate-950 shadow-lg"
                      >
                        <Check className="w-6 h-6 stroke-[3]" />
                      </motion.div>
                      <span className="text-xs font-bold text-emerald-300 font-display">Obat Berhasil Ditambahkan!</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-transparent z-10 pointer-events-none border-[12px] border-slate-950/40 flex items-center justify-center">
                      <div className="absolute w-full h-0.5 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,1)] animate-bounce" />
                      <div className="w-48 h-20 border-2 border-indigo-400 border-dashed rounded-lg opacity-40 animate-pulse" />
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 bg-slate-950/70 text-slate-300 text-[8px] font-mono px-2 py-0.5 rounded-md z-30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live Camera Stream
                  </div>
                </div>

                {/* Simulated physical hardware scan buttons */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulasi Klik Scan Hardware</label>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold">4 Produk</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {medicines.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => triggerScanCode(m.code)}
                        className="p-2 border border-slate-150 rounded-xl hover:bg-slate-50 flex flex-col text-left text-[10px] font-semibold text-slate-700 transition-all hover:border-indigo-300"
                      >
                        <span className="block font-bold truncate text-slate-800">{m.name}</span>
                        <span className="font-mono text-slate-400 text-[8.5px]">{m.code}</span>
                        <span className="text-[8px] mt-1 text-indigo-600 hover:underline">Scan Item</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Simulated Bluetooth Thermal Printer Roll */}
      <AnimatePresence>
        {showPrinterModal && printedReceipt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-400" />
                  <span className="font-display font-bold text-sm">Printer Bluetooth ApoCute BT-58</span>
                </div>
                <button onClick={() => { setShowPrinterModal(false); resetPOS(); }} className="text-white/75 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* BT settings in the popup */}
              <div className="bg-slate-50 p-3 border-b border-slate-150 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bluetooth className={`w-4 h-4 ${isPrinterConnected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold text-slate-600">
                    {isPrinterConnected ? `Terhubung: ${selectedPrinter}` : 'Bluetooth Printer Terputus'}
                  </span>
                </div>
                {isPrinterConnected ? (
                  <button
                    onClick={() => setIsPrinterConnected(false)}
                    className="text-[10px] text-rose-500 hover:underline font-bold"
                  >
                    Putuskan
                  </button>
                ) : (
                  <button
                    onClick={connectBluetoothPrinter}
                    disabled={searchingPrinters}
                    className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-1 rounded-md hover:bg-indigo-700 transition-all flex items-center gap-1"
                  >
                    {searchingPrinters ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Cari Printer
                  </button>
                )}
              </div>

              {/* Scan bluetooth results list */}
              {printers.length > 0 && !isPrinterConnected && (
                <div className="bg-amber-50 p-3 border-b border-slate-150 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Pilih Perangkat Terdeteksi:</span>
                  <div className="space-y-1">
                    {printers.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedPrinter(p);
                          setIsPrinterConnected(true);
                          setPrinters([]);
                        }}
                        className="w-full text-left p-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-between"
                      >
                        <span>{p}</span>
                        <Check className="w-3.5 h-3.5 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Thermal paper output view */}
              <div className="bg-slate-100 p-6 flex-1 overflow-y-auto flex justify-center items-start">
                <div className="w-64 bg-white shadow-md border-l border-r border-dashed border-slate-300 p-4 font-mono text-[10px] text-slate-800 space-y-4 relative leading-normal">
                  
                  {/* Jagged teeth edge simulation */}
                  <div className="absolute top-0 left-0 right-0 h-1 flex justify-between overflow-hidden">
                    {Array.from({ length: 26 }).map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-slate-100 rotate-45 transform -translate-y-1 shadow-inner" />
                    ))}
                  </div>

                  {/* Header */}
                  <div className="text-center space-y-1 pt-2">
                    <h4 className="font-bold text-xs uppercase">{settings.companyName || 'APOTEK APOCUTE'}</h4>
                    <p className="text-[8px] text-slate-500">JL. SEHAT BAHAGIA NO. 45, BANDUNG</p>
                    <p className="text-[8px] text-slate-500">TELP: (022) 12345678</p>
                    <div className="border-t border-slate-300 border-dashed my-2" />
                  </div>

                  {/* Meta data */}
                  <div className="space-y-0.5 text-[8.5px]">
                    <div className="flex justify-between">
                      <span>No: {printedReceipt.invoiceNumber}</span>
                      <span>{new Date(printedReceipt.date).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kasir: {printedReceipt.cashierName}</span>
                      <span>{new Date(printedReceipt.date).toLocaleDateString('id-ID')}</span>
                    </div>
                    {printedReceipt.customerName && (
                      <div className="flex justify-between font-bold text-indigo-700">
                        <span>Pelanggan:</span>
                        <span>{printedReceipt.customerName}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-300 border-dashed my-2" />
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {printedReceipt.items.map((it, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between font-semibold">
                          <span>{it.name}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[8.5px]">
                          <span>{it.quantity} x {formatRupiah(it.price)}</span>
                          <span>{formatRupiah(it.total)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-slate-300 border-dashed my-2" />
                  </div>

                  {/* Totals */}
                  <div className="space-y-1 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatRupiah(printedReceipt.subtotal)}</span>
                    </div>
                    {printedReceipt.discount > 0 && (
                      <div className="flex justify-between font-semibold text-rose-500">
                        <span>Diskon</span>
                        <span>-{formatRupiah(printedReceipt.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-xs">
                      <span>TOTAL</span>
                      <span>{formatRupiah(printedReceipt.total)}</span>
                    </div>
                    <div className="border-t border-slate-300 border-dashed my-2" />
                    <div className="flex justify-between">
                      <span>Metode</span>
                      <span className="font-bold">{printedReceipt.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Footer message */}
                  <div className="text-center space-y-1 pt-2">
                    <p className="font-bold">LEKAS SEMBUH & SEHAT SELALU</p>
                    <p className="text-[8px] text-slate-500">Terima kasih atas kunjungan Anda.</p>
                    <div className="border-t border-slate-300 border-dashed my-2" />
                    <div className="mx-auto flex flex-col items-center">
                      <Barcode className="w-20 h-6 stroke-1" />
                      <span className="text-[7px] text-slate-400 font-mono mt-0.5">{printedReceipt.invoiceNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex gap-3">
                <button
                  onClick={() => {
                    setShowPrinterModal(false);
                    resetPOS();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-display font-semibold text-xs text-slate-700 text-center transition-all"
                >
                  Tutup Kasir
                </button>
                <button
                  onClick={() => {
                    setIsPrinting(true);
                    setTimeout(() => {
                      setIsPrinting(false);
                      setShowPrinterModal(false);
                      resetPOS();
                      alert('Resi berhasil dicetak!');
                    }, 2000);
                  }}
                  disabled={isPrinting}
                  className={`flex-1 py-2.5 rounded-xl font-display font-bold text-xs text-white text-center shadow-md flex items-center justify-center gap-1.5 transition-all bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50`}
                >
                  {isPrinting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mencetak...
                    </>
                  ) : (
                    <>
                      <Printer className="w-3.5 h-3.5" />
                      Cetak Struk BT
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: QRIS Digital Payment Code */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 p-6 text-center space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-left">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                  <span className="font-display font-bold text-sm text-slate-800">QRIS Dinamis GPN</span>
                </div>
                <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Tagihan</span>
                <span className="text-2xl font-display font-black text-indigo-600 block">{formatRupiah(total)}</span>
              </div>

              {/* QR Code Illustration */}
              <div className="p-4 bg-white border-2 border-dashed border-indigo-200 rounded-3xl inline-block mx-auto relative shadow-sm">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-44 h-44">
                  {/* QR Background & Corner squares */}
                  <rect width="100" height="100" rx="10" fill="#ffffff" />
                  <rect x="5" y="5" width="22" height="22" rx="4" fill="#1e1b4b" stroke="#1e1b4b" strokeWidth="2" />
                  <rect x="9" y="9" width="14" height="14" rx="2" fill="#ffffff" />
                  <rect x="11" y="11" width="10" height="10" rx="1" fill="#4f46e5" />

                  <rect x="73" y="5" width="22" height="22" rx="4" fill="#1e1b4b" stroke="#1e1b4b" strokeWidth="2" />
                  <rect x="77" y="9" width="14" height="14" rx="2" fill="#ffffff" />
                  <rect x="79" y="11" width="10" height="10" rx="1" fill="#4f46e5" />

                  <rect x="5" y="73" width="22" height="22" rx="4" fill="#1e1b4b" stroke="#1e1b4b" strokeWidth="2" />
                  <rect x="9" y="77" width="14" height="14" rx="2" fill="#ffffff" />
                  <rect x="11" y="79" width="10" height="10" rx="1" fill="#4f46e5" />

                  {/* QR center cute pill logo */}
                  <rect x="40" y="40" width="20" height="20" rx="5" fill="#f43f5e" />
                  <circle cx="46" cy="50" r="1.5" fill="white" />
                  <circle cx="54" cy="50" r="1.5" fill="white" />
                  <path d="M 48 54 Q 50 56 52 54" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />

                  {/* Mock QR dots */}
                  <rect x="35" y="10" width="6" height="6" rx="1" fill="#1e293b" />
                  <rect x="45" y="15" width="4" height="4" rx="1" fill="#4f46e5" />
                  <rect x="55" y="8" width="8" height="4" rx="1" fill="#1e293b" />
                  <rect x="10" y="35" width="6" height="6" rx="1" fill="#1e293b" />
                  <rect x="15" y="48" width="4" height="4" rx="1" fill="#4f46e5" />
                  <rect x="8" y="55" width="8" height="4" rx="1" fill="#1e293b" />
                  
                  <rect x="75" y="35" width="8" height="8" rx="1" fill="#1e293b" />
                  <rect x="82" y="48" width="6" height="4" rx="1" fill="#4f46e5" />
                  <rect x="70" y="55" width="10" height="4" rx="1" fill="#1e293b" />

                  <rect x="35" y="75" width="8" height="6" rx="1" fill="#1e293b" />
                  <rect x="48" y="82" width="6" height="4" rx="1" fill="#4f46e5" />
                  <rect x="62" y="70" width="10" height="12" rx="1" fill="#1e293b" />
                </svg>
                {/* GPN logo badge in the QRIS box */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-900 text-white font-black px-2 py-0.5 rounded-md text-[8px] tracking-wide">
                  QRIS GPN
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-sans">Dukung pembayaran digital Indonesia: <strong>QRIS, LinkAja, OVO, GoPay, Dana, ShopeePay</strong>, dan Mobile Banking.</p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-display font-semibold text-xs text-slate-600 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleCheckout(false)}
                  className={`flex-1 py-2.5 rounded-xl font-display font-bold text-xs text-white shadow-md flex items-center justify-center gap-1.5 transition-all ${themeStyle.primary}`}
                >
                  <Check className="w-3.5 h-3.5" />
                  Sudah Dibayar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
