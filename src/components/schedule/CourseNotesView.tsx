/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Share2,
  Trash2,
  Edit2,
  Printer,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileCheck,
  Layers,
  CheckSquare,
  Square,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  ExternalLink,
  X
} from 'lucide-react';
import { CourseItem, CourseNoteItem } from '../../types/schedule';
import {
  deleteCourseNote,
  shareCourseNotes
} from '../../lib/scheduleNotesStorage';
import {
  groupNotesByCourseAndGrade,
  generateCourseNotesPdf,
  generateMasterBookletPdf,
  MergedCourseGroup
} from '../../lib/schedulePdfService';
import toast from 'react-hot-toast';

interface CourseNotesViewProps {
  notes: CourseNoteItem[];
  courses: CourseItem[];
  onAddNote: (course?: CourseItem) => void;
  onEditNote: (note: CourseNoteItem) => void;
}

export default function CourseNotesView({
  notes,
  courses,
  onAddNote,
  onEditNote
}: CourseNotesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'stream'>('grouped');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [activeReadingNote, setActiveReadingNote] = useState<CourseNoteItem | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null); // groupKey or 'all' or noteId

  // Distinct courses for filter dropdown
  const filterCourseOptions = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((c) => {
      map.set(c.id, c.courseName);
    });
    notes.forEach((n) => {
      if (!map.has(n.courseId)) {
        map.set(n.courseId, n.courseName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [courses, notes]);

  // Group notes by Course and Grade
  const courseGroups = useMemo(() => {
    return groupNotesByCourseAndGrade(notes, courses);
  }, [notes, courses]);

  // Filtered groups based on search & grade
  const filteredGroups = useMemo(() => {
    return courseGroups
      .map((group) => {
        // Filter by grade
        if (selectedGradeFilter !== 'all' && group.grade !== selectedGradeFilter) {
          return null;
        }

        // Filter by course
        if (selectedCourseFilter !== 'all' && group.courseId !== selectedCourseFilter) {
          return null;
        }

        // Filter notes within group by search
        if (!searchQuery.trim()) {
          return group;
        }

        const q = searchQuery.toLowerCase();
        const matchesGroupMeta =
          group.courseName.toLowerCase().includes(q) ||
          group.courseCode.toLowerCase().includes(q) ||
          (group.instructor || '').toLowerCase().includes(q) ||
          group.gradeLabel.toLowerCase().includes(q);

        if (matchesGroupMeta) {
          return group;
        }

        const matchingNotes = group.notes.filter((n) => {
          return (
            (n.title || '').toLowerCase().includes(q) ||
            (n.content || '').toLowerCase().includes(q) ||
            (n.date || '').toLowerCase().includes(q) ||
            (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
          );
        });

        if (matchingNotes.length > 0) {
          return {
            ...group,
            notes: matchingNotes
          };
        }

        return null;
      })
      .filter((g): g is MergedCourseGroup => g !== null);
  }, [courseGroups, selectedGradeFilter, selectedCourseFilter, searchQuery]);

  // Filtered flat notes for stream mode
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (selectedCourseFilter !== 'all' && n.courseId !== selectedCourseFilter) {
        return false;
      }
      if (selectedGradeFilter !== 'all' && n.grade !== undefined && n.grade !== selectedGradeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = (n.title || '').toLowerCase().includes(q);
        const inContent = (n.content || '').toLowerCase().includes(q);
        const inCourse = (n.courseName || '').toLowerCase().includes(q);
        const inCode = (n.courseCode || '').toLowerCase().includes(q);
        const inInstructor = (n.instructor || '').toLowerCase().includes(q);
        const inTags = n.tags && n.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inContent && !inCourse && !inCode && !inInstructor && !inTags) {
          return false;
        }
      }
      return true;
    });
  }, [notes, selectedCourseFilter, selectedGradeFilter, searchQuery]);

  const toggleGroupExpand = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleNoteSelection = (id: string) => {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllInView = () => {
    const ids = filteredNotes.map((n) => n.id);
    if (selectedNoteIds.size === ids.length) {
      setSelectedNoteIds(new Set());
    } else {
      setSelectedNoteIds(new Set(ids));
    }
  };

  const handleDelete = (id: string, title: string) => {
    deleteCourseNote(id);
    setDeletingNoteId(null);
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (activeReadingNote?.id === id) {
      setActiveReadingNote(null);
    }
    toast.success(`"${title || 'Ders notu'}" silindi`);
  };

  // Export merged PDF for a specific course group (Same course & same grade)
  const handleExportGroupMergedPdf = async (group: MergedCourseGroup) => {
    setIsExporting(group.key);
    try {
      const result = await generateCourseNotesPdf({
        notes: group.notes,
        courseGroup: group
      });
      if (result.success) {
        toast.success(result.message || `${group.courseName} için birleştirilmiş PDF hazırlandı!`);
      } else {
        toast.error(result.message || 'PDF oluşturulamadı');
      }
    } catch (err: any) {
      console.error('PDF export error:', err);
      toast.error('PDF aktarma işlemi sırasında bir hata oluştu');
    } finally {
      setIsExporting(null);
    }
  };

  // Export single note as PDF
  const handleExportSingleNotePdf = async (note: CourseNoteItem) => {
    setIsExporting(note.id);
    try {
      const matchedGroup = courseGroups.find(
        (g) => g.courseId === note.courseId || g.courseCode === note.courseCode
      );
      const result = await generateCourseNotesPdf({
        notes: [note],
        courseGroup: matchedGroup
      });
      if (result.success) {
        toast.success(result.message || `"${note.title}" PDF olarak hazırlandı!`);
      } else {
        toast.error(result.message || 'PDF oluşturulamadı');
      }
    } catch (err: any) {
      console.error('Single note PDF export error:', err);
      toast.error('PDF aktarılırken bir hata oluştu');
    } finally {
      setIsExporting(null);
    }
  };

  // Export custom selected notes merged
  const handleExportSelectedMergedPdf = async () => {
    const selectedNotes = notes.filter((n) => selectedNoteIds.has(n.id));
    if (selectedNotes.length === 0) {
      toast.error('Lütfen birleştirilecek en az bir ders notu seçin');
      return;
    }
    setIsExporting('selected');
    try {
      const result = await generateCourseNotesPdf({
        notes: selectedNotes,
        titleOverride: 'Seçilen Ders Notları Dosyası',
        subtitleOverride: `Öğrenci Seçimli ${selectedNotes.length} Ders Notu`
      });
      if (result.success) {
        toast.success(result.message || `${selectedNotes.length} not tek PDF'te birleştirildi!`);
      } else {
        toast.error(result.message || 'PDF oluşturulamadı');
      }
    } catch (err: any) {
      console.error('Selected merge PDF export error:', err);
      toast.error('PDF aktarılırken bir hata oluştu');
    } finally {
      setIsExporting(null);
    }
  };

  // Export Master Study Booklet (All notes grouped)
  const handleExportMasterBooklet = async () => {
    if (notes.length === 0) {
      toast.error('Dışa aktarılacak kayıtlı not bulunmuyor');
      return;
    }
    setIsExporting('master');
    try {
      const result = await generateMasterBookletPdf(notes, courses);
      if (result.success) {
        toast.success(result.message || 'Tüm ders notları kitapçığı oluşturuldu!');
      } else {
        toast.error(result.message || 'PDF kitapçık oluşturulamadı');
      }
    } catch (err: any) {
      console.error('Master booklet PDF export error:', err);
      toast.error('Kitapçık oluşturulurken bir sorun meydana geldi');
    } finally {
      setIsExporting(null);
    }
  };

  const handleShare = async (note: CourseNoteItem) => {
    const success = await shareCourseNotes([note], note.courseName);
    if (success) {
      toast.success('Paylaşım menüsü açıldı veya panoya kopyalandı!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card & Stats Banner */}
      <div className="bg-gradient-to-r from-[#8a2a43]/10 via-[#264653]/10 to-amber-500/10 dark:from-[#8a2a43]/20 dark:via-[#264653]/30 dark:to-amber-500/15 p-4 sm:p-5 rounded-2xl border border-[#8a2a43]/15 dark:border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#8a2a43] text-white">
                DERS NOTLARI ARŞİVİ
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <FileCheck className="w-3 h-3" />
                Kurumsal PDF Raporlama
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-stone-900 dark:text-white">
              Ders ve Çalışma Notları Yönetimi
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
              İşlenen derslerinizin notlarını inceleyin. Aynı ders ve sınıftaki notları tek bir kurumsal PDF şablonunda otomatik birleştirip indirin veya kolayca paylaşın.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/20 border border-stone-200 dark:border-white/10 text-center min-w-[76px]">
              <div className="text-base sm:text-lg font-extrabold text-[#8a2a43] dark:text-[#f4a261]">
                {notes.length}
              </div>
              <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase">
                Toplam Not
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-black/20 border border-stone-200 dark:border-white/10 text-center min-w-[76px]">
              <div className="text-base sm:text-lg font-extrabold text-[#264653] dark:text-sky-300">
                {courseGroups.length}
              </div>
              <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase">
                Ders Grubu
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAddNote()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#722237] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#8a2a43]/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Not</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="bg-[#fcfbf9] dark:bg-[#264653]/60 p-3.5 sm:p-4 rounded-2xl border border-[#e6e2d6] dark:border-white/10 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ders adı, konu, formül, hoca veya etiket ara..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-[#1d3540] border border-[#e6e2d6] dark:border-white/15 text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8a2a43]"
            />
          </div>

          {/* Sınıf Filtresi (Grade Filter) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedGradeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedGradeFilter === 'all'
                  ? 'bg-[#8a2a43] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1d3540] text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-[#e6e2d6] dark:border-white/10'
              }`}
            >
              Tüm Sınıflar
            </button>
            {[1, 2, 3, 4].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGradeFilter(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedGradeFilter === g
                    ? 'bg-[#8a2a43] text-white shadow-sm'
                    : 'bg-white dark:bg-[#1d3540] text-stone-600 dark:text-stone-300 hover:bg-stone-100 border border-[#e6e2d6] dark:border-white/10'
                }`}
              >
                {g}. Sınıf
              </button>
            ))}
          </div>

          {/* Mode Switch (Gruplanmış vs Kronolojik) */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-black/20 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-[#264653] text-[#8a2a43] dark:text-[#f4a261] shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ders Grupları</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('stream')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'stream'
                  ? 'bg-white dark:bg-[#264653] text-[#8a2a43] dark:text-[#f4a261] shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tüm Notlar</span>
            </button>
          </div>
        </div>

        {/* Global Export Options Strip */}
        {notes.length > 0 && (
          <div className="pt-2 border-t border-[#e6e2d6] dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Hızlı Dışa Aktar:</span>
              <button
                type="button"
                onClick={handleExportMasterBooklet}
                disabled={isExporting !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
                title="Tüm sınıflardaki notları tek bir akademik çalışma kitapçığı olarak dışa aktar"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{isExporting === 'master' ? 'Oluşturuluyor...' : 'Tüm Notları Tek Kitapçık Yap (PDF)'}</span>
              </button>
            </div>

            {selectedNoteIds.size > 0 && (
              <div className="flex items-center gap-2 bg-[#8a2a43]/10 dark:bg-[#8a2a43]/30 px-3 py-1.5 rounded-xl border border-[#8a2a43]/20">
                <span className="font-bold text-[#8a2a43] dark:text-[#f4a261]">
                  {selectedNoteIds.size} not seçildi
                </span>
                <button
                  type="button"
                  onClick={handleExportSelectedMergedPdf}
                  disabled={isExporting !== null}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8a2a43] text-white font-bold text-xs hover:bg-[#722237] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Printer className="w-3 h-3" />
                  <span>{isExporting === 'selected' ? 'Birleştiriliyor...' : 'Seçilenleri Birleştirip PDF İndir'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNoteIds(new Set())}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  title="Seçimi Temizle"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {notes.length === 0 ? (
        /* Empty State */
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#fcfbf9] dark:bg-[#264653]/40 border border-[#e6e2d6] dark:border-white/10 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white">
              Henüz kayıtlı ders notu bulunmuyor
            </h4>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-300">
              Dersleriniz için konu başlıklarını, sınav sorularını ve özetleri kaydedebilir; aynı ders ve sınıftaki tüm notları tek tuşla resmi K7AÜ PDF şablonunda birleştirebilirsiniz.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => onAddNote()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8a2a43] hover:bg-[#722237] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#8a2a43]/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>İlk Ders Notunu Ekle</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grouped' ? (
        /* GROUPED VIEW: Course & Grade Cards */
        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#264653]/40 rounded-2xl border border-stone-200 dark:border-white/10 text-stone-500 text-sm">
              Filtrelerinize uygun ders notu grubu bulunamadı.
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isExpanded = expandedGroups[group.key] ?? true; // expanded by default
              const isGroupExporting = isExporting === group.key;

              return (
                <motion.div
                  key={group.key}
                  layout
                  className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all"
                >
                  {/* Group Header Card */}
                  <div className="p-4 sm:p-5 bg-[#f5f3ed] dark:bg-[#1d3540] border-b border-[#e6e2d6] dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#8a2a43] text-white">
                          {group.gradeLabel}
                        </span>
                        {group.courseCode && (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-[#8a2a43]/15 text-[#8a2a43] dark:text-[#f4a261] border border-[#8a2a43]/20">
                            {group.courseCode}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          {group.notes.length} Not Kaydı
                        </span>
                      </div>

                      <h3 className="font-display font-extrabold text-base sm:text-lg text-stone-900 dark:text-white">
                        {group.courseName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-stone-300">
                        {group.instructor && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#8a2a43] dark:text-[#f4a261]" />
                            {group.instructor}
                          </span>
                        )}
                        {group.classroom && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            {group.classroom}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Group Action Buttons: Merged PDF */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                      <button
                        type="button"
                        onClick={() => handleExportGroupMergedPdf(group)}
                        disabled={isGroupExporting}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#8a2a43] hover:bg-[#722237] text-white text-xs font-bold shadow-sm shadow-[#8a2a43]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        title="Bu ders ve sınıftaki tüm notları tek kurumsal PDF şablonunda birleştirerek dışa aktar"
                      >
                        <Printer className="w-4 h-4 text-white" />
                        <span>
                          {isGroupExporting
                            ? 'PDF Hazırlanıyor...'
                            : `Bu Dersin ${group.notes.length} Notunu Tek PDF'te Birleştir`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleGroupExpand(group.key)}
                        className="p-2 rounded-xl bg-white dark:bg-[#264653] border border-stone-200 dark:border-white/10 text-stone-500 hover:text-stone-800 dark:hover:text-white transition-colors cursor-pointer"
                        title={isExpanded ? 'Notları Gizle' : 'Notları Göster'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Notes Inside Group */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 space-y-3 bg-[#fcfbf9] dark:bg-[#264653]/60">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {group.notes.map((note, index) => (
                          <div
                            key={note.id}
                            className="bg-white dark:bg-[#1d3540] border border-[#e6e2d6] dark:border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-[#8a2a43]/30 transition-all group"
                          >
                            <div className="space-y-2">
                              {/* Top Bar inside note */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="w-6 h-6 rounded-lg bg-[#8a2a43]/10 text-[#8a2a43] dark:text-[#f4a261] font-bold text-xs flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                                    <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <span>Ders Tarihi: {note.date || 'İşlenen Ders'}</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setActiveReadingNote(note)}
                                    className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                                    title="Notu Oku / Tam Ekran"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onEditNote(note)}
                                    className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                                    title="Düzenle"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingNoteId(note.id)}
                                    className="p-1 rounded-md text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <h4
                                onClick={() => setActiveReadingNote(note)}
                                className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-white line-clamp-1 cursor-pointer hover:text-[#8a2a43] dark:hover:text-[#f4a261] transition-colors"
                              >
                                {note.title || 'Ders Notu'}
                              </h4>

                              {/* Tags if any */}
                              {note.tags && note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {note.tags.map((t, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-300"
                                    >
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Note text preview */}
                              <p
                                onClick={() => setActiveReadingNote(note)}
                                className="text-xs text-stone-700 dark:text-stone-200 line-clamp-3 leading-relaxed cursor-pointer font-normal"
                              >
                                {note.content}
                              </p>
                            </div>

                            {/* Note Action Strip */}
                            <div className="pt-2 border-t border-stone-100 dark:border-white/10 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-stone-400 font-medium">
                                {note.classroom || group.classroom || 'Derslik Belirtilmedi'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleExportSingleNotePdf(note)}
                                  disabled={isExporting === note.id}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                                  title="Sadece bu tekil notu PDF olarak kaydet"
                                >
                                  <Printer className="w-3 h-3 text-[#8a2a43] dark:text-[#f4a261]" />
                                  <span>{isExporting === note.id ? '...' : 'Tek Not PDF'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleShare(note)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
                                  title="Paylaş veya Kopyala"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Inline Delete Confirmation */}
                            {deletingNoteId === note.id && (
                              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between gap-2">
                                <span className="text-rose-700 dark:text-rose-300 font-medium">
                                  Not silinsin mi?
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setDeletingNoteId(null)}
                                    className="px-2 py-1 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-200/50"
                                  >
                                    İptal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(note.id, note.title)}
                                    className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700"
                                  >
                                    Sil
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* STREAM VIEW: All Notes with Checkbox Multi-Selection */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-stone-500 dark:text-stone-400">
            <button
              type="button"
              onClick={handleSelectAllInView}
              className="flex items-center gap-1.5 font-bold hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {selectedNoteIds.size === filteredNotes.length && filteredNotes.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#8a2a43]" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
              <span>Tümünü Seç / Seçimi Kaldır ({filteredNotes.length})</span>
            </button>
            <span>{selectedNoteIds.size} not seçili</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => {
              const isSelected = selectedNoteIds.has(note.id);
              return (
                <div
                  key={note.id}
                  className={`bg-[#fcfbf9] dark:bg-[#264653] border rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 transition-all ${
                    isSelected
                      ? 'border-[#8a2a43] shadow-md ring-1 ring-[#8a2a43]'
                      : 'border-[#e6e2d6] dark:border-white/10 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleNoteSelection(note.id)}
                          className="text-stone-400 hover:text-[#8a2a43] transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-[#8a2a43]" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#8a2a43]/15 text-[#8a2a43] dark:text-[#f4a261]">
                              {note.courseCode || 'DERS'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Ders Tarihi: {note.date || 'İşlenen Ders'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveReadingNote(note)}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-white"
                          title="Tam Metin"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditNote(note)}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-white"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingNoteId(note.id)}
                          className="p-1 rounded-md text-stone-400 hover:text-rose-600"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3
                      onClick={() => setActiveReadingNote(note)}
                      className="font-display font-bold text-base text-stone-900 dark:text-white line-clamp-1 cursor-pointer hover:text-[#8a2a43]"
                    >
                      {note.title || 'Ders Notu'}
                    </h3>

                    <div className="text-xs text-stone-600 dark:text-stone-300 bg-stone-100/80 dark:bg-black/15 p-2 rounded-xl flex items-center justify-between">
                      <span className="font-bold text-stone-900 dark:text-white truncate">
                        {note.courseName}
                      </span>
                      {note.instructor && (
                        <span className="text-stone-500 dark:text-stone-400 truncate">
                          {note.instructor}
                        </span>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 line-clamp-3 leading-relaxed">
                      {note.content}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#e6e2d6] dark:border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-stone-400">
                      {note.day} {note.startTime ? `${note.startTime} - ${note.endTime}` : ''}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleExportSingleNotePdf(note)}
                        disabled={isExporting === note.id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                        title="Bu tekil notu PDF olarak kaydet"
                      >
                        <Printer className="w-3 h-3 text-[#8a2a43] dark:text-[#f4a261]" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(note)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Note Reader Modal (Detail Full-Screen View) */}
      <AnimatePresence>
        {activeReadingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#fcfbf9] dark:bg-[#1d3540] border border-[#e6e2d6] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Top Bar */}
              <div className="p-4 sm:p-5 border-b border-[#e6e2d6] dark:border-white/10 bg-[#f4f1ea] dark:bg-[#264653]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#8a2a43]/15 text-[#8a2a43] dark:text-[#f4a261] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8a2a43] text-white">
                        {activeReadingNote.courseCode || 'DERS'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Ders Tarihi: {activeReadingNote.date || 'İşlenen Ders'}</span>
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white pt-0.5">
                      {activeReadingNote.title || 'Ders Notu Detayı'}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReadingNote(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Course Metadata Card */}
                <div className="p-3.5 rounded-xl bg-stone-100/90 dark:bg-white/5 border border-stone-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400">Ders Adı:</span>{' '}
                    <strong className="text-stone-900 dark:text-white">{activeReadingNote.courseName}</strong>
                  </div>
                  {activeReadingNote.instructor && (
                    <div>
                      <span className="text-stone-400">Öğretim Elemanı:</span>{' '}
                      <strong className="text-stone-900 dark:text-white">{activeReadingNote.instructor}</strong>
                    </div>
                  )}
                  {activeReadingNote.classroom && (
                    <div>
                      <span className="text-stone-400">Derslik:</span>{' '}
                      <strong className="text-stone-900 dark:text-white">{activeReadingNote.classroom}</strong>
                    </div>
                  )}
                  <div>
                    <span className="text-stone-400">Ders Saati:</span>{' '}
                    <strong className="text-stone-900 dark:text-white">
                      {activeReadingNote.day} {activeReadingNote.startTime ? `${activeReadingNote.startTime} - ${activeReadingNote.endTime}` : ''}
                    </strong>
                  </div>
                </div>

                {/* Tags */}
                {activeReadingNote.tags && activeReadingNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {activeReadingNote.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Note Body */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#152730] border border-stone-200 dark:border-white/10 text-stone-900 dark:text-stone-100 text-sm leading-relaxed whitespace-pre-wrap font-normal select-text">
                  {activeReadingNote.content}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-[#e6e2d6] dark:border-white/10 bg-[#f4f1ea] dark:bg-[#264653]/40 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const note = activeReadingNote;
                    setActiveReadingNote(null);
                    onEditNote(note);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-200/80 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/15 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Düzenle</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleShare(activeReadingNote)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-200/80 hover:bg-stone-300 dark:bg-white/10 dark:hover:bg-white/15 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Paylaş</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportSingleNotePdf(activeReadingNote)}
                    disabled={isExporting === activeReadingNote.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8a2a43] hover:bg-[#722237] text-white text-xs font-bold shadow-md shadow-[#8a2a43]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isExporting === activeReadingNote.id ? 'Hazırlanıyor...' : 'PDF Olarak Kaydet / Paylaş'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
