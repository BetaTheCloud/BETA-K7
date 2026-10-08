import { Capacitor } from '@capacitor/core';

/**
 * Application & API Configuration
 * 
 * Default Remote Backend (Production API hosted on Render):
 * https://beta-k7.onrender.com
 */

export const DEFAULT_REMOTE_API_BASE = 'https://beta-k7.onrender.com';

export interface ServerConnectionState {
  isPending: boolean;
  isColdStart: boolean;
  secondsElapsed: number;
  stage: 'idle' | 'connecting' | 'waking' | 'extended_delay' | 'connected' | 'error';
  message?: string;
}

let activeRequestCount = 0;
let requestTimer: any = null;
let currentSecondsElapsed = 0;

let connectionState: ServerConnectionState = {
  isPending: false,
  isColdStart: false,
  secondsElapsed: 0,
  stage: 'idle'
};

const stateListeners = new Set<(state: ServerConnectionState) => void>();

export function subscribeServerStatus(listener: (state: ServerConnectionState) => void): () => void {
  stateListeners.add(listener);
  listener(connectionState);
  return () => {
    stateListeners.delete(listener);
  };
}

function updateConnectionState(newState: Partial<ServerConnectionState>) {
  connectionState = { ...connectionState, ...newState };
  stateListeners.forEach((l) => l(connectionState));
}

function onFetchStart() {
  activeRequestCount++;
  if (activeRequestCount === 1) {
    currentSecondsElapsed = 0;
    updateConnectionState({
      isPending: true,
      isColdStart: false,
      secondsElapsed: 0,
      stage: 'connecting'
    });

    if (requestTimer) clearInterval(requestTimer);
    requestTimer = setInterval(() => {
      currentSecondsElapsed++;
      
      let stage: ServerConnectionState['stage'] = 'connecting';
      let isColdStart = false;

      if (currentSecondsElapsed >= 30) {
        stage = 'extended_delay';
        isColdStart = true;
      } else if (currentSecondsElapsed >= 7) {
        stage = 'waking';
        isColdStart = true;
      }

      updateConnectionState({
        secondsElapsed: currentSecondsElapsed,
        isColdStart,
        stage
      });
    }, 1000);
  }
}

function onFetchEnd(success: boolean) {
  activeRequestCount = Math.max(0, activeRequestCount - 1);
  if (activeRequestCount === 0) {
    if (requestTimer) {
      clearInterval(requestTimer);
      requestTimer = null;
    }

    if (success) {
      const wasColdStart = connectionState.isColdStart;
      updateConnectionState({
        isPending: false,
        stage: 'connected',
        secondsElapsed: currentSecondsElapsed
      });

      // Hide success notification after 3.5 seconds if it was a cold start
      setTimeout(() => {
        if (activeRequestCount === 0) {
          updateConnectionState({
            stage: 'idle',
            isColdStart: false,
            secondsElapsed: 0
          });
        }
      }, wasColdStart ? 3500 : 800);
    } else {
      updateConnectionState({
        isPending: false,
        stage: 'error',
        secondsElapsed: currentSecondsElapsed
      });
      setTimeout(() => {
        if (activeRequestCount === 0) {
          updateConnectionState({
            stage: 'idle',
            isColdStart: false,
            secondsElapsed: 0
          });
        }
      }, 5000);
    }
  }
}

/**
 * Determines whether the app is running in a mobile APK / WebView / Hybrid container.
 * Accurately detects Capacitor Native Android, iOS, and Android WebView schemes.
 */
export function isMobileAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // 1. Capacitor native platform detection (Capacitor 3+)
  try {
    if (Capacitor.isNativePlatform()) return true;
    const plat = Capacitor.getPlatform();
    if (plat === 'android' || plat === 'ios') return true;
  } catch {}

  // 2. Global Capacitor / Cordova window objects
  const win = window as any;
  if (win?.Capacitor?.isNativePlatform?.() || win?.Capacitor?.platform === 'android' || win?.cordova) {
    return true;
  }

  // 3. Mobile WebView origins and protocols
  const origin = window.location.origin;
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;

  if (
    protocol === 'file:' ||
    protocol === 'capacitor:' ||
    protocol === 'ionic:' ||
    origin === 'capacitor://localhost' ||
    origin === 'ionic://localhost'
  ) {
    return true;
  }

  // Capacitor Android with androidScheme: 'https' or 'http' loads from localhost with NO port
  // In contrast, local development web servers always use an explicit port (e.g. :3000, :5173)
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && (!port || port === '80' || port === '443')) {
    return true;
  }

  // 4. Android WebView user agent detection
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua) && (/wv/i.test(ua) || /Version\/[0-9.]+/i.test(ua))) {
    return true;
  }

  return false;
}

export function getEffectiveApiBase(): string {
  // 1. User manual override stored in localStorage (set via Admin/API config modal)
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

  // 3. Auto-detection for Mobile APK / Android Capacitor / WebView: ALWAYS use Render backend
  if (isMobileAppEnvironment()) {
    return DEFAULT_REMOTE_API_BASE;
  }

  // 4. If loaded directly from Render in a web browser (e.g. beta-k7.onrender.com)
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return window.location.origin;
  }

  // 5. If deployed on external static host (e.g. GitHub Pages, Vercel, Netlify) where /api doesn't exist locally
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.includes('run.app')
  ) {
    return DEFAULT_REMOTE_API_BASE;
  }

  // 6. Default for Web development / unified server proxy on port 3000
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
 * Silently warm up the remote Render server on app launch
 * This eliminates cold-start waiting when users navigate to live sections.
 */
let hasWarmedUp = false;
export function warmupBackendServer(): void {
  if (hasWarmedUp || typeof window === 'undefined') return;
  hasWarmedUp = true;
  
  const healthUrl = getApiUrl('/api/health');
  // Only ping if target is remote or mobile
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  
  fetch(healthUrl, { signal: controller.signal })
    .then((res) => {
      clearTimeout(timer);
      if (res.ok) {
        console.log('[K7AÜ] Remote server is warm & operational.');
      }
    })
    .catch(() => {
      clearTimeout(timer);
    });
}

/**
 * Robust fetch wrapper for mobile / cloud cold starts
 * Retries on failure and sets an adaptive timeout (25s) allowing Render sleeping instances to wake up.
 */
export async function safeFetch(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  // Allow up to 25 seconds per attempt on remote Render endpoints (Render spin-up takes ~20s)
  const isRemote = url.startsWith('http://') || url.startsWith('https://');
  const timeoutMs = isRemote ? 25000 : 12000;
  
  onFetchStart();

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timer);
      
      if (response.ok) {
        // Detect HTML responses disguised as 200 (such as SPA catch-all fallbacks)
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          throw new Error(`Endpoint ${url} returned HTML fallback instead of JSON`);
        }
        onFetchEnd(true);
        return response;
      }
      
      // If 5xx error on cold start / server wake-up, wait and retry
      if (response.status >= 500 && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      onFetchEnd(true);
      return response;
    } catch (error: any) {
      clearTimeout(timer);
      console.warn(`[K7AÜ Fetch] Deneme ${attempt + 1}/${retries + 1} başarısız (${url}):`, error?.message || error);
      
      if (attempt === retries) {
        onFetchEnd(false);
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  onFetchEnd(false);
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}
