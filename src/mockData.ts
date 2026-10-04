import {
  Announcement,
  MenuItem,
  CalendarEvent,
  BolognaFaculty,
  PhonebookEntry,
  AcademicStaffMember,
  CampusEvent,
  CampusForm,
  CampusBuilding
} from './types';
import { getApiUrl, safeFetch } from './config';
import { AUTHENTIC_FORMS_DATA } from './data/formsData';
import { ACADEMIC_STAFF_DATA } from './data/staffData';

// ================= FALLBACK DATA =================

export const FALLBACK_STAFF: AcademicStaffMember[] = ACADEMIC_STAFF_DATA;

export const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-fb-1',
    title: '2026-2027 Eğitim-Öğretim Yılı Güz Yarıyılı Ders Kayıt ve Kayıt Yenileme Duyurusu',
    date: '30.09.2026',
    content: 'Öğrencilerimizin ders kayıt ve katkı payı işlemlerini akademik takvimde belirtilen tarihler arasında tamamlamaları gerekmektedir.',
    category: 'Ana Duyurular',
    url: 'https://www.kilis.edu.tr/tr/duyurular'
  },
  {
    id: 'ann-fb-2',
    title: 'Mazeret Sınavı Başvuruları ve İlgili Esaslar Hakkında',
    date: '28.09.2026',
    content: 'Haklı ve geçerli mazereti sebebiyle vize sınavlarına katılamayan öğrencilerin dekanlık ve müdürlüklere başvuru süreci başlamıştır.',
    category: 'Öğrenci İşleri',
    url: 'https://ogrenciisleri.kilis.edu.tr'
  },
  {
    id: 'ann-fb-3',
    title: 'Erasmus+ Öğrenim ve Staj Hareketliliği Başvuru Takvimi',
    date: '25.09.2026',
    content: 'Avrupa üniversitelerinde öğrenim görmek isteyen öğrencilerimiz için yabancı dil sınavı ve başvuru süreci açılmıştır.',
    category: 'Dış İlişkiler (Erasmus)',
    url: 'https://erasmus.kilis.edu.tr'
  },
  {
    id: 'ann-fb-4',
    title: 'Merkez Kütüphane Çalışma Saatleri ve Gece Etüt Salonu Düzenlemesi',
    date: '20.09.2026',
    content: 'Öğrencilerimizin yoğun talebi doğrultusunda sınav dönemlerinde kütüphanemiz 7/24 kesintisiz hizmet vermektedir.',
    category: 'Kütüphane',
    url: 'https://kutuphane.kilis.edu.tr'
  },
  {
    id: 'ann-fb-5',
    title: 'Yemekhane Bursu ve Kısmi Zamanlı Öğrenci Başvuruları',
    date: '18.09.2026',
    content: 'Sağlık Kültür ve Spor Daire Başkanlığı burs başvuruları online form üzerinden alınmaya başlamıştır.',
    category: 'Sağlık Kültür Spor (SKS)',
    url: 'https://sks.kilis.edu.tr'
  },
  {
    id: 'ann-fb-6',
    title: 'Mühendislik-Mimarlık Fakültesi Staj Defteri Teslim Tarihleri',
    date: '01.10.2026',
    content: 'Yaz stajını tamamlayan Bilgisayar, Elektrik-Elektronik, Makine ve İnşaat Mühendisliği öğrencilerimizin dikkatine.',
    category: 'Mühendislik-Mimarlık Fakültesi',
    url: 'https://mmf.kilis.edu.tr'
  },
  {
    id: 'ann-fb-7',
    title: 'İktisadi ve İdari Bilimler Fakültesi Çift Anadal / Yandal Başvuruları',
    date: '29.09.2026',
    content: 'İşletme, İktisat ve Siyaset Bilimi bölümleri arası ÇAP başvuru takvimi yayınlanmıştır.',
    category: 'İktisadi ve İdari Bilimler Fakültesi',
    url: 'https://iibf.kilis.edu.tr'
  },
  {
    id: 'ann-fb-8',
    title: 'İlahiyat Fakültesi Hazırlık Sınıfı Muafiyet Sınav Sonuçları',
    date: '27.09.2026',
    content: 'Zorunlu Arapça Hazırlık Sınıfı Yeterlilik ve Muafiyet Sınavı sonuç listesi ilan edilmiştir.',
    category: 'İlahiyat Fakültesi',
    url: 'https://ilahiyat.kilis.edu.tr'
  },
  {
    id: 'ann-fb-9',
    title: 'Sağlık Bilimleri Fakültesi Klinik Uygulama ve Hastane Oryantasyonu',
    date: '24.09.2026',
    content: 'Hemşirelik ve Beslenme-Diyetetik 3. ve 4. sınıf öğrencilerimizin hastane staj kuralları.',
    category: 'Sağlık Bilimleri Fakültesi',
    url: 'https://sbf.kilis.edu.tr'
  },
  {
    id: 'ann-fb-10',
    title: 'Fen Edebiyat Fakültesi Laboratuvar Güvenliği Semineri',
    date: '22.09.2026',
    content: 'Kimya, Biyoloji ve Fizik laboratuvarlarını kullanacak tüm lisans öğrencileri için zorunlu seminer.',
    category: 'Fen Fakültesi',
    url: 'https://fen.kilis.edu.tr'
  }
];

export const FALLBACK_NEWS: Announcement[] = [
  {
    id: 'news-fb-1',
    title: 'Kilis 7 Aralık Üniversitesi 2026-2027 Akademik Yılı Açılış Töreni Coşkuyla Gerçekleşti',
    date: '02.10.2026',
    content: 'Üniversitemiz Konferans Salonunda gerçekleştirilen açılış törenine çok sayıda akademisyen, protokol ve öğrenci katıldı.',
    category: 'Üniversite Haberleri',
    url: 'https://www.kilis.edu.tr/tr/haberler'
  },
  {
    id: 'news-fb-2',
    title: '1. Kilis Kitap Fuarı ve Yazar Buluşmaları Kapılarını Ziyaretçilere Açtı',
    date: '29.09.2026',
    content: 'Yüzlerce yayınevi ve seçkin yazarların katılımıyla düzenlenen kitap fuarı kampüste büyük ilgi görüyor.',
    category: 'Kültür & Sanat',
    url: 'https://www.kilis.edu.tr/tr/etkinlikler'
  },
  {
    id: 'news-fb-3',
    title: 'Mühendislik Fakültesi Öğrencilerimizden TEKNOFEST Başarısı',
    date: '24.09.2026',
    content: 'Elektrik ve Bilgisayar Mühendisliği öğrencilerimizin geliştirdiği insansız hava aracı projesi finallere kaldı.',
    category: 'Mühendislik-Mimarlık Fakültesi',
    url: 'https://mmf.kilis.edu.tr'
  },
  {
    id: 'news-fb-4',
    title: 'Üniversitemiz ile Kilis Sanayi ve Ticaret Odası Arasında İş Birliği Protokolü İmzalandı',
    date: '19.09.2026',
    content: 'Öğrencilerimize staj, istihdam ve AR-GE projelerinde geniş imkanlar sağlayacak protokol imzalandı.',
    category: 'İş Birlikleri',
    url: 'https://www.kilis.edu.tr/tr/haberler'
  },
  {
    id: 'news-fb-5',
    title: 'İİBF Öğrencileri Türkiye Finans Zirvesinde Üniversitemizi Temsil Etti',
    date: '17.09.2026',
    content: 'İktisat Kulübü öğrencileri hazırladıkları bölgesel kalkınma raporuyla bildiri sundu.',
    category: 'İktisadi ve İdari Bilimler Fakültesi',
    url: 'https://iibf.kilis.edu.tr'
  },
  {
    id: 'news-fb-6',
    title: 'Sağlık Bilimleri Fakültesinden Toplum Sağlığı ve Farkındalık Projesi',
    date: '15.09.2026',
    content: 'Kilis merkez ve kırsal bölgelerde ücretsiz tansiyon, şeker ölçümü ve beslenme danışmanlığı standları kuruldu.',
    category: 'Sağlık Bilimleri Fakültesi',
    url: 'https://sbf.kilis.edu.tr'
  },
  {
    id: 'news-fb-7',
    title: 'TÜBİTAK 2209 Üniversite Öğrencileri Araştırma Projeleri Çağrısı Başladı',
    date: '12.09.2026',
    content: 'Lisans ve ön lisans öğrencilerimizin bilimsel araştırma projelerine doğrudan hibe desteği.',
    category: 'Akademik & AR-GE',
    url: 'https://www.kilis.edu.tr'
  }
];

export const FALLBACK_MENU: MenuItem[] = [
  {
    id: 'menu-fb-1',
    date: 'Pazartesi Menüsü',
    mainDish: 'Orman Kebabı',
    sideDish: 'Şehriyeli Pirinç Pilavı',
    soup: 'Mercimek Çorbası',
    dessertOrFruit: 'Mevsim Salata / Ayran',
    calories: 850
  },
  {
    id: 'menu-fb-2',
    date: 'Salı Menüsü',
    mainDish: 'Tavuk Sote',
    sideDish: 'Bulgur Pilavı',
    soup: 'Ezogelin Çorbası',
    dessertOrFruit: 'Sütlaç',
    calories: 780
  },
  {
    id: 'menu-fb-3',
    date: 'Çarşamba Menüsü',
    mainDish: 'Kuru Fasulye',
    sideDish: 'Pirinç Pilavı',
    soup: 'Yayla Çorbası',
    dessertOrFruit: 'Cacık / Turşu',
    calories: 820
  },
  {
    id: 'menu-fb-4',
    date: 'Perşembe Menüsü',
    mainDish: 'İzmir Köfte',
    sideDish: 'Soslu Makarna',
    soup: 'Tarhana Çorbası',
    dessertOrFruit: 'Mevsim Meyvesi',
    calories: 800
  },
  {
    id: 'menu-fb-5',
    date: 'Cuma Menüsü',
    mainDish: 'Fırın Tavuk But',
    sideDish: 'Garnitürlü Pilav',
    soup: 'Domates Çorbası',
    dessertOrFruit: 'Kemalpaşa Tatlısı',
    calories: 860
  }
];

export const FALLBACK_PHONEBOOK: PhonebookEntry[] = [
  { id: 'pb-1', name: 'Rektörlük Santral', title: 'Santral', role: 'Genel İletişim', department: 'Rektörlük', phone: '0348 814 26 66', extension: '1000', email: 'rimer@kilis.edu.tr' },
  { id: 'pb-2', name: 'Öğrenci İşleri Daire Başkanlığı', title: 'Daire Başkanlığı', role: 'Öğrenci Hizmetleri', department: 'Öğrenci İşleri', phone: '0348 814 26 66', extension: '6461', email: 'ogrenciisleri@kilis.edu.tr' },
  { id: 'pb-3', name: 'Sağlık Kültür ve Spor Daire Bşk (SKS)', title: 'Daire Başkanlığı', role: 'Yemekhane & Kulüpler & Spor', department: 'SKS Daire Bşk.', phone: '0348 814 26 66', extension: '5050', email: 'sks@kilis.edu.tr' },
  { id: 'pb-4', name: 'Merkez Kütüphane Danışma', title: 'Kütüphane Şube Md.', role: 'Kitap & Veritabanı Danışma', department: 'Kütüphane Daire Bşk.', phone: '0348 814 26 66', extension: '4160', email: 'kutuphane@kilis.edu.tr' },
  { id: 'pb-5', name: 'Bilgi İşlem Daire Başkanlığı', title: 'Teknik Destek', role: 'Eduroam Wi-Fi & E-Posta Destek', department: 'Bilgi İşlem', phone: '0348 814 26 66', extension: '1313', email: 'bilgiislem@kilis.edu.tr' },
  { id: 'pb-6', name: 'Kampüs Güvenlik Amirliği', title: 'Güvenlik', role: 'Kampüs Güvenlik & Nizamiye', department: 'İdari ve Mali İşler', phone: '0348 814 26 66', extension: '1111', email: 'guvenlik@kilis.edu.tr' },
  { id: 'pb-7', name: 'K7AÜ Uygulama Oteli (Konukevi)', title: 'Resepsiyon', role: 'Oda Rezervasyon & Konaklama', department: 'Sosyal Tesisler', phone: '0348 814 26 66', extension: '7000', email: 'kiyuotel@kilis.edu.tr' },
  { id: 'pb-8', name: 'Mediko-Sosyal Sağlık Merkezi', title: 'Sağlık Merkezi', role: 'Öğrenci & Personel Sağlık', department: 'SKS Sağlık Şb.', phone: '0348 814 26 66', extension: '5064', email: 'mediko@kilis.edu.tr' },
  { id: 'pb-9', name: 'Erasmus & Dış İlişkiler Ofisi', title: 'Koordinatörlük', role: 'Öğrenci Değişim Programları', department: 'Uluslararası İlişkiler', phone: '0348 814 26 66', extension: '1450', email: 'erasmus@kilis.edu.tr' },
  { id: 'pb-10', name: 'Kariyer Planlama Uygulama Merkezi', title: 'KARMER', role: 'Staj ve Kariyer Danışmanlığı', department: 'Kariyer Merkezi', phone: '0348 814 26 66', extension: '1520', email: 'karmer@kilis.edu.tr' }
];

export const FALLBACK_EVENTS: CampusEvent[] = [
  { id: 'ev-1', title: "Gazze'de Öğrenci Olmak: Resim Sergisi", date: 'Devam Ediyor', location: 'Merkez Kütüphane Sergi Salonu', category: 'Sergi', url: 'https://www.kilis.edu.tr/tr/etkinlikler' },
  { id: 'ev-2', title: '1. Kilis Kitap Fuarı ve Yazar Söyleşileri', date: 'Ekim 2026', location: 'Kapalı Spor Salonu Yanı Etkinlik Alanı', category: 'Fuar & Söyleşi', url: 'https://www.kilis.edu.tr/tr/etkinlikler' },
  { id: 'ev-3', title: 'Bilim İletişimi Buluşmaları: Kitap Kahramanları Aramızda', date: 'Güz Dönemi', location: 'Rektörlük Konferans Salonu', category: 'Sempozyum', url: 'https://www.kilis.edu.tr/tr/etkinlikler' },
  { id: 'ev-4', title: 'Modernleşmenin Kavşağında Türkiye Konferansı', date: 'Kasım 2026', location: 'İlahiyat Fakültesi Konferans Salonu', category: 'Konferans', url: 'https://www.kilis.edu.tr/tr/etkinlikler' }
];

export const FALLBACK_FORMS: CampusForm[] = AUTHENTIC_FORMS_DATA;

export const FALLBACK_TRANSPORT = {
  cityRoutes: [
    {
      id: 'tr-1',
      name: '1 Nolu Hat: Cumhuriyet Meydanı ⇄ Merkez Kampüs',
      badge: 'En Sık Hat',
      hours: '07:00 – 23:00',
      frequency: 'Her 5–7 dakikada bir',
      route: ['Cumhuriyet Meydanı', 'Eski Valilik', 'Vali Güner Özmen Cad.', 'KYK Yurtları', 'Merkez Kampüs Ana Nizamiye'],
      notes: 'Öğrenci kimliği veya Kilis KentKart ile indirimli biniş geçerlidir.'
    },
    {
      id: 'tr-2',
      name: '2 Nolu Hat: Otogar ⇄ Karataş Kampüsü',
      badge: 'Sağlık & MYO',
      hours: '07:15 – 22:30',
      frequency: 'Her 10–12 dakikada bir',
      route: ['Şehirlerarası Otogar', 'Çevre Yolu', 'Beşevler', 'Sağlık Bilimleri Fakültesi', 'Karataş Kampüsü'],
      notes: 'Sağlık Hizmetleri MYO ve Sosyal Bilimler MYO öğrencileri için doğrudan servis.'
    },
    {
      id: 'tr-3',
      name: '3 Nolu Hat: Devlet Hastanesi ⇄ Kampüs',
      badge: 'Hastane Bağlantısı',
      hours: '07:30 – 21:00',
      frequency: 'Her 15 dakikada bir',
      route: ['Kilis Prof. Dr. Alaeddin Yavaşca Devlet Hastanesi', 'Sanayi', 'Cumhuriyet Meydanı', 'Merkez Kampüs'],
      notes: 'Stajyer ve tıp/sağlık öğrencileri için en hızlı bağlantı.'
    }
  ],
  intercityRoutes: [
    {
      id: 'ic-1',
      title: 'Gaziantep ⇄ Kilis Minibüs Seferleri',
      distance: '~55–65 km (Ortalama 45–50 dk)',
      departure: 'Gaziantep Şehirlerarası Otobüs Terminali (Kilis Peronu)',
      frequency: '06:00 – 22:00 saatleri arasında her 15–20 dakikada bir',
      arrival: 'Kilis Otogarı ve Cumhuriyet Meydanı yolcuları için ara duraklar'
    },
    {
      id: 'ic-2',
      title: 'Gaziantep Havalimanı (GZT) Ulaşımı',
      distance: '~45–50 km',
      options: 'Havalimanından Gaziantep Otogara HAVAŞ veya belediye otobüsü, ardından Kilis minibüsleri. Kampüse toplam yolculuk ~1 saat 15 dk.'
    }
  ],
  taxis: [
    { name: 'Üniversite Kampüs Taksi', phone: '0348 814 26 00', location: 'Merkez Kampüs Girişi' },
    { name: 'Cumhuriyet Meydan Taksi', phone: '0348 813 15 50', location: 'Kilis Meydan' },
    { name: 'Kilis Otogar Taksi', phone: '0348 813 88 99', location: 'Şehirlerarası Otogar' }
  ]
};

export const FALLBACK_LIBRARY = {
  name: 'Kilis 7 Aralık Üniversitesi Merkez Kütüphanesi',
  status: 'Açık',
  hours: {
    weekday: '08:00 – 22:00',
    weekend: '09:00 – 18:00',
    exams: '7/24 Kesintisiz Açık (Vize ve Final Dönemlerinde Gece İkramları İle)'
  },
  borrowingRules: [
    { user: 'Ön Lisans & Lisans Öğrencileri', bookCount: '3 Kitap', duration: '15 Gün', renewCount: '1 Kez Uzatma' },
    { user: 'Yüksek Lisans & Doktora', bookCount: '5 Kitap', duration: '30 Gün', renewCount: '2 Kez Uzatma' },
    { user: 'Akademik Personel', bookCount: '10 Kitap', duration: '60 Gün', renewCount: '2 Kez Uzatma' },
    { user: 'İdari Personel', bookCount: '3 Kitap', duration: '15 Gün', renewCount: '1 Kez Uzatma' }
  ],
  catalogUrl: 'https://yordam.kilis.edu.tr/',
  vetisUrl: 'https://yordam.kilis.edu.tr/vetisbt/',
  databases: [
    'TÜBİTAK ULAKBİM EKUAL',
    'IEEE Xplore Digital Library',
    'ScienceDirect / Elsevier',
    'Web of Science Core Collection',
    'EBSCOhost Academic Search Ultimate',
    'SpringerLink Journals'
  ],
  phone: '0348 814 26 66 (Dahili: 4160)'
};

export const FALLBACK_SPORTS = {
  facilities: [
    {
      id: 'sp-1',
      name: 'Sentetik Çim Halı Saha',
      specs: 'Standart ölçülerde, gece aydınlatmalı, tribünlü',
      hours: '10:00 – 23:00 (Haftanın 7 günü)',
      bookingUrl: 'https://rezervasyon.kilis.edu.tr/SporRezervasyon/Rezervasyon',
      info: 'Öğrenci ve personele uygun seans ücreti ile randevulu hizmet verir.'
    },
    {
      id: 'sp-2',
      name: 'Kapalı Spor Salonu',
      specs: 'FİBA standartlarında parke zemin, 1.000 seyirci kapasitesi',
      hours: '08:30 – 21:00',
      branches: ['Basketbol', 'Voleybol', 'Futsal', 'Hentbol', 'Badminton'],
      info: 'Öğrenci toplulukları ve fakülte turnuvaları için tahsis edilebilir.'
    },
    {
      id: 'sp-3',
      name: 'Fitness & Ağırlık Merkezi',
      specs: 'Profesyonel kardiyo ve ağırlık istasyonları, soyunma odaları',
      hours: 'Hafta içi: 09:00 – 20:00 (Kadın/Erkek seans saatleri mevcuttur)',
      info: 'Dönemlik veya aylık öğrenci aboneliği SKS üzerinden yapılır.'
    }
  ],
  reservationSteps: [
    '1. rezervasyon.kilis.edu.tr adresine gidin.',
    '2. Spor Alanı seçeneğinden Sentetik Halı Saha veya Salonu belirleyin.',
    '3. Uygun seans saatini ve müşteri grubunuzu (Öğrenci/Personel) seçin.',
    '4. İletişim bilgilerinizi girip SMS/E-posta onayını tamamlayın.'
  ],
  contactPhone: '0348 814 26 66 (Dahili: 5053)'
};

export const FALLBACK_HOTEL = {
  name: 'K7AÜ Uygulama Oteli (Sosyal Tesisler)',
  location: 'Merkez Kampüs Girişi, Kilis',
  phone: '0348 814 26 66',
  extension: '7000',
  website: 'https://kiyuotel.kilis.edu.tr',
  roomTypes: [
    { type: 'Standart Tek Kişilik Oda', features: 'Ortopedik yatak, 24 saat sıcak su, TV, Wi-Fi, klima, minibar, çalışma masası' },
    { type: 'Standart Çift Kişilik Oda (Twin/Double)', features: '2 ayrı tek kişilik veya 1 çift kişilik yatak, lüks banyo, gardırop' },
    { type: 'Süit Oda', features: 'Oturma grubu, geniş ferah salon, manzaralı balkon, özel çalışma köşesi' }
  ],
  services: [
    { name: 'Kahvaltı Servisi', hours: '07:30 – 10:00 (Açık büfe & zengin yöresel lezzetler)' },
    { name: 'Restoran & Kafeterya', hours: '12:00 – 21:30 (Öğle ve akşam alakart menü)' },
    { name: 'Toplantı ve Seminer Salonu', hours: 'Özel akademik ve kurumsal toplantılar için ses sistemli salon' }
  ],
  pricingNotes: 'Öğrenci velilerine ve kamu personeline indirimli tarife uygulanmaktadır.'
};

export const FALLBACK_IT_HELP = {
  eduroam: {
    title: 'Eduroam Wi-Fi Kurulum Kılavuzu',
    description: 'Dünya çapında binlerce üniversitede geçerli olan yüksek hızlı ücretsiz akademik internet ağı.',
    androidSteps: [
      '1. Ayarlar > Wi-Fi bölümünden "eduroam" ağını seçin.',
      '2. EAP Yöntemi: PEAP seçin.',
      '3. Aşama 2 Kimlik Doğrulaması: MSCHAPV2 seçin.',
      '4. CA Sertifikası: "Doğrulama Yapma" veya "Sistem Sertifikalarını Kullan" seçin.',
      '5. Çevrimiçi Sertifika Durumu: "Doğrulama Yapma".',
      '6. Alan Adı: "kilis.edu.tr" yazın.',
      '7. Kimlik (Kullanıcı Adı): "ogrencino@kilis.edu.tr" (Örn: 230101001@kilis.edu.tr).',
      '8. Şifre: Öğrenci e-posta / OBS parolanız.',
      '9. "Bağlan" butonuna dokunun.'
    ],
    iosSteps: [
      '1. Ayarlar > Wi-Fi menüsünden "eduroam" ağına dokunun.',
      '2. Kullanıcı Adı kısmına: "ogrencino@kilis.edu.tr" yazın.',
      '3. Parola kısmına: Öğrenci şifrenizi yazın.',
      '4. Sağ üstteki "Katıl"a basın.',
      '5. Ekrana gelen üniversite güvenlik sertifikası penceresinde sağ üstteki "Güven" butonuna dokunun.'
    ],
    windowsSteps: [
      'eduroam CAT (cat.eduroam.org) aracını indirip Kilis 7 Aralık Üniversitesi profilini kurarak otomatik bağlanabilirsiniz.'
    ]
  },
  emailPassword: {
    title: 'Öğrenci E-Posta & Parola İşlemleri',
    url: 'https://bilgiislem.kilis.edu.tr/tr/page/6470',
    steps: [
      'Üniversiteye yeni kayıt yaptıran her öğrenci için otomatik "@kilis.edu.tr" uzantılı e-posta adresi açılır.',
      'İlk parola genellikle T.C. Kimlik numaranızın ilk 6 hanesi veya OBS şifrenizle eşleşir.',
      'Parolanızı unuttuysanız bilgiislem.kilis.edu.tr üzerindeki "Parola Sıfırlama" portalından SMS doğrulaması ile yenileyebilirsiniz.'
    ]
  },
  softwareLicenses: [
    { name: 'Microsoft Office 365', info: 'Öğrenci e-postanızla Word, Excel, PowerPoint ve 1 TB OneDrive ücretsiz.' },
    { name: 'MATLAB & Simulink', info: 'Mühendislik ve fen öğrencileri için tam paket kampüs lisansı.' },
    { name: 'Autodesk Education', info: 'AutoCAD, Revit, 3ds Max öğrenci lisansları.' }
  ],
  supportPhone: '0348 814 26 66 (Dahili: 1313 - Bilgi İşlem Destek)'
};

export const FALLBACK_CAMPUS_MAP: CampusBuilding[] = [
  {
    id: 'cmp-1',
    name: 'Mühendislik - Mimarlık Fakültesi',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'Bilgisayar, Elektrik-Elektronik, Makine ve İnşaat Mühendisliği bölümleri ve AR-GE laboratuvarları.',
    mapsUrl: 'https://maps.google.com/?q=36.73222216370497,37.10261165932252',
    coordinates: { lat: 36.73222216370497, lng: 37.10261165932252 }
  },
  {
    id: 'cmp-2',
    name: 'İktisadi ve İdari Bilimler Fakültesi (İİBF)',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'İktisat, İşletme, Siyaset Bilimi ve Kamu Yönetimi, Uluslararası Ticaret ve Lojistik.',
    mapsUrl: 'https://maps.google.com/?q=36.73096822565002,37.102567044723585',
    coordinates: { lat: 36.73096822565002, lng: 37.102567044723585 }
  },
  {
    id: 'cmp-3',
    name: 'İnsan ve Toplum Bilimleri Fakültesi',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'Tarih, Türk Dili ve Edebiyatı, Felsefe, Coğrafya ve Sosyoloji bölümleri.',
    mapsUrl: 'https://maps.google.com/?q=36.73004215012088,37.10122552321277',
    coordinates: { lat: 36.73004215012088, lng: 37.10122552321277 }
  },
  {
    id: 'cmp-4',
    name: 'İlahiyat Fakültesi',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'Temel İslam Bilimleri, İslam Tarihi ve Sanatları, Konferans Salonu.',
    mapsUrl: 'https://maps.google.com/?q=36.731592874279485,37.10415929157923',
    coordinates: { lat: 36.731592874279485, lng: 37.10415929157923 }
  },
  {
    id: 'cmp-5',
    name: 'Fen Fakültesi',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'Moleküler Biyoloji ve Genetik, Matematik, Kimya ve Fizik laboratuvarları.',
    mapsUrl: 'https://maps.google.com/?q=36.73196984054033,37.10232337488254',
    coordinates: { lat: 36.73196984054033, lng: 37.10232337488254 }
  },
  {
    id: 'cmp-6',
    name: 'Kilisli Muallim Rıfat Eğitim Fakültesi',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'Sınıf Öğretmenliği, Türkçe Öğretmenliği, Okul Öncesi ve Rehberlik ve Psikolojik Danışmanlık (PDR).',
    mapsUrl: 'https://maps.google.com/?q=36.73006164302395,37.10032589696749',
    coordinates: { lat: 36.73006164302395, lng: 37.10032589696749 }
  },
  {
    id: 'cmp-7',
    name: 'Kilis Meslek Yüksekokulu (Merkez)',
    campus: 'Merkez Kampüs',
    type: 'Yüksekokul',
    description: 'Teknik ve sosyal ön lisans programları, uygulama atölyeleri ve teknik derslikler.',
    mapsUrl: 'https://maps.google.com/?q=36.729307689899805,37.099859331362495',
    coordinates: { lat: 36.729307689899805, lng: 37.099859331362495 }
  },
  {
    id: 'cmp-8',
    name: 'Kilis 7 Aralık Üniversitesi, Rektörlük Konferans Salonu',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Akademik törenler, sempozyumlar, paneller ve kültürel etkinlikler ana salonu.',
    mapsUrl: 'https://maps.google.com/?q=36.73056534712289,37.10319110732779',
    coordinates: { lat: 36.73056534712289, lng: 37.10319110732779 }
  },
  {
    id: 'cmp-9',
    name: 'Beden Eğitimi ve Spor Yüksekokulu',
    campus: 'Merkez Kampüs',
    type: 'Yüksekokul',
    description: 'Beden eğitimi öğretmenliği, antrenörlük ve spor yöneticiliği derslik ve spor alanları.',
    mapsUrl: 'https://maps.google.com/?q=36.732558443372646,37.1029427743028',
    coordinates: { lat: 36.732558443372646, lng: 37.1029427743028 }
  },
  {
    id: 'cmp-10',
    name: 'K7AÜ Alaeddin Yavaşca Devlet Konservatuvarı',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Türk Müziği, Müzikoloji, ses stüdyoları ve enstrüman çalışma odaları.',
    mapsUrl: 'https://maps.google.com/?q=36.73228479066196,37.10388348153342',
    coordinates: { lat: 36.73228479066196, lng: 37.10388348153342 }
  },
  {
    id: 'cmp-11',
    name: 'Rektörlük & İdari Bina',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Rektörlük Makamı, Genel Sekreterlik, Senato Salonu ve İdari Daire Başkanlıkları.',
    mapsUrl: 'https://maps.google.com/?q=36.731019907039,37.10391742972362',
    coordinates: { lat: 36.731019907039, lng: 37.10391742972362 }
  },
  {
    id: 'cmp-12',
    name: 'Öğrenci İşleri Daire Başkanlığı',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Kayıt kabul, transkript, öğrenci belgesi, mezuniyet ve harç işlemleri danışma merkezi.',
    mapsUrl: 'https://maps.google.com/?q=36.73086737455341,37.104275514022376',
    coordinates: { lat: 36.73086737455341, lng: 37.104275514022376 }
  },
  {
    id: 'cmp-13',
    name: 'Merkez Kütüphane & 7/24 Çalışma Salonu',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Zengin basılı koleksiyon, sessiz çalışma alanları, grup etüt salonları ve kafeterya.',
    mapsUrl: 'https://maps.google.com/?q=36.73253528647811,37.10339306188092',
    coordinates: { lat: 36.73253528647811, lng: 37.10339306188092 }
  },
  {
    id: 'cmp-14',
    name: 'Merkezi Araştırma Laboratuvarı',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'İleri teknoloji test, analiz, spektroskopi ve bilimsel araştırma cihazları merkezi.',
    mapsUrl: 'https://maps.google.com/?q=36.732935006649534,37.10342397752681',
    coordinates: { lat: 36.732935006649534, lng: 37.10342397752681 }
  },
  {
    id: 'cmp-15',
    name: 'Öğrenci Yemekhanesi & Mediko Sosyal',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Ana tabldot yemekhane salonu, sağlık merkezi, doktor/hemşire odaları ve kulüp ofisleri.',
    mapsUrl: 'https://maps.google.com/?q=36.73137259795592,37.10212241396509',
    coordinates: { lat: 36.73137259795592, lng: 37.10212241396509 }
  },
  {
    id: 'cmp-16',
    name: 'Kapalı Spor Salonu & Halı Saha',
    campus: 'Merkez Kampüs',
    type: 'Spor & Sağlık',
    description: 'Sentetik çim saha, basketbol/voleybol salonu ve fitness merkezi.',
    mapsUrl: 'https://maps.google.com/?q=36.73203652368015,37.100982142549675',
    coordinates: { lat: 36.73203652368015, lng: 37.100982142549675 }
  },
  {
    id: 'cmp-17',
    name: 'K7AÜ Uygulama Oteli (Konukevi)',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Merkez kampüs ana giriş nizamiye yanı, konaklama odaları, restoran ve toplantı salonu.',
    mapsUrl: 'https://maps.google.com/?q=36.73131518920905,37.101994105767226',
    coordinates: { lat: 36.73131518920905, lng: 37.101994105767226 }
  },
  {
    id: 'cmp-18',
    name: 'Karataş Kampüsü (Sağlık & MYO)',
    campus: 'Karataş Kampüsü',
    type: 'Fakülte',
    description: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi, Sağlık Hizmetleri MYO, Sosyal Bilimler MYO.',
    mapsUrl: 'https://maps.google.com/?q=36.717616660986074,37.12284671473918',
    coordinates: { lat: 36.717616660986074, lng: 37.12284671473918 }
  },
  {
    id: 'cmp-19',
    name: 'Mercidabık Kampüsü',
    campus: 'Mercidabık Kampüsü',
    type: 'Yüksekokul',
    description: 'Uygulamalı Bilimler Fakültesi, Turizm ve Otelcilik MYO derslikleri ve uygulama alanları.',
    mapsUrl: 'https://maps.google.com/?q=36.70652881295623,37.11826924623696',
    coordinates: { lat: 36.70652881295623, lng: 37.11826924623696 }
  }
];

// ================= TTL CACHING STRATEGY (Time-To-Live Önbellekleme) =================
export const CACHE_TTL = {
  ANNOUNCEMENTS: 15 * 60 * 1000,     // 15 dakika
  NEWS: 15 * 60 * 1000,              // 15 dakika
  MENU: 24 * 60 * 60 * 1000,         // 24 saat (1 gün - günlük menü önbelleği)
  CALENDAR: 14 * 24 * 60 * 60 * 1000,// 14 gün (Akademik takvim nadir değişir)
  BOLOGNA: 30 * 24 * 60 * 60 * 1000, // 30 gün (Müfredat ve dersler dönemliktir)
  PHONEBOOK: 7 * 24 * 60 * 60 * 1000,// 7 gün
  TRANSPORT: 14 * 24 * 60 * 60 * 1000,// 14 gün
  LIBRARY: 14 * 24 * 60 * 60 * 1000, // 14 gün
  SPORTS: 14 * 24 * 60 * 60 * 1000,  // 14 gün
  HOTEL: 14 * 24 * 60 * 60 * 1000,   // 14 gün
  MAP: 30 * 24 * 60 * 60 * 1000,     // 30 gün
  STAFF: 7 * 24 * 60 * 60 * 1000,    // 7 gün
  FORMS: 14 * 24 * 60 * 60 * 1000    // 14 gün
};

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
}

// Helper: safe local storage read with TTL validation
export function getStoredWithTTL<T>(key: string, ttlMs: number, fallback: T): { data: T; isFresh: boolean } {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed && typeof parsed === 'object' && 'data' in parsed && 'timestamp' in parsed) {
          const isFresh = (Date.now() - parsed.timestamp) < ttlMs;
          if (parsed.data && (Array.isArray(parsed.data) ? parsed.data.length > 0 : Object.keys(parsed.data).length > 0)) {
            return { data: parsed.data, isFresh };
          }
        } else if (parsed && (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)) {
          return { data: parsed, isFresh: false };
        }
      }
    }
  } catch (e) {
    // Ignore parse error
  }
  return { data: fallback, isFresh: false };
}

// Helper: safe local storage save with timestamp
export function setStoredWithTTL<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && value) {
      const envelope: CacheEnvelope<T> = {
        data: value,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(envelope));
    }
  } catch (e) {
    // Ignore storage quota
  }
}

// Helper: safe local storage read (legacy fallback)
function getStored<T>(key: string, fallback: T): T {
  return getStoredWithTTL(key, Infinity, fallback).data;
}

// Helper: safe local storage save (legacy fallback)
function setStored(key: string, value: any): void {
  setStoredWithTTL(key, value);
}

// ================= API CALLS WITH INSTANT CACHE & RESILIENT FALLBACKS =================

export const getAnnouncements = async (force: boolean = false): Promise<Announcement[]> => {
  const cached = getStoredWithTTL<Announcement[]>('k7_cached_announcements', CACHE_TTL.ANNOUNCEMENTS, FALLBACK_ANNOUNCEMENTS);
  if (!force && cached.isFresh) {
    return cached.data;
  }
  try {
    const response = await safeFetch(getApiUrl(`/api/announcements${force ? '?force=true' : ''}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStoredWithTTL('k7_cached_announcements', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Duyurular canlı alınamadı, önbellek kullanılıyor:", err);
  }
  return cached.data || FALLBACK_ANNOUNCEMENTS;
};

export const getNews = async (force: boolean = false): Promise<Announcement[]> => {
  const cached = getStoredWithTTL<Announcement[]>('k7_cached_news', CACHE_TTL.NEWS, FALLBACK_NEWS);
  if (!force && cached.isFresh) {
    return cached.data;
  }
  try {
    const response = await safeFetch(getApiUrl(`/api/news${force ? '?force=true' : ''}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStoredWithTTL('k7_cached_news', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Haberler canlı alınamadı, önbellek kullanılıyor:", err);
  }
  return cached.data || FALLBACK_NEWS;
};

export const getMenu = async (force: boolean = false): Promise<MenuItem[]> => {
  const cached = getStoredWithTTL<MenuItem[]>('k7_cached_menu', CACHE_TTL.MENU, FALLBACK_MENU);
  if (!force && cached.isFresh) {
    return cached.data;
  }
  try {
    const response = await safeFetch(getApiUrl(`/api/menu${force ? '?force=true' : ''}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStoredWithTTL('k7_cached_menu', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Yemek menüsü canlı alınamadı, önbellek kullanılıyor:", err);
  }
  return cached.data || FALLBACK_MENU;
};

export const getCalendarEvents = async (force: boolean = false): Promise<CalendarEvent[]> => {
  const cached = getStoredWithTTL<CalendarEvent[]>('k7_cached_calendar', CACHE_TTL.CALENDAR, []);
  if (!force && cached.isFresh && cached.data.length > 0) {
    return cached.data;
  }
  try {
    const response = await safeFetch(getApiUrl(`/api/calendar${force ? '?force=true' : ''}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStoredWithTTL('k7_cached_calendar', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Canlı takvim çekilemedi, yerleşik veriler kullanılıyor:", err);
  }

  if (cached.data && cached.data.length > 0) return cached.data;

  // Güvenli Yedek (Fallback)
  return [
    // GÜZ YARIYILI
    { id: 'g1', title: 'Özel Öğrenci Giden/Gelen Başvurusu İçin Son Gün', date: '2026-08-14', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g2', title: 'Ders Muafiyetleri İle İlgili Dekanlık/Müdürlüğe Başvuru İçin Son Gün', date: '2026-08-28', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g3', title: 'Çift Anadal / Yandal Başvuruları', date: '2026-08-24', endDate: '2026-08-28', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g4', title: 'Katkı Payı ve Öğrenim Ücreti Yatırma / Kayıt Yenileme ve Ders Kayıtları', date: '2026-09-07', endDate: '2026-09-11', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g5', title: 'Ders Ekleme-Bırakma ve Danışman Onayı', date: '2026-09-07', endDate: '2026-09-15', term: 'Güz Yarıyılı', type: 'registration' },
    { id: 'g6', title: 'İlahiyat Fakültesi Hazırlık Sınıfı Muafiyet Sınavı', date: '2026-09-14', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g7', title: 'Yabancı Dil Muafiyeti İçin Yeterlilik Sınavı', date: '2026-09-16', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g8', title: 'Güz Yarıyılı Derslerinin Başlaması ve Sona Ermesi', date: '2026-09-14', endDate: '2026-12-25', term: 'Güz Yarıyılı', type: 'other' },
    { id: 'g9', title: 'Güz Yarıyılı Ara Sınavları (Vize)', date: '2026-10-31', endDate: '2026-11-08', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g10', title: 'Yarıyıl Sonu Sınavları (Final)', date: '2026-12-26', endDate: '2027-01-03', term: 'Güz Yarıyılı', type: 'exam' },
    { id: 'g11', title: 'Bütünleme Sınavları', date: '2027-01-11', endDate: '2027-01-15', term: 'Güz Yarıyılı', type: 'exam' },
    
    // BAHAR YARIYILI
    { id: 'b1', title: 'Özel Öğrenci Giden/Gelen Başvurusu İçin Son Gün', date: '2027-01-02', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b2', title: 'Çift Anadal / Yandal Başvuruları', date: '2027-01-19', endDate: '2027-01-21', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b3', title: 'Katkı Payı ve Öğrenim Ücreti Yatırma / Kayıt Yenileme ve Ders Kayıtları', date: '2027-02-08', endDate: '2027-02-12', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b4', title: 'Ders Ekleme-Bırakma ve Danışman Onayı', date: '2027-02-08', endDate: '2027-02-16', term: 'Bahar Yarıyılı', type: 'registration' },
    { id: 'b5', title: 'Bahar Yarıyılı Derslerinin Başlaması ve Sona Ermesi', date: '2027-02-15', endDate: '2027-06-11', term: 'Bahar Yarıyılı', type: 'other' },
    { id: 'b6', title: 'Bahar Yarıyılı Ara Sınavları (Vize)', date: '2027-04-10', endDate: '2027-04-18', term: 'Bahar Yarıyılı', type: 'exam' },
    { id: 'b7', title: 'Yarıyıl Sonu Sınavları (Final)', date: '2027-06-12', endDate: '2027-06-20', term: 'Bahar Yarıyılı', type: 'exam' },
    { id: 'b8', title: 'Bütünleme Sınavları', date: '2027-06-24', endDate: '2027-06-27', term: 'Bahar Yarıyılı', type: 'exam' },
    { id: 'b9', title: 'Yaz Stajı', date: '2027-06-28', endDate: '2027-08-27', term: 'Bahar Yarıyılı', type: 'other' },

    // RESMİ TATİLLER
    { id: 't1', title: 'Cumhuriyet Bayramı', date: '2026-10-29', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't2', title: 'Yılbaşı Tatili', date: '2027-01-01', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't3', title: 'Ramazan Bayramı', date: '2027-03-09', endDate: '2027-03-11', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't4', title: 'Ulusal Egemenlik ve Çocuk Bayramı', date: '2027-04-23', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't5', title: 'Emek ve Dayanışma Günü', date: '2027-05-01', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't6', title: 'Atatürk’ü Anma, Gençlik ve Spor Bayramı', date: '2027-05-19', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't7', title: 'Kurban Bayramı', date: '2027-05-16', endDate: '2027-05-19', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't8', title: 'Demokrasi ve Milli Birlik Günü', date: '2027-07-15', term: 'Resmi Tatiller', type: 'holiday' },
    { id: 't9', title: 'Zafer Bayramı', date: '2027-08-30', term: 'Resmi Tatiller', type: 'holiday' },
  ];
};

export const getPhonebook = async (query: string = ''): Promise<PhonebookEntry[]> => {
  try {
    const url = getApiUrl(`/api/phonebook${query ? `?search=${encodeURIComponent(query)}` : ''}`);
    const response = await safeFetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        if (!query) setStored('k7_cached_phonebook', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Telefon rehberi canlı alınamadı, yerleşik rehber kullanılıyor:", err);
  }
  
  const base = getStored('k7_cached_phonebook', FALLBACK_PHONEBOOK);
  if (!query) return base;
  const q = query.toLowerCase();
  return base.filter(p => p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q) || p.extension.includes(q));
};

export const getStaff = async (
  faculty?: string,
  department?: string,
  query?: string,
  category?: string
): Promise<AcademicStaffMember[]> => {
  try {
    const params = new URLSearchParams();
    if (faculty && faculty !== 'all') params.append('faculty', faculty);
    if (department && department !== 'all' && department !== 'Tümü') params.append('department', department);
    if (category && category !== 'all') params.append('category', category);
    if (query) params.append('q', query);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const response = await safeFetch(getApiUrl(`/api/staff${queryStr}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Personel listesi canlı alınamadı, yerleşik veri kullanılıyor:", err);
  }

  let list = ACADEMIC_STAFF_DATA;
  if (category && category !== 'all') {
    list = list.filter(s => s.unitCategory === category);
  }
  if (faculty && faculty !== 'all') {
    list = list.filter(s => s.facultyId.toLowerCase() === faculty.toLowerCase());
  }
  if (department && department !== 'all' && department !== 'Tümü') {
    list = list.filter(s => s.department.toLowerCase().includes(department.toLowerCase()));
  }
  if (query) {
    const qLower = query.toLowerCase().trim();
    list = list.filter(s => 
      s.fullName.toLowerCase().includes(qLower) ||
      s.title.toLowerCase().includes(qLower) ||
      s.role.toLowerCase().includes(qLower) ||
      s.department.toLowerCase().includes(qLower) ||
      s.facultyName.toLowerCase().includes(qLower) ||
      s.email.toLowerCase().includes(qLower)
    );
  }
  return list;
};

export const getEvents = async (force: boolean = false): Promise<CampusEvent[]> => {
  try {
    const response = await safeFetch(getApiUrl(`/api/events${force ? '?force=true' : ''}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStored('k7_cached_events', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Etkinlikler canlı alınamadı, önbellek kullanılıyor:", err);
  }
  return getStored('k7_cached_events', FALLBACK_EVENTS);
};

export const getForms = async (
  source?: string,
  faculty?: string,
  department?: string,
  category?: string,
  q?: string
): Promise<CampusForm[]> => {
  const REQUIRED_FACULTIES = ['fen', 'gsf', 'iibf', 'ilahiyat', 'iletisim', 'itbf', 'egitim', 'mmf', 'spor', 'ubf', 'sbf', 'ziraat'];
  const isValidFormList = (list: any): list is CampusForm[] => {
    if (!Array.isArray(list) || list.length < 150) return false;
    return REQUIRED_FACULTIES.every(fac => list.some(item => item && item.faculty === fac));
  };

  // Clean old invalid caches
  try {
    ['k7_cached_forms', 'k7_cached_forms_v1', 'k7_cached_forms_v2', 'k7_cached_forms_v3', 'k7_cached_forms_v4'].forEach(k => {
      localStorage.removeItem(k);
    });
  } catch {}

  try {
    const params = new URLSearchParams();
    if (source && source !== 'all') params.append('source', source);
    if (faculty && faculty !== 'all' && faculty !== 'Tümü') params.append('faculty', faculty);
    if (category && category !== 'all' && category !== 'Tümü') params.append('category', category);
    if (q) params.append('q', q);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const response = await safeFetch(getApiUrl(`/api/forms${queryStr}`));
    if (response.ok) {
      const data = await response.json();
      if (isValidFormList(data)) {
        if (!source && !faculty && !category && !q) {
          setStored('k7_cached_forms_v5', data);
        }
        return data;
      }
    }
  } catch (err) {
    console.warn("Matbu formlar canlı alınamadı, yerleşik formlar kullanılıyor:", err);
  }
  
  let cached = getStored('k7_cached_forms_v5', FALLBACK_FORMS);
  if (!isValidFormList(cached)) {
    cached = FALLBACK_FORMS;
  }

  let fallback = cached;
  if (source && source !== 'all') {
    if (source === 'ogrenciisleri') fallback = fallback.filter(f => f.source === 'ogrenciisleri.kilis.edu.tr');
    else if (source === 'kilis') fallback = fallback.filter(f => f.source === 'kilis.edu.tr');
    else if (source === 'faculty') fallback = fallback.filter(f => f.source === 'faculty');
  }
  if (faculty && faculty !== 'all' && faculty !== 'Tümü') {
    fallback = fallback.filter(f => f.faculty && f.faculty.toLowerCase() === faculty.toLowerCase());
  }
  if (category && category !== 'all' && category !== 'Tümü') {
    fallback = fallback.filter(f => f.category && f.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (q) {
    const qLower = q.toLowerCase();
    fallback = fallback.filter(f => 
      f.title.toLowerCase().includes(qLower) || 
      (f.description || '').toLowerCase().includes(qLower) ||
      (f.sourceName || '').toLowerCase().includes(qLower) ||
      (f.category || '').toLowerCase().includes(qLower)
    );
  }
  return fallback;
};

export const getTransportInfo = async (): Promise<any> => {
  try {
    const response = await safeFetch(getApiUrl('/api/transport'));
    if (response.ok) {
      const data = await response.json();
      if (data && data.cityRoutes && data.cityRoutes.length > 0) {
        setStored('k7_cached_transport', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Ulaşım bilgisi canlı alınamadı, yerleşik rehber kullanılıyor:", err);
  }
  return getStored('k7_cached_transport', FALLBACK_TRANSPORT);
};

export const getLibraryInfo = async (): Promise<any> => {
  try {
    const response = await safeFetch(getApiUrl('/api/library'));
    if (response.ok) {
      const data = await response.json();
      if (data && data.name) {
        setStored('k7_cached_library', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Kütüphane bilgisi canlı alınamadı, yerleşik bilgiler kullanılıyor:", err);
  }
  return getStored('k7_cached_library', FALLBACK_LIBRARY);
};

export const getSportsInfo = async (): Promise<any> => {
  try {
    const response = await safeFetch(getApiUrl('/api/sports'));
    if (response.ok) {
      const data = await response.json();
      if (data && data.facilities && data.facilities.length > 0) {
        setStored('k7_cached_sports', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Spor tesisleri bilgisi canlı alınamadı, yerleşik bilgiler kullanılıyor:", err);
  }
  return getStored('k7_cached_sports', FALLBACK_SPORTS);
};

export const getHotelInfo = async (): Promise<any> => {
  try {
    const response = await safeFetch(getApiUrl('/api/hotel'));
    if (response.ok) {
      const data = await response.json();
      if (data && data.name) {
        setStored('k7_cached_hotel', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Uygulama oteli canlı alınamadı, yerleşik bilgiler kullanılıyor:", err);
  }
  return getStored('k7_cached_hotel', FALLBACK_HOTEL);
};

export const getItHelpInfo = async (): Promise<any> => {
  try {
    const response = await safeFetch(getApiUrl('/api/it-help'));
    if (response.ok) {
      const data = await response.json();
      if (data && data.eduroam) {
        setStored('k7_cached_ithelp', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Bilgi işlem rehberi canlı alınamadı, yerleşik rehber kullanılıyor:", err);
  }
  return getStored('k7_cached_ithelp', FALLBACK_IT_HELP);
};

export const getCampusMapLocations = async (): Promise<CampusBuilding[]> => {
  try {
    // Clean old outdated map cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem('k7_cached_campusmap');
    }
    const response = await safeFetch(getApiUrl('/api/campus-map'));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length >= 15) {
        setStoredWithTTL('k7_cached_campusmap_v2', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Kampüs haritası canlı alınamadı, yerleşik veriler kullanılıyor:", err);
  }
  const cached = getStoredWithTTL<CampusBuilding[]>('k7_cached_campusmap_v2', CACHE_TTL.MAP, FALLBACK_CAMPUS_MAP);
  return (cached.data && cached.data.length >= 15) ? cached.data : FALLBACK_CAMPUS_MAP;
};
