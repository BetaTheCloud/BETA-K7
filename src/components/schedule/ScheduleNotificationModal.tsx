/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellOff,
  BellRing,
  X,
  Check,
  Clock,
  Volume2,
  VolumeX,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  FileText,
  Search,
  Sparkles,
  Info
} from 'lucide-react';
import {
  getNotificationConfig,
  saveNotificationConfig,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendTestNotification,
  isItemNotificationEnabled,
  toggleItemNotification,
  enableAllItemNotifications,
  disableAllItemNotifications,
  ScheduleNotificationConfig,
  NOTIFICATIONS_CONFIG_CHANGED_EVENT
} from '../../lib/scheduleNotificationService';
import { getStoredCourses, getStoredExams } from '../../lib/scheduleStorage';
import { CourseItem, ExamItem } from '../../types/schedule';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface ScheduleNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleNotificationModal({
  isOpen,
  onClose
}: ScheduleNotificationModalProps) {
  const [config, setConfig] = useState<ScheduleNotificationConfig>(getNotificationConfig);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'exams'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfig(getNotificationConfig());
      setCourses(getStoredCourses());
      setExams(getStoredExams());
      getNotificationPermissionStatus().then(setPermissionStatus);
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  // Listen to external config changes
  useEffect(() => {
    const handleConfigChange = () => {
      setConfig(getNotificationConfig());
    };
    window.addEventListener(NOTIFICATIONS_CONFIG_CHANGED_EVENT, handleConfigChange);
    return () => window.removeEventListener(NOTIFICATIONS_CONFIG_CHANGED_EVENT, handleConfigChange);
  }, []);

  const handleToggleGlobal = (enabled: boolean) => {
    const newCfg = { ...config, enabled };
    setConfig(newCfg);
    saveNotificationConfig(newCfg);
    if (enabled && permissionStatus !== 'granted') {
      handleRequestPermission();
    } else {
      toast.success(enabled ? 'Ders ve sınav bildirimleri açıldı.' : 'Bildirimler kapatıldı.');
    }
  };

  const handleToggleOffset = (offsetKey: 'notifyAt10Min' | 'notifyAt5Min') => {
    const newCfg = { ...config, [offsetKey]: !config[offsetKey] };
    if (!newCfg.notifyAt10Min && !newCfg.notifyAt5Min) {
      toast.error('En az bir bildirim zamanı (10 veya 5 dakika) seçilmelidir.');
      return;
    }
    setConfig(newCfg);
    saveNotificationConfig(newCfg);
    toast.success('Bildirim süresi güncellendi.');
  };

  const handleToggleSound = () => {
    const newCfg = { ...config, sound: !config.sound };
    setConfig(newCfg);
    saveNotificationConfig(newCfg);
  };

  const handleToggleVibrate = () => {
    const newCfg = { ...config, vibrate: !config.vibrate };
    setConfig(newCfg);
    saveNotificationConfig(newCfg);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    const status = await getNotificationPermissionStatus();
    setPermissionStatus(status);
    if (granted) {
      toast.success('Telefon bildirim izni başarıyla verildi!');
    } else {
      toast.error('Bildirim izni reddedildi. Lütfen tarayıcı / telefon ayarlarından bildirimlere izin verin.');
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const res = await sendTestNotification();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleItemToggle = (id: string, name: string) => {
    const isNowEnabled = toggleItemNotification(id);
    setConfig(getNotificationConfig());
    if (isNowEnabled) {
      toast.success(`"${name}" için bildirimler açıldı.`);
    } else {
      toast(`${name} için bildirimler kapatıldı.`, { icon: '🔕' });
    }
  };

  const handleEnableAll = () => {
    enableAllItemNotifications();
    setConfig(getNotificationConfig());
    toast.success('Tüm ders ve sınavlar için bildirimler açıldı.');
  };

  const handleDisableAll = () => {
    disableAllItemNotifications();
    setConfig(getNotificationConfig());
    toast('Tüm ders ve sınav bildirimleri kapatıldı.', { icon: '🔕' });
  };

  // Filtered lists
  const filteredCourses = courses.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.courseName.toLowerCase().includes(q) ||
      c.courseCode.toLowerCase().includes(q) ||
      (c.classroom && c.classroom.toLowerCase().includes(q)) ||
      c.day.toLowerCase().includes(q)
    );
  });

  const filteredExams = exams.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.courseName.toLowerCase().includes(q) ||
      e.courseCode.toLowerCase().includes(q) ||
      (e.classroom && e.classroom.toLowerCase().includes(q)) ||
      (e.examType && e.examType.toLowerCase().includes(q))
    );
  });

  const enabledCoursesCount = courses.filter((c) => isItemNotificationEnabled(c.id)).length;
  const enabledExamsCount = exams.filter((e) => isItemNotificationEnabled(e.id)).length;

  if (typeof document === 'undefined' || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/75 backdrop-blur-sm z-0"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-xl max-h-[90vh] bg-[#fcfbf9] dark:bg-[#1d3540] rounded-3xl shadow-2xl border border-stone-200 dark:border-white/10 flex flex-col overflow-hidden text-stone-900 dark:text-white"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-200/80 dark:border-white/10 flex items-center justify-between bg-stone-50/70 dark:bg-white/5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#8a2a43]/10 dark:bg-[#8a2a43]/25 text-[#8a2a43] dark:text-rose-300 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display font-extrabold tracking-tight leading-none text-stone-900 dark:text-white">
                  Ders & Sınav Bildirimleri
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-white/60 mt-0.5">
                  Başlamadan 10 ve 5 dakika önce telefona anlık bildirim
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm custom-scrollbar">
            {/* Master Toggle Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shadow-xs flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-white">
                  <span>Otomatik Telefon Bildirimleri</span>
                  {config.enabled ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 dark:bg-white/10 text-stone-600 dark:text-white/60">
                      Kapalı
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-white/60 leading-relaxed">
                  Eklediğiniz ders ve sınavlar için başlamadan 10 ve 5 dakika önce telefonunuza sesli ve titreşimli bildirim gönderilir.
                </p>
              </div>

              {/* iOS / Android style toggle switch */}
              <button
                type="button"
                onClick={() => handleToggleGlobal(!config.enabled)}
                className={cn(
                  'w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none',
                  config.enabled ? 'bg-[#8a2a43]' : 'bg-stone-300 dark:bg-white/20'
                )}
                aria-label="Bildirimleri aç/kapat"
              >
                <span
                  className={cn(
                    'block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out absolute top-0.5',
                    config.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>

            {/* Android Permission Warning if not granted */}
            {permissionStatus !== 'granted' && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-xs">Telefon Bildirim İzni Gerekli</p>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-relaxed">
                      Android telefonunuzun kilit ekranında ve bildirim çubuğunda hatırlatıcıların görünmesi için izin vermeniz gerekir.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  İzin Ver
                </button>
              </div>
            )}

            {/* Notification Timing & Preference Strip */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 10 Min Toggle */}
              <button
                type="button"
                onClick={() => handleToggleOffset('notifyAt10Min')}
                className={cn(
                  'p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between',
                  config.notifyAt10Min
                    ? 'bg-[#8a2a43]/10 dark:bg-[#8a2a43]/20 border-[#8a2a43]/40 text-stone-900 dark:text-white font-bold'
                    : 'bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-500 dark:text-white/60'
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8a2a43] dark:text-rose-300" />
                  <span className="text-xs">10 Dakika Kala</span>
                </div>
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border flex items-center justify-center',
                    config.notifyAt10Min
                      ? 'bg-[#8a2a43] border-[#8a2a43] text-white'
                      : 'border-stone-300 dark:border-white/20'
                  )}
                >
                  {config.notifyAt10Min && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* 5 Min Toggle */}
              <button
                type="button"
                onClick={() => handleToggleOffset('notifyAt5Min')}
                className={cn(
                  'p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between',
                  config.notifyAt5Min
                    ? 'bg-[#8a2a43]/10 dark:bg-[#8a2a43]/20 border-[#8a2a43]/40 text-stone-900 dark:text-white font-bold'
                    : 'bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-500 dark:text-white/60'
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8a2a43] dark:text-rose-300" />
                  <span className="text-xs">5 Dakika Kala</span>
                </div>
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border flex items-center justify-center',
                    config.notifyAt5Min
                      ? 'bg-[#8a2a43] border-[#8a2a43] text-white'
                      : 'border-stone-300 dark:border-white/20'
                  )}
                >
                  {config.notifyAt5Min && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            </div>

            {/* Sound & Vibrate + Test Button Action Row */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                    config.sound
                      ? 'bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white border-stone-200 dark:border-white/10'
                      : 'bg-transparent text-stone-400 dark:text-white/40 border-dashed border-stone-200 dark:border-white/10'
                  )}
                >
                  {config.sound ? <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Ses: {config.sound ? 'Açık' : 'Sessiz'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleVibrate}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                    config.vibrate
                      ? 'bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white border-stone-200 dark:border-white/10'
                      : 'bg-transparent text-stone-400 dark:text-white/40 border-dashed border-stone-200 dark:border-white/10'
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                  <span>Titreşim: {config.vibrate ? 'Açık' : 'Kapalı'}</span>
                </button>
              </div>

              {/* Test Notification Button */}
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer ml-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{isTesting ? 'Gönderiliyor...' : 'Test Bildirimi Gönder'}</span>
              </button>
            </div>

            {/* Individual Course & Exam Selection Section */}
            <div className="pt-2 border-t border-stone-200/80 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600 dark:text-white/70">
                    Bildirim Gönderilecek Ders ve Sınavlar
                  </h4>
                  <p className="text-[11px] text-stone-400 dark:text-white/40">
                    İstediğiniz ders veya sınavın bildirimini tek dokunuşla kapatıp açabilirsiniz.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleEnableAll}
                    className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 text-stone-700 dark:text-stone-300 transition-colors"
                  >
                    Tümünü Aç
                  </button>
                  <button
                    type="button"
                    onClick={handleDisableAll}
                    className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-stone-100 dark:bg-white/10 hover:bg-stone-200 text-stone-700 dark:text-stone-300 transition-colors"
                  >
                    Tümünü Kapat
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Courses vs Exams */}
              <div className="flex items-center gap-2 border-b border-stone-200/80 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('courses')}
                  className={cn(
                    'flex items-center gap-1.5 pb-2 px-1 text-xs font-bold transition-all relative',
                    activeTab === 'courses'
                      ? 'text-[#8a2a43] dark:text-white'
                      : 'text-stone-500 dark:text-white/50 hover:text-stone-800'
                  )}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Dersler ({enabledCoursesCount}/{courses.length})</span>
                  {activeTab === 'courses' && (
                    <motion.div
                      layoutId="subTabIndicator"
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-[#8a2a43]"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('exams')}
                  className={cn(
                    'flex items-center gap-1.5 pb-2 px-1 text-xs font-bold transition-all relative',
                    activeTab === 'exams'
                      ? 'text-[#8a2a43] dark:text-white'
                      : 'text-stone-500 dark:text-white/50 hover:text-stone-800'
                  )}
                >
                  <FileText className="w-4 h-4" />
                  <span>Sınavlar ({enabledExamsCount}/{exams.length})</span>
                  {activeTab === 'exams' && (
                    <motion.div
                      layoutId="subTabIndicator"
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-[#8a2a43]"
                    />
                  )}
                </button>
              </div>

              {/* Search Bar for items */}
              {(courses.length > 5 || exams.length > 5) && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ders adı, kodu veya derslik ara..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 text-xs focus:outline-none focus:border-[#8a2a43]"
                  />
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {activeTab === 'courses' ? (
                  filteredCourses.length === 0 ? (
                    <div className="p-6 text-center text-xs text-stone-400 dark:text-white/40 bg-white/40 dark:bg-white/5 rounded-2xl border border-dashed border-stone-200 dark:border-white/10">
                      {courses.length === 0
                        ? 'Henüz eklenmiş bir ders bulunmuyor. Ders programınızdan ders ekleyebilirsiniz.'
                        : 'Aramanızla eşleşen ders bulunamadı.'}
                    </div>
                  ) : (
                    filteredCourses.map((c) => {
                      const enabled = isItemNotificationEnabled(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleItemToggle(c.id, c.courseName)}
                          className={cn(
                            'p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                            enabled
                              ? 'bg-white dark:bg-white/5 border-stone-200/90 dark:border-white/15 shadow-2xs hover:border-[#8a2a43]/50'
                              : 'bg-stone-100/60 dark:bg-black/20 border-transparent opacity-60 hover:opacity-100'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={cn(
                                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                enabled
                                  ? 'bg-[#8a2a43]/10 dark:bg-[#8a2a43]/25 text-[#8a2a43] dark:text-rose-300'
                                  : 'bg-stone-200 dark:bg-white/10 text-stone-400 dark:text-white/30'
                              )}
                            >
                              {enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate leading-snug text-stone-900 dark:text-white">
                                {c.courseCode ? `${c.courseCode} - ` : ''}
                                {c.courseName}
                              </p>
                              <p className="text-[11px] text-stone-500 dark:text-white/60 truncate mt-0.5">
                                <span className="font-semibold text-amber-700 dark:text-amber-400">{c.day} {c.startTime}</span>
                                {c.classroom ? ` · ${c.classroom}` : ''}
                              </p>
                            </div>
                          </div>

                          {/* Switch toggle */}
                          <div
                            className={cn(
                              'w-10 h-5.5 rounded-full transition-colors relative cursor-pointer shrink-0',
                              enabled ? 'bg-[#8a2a43]' : 'bg-stone-300 dark:bg-white/20'
                            )}
                          >
                            <span
                              className={cn(
                                'block w-4.5 h-4.5 rounded-full bg-white shadow-xs transform transition-transform duration-200 absolute top-0.5',
                                enabled ? 'translate-x-5' : 'translate-x-0.5'
                              )}
                            />
                          </div>
                        </div>
                      );
                    })
                  )
                ) : filteredExams.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400 dark:text-white/40 bg-white/40 dark:bg-white/5 rounded-2xl border border-dashed border-stone-200 dark:border-white/10">
                    {exams.length === 0
                      ? 'Henüz eklenmiş bir sınav bulunmuyor. Sınav takviminizden sınav ekleyebilirsiniz.'
                      : 'Aramanızla eşleşen sınav bulunamadı.'}
                  </div>
                ) : (
                  filteredExams.map((e) => {
                    const enabled = isItemNotificationEnabled(e.id);
                    return (
                      <div
                        key={e.id}
                        onClick={() => handleItemToggle(e.id, e.courseName)}
                        className={cn(
                          'p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                          enabled
                            ? 'bg-white dark:bg-white/5 border-stone-200/90 dark:border-white/15 shadow-2xs hover:border-[#8a2a43]/50'
                            : 'bg-stone-100/60 dark:bg-black/20 border-transparent opacity-60 hover:opacity-100'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                              enabled
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                : 'bg-stone-200 dark:bg-white/10 text-stone-400 dark:text-white/30'
                            )}
                          >
                            {enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate leading-snug text-stone-900 dark:text-white">
                              {e.courseCode ? `${e.courseCode} - ` : ''}
                              {e.courseName}
                              {e.examType ? ` (${e.examType})` : ''}
                            </p>
                            <p className="text-[11px] text-stone-500 dark:text-white/60 truncate mt-0.5">
                              <span className="font-semibold text-rose-700 dark:text-rose-400">{e.date} {e.startTime}</span>
                              {e.classroom ? ` · ${e.classroom}` : ''}
                            </p>
                          </div>
                        </div>

                        {/* Switch toggle */}
                        <div
                          className={cn(
                            'w-10 h-5.5 rounded-full transition-colors relative cursor-pointer shrink-0',
                            enabled ? 'bg-[#8a2a43]' : 'bg-stone-300 dark:bg-white/20'
                          )}
                        >
                          <span
                            className={cn(
                              'block w-4.5 h-4.5 rounded-full bg-white shadow-xs transform transition-transform duration-200 absolute top-0.5',
                              enabled ? 'translate-x-5' : 'translate-x-0.5'
                            )}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Android Information Tip */}
            <div className="p-3 rounded-2xl bg-stone-100/80 dark:bg-white/5 border border-stone-200/60 dark:border-white/5 flex items-start gap-2.5 text-[11px] text-stone-600 dark:text-white/70">
              <Info className="w-4 h-4 text-[#8a2a43] dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Android İpucu:</strong> Uygulama kapalıyken de bildirimlerin eksiksiz gelmesi için telefonunuzun <em>Pil Ayarları ➔ K7AÜ ➔ Pil Kısıtlaması Yok (Arka Planda Çalış)</em> seçeneğini açmanız önerilir.
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="px-5 py-3.5 border-t border-stone-200/80 dark:border-white/10 bg-stone-50/70 dark:bg-white/5 flex items-center justify-between shrink-0">
            <span className="text-xs text-stone-500 dark:text-white/50">
              {config.enabled ? 'Bildirimler etkinleştirildi.' : 'Bildirimler devre dışı.'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#8a2a43] hover:bg-[#722237] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              Tamam
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
