/**
 * Application & API Configuration
 * 
 * When running in standard web preview:
 * - API requests use relative paths like `/api/announcements`.
 * 
 * When running in an Android APK (Capacitor / Cordova / WebView / file://):
 * - It uses VITE_API_BASE_URL (e.g. https://your-app.onrender.com)
 * - Or a custom URL stored in localStorage ('CUSTOM_API_BASE_URL')
 */

export function getEffectiveApiBase(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('CUSTOM_API_BASE_URL');
    if (custom && custom.trim().length > 0) {
      return custom.trim().replace(/\/+$/, '');
    }
  }

  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  return envUrl;
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
