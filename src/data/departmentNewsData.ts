import { AcademicDepartmentUnit, DepartmentNewsItem, DepartmentAnnouncementItem, StaffUnitCategory } from '../types';

export interface DepartmentGroup {
  facultyId: string;
  facultyName: string;
  shortName: string;
  category: StaffUnitCategory;
  facultyNewsUrl: string;
  departments: AcademicDepartmentUnit[];
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
    facultyId: 'tomyo',
    facultyName: 'Turizm ve Otelcilik Meslek Yüksekokulu',
    shortName: 'Turizm ve Otelcilik MYO',
    category: 'myo',
    facultyNewsUrl: 'https://tomyo.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'turizm-otel-isletmeciligi',
        name: 'Turizm ve Otel İşletmeciliği Bölümü',
        slug: 'turizm-otel-isletmeciligi',
        facultyId: 'tomyo',
        facultyName: 'Turizm ve Otelcilik Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://tomyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://tomyo.kilis.edu.tr',
        description: 'Konaklama işletmeciliği, otel operasyonları, ön büro ve turizm pazarlaması eğitimi.'
      },
      {
        id: 'ascilik-programi',
        name: 'Aşçılık Programı & Gastronomi Hizmetleri',
        slug: 'ascilik-programi',
        facultyId: 'tomyo',
        facultyName: 'Turizm ve Otelcilik Meslek Yüksekokulu',
        category: 'myo',
        newsUrl: 'https://tomyo.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://tomyo.kilis.edu.tr',
        description: 'Yiyecek-içecek hizmetleri, mutfak sanatları, yöresel lezzetler ve servis teknikleri.'
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
    facultyId: 'dairebaskanliklari',
    facultyName: 'Daire Başkanlıkları',
    shortName: 'Daire Başkanlıkları',
    category: 'daire',
    facultyNewsUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'oidb-haber',
        name: 'Öğrenci İşleri Daire Başkanlığı',
        slug: 'oidb-haber',
        facultyId: 'dairebaskanliklari',
        facultyName: 'Daire Başkanlıkları',
        category: 'daire',
        newsUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://ogrenciisleri.kilis.edu.tr',
        description: 'Ders kayıtları, kayıt yenileme, katkı payı, OBS işlemleri, yatay geçiş ve mezuniyet duyuruları.'
      },
      {
        id: 'sks-haber',
        name: 'Sağlık, Kültür ve Spor Daire Başkanlığı',
        slug: 'sks-haber',
        facultyId: 'dairebaskanliklari',
        facultyName: 'Daire Başkanlıkları',
        category: 'daire',
        newsUrl: 'https://sks.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sks.kilis.edu.tr',
        description: 'Öğrenci toplulukları, spor tesisleri, yemekhane bursları, havuz ve fitness hizmetleri haberleri.'
      },
      {
        id: 'kutuphane-haber',
        name: 'Kütüphane ve Dokümantasyon Daire Başkanlığı',
        slug: 'kutuphane-haber',
        facultyId: 'dairebaskanliklari',
        facultyName: 'Daire Başkanlıkları',
        category: 'daire',
        newsUrl: 'https://kutuphane.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://kutuphane.kilis.edu.tr',
        description: 'Veritabanı eğitimleri, yeni basılı/elektronik kaynaklar, 7/24 salonlar ve kütüphane etkinlikleri.'
      },
      {
        id: 'bidb-haber',
        name: 'Bilgi İşlem Daire Başkanlığı',
        slug: 'bidb-haber',
        facultyId: 'dairebaskanliklari',
        facultyName: 'Daire Başkanlıkları',
        category: 'daire',
        newsUrl: 'https://bilgiislem.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://bilgiislem.kilis.edu.tr',
        description: 'Eduroam Wi-Fi, öğrenci e-posta, EBYS, kampüs ağ altyapısı ve bilişim güvenliği duyuruları.'
      },
      {
        id: 'personel-haber',
        name: 'Personel Daire Başkanlığı',
        slug: 'personel-haber',
        facultyId: 'dairebaskanliklari',
        facultyName: 'Daire Başkanlıkları',
        category: 'daire',
        newsUrl: 'https://personel.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://personel.kilis.edu.tr',
        description: 'Akademik ve idari personel ilanları, hizmet içi eğitimler, mevzuat ve kadro duyuruları.'
      },
      {
        id: 'imidb-haber',
        name: 'İdari ve Mali İşler Daire Başkanlığı',
        slug: 'imidb-haber',
        facultyId: 'dairebaskanliklari',
        facultyName: 'Daire Başkanlıkları',
        category: 'daire',
        newsUrl: 'https://imidb.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://imidb.kilis.edu.tr',
        description: 'Kampüs lojistik, güvenlik, temizlik hizmetleri, araç sevk ve satın alma duyuruları.'
      },
      {
        id: 'yitdb-haber',
        name: 'Yapı İşleri ve Teknik Daire Başkanlığı',
        slug: 'yitdb-haber',
        facultyId: 'dairebaskanliklari',
        facultyName: 'Daire Başkanlıkları',
        category: 'daire',
        newsUrl: 'https://yitdb.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://yitdb.kilis.edu.tr',
        description: 'Kampüs bina yapım, tadilat, peyzaj ve enerji santralleri teknik altyapı projeleri.'
      },
      {
        id: 'sgdb-haber',
        name: 'Strateji Geliştirme Daire Başkanlığı',
        slug: 'sgdb-haber',
        facultyId: 'dairebaskanliklari',
        facultyName: 'Daire Başkanlıkları',
        category: 'daire',
        newsUrl: 'https://sgdb.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://sgdb.kilis.edu.tr',
        description: 'Üniversite stratejik planları, bütçe performans programları ve faaliyet raporları.'
      }
    ]
  },
  {
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    shortName: 'Koordinatörlükler',
    category: 'koordinatorluk',
    facultyNewsUrl: 'https://uluslararasi.kilis.edu.tr/tr/news-all',
    departments: [
      {
        id: 'erasmus-haber',
        name: 'Uluslararası İlişkiler & Erasmus Koordinatörlüğü',
        slug: 'erasmus-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://uluslararasi.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://uluslararasi.kilis.edu.tr',
        description: 'Erasmus+ öğrenim/staj hareketliliği, yabancı dil sınavları ve uluslararası öğrenci kabulü.'
      },
      {
        id: 'projeler-haber',
        name: 'Proje Destek Ofisi & BAP Koordinatörlüğü',
        slug: 'projeler-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://projeler.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://projeler.kilis.edu.tr',
        description: 'TÜBİTAK, AB Horizon, Erasmus+ KA projeleri ve BAP bilimsel araştırma destekleri.'
      },
      {
        id: 'karyam-haber',
        name: 'Kariyer Planlama Uygulama ve Araştırma Merkezi (KARYAM)',
        slug: 'karyam-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://karmer.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://karmer.kilis.edu.tr',
        description: 'Staj olanakları, Kariyer Günleri, Yetenek Kapısı, mülakat atölyeleri ve mezun ilişkileri.'
      },
      {
        id: 'kurumsaliletisim-haber',
        name: 'Kurumsal İletişim Koordinatörlüğü',
        slug: 'kurumsaliletisim-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://kurumsaliletisim.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://kurumsaliletisim.kilis.edu.tr',
        description: 'Basın bültenleri, kurumsal kimlik, medya takibi ve resmi sosyal medya yayınları.'
      },
      {
        id: 'surdurulebilirlik-haber',
        name: 'Sürdürülebilirlik & Büyük Veri Koordinatörlüğü',
        slug: 'surdurulebilirlik-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://surdurulebilirlik.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://surdurulebilirlik.kilis.edu.tr',
        description: 'Yeşil Kampüs, Sıfır Atık, enerji verimliliği ve büyük veri analitiği projeleri.'
      },
      {
        id: 'uzem-haber',
        name: 'Uzaktan Eğitim Uygulama ve Araştırma Merkezi (UZEM)',
        slug: 'uzem-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://uzem.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://uzem.kilis.edu.tr',
        description: 'Ortak zorunlu uzaktan dersler, ALMS sınav portalı ve e-öğrenme yönergeleri.'
      },
      {
        id: 'kusem-haber',
        name: 'Sürekli Eğitim Uygulama ve Araştırma Merkezi (KÜSEM)',
        slug: 'kusem-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://kusem.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://kusem.kilis.edu.tr',
        description: 'Sertifikalı meslek edindirme kursları, yabancı dil eğitimleri ve kişisel gelişim programları.'
      },
      {
        id: 'tomer-haber',
        name: 'Türkçe Öğretimi Uygulama ve Araştırma Merkezi (TÖMER)',
        slug: 'tomer-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://tomer.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://tomer.kilis.edu.tr',
        description: 'Uluslararası öğrenciler için Türkçe dil kursları, C1 yeterlilik sınavları ve kültür etkinlikleri.'
      },
      {
        id: 'kalite-haber',
        name: 'Kalite ve Akreditasyon Koordinatörlüğü',
        slug: 'kalite-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://kalite.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://kalite.kilis.edu.tr',
        description: 'YÖKAK kurumsal akreditasyon, iç değerlendirme raporları ve kalite standartları duyuruları.'
      },
      {
        id: 'engelsiz-haber',
        name: 'Engelsiz Üniversite Koordinatörlüğü',
        slug: 'engelsiz-haber',
        facultyId: 'koordinatorluk',
        facultyName: 'Koordinatörlükler & Merkezler',
        category: 'koordinatorluk',
        newsUrl: 'https://engelsiz.kilis.edu.tr/tr/news-all',
        websiteUrl: 'https://engelsiz.kilis.edu.tr',
        description: 'Mekanda ve eğitimde erişilebilirlik bayrakları, engelli öğrenci destek birimi faaliyetleri.'
      }
    ]
  }
];

// Rich fallback news for department pages to guarantee instant offline experience & fast initial hydration
export const FALLBACK_DEPARTMENT_NEWS: DepartmentNewsItem[] = [
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
  },

  // Eğitim Fakültesi
  {
    id: 'dept-egitim-1',
    title: 'Kilisli Muallim Rıfat Eğitim Fakültesi 2026-2027 Öğretmenlik Uygulaması Bilgilendirme Toplantısı Yapıldı',
    date: '04 Ekim 2026',
    content: 'Milli Eğitim Bakanlığına bağlı okullarda staj yapacak son sınıf öğretmen adayları için oryantasyon ve uygulama esasları semineri verildi.',
    url: 'https://egitim.kilis.edu.tr/tr/news-detail/1560',
    facultyId: 'egitim',
    facultyName: 'Kilisli Muallim Rıfat Eğitim Fakültesi',
    departmentId: 'temel-egitim',
    departmentName: 'Temel Eğitim Bölümü (Sınıf & Okul Öncesi)',
    category: 'Eğitim Fakültesi Haberleri',
    sourceUrl: 'https://egitim.kilis.edu.tr/tr/news-all'
  },

  // İlahiyat Fakültesi
  {
    id: 'dept-ilahiyat-1',
    title: 'İlahiyat Fakültesi Tarafından "Klasik Metinler ve Çağdaş İslami Düşünce" Çalıştayı Düzenlendi',
    date: '03 Ekim 2026',
    content: 'Arapça hazırlık ve lisans öğrencilerine yönelik tefsir, hadis ve fıkıh literatürü okuma halkaları açılış oturumu gerçekleşti.',
    url: 'https://ilahiyat.kilis.edu.tr/tr/news-detail/1545',
    facultyId: 'ilahiyat',
    facultyName: 'İlahiyat Fakültesi',
    departmentId: 'temel-islam',
    departmentName: 'Temel İslam Bilimleri Bölümü',
    category: 'İlahiyat Fakültesi Haberleri',
    sourceUrl: 'https://ilahiyat.kilis.edu.tr/tr/news-all'
  },

  // Spor Bilimleri Fakültesi
  {
    id: 'dept-spor-1',
    title: 'Spor Bilimleri Fakültesi Öğrencileri Üniversiteler Arası Atletizm Şampiyonasında Dereceye Girdi',
    date: '02 Ekim 2026',
    content: 'Bölümümüz antrenörlük ve beden eğitimi öğrencileri Türkiye Üniversite Sporları Federasyonu müsabakalarında madalyalarla döndü.',
    url: 'https://sporbilimleri.kilis.edu.tr/tr/news-detail/1532',
    facultyId: 'spor',
    facultyName: 'Spor Bilimleri Fakültesi',
    departmentId: 'antrenorluk',
    departmentName: 'Antrenörlük Eğitimi Bölümü',
    category: 'Spor Bilimleri Fakültesi Haberleri',
    sourceUrl: 'https://sporbilimleri.kilis.edu.tr/tr/news-all'
  },

  // Uygulamalı Bilimler Fakültesi
  {
    id: 'dept-ubf-1',
    title: 'Uygulamalı Bilimler Fakültesi Gastronomi Bölümünden Yöresel Zeytinyağlı Lezzetler Sergisi',
    date: '01 Ekim 2026',
    content: 'Gastronomi ve Mutfak Sanatları uygulama laboratuvarında Kilis mutfağının coğrafi işaretli ürünleri tanıtıldı.',
    url: 'https://ubf.kilis.edu.tr/tr/news-detail/1520',
    facultyId: 'ubf',
    facultyName: 'Uygulamalı Bilimler Fakültesi',
    departmentId: 'gastronomi',
    departmentName: 'Gastronomi ve Mutfak Sanatları',
    category: 'Uygulamalı Bilimler Fakültesi Haberleri',
    sourceUrl: 'https://ubf.kilis.edu.tr/tr/news-all'
  },

  // Güzel Sanatlar ve Tasarım Fakültesi
  {
    id: 'dept-gsf-1',
    title: 'Güzel Sanatlar ve Tasarım Fakültesi Geleneksel Sanatlar Sergisi Açıldı',
    date: '30 Eylül 2026',
    content: 'Hat, ebru, tezhip ve minyatür eserlerinden oluşan güz dönemi karma öğrenci sergisi sanatseverlerle buluştu.',
    url: 'https://gstf.kilis.edu.tr/tr/news-detail/1505',
    facultyId: 'gsf',
    facultyName: 'Güzel Sanatlar ve Tasarım Fakültesi',
    departmentId: 'gelenekselturksanatlari',
    departmentName: 'Geleneksel Türk Sanatları',
    category: 'Güzel Sanatlar Fakültesi Haberleri',
    sourceUrl: 'https://gstf.kilis.edu.tr/tr/news-all'
  },

  // Yabancı Diller Yüksekokulu
  {
    id: 'dept-yadyo-1',
    title: 'Yabancı Diller Yüksekokulu 2026-2027 Hazırlık Sınıfları Oryantasyon Programı Gerçekleştirildi',
    date: '29 Eylül 2026',
    content: 'İngilizce ve Arapça zorunlu/isteğe bağlı hazırlık eğitimi alacak öğrencilere ders müfredatı ve online öğrenme platformları tanıtıldı.',
    url: 'https://yadyo.kilis.edu.tr/tr/news-detail/1490',
    facultyId: 'yadyo',
    facultyName: 'Yabancı Diller Yüksekokulu',
    departmentId: 'yabanci-diller-hazirlik',
    departmentName: 'Yabancı Diller Hazırlık & Bölüm',
    category: 'Yabancı Diller Yüksekokulu Haberleri',
    sourceUrl: 'https://yadyo.kilis.edu.tr/tr/news-all'
  },

  // Daire Başkanlıkları - Öğrenci İşleri
  {
    id: 'dept-oidb-1',
    title: 'Öğrenci İşleri Daire Başkanlığı 2026-2027 Güz Yarıyılı Katkı Payı ve Mazeretli Kayıt Duyurusu',
    date: '06 Ekim 2026',
    content: 'OBS sistemi üzerinden mazeretli ders kayıt başvuruları ve katkı payı ödeme takvimi güncellenerek ilan edilmiştir.',
    url: 'https://ogrenciisleri.kilis.edu.tr/tr/news-detail/1585',
    facultyId: 'dairebaskanliklari',
    facultyName: 'Daire Başkanlıkları',
    departmentId: 'oidb-haber',
    departmentName: 'Öğrenci İşleri Daire Başkanlığı',
    category: 'Daire Başkanlıkları Haberleri',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/news-all'
  },

  // Daire Başkanlıkları - SKS
  {
    id: 'dept-sks-1',
    title: 'Sağlık Kültür ve Spor Daire Başkanlığı Yemekhane Bursu ve Öğrenci Toplulukları Başvuruları Başladı',
    date: '05 Ekim 2026',
    content: 'Üniversitemiz bünyesinde faaliyet gösteren 45 öğrenci topluluğunun yeni üye kayıtları ve ücretsiz yemek bursu değerlendirme takvimi başladı.',
    url: 'https://sks.kilis.edu.tr/tr/news-detail/1570',
    facultyId: 'dairebaskanliklari',
    facultyName: 'Daire Başkanlıkları',
    departmentId: 'sks-haber',
    departmentName: 'Sağlık, Kültür ve Spor Daire Başkanlığı',
    category: 'Daire Başkanlıkları Haberleri',
    sourceUrl: 'https://sks.kilis.edu.tr/tr/news-all'
  },

  // Daire Başkanlıkları - Kütüphane
  {
    id: 'dept-kutuphane-1',
    title: 'Merkez Kütüphane TÜBİTAK ULAKBİM EKUAL Veritabanları ve 7/24 Etüt Salonu Kullanım Rehberi',
    date: '03 Ekim 2026',
    content: 'ScienceDirect, IEEE, Web of Science ve SpringerLink uluslararası akademik veritabanlarına uzaktan erişim kılavuzu yayınlandı.',
    url: 'https://kutuphane.kilis.edu.tr/tr/news-detail/1540',
    facultyId: 'dairebaskanliklari',
    facultyName: 'Daire Başkanlıkları',
    departmentId: 'kutuphane-haber',
    departmentName: 'Kütüphane ve Dokümantasyon Daire Başkanlığı',
    category: 'Daire Başkanlıkları Haberleri',
    sourceUrl: 'https://kutuphane.kilis.edu.tr/tr/news-all'
  },

  // Daire Başkanlıkları - Bilgi İşlem
  {
    id: 'dept-bidb-1',
    title: 'Bilgi İşlem Daire Başkanlığı Eduroam Wi-Fi ve Öğrenci Kurumsal E-Posta Sistemi Yenilendi',
    date: '02 Ekim 2026',
    content: 'Kampüs genelinde Wi-Fi 6 altyapısına geçiş tamamlanmış olup @kilis.edu.tr uzantılı e-posta ve EBYS sistemleri güvenliği artırılmıştır.',
    url: 'https://bilgiislem.kilis.edu.tr/tr/news-detail/1530',
    facultyId: 'dairebaskanliklari',
    facultyName: 'Daire Başkanlıkları',
    departmentId: 'bidb-haber',
    departmentName: 'Bilgi İşlem Daire Başkanlığı',
    category: 'Daire Başkanlıkları Haberleri',
    sourceUrl: 'https://bilgiislem.kilis.edu.tr/tr/news-all'
  },

  // Koordinatörlükler - Erasmus & Uluslararası İlişkiler
  {
    id: 'dept-erasmus-1',
    title: 'Uluslararası İlişkiler & Erasmus Ofisi 2026-2027 Bahar Dönemi Avrupa Öğrenim Hareketliliği İlanı',
    date: '05 Ekim 2026',
    content: 'Almanya, İtalya, Polonya, İspanya ve Portekiz üniversitelerinde hibeli Erasmus+ öğrenim görmek isteyen öğrenciler için yabancı dil sınavı başvuru süreci açıldı.',
    url: 'https://uluslararasi.kilis.edu.tr/tr/news-detail/1575',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'erasmus-haber',
    departmentName: 'Uluslararası İlişkiler & Erasmus Koordinatörlüğü',
    category: 'Koordinatörlük Haberleri',
    sourceUrl: 'https://uluslararasi.kilis.edu.tr/tr/news-all'
  },

  // Koordinatörlükler - Proje Destek Ofisi
  {
    id: 'dept-projeler-1',
    title: 'Proje Destek Ofisi TÜBİTAK 2209-A ve 2209-B Üniversite Öğrencileri Araştırma Projeleri Çağrısı',
    date: '04 Ekim 2026',
    content: 'Lisans ve önlisans öğrencilerimizin hazırlayacağı bilimsel araştırma projelerine yönelik danışmanlık ve proje yazım atölyeleri düzenleniyor.',
    url: 'https://projeler.kilis.edu.tr/tr/news-detail/1555',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'projeler-haber',
    departmentName: 'Proje Destek Ofisi & BAP Koordinatörlüğü',
    category: 'Koordinatörlük Haberleri',
    sourceUrl: 'https://projeler.kilis.edu.tr/tr/news-all'
  },

  // Koordinatörlükler - Kariyer Merkezi
  {
    id: 'dept-karmer-1',
    title: 'Kariyer Planlama Merkezi (KARYAM) İpekyolu Kariyer Fuarı ve Yetenek Kapısı Bilgilendirme Günleri',
    date: '02 Ekim 2026',
    content: 'Cumhurbaşkanlığı İnsan Kaynakları Ofisi koordinasyonunda düzenlenecek bölgesel kariyer fuarı ve staj başvuruları için öğrenci kayıtları devam ediyor.',
    url: 'https://karmer.kilis.edu.tr/tr/news-detail/1535',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'karyam-haber',
    departmentName: 'Kariyer Planlama Uygulama ve Araştırma Merkezi (KARYAM)',
    category: 'Koordinatörlük Haberleri',
    sourceUrl: 'https://karmer.kilis.edu.tr/tr/news-all'
  },

  // Koordinatörlükler - UZEM
  {
    id: 'dept-uzem-1',
    title: 'Uzaktan Eğitim Merkezi (UZEM) 2026-2027 Ortak Zorunlu Dersler ve ALMS Sistemi Kullanım Kılavuzu',
    date: '28 Eylül 2026',
    content: 'Atatürk İlkeleri ve İnkılap Tarihi, Türk Dili ve Yabancı Dil uzaktan eğitim dersleri video içerikleri ve sınav takvimi açıklandı.',
    url: 'https://uzem.kilis.edu.tr/tr/news-detail/1470',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'uzem-haber',
    departmentName: 'Uzaktan Eğitim Uygulama ve Araştırma Merkezi (UZEM)',
    category: 'Koordinatörlük Haberleri',
    sourceUrl: 'https://uzem.kilis.edu.tr/tr/news-all'
  },

  // Koordinatörlükler - TÖMER
  {
    id: 'dept-tomer-1',
    title: 'TÖMER Yabancılar İçin Türkçe Dil Kursları Yeni Dönem Seviye Tespit Sınavı Yapıldı',
    date: '27 Eylül 2026',
    content: 'Farklı ülkelerden üniversitemize gelen uluslararası öğrenciler için A1-C1 düzeyinde Türkçe dil eğitimi sınıfları oluşturuldu.',
    url: 'https://tomer.kilis.edu.tr/tr/news-detail/1455',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'tomer-haber',
    departmentName: 'Türkçe Öğretimi Uygulama ve Araştırma Merkezi (TÖMER)',
    category: 'Koordinatörlük Haberleri',
    sourceUrl: 'https://tomer.kilis.edu.tr/tr/news-all'
  },

  // Koordinatörlükler - Kurumsal İletişim & Sürdürülebilirlik
  {
    id: 'dept-surdurulebilirlik-1',
    title: 'Sürdürülebilirlik Koordinatörlüğü Yeşil Kampüs ve Sıfır Atık Geri Dönüşüm Kampanyası Başlattı',
    date: '25 Eylül 2026',
    content: 'Kampüs genelinde atık ayrıştırma istasyonları, güneş enerjisi panelleri verimlilik takibi ve fidan dikim etkinlikleri organize edildi.',
    url: 'https://surdurulebilirlik.kilis.edu.tr/tr/news-detail/1435',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'surdurulebilirlik-haber',
    departmentName: 'Sürdürülebilirlik & Büyük Veri Koordinatörlüğü',
    category: 'Koordinatörlük Haberleri',
    sourceUrl: 'https://surdurulebilirlik.kilis.edu.tr/tr/news-all'
  }
];

// Rich fallback announcements for all departments and units
export const FALLBACK_DEPARTMENT_ANNOUNCEMENTS: DepartmentAnnouncementItem[] = [
  // İTBF - Türk Dili ve Edebiyatı
  {
    id: 'dept-ann-turkdili-1',
    title: 'Türk Dili ve Edebiyatı Bölümü 2026-2027 Güz Yarıyılı Ara Sınav (Vize) Programı ve Salon Dağılımı',
    date: '06 Ekim 2026',
    content: 'Eski Türk Edebiyatı, Yeni Türk Dili, Halk Edebiyatı ve Osmanlı Türkçesi dersleri vize sınav tarihleri ve amfi listeleri ilan edilmiştir.',
    url: 'https://turkdili.kilis.edu.tr/tr/announcement-all',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'turkdili',
    departmentName: 'Türk Dili ve Edebiyatı Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://turkdili.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-turkdili-2',
    title: 'Türk Dili ve Edebiyatı Lisans Bitirme Tezi Danışman Tercihleri ve Konu Bildirimi',
    date: '02 Ekim 2026',
    content: '4. sınıf öğrencilerimizin mezuniyet tez konularını ve danışman öğretim üyesi onay formlarını bölüm sekreterliğine teslim etmeleri gerekmektedir.',
    url: 'https://turkdili.kilis.edu.tr/tr/announcement-all',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'turkdili',
    departmentName: 'Türk Dili ve Edebiyatı Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://turkdili.kilis.edu.tr/tr/announcement-all'
  },

  // İTBF - Tarih
  {
    id: 'dept-ann-tarih-1',
    title: 'Tarih Bölümü Osmanlı Paleografyası ve Arşiv Belgeleri Okuma Grubu Başvuruları',
    date: '05 Ekim 2026',
    content: 'Osmanlıca matbu ve rıka evrak okuma atölyesi haftalık ders saatleri ve katılımcı öğrenci listesi belirlenmiştir.',
    url: 'https://tarih.kilis.edu.tr/tr/announcement-all',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'tarih',
    departmentName: 'Tarih Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://tarih.kilis.edu.tr/tr/announcement-all'
  },

  // İTBF - Coğrafya
  {
    id: 'dept-ann-cografya-1',
    title: 'Coğrafya Bölümü CBS (Coğrafi Bilgi Sistemleri) Laboratuvarı Kullanım Saatleri ve ArcGIS Lisansları',
    date: '04 Ekim 2026',
    content: 'Fiziki ve beşeri coğrafya haritalama dersleri için öğrenci hesaplarına tanımlanan lisans bilgileri yayınlanmıştır.',
    url: 'https://cografya.kilis.edu.tr/tr/announcement-all',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'cografya',
    departmentName: 'Coğrafya Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://cografya.kilis.edu.tr/tr/announcement-all'
  },

  // İTBF - Felsefe & Sosyoloji
  {
    id: 'dept-ann-felsefe-1',
    title: 'Felsefe Bölümü Mantık ve Epistemoloji Seminerleri Haftalık Takvimi',
    date: '03 Ekim 2026',
    content: 'Bölüm seminer odasında her çarşamba gerçekleştirilecek akademik tartışma oturumları programı ilan edildi.',
    url: 'https://felsefe.kilis.edu.tr/tr/announcement-all',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'felsefe',
    departmentName: 'Felsefe Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://felsefe.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-sosyoloji-1',
    title: 'Sosyoloji Bölümü Saha Araştırması ve Anket Uygulama İzin Formları',
    date: '01 Ekim 2026',
    content: 'Toplumsal cinsiyet ve kent sosyolojisi projelerinde sahaya çıkacak öğrencilerin etik kurul onayları duyuruldu.',
    url: 'https://sosyoloji.kilis.edu.tr/tr/announcement-all',
    facultyId: 'itbf',
    facultyName: 'İnsan ve Toplum Bilimleri Fakültesi',
    departmentId: 'sosyoloji',
    departmentName: 'Sosyoloji Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://sosyoloji.kilis.edu.tr/tr/announcement-all'
  },

  // Mühendislik - Elektrik-Elektronik Mühendisliği
  {
    id: 'dept-ann-elektrik-1',
    title: 'Elektrik-Elektronik Mühendisliği Bitirme Tasarım Projesi (CapStone) Grup ve Danışman Listesi',
    date: '06 Ekim 2026',
    content: 'Devre tasarımı, haberleşme ve gömülü sistemler bitirme projesi kriterleri ve ara rapor teslim tarihleri ilan edilmiştir.',
    url: 'https://eem.kilis.edu.tr/tr/announcement-all',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'elektrik-elektronik',
    departmentName: 'Elektrik-Elektronik Mühendisliği Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://eem.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-elektrik-2',
    title: 'Elektrik-Elektronik Laboratuvar Güvenliği ve Osiloskop-Güç Kaynağı Kullanım Kuralları',
    date: '02 Ekim 2026',
    content: 'Temel devre laboratuvarı deney föyleri ve güvenlik yönergesi bölüm web sayfasında yayınlanmıştır.',
    url: 'https://eem.kilis.edu.tr/tr/announcement-all',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'elektrik-elektronik',
    departmentName: 'Elektrik-Elektronik Mühendisliği Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://eem.kilis.edu.tr/tr/announcement-all'
  },

  // Mühendislik - Bilgisayar Mühendisliği
  {
    id: 'dept-ann-bilgisayar-1',
    title: 'Bilgisayar Mühendisliği GitHub Classroom ve Programlama Laboratuvarı Hesap Açılışı',
    date: '05 Ekim 2026',
    content: 'Nesne Yönelimli Programlama ve Veri Yapıları dersi ödev teslim sistemi kılavuzu yayınlanmıştır.',
    url: 'https://bilgisayar.kilis.edu.tr/tr/announcement-all',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'bilgisayar-muh',
    departmentName: 'Bilgisayar Mühendisliği Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://bilgisayar.kilis.edu.tr/tr/announcement-all'
  },

  // Mühendislik - İnşaat Mühendisliği
  {
    id: 'dept-ann-insaat-1',
    title: 'İnşaat Mühendisliği Yaz Stajı Defteri ve Şantiye Değerlendirme Mülakat Günleri',
    date: '04 Ekim 2026',
    content: 'Şantiye ve büro stajı yapan öğrencilerin sözlü savunma jüri takvimi ilan edilmiştir.',
    url: 'https://insaat.kilis.edu.tr/tr/announcement-all',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'insaat-muh',
    departmentName: 'İnşaat Mühendisliği Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://insaat.kilis.edu.tr/tr/announcement-all'
  },

  // Mühendislik - Makine & Mimarlık
  {
    id: 'dept-ann-makine-1',
    title: 'Makine Mühendisliği CAD/CAM Laboratuvarı ve SolidWorks Lisans Dağıtımı',
    date: '03 Ekim 2026',
    content: 'Teknik resim ve makine elemanları tasarım dersi yazılım lisansları öğrencilerin erişimine açılmıştır.',
    url: 'https://makine.kilis.edu.tr/tr/announcement-all',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'makine-muh',
    departmentName: 'Makine Mühendisliği Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://makine.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-mimarlik-1',
    title: 'Mimarlık Bölümü Proje Stüdyosu 1-2-3 Jüri Sunum Takvimi ve Pafta Kriterleri',
    date: '02 Ekim 2026',
    content: 'Mimari tasarım atölyesi ara jüri tarihleri ve maket teslim şartları duyurulmuştur.',
    url: 'https://mimarlik.kilis.edu.tr/tr/announcement-all',
    facultyId: 'mmf',
    facultyName: 'Mühendislik - Mimarlık Fakültesi',
    departmentId: 'mimarlik',
    departmentName: 'Mimarlık Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://mimarlik.kilis.edu.tr/tr/announcement-all'
  },

  // Fen Fakültesi - Matematik & Kimya & Biyoloji
  {
    id: 'dept-ann-matematik-1',
    title: 'Matematik Bölümü Diferansiyel Denklemler ve Analiz Problem Çözüm Saatleri',
    date: '05 Ekim 2026',
    content: 'Araştırma görevlileri eşliğinde yapılacak haftalık etüt ve soru çözüm takvimi belirlenmiştir.',
    url: 'https://matematik.kilis.edu.tr/tr/announcement-all',
    facultyId: 'fen',
    facultyName: 'Fen Fakültesi',
    departmentId: 'matematik',
    departmentName: 'Matematik Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://matematik.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-kimya-1',
    title: 'Kimya Bölümü Organik ve Analitik Kimya Laboratuvar Önlük ve Güvenlik Malzemeleri',
    date: '04 Ekim 2026',
    content: 'Laboratuvar derslerine girişte zorunlu olan koruyucu gözlük ve malzeme listesi duyurulmuştur.',
    url: 'https://kimya.kilis.edu.tr/tr/announcement-all',
    facultyId: 'fen',
    facultyName: 'Fen Fakültesi',
    departmentId: 'kimya',
    departmentName: 'Kimya Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://kimya.kilis.edu.tr/tr/announcement-all'
  },

  // İİBF - İşletme & İktisat & Siyaset Bilimi
  {
    id: 'dept-ann-isletme-1',
    title: 'İşletme Bölümü Muhasebe ve Finansal Yönetim Vize Öncesi Telafi Programı',
    date: '05 Ekim 2026',
    content: 'Ders çakışması olan öğrencilerin mazeret sınavı ve telafi ders saatleri açıklanmıştır.',
    url: 'https://isletme.kilis.edu.tr/tr/announcement-all',
    facultyId: 'iibf',
    facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
    departmentId: 'isletme',
    departmentName: 'İşletme Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://isletme.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-iktisat-1',
    title: 'İktisat Bölümü Ekonometri ve Mikro İktisat SPSS/Stata Veri Analizi Uygulama Salonları',
    date: '03 Ekim 2026',
    content: 'Bilgisayar laboratuvarında yapılacak uygulamalı ekonometri ders programı yayınlanmıştır.',
    url: 'https://iktisat.kilis.edu.tr/tr/announcement-all',
    facultyId: 'iibf',
    facultyName: 'İktisadi ve İdari Bilimler Fakültesi',
    departmentId: 'iktisat',
    departmentName: 'İktisat Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://iktisat.kilis.edu.tr/tr/announcement-all'
  },

  // Sağlık Bilimleri Fakültesi - Hemşirelik & Beslenme
  {
    id: 'dept-ann-hemsirelik-1',
    title: 'Hemşirelik Bölümü Kilis Prof. Dr. Alaeddin Yavaşca Devlet Hastanesi Klinik Uygulama Listeleri',
    date: '06 Ekim 2026',
    content: 'Cerrahi, Dahiliye, Doğum ve Pediatri klinik staj grupları, servis sorumluları ve forması kuralları.',
    url: 'https://hemsirelik.kilis.edu.tr/tr/announcement-all',
    facultyId: 'sbf',
    facultyName: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
    departmentId: 'hemsirelik',
    departmentName: 'Hemşirelik Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://hemsirelik.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-beslenme-1',
    title: 'Beslenme ve Diyetetik Bölümü Toplu Beslenme Sistemleri Staj Dosyası Teslimi',
    date: '04 Ekim 2026',
    content: 'Yemekhane ve kurum diyetisyenliği stajını tamamlayan öğrencilerin evrak teslim takvimi ilan edildi.',
    url: 'https://beslenme.kilis.edu.tr/tr/announcement-all',
    facultyId: 'sbf',
    facultyName: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
    departmentId: 'beslenme-diyetetik',
    departmentName: 'Beslenme ve Diyetetik Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://beslenme.kilis.edu.tr/tr/announcement-all'
  },

  // İlahiyat Fakültesi
  {
    id: 'dept-ann-ilahiyat-1',
    title: 'İlahiyat Fakültesi Temel İslam Bilimleri Kuran-ı Kerim ve Tecvid Kıraat Sınav Tarihleri',
    date: '05 Ekim 2026',
    content: 'Ezber ve yüzünden okuma sınavı öğretim üyesi komisyon odaları ve öğrenci sıralaması duyurulmuştur.',
    url: 'https://ilahiyat.kilis.edu.tr/tr/announcement-all',
    facultyId: 'ilahiyat',
    facultyName: 'İlahiyat Fakültesi',
    departmentId: 'temel-islam',
    departmentName: 'Temel İslam Bilimleri Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://ilahiyat.kilis.edu.tr/tr/announcement-all'
  },

  // Eğitim Fakültesi
  {
    id: 'dept-ann-egitim-1',
    title: 'Eğitim Fakültesi Sınıf Öğretmenliği ve Okul Öncesi MEB Staj Okul Dağılımları',
    date: '06 Ekim 2026',
    content: 'Öğretmenlik Uygulaması 1 dersi kapsamında Milli Eğitim Bakanlığına bağlı okullara gidecek öğrenci grupları açıklandı.',
    url: 'https://egitim.kilis.edu.tr/tr/announcement-all',
    facultyId: 'egitim',
    facultyName: 'Kilisli Muallim Rıfat Eğitim Fakültesi',
    departmentId: 'temel-egitim',
    departmentName: 'Temel Eğitim Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://egitim.kilis.edu.tr/tr/announcement-all'
  },

  // Spor Bilimleri Fakültesi
  {
    id: 'dept-ann-spor-1',
    title: 'Spor Bilimleri Fakültesi Beden Eğitimi ve Antrenörlük Saha Uygulama Kıyafet Esasları',
    date: '04 Ekim 2026',
    content: 'Kapalı spor salonu, atletizm pisti ve yüzme havuzu uygulama dersleri ekipman kuralları ilan edilmiştir.',
    url: 'https://sporbilimleri.kilis.edu.tr/tr/announcement-all',
    facultyId: 'spor',
    facultyName: 'Spor Bilimleri Fakültesi',
    departmentId: 'beden-egitimi',
    departmentName: 'Beden Eğitimi ve Spor Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://sporbilimleri.kilis.edu.tr/tr/announcement-all'
  },

  // Ziraat Fakültesi
  {
    id: 'dept-ann-ziraat-1',
    title: 'Ziraat Fakültesi Bahçe Bitkileri ve Tarla Bitkileri Arazi Parseli Dikim Takvimi',
    date: '03 Ekim 2026',
    content: 'Fakülte deneme tarlalarında yapılacak sonbahar ekim ve bakım uygulamaları programı duyurulmuştur.',
    url: 'https://ziraat.kilis.edu.tr/tr/announcement-all',
    facultyId: 'ziraat',
    facultyName: 'Ziraat Fakültesi',
    departmentId: 'bahce-bitkileri',
    departmentName: 'Bahçe Bitkileri Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://ziraat.kilis.edu.tr/tr/announcement-all'
  },

  // Uygulamalı Bilimler Fakültesi
  {
    id: 'dept-ann-ubf-1',
    title: 'Gastronomi ve Mutfak Sanatları Uygulama Mutfağı Bıçak Seti ve Hijyen Kuralları',
    date: '04 Ekim 2026',
    content: 'Temel mutfak teknikleri dersi aşçı kıyafeti, güvenlik talimatnamesi ve malzeme temin rehberi açıklandı.',
    url: 'https://ubf.kilis.edu.tr/tr/announcement-all',
    facultyId: 'ubf',
    facultyName: 'Uygulamalı Bilimler Fakültesi',
    departmentId: 'gastronomi',
    departmentName: 'Gastronomi ve Mutfak Sanatları Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://ubf.kilis.edu.tr/tr/announcement-all'
  },

  // İletişim Fakültesi
  {
    id: 'dept-ann-iletisim-1',
    title: 'Yeni Medya ve İletişim Bölümü Stüdyo Çekim ve Kurgu Masaları Randevu Sistemi',
    date: '03 Ekim 2026',
    content: 'Video prodüksiyon ve ses kayıt stüdyolarının öğrenci projeleri için rezervasyon takvimi açıldı.',
    url: 'https://iletisim.kilis.edu.tr/tr/announcement-all',
    facultyId: 'iletisim',
    facultyName: 'İletişim Fakültesi',
    departmentId: 'yeni-medya',
    departmentName: 'Yeni Medya ve İletişim Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://iletisim.kilis.edu.tr/tr/announcement-all'
  },

  // Güzel Sanatlar ve Tasarım Fakültesi
  {
    id: 'dept-ann-gsf-1',
    title: 'Geleneksel Türk Sanatları Tezhip ve Ebru Atölyesi Serbest Çalışma Saatleri',
    date: '02 Ekim 2026',
    content: 'Atölye dersliği malzeme dolapları tahsisi ve ders dışı atölye kullanım yönergesi ilan edilmiştir.',
    url: 'https://gstf.kilis.edu.tr/tr/announcement-all',
    facultyId: 'gsf',
    facultyName: 'Güzel Sanatlar ve Tasarım Fakültesi',
    departmentId: 'geleneksel-sanatlar',
    departmentName: 'Geleneksel Türk Sanatları Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://gstf.kilis.edu.tr/tr/announcement-all'
  },

  // Lisansüstü Eğitim Enstitüsü
  {
    id: 'dept-ann-lee-1',
    title: 'Lisansüstü Eğitim Enstitüsü Yüksek Lisans Tez Savunma Jürisi ve Ciltli Tez Teslimi',
    date: '05 Ekim 2026',
    content: 'Tez savunma sınavını başarıyla tamamlayan öğrencilerin mezuniyet onay evrakları ve intihal raporu kılavuzu.',
    url: 'https://enstitu.kilis.edu.tr/tr/announcement-all',
    facultyId: 'lee',
    facultyName: 'Lisansüstü Eğitim Enstitüsü',
    departmentId: 'lee-anabilim',
    departmentName: 'Enstitü Ana Bilim Dalları',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://enstitu.kilis.edu.tr/tr/announcement-all'
  },

  // Yabancı Diller Yüksekokulu
  {
    id: 'dept-ann-yadyo-1',
    title: 'Yabancı Diller Hazırlık Sınıfları Seviye Grupları (A1-A2-B1) ve Derslik Listeleri',
    date: '05 Ekim 2026',
    content: 'Zorunlu ve isteğe bağlı İngilizce/Arapça hazırlık sınıfları ders programı ve ders kitabı temin kılavuzu.',
    url: 'https://yadyo.kilis.edu.tr/tr/announcement-all',
    facultyId: 'yadyo',
    facultyName: 'Yabancı Diller Yüksekokulu',
    departmentId: 'yabanci-diller-hazirlik',
    departmentName: 'Yabancı Diller Hazırlık & Bölüm',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://yadyo.kilis.edu.tr/tr/announcement-all'
  },

  // Teknik Bilimler MYO
  {
    id: 'dept-ann-tbmyo-1',
    title: 'Teknik Bilimler MYO Bilgisayar Programcılığı Laboratuvarı ve Yazılım Geliştirme Sınavları',
    date: '04 Ekim 2026',
    content: 'Veritabanı Yönetimi ve Web Tasarımı dersi laboratuvar sınav oturumları çizelgesi yayınlanmıştır.',
    url: 'https://tbmyo.kilis.edu.tr/tr/announcement-all',
    facultyId: 'tbmyo',
    facultyName: 'Teknik Bilimler Meslek Yüksekokulu',
    departmentId: 'bilgisayar-teknolojileri',
    departmentName: 'Bilgisayar Teknolojileri Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://tbmyo.kilis.edu.tr/tr/announcement-all'
  },

  // Sosyal Bilimler MYO
  {
    id: 'dept-ann-sbmyo-1',
    title: 'Sosyal Bilimler MYO Dış Ticaret ve Muhasebe Zorunlu Staj Defteri Değerlendirme Komisyonu',
    date: '03 Ekim 2026',
    content: 'Yaz döneminde yapılan 30 iş günü stajın evrak kontrol günleri ve mülakat salonları ilan edildi.',
    url: 'https://sbmyo.kilis.edu.tr/tr/announcement-all',
    facultyId: 'sbmyo',
    facultyName: 'Sosyal Bilimler Meslek Yüksekokulu',
    departmentId: 'dis-ticaret',
    departmentName: 'Dış Ticaret Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://sbmyo.kilis.edu.tr/tr/announcement-all'
  },

  // Sağlık Hizmetleri MYO
  {
    id: 'dept-ann-shmyo-1',
    title: 'Sağlık Hizmetleri MYO İlk ve Acil Yardım (Paramedik) Ambulans Sürüş ve Resüsitasyon Eğitimi',
    date: '04 Ekim 2026',
    content: 'Simülasyon laboratuvarında yapılacak acil vaka müdahale istasyonları öğrenci grupları açıklandı.',
    url: 'https://shmyo.kilis.edu.tr/tr/announcement-all',
    facultyId: 'shmyo',
    facultyName: 'Sağlık Hizmetleri Meslek Yüksekokulu',
    departmentId: 'tibbi-hizmetler',
    departmentName: 'Tıbbi Hizmetler ve Teknikler',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://shmyo.kilis.edu.tr/tr/announcement-all'
  },

  // Turizm ve Otelcilik MYO
  {
    id: 'dept-ann-tomyo-1',
    title: 'Turizm ve Otel İşletmeciliği Bölümü Uygulama Oteli Ön Büro ve Kat Hizmetleri Stajı',
    date: '03 Ekim 2026',
    content: 'K7AÜ Konukevi ve Uygulama Otelinde rotasyonlu olarak yapılacak pratik ders çizelgesi yayınlandı.',
    url: 'https://tomyo.kilis.edu.tr/tr/announcement-all',
    facultyId: 'tomyo',
    facultyName: 'Turizm ve Otelcilik Meslek Yüksekokulu',
    departmentId: 'turizm-otel-isletmeciligi',
    departmentName: 'Turizm ve Otel İşletmeciliği Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://tomyo.kilis.edu.tr/tr/announcement-all'
  },

  // Alaeddin Yavaşca Devlet Konservatuvarı
  {
    id: 'dept-ann-konservatuvar-1',
    title: 'Konservatuvar Türk Müziği Bölümü Bireysel Enstrüman ve Ses Eğitimi Ders Saatleri',
    date: '04 Ekim 2026',
    content: 'Ney, Kanun, Ud, Keman ve Tanbur bireysel çalışma odaları tahsisi ve haftalık hoca programı.',
    url: 'https://konservatuvar.kilis.edu.tr/tr/announcement-all',
    facultyId: 'konservatuvar',
    facultyName: 'Alaeddin Yavaşca Devlet Konservatuvarı',
    departmentId: 'turk-muzigi',
    departmentName: 'Türk Müziği Bölümü',
    category: 'Bölüm Duyuruları',
    sourceUrl: 'https://konservatuvar.kilis.edu.tr/tr/announcement-all'
  },

  // Daire Başkanlıkları
  {
    id: 'dept-ann-oidb-1',
    title: 'Öğrenci İşleri Daire Başkanlığı Çift Anadal / Yandal ve Yatay Geçiş Kesin Kayıt Duyurusu',
    date: '05 Ekim 2026',
    content: 'Asil listeden kazanan adayların OBS kayıt onayı ve intibak işlemleri kılavuzu yayınlanmıştır.',
    url: 'https://ogrenciisleri.kilis.edu.tr/tr/announcement-all',
    facultyId: 'dairebaskanliklari',
    facultyName: 'Daire Başkanlıkları',
    departmentId: 'oidb-haber',
    departmentName: 'Öğrenci İşleri Daire Başkanlığı',
    category: 'Daire Duyuruları',
    sourceUrl: 'https://ogrenciisleri.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-sks-1',
    title: 'Sağlık Kültür ve Spor Daire Başkanlığı Öğrenci Toplulukları Faaliyet ve Bütçe Başvuruları',
    date: '04 Ekim 2026',
    content: 'Yeni kurulacak veya yenileme yapacak kulüpler için tüzük teslimi ve salon tahsis takvimi.',
    url: 'https://sks.kilis.edu.tr/tr/announcement-all',
    facultyId: 'dairebaskanliklari',
    facultyName: 'Daire Başkanlıkları',
    departmentId: 'sks-haber',
    departmentName: 'Sağlık, Kültür ve Spor Daire Başkanlığı',
    category: 'Daire Duyuruları',
    sourceUrl: 'https://sks.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-kutuphane-1',
    title: 'Kütüphane Daire Başkanlığı Turnitin & iThenticate Akademik İntihal Raporu Eğitimi',
    date: '03 Ekim 2026',
    content: 'Lisansüstü tez ve makale taramalarında kullanılan veritabanları online kullanıcı semineri.',
    url: 'https://kutuphane.kilis.edu.tr/tr/announcement-all',
    facultyId: 'dairebaskanliklari',
    facultyName: 'Daire Başkanlıkları',
    departmentId: 'kutuphane-haber',
    departmentName: 'Kütüphane ve Dokümantasyon Daire Başkanlığı',
    category: 'Daire Duyuruları',
    sourceUrl: 'https://kutuphane.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-bidb-1',
    title: 'Bilgi İşlem Daire Başkanlığı Kampüs İnternet Güvenlik Sertifikası Güncellemesi',
    date: '02 Ekim 2026',
    content: 'Mobil cihazlarda Eduroam bağlantı sorunu yaşayan kullanıcılar için yeni SSL profil yükleme rehberi.',
    url: 'https://bilgiislem.kilis.edu.tr/tr/announcement-all',
    facultyId: 'dairebaskanliklari',
    facultyName: 'Daire Başkanlıkları',
    departmentId: 'bidb-haber',
    departmentName: 'Bilgi İşlem Daire Başkanlığı',
    category: 'Daire Duyuruları',
    sourceUrl: 'https://bilgiislem.kilis.edu.tr/tr/announcement-all'
  },

  // Koordinatörlükler
  {
    id: 'dept-ann-erasmus-1',
    title: 'Erasmus Koordinatörlüğü 2026-2027 Güz Yabancı Dil Yazılı ve Sözlü Sınav Yönergesi',
    date: '05 Ekim 2026',
    content: 'İngilizce sınav giriş belgeleri, sınav salonları ve mülakat saatleri çizelgesi ilan edilmiştir.',
    url: 'https://uluslararasi.kilis.edu.tr/tr/announcement-all',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'erasmus-haber',
    departmentName: 'Uluslararası İlişkiler & Erasmus Koordinatörlüğü',
    category: 'Koordinatörlük Duyuruları',
    sourceUrl: 'https://uluslararasi.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-projeler-1',
    title: 'Proje Destek Ofisi TÜBİTAK 1001 ve 3501 Araştırma Projeleri Çağrı Takvimi',
    date: '04 Ekim 2026',
    content: 'Proje hazırlama aşamasındaki akademisyenlere yönelik ön inceleme ve bütçe kontrol takvimi açıklandı.',
    url: 'https://projeler.kilis.edu.tr/tr/announcement-all',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'projeler-haber',
    departmentName: 'Proje Destek Ofisi & BAP Koordinatörlüğü',
    category: 'Koordinatörlük Duyuruları',
    sourceUrl: 'https://projeler.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-karyam-1',
    title: 'Kariyer Merkezi (KARMER) Özgeçmiş (CV) Hazırlama ve Mülakat Teknikleri Atölyesi',
    date: '03 Ekim 2026',
    content: 'Mezuniyet aşamasındaki öğrencilere yönelik sertifikalı kariyer semineri kayıtları başlamıştır.',
    url: 'https://karmer.kilis.edu.tr/tr/announcement-all',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'karyam-haber',
    departmentName: 'Kariyer Planlama Uygulama ve Araştırma Merkezi (KARMER)',
    category: 'Koordinatörlük Duyuruları',
    sourceUrl: 'https://karmer.kilis.edu.tr/tr/announcement-all'
  },
  {
    id: 'dept-ann-uzem-1',
    title: 'UZEM Ortak Zorunlu Dersler (Atatürk İlkeleri, Türk Dili, Yabancı Dil) Ara Sınav Tarihleri',
    date: '02 Ekim 2026',
    content: 'ALMS sınav modülü üzerinden online yapılacak vize sınavlarının oturum saatleri ilan edilmiştir.',
    url: 'https://uzem.kilis.edu.tr/tr/announcement-all',
    facultyId: 'koordinatorluk',
    facultyName: 'Koordinatörlükler & Merkezler',
    departmentId: 'uzem-haber',
    departmentName: 'Uzaktan Eğitim Uygulama ve Araştırma Merkezi (UZEM)',
    category: 'Koordinatörlük Duyuruları',
    sourceUrl: 'https://uzem.kilis.edu.tr/tr/announcement-all'
  }
];
