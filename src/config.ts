/**
 * Application & API Configuration
 * 
 * Default Remote Backend (Render.com):
 * https://beta-k7.onrender.com
 */

export const DEFAULT_REMOTE_API_BASE = 'https://beta-k7.onrender.com';

/**
 * Determines whether the app is running in a mobile APK / WebView / Hybrid container.
 */
export function isMobileAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isCapacitor = !!(window as any).Capacitor;
  const isCordova = !!(window as any).cordova;
  const isFileProtocol = window.location.protocol === 'file:';
  const isCapacitorOrigin = 
    window.location.origin === 'capacitor://localhost' || 
    window.location.origin === 'ionic://localhost' ||
    window.location.origin === 'http://localhost' ||
    window.location.origin === 'https://localhost';
  const isAndroidAppUserAgent = /Android.*wv|Version\/.*Chrome.*Mobile/i.test(navigator.userAgent);

  return isCapacitor || isCordova || isFileProtocol || isCapacitorOrigin || isAndroidAppUserAgent;
}

export function getEffectiveApiBase(): string {
  // 1. User manual override stored in localStorage (via the settings modal)
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('CUSTOM_API_BASE_URL');
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/+$/, '');
    }
  }

  // 2. Build-time environment variable (from .env)
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (envUrl) {
    return envUrl;
  }

  // 3. Auto-detection for Mobile APK / WebView: If running inside an APK, use Render directly
  if (isMobileAppEnvironment()) {
    return DEFAULT_REMOTE_API_BASE;
  }

  // 4. Default for Web development / Unified proxy
  return '';
}

export function setCustomApiBase(url: string): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim().length > 0) {
      localStorage.setItem('CUSTOM_API_BASE_URL', url.trim().replace(/\/+$/, ''));
    } else {
      localStorage.removeItem('CUSTOM_API_BASE_URL');
    }
  }
}

export function getApiUrl(path: string): string {
  const base = getEffectiveApiBase();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  if (base) {
    return `${base}${normalizedPath}`;
  }
  return normalizedPath;
}

/**
 * Robust fetch wrapper for mobile / Render cold starts
 * Retries on failure and sets a realistic timeout (30s) for Render free-tier cold starts.
 */
export async function safeFetch(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  const timeoutMs = 30000; // 30s for Render cold start
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timer);
      return response;
    } catch (error: any) {
      clearTimeout(timer);
      console.warn(`Fetch attempt ${attempt + 1} failed for ${url}:`, error?.message || error);
      
      if (attempt === retries) {
        throw error;
      }
      // Wait 1.5s before retry
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}
