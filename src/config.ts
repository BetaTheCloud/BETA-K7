/**
 * Application & API Configuration
 * 
 * In standard web preview / fullstack mode, VITE_API_BASE_URL is empty,
 * meaning requests go to relative paths like `/api/announcements`.
 * 
 * When building for Android APK (e.g. Capacitor, Cordova, WebView) or deploying
 * the frontend separately from Render.com backend:
 * Set VITE_API_BASE_URL=https://your-app.onrender.com in your .env file.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
