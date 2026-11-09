/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi - Modal Scroll Lock & Layout Shift Prevention Engine
 */

import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';

/**
 * Locks document body scrolling without causing horizontal layout shift (jitter).
 * Uses a reference counter so nested or chained modals do not prematurely unlock the body.
 * Note: scrollbar-gutter: stable is set on html in index.css, so manual paddingRight is redundant
 * and caused content jumping/jittering.
 */
export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;

  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

/**
 * Decrements the scroll lock counter and restores body overflow when all modals close.
 */
export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow || '';
  }
}

/**
 * React hook to effortlessly and cleanly lock body scroll while a modal is mounted and visible.
 */
export function useModalScrollLock(isOpen: boolean): void {
  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);
}
