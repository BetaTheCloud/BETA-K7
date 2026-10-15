/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export type SectionHeaderTheme = 'amber' | 'emerald' | 'rose' | 'purple' | 'blue' | 'sky';

export interface SectionHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  theme?: SectionHeaderTheme;
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'amber' | 'emerald' | 'rose';
  };
  action?: SectionHeaderAction;
  secondaryAction?: SectionHeaderAction;
  className?: string;
}

export default function SectionHeader({
  icon: Icon,
  theme = 'amber',
  title,
  subtitle,
  badge,
  action,
  secondaryAction,
  className = ''
}: SectionHeaderProps) {
  const getThemeClasses = (t: SectionHeaderTheme) => {
    switch (t) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25',
          actionHover: 'hover:text-emerald-600 dark:hover:text-emerald-400'
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25',
          actionHover: 'hover:text-rose-600 dark:hover:text-rose-400'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/25',
          actionHover: 'hover:text-purple-600 dark:hover:text-purple-400'
        };
      case 'blue':
      case 'sky':
        return {
          iconBg: 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25',
          actionHover: 'hover:text-sky-600 dark:hover:text-sky-400'
        };
      case 'amber':
      default:
        return {
          iconBg: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25',
          actionHover: 'hover:text-amber-600 dark:hover:text-amber-400'
        };
    }
  };

  const themeStyle = getThemeClasses(theme);

  const renderAction = (act: SectionHeaderAction, isPrimary = true) => {
    const ActionIcon = act.icon || (isPrimary ? ChevronRight : undefined);

    const baseClasses = isPrimary
      ? 'px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 text-stone-700 dark:text-white/90 hover:text-stone-950 dark:hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer'
      : 'px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold transition-all inline-flex items-center gap-1 active:scale-95 cursor-pointer';

    if (act.href) {
      return (
        <Link to={act.href} className={baseClasses}>
          <span>{act.label}</span>
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
        </Link>
      );
    }

    return (
      <button type="button" onClick={act.onClick} className={baseClasses}>
        {ActionIcon && isPrimary && act.icon && <ActionIcon className="w-3.5 h-3.5" />}
        <span>{act.label}</span>
        {ActionIcon && (!act.icon || !isPrimary) && <ActionIcon className="w-3.5 h-3.5" />}
      </button>
    );
  };

  return (
    <div
      className={`flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#e6e2d6] dark:border-white/10 gap-2 flex-wrap ${className}`}
    >
      {/* Left: Icon & Typography */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${themeStyle.iconBg}`}>
          <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg sm:text-xl font-display font-bold text-stone-900 dark:text-white leading-tight tracking-tight truncate">
              {title}
            </h3>
            {badge && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  badge.variant === 'emerald'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : badge.variant === 'rose'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                }`}
              >
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-stone-500 dark:text-white/50 truncate font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {secondaryAction && renderAction(secondaryAction, false)}
        {action && renderAction(action, true)}
      </div>
    </div>
  );
}
