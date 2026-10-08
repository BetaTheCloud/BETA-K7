import { AcademicDepartmentUnit, DepartmentNewsItem, DepartmentAnnouncementItem, StaffUnitCategory } from '../types';

export interface DepartmentGroup {
  facultyId: string;
  facultyName: string;
  shortName: string;
  category: StaffUnitCategory;
  facultyNewsUrl: string;
  facultyAnnouncementUrl?: string;
  departments: AcademicDepartmentUnit[];
}

export function getFacultyAnnouncementUrl(group: DepartmentGroup): string {
  if (group.facultyAnnouncementUrl) return group.facultyAnnouncementUrl;
  return group.facultyNewsUrl.replace('/news-all', '/announcement-all');
}

export function getDepartmentAnnouncementUrl(dept: AcademicDepartmentUnit): string {
  if (dept.announcementUrl) return dept.announcementUrl;
  return dept.newsUrl.replace('/news-all', '/announcement-all');
}

export const ACADEMIC_UNITS_WITH_DEPARTMENTS: DepartmentGroup[] = [
  {
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    shortName: 'İTBF',
    category: 'fakulte',
    facultyNewsUrl: 'https://itbf.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'turkdili',
        name: 'Türk Dili ve Edebiyatı Bölümü',
        slug: 'turkdili',
        facultyId: 'itbf',
        facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://turkdili.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://turkdili.kilis.edu.tr',
        description: 'Türk dili, halk edebiyatı, eski ve yeni Türk edebiyatı alanlarında eğitim ve araştırma.'
      },
      {
        id: 'tarih',
        name: 'Tarih Bölümü',
        slug: 'tarih',
        facultyId: 'itbf',
        facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://tarih.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://tarih.kilis.edu.tr',
        description: 'Eskiçağ, Ortaçağ, Yeniçağ, Yakınçağ ve Cumhuriyet tarihi araştırmaları.'
      },
      {
        id: 'cografya',
        name: 'Coğrafya Bölümü',
        slug: 'cografya',
        facultyId: 'itbf',
        facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://cografya.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://cografya.kilis.edu.tr',
        description: 'Fiziki ve beşeri coğrafya, Coğrafi Bilgi Sistemleri (CBS) ve bölgesel analizler.'
      },
      {
        id: 'felsefe',
        name: 'Felsefe Bölümü',
        slug: 'felsefe',
        facultyId: 'itbf',
        facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://felsefe.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://felsefe.kilis.edu.tr',
        description: 'Felsefe tarihi, mantık, ahlak felsefesi ve çağdaş felsefi tartışmalar.'
      },
      {
        id: 'sosyoloji',
        name: 'Sosyoloji Bölümü',
        slug: 'sosyoloji',
        facultyId: 'itbf',
        facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://sosyoloji.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sosyoloji.kilis.edu.tr',
        description: 'Toplumsal yapı, kurumlar, kent sosyolojisi ve toplumsal değişim çalışmaları.'
      },
      {
        id: 'psikoloji',
        name: 'Psikoloji Bölümü',
        slug: 'psikoloji',
        facultyId: 'itbf',
        facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://itbf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://itbf.kilis.edu.tr',
        description: 'Bilişsel, gelişimsel, klinik ve sosyal psikoloji alanlarında eğitim.'
      },
      {
        id: 'dogudilleri',
        name: 'Doğu Dilleri ve Edebiyatları Bölümü',
        slug: 'dogudilleri',
        facultyId: 'itbf',
        facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://itbf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://itbf.kilis.edu.tr',
        description: 'Arap ve Doğu dilleri, filoloji ve edebiyat araştırmaları.'
      }
    ]
  },
  {
    facultyId: 'fen',
    facultyName: 'Fen Fakültesi',
    shortName: 'Fen Fakültesi',
    category: 'fakulte',
    facultyNewsUrl: 'https://fen.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'matematik',
        name: 'Matematik Bölümü',
        slug: 'matematik',
        facultyId: 'fen',
        facultyName: 'Fen Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://matematik.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://matematik.kilis.edu.tr',
        description: 'Analiz, cebir, geometri, topoloji ve uygulamalı matematik çalışmaları.'
      },
      {
        id: 'kimya',
        name: 'Kimya Bölümü',
        slug: 'kimya',
        facultyId: 'fen',
        facultyName: 'Fen Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://kimya.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://kimya.kilis.edu.tr',
        description: 'Organik, inorganik, analitik kimya ve fizikokimya araştırmaları.'
      },
      {
        id: 'fizik',
        name: 'Fizik Bölümü',
        slug: 'fizik',
        facultyId: 'fen',
        facultyName: 'Fen Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://fen.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://fen.kilis.edu.tr',
        description: 'Katıhal fiziği, nükleer fizik, atom ve molekül fiziği.'
      },
      {
        id: 'biyoloji',
        name: 'Moleküler Biyoloji ve Genetik Bölümü',
        slug: 'biyoloji',
        facultyId: 'fen',
        facultyName: 'Fen Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://fen.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://fen.kilis.edu.tr',
        description: 'Biyoteknoloji, genetik mühendisliği ve hücresel biyoloji çalışmaları.'
      }
    ]
  },
  {
    facultyId: 'iibf',
    facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
    shortName: 'İİBF',
    category: 'fakulte',
    facultyNewsUrl: 'https://iibf.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'isletme',
        name: 'İşletme Bölümü',
        slug: 'isletme',
        facultyId: 'iibf',
        facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://isletme.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://isletme.kilis.edu.tr',
        description: 'Pazarlama, finans, yönetim organizasyon ve muhasebe bilimleri.'
      },
      {
        id: 'iktisat',
        name: 'İktisat Bölümü',
        slug: 'iktisat',
        facultyId: 'iibf',
        facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://iktisat.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://iktisat.kilis.edu.tr',
        description: 'Mikro ve makro iktisat, ekonomik büyüme, para ve maliye politikaları.'
      },
      {
        id: 'kamu',
        name: 'Siyaset Bilimi ve Kamu Yönetimi',
        slug: 'kamu',
        facultyId: 'iibf',
        facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://iibf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://iibf.kilis.edu.tr',
        description: 'Siyaset bilimi, yönetim bilimleri, hukuk ve kentleşme politikaları.'
      },
      {
        id: 'utl',
        name: 'Uluslararası Ticaret ve Lojistik',
        slug: 'utl',
        facultyId: 'iibf',
        facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://iibf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://iibf.kilis.edu.tr',
        description: 'Dış ticaret, tedarik zinciri ve küresel lojistik yönetimi.'
      }
    ]
  },
  {
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    shortName: 'Mühendislik-Mimarlık',
    category: 'fakulte',
    facultyNewsUrl: 'https://mmf.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'eem',
        name: 'Elektrik Elektronik Mühendisliği',
        slug: 'eem',
        facultyId: 'mmf',
        facultyName: 'Mühendislik - Mimarlık Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://eem.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://eem.kilis.edu.tr',
        description: 'Güç sistemleri, haberleşme, elektronik devreler ve kontrol otomasyon.'
      },
      {
        id: 'insaat',
        name: 'İnşaat Mühendisliği',
        slug: 'insaat',
        facultyId: 'mmf',
        facultyName: 'Mühendislik - Mimarlık Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://insaat.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://insaat.kilis.edu.tr',
        description: 'Yapı, geoteknik, hidrolik ve ulaştırma mühendisliği.'
      },
      {
        id: 'makine',
        name: 'Makine Mühendisliği',
        slug: 'makine',
        facultyId: 'mmf',
        facultyName: 'Mühendislik - Mimarlık Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://mmf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://mmf.kilis.edu.tr',
        description: 'Termodinamik, mekanik, konstrüksiyon ve imalat teknolojileri.'
      },
      {
        id: 'mimarlik',
        name: 'Mimarlık Bölümü',
        slug: 'mimarlik',
        facultyId: 'mmf',
        facultyName: 'Mühendislik - Mimarlık Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://mmf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://mmf.kilis.edu.tr',
        description: 'Bina bilgisi, restorasyon, kentsel tasarım ve yapı fiziği.'
      },
      {
        id: 'bilgisayar',
        name: 'Bilgisayar Mühendisliği',
        slug: 'bilgisayar',
        facultyId: 'mmf',
        facultyName: 'Mühendislik - Mimarlık Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://mmf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://mmf.kilis.edu.tr',
        description: 'Yazılım mühendisliği, yapay zeka, veri yapıları ve bilgisayar ağları.'
      }
    ]
  },
  {
    facultyId: 'sbf',
    facultyName: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
    shortName: 'Sağlık Bilimleri',
    category: 'fakulte',
    facultyNewsUrl: 'https://sbf.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'hemsirelik',
        name: 'Hemşirelik Bölümü',
        slug: 'hemsirelik',
        facultyId: 'sbf',
        facultyName: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://hemsirelik.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://hemsirelik.kilis.edu.tr',
        description: 'Klinik hemşirelik, halk sağlığı ve hasta bakım yönetimi.'
      },
      {
        id: 'saglikyonetimi',
        name: 'Sağlık Yönetimi Bölümü',
        slug: 'saglikyonetimi',
        facultyId: 'sbf',
        facultyName: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://sbf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sbf.kilis.edu.tr',
        description: 'Sağlık kurumları işletmeciliği ve sağlık politikaları planlaması.'
      },
      {
        id: 'beslenme',
        name: 'Beslenme ve Diyetetik Bölümü',
        slug: 'beslenme',
        facultyId: 'sbf',
        facultyName: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://sbf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sbf.kilis.edu.tr',
        description: 'Toplum beslenmesi, klinik diyetetik ve besin kimyası.'
      }
    ]
  },
  {
    facultyId: 'egitim',
    facultyName: 'Kilisli Muallim Rıfat Eğitim Fakültesi',
    shortName: 'Eğitim Fakültesi',
    category: 'fakulte',
    facultyNewsUrl: 'https://egitim.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'temelegitim',
        name: 'Temel Eğitim (Sınıf & Okul Öncesi)',
        slug: 'temelegitim',
        facultyId: 'egitim',
        facultyName: 'Kilisli Muallim Rıfat Eğitim Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://egitim.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://egitim.kilis.edu.tr',
        description: 'İlköğretim sınıf öğretmenliği ve okul öncesi eğitimi programları.'
      },
      {
        id: 'turkcesosyal',
        name: 'Türkçe ve Sosyal Bilgiler Eğitimi',
        slug: 'turkcesosyal',
        facultyId: 'egitim',
        facultyName: 'Kilisli Muallim Rıfat Eğitim Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://egitim.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://egitim.kilis.edu.tr',
        description: 'Ortaokul kademesi Türkçe ve Sosyal Bilgiler öğretmenliği yetiştirme.'
      },
      {
        id: 'matematikfen',
        name: 'Matematik ve Fen Bilimleri Eğitimi',
        slug: 'matematikfen',
        facultyId: 'egitim',
        facultyName: 'Kilisli Muallim Rıfat Eğitim Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://egitim.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://egitim.kilis.edu.tr',
        description: 'İlköğretim matematik ve fen bilgisi öğretmenliği öğretim süreçleri.'
      },
      {
        id: 'egitimbilimleri',
        name: 'Eğitim Bilimleri & PDR',
        slug: 'egitimbilimleri',
        facultyId: 'egitim',
        facultyName: 'Kilisli Muallim Rıfat Eğitim Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://egitim.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://egitim.kilis.edu.tr',
        description: 'Rehberlik ve psikolojik danışmanlık ile eğitim programları araştırmaları.'
      }
    ]
  },
  {
    facultyId: 'ilahiyat',
    facultyName: 'İlahiyat Fakültesi',
    shortName: 'İlahiyat',
    category: 'fakulte',
    facultyNewsUrl: 'https://ilahiyat.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'temelislam',
        name: 'Temel İslam Bilimleri',
        slug: 'temelislam',
        facultyId: 'ilahiyat',
        facultyName: 'İlahiyat Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://ilahiyat.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://ilahiyat.kilis.edu.tr',
        description: 'Tefsir, Hadis, İslam Hukuku, Kelam, Tasavvuf ve Arap Dili alanları.'
      },
      {
        id: 'felsefedin',
        name: 'Felsefe ve Din Bilimleri',
        slug: 'felsefedin',
        facultyId: 'ilahiyat',
        facultyName: 'İlahiyat Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://ilahiyat.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://ilahiyat.kilis.edu.tr',
        description: 'Din felsefesi, din sosyolojisi, din eğitimi ve dinler tarihi.'
      },
      {
        id: 'islamtarihi',
        name: 'İslam Tarihi ve Sanatları',
        slug: 'islamtarihi',
        facultyId: 'ilahiyat',
        facultyName: 'İlahiyat Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://ilahiyat.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://ilahiyat.kilis.edu.tr',
        description: 'İslam tarihi, Türk-İslam edebiyatı ve Türk-İslam sanatları tarihi.'
      }
    ]
  },
  {
    facultyId: 'ziraat',
    facultyName: 'Ziraat Fakültesi',
    shortName: 'Ziraat Fakültesi',
    category: 'fakulte',
    facultyNewsUrl: 'https://ziraat.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'bahcebitkileri',
        name: 'Bahçe Bitkileri Bölümü',
        slug: 'bahcebitkileri',
        facultyId: 'ziraat',
        facultyName: 'Ziraat Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://bahcebitkileri.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://bahcebitkileri.kilis.edu.tr',
        description: 'Meyve, sebze, bağ ve süs bitkileri yetiştiriciliği ve ıslahı.'
      },
      {
        id: 'bitkikoruma',
        name: 'Bitki Koruma & Tarla Bitkileri',
        slug: 'bitkikoruma',
        facultyId: 'ziraat',
        facultyName: 'Ziraat Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://ziraat.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://ziraat.kilis.edu.tr',
        description: 'Bitki hastalıkları, zararlılar ve tarımsal üretim optimizasyonu.'
      }
    ]
  },
  {
    facultyId: 'spor',
    facultyName: 'Spor Bilimleri Fakültesi',
    shortName: 'Spor Bilimleri',
    category: 'fakulte',
    facultyNewsUrl: 'https://sporbilimleri.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'antrenorluk',
        name: 'Antrenörlük Eğitimi Bölümü',
        slug: 'antrenorluk',
        facultyId: 'spor',
        facultyName: 'Spor Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://sporbilimleri.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sporbilimleri.kilis.edu.tr',
        description: 'Performans sporu, antrenman bilimi ve sporcu gelişimi.'
      },
      {
        id: 'bedenegitimi',
        name: 'Beden Eğitimi ve Spor Eğitimi',
        slug: 'bedenegitimi',
        facultyId: 'spor',
        facultyName: 'Spor Bilimleri Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://sporbilimleri.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sporbilimleri.kilis.edu.tr',
        description: 'Okul sporları, fiziksel aktivite pedagojisi ve hareket eğitimi.'
      }
    ]
  },
  {
    facultyId: 'ubf',
    facultyName: 'Uygulamalı Bilimler Fakültesi',
    shortName: 'Uygulamalı Bilimler',
    category: 'fakulte',
    facultyNewsUrl: 'https://ubf.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'sigortacilik',
        name: 'Sigortacılık ve Aktüerya',
        slug: 'sigortacilik',
        facultyId: 'ubf',
        facultyName: 'Uygulamalı Bilimler Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://ubf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://ubf.kilis.edu.tr',
        description: 'Risk analizi, sigorta hukuku ve aktüerya hesaplamaları.'
      },
      {
        id: 'gastronomi',
        name: 'Gastronomi ve Mutfak Sanatları',
        slug: 'gastronomi',
        facultyId: 'ubf',
        facultyName: 'Uygulamalı Bilimler Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://ubf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://ubf.kilis.edu.tr',
        description: 'Yöresel mutfak kültürü, modern gastronomi ve mutfak yönetimi.'
      }
    ]
  },
  {
    facultyId: 'iletisim',
    facultyName: 'İletişim Fakültesi',
    shortName: 'İletişim Fakültesi',
    category: 'fakulte',
    facultyNewsUrl: 'https://yenimedya.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'yenimedya',
        name: 'Yeni Medya ve İletişim',
        slug: 'yenimedya',
        facultyId: 'iletisim',
        facultyName: 'İletişim Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://yenimedya.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://yenimedya.kilis.edu.tr',
        description: 'Dijital yayıncılık, sosyal medya iletişimi ve multimedya içerik üretimi.'
      },
      {
        id: 'gazetecilik',
        name: 'Gazetecilik ve Halkla İlişkiler',
        slug: 'gazetecilik',
        facultyId: 'iletisim',
        facultyName: 'İletişim Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://iletisim.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://iletisim.kilis.edu.tr',
        description: 'Haber yazımı, kurumsal iletişim ve medya etiği.'
      }
    ]
  },
  {
    facultyId: 'gsf',
    facultyName: 'Güzel Sanatlar ve Tasarım Fakültesi',
    shortName: 'Güzel Sanatlar',
    category: 'fakulte',
    facultyNewsUrl: 'https://gstf.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'gelenekselturksanatlari',
        name: 'Geleneksel Türk Sanatları',
        slug: 'gelenekselturksanatlari',
        facultyId: 'gsf',
        facultyName: 'Güzel Sanatlar ve Tasarım Fakültesi',
        category: 'fakulte',
        newsUrl: 'https://gstf.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://gstf.kilis.edu.tr',
        description: 'Hat, tezhip, ebru, halı-kilim ve geleneksel Türk el sanatları.'
      }
    ]
  },
  {
    facultyId: 'lee',
    facultyName: 'Lisansüstü Eğitim Enstitüsü',
    shortName: 'Lisansüstü Enstitü',
    category: 'enstitu',
    facultyNewsUrl: 'https://enstitu.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'lisansustu-sosyal',
        name: 'Sosyal Bilimler Ana Bilim Dalları',
        slug: 'lisansustu-sosyal',
        facultyId: 'lee',
        facultyName: 'Lisansüstü Eğitim Enstitüsü',
        category: 'enstitu',
        newsUrl: 'https://enstitu.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://enstitu.kilis.edu.tr',
        description: 'Tezli/tezsiz yüksek lisans ve doktora programları.'
      },
      {
        id: 'lisansustu-fen',
        name: 'Fen ve Mühendislik Ana Bilim Dalları',
        slug: 'lisansustu-fen',
        facultyId: 'lee',
        facultyName: 'Lisansüstü Eğitim Enstitüsü',
        category: 'enstitu',
        newsUrl: 'https://enstitu.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://enstitu.kilis.edu.tr',
        description: 'İleri fen, teknoloji ve mühendislik araştırmaları.'
      }
    ]
  },
  {
    facultyId: 'tbmyo',
    facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
    shortName: 'Teknik Bilimler MYO',
    category: 'myo',
    facultyNewsUrl: 'https://tbmyo.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'bilgisayar-prog',
        name: 'Bilgisayar Teknolojileri Bölümü',
        slug: 'bilgisayar-prog',
        facultyId: 'tbmyo',
        facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://tbmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://tbmyo.kilis.edu.tr',
        description: 'Bilgisayar Programcılığı, Web Tasarımı ve Ağ Yönetimi önlisans eğitimi.'
      },
      {
        id: 'elektrik-enerji',
        name: 'Elektrik ve Enerji Bölümü',
        slug: 'elektrik-enerji',
        facultyId: 'tbmyo',
        facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://tbmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://tbmyo.kilis.edu.tr',
        description: 'Elektrik tesisatı, yenilenebilir enerji sistemleri ve otomasyon.'
      },
      {
        id: 'insaat-teknik',
        name: 'İnşaat Bölümü (Önlisans)',
        slug: 'insaat-teknik',
        facultyId: 'tbmyo',
        facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://tbmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://tbmyo.kilis.edu.tr',
        description: 'Şantiye yönetimi, yapı denetimi ve topoğrafya uygulamaları.'
      },
      {
        id: 'gida-isleme',
        name: 'Gıda İşleme Bölümü',
        slug: 'gida-isleme',
        facultyId: 'tbmyo',
        facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://tbmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://tbmyo.kilis.edu.tr',
        description: 'Gıda kalite kontrolü, zeytinyağı teknolojisi ve süt ürünleri işleme.'
      },
      {
        id: 'makine-metal',
        name: 'Makine ve Metal Teknolojileri',
        slug: 'makine-metal',
        facultyId: 'tbmyo',
        facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://tbmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://tbmyo.kilis.edu.tr',
        description: 'CNC teknolojisi, talaşlı imalat ve kaynak teknolojileri.'
      }
    ]
  },
  {
    facultyId: 'sbmyo',
    facultyName: 'Sosyal Bilimler Meslek Yüksekokulu',
    shortName: 'Sosyal Bilimler MYO',
    category: 'myo',
    facultyNewsUrl: 'https://sbmyo.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'dis-ticaret',
        name: 'Dış Ticaret Bölümü',
        slug: 'dis-ticaret',
        facultyId: 'sbmyo',
        facultyName: 'Sosyal Bilimler Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://sbmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sbmyo.kilis.edu.tr',
        description: 'Gümrük mevzuatı, uluslararası kambiyo ve ihracat-ithalat operasyonları.'
      },
      {
        id: 'muhasebe-vergi',
        name: 'Muhasebe ve Vergi Bölümü',
        slug: 'muhasebe-vergi',
        facultyId: 'sbmyo',
        facultyName: 'Sosyal Bilimler Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://sbmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sbmyo.kilis.edu.tr',
        description: 'Ticari defter tutma, vergi hukuku ve mali müşavirlik ön hazırlığı.'
      },
      {
        id: 'yonetim-org',
        name: 'Yönetim ve Organizasyon',
        slug: 'yonetim-org',
        facultyId: 'sbmyo',
        facultyName: 'Sosyal Bilimler Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://sbmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sbmyo.kilis.edu.tr',
        description: 'İşletme yönetimi, insan kaynakları ve büro hizmetleri.'
      },
      {
        id: 'hukuk-adalet',
        name: 'Hukuk Bölümü (Adalet)',
        slug: 'hukuk-adalet',
        facultyId: 'sbmyo',
        facultyName: 'Sosyal Bilimler Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://sbmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sbmyo.kilis.edu.tr',
        description: 'Adliye yazı işleri, infaz hukuku ve zabıt katipliği formasyonu.'
      }
    ]
  },
  {
    facultyId: 'shmyo',
    facultyName: 'Sağlık Hizmetleri Meslek Yüksekokulu',
    shortName: 'Sağlık Hizmetleri MYO',
    category: 'myo',
    facultyNewsUrl: 'https://shmyo.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'tibbi-hizmetler',
        name: 'Tıbbi Hizmetler ve Teknikler',
        slug: 'tibbi-hizmetler',
        facultyId: 'shmyo',
        facultyName: 'Sağlık Hizmetleri Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://shmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://shmyo.kilis.edu.tr',
        description: 'Tıbbi Dokümantasyon ve Sekreterlik, Optisyenlik, İlk ve Acil Yardım.'
      },
      {
        id: 'saglik-bakim',
        name: 'Sağlık Bakım Hizmetleri (Yaşlı Bakımı)',
        slug: 'saglik-bakim',
        facultyId: 'shmyo',
        facultyName: 'Sağlık Hizmetleri Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://shmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://shmyo.kilis.edu.tr',
        description: 'Geriatri bakımı, rehabilitasyon desteği ve hasta bakımı ilkeleri.'
      },
      {
        id: 'cocuk-bakimi',
        name: 'Çocuk Bakımı ve Gençlik Hizmetleri',
        slug: 'cocuk-bakimi',
        facultyId: 'shmyo',
        facultyName: 'Sağlık Hizmetleri Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://shmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://shmyo.kilis.edu.tr',
        description: 'Çocuk Gelişimi programı ve özel eğitim destek hizmetleri.'
      },
      {
        id: 'eczane-hizmetleri',
        name: 'Eczane Hizmetleri Bölümü',
        slug: 'eczane-hizmetleri',
        facultyId: 'shmyo',
        facultyName: 'Sağlık Hizmetleri Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://shmyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://shmyo.kilis.edu.tr',
        description: 'İlaç hazırlama teknolojisi, farmakoloji temelleri ve eczacılık teknikleri.'
      }
    ]
  },
  {
    facultyId: 'konservatuvar',
    facultyName: 'Alaeddin Yavaşca Devlet Konservatuvarı',
    shortName: 'Devlet Konservatuvarı',
    category: 'konservatuvar',
    facultyNewsUrl: 'https://konservatuvar.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'turk-muzigi',
        name: 'Türk Müziği Bölümü',
        slug: 'turk-muzigi',
        facultyId: 'konservatuvar',
        facultyName: 'Alaeddin Yavaşca Devlet Konservatuvarı',
        category: 'konservatuvar',
        newsUrl: 'https://konservatuvar.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://konservatuvar.kilis.edu.tr',
        description: 'Geleneksel Türk Sanat Müziği, Türk Halk Müziği icrası ve solfej eğitimi.'
      }
    ]
  },
  {
    facultyId: 'yadyo',
    facultyName: 'Yabancı Diller Yüksekokulu',
    shortName: 'Yabancı Diller YO',
    category: 'yuksekokul',
    facultyNewsUrl: 'https://yadyo.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'yabanci-diller-hazirlik',
        name: 'Yabancı Diller Hazırlık & Bölüm',
        slug: 'yabanci-diller-hazirlik',
        facultyId: 'yadyo',
        facultyName: 'Yabancı Diller Yüksekokulu',
        category: 'yuksekokul',
        newsUrl: 'https://yadyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://yadyo.kilis.edu.tr',
        description: 'İngilizce ve Arapça zorunlu/isteğe bağlı hazırlık eğitimi.'
      }
    ]
  },
  {
    facultyId: 'koordinatorluk',
    facultyName: 'Merkezler & Daire Başkanlıkları',
    shortName: 'Daireler & Merkezler',
    category: 'koordinatorluk',
    facultyNewsUrl: 'https://sks.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'sks-haber',
        name: 'Sağlık, Kültür ve Spor Daire Başkanlığı',
        slug: 'sks-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Merkezler & Daire Başkanlıkları',
        category: 'koordinatorluk',
        newsUrl: 'https://sks.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sks.kilis.edu.tr',
        description: 'Öğrenci toplulukları, spor tesisleri, yemekhane ve burs hizmetleri haberleri.'
      },
      {
        id: 'kutuphane-haber',
        name: 'Kütüphane ve Dokümantasyon Daire Başkanlığı',
        slug: 'kutuphane-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Merkezler & Daire Başkanlıkları',
        category: 'koordinatorluk',
        newsUrl: 'https://kutuphane.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://kutuphane.kilis.edu.tr',
        description: 'Veritabanı eğitimleri, yeni basılı/elektronik kaynak duyuruları ve kütüphane etkinlikleri.'
      },
      {
        id: 'karyam-haber',
        name: 'Kariyer Planlama Merkezi (KARYAM)',
        slug: 'karyam-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Merkezler & Daire Başkanlıkları',
        category: 'koordinatorluk',
        newsUrl: 'https://karyam.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://karyam.kilis.edu.tr',
        description: 'Staj olanakları, kariyer fuarları, mezun buluşmaları ve mülakat atölyeleri.'
      },
      {
        id: 'erasmus-haber',
        name: 'Uluslararası İlişkiler & Erasmus Ofisi',
        slug: 'erasmus-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Merkezler & Daire Başkanlıkları',
        category: 'koordinatorluk',
        newsUrl: 'https://uluslararasi.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://uluslararasi.kilis.edu.tr',
        description: 'Yurtdışı öğrenci öğrenim/staj hareketliliği ve ikili akademik protokoller.'
      },
      {
        id: 'uzem-haber',
        name: 'Uzaktan Eğitim Uygulama ve Araştırma Merkezi (UZEM)',
        slug: 'uzem-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Merkezler & Daire Başkanlıkları',
        category: 'koordinatorluk',
        newsUrl: 'https://uzem.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://uzem.kilis.edu.tr',
        description: 'Ortak zorunlu dersler, uzaktan sınav yönergeleri ve e-öğrenme portali.'
      }
    ]
  }
];

// Rich fallback news for department pages to guarantee instant offline experience & fast initial hydration
export const FALLBACK_DEPARTMENT_NEWS: DepartmentNewsItem[] = [
  // İnsan ve Toplum Bilimleri Fakültesi - Genel Haberler
  {
    id: 'dept-itbf-genel-1',
    title: 'İnsan ve Toplum Bilimleri Fakültesi 2026-2027 Akademik Yılı Açılış Dersi Gerçekleştirildi',
    date: '05 Ekim 2026',
    content: 'Fakültemiz konferans salonunda dekanlık ve tüm bölümlerimizin katılımıyla yeni akademik yıl açılış dersi coşkuyla tamamlandı.',
    url: 'https://itbf.kilis.edu.tr/tr/news-detail/1570',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'İTBF Fakülte Genel Haberleri',
    sourceUrl: 'https://itbf.kilis.edu.tr/tr/news-all'
  },
  {
    id: 'dept-itbf-genel-2',
    title: 'İTBF Öğretim Üyeleri ve Öğrencilerinden Bölge Kültürel Miras Çalıştayı',
    date: '25 Eylül 2026',
    content: 'Tarih, Coğrafya ve Türk Dili bölümlerimizin ortak organizasyonuyla Güneydoğu kültürel miras araştırmaları çalıştayı düzenlendi.',
    url: 'https://itbf.kilis.edu.tr/tr/news-detail/1535',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'İTBF Fakülte Genel Haberleri',
    sourceUrl: 'https://itbf.kilis.edu.tr/tr/news-all'
  },
  // Türk Dili ve Edebiyatı Bölümü
  {
    id: 'dept-turkdili-1',
    title: 'Türk Dili ve Edebiyatı Bölümü Yönetiminden Kilis 1. Kitap Fuarı’na Ziyaret',
    date: '06 Ekim 2026',
    content: 'Bölüm Başkanlığımız ve öğretim üyelerimiz Kilis 1. Kitap Fuarı kapsamında yayınevlerinin stantlarını ziyaret ederek edebiyat ve kültür etkinliklerine katılım sağladı.',
    url: 'https://turkdili.kilis.edu.tr/tr/news-detail/1579',
    imageUrl: 'https://turkdili.kilis.edu.tr/images/news/85605995141791287674.WhatsApp%20Image%202026-10-06%20at%2014.46.08.jpeg',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'turkdili',
    departmentName: 'Türk Dili ve Edebiyatı Bölümü',
    category: 'Türk Dili ve Edebiyatı Bölümü Haberleri',
    sourceUrl: 'https://turkdili.kilis.edu.tr/tr/news-all'
  },
  {
    id: 'dept-turkdili-2',
    title: 'Türk Dili ve Edebiyatı Bölümü 1. Sınıf Öğrencileriyle Öğrenci Danışmanlığı Dönem Başı Toplantısı Gerçekleştirildi',
    date: '03 Ekim 2026',
    content: '2026-2027 Eğitim-Öğretim yılı Güz dönemi başında bölüme yeni başlayan 1. sınıf öğrencileriyle oryantasyon ve danışmanlık toplantısı başarıyla tamamlandı.',
    url: 'https://turkdili.kilis.edu.tr/tr/news-detail/1540',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'turkdili',
    departmentName: 'Türk Dili ve Edebiyatı Bölümü',
    category: 'Türk Dili ve Edebiyatı Bölümü Haberleri',
    sourceUrl: 'https://turkdili.kilis.edu.tr/tr/news-all'
  },
  {
    id: 'dept-turkdili-3',
    title: 'Bölümümüz öğretim üyelerinden Dr. Öğr. Üyesi Zehra Ergeç, TRT Radyo 1’de yayımlanan “Günaydın Türkiye” Programına Konuk Oldu',
    date: '08 Eylül 2026',
    content: 'Dr. Öğr. Üyesi Zehra Ergeç, Türk edebiyatı ve bölge kültürü üzerine değerlendirmelerde bulunarak üniversitemizi TRT ekran ve radyolarında temsil etti.',
    url: 'https://turkdili.kilis.edu.tr/tr/news-detail/1292',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'turkdili',
    departmentName: 'Türk Dili ve Edebiyatı Bölümü',
    category: 'Türk Dili ve Edebiyatı Bölümü Haberleri',
    sourceUrl: 'https://turkdili.kilis.edu.tr/tr/news-all'
  },

  // Tarih Bölümü
  {
    id: 'dept-tarih-1',
    title: 'Tarih Bölümü Akademik Kurulu ve Güz Dönemi Koordinasyon Toplantısı Yapıldı',
    date: '15 Eylül 2026',
    content: 'Bölüm Başkanı ve öğretim elemanlarının katılımıyla 2026-2027 eğitim dönemi lisans ve lisansüstü ders programları karara bağlandı.',
    url: 'https://tarih.kilis.edu.tr/tr/news-detail/1332',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'tarih',
    departmentName: 'Tarih Bölümü',
    category: 'Tarih Bölümü Haberleri',
    sourceUrl: 'https://tarih.kilis.edu.tr/tr/news-all'
  },
  {
    id: 'dept-tarih-2',
    title: 'III. Uluslararası Mercidabık Kongresinde Tarih Oturumuna Bölümümüzden Yoğun Katılım',
    date: '18 Mayıs 2026',
    content: 'Bölümümüz öğretim üyeleri Osmanlı, Memlük ve Ortadoğu tarihi üzerine hazırladıkları bildirileri uluslararası kongrede sundular.',
    url: 'https://tarih.kilis.edu.tr/tr/news-detail/863',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'tarih',
    departmentName: 'Tarih Bölümü',
    category: 'Tarih Bölümü Haberleri',
    sourceUrl: 'https://tarih.kilis.edu.tr/tr/news-all'
  },

  // Coğrafya Bölümü
  {
    id: 'dept-cografya-1',
    title: 'Coğrafya Bölümü Öğrencileriyle Kilis ve Çevresinde Arazi Tatbikatı Gerçekleştirildi',
    date: '28 Eylül 2026',
    content: 'Fiziki ve beşeri coğrafya unsurlarını yerinde incelemek amacıyla Kilis ve Gaziantep havzalarında arazi çalışması yürütüldü.',
    url: 'https://cografya.kilis.edu.tr/tr/news-detail/1420',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'cografya',
    departmentName: 'Coğrafya Bölümü',
    category: 'Coğrafya Bölümü Haberleri',
    sourceUrl: 'https://cografya.kilis.edu.tr/tr/news-all'
  },

  // Felsefe Bölümü
  {
    id: 'dept-felsefe-1',
    title: 'Felsefe Bölümü Tarafından "Düşünce Dünyamız ve Çağdaş Sorunlar" Paneli Düzenlendi',
    date: '22 Eylül 2026',
    content: 'Felsefe Bölümü öğretim elemanları ve öğrencilerin katılımıyla eleştirel düşünme ve etik ilkeler konulu panel gerçekleştirildi.',
    url: 'https://felsefe.kilis.edu.tr/tr/news-detail/1395',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'felsefe',
    departmentName: 'Felsefe Bölümü',
    category: 'Felsefe Bölümü Haberleri',
    sourceUrl: 'https://felsefe.kilis.edu.tr/tr/news-all'
  },

  // Bilgisayar / Elektrik-Elektronik Mühendisliği
  {
    id: 'dept-eem-1',
    title: 'Elektrik-Elektronik Mühendisliği Bölümü Laboratuvar Altyapısı Yenilendi',
    date: '30 Eylül 2026',
    content: 'Bölüm bünyesindeki mikrodenetleyici, gömülü sistemler ve güç elektroniği laboratuvarları yeni teknolojik ekipmanlarla donatıldı.',
    url: 'https://eem.kilis.edu.tr/tr/news-detail/1490',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'eem',
    departmentName: 'Elektrik Elektronik Mühendisliği',
    category: 'Elektrik-Elektronik Mühendisliği Haberleri',
    sourceUrl: 'https://eem.kilis.edu.tr/tr/news-all'
  },
  {
    id: 'dept-insaat-1',
    title: 'İnşaat Mühendisliği Bölümü Öğrencilerinden Deprem Dayanımlı Yapı Tasarımı Semineri',
    date: '24 Eylül 2026',
    content: 'Bölümümüz öğretim üyeleri eşliğinde modern sismik izolasyon teknikleri ve betonarme yapı dayanımı konulu seminer tamamlandı.',
    url: 'https://insaat.kilis.edu.tr/tr/news-detail/1410',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'insaat',
    departmentName: 'İnşaat Mühendisliği',
    category: 'İnşaat Mühendisliği Haberleri',
    sourceUrl: 'https://insaat.kilis.edu.tr/tr/news-all'
  },

  // Hemşirelik Bölümü
  {
    id: 'dept-hemsirelik-1',
    title: 'Hemşirelik Bölümü Öğrencileri Klinik Uygulama Öncesi Beyaz Önlük Giyme Töreni Yaptı',
    date: '02 Ekim 2026',
    content: 'Kilis Devlet Hastanesi ve üniversite sağlık birimlerinde staja başlayacak öğrencilerimiz için mesleki ant ve önlük giyme merasimi düzenlendi.',
    url: 'https://hemsirelik.kilis.edu.tr/tr/news-detail/1531',
    facultyId: 'sbf',
    facultyName: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
    departmentId: 'hemsirelik',
    departmentName: 'Hemşirelik Bölümü',
    category: 'Hemşirelik Bölümü Haberleri',
    sourceUrl: 'https://hemsirelik.kilis.edu.tr/tr/news-all'
  },

  // İşletme & İktisat
  {
    id: 'dept-isletme-1',
    title: 'İşletme Bölümü Öğrencileri Bölgesel Girişimcilik Zirvesine Katıldı',
    date: '27 Eylül 2026',
    content: 'İpekyolu Kalkınma Ajansı ve KOSGEB destekli girişimcilik programında öğrencilerimiz iş fikri projelerini jüriye sundu.',
    url: 'https://isletme.kilis.edu.tr/tr/news-detail/1435',
    facultyId: 'iibf',
    facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
    departmentId: 'isletme',
    departmentName: 'İşletme Bölümü',
    category: 'İşletme Bölümü Haberleri',
    sourceUrl: 'https://isletme.kilis.edu.tr/tr/news-all'
  },
  {
    id: 'dept-iktisat-1',
    title: 'İktisat Bölümü Tarafından "Küresel Ticarette Güncel Trendler" Konferansı Verildi',
    date: '20 Eylül 2026',
    content: 'Dış ticaret dengeleri, enflasyon dinamikleri ve yeşil ekonomi dönüşümü üzerine akademik değerlendirme toplantısı yapıldı.',
    url: 'https://iktisat.kilis.edu.tr/tr/news-detail/1380',
    facultyId: 'iibf',
    facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
    departmentId: 'iktisat',
    departmentName: 'İktisat Bölümü',
    category: 'İktisat Bölümü Haberleri',
    sourceUrl: 'https://iktisat.kilis.edu.tr/tr/news-all'
  },

  // Matematik & Kimya
  {
    id: 'dept-matematik-1',
    title: 'Matematik Bölümü Seminer Serisi: Diferansiyel Denklemler ve Uygulamaları',
    date: '29 Eylül 2026',
    content: 'Bölümümüz öğretim üyeleri ve lisansüstü öğrencileri uygulamalı matematik modelleme çalışmalarını paylaştı.',
    url: 'https://matematik.kilis.edu.tr/tr/news-detail/1470',
    facultyId: 'fen',
    facultyName: 'Fen Fakültesi',
    departmentId: 'matematik',
    departmentName: 'Matematik Bölümü',
    category: 'Matematik Bölümü Haberleri',
    sourceUrl: 'https://matematik.kilis.edu.tr/tr/news-all'
  },
  {
    id: 'dept-kimya-1',
    title: 'Kimya Bölümü Araştırma Grubu TÜBİTAK 1001 Proje Desteği Kazandı',
    date: '25 Eylül 2026',
    content: 'Bölümümüz araştırmacılarının nanoteknoloji ve çevre dostu polimer sentezi projesi destek almaya hak kazandı.',
    url: 'https://kimya.kilis.edu.tr/tr/news-detail/1428',
    facultyId: 'fen',
    facultyName: 'Fen Fakültesi',
    departmentId: 'kimya',
    departmentName: 'Kimya Bölümü',
    category: 'Kimya Bölümü Haberleri',
    sourceUrl: 'https://kimya.kilis.edu.tr/tr/news-all'
  },

  // Bahçe Bitkileri (Ziraat)
  {
    id: 'dept-bahce-1',
    title: 'Bahçe Bitkileri Bölümü Deneme Parsellerinde Kilis Yağlık Zeytin Hasadı Başladı',
    date: '04 Ekim 2026',
    content: 'Üniversitemiz Ziraat Fakültesi araştırma arazisinde tescilli Kilis yağlık zeytin çeşitlerinde verim ve kalite analizleri yapılıyor.',
    url: 'https://bahcebitkileri.kilis.edu.tr/tr/news-detail/1560',
    facultyId: 'ziraat',
    facultyName: 'Ziraat Fakültesi',
    departmentId: 'bahcebitkileri',
    departmentName: 'Bahçe Bitkileri Bölümü',
    category: 'Bahçe Bitkileri Bölümü Haberleri',
    sourceUrl: 'https://bahcebitkileri.kilis.edu.tr/tr/news-all'
  },

  // Yeni Medya ve İletişim
  {
    id: 'dept-yenimedya-1',
    title: 'Yeni Medya ve İletişim Bölümü Stüdyolarında Dijital İçerik Atölyeleri Başladı',
    date: '01 Ekim 2026',
    content: 'Podcast, video kurgu, sosyal medya haberciliği ve grafik tasarım atölyeleri yeni dönem öğrencileriyle buluştu.',
    url: 'https://yenimedya.kilis.edu.tr/tr/news-detail/1515',
    facultyId: 'iletisim',
    facultyName: 'İletişim Fakültesi',
    departmentId: 'yenimedya',
    departmentName: 'Yeni Medya ve İletişim',
    category: 'Yeni Medya ve İletişim Haberleri',
    sourceUrl: 'https://yenimedya.kilis.edu.tr/tr/news-all'
  },

  // Teknik Bilimler MYO - Bilgisayar Programcılığı
  {
    id: 'dept-tbmyo-1',
    title: 'Teknik Bilimler MYO Bilgisayar Teknolojileri Bölümü Yazılım Geliştirme Hackathonu Düzenliyor',
    date: '05 Ekim 2026',
    content: 'Öğrencilerin web, mobil ve veritabanı projelerini sergileyeceği mini hackathon etkinliği için başvurular açıldı.',
    url: 'https://tbmyo.kilis.edu.tr/tr/news-detail/1572',
    facultyId: 'tbmyo',
    facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
    departmentId: 'bilgisayar-prog',
    departmentName: 'Bilgisayar Teknolojileri Bölümü',
    category: 'Teknik Bilimler MYO Haberleri',
    sourceUrl: 'https://tbmyo.kilis.edu.tr/tr/news-all'
  },

  // Sosyal Bilimler MYO - Dış Ticaret
  {
    id: 'dept-sbmyo-1',
    title: 'Sosyal Bilimler MYO Dış Ticaret Bölümü Öğrencileri Öncüpınar Gümrük Sahasını İnceledi',
    date: '26 Eylül 2026',
    content: 'Gümrük muhafaza, transit ticaret ve lojistik antrepo süreçleri saha gezisinde yetkililerce öğrencilere aktarıldı.',
    url: 'https://sbmyo.kilis.edu.tr/tr/news-detail/1442',
    facultyId: 'sbmyo',
    facultyName: 'Sosyal Bilimler Meslek Yüksekokulu',
    departmentId: 'dis-ticaret',
    departmentName: 'Dış Ticaret Bölümü',
    category: 'Sosyal Bilimler MYO Haberleri',
    sourceUrl: 'https://sbmyo.kilis.edu.tr/tr/news-all'
  },

  // Sağlık Hizmetleri MYO
  {
    id: 'dept-shmyo-1',
    title: 'Sağlık Hizmetleri MYO Tıbbi Hizmetler Bölümü İlk Yardım ve Acil Müdahale Eğitimi Tamamlandı',
    date: '29 Eylül 2026',
    content: 'İlk ve Acil Yardım programı öğrencilerine simülasyon mankenleri eşliğinde ileri yaşam desteği eğitimi verildi.',
    url: 'https://shmyo.kilis.edu.tr/tr/news-detail/1485',
    facultyId: 'shmyo',
    facultyName: 'Sağlık Hizmetleri Meslek Yüksekokulu',
    departmentId: 'tibbi-hizmetler',
    departmentName: 'Tıbbi Hizmetler ve Teknikler',
    category: 'Sağlık Hizmetleri MYO Haberleri',
    sourceUrl: 'https://shmyo.kilis.edu.tr/tr/news-all'
  },

  // Alaeddin Yavaşca Devlet Konservatuvarı
  {
    id: 'dept-konservatuvar-1',
    title: 'Devlet Konservatuvarı Türk Müziği Bölümünden Yeni Dönem Açılış Konseri',
    date: '02 Ekim 2026',
    content: 'Prof. Dr. Alaeddin Yavaşca anısına düzenlenen klasik Türk müziği icra dinletisi üniversite konferans salonunda icra edildi.',
    url: 'https://konservatuvar.kilis.edu.tr/tr/news-detail/1528',
    facultyId: 'konservatuvar',
    facultyName: 'Alaeddin Yavaşca Devlet Konservatuvarı',
    departmentId: 'turk-muzigi',
    departmentName: 'Türk Müziği Bölümü',
    category: 'Devlet Konservatuvarı Haberleri',
    sourceUrl: 'https://konservatuvar.kilis.edu.tr/tr/news-all'
  },

  // Lisansüstü Eğitim Enstitüsü
  {
    id: 'dept-lee-1',
    title: 'Lisansüstü Eğitim Enstitüsü 2026-2027 Güz Dönemi Tez Savunma ve Seminer Takvimi Yayımlandı',
    date: '28 Eylül 2026',
    content: 'Yüksek lisans ve doktora öğrencilerimizin tez teslim, jüri belirleme ve savunma sınavı süreçleri ilan edildi.',
    url: 'https://enstitu.kilis.edu.tr/tr/news-detail/1465',
    facultyId: 'lee',
    facultyName: 'Lisansüstü Eğitim Enstitüsü',
    departmentId: 'lisansustu-sosyal',
    departmentName: 'Sosyal Bilimler Ana Bilim Dalları',
    category: 'Lisansüstü Eğitim Enstitüsü Haberleri',
    sourceUrl: 'https://enstitu.kilis.edu.tr/tr/news-all'
  }
];

// Rich fallback announcements for faculty and department pages
export const FALLBACK_DEPARTMENT_ANNOUNCEMENTS: DepartmentAnnouncementItem[] = [
  // =================== İNSAN VE TOPLUM BİLİMLERİ FAKÜLTESİ (İTBF) ===================
  // Fakülte Genel Duyuruları (Bölüm seçilmediğinde doğrudan görünen fakülte duyuruları)
  {
    id: 'dept-ann-itbf-genel-1',
    title: 'İTBF 2026-2027 Güz Yarıyılı Ara Sınav (Vize) Takvimi ve Sınav Salonları',
    date: '08 Ekim 2026',
    content: 'Fakültemiz tüm bölümlerinin 2026-2027 Güz dönemi ara sınav programı ve gözetmenlik dağılımları ilan edilmiştir. Sınavlara kimlik belgesi ile girilmesi zorunludur.',
    url: 'https://itbf.kilis.edu.tr/tr/announcement-detail/201',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'İTBF Fakülte Genel Duyurusu',
    sourceUrl: 'https://itbf.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-itbf-genel-2',
    title: 'İTBF Dekanlığı Öğrenci Temsilciliği ve Bölüm Temsilcisi Seçim Takvimi',
    date: '05 Ekim 2026',
    content: '2026-2027 Eğitim-Öğretim yılı Fakülte Öğrenci Temsilcisi adaylık başvuruları Dekanlık Yazı İşleri birimine şahsen yapılacaktır.',
    url: 'https://itbf.kilis.edu.tr/tr/announcement-detail/198',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'İTBF Fakülte Genel Duyurusu',
    sourceUrl: 'https://itbf.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-itbf-genel-3',
    title: 'İTBF Çift Anadal (ÇAP) ve Yandal Programı Kabul Listesi Açıklandı',
    date: '28 Eylül 2026',
    content: 'Fakülte Yönetim Kurulu kararıyla 2026 Güz yarıyılında ÇAP ve Yandal yapmaya hak kazanan öğrencilerin kesin kayıt işlemleri başlamıştır.',
    url: 'https://itbf.kilis.edu.tr/tr/announcement-detail/185',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'İTBF Fakülte Genel Duyurusu',
    sourceUrl: 'https://itbf.kilis.edu.tr/tr/announcement-all'
  },
  // Türk Dili ve Edebiyatı Bölümü
  {
    id: 'dept-ann-turkdili-1',
    title: 'Türk Dili ve Edebiyatı Bölümü 2026-2027 Güz Yarıyılı Danışmanlık ve Ders Kayıt Onayları',
    date: '07 Ekim 2026',
    content: 'Bölümümüz lisans öğrencilerinin ders kayıt onayları ve intibak işlemleri akademik danışmanlar tarafından ÖBS üzerinden incelenmektedir.',
    url: 'https://turkdili.kilis.edu.tr/tr/announcement-detail/112',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'turkdili',
    departmentName: 'Türk Dili ve Edebiyatı Bölümü',
    category: 'Türk Dili ve Edebiyatı Bölümü Duyuruları',
    sourceUrl: 'https://turkdili.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-turkdili-2',
    title: 'Türk Dili ve Edebiyatı Bölümü Bitirme Çalışması (Tez) Konu Belirleme Duyurusu',
    date: '02 Ekim 2026',
    content: '4. sınıf lisans öğrencilerinin Bitirme Çalışması danışman tercih ve konu öneri formlarını 16 Ekim tarihine kadar bölüm sekreterliğine teslim etmeleri gerekmektedir.',
    url: 'https://turkdili.kilis.edu.tr/tr/announcement-detail/109',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'turkdili',
    departmentName: 'Türk Dili ve Edebiyatı Bölümü',
    category: 'Türk Dili ve Edebiyatı Bölümü Duyuruları',
    sourceUrl: 'https://turkdili.kilis.edu.tr/tr/announcement-all'
  },
  // Tarih Bölümü
  {
    id: 'dept-ann-tarih-1',
    title: 'Tarih Bölümü 2026-2027 Güz Dönemi Muafiyet ve İntibak Komisyonu Kararları',
    date: '04 Ekim 2026',
    content: 'Yatay geçiş ve DGS ile Tarih Bölümümüze kayıt yaptıran öğrencilerin ders muafiyet başvuruları sonuçlandırılmıştır.',
    url: 'https://tarih.kilis.edu.tr/tr/announcement-detail/95',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'tarih',
    departmentName: 'Tarih Bölümü',
    category: 'Tarih Bölümü Duyuruları',
    sourceUrl: 'https://tarih.kilis.edu.tr/tr/announcement-all'
  },
  // Coğrafya Bölümü
  {
    id: 'dept-ann-cografya-1',
    title: 'Coğrafya Bölümü Harita ve CBS Laboratuvarı Kullanım Kuralları ve Çalışma Saatleri',
    date: '01 Ekim 2026',
    content: 'CBS dersi kapsamında laboratuvar bilgisayarlarını kullanacak lisans öğrencilerinin randevu çizelgesine uyması gerekmektedir.',
    url: 'https://cografya.kilis.edu.tr/tr/announcement-detail/88',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'cografya',
    departmentName: 'Coğrafya Bölümü',
    category: 'Coğrafya Bölümü Duyuruları',
    sourceUrl: 'https://cografya.kilis.edu.tr/tr/announcement-all'
  },
  // Felsefe Bölümü
  {
    id: 'dept-ann-felsefe-1',
    title: 'Felsefe Bölümü Pedagojik Formasyon Eğitimi Alan Öğrencilerin Dikkatine',
    date: '29 Eylül 2026',
    content: 'Pedagojik formasyon eğitimi alan 3. ve 4. sınıf öğrencilerimizin teorik ve uygulamalı ders programı web sayfamızda ilan edilmiştir.',
    url: 'https://felsefe.kilis.edu.tr/tr/announcement-detail/74',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'felsefe',
    departmentName: 'Felsefe Bölümü',
    category: 'Felsefe Bölümü Duyuruları',
    sourceUrl: 'https://felsefe.kilis.edu.tr/tr/announcement-all'
  },

  // =================== FEN FAKÜLTESİ ===================
  // Fakülte Geneli
  {
    id: 'dept-ann-fen-genel-1',
    title: 'Fen Fakültesi 2026-2027 Güz Yarıyılı Ara Sınav Programı',
    date: '07 Ekim 2026',
    content: 'Fen Fakültesi bünyesindeki tüm lisans programlarının 2026-2027 Güz yarıyılı vize tarihleri ve sınav salon dağılımları yayımlanmıştır.',
    url: 'https://fen.kilis.edu.tr/tr/announcement-detail/154',
    facultyId: 'fen',
    facultyName: 'Fen Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'Fen Fakültesi Genel Duyurusu',
    sourceUrl: 'https://fen.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-fen-genel-2',
    title: 'Fen Fakültesi Araştırma Laboratuvarları İSG ve Güvenlik Eğitimi Zorunluluğu',
    date: '30 Eylül 2026',
    content: 'Kimya, Biyoloji ve Fizik laboratuvarlarında çalışacak lisans ve lisansüstü öğrencilerin İSG sertifika belgesini tamamlaması gerekmektedir.',
    url: 'https://fen.kilis.edu.tr/tr/announcement-detail/149',
    facultyId: 'fen',
    facultyName: 'Fen Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'Fen Fakültesi Genel Duyurusu',
    sourceUrl: 'https://fen.kilis.edu.tr/tr/announcement-all'
  },
  // Matematik Bölümü
  {
    id: 'dept-ann-matematik-1',
    title: 'Matematik Bölümü Seminer ve Tezsiz Yüksek Lisans Başvuru Takvimi',
    date: '03 Ekim 2026',
    content: 'Matematik Bölümü haftalık lisansüstü seminer oturumları ve tezsiz yüksek lisans mülakat tarihleri ilan edilmiştir.',
    url: 'https://matematik.kilis.edu.tr/tr/announcement-detail/99',
    facultyId: 'fen',
    facultyName: 'Fen Fakültesi',
    departmentId: 'matematik',
    departmentName: 'Matematik Bölümü',
    category: 'Matematik Bölümü Duyuruları',
    sourceUrl: 'https://matematik.kilis.edu.tr/tr/announcement-all'
  },
  // Kimya Bölümü
  {
    id: 'dept-ann-kimya-1',
    title: 'Kimya Bölümü Temel Kimya ve Organik Kimya Laboratuvar Grupları Belirlendi',
    date: '27 Eylül 2026',
    content: 'Öğrenci numaralarına göre oluşturulan laboratuvar grup listesi ve föy teslim günleri duyurulmuştur.',
    url: 'https://kimya.kilis.edu.tr/tr/announcement-detail/82',
    facultyId: 'fen',
    facultyName: 'Fen Fakültesi',
    departmentId: 'kimya',
    departmentName: 'Kimya Bölümü',
    category: 'Kimya Bölümü Duyuruları',
    sourceUrl: 'https://kimya.kilis.edu.tr/tr/announcement-all'
  },

  // =================== MÜHENDİSLİK - MİMARLIK FAKÜLTESİ (MMF) ===================
  // Fakülte Geneli
  {
    id: 'dept-ann-mmf-genel-1',
    title: 'Mühendislik - Mimarlık Fakültesi Staj Değerlendirme ve Mülakat Takvimi',
    date: '08 Ekim 2026',
    content: 'Yaz döneminde stajını tamamlayan tüm mühendislik ve mimarlık öğrencilerimizin staj defteri değerlendirme mülakat günleri ilan edilmiştir.',
    url: 'https://mmf.kilis.edu.tr/tr/announcement-detail/310',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'MMF Fakülte Genel Duyurusu',
    sourceUrl: 'https://mmf.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-mmf-genel-2',
    title: 'MMF 2026-2027 Güz Yarıyılı Ara Sınav (Vize) Oturum Programı',
    date: '04 Ekim 2026',
    content: 'Fakülte ortak servis dersleri ve bölüm teknik seçmeli derslerinin sınav saatleri web sayfamızda yayımlanmıştır.',
    url: 'https://mmf.kilis.edu.tr/tr/announcement-detail/302',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'MMF Fakülte Genel Duyurusu',
    sourceUrl: 'https://mmf.kilis.edu.tr/tr/announcement-all'
  },
  // Bilgisayar Mühendisliği
  {
    id: 'dept-ann-bilgisayar-1',
    title: 'Bilgisayar Mühendisliği Bitirme Tasarım Projesi (BTP) Danışman Tercih Formu',
    date: '06 Ekim 2026',
    content: '4. sınıf öğrencilerimizin BTP-1 dersi için danışman ve konu tercih formlarını sisteme yüklemeleri gerekmektedir.',
    url: 'https://bilgisayar.kilis.edu.tr/tr/announcement-detail/140',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'bilgisayar',
    departmentName: 'Bilgisayar Mühendisliği',
    category: 'Bilgisayar Mühendisliği Duyuruları',
    sourceUrl: 'https://bilgisayar.kilis.edu.tr/tr/announcement-all'
  },
  // Elektrik Elektronik Mühendisliği
  {
    id: 'dept-ann-eem-1',
    title: 'Elektrik Elektronik Mühendisliği Devre Laboratuvarı Malzeme Listesi ve Güvenlik Yönergesi',
    date: '02 Ekim 2026',
    content: 'EEM laboratuvar deney föyleri ve deney öncesi hazırlık ödevleri duyuru ekinde paylaşılmıştır.',
    url: 'https://eem.kilis.edu.tr/tr/announcement-detail/118',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'eem',
    departmentName: 'Elektrik Elektronik Mühendisliği',
    category: 'Elektrik Elektronik Müh. Duyuruları',
    sourceUrl: 'https://eem.kilis.edu.tr/tr/announcement-all'
  },
  // İnşaat Mühendisliği
  {
    id: 'dept-ann-insaat-1',
    title: 'İnşaat Mühendisliği Yapı Mekaniği ve Geoteknik Laboratuvar Deney Çizelgesi',
    date: '28 Eylül 2026',
    content: 'Lisans 3. sınıf öğrencilerinin betonarme ve zemin mekaniği deney oturumları başlamıştır.',
    url: 'https://insaat.kilis.edu.tr/tr/announcement-detail/92',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'insaat',
    departmentName: 'İnşaat Mühendisliği',
    category: 'İnşaat Mühendisliği Duyuruları',
    sourceUrl: 'https://insaat.kilis.edu.tr/tr/announcement-all'
  },

  // =================== İKTİSADİ VE İDARİ BİLİMLER FAKÜLTESİ (İİBF) ===================
  // Fakülte Geneli
  {
    id: 'dept-ann-iibf-genel-1',
    title: 'İİBF 2026-2027 Güz Yarıyılı Ara Sınav Programı ve Amfi Dağılımları',
    date: '06 Ekim 2026',
    content: 'İktisadi ve İdari Bilimler Fakültemiz bölümlerinin vize sınav programı ilan edilmiştir. Öğrencilerimizin amfi listelerini kontrol etmeleri rica olunur.',
    url: 'https://iibf.kilis.edu.tr/tr/announcement-detail/220',
    facultyId: 'iibf',
    facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'İİBF Fakülte Genel Duyurusu',
    sourceUrl: 'https://iibf.kilis.edu.tr/tr/announcement-all'
  },
  // İktisat Bölümü
  {
    id: 'dept-ann-iktisat-1',
    title: 'İktisat Bölümü Ekonometri ve İstatistik Ders Notları / Uygulama Saatleri',
    date: '01 Ekim 2026',
    content: 'Ekonometri laboratuvar uygulamaları her hafta Çarşamba günü İİBF Bilgisayar Laboratuvarında yapılacaktır.',
    url: 'https://iktisat.kilis.edu.tr/tr/announcement-detail/85',
    facultyId: 'iibf',
    facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
    departmentId: 'iktisat',
    departmentName: 'İktisat Bölümü',
    category: 'İktisat Bölümü Duyuruları',
    sourceUrl: 'https://iktisat.kilis.edu.tr/tr/announcement-all'
  },
  // İşletme Bölümü
  {
    id: 'dept-ann-isletme-1',
    title: 'İşletme Bölümü 2026 Mezuniyet Adayları İçin Zorunlu Mesleki Staj Duyurusu',
    date: '29 Eylül 2026',
    content: 'İşletme Bölümü staj komisyonu evrak teslim tarihlerini duyurmuştur. İlgili öğrencilerin staj dosyalarını teslim etmeleri gerekir.',
    url: 'https://isletme.kilis.edu.tr/tr/announcement-detail/76',
    facultyId: 'iibf',
    facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
    departmentId: 'isletme',
    departmentName: 'İşletme Bölümü',
    category: 'İşletme Bölümü Duyuruları',
    sourceUrl: 'https://isletme.kilis.edu.tr/tr/announcement-all'
  },

  // =================== İLAHİYAT FAKÜLTESİ ===================
  // Fakülte Geneli
  {
    id: 'dept-ann-ilahiyat-genel-1',
    title: 'İlahiyat Fakültesi Zorunlu Arapça Hazırlık Sınıfı Muafiyet Sınav Sonuçları',
    date: '05 Ekim 2026',
    content: 'Arapça hazırlık muafiyet sınavı sonuçları açıklanmış olup başarılı olan öğrenciler lisans 1. sınıf ders kayıtlarını tamamlayabilir.',
    url: 'https://ilahiyat.kilis.edu.tr/tr/announcement-detail/175',
    facultyId: 'ilahiyat',
    facultyName: 'İlahiyat Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'İlahiyat Fakültesi Genel Duyurusu',
    sourceUrl: 'https://ilahiyat.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-temel-islam-1',
    title: 'Temel İslam Bilimleri Tefsir ve Hadis Lisansüstü Seminer Takvimi',
    date: '30 Eylül 2026',
    content: 'Temel İslam Bilimleri Anabilim Dalı tezli yüksek lisans ve doktora seminer sunum tarihleri duyurulmuştur.',
    url: 'https://ilahiyat.kilis.edu.tr/tr/announcement-detail/162',
    facultyId: 'ilahiyat',
    facultyName: 'İlahiyat Fakültesi',
    departmentId: 'temel-islam',
    departmentName: 'Temel İslam Bilimleri',
    category: 'Temel İslam Bilimleri Duyuruları',
    sourceUrl: 'https://ilahiyat.kilis.edu.tr/tr/announcement-all'
  },

  // =================== SAĞLIK BİLİMLERİ FAKÜLTESİ ===================
  // Fakülte Geneli
  {
    id: 'dept-ann-sbf-genel-1',
    title: 'Yusuf Şerefoğlu SBF Klinik Uygulama ve Hastane Stajı Öncesi Hepatit Aşısı Bilgilendirmesi',
    date: '07 Ekim 2026',
    content: 'Kilis Devlet Hastanesinde klinik stajına başlayacak Hemşirelik ve Fizyoterapi öğrencilerinin aşı kartlarını bölüm sekreterliğine onaylatması zorunludur.',
    url: 'https://sbf.kilis.edu.tr/tr/announcement-detail/190',
    facultyId: 'sbf',
    facultyName: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'Sağlık Bilimleri Fakültesi Genel Duyurusu',
    sourceUrl: 'https://sbf.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-hemsirelik-1',
    title: 'Hemşirelik Bölümü Dahiliye ve Cerrahi Klinik Staj Grup Listeleri Açıklandı',
    date: '02 Ekim 2026',
    content: 'Öğrencilerimizin klinik staj yapacakları hastane servisleri, sorumlu öğretim elemanları ve nöbet çizelgeleri panolarda ilan edilmiştir.',
    url: 'https://hemsirelik.kilis.edu.tr/tr/announcement-detail/105',
    facultyId: 'sbf',
    facultyName: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
    departmentId: 'hemsirelik',
    departmentName: 'Hemşirelik Bölümü',
    category: 'Hemşirelik Bölümü Duyuruları',
    sourceUrl: 'https://hemsirelik.kilis.edu.tr/tr/announcement-all'
  },

  // =================== EĞİTİM FAKÜLTESİ ===================
  // Fakülte Geneli
  {
    id: 'dept-ann-egitim-genel-1',
    title: 'Eğitim Fakültesi Öğretmenlik Uygulaması (Staj) Okul Eşleştirmeleri İlan Edildi',
    date: '05 Ekim 2026',
    content: 'Kilis İl Milli Eğitim Müdürlüğüne bağlı okullarda öğretmenlik uygulaması yapacak son sınıf öğrencilerimizin okul ve danışman eşleştirmeleri duyurulmuştur.',
    url: 'https://egitim.kilis.edu.tr/tr/announcement-detail/245',
    facultyId: 'egitim',
    facultyName: 'Kilisli Muallim Rıfat Eğitim Fakültesi',
    departmentId: 'general',
    departmentName: 'Fakülte Geneli',
    category: 'Eğitim Fakültesi Genel Duyurusu',
    sourceUrl: 'https://egitim.kilis.edu.tr/tr/announcement-all'
  },

  // =================== MESLEK YÜKSEKOKULLARI ===================
  // Teknik Bilimler MYO
  {
    id: 'dept-ann-tbmyo-genel-1',
    title: 'Teknik Bilimler MYO 2026-2027 Güz Yarıyılı Atölye ve Laboratuvar Kullanım Esasları',
    date: '06 Ekim 2026',
    content: 'Atölye ve laboratuvarlarda iş güvenliği kıyafetleri (iş önlüğü, koruyucu gözlük ve baret) kullanımı zorunludur.',
    url: 'https://tbmyo.kilis.edu.tr/tr/announcement-detail/160',
    facultyId: 'tbmyo',
    facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
    departmentId: 'general',
    departmentName: 'MYO Geneli',
    category: 'Teknik Bilimler MYO Duyuruları',
    sourceUrl: 'https://tbmyo.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-bilgisayar-prog-1',
    title: 'Bilgisayar Programcılığı Bölümü Veritabanı ve Web Tasarımı Laboratuvar Grupları',
    date: '03 Ekim 2026',
    content: 'Bilgisayar Programcılığı 1. ve 2. sınıf laboratuvar grup dağılımları ve dönem projesi yönergesi ilan edilmiştir.',
    url: 'https://tbmyo.kilis.edu.tr/tr/announcement-detail/152',
    facultyId: 'tbmyo',
    facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
    departmentId: 'bilgisayar-prog',
    departmentName: 'Bilgisayar Programcılığı',
    category: 'Bilgisayar Programcılığı Duyuruları',
    sourceUrl: 'https://tbmyo.kilis.edu.tr/tr/announcement-all'
  },

  // Sosyal Bilimler MYO
  {
    id: 'dept-ann-sbmyo-genel-1',
    title: 'Sosyal Bilimler MYO 2026-2027 Güz Dönemi Vize Sınav Çizelgesi',
    date: '04 Ekim 2026',
    content: 'Sosyal Bilimler Meslek Yüksekokulumuz Dış Ticaret, Muhasebe ve Büro Yönetimi programları ara sınav tarihleri yayımlanmıştır.',
    url: 'https://sbmyo.kilis.edu.tr/tr/announcement-detail/135',
    facultyId: 'sbmyo',
    facultyName: 'Sosyal Bilimler Meslek Yüksekokulu',
    departmentId: 'general',
    departmentName: 'MYO Geneli',
    category: 'Sosyal Bilimler MYO Duyuruları',
    sourceUrl: 'https://sbmyo.kilis.edu.tr/tr/announcement-all'
  },

  // Sağlık Hizmetleri MYO
  {
    id: 'dept-ann-shmyo-genel-1',
    title: 'Sağlık Hizmetleri MYO Tıbbi Laboratuvar ve Optisyenlik Staj Değerlendirme Sonuçları',
    date: '05 Ekim 2026',
    content: 'Yaz dönemi zorunlu stajını tamamlayan öğrencilerimizin staj kabul ve muafiyet durumları ilan edilmiştir.',
    url: 'https://shmyo.kilis.edu.tr/tr/announcement-detail/142',
    facultyId: 'shmyo',
    facultyName: 'Sağlık Hizmetleri Meslek Yüksekokulu',
    departmentId: 'general',
    departmentName: 'MYO Geneli',
    category: 'Sağlık Hizmetleri MYO Duyuruları',
    sourceUrl: 'https://shmyo.kilis.edu.tr/tr/announcement-all'
  },

  // Alaeddin Yavaşca Devlet Konservatuvarı
  {
    id: 'dept-ann-konservatuvar-genel-1',
    title: 'Devlet Konservatuvarı Bireysel Çalgı ve Ses Eğitimi Derslik Çalışma Programı',
    date: '06 Ekim 2026',
    content: 'Konservatuvar çalışma odaları ve piyano etüt salonu haftalık kullanım çizelgesi öğrencilerin bilgisine sunulmuştur.',
    url: 'https://konservatuvar.kilis.edu.tr/tr/announcement-detail/88',
    facultyId: 'konservatuvar',
    facultyName: 'Alaeddin Yavaşca Devlet Konservatuvarı',
    departmentId: 'general',
    departmentName: 'Konservatuvar Geneli',
    category: 'Konservatuvar Duyuruları',
    sourceUrl: 'https://konservatuvar.kilis.edu.tr/tr/announcement-all'
  },

  // Lisansüstü Eğitim Enstitüsü
  {
    id: 'dept-ann-lee-genel-1',
    title: 'Lisansüstü Eğitim Enstitüsü 2026-2027 Güz Yarıyılı Tez Önerisi ve Savunma Takvimi',
    date: '08 Ekim 2026',
    content: 'Tezli Yüksek Lisans ve Doktora öğrencilerimizin tez jürisi ve tez önerisi teslimleri için son başvuru tarihleri duyurulmuştur.',
    url: 'https://enstitu.kilis.edu.tr/tr/announcement-detail/170',
    facultyId: 'lee',
    facultyName: 'Lisansüstü Eğitim Enstitüsü',
    departmentId: 'general',
    departmentName: 'Enstitü Geneli',
    category: 'Lisansüstü Enstitü Duyuruları',
    sourceUrl: 'https://enstitu.kilis.edu.tr/tr/announcement-all'
  },

  // Koordinatörlükler & Daireler
  {
    id: 'dept-ann-koordinatorluk-genel-1',
    title: 'Erasmus+ 2026-2027 Akademik Yılı Öğrenim ve Staj Hareketliliği Başvuru Çağrısı',
    date: '03 Ekim 2026',
    content: 'Avrupa üniversitelerinde hibeli öğrenim ve staj hareketliliği için yabancı dil sınavı ve online başvuru takvimi ilan edilmiştir.',
    url: 'https://uluslararasi.kilis.edu.tr/tr/announcement-detail/95',
    facultyId: 'koordinatorluk',
    facultyName: 'Merkezler & Daire Başkanlıkları',
    departmentId: 'erasmus-haber',
    departmentName: 'Uluslararası İlişkiler & Erasmus Ofisi',
    category: 'Erasmus Duyuruları',
    sourceUrl: 'https://uluslararasi.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-koordinatorluk-sks-1',
    title: 'SKS Daire Başkanlığı 2026-2027 Öğrenci Yemek Bursu Başvuruları Başladı',
    date: '01 Ekim 2026',
    content: 'Üniversitemiz Sağlık, Kültür ve Spor Daire Başkanlığı tarafından ihtiyaç sahibi öğrencilere verilecek ücretsiz yemek bursu başvuruları açılmıştır.',
    url: 'https://sks.kilis.edu.tr/tr/announcement-detail/120',
    facultyId: 'koordinatorluk',
    facultyName: 'Merkezler & Daire Başkanlıkları',
    departmentId: 'sks-haber',
    departmentName: 'Sağlık, Kültür ve Spor Daire Bşk.',
    category: 'SKS Daire Bşk. Duyuruları',
    sourceUrl: 'https://sks.kilis.edu.tr/tr/announcement-all'
  }
];
