import { Capacitor } from '@capacitor/core';
import { Media } from '@capacitor-community/media';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getApiUrl } from '../config';

export interface ImageSaveResult {
  success: boolean;
  method?: 'gallery' | 'share' | 'download' | 'cancelled';
  message?: string;
  error?: string;
}

/**
 * Converts a Blob to a base64 Data URL (data:image/...;base64,...)
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Görsel verisi base64 formatına dönüştürülemedi'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Dosya okunamadı'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Universal Image Downloader & Gallery Saver.
 * 
 * Works seamlessly across:
 * 1. Android APK (Capacitor Native):
 *    - Primary: Saves directly to Android device Gallery / MediaStore (Pictures/DCIM) using Media plugin.
 *    - Secondary fallback: Saves file to cache and opens Android system Share Sheet (allowing 1-tap "Save to Gallery / Photos").
 * 2. Android WebView / APK Wrappers (Non-Capacitor):
 *    - Detects custom JS interfaces (window.Android / window.AndroidBridge).
 *    - Uses Web Share API with File object (which displays Android's native share dialog with Gallery option).
 * 3. Mobile / Desktop Browsers & PWA:
 *    - Programmatic Blob anchor download with Content-Disposition attachment headers.
 */
export async function downloadImageToDevice(
  imageUrl: string,
  title?: string
): Promise<ImageSaveResult> {
  if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:'))) {
    return { success: false, error: 'Geçersiz görsel adresi' };
  }

  // 1. Build a clean, readable filename based on title
  const safeTitle = (title || 'k7au-duyuru-gorsel')
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);

  let ext = 'jpg';
  const extMatch = imageUrl.match(/\.(jpg|jpeg|png|webp|gif|avif)/i);
  if (extMatch && extMatch[1]) {
    ext = extMatch[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
  }

  const timestamp = Date.now().toString().slice(-6);
  const filename = `${safeTitle || 'k7au-gorsel'}-${timestamp}.${ext}`;
  const fileNameWithoutExt = `${safeTitle || 'k7au-gorsel'}-${timestamp}`;

  const proxyUrl = getApiUrl(`/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`);

  try {
    // 2. Fetch image blob (First try proxy to bypass CORS/SSL, fallback to direct fetch)
    let blob: Blob;
    if (imageUrl.startsWith('data:')) {
      const parts = imageUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || `image/${ext}`;
      const byteCharacters = atob(parts[1]);
      const byteArrays = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays[i] = byteCharacters.charCodeAt(i);
      }
      blob = new Blob([byteArrays], { type: mime });
    } else {
      try {
        const response = await fetch(proxyUrl, {
          headers: { 'Accept': 'image/*' }
        });
        if (response.ok) {
          blob = await response.blob();
        } else {
          throw new Error(`Proxy error ${response.status}`);
        }
      } catch (proxyErr) {
        console.warn('Proxy fetch failed, attempting direct fetch:', proxyErr);
        const directRes = await fetch(imageUrl);
        if (!directRes.ok) throw new Error('Görsel indirilemedi');
        blob = await directRes.blob();
      }
    }

    const dataUrl = await blobToDataUrl(blob);
    const isNative = Capacitor.isNativePlatform();

    // -------------------------------------------------------------
    // PATH 1: Android APK / Native Capacitor Platform
    // -------------------------------------------------------------
    if (isNative) {
      // 1.A: Direct Gallery / MediaStore Save via @capacitor-community/media
      if (Capacitor.isPluginAvailable('Media')) {
        try {
          let albumId: string | undefined;

          try {
            const albumsRes = await Media.getAlbums();
            if (albumsRes?.albums && albumsRes.albums.length > 0) {
              // Prefer K7AU or first available album
              const k7Album = albumsRes.albums.find(a => a.name.toLowerCase().includes('k7') || a.name.toLowerCase().includes('kilis'));
              albumId = k7Album ? k7Album.identifier : albumsRes.albums[0].identifier;
            }
          } catch {
            // No albums found yet
          }

          if (!albumId) {
            try {
              const pathRes = await Media.getAlbumsPath();
              if (pathRes?.path) {
                albumId = pathRes.path;
              }
            } catch {
              // Ignore
            }
          }

          if (!albumId) {
            try {
              await Media.createAlbum({ name: 'K7AÜ' });
              const updatedAlbums = await Media.getAlbums();
              albumId = updatedAlbums?.albums?.[0]?.identifier;
            } catch {
              // Album creation optional
            }
          }

          const saveOptions: any = {
            path: dataUrl,
            fileName: fileNameWithoutExt
          };
          if (albumId) {
            saveOptions.albumIdentifier = albumId;
          }

          await Media.savePhoto(saveOptions);

          return {
            success: true,
            method: 'gallery',
            message: 'Görsel doğrudan cihazınızın galerisine kaydedildi'
          };
        } catch (mediaErr: any) {
          console.warn('Direct MediaStore save failed, falling back to Share plugin:', mediaErr?.message || mediaErr);
        }
      }

      // 1.B: Native Share Sheet via @capacitor/filesystem + @capacitor/share
      // Allows user to select "Fotoğraflar'a Kaydet" / "Galeriye Kaydet" from Android share modal
      if (Capacitor.isPluginAvailable('Filesystem') && Capacitor.isPluginAvailable('Share')) {
        try {
          const rawBase64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
          await Filesystem.writeFile({
            path: filename,
            data: rawBase64,
            directory: Directory.Cache
          });

          const uriRes = await Filesystem.getUri({
            path: filename,
            directory: Directory.Cache
          });

          await Share.share({
            title: title || 'Kilis 7 Aralık Üniversitesi Görseli',
            files: [uriRes.uri],
            dialogTitle: 'Görseli Galeriye Kaydet veya Paylaş'
          });

          return {
            success: true,
            method: 'share',
            message: 'Görsel hazırlandı. Açılan menüden galerinize veya cihazınıza kaydedebilirsiniz.'
          };
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') {
            return { success: true, method: 'cancelled' };
          }
          console.warn('Filesystem + Share fallback notice:', shareErr?.message || shareErr);
        }
      }
    }

    // -------------------------------------------------------------
    // PATH 2: Android Custom JS Bridge (for APK wrappers)
    // -------------------------------------------------------------
    const androidBridge = (window as any).Android || (window as any).AndroidBridge || (window as any).JSBridge;
    if (androidBridge) {
      try {
        if (typeof androidBridge.saveImageToGallery === 'function') {
          androidBridge.saveImageToGallery(dataUrl, filename);
          return { success: true, method: 'gallery', message: 'Görsel galerinize kaydedildi' };
        }
        if (typeof androidBridge.saveImage === 'function') {
          androidBridge.saveImage(dataUrl, filename);
          return { success: true, method: 'gallery', message: 'Görsel galerinize kaydedildi' };
        }
      } catch (bridgeErr) {
        console.warn('Android Bridge call error:', bridgeErr);
      }
    }

    // -------------------------------------------------------------
    // PATH 3: Web Share API Level 2 with Files (Mobile Web & Modern WebViews)
    // -------------------------------------------------------------
    if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
      try {
        const file = new File([blob], filename, { type: blob.type || `image/${ext}` });
        const canShareFiles = typeof (navigator as any).canShare === 'function'
          ? (navigator as any).canShare({ files: [file] })
          : true;

        if (canShareFiles) {
          await (navigator as any).share({
            files: [file],
            title: title || 'Kilis 7 Aralık Üniversitesi Görseli',
            text: title || 'Kilis 7 Aralık Üniversitesi'
          });
          return {
            success: true,
            method: 'share',
            message: 'Görsel hazırlandı. Açılan menüden galerinize kaydedebilirsiniz.'
          };
        }
      } catch (shareErr: any) {
        if (shareErr?.name === 'AbortError') {
          return { success: true, method: 'cancelled' };
        }
        console.warn('Web Share API error:', shareErr);
      }
    }

    // -------------------------------------------------------------
    // PATH 4: Standard Web Browser Download (<a download>)
    // -------------------------------------------------------------
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
    }, 20000);

    return {
      success: true,
      method: 'download',
      message: 'Görsel başarıyla cihazınıza indirildi'
    };
  } catch (err: any) {
    console.error('Download image error:', err);

    // Final fallback: trigger browser download via proxy attachment URL
    try {
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.target = '_blank';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch {}
      }, 5000);
      return {
        success: true,
        method: 'download',
        message: 'Görsel indirme işlemi başlatıldı'
      };
    } catch {
      return {
        success: false,
        error: err?.message || 'Görsel kaydedilirken bir sorun oluştu'
      };
    }
  }
}
