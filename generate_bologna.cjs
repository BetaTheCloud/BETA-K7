const fs = require('fs');

const faculties = [
  {
    id: 'fac-1',
    name: 'Mühendislik ve Mimarlık Fakültesi',
    departments: [
      {
        id: 'dep-1-1',
        name: 'Bilgisayar Mühendisliği',
        description: 'Yazılım, donanım ve bilgisayar ağları üzerine kapsamlı bir mühendislik eğitimi sunar.',
        courses: []
      },
      {
        id: 'dep-1-2',
        name: 'İnşaat Mühendisliği',
        description: 'Yapı, mekanik ve hidrolik gibi alanlarda temel mühendislik bilgileri verir.',
        courses: []
      },
      {
        id: 'dep-1-3',
        name: 'Elektrik-Elektronik Mühendisliği',
        description: 'Elektrik sistemleri, elektronik devreler ve haberleşme teknolojileri.',
        courses: []
      }
    ]
  },
  {
    id: 'fac-2',
    name: 'İktisadi ve İdari Bilimler Fakültesi',
    departments: [
      {
        id: 'dep-2-1',
        name: 'İşletme',
        description: 'Yönetim, organizasyon, muhasebe ve pazarlama odaklı eğitim.',
        courses: []
      },
      {
        id: 'dep-2-2',
        name: 'İktisat',
        description: 'Ekonomik teoriler, mikro ve makro iktisat analizi.',
        courses: []
      },
      {
        id: 'dep-2-3',
        name: 'Siyaset Bilimi ve Kamu Yönetimi',
        description: 'Devlet yönetimi, siyaset teorileri ve bürokrasi.',
        courses: []
      }
    ]
  },
  {
    id: 'fac-3',
    name: 'Fen Edebiyat Fakültesi',
    departments: [
      {
        id: 'dep-3-1',
        name: 'Tarih',
        description: 'Geçmişten günümüze tarihi olayların bilimsel yöntemlerle incelenmesi.',
        courses: []
      },
      {
        id: 'dep-3-2',
        name: 'Matematik',
        description: 'Pür ve uygulamalı matematik, analiz, cebir.',
        courses: []
      },
      {
        id: 'dep-3-3',
        name: 'Türk Dili ve Edebiyatı',
        description: 'Türk dilinin yapısı, gelişimi ve edebiyat tarihi.',
        courses: []
      }
    ]
  },
  {
    id: 'fac-4',
    name: 'İlahiyat Fakültesi',
    departments: [
      {
        id: 'dep-4-1',
        name: 'İlahiyat',
        description: 'İslam bilimleri, din felsefesi, tefsir, hadis ve kelam eğitimleri.',
        courses: []
      }
    ]
  },
  {
    id: 'fac-5',
    name: 'Muallim Rıfat Eğitim Fakültesi',
    departments: [
      {
        id: 'dep-5-1',
        name: 'Sınıf Öğretmenliği',
        description: 'Temel eğitim düzeyinde öğretmen yetiştirme programı.',
        courses: []
      },
      {
        id: 'dep-5-2',
        name: 'Rehberlik ve Psikolojik Danışmanlık',
        description: 'PDR uzmanı yetiştiren program.',
        courses: []
      }
    ]
  },
  {
    id: 'fac-6',
    name: 'Sağlık Bilimleri Fakültesi',
    departments: [
      {
        id: 'dep-6-1',
        name: 'Hemşirelik',
        description: 'Sağlık bakımı ve hemşirelik mesleği eğitimi.',
        courses: []
      }
    ]
  }
];

// Helper to generate generic courses for an 8-semester department
function generateCourses(deptCode, deptName) {
  const courses = [];
  let cId = 1;
  for (let sem = 1; sem <= 8; sem++) {
    for (let i = 1; i <= 5; i++) { // 5 courses per semester
      const isElective = sem >= 5 && i >= 4;
      courses.push({
        id: `crs-${deptCode}-${cId}`,
        code: `${deptCode}${sem}0${i}`,
        name: isElective ? `Seçmeli Ders - Alan İçi (${deptName})` : `${deptName} Temel Dersi ${sem}.${i}`,
        semester: sem,
        ects: isElective ? 5 : 6,
        credit: isElective ? 3 : 4,
        type: isElective ? 'Seçmeli' : 'Zorunlu',
        language: 'Türkçe',
        description: `Bu ders ${deptName} alanında ${sem}. yarıyıl öğrencilerinin temel bilgi ve becerilerini geliştirmeyi amaçlar.`,
        outcomes: [
          'İlgili alandaki temel kavramları tanımlar.',
          'Pratik uygulamaları teorik bilgi ile birleştirir.',
          'Analitik düşünme becerisini geliştirir.'
        ]
      });
      cId++;
    }
  }
  return courses;
}

// Special Curriculum for Bilgisayar Mühendisliği (dept 1-1)
const computerEngineeringCurriculum = [
  // SEM 1
  { code: 'MAT101', name: 'Matematik I', semester: 1, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'FİZ101', name: 'Fizik I', semester: 1, ects: 5, credit: 3, type: 'Zorunlu' },
  { code: 'BİL101', name: 'Algoritma ve Programlamaya Giriş', semester: 1, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'BİL103', name: 'Bilgisayar Mühendisliğine Giriş', semester: 1, ects: 4, credit: 2, type: 'Zorunlu' },
  { code: 'TÜR101', name: 'Türk Dili I', semester: 1, ects: 2, credit: 2, type: 'Zorunlu' },
  { code: 'YDL101', name: 'Yabancı Dil I (İngilizce)', semester: 1, ects: 2, credit: 2, type: 'Zorunlu' },
  // SEM 2
  { code: 'MAT102', name: 'Matematik II', semester: 2, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'FİZ102', name: 'Fizik II', semester: 2, ects: 5, credit: 3, type: 'Zorunlu' },
  { code: 'BİL102', name: 'Nesneye Yönelik Programlama', semester: 2, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'BİL104', name: 'Ayrık Matematik', semester: 2, ects: 5, credit: 3, type: 'Zorunlu' },
  { code: 'TÜR102', name: 'Türk Dili II', semester: 2, ects: 2, credit: 2, type: 'Zorunlu' },
  { code: 'YDL102', name: 'Yabancı Dil II (İngilizce)', semester: 2, ects: 2, credit: 2, type: 'Zorunlu' },
  // SEM 3
  { code: 'BİL201', name: 'Veri Yapıları', semester: 3, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'BİL203', name: 'Mantıksal Devre Tasarımı', semester: 3, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'MAT201', name: 'Diferansiyel Denklemler', semester: 3, ects: 5, credit: 3, type: 'Zorunlu' },
  { code: 'BİL205', name: 'Olasılık ve İstatistik', semester: 3, ects: 5, credit: 3, type: 'Zorunlu' },
  { code: 'ATA101', name: 'Atatürk İlkeleri ve İnkılap Tarihi I', semester: 3, ects: 2, credit: 2, type: 'Zorunlu' },
  // SEM 4
  { code: 'BİL202', name: 'Algoritma Analizi', semester: 4, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'BİL204', name: 'Veritabanı Yönetim Sistemleri', semester: 4, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'BİL206', name: 'Bilgisayar Mimarisi', semester: 4, ects: 5, credit: 3, type: 'Zorunlu' },
  { code: 'MAT202', name: 'Lineer Cebir', semester: 4, ects: 5, credit: 3, type: 'Zorunlu' },
  { code: 'ATA102', name: 'Atatürk İlkeleri ve İnkılap Tarihi II', semester: 4, ects: 2, credit: 2, type: 'Zorunlu' },
  // SEM 5
  { code: 'BİL301', name: 'İşletim Sistemleri', semester: 5, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'BİL303', name: 'Yazılım Mühendisliği', semester: 5, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'BİL305', name: 'Biçimsel Diller ve Otomata Teorisi', semester: 5, ects: 5, credit: 3, type: 'Zorunlu' },
  { code: 'SEÇ301', name: 'Teknik Seçmeli I', semester: 5, ects: 5, credit: 3, type: 'Seçmeli' },
  { code: 'SEÇ303', name: 'Teknik Seçmeli II', semester: 5, ects: 5, credit: 3, type: 'Seçmeli' },
  // SEM 6
  { code: 'BİL302', name: 'Bilgisayar Ağları', semester: 6, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'BİL304', name: 'Mikroişlemciler', semester: 6, ects: 6, credit: 4, type: 'Zorunlu' },
  { code: 'BİL306', name: 'Yapay Zeka', semester: 6, ects: 5, credit: 3, type: 'Zorunlu' },
  { code: 'SEÇ302', name: 'Teknik Seçmeli III', semester: 6, ects: 5, credit: 3, type: 'Seçmeli' },
  { code: 'SEÇ304', name: 'Teknik Seçmeli IV', semester: 6, ects: 5, credit: 3, type: 'Seçmeli' },
  // SEM 7
  { code: 'BİL401', name: 'Bitirme Projesi I', semester: 7, ects: 6, credit: 3, type: 'Zorunlu' },
  { code: 'BİL403', name: 'İş Sağlığı ve Güvenliği I', semester: 7, ects: 2, credit: 2, type: 'Zorunlu' },
  { code: 'SEÇ401', name: 'Teknik Seçmeli V', semester: 7, ects: 5, credit: 3, type: 'Seçmeli' },
  { code: 'SEÇ403', name: 'Teknik Seçmeli VI', semester: 7, ects: 5, credit: 3, type: 'Seçmeli' },
  { code: 'SEÇ405', name: 'Sosyal Seçmeli I', semester: 7, ects: 4, credit: 2, type: 'Seçmeli' },
  // SEM 8
  { code: 'BİL402', name: 'Bitirme Projesi II', semester: 8, ects: 6, credit: 3, type: 'Zorunlu' },
  { code: 'BİL404', name: 'İş Sağlığı ve Güvenliği II', semester: 8, ects: 2, credit: 2, type: 'Zorunlu' },
  { code: 'SEÇ402', name: 'Teknik Seçmeli VII', semester: 8, ects: 5, credit: 3, type: 'Seçmeli' },
  { code: 'SEÇ404', name: 'Teknik Seçmeli VIII', semester: 8, ects: 5, credit: 3, type: 'Seçmeli' },
  { code: 'SEÇ406', name: 'Sosyal Seçmeli II', semester: 8, ects: 4, credit: 2, type: 'Seçmeli' },
];

faculties.forEach((fac) => {
  fac.departments.forEach((dep) => {
    if (dep.name === 'Bilgisayar Mühendisliği') {
      dep.courses = computerEngineeringCurriculum.map((c, idx) => ({
        id: `crs-ce-${idx}`,
        ...c,
        language: 'Türkçe',
        description: `${c.name} dersi, müfredat kapsamında yer alan önemli derslerden biridir. Kapsamlı teorik ve pratik uygulamalar içerir.`,
        outcomes: [
          'Ders ile ilgili temel teorik altyapıyı oluşturur.',
          'Modern yaklaşımları uygulayabilir.',
          'Grup çalışması ve bireysel problem çözme becerisi kazanır.'
        ]
      }));
    } else {
      // Auto generate full 8 semesters for everyone else
      let codePrefix = dep.name.substring(0, 3).toUpperCase().replace(/İ/g, 'I').replace(/Ş/g, 'S');
      dep.courses = generateCourses(codePrefix, dep.name);
    }
  });
});

const fileContent = `
import { Announcement, MenuItem, CalendarEvent, BolognaFaculty } from './types';

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const response = await fetch('/api/announcements');
  if (response.ok) {
    return response.json();
  }
  return [];
};

export const getNews = async (): Promise<Announcement[]> => {
  const response = await fetch('/api/news');
  if (response.ok) {
    return response.json();
  }
  return [];
};

export const getMenu = async (): Promise<MenuItem[]> => {
  const response = await fetch('/api/menu');
  if (response.ok) {
    return response.json();
  }
  return [];
};

export const getCalendar = async (): Promise<CalendarEvent[]> => {
  return [
    { id: '1', title: 'Güz Yarıyılı Ders Kayıtları', date: '2026-09-15', type: 'registration' },
    { id: '2', title: 'Güz Yarıyılı Derslerin Başlaması', date: '2026-09-22', type: 'other' },
    { id: '3', title: 'Ara Sınavlar (Vize)', date: '2026-11-15', type: 'exam' },
    { id: '4', title: 'Yarıyıl Sonu Sınavları (Final)', date: '2027-01-05', type: 'exam' },
  ];
};

export const getBolognaData = async (): Promise<BolognaFaculty[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(${JSON.stringify(faculties, null, 2)});
    }, 400); 
  });
};
`;

fs.writeFileSync('src/mockData.ts', fileContent);
console.log("Mock data updated successfully.");
