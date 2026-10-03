import {
  Announcement,
  MenuItem,
  CalendarEvent,
  BolognaFaculty,
  PhonebookEntry,
  CampusEvent,
  CampusForm,
  CampusBuilding
} from './types';
import { getApiUrl, safeFetch } from './config';

// ================= FALLBACK DATA =================

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
    category: 'Dış İlişkiler',
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
    category: 'SKS',
    url: 'https://sks.kilis.edu.tr'
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
    category: 'Başarılar',
    url: 'https://mmf.kilis.edu.tr'
  },
  {
    id: 'news-fb-4',
    title: 'Üniversitemiz ile Kilis Sanayi ve Ticaret Odası Arasında İş Birliği Protokolü İmzalandı',
    date: '19.09.2026',
    content: 'Öğrencilerimize staj, istihdam ve AR-GE projelerinde geniş imkanlar sağlayacak protokol imzalandı.',
    category: 'İş Birlikleri',
    url: 'https://www.kilis.edu.tr/tr/haberler'
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

export const FALLBACK_FORMS: CampusForm[] = [
  // --- ÖĞRENCİ İŞLERİ DAİRE BAŞKANLIĞI FORMLARI (ogrenciisleri.kilis.edu.tr/tr/department-forms) ---
  {
    id: 'form-oidb-1',
    title: 'Öğrenci Diploma Kayıp Dilekçesi',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Öğrenci Dilekçeleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/945464751766650323.Öğrenci diploma kayıp dilekçesi.docx',
    description: 'Diplomasını kaybeden mezunların yeni diploma veya mezuniyet belgesi talebi için başvuru dilekçesi (DOCX)'
  },
  {
    id: 'form-oidb-2',
    title: 'Öğrenci Kimlik Kartı Kayıp Dilekçesi',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Öğrenci Dilekçeleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/93603571766650418.Öğrenci kimlik kartı kayıp dilekçesi.docx',
    description: 'Üniversite kimlik kartını kaybeden veya zayi eden öğrencilerin yeni kart basım talebi (DOCX)'
  },
  {
    id: 'form-oidb-3',
    title: 'Dönem Sonu Ek Sınav Dilekçesi',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Sınav & Not İşlemleri',
    fileType: 'doc',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/914493791766659460.ek_sinav_dilekcesi (1).doc',
    description: 'Dönem sonu tek veya ek sınav haklarından yararlanmak isteyen son sınıf öğrencileri için sınav başvuru formu (DOC)'
  },
  {
    id: 'form-oidb-4',
    title: 'Azami Süre Öğrencileri İçin Sınav Dilekçesi',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Sınav & Not İşlemleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9499248661766650999.azami dilekce ornegi.docx',
    description: '2547 sayılı kanun uyarınca azami öğrenim süresini dolduran öğrencilerin 2 ek sınav hakkı dilekçesi (DOCX)'
  },
  {
    id: 'form-oidb-5',
    title: 'Örnek Ders Dağılım Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Kayıt & Ders İşlemleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9676114061766738993.Örnek Ders Dağılım Formu.docx',
    description: 'Fakülte ve bölümlerin yarıyıl bazlı haftalık ders programı ve öğretim elemanı dağılım şablonu (DOCX)'
  },
  {
    id: 'form-oidb-6',
    title: 'Özel Öğrenci Başvuru Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Öğrenci Dilekçeleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9170567891766652987.Özel Öğrenci Başvuru Formu.docx',
    description: 'Başka bir üniversitede veya üniversitemizde özel öğrenci statüsünde ders almak isteyenlerin başvuru formu (DOCX)'
  },
  {
    id: 'form-oidb-7',
    title: 'Özel Öğrenci Öğrenim Protokolü',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Öğrenci Dilekçeleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9767595081766653069.özel öğr.öğrenim protokolü.docx',
    description: 'Özel öğrencilik süresince alınacak derslerin kredilerinin ve AKTS denkliğinin onay protokolü (DOCX)'
  },
  {
    id: 'form-oidb-8',
    title: 'Harç İade Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Kayıt & Ders İşlemleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9838737511767686774.harc_dilekcesi.docx',
    description: 'Fazla veya sehven yatırılan harç/öğrenim ücretinin IBAN hesabına iade edilmesi için talep dilekçesi (DOCX)'
  },
  {
    id: 'form-oidb-9',
    title: 'AGNO Yatay Geçiş Sonuç Tablo Örneği',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Yatay Geçiş & İntibak',
    fileType: 'xlsx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/932976721766653261.AGNO Yatay Geçiş Tablo Örneği.xlsx',
    description: 'Kurumlararası ve kurum içi ağırlıklı genel not ortalaması (AGNO) ile yatay geçiş değerlendirme sonuç tablosu (XLSX)'
  },
  {
    id: 'form-oidb-10',
    title: 'Ek Madde-1 Yatay Geçiş Sonuç İlanı Tablosu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Yatay Geçiş & İntibak',
    fileType: 'xlsx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9647419351766660926.Ek Madde-1 yatay_gecis_sonucların_ilanı tablosu.xlsx',
    description: 'Merkezi yerleştirme puanı (Ek Madde-1) yatay geçiş değerlendirme ve ilan tablosu şablonu (XLSX)'
  },
  {
    id: 'form-oidb-11',
    title: 'Üniversiteden İlişik Kesme Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Kayıt & Ders İşlemleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9836798861767691725.ilişik kesme formu.docx',
    description: 'Mezuniyet veya kendi isteğiyle kaydını sildirecek öğrencilerin kütüphane, laboratuvar ve SKS onay formu (DOCX)'
  },
  {
    id: 'form-oidb-12',
    title: 'Mazeretli Not Bildirim Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Sınav & Not İşlemleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9303658041767689785.not_bildirim_formu.docx',
    description: 'Mazeret sınavına giren veya maddi hata sonucu notu değişen öğrenciler için öğretim üyesi not bildirim belgesi (DOCX)'
  },
  {
    id: 'form-oidb-13',
    title: 'Ders İntibak Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Yatay Geçiş & İntibak',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9133417691767689978.İntibak Formu (1).docx',
    description: 'Yatay geçiş, DGS veya af kapsamında gelen öğrencilerin önceki derslerinin sayılması için intibak komisyonu formu (DOCX)'
  },
  {
    id: 'form-oidb-14',
    title: 'Ders Kataloğu Hazırlama (Örnek)',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Kayıt & Ders İşlemleri',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9853010351767690301.Ders Katalog Örneği(1).docx',
    description: 'Bölümlerin Bologna ve AKTS ders kataloğu içerik hazırlama standart şablonu (DOCX)'
  },
  {
    id: 'form-oidb-15',
    title: 'Yaz Okulu Açılması İstenen Dersler Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Yaz Okulu',
    fileType: 'xlsx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9480746011767690518.Standart Form yaz okulu açılacak dersler.xlsx',
    description: 'Yaz öğretiminde bölüm veya dekanlıklarca açılması planlanan derslerin talep listesi (XLSX)'
  },
  {
    id: 'form-oidb-16',
    title: 'Yaz Okulunda Diğer Üniversitelerden Ders Talep Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Yaz Okulu',
    fileType: 'pdf',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9517221841767690958.yaz okulunda üniversite dışı ders alma formu.pdf',
    description: 'Üniversitemizde açılmayan yaz okulu derslerini başka bir üniversiteden almak isteyen öğrencilerin izin ve onay formu (PDF)'
  },
  {
    id: 'form-oidb-17',
    title: 'Yaz Okulu Kayıt Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Yaz Okulu',
    fileType: 'docx',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/9525665031766661008.yaz okul kayıt formu örneği.docx',
    description: 'Kilis 7 Aralık Üniversitesi yaz okuluna kayıt yaptıracak öğrenciler için ders kayıt dilekçesi (DOCX)'
  },
  {
    id: 'form-oidb-18',
    title: 'Yatay Geçiş Yapmasında Engel Yoktur Formu',
    source: 'ogrenciisleri.kilis.edu.tr',
    sourceName: 'Öğrenci İşleri Daire Başkanlığı',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/department-forms',
    category: 'Yatay Geçiş & İntibak',
    fileType: 'pdf',
    downloadUrl: 'https://ogrenciisleri.kilis.edu.tr/files/department_forms/952941881769673037.YATAY GEÇİŞE ENGEL YOKTUR FORMU.pdf',
    description: 'Başka bir üniversiteye yatay geçiş yapacak öğrencilerin üniversitemizden temin ettiği ilişik ve disiplin onay belgesi (PDF)'
  },

  // --- ÜNİVERSİTE GENEL MATBU FORMLARI - REKTÖRLÜK (kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d) ---
  {
    id: 'form-kilis-1',
    title: 'AKADEMİK KİMLİK BAŞVURU FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Akademik Faaliyet & Kadro',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695540c5cef18.doc',
    description: 'Akademik personelin kurumsal üniversite kimlik kartı basımı için başvuru formu (DOC)'
  },
  {
    id: 'form-kilis-2',
    title: 'ARAÇ İSTEK FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Lojistik & Tesisler',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695540c5d263e.doc',
    description: 'Resmi görevlendirme, teknik gezi ve organizasyonlar için üniversite taşıt talep formu (DOC)'
  },
  {
    id: 'form-kilis-3',
    title: 'TAŞINIR İSTEK FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Satınalma & Ayniyat',
    fileType: 'xls',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695540c5d4247.xls',
    description: 'Birimlerin kırtasiye, donanım ve taşınır tüketim malzemesi ambar talep belgesi (XLS)'
  },
  {
    id: 'form-kilis-4',
    title: 'PERSONEL İZİN FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'İdari & Personel',
    fileType: 'docx',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695540c5d5fb3.docx',
    description: 'Yıllık izin, mazeret izni ve idari izin talepleri için Personel Daire Başkanlığı onay formu (DOCX)'
  },
  {
    id: 'form-kilis-5',
    title: 'AKADEMİK PERSONEL GÖREVLENDİRME TALEP FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Akademik Faaliyet & Kadro',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695540c5d7e48.doc',
    description: 'Kongre, sempozyum, konferans ve bilimsel toplantı katılımı için 39. madde görevlendirme formu (DOC)'
  },
  {
    id: 'form-kilis-6',
    title: 'DEMİRBAŞ EŞYA ÇIKIŞ FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Satınalma & Ayniyat',
    fileType: 'xlt',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695545460cd09.xlt',
    description: 'Birimler arası demirbaş eşya devri ve çıkış işlemlerinde kullanılan resmi tutanak (XLT)'
  },
  {
    id: 'form-kilis-7',
    title: 'İHTİYAÇ BELGESİ (İdari ve Mali İşler Daire Başkanlığı)',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Satınalma & Ayniyat',
    fileType: 'xls',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/69554587a59fd.xls',
    description: 'Mal ve hizmet alımları öncesi idari ve mali işlere sunulan resmi ihtiyaç bildirim formu (XLS)'
  },
  {
    id: 'form-kilis-8',
    title: 'BASIM TALEP FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Satınalma & Ayniyat',
    fileType: 'xls',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/69554587a731e.xls',
    description: 'Kitap, dergi, afiş, broşür ve matbaa basım talepleri için yetkili onay formu (XLS)'
  },
  {
    id: 'form-kilis-9',
    title: 'BİLGİSAYAR ONARIM VE SERVİS FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Bilgi İşlem & İletişim',
    fileType: 'xls',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/69554587a894b.xls',
    description: 'Donanım ve yazılım arızalarında Bilgi İşlem Daire Başkanlığına iletilen servis fişi (XLS)'
  },
  {
    id: 'form-kilis-10',
    title: 'E-POSTA ADRESİ İSTEK FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Bilgi İşlem & İletişim',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955460b34ee0.doc',
    description: 'Personel ve birimler için kurumsal @kilis.edu.tr uzantılı e-posta adresi açma formu (DOC)'
  },
  {
    id: 'form-kilis-11',
    title: 'TELEFON ARIZA İSTEK FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Bilgi İşlem & İletişim',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955460b369e2.doc',
    description: 'Dahili santral telefon hatlarındaki ses ve bağlantı sorunları için bildirim formu (DOC)'
  },
  {
    id: 'form-kilis-12',
    title: 'TELEFON HATTI İSTEK FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Bilgi İşlem & İletişim',
    fileType: 'xls',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955460b38202.xls',
    description: 'Yeni açılan ofis ve birimler için yeni dahili telefon hattı tahsis talep formu (XLS)'
  },
  {
    id: 'form-kilis-13',
    title: 'TELEFON HATTI YER DEĞİŞİKLİĞİ İSTEK FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Bilgi İşlem & İletişim',
    fileType: 'xls',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955460b39722.xls',
    description: 'Oda ve bina değişikliğinde mevcut dahili numaranın nakil talebi (XLS)'
  },
  {
    id: 'form-kilis-14',
    title: 'TELEFON HATTI RESMİ GÖRÜSME FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Bilgi İşlem & İletişim',
    fileType: 'xls',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955460b3b132.xls',
    description: 'Şehirlerarası veya uluslararası kurumsal telefon görüşmeleri izin ve kayıt formu (XLS)'
  },
  {
    id: 'form-kilis-15',
    title: 'TELEFON HATTI ZİMMET / DEVİR FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Bilgi İşlem & İletişim',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955460b3ceaf.doc',
    description: 'Dahili telefon cihazı ve hattının personeller arası devir ve teslim tutanağı (DOC)'
  },
  {
    id: 'form-kilis-16',
    title: 'HİZMET PASAPORTU İSTEK FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'İdari & Personel',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955460b3ec80.doc',
    description: 'Yurt dışı resmi görevlendirmelerde Gri Pasaport (Hizmet Pasaportu) talep belgesi (DOC)'
  },
  {
    id: 'form-kilis-17',
    title: 'SALON İSTEK FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Lojistik & Tesisler',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695547075c4c9.doc',
    description: 'Konferans salonları, amfiler ve toplantı salonlarının tahsisi için talep formu (DOC)'
  },
  {
    id: 'form-kilis-18',
    title: 'AKADEMİK FAALİYET FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Akademik Faaliyet & Kadro',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695547075e2cb.doc',
    description: 'Öğretim elemanlarının yıllık akademik yayın, proje ve etkinlik beyan belgesi (DOC)'
  },
  {
    id: 'form-kilis-19',
    title: 'PROJE İSTATİK BİLGİLERİ',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Akademik Faaliyet & Kadro',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695547075fc05.doc',
    description: 'BAP, TÜBİTAK ve AB projelerinin üniversite istatistik veri tabanına giriş formu (DOC)'
  },
  {
    id: 'form-kilis-20',
    title: 'İŞÇİ PERFORMANS DEĞERLENDİRME FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'İdari & Personel',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955470761927.doc',
    description: 'Sürekli işçi ve sözleşmeli personelin yıllık periyodik performans değerlendirme formu (DOC)'
  },
  {
    id: 'form-kilis-21',
    title: 'YEMEKHANE ANKET FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Lojistik & Tesisler',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955470763532.doc',
    description: 'Yemek kalitesi, porsiyon ve hijyen memnuniyet anketi değerlendirme formu (DOC)'
  },
  {
    id: 'form-kilis-22',
    title: 'GÜNCEL İLETİŞİM BİLGİ FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'İdari & Personel',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695547076509a.doc',
    description: 'Personelin adres, GSM numarası ve acil durum iletişim bilgilerini güncelleme formu (DOC)'
  },
  {
    id: 'form-kilis-23',
    title: 'BETEK BAŞVURU FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'İdari & Personel',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/69554707670ac.doc',
    description: 'Bilimsel ve Teknolojik Araştırmalar Uygulama ve Araştırma Merkezi analiz başvuru formu (DOC)'
  },
  {
    id: 'form-kilis-24',
    title: 'ÖYP 6 AYLIK FAALİYET RAPORU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Akademik Faaliyet & Kadro',
    fileType: 'docx',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955470768e2e.docx',
    description: 'Öğretim Üyesi Yetiştirme Programı kapsamındaki araştırma görevlilerinin 6 aylık gelişim raporu (DOCX)'
  },
  {
    id: 'form-kilis-25',
    title: 'YÖNETİM KURULU / SENATODA GÖRÜŞÜLMESİ GEREKEN KONULARLA İLGİLİ BİLGİ FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Akademik Faaliyet & Kadro',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695547076ac1f.doc',
    description: 'Üniversite Senatosu veya Yönetim Kuruluna sunulacak gündem maddeleri ve gerekçe özeti (DOC)'
  },
  {
    id: 'form-kilis-26',
    title: 'AKADEMİK PERSONEL BİLGİ İSTEK FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Akademik Faaliyet & Kadro',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695547076cc11.doc',
    description: 'Özlük hakları, hizmet belgesi ve akademik kadro bilgi talepleri için müracaat belgesi (DOC)'
  },
  {
    id: 'form-kilis-27',
    title: 'BİLİMSEL SOSYAL VE KÜLTÜREL ETKİNLİKLER',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Akademik Faaliyet & Kadro',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695547076e958.doc',
    description: 'Kampüs içi panel, konferans, dinleti ve sergi organizasyon bildirim ve izin formu (DOC)'
  },
  {
    id: 'form-kilis-28',
    title: 'ÜSTÜN BAŞARI BELGESİ, BAŞARI BELGESİ, ÖDÜL, PLAKET, ONUR ÖDÜLÜ TALEP FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'İdari & Personel',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955470773140.doc',
    description: 'Yıl içerisinde üstün başarı gösteren akademik/idari personel ve öğrencilere ödül teklif formu (DOC)'
  },
  {
    id: 'form-kilis-29',
    title: 'DOĞRUDAN TEMİN ONAY BELGESİ',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Satınalma & Ayniyat',
    fileType: 'xls',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/695547077518f.xls',
    description: '4734 sayılı Kamu İhale Kanunu 22/d maddesi doğrudan temin onay ve piyasa fiyat araştırma formu (XLS)'
  },
  {
    id: 'form-kilis-30',
    title: 'EBYS YETKİ DEVİR FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Bilgi İşlem & İletişim',
    fileType: 'doc',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6955470776e43.doc',
    description: 'Elektronik Belge Yönetim Sistemi (EBYS) vekalet, imza ve onay yetkisi devir formu (DOC)'
  },
  {
    id: 'form-kilis-31',
    title: 'PLAKA TANIMA SİSTEMİ',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Bilgi İşlem & İletişim',
    fileType: 'docx',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/6a75d7f899b6d.docx',
    description: 'Kampüs giriş nizamiye otomatik bariyer geçişi için araç plaka kayıt ve tanımlama formu (DOCX)'
  },
  {
    id: 'form-kilis-32',
    title: 'KAMU KONUTLARI TALEP FORMU',
    source: 'kilis.edu.tr',
    sourceName: 'Üniversite Genel Matbu Formları',
    sourceUrl: 'https://www.kilis.edu.tr/tr/sayfa/matbu-formlar-7sT5d',
    category: 'Lojistik & Tesisler',
    fileType: 'xlsx',
    downloadUrl: 'https://www.kilis.edu.tr/documents/documents/69a045be3d89f.xlsx',
    description: 'Üniversite lojman ve konut tahsisi için puanlama kriterlerini içeren başvuru formu (XLSX)'
  }
];

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
    name: 'Rektörlük & İdari Bina',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Senato, Yönetim Kurulu, Genel Sekreterlik ve Daire Başkanlıkları.',
    mapsUrl: 'https://maps.google.com/?q=36.7121,37.1082',
    coordinates: { lat: 36.7121, lng: 37.1082 }
  },
  {
    id: 'cmp-2',
    name: 'Mühendislik - Mimarlık Fakültesi',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'Bilgisayar, İnşaat, Elektrik-Elektronik, Makine mühendislikleri ve laboratuvarlar.',
    mapsUrl: 'https://maps.google.com/?q=36.7115,37.1075',
    coordinates: { lat: 36.7115, lng: 37.1075 }
  },
  {
    id: 'cmp-3',
    name: 'İlahiyat Fakültesi',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'Derslikler, amfiler ve İlahiyat Konferans Salonu.',
    mapsUrl: 'https://maps.google.com/?q=36.7130,37.1090',
    coordinates: { lat: 36.7130, lng: 37.1090 }
  },
  {
    id: 'cmp-4',
    name: 'İktisadi ve İdari Bilimler Fakültesi (İİBF)',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'İktisat, İşletme, Siyaset Bilimi ve Uluslararası İlişkiler.',
    mapsUrl: 'https://maps.google.com/?q=36.7125,37.1070',
    coordinates: { lat: 36.7125, lng: 37.1070 }
  },
  {
    id: 'cmp-5',
    name: 'İnsan ve Toplum Bilimleri Fakültesi',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'Tarih, Türk Dili ve Edebiyatı, Felsefe, Coğrafya ve Sosyoloji bölümleri.',
    mapsUrl: 'https://maps.google.com/?q=36.7110,37.1085',
    coordinates: { lat: 36.7110, lng: 37.1085 }
  },
  {
    id: 'cmp-6',
    name: 'Fen Fakültesi & Ziraat Fakültesi',
    campus: 'Merkez Kampüs',
    type: 'Fakülte',
    description: 'Biyoloji, Kimya, Matematik laboratuvarları ve tarımsal araştırma birimleri.',
    mapsUrl: 'https://maps.google.com/?q=36.7105,37.1092',
    coordinates: { lat: 36.7105, lng: 37.1092 }
  },
  {
    id: 'cmp-7',
    name: 'Merkez Kütüphane & 7/24 Çalışma Salonu',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Zengin basılı koleksiyon, sessiz çalışma alanları ve kafeterya.',
    mapsUrl: 'https://maps.google.com/?q=36.7118,37.1084',
    coordinates: { lat: 36.7118, lng: 37.1084 }
  },
  {
    id: 'cmp-8',
    name: 'Öğrenci Yemekhanesi & Mediko Sosyal',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Ana tabldot yemekhane salonu, sağlık odası ve öğrenci kulüp ofisleri.',
    mapsUrl: 'https://maps.google.com/?q=36.7123,37.1078',
    coordinates: { lat: 36.7123, lng: 37.1078 }
  },
  {
    id: 'cmp-9',
    name: 'Kapalı Spor Salonu & Halı Saha',
    campus: 'Merkez Kampüs',
    type: 'Spor & Sağlık',
    description: 'Sentetik çim saha, basketbol/voleybol salonu ve fitness merkezi.',
    mapsUrl: 'https://maps.google.com/?q=36.7135,37.1065',
    coordinates: { lat: 36.7135, lng: 37.1065 }
  },
  {
    id: 'cmp-10',
    name: 'K7AÜ Uygulama Oteli (Konukevi)',
    campus: 'Merkez Kampüs',
    type: 'Sosyal / İdari',
    description: 'Merkez kampüs ana giriş nizamiye yanı, otel odaları ve restoran.',
    mapsUrl: 'https://maps.google.com/?q=36.7140,37.1095',
    coordinates: { lat: 36.7140, lng: 37.1095 }
  },
  {
    id: 'cmp-11',
    name: 'Karataş Kampüsü (Sağlık & MYO)',
    campus: 'Karataş Kampüsü',
    type: 'Fakülte',
    description: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi, Sağlık Hizmetleri MYO, Sosyal Bilimler MYO.',
    mapsUrl: 'https://maps.google.com/?q=36.7235,37.1265',
    coordinates: { lat: 36.7235, lng: 37.1265 }
  },
  {
    id: 'cmp-12',
    name: 'Mercidabık Kampüsü',
    campus: 'Mercidabık Kampüsü',
    type: 'Yüksekokul',
    description: 'Uygulamalı Bilimler Fakültesi, Turizm ve Otelcilik MYO derslikleri.',
    mapsUrl: 'https://maps.google.com/?q=36.7050,37.1190',
    coordinates: { lat: 36.7050, lng: 37.1190 }
  }
];

// Helper: safe local storage read
function getStored<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed && (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)) {
          return parsed;
        }
      }
    }
  } catch (e) {
    // Ignore parse error
  }
  return fallback;
}

// Helper: safe local storage save
function setStored(key: string, value: any): void {
  try {
    if (typeof window !== 'undefined' && value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    // Ignore storage quota
  }
}

// ================= API CALLS WITH INSTANT CACHE & RESILIENT FALLBACKS =================

export const getAnnouncements = async (force: boolean = false): Promise<Announcement[]> => {
  try {
    const response = await safeFetch(getApiUrl(`/api/announcements${force ? '?force=true' : ''}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStored('k7_cached_announcements', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Duyurular canlı alınamadı, önbellek kullanılıyor:", err);
  }
  return getStored('k7_cached_announcements', FALLBACK_ANNOUNCEMENTS);
};

export const getNews = async (force: boolean = false): Promise<Announcement[]> => {
  try {
    const response = await safeFetch(getApiUrl(`/api/news${force ? '?force=true' : ''}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStored('k7_cached_news', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Haberler canlı alınamadı, önbellek kullanılıyor:", err);
  }
  return getStored('k7_cached_news', FALLBACK_NEWS);
};

export const getMenu = async (): Promise<MenuItem[]> => {
  try {
    const response = await safeFetch(getApiUrl('/api/menu'));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStored('k7_cached_menu', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Yemek menüsü canlı alınamadı, önbellek kullanılıyor:", err);
  }
  return getStored('k7_cached_menu', FALLBACK_MENU);
};

export const getCalendarEvents = async (force: boolean = false): Promise<CalendarEvent[]> => {
  try {
    const response = await safeFetch(getApiUrl(`/api/calendar${force ? '?force=true' : ''}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStored('k7_cached_calendar', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Canlı takvim çekilemedi, yerleşik veriler kullanılıyor:", err);
  }

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

export const getForms = async (source?: string, category?: string, q?: string): Promise<CampusForm[]> => {
  try {
    const params = new URLSearchParams();
    if (source && source !== 'all') params.append('source', source);
    if (category && category !== 'all' && category !== 'Tümü') params.append('category', category);
    if (q) params.append('q', q);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const response = await safeFetch(getApiUrl(`/api/forms${queryStr}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        if (!source && !category && !q) {
          setStored('k7_cached_forms', data);
        }
        return data;
      }
    }
  } catch (err) {
    console.warn("Matbu formlar canlı alınamadı, yerleşik formlar kullanılıyor:", err);
  }
  
  let fallback = getStored('k7_cached_forms', FALLBACK_FORMS);
  if (source && source !== 'all') {
    fallback = fallback.filter(f => f.source === source);
  }
  if (category && category !== 'all' && category !== 'Tümü') {
    fallback = fallback.filter(f => f.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (q) {
    const qLower = q.toLowerCase();
    fallback = fallback.filter(f => f.title.toLowerCase().includes(qLower) || f.description.toLowerCase().includes(qLower));
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
    const response = await safeFetch(getApiUrl('/api/campus-map'));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setStored('k7_cached_campusmap', data);
        return data;
      }
    }
  } catch (err) {
    console.warn("Kampüs haritası canlı alınamadı, yerleşik veriler kullanılıyor:", err);
  }
  return getStored('k7_cached_campusmap', FALLBACK_CAMPUS_MAP);
};
