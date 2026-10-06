import { AcademicDepartmentUnit, DepartmentNewsItem, StaffUnitCategory } from '../types';

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
