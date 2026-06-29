import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, Calendar, Clock, Phone, Edit2, Trash2, 
  Send, AlertCircle, CheckCircle2, UserPlus, Sparkles, BellRing
} from 'lucide-react';
import { Doctor, AppSettings } from '../types';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { DoctorSlider } from './DoctorSlider';

interface DoctorsProps {
  doctors: Doctor[];
  onAddDoctor: (doc: Doctor) => void;
  onUpdateDoctor: (doc: Doctor) => void;
  onDeleteDoctor: (id: string) => void;
  settings: AppSettings;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function Doctors({
  doctors,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  settings,
  theme
}: DoctorsProps) {
  // Common UI styling helpers based on active theme
  const getThemeStyles = () => {
    switch (theme) {
      case 'lavender':
        return {
          primary: 'bg-indigo-600 hover:bg-indigo-700 text-indigo-50',
          accent: 'indigo',
          border: 'border-indigo-100',
          bgLight: 'bg-indigo-50/30',
          accentText: 'text-indigo-600',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-100'
        };
      case 'minty':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50',
          accent: 'emerald',
          border: 'border-emerald-100',
          bgLight: 'bg-emerald-50/30',
          accentText: 'text-emerald-600',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-100'
        };
      case 'ocean':
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-sky-50',
          accent: 'sky',
          border: 'border-sky-100',
          bgLight: 'bg-sky-50/30',
          accentText: 'text-sky-600',
          badge: 'bg-sky-50 text-sky-700 border-sky-100'
        };
      case 'sunset':
        return {
          primary: 'bg-orange-600 hover:bg-orange-700 text-orange-50',
          accent: 'orange',
          border: 'border-orange-100',
          bgLight: 'bg-orange-50/30',
          accentText: 'text-orange-600',
          badge: 'bg-orange-50 text-orange-700 border-orange-100'
        };
      case 'cherry':
        return {
          primary: 'bg-pink-600 hover:bg-pink-700 text-pink-50',
          accent: 'pink',
          border: 'border-pink-100',
          bgLight: 'bg-pink-50/30',
          accentText: 'text-pink-600',
          badge: 'bg-pink-50 text-pink-700 border-pink-100'
        };
      default:
        return {
          primary: 'bg-slate-600 hover:bg-slate-700 text-slate-50',
          accent: 'slate',
          border: 'border-slate-100',
          bgLight: 'bg-slate-50/30',
          accentText: 'text-slate-600',
          badge: 'bg-slate-50 text-slate-700 border-slate-100'
        };
    }
  };

  const style = getThemeStyles();

  // Get current active day in Indonesian
  const getIndonesianDay = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  };

  const currentDay = getIndonesianDay();

  // Modal and form states
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('Dokter Umum');
  const [phone, setPhone] = useState('');
  const [scheduleHours, setScheduleHours] = useState('08:00 - 14:00');
  const [dutyDays, setDutyDays] = useState<string[]>(['Senin']);
  const [status, setStatus] = useState<'Aktif' | 'Istirahat' | 'Libur'>('Aktif');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [useCustomPhoto, setUseCustomPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  
  const SPECIALIZATIONS = [
    'Dokter Umum',
    'Spesialis Anak',
    'Spesialis Penyakit Dalam',
    'Spesialis Kandungan (Obgyn)',
    'Spesialis Kulit & Kelamin',
    'Spesialis Mata',
    'Spesialis Jantung',
    'Spesialis Saraf',
    'Dokter Gigi'
  ];

  const doctorsOnDutyToday = doctors.filter(doc => doc.dutyDays.includes(currentDay));

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setName('');
    setSpecialization('Dokter Umum');
    setPhone('');
    setScheduleHours('08:00 - 14:00');
    setDutyDays(['Senin']);
    setStatus('Aktif');
    setGender('Laki-laki');
    setUseCustomPhoto(false);
    setPhotoUrl('');
    setShowModal(true);
  };

  const handleOpenEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setSpecialization(doc.specialization);
    setPhone(doc.phone);
    setScheduleHours(doc.scheduleHours);
    setDutyDays(doc.dutyDays);
    setStatus(doc.status);
    setGender(doc.gender || 'Laki-laki');
    setUseCustomPhoto(!!doc.photoUrl);
    setPhotoUrl(doc.photoUrl || '');
    setShowModal(true);
  };

  const handleDayToggle = (day: string) => {
    if (dutyDays.includes(day)) {
      setDutyDays(dutyDays.filter(d => d !== day));
    } else {
      setDutyDays([...dutyDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || dutyDays.length === 0) {
      alert('Mohon isi nama, telepon, dan minimal pilih satu hari jaga!');
      return;
    }

    const doctorData: Doctor = {
      id: editingDoctor ? editingDoctor.id : `doc-${Date.now()}`,
      name,
      specialization,
      phone,
      scheduleHours,
      dutyDays,
      status,
      gender,
      photoUrl: useCustomPhoto ? photoUrl : undefined
    };

    if (editingDoctor) {
      onUpdateDoctor(doctorData);
      alert('Data dokter berhasil diperbarui!');
    } else {
      onAddDoctor(doctorData);
      alert('Dokter baru berhasil ditambahkan!');
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data dokter ini?')) {
      onDeleteDoctor(id);
    }
  };

  // Kirim WhatsApp pengingat jaga ke dokter
  const handleSendShiftReminder = async (doc: Doctor) => {
    const message = `Halo ${doc.name},\n\nMengingatkan jadwal jaga Anda di *${settings.companyName}* pada hari ini (*${currentDay}*) jam *${doc.scheduleHours}*.\n\nMohon hadir tepat waktu. Terima kasih dan selamat melayani!\n\n-- System Auto-Reminder ApoCute`;
    
    try {
      await sendWhatsAppMessage(settings, doc.phone, doc.name, message, 'shift_jaga');
      alert(`WhatsApp Pengingat Jaga berhasil dikirim ke ${doc.name}!`);
    } catch (e) {
      alert('Gagal mengirim WhatsApp pengingat jaga.');
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans text-slate-700">
      
      {/* 3. ALL DOCTORS LIST DATABASE (MODERN SLIDER WITH ID CARDS) - MOVED TO TOP */}
      <DoctorSlider 
        doctors={doctors}
        theme={theme}
        currentDay={currentDay}
        handleOpenEditModal={handleOpenEditModal}
        handleDelete={handleDelete}
        handleSendShiftReminder={handleSendShiftReminder}
      />
      
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Doctors */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${style.bgLight} ${style.accentText}`}>
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Dokter</span>
            <span className="text-xl font-display font-black text-slate-800">{doctors.length}</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Terdaftar di sistem</span>
          </div>
        </div>

        {/* Doctors Active Today */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Dokter Jaga Hari Ini</span>
            <span className="text-xl font-display font-black text-slate-800">{doctorsOnDutyToday.length}</span>
            <span className="text-[9px] text-emerald-600 block mt-0.5 font-bold">Hari: {currentDay}</span>
          </div>
        </div>

        {/* Shift Warning */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Pengingat Jadwal Jaga</span>
            <button 
              onClick={() => {
                if (doctorsOnDutyToday.length === 0) {
                  alert('Tidak ada dokter yang bertugas hari ini.');
                  return;
                }
                doctorsOnDutyToday.forEach(doc => handleSendShiftReminder(doc));
                alert('Mengirimkan pengingat massal WhatsApp ke semua dokter jaga hari ini!');
              }}
              className={`text-[9px] font-bold px-2 py-1 rounded-lg ${style.primary} mt-1 inline-block shrink-0 shadow-3xs`}
            >
              Kirim Semua Pengingat Jaga (WA)
            </button>
          </div>
        </div>
      </div>

      {/* 2. ROSTER TODAY PANEL */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500 animate-spin-slow" />
            <h3 className="font-display font-bold text-slate-800 text-sm">Jadwal Tugas Hari Ini ({currentDay})</h3>
          </div>
          <button
            onClick={handleOpenAddModal}
            className={`px-4 py-2 rounded-xl font-display font-bold text-[10px] shadow-sm flex items-center gap-1.5 transition-all ${style.primary}`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Tambah Dokter Baru
          </button>
        </div>

        {doctorsOnDutyToday.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-[11px]">Tidak ada jadwal praktek dokter hari ini ({currentDay})</p>
            <p className="text-[10px]">Silakan edit data dokter untuk mengatur ulang hari tugas mereka.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorsOnDutyToday.map((doc) => (
              <div 
                key={doc.id} 
                className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/10 hover:shadow-2xs transition-all relative overflow-hidden group"
              >
                {/* Status indicator badge */}
                <span className={`absolute top-3 right-3 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                  doc.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' :
                  doc.status === 'Istirahat' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {doc.status}
                </span>

                <div className="space-y-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md inline-block mb-1">
                      {doc.specialization}
                    </span>
                    <h4 className="font-display font-bold text-slate-800 text-xs truncate pr-14">{doc.name}</h4>
                  </div>

                  <div className="space-y-1 font-mono text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.scheduleHours}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.phone}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <button
                      onClick={() => handleSendShiftReminder(doc)}
                      className="text-[9px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50"
                    >
                      <Send className="w-3 h-3" />
                      Pengingat Jaga WA
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(doc)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                        title="Edit Dokter"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                        title="Hapus Dokter"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. DIALOG MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative z-10"
            >
              <div className={`p-5 text-white bg-gradient-to-r ${theme === 'lavender' ? 'from-indigo-500 to-purple-600' : theme === 'minty' ? 'from-emerald-400 to-teal-600' : theme === 'ocean' ? 'from-sky-400 to-blue-600' : theme === 'sunset' ? 'from-orange-400 to-amber-600' : 'from-pink-450 to-rose-600'} flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  <h4 className="font-display font-bold text-sm">
                    {editingDoctor ? 'Edit Data Dokter Jaga' : 'Tambah Dokter Jaga Baru'}
                  </h4>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white font-bold text-sm">
                  Tutup
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Row 1: Name and Specialty */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Dokter</label>
                    <input
                      type="text"
                      placeholder="dr. Contoh Dokter, Sp.A"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Spesialisasi</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Phone & Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor HP/WA</label>
                    <input
                      type="text"
                      placeholder="0812xxxxxxxx"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jam Praktek</label>
                    <input
                      type="text"
                      placeholder="e.g. 08:00 - 14:00"
                      required
                      value={scheduleHours}
                      onChange={(e) => setScheduleHours(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Row 3: Duty Status & Gender Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Kehadiran</label>
                    <div className="flex gap-4 pt-1">
                      {['Aktif', 'Istirahat', 'Libur'].map((st) => (
                        <label key={st} className="flex items-center gap-1.5 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="status"
                            value={st}
                            checked={status === st}
                            onChange={() => setStatus(st as any)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] text-slate-600">{st}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jenis Kelamin</label>
                    <div className="flex gap-4 pt-1">
                      {['Laki-laki', 'Perempuan'].map((g) => (
                        <label key={g} className="flex items-center gap-1.5 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={gender === g}
                            onChange={() => setGender(g as any)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] text-slate-600">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Photo URL/Upload Toggle */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-700 block">Foto Profil Kustom</span>
                      <span className="text-[9px] text-slate-400 block">Aktifkan untuk mengunggah foto kustom atau memasukkan URL foto.</span>
                    </div>
                    {/* Toggle switch */}
                    <button
                      type="button"
                      onClick={() => setUseCustomPhoto(!useCustomPhoto)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        useCustomPhoto ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          useCustomPhoto ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {useCustomPhoto && (
                    <div className="space-y-2.5 pt-1.5 border-t border-slate-200/60 animate-fade-in text-[10px]">
                      {/* URL Input */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">URL Foto Dokter</span>
                        <input
                          type="text"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="Masukkan tautan gambar (https://...)"
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[10px] focus:outline-none focus:border-indigo-500 font-mono text-slate-700"
                        />
                      </div>

                      {/* File Upload Input */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Unggah Berkas Foto</span>
                        <div className="relative border border-dashed border-slate-300 rounded-lg p-3 text-center bg-white hover:bg-slate-50 transition-all cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setPhotoUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <span className="text-[9px] text-slate-500 font-bold block">Pilih Berkas Foto Dokter</span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">Mendukung format PNG, JPG, JPEG</span>
                        </div>
                      </div>

                      {photoUrl && (
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200">
                          <img
                            src={photoUrl}
                            alt="Preview"
                            className="w-10 h-10 object-cover rounded-md border border-slate-100"
                          />
                          <div className="overflow-hidden">
                            <span className="text-[8px] text-emerald-600 font-bold block">Preview Foto Terpilih</span>
                            <span className="text-[7px] text-slate-400 font-mono block truncate max-w-[240px]">{photoUrl}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Row 4: Multi Day Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hari Jaga</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const active = dutyDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all text-center ${
                            active 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-3xs' 
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-50 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold font-display"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl font-bold font-display flex items-center gap-1 shadow-sm ${style.primary}`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan Dokter
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
