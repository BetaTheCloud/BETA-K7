/**
 * Application & API Configuration
 * 
 * Default Remote Backend (Production API on Render):
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

      if (currentSecondsElapsed >= 22) {
        stage = 'extended_delay';
        isColdStart = true;
      } else if (currentSecondsElapsed >= 6) {
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
 * Determines whether the app is running in an Android APK, Capacitor, Cordova, or WebView container.
 */
export function isMobileAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isCapacitor = !!(window as any).Capacitor;
  const isCordova = !!(window as any).cordova;
  const isFileProtocol = window.location.protocol === 'file:';
  const isCapacitorScheme = 
    window.location.protocol === 'capacitor:' || 
    window.location.protocol === 'ionic:' ||
    window.location.origin === 'capacitor://localhost' || 
    window.location.origin === 'ionic://localhost';

  // Capacitor Android with androidScheme: 'https' (standard in capacitor.config.ts)
  // runs at https://localhost with NO port (or default 80/443), unlike web dev (ports 3000, 5173, etc.)
  const isAndroidLocalhost = 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    (window.location.port === '' || window.location.port === '80' || window.location.port === '443') &&
    !window.location.port.match(/^(3000|5173|8080)$/);

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isAndroidWebView = 
    ua.includes('wv') || 
    (ua.includes('Android') && (isAndroidLocalhost || isFileProtocol || isCapacitorScheme));

  return isCapacitor || isCordova || isFileProtocol || isCapacitorScheme || isAndroidLocalhost || isAndroidWebView;
}

export function getEffectiveApiBase(): string {
  // 1. User manual override stored in localStorage
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('CUSTOM_API_BASE_URL');
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/+$/, '');
    }
  }

  // 2. Build-time environment variable (from .env or VITE_API_BASE_URL)
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (envUrl) {
    return envUrl;
  }

  // 3. Auto-detection for Mobile APK / Android WebView: Must use remote Render backend
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
 * Robust fetch wrapper for mobile / cloud cold starts.
 * Features:
 * - 35s timeout to allow Render free tier wakeups
 * - Automatic remote fallback if local relative endpoint returns 404 or HTML SPA fallback
 * - Automatic retry on 5xx cold start glitches
 */
export async function safeFetch(url: string, options: RequestInit = {}, retries = 1): Promise<Response> {
  const timeoutMs = 35000; // 35s per attempt for Render cloud awakening
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

      // Detect HTML responses disguised as 200 (such as static SPA index.html fallbacks)
      const contentType = response.headers.get('content-type') || '';
      const isHtmlResponse = contentType.includes('text/html');

      if (response.ok && !isHtmlResponse) {
        onFetchEnd(true);
        return response;
      }

      // If relative URL failed (e.g. running on a static host without Node), try remote backend!
      if ((!response.ok || isHtmlResponse) && url.startsWith('/') && DEFAULT_REMOTE_API_BASE) {
        const remoteUrl = `${DEFAULT_REMOTE_API_BASE}${url}`;
        console.warn(`Local endpoint ${url} failed (${response.status}), retrying with remote: ${remoteUrl}`);
        
        try {
          const remoteController = new AbortController();
          const remoteTimer = setTimeout(() => remoteController.abort(), 20000);
          const remoteRes = await fetch(remoteUrl, {
            ...options,
            signal: remoteController.signal
          });
          clearTimeout(remoteTimer);

          const remoteContentType = remoteRes.headers.get('content-type') || '';
          if (remoteRes.ok && !remoteContentType.includes('text/html')) {
            onFetchEnd(true);
            return remoteRes;
          }
        } catch (remoteErr) {
          console.warn(`Remote fallback fetch failed for ${remoteUrl}:`, remoteErr);
        }
      }

      // If 5xx error on cold start, retry once
      if (response.status >= 500 && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      if (isHtmlResponse) {
        throw new Error(`Endpoint ${url} returned HTML fallback instead of JSON`);
      }

      onFetchEnd(true);
      return response;
    } catch (error: any) {
      clearTimeout(timer);
      console.warn(`Fetch attempt ${attempt + 1} failed for ${url}:`, error?.message || error);
      
      // If relative fetch failed with network error, attempt remote backend
      if (url.startsWith('/') && DEFAULT_REMOTE_API_BASE && attempt === retries) {
        try {
          const fallbackUrl = `${DEFAULT_REMOTE_API_BASE}${url}`;
          console.log(`Attempting remote fallback for failed network call: ${fallbackUrl}`);
          const fallbackRes = await fetch(fallbackUrl, options);
          if (fallbackRes.ok) {
            onFetchEnd(true);
            return fallbackRes;
          }
        } catch {}
      }

      if (attempt === retries) {
        onFetchEnd(false);
        throw error;
      }
      // Wait 2s before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  onFetchEnd(false);
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

// Background ping to wake Render backend immediately on app launch
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const healthUrl = getApiUrl('/api/health');
    fetch(healthUrl, { mode: 'cors' }).catch(() => {});
  }, 1000);
}
