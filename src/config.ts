/**
 * Application & API Configuration
 * 
 * Default Remote Backend (Production API):
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
  // 1. User manual override stored in localStorage
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

  // 3. Auto-detection for Mobile APK / WebView: If running inside an APK, use default backend
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
 * Robust fetch wrapper for mobile / cloud cold starts
 * Retries on failure and sets a realistic timeout (45s) for backend cold start awakening.
 */
export async function safeFetch(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  const timeoutMs = 45000; // 45s per attempt for cold starts
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
        onFetchEnd(true);
        return response;
      }
      // If 5xx error on cold start, retry
      if (response.status >= 500 && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      onFetchEnd(true);
      return response;
    } catch (error: any) {
      clearTimeout(timer);
      console.warn(`Fetch attempt ${attempt + 1} failed for ${url}:`, error?.message || error);
      
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
