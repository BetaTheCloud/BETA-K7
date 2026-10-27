import { Capacitor } from '@capacitor/core';
import { getApiUrl } from '../config';
import { openExternalUrl } from './openExternal';

/**
 * Universal Image Downloader for Web, PWA, and Android APK (Capacitor).
 * Bypasses CORS and SSL restrictions using the server-side download endpoint,
 * downloads the image directly to device storage, and provides reliable fallbacks.
 */
export async function downloadImageToDevice(
  imageUrl: string,
  title?: string
): Promise<{ success: boolean; error?: string }> {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return { success: false, error: 'Geçersiz görsel adresi' };
  }

  // 1. Build a clean, readable filename based on announcement title
  const safeTitle = (title || 'k7au-duyuru-gorsel')
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 35);

  let ext = 'jpg';
  const extMatch = imageUrl.match(/\.(jpg|jpeg|png|webp|gif|avif)/i);
  if (extMatch && extMatch[1]) {
    ext = extMatch[1].toLowerCase();
  }

  const filename = `${safeTitle || 'k7au-gorsel'}-${Date.now().toString().slice(-6)}.${ext}`;
  const proxyUrl = getApiUrl(`/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`);

  try {
    // 2. Fetch image blob via proxy to avoid cross-origin restrictions
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu yanıtı başarısız (${response.status})`);
    }

    const blob = await response.blob();
    const isNative = Capacitor.isNativePlatform();

    // 3. For Android APK (Capacitor), check if Web Share API with files is available
    // This allows users to save directly to Gallery/Photos or Files on Android
    if (isNative && typeof navigator !== 'undefined' && typeof (navigator as any).canShare === 'function') {
      try {
        const file = new File([blob], filename, { type: blob.type || `image/${ext}` });
        if ((navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({
            files: [file],
            title: title || 'Kilis 7 Aralık Üniversitesi Duyuru Görseli'
          });
          return { success: true };
        }
      } catch (shareErr: any) {
        // User may have cancelled share dialog, or Web Share wasn't allowed; fallback to download manager
        if (shareErr?.name === 'AbortError') {
          return { success: true }; // User cancelled intentionally
        }
        console.warn('Native Web Share notice, falling back to direct download:', shareErr);
      }
    }

    // 4. In-browser / PWA / Fallback: Programmatic Blob download
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      try {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch {}
    }, 15000);

    // 5. If on Android APK native platform and blob didn't trigger Android DownloadManager:
    if (isNative) {
      // Dispatches to device browser which handles Content-Disposition: attachment seamlessly
      setTimeout(() => {
        openExternalUrl(proxyUrl);
      }, 500);
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Primary blob download failed, falling back to external download URL:', err);

    // Fallback: Open proxy download URL directly
    try {
      openExternalUrl(proxyUrl);
      return { success: true };
    } catch (fallbackErr: any) {
      return { success: false, error: fallbackErr?.message || err?.message || 'İndirme başarısız oldu' };
    }
  }
}
