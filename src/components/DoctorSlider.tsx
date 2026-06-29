import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Settings, Send, Edit2, Trash2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorSliderProps {
  doctors: Doctor[];
  theme: 'lavender' | 'minty' | 'ocean' | 'sunset' | 'cherry';
  currentDay: string;
  handleOpenEditModal: (doc: Doctor) => void;
  handleDelete: (id: string) => void;
  handleSendShiftReminder: (doc: Doctor) => void;
}

export const DoctorSlider: React.FC<DoctorSliderProps> = ({
  doctors,
  theme,
  currentDay,
  handleOpenEditModal,
  handleDelete,
  handleSendShiftReminder
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeSettingsCardId, setActiveSettingsCardId] = useState<string | null>(null);
  const [showRawTable, setShowRawTable] = useState(false);

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

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h3 className="font-display font-bold text-slate-800 text-sm">
            Slide Showcase & Database Dokter ({doctors.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowRawTable(!showRawTable)}
          className="text-[10px] text-indigo-600 font-bold hover:underline transition-all cursor-pointer"
        >
          {showRawTable ? 'Sembunyikan Format Tabel' : 'Tampilkan Format Tabel'}
        </button>
      </div>

      {/* MODERN SLIDER SECTION */}
      {doctors.length === 0 ? (
        <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-400 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-[11px]">Database Dokter Kosong</p>
          <p className="text-[10px]">Silakan klik tombol "Tambah Dokter" untuk mendaftarkan dokter baru.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Slide view container with sliding layout */}
          <div className="overflow-hidden rounded-[32px] p-1">
            <div 
              className="flex gap-5 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${slideIndex * (310 + 20)}px)` }}
            >
              {doctors.map((doc) => {
                const avatarSeed = (doc.gender === 'Perempuan' || doc.name.toLowerCase().includes('sarah') || doc.name.toLowerCase().includes('amalia') || doc.name.toLowerCase().includes('putri')) ? 'female' : 'male';
                const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}-${encodeURIComponent(doc.name)}&backgroundColor=transparent`;
                const isSettingsOpen = activeSettingsCardId === doc.id;
                
                return (
                  <div 
                    key={doc.id}
                    className="w-[310px] h-[460px] bg-white rounded-[32px] border border-slate-100 shadow-md relative overflow-hidden flex flex-col justify-between shrink-0 hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Top Bar inside Card */}
                    <div className="p-5 pb-0 flex justify-between items-start z-10">
                      {/* Holographic Logo badge */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 rounded-xl px-2.5 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-mono font-bold tracking-widest text-slate-500 uppercase">APOCUTE CLINIC</span>
                      </div>

                      {/* Settings Button */}
                      <button
                        type="button"
                        onClick={() => setActiveSettingsCardId(isSettingsOpen ? null : doc.id)}
                        className={`p-2 rounded-xl border border-slate-150 transition-all cursor-pointer ${
                          isSettingsOpen 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Photo / Avatar Section with big overlapping transparent portrait */}
                    <div className="relative flex-1 flex flex-col items-center justify-center -mt-6">
                      {/* Backdrop decorative glowing ring */}
                      <div className="absolute w-36 h-36 rounded-full bg-radial from-indigo-100 to-transparent opacity-80" />
                      
                      {/* Big transparent photo */}
                      <img
                        src={doc.photoUrl || avatarUrl}
                        alt={doc.name}
                        referrerPolicy="no-referrer"
                        className="w-40 h-40 object-contain z-10 drop-shadow-md select-none transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Card Info details */}
                    <div className="p-5 pt-0 text-center space-y-2.5 z-10">
                      <div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-wider ${style.badge}`}>
                          {doc.specialization}
                        </span>
                        <h4 className="font-display font-black text-slate-800 text-sm tracking-tight mt-1 truncate">{doc.name}</h4>
                        <span className="text-[8px] font-mono text-slate-400 block mt-0.5">SIP. {doc.id.toUpperCase()}/MED-REG/2026</span>
                      </div>

                      {/* Interactive info fields */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-left">
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Jam Praktek</span>
                          <span className="font-mono text-slate-700 font-bold text-[10px]">{doc.scheduleHours}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Telepon (WA)</span>
                          <span className="font-mono text-slate-700 font-bold text-[10px] truncate block">{doc.phone}</span>
                        </div>
                        <div className="col-span-2 space-y-0.5 pt-1.5 border-t border-slate-200/40">
                          <span className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">Hari Jaga Aktif</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {doc.dutyDays.map((day) => (
                              <span key={day} className="bg-white border border-slate-150 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom action stripe */}
                    <div className="bg-slate-50/50 border-t border-slate-100 py-3 px-5 flex items-center justify-between">
                      <span className="text-[8px] font-mono text-slate-400">STAFF.DOCKER.ACTIVE</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                          doc.status === 'Aktif' ? 'bg-emerald-500' :
                          doc.status === 'Istirahat' ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`} />
                        <span className="font-bold text-slate-600 text-[9px]">{doc.status}</span>
                      </div>
                    </div>

                    {/* Overlap Quick Settings Drawer Panel inside Card */}
                    <AnimatePresence>
                      {isSettingsOpen && (
                        <motion.div 
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{ type: "spring", damping: 25, stiffness: 200 }}
                          className="absolute inset-x-0 bottom-0 bg-slate-900 text-white z-20 rounded-t-[32px] p-6 shadow-2xl flex flex-col justify-between"
                          style={{ height: "70%" }}
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                              <h5 className="font-display font-bold text-xs text-indigo-400 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                Kelola Dokter Jaga
                              </h5>
                              <span className="text-[8px] font-mono text-slate-500">ID: {doc.id}</span>
                            </div>
                            
                            <p className="text-[10px] text-slate-400">
                              Lakukan tindakan administratif cepat untuk <strong className="text-white">{doc.name}</strong>.
                            </p>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleSendShiftReminder(doc);
                                  setActiveSettingsCardId(null);
                                }}
                                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold flex items-center justify-center gap-1 text-[9px] transition-all cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                Kirim WA Jaga
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenEditModal(doc);
                                  setActiveSettingsCardId(null);
                                }}
                                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold flex items-center justify-center gap-1 text-[9px] transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit Jadwal
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleDelete(doc.id);
                                  setActiveSettingsCardId(null);
                                }}
                                className="col-span-2 py-2.5 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 rounded-xl font-bold flex items-center justify-center gap-1 text-[9px] transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                Hapus Dokter Jaga
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveSettingsCardId(null)}
                            className="text-center text-[10px] text-slate-500 hover:text-slate-300 transition-all font-bold pt-2 border-t border-slate-800/60"
                          >
                            Tutup Menu
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Sliders indicator dots and buttons */}
          <div className="flex items-center justify-between mt-5 px-1">
            <div className="flex gap-1.5">
              {Array.from({ length: Math.max(0, doctors.length - 2) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${slideIndex === i ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-200'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={slideIndex === 0}
                onClick={() => setSlideIndex(prev => Math.max(0, prev - 1))}
                className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                type="button"
                disabled={slideIndex >= doctors.length - 3}
                onClick={() => setSlideIndex(prev => Math.min(doctors.length - 3, prev + 1))}
                className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAW DATABASE TABLE FORMAT (EXPANDABLE/COLLAPSIBLE) */}
      {showRawTable && doctors.length > 0 && (
        <div className="overflow-x-auto border-t border-slate-100 pt-4 mt-4 animate-fade-in">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Nama Dokter</th>
                <th className="py-3 px-4">Spesialisasi</th>
                <th className="py-3 px-4">Telepon (WA)</th>
                <th className="py-3 px-4">Hari Jaga</th>
                <th className="py-3 px-4">Jam Jaga</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {doctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-all text-[11px]">
                  <td className="py-3 px-4 font-bold text-slate-800">{doc.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${style.badge}`}>
                      {doc.specialization}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{doc.phone}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {doc.dutyDays.map((d) => (
                        <span key={d} className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded">
                          {d.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{doc.scheduleHours}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                      doc.status === 'Aktif' ? 'bg-emerald-500' :
                      doc.status === 'Istirahat' ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`} />
                    <span className="font-bold text-slate-600">{doc.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleSendShiftReminder(doc)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all cursor-pointer"
                        title="Kirim WA"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(doc)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
