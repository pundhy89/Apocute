import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Globe, Lock, Bell, Sparkles, Check, Plus, Trash2, Calendar,
  Clock, User, Send, Smartphone, ChevronRight, FileText, Settings, Heart, AlertCircle,
  Pencil, ArrowLeft, Search, CheckCircle2
} from 'lucide-react';
import { AppSettings, WhatsappLog } from '../types';
import { getWhatsAppLogs, saveWhatsAppLog } from '../utils/whatsapp';
import { formatRupiah } from '../utils';

interface WhatsappSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

interface CustomReminder {
  id: string;
  title: string;
  recipientName: string;
  recipientPhone: string;
  scheduledDate: string;
  scheduledTime: string;
  message: string;
  eventType: 'stok_habis' | 'ultah' | 'promo' | 'struk_digital' | 'shift_jaga' | 'custom';
  status: 'Pending' | 'Terkirim' | 'Gagal';
}

const DEFAULT_TEMPLATES = {
  stok_habis: '⚠️ *PERINGATAN STOK TIPIS* ⚠️\n\nHalo Admin,\nStok obat *{nama_obat}* tersisa *{stok_sekarang}* unit (di bawah batas minimum {stok_minimum} unit).\n\nSegera hubungi distributor sales untuk melakukan restock order agar pelayanan pasien tetap prima. Terimakasih! 📦\n-- _Sistem Logistik ApoCute_ 🌸',
  ultah: '🎉 *SELAMAT ULANG TAHUN* 🎉\n\nHalo Kak *{nama}*,\nKami segenap keluarga besar *{nama_apotek}* mengucapkan selamat ulang tahun yang ke-{umur}! 🎂✨\n\nSebagai hadiah spesial, dapatkan potongan diskon langsung *15%* untuk tebus vitamin atau suplemen kesehatan pilihan Kakak dengan kode voucher: *APOCUTE-HBD{umur}*.\n\nSemoga sehat, panjang umur, dan bahagia selalu ya! ❤️\n-- _Layanan Pelanggan {nama_apotek}_ 🌸',
  promo: '📢 *PROMO SPESIAL APOCUTE CERIA* 📢\n\nHalo Sahabat Sehat *{nama}*,\nDapatkan penawaran istimewa sepanjang minggu ini! Pembelian semua jenis produk Vitamin, Suplemen, dan Skincare diskon hingga *25%* tanpa syarat minimum! 🌟\n\nYuk tebus sehatmu hari ini di *{nama_apotek}*. Stok terbatas, jangan sampai kehabisan ya Kak! 😉\n\n_Semoga sehat selalu!_\n-- _Customer Care ApoCute_ 🌸',
  struk_digital: 'Halo *{nama}*,\n\nTerima kasih telah berbelanja obat di *{nama_apotek}*.\nBerikut adalah *Struk Nota Digital* Anda:\n\nNo. Invoice: *{id_invoice}*\nTotal Pembayaran: *{total}*\nMetode: *{metode}*\n\n_Semoga lekas sembuh dan sehat selalu ya! ❤️_\n-- _Layanan Pelanggan {nama_apotek}_ 🌸',
  shift_jaga: '👨‍⚕️ *PENGINGAT JADWAL DOKTER JAGA* 👩‍⚕️\n\nHalo *{nama_dokter}*,\nKami ingin mengingatkan bahwa jadwal jaga praktik Kakak selanjutnya di *{nama_apotek}* adalah pada hari *{hari_jaga}* jam *{jam_jaga}*.\n\nMohon hadir 10 menit sebelum waktu jaga dimulai. Semoga pelayanan hari ini membawa manfaat bagi kesembuhan para pasien. Terimakasih! 🙏❤️\n-- _Manajemen ApoCute Ceria_ 🌸'
};

const TEMPLATE_METADATA = {
  struk_digital: {
    key: 'struk_digital' as const,
    title: 'Struk Digital Belanja (struk_digital)',
    desc: 'Kirim nota digital otomatis via WhatsApp ke pelanggan setelah checkout.',
    placeholders: '{nama}, {nama_apotek}, {id_invoice}, {total}, {metode}'
  },
  stok_habis: {
    key: 'stok_habis' as const,
    title: 'Stok Obat Habis (stok_habis)',
    desc: 'Peringatan otomatis saat stok obat menyentuh atau di bawah limit minimum.',
    placeholders: '{nama_obat}, {stok_sekarang}, {stok_minimum}'
  },
  promo: {
    key: 'promo' as const,
    title: 'Siaran Promosi Loyalty (promo)',
    desc: 'Kirim informasi penawaran istimewa & diskon secara massal ke pelanggan.',
    placeholders: '{nama}, {nama_apotek}'
  },
  ultah: {
    key: 'ultah' as const,
    title: 'Ulang Tahun Pelanggan (ultah)',
    desc: 'Ucapan ulang tahun & pembagian voucher diskon ke pelanggan berulang tahun.',
    placeholders: '{nama}, {nama_apotek}, {umur}'
  },
  shift_jaga: {
    key: 'shift_jaga' as const,
    title: 'Shift & Jadwal Jaga Dokter (shift_jaga)',
    desc: 'Pengingat berkala otomatis terkait shift kerja praktek bagi dokter jaga.',
    placeholders: '{nama_dokter}, {nama_apotek}, {hari_jaga}, {jam_jaga}'
  }
};

export default function WhatsappSettings({ settings, onUpdateSettings, theme }: WhatsappSettingsProps) {
  // Navigation active subview inside WhatsApp
  const [activeSubView, setActiveSubView] = useState<'main' | 'queue' | 'logs'>('main');

  // Config states
  const [waGatewayUrl, setWaGatewayUrl] = useState(settings.whatsappGatewayUrl || 'https://api.whatsapp-gateway.com/v1/send');
  const [waApiKey, setWaApiKey] = useState(settings.whatsappApiKey || '');
  const [waAutoPromo, setWaAutoPromo] = useState(settings.whatsappAutoPromo !== false);
  const [waAutoReceipt, setWaAutoReceipt] = useState(settings.whatsappAutoReceipt !== false);
  const [waAutoStockAlert, setWaAutoStockAlert] = useState(settings.whatsappAutoStockAlert !== false);

  // Additional 2 triggers persisted in local storage
  const [waAutoBirthday, setWaAutoBirthday] = useState(() => {
    return localStorage.getItem('apocute_wa_auto_birthday') !== 'false';
  });
  const [waAutoDoctor, setWaAutoDoctor] = useState(() => {
    return localStorage.getItem('apocute_wa_auto_doctor') !== 'false';
  });

  // Template settings states loaded from localStorage or fallback defaults
  const [templates, setTemplates] = useState<typeof DEFAULT_TEMPLATES>(() => {
    const saved = localStorage.getItem('apocute_whatsapp_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  // Custom reminders states
  const [reminders, setReminders] = useState<CustomReminder[]>(() => {
    const saved = localStorage.getItem('apocute_reminders');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'rem-1',
        title: 'Pengingat Kontrol dr. Ahmad',
        recipientName: 'Budi Santoso',
        recipientPhone: '081234567890',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '09:00',
        message: 'Halo Kak Budi Santoso, sekedar mengingatkan jadwal kontrol dr. Ahmad besok pagi jam 09:00 di Apotek.',
        eventType: 'custom',
        status: 'Pending'
      },
      {
        id: 'rem-2',
        title: 'Restock Vitamin C Becom-C',
        recipientName: 'Sales Biofarma (Andi)',
        recipientPhone: '085699887766',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '15:30',
        message: '⚠️ *PERINGATAN STOK TIPIS* ⚠️\nStok obat Becom-C tersisa 5 unit. Mohon kirim order 2 box.',
        eventType: 'stok_habis',
        status: 'Terkirim'
      }
    ];
  });

  // Logs state
  const [waLogs, setWaLogs] = useState<WhatsappLog[]>([]);
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [searchQueueQuery, setSearchQueueQuery] = useState('');

  // Modal State for adding custom/scheduled messages
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState<Omit<CustomReminder, 'id' | 'status'>>({
    title: '',
    recipientName: '',
    recipientPhone: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '08:00',
    message: '',
    eventType: 'custom'
  });

  // Popup Template Editor Modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateKey, setEditingTemplateKey] = useState<keyof typeof DEFAULT_TEMPLATES | null>(null);
  const [editingTemplateValue, setEditingTemplateValue] = useState('');

  // Sync templates and reminders to localStorage
  useEffect(() => {
    localStorage.setItem('apocute_whatsapp_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('apocute_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('apocute_wa_auto_birthday', String(waAutoBirthday));
  }, [waAutoBirthday]);

  useEffect(() => {
    localStorage.setItem('apocute_wa_auto_doctor', String(waAutoDoctor));
  }, [waAutoDoctor]);

  useEffect(() => {
    setWaLogs(getWhatsAppLogs());
    const handleLogUpdate = () => {
      setWaLogs(getWhatsAppLogs());
    };
    window.addEventListener('apocute_wa_message_sent', handleLogUpdate);
    return () => {
      window.removeEventListener('apocute_wa_message_sent', handleLogUpdate);
    };
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      whatsappGatewayUrl: waGatewayUrl,
      whatsappApiKey: waApiKey,
      whatsappAutoPromo: waAutoPromo,
      whatsappAutoReceipt: waAutoReceipt,
      whatsappAutoStockAlert: waAutoStockAlert
    });
    alert('Koneksi Server Gateway berhasil disimpan dan dikonfigurasi!');
  };

  const handleOpenEditTemplate = (key: keyof typeof DEFAULT_TEMPLATES) => {
    setEditingTemplateKey(key);
    setEditingTemplateValue(templates[key]);
    setShowTemplateModal(true);
  };

  const handleSaveTemplatePopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplateKey) return;

    setTemplates(prev => ({
      ...prev,
      [editingTemplateKey]: editingTemplateValue
    }));
    setShowTemplateModal(false);
    alert('Template pesan otomatis berhasil diperbarui!');
  };

  const handleResetTemplate = (key: keyof typeof DEFAULT_TEMPLATES) => {
    const meta = TEMPLATE_METADATA[key];
    if (confirm(`Apakah Anda yakin ingin mengatur ulang template "${meta.title}" ke bawaan default?`)) {
      setTemplates(prev => ({
        ...prev,
        [key]: DEFAULT_TEMPLATES[key]
      }));
      alert('Template berhasil diatur ulang ke default!');
    }
  };

  const handleAddReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.title || !newReminder.recipientPhone || !newReminder.message) {
      alert('Harap isi Judul, No WhatsApp, dan Isi Pesan!');
      return;
    }
    const added: CustomReminder = {
      ...newReminder,
      id: `rem-${Date.now()}`,
      status: 'Pending'
    };
    setReminders([added, ...reminders]);
    setShowAddModal(false);
    // reset form
    setNewReminder({
      title: '',
      recipientName: '',
      recipientPhone: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '08:00',
      message: '',
      eventType: 'custom'
    });
    alert('Pesan otomatis berhasil dijadwalkan masuk ke antrean!');
  };

  const handleSendReminderNow = (reminder: CustomReminder) => {
    const log: WhatsappLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipient: reminder.recipientPhone,
      recipientName: reminder.recipientName || 'Pelanggan',
      message: reminder.message,
      type: reminder.eventType === 'custom' ? 'promo' : reminder.eventType,
      status: 'success'
    };
    saveWhatsAppLog(log);
    setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, status: 'Terkirim' } : r));
    alert(`Pesan "${reminder.title}" berhasil segera dikirim!`);
  };

  const handleDeleteReminder = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal pesan ini dari antrean?')) {
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleClearLogs = () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh log pesan terkirim?')) {
      localStorage.setItem('apocute_wa_logs', '[]');
      setWaLogs([]);
      // Dispatch custom event to sync across
      window.dispatchEvent(new CustomEvent('apocute_wa_message_sent'));
      alert('Seluruh log pesan berhasil dikosongkan!');
    }
  };

  const fillTemplateWithPreset = (key: keyof typeof DEFAULT_TEMPLATES) => {
    setNewReminder(prev => ({
      ...prev,
      eventType: key,
      message: templates[key]
        .replace('{nama}', prev.recipientName || 'Budi')
        .replace('{nama_apotek}', settings.companyName)
        .replace('{umur}', '25')
        .replace('{stok_sekarang}', '4')
        .replace('{stok_minimum}', '10')
        .replace('{nama_obat}', 'Amoxicillin 500mg')
    }));
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'lavender':
        return {
          primary: 'bg-indigo-600 hover:bg-indigo-700 text-indigo-50 focus:ring-indigo-500',
          accent: 'indigo',
          border: 'border-indigo-100',
          bgLight: 'bg-indigo-50/30'
        };
      case 'minty':
        return {
          primary: 'bg-emerald-600 hover:bg-emerald-700 text-emerald-50 focus:ring-emerald-500',
          accent: 'emerald',
          border: 'border-emerald-100',
          bgLight: 'bg-emerald-50/30'
        };
      case 'ocean':
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-sky-50 focus:ring-sky-500',
          accent: 'sky',
          border: 'border-sky-100',
          bgLight: 'bg-sky-50/30'
        };
      case 'sunset':
        return {
          primary: 'bg-orange-500 hover:bg-orange-600 text-orange-50 focus:ring-orange-500',
          accent: 'orange',
          border: 'border-orange-100',
          bgLight: 'bg-orange-50/30'
        };
      case 'cherry':
        return {
          primary: 'bg-rose-500 hover:bg-rose-600 text-rose-50 focus:ring-rose-500',
          accent: 'rose',
          border: 'border-rose-100',
          bgLight: 'bg-rose-50/30'
        };
    }
  };

  const style = getThemeStyles();

  // Filter logs and queue
  const filteredLogs = waLogs.filter(log => 
    log.recipient.includes(searchLogQuery) || 
    log.recipientName.toLowerCase().includes(searchLogQuery.toLowerCase()) || 
    log.message.toLowerCase().includes(searchLogQuery.toLowerCase())
  );

  const filteredQueue = reminders.filter(rem => 
    rem.title.toLowerCase().includes(searchQueueQuery.toLowerCase()) || 
    rem.recipientPhone.includes(searchQueueQuery) || 
    rem.recipientName.toLowerCase().includes(searchQueueQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs text-slate-700 font-sans">
      
      {/* 1. MAIN FLOW VIEW */}
      {activeSubView === 'main' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Header Banner */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500 animate-pulse" />
                Sistem Gateway WhatsApp API
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-normal">
                Kirim pemberitahuan, struk digital, limit obat kritis, dan promosi secara otomatis melalui nomor WhatsApp terhubung.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl font-display font-bold text-xs transition-all shadow-sm cursor-pointer ${style.primary}`}
            >
              <Plus className="w-4 h-4" />
              Tambahkan Pesan Otomatis
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN LEFT: Connection Setup (Grid span 5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Koneksi Server Gateway Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-50 pb-2.5">
                  <Globe className="w-4.5 h-4.5 text-slate-400" />
                  Koneksi Server Gateway
                </h4>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">API Endpoint URL</label>
                    <input
                      type="text"
                      value={waGatewayUrl}
                      onChange={(e) => setWaGatewayUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-mono text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access Key / Token</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Masukkan token server gateway..."
                        value={waApiKey}
                        onChange={(e) => setWaApiKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-mono text-slate-700"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-display font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    Simpan Token Server
                  </button>
                </form>
              </div>

              {/* Info Tips */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-150 text-[10px] text-slate-500 leading-relaxed space-y-1.5">
                <span className="font-bold block text-slate-700">💡 Tips Integrasi:</span>
                <p>Gunakan layanan penyedia pihak ketiga (WABA / Gateway lokal) untuk mendapatkan API URL dan token di atas agar pesan dapat dikirim langsung ke nomor pasien tanpa antrean manual.</p>
              </div>
            </div>

            {/* COLUMN RIGHT: WhatsApp API Gateway - Pesan Otomatis (Grid span 7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* WhatsApp API Gateway - Pesan Otomatis Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                    WhatsApp API Gateway (Pesan Otomatis)
                  </h4>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">Automated Triggers</span>
                </div>

                {/* Automation List */}
                <div className="space-y-3">
                  
                  {/* 1. Struk Digital Belanja */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-150/50">
                    <div className="flex items-start gap-2.5 flex-1 pr-4">
                      {/* Checkbox (Tanda centang) */}
                      <input
                        type="checkbox"
                        checked={waAutoReceipt}
                        onChange={(e) => {
                          setWaAutoReceipt(e.target.checked);
                          onUpdateSettings({ ...settings, whatsappAutoReceipt: e.target.checked });
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                        title="Aktifkan pesan otomatis"
                      />
                      <div>
                        <span className="font-bold text-slate-700 block text-[11px] leading-tight">Struk Digital Belanja (struk_digital)</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{TEMPLATE_METADATA.struk_digital.desc}</span>
                      </div>
                    </div>
                    {/* Actions: Edit & Delete (Reset) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditTemplate('struk_digital')}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all cursor-pointer"
                        title="Edit Template Pesan Otomatis"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetTemplate('struk_digital')}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-all cursor-pointer"
                        title="Reset ke Default"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2. Notifikasi Stok Obat Habis */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-150/50">
                    <div className="flex items-start gap-2.5 flex-1 pr-4">
                      <input
                        type="checkbox"
                        checked={waAutoStockAlert}
                        onChange={(e) => {
                          setWaAutoStockAlert(e.target.checked);
                          onUpdateSettings({ ...settings, whatsappAutoStockAlert: e.target.checked });
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                        title="Aktifkan pesan otomatis"
                      />
                      <div>
                        <span className="font-bold text-slate-700 block text-[11px] leading-tight">Stok Obat Habis (stok_habis)</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{TEMPLATE_METADATA.stok_habis.desc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditTemplate('stok_habis')}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all cursor-pointer"
                        title="Edit Template Pesan Otomatis"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetTemplate('stok_habis')}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-all cursor-pointer"
                        title="Reset ke Default"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 3. Siaran Promosi */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-150/50">
                    <div className="flex items-start gap-2.5 flex-1 pr-4">
                      <input
                        type="checkbox"
                        checked={waAutoPromo}
                        onChange={(e) => {
                          setWaAutoPromo(e.target.checked);
                          onUpdateSettings({ ...settings, whatsappAutoPromo: e.target.checked });
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                        title="Aktifkan pesan otomatis"
                      />
                      <div>
                        <span className="font-bold text-slate-700 block text-[11px] leading-tight">Siaran Promosi Loyalty (promo)</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{TEMPLATE_METADATA.promo.desc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditTemplate('promo')}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all cursor-pointer"
                        title="Edit Template Pesan Otomatis"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetTemplate('promo')}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-all cursor-pointer"
                        title="Reset ke Default"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4. Ulang Tahun Pelanggan */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-150/50">
                    <div className="flex items-start gap-2.5 flex-1 pr-4">
                      <input
                        type="checkbox"
                        checked={waAutoBirthday}
                        onChange={(e) => setWaAutoBirthday(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                        title="Aktifkan pesan otomatis"
                      />
                      <div>
                        <span className="font-bold text-slate-700 block text-[11px] leading-tight">Ulang Tahun Pelanggan (ultah)</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{TEMPLATE_METADATA.ultah.desc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditTemplate('ultah')}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all cursor-pointer"
                        title="Edit Template Pesan Otomatis"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetTemplate('ultah')}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-all cursor-pointer"
                        title="Reset ke Default"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 5. Shift Jaga Dokter */}
                  <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-150/50">
                    <div className="flex items-start gap-2.5 flex-1 pr-4">
                      <input
                        type="checkbox"
                        checked={waAutoDoctor}
                        onChange={(e) => setWaAutoDoctor(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                        title="Aktifkan pesan otomatis"
                      />
                      <div>
                        <span className="font-bold text-slate-700 block text-[11px] leading-tight">Shift & Jadwal Jaga Dokter (shift_jaga)</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{TEMPLATE_METADATA.shift_jaga.desc}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditTemplate('shift_jaga')}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg transition-all cursor-pointer"
                        title="Edit Template Pesan Otomatis"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetTemplate('shift_jaga')}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition-all cursor-pointer"
                        title="Reset ke Default"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* BELOW MODULES: Access Buttons (Antrean & Log Pesan) */}
          <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-150 space-y-4 shadow-inner">
            <div className="flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-slate-400" />
              <h4 className="font-display font-bold text-slate-800 text-xs sm:text-sm">Manajemen Pengiriman & Riwayat</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveSubView('queue')}
                className="p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4 cursor-pointer group"
              >
                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-xs sm:text-sm">Antrean & Jadwal Otomatis</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Lihat daftar pengingat yang sedang dijadwalkan atau tertunda pengirimannya ke pelanggan.</p>
                </div>
              </button>

              <button
                onClick={() => setActiveSubView('logs')}
                className="p-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4 cursor-pointer group"
              >
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-xs sm:text-sm">Log Pesan Terkirim</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Pantau riwayat lengkap laporan pengiriman pesan WhatsApp yang sukses maupun gagal.</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. QUEUE SUBVIEW / "Halaman Baru" */}
      {activeSubView === 'queue' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Back button & Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveSubView('main')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                title="Kembali ke WhatsApp"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Antrean & Jadwal Otomatis</h3>
                <p className="text-xs text-slate-400 mt-0.5">Daftar pengiriman pesan terencana dan terjadwal secara kronologis.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl font-display font-bold text-xs transition-all cursor-pointer ${style.primary}`}
              >
                <Plus className="w-4 h-4" />
                Tambahkan Pesan Otomatis
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari antrean berdasarkan penerima, judul, atau nomor..."
                value={searchQueueQuery}
                onChange={(e) => setSearchQueueQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          {/* Queue List Content */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
            {filteredQueue.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <span className="font-medium text-xs">Belum ada daftar antrean pengingat aktif yang cocok.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQueue.map((rem) => (
                  <div key={rem.id} className="p-4 border border-slate-100 hover:border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-slate-800 text-xs">{rem.title}</span>
                        <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full ${
                          rem.status === 'Terkirim' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {rem.status}
                        </span>
                        <span className="text-[8.5px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-mono">{rem.eventType}</span>
                      </div>
                      
                      <p className="text-[11px] text-slate-600 font-sans whitespace-pre-line bg-white/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">{rem.message}</p>
                      
                      <div className="flex items-center gap-4 text-[9px] text-slate-400 font-mono font-bold">
                        <span className="flex items-center gap-1"><User className="w-3 h-3 text-slate-500" /> Recipient: {rem.recipientName || 'No Name'} ({rem.recipientPhone})</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> Schedule: {rem.scheduledDate} @ {rem.scheduledTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {rem.status === 'Pending' && (
                        <button
                          onClick={() => handleSendReminderNow(rem)}
                          className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-display font-black flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Kirim Sekarang
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-100 transition-all cursor-pointer"
                        title="Hapus Pengingat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 3. LOGS SUBVIEW / "Halaman Baru" */}
      {activeSubView === 'logs' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Back button & Title */}
          <div className="flex items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-150 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveSubView('main')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                title="Kembali ke WhatsApp"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Log Pengiriman Pesan</h3>
                <p className="text-xs text-slate-400 mt-0.5">Riwayat lengkap seluruh log laporan pengiriman pesan WhatsApp.</p>
              </div>
            </div>

            <button
              onClick={handleClearLogs}
              disabled={waLogs.length === 0}
              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" /> Kosongkan Log History
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari logs berdasarkan penerima, isi pesan, atau nomor..."
                value={searchLogQuery}
                onChange={(e) => setSearchLogQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          {/* Logs History Table list */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-display font-bold text-slate-400 text-[9px] uppercase tracking-wider">
                    <th className="py-3 px-4">Penerima (Recipient)</th>
                    <th className="py-3 px-4">Tipe Event</th>
                    <th className="py-3 px-4">Isi Pesan Terkirim</th>
                    <th className="py-3 px-4">Waktu Kirim</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                        <span>Belum ada riwayat logs pengiriman pesan.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-all text-[11px]">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block leading-tight">{log.recipientName}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{log.recipient}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-mono text-[9px] capitalize">{log.type}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs sm:max-w-md truncate font-sans text-slate-600" title={log.message}>
                          {log.message}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            log.status === 'success' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {log.status === 'success' ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-500" /> Success
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-2.5 h-2.5 text-rose-500" /> Failed
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}


      {/* 4. POPUP TEMPLATE EDITOR MODAL */}
      <AnimatePresence>
        {showTemplateModal && editingTemplateKey && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-emerald-400" />
                  <span className="font-display font-bold text-sm">Edit Template Pesan Otomatis</span>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSaveTemplatePopupSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-600 block">{TEMPLATE_METADATA[editingTemplateKey].title}</span>
                  <p className="text-[10px] text-slate-400">{TEMPLATE_METADATA[editingTemplateKey].desc}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Format Isi Pesan</label>
                  <textarea
                    rows={6}
                    value={editingTemplateValue}
                    onChange={(e) => setEditingTemplateValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] font-sans text-slate-700 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                    required
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1 text-[10px]">
                  <span className="font-bold text-slate-600 block">Daftar Variabel (Placeholder) Terdaftar:</span>
                  <p className="text-slate-500 leading-normal font-mono text-[9px] bg-white px-2 py-1 rounded border border-slate-100">
                    {TEMPLATE_METADATA[editingTemplateKey].placeholders}
                  </p>
                  <span className="text-[9px] text-slate-400 block mt-1 leading-normal">*Tulis variabel di atas lengkap dengan kurung kurawal `{}` agar diganti dinamis oleh sistem.</span>
                </div>

                <div className="flex gap-2.5 justify-end pt-2 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-150 hover:bg-slate-50 text-slate-500 font-display font-bold text-xs transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`py-2.5 px-5 rounded-xl font-display font-bold text-xs shadow-md transition-all cursor-pointer ${style.primary}`}
                  >
                    Simpan Template
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* 5. MODAL FOR ADDING SCHEDULED MESSAGES / QUEUE */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-display font-bold text-sm">Tambahkan Pesan Otomatis Baru</span>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddReminderSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Judul Pesan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pengingat Obat Rutin"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gunakan Event Template</label>
                    <select
                      value={newReminder.eventType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        if (val !== 'custom') {
                          setNewReminder(prev => ({
                            ...prev,
                            eventType: val,
                            message: templates[val as keyof typeof DEFAULT_TEMPLATES]
                              .replace('{nama}', prev.recipientName || 'Budi')
                              .replace('{nama_apotek}', settings.companyName)
                              .replace('{umur}', '25')
                              .replace('{id_invoice}', 'APOCUTE-1234')
                              .replace('{total}', 'Rp 85.000')
                              .replace('{metode}', 'Tunai')
                              .replace('{nama_dokter}', 'dr. Ahmad Fauzi')
                              .replace('{hari_jaga}', 'Senin')
                              .replace('{jam_jaga}', '08:00 - 13:00')
                          }));
                        } else {
                          setNewReminder({ ...newReminder, eventType: val });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-sans"
                    >
                      <option value="custom">Kustom (Ketik Sendiri)</option>
                      <option value="stok_habis">Stok Habis Template</option>
                      <option value="ultah">Ulang Tahun Pelanggan</option>
                      <option value="promo">Promo Loyalty</option>
                      <option value="struk_digital">Struk Digital</option>
                      <option value="shift_jaga">Shift Jaga Dokter</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nama Penerima</label>
                    <input
                      type="text"
                      placeholder="Nama Pelanggan / Sales"
                      value={newReminder.recipientName}
                      onChange={(e) => setNewReminder({ ...newReminder, recipientName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">No WhatsApp (Recipient)</label>
                    <div className="relative">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={newReminder.recipientPhone}
                        onChange={(e) => setNewReminder({ ...newReminder, recipientPhone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Jadwal</label>
                    <input
                      type="date"
                      value={newReminder.scheduledDate}
                      onChange={(e) => setNewReminder({ ...newReminder, scheduledDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Waktu Kirim</label>
                    <input
                      type="time"
                      value={newReminder.scheduledTime}
                      onChange={(e) => setNewReminder({ ...newReminder, scheduledTime: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Isi Pesan WhatsApp</label>
                    {newReminder.eventType !== 'custom' && (
                      <button
                        type="button"
                        onClick={() => fillTemplateWithPreset(newReminder.eventType as any)}
                        className="text-[9px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Reset ke Template
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Tulis pesan atau pilih salah satu template di atas untuk otomatisasi..."
                    value={newReminder.message}
                    onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-sans text-slate-700 leading-relaxed"
                    required
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-150 hover:bg-slate-50 text-slate-500 font-display font-bold text-xs transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`py-2.5 px-5 rounded-xl font-display font-bold text-xs shadow-md transition-all cursor-pointer ${style.primary}`}
                  >
                    Jadwalkan Pesan
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
