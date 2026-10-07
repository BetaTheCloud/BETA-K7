import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

import { BolognaFaculty, BolognaDepartment, BolognaCourse } from '../types';
import {
  BookOpen,
  GraduationCap,
  Building2,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Search,
  X,
  Layers,
  Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getApiUrl, safeFetch } from '../config';
import { getStoredWithTTL, setStoredWithTTL, CACHE_TTL } from '../mockData';
import LoadingState from '../components/LoadingState';

const DEGREE_TYPES = [
  { id: 'myo', name: 'Ön Lisans', icon: 'Award', desc: '2 Yıllık Meslek Yüksekokulu Programları' },
  { id: 'lis', name: 'Lisans', icon: 'GraduationCap', desc: '4-6 Yıllık Fakülte ve Yüksekokul Programları' },
  { id: 'yls', name: 'Yüksek Lisans', icon: 'BookOpen', desc: 'Tezli / Tezsiz Lisansüstü Programları' },
  { id: 'dok', name: 'Doktora', icon: 'Library', desc: 'Doktora ve Sanatta Yeterlik Programları' }
];

// Rich fallback courses for key sample departments
const SAMPLE_CS_COURSES: BolognaCourse[] = [
  // Hazırlık Sınıfı
  { id: 'crs-prep-1', code: 'YDL001', name: 'Zorunlu Yabancı Dil Hazırlık (İngilizce I)', semester: 0, ects: 15, credit: '12', type: 'Zorunlu', language: 'İngilizce', description: 'Temel ve orta düzey İngilizce dilbilgisi, okuma ve dinleme becerileri.', outcomes: ['B1 düzeyinde yabancı dil hakimiyeti', 'Mesleki teknik terimleri anlama'] },
  { id: 'crs-prep-2', code: 'YDL002', name: 'Zorunlu Yabancı Dil Hazırlık (İngilizce II)', semester: 0, ects: 15, credit: '12', type: 'Zorunlu', language: 'İngilizce', description: 'İleri düzey İngilizce yazma, konuşma ve sunum becerileri.', outcomes: ['Akademik makale ve teknik dokümantasyon okuma'] },

  // 1. Sınıf - Güz (1. Yarıyıl)
  { id: 'crs-101', code: 'MAT101', name: 'Matematik I (Kalkülüs)', semester: 1, ects: 6, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Fonksiyonlar, limit, süreklilik, türev ve integral uygulamaları.', outcomes: ['Limit ve türev kavramlarını mühendislik problemlerine uygulama'] },
  { id: 'crs-102', code: 'FIZ101', name: 'Fizik I (Mekanik)', semester: 1, ects: 6, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Vektörler, hareket kanunları, iş ve enerji, momentum.', outcomes: ['Klasik mekanik prensiplerini analiz etme'] },
  { id: 'crs-103', code: 'BM101', name: 'Bilgisayar Mühendisliğine Giriş', semester: 1, ects: 4, credit: '2', type: 'Zorunlu', language: 'Türkçe', description: 'Bilişim alanları, donanım mimarisi, etik ve kariyer yolları.', outcomes: ['Bilgisayar mühendisliği alt disiplinlerini kavrama'] },
  { id: 'crs-104', code: 'BM103', name: 'Programlama Temelleri I (C/C++)', semester: 1, ects: 6, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Temel algoritma yapısı, değişkenler, döngüler ve diziler.', outcomes: ['Algoritmik düşünme ve C programlama'] },
  { id: 'crs-105', code: 'TDL101', name: 'Türk Dili I', semester: 1, ects: 2, credit: '2', type: 'Zorunlu', language: 'Türkçe', description: 'Yazılı ve sözlü anlatım kuralları.', outcomes: ['Etkili akademik iletişim kurma'] },
  { id: 'crs-106', code: 'AIT101', name: 'Atatürk İlkeleri ve İnkılap Tarihi I', semester: 1, ects: 2, credit: '2', type: 'Zorunlu', language: 'Türkçe', description: 'Modern Türkiye Cumhuriyeti tarihi ve devrimler.', outcomes: ['Tarihsel süreçleri analiz etme'] },
  { id: 'crs-107', code: 'YDL101', name: 'Yabancı Dil I (İngilizce)', semester: 1, ects: 4, credit: '3', type: 'Zorunlu', language: 'İngilizce', description: 'Genel İngilizce gramer ve okuma becerileri.', outcomes: ['Mesleki İngilizceye hazırlık'] },

  // 1. Sınıf - Bahar (2. Yarıyıl)
  { id: 'crs-201', code: 'MAT102', name: 'Matematik II', semester: 2, ects: 6, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'İntegrasyon teknikleri, çok değişkenli fonksiyonlar, seriler.', outcomes: ['Çok katlı integralleri çözebilme'] },
  { id: 'crs-202', code: 'FIZ102', name: 'Fizik II (Elektrik ve Manyetizma)', semester: 2, ects: 6, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Elektrostatik, manyetizma, Maxwell denklemleri.', outcomes: ['Elektromanyetik alan teorisini anlama'] },
  { id: 'crs-203', code: 'BM104', name: 'Nesne Yönelimli Programlama (Java)', semester: 2, ects: 6, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Sınıflar, nesneler, kalıtım, polimorfizm ve soyutlama.', outcomes: ['OOP ilkeleriyle yazılım geliştirme'] },
  { id: 'crs-204', code: 'BM106', name: 'Ayrık Matematik (Discrete Math)', semester: 2, ects: 6, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'Kümeler, bağıntılar, çizge kuramı ve kombinatorik.', outcomes: ['Algoritma analizi için matematiksel modelleme'] },
  { id: 'crs-205', code: 'TDL102', name: 'Türk Dili II', semester: 2, ects: 2, credit: '2', type: 'Zorunlu', language: 'Türkçe', description: 'Akademik rapor ve sunum hazırlama teknikleri.', outcomes: ['Raporlama kabiliyeti'] },
  { id: 'crs-206', code: 'AIT102', name: 'Atatürk İlkeleri ve İnkılap Tarihi II', semester: 2, ects: 2, credit: '2', type: 'Zorunlu', language: 'Türkçe', description: 'Cumhuriyet dönemi siyasal ve ekonomik gelişmeler.', outcomes: ['Çağdaş Türkiye analizi'] },
  { id: 'crs-207', code: 'YDL102', name: 'Yabancı Dil II (İngilizce)', semester: 2, ects: 2, credit: '2', type: 'Zorunlu', language: 'İngilizce', description: 'Mesleki yabancı dil okuma ve dinleme.', outcomes: ['İngilizce dokümanları kavrama'] },

  // 2. Sınıf - Güz (3. Yarıyıl)
  { id: 'crs-301', code: 'BM201', name: 'Veri Yapıları ve Algoritmalar', semester: 3, ects: 7, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Bağlı listeler, yığınlar, kuyruklar, ağaçlar ve grafik algoritmaları.', outcomes: ['Karmaşıklık analizi ve optimize veri yapıları tasarımı'] },
  { id: 'crs-302', code: 'BM203', name: 'Mantıksal Devre Tasarımı', semester: 3, ects: 6, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Boole cebri, kombinasyonel ve ardışıl devreler, FPGA.', outcomes: ['Sayısal donanım tasarımı'] },
  { id: 'crs-303', code: 'MAT201', name: 'Diferansiyel Denklemler', semester: 3, ects: 5, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'Birinci ve yüksek mertebeden diferansiyel denklemler.', outcomes: ['Dinamik sistemleri matematiksel olarak modelleme'] },
  { id: 'crs-304', code: 'MAT203', name: 'Lineer Cebir', semester: 3, ects: 5, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'Matrisler, vektör uzayları, özdeğerler ve özvektörler.', outcomes: ['Lineer dönüşümleri ve yapay zeka temellerini kavrama'] },
  { id: 'crs-305', code: 'SEC201', name: 'Teknik Seçmeli I (Python ile Veri Analizi)', semester: 3, ects: 4, credit: '3', type: 'Seçmeli', language: 'Türkçe', description: 'Pandas, NumPy ve veri manipülasyonu.', outcomes: ['Büyük veri analitiği'] },
  { id: 'crs-306', code: 'ISG201', name: 'İş Sağlığı ve Güvenliği I', semester: 3, ects: 3, credit: '2', type: 'Zorunlu', language: 'Türkçe', description: 'İş güvenliği mevzuatı ve risk değerlendirmesi.', outcomes: ['Laboratuvar ve iş güvenliği kurallarına uyum'] },

  // 2. Sınıf - Bahar (4. Yarıyıl)
  { id: 'crs-401', code: 'BM202', name: 'Veritabanı Yönetim Sistemleri', semester: 4, ects: 7, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'İlişkisel veritabanı, SQL, normalizasyon ve indeksleme.', outcomes: ['Veritabanı mimarisi kurma ve sorgu optimizasyonu'] },
  { id: 'crs-402', code: 'BM204', name: 'Bilgisayar Mimarisi ve Organizasyonu', semester: 4, ects: 6, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'İşlemci tasarımı, bellek hiyerarşisi, Assembly dili.', outcomes: ['Düşük seviyeli sistem mimarilerini anlama'] },
  { id: 'crs-403', code: 'MAT202', name: 'Olasılık ve İstatistik', semester: 4, ects: 5, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'Olasılık dağılımları, hipotez testleri, regresyon.', outcomes: ['İstatiksel karar verme'] },
  { id: 'crs-404', code: 'BM206', name: 'Web Programlama', semester: 4, ects: 5, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'HTML, CSS, JavaScript, React ve REST API entegrasyonu.', outcomes: ['Modern web uygulamaları geliştirme'] },
  { id: 'crs-405', code: 'SEC202', name: 'Teknik Seçmeli II (Mobil Uygulama Geliştirme)', semester: 4, ects: 4, credit: '3', type: 'Seçmeli', language: 'Türkçe', description: 'Flutter ve React Native ile mobil uygulama geliştirme.', outcomes: ['Çok platformlu mobil mimari'] },
  { id: 'crs-406', code: 'ISG202', name: 'İş Sağlığı ve Güvenliği II', semester: 4, ects: 3, credit: '2', type: 'Zorunlu', language: 'Türkçe', description: 'Endüstriyel kazalar ve ergonomi.', outcomes: ['Çalışma ortamı analizi'] },

  // 3. Sınıf - Güz (5. Yarıyıl)
  { id: 'crs-501', code: 'BM301', name: 'İşletim Sistemleri (Operating Systems)', semester: 5, ects: 7, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Süreç yönetimi, iş parçacıkları (threads), bellek yönetimi ve dosya sistemleri.', outcomes: ['Eşzamanlılık ve senkronizasyon algoritmaları'] },
  { id: 'crs-502', code: 'BM303', name: 'Yazılım Mühendisliği', semester: 5, ects: 6, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'Agile/Scrum metodolojileri, UML, test süreçleri ve yazılım yaşam döngüsü.', outcomes: ['Büyük ölçekli yazılım mimarisi yönetimi'] },
  { id: 'crs-503', code: 'BM305', name: 'Bilgisayar Ağları (Computer Networks)', semester: 5, ects: 6, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'OSI ve TCP/IP modeli, yönlendirme protokolleri, soket programlama.', outcomes: ['Ağ mimarisi yapılandırma ve analiz'] },
  { id: 'crs-504', code: 'SEC301', name: 'Teknik Seçmeli III (Yapay Zekaya Giriş)', semester: 5, ects: 6, credit: '3', type: 'Seçmeli', language: 'Türkçe', description: 'Arama algoritmaları, sezgisel yöntemler ve makine öğrenmesi temelleri.', outcomes: ['Yapay zeka modelleri kurabilme'] },
  { id: 'crs-505', code: 'STJ301', name: 'Yaz Stajı I (Donanım/Yazılım)', semester: 5, ects: 5, credit: '0', type: 'Zorunlu', language: 'Türkçe', description: '20 iş günü endüstriyel kurum stajı ve raporlama.', outcomes: ['Sektörel tecrübe ve ekip çalışması'] },

  // 3. Sınıf - Bahar (6. Yarıyıl)
  { id: 'crs-601', code: 'BM302', name: 'Algoritma Analizi ve Tasarımı', semester: 6, ects: 7, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Dinamik programlama, açgözlü algoritmalar, NP-tam problemler.', outcomes: ['Karmaşık algoritmaları optimize edebilme'] },
  { id: 'crs-602', code: 'BM304', name: 'Siber Güvenlik ve Kriptografi', semester: 6, ects: 6, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'Şifreleme algoritmaları, ağ güvenliği, sızma testi temelleri.', outcomes: ['Güvenli yazılım ve ağ protokolleri geliştirme'] },
  { id: 'crs-603', code: 'BM306', name: 'Gömülü Sistemler ve Mikrodenetleyiciler', semester: 6, ects: 6, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'ARM, Arduino, sensörler ve gerçek zamanlı sistemler.', outcomes: ['IoT ve donanım entegrasyonu'] },
  { id: 'crs-604', code: 'SEC302', name: 'Teknik Seçmeli IV (Derin Öğrenme & Görüntü İşleme)', semester: 6, ects: 6, credit: '3', type: 'Seçmeli', language: 'Türkçe', description: 'CNN, PyTorch/TensorFlow ile nesne tanıma.', outcomes: ['Bilgisayarlı görü modelleri geliştirme'] },
  { id: 'crs-605', code: 'SEC304', name: 'Sosyal Seçmeli I (Proje Yönetimi ve Girişimcilik)', semester: 6, ects: 5, credit: '2', type: 'Seçmeli', language: 'Türkçe', description: 'Girişimcilik modelleri, TÜBİTAK/KOSGEB teşvikleri.', outcomes: ['İş fikri geliştirme ve sunum'] },

  // 4. Sınıf - Güz (7. Yarıyıl)
  { id: 'crs-701', code: 'BM401', name: 'Mühendislik Tasarımı (Bitirme Projesi I)', semester: 7, ects: 8, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'Kapsamlı bir mühendislik probleminin analiz, tasarım ve prototiplenmesi.', outcomes: ['Özgün mühendislik sistemi tasarlama'] },
  { id: 'crs-702', code: 'BM403', name: 'Bulut Bilişim ve Dağıtık Sistemler', semester: 7, ects: 6, credit: '3', type: 'Zorunlu', language: 'Türkçe', description: 'Docker, Kubernetes, AWS/GCP mimarileri ve mikroservisler.', outcomes: ['Ölçeklenebilir bulut mimarileri kurma'] },
  { id: 'crs-703', code: 'SEC401', name: 'Teknik Seçmeli V (Büyük Veri Mimarileri)', semester: 7, ects: 6, credit: '3', type: 'Seçmeli', language: 'Türkçe', description: 'Hadoop, Spark ve NoSQL veri tabanları.', outcomes: ['Yüksek hacimli veri işleme'] },
  { id: 'crs-704', code: 'SEC403', name: 'Teknik Seçmeli VI (Doğal Dil İşleme / LLM)', semester: 7, ects: 5, credit: '3', type: 'Seçmeli', language: 'Türkçe', description: 'Transformer mimarileri, metin sınıflandırma ve prompt engineering.', outcomes: ['Modern yapay zeka dil modellerini uygulama'] },
  { id: 'crs-705', code: 'STJ401', name: 'Yaz Stajı II (Yazılım/Ar-Ge)', semester: 7, ects: 5, credit: '0', type: 'Zorunlu', language: 'Türkçe', description: '20 iş günü kurumsal yazılım stajı.', outcomes: ['Profesyonel iş deneyimi'] },

  // 4. Sınıf - Bahar (8. Yarıyıl)
  { id: 'crs-801', code: 'BM402', name: 'Bitirme Tezi ve Projesi II', semester: 8, ects: 10, credit: '4', type: 'Zorunlu', language: 'Türkçe', description: 'Bitirme projesinin tamamlanması, tez yazımı ve jüri önünde sunumu.', outcomes: ['Çalışır prototip ve akademik tez sunumu'] },
  { id: 'crs-802', code: 'BM404', name: 'Mühendislik Etiği ve Fikri Mülkiyet', semester: 8, ects: 4, credit: '2', type: 'Zorunlu', language: 'Türkçe', description: 'Patent hakları, telif, mesleki sorumluluklar ve etik ilkeler.', outcomes: ['Mühendislik etiği bilinci'] },
  { id: 'crs-803', code: 'SEC402', name: 'Teknik Seçmeli VII (Blokzincir ve Akıllı Sözleşmeler)', semester: 8, ects: 6, credit: '3', type: 'Seçmeli', language: 'Türkçe', description: 'Ethereum, Solidity ve merkeziyetsiz uygulamalar (dApps).', outcomes: ['Web3 ve blokzincir geliştirme'] },
  { id: 'crs-804', code: 'SEC404', name: 'Teknik Seçmeli VIII (DevOps ve CI/CD Süreçleri)', semester: 8, ects: 6, credit: '3', type: 'Seçmeli', language: 'Türkçe', description: 'GitHub Actions, Jenkins, otomatik test ve dağıtım boru hatları.', outcomes: ['Sürekli entegrasyon ve dağıtım yönetimi'] },
  { id: 'crs-805', code: 'SEC406', name: 'Serbest Seçmeli (Yenilikçilik ve Liderlik)', semester: 8, ects: 4, credit: '2', type: 'Seçmeli', language: 'Türkçe', description: 'Takım yönetimi ve yenilikçi liderlik stratejileri.', outcomes: ['Liderlik becerileri'] }
];

const FALLBACK_BOLOGNA_FACULTIES: Record<string, BolognaFaculty[]> = {
  lis: [
    {
      id: 'fac-lis-1',
      name: 'Mühendislik - Mimarlık Fakültesi',
      departments: [
        { id: 'dep-101', name: 'Bilgisayar Mühendisliği', description: 'Lisans Programı', sUnitId: '101', courses: SAMPLE_CS_COURSES },
        { id: 'dep-102', name: 'Elektrik - Elektronik Mühendisliği', description: 'Lisans Programı', sUnitId: '102' },
        { id: 'dep-103', name: 'İnşaat Mühendisliği', description: 'Lisans Programı', sUnitId: '103' },
        { id: 'dep-104', name: 'Makine Mühendisliği', description: 'Lisans Programı', sUnitId: '104' },
      ]
    },
    {
      id: 'fac-lis-2',
      name: 'İktisadi ve İdari Bilimler Fakültesi',
      departments: [
        { id: 'dep-201', name: 'İktisat', description: 'Lisans Programı', sUnitId: '201' },
        { id: 'dep-202', name: 'İşletme', description: 'Lisans Programı', sUnitId: '202' },
        { id: 'dep-203', name: 'Siyaset Bilimi ve Kamu Yönetimi', description: 'Lisans Programı', sUnitId: '203' }
      ]
    },
    {
      id: 'fac-lis-3',
      name: 'Fen Fakültesi',
      departments: [
        { id: 'dep-301', name: 'Matematik', description: 'Lisans Programı', sUnitId: '301' },
        { id: 'dep-302', name: 'Moleküler Biyoloji ve Genetik', description: 'Lisans Programı', sUnitId: '302' },
        { id: 'dep-303', name: 'Kimya', description: 'Lisans Programı', sUnitId: '303' }
      ]
    },
    {
      id: 'fac-lis-4',
      name: 'İlahiyat Fakültesi',
      departments: [
        { id: 'dep-401', name: 'İlahiyat', description: 'Lisans Programı (Zorunlu Arapça Hazırlık Sınıfı Bulunmaktadır)', sUnitId: '401' }
      ]
    },
    {
      id: 'fac-lis-5',
      name: 'İnsan ve Toplum Bilimleri Fakültesi',
      departments: [
        { id: 'dep-501', name: 'Tarih', description: 'Lisans Programı', sUnitId: '501' },
        { id: 'dep-502', name: 'Türk Dili ve Edebiyatı', description: 'Lisans Programı', sUnitId: '502' },
        { id: 'dep-503', name: 'Felsefe', description: 'Lisans Programı', sUnitId: '503' }
      ]
    },
    {
      id: 'fac-lis-6',
      name: 'Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi',
      departments: [
        { id: 'dep-601', name: 'Hemşirelik', description: 'Lisans Programı', sUnitId: '601' },
        { id: 'dep-602', name: 'Beslenme ve Diyetetik', description: 'Lisans Programı', sUnitId: '602' }
      ]
    }
  ],
  myo: [
    {
      id: 'fac-myo-1',
      name: 'Teknik Bilimler Meslek Yüksekokulu',
      departments: [
        { id: 'dep-701', name: 'Bilgisayar Programcılığı', description: 'Ön Lisans Programı (2 Yıl)', sUnitId: '701' },
        { id: 'dep-702', name: 'Elektrik', description: 'Ön Lisans Programı (2 Yıl)', sUnitId: '702' },
        { id: 'dep-703', name: 'İnşaat Teknolojisi', description: 'Ön Lisans Programı (2 Yıl)', sUnitId: '703' }
      ]
    },
    {
      id: 'fac-myo-2',
      name: 'Sağlık Hizmetleri Meslek Yüksekokulu',
      departments: [
        { id: 'dep-801', name: 'İlk ve Acil Yardım (Paramedik)', description: 'Ön Lisans Programı (2 Yıl)', sUnitId: '801' },
        { id: 'dep-802', name: 'Tıbbi Laboratuvar Teknikleri', description: 'Ön Lisans Programı (2 Yıl)', sUnitId: '802' },
        { id: 'dep-803', name: 'Optisyenlik', description: 'Ön Lisans Programı (2 Yıl)', sUnitId: '803' }
      ]
    },
    {
      id: 'fac-myo-3',
      name: 'Sosyal Bilimler Meslek Yüksekokulu',
      departments: [
        { id: 'dep-901', name: 'Muhasebe ve Vergi Uygulamaları', description: 'Ön Lisans Programı (2 Yıl)', sUnitId: '901' },
        { id: 'dep-902', name: 'Büro Yönetimi ve Yönetici Asistanlığı', description: 'Ön Lisans Programı (2 Yıl)', sUnitId: '902' }
      ]
    }
  ]
};

/**
 * Helper to compute rich descriptive Turkish labels for semesters
 * (1. Sınıf - Güz Dönemi, Hazırlık Sınıfı, vb.)
 */
export function getSemesterInfo(semester: number) {
  if (semester === 0) {
    return {
      semesterNumber: 0,
      title: 'Hazırlık Sınıfı (Yabancı Dil)',
      shortLabel: 'Hazırlık',
      classText: 'Hazırlık Sınıfı',
      termText: 'Zorunlu / İsteğe Bağlı',
      fullTitle: 'Hazırlık Sınıfı (Yabancı Dil Eğitimi)'
    };
  }

  const grade = Math.ceil(semester / 2);
  const isFall = semester % 2 === 1;
  const termText = isFall ? 'Güz Dönemi' : 'Bahar Dönemi';

  return {
    semesterNumber: semester,
    title: `${semester}. Yarıyıl (${grade}. Sınıf - ${termText})`,
    shortLabel: `${semester}. Yarıyıl`,
    classText: `${grade}. Sınıf`,
    termText: termText,
    fullTitle: `${semester}. Yarıyıl (${grade}. Sınıf - ${termText})`
  };
}

export default function Bologna() {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState<BolognaFaculty[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeDegreeType, setActiveDegreeType] = useState<{ id: string; name: string } | null>(null);
  const [activeFaculty, setActiveFaculty] = useState<BolognaFaculty | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<BolognaDepartment | null>(null);
  const [activeCourse, setActiveCourse] = useState<BolognaCourse | null>(null);
  
  // Unified search query for faculties, departments AND courses!
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for collapsible semester accordions
  const [collapsedSemesters, setCollapsedSemesters] = useState<Record<number, boolean>>({});

  // Faculties are loaded when a degree type is selected
  const loadFaculties = async (typeId: string) => {
    const cacheKey = `k7_bologna_faculties_${typeId}`;
    const cached = getStoredWithTTL<BolognaFaculty[]>(cacheKey, CACHE_TTL.BOLOGNA, FALLBACK_BOLOGNA_FACULTIES[typeId] || []);
    if (cached.isFresh && cached.data.length > 0) {
      setFaculties(cached.data);
      return;
    }

    setLoading(true);
    try {
      const response = await safeFetch(getApiUrl(`/api/bologna/faculties?type=${typeId}`));
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setStoredWithTTL(cacheKey, data);
          setFaculties(data);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Canlı Bologna verisi alınamadı, yerleşik fakülteler kullanılıyor:", err);
    } finally {
      setLoading(false);
    }
    setFaculties(cached.data || FALLBACK_BOLOGNA_FACULTIES[typeId] || []);
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  // Scroll to top when view level changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeDegreeType, activeFaculty, activeDepartment, activeCourse]);

  const handleBack = () => {
    setSearchQuery('');
    if (activeCourse) {
      setActiveCourse(null);
    } else if (activeDepartment) {
      setActiveDepartment(null);
    } else if (activeFaculty) {
      setActiveFaculty(null);
    } else if (activeDegreeType) {
      setActiveDegreeType(null);
    } else {
      if (window.history.length > 1) navigate(-1);
      else navigate('/');
    }
  };

  // Toggle semester accordion
  const toggleSemester = (sem: number) => {
    setCollapsedSemesters((prev) => ({
      ...prev,
      [sem]: !prev[sem]
    }));
  };

  // Expand / Collapse all semesters
  const setAllSemesters = (collapsed: boolean) => {
    if (!activeDepartment?.courses) return;
    const allSemesters: number[] = Array.from(new Set<number>(activeDepartment.courses.map((c) => c.semester)));
    const next: Record<number, boolean> = {};
    allSemesters.forEach((s: number) => {
      next[s] = collapsed;
    });
    setCollapsedSemesters(next);
  };

  // Group and filter courses by semester for active department
  const groupedSemesters = useMemo(() => {
    if (!activeDepartment?.courses) return [];
    const courses = activeDepartment.courses;
    
    // Distinct semesters present in department
    const semesterNums: number[] = Array.from(new Set<number>(courses.map((c) => c.semester))).sort((a, b) => a - b);
    
    const query = searchQuery.trim().toLocaleLowerCase('tr');

    return semesterNums.map((sem: number) => {
      const allSemCourses = courses.filter((c) => c.semester === sem);
      const filteredCourses = query
        ? allSemCourses.filter(
            (c) =>
              c.name.toLocaleLowerCase('tr').includes(query) ||
              c.code.toLocaleLowerCase('tr').includes(query) ||
              (c.description && c.description.toLocaleLowerCase('tr').includes(query))
          )
        : allSemCourses;

      const totalEcts = allSemCourses.reduce((sum, c) => sum + (c.ects || 0), 0);
      const info = getSemesterInfo(sem);

      return {
        semester: sem,
        info,
        totalCourses: allSemCourses.length,
        matchingCoursesCount: filteredCourses.length,
        courses: filteredCourses,
        totalEcts
      };
    }).filter((group) => {
      // If user is searching, only show semesters that have matching courses
      if (query) return group.matchingCoursesCount > 0;
      return group.totalCourses > 0;
    });
  }, [activeDepartment, searchQuery]);

  if (loading) {
    return <LoadingState message="Bologna Bilgi Paketi Yükleniyor..." subtitle="Program ve müfredat verileri alınıyor" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl mx-auto pb-12"
    >
      {/* Header & Breadcrumbs */}
      <header className="border-b border-[#e6e2d6] dark:border-white/10 pb-5">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold mb-3 transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-600 dark:text-amber-400" />
          <span>{activeDegreeType ? 'Önceki Seviyeye Dön' : 'Geri Menüye Dön'}</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-amber-600 dark:text-amber-500" strokeWidth={1.75} />
              Bologna Ders Bilgi Sistemi
            </h2>
            <p className="text-stone-500 dark:text-white/60 text-xs sm:text-sm mt-1 font-medium">
              Kilis 7 Aralık Üniversitesi resmi ders planları, AKTS kredileri ve müfredat paketleri.
            </p>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 text-xs font-semibold tracking-wide">
          <button
            onClick={() => {
              setActiveDegreeType(null);
              setActiveFaculty(null);
              setActiveDepartment(null);
              setActiveCourse(null);
              setSearchQuery('');
            }}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
              !activeDegreeType
                ? "bg-amber-600 text-white font-bold"
                : "bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/10"
            )}
          >
            Akademik Birimler
          </button>

          {activeDegreeType && (
            <>
              <ChevronRight strokeWidth={2} className="w-3.5 h-3.5 text-stone-400 dark:text-white/30" />
              <button
                onClick={() => {
                  setActiveFaculty(null);
                  setActiveDepartment(null);
                  setActiveCourse(null);
                  setSearchQuery('');
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                  activeDegreeType && !activeFaculty
                    ? "bg-amber-600 text-white font-bold"
                    : "bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/10"
                )}
              >
                {activeDegreeType.name}
              </button>
            </>
          )}

          {activeFaculty && (
            <>
              <ChevronRight strokeWidth={2} className="w-3.5 h-3.5 text-stone-400 dark:text-white/30" />
              <button
                onClick={() => {
                  setActiveDepartment(null);
                  setActiveCourse(null);
                  setSearchQuery('');
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-xs",
                  activeFaculty && !activeDepartment
                    ? "bg-amber-600 text-white font-bold"
                    : "bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/10"
                )}
                title={activeFaculty.name}
              >
                {activeFaculty.name}
              </button>
            </>
          )}

          {activeDepartment && (
            <>
              <ChevronRight strokeWidth={2} className="w-3.5 h-3.5 text-stone-400 dark:text-white/30" />
              <button
                onClick={() => {
                  setActiveCourse(null);
                  setSearchQuery('');
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-xs",
                  activeDepartment && !activeCourse
                    ? "bg-amber-600 text-white font-bold"
                    : "bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-white/70 hover:bg-stone-200 dark:hover:bg-white/10"
                )}
                title={activeDepartment.name}
              >
                {activeDepartment.name}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content View Container */}
      <AnimatePresence mode="wait">
        {/* LEVEL 0: DEGREE TYPES */}
        {!activeDegreeType && (
          <motion.div
            key="degrees"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {DEGREE_TYPES.map((deg) => (
              <button
                key={deg.id}
                onClick={() => {
                  setActiveDegreeType(deg);
                  loadFaculties(deg.id);
                  setSearchQuery('');
                }}
                className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500/40 hover:shadow-md transition-all group text-center cursor-pointer active:scale-95"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {deg.id === 'myo' && <Building2 strokeWidth={1.5} className="w-8 h-8" />}
                  {deg.id === 'lis' && <GraduationCap strokeWidth={1.5} className="w-8 h-8" />}
                  {deg.id === 'yls' && <BookOpen strokeWidth={1.5} className="w-8 h-8" />}
                  {deg.id === 'dok' && <FileText strokeWidth={1.5} className="w-8 h-8" />}
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {deg.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-white/60 mt-1 leading-relaxed">
                  {deg.desc}
                </p>
                <span className="mt-4 text-xs font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Programları İncele <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </motion.div>
        )}

        {/* LEVEL 1: FACULTIES */}
        {activeDegreeType && !activeFaculty && (
          <motion.div
            key="faculties"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-display font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                {activeDegreeType.name} - Fakülte & Yüksekokul Seçimi
              </h3>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Fakülte veya yüksekokul ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm shadow-sm text-stone-900 dark:text-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Faculty List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(Array.isArray(faculties) ? faculties : [])
                .filter((fac) => fac.name.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr')))
                .map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => {
                      setActiveFaculty(fac);
                      setSearchQuery('');
                    }}
                    className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500/30 hover:shadow-md transition-all text-left group cursor-pointer active:scale-98"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Building2 strokeWidth={1.5} className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-base text-stone-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {fac.name}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-white/60 font-medium">
                        {fac.departments?.length || 0} Aktif Bölüm / Program
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform self-center shrink-0" />
                  </button>
                ))}
            </div>
          </motion.div>
        )}

        {/* LEVEL 2: DEPARTMENTS */}
        {activeFaculty && !activeDepartment && (
          <motion.div
            key="departments"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-display font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                {activeFaculty.name} - Bölüm & Program Seçimi
              </h3>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Bölüm veya program ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#e6e2d6] dark:border-white/10 bg-[#fcfbf9] dark:bg-[#264653] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm shadow-sm text-stone-900 dark:text-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Department Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(activeFaculty.departments || [])
                .filter((dep) => dep.name.toLocaleLowerCase('tr').includes(searchQuery.toLocaleLowerCase('tr')))
                .map((dep) => (
                  <button
                    key={dep.id}
                    onClick={async () => {
                      if (!dep.courses && dep.sUnitId) {
                        const courseCacheKey = `k7_bologna_courses_${dep.sUnitId}`;
                        const cachedCourses = getStoredWithTTL<BolognaCourse[]>(courseCacheKey, CACHE_TTL.BOLOGNA, []);
                        if (cachedCourses.isFresh && cachedCourses.data.length > 0) {
                          setActiveDepartment({ ...dep, courses: cachedCourses.data });
                          setSearchQuery('');
                          return;
                        }

                        setLoading(true);
                        try {
                          const res = await safeFetch(getApiUrl(`/api/bologna/courses?sunit=${dep.sUnitId}`));
                          if (res.ok) {
                            const courseData = await res.json();
                            if (Array.isArray(courseData) && courseData.length > 0) {
                              setStoredWithTTL(courseCacheKey, courseData);
                            }
                            const newDep = { ...dep, courses: courseData };
                            setActiveDepartment(newDep);
                          }
                        } catch (err) {
                          console.error(err);
                          setActiveDepartment({ ...dep, courses: cachedCourses.data || [] });
                        }
                        setLoading(false);
                      } else if (!dep.courses) {
                        setActiveDepartment({ ...dep, courses: [] });
                      } else {
                        setActiveDepartment(dep);
                      }
                      setSearchQuery('');
                    }}
                    className="flex flex-col p-5 rounded-2xl bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500/30 hover:shadow-md transition-all text-left group cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <GraduationCap strokeWidth={1.5} className="w-5 h-5" />
                      </div>
                      <h4 className="font-display font-bold text-base text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {dep.name}
                      </h4>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-white/60 font-medium leading-relaxed mb-4">
                      {dep.description || 'Lisans / Ön Lisans Bologna Ders Paketi ve Program Yeterlilikleri.'}
                    </p>

                    <div className="mt-auto flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                      <span>Ders Planını Görüntüle</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </button>
                ))}
            </div>
          </motion.div>
        )}

        {/* LEVEL 3: COURSES / CURRICULUM WITH SEARCH BAR & ACCORDION SEMESTERS */}
        {activeDepartment && !activeCourse && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            {/* Department Title & Unified Live Course Search Bar */}
            <div className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      {activeFaculty?.name}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-white/50">
                      {activeDepartment.courses?.length || 0} Ders Tanımlı
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-stone-900 dark:text-white mt-1">
                    {activeDepartment.name} Müfredatı
                  </h3>
                </div>

                {/* Quick Expand / Collapse All */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setAllSemesters(false)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer"
                  >
                    Tümünü Aç
                  </button>
                  <button
                    onClick={() => setAllSemesters(true)}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/15 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-all border border-stone-200 dark:border-white/10 active:scale-95 cursor-pointer"
                  >
                    Tümünü Kapat
                  </button>
                </div>
              </div>

              {/* Course Search Input Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-stone-400" strokeWidth={2} />
                </div>
                <input
                  type="text"
                  placeholder="Ders adı, ders kodu veya konu ara (Örn: Matematik, BM101, Algoritma)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white dark:bg-[#1f3743] border border-[#e6e2d6] dark:border-white/10 rounded-xl text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-stone-900 dark:text-white placeholder-stone-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Active Search Result Pill */}
              {searchQuery.trim() && (
                <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-500/20">
                  <span>
                    Arama: &quot;<strong>{searchQuery}</strong>&quot; &bull;{' '}
                    {groupedSemesters.reduce((acc, g) => acc + g.matchingCoursesCount, 0)} ders bulundu
                  </span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-amber-700 dark:text-amber-300 hover:underline font-bold cursor-pointer"
                  >
                    Aramayı Temizle
                  </button>
                </div>
              )}
            </div>

            {/* Semesters Accordion List */}
            {groupedSemesters.length === 0 ? (
              <div className="text-center py-12 bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl p-6">
                <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-3 opacity-60" />
                <h4 className="font-display font-bold text-stone-800 dark:text-white text-base">
                  Aramanıza Uygun Ders Bulunamadı
                </h4>
                <p className="text-stone-500 dark:text-white/60 text-xs mt-1 max-w-sm mx-auto">
                  Arama kelimesini değiştirebilir veya tüm ders planını görüntülemek için aramayı temizleyebilirsiniz.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
                >
                  Tüm Müfredatı Göster
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedSemesters.map((group) => {
                  const isCollapsed = collapsedSemesters[group.semester] === true && !searchQuery.trim();
                  const isExpanded = !isCollapsed;

                  return (
                    <div
                      key={group.semester}
                      className="bg-[#fcfbf9] dark:bg-[#264653] border border-[#e6e2d6] dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
                    >
                      {/* Semester Accordion Header */}
                      <button
                        onClick={() => toggleSemester(group.semester)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 bg-[#f4f1ea]/70 dark:bg-[#264653]/70 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors text-left focus:outline-none cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-sm shrink-0 border border-amber-500/20">
                            {group.semester === 0 ? 'HZ' : group.semester}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 dark:text-white tracking-wide">
                              {group.info.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500 dark:text-white/60 font-medium">
                              <span>{group.courses.length} Ders</span>
                              <span>&bull;</span>
                              <span>{group.totalEcts} Toplam AKTS</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            {group.info.classText} &bull; {group.info.termText}
                          </span>
                          <ChevronDown
                            strokeWidth={2}
                            className={cn(
                              "w-5 h-5 text-stone-400 transition-transform duration-300",
                              isExpanded ? "rotate-180 text-amber-600 dark:text-amber-400" : "rotate-0"
                            )}
                          />
                        </div>
                      </button>

                      {/* Semester Courses Table */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-[#e6e2d6] dark:border-white/10"
                          >
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-[#f4f1ea]/40 dark:bg-white/5 text-[11px] uppercase tracking-wider text-stone-500 dark:text-white/60 border-b border-[#e6e2d6] dark:border-white/10">
                                    <th className="py-2.5 px-3 sm:px-4 font-bold">Kodu</th>
                                    <th className="py-2.5 px-3 sm:px-4 font-bold">Ders Adı</th>
                                    <th className="py-2.5 px-3 sm:px-4 font-bold text-center">Türü</th>
                                    <th className="py-2.5 px-3 sm:px-4 font-bold text-center">Kredi</th>
                                    <th className="py-2.5 px-3 sm:px-4 font-bold text-center">AKTS</th>
                                    <th className="py-2.5 px-3 sm:px-4 font-bold text-center">Detay</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.courses.map((course) => (
                                    <tr
                                      key={course.id}
                                      onClick={async () => {
                                        if (!course.detailsLoaded && course.detailTarget && activeDepartment?.sUnitId) {
                                          setLoading(true);
                                          try {
                                            const res = await safeFetch(
                                              getApiUrl(
                                                `/api/bologna/courseDetail?sunit=${activeDepartment.sUnitId}&target=${encodeURIComponent(
                                                  course.detailTarget
                                                )}`
                                              )
                                            );
                                            if (res.ok) {
                                              const details = await res.json();
                                              course.description = details.description || course.description;
                                              course.outcomes = details.outcomes || [];
                                              course.weeklyTopics = details.weeklyTopics || [];
                                              course.detailsLoaded = true;
                                            }
                                          } catch (err) {
                                            console.error("Course detail fetch error", err);
                                          }
                                          setLoading(false);
                                        }
                                        setActiveCourse({ ...course });
                                      }}
                                      className="border-b border-stone-100 dark:border-white/5 hover:bg-amber-500/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                                    >
                                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-stone-700 dark:text-white/80 whitespace-nowrap">
                                        {course.code}
                                      </td>
                                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {course.name}
                                      </td>
                                      <td className="py-3 px-3 sm:px-4 text-xs text-center">
                                        <span
                                          className={cn(
                                            "px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold uppercase tracking-wider",
                                            course.type === 'Zorunlu'
                                              ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                                              : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                                          )}
                                        >
                                          {course.type}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-center text-stone-600 dark:text-white/60">
                                        {course.credit}
                                      </td>
                                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold text-center text-amber-600 dark:text-amber-400">
                                        {course.ects}
                                      </td>
                                      <td className="py-3 px-3 sm:px-4 text-center">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 group-hover:underline">
                                          İncele <ChevronRight className="w-3 h-3" />
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* LEVEL 4: COURSE DETAILS VIEW */}
        {activeCourse && (
          <motion.div
            key="course-detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs tracking-wider uppercase border border-amber-500/25">
                  {activeCourse.code}
                </span>
                <span
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold tracking-wider uppercase border",
                    activeCourse.type === 'Zorunlu'
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                  )}
                >
                  {activeCourse.type}
                </span>
              </div>

              <span className="text-xs font-semibold text-stone-500 dark:text-white/60">
                {getSemesterInfo(activeCourse.semester).title}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-stone-900 dark:text-white tracking-tight leading-tight">
              {activeCourse.name}
            </h3>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#fcfbf9] dark:bg-[#264653] p-4 rounded-2xl border border-[#e6e2d6] dark:border-white/10 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-white/50 mb-1">
                  AKTS Kredisi
                </span>
                <span className="text-2xl font-display font-extrabold text-amber-600 dark:text-amber-400">
                  {activeCourse.ects}
                </span>
              </div>

              <div className="bg-[#fcfbf9] dark:bg-[#264653] p-4 rounded-2xl border border-[#e6e2d6] dark:border-white/10 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-white/50 mb-1">
                  Yerel Kredi
                </span>
                <span className="text-2xl font-display font-extrabold text-stone-800 dark:text-white">
                  {activeCourse.credit}
                </span>
              </div>

              <div className="bg-[#fcfbf9] dark:bg-[#264653] p-4 rounded-2xl border border-[#e6e2d6] dark:border-white/10 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-white/50 mb-1">
                  Dönem / Sınıf
                </span>
                <span className="text-lg font-display font-bold text-stone-800 dark:text-white">
                  {activeCourse.semester === 0 ? 'Hazırlık' : `${activeCourse.semester}. Yarıyıl`}
                </span>
              </div>

              <div className="bg-[#fcfbf9] dark:bg-[#264653] p-4 rounded-2xl border border-[#e6e2d6] dark:border-white/10 flex flex-col items-center justify-center text-center shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-white/50 mb-1">
                  Eğitim Dili
                </span>
                <span className="text-lg font-display font-bold text-stone-800 dark:text-white">
                  {activeCourse.language || 'Türkçe'}
                </span>
              </div>
            </div>

            {/* Course Description, Outcomes & Weekly Topics */}
            <div className="space-y-6 bg-[#fcfbf9] dark:bg-[#264653] p-5 sm:p-7 rounded-2xl border border-[#e6e2d6] dark:border-white/10 shadow-sm">
              <div>
                <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-stone-900 dark:text-white mb-2">
                  <FileText strokeWidth={1.75} className="w-5 h-5 text-amber-500" />
                  Dersin Amacı ve Kapsamı
                </h4>
                <p className="text-sm text-stone-600 dark:text-white/70 leading-relaxed font-medium">
                  {activeCourse.description || 'Ders içeriği üniversite Bologna Bilgi Paketi sisteminden alınmıştır.'}
                </p>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-stone-900 dark:text-white mb-3">
                  <CheckCircle2 strokeWidth={1.75} className="w-5 h-5 text-amber-500" />
                  Öğrenme Çıktıları ve Kazanımlar
                </h4>
                {activeCourse.outcomes && activeCourse.outcomes.length > 0 ? (
                  <ul className="space-y-2.5">
                    {activeCourse.outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-stone-600 dark:text-white/70 font-medium">
                        <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 border border-amber-500/20">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-400 dark:text-white/50 italic">
                    Bu ders için tanımlanmış temel öğrenme çıktıları mevcuttur.
                  </p>
                )}
              </div>

              {activeCourse.weeklyTopics && activeCourse.weeklyTopics.length > 0 && (
                <div className="pt-4 border-t border-stone-100 dark:border-white/10">
                  <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-stone-900 dark:text-white mb-3">
                    <Calendar strokeWidth={1.75} className="w-5 h-5 text-amber-500" />
                    Haftalık Ders Konu Planı
                  </h4>
                  <div className="bg-white/60 dark:bg-white/5 rounded-xl overflow-hidden border border-[#e6e2d6] dark:border-white/10">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-100/70 dark:bg-white/5 text-[11px] uppercase tracking-wider text-stone-500 dark:text-white/60 border-b border-[#e6e2d6] dark:border-white/10">
                          <th className="py-2.5 px-3 sm:px-4 font-bold w-20 text-center">Hafta</th>
                          <th className="py-2.5 px-3 sm:px-4 font-bold">Konu Başlığı</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeCourse.weeklyTopics.map((topic, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-stone-100 dark:border-white/5 hover:bg-[#f4f1ea] dark:hover:bg-white/5 text-xs sm:text-sm"
                          >
                            <td className="py-2.5 px-3 sm:px-4 font-bold text-stone-700 dark:text-white/80 text-center">
                              {topic.week}. Hafta
                            </td>
                            <td className="py-2.5 px-3 sm:px-4 font-medium text-stone-600 dark:text-white/70">
                              {topic.topic}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
