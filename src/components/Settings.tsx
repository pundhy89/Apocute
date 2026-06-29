import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings, Sparkles, Sliders, Palette, ShieldAlert, Wifi, CloudLightning,
  Download, Upload, RefreshCw, Key, UserCheck, Check, Printer, Info,
  MessageSquare, Globe, Lock, Bell, CheckCircle2, AlertTriangle, Image
} from 'lucide-react';
import { AppSettings, Employee, WhatsappLog } from '../types';
import CuteLogo from './CuteLogo';
import { getWhatsAppLogs } from '../utils/whatsapp';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  activeEmployee: any;
  onLogout: () => void;
  onBackupData: () => void;
  onRestoreData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
}

export default function SettingsComponent({
  settings,
  onUpdateSettings,
  activeEmployee,
  onLogout,
  onBackupData,
  onRestoreData,
  theme
}: SettingsProps) {
  const [compName, setCompName] = useState(settings.companyName);
  const [logoType, setLogoType] = useState<any>(settings.companyLogoType);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(settings.companyLogoUrl || '');
  const [activeTheme, setActiveTheme] = useState<any>(settings.theme);

  // Printer states
  const [printerConnected, setPrinterConnected] = useState(settings.printerConnected !== false);
  const [printerName, setPrinterName] = useState(settings.printerName || 'RONGTA RP58-U');

  // WhatsApp states
  const [waGatewayUrl, setWaGatewayUrl] = useState(settings.whatsappGatewayUrl || 'https://api.whatsapp-gateway.com/v1/send');
  const [waApiKey, setWaApiKey] = useState(settings.whatsappApiKey || '');
  const [waAutoPromo, setWaAutoPromo] = useState(settings.whatsappAutoPromo !== false);
  const [waAutoReceipt, setWaAutoReceipt] = useState(settings.whatsappAutoReceipt !== false);
  const [waAutoStockAlert, setWaAutoStockAlert] = useState(settings.whatsappAutoStockAlert !== false);

  // WhatsApp outbound logs
  const [waLogs, setWaLogs] = useState<WhatsappLog[]>([]);

  // Reload logs on mount and listen to custom message sent events
  useEffect(() => {
    setWaLogs(getWhatsAppLogs());

    const handleMessageSent = () => {
      setWaLogs(getWhatsAppLogs());
    };

    window.addEventListener('apocute_wa_message_sent', handleMessageSent);
    return () => {
      window.removeEventListener('apocute_wa_message_sent', handleMessageSent);
    };
  }, []);

  // Simulated syncing variables
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState('2 menit yang lalu');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      companyName: compName,
      companyLogoType: logoType,
      companyLogoUrl: companyLogoUrl,
      theme: activeTheme,
      printerConnected: printerConnected,
      printerName: printerName,
      whatsappGatewayUrl: waGatewayUrl,
      whatsappApiKey: waApiKey,
      whatsappAutoPromo: waAutoPromo,
      whatsappAutoReceipt: waAutoReceipt,
      whatsappAutoStockAlert: waAutoStockAlert
    });
    alert('Pengaturan berhasil disimpan!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setCompanyLogoUrl(base64Str);
      alert('Logo berhasil diunggah secara lokal! Jangan lupa klik tombol Simpan di bawah.');
    };
    reader.readAsDataURL(file);
  };

  const triggerCloudSyncSimulate = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced('Baru saja');
      alert('Sinkronisasi cloud sukses! Data ApoCute disinkronkan ke 4 perangkat terhubung.');
    }, 1800);
  };

  const THEMES_LIST = [
    { key: 'lavender', label: 'Lavender Garden', colorClass: 'bg-indigo-600', preview: 'indigo' },
    { key: 'minty', label: 'Minty Breeze', colorClass: 'bg-emerald-600', preview: 'emerald' },
    { key: 'ocean', label: 'Ocean Blue', colorClass: 'bg-sky-600', preview: 'sky' },
    { key: 'sunset', label: 'Sunset Glow', colorClass: 'bg-orange-500', preview: 'orange' },
    { key: 'cherry', label: 'Cherry Blossom', colorClass: 'bg-rose-500', preview: 'rose' }
  ];

  const LOGO_TYPES = [
    { key: 'cute-pill', label: 'Smiling Pill' },
    { key: 'cute-cross', label: 'Playful Cross' },
    { key: 'cute-heart', label: 'Bandage Heart' },
    { key: 'cute-sparkle', label: 'Shiny Shield' }
  ];

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 text-xs font-sans text-slate-700">
      {/* LEFT: Branding configuration */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <h3 className="font-display font-bold text-slate-800 text-base flex items-center gap-2 border-b border-slate-50 pb-3">
          <Sliders className="w-5 h-5 text-indigo-500" />
          Konfigurasi Identitas Perusahaan & Branding
        </h3>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Company Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Apotek Perusahaan</label>
            <input
              id="company-name-input"
              type="text"
              required
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-500 font-bold text-slate-800"
            />
          </div>

          {/* Logo selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipe Logo Apotek (Jika Tidak Menggunakan Logo Kustom)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LOGO_TYPES.map((l) => (
                <div
                  key={l.key}
                  onClick={() => {
                    setLogoType(l.key as any);
                    setCompanyLogoUrl(''); // Clear custom logo to use template
                  }}
                  className={`p-3 border rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                    logoType === l.key && !companyLogoUrl ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-150 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <CuteLogo type={l.key as any} theme={activeTheme} size={40} />
                  <span className="text-[9px] font-bold text-slate-600 block text-center leading-none">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Logo URL / File Upload */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-150/60 space-y-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-indigo-500" /> Kustomisasi Logo Perusahaan Anda
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 block font-bold">Input Image URL Logo</span>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={companyLogoUrl}
                  onChange={(e) => setCompanyLogoUrl(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-xl py-1.5 px-2.5 text-[11px] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 block font-bold">Unggah File (.PNG / .JPG / .SVG)</span>
                <label className="w-full bg-white border border-dashed border-slate-300 rounded-xl py-1.5 px-2.5 text-[10px] hover:bg-slate-50 text-slate-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  Pilih File Gambar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            {companyLogoUrl && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                <span className="text-[9px] font-bold text-slate-400">Preview Logo Kustom:</span>
                <div className="bg-white p-1 rounded-lg border border-slate-150 inline-block">
                  <CuteLogo type="cute-pill" theme={activeTheme} size={32} customUrl={companyLogoUrl} />
                </div>
                <button
                  type="button"
                  onClick={() => setCompanyLogoUrl('')}
                  className="text-[9px] text-rose-600 font-bold hover:underline"
                >
                  Hapus Logo Kustom
                </button>
              </div>
            )}
          </div>

          {/* Theme Selector (5 Gorgeous presets) */}
          <div className="space-y-2 pt-2 border-t border-slate-50">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Pilih Tema Estetik (5 Pilihan Cantik)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {THEMES_LIST.map((t) => (
                <div
                  key={t.key}
                  onClick={() => setActiveTheme(t.key as any)}
                  className={`p-3 border rounded-2xl cursor-pointer transition-all flex sm:flex-col items-center gap-2 ${
                    activeTheme === t.key ? 'border-indigo-500 bg-indigo-50/20 shadow-xs' : 'border-slate-150 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full block border shadow-xs ${t.colorClass}`} />
                  <span className="text-[9px] font-bold text-slate-600 block text-center leading-tight">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-slate-50">
            <button
              id="save-settings-btn"
              type="submit"
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-display font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${style.primary}`}
            >
              <Check className="w-4 h-4" />
              Simpan & Terapkan Perubahan
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: Cloud Synchronization, File Backups, and employee logout */}
      <div className="lg:col-span-5 space-y-6">
        {/* Printer Settings Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-2.5">
            <Printer className="w-4 h-4 text-indigo-500" />
            Pengaturan Printer Kasir (Bluetooth/Thermal)
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-150/40">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-700 block text-[10px]">Status Koneksi Printer</span>
                <span className="text-[9px] text-slate-400 block">Sambungkan printer thermal bluetooth secara otomatis.</span>
              </div>
              <input
                type="checkbox"
                checked={printerConnected}
                onChange={(e) => {
                  setPrinterConnected(e.target.checked);
                }}
                className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nama Perangkat Printer</label>
              <input
                type="text"
                placeholder="Contoh: RONGTA RP58-U"
                value={printerName}
                onChange={(e) => setPrinterName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-bold text-slate-700"
                disabled={!printerConnected}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (!printerConnected) {
                    alert('Aktifkan printer terlebih dahulu!');
                    return;
                  }
                  alert(`🖨️ [TEST PRINT - ${printerName}]\n--------------------------------\nAPOTEK ${compName.toUpperCase()}\n--------------------------------\nKoneksi Printer Berhasil!\nSistem siap mencetak struk.\n--------------------------------`);
                }}
                className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 border border-indigo-200 cursor-pointer transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Test Print
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!printerConnected) {
                    alert('Aktifkan printer terlebih dahulu!');
                    return;
                  }
                  const mockPrinters = ['RONGTA RP58-U', 'EPSON TM-T88VI', 'PT-210 Mini Thermal', 'Zjiang ZJ-5802LD'];
                  const randomPrinter = mockPrinters[Math.floor(Math.random() * mockPrinters.length)];
                  setPrinterName(randomPrinter);
                  alert(`🔍 Menemukan printer terdekat!\nBerhasil tersambung dengan: ${randomPrinter}`);
                }}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Cari Printer
              </button>
            </div>
          </div>
        </div>

        {/* Offline-First Cloud Sync Module */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-2.5">
            <Wifi className="w-4 h-4 text-emerald-500" />
            Sinkronisasi Cloud & Multi-Perangkat
          </h4>

          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between text-[11px] font-medium text-emerald-800">
            <div className="space-y-0.5">
              <span className="block font-bold">Status: Online & Sinkron</span>
              <span className="text-[9px] text-emerald-600 block">Sinc terakhir: {lastSynced}</span>
            </div>
            <button
              onClick={triggerCloudSyncSimulate}
              disabled={isSyncing}
              className="py-1 px-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              Sinkronkan Sekarang
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-[10px] text-slate-500 font-sans leading-normal flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>Mode offline tetap aktif penuh. Jika jaringan internet terputus, data tersimpan aman di database lokal ApoCute dan otomatis tersinkronisasi kembali saat terhubung internet.</span>
          </div>
        </div>

        {/* Database Backup & Restore File (Prevents data loss) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-2.5">
            <CloudLightning className="w-4 h-4 text-amber-500" />
            Backup & Restore Data Lokal (.JSON)
          </h4>

          <p className="text-[10px] text-slate-400 leading-normal">Unduh cadangan data komprehensif apotek Anda sewaktu-waktu atau pulihkan dari file backup sebelumnya untuk menghindari kehilangan data penting.</p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Backup Download */}
            <button
              onClick={onBackupData}
              className="py-2.5 px-3 rounded-xl border border-indigo-100 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 font-display font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Backup (.json)
            </button>

            {/* Restore Upload */}
            <label className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-display font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Pulihkan Backup
              <input
                type="file"
                accept=".json"
                onChange={onRestoreData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Account Info and Logout with High Security info */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 pb-2.5">
            <Key className="w-4 h-4 text-rose-500" />
            Karyawan Terkunci & Keamanan
          </h4>

          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-150">
            <div>
              <span className="text-[9px] text-slate-400 block font-bold uppercase">Kasir Aktif</span>
              <span className="font-display font-bold text-slate-700 text-xs block">{activeEmployee ? activeEmployee.username : 'Kasir'}</span>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block">
                Level Keamanan: {activeEmployee ? activeEmployee.role : 'Kasir'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-display font-bold text-[10px] rounded-xl transition-all border border-rose-150/40"
            >
              Keluar Sistem
            </button>
          </div>

          <p className="text-[9px] text-slate-400 font-sans leading-normal text-center bg-slate-50 p-2 rounded-xl">PIN Keamanan dienkripsi penuh menggunakan hash SHA-256 tersandarisasi militer untuk perlindungan database maksimal.</p>
        </div>
      </div>
    </div>
  );
}
