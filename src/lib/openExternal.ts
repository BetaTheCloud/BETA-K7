/**
 * Safe external URL opener utility.
 * Guarantees that external links (university portals, YÖK, sports reservations, PDFs, Google Forms, etc.)
 * open strictly in the device's external browser (e.g. Chrome / Safari / Samsung Internet)
 * rather than in an internal WebView or in-app browser module that can freeze or crash.
 */

export function openExternalUrl(rawUrl?: string | null, e?: React.MouseEvent | React.UIEvent | Event): void {
  if (e) {
    try {
      if (typeof (e as any).preventDefault === 'function') (e as any).preventDefault();
      if (typeof (e as any).stopPropagation === 'function') (e as any).stopPropagation();
    } catch {}
  }

  if (!rawUrl) return;
  let target = rawUrl.trim();
  if (!target) return;

  // Preserve tel: and mailto: links
  if (target.startsWith('tel:') || target.startsWith('mailto:')) {
    window.location.href = target;
    return;
  }

  // Ensure absolute protocol for external navigation
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    if (target.startsWith('//')) {
      target = `https:${target}`;
    } else {
      target = `https://${target}`;
    }
  }

  try {
    // Check if running in Capacitor native environment
    const isCapacitor = typeof window !== 'undefined' && (
      !!(window as any).Capacitor ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:'
    );

    if (isCapacitor) {
      // In Capacitor Android/iOS, opening with '_system' instructs the native shell
      // to dispatch an Intent to the operating system's external web browser.
      const win = window.open(target, '_system', 'location=yes');
      if (win) return;
    }

    // In standard web browser / PWA
    const newWindow = window.open(target, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback if popup blocker suppressed window.open
      const a = document.createElement('a');
      a.href = target;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.warn('External URL launch fallback:', err);
    try {
      const a = document.createElement('a');
      a.href = target;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = target;
    }
  }
}
