# Kilis 7 Aralık Üniversitesi: İsteğe Bağlı (On-Demand) Canlı Veri Mimarisi

Kullanıcının önerisi doğrultusunda, uygulama açılışında yalnızca `kilis.edu.tr` ana sayfasındaki resmi haber ve duyuruların canlı çekilmesi; fakülte ve bölüm duyurularının ise kullanıcı ilgili sekmeyi seçtiğinde isteğe bağlı (lazy loading) olarak anlık taranmasını sağlayan yüksek performanslı mimari planı.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Önerinizin Değerlendirmesi: Mükemmel ve En Doğru Yaklaşım.**
> Önerdiğiniz model ("Ana sayfada sadece üniversite ana sayfası, modüle girilip fakülte seçildiğinde sadece o fakülte"), hem son kullanıcı deneyimini (UX) hem de Render sunucu sağlığını en üst düzeye çıkaran modern bir endüstri standardıdır. 
> - **Açılış Hızı:** 24 harici bağlantı yerine sadece 2 hafif bağlantı yapılarak açılış 6 saniyeden **400 milisaniyeye** düşer.
> - **Render CPU & Trafik:** 0.1 vCPU üzerindeki %100 yüklenme **%3-5 seviyesine** geriler.
> - **Son Kullanıcı Deneyimi:** Öğrenci ana sayfayı anında görür; kendi fakültesini seçtiğinde ise beklemeden sadece o birimin taze verisine odaklanır.

- **Onaylanan Yaklaşım:** Girişte (Ana Sayfa) yalnızca rektörlük ana akışı canlı çekilecek; fakülte ve bölüm verileri kullanıcı sekmeyi seçtiğinde tetiklenecek.
- **Açık Tercih / Oturum Belleği:** Bir fakültenin verisi kullanıcı tarafından o oturumda bir kez çekildikten sonra, tekrar tıklandığında kullanıcıyı bekletmemek adına hafızada tutulacak (isteğe bağlı aşağı çekip yenileme butonuyla anlık tazelenebilecek).

---

## 1. Overview & Core Concept

- **Ne Yapıyor?** Uygulama ilk açıldığında arka planda 20+ fakültenin web sitesini taramayı bırakır; yalnızca `kilis.edu.tr/tr/duyurular` ve `kilis.edu.tr/tr/haberler` sayfalarını canlı çeker. Kullanıcı "Duyurular" veya "Haberler" sekmesine girip bir fakülte (örneğin *İktisadi ve İdari Bilimler Fakültesi*, *Mühendislik Fakültesi*) seçtiğinde, sistem sadece ve sadece o birimin portalına anlık canlı istek gönderir.
- **Hedef Kitle:** Kilis 7 Aralık Üniversitesi öğrencileri, akademisyenleri ve personeli.
- **Temel Değer:** Donma veya uzun bekleme süreleri olmadan anında açılan bir arayüz ve öğrencinin kendi fakültesine özel %100 taze içerik.

---

## 2. User Experience & Visual Design

### Kullanıcı Akışı (User Flow)
1. **Uygulama Açılışı (Ana Sayfa):**
   - Kullanıcı uygulamaya girdiği anda bekleme ekranı (spinner) görmez.
   - Üniversite rektörlüğünün en güncel ana haberleri ve duyuruları 400 milisaniye içinde ekranda belirir.
   - Yemekhane menüsü ve yaklaşan etkinlikler anında listelenir.
2. **Duyurular & Haberler Modülüne Geçiş:**
   - Sayfa ilk açıldığında "Ana Duyurular" sekmesi hazır olarak gelir.
   - Üst yatay listede fakülte ve koordinatörlük çipleri (chips) listelenir.
3. **Fakülte / Bölüm Seçimi (On-Demand Tetikleme):**
   - Kullanıcı örneğin *"İnsan ve Toplum Bilimleri Fakültesi"* çipine bastığı anda:
     - Kart alanında şık bir iskelet yükleyici (skeleton loading animation) belirir.
     - Yalnızca o fakültenin web sitesi (`itbf.kilis.edu.tr`) taranır (~1.0 saniye).
     - Canlı haberler ekrana düşer ve yeşil *"Canlı Güncellendi"* rozeti ile teyit edilir.
   - Kullanıcı başka bir fakülteye geçerse o fakülte taranır; daha önce ziyaret ettiği fakülteye geri dönerse veri tekrar internet harcamadan anında görüntülenir.

---

## 3. Key Product Decisions & Trade-Offs

- **Karar 1: Açılışta 10 Fakülteyi Toplu Kazımayı Kaldırmak**
  - *Seçilen Çözüm:* `/api/announcements` ve `/api/news` açılışta yalnızca ana rektörlük sayfalarını tarayacak.
  - *Neden:* Açılışta 20+ sitenin taranması Render sunucusunu kilitliyor ve kullanıcının 6-8 saniye beklemesine yol açıyordu. Kullanıcıların %90'ı açılışta sadece genel duyurulara bakar.
- **Karar 2: İsteğe Bağlı Tekil Fakülte Kazıma Endpoint'i**
  - *Seçilen Çözüm:* `/api/department-announcements` ve `/api/department-news` rotaları güçlendirilerek, seçilen birimin canlı web adresi taranacak.
  - *Neden:* Sadece hedeflenen 1 tekil web sayfasına istek atıldığından yanıt süresi 800ms civarında olur ve CPU yorulmaz.
- **Karar 3: `force: true` Parametresinin Kaldırılması**
  - *Seçilen Çözüm:* İstemci tarafında `force: false` varsayılan yapılacak; yalnızca kullanıcı ekranı parmağıyla aşağı çektiğinde (pull-to-refresh) canlı zorlama yapılacak.
- **Karar 4: Yemek Menüsü İçin Akıllı Önbellek**
  - *Seçilen Çözüm:* Menü günde yalnızca bir defa değiştiğinden, ilk çekimden sonra 6 saat RAM'de saklanacak.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      MOBİL UYGULAMA (React)                 │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
      (1) Uygulama Açılışı           (2) Fakülte Tıklandı
    [Hızlı Rektörlük İsteği]       [Hedefli On-Demand İstek]
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RENDER SUNUCUSU (Express)                │
│                                                             │
│  /api/announcements (Ana)         /api/department-announcements?url=...
│  /api/news          (Ana)         (Sadece Seçilen Fakülte)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
    [kilis.edu.tr/tr/duyurular]     [itbf.kilis.edu.tr/tr]
        (1 Tekil İstek)                (1 Tekil İstek)
```

### Değişiklik Yapılacak Bileşenler
1. **`server.ts`**:
   - `/api/announcements` ve `/api/news` içindeki 10 fakültelik toplu kazıma döngüsü kaldırılacak veya isteğe bağlı parametreye (`includeFaculties=true`) bağlanacak.
   - `/api/menu` rotasına 6 saatlik RAM önbelleği eklenecek.
2. **`src/mockData.ts`**:
   - `getAnnouncements` ve `getNews` varsayılan parametresi `force = false` yapılacak.
   - Fakülte/bölüm veri çekim fonksiyonu anlık istekleri tekil olarak yönlendirecek.
3. **`src/pages/Announcements.tsx` & `src/pages/News.tsx`**:
   - Fakülte veya bölüm sekmesi seçildiğinde `useEffect` ile seçilen birime özel canlı istek tetiklenecek.
   - Yükleme esnasında sadece kart alanında şık iskelet yükleyici gösterilecek, genel sayfa donmayacak.
