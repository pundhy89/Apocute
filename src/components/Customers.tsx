import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit2, Trash2, Phone, Calendar, User, Gift, Award,
  ShoppingBag, Check, CheckCircle, Clock, X, HeartPulse, Heart, Activity, PlusCircle, Bookmark
} from 'lucide-react';
import { Customer, Sale, Checkup } from '../types';
import { formatRupiah } from '../utils';

interface CustomersProps {
  customers: Customer[];
  salesHistory: Sale[];
  onAddCustomer: (cust: Customer) => void;
  onUpdateCustomer: (cust: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function Customers({
  customers,
  salesHistory,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  theme
}: CustomersProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Sub-tab selection for right-hand panel
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'checkup'>('history');

  // Form states for general customer info
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custBirthdate, setCustBirthdate] = useState('');
  const [custPoints, setCustPoints] = useState('0');

  // Form states for checkups
  const [showCheckupModal, setShowCheckupModal] = useState(false);
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [bloodSugar, setBloodSugar] = useState('100');
  const [cholesterol, setCholesterol] = useState('180');
  const [weight, setWeight] = useState('65');
  const [complaints, setComplaints] = useState('');

  // Diseases tags
  const [diseaseInput, setDiseaseInput] = useState('');

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setCustName(c.name);
    setCustPhone(c.phone);
    setCustBirthdate(c.birthdate);
    setCustPoints(c.points.toString());
    setShowAddModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !custBirthdate) {
      alert('Mohon lengkapi semua data wajib!');
      return;
    }

    const customerData: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: custName,
      phone: custPhone,
      birthdate: custBirthdate,
      points: parseInt(custPoints) || 0,
      joinedAt: editingCustomer ? editingCustomer.joinedAt : new Date().toISOString().split('T')[0]
    };

    if (editingCustomer) {
      onUpdateCustomer(customerData);
    } else {
      onAddCustomer(customerData);
    }

    closeModal();
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingCustomer(null);
    setCustName('');
    setCustPhone('');
    setCustBirthdate('');
    setCustPoints('0');
  };

  // Check upcoming birthdays (current month birthdays as promostats)
  const getUpcomingBirthdays = () => {
    const currentMonth = new Date().getMonth(); // 0-indexed (e.g. 5 is June)
    return customers.filter(c => {
      if (!c.birthdate) return false;
      const birthMonth = new Date(c.birthdate).getMonth();
      return birthMonth === currentMonth;
    });
  };

  const birthdayPeeps = getUpcomingBirthdays();

  const getThemeStyles = () => {
    switch (theme) {
      case 'lavender':
        return {
          primary: 'bg-indigo-600 hover:bg-indigo-700 text-indigo-50',
          accent: 'indigo',
          border: 'border-indigo-100',
          gradient: 'from-indigo-500 to-purple-600',
          bg: 'bg-indigo-50/20'
        };
      case 'minty':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50',
          accent: 'emerald',
          border: 'border-emerald-100',
          gradient: 'from-emerald-400 to-teal-600',
          bg: 'bg-emerald-50/20'
        };
      case 'ocean':
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-sky-50',
          accent: 'sky',
          border: 'border-sky-100',
          gradient: 'from-sky-400 to-blue-600',
          bg: 'bg-sky-50/20'
        };
      case 'sunset':
        return {
          primary: 'bg-orange-500 hover:bg-orange-600 text-orange-50',
          accent: 'orange',
          border: 'border-orange-100',
          gradient: 'from-orange-400 to-amber-600',
          bg: 'bg-orange-50/20'
        };
      case 'cherry':
        return {
          primary: 'bg-rose-500 hover:bg-rose-600 text-rose-50',
          accent: 'rose',
          border: 'border-rose-100',
          gradient: 'from-pink-400 to-rose-600',
          bg: 'bg-rose-50/20'
        };
    }
  };

  const style = getThemeStyles();

  // Get selected customer purchase history list
  const getCustomerSalesHistory = (customerId: string) => {
    return salesHistory.filter(s => s.customerId === customerId);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedHistory = selectedCustomerId ? getCustomerSalesHistory(selectedCustomerId) : [];

  const handleAddCheckup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const newCheckup: Checkup = {
      id: `checkup-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      systolic: parseInt(systolic) || 120,
      diastolic: parseInt(diastolic) || 80,
      bloodSugar: parseInt(bloodSugar) || 100,
      cholesterol: parseInt(cholesterol) || 180,
      weight: parseFloat(weight) || 60,
      complaints: complaints || 'Tidak ada keluhan'
    };

    const updatedCheckups = selectedCustomer.checkups ? [newCheckup, ...selectedCustomer.checkups] : [newCheckup];
    onUpdateCustomer({
      ...selectedCustomer,
      checkups: updatedCheckups
    });
    setShowCheckupModal(false);
    setComplaints('');
    alert('Data pemeriksaan (checkup) kesehatan berhasil dicatat!');
  };

  const handleAddDisease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !diseaseInput.trim()) return;
    const currentDiseases = selectedCustomer.medicalHistory || [];
    if (currentDiseases.includes(diseaseInput.trim())) {
      alert('Riwayat penyakit sudah tercatat!');
      return;
    }
    onUpdateCustomer({
      ...selectedCustomer,
      medicalHistory: [...currentDiseases, diseaseInput.trim()]
    });
    setDiseaseInput('');
  };

  const handleRemoveDisease = (disease: string) => {
    if (!selectedCustomer) return;
    const currentDiseases = selectedCustomer.medicalHistory || [];
    onUpdateCustomer({
      ...selectedCustomer,
      medicalHistory: currentDiseases.filter(d => d !== disease)
    });
  };

  return (
    <div className="space-y-6">
      {/* Birthdays Reminder section */}
      {birthdayPeeps.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-150 rounded-3xl flex items-start gap-3.5 shadow-xs">
          <div className="p-2 bg-rose-500 rounded-2xl text-white shrink-0 mt-0.5 animate-pulse">
            <Gift className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-display font-bold text-rose-900">Pengingat Ulang Tahun Bulan Ini ({birthdayPeeps.length} Pelanggan)</h4>
            <p className="text-[11px] text-rose-700 font-sans mt-0.5">Berikan mereka promosi ulang tahun khusus berupa diskon 15% atau bonus voucher loyalti! Kirim WA ke: {birthdayPeeps.map(c => `${c.name} (${c.phone})`).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">Database Pelanggan & Loyalitas</h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Kelola data keanggotaan pelanggan, histori pembelian obat, serta poin loyalitas mereka.</p>
        </div>
        <button
          id="add-customer-btn"
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-display font-bold text-xs shadow-md transition-all ${style.primary}`}
        >
          <Plus className="w-4 h-4" />
          Tambah Pelanggan Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left list: customers */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            Daftar Pelanggan Terdaftar
          </h4>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className={`p-4 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-indigo-200 transition-all cursor-pointer ${
                  selectedCustomerId === c.id
                    ? 'border-indigo-400 bg-indigo-50/20'
                    : 'border-slate-100 bg-slate-50/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-slate-800 text-xs">{c.name}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold font-sans flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Lahir:{' '}
                      {new Date(c.birthdate).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Poin Loyalitas</span>
                    <span className="font-mono font-bold text-indigo-600 text-xs flex items-center gap-0.5 justify-end">
                      <Award className="w-3.5 h-3.5" />
                      {c.points} Poin
                    </span>
                  </div>

                  <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-150 text-slate-600 transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus pelanggan ${c.name}?`)) {
                          onDeleteCustomer(c.id);
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

        {/* Right view: purchase history & medical records of selected customer */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[500px]">
          <div className="space-y-4">
            {selectedCustomer ? (
              <div className="space-y-4">
                {/* Dual Sub-Tabs */}
                <div className="flex border-b border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('history')}
                    className={`flex-1 pb-2.5 font-display font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                      activeSubTab === 'history' 
                        ? 'border-indigo-500 text-indigo-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Histori Belanja
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('checkup')}
                    className={`flex-1 pb-2.5 font-display font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                      activeSubTab === 'checkup' 
                        ? 'border-indigo-500 text-indigo-600' 
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                    Checkup & Medis
                  </button>
                </div>

                {/* Tab 1: Purchase History */}
                {activeSubTab === 'history' && (
                  <div className="space-y-4">
                    {/* Summary badge of customer */}
                    <div className="p-3.5 bg-indigo-50/20 rounded-2xl border border-indigo-100 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-display font-black text-slate-800 block text-xs">{selectedCustomer.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Sejak {new Date(selectedCustomer.joinedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Total Transaksi</span>
                        <span className="font-display font-bold text-indigo-700 block">{selectedHistory.length} Kali</span>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {selectedHistory.length === 0 ? (
                        <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                          <Clock className="w-8 h-8 stroke-1 text-slate-300" />
                          <p className="text-xs font-semibold">Belum Ada Riwayat Belanja</p>
                        </div>
                      ) : (
                        selectedHistory.map((sale) => (
                          <div key={sale.id} className="p-3 bg-slate-50 border border-slate-100/50 rounded-2xl text-[11px] space-y-2">
                            <div className="flex justify-between font-mono">
                              <span className="font-bold text-slate-700">{sale.invoiceNumber}</span>
                              <span className="text-slate-400">{new Date(sale.date).toLocaleDateString('id-ID')}</span>
                            </div>

                            {/* Items listed */}
                            <div className="space-y-1 pl-1">
                              {sale.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-slate-500 font-sans">
                                  <span>{it.name} x{it.quantity}</span>
                                  <span>{formatRupiah(it.total)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between pt-1.5 border-t border-slate-100 text-[10px] font-bold text-slate-800">
                              <span>Metode: {sale.paymentMethod}</span>
                              <span className="text-indigo-600">Total: {formatRupiah(sale.total)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: Checkup & Medis */}
                {activeSubTab === 'checkup' && (
                  <div className="space-y-4">
                    {/* Riwayat Penyakit & Alergi Section */}
                    <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-150 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Bookmark className="w-3 h-3 text-indigo-500" />
                          Riwayat Penyakit & Alergi
                        </span>
                      </div>
                      
                      {/* Tags list */}
                      <div className="flex flex-wrap gap-1.5">
                        {(!selectedCustomer.medicalHistory || selectedCustomer.medicalHistory.length === 0) ? (
                          <span className="text-[10px] text-slate-400 italic">Belum ada catatan riwayat penyakit.</span>
                        ) : (
                          selectedCustomer.medicalHistory.map((dis, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                              {dis}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveDisease(dis)} 
                                className="hover:text-rose-950 font-bold ml-0.5 text-[10px]"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Add disease input */}
                      <form onSubmit={handleAddDisease} className="flex gap-2 pt-1.5">
                        <input
                          type="text"
                          placeholder="Tambah penyakit/alergi obat..."
                          value={diseaseInput}
                          onChange={(e) => setDiseaseInput(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-2 text-[10px] focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold"
                        >
                          Tambah
                        </button>
                      </form>
                    </div>

                    {/* Checkup Header with button */}
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100/60">
                      <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        Log Pemeriksaan Klinis
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSystolic('120');
                          setDiastolic('80');
                          setBloodSugar('100');
                          setCholesterol('180');
                          setWeight('65');
                          setComplaints('');
                          setShowCheckupModal(true);
                        }}
                        className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Catat Checkup Baru
                      </button>
                    </div>

                    {/* List of checkups */}
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {(!selectedCustomer.checkups || selectedCustomer.checkups.length === 0) ? (
                        <div className="h-28 flex flex-col items-center justify-center text-center text-slate-400 space-y-1 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200 p-4">
                          <HeartPulse className="w-6 h-6 text-slate-300 stroke-1" />
                          <span className="text-[10px] font-bold">Belum ada catatan tensi & gula darah</span>
                          <span className="text-[9px] text-slate-400">Gunakan fitur ini untuk melacak perkembangan kesehatan pelanggan.</span>
                        </div>
                      ) : (
                        selectedCustomer.checkups.map((ch) => {
                          // Health warnings calculations
                          const isHighBP = ch.systolic >= 140 || ch.diastolic >= 90;
                          const isHighBS = ch.bloodSugar >= 200;
                          const isHighChol = ch.cholesterol >= 240;

                          return (
                            <div key={ch.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-[10px] space-y-2 hover:border-slate-300 transition-all">
                              <div className="flex justify-between items-center font-bold text-slate-500 border-b border-slate-100 pb-1">
                                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                                  {new Date(ch.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                                <span>Berat: {ch.weight} kg</span>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <div className="text-center bg-white p-1.5 rounded-xl border border-slate-100">
                                  <span className="text-[8px] text-slate-400 block uppercase font-bold">Tensi (BP)</span>
                                  <span className={`font-mono font-bold text-[11px] block ${isHighBP ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {ch.systolic}/{ch.diastolic}
                                  </span>
                                  <span className="text-[7px] text-slate-400 font-semibold">mmHg</span>
                                </div>

                                <div className="text-center bg-white p-1.5 rounded-xl border border-slate-100">
                                  <span className="text-[8px] text-slate-400 block uppercase font-bold">Gula Darah</span>
                                  <span className={`font-mono font-bold text-[11px] block ${isHighBS ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {ch.bloodSugar}
                                  </span>
                                  <span className="text-[7px] text-slate-400 font-semibold">mg/dL</span>
                                </div>

                                <div className="text-center bg-white p-1.5 rounded-xl border border-slate-100">
                                  <span className="text-[8px] text-slate-400 block uppercase font-bold">Kolesterol</span>
                                  <span className={`font-mono font-bold text-[11px] block ${isHighChol ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {ch.cholesterol}
                                  </span>
                                  <span className="text-[7px] text-slate-400 font-semibold">mg/dL</span>
                                </div>
                              </div>

                              <div className="p-1.5 bg-slate-100 rounded text-slate-600 border border-slate-200/50">
                                <span className="font-bold text-[8px] text-slate-400 block uppercase">Keluhan / Diagnosa:</span>
                                <p className="leading-tight mt-0.5 font-medium">{ch.complaints}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2 p-6">
                <HeartPulse className="w-12 h-12 stroke-1 text-slate-300" />
                <p className="text-sm font-display font-medium">Pilih Pelanggan Terlebih Dahulu</p>
                <p className="text-[11px] text-slate-400 max-w-xs">Klik pada salah satu pelanggan di daftar kiri untuk meninjau data rekam checkup medis serta poin loyalitasnya.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Add/Edit Customer */}
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
                  <User className="w-5 h-5 text-white/90" />
                  <span className="font-display font-bold text-sm">
                    {editingCustomer ? 'Ubah Profil Pelanggan' : 'Registrasi Pelanggan Baru'}
                  </span>
                </div>
                <button onClick={closeModal} className="text-white/75 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 text-xs font-sans">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap *</label>
                  <input
                    id="customer-name-input"
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-semibold"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Telepon WA *</label>
                  <input
                    id="customer-phone-input"
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                  />
                </div>

                {/* Birthdate */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Lahir *</label>
                  <input
                    id="customer-birth-input"
                    type="date"
                    required
                    value={custBirthdate}
                    onChange={(e) => setCustBirthdate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                  />
                </div>

                {/* Points */}
                {editingCustomer && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Poin Loyalitas</label>
                    <input
                      id="customer-points-input"
                      type="number"
                      value={custPoints}
                      onChange={(e) => setCustPoints(e.target.value)}
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
                    id="save-customer-submit-btn"
                    type="submit"
                    className={`flex-1 py-2.5 rounded-xl font-display font-bold text-xs shadow-md text-center transition-all ${style.primary}`}
                  >
                    Simpan Pelanggan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showCheckupModal && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className={`bg-gradient-to-r ${style.gradient} p-5 text-white flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-white/90" />
                  <span className="font-display font-bold text-sm">
                    Catat Checkup Kesehatan
                  </span>
                </div>
                <button onClick={() => setShowCheckupModal(false)} className="text-white/75 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCheckup} className="p-6 space-y-3.5 text-xs font-sans">
                {/* Row 1: BP Systolic / Diastolic */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tensi Sistolik (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      placeholder="120"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tensi Diastolik (mmHg)</label>
                    <input
                      type="number"
                      required
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      placeholder="80"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                    />
                  </div>
                </div>

                {/* Row 2: Blood Sugar & Cholesterol */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Gula Darah (mg/dL)</label>
                    <input
                      type="number"
                      required
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(e.target.value)}
                      placeholder="100"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Kolesterol (mg/dL)</label>
                    <input
                      type="number"
                      required
                      value={cholesterol}
                      onChange={(e) => setCholesterol(e.target.value)}
                      placeholder="180"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                    />
                  </div>
                </div>

                {/* Row 3: Weight */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="60"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-mono"
                  />
                </div>

                {/* Row 4: Complaints */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Keluhan / Catatan Medis</label>
                  <textarea
                    rows={2}
                    value={complaints}
                    onChange={(e) => setComplaints(e.target.value)}
                    placeholder="Contoh: Sakit kepala, pusing sejak 2 hari yang lalu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCheckupModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-display font-semibold text-xs text-slate-600 transition-all text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-2.5 rounded-xl font-display font-bold text-xs shadow-md text-center transition-all ${style.primary}`}
                  >
                    Simpan Checkup
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
