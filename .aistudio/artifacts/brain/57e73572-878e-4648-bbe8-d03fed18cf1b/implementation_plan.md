# [Implementation Plan] Device-Side Local Background Notifications & Live Sync (Firebase-Free)

Technical report and implementation plan for a 100% client-side, device-based background notification system for K7AÜ general news, announcements, and campus events without using Firebase or cloud push services.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Constraint**: The user explicitly requested **NOT to set up Firebase** or external cloud push servers. The system must run **100% locally on the device** (Android PWA / Service Worker).

- **Selected Approach**: **Service Worker Local Notifications + Client-Side Feed Diffing + IndexedDB Tracking**
  - *Mechanism*: The app's Service Worker (`sw.js`) and background fetch handlers check university feeds directly. New announcements/news/events are diffed against locally saved IDs in IndexedDB / localStorage.
  - *Notification Dispatch*: When new content is detected, the Service Worker invokes the native device Notification API (`self.registration.showNotification`) directly on the Android OS level.
  - *User Experience*: When a new update is found, Android shows a native system notification with the K7AÜ icon. Tapping it opens the app directly to the relevant announcement/event detail.
  - *Pros*: **100% Firebase-free**, **100% Serverless**, zero setup required, total user privacy (data never leaves the device).
  - *Cons / OS Limits*: On Android, without Firebase Cloud Push, background wake-ups rely on browser Service Worker activity when the device is active or when the PWA is installed to Home Screen.

---

## 1. Technical Report: Pros, Cons & Device Behavior Analysis

### Advantages (Avantajlar)
1. **Zero External Dependencies**: No Firebase console setup, no API keys, no server costs, no backend infrastructure.
2. **100% Device-Level Privacy**: All cached announcement IDs and user notification preferences stay on the student's phone.
3. **Instant In-App Testing**: Users can test native Android notifications with 1 tap directly in App Settings.
4. **Offline Access**: Cached announcements and events are readable even without an internet connection.

### Disadvantages & Android OS Behavior (Dezavantajlar ve Cihaz Davranışları)
1. **Android Battery Optimization**: Heavy battery saver modes on certain Android ROMs (Xiaomi MIUI, Samsung OneUI) may delay background Service Worker execution while the screen is off until the user unlocks the phone or connects to Wi-Fi.
2. **Notification Permission (Android 13+)**: The app must request native notification permission from the user in the UI.

---

## 2. Proposed System Architecture (100% Device-Side)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Android Device & PWA Environment                      │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    K7AÜ Campus Digital React App                      │  │
│  │   - Triggers Notification Permission Request                           │  │
│  │   - Manages User Category Preferences (Duyuru, Haber, Etkinlik)       │  │
│  │   - Provides "Test Cihaz Bildirimi Gönder" button in Settings         │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
│                                     ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              Workbox Service Worker & Background Manager              │  │
│  │   - Fetches Live Feeds (/api/announcements, /api/news, /api/events)  │  │
│  │   - Compares incoming IDs against IndexedDB / localStorage seen IDs   │  │
│  │   - If NEW item detected -> Triggers:                                 │  │
│  │     self.registration.showNotification("Yeni Duyuru", {...})          │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │                                       │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Android System Notification Shade                        │
│   - Shows native alert banner with K7AÜ logo, sound, and vibration          │
│   - On tap: Opens app directly to the announcement/event page              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Plan & Steps

### Step 1: Device Notification Permission & Manager (`deviceNotificationService.ts`)
- Client-side manager to handle browser/Android notification permissions (`Notification.requestPermission()`).
- Track notification enablement state in `localStorage` (`k7_notifications_enabled`).
- Provide local trigger methods: `showLocalDeviceNotification(title, body, url)`.

### Step 2: Service Worker Custom Logic (`public/sw-custom.js` & `vite.config.ts`)
- Add custom push/notification event listeners to the Service Worker:
  ```js
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
    );
  });
  ```

### Step 3: Background Content Diffing Engine (`backgroundSyncEngine.ts`)
- Maintain a local store of seen announcement/news/event IDs in IndexedDB / `localStorage`.
- When fresh feed data is fetched, diff new entries against seen entries.
- Trigger local device notifications for any unseen entries according to user preferences.

### Step 4: Settings Interface (`NotificationSettingsCard.tsx` in `AppSettingsModal`)
- Add a clean "Cihaz Bildirimleri (Firebase'siz / Yerel)" section under Ayarlar.
- Include toggles for Duyurular, Haberler, Etkinlikler.
- Include a **"Test Bildirimi Gönder"** button so the user can test native Android notifications on their device immediately.

---

## 4. Verification & Testing Strategy
1. **Permission Flow**: Tap "Bildirimleri Etkinleştir" in Ayarlar and confirm Android native permission prompt appears.
2. **Instant Local Test**: Tap "Test Bildirimi Gönder" and verify a native Android notification appears with the K7AÜ logo and vibration.
3. **Deep Link Test**: Tap the test notification and verify the app brings up the relevant detail modal/page.
4. **Offline Resilience**: Verify the Service Worker handles network drops gracefully without breaking app performance.
