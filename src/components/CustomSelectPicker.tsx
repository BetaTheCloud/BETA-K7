/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Temaya Uygun Özel Seçim & Arama Komponenti
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Search, X, Building2, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export interface CustomSelectPickerProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  onClear?: () => void;
  className?: string;
  title?: string;
}

export default function CustomSelectPicker({
  options,
  value,
  onChange,
  placeholder = '-- Seçim Yapınız --',
  disabled = false,
  label,
  searchable = true,
  searchPlaceholder = 'Birim veya seçenek ara...',
  clearable = false,
  onClear,
  className,
  title = 'Seçim Yapınız'
}: CustomSelectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected option object
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value) || null;
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLocaleLowerCase('tr');
    return options.filter((opt) => {
      const matchLabel = opt.label.toLocaleLowerCase('tr').includes(q);
      const matchBadge = opt.badge ? opt.badge.toLocaleLowerCase('tr').includes(q) : false;
      const matchDesc = opt.description ? opt.description.toLocaleLowerCase('tr').includes(q) : false;
      return matchLabel || matchBadge || matchDesc;
    });
  }, [options, searchTerm]);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC key handler to close picker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) onClear();
    else onChange('');
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Label (if provided) */}
      {label && (
        <label className="text-[11px] font-bold text-stone-500 dark:text-white/60 mb-1.5 block uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs select-none text-left",
          disabled
            ? "bg-stone-100 dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-400 dark:text-white/30 cursor-not-allowed opacity-60"
            : isOpen
            ? "bg-white dark:bg-[#1f3844] border-amber-500 ring-2 ring-amber-500/20 text-stone-900 dark:text-white"
            : "bg-white dark:bg-[#1f3844] border-stone-200 dark:border-white/10 text-stone-900 dark:text-white hover:border-amber-500/60 dark:hover:border-amber-400/60"
        )}
      >
        <span className={cn("truncate flex-1 font-medium", !selectedOption && "text-stone-400 dark:text-white/40 font-normal")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {clearable && selectedOption && !disabled && (
            <span
              onClick={handleClear}
              title="Seçimi Temizle"
              className="p-1 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={cn("w-4 h-4 text-stone-400 dark:text-white/40 transition-transform duration-200", isOpen && "rotate-180 text-amber-500")} />
        </div>
      </button>

      {/* Portal Picker Modal (Theme Compatible Dropdown) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden pointer-events-auto overscroll-contain">
              {/* Backdrop */}
              <motion.div
                key="picker-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
              />

              {/* Theme-Aligned Picker Dialog */}
              <motion.div
                key="picker-card"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg h-[82dvh] sm:h-auto sm:max-h-[80vh] bg-[#fcfbf9] dark:bg-[#1d3540] border-t sm:border border-[#e6e2d6] dark:border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 font-sans mx-auto"
              >
                {/* Header */}
                <div className="px-5 py-4 bg-gradient-to-br from-[#363d50] to-[#8a2a43] text-white border-b border-white/10 shrink-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/10 border border-white/15">
                      <SlidersHorizontal className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-white leading-tight">
                        {title}
                      </h3>
                      <p className="text-[11px] text-white/80">
                        {options.length} seçenek mevcut
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10 shrink-0"
                    title="Kapat"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Search Bar (if enabled or >5 options) */}
                {(searchable || options.length > 5) && (
                  <div className="p-3 bg-stone-100/80 dark:bg-black/25 border-b border-[#e6e2d6] dark:border-white/10 shrink-0">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-white/40 pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-white dark:bg-[#1f3844] border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-white/40 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Options List */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-1.5">
                  {filteredOptions.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 dark:text-white/40 space-y-2">
                      <Building2 className="w-8 h-8 mx-auto stroke-1" />
                      <p className="text-xs font-medium">Aramanıza uygun seçenek bulunamadı.</p>
                    </div>
                  ) : (
                    filteredOptions.map((option) => {
                      const isSelected = option.value === value;
                      return (
                        <button
                          key={option.value || 'empty-opt'}
                          type="button"
                          disabled={option.disabled}
                          onClick={() => handleSelect(option.value)}
                          className={cn(
                            "w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group",
                            option.disabled
                              ? "opacity-50 cursor-not-allowed bg-stone-50 dark:bg-white/2 border-stone-200/50"
                              : isSelected
                              ? "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/60 dark:border-amber-500/60 text-amber-950 dark:text-amber-100 shadow-xs font-bold"
                              : "bg-white dark:bg-[#264653]/60 border-[#e6e2d6] dark:border-white/10 text-stone-800 dark:text-white/90 hover:border-[#8a2a43]/40 dark:hover:border-amber-500/40 hover:bg-stone-50 dark:hover:bg-[#264653]"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-semibold leading-snug break-words">
                                {option.label}
                              </span>
                              {option.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 border border-stone-200 dark:border-white/10 shrink-0">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            {option.description && (
                              <p className="text-[11px] text-stone-500 dark:text-white/60 mt-0.5 font-normal line-clamp-2">
                                {option.description}
                              </p>
                            )}
                          </div>

                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer Bar */}
                <div className="px-4 py-3 bg-stone-50 dark:bg-[#1a2e38] border-t border-[#e6e2d6] dark:border-white/10 flex items-center justify-between text-xs text-stone-500 dark:text-white/60 shrink-0">
                  <span className="text-[11px]">
                    {value ? '1 seçim yapıldı' : 'Seçim yapılmadı'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 rounded-xl bg-stone-200 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
