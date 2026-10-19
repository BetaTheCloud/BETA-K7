/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kilis 7 Aralık Üniversitesi Telefon Rehberi
 * Kaynak: https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi
 */

export interface DirectoryContact {
  id: string;
  name: string;
  title?: string;
  role?: string;
  phone: string;
  extension?: string;
  email?: string;
  profileUrl?: string;
  unitName: string;
  sectionName: string;
}

export interface DirectorySection {
  id: string;
  subDepartmentId?: string;
  fullHeader: string;
  title: string;
  contacts: DirectoryContact[];
}

export interface DirectorySubDepartment {
  id: string;
  fullName: string;
  name: string;
}

export interface DirectoryUnit {
  id: string;
  name: string;
  category: 'fakulte' | 'enstitu' | 'yuksekokul' | 'konservatuvar' | 'idari' | 'koordinatorluk' | 'other';
  subDepartments: DirectorySubDepartment[];
  sections: DirectorySection[];
}

export const PHONE_DIRECTORY_DATA: DirectoryUnit[] = [
  {
    "id": "83",
    "name": "Alaeddin Yavaşca Devlet Konservatuvarı",
    "category": "konservatuvar",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-83-0",
        "fullHeader": "Alaeddin Yavaşca Devlet Konservatuvarı",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "83-0-0",
            "name": "Ali NÜNÜKOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Konservatuvar Müdürü",
            "phone": "0348 814 26 66",
            "extension": "1350",
            "email": "nunukogluali@kilis.edu.tr",
            "unitName": "Alaeddin Yavaşca Devlet Konservatuvarı",
            "sectionName": "Alaeddin Yavaşca Devlet Konservatuvarı"
          },
          {
            "id": "83-0-1",
            "name": "Özgüç Acun ARSLAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Müdür Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1357",
            "email": "ozgucacunarslan@kilis.edu.tr",
            "unitName": "Alaeddin Yavaşca Devlet Konservatuvarı",
            "sectionName": "Alaeddin Yavaşca Devlet Konservatuvarı"
          },
          {
            "id": "83-0-2",
            "name": "Zeyneb TÜRKOĞLU",
            "title": "Öğr. Gör. Dr.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1355",
            "email": "zeyneb.turkoglu@kilis.edu.tr",
            "unitName": "Alaeddin Yavaşca Devlet Konservatuvarı",
            "sectionName": "Alaeddin Yavaşca Devlet Konservatuvarı"
          },
          {
            "id": "83-0-3",
            "name": "Mustafa ÇEKEN",
            "title": "Öğr. Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1356",
            "email": "mustafa.ceken@kilis.edu.tr",
            "unitName": "Alaeddin Yavaşca Devlet Konservatuvarı",
            "sectionName": "Alaeddin Yavaşca Devlet Konservatuvarı"
          },
          {
            "id": "83-0-4",
            "name": "Fatma Gamze APRAŞ",
            "title": "Öğr. Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1354",
            "email": "gamze.apras@kilis.edu.tr",
            "unitName": "Alaeddin Yavaşca Devlet Konservatuvarı",
            "sectionName": "Alaeddin Yavaşca Devlet Konservatuvarı"
          },
          {
            "id": "83-0-5",
            "name": "İbrahim Halil AKBAŞ",
            "title": "Yüksekokul Sekreteri",
            "role": "Yüksekokul Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1352",
            "email": "ibrahimakbas@kilis.edu.tr",
            "unitName": "Alaeddin Yavaşca Devlet Konservatuvarı",
            "sectionName": "Alaeddin Yavaşca Devlet Konservatuvarı"
          },
          {
            "id": "83-0-6",
            "name": "Mehmet YILDIRIM",
            "title": "Şef",
            "role": "Yazı İşleri, Taşınır Kayıt Yetkilisi",
            "phone": "0348 814 26 66",
            "extension": "1353",
            "email": "mehmetyildirim@kilis.edu.tr",
            "unitName": "Alaeddin Yavaşca Devlet Konservatuvarı",
            "sectionName": "Alaeddin Yavaşca Devlet Konservatuvarı"
          },
          {
            "id": "83-0-7",
            "name": "Erkut MAAŞOĞLU",
            "title": "Memur",
            "role": "Memur",
            "phone": "0348 814 26 66",
            "extension": "1352",
            "email": "erkutmaasoglu@kilis.edu.tr",
            "unitName": "Alaeddin Yavaşca Devlet Konservatuvarı",
            "sectionName": "Alaeddin Yavaşca Devlet Konservatuvarı"
          },
          {
            "id": "83-0-8",
            "name": "Ahmet KARTALKUŞ",
            "title": "Sürekli İşçi",
            "role": "Sürekli İşçi",
            "phone": "0348 814 26 66",
            "extension": "0000",
            "email": "",
            "unitName": "Alaeddin Yavaşca Devlet Konservatuvarı",
            "sectionName": "Alaeddin Yavaşca Devlet Konservatuvarı"
          }
        ]
      }
    ]
  },
  {
    "id": "1",
    "name": "Bilgi İşlem Daire Başkanlığı",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-1-0",
        "fullHeader": "Bilgi İşlem Daire Başkanlığı",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "1-0-0",
            "name": "Mehmet Nuh UÇAR",
            "title": "Daire Başkanı",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1301",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-1",
            "name": "Ayşe BAYTOK CANBAZOĞLU",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1303",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-2",
            "name": "Özkan ZEYBEK",
            "title": "Yüksek Mühendis",
            "role": "Sistem Yönetimi",
            "phone": "0 (348) 814 26 66",
            "extension": "1306",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-3",
            "name": "Murat BİÇER",
            "title": "Mühendis",
            "role": "Sistem Yönetimi",
            "phone": "0 (348) 814 26 66",
            "extension": "1310",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-4",
            "name": "Yakup DAL",
            "title": "Tekniker",
            "role": "Elektronik Haberleşme",
            "phone": "0 (348) 814 26 66",
            "extension": "1312",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-5",
            "name": "Veysel BOLAT",
            "title": "Tekniker",
            "role": "Network - Ağ Hizmetleri",
            "phone": "0 (348) 814 26 66",
            "extension": "1308",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-6",
            "name": "Recep GÜN",
            "title": "Tekniker",
            "role": "Network - Ağ Hizmetleri",
            "phone": "0 (348) 814 26 66",
            "extension": "1316",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-7",
            "name": "Mehmet ÖZDEMİR",
            "title": "Tekniker",
            "role": "Teknik Destek",
            "phone": "0 (348) 814 26 66",
            "extension": "1315",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-8",
            "name": "Esma ÖZDEMİR",
            "title": "Tekniker",
            "role": "Web - Yazılım Hizmetleri",
            "phone": "0 (348) 814 26 66",
            "extension": "1314",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-9",
            "name": "Furkan BENLİOĞLU",
            "title": "Teknisyen",
            "role": "Web - Yazılım Hizmetleri",
            "phone": "0 (348) 814 26 66",
            "extension": "1311",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-10",
            "name": "Ahmet ÜNVANLI",
            "title": "Teknisyen",
            "role": "Teknik Destek",
            "phone": "0 (348) 814 26 66",
            "extension": "1313",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-11",
            "name": "Yıldız AKSU",
            "title": "Bilgisayar İşletmeni",
            "role": "İdari Hizmetler",
            "phone": "0 (348) 814 26 66",
            "extension": "1300",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          },
          {
            "id": "1-0-12",
            "name": "Hatice DEMİRCİ",
            "title": "Bilgisayar İşletmeni",
            "role": "İdari Hizmetler",
            "phone": "0 (348) 814 26 66",
            "extension": "1302",
            "email": "",
            "unitName": "Bilgi İşlem Daire Başkanlığı",
            "sectionName": "Bilgi İşlem Daire Başkanlığı"
          }
        ]
      }
    ]
  },
  {
    "id": "156",
    "name": "Büyük Veri Yönetim Ofisi Koordinatörlüğü",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-156-0",
        "fullHeader": "Büyük Veri Yönetim Ofisi Koordinatörlüğü",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "156-0-0",
            "name": "Bedirhan TEKE",
            "title": "Dr. Öğretim Üyesi",
            "role": "Koordinatör",
            "phone": "0348 814 26 66",
            "extension": "1245",
            "email": "bedirhan.teke@kilis.edu.tr",
            "unitName": "Büyük Veri Yönetim Ofisi Koordinatörlüğü",
            "sectionName": "Büyük Veri Yönetim Ofisi Koordinatörlüğü"
          },
          {
            "id": "156-0-1",
            "name": "Nur Sena OĞUZ",
            "title": "Öğretim Görevlisi Dr.",
            "role": "Öğretim Görevlisi",
            "phone": "0348 814 26 66",
            "extension": "1243",
            "email": "sena.oguz@kilis.edu.tr",
            "unitName": "Büyük Veri Yönetim Ofisi Koordinatörlüğü",
            "sectionName": "Büyük Veri Yönetim Ofisi Koordinatörlüğü"
          },
          {
            "id": "156-0-2",
            "name": "Elif KOÇAK",
            "title": "Öğretim Görevlisi Dr.",
            "role": "Öğretim Görevlisi",
            "phone": "0348 814 26 66",
            "extension": "1233",
            "email": "elif.kocak@kilis.edu.tr",
            "unitName": "Büyük Veri Yönetim Ofisi Koordinatörlüğü",
            "sectionName": "Büyük Veri Yönetim Ofisi Koordinatörlüğü"
          },
          {
            "id": "156-0-3",
            "name": "Dilber TÜRKOĞLU",
            "title": "İdari Memur",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1016",
            "email": "dilber.turkoglu@kilis.edu.tr",
            "unitName": "Büyük Veri Yönetim Ofisi Koordinatörlüğü",
            "sectionName": "Büyük Veri Yönetim Ofisi Koordinatörlüğü"
          }
        ]
      }
    ]
  },
  {
    "id": "70",
    "name": "Döner Sermaye Müdürlüğü",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-70-0",
        "fullHeader": "Döner Sermaye Müdürlüğü",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "70-0-0",
            "name": "Recep KURTOĞLU",
            "title": "Şube Müdürü V.",
            "role": "Döner Sermaye Müdürü",
            "phone": "03488142666",
            "extension": "1260",
            "email": "kurtoglu@kilis.edu.tr",
            "unitName": "Döner Sermaye Müdürlüğü",
            "sectionName": "Döner Sermaye Müdürlüğü"
          },
          {
            "id": "70-0-1",
            "name": "İlyas KIZILASLAN",
            "title": "Bilgisayar İşetmeni",
            "role": "Sayman Mutemet",
            "phone": "03488142666",
            "extension": "1261",
            "email": "ilyaskizilaslan@kilis.edu.tr",
            "unitName": "Döner Sermaye Müdürlüğü",
            "sectionName": "Döner Sermaye Müdürlüğü"
          },
          {
            "id": "70-0-2",
            "name": "Mehmet Uğur BOZKURT",
            "title": "Bilgisayar İşletmeni",
            "role": "Taşınır Kayıt Yetkilisi-Faturalandırma",
            "phone": "03488142666",
            "extension": "1268",
            "email": "ugur.bozkurt@kilis.edu.tr",
            "unitName": "Döner Sermaye Müdürlüğü",
            "sectionName": "Döner Sermaye Müdürlüğü"
          }
        ]
      }
    ]
  },
  {
    "id": "80",
    "name": "Fen Fakültesi",
    "category": "fakulte",
    "subDepartments": [
      {
        "id": "85",
        "fullName": "Fen Fakültesi - Kimya Bölümü",
        "name": "Kimya Bölümü"
      }
    ],
    "sections": [
      {
        "id": "sec-80-0",
        "fullHeader": "Fen Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "80-0-0",
            "name": "Kani ARICI",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0 348 814 26 66",
            "extension": "1874",
            "email": "arici@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=C80B06598BACDECC",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-1",
            "name": "Mustafa Zahrittin KAZANCIOĞLU",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1879",
            "email": "mzkazancioglu@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=nT3KGP3694fUamKe2z0D-w&authorId=4CC73328CA4A9265",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-2",
            "name": "Ahmet ÇAKIR",
            "title": "Prof. Dr.",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1880",
            "email": "acakir@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=VAWp5jxMDUj5cB0bvOvsDw&authorId=CC06B5ECF74E4F26",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-3",
            "name": "Bektaş TEPE",
            "title": "Prof. Dr.",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1978",
            "email": "bektastepe@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=FFFAC0FD49E90E86",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-4",
            "name": "Abdurahman ÇETİN",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1899",
            "email": "cetin@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=901BACC3B926E518",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-5",
            "name": "Hatice Aysun MERCİMEK TAKCI",
            "title": "Prof. Dr.",
            "role": "Teknik Bilimler Meslek Yüksekokulu Müdürü",
            "phone": "0348 814 26 66",
            "extension": "1883",
            "email": "aysunmercimek@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=3BF0E1AED7780688",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-6",
            "name": "Metin AÇIKYILDIZ",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1884",
            "email": "macikyildiz@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=EEBEC77CC1B1A4DE",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-7",
            "name": "Filiz UÇAN TÜRKMEN",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1885",
            "email": "filizucan@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=7B453997F2DB3466",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-8",
            "name": "Mustafa DEDE",
            "title": "Prof. Dr.",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1882",
            "email": "mustafadede@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=72EBF9128A14FC74",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-9",
            "name": "Emine KOÇ SÖGÜTCÜ",
            "title": "Prof. Dr.",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1878",
            "email": "emine.kocsogutcu@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=05989FE0B4569389",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-10",
            "name": "Vakkas ULUÇAY",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1887",
            "email": "vakkas.ulucay@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=D13BD09ABA194D1A",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-11",
            "name": "Evrim BARAN AYDIN",
            "title": "Doç. Dr.",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1345",
            "email": "evrimbaran@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=FA3653FB7BCB5164",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-12",
            "name": "Ayşenur KAYA",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1889",
            "email": "aysenurkaya@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=VAWp5jxMDUj5cB0bvOvsDw&authorId=6E11606AE0410D2E",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-13",
            "name": "Hande POŞUL",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1891",
            "email": "handeposul@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=1DA6CB25BE918AC2",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-14",
            "name": "Ali KARAKUŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1890",
            "email": "alikarakus@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=VAWp5jxMDUj5cB0bvOvsDw&authorId=934F29ECA305B861",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-15",
            "name": "Hatice ESENKAYA",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1892",
            "email": "hatice.esenkaya@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=F0CC2F5CC8D1790D",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-16",
            "name": "Erdal ERTAŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1893",
            "email": "erdalertas@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=4EF7242FA28AC09B",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-17",
            "name": "Mert KÜKRER",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1977",
            "email": "mert.kukrer@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=A50185D59F6BE1AC",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-18",
            "name": "Ömer FIRAT",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1895",
            "email": "ofirat@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=08287204C0222FBB",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-19",
            "name": "Sinan DİKEN",
            "title": "Arş. Gör. Dr.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1877",
            "email": "sinandiken@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=625DAEAB985A3BE1",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-20",
            "name": "Halil EKİCİ",
            "title": "Arş. Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "",
            "email": "halilekici@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=4B0EFD4858531188",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-21",
            "name": "Aykut TOPLAMA",
            "title": "Arş. Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1897",
            "email": "aykut.toplama@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=_D2bDdARDMCOgjHVGzFVZw&authorId=94DA7CBEBE602A81",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-22",
            "name": "Zeynep BAŞER",
            "title": "Arş. Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1898",
            "email": "zeynep.baser@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/AkademisyenGorevOgrenimBilgileri?islem=direct&sira=NPyYQsydu7pn_jChegdWIA&authorId=2C75056BE5A0FFA5",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-23",
            "name": "Mehmet Uğur KARATAŞ",
            "title": "Fakülte Sekreteri",
            "role": "Fakülte Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1881",
            "email": "ugurkaratas@kilis.edu.tr",
            "profileUrl": "https://fen.kilis.edu.tr/subdomain_files/fen1/files/40/ozgecmis/karatas.pdf",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-24",
            "name": "Çağla ALP",
            "title": "Dekanlık Sekreteri",
            "role": "Dekanlık Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1873",
            "email": "caglaalp@kilis.edu.tr",
            "profileUrl": "https://fen.kilis.edu.tr/subdomain_files/fen/files/40/ozgecmis/cagla.alp.pdf",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-25",
            "name": "Mustafa ATEŞ",
            "title": "Bilgisayar İşletmeni",
            "role": "Bilgisayar İşletmeni",
            "phone": "0348 814 26 66",
            "extension": "1896",
            "email": "mustafaates@kilis.edu.tr",
            "profileUrl": "https://fen.kilis.edu.tr/subdomain_files/fen/files/40/ozgecmis/mustafa.ates.pdf",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-26",
            "name": "Selçuk SABUNCUOĞLU",
            "title": "Destek Personeli",
            "role": "Destek Personeli",
            "phone": "0348 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          },
          {
            "id": "80-0-27",
            "name": "Fatma Betül GÜLALİ",
            "title": "Destek Personeli",
            "role": "Destek Personeli",
            "phone": "0348 814 26 66",
            "extension": "",
            "email": "betul.gulali@kilis.edu.tr",
            "profileUrl": "https://fen.kilis.edu.tr/subdomain_files/fen/files/40/ozgecmis/fatma.betul.gulali.pdf",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi"
          }
        ]
      },
      {
        "id": "sec-80-1",
        "subDepartmentId": "85",
        "fullHeader": "Fen Fakültesi - Kimya Bölümü",
        "title": "Kimya Bölümü",
        "contacts": [
          {
            "id": "80-1-0",
            "name": "METİN AÇIKYILDIZ",
            "title": "PROF. DR.",
            "role": "BÖLÜM BAŞKANI",
            "phone": "+903488142666",
            "extension": "1884",
            "email": "macikyildiz@kilis.edu.tr",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi - Kimya Bölümü"
          },
          {
            "id": "80-1-1",
            "name": "AHMET ÇAKIR",
            "title": "PROF. DR.",
            "role": "ÖĞRETİM ÜYESİ",
            "phone": "+903488142666",
            "extension": "1880",
            "email": "acakir@kilis.edu.tr",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi - Kimya Bölümü"
          },
          {
            "id": "80-1-2",
            "name": "MUSTAFA Z. KAZANCIOĞLU",
            "title": "DOÇ. DR.",
            "role": "ÖĞRETİM ÜYESİ",
            "phone": "+903488142666",
            "extension": "1879",
            "email": "mzkazancioglu@kilis.edu.tr",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi - Kimya Bölümü"
          },
          {
            "id": "80-1-3",
            "name": "EVRİM BARAN AYDIN",
            "title": "DOÇ. DR.",
            "role": "ÖĞRETİM ÜYESİ",
            "phone": "+903488142666",
            "extension": "1345",
            "email": "evrimbaran@kilis.edu.tr",
            "unitName": "Fen Fakültesi",
            "sectionName": "Fen Fakültesi - Kimya Bölümü"
          }
        ]
      }
    ]
  },
  {
    "id": "103",
    "name": "Genel Sekreterlik",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-103-0",
        "fullHeader": "Genel Sekreterlik",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "103-0-0",
            "name": "Necdet BOZGEYİK",
            "title": "Genel Sekreter V.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1230",
            "email": "bozgeyik@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-1",
            "name": "İbrahim Halil ER",
            "title": "Genel Sekreter Yardımcısı",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1039",
            "email": "ibrahimhalil.er@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-2",
            "name": "Sevilay DOKUZOĞLU",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1019",
            "email": "sdokuzoglu@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-3",
            "name": "Fahrun Nisa AKBAŞ",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1018",
            "email": "f.nisa.akbas@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-4",
            "name": "Reyhan ANDEROĞLU",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1051",
            "email": "reyhan.anderoglu@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-5",
            "name": "Ayşegül AKŞİT",
            "title": "Şef",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1014",
            "email": "aysegulsarili@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-6",
            "name": "Dilber TÜRKOĞLU",
            "title": "Şef",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "dilber.turkoglu@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-7",
            "name": "Zeynep DİKİCİ",
            "title": "Şef",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1020",
            "email": "zeynepdikici@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-8",
            "name": "Emine TAT",
            "title": "Memur",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1030",
            "email": "emine.tat@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-9",
            "name": "Gülcan ÇİLOĞLU",
            "title": "Bilgisayar İşletmeni",
            "role": "Santral",
            "phone": "0 (348) 814 26 66",
            "extension": "1399",
            "email": "gulcanciloglu@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-10",
            "name": "Muhammed Osman KOZANLI",
            "title": "Memur",
            "role": "Santral",
            "phone": "0 (348) 814 26 66",
            "extension": "1397",
            "email": "osman.kozanli@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-11",
            "name": "Abdulkerim HAMBALOĞLU",
            "title": "Hizmetli",
            "role": "Santral",
            "phone": "0 (348) 814 26 66",
            "extension": "1398",
            "email": "kerimhambaloglu@kilis.ed.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-12",
            "name": "Hıdır KALEM",
            "title": "Şef",
            "role": "Maaş Birim Sorumlusu",
            "phone": "0 (348) 814 26 66",
            "extension": "1362",
            "email": "hidirkalem@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-13",
            "name": "Barış Can ÇAKIR",
            "title": "Şef",
            "role": "Maaş Birim Sorumlusu",
            "phone": "0 (348) 814 26 66",
            "extension": "1363",
            "email": "bariscancakir@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-14",
            "name": "Faruk ORAK",
            "title": "Şef",
            "role": "Maaş Birim Sorumlusu",
            "phone": "0 (348) 814 26 66",
            "extension": "1365",
            "email": "farukorak@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-15",
            "name": "İsmail GELGEÇ",
            "title": "Bilgisayar İşletmeni",
            "role": "Maaş Birim Sorumlusu",
            "phone": "0 (348) 814 26 66",
            "extension": "1366",
            "email": "ismailgelgec@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          },
          {
            "id": "103-0-16",
            "name": "Erkan DOKUYUCU",
            "title": "Şef",
            "role": "Maaş Birim Sorumlusu",
            "phone": "0 (348) 814 26 66",
            "extension": "1367",
            "email": "erkandokuyucu@kilis.edu.tr",
            "unitName": "Genel Sekreterlik",
            "sectionName": "Genel Sekreterlik"
          }
        ]
      }
    ]
  },
  {
    "id": "manual-card-23",
    "name": "Güvenlik",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-manual-card-23-0",
        "fullHeader": "Güvenlik",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "manual-card-23-0-0",
            "name": "Güvenlik Noktaları",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "Güvenlik",
            "sectionName": "Güvenlik"
          },
          {
            "id": "manual-card-23-0-1",
            "name": "Merkez Kampüs Giriş Nizamiye",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "2010",
            "email": "",
            "unitName": "Güvenlik",
            "sectionName": "Güvenlik"
          },
          {
            "id": "manual-card-23-0-2",
            "name": "Rektörlük Nizamiye",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "2011",
            "email": "",
            "unitName": "Güvenlik",
            "sectionName": "Güvenlik"
          },
          {
            "id": "manual-card-23-0-3",
            "name": "Karataş Kampüs Giriş Nizamiye",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "2012",
            "email": "",
            "unitName": "Güvenlik",
            "sectionName": "Güvenlik"
          },
          {
            "id": "manual-card-23-0-4",
            "name": "Yusuf Şerefoğlu Giriş Nizamiye",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "2013",
            "email": "",
            "unitName": "Güvenlik",
            "sectionName": "Güvenlik"
          },
          {
            "id": "manual-card-23-0-5",
            "name": "Mercidabık Kampüs Giriş Nizamiye",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "2014",
            "email": "",
            "unitName": "Güvenlik",
            "sectionName": "Güvenlik"
          }
        ]
      }
    ]
  },
  {
    "id": "100",
    "name": "Güzel Sanatlar ve Tasarım Fakültesi",
    "category": "fakulte",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-100-0",
        "fullHeader": "Güzel Sanatlar ve Tasarım Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "100-0-0",
            "name": "Önder KARAKOÇ",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0348 814 26 66",
            "extension": "1872",
            "email": "onderkarakoc@kilis.edu.tr",
            "unitName": "Güzel Sanatlar ve Tasarım Fakültesi",
            "sectionName": "Güzel Sanatlar ve Tasarım Fakültesi"
          },
          {
            "id": "100-0-1",
            "name": "Hilal SEVLÜ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1373",
            "email": "hilal.sevlu@kilis.edu.tr",
            "unitName": "Güzel Sanatlar ve Tasarım Fakültesi",
            "sectionName": "Güzel Sanatlar ve Tasarım Fakültesi"
          },
          {
            "id": "100-0-2",
            "name": "İbrahim Halil AKBAŞ",
            "title": "Fakülte Sekreteri",
            "role": "Fakülte Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1352",
            "email": "ibrahimakbas@kilis.edu.tr",
            "unitName": "Güzel Sanatlar ve Tasarım Fakültesi",
            "sectionName": "Güzel Sanatlar ve Tasarım Fakültesi"
          },
          {
            "id": "100-0-3",
            "name": "Mustafa ATEŞ",
            "title": "Bilgisayar İşletmeni",
            "role": "Yazı İşleri, Taşınır Kayıt Yetkilisi",
            "phone": "0348 814 26 66",
            "extension": "1896",
            "email": "mustafaates@kilis.edu.tr",
            "unitName": "Güzel Sanatlar ve Tasarım Fakültesi",
            "sectionName": "Güzel Sanatlar ve Tasarım Fakültesi"
          }
        ]
      }
    ]
  },
  {
    "id": "120",
    "name": "Hukuk Müşavirliği",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-120-0",
        "fullHeader": "Hukuk Müşavirliği",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "120-0-0",
            "name": "Zeynep Büşra KORKMAZ",
            "title": "Dr. Öğretim Üyesi",
            "role": "Hukuk Müşaviri V.",
            "phone": "0(348) 814 26 66",
            "extension": "1035",
            "email": "zeynep.korkmaz@kilis.edu.tr",
            "unitName": "Hukuk Müşavirliği",
            "sectionName": "Hukuk Müşavirliği"
          },
          {
            "id": "120-0-1",
            "name": "Mustafa ŞAHİN",
            "title": "Avukat",
            "role": "Avukat",
            "phone": "0(348) 814 26 66",
            "extension": "1036",
            "email": "mustafasahin@kilis.edu.tr",
            "unitName": "Hukuk Müşavirliği",
            "sectionName": "Hukuk Müşavirliği"
          },
          {
            "id": "120-0-2",
            "name": "Mert ÇETİN",
            "title": "Avukat",
            "role": "Avukat",
            "phone": "0(348) 814 26 66",
            "extension": "1028",
            "email": "mertcetin@kilis.edu.tr",
            "unitName": "Hukuk Müşavirliği",
            "sectionName": "Hukuk Müşavirliği"
          },
          {
            "id": "120-0-3",
            "name": "Fahrun Nisa AKBAŞ",
            "title": "Şube Müdürü",
            "role": "Şube Müdürü",
            "phone": "0(348) 814 26 66",
            "extension": "1018",
            "email": "f.nisa.akbas@kilis.edu.tr",
            "unitName": "Hukuk Müşavirliği",
            "sectionName": "Hukuk Müşavirliği"
          },
          {
            "id": "120-0-4",
            "name": "Muhammed Ertuğrul ŞİMŞEK",
            "title": "Bilgisayar İşletmeni",
            "role": "Mutemetlik ve Birim Taşınır İşlemleri",
            "phone": "0(348) 814 26 66",
            "extension": "1038",
            "email": "mertugrul.simsek@kilis.edu.tr",
            "unitName": "Hukuk Müşavirliği",
            "sectionName": "Hukuk Müşavirliği"
          }
        ]
      }
    ]
  },
  {
    "id": "93",
    "name": "İdari ve Mali İşler Daire Başkanlığı",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-93-0",
        "fullHeader": "İdari ve Mali İşler Daire Başkanlığı",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "93-0-0",
            "name": "Necdet BOZGEYİK",
            "title": "Daire Başkanı",
            "role": "Daire Başkanı",
            "phone": "03488141086",
            "extension": "1230",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-1",
            "name": "Ahmet CAN",
            "title": "Şube Müdürü",
            "role": "Şube Müdürü",
            "phone": "03488141086",
            "extension": "1232",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-2",
            "name": "Kadir ÇELİK",
            "title": "Şube Müdür V.",
            "role": "Şube Müdür V.",
            "phone": "03488141086",
            "extension": "1240",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-3",
            "name": "Orhan ERTÜRK",
            "title": "Şube Müdürü",
            "role": "Şube Müdürü",
            "phone": "03488141086",
            "extension": "1242",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-4",
            "name": "Semih ADIYAMAN",
            "title": "Şube Müdürü",
            "role": "Şube Müdürü",
            "phone": "03488141086",
            "extension": "1235",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-5",
            "name": "Dilber TÜRKOĞLU",
            "title": "Şef",
            "role": "Şef",
            "phone": "03488141086",
            "extension": "1230",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-6",
            "name": "Ahmet SELLİ",
            "title": "Mühendis",
            "role": "Mühendis",
            "phone": "03488141086",
            "extension": "1239",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-7",
            "name": "Hasan KAHRAMAN",
            "title": "Bilgisayar İşletmeni",
            "role": "Taşıt İşletme Şefi",
            "phone": "03488141086",
            "extension": "1060",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-8",
            "name": "Erdi SEVEN",
            "title": "Bilgisayar İşletmeni",
            "role": "Bilgisayar İşletmeni",
            "phone": "03488141086",
            "extension": "1234",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-9",
            "name": "Tekin DUMAN",
            "title": "Bilgisayar İşletmeni",
            "role": "Bilgisayar İşletmeni",
            "phone": "03488141086",
            "extension": "1237",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-10",
            "name": "Osman ÇELİK",
            "title": "Bilgisayar İşletmeni",
            "role": "Matbaa Hizmetleri",
            "phone": "03488141086",
            "extension": "1056",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-11",
            "name": "Mustafa ÇOBAN",
            "title": "Bilgisayar İşletmeni",
            "role": "Bilgisayar İşletmeni",
            "phone": "03488141086",
            "extension": "1126",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-12",
            "name": "Enes TERLEMEZ",
            "title": "Memur",
            "role": "Memur",
            "phone": "03488141086",
            "extension": "1236",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-13",
            "name": "Muhammed Seven ŞAHİN",
            "title": "Memur",
            "role": "Memur",
            "phone": "03488141086",
            "extension": "1238",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-14",
            "name": "Musa BAĞÇECİ",
            "title": "Tekniker",
            "role": "Tekniker",
            "phone": "03488141086",
            "extension": "1230",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-15",
            "name": "Mustafa Burak GÜRSOY",
            "title": "Tekniker",
            "role": "Tekniker",
            "phone": "03488141086",
            "extension": "1986",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-16",
            "name": "Cavit UYSAL",
            "title": "Tekniker",
            "role": "Tekniker",
            "phone": "03488141086",
            "extension": "1230",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-17",
            "name": "Mustafa ÖZYAĞLI",
            "title": "Sürekli İşçi",
            "role": "Matbaa Hizmetleri",
            "phone": "03488141086",
            "extension": "1055",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-18",
            "name": "Mehmet Sabit ÇİRTİKOĞLU",
            "title": "Şoför",
            "role": "Şoför",
            "phone": "03488141086",
            "extension": "1059",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-19",
            "name": "İbrahim KARTALKUŞ",
            "title": "Şoför",
            "role": "Şoför",
            "phone": "03488141086",
            "extension": "1059",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-20",
            "name": "Yunus DOĞAN",
            "title": "Şoför",
            "role": "Şoför",
            "phone": "03488141086",
            "extension": "1059",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-21",
            "name": "Özkan ATASOY",
            "title": "Şoför",
            "role": "Şoför",
            "phone": "03488141086",
            "extension": "1059",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-22",
            "name": "Mehmet Emin MAMATOĞLU",
            "title": "Şoför",
            "role": "Şoför",
            "phone": "03488141086",
            "extension": "1059",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-23",
            "name": "Ferhat ÇELEBİ",
            "title": "Şoför",
            "role": "Şoför",
            "phone": "03488141086",
            "extension": "1059",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          },
          {
            "id": "93-0-24",
            "name": "İMİD Çay Ocağı",
            "title": "",
            "role": "",
            "phone": "03488141086",
            "extension": "1246",
            "email": "",
            "unitName": "İdari ve Mali İşler Daire Başkanlığı",
            "sectionName": "İdari ve Mali İşler Daire Başkanlığı"
          }
        ]
      }
    ]
  },
  {
    "id": "97",
    "name": "İktisadi ve İdari Bilimler Fakültesi",
    "category": "fakulte",
    "subDepartments": [
      {
        "id": "96",
        "fullName": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü",
        "name": "İktisat Bölümü"
      },
      {
        "id": "91",
        "fullName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü",
        "name": "İşletme Bölümü"
      },
      {
        "id": "49",
        "fullName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü",
        "name": "Siyaset Bilimi ve Kamu Yönetimi Bölümü"
      }
    ],
    "sections": [
      {
        "id": "sec-97-0",
        "fullHeader": "İktisadi ve İdari Bilimler Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "97-0-0",
            "name": "Dekanlık",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-1",
            "name": "Mehmet ALPTEKİN",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "03488142666",
            "extension": "1501",
            "email": "mehmetalptekin@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-2",
            "name": "Hasan Emin GÜRLER",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1504",
            "email": "hasan.gurler@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-3",
            "name": "Salih İSKENDER",
            "title": "Dr. Öğr. Üyesi",
            "role": "Dekan Yardımcısı",
            "phone": "0348 813 93 34",
            "extension": "1514",
            "email": "salih.iskender@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-4",
            "name": "Süleyman DOĞANYILMAZ",
            "title": "",
            "role": "Fakülte Sekreteri",
            "phone": "0 348 814 26 66",
            "extension": "1502",
            "email": "suleymandoganyilmaz@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-5",
            "name": "Durdane GÜMÜŞ",
            "title": "",
            "role": "Dekan Sekreteri",
            "phone": "0 348 814 26 66",
            "extension": "1500",
            "email": "durdane.gumus@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-6",
            "name": "Hüseyin BORAN",
            "title": "",
            "role": "Bölüm Sekreteri",
            "phone": "0 348 813 93 34",
            "extension": "1517",
            "email": "ahmetaksoy@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-7",
            "name": "İşletme",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-8",
            "name": "Ahmet FİDANOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0 348 813 93 34",
            "extension": "1538",
            "email": "ahmet.fidanoğlu@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-9",
            "name": "Bengü CAN",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0(348) 814 26 66",
            "extension": "1515",
            "email": "benguhirlak@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-10",
            "name": "İbrahim Halil SEYREK",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "03488142666",
            "extension": "1539",
            "email": "ihseyrek@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-11",
            "name": "Yakup DURMAZ",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0348814266",
            "extension": "1526",
            "email": "yakup.durmaz@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-12",
            "name": "Ali KESTANE",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 813 9334",
            "extension": "1516",
            "email": "alikestane@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-13",
            "name": "Müslüm EFLATUN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 813 93 34",
            "extension": "1506",
            "email": "muslumeflatun@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-14",
            "name": "Tuba BIYIKBEYİ BAŞDAĞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 813 93 34",
            "extension": "1503",
            "email": "tuba.biyikbeyi@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-15",
            "name": "Emre ÇOLAKOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 813 93 34",
            "extension": "1518",
            "email": "emre.colakoglu@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-16",
            "name": "Orhan BALIKÇI",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "03488142666",
            "extension": "1531",
            "email": "orhanbalikci@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-17",
            "name": "Siyaset Bilimi ve Kamu Yönetimi",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-18",
            "name": "Haydar KARAMAN",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1529",
            "email": "haydar.karaman@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-19",
            "name": "Bayram KOCA",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1525",
            "email": "bayramkoca@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-20",
            "name": "Emre Baran PAK",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1523",
            "email": "emrebaranpak@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-21",
            "name": "Faruk BARTAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1513",
            "email": "farukbartan@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-22",
            "name": "Hüseyin KURŞUN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1543",
            "email": "huseyin.kursun@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-23",
            "name": "Yusuf AVAR",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1510",
            "email": "yusufavar@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-24",
            "name": "İlbey C.N. ÖZDEMİRCİ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1523",
            "email": "ilbeyozdemirci@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-25",
            "name": "Salih İSKENDER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1540",
            "email": "salih.iskender@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-26",
            "name": "Aysel DOĞAN",
            "title": "Arş. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1511",
            "email": "aysel.dogan@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-27",
            "name": "Berna KARALOĞLU",
            "title": "Arş. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1533",
            "email": "bernagunduz@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-28",
            "name": "Hülya KAŞIKÇI",
            "title": "Arş. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1534",
            "email": "hulya.kasikci@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-29",
            "name": "Abdussamed ÖZBEK",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1509",
            "email": "a.samedozbek@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-30",
            "name": "İbrahim Halil CEYLAN",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1535",
            "email": "İbrahimceylan@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-31",
            "name": "İktisat",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-32",
            "name": "M. Vahit EREN",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "03488142666",
            "extension": "1525",
            "email": "vahiteren@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-33",
            "name": "Hülya Derya ÖZİZER",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "03488142666",
            "extension": "1520",
            "email": "hulya_derya@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-34",
            "name": "Sumru BAKAN",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "03488142666",
            "extension": "1524",
            "email": "sumrubakan@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-35",
            "name": "Mustafa ÖZER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "03488139334",
            "extension": "1523",
            "email": "mustafaozer@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-36",
            "name": "Özcan ÖZKAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "03488139334",
            "extension": "1507",
            "email": "ozcanozkan@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-37",
            "name": "Tuğçe KAYAGİL",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "03488139334",
            "extension": "1505",
            "email": "tyontem@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-38",
            "name": "Necati BERK",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "03488139334",
            "extension": "1543",
            "email": "necati.berk@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-39",
            "name": "Merve ÇELİK",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "03488139334",
            "extension": "1508",
            "email": "merve.celik@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-40",
            "name": "Uluslararası Ticaret ve Lojistik",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-41",
            "name": "Mehmet ÖZÇALICI",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "03488139334",
            "extension": "1522",
            "email": "mozcalici@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-42",
            "name": "Mehmet ŞENTÜRK",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "03488139334",
            "extension": "1527",
            "email": "msenturk@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-43",
            "name": "Onur AKKAYA",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "03488139334",
            "extension": "1530",
            "email": "onurakkaya@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-44",
            "name": "Nihan ÖZKAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "03488142666",
            "extension": "1512",
            "email": "nihan.ozkan@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-45",
            "name": "Hasan Emin GÜRLER",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "03488142666",
            "extension": "1504",
            "email": "hasan.gurler@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          },
          {
            "id": "97-0-46",
            "name": "Ümit GEZİCİ",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "03488139334",
            "extension": "1529",
            "email": "umitgezici@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi"
          }
        ]
      },
      {
        "id": "sec-97-1",
        "subDepartmentId": "96",
        "fullHeader": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü",
        "title": "İktisat Bölümü",
        "contacts": [
          {
            "id": "97-1-0",
            "name": "Sumru BAKAN",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1524",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü"
          },
          {
            "id": "97-1-1",
            "name": "Hülya DERYA ÖZİZER",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1520",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü"
          },
          {
            "id": "97-1-2",
            "name": "Mehmet Vahit EREN",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1525",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü"
          },
          {
            "id": "97-1-3",
            "name": "Tuğçe KAYAGİL",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1505",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü"
          },
          {
            "id": "97-1-4",
            "name": "Özcan ÖZKAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1507",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü"
          },
          {
            "id": "97-1-5",
            "name": "Mustafa ÖZER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1526",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü"
          },
          {
            "id": "97-1-6",
            "name": "Necati BERK",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1543",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü"
          },
          {
            "id": "97-1-7",
            "name": "Merve ÇELİK",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1508",
            "email": "",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İktisat Bölümü"
          }
        ]
      },
      {
        "id": "sec-97-2",
        "subDepartmentId": "91",
        "fullHeader": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü",
        "title": "İşletme Bölümü",
        "contacts": [
          {
            "id": "97-2-0",
            "name": "Ahmet FİDANOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0 348 813 93 34",
            "extension": "1538",
            "email": "ahmet.fidanoğlu@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü"
          },
          {
            "id": "97-2-1",
            "name": "Müslüm EFLATUN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "+90 348 813 93 34",
            "extension": "1506",
            "email": "muslumeflatun@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü"
          },
          {
            "id": "97-2-2",
            "name": "İbrahim Halil SEYREK",
            "title": "Profesör",
            "role": "",
            "phone": "0(348) 814 26 66",
            "extension": "1539",
            "email": "ihseyrek@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü"
          },
          {
            "id": "97-2-3",
            "name": "Bengü CAN",
            "title": "Profesör",
            "role": "",
            "phone": "+90 348 813 93 34",
            "extension": "1515",
            "email": "benguhirlak@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü"
          },
          {
            "id": "97-2-4",
            "name": "Ali KESTANE",
            "title": "Doçent",
            "role": "",
            "phone": "0348 813 9334",
            "extension": "1516",
            "email": "alikestane@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü"
          },
          {
            "id": "97-2-5",
            "name": "Yakup DURMAZ",
            "title": "Profesör",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1526",
            "email": "yakup.durmaz@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü"
          },
          {
            "id": "97-2-6",
            "name": "Tuba BIYIKBEYİ BAŞDAĞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 813 93 34",
            "extension": "1514",
            "email": "tuba.biyikbeyi@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü"
          },
          {
            "id": "97-2-7",
            "name": "Emre ÇOLAKOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "+90 348 813 93 34",
            "extension": "1518",
            "email": "emre.colakoglu@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü"
          },
          {
            "id": "97-2-8",
            "name": "Orhan BALIKÇI",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "03488142666",
            "extension": "1531",
            "email": "orhanbalikci@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - İşletme Bölümü"
          }
        ]
      },
      {
        "id": "sec-97-3",
        "subDepartmentId": "49",
        "fullHeader": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü",
        "title": "Siyaset Bilimi ve Kamu Yönetimi Bölümü",
        "contacts": [
          {
            "id": "97-3-0",
            "name": "Haydar KARAMAN",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1529",
            "email": "haydar.karaman@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-1",
            "name": "Bayram KOCA",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1525",
            "email": "bayramkoca@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-2",
            "name": "Emre Baran PAK",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1523",
            "email": "emrebaranpak@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-3",
            "name": "Faruk BARTAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1513",
            "email": "farukbartan@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-4",
            "name": "İlbey C. N. ÖZDEMİRCİ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1523",
            "email": "ilbeyozdemirci@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-5",
            "name": "Hüseyin KURŞUN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1543",
            "email": "huseyin.kursun@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-6",
            "name": "Yusuf AVAR",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1510",
            "email": "yusufavar@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-7",
            "name": "Salih İSKENDER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1540",
            "email": "salih.iskender@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-8",
            "name": "Aysel DOĞAN",
            "title": "Arş. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1511",
            "email": "aysel.dogan@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-9",
            "name": "Berna KARALOĞLU",
            "title": "Arş. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1533",
            "email": "bernagunduz@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-10",
            "name": "Hülya KAŞIKÇI",
            "title": "Arş. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1534",
            "email": "hulya.kasikci@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-11",
            "name": "İbrahim Halil CEYLAN",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1535",
            "email": "ibrahimceylan@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          },
          {
            "id": "97-3-12",
            "name": "Abdussamed ÖZBEK",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1509",
            "email": "a.samedozbek@kilis.edu.tr",
            "unitName": "İktisadi ve İdari Bilimler Fakültesi",
            "sectionName": "İktisadi ve İdari Bilimler Fakültesi - Siyaset Bilimi ve Kamu Yönetimi Bölümü"
          }
        ]
      }
    ]
  },
  {
    "id": "95",
    "name": "İlahiyat Fakültesi",
    "category": "fakulte",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-95-0",
        "fullHeader": "İlahiyat Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "95-0-0",
            "name": "Dekanlık",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-1",
            "name": "Halil Aldemir",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0 348 814 2666",
            "extension": "1550",
            "email": "aldemirhalil@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/711",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-2",
            "name": "Mehmet Karakuş",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 814 2666",
            "extension": "1552",
            "email": "mehmetkarakus@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-3",
            "name": "Üzeyir Köse",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 814 2666",
            "extension": "1553",
            "email": "uzeyirkose@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-4",
            "name": "Alper Kılıçarslan",
            "title": "Fakülte Sekreteri",
            "role": "Fakülte Sekreteri",
            "phone": "0 348 814 2666",
            "extension": "1554",
            "email": "mustafademir@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-5",
            "name": "Nuh Can",
            "title": "Özel Kalem",
            "role": "Özel Kalem",
            "phone": "0 348 814 2666",
            "extension": "1550",
            "email": "nuh.can@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-6",
            "name": "Ali Salim",
            "title": "Yazı İşleri",
            "role": "Yazı İşleri",
            "phone": "0 348 814 2666",
            "extension": "1556",
            "email": "alisalim@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-7",
            "name": "Makbule Biçer",
            "title": "Mutemet",
            "role": "Mutemet",
            "phone": "0 348 814 2666",
            "extension": "1557",
            "email": "mkabulebicer@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-8",
            "name": "Yusuf Ateş",
            "title": "Bölüm Sekreteri",
            "role": "Bölüm Sekreteri",
            "phone": "0 348 814 2666",
            "extension": "1555",
            "email": "yusufates@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-9",
            "name": "Temel İslam Bilimleri Bölümü",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-10",
            "name": "Abdulbaki Durmaz",
            "title": "Dr. Öğr. Üyesi",
            "role": "Temel İslam Bilimleri Bölüm Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1604",
            "email": "abdulbakidurmaz@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/407",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-11",
            "name": "Arap Dili ve Belagatı Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-12",
            "name": "Salih Derşevi",
            "title": "Doç. Dr.",
            "role": "Arap Dili ve Belagatı Ana Bilim Dalı Başkan V.",
            "phone": "0 348 814 2666",
            "extension": "1628",
            "email": "salih.dersevi@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1775206902331.Salih%20DER%C5%9EEV%C4%B0_CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-13",
            "name": "Ahmad Skaikh Husayn",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1580",
            "email": "ahmadssh65@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-14",
            "name": "Tamim Fakhoury",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1614",
            "email": "tamim.fakhoury@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/456",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-15",
            "name": "Abdulkadir Karacadağ",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1571",
            "email": "abdulkadir.karacadag@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/410",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-16",
            "name": "İmad Kenan",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1587",
            "email": "imad.kenan@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/483",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-17",
            "name": "Enver Burak Badın",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1567",
            "email": "burakbadin@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/485",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-18",
            "name": "Şeyma Güçlü",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1577",
            "email": "seyma.guclu@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/486",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-19",
            "name": "Yakup Kılıç",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1600",
            "email": "yakup.kilic@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/487",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-20",
            "name": "Ahmet Bigür",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1619",
            "email": "ahmet.bigur@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/469",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-21",
            "name": "Hacer Arslan",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1618",
            "email": "hacer.arslan@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/470",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-22",
            "name": "Hadis Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-23",
            "name": "Sultanbek Aliyev",
            "title": "Dr. Öğr. Üyesi",
            "role": "Hadis Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1565",
            "email": "s.aliev@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/678",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-24",
            "name": "Abdulbaki Durmaz",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1604",
            "email": "abdulbakidurmaz@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/407",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-25",
            "name": "Ramazan Çoban",
            "title": "Arş. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1616",
            "email": "ramazancoban@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/465",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-26",
            "name": "Kenan Barlas",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1617",
            "email": "kenan.barlas@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/466",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-27",
            "name": "İslam Hukuku Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-28",
            "name": "Yusuf Balta",
            "title": "Doç. Dr.",
            "role": "İslam Hukuku Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1591",
            "email": "yusuf.balta@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771366373369.yusuf%20balta-CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-29",
            "name": "Üzeyir Köse",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 814 2666",
            "extension": "1552-1560",
            "email": "uzeyirkose@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/682",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-30",
            "name": "Nilüfer Sena Çalık Badın",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1602",
            "email": "senacalik@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/451",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-31",
            "name": "Muhammet Cüneyt Elderşevi",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1599",
            "email": "muhammed.cuneyt@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-32",
            "name": "Enes Furkan Ömeroğlu",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1569",
            "email": "enesfurkanomeroglu@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/436",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-33",
            "name": "Şaziye Gül Kokulu",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1607",
            "email": "saziyegul.kokulu@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/464",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-34",
            "name": "İslam Mezhepleri Tarihi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-35",
            "name": "Şahin Ahmetoğlu",
            "title": "Prof. Dr.",
            "role": "İslam Mezhepleri Tarihi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1046",
            "email": "sahin.ahmetoglu@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/551",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-36",
            "name": "Kelam Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-37",
            "name": "Yunus Eraslan",
            "title": "Doç. Dr.",
            "role": "Kelam Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1570",
            "email": "yunus.eraslan@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/441",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-38",
            "name": "Zeynep Hümeyra Koç",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1584",
            "email": "humeyra.koc@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/453",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-39",
            "name": "Metin Civek",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1594",
            "email": "metincivek@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/467",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-40",
            "name": "Kur'ân-ı Kerîm Okuma ve Kıraat İlmi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-41",
            "name": "Ömer Mehmet Ulusoy",
            "title": "Öğr. Gör.",
            "role": "Kur'an-ı Kerim Okuma ve Kıraat İlmi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1611",
            "email": "omehmet.ulusoy@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/481",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-42",
            "name": "Ahmet Yasin Dinçer",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1578",
            "email": "yasindincer@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/482",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-43",
            "name": "Mehmet Şeker",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1590",
            "email": "mehmet.seker@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/484",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-44",
            "name": "Emine Aslan",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1634",
            "email": "emine.aslan@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/417",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-45",
            "name": "Tefsir Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-46",
            "name": "Yusuf Ağkuş",
            "title": "Doç. Dr.",
            "role": "Tefsir Ana Bilim Dalı Başkan V.",
            "phone": "0 348 814 2666",
            "extension": "1561",
            "email": "yusufagkus81@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/620",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-47",
            "name": "Halil Aldemir",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0 348 814 2666",
            "extension": "1550-1551",
            "email": "aldemirhalil@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/711",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-48",
            "name": "Bünyamin Açıkalın",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1603",
            "email": "bunyaminacikalin@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/415",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-49",
            "name": "Ramazan Barman",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1631",
            "email": "ramazan.barman@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/450",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-50",
            "name": "Mustafa Ergin",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1844",
            "email": "mustafa.ergin@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/461",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-51",
            "name": "Feyza Çelik",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1625",
            "email": "feyza.celik@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/tr/document/462",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-52",
            "name": "Abdülkadir Güler",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1575",
            "email": "abdulkadir.guler@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771286996627.Ar%C5%9F.%20G%C3%B6r.%20Abd%C3%BClkadir%20G%C3%9CLER%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-53",
            "name": "Tasavvuf Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-54",
            "name": "Fatih Süsleyici",
            "title": "Dr. Öğr. Üyesi",
            "role": "Tasavvuf Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1643",
            "email": "fatih.süsleyici@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771372906662.CV%20form%20Fatih%20S%C3%BCsleyici.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-55",
            "name": "Hatice Kübra Değirmenci",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1608",
            "email": "hatice.degirmenci@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/177137705618.CV_DE%C4%9E%C4%B0RMENC%C4%B0.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-56",
            "name": "Felsefe ve Din Bilimleri Bölümü",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-57",
            "name": "Din Eğitimi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-58",
            "name": "Mehmet Su",
            "title": "Doç. Dr.",
            "role": "Din Eğitimi Anabilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1564",
            "email": "mehmet.su@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-59",
            "name": "Ümit KALKAN",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 814 2666",
            "extension": "1632",
            "email": "umit.kalkan@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1774963715743.%C3%9Cmit%20kalkan%20_%20Taslak-CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-60",
            "name": "Yunus TÜKEN",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0348 814 2666",
            "extension": "1612",
            "email": "yunus.tuken@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/177496324485.yunus%20t%C3%BCken%20cv.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-61",
            "name": "Muharrem Şahiner",
            "title": "Doç. Dr.",
            "role": "Felsefe ve Din Bilimleri Bölüm Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1568",
            "email": "muharremsahiner@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771367596928.Do%C3%A7.%20Dr.%20Muharrem%20%C5%9Eahiner_%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-62",
            "name": "Din Felsefesi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-63",
            "name": "Hikmet ÇAMCI",
            "title": "Dr. Öğretim Üyesi",
            "role": "Din Felsefesi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1642",
            "email": "hikmet.camci@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771373702973.CV_%C3%87amc%C4%B1.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-64",
            "name": "Muharrem ŞAHİNER",
            "title": "Doç. Dr.",
            "role": "Felsefe ve Din Bilimleri Bölümü Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1568",
            "email": "muharremsahiner@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771367596928.Do%C3%A7.%20Dr.%20Muharrem%20%C5%9Eahiner_%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-65",
            "name": "Hatice Kübra ÖMEROĞLU",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1615",
            "email": "haticekubra.sengul@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771363475815.Hatice%20Ku%CC%88bra%20O%CC%88merog%CC%86lu%20CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-66",
            "name": "Din Psikolojisi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-67",
            "name": "Metin GÜVEN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Din Psikolojisi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1623",
            "email": "metin.guven@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/177137064385.MET%C4%B0N%20G%C3%9CVEN%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-68",
            "name": "Yasin Samet KAZEL",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1585",
            "email": "yasinsamet.kazel@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1774962779781.Ar%C5%9F.%20G%C3%B6r.%20Yasin%20Samet%20KAZEL%20CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-69",
            "name": "Kübra Nur POLAT TOKUR",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1622",
            "email": "kubra.polat@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771378596668.CV_Tokur.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-70",
            "name": "Din Sosyolojisi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-71",
            "name": "Nedim ÖZ",
            "title": "Doç. Dr.",
            "role": "Din Sosyolojisi Anabilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1574",
            "email": "nedimoz@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771369254314.%C3%96zge%C3%A7mi%C5%9F%20form_%C3%96Z.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-72",
            "name": "Osman ÜLKER",
            "title": "Dr. Öğretim Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "",
            "email": "osmanulker@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-73",
            "name": "Fatma ÇİÇEK",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1606",
            "email": "fatmacicek@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771328033423.CV_%C3%87i%C3%A7ek.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-74",
            "name": "Metin GÜVEN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Din Psikolojisi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1623",
            "email": "metin.guven@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/177137064385.MET%C4%B0N%20G%C3%9CVEN%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-75",
            "name": "Fatma Esra SAĞIR",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1621",
            "email": "fatmaesra.sagir@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771329711434.Fatma%20Esra%20SAG%CC%86IR%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-76",
            "name": "Dinler Tarihi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-77",
            "name": "Muhammet ZUHUR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Dinler Tarihi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1641",
            "email": "muhammet.zuhur@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771333992411.Dr.%20%C3%96%C4%9Fr.%20%C3%9Cyesi%20Muhammet%20ZUHUR%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-78",
            "name": "Nisa Yağmur YAPICI",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1601",
            "email": "nisayagmurbozok@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-79",
            "name": "Felsefe Tarihi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-80",
            "name": "Mustafa KINAĞ",
            "title": "Doç. Dr.",
            "role": "Felsefe Tarihi Anabilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1566",
            "email": "mustafakinag@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771369474279.Mustafa%20KINA%C4%9E%20CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-81",
            "name": "Ayhan ÖZTAŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1624",
            "email": "ayhan.oztas@kilis.edu.tr",
            "profileUrl": "http://ayhan.oztas@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-82",
            "name": "Ramazan KILIÇ",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1610",
            "email": "ramazan.kilic@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1774874491527.cv_ramazan%20KIl%C4%B1%C3%A7.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-83",
            "name": "İslam Felsefesi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-84",
            "name": "Mehmet KARAKUŞ",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı - İslam Felsefesi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1573",
            "email": "mehmetkarakus@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/177137028083.MKaraku%C5%9F%20CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-85",
            "name": "Sercan ÇAMLI",
            "title": "Arş. Gör. Dr.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1605- 1851",
            "email": "sercancamli@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1774875003301.Sercan%20%C3%87AMLI%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-86",
            "name": "Mantık Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-87",
            "name": "Mehmet SU",
            "title": "Doç. Dr.",
            "role": "Mantık Ana Bilim Dalı Başkan V.",
            "phone": "0 348 814 2666",
            "extension": "1564",
            "email": "mehmet.su@kilis.edu.tr",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-88",
            "name": "Büşra VARIR",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1581",
            "email": "busra.varir@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771292608822.B%C3%BC%C5%9Fra%20Var%C4%B1r_CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-89",
            "name": "İslam Tarihi ve Sanatları Bölümü",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-90",
            "name": "Ömer Cide",
            "title": "Prof. Dr.",
            "role": "İslam Tarihi ve Sanatları Bölüm Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1595",
            "email": "omercide@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771360735826.Prof.%20Dr.%20Ömer%20CİDE%20CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-91",
            "name": "İslam Tarihi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-92",
            "name": "Zekeriya AKMAN",
            "title": "Prof. Dr.",
            "role": "Rektör",
            "phone": "0 348 814 2666",
            "extension": "1001",
            "email": "rektor@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771794163196.Prof.%20Dr.%20Zekeriya%20AKMAN%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-93",
            "name": "Ömer CİDE",
            "title": "Prof. Dr.",
            "role": "İslam Tarihi ve Sanatları Bölümü Başkanı İslam Tarihi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1595",
            "email": "omercide@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771360735826.Prof.%20Dr.%20%C3%96mer%20C%C4%B0DE%20CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-94",
            "name": "Ahmet KURAY",
            "title": "Dr. Öğr. Üyesi",
            "role": "Türk-İslam Edebiyatı Ana Bilim Dalı Başkanı V.",
            "phone": "0 348 814 2666",
            "extension": "1592",
            "email": "ahmetkuray@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/17713744019.CV_KURAY.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-95",
            "name": "Remziye ÇELİK",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1596",
            "email": "remziye.karakum@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1774939381126.Remziye%20%C3%87elik-CV-pdf.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-96",
            "name": "Hasan VURAN",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1583",
            "email": "hasan.vuran@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771379346170.CV_Vuran.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-97",
            "name": "Yusuf GARGU",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1572",
            "email": "yusuf.gargu@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1774963383117.Yusuf%20Gargu%20cvy.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-98",
            "name": "Türk-Din Musikisi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-99",
            "name": "Akın TERCANLI",
            "title": "Dr. Öğr. Üyesi",
            "role": "Türk-Din Musikisi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1588",
            "email": "akintercanli@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771290305254.Ak%C4%B1n%20TERCANLI%20CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-100",
            "name": "Ali DÜNDAR",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1563",
            "email": "ali.dundar@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771290628569.Ar%C5%9F.%20G%C3%B6r.%20Ali%20D%C3%BCndar%20CV%20form.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-101",
            "name": "Oğuzhan ALTUNTOP",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1562",
            "email": "oguzhan.altuntop@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771380458911.CV_ALTUNTOP.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-102",
            "name": "Türk-İslam Edebiyatı Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-103",
            "name": "Ahmet KURAY",
            "title": "Dr. Öğr. Üyesi",
            "role": "Türk-İslam Edebiyatı Ana Bilim Dalı Başkanı V.",
            "phone": "0 348 814 2666",
            "extension": "1592",
            "email": "ahmetkuray@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/17713744019.CV_KURAY.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-104",
            "name": "Ömer Faruk BİLGİN",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 2666",
            "extension": "1582",
            "email": "omerfaruk.bilgin@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771380182642.CV_Bilgin.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-105",
            "name": "Türk-İslam Sanatları Tarihi Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          },
          {
            "id": "95-0-106",
            "name": "Akın TERCANLI",
            "title": "Dr. Öğr. Üyesi",
            "role": "Türk-İslam Sanatları Tarihi Ana Bilim Dalı Başkanı",
            "phone": "0 348 814 2666",
            "extension": "1588",
            "email": "akintercanli@kilis.edu.tr",
            "profileUrl": "https://ilahiyat.kilis.edu.tr/documentFiles/1771290305254.Ak%C4%B1n%20TERCANLI%20CV.pdf",
            "unitName": "İlahiyat Fakültesi",
            "sectionName": "İlahiyat Fakültesi"
          }
        ]
      }
    ]
  },
  {
    "id": "90",
    "name": "İleri Teknoloji Uygulama ve Araştırma Merkezi",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-90-0",
        "fullHeader": "İleri Teknoloji Uygulama ve Araştırma Merkezi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "90-0-0",
            "name": "Doç. Dr. Eyyüb KARAKAN",
            "title": "Doçent",
            "role": "Müdür",
            "phone": "0348 814 26 66",
            "extension": "1344",
            "email": "eyyubkarakan@kilis.edu.tr",
            "unitName": "İleri Teknoloji Uygulama ve Araştırma Merkezi",
            "sectionName": "İleri Teknoloji Uygulama ve Araştırma Merkezi"
          },
          {
            "id": "90-0-1",
            "name": "Doç. Dr. Bekir Bülent ARPACI",
            "title": "Doçent",
            "role": "Müdür Yrd.",
            "phone": "0348 814 26 66",
            "extension": "1345",
            "email": "bbarpaci@kilis.edu.tr",
            "unitName": "İleri Teknoloji Uygulama ve Araştırma Merkezi",
            "sectionName": "İleri Teknoloji Uygulama ve Araştırma Merkezi"
          },
          {
            "id": "90-0-2",
            "name": "Dr. Öğr. Üyesi Deniz Kadir TAKCI",
            "title": "Dr. Öğr. Üyesi",
            "role": "Müdür Yrd.",
            "phone": "0 348 814 26 66",
            "extension": "1346",
            "email": "deniztakci@kilis.edu.tr",
            "unitName": "İleri Teknoloji Uygulama ve Araştırma Merkezi",
            "sectionName": "İleri Teknoloji Uygulama ve Araştırma Merkezi"
          },
          {
            "id": "90-0-3",
            "name": "Öğr. Gör. Dr. İbrahim Halil ÇELİK",
            "title": "Öğretim Görevlisi",
            "role": "Öğretim Görevlisi",
            "phone": "0 348 814 26 66",
            "extension": "1347",
            "email": "ibrahim.celik@kilis.edu.tr",
            "unitName": "İleri Teknoloji Uygulama ve Araştırma Merkezi",
            "sectionName": "İleri Teknoloji Uygulama ve Araştırma Merkezi"
          },
          {
            "id": "90-0-4",
            "name": "Şükrü MAVZER",
            "title": "Şef Memur",
            "role": "Memur",
            "phone": "0348 814 26 66",
            "extension": "1342",
            "email": "sukrumavzer@kilis.edu.tr",
            "unitName": "İleri Teknoloji Uygulama ve Araştırma Merkezi",
            "sectionName": "İleri Teknoloji Uygulama ve Araştırma Merkezi"
          },
          {
            "id": "90-0-5",
            "name": "Zülehya YAMAN",
            "title": "Tekniker",
            "role": "Memur",
            "phone": "0348 814 26 66",
            "extension": "1343",
            "email": "zuleyha.yaman@kilis.edu.tr",
            "unitName": "İleri Teknoloji Uygulama ve Araştırma Merkezi",
            "sectionName": "İleri Teknoloji Uygulama ve Araştırma Merkezi"
          },
          {
            "id": "90-0-6",
            "name": "Emine TAT",
            "title": "Memur",
            "role": "Memur",
            "phone": "0348 814 26 66",
            "extension": "1344",
            "email": "emine.tat@kilis.edu.tr",
            "unitName": "İleri Teknoloji Uygulama ve Araştırma Merkezi",
            "sectionName": "İleri Teknoloji Uygulama ve Araştırma Merkezi"
          }
        ]
      }
    ]
  },
  {
    "id": "94",
    "name": "İletişim Fakültesi",
    "category": "fakulte",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-94-0",
        "fullHeader": "İletişim Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "94-0-0",
            "name": "Mustafa CİNOĞLU",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0348 814 26 66",
            "extension": "1843",
            "email": "mustafacinoglu@kilis.edu.tr",
            "unitName": "İletişim Fakültesi",
            "sectionName": "İletişim Fakültesi"
          },
          {
            "id": "94-0-1",
            "name": "Hasibe KOCA KARTAL",
            "title": "Fakülte Sekreteri",
            "role": "Fakülte Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1278",
            "email": "hkartal@kilis.edu.tr",
            "unitName": "İletişim Fakültesi",
            "sectionName": "İletişim Fakültesi"
          },
          {
            "id": "94-0-2",
            "name": "Mahmut KARAMEMİŞ",
            "title": "Memur",
            "role": "Yazı İşleri, Taşınır Kayıt Yetkilisi",
            "phone": "0348 814 26 66",
            "extension": "1091",
            "email": "mahmut.karamemis@kilis.edu.tr",
            "unitName": "İletişim Fakültesi",
            "sectionName": "İletişim Fakültesi"
          }
        ]
      }
    ]
  },
  {
    "id": "89",
    "name": "İnsan ve Toplum Bilimleri Fakültesi",
    "category": "fakulte",
    "subDepartments": [
      {
        "id": "17",
        "fullName": "İnsan ve Toplum Bilimleri Fakültesi - Batı Dilleri Bölümü",
        "name": "Batı Dilleri Bölümü"
      },
      {
        "id": "64",
        "fullName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü",
        "name": "Coğrafya Bölümü"
      },
      {
        "id": "69",
        "fullName": "İnsan ve Toplum Bilimleri Fakültesi - Doğu Dilleri ve Edebiyatı Bölümü",
        "name": "Doğu Dilleri ve Edebiyatı Bölümü"
      },
      {
        "id": "79",
        "fullName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü",
        "name": "Felsefe Bölümü"
      },
      {
        "id": "55",
        "fullName": "İnsan ve Toplum Bilimleri Fakültesi - Psikoloji",
        "name": "Psikoloji"
      },
      {
        "id": "42",
        "fullName": "İnsan ve Toplum Bilimleri Fakültesi - Sosyoloji",
        "name": "Sosyoloji"
      },
      {
        "id": "38",
        "fullName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih",
        "name": "Tarih"
      },
      {
        "id": "28",
        "fullName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü",
        "name": "Türk Dili ve Edebiyatı Bölümü"
      }
    ],
    "sections": [
      {
        "id": "sec-89-0",
        "fullHeader": "İnsan ve Toplum Bilimleri Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "89-0-0",
            "name": "M. Fatih KANTER",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0348 814 26 66",
            "extension": "1401",
            "email": "fatihkanter@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          },
          {
            "id": "89-0-1",
            "name": "Muhamet Yasin ÇAKIR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Dekan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1402",
            "email": "yasincakır@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          },
          {
            "id": "89-0-2",
            "name": "Metin Gani TAPAN",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1403",
            "email": "metin.tapan@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          },
          {
            "id": "89-0-3",
            "name": "Mustafa AVCI",
            "title": "",
            "role": "Fakülte Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1404",
            "email": "mustafaavci@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          },
          {
            "id": "89-0-4",
            "name": "Kudret KUTLU",
            "title": "",
            "role": "Dekan Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1400",
            "email": "kudret.kutlu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          },
          {
            "id": "89-0-5",
            "name": "Yunus CAN",
            "title": "",
            "role": "Web Sitesi Sorumlusu - Kalite Sorumlusu - Bölüm Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1407",
            "email": "yunus.can@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          },
          {
            "id": "89-0-6",
            "name": "Zehra ÇAKI",
            "title": "",
            "role": "Mali İşler",
            "phone": "0348 814 26 66",
            "extension": "1405",
            "email": "zehra.caki@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          },
          {
            "id": "89-0-7",
            "name": "Sinan ÖRS",
            "title": "",
            "role": "Bölüm Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1408",
            "email": "sinan.ors@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          },
          {
            "id": "89-0-8",
            "name": "Çay Ocağı",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1427",
            "email": "",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          },
          {
            "id": "89-0-9",
            "name": "KANTİN-Yiğit GÜNDOĞMUŞ",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1479",
            "email": "",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi"
          }
        ]
      },
      {
        "id": "sec-89-1",
        "subDepartmentId": "17",
        "fullHeader": "İnsan ve Toplum Bilimleri Fakültesi - Batı Dilleri Bölümü",
        "title": "Batı Dilleri Bölümü",
        "contacts": [
          {
            "id": "89-1-0",
            "name": "Gülten SİLİNDİR KERETLİ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Batı Dilleri ve Edebiyatları Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1494",
            "email": "gultensilindir@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Batı Dilleri Bölümü"
          }
        ]
      },
      {
        "id": "sec-89-2",
        "subDepartmentId": "64",
        "fullHeader": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü",
        "title": "Coğrafya Bölümü",
        "contacts": [
          {
            "id": "89-2-0",
            "name": "Bilal Görentaş",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1420",
            "email": "bilal.gorentas@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü"
          },
          {
            "id": "89-2-1",
            "name": "Muazzez Harunoğulları",
            "title": "Prof. Dr.",
            "role": "Beşeri ve İktisadi Coğrafya Anabilim Dalı Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1410",
            "email": "muazzez@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü"
          },
          {
            "id": "89-2-2",
            "name": "Deniz Cengiz",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölgesel Coğrafya Anabilim Dalı Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1455",
            "email": "dcengiz@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü"
          },
          {
            "id": "89-2-3",
            "name": "Selin Yıldız Görentaş",
            "title": "Dr. Öğr. Üyesi",
            "role": "Türkiye Coğrafyası Anabilim Dalı Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1416",
            "email": "syildiz@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü"
          },
          {
            "id": "89-2-4",
            "name": "Gülsen Ayhan",
            "title": "Dr. Öğr. Üyesi",
            "role": "Fiziki Coğrafya Anabilim Dalı Başkan V.",
            "phone": "0 348 814 26 66",
            "extension": "1414",
            "email": "gulsen.ayhan@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü"
          },
          {
            "id": "89-2-5",
            "name": "Mutlu Seven",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1415",
            "email": "mutlu.seven@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü"
          },
          {
            "id": "89-2-6",
            "name": "Ahmet Gül",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1458",
            "email": "ahmet.gul@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü"
          },
          {
            "id": "89-2-7",
            "name": "Berkehan Bakır",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1432",
            "email": "berkehan.bakir@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü"
          },
          {
            "id": "89-2-8",
            "name": "Halil İbrahim Dönmez",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1406",
            "email": "ibrahim.donmez@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Coğrafya Bölümü"
          }
        ]
      },
      {
        "id": "sec-89-3",
        "subDepartmentId": "69",
        "fullHeader": "İnsan ve Toplum Bilimleri Fakültesi - Doğu Dilleri ve Edebiyatı Bölümü",
        "title": "Doğu Dilleri ve Edebiyatı Bölümü",
        "contacts": [
          {
            "id": "89-3-0",
            "name": "Bekir MEHMETALİ",
            "title": "Doç. Dr",
            "role": "Doğu Dilleri ve Edebiyatları Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1422",
            "email": "bekir.mehmetali@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Doğu Dilleri ve Edebiyatı Bölümü"
          },
          {
            "id": "89-3-1",
            "name": "Turgay GÖKGÖZ",
            "title": "Doç. Dr",
            "role": "Arap Dili Ve Edebiyatı Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1433",
            "email": "turgaygokgoz@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Doğu Dilleri ve Edebiyatı Bölümü"
          },
          {
            "id": "89-3-2",
            "name": "Muhammet ABAZOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Arap Dili Ve Edebiyatı Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1443",
            "email": "muhammet.abazoglu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Doğu Dilleri ve Edebiyatı Bölümü"
          },
          {
            "id": "89-3-3",
            "name": "Mohamad Salem ASSAD",
            "title": "Dr. Öğr. Üyes",
            "role": "Arap Dili ve Edebiyatı Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1429",
            "email": "salem.assad@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Doğu Dilleri ve Edebiyatı Bölümü"
          },
          {
            "id": "89-3-4",
            "name": "Emine ZEYTUNLU",
            "title": "Arş Gör. Dr",
            "role": "Arap Dili Ve Edebiyatı Anabilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1434",
            "email": "eminezeytunlu@kilis.edu.tr>",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Doğu Dilleri ve Edebiyatı Bölümü"
          },
          {
            "id": "89-3-5",
            "name": "Sait SÖYLEMEZ",
            "title": "Arş Gör.",
            "role": "Arap Dili Ve Edebiyatı Anabilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1483",
            "email": "saitsoylemez@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Doğu Dilleri ve Edebiyatı Bölümü"
          }
        ]
      },
      {
        "id": "sec-89-4",
        "subDepartmentId": "79",
        "fullHeader": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü",
        "title": "Felsefe Bölümü",
        "contacts": [
          {
            "id": "89-4-0",
            "name": "Özgül EKİNCİ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Felsefe Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1431",
            "email": "ozgulekinci@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          },
          {
            "id": "89-4-1",
            "name": "Necati DEMİR",
            "title": "Prof. Dr.",
            "role": "Felsefe Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1437",
            "email": "necati.demir@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          },
          {
            "id": "89-4-2",
            "name": "Nazım GÖKEL",
            "title": "Doç. Dr.",
            "role": "Sistematik Felsefe ve Mantık Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1428",
            "email": "ngokel@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          },
          {
            "id": "89-4-3",
            "name": "Fatma Betül TATLI",
            "title": "Dr. Öğr. Üyesi",
            "role": "Felsefe Tarihi Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1411",
            "email": "betultatli@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          },
          {
            "id": "89-4-4",
            "name": "Semir TEMİZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1442",
            "email": "semirtemiz@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          },
          {
            "id": "89-4-5",
            "name": "Onur VAROLUN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Felsefe Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1436",
            "email": "onurvarolun@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          },
          {
            "id": "89-4-6",
            "name": "Rabia Toprak TOPKAYA",
            "title": "Dr. Öğr. Üyesi",
            "role": "Sistematik Felsefe ve Mantık Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1487",
            "email": "rabiatopkaya@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          },
          {
            "id": "89-4-7",
            "name": "Tuba İLHAN DALAR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Sistematik Felsefe ve Mantık Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1488",
            "email": "tuba.ilhandalar@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          },
          {
            "id": "89-4-8",
            "name": "Ümit AKYOL",
            "title": "Öğr. Gör. Dr.",
            "role": "Felsefe Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1478",
            "email": "umit.akyol@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          },
          {
            "id": "89-4-9",
            "name": "Murat DÜZCE",
            "title": "Arş. Gör.",
            "role": "Felsefe Tarihi Anabilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1445",
            "email": "murat.düzce@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Felsefe Bölümü"
          }
        ]
      },
      {
        "id": "sec-89-5",
        "subDepartmentId": "55",
        "fullHeader": "İnsan ve Toplum Bilimleri Fakültesi - Psikoloji",
        "title": "Psikoloji",
        "contacts": [
          {
            "id": "89-5-0",
            "name": "Muharrem AKA",
            "title": "Doç. Dr.",
            "role": "Psikoloji Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1485",
            "email": "muharrem.aka@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Psikoloji"
          },
          {
            "id": "89-5-1",
            "name": "Muhammet Aykuthan ULUSOY",
            "title": "Dr. Öğr. Üyesi",
            "role": "Klinik Psikoloji Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1468",
            "email": "aykuthan.ulusoy@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Psikoloji"
          },
          {
            "id": "89-5-2",
            "name": "Yağmur YAĞMURCU TÜTÜNCÜLER",
            "title": "Dr. Öğr. Üyesi",
            "role": "Sosyal Psikoloji Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1473",
            "email": "yagmuryagmurcu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Psikoloji"
          },
          {
            "id": "89-5-3",
            "name": "Metin Gani TAPAN",
            "title": "Doç. Dr.",
            "role": "Sosyal Psikoloji Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1480",
            "email": "metin.tapan@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Psikoloji"
          },
          {
            "id": "89-5-4",
            "name": "Kübra EFENDİOĞLU AVCI",
            "title": "Arş. Gör.",
            "role": "Klinik Psikoloji Ana Bilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1472",
            "email": "kubra.efendioglu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Psikoloji"
          },
          {
            "id": "89-5-5",
            "name": "Yusuf Bahadır YILDIZ",
            "title": "Arş. Gör.",
            "role": "Sosyal Psikoloji Ana Bilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1476",
            "email": "yusufbahadir.yildiz@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Psikoloji"
          }
        ]
      },
      {
        "id": "sec-89-6",
        "subDepartmentId": "42",
        "fullHeader": "İnsan ve Toplum Bilimleri Fakültesi - Sosyoloji",
        "title": "Sosyoloji",
        "contacts": [
          {
            "id": "89-6-0",
            "name": "Mehmet Fatih GÜLOĞLU",
            "title": "Doç. Dr.",
            "role": "Sosyoloji Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1481",
            "email": "fatihguloglu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Sosyoloji"
          },
          {
            "id": "89-6-1",
            "name": "Duygu ALTINOLUK",
            "title": "Doç. Dr.",
            "role": "Sosyoloji Bölüm Başkan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1477",
            "email": "duygualtinoluk@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Sosyoloji"
          },
          {
            "id": "89-6-2",
            "name": "Muhammet Ruhat YAŞAR",
            "title": "Prof. Dr",
            "role": "Genel Sosyoloji ve Metodoloji Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1459",
            "email": "ruhat@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Sosyoloji"
          },
          {
            "id": "89-6-3",
            "name": "İpek AĞCADAĞ ÇELİK",
            "title": "Doç. Dr.",
            "role": "Kurumlar Sosyolojisi Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1422",
            "email": "ipekagcadag@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Sosyoloji"
          },
          {
            "id": "89-6-4",
            "name": "Nehir GÜNDOĞDU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Genel Sosyoloji ve Metodoloji Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1423",
            "email": "nehirgundogdu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Sosyoloji"
          },
          {
            "id": "89-6-5",
            "name": "Sefa ALTAY",
            "title": "Dr. Öğr. Üyesi",
            "role": "Kurumlar Sosyolojisi Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1475",
            "email": "sefaaltay@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Sosyoloji"
          },
          {
            "id": "89-6-6",
            "name": "Gizem Ayşe ARIKAN AKÇAY",
            "title": "Arş. Gör.",
            "role": "Uygulamalı Sosyoloji Ana Bilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1482",
            "email": "gizemayse.akcay@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Sosyoloji"
          }
        ]
      },
      {
        "id": "sec-89-7",
        "subDepartmentId": "38",
        "fullHeader": "İnsan ve Toplum Bilimleri Fakültesi - Tarih",
        "title": "Tarih",
        "contacts": [
          {
            "id": "89-7-0",
            "name": "Serhat KUZUCU",
            "title": "Prof. Dr.",
            "role": "Tarih Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1461",
            "email": "kuzucu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-1",
            "name": "Metin AKİS",
            "title": "Prof. Dr.",
            "role": "Yeniçağ Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1460",
            "email": "akis@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-2",
            "name": "Bilgehan PAMUK",
            "title": "Prof. Dr.",
            "role": "Yeniçağ Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1490",
            "email": "bilgehanpamuk@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-3",
            "name": "Mehmet Ali YILDIRIM",
            "title": "Prof. Dr.",
            "role": "Yakınçağ Tarihi Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1471",
            "email": "maliyildirim@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-4",
            "name": "Halil ÖZŞAVLI",
            "title": "Prof. Dr.",
            "role": "Yakınçağ Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1418",
            "email": "halil.ozsavli@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-5",
            "name": "İsmet ÜZEN",
            "title": "Prof. Dr.",
            "role": "Atatürk İnkılapları ve Türkiye Cumhuriyeti Tarihi Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1435",
            "email": "ismet.uzen@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-6",
            "name": "Meral KUZGUN",
            "title": "Doç. Dr.",
            "role": "Atatürk İnkılapları ve Türkiye Cumhuriyeti Tarihi Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1450",
            "email": "meralkuzgun@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-7",
            "name": "Telli AKHUNDOVA KORKMAZ",
            "title": "Prof. Dr.",
            "role": "Ortaçağ Tarihi Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1424",
            "email": "telli.korkmaz@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-8",
            "name": "Osman TAŞKIN",
            "title": "Doç. Dr.",
            "role": "Yakınçağ Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1448",
            "email": "osman.taskin@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-9",
            "name": "Abulhamit KAVAK",
            "title": "Doç. Dr.",
            "role": "Eskiçağ Tarihi Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1421",
            "email": "a.kavak@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-10",
            "name": "Ali AKDENİZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Tarih Bölüm Başkan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1469",
            "email": "ali.akdeniz@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-11",
            "name": "Mustafa KOYUNCU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Tarih Bölüm Başkan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1470",
            "email": "mustafakoyuncu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-12",
            "name": "İsmail PEHLİVAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Yakınçağ Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1451",
            "email": "ismailpehlivan@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-13",
            "name": "Abdullah BAYINDIR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Ortaçağ Tarihi Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1446",
            "email": "abdullahbayindir@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-14",
            "name": "Hasan YENİDOĞAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Ortaçağ Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1425",
            "email": "hasanyenidogan@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-15",
            "name": "Hilal KUTLU ALANCI",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eskiçağ Tarihi Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1444",
            "email": "hilalkutlu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-16",
            "name": "Ramazan ÇELEM",
            "title": "Dr. Öğr. Üyesi",
            "role": "Atatürk İnkılapları ve Türkiye Cumhuriyeti Tarihi Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1453",
            "email": "ramazancelem@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-17",
            "name": "Cihan ŞİMŞEK",
            "title": "Arş. Gör.",
            "role": "Ortaçağ Tarihi Anabilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1491",
            "email": "cihansimsek@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-18",
            "name": "Yunus Emre SOLGUN",
            "title": "Araş. Gör.",
            "role": "Ortaçağ Tarihi Anabilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1452",
            "email": "mresolgun@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          },
          {
            "id": "89-7-19",
            "name": "Mücahit Orkun İKİNCİ",
            "title": "Araş. Gör.",
            "role": "Yakınçağ Tarihi Anabilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1413",
            "email": "orkun.ikinci@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Tarih"
          }
        ]
      },
      {
        "id": "sec-89-8",
        "subDepartmentId": "28",
        "fullHeader": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü",
        "title": "Türk Dili ve Edebiyatı Bölümü",
        "contacts": [
          {
            "id": "89-8-0",
            "name": "Hüseyin DOĞRAMACIOĞLU",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1447",
            "email": "dogramacioglu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-1",
            "name": "Mustafa Fatih AYDIN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Türk Dili ve Edebiyatı Bölüm Başkanı Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1457",
            "email": "fatihaydin@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-2",
            "name": "Yeliz SAYGILI SAVAŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Türk Dili ve Edebiyatı Bölüm Başkanı Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1412",
            "email": "yelizsaygili@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-3",
            "name": "M. Fatih KANTER",
            "title": "Prof. Dr.",
            "role": "Yeni Türk Edebiyatı Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1439",
            "email": "fatihkanter@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-4",
            "name": "Mehmet ALPTEKİN",
            "title": "Prof. Dr.",
            "role": "Türk Halk Edebiyatı Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1426",
            "email": "mehmetalptekin@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-5",
            "name": "Armağan ZÖHRE",
            "title": "Doç. Dr.",
            "role": "Eski Türk Edebiyatı Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1489",
            "email": "armaganzohre@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-6",
            "name": "Gülsüm TARÇIN",
            "title": "Doç. Dr.",
            "role": "Türk Halk Edebiyatı Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1438",
            "email": "gtarcin@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-7",
            "name": "Tuğba BİLVEREN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Yeni Türk Dili Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1440",
            "email": "tyumrutas@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-8",
            "name": "Seher MAŞKARAOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Yeni Türk Dili Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1441",
            "email": "seher.maskaraoglu@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-9",
            "name": "Muhammet Yasin ÇAKIR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eski Türk Dili Anabilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1409",
            "email": "yasincakir@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-10",
            "name": "Bülent KAYA",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eski Türk Edebiyatı Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1484",
            "email": "bulentkaya@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-11",
            "name": "Faruk ÖZTÜRK",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eski Türk Edebiyatı Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1430",
            "email": "farukozturk@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-12",
            "name": "Zeliha AÇAR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eski Türk Edebiyatı Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1492",
            "email": "zeliha.acar@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-13",
            "name": "Zehra ERGEÇ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Yeni Türk Edebiyatı Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1493",
            "email": "ergeczehra@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-14",
            "name": "Kübra SOLMAZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eski Türk Edebiyatı Anabilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1419",
            "email": "kubraakatay@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          },
          {
            "id": "89-8-15",
            "name": "Nursena OVAĞ",
            "title": "Arş. Gör.",
            "role": "Yeni Türk Dili Anabilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1417",
            "email": "nursena.ovag@kilis.edu.tr",
            "unitName": "İnsan ve Toplum Bilimleri Fakültesi",
            "sectionName": "İnsan ve Toplum Bilimleri Fakültesi - Türk Dili ve Edebiyatı Bölümü"
          }
        ]
      }
    ]
  },
  {
    "id": "87",
    "name": "Kalite ve Veri Yönetimi Koordinatörlüğü",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-87-0",
        "fullHeader": "Kalite ve Veri Yönetimi Koordinatörlüğü",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "87-0-0",
            "name": "Ali KESTANE",
            "title": "Doç. Dr.",
            "role": "Koordinatör",
            "phone": "0348 814 26 66",
            "extension": "1040",
            "email": "alikestane@kilis.edu.tr",
            "unitName": "Kalite ve Veri Yönetimi Koordinatörlüğü",
            "sectionName": "Kalite ve Veri Yönetimi Koordinatörlüğü"
          },
          {
            "id": "87-0-1",
            "name": "Reyhan ANDEROĞLU",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1051",
            "email": "reyhan.anderoglu@kilis.edu.tr",
            "unitName": "Kalite ve Veri Yönetimi Koordinatörlüğü",
            "sectionName": "Kalite ve Veri Yönetimi Koordinatörlüğü"
          },
          {
            "id": "87-0-2",
            "name": "Ümit Haydar EROL",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 813 93 55",
            "extension": "7216",
            "email": "umith.erol@kilis.edu.tr",
            "unitName": "Kalite ve Veri Yönetimi Koordinatörlüğü",
            "sectionName": "Kalite ve Veri Yönetimi Koordinatörlüğü"
          },
          {
            "id": "87-0-3",
            "name": "Ali Emin İSLAMOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7523",
            "email": "alieminislamoglu@kilis.edu.tr",
            "unitName": "Kalite ve Veri Yönetimi Koordinatörlüğü",
            "sectionName": "Kalite ve Veri Yönetimi Koordinatörlüğü"
          },
          {
            "id": "87-0-4",
            "name": "Aysel Doğan",
            "title": "Arş. Gör. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1247",
            "email": "aysel.dogan@kilis.edu.tr",
            "unitName": "Kalite ve Veri Yönetimi Koordinatörlüğü",
            "sectionName": "Kalite ve Veri Yönetimi Koordinatörlüğü"
          },
          {
            "id": "87-0-5",
            "name": "Oğuzhan GENÇASLAN",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1739",
            "email": "oguzhan.gencaslan@kilis.edu.tr",
            "unitName": "Kalite ve Veri Yönetimi Koordinatörlüğü",
            "sectionName": "Kalite ve Veri Yönetimi Koordinatörlüğü"
          }
        ]
      }
    ]
  },
  {
    "id": "74",
    "name": "Kilisli Muallim Rıfat Eğitim Fakültesi",
    "category": "fakulte",
    "subDepartments": [
      {
        "id": "134",
        "fullName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü",
        "name": "Eğitim Bilimleri Bölümü"
      },
      {
        "id": "133",
        "fullName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Özel Eğitim Bölümü",
        "name": "Özel Eğitim Bölümü"
      },
      {
        "id": "137",
        "fullName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü",
        "name": "Matematik ve Fen Bilimler Eğitimi Bölümü"
      },
      {
        "id": "135",
        "fullName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü",
        "name": "Temel Eğitim Bölümü"
      },
      {
        "id": "136",
        "fullName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü",
        "name": "Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
      }
    ],
    "sections": [
      {
        "id": "sec-74-0",
        "fullHeader": "Kilisli Muallim Rıfat Eğitim Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "74-0-0",
            "name": "Şahin AHMETOĞLU",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0348 814 26 62",
            "extension": "1701",
            "email": "sahin.ahmetoglu@kilis.edu.tr",
            "profileUrl": "https://egitim.kilis.edu.tr/subdomain_files/egitim1/files/94/CV_Dekan.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          },
          {
            "id": "74-0-1",
            "name": "Fatih BEKTAŞ",
            "title": "Prof. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0348 814 26 62",
            "extension": "1703",
            "email": "fatihbektas@kilis.edu.tr",
            "profileUrl": "https://egitim.kilis.edu.tr/subdomain_files/egitim1/files/94/CV_Fatih%20BEKTA%C5%9E.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          },
          {
            "id": "74-0-2",
            "name": "Seda ŞAHİN",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0348 814 26 62",
            "extension": "1704",
            "email": "seda.sahin@kilis.edu.tr",
            "profileUrl": "https://matematikfen.kilis.edu.tr/subdomain_files/matematikfen/files/95/CV/CV%20form_SS%20(1).pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          },
          {
            "id": "74-0-3",
            "name": "Mehmet Ali YILAN",
            "title": "",
            "role": "Fakülte Sekreteri",
            "phone": "0348 814 26 62",
            "extension": "1706",
            "email": "mehmetali.yilan@kilis.edu.tr",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          },
          {
            "id": "74-0-4",
            "name": "Saliha BOLAT",
            "title": "",
            "role": "Dekan Sekreteri",
            "phone": "0348 814 26 62",
            "extension": "1700",
            "email": "salihabolat@kilis.edu.tr",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          },
          {
            "id": "74-0-5",
            "name": "Fatma AMİK",
            "title": "",
            "role": "Bölüm Sekreteri",
            "phone": "0348 814 26 62",
            "extension": "1707",
            "email": "fatmaamik@kilis.edu.tr",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          },
          {
            "id": "74-0-6",
            "name": "Haluk KORKMAZ",
            "title": "",
            "role": "Memur",
            "phone": "0348 814 26 62",
            "extension": "1708",
            "email": "halukkorkmaz@kilis.edu.tr",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          },
          {
            "id": "74-0-7",
            "name": "Alev KARLANGIÇ",
            "title": "",
            "role": "Hizmetli",
            "phone": "0348 814 26 62",
            "extension": "1740",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          },
          {
            "id": "74-0-8",
            "name": "Hüseyin SONGUR",
            "title": "",
            "role": "Hizmetli",
            "phone": "0348 814 26 62",
            "extension": "1740",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          },
          {
            "id": "74-0-9",
            "name": "Nuri Fırat HİDAYET",
            "title": "",
            "role": "Hizmetli",
            "phone": "0348 814 26 62",
            "extension": "1740",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi"
          }
        ]
      },
      {
        "id": "sec-74-1",
        "subDepartmentId": "134",
        "fullHeader": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü",
        "title": "Eğitim Bilimleri Bölümü",
        "contacts": [
          {
            "id": "74-1-0",
            "name": "Ebru KÜLEKÇİ AKYAVUZ",
            "title": "Doç. Dr.",
            "role": "Eğitim Bilimleri Bölüm Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1710",
            "email": "ebrukulekci@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/Ebru%20K%C3%BClek%C3%A7i%20Akyavuz%20CV%20form.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-1",
            "name": "Yıldız Burcu DOĞAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eğitim Bilimleri Bölüm Başkan Yardımcısı",
            "phone": "0348 814 26 62",
            "extension": "1722",
            "email": "burcudogan@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/91/Burcu%20Do%C4%9Fan%20CV.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-2",
            "name": "Mustafa CİNOĞLU",
            "title": "Prof. Dr.",
            "role": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi Dekanı",
            "phone": "0348 814 26 62",
            "extension": "1720",
            "email": "mustafacinoglu@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/cinoglu.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-3",
            "name": "Fatih BEKTAŞ",
            "title": "Prof. Dr.",
            "role": "Kilisli Muallim Rıfat Eğitim Fakültesi Dekan Yardımcısı",
            "phone": "0348 814 26 62",
            "extension": "1712",
            "email": "fatihbektas@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/CV%20form%20(1).pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-4",
            "name": "Hüseyin AKAR",
            "title": "Doç. Dr.",
            "role": "Eğitim Yönetimi ABD Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1729",
            "email": "huseyinakar@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/Akar,%20H%C3%BCseyin,%20%C3%96zge%C3%A7mi%C5%9F.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-5",
            "name": "Alper YETKİNER",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1742",
            "email": "ayetkiner@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/CV%20form-kmref-alper.docx_26.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-6",
            "name": "Habibe BİLGİLİ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Rehberlik ve Psikolojik Danışmanlık ABD Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1717",
            "email": "habibe.bilgili@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/CV%20form.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-7",
            "name": "Mehmet Selim YILDIRIM",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eğitim Programları ve Öğretim ABD Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1727",
            "email": "m.selimyildirim@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/CV%20Mehmet%20Selim%20YILDIRIM%20(4).pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-8",
            "name": "Seher BODUR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eğitimde Ölçme ve Değerlendirme ABD Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1747",
            "email": "seher.bodur@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/91/seher%20bodur%20cv%2030.01.2026.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-9",
            "name": "Ayşe Nur KATMER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1722",
            "email": "aysenur.katmer@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/91/CV_Ay%C5%9Fenur_Katmer.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-10",
            "name": "Tunahan ERPAY",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1766",
            "email": "tunahan.erpay@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/tunahan%20erpay.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-11",
            "name": "Mehmet MARANGOZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1746",
            "email": "mmarangoz@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/71/CV%20Mehmet%20Marangoz.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-12",
            "name": "İlknur AKYILDIZ SARIBAŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1709",
            "email": "ilknuras@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/iasar%C4%B1bas.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-13",
            "name": "Ahmet KARAKAŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1754",
            "email": "ahmetkarakas@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/CV%20form_Ahmet%20KARAKA%C5%9E.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-14",
            "name": "Ezgi LİF",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1730",
            "email": "ezgilif@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/CV_Ezgi%20L%C4%B0F.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-15",
            "name": "Muhammed Ali AĞCA",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1753",
            "email": "muhammedali.agca@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/91/Muhammed_Ali_A%C4%9ECA_CV%20form%20(2).pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-16",
            "name": "Rabia KARAHİSAR",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1724",
            "email": "rabia.ozan@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/146/Rabia_KARAHISAR_cv.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          },
          {
            "id": "74-1-17",
            "name": "Tansu TÜFENK",
            "title": "Arş. Gör.",
            "role": "(13B Enstitüye Görevlendirme)",
            "phone": "0348 814 26 62",
            "extension": "1764",
            "email": "tansu.tufenk@kilis.edu.tr",
            "profileUrl": "https://egitimbil.kilis.edu.tr/subdomain_files/egitimbil/files/91/CV_TANSU%20T%C3%9CFENK.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Eğitim Bilimleri Bölümü"
          }
        ]
      },
      {
        "id": "sec-74-2",
        "subDepartmentId": "133",
        "fullHeader": "Kilisli Muallim Rıfat Eğitim Fakültesi - Özel Eğitim Bölümü",
        "title": "Özel Eğitim Bölümü",
        "contacts": [
          {
            "id": "74-2-0",
            "name": "Beyza ALPAYDIN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Özel Eğitim Bölümü Başkanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1719",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Özel Eğitim Bölümü"
          },
          {
            "id": "74-2-1",
            "name": "Mustafa KARNAS",
            "title": "Dr. Öğr. Üyesi",
            "role": "Zihin Engelliler Eğitimi ABD ve İşitme Engelliler Eğitimi ABD Başkanı / Bölüm Başkanı Yardımcısı",
            "phone": "0 (348) 814 26 66",
            "extension": "1763",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Özel Eğitim Bölümü"
          },
          {
            "id": "74-2-2",
            "name": "Sevim KÜÇÜK KARAHAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Üstün Zekalılar Eğitimi ABD ve Görme Engelliler Eğitimi ABD Başkanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1769",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Özel Eğitim Bölümü"
          },
          {
            "id": "74-2-3",
            "name": "Fatma Semiha SAKA",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1728",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Özel Eğitim Bölümü"
          }
        ]
      },
      {
        "id": "sec-74-3",
        "subDepartmentId": "137",
        "fullHeader": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü",
        "title": "Matematik ve Fen Bilimler Eğitimi Bölümü",
        "contacts": [
          {
            "id": "74-3-0",
            "name": "İrfan DELİ",
            "title": "Prof. Dr.",
            "role": "Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1750",
            "email": "irfandeli@kilis.edu.tr",
            "profileUrl": "https://matematikfen.kilis.edu.tr/tr/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-1",
            "name": "Memet KULE",
            "title": "Prof. Dr.",
            "role": "Uygulamalı Bilimler Fakültesi Dekanı",
            "phone": "0348 814 26 62",
            "extension": "1745",
            "email": "memetkule@kilis.edu.tr",
            "profileUrl": "https://matematikfen.kilis.edu.tr/tr/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-2",
            "name": "Seda ŞAHİN",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0348 814 26 62",
            "extension": "1725",
            "email": "seda.sahin@kilis.edu.tr",
            "profileUrl": "https://matematikfen.kilis.edu.tr/tr/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-3",
            "name": "Zühal GÜN ŞAHİN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1910",
            "email": "z.gunsahin@kilis.edu.tr",
            "profileUrl": "https://matematikfen.kilis.edu.tr/tr/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-4",
            "name": "Bedirhan TEKE",
            "title": "Dr. Öğr. Üyesi",
            "role": "Büyük Veri Yönetim Ofisi Koordinatörü",
            "phone": "0348 814 26 62",
            "extension": "1762",
            "email": "bedirhan.teke@kilis.edu.tr",
            "profileUrl": "https://matematikfen.kilis.edu.tr/tr/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-5",
            "name": "Oğuzhan GENÇASLAN",
            "title": "Arş. Gör.",
            "role": "Kalite ve Veri Yönetimi Koordinatörlüğü (13/b-4)",
            "phone": "0348 814 26 62",
            "extension": "1739",
            "email": "oguzhan.gencaslan@kilis.edu.tr",
            "profileUrl": "https://matematikfen.kilis.edu.tr/tr/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-6",
            "name": "Zeynel Abidin YILMAZ",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1751",
            "email": "zeynelyilmaz@kilis.edu.tr",
            "profileUrl": "https://egitim.kilis.edu.tr/tr/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-7",
            "name": "Hülya DEDE",
            "title": "Doç. Dr.",
            "role": "Anabilim Dalı Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1713",
            "email": "hulyakutu@kilis.edu.tr",
            "profileUrl": "https://egitim.kilis.edu.tr/tr/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-8",
            "name": "Mesut YALÇIN",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1711",
            "email": "myalcin@kilis.edu.tr",
            "profileUrl": "https://matematikfen.kilis.edu.tr/en/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-9",
            "name": "Özge ÇİÇEK ŞENTÜRK",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1756",
            "email": "ozgecicek@kilis.edu.tr",
            "profileUrl": "https://matematikfen.kilis.edu.tr/en/academic-staffs",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-10",
            "name": "Murat Berat UÇAR",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1736",
            "email": "berat@kilis.edu.tr",
            "profileUrl": "https://egitim.kilis.edu.tr/tr/academic-staffs#",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-3-11",
            "name": "Nihat ALTINÖZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1757",
            "email": "nihat.altinoz@kilis.edu.tr",
            "profileUrl": "https://egitim.kilis.edu.tr/tr/academic-staffs#",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Matematik ve Fen Bilimler Eğitimi Bölümü"
          }
        ]
      },
      {
        "id": "sec-74-4",
        "subDepartmentId": "135",
        "fullHeader": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü",
        "title": "Temel Eğitim Bölümü",
        "contacts": [
          {
            "id": "74-4-0",
            "name": "Zeynel AMAÇ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Temel Eğitim Bölüm Başkanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1718",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-1",
            "name": "Vakkas YALÇIN",
            "title": "Doç. Dr.",
            "role": "Okul Öncesi Eğitimi ABD Başkanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1716",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-2",
            "name": "Yakup DOĞAN",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1758",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-3",
            "name": "Lütfiye COŞKUN",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1705",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-4",
            "name": "Hızır DİNLER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1735",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-5",
            "name": "Bala ÇAPAR",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1737",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-6",
            "name": "Esat YILDIRIM",
            "title": "Doç. Dr.",
            "role": "Sınıf Eğitimi ABD Başkanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1741",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-7",
            "name": "Yılmaz SAĞLAM",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1744",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-8",
            "name": "Niyazi CAN",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1799",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-9",
            "name": "Nermin Zahide AYDIN",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1752",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-10",
            "name": "Durmuş BURAK",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1718",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-11",
            "name": "Esra SARAÇ YILDIRIM",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1748",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          },
          {
            "id": "74-4-12",
            "name": "Figen YILDIRIM",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1715",
            "email": "",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Temel Eğitim Bölümü"
          }
        ]
      },
      {
        "id": "sec-74-5",
        "subDepartmentId": "136",
        "fullHeader": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü",
        "title": "Türkçe ve Sosyal Bilimler Eğitimi Bölümü",
        "contacts": [
          {
            "id": "74-5-0",
            "name": "Ömer Faruk İNCİLİ",
            "title": "Doç. Dr.",
            "role": "Türkçe ve Sosyal Bilimler Eğitimi Bölüm Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1772",
            "email": "ofarukincili@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/94/CV_%C3%96mer%20F.%20%C4%B0NC%C4%B0L%C4%B0.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-1",
            "name": "Selvi DEMİR",
            "title": "Doç. Dr.",
            "role": "Türkçe Eğitimi ABD Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1760",
            "email": "selvidemir@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/97/%C3%B6zge%C3%A7mi%C5%9F/Cv-%20Selvi%20Demir.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-2",
            "name": "Türkan ÇELİK",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1731",
            "email": "turkancelik@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/94/t%C3%BCrkan%20%C3%A7elik.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-3",
            "name": "Mehmet ŞENTÜRK",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1761",
            "email": "senturk@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/94/CV%20Mehmet%20%C5%9EENT%C3%9CRK.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-4",
            "name": "Özlem MURAZ BUDAK",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "*",
            "email": "ozlem.muraz@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/71/%C3%96zge%C3%A7mi%C5%9Fler/CV_%C3%96zlem%20Muraz%20Budak.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-5",
            "name": "Gülşah PARLAK KALKAN",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1749",
            "email": "gulsahparlak@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/97/%C3%B6zge%C3%A7mi%C5%9F/Cv-%20G%C3%BCl%C5%9Fah%20Parlak%20Kalkan.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-6",
            "name": "Tuba ALPTEKİN",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1743",
            "email": "tuba.kaplan@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/97/%C3%B6zge%C3%A7mi%C5%9F/Cv-%20Tuba%20Alptekin.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-7",
            "name": "Fatih TIKMAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Sosyal Bilgiler Eğitimi ABD Başkanı",
            "phone": "0348 814 26 62",
            "extension": "1721",
            "email": "fatihtikman@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/94/CV_Fatih%20TIKMAN.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-8",
            "name": "Erdinç GÜLCÜ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1723",
            "email": "e.gulcu@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/94/CV_Erdin%C3%A7%20G%C3%BClc%C3%BC.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-9",
            "name": "Mehmet BOZASLAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1463",
            "email": "mehmet.bozaslan@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/94/mehmet%20BOZASLAN%20CV.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-10",
            "name": "Mehmet ÖZŞAVLI",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1759",
            "email": "mehmetozsavli@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/97/%C3%B6zge%C3%A7mi%C5%9F/CV-%20Mehmet%20%C3%96z%C5%9Favl%C4%B1.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-11",
            "name": "Bekir Sıddık KILIÇ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1738",
            "email": "bskilic@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/97/%C3%B6zge%C3%A7mi%C5%9F/CV%20form%20Bekir%20S%C4%B1dd%C4%B1k%20KILI%C3%87.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-12",
            "name": "Sadık DURAN",
            "title": "Araştırma Görevlisi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1740",
            "email": "sadikduran@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/97/%C3%B6zge%C3%A7mi%C5%9F/Cv-S.Duran.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-13",
            "name": "Arda EREN",
            "title": "Araştırma Görevlisi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1733",
            "email": "arda.eren@kilis.edu.tr",
            "profileUrl": "https://turkcesosyal.kilis.edu.tr/subdomain_files/turkcesosyal/files/94/CV%20Arda%20EREN.pdf",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          },
          {
            "id": "74-5-14",
            "name": "Abdusselam KÖSE",
            "title": "Araştırma Görevlisi",
            "role": "",
            "phone": "0348 814 26 62",
            "extension": "1734",
            "email": "abdusselam.kose@kilis.edu.tr",
            "unitName": "Kilisli Muallim Rıfat Eğitim Fakültesi",
            "sectionName": "Kilisli Muallim Rıfat Eğitim Fakültesi - Türkçe ve Sosyal Bilimler Eğitimi Bölümü"
          }
        ]
      }
    ]
  },
  {
    "id": "106",
    "name": "Kurumsal İletişim Koordinatörlüğü",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-106-0",
        "fullHeader": "Kurumsal İletişim Koordinatörlüğü",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "106-0-0",
            "name": "Ali GENÇ",
            "title": "Öğr. Gör.",
            "role": "Kurumsal İletişim Koordinatörü",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "aligenc@kilis.edu.tr",
            "unitName": "Kurumsal İletişim Koordinatörlüğü",
            "sectionName": "Kurumsal İletişim Koordinatörlüğü"
          },
          {
            "id": "106-0-1",
            "name": "Kadir POLAT",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "kadirpolat@kilis.edu.tr",
            "unitName": "Kurumsal İletişim Koordinatörlüğü",
            "sectionName": "Kurumsal İletişim Koordinatörlüğü"
          },
          {
            "id": "106-0-2",
            "name": "Sahra İpek EDİS AYDOĞAN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1021",
            "email": "sahra.aydogan@kilis.edu.tr",
            "unitName": "Kurumsal İletişim Koordinatörlüğü",
            "sectionName": "Kurumsal İletişim Koordinatörlüğü"
          },
          {
            "id": "106-0-3",
            "name": "Mustafa DALKIRAN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1053",
            "email": "mustafa.dalkiran@kilis.edu.tr",
            "unitName": "Kurumsal İletişim Koordinatörlüğü",
            "sectionName": "Kurumsal İletişim Koordinatörlüğü"
          },
          {
            "id": "106-0-4",
            "name": "Şakira ÖZKAN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1054",
            "email": "sakira.ozkan@kilis.edu.tr",
            "unitName": "Kurumsal İletişim Koordinatörlüğü",
            "sectionName": "Kurumsal İletişim Koordinatörlüğü"
          },
          {
            "id": "106-0-5",
            "name": "Mutlu Naim SALİHOĞLU",
            "title": "Fotoğrafçı",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1027",
            "email": "mutlusalihoglu@kilis.edu.tr",
            "unitName": "Kurumsal İletişim Koordinatörlüğü",
            "sectionName": "Kurumsal İletişim Koordinatörlüğü"
          },
          {
            "id": "106-0-6",
            "name": "Veysi BAYINDIR",
            "title": "Grafiker",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1041",
            "email": "veysi.bayindir@kilis.edu.tr",
            "unitName": "Kurumsal İletişim Koordinatörlüğü",
            "sectionName": "Kurumsal İletişim Koordinatörlüğü"
          }
        ]
      }
    ]
  },
  {
    "id": "107",
    "name": "KÜSEM - Sürekli Eğitim Merkezi",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-107-0",
        "fullHeader": "KÜSEM - Sürekli Eğitim Merkezi",
        "title": "Sürekli Eğitim Merkezi",
        "contacts": [
          {
            "id": "107-0-0",
            "name": "Rufeyde Gökçe",
            "title": "Şef",
            "role": "Şef",
            "phone": "1022",
            "extension": "1022",
            "email": "rufeydeyanmaz@kilis.edu.tr",
            "unitName": "KÜSEM - Sürekli Eğitim Merkezi",
            "sectionName": "KÜSEM - Sürekli Eğitim Merkezi"
          }
        ]
      }
    ]
  },
  {
    "id": "108",
    "name": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-108-0",
        "fullHeader": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "108-0-0",
            "name": "Mehmet UYAR",
            "title": "Daire Başkanı",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1331",
            "email": "mehmetuyar@kilis.edu.tr",
            "profileUrl": "https://kutuphane.kilis.edu.tr",
            "unitName": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
            "sectionName": "Kütüphane ve Dokümantasyon Daire Başkanlığı"
          },
          {
            "id": "108-0-1",
            "name": "Hüseyin AKKURT",
            "title": "Şube Müdürü",
            "role": "Teknik Hizmetler Şube Müdürü",
            "phone": "0 (348) 814 26 66",
            "extension": "1332",
            "email": "huseyinakkurt@kilis.edu.tr",
            "unitName": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
            "sectionName": "Kütüphane ve Dokümantasyon Daire Başkanlığı"
          },
          {
            "id": "108-0-2",
            "name": "Habib TUTLU",
            "title": "Şube Müdürü",
            "role": "Kullanıcı Hizmetleri Şube Müdürü",
            "phone": "0 (348) 814 26 66",
            "extension": "1337",
            "email": "habib.tutlu@kilis.edu.tr",
            "unitName": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
            "sectionName": "Kütüphane ve Dokümantasyon Daire Başkanlığı"
          },
          {
            "id": "108-0-3",
            "name": "Neslihan MERT",
            "title": "Öğr. Gör.",
            "role": "Veri Tabanları ve Akademik Arşiv",
            "phone": "0 (348) 814 26 66",
            "extension": "1334",
            "email": "nsarialtun@kilis.edu.tr",
            "unitName": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
            "sectionName": "Kütüphane ve Dokümantasyon Daire Başkanlığı"
          },
          {
            "id": "108-0-4",
            "name": "Muazzez AKSU",
            "title": "Şef",
            "role": "Satın Alma ve Kütüphaneler Arası Ödünç",
            "phone": "0 (348) 814 26 66",
            "extension": "1333",
            "email": "maksu@kilis.edu.tr",
            "unitName": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
            "sectionName": "Kütüphane ve Dokümantasyon Daire Başkanlığı"
          },
          {
            "id": "108-0-5",
            "name": "Orkun SUCU",
            "title": "Kütüphaneci",
            "role": "Sağlama, Kataloglama ve Sınıflama",
            "phone": "0 (348) 814 26 66",
            "extension": "1335",
            "email": "orkunsucu@kilis.edu.tr",
            "unitName": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
            "sectionName": "Kütüphane ve Dokümantasyon Daire Başkanlığı"
          },
          {
            "id": "108-0-6",
            "name": "Dilay YILMAZ",
            "title": "Memur",
            "role": "Ödünç İade Bankosu",
            "phone": "0 (348) 814 26 66",
            "extension": "1338",
            "email": "dilay.yilmaz@kilis.edu.tr",
            "unitName": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
            "sectionName": "Kütüphane ve Dokümantasyon Daire Başkanlığı"
          },
          {
            "id": "108-0-7",
            "name": "Abidin SAĞLAMER",
            "title": "Hizmetli",
            "role": "Ödünç İade Bankosu",
            "phone": "0 (348) 814 26 66",
            "extension": "1338",
            "email": "",
            "unitName": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
            "sectionName": "Kütüphane ve Dokümantasyon Daire Başkanlığı"
          },
          {
            "id": "108-0-8",
            "name": "Şükrü ÖRS",
            "title": "Hizmetli",
            "role": "Sekreterlik",
            "phone": "0 (348) 814 26 66",
            "extension": "1330",
            "email": "",
            "unitName": "Kütüphane ve Dokümantasyon Daire Başkanlığı",
            "sectionName": "Kütüphane ve Dokümantasyon Daire Başkanlığı"
          }
        ]
      }
    ]
  },
  {
    "id": "121",
    "name": "Lisansüstü Eğitim Enstitüsü",
    "category": "enstitu",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-121-0",
        "fullHeader": "Lisansüstü Eğitim Enstitüsü",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "121-0-0",
            "name": "Vakkas ULUÇAY",
            "title": "Doç. Dr.",
            "role": "Enstitü Müdürü",
            "phone": "0348 814 26 66",
            "extension": "1546",
            "email": "vakkas.ulucay@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-1",
            "name": "Muhammet Aykuthan ULUSOY",
            "title": "Dr. Öğr. Üyesi",
            "role": "Enstitü Müdür Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1545",
            "email": "aykuthan.ulusoy@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-2",
            "name": ".....",
            "title": "....",
            "role": "Enstitü Müdür Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1968",
            "email": "....",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-3",
            "name": "Muharrem GÜZ",
            "title": "Enstitü Sekreteri",
            "role": "Enstitü Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1547",
            "email": "muharremguz@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-4",
            "name": "Elif Nisa GÖKÇEN",
            "title": "Arş. Gör. Dr.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1849",
            "email": "elifnisa.pak@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-5",
            "name": "Sercan ÇAMLI",
            "title": "Arş. Gör. Dr.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1851",
            "email": "sercancamli@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-6",
            "name": "Mustafa ERGİN",
            "title": "Arş. Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1844",
            "email": "mustafa.ergin@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-7",
            "name": "Tansu TÜFENK",
            "title": "Arş. Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1854",
            "email": "tansu.tufenk@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-8",
            "name": "Halil İbrahim DÖNMEZ",
            "title": "Arş. Gör.",
            "role": "Arş. Gör.",
            "phone": "0348 814 26 66",
            "extension": "1406",
            "email": "ibrahim.donmez@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-9",
            "name": "Aysel UZUN BAYINDIR",
            "title": "Bilgisayar İşletmeni",
            "role": "Yazı İşleri",
            "phone": "0348 814 26 66",
            "extension": "1840",
            "email": "ayseluzun@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-10",
            "name": "Alaaddin ÇİFTÇİ",
            "title": "Şef",
            "role": "Öğrenci İşleri",
            "phone": "0348 814 26 66",
            "extension": "1846",
            "email": "alaaddin@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-11",
            "name": "Mesut GÖK",
            "title": "Bilgisayar İşletmeni",
            "role": "Öğrenci İşleri",
            "phone": "0348 814 26 66",
            "extension": "1847",
            "email": "mesut.gok@kilis.edu.tr",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-12",
            "name": "Müdür Sekreterliği",
            "title": "",
            "role": "Sekreterlik",
            "phone": "0348 814 26 66",
            "extension": "1852",
            "email": "",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          },
          {
            "id": "121-0-13",
            "name": "Çay Ocağı",
            "title": "Hizmetli",
            "role": "Hizmetli",
            "phone": "0348 814 26 66",
            "extension": "1853",
            "email": "",
            "unitName": "Lisansüstü Eğitim Enstitüsü",
            "sectionName": "Lisansüstü Eğitim Enstitüsü"
          }
        ]
      }
    ]
  },
  {
    "id": "67",
    "name": "Mühendislik ve Mimarlık Fakültesi",
    "category": "fakulte",
    "subDepartments": [
      {
        "id": "92",
        "fullName": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği",
        "name": "İnşaat Mühendisliği"
      },
      {
        "id": "110",
        "fullName": "Mühendislik ve Mimarlık Fakültesi - Makine Mühendisliği",
        "name": "Makine Mühendisliği"
      },
      {
        "id": "113",
        "fullName": "Mühendislik ve Mimarlık Fakültesi - Mimarlık Bölümü",
        "name": "Mimarlık Bölümü"
      },
      {
        "id": "73",
        "fullName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği",
        "name": "Elektrik Elektronik Mühendisliği"
      }
    ],
    "sections": [
      {
        "id": "sec-67-0",
        "fullHeader": "Mühendislik ve Mimarlık Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "67-0-0",
            "name": "Kemal DELİHACIOĞLU",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0348 814 26 66",
            "extension": "1801",
            "email": "kemal@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-1",
            "name": "Efe Çetin YILMAZ",
            "title": "Prof. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1803",
            "email": "efeyilmaz@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-2",
            "name": "Burhan BEZEKÇİ",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1804",
            "email": "burhanbezekci@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-3",
            "name": "Rukiye ARSLAN",
            "title": "Fakülte Sekreteri",
            "role": "Fakülte Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1805",
            "email": "rukiyearslan@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-4",
            "name": "Hamide BOZGEYİK",
            "title": "Bilgisayar İşletmeni",
            "role": "Dekanlık Özel Kalem",
            "phone": "0348 814 26 66",
            "extension": "1800",
            "email": "hamidebozgeyik@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-5",
            "name": "Cuma KARA",
            "title": "Şef",
            "role": "Bölüm Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1808",
            "email": "cumakara@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-6",
            "name": "Ömer Faruk FARSAKOĞLU",
            "title": "Prof. Dr",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1822",
            "email": "ffarsakoglu@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-7",
            "name": "Mustafa Mikail ÖZÇİLOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1828",
            "email": "mozciloglu@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-8",
            "name": "Mustafa NALBANTOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1809",
            "email": "mnalbant@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-9",
            "name": "İsrafil KARADÖL",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1825",
            "email": "israfilkaradol@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-10",
            "name": "Habip Yusuf HASIRCI",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1818",
            "email": "hyusufhasirci@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-11",
            "name": "Yusuf AKÇAY",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1816",
            "email": "yusuf.akcay@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-12",
            "name": "Hüseyin KORKMAZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1838",
            "email": "huseyin.korkmaz@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-13",
            "name": "Erhan TİRYAKİ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1820",
            "email": "erhan.tiryaki@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-14",
            "name": "Cumali KAYNAR",
            "title": "Arş. Gör.",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1810",
            "email": "ckaynar@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-15",
            "name": "Mert DEMİR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1815",
            "email": "mertdemir@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-16",
            "name": "Mehmet Veysel ÇAKIR",
            "title": "Doç. Dr.",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1823",
            "email": "cakir@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-17",
            "name": "Yakup ÖNAL",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1830",
            "email": "yakup.onal@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-18",
            "name": "Süleyman DEMİR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1824",
            "email": "suleymandemir@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-19",
            "name": "Kağan SÖĞÜT",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1814",
            "email": "kagan.sogut@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-20",
            "name": "Hadaan PEHLİVAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1821",
            "email": "hadaantaban@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-21",
            "name": "Yunus ÖZTÜRK",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1813",
            "email": "ynsemre@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-22",
            "name": "Hacer ÇOLAK",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1817",
            "email": "hacercolak@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-23",
            "name": "Burcu ERCAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1812",
            "email": "burcuercan@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-24",
            "name": "Refia GÜNGÖR GÜNAY",
            "title": "Arş. Gör.",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "1819",
            "email": "refia.gungor@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          },
          {
            "id": "67-0-25",
            "name": "Ayşe Betül KÖKSAL",
            "title": "Arş. Gör.",
            "role": "Akademik",
            "phone": "0348 814 26 66",
            "extension": "",
            "email": "ayse.sener@yildiz.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi"
          }
        ]
      },
      {
        "id": "sec-67-1",
        "subDepartmentId": "92",
        "fullHeader": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği",
        "title": "İnşaat Mühendisliği",
        "contacts": [
          {
            "id": "67-1-0",
            "name": "Eyyüb KARAKAN",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1829",
            "email": "eyyubkarakan@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği"
          },
          {
            "id": "67-1-1",
            "name": "Hacer ÇOLAK",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkan Yardımcısı / Yapı Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1817",
            "email": "hacercolak@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği"
          },
          {
            "id": "67-1-2",
            "name": "Yunus ÖZTÜRK",
            "title": "Dr. Öğr. Üyesi",
            "role": "Hidrolik Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1813",
            "email": "ynsemre@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği"
          },
          {
            "id": "67-1-3",
            "name": "Hadaan PEHLİVAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Yapı Malzemesi Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1821",
            "email": "hadaantaban@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği"
          },
          {
            "id": "67-1-4",
            "name": "Kağan SÖğÜT",
            "title": "Dr. Öğr. Üyesi",
            "role": "Yapı Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1814",
            "email": "kagan.sogut@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği"
          },
          {
            "id": "67-1-5",
            "name": "Süleyman DEMİR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Geoteknik Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1824",
            "email": "suleymandemir@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği"
          },
          {
            "id": "67-1-6",
            "name": "Burcu ERCAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Hidrolik Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1812",
            "email": "burcuercan@kilis.edu.tr.",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği"
          },
          {
            "id": "67-1-7",
            "name": "Yakup ÖNAL",
            "title": "Dr. Öğr. Üyesi",
            "role": "Ulaştırma Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1830",
            "email": "yakup.onal@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - İnşaat Mühendisliği"
          }
        ]
      },
      {
        "id": "sec-67-2",
        "subDepartmentId": "110",
        "fullHeader": "Mühendislik ve Mimarlık Fakültesi - Makine Mühendisliği",
        "title": "Makine Mühendisliği",
        "contacts": [
          {
            "id": "67-2-0",
            "name": "M. Veysel ÇAKIR",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1823",
            "email": "cakir@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Makine Mühendisliği"
          },
          {
            "id": "67-2-1",
            "name": "Mert DEMİR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Mekanik Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1815",
            "email": "mertdemir@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Makine Mühendisliği"
          }
        ]
      },
      {
        "id": "sec-67-3",
        "subDepartmentId": "113",
        "fullHeader": "Mühendislik ve Mimarlık Fakültesi - Mimarlık Bölümü",
        "title": "Mimarlık Bölümü",
        "contacts": [
          {
            "id": "67-3-0",
            "name": "Eyyüb KARAKAN",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkan V.",
            "phone": "0348 814 26 66",
            "extension": "1829",
            "email": "eyyubkarakan@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Mimarlık Bölümü"
          },
          {
            "id": "67-3-1",
            "name": "Refia GÜNGÖR GÜNAY",
            "title": "Arş. Gör.",
            "role": "Yapı Bilgisi Ana Bilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1819",
            "email": "refia.gungor@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Mimarlık Bölümü"
          }
        ]
      },
      {
        "id": "sec-67-4",
        "subDepartmentId": "73",
        "fullHeader": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği",
        "title": "Elektrik Elektronik Mühendisliği",
        "contacts": [
          {
            "id": "67-4-0",
            "name": "M. Mikail ÖZÇİLOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1828",
            "email": "mozciloglu@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-1",
            "name": "Mustafa NALBANTOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkan Yardımcısı / Elektrik Makinaları Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1809",
            "email": "mnalbant@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-2",
            "name": "Kemal DELİHACIOĞLU",
            "title": "Prof. Dr.",
            "role": "Elektromanyetik Alanlar ve Mikrodalga Tekniği Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1826",
            "email": "kemal@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-3",
            "name": "Ömer Faruk FARSAKOĞLU",
            "title": "Prof. Dr.",
            "role": "Elektronik Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1822",
            "email": "ffarsakoglu@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-4",
            "name": "Efe Çetin YILMAZ",
            "title": "Prof. Dr.",
            "role": "Kontrol ve Kumanda Sistemleri Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1827",
            "email": "efeyilmaz@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-5",
            "name": "Burhan BEZEKÇİ",
            "title": "Doç. Dr.",
            "role": "Devreler ve Sistemler Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1811",
            "email": "burhanbezekci@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-6",
            "name": "İsrafil KARADÖL",
            "title": "Dr. Öğr. Üyesi",
            "role": "Eletrik Tesisleri Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1825",
            "email": "israfilkaradol@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-7",
            "name": "Habip Yusuf HASIRCI",
            "title": "Dr. Öğr. Üyesi",
            "role": "Elektrik Tesisleri Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1818",
            "email": "hyusufhasirci@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-8",
            "name": "Yusuf AKÇAY",
            "title": "Dr. Öğr. Üyesi",
            "role": "Elektrik Makinaları Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1816",
            "email": "yusuf.akcay@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-9",
            "name": "Hüseyin KORKMAZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Elektromanyetik Alanlar ve Mikrodalga Tekniği Ana Bilim Dalı Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1838",
            "email": "huseyin.korkmaz@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-10",
            "name": "Erhan TİRYAKİ",
            "title": "Öğr. Gör. Dr.",
            "role": "Telekomünikasyon Ana Bilim Dalı Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1820",
            "email": "erhan.tiryaki@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          },
          {
            "id": "67-4-11",
            "name": "Cumali KAYNAR",
            "title": "Arş. Gör.",
            "role": "Bilgisayar Bilimleri Ana Bilim Dalı Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1810",
            "email": "ckaynar@kilis.edu.tr",
            "unitName": "Mühendislik ve Mimarlık Fakültesi",
            "sectionName": "Mühendislik ve Mimarlık Fakültesi - Elektrik Elektronik Mühendisliği"
          }
        ]
      }
    ]
  },
  {
    "id": "manual-card-22",
    "name": "ODTÜ Teknokent Kilis Girişim Ofisi",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-manual-card-22-0",
        "fullHeader": "ODTÜ Teknokent Kilis Girişim Ofisi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "manual-card-22-0-0",
            "name": "Kilis Girişim Ofisi",
            "title": "",
            "role": "",
            "phone": "05337269911",
            "extension": "1370",
            "email": "",
            "unitName": "ODTÜ Teknokent Kilis Girişim Ofisi",
            "sectionName": "ODTÜ Teknokent Kilis Girişim Ofisi"
          }
        ]
      }
    ]
  },
  {
    "id": "145",
    "name": "Ortak Seçmeli Dersler Koordinatörlüğü",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-145-0",
        "fullHeader": "Ortak Seçmeli Dersler Koordinatörlüğü",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "145-0-0",
            "name": "Muazzez HARUNOĞULLARI",
            "title": "Prof. Dr.",
            "role": "Ortak Seçmeli Dersler Koordinatörü",
            "phone": "0(348) 814 26 66",
            "extension": "1467",
            "email": "muazzez@kilis.edu.tr",
            "profileUrl": "http://h",
            "unitName": "Ortak Seçmeli Dersler Koordinatörlüğü",
            "sectionName": "Ortak Seçmeli Dersler Koordinatörlüğü"
          },
          {
            "id": "145-0-1",
            "name": "Nuray KAYA EYİGÜN",
            "title": "Şef",
            "role": "Şef",
            "phone": "0(348) 814 26 66",
            "extension": "1466",
            "email": "nuraykaya@kilis.edu.tr",
            "profileUrl": "http://H",
            "unitName": "Ortak Seçmeli Dersler Koordinatörlüğü",
            "sectionName": "Ortak Seçmeli Dersler Koordinatörlüğü"
          }
        ]
      }
    ]
  },
  {
    "id": "146",
    "name": "Ortak Zorunlu Dersler Koordinatörlüğü",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-146-0",
        "fullHeader": "Ortak Zorunlu Dersler Koordinatörlüğü",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "146-0-0",
            "name": "Muazzez HARUNOĞULLARI",
            "title": "Prof. Dr.",
            "role": "Ortak Zorunlu Dersler Koordinatörü",
            "phone": "0(348) 814 26 66",
            "extension": "1467",
            "email": "muazzez@kilis.edu.tr",
            "profileUrl": "https://www.kilis.edu.tr/tr",
            "unitName": "Ortak Zorunlu Dersler Koordinatörlüğü",
            "sectionName": "Ortak Zorunlu Dersler Koordinatörlüğü"
          },
          {
            "id": "146-0-1",
            "name": "Nuray KAYA EYİGÜN",
            "title": "Şef",
            "role": "Şef",
            "phone": "0(348) 814 26 66",
            "extension": "1466",
            "email": "nuraykaya@kilis.edu.tr",
            "profileUrl": "http://h",
            "unitName": "Ortak Zorunlu Dersler Koordinatörlüğü",
            "sectionName": "Ortak Zorunlu Dersler Koordinatörlüğü"
          },
          {
            "id": "146-0-2",
            "name": "Mehmet BOZASLAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0(348) 814 26 66",
            "extension": "1463",
            "email": "mehmet.bozaslan@kilis.edu.tr",
            "profileUrl": "http://h",
            "unitName": "Ortak Zorunlu Dersler Koordinatörlüğü",
            "sectionName": "Ortak Zorunlu Dersler Koordinatörlüğü"
          },
          {
            "id": "146-0-3",
            "name": "Osman Zahit KÜÇÜKLER",
            "title": "Öğr. Gör. Dr.",
            "role": "Öğretim Görevlisi Doktor",
            "phone": "0(348) 814 26 66",
            "extension": "1454",
            "email": "ozkucukler@kilis.edu.tr",
            "profileUrl": "http://h",
            "unitName": "Ortak Zorunlu Dersler Koordinatörlüğü",
            "sectionName": "Ortak Zorunlu Dersler Koordinatörlüğü"
          },
          {
            "id": "146-0-4",
            "name": "Muhammet ATASEVER",
            "title": "Öğr. Gör. Doç. Dr.",
            "role": "Öğretim Görevlisi Doçent Doktor",
            "phone": "0(348) 814 26 66",
            "extension": "1465",
            "email": "matasever@kilis.edu.tr",
            "profileUrl": "http://h",
            "unitName": "Ortak Zorunlu Dersler Koordinatörlüğü",
            "sectionName": "Ortak Zorunlu Dersler Koordinatörlüğü"
          },
          {
            "id": "146-0-5",
            "name": "Zeynep POLAT",
            "title": "Öğretim Görevlisi",
            "role": "Öğretim Görevlisi",
            "phone": "0(348) 814 26 66",
            "extension": "1462",
            "email": "zeynepyildirim@kilis.edu.tr",
            "profileUrl": "http://h",
            "unitName": "Ortak Zorunlu Dersler Koordinatörlüğü",
            "sectionName": "Ortak Zorunlu Dersler Koordinatörlüğü"
          }
        ]
      }
    ]
  },
  {
    "id": "62",
    "name": "Öğrenci İşleri Daire Başkanlığı",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-62-0",
        "fullHeader": "Öğrenci İşleri Daire Başkanlığı",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "62-0-0",
            "name": "Mehmet Ali CAN",
            "title": "Daire Başkanı",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1201",
            "email": "malican@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-1",
            "name": "Hamza BADELİ",
            "title": "Öğrenci Hizmetleri ve Burslar Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1215",
            "email": "badeli@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-2",
            "name": "Berrin KOÇARSLAN",
            "title": "Eğitim Öğretim Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1203",
            "email": "bkocarslan@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-3",
            "name": "Ayşegül ELHAN",
            "title": "Kayıt Kabul Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1202",
            "email": "aysegulgunal@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-4",
            "name": "Halil GÜNEŞ",
            "title": "Tahakkuk ve Otomasyon Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1204",
            "email": "halilgunes@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-5",
            "name": "M.Yasin DAĞDEMİR",
            "title": "Şef",
            "role": "Mühendislik Mimarlık Fak. ve Sağlık Hizmetleri MYO",
            "phone": "0 (348) 814 26 66",
            "extension": "1207",
            "email": "myasindagdemir@kils.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-6",
            "name": "Sait SEYREK",
            "title": "Şef",
            "role": "Kilisli Muallim Rıfat Eğitim Fak.",
            "phone": "0 (348) 814 26 66",
            "extension": "1218",
            "email": "sait.seyrek@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-7",
            "name": "Murat AKGÜL",
            "title": "Şef",
            "role": "İlahiyat Fak.",
            "phone": "0 (348) 814 26 66",
            "extension": "1213",
            "email": "muratakgul@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-8",
            "name": "Sultan AKILLI",
            "title": "Bilgisayar İşletmeni",
            "role": "İktisadi ve İdari Bilimler Fak.ve Sosyal Biİlimler MYO",
            "phone": "0 (348) 814 26 66",
            "extension": "1206",
            "email": "sultanakilli@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-9",
            "name": "Cihan ÇAVDAR",
            "title": "Bilgisayar İşletmeni",
            "role": "İnsan ve Toplum Bilimler Fak. ,Fen Fakültesi ve Konservatuvar",
            "phone": "0 (348) 814 26 66",
            "extension": "1211",
            "email": "cihancavdar@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-10",
            "name": "Elif Şeyda ÇELİK",
            "title": "Bilgisayar İşletmeni",
            "role": "Spor Bilimleri Fak.",
            "phone": "0 (348) 814 26 66",
            "extension": "1200",
            "email": "elifseyda.çelik@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-11",
            "name": "Serkan CAN",
            "title": "Bilgisayar İşletmeni",
            "role": "Teknik Bilimleri MYO",
            "phone": "0 (348) 814 26 66",
            "extension": "1214",
            "email": "serkancan@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          },
          {
            "id": "62-0-12",
            "name": "Rukiye DALYAN",
            "title": "Bilgisayar İşletmeni",
            "role": "Yusuf Şerefoğlu Sağlık Bilimleri Fak.ve Turizm ve Otelcilik MYO.",
            "phone": "0 (348) 814 26 66",
            "extension": "1209",
            "email": "rukiyedalyan@kilis.edu.tr",
            "unitName": "Öğrenci İşleri Daire Başkanlığı",
            "sectionName": "Öğrenci İşleri Daire Başkanlığı"
          }
        ]
      }
    ]
  },
  {
    "id": "57",
    "name": "Personel Daire Başkanlığı",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-57-0",
        "fullHeader": "Personel Daire Başkanlığı",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "57-0-0",
            "name": "Abdulkerim KALKAN",
            "title": "Dairesi Başkanı",
            "role": "Personel Dairesi Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1070",
            "email": "a.kerimkalkan@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-1",
            "name": "Hanım TAŞ",
            "title": "Bilgisayar İşletmeni",
            "role": "Sekreterlik ve Eğitim İşleri",
            "phone": "0348 814 26 66",
            "extension": "1070",
            "email": "hanim.tas@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-2",
            "name": "Ayşe ÖZOĞLU",
            "title": "Şube Müdürü",
            "role": "Akademik ve İdari İşler",
            "phone": "0348 814 26 66",
            "extension": "1072",
            "email": "ayseakgun@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-3",
            "name": "Nevin ALAGÖZ BOZKAYA",
            "title": "Şube Müdür V.",
            "role": "Akademik ve İdari İşler",
            "phone": "0348 814 26 66",
            "extension": "1073",
            "email": "nbozkaya@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-4",
            "name": "Kadir ŞANLI",
            "title": "Şef",
            "role": "Özlük İşleri",
            "phone": "0348 814 26 66",
            "extension": "1084",
            "email": "kadirsanli@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-5",
            "name": "Fatma YILDIRIM",
            "title": "Şef",
            "role": "Kadro İşleri",
            "phone": "0348 814 26 66",
            "extension": "1080",
            "email": "fatmaoter@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-6",
            "name": "Meral KALKAN",
            "title": "Şef",
            "role": "Kadro İşleri",
            "phone": "0348 814 26 66",
            "extension": "1082",
            "email": "meral.kalkan@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-7",
            "name": "Seda SEÇKİN",
            "title": "Bilgisayar İşletmeni",
            "role": "Akademik İlanlar ve Atamalar",
            "phone": "0348 814 26 66",
            "extension": "1081",
            "email": "seda.seckin@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-8",
            "name": "Abdurrahman AVCI",
            "title": "Bilgisayar İşletmeni",
            "role": "Akademik İlanlar ve Atamalar",
            "phone": "0348 814 26 66",
            "extension": "1076",
            "email": "abdurrahman.avci@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-9",
            "name": "Bahar GÜNAL",
            "title": "Bilgisayar İşletmeni",
            "role": "Akademik İlanlar ve Atamalar",
            "phone": "0348 814 26 66",
            "extension": "1074",
            "email": "bahar.gunal@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-10",
            "name": "Beyza DOĞANAY",
            "title": "Bilgisayar İşletmeni",
            "role": "Kadro İşleri",
            "phone": "0348 814 26 66",
            "extension": "1077",
            "email": "beyza.kocak@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-11",
            "name": "İhsan DEMİRÖREN",
            "title": "Memur",
            "role": "Mutemet",
            "phone": "0348 814 26 66",
            "extension": "1079",
            "email": "ihsan.demiroren@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          },
          {
            "id": "57-0-12",
            "name": "Yasin HARTLAP",
            "title": "Memur",
            "role": "Eğitim İşleri",
            "phone": "0348 814 26 66",
            "extension": "1075",
            "email": "yasin.hartlap@kilis.edu.tr",
            "unitName": "Personel Daire Başkanlığı",
            "sectionName": "Personel Daire Başkanlığı"
          }
        ]
      }
    ]
  },
  {
    "id": "117",
    "name": "Proje Destek Ofisi Koordinatörlüğü",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-117-0",
        "fullHeader": "Proje Destek Ofisi Koordinatörlüğü",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "117-0-0",
            "name": "Devlet Tekas",
            "title": "Şef",
            "role": "Şef",
            "phone": "0 (348) 814 26 66",
            "extension": "1090",
            "email": "devlettekas@kilis.edu.tr",
            "profileUrl": "https://projeler.kilis.edu.tr/tr/phone-book",
            "unitName": "Proje Destek Ofisi Koordinatörlüğü",
            "sectionName": "Proje Destek Ofisi Koordinatörlüğü"
          },
          {
            "id": "117-0-1",
            "name": "Nursel KÖKSAL",
            "title": "Şef",
            "role": "Şef",
            "phone": "1024",
            "extension": "1024",
            "email": "nurselyazici@kilis.edu.tr",
            "profileUrl": "https://ebap.kilis.edu.tr/",
            "unitName": "Proje Destek Ofisi Koordinatörlüğü",
            "sectionName": "Proje Destek Ofisi Koordinatörlüğü"
          }
        ]
      }
    ]
  },
  {
    "id": "manual-card-6",
    "name": "Rektörlük",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-manual-card-6-0",
        "fullHeader": "Rektörlük",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "manual-card-6-0-0",
            "name": "Rektörlük",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-1",
            "name": "Prof. Dr. Zekeriya AKMAN",
            "title": "",
            "role": "Rektör",
            "phone": "0 (348) 814 26 66",
            "extension": "1002",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-2",
            "name": "Prof. Dr. Mehmet Ali YILDIRIM",
            "title": "",
            "role": "Rektör Yardımcısı",
            "phone": "0 (348) 814 26 66",
            "extension": "1007",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-3",
            "name": "Prof. Dr. Mehmet ŞENTÜRK",
            "title": "",
            "role": "Rektör Yardımcısı",
            "phone": "0 (348) 814 26 66",
            "extension": "1007",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-4",
            "name": "Prof. Dr. Metin AKİS",
            "title": "",
            "role": "Rektör Danışmanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1437",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-5",
            "name": "Prof. Dr. Şahin AHMETOĞLU",
            "title": "",
            "role": "Rektör Danışmanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1046",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-6",
            "name": "Doç. Dr. Ali KESTANE",
            "title": "",
            "role": "Rektör Danışmanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1503-1516",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-7",
            "name": "Doç. Dr. Elif AKIN KAZANCIOĞLU",
            "title": "",
            "role": "Rektör Danışmanı",
            "phone": "0 (348) 814 26 66",
            "extension": "7400",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-8",
            "name": "Dr. Öğr. Üyesi Seher MAŞKARAOĞLU",
            "title": "",
            "role": "Rektör Danışmanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1428",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-9",
            "name": "Sıddık BADILLI",
            "title": "",
            "role": "Rektör Danışmanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1011",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-10",
            "name": "Müdür V. Selda ÖZTOP",
            "title": "",
            "role": "Rektör Özel Kalemi",
            "phone": "0 (348) 814 26 66",
            "extension": "1002",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-11",
            "name": "Şef Dudu Çelik",
            "title": "",
            "role": "Rektör Yrd. Özel Kalemi",
            "phone": "0 (348) 814 26 66",
            "extension": "1007",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-12",
            "name": "İbrahim UÇAR",
            "title": "",
            "role": "Özel Kalem Memuru",
            "phone": "0 (348) 814 26 66",
            "extension": "1009",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          },
          {
            "id": "manual-card-6-0-13",
            "name": "Zübeyde GÜNEŞ",
            "title": "",
            "role": "Sekreter",
            "phone": "0 (348) 814 26 66",
            "extension": "1001-1003",
            "email": "",
            "unitName": "Rektörlük",
            "sectionName": "Rektörlük"
          }
        ]
      }
    ]
  },
  {
    "id": "46",
    "name": "Sağlık Hizmetleri Meslek Yüksekokulu",
    "category": "yuksekokul",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-46-0",
        "fullHeader": "Sağlık Hizmetleri Meslek Yüksekokulu",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "46-0-0",
            "name": "Elif AKIN KAZANCIOĞLU",
            "title": "Doç. Dr.",
            "role": "Müdür",
            "phone": "+90 348 813 93 01",
            "extension": "7400",
            "email": "eakazancioglu@kilis.edu.tr",
            "profileUrl": "https://akademik.yok.gov.tr/AkademikArama/view/viewAuthor.jsp",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-1",
            "name": "Gizem TAŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Müdür Yardımcısı",
            "phone": "+90 348 813 93 01",
            "extension": "7402",
            "email": "gizem.tasgecit@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-2",
            "name": "Zeynettin KASIRGA",
            "title": "Dr. Öğr. Üyesi",
            "role": "Müdür Yardımcısı",
            "phone": "+90348 813 93 01",
            "extension": "7416",
            "email": "kasırga.z@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-3",
            "name": "İbrahim Halil KARAKUŞ",
            "title": "Yüksekokul Sekreteri",
            "role": "İdari Birim",
            "phone": "+90 348 813 93 01",
            "extension": "7403",
            "email": "ihkarakus@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-4",
            "name": "Lale ARSLAN",
            "title": "Şef",
            "role": "Yazı İşleri",
            "phone": "+90 348 813 93 01",
            "extension": "7400",
            "email": "lalearslan@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-5",
            "name": "Mehmet ŞEYHANLI",
            "title": "Bilgisayar İşletmeni",
            "role": "Mutemetlik-Taşınır Kayıt Yetkilisi",
            "phone": "+90 348 813 93 01",
            "extension": "7419",
            "email": "mehmet.seyhanli@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-6",
            "name": "Deniz Kadir TAKCI",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "+90 348 813 93 01",
            "extension": "7408",
            "email": "deniztakci@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-7",
            "name": "B. Göker DURDU",
            "title": "Prof. Dr.",
            "role": "Öğretim Üyesi",
            "phone": "+90 348 813 93 01",
            "extension": "7428",
            "email": "bgokerdurdu@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-8",
            "name": "Tuğba İSPİR ÜNEY",
            "title": "Öğr. Gör.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7422",
            "email": "tugba.ispir@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-9",
            "name": "Furkan CENGİZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "+90 348 813 93 01",
            "extension": "7426",
            "email": "furkan.cengiz@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-10",
            "name": "Savaş KESİCİ",
            "title": "Bilgisayar İşletmeni",
            "role": "Bölüm Sekreteri",
            "phone": "+90 348 813 93 01",
            "extension": "7419",
            "email": "savas.kesici@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-11",
            "name": "Mehmet Ercan ODABAŞIOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "+90 348 813 93 01",
            "extension": "7413",
            "email": "mercanodabasioglu@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-12",
            "name": "Gülsen KARATAŞ",
            "title": "Öğr. Gör. Dr.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7406",
            "email": "gulsen.karatas@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-13",
            "name": "Elif Simay KOÇ",
            "title": "Öğr. Gör. Dr.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7422",
            "email": "elifsimay.koc@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-14",
            "name": "Yadigar POLAT",
            "title": "Doç. Dr.",
            "role": "Öğretim Üyesi",
            "phone": "+90 348 813 93 01",
            "extension": "7423",
            "email": "yadigarpolat@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-15",
            "name": "Tuba ARSLAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "+90 348 813 93 01",
            "extension": "7406",
            "email": "tubaarslan@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-16",
            "name": "Fatih SÜNBÜL",
            "title": "Öğr. Gör.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7408",
            "email": "fatihsunbul@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-17",
            "name": "S. Güler KURT ALTINÖZ",
            "title": "Öğr. Gör.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7423",
            "email": "sgulerkurt@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-18",
            "name": "Melek ÖZTÜRK",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "+90 348 813 93 01",
            "extension": "7436",
            "email": "melekozturk@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-19",
            "name": "Kübra YAVUZ",
            "title": "Öğr. Gör.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7410",
            "email": "kubrayavuz@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-20",
            "name": "Mustafa TURAN",
            "title": "Öğr. Gör.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7407",
            "email": "mustafa.turan@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-21",
            "name": "Ayşe Gül KAYA",
            "title": "Öğr. Gör.",
            "role": "Bölüm Başkanı",
            "phone": "+90 348 813 93 01",
            "extension": "7410",
            "email": "aysegul.kaya@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-22",
            "name": "Mustafa YAVUZEKİNCİ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "+90 348 813 93 01",
            "extension": "7441",
            "email": "m.yavuzekinci@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-23",
            "name": "Y. Ertem AKSA",
            "title": "Öğr. Gör.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7443",
            "email": "aksaertem@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-24",
            "name": "Nuseybe ÖZTÜRK CEYLAN",
            "title": "Öğr. Gör. Dr.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7414",
            "email": "nuseybeozturk@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-25",
            "name": "Mehmet KARAOĞLAN",
            "title": "Öğr. Gör.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7441",
            "email": "mehmet.karaoglan@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-26",
            "name": "Tahir DEDEOĞLU",
            "title": "Öğr. Gör.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7412",
            "email": "tahirdedeoglu@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-27",
            "name": "Halim AVCI",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "+90 348 813 93 01",
            "extension": "7404",
            "email": "avci@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-28",
            "name": "Arzuhan ŞIHOĞLU",
            "title": "Doç. Dr.",
            "role": "Öğretim Üyesi",
            "phone": "+90 348 813 93 01",
            "extension": "7406",
            "email": "arzuhan.tepe@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          },
          {
            "id": "46-0-29",
            "name": "A. Furkan GÜLOCAK",
            "title": "Öğr. Gör.",
            "role": "Öğretim Görevlisi",
            "phone": "+90 348 813 93 01",
            "extension": "7407",
            "email": "furkan.gulocak@kilis.edu.tr",
            "unitName": "Sağlık Hizmetleri Meslek Yüksekokulu",
            "sectionName": "Sağlık Hizmetleri Meslek Yüksekokulu"
          }
        ]
      }
    ]
  },
  {
    "id": "43",
    "name": "Sağlık Kültür ve Spor Daire Başkanlığı",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-43-0",
        "fullHeader": "Sağlık Kültür ve Spor Daire Başkanlığı",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "43-0-0",
            "name": "Turgut AKGÜN",
            "title": "Daire Başkanı",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1255",
            "email": "turgutakgun@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-1",
            "name": "Tevfik KÖKSAL",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1275",
            "email": "tevfikkoksal@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-2",
            "name": "Deniz KOÇ",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1257",
            "email": "denizkoc@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-3",
            "name": "Hüseyin DENİZ",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1259",
            "email": "huseyindeniz@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-4",
            "name": "Akif GÜNAL",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1271",
            "email": "akifgunal@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-5",
            "name": "Ahmet ÖZBEĞE",
            "title": "Şube Müdürü",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1267",
            "email": "ahmet.ozbege@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-6",
            "name": "Mehmet MERT",
            "title": "Şef",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1258",
            "email": "mehmetmert@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-7",
            "name": "Sedat DÜZGÖR",
            "title": "Şef",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1266",
            "email": "sedatduzgor@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-8",
            "name": "Osman ATASOY",
            "title": "Şef",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1263",
            "email": "osman.atasoy@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-9",
            "name": "Eyyüp ATAMAN",
            "title": "Gıda Mühendisi",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1287",
            "email": "eyyupataman@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-10",
            "name": "Turgay ÖZKAN",
            "title": "Spor Uzmanı",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1295",
            "email": "turgayozkan@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-11",
            "name": "Filiz KAL",
            "title": "Tekniker",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1265",
            "email": "filizkal@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-12",
            "name": "Vildan Elif KORKUT",
            "title": "Bilgisayar İşletmeni",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1270",
            "email": "vildanelif.korkut@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-13",
            "name": "Abuzer YAKAR",
            "title": "Bilgisayar İşletmeni",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1269",
            "email": "abuzeryakar@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-14",
            "name": "Ömer Faruk ŞİMŞEK",
            "title": "Bilgisayar İşletmeni",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1264",
            "email": "faruk.simsek@kilisd.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-15",
            "name": "Melek ÇEPNİ",
            "title": "Memur",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1254",
            "email": "melek.cepni@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          },
          {
            "id": "43-0-16",
            "name": "Hasan SARICABAĞLI",
            "title": "Kamu İşçisi",
            "role": "Halı Saha",
            "phone": "0 (348) 814 26 66",
            "extension": "1292",
            "email": "hasansaricabagli@kilis.edu.tr",
            "unitName": "Sağlık Kültür ve Spor Daire Başkanlığı",
            "sectionName": "Sağlık Kültür ve Spor Daire Başkanlığı"
          }
        ]
      }
    ]
  },
  {
    "id": "48",
    "name": "Sosyal Bilimler Meslek Yüksekokulu",
    "category": "yuksekokul",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-48-0",
        "fullHeader": "Sosyal Bilimler Meslek Yüksekokulu",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "48-0-0",
            "name": "İsmet ÜZEN",
            "title": "Profesör",
            "role": "Müdür",
            "phone": "0348 814 26 66",
            "extension": "7500-7501",
            "email": "ismet.uzen@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-1",
            "name": "Ali Emin İSLAMOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Müdür Yardımcısı-Bölüm Başkanı (Yönetim ve Organizasyon Bölümü)",
            "phone": "0348 814 26 66",
            "extension": "7523",
            "email": "alieminislamoglu@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-2",
            "name": "Semra ŞEN",
            "title": "Bilgisayar İşletmeni",
            "role": "Müdür Sekreteri-Bölüm Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "7500",
            "email": "semra.sen@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-3",
            "name": "Mustafa DEMİR",
            "title": "Yüksekokul Sekreteri",
            "role": "Yüksekokul Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "7504",
            "email": "demir@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-4",
            "name": "Seyit Ali MİÇOOĞULLARI",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı (Dış Ticaret Bölümü)",
            "phone": "0348 814 26 66",
            "extension": "7506",
            "email": "s.alimicoogullari@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-5",
            "name": "Zeynep Büşra KORKMAZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı (Hukuk Bölümü)",
            "phone": "0348 814 26 66",
            "extension": "7522",
            "email": "zeynep.korkmaz@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-6",
            "name": "Murat URFALIOĞLU",
            "title": "Öğr. Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "7509",
            "email": "urfalioglu@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-7",
            "name": "İsmail KUTLAR",
            "title": "Öğretim Görevlisi Dr.",
            "role": "Bölüm Başkan Yard. (Muhasebe ve Vergi Bölümü)",
            "phone": "0348 814 26 66",
            "extension": "7511",
            "email": "iskutlar@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-8",
            "name": "Mine KÜÇÜKLER",
            "title": "Öğretim Görevlisi Dr.",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "7514",
            "email": "mgungor@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-9",
            "name": "Mine ÖZGÜVEN",
            "title": "Öğretim Görevlisi Dr.",
            "role": "Bölüm Başkan Yard. (Dış Ticaret Bölümü)",
            "phone": "0348 814 26 66",
            "extension": "7521",
            "email": "mineozguven@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-10",
            "name": "Seyfiddin DAL",
            "title": "Öğretim Görevlisi",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "7507",
            "email": "seyfiddin.dal@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-11",
            "name": "Abdulvahid ÇAVUŞOĞLU",
            "title": "Öğretim Görevlisi",
            "role": "Bölüm Başkan Yard. (Yönetim ve Organizasyon Bölümü)",
            "phone": "0348 814 26 66",
            "extension": "7513",
            "email": "abdulvahid.cavusoglu@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-12",
            "name": "Mustafa ARSLAN",
            "title": "Öğretim Görevlisi",
            "role": "Bölüm Başkan Yard. (Hukuk Bölümü)",
            "phone": "0348 814 26 66",
            "extension": "7512",
            "email": "mustafaarslan@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-13",
            "name": "Ali GENÇ",
            "title": "Öğretim Görevlisi",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "1021",
            "email": "ali.genc@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-14",
            "name": "Betül Asena SÖNMEZ",
            "title": "Öğretim Görevlisi",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "7510",
            "email": "btlasena.sonmez@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-15",
            "name": "Fatih AYDOĞAN",
            "title": "Öğretim Görevlisi",
            "role": "Öğretim Elemanı",
            "phone": "0348 814 26 66",
            "extension": "7503",
            "email": "fatih.aydogan@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-16",
            "name": "Uğur HAŞAŞOĞLU",
            "title": "Öğretim Görevlisi",
            "role": "Bölüm Başkanı (Muhasebe ve Vergi Bölümü)",
            "phone": "0348 814 26 66",
            "extension": "7517",
            "email": "ugurhasasoglu@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "48-0-17",
            "name": "Kemal YAVUZTÜRK",
            "title": "Bilgisayar İşletmeni",
            "role": "Yazı İşleri",
            "phone": "0348 814 26 66",
            "extension": "7505",
            "email": "kemal.yavuzturk@kilis.edu.tr",
            "unitName": "Sosyal Bilimler Meslek Yüksekokulu",
            "sectionName": "Sosyal Bilimler Meslek Yüksekokulu"
          }
        ]
      }
    ]
  },
  {
    "id": "41",
    "name": "Spor Bilimleri Fakültesi",
    "category": "fakulte",
    "subDepartments": [
      {
        "id": "14",
        "fullName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü",
        "name": "Antrenörlük Bölümü"
      },
      {
        "id": "25",
        "fullName": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü",
        "name": "Beden Eğitimi ve Spor Bölümü"
      }
    ],
    "sections": [
      {
        "id": "sec-41-0",
        "fullHeader": "Spor Bilimleri Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "41-0-0",
            "name": "Filiz UÇAN TÜRKMEN",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0348 814 26 66",
            "extension": "1856",
            "email": "filizucan@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-1",
            "name": "M. Hakan MAYDA",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1867",
            "email": "hakan.mayda@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-2",
            "name": "Özgür AKTAŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1857",
            "email": "ozguraktas@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-3",
            "name": "Nihal GENÇ",
            "title": "",
            "role": "Fakülte Sekreteri",
            "phone": "0(348) 814 26 66",
            "extension": "1865",
            "email": "nihal.genc@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-4",
            "name": "Önder KARAKOÇ",
            "title": "Prof. Dr.",
            "role": "Beden Eğitimi ve Spor Bölüm Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1872",
            "email": "onderkarakoc@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-5",
            "name": "Cengiz TAŞKIN",
            "title": "Prof. Dr.",
            "role": "Antrenörlük Eğitimi Bölüm Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1869",
            "email": "cengiztaskin@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-6",
            "name": "Reşat KARTAL",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1966",
            "email": "resat.kartal@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-7",
            "name": "Yunus GÜR",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1964",
            "email": "yunus.gur@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-8",
            "name": "Ali YILDIRIM",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1866",
            "email": "ali.yildirim@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-9",
            "name": "Ali Kemal TAŞKIN",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1961",
            "email": "kemaltaskin@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-10",
            "name": "Tugay YILMAZ",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1868",
            "email": "tugay.yilmaz@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-11",
            "name": "Berna KARAKOÇ",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1858",
            "email": "bernakarakoc@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-12",
            "name": "Ahmet YILGIN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1863",
            "email": "ahmetyilgin@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-13",
            "name": "Ubeyde GÜLNAR",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1870",
            "email": "ubeydegulnar@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-14",
            "name": "Mustafa YILMAZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1970",
            "email": "mustafa.yilmaz@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-15",
            "name": "Aysun GÜLER KANTER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1965",
            "email": "aysunkanter@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-16",
            "name": "Nesrin ÇELİK",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1959",
            "email": "nesrincelik@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-17",
            "name": "Umut SEVİLMİŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1861",
            "email": "umut.sevilmis@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-18",
            "name": "Ömer ÇALIŞKAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1864",
            "email": "omer.caliskan@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-19",
            "name": "Ali ÇEVİK",
            "title": "Dr. Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1962",
            "email": "ali.cevik@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-20",
            "name": "Berkay BALKIŞ",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1862",
            "email": "berkay.balkis@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-21",
            "name": "Çiğdem ATASOY",
            "title": "",
            "role": "Dekan Sekreteri",
            "phone": "0 348 814 26 66",
            "extension": "1855",
            "email": "cigdem.atasoy@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-22",
            "name": "Mesut POLAT",
            "title": "",
            "role": "Bölüm Sekreteri",
            "phone": "0 348 814 26 66",
            "extension": "1859",
            "email": "mesutpolat@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          },
          {
            "id": "41-0-23",
            "name": "Çay Ocağı",
            "title": "",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1958",
            "email": "",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi"
          }
        ]
      },
      {
        "id": "sec-41-1",
        "subDepartmentId": "14",
        "fullHeader": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü",
        "title": "Antrenörlük Bölümü",
        "contacts": [
          {
            "id": "41-1-0",
            "name": "Cengiz TAŞKIN",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1869",
            "email": "cengiztaskin@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-1",
            "name": "Reşat KARTAL",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1966",
            "email": "resat.kartal@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-2",
            "name": "Yunus GÜR",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1964",
            "email": "yunus.gur@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-3",
            "name": "Ali YILDIRIM",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1866",
            "email": "ali.yildirim@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-4",
            "name": "Ahmet YILGIN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1863",
            "email": "ahmetyilgin@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-5",
            "name": "Übeyde GÜLNAR",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1870",
            "email": "ubeydegulnar@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-6",
            "name": "Aysun GÜLER KANTER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1965",
            "email": "aysunkanter@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-7",
            "name": "Nesrin ÇELİK",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1959",
            "email": "nesrincelik@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-8",
            "name": "Ömer ÇALIŞKAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1864",
            "email": "omer.caliskan@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-9",
            "name": "Umut SEVİLMİŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1861",
            "email": "umut.sevilmis@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          },
          {
            "id": "41-1-10",
            "name": "Berkay BALKIŞ",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1862",
            "email": "berkay.balkis@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Antrenörlük Bölümü"
          }
        ]
      },
      {
        "id": "sec-41-2",
        "subDepartmentId": "25",
        "fullHeader": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü",
        "title": "Beden Eğitimi ve Spor Bölümü",
        "contacts": [
          {
            "id": "41-2-0",
            "name": "Önder KARAKOÇ",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "1872",
            "email": "onderkarakoc@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü"
          },
          {
            "id": "41-2-1",
            "name": "M. Hakan MAYDA",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1867",
            "email": "hakan.mayda@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü"
          },
          {
            "id": "41-2-2",
            "name": "Ali Kemal TAŞKIN",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1961",
            "email": "kemaltaskin@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü"
          },
          {
            "id": "41-2-3",
            "name": "Tugay YILMAZ",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1868",
            "email": "tugay.yilmaz@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü"
          },
          {
            "id": "41-2-4",
            "name": "Berna KARAKOÇ",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1858",
            "email": "bernakarakoc@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü"
          },
          {
            "id": "41-2-5",
            "name": "Özgür AKTAŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "1857",
            "email": "ozguraktas@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü"
          },
          {
            "id": "41-2-6",
            "name": "Mustafa YILMAZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1970",
            "email": "mustafa.yilmaz@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü"
          },
          {
            "id": "41-2-7",
            "name": "Ali ÇEVİK",
            "title": "Dr. Arş. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "1962",
            "email": "ali.cevik@kilis.edu.tr",
            "unitName": "Spor Bilimleri Fakültesi",
            "sectionName": "Spor Bilimleri Fakültesi - Beden Eğitimi ve Spor Bölümü"
          }
        ]
      }
    ]
  },
  {
    "id": "39",
    "name": "Strateji Geliştirme Daire Başkanlığı",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-39-0",
        "fullHeader": "Strateji Geliştirme Daire Başkanlığı",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "39-0-0",
            "name": "Memet TÜFEKÇİ",
            "title": "Daire Başkanı",
            "role": "Daire Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1151",
            "email": "mehmettufekci@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-1",
            "name": "Meryem KÖSE",
            "title": "Şube Müdürü",
            "role": "Muhasebe Yetkilisi",
            "phone": "0348 814 26 66",
            "extension": "1152",
            "email": "meryem.kose@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-2",
            "name": "İbrahim Halil ÜNLÜ",
            "title": "Şube Müdür V.",
            "role": "Şube Müdür V.",
            "phone": "0348 814 26 66",
            "extension": "1153",
            "email": "halilunlu@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-3",
            "name": "İbrahim Tanrıaşıkı",
            "title": "Şef",
            "role": "Banka Servisi",
            "phone": "0348 814 26 66",
            "extension": "1154",
            "email": "ibrahimtanriasiki@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-4",
            "name": "Ayşe BEKAR",
            "title": "Şef",
            "role": "Muhasebe Servisi ve Evrak Kontrol",
            "phone": "0348 814 26 66",
            "extension": "1158",
            "email": "aysebekar@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-5",
            "name": "Fatma KARTAL",
            "title": "Şef",
            "role": "Banka Servisi",
            "phone": "0348 814 26 66",
            "extension": "1156",
            "email": "fatma.kartal@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-6",
            "name": "Salih KILIÇ",
            "title": "Bilgisayar İşletmeni",
            "role": "Bütçe Servisi",
            "phone": "0348 814 26 66",
            "extension": "1160",
            "email": "salih.kilic@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-7",
            "name": "Sedat YAĞMUR",
            "title": "Bilgisayar İşletmeni",
            "role": "Banka Servisi",
            "phone": "0348 814 26 66",
            "extension": "1155",
            "email": "sedat.yagmur@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-8",
            "name": "Büşra ÖZEN",
            "title": "Bilgisayar İşletmeni",
            "role": "Muhasebe Servisi ve Evrak Kontrol",
            "phone": "0348 814 26 66",
            "extension": "1157",
            "email": "busra.ozen@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-9",
            "name": "Ruken BUDAK",
            "title": "Bilgisayar İşletmeni",
            "role": "Muhasebe Servisi ve Evrak Kontrol",
            "phone": "0348 814 26 66",
            "extension": "1159",
            "email": "ruken.budak@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          },
          {
            "id": "39-0-10",
            "name": "Emel KARAYAY",
            "title": "Sekreter",
            "role": "Sekreter",
            "phone": "0348 814 26 66",
            "extension": "1150",
            "email": "emelkarayay@kilis.edu.tr",
            "unitName": "Strateji Geliştirme Daire Başkanlığı",
            "sectionName": "Strateji Geliştirme Daire Başkanlığı"
          }
        ]
      }
    ]
  },
  {
    "id": "37",
    "name": "Teknik Bilimler Meslek Yüksekokulu",
    "category": "yuksekokul",
    "subDepartments": [
      {
        "id": "30",
        "fullName": "Teknik Bilimler Meslek Yüksekokulu - Bilgisayar Teknolojileri Bölümü",
        "name": "Bilgisayar Teknolojileri Bölümü"
      },
      {
        "id": "44",
        "fullName": "Teknik Bilimler MYO - Bitkisel ve Hayvansal Üretim Bölümü",
        "name": "Bitkisel ve Hayvansal Üretim Bölümü"
      },
      {
        "id": "76",
        "fullName": "Teknik Bilimler MYO - Elektrik ve Enerji Bölümü",
        "name": "Elektrik ve Enerji Bölümü"
      },
      {
        "id": "77",
        "fullName": "Teknik Bilimler MYO - El Sanatları Bölümü",
        "name": "El Sanatları Bölümü"
      },
      {
        "id": "102",
        "fullName": "Teknik Bilimler MYO - Gıda İşleme Bölümü",
        "name": "Gıda İşleme Bölümü"
      },
      {
        "id": "138",
        "fullName": "Teknik Bilimler MYO - İnşaat Bölümü",
        "name": "İnşaat Bölümü"
      },
      {
        "id": "109",
        "fullName": "Teknik Bilimler MYO - Makine ve Metal Teknolojileri Bölümü",
        "name": "Makine ve Metal Teknolojileri Bölümü"
      },
      {
        "id": "149",
        "fullName": "Teknik Bilimler MYO - Mimarlık ve Şehir Planlama Bölümü",
        "name": "Mimarlık ve Şehir Planlama Bölümü"
      },
      {
        "id": "63",
        "fullName": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü",
        "name": "Mülkiyet Koruma ve Güvenlik Bölümü"
      }
    ],
    "sections": [
      {
        "id": "sec-37-0",
        "fullHeader": "Teknik Bilimler Meslek Yüksekokulu",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "37-0-0",
            "name": "Teknik Bilimler Meslek Yüksekokulu",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-1",
            "name": "H. Aysun MERCİMEK TAKCI",
            "title": "Prof. Dr.",
            "role": "Yüksekokul Müdürü",
            "phone": "0348 814 26 66",
            "extension": "1901",
            "email": "aysunmercimek@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-2",
            "name": "Ümit Deniz AKYAVUZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Yüksekokul Müdür Yardımcısı",
            "phone": "0348 814 2666",
            "extension": "1903",
            "email": "udakyavuz@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-3",
            "name": "Mete ŞİNİK",
            "title": "Öğr. Gör.",
            "role": "Yüksekokul Müdür Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1902",
            "email": "mete.sinik@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-4",
            "name": "Ahmet AKSOY",
            "title": "Şef",
            "role": "Mutemet",
            "phone": "0348 814 26 66",
            "extension": "1972",
            "email": "ahmetaksoy@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-5",
            "name": "Mehmet DEVECİOĞLU",
            "title": "Yüksekokul Sekreteri",
            "role": "Yüksekokul Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "1936",
            "email": "mehmetdevecioglu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-6",
            "name": "Orhan DOĞAN",
            "title": "Memur",
            "role": "Müdür Sekreteri - Yazı İşleri",
            "phone": "0348 814 26 66",
            "extension": "1905",
            "email": "orhan.dogan@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-7",
            "name": "Faruk GÖKKIR",
            "title": "Memur",
            "role": "Bölüm Sekreterliği",
            "phone": "0348 814 26 66",
            "extension": "1950",
            "email": "farukgokkir@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-8",
            "name": "Turgut KAYA",
            "title": "Teknisyen",
            "role": "Teknik Personel",
            "phone": "0348 814 26 66",
            "extension": "1955",
            "email": "turgutkaya@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-9",
            "name": "Halil DİLEK",
            "title": "Teknisyen",
            "role": "Teknik Personel",
            "phone": "0348 814 26 66",
            "extension": "1908",
            "email": "",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-10",
            "name": "Bilgisayar Teknolojileri Bölümü",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-11",
            "name": "Hasan GÜLER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1917",
            "email": "hasanguler@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-12",
            "name": "Gülsade KALE",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1920",
            "email": "gkale@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-13",
            "name": "Müslüm ÖZTÜRK",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1922",
            "email": "mozturk@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-14",
            "name": "Adem COŞKUN",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1940",
            "email": "adem.coskun@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-15",
            "name": "Ali Ziya YAPICIOĞLU",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1915",
            "email": "ziya@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-16",
            "name": "Ahmet GÜRBÜZ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1916",
            "email": "ahmet@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-17",
            "name": "Arman ATALAR",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1907",
            "email": "arman.atalar@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-18",
            "name": "Bitkisel ve Hayvansal Üretim Bölümü",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-19",
            "name": "Tolga GÜRKAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "7223",
            "email": "tolgagurkan@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-20",
            "name": "İsmail GÜL",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7225",
            "email": "ismailgul@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-21",
            "name": "Mehmet KOÇ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7215",
            "email": "mehmetkoc@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-22",
            "name": "Recep CANIMKURBEY",
            "title": "Öğr. Gör",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7257",
            "email": "recep.canimkurbey@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-23",
            "name": "Burak ÖZGÖREN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7256",
            "email": "burak.ozgoren@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-24",
            "name": "El Sanatları Bölümü",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-25",
            "name": "Veysel ÇİFTÇİ",
            "title": "Öğr. Gör.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1949",
            "email": "veyselciftci@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-26",
            "name": "Gökmen ZOR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0348 814 2666",
            "extension": "1942",
            "email": "gzor@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-27",
            "name": "Hilal SEVLÜ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1944",
            "email": "hilal.sevlu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-28",
            "name": "Yasemin POLAT",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1933",
            "email": "yaseminpolat@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-29",
            "name": "Eyyüp GÜLOCAK",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1931",
            "email": "eyyub.gulocak@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-30",
            "name": "Kadir POLAT",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1930",
            "email": "kadirpolat@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-31",
            "name": "Fatime EROL",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1914",
            "email": "fatimeerol@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-32",
            "name": "Feride DURAN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1932",
            "email": "feride.duran@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-33",
            "name": "Şerif Hamidettin TEKTAŞ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1948",
            "email": "serif.tektaş@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-34",
            "name": "Elektrik ve Enerji",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-35",
            "name": "Rasim ÖZDEMİR",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1911",
            "email": "rozdemir@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-36",
            "name": "Ümit Deniz AKYAVUZ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1935",
            "email": "udakyavuz@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-37",
            "name": "Ayşe İNCESU DOKUMACI",
            "title": "Dr. Öğr. Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0348 814 26 66",
            "extension": "1951",
            "email": "ayseincesu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-38",
            "name": "Gıda İşleme Bölümü",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-39",
            "name": "Mecit ÖZDEMİR",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1912",
            "email": "mecitozdemir@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-40",
            "name": "Gülcan KOYUNCU",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "Dr. Öğr. Üyesi",
            "extension": "1906",
            "email": "gulcan.koyuncu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-41",
            "name": "Tuğba KILIÇ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1944",
            "email": "tubacelik@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-42",
            "name": "İnşaat Bölümü",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-43",
            "name": "Nurdan BAYKUŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1937",
            "email": "nurdanbaykus@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-44",
            "name": "Mahmut AYTEKİN",
            "title": "Öğr. Gör.",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1919",
            "email": "mahmutaytekin@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-45",
            "name": "Ercan KILIÇ",
            "title": "Öğr. Gör. Dr",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1928",
            "email": "ercank@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-46",
            "name": "Ömer YEŞİLTEPE",
            "title": "Dr Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1929",
            "email": "omeryesiltepe@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-47",
            "name": "Ali KARABAŞ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1918",
            "email": "alikarabas@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-48",
            "name": "Muhammed DİKMEN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1947",
            "email": "mdikmen@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-49",
            "name": "Zeynep KILIÇ",
            "title": "Öğr. Gör",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1939",
            "email": "zeynep.kilic@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-50",
            "name": "Merve FERMANCI",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1913",
            "email": "merve.fermanci@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-51",
            "name": "Makine ve Metal Teknolojisi Bölümü",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-52",
            "name": "Resul ÜNAL",
            "title": "Öğr. Gör. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1954",
            "email": "resulunal@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-53",
            "name": "Mehmet Sinan UYGUR",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1941",
            "email": "mehmetsinan.uygur@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-54",
            "name": "Aziz Emre BİLGİN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1943",
            "email": "aziz.bilgin@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-55",
            "name": "Mimarlık ve Şehir Planlama Bölümü",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-56",
            "name": "Gamze BEDİROĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1923",
            "email": "gamze.bediroglu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-57",
            "name": "Mete ŞİNİK",
            "title": "Öğr. Gör.",
            "role": "Blm. Bşk. Yrd.",
            "phone": "0348 814 26 66",
            "extension": "1902-1909",
            "email": "mete.sinik@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-58",
            "name": "Hüseyin BAYRAM",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1910",
            "email": "huseyin.bayram@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-59",
            "name": "Zeynep Büşra BİLGİN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1952",
            "email": "z.bilgin@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-60",
            "name": "Hafize Nur Sılay EMİR",
            "title": "Öğr. Gör.",
            "role": "Ziraat Fak. Görevlendirme",
            "phone": "0348 814 26 66",
            "extension": "7236",
            "email": "silay.emir@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-61",
            "name": "Mülkiyet Koruma ve Güvenlik Bölümü",
            "title": "",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1900",
            "email": "tbmyo@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-62",
            "name": "Mehmet Ferhat KARAOĞLAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1925",
            "email": "ferhatkaraoglan@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-63",
            "name": "Nurgül YALÇIN",
            "title": "Öğr. Gör.",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1938",
            "email": "nurgulyucel@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-64",
            "name": "Cumhur CANBAZOĞLU",
            "title": "Prof. Dr.",
            "role": "Fen Fak. Görevlendirme",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "canbazoglu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-65",
            "name": "M. Burçin ÖNAY",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1924",
            "email": "burçinonay@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-66",
            "name": "Melih KÜÇÜKOĞLU",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1926",
            "email": "melihkucukoglu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-67",
            "name": "Özkan DEDE",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "",
            "email": "ozkandede@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-68",
            "name": "Özkan DEDE",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1945",
            "email": "ozkandede@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-69",
            "name": "M. Burak TEMİZ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1946",
            "email": "buraktemiz@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          },
          {
            "id": "37-0-70",
            "name": "Ayla DEVECİ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1921",
            "email": "ayladeveci@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu"
          }
        ]
      },
      {
        "id": "sec-37-1",
        "subDepartmentId": "30",
        "fullHeader": "Teknik Bilimler Meslek Yüksekokulu - Bilgisayar Teknolojileri Bölümü",
        "title": "Bilgisayar Teknolojileri Bölümü",
        "contacts": [
          {
            "id": "37-1-0",
            "name": "Gülsade KALE",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1920",
            "email": "gkale@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu - Bilgisayar Teknolojileri Bölümü"
          },
          {
            "id": "37-1-1",
            "name": "Müslüm ÖZTÜRK",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1922",
            "email": "mozturk@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu - Bilgisayar Teknolojileri Bölümü"
          },
          {
            "id": "37-1-2",
            "name": "Adem COŞKUN",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1940",
            "email": "adem.coskun@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu - Bilgisayar Teknolojileri Bölümü"
          },
          {
            "id": "37-1-3",
            "name": "Ali Ziya YAPICIOĞLU",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1915",
            "email": "ziya@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu - Bilgisayar Teknolojileri Bölümü"
          },
          {
            "id": "37-1-4",
            "name": "Ahmet GÜRBÜZ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1916",
            "email": "ahmet@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu - Bilgisayar Teknolojileri Bölümü"
          },
          {
            "id": "37-1-5",
            "name": "Arman ATALAR",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1907",
            "email": "arman.atalar@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler Meslek Yüksekokulu - Bilgisayar Teknolojileri Bölümü"
          }
        ]
      },
      {
        "id": "sec-37-2",
        "subDepartmentId": "44",
        "fullHeader": "Teknik Bilimler MYO - Bitkisel ve Hayvansal Üretim Bölümü",
        "title": "Bitkisel ve Hayvansal Üretim Bölümü",
        "contacts": [
          {
            "id": "37-2-0",
            "name": "Tolga GÜRKAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "7223",
            "email": "tolgagurkan@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Bitkisel ve Hayvansal Üretim Bölümü"
          },
          {
            "id": "37-2-1",
            "name": "İsmail GÜL",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7225",
            "email": "ismailgul@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Bitkisel ve Hayvansal Üretim Bölümü"
          },
          {
            "id": "37-2-2",
            "name": "Mehmet KOÇ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "7215",
            "extension": "7215",
            "email": "mehmetkoc@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Bitkisel ve Hayvansal Üretim Bölümü"
          },
          {
            "id": "37-2-3",
            "name": "Recep CANIMKURBEY",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7257",
            "email": "recep.canimkurbey@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Bitkisel ve Hayvansal Üretim Bölümü"
          },
          {
            "id": "37-2-4",
            "name": "Burak ÖZGÖREN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7256",
            "email": "burak.ozgoren@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Bitkisel ve Hayvansal Üretim Bölümü"
          }
        ]
      },
      {
        "id": "sec-37-3",
        "subDepartmentId": "76",
        "fullHeader": "Teknik Bilimler MYO - Elektrik ve Enerji Bölümü",
        "title": "Elektrik ve Enerji Bölümü",
        "contacts": [
          {
            "id": "37-3-0",
            "name": "Rasim ÖZDEMİR",
            "title": "Prof. Dr.",
            "role": "Blm. Bşk.",
            "phone": "0348 814 26 66",
            "extension": "1911",
            "email": "rozdemir@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Elektrik ve Enerji Bölümü"
          },
          {
            "id": "37-3-1",
            "name": "Ümit Deniz AKYAVUZ",
            "title": "Blm. Bşk. Yrd.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1903-1935",
            "email": "udakyavuz@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Elektrik ve Enerji Bölümü"
          },
          {
            "id": "37-3-2",
            "name": "Ayşe İNCESU DOKUMACI",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1904",
            "email": "ayseincesu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Elektrik ve Enerji Bölümü"
          }
        ]
      },
      {
        "id": "sec-37-4",
        "subDepartmentId": "77",
        "fullHeader": "Teknik Bilimler MYO - El Sanatları Bölümü",
        "title": "El Sanatları Bölümü",
        "contacts": [
          {
            "id": "37-4-0",
            "name": "Veysel ÇİFTÇİ",
            "title": "Öğr. Gör",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1949",
            "email": "veyselciftci@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - El Sanatları Bölümü"
          },
          {
            "id": "37-4-1",
            "name": "Gökmen ZOR",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "1942",
            "email": "gzor@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - El Sanatları Bölümü"
          },
          {
            "id": "37-4-2",
            "name": "Hilal SEVLÜ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1944",
            "email": "hilal.sevlu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - El Sanatları Bölümü"
          },
          {
            "id": "37-4-3",
            "name": "Yasemin POLAT",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1933",
            "email": "yaseminpolat@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - El Sanatları Bölümü"
          },
          {
            "id": "37-4-4",
            "name": "Eyyüp GÜLOCAK",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1931",
            "email": "eyyub.gulocak@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - El Sanatları Bölümü"
          },
          {
            "id": "37-4-5",
            "name": "Kadir POLAT",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1930",
            "email": "kadirpolat@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - El Sanatları Bölümü"
          },
          {
            "id": "37-4-6",
            "name": "Fatime EROL",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1914",
            "email": "fatimeerol@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - El Sanatları Bölümü"
          },
          {
            "id": "37-4-7",
            "name": "Feride DURAN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1932",
            "email": "feride.duran@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - El Sanatları Bölümü"
          },
          {
            "id": "37-4-8",
            "name": "Şerif Hamidettin TEKTAŞ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1948",
            "email": "serif.tektaş@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - El Sanatları Bölümü"
          }
        ]
      },
      {
        "id": "sec-37-5",
        "subDepartmentId": "102",
        "fullHeader": "Teknik Bilimler MYO - Gıda İşleme Bölümü",
        "title": "Gıda İşleme Bölümü",
        "contacts": [
          {
            "id": "37-5-0",
            "name": "Mecit ÖZDEMİR",
            "title": "Prof. Dr.",
            "role": "Blm. Bşk.",
            "phone": "0348 814 26 66",
            "extension": "1912",
            "email": "mecitozdemir@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Gıda İşleme Bölümü"
          },
          {
            "id": "37-5-1",
            "name": "Gülcan KOYUNCU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Blm. Bşk. Yrd.",
            "phone": "0348 814 26 66",
            "extension": "1906",
            "email": "gulcan.koyuncu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Gıda İşleme Bölümü"
          },
          {
            "id": "37-5-2",
            "name": "Tuğba KILIÇ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1944",
            "email": "tubacelik@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Gıda İşleme Bölümü"
          }
        ]
      },
      {
        "id": "sec-37-6",
        "subDepartmentId": "138",
        "fullHeader": "Teknik Bilimler MYO - İnşaat Bölümü",
        "title": "İnşaat Bölümü",
        "contacts": [
          {
            "id": "37-6-0",
            "name": "Nurdan BAYKUŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Blm. Bşk.",
            "phone": "0348 814 26 66",
            "extension": "1937",
            "email": "nurdanbaykus@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - İnşaat Bölümü"
          },
          {
            "id": "37-6-1",
            "name": "Mahmut AYTEKİN",
            "title": "Öğr. Gör.",
            "role": "Blm. Bşk. Yrd.",
            "phone": "0348 814 26 66",
            "extension": "1919",
            "email": "mahmutaytekin@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - İnşaat Bölümü"
          },
          {
            "id": "37-6-2",
            "name": "Ercan KILIÇ",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1928",
            "email": "ercank@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - İnşaat Bölümü"
          },
          {
            "id": "37-6-3",
            "name": "Ömer YEŞİLTEPE",
            "title": "Dr Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1929",
            "email": "omeryesiltepe@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - İnşaat Bölümü"
          },
          {
            "id": "37-6-4",
            "name": "Ali KARABAŞ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1918",
            "email": "alikarabas@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - İnşaat Bölümü"
          },
          {
            "id": "37-6-5",
            "name": "Muhammed DİKMEN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1947",
            "email": "mdikmen@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - İnşaat Bölümü"
          },
          {
            "id": "37-6-6",
            "name": "Zeynep KILIÇ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1939",
            "email": "zeynep.kilic@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - İnşaat Bölümü"
          },
          {
            "id": "37-6-7",
            "name": "Merve FERMANCI",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1913",
            "email": "merve.fermanci@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - İnşaat Bölümü"
          }
        ]
      },
      {
        "id": "sec-37-7",
        "subDepartmentId": "109",
        "fullHeader": "Teknik Bilimler MYO - Makine ve Metal Teknolojileri Bölümü",
        "title": "Makine ve Metal Teknolojileri Bölümü",
        "contacts": [
          {
            "id": "37-7-0",
            "name": "Resul ÜNAL",
            "title": "Öğr. Gör. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1954",
            "email": "resulunal@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Makine ve Metal Teknolojileri Bölümü"
          },
          {
            "id": "37-7-1",
            "name": "Mehmet Sinan UYGUR",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1941",
            "email": "mehmetsinan.uygur@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Makine ve Metal Teknolojileri Bölümü"
          },
          {
            "id": "37-7-2",
            "name": "Aziz Emre BİLGİN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1943",
            "email": "aziz.bilgin@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Makine ve Metal Teknolojileri Bölümü"
          }
        ]
      },
      {
        "id": "sec-37-8",
        "subDepartmentId": "149",
        "fullHeader": "Teknik Bilimler MYO - Mimarlık ve Şehir Planlama Bölümü",
        "title": "Mimarlık ve Şehir Planlama Bölümü",
        "contacts": [
          {
            "id": "37-8-0",
            "name": "Gamze BEDİROĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "1923",
            "email": "gamze.bediroglu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mimarlık ve Şehir Planlama Bölümü"
          },
          {
            "id": "37-8-1",
            "name": "Mete ŞİNİK",
            "title": "Öğr. Gör.",
            "role": "Blm. Bşk. Yrd.",
            "phone": "0348 814 26 66",
            "extension": "1902-1909",
            "email": "mete.sinik@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mimarlık ve Şehir Planlama Bölümü"
          },
          {
            "id": "37-8-2",
            "name": "Hüseyin BAYRAM",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1910",
            "email": "huseyin.bayram@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mimarlık ve Şehir Planlama Bölümü"
          },
          {
            "id": "37-8-3",
            "name": "Zeynep Büşra BİLGİN",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1952",
            "email": "z.bilgin@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mimarlık ve Şehir Planlama Bölümü"
          },
          {
            "id": "37-8-4",
            "name": "Hafize Nur Sılay EMİR",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7236",
            "email": "silay.emir@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mimarlık ve Şehir Planlama Bölümü"
          }
        ]
      },
      {
        "id": "sec-37-9",
        "subDepartmentId": "63",
        "fullHeader": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü",
        "title": "Mülkiyet Koruma ve Güvenlik Bölümü",
        "contacts": [
          {
            "id": "37-9-0",
            "name": "Ferhat KARAOĞLAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "Blm. Bşk.",
            "phone": "0348 814 26 66",
            "extension": "1925",
            "email": "ferhatkaraoglan@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü"
          },
          {
            "id": "37-9-1",
            "name": "Nurgül YALÇIN",
            "title": "Öğr. Gör.",
            "role": "Blm. Bşk.Yrd.",
            "phone": "0348 814 26 66",
            "extension": "1938",
            "email": "nurgulyucel@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü"
          },
          {
            "id": "37-9-2",
            "name": "Cumhur CANBAZOĞLU",
            "title": "Prof. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "",
            "email": "canbazoglu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü"
          },
          {
            "id": "37-9-3",
            "name": "M. Burçin ÖNAY",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1924",
            "email": "burçinonay@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü"
          },
          {
            "id": "37-9-4",
            "name": "Melih KÜÇÜKOĞLU",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1926",
            "email": "melihkucukoglu@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü"
          },
          {
            "id": "37-9-5",
            "name": "Özkan DEDE",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "",
            "email": "ozkandede@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü"
          },
          {
            "id": "37-9-6",
            "name": "M. Burak TEMİZ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1946",
            "email": "buraktemiz@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü"
          },
          {
            "id": "37-9-7",
            "name": "Ayla DEVECİ",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1921",
            "email": "ayladeveci@kilis.edu.tr",
            "unitName": "Teknik Bilimler Meslek Yüksekokulu",
            "sectionName": "Teknik Bilimler MYO - Mülkiyet Koruma ve Güvenlik Bölümü"
          }
        ]
      }
    ]
  },
  {
    "id": "32",
    "name": "Turizm ve Otelcilik Meslek Yüksekokulu",
    "category": "yuksekokul",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-32-0",
        "fullHeader": "Turizm ve Otelcilik Meslek Yüksekokulu",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "32-0-0",
            "name": "Mustafa Zahrittin KAZANCIOĞLU",
            "title": "Doç. Dr.",
            "role": "Müdür",
            "phone": "0 348 814 26 66",
            "extension": "7228",
            "email": "mzkazancioglu@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-1",
            "name": "Fatih YILDIZ",
            "title": "Öğr. Gör.",
            "role": "Müdür Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "7239",
            "email": "fatihyildiz@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-2",
            "name": "Ferzan AKTAŞ ÖZKAN",
            "title": "Öğr. Gör. Dr.",
            "role": "Müdür Yardımcısı",
            "phone": "0 348 814 26 66",
            "extension": "7245",
            "email": "ferzan.aktas@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-3",
            "name": "Melda AKBABA",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0 348 814 26 66",
            "extension": "7241",
            "email": "mharbalioglu@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-4",
            "name": "Mehmet BİÇER",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "7231",
            "email": "mehmetbicer@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-5",
            "name": "Gamze ÖZEL",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "7230",
            "email": "gozel@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-6",
            "name": "Hilal KUL",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "7243",
            "email": "hilal.kul@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-7",
            "name": "Salih DAĞTEKİN",
            "title": "Yüksekokul Sekreteri",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "7235",
            "email": "salihdagtekin@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-8",
            "name": "Ümit NOYAN",
            "title": "Bilgisayar İşletmeni",
            "role": "Müdür Sekreteri",
            "phone": "0 348 814 26 66",
            "extension": "7229",
            "email": "umit.noyan@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-9",
            "name": "Derya SOYBAY",
            "title": "Şef",
            "role": "Bölüm Sekreteri",
            "phone": "0 348 814 26 66",
            "extension": "7242",
            "email": "deryasoybay@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-10",
            "name": "Mehmet ARI",
            "title": "Bilgisayar İşletmeni",
            "role": "Mali İşler",
            "phone": "0 348 814 26 66",
            "extension": "7250",
            "email": "mehmet.ari@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          },
          {
            "id": "32-0-11",
            "name": "Fuat KARAKUŞ",
            "title": "Sürekli İşçi",
            "role": "Hizmetli",
            "phone": "0 348 814 26 66",
            "extension": "7249",
            "email": "fuatkarakus@kilis.edu.tr",
            "unitName": "Turizm ve Otelcilik Meslek Yüksekokulu",
            "sectionName": "Turizm ve Otelcilik Meslek Yüksekokulu"
          }
        ]
      }
    ]
  },
  {
    "id": "24",
    "name": "Uluslararası İlişkiler Ofisi",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-24-0",
        "fullHeader": "Uluslararası İlişkiler Ofisi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "24-0-0",
            "name": "Bilal GÖRENTAŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Uluslararası İlişkiler Ofisi Koordinatörü",
            "phone": "0 (348) 814 26 66",
            "extension": "1420",
            "email": "bilal.gorentas@kilis.edu.tr",
            "unitName": "Uluslararası İlişkiler Ofisi",
            "sectionName": "Uluslararası İlişkiler Ofisi"
          },
          {
            "id": "24-0-1",
            "name": "Müslüm Eflatun",
            "title": "Dr. Öğr. Üyesi",
            "role": "Erasmus Kurum Koordinatörü",
            "phone": "0 (348) 814 26 66",
            "extension": "1380-1506",
            "email": "muslumeflatun@kilis.edu.tr",
            "unitName": "Uluslararası İlişkiler Ofisi",
            "sectionName": "Uluslararası İlişkiler Ofisi"
          },
          {
            "id": "24-0-2",
            "name": "Emre Baran PAK",
            "title": "Dr. Öğr. Üyesi",
            "role": "Erasmus Personel Hareketliliği Sorumlusu",
            "phone": "0 (348) 814 26 66",
            "extension": "1523",
            "email": "emrebaranpak@kilis.edu.tr",
            "unitName": "Uluslararası İlişkiler Ofisi",
            "sectionName": "Uluslararası İlişkiler Ofisi"
          },
          {
            "id": "24-0-3",
            "name": "İmren BAYIL",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1043",
            "email": "imren.bayil@kilis.edu.tr",
            "unitName": "Uluslararası İlişkiler Ofisi",
            "sectionName": "Uluslararası İlişkiler Ofisi"
          },
          {
            "id": "24-0-4",
            "name": "Özgür YILMAZ",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1044",
            "email": "ozgur.yilmaz@kilis.edu.tr",
            "unitName": "Uluslararası İlişkiler Ofisi",
            "sectionName": "Uluslararası İlişkiler Ofisi"
          },
          {
            "id": "24-0-5",
            "name": "Emine Aslan",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1338",
            "email": "emine.aslan@kilis.edu.tr",
            "unitName": "Uluslararası İlişkiler Ofisi",
            "sectionName": "Uluslararası İlişkiler Ofisi"
          },
          {
            "id": "24-0-6",
            "name": "Kenan BARLAS",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1382",
            "email": "kenan.barlas@kilis.edu.tr",
            "unitName": "Uluslararası İlişkiler Ofisi",
            "sectionName": "Uluslararası İlişkiler Ofisi"
          },
          {
            "id": "24-0-7",
            "name": "Ali YALÇINKAYA",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1381",
            "email": "",
            "unitName": "Uluslararası İlişkiler Ofisi",
            "sectionName": "Uluslararası İlişkiler Ofisi"
          }
        ]
      }
    ]
  },
  {
    "id": "141",
    "name": "Uluslararası Öğrenciler Ofisi",
    "category": "koordinatorluk",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-141-0",
        "fullHeader": "Uluslararası Öğrenciler Ofisi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "141-0-0",
            "name": "Hatice Esenkaya",
            "title": "Dr. Öğr. Üyesi",
            "role": "Koordinatör",
            "phone": "0348 814 26 66",
            "extension": "1244",
            "email": "hatice.esenkaya@kilis.edu.tr",
            "unitName": "Uluslararası Öğrenciler Ofisi",
            "sectionName": "Uluslararası Öğrenciler Ofisi"
          }
        ]
      }
    ]
  },
  {
    "id": "26",
    "name": "Uygulamalı Bilimler Fakültesi",
    "category": "fakulte",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-26-0",
        "fullHeader": "Uygulamalı Bilimler Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "26-0-0",
            "name": "Memet KULE",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0 (348) 814 26 66",
            "extension": "7219",
            "email": "",
            "unitName": "Uygulamalı Bilimler Fakültesi",
            "sectionName": "Uygulamalı Bilimler Fakültesi"
          },
          {
            "id": "26-0-1",
            "name": "Merve YOLAL",
            "title": "Dr. Öğretim Üyesi",
            "role": "Dekan Yardımcısı",
            "phone": "0348 814 26 66",
            "extension": "7233",
            "email": "",
            "unitName": "Uygulamalı Bilimler Fakültesi",
            "sectionName": "Uygulamalı Bilimler Fakültesi"
          },
          {
            "id": "26-0-2",
            "name": "Gümrah Can BAŞDAĞ",
            "title": "Araştırma Görevlisi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7217",
            "email": "",
            "unitName": "Uygulamalı Bilimler Fakültesi",
            "sectionName": "Uygulamalı Bilimler Fakültesi"
          },
          {
            "id": "26-0-3",
            "name": "Kadir ÖZDEMİR",
            "title": "",
            "role": "Fakülte Sekreteri",
            "phone": "0348 814 26 66",
            "extension": "7205",
            "email": "",
            "unitName": "Uygulamalı Bilimler Fakültesi",
            "sectionName": "Uygulamalı Bilimler Fakültesi"
          }
        ]
      }
    ]
  },
  {
    "id": "18",
    "name": "Yabancı Diller Yüksekokulu",
    "category": "yuksekokul",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-18-0",
        "fullHeader": "Yabancı Diller Yüksekokulu",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "18-0-0",
            "name": "Beyza ÇOLAKOĞLU",
            "title": "Dr. Öğr. Üyesi",
            "role": "Müdür",
            "phone": "0 (348) 814 26 66",
            "extension": "1831",
            "email": "",
            "unitName": "Yabancı Diller Yüksekokulu",
            "sectionName": "Yabancı Diller Yüksekokulu"
          },
          {
            "id": "18-0-1",
            "name": "Ahmet TURANOĞLU",
            "title": "Öğr. Gör.",
            "role": "Müdür Yardımcısı",
            "phone": "0 (348) 814 26 66",
            "extension": "1835",
            "email": "",
            "unitName": "Yabancı Diller Yüksekokulu",
            "sectionName": "Yabancı Diller Yüksekokulu"
          },
          {
            "id": "18-0-2",
            "name": "Abdil Celal YAŞAMALI",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1834",
            "email": "",
            "unitName": "Yabancı Diller Yüksekokulu",
            "sectionName": "Yabancı Diller Yüksekokulu"
          },
          {
            "id": "18-0-3",
            "name": "Sandra LEA MONTOUT",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1836",
            "email": "",
            "unitName": "Yabancı Diller Yüksekokulu",
            "sectionName": "Yabancı Diller Yüksekokulu"
          },
          {
            "id": "18-0-4",
            "name": "Hasan HIJAZI",
            "title": "Öğr. Gör.",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1837",
            "email": "",
            "unitName": "Yabancı Diller Yüksekokulu",
            "sectionName": "Yabancı Diller Yüksekokulu"
          },
          {
            "id": "18-0-5",
            "name": "Mecit ÇELEBİ",
            "title": "Yüksekokul Sekreteri",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1832",
            "email": "",
            "unitName": "Yabancı Diller Yüksekokulu",
            "sectionName": "Yabancı Diller Yüksekokulu"
          },
          {
            "id": "18-0-6",
            "name": "Mahmut KARAMEMİŞ",
            "title": "Hizmetli",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1833",
            "email": "",
            "unitName": "Yabancı Diller Yüksekokulu",
            "sectionName": "Yabancı Diller Yüksekokulu"
          },
          {
            "id": "18-0-7",
            "name": "Kadir KAÇAN",
            "title": "Hizmetli",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "Yabancı Diller Yüksekokulu",
            "sectionName": "Yabancı Diller Yüksekokulu"
          }
        ]
      }
    ]
  },
  {
    "id": "8",
    "name": "Yapı İşleri ve Teknik Daire Başkanlığı",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-8-0",
        "fullHeader": "Yapı İşleri ve Teknik Daire Başkanlığı",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "8-0-0",
            "name": "Ahmet KALKAN",
            "title": "Daire Başkanı",
            "role": "Daire Başkanı",
            "phone": "0 (348) 814 26 66",
            "extension": "1101",
            "email": "ahmet.kalkan@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-1",
            "name": "Ökkeş EYİGÜN",
            "title": "Şube Müdür V.",
            "role": "Şube Müdür V.",
            "phone": "0 (348) 814 26 66",
            "extension": "1102",
            "email": "okkeseyigun@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-2",
            "name": "Behsat KÖSE",
            "title": "Şube Müdür V.",
            "role": "Şube Müdür V.",
            "phone": "0 (348) 814 26 66",
            "extension": "1104",
            "email": "behsatkose@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-3",
            "name": "Recep ÖZDEMİR",
            "title": "Şube Müdür V.",
            "role": "Şube Müdür V.",
            "phone": "0 (348) 814 26 66",
            "extension": "1103",
            "email": "recepozdemir@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-4",
            "name": "Hakan AKKAŞ",
            "title": "Mimar",
            "role": "Mimar",
            "phone": "0 (348) 814 26 66",
            "extension": "1110",
            "email": "hakanakkas@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-5",
            "name": "Cumali ALP",
            "title": "İnşaat Mühendisi",
            "role": "İnşaat Mühendisi",
            "phone": "0 (348) 814 26 66",
            "extension": "1115",
            "email": "cumalialp@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-6",
            "name": "Neslihan TÜMEN",
            "title": "İnşaat Mühendisi",
            "role": "İnşaat Mühendisi",
            "phone": "0 (348) 814 26 66",
            "extension": "1119",
            "email": "neslihantumen@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-7",
            "name": "Nafi AYKUT",
            "title": "İnşaat Mühendisi",
            "role": "İnşaat Mühendisi",
            "phone": "0 (348) 814 26 66",
            "extension": "1120",
            "email": "nafi.aykut@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-8",
            "name": "Gazi YAVUZ",
            "title": "Makine Mühendisi",
            "role": "Makine Mühendisi",
            "phone": "0 (348) 814 26 66",
            "extension": "1122",
            "email": "gazi.yavuz@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-9",
            "name": "Mustafa AĞCAKOYUNLU",
            "title": "Elektrik Elektronik Mühendisi",
            "role": "Elektrik Elektronik Mühendisi",
            "phone": "0 (348) 814 26 66",
            "extension": "1111",
            "email": "magcakoyunlu@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-10",
            "name": "Bedir BARAN",
            "title": "Elektrik Teknikeri",
            "role": "Elektrik Teknikeri",
            "phone": "0 (348) 814 26 66",
            "extension": "1117",
            "email": "bedirbaran@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-11",
            "name": "Abdullah ŞİMŞEKLİ",
            "title": "Makine Teknikeri",
            "role": "Makine Teknikeri",
            "phone": "0 (348) 814 26 66",
            "extension": "1112",
            "email": "abdullahsimsekli@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-12",
            "name": "Çavuş GÜNEŞ",
            "title": "Elektrik Teknikeri",
            "role": "Elektrik Teknikeri",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "cavusgunes@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-13",
            "name": "Hüseyin SAĞIR",
            "title": "Bilgisayar Teknisyeni",
            "role": "Bilgisayar Teknisyeni",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "huseyinsagir@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-14",
            "name": "Mert ÖZDEMİR",
            "title": "İnşaat Teknisyeni",
            "role": "İnşaat Teknisyeni",
            "phone": "0 (348) 814 26 66",
            "extension": "1144",
            "email": "mert.ozdemir@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-15",
            "name": "Mete Kaan AKYÜZLÜ",
            "title": "İklim ve Soğutma Teknisyeni",
            "role": "İklim ve Soğutma Teknisyeni",
            "phone": "0 (348) 814 26 66",
            "extension": "1123",
            "email": "metekaan.akyuzlu@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-16",
            "name": "Hakan Semetey ÖRTLEK",
            "title": "Elektrik Elektronik Teknisyeni",
            "role": "Elektrik Elektronik Teknisyeni",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "hakan.ortlek@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-17",
            "name": "Serhat GENÇ",
            "title": "Sıhhi Tesisat Teknisyeni",
            "role": "Sıhhi Tesisat Teknisyeni",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "serhat.genc@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-18",
            "name": "Elif KARABULUT",
            "title": "Makine Teknikeri",
            "role": "Makine Teknikeri",
            "phone": "0 (348) 814 26 66",
            "extension": "1116",
            "email": "elif.karabulut@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-19",
            "name": "Hatice İNCE",
            "title": "Şef",
            "role": "Şef",
            "phone": "0 (348) 814 26 66",
            "extension": "1113",
            "email": "haticeince@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-20",
            "name": "Kadriye KARABACAK",
            "title": "Memur",
            "role": "Memur",
            "phone": "0 (348) 814 26 66",
            "extension": "1100",
            "email": "kadriye.karabacak@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-21",
            "name": "Sibel DAĞ",
            "title": "Bilgisayar İşletmeni",
            "role": "Bilgisayar İşletmeni",
            "phone": "0348 814 26 66",
            "extension": "1114",
            "email": "sibel.dag@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-22",
            "name": "Mehmet VURAL",
            "title": "Sürekli İşçi",
            "role": "Sürekli İşçi",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "mehmet.vural@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-23",
            "name": "Mehmet KIRTAK",
            "title": "Sürekli İşçi",
            "role": "Sürekli İşçi",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "mehmetkirtak@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          },
          {
            "id": "8-0-24",
            "name": "Mehmet Ali DEĞİRMENCİ",
            "title": "Sürekli İşçi",
            "role": "Sürekli İşçi",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "malidegirmenci@kilis.edu.tr",
            "unitName": "Yapı İşleri ve Teknik Daire Başkanlığı",
            "sectionName": "Yapı İşleri ve Teknik Daire Başkanlığı"
          }
        ]
      }
    ]
  },
  {
    "id": "150",
    "name": "Yazı İşleri Müdürlüğü",
    "category": "idari",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-150-0",
        "fullHeader": "Yazı İşleri Müdürlüğü",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "150-0-0",
            "name": "Sevilay DOKUZOĞLU",
            "title": "Şube Müdürü",
            "role": "Yazı İşleri Müdürü",
            "phone": "0 (348) 814 26 66",
            "extension": "1019",
            "email": "sdokuzoglu@kilis.edu.tr",
            "unitName": "Yazı İşleri Müdürlüğü",
            "sectionName": "Yazı İşleri Müdürlüğü"
          },
          {
            "id": "150-0-1",
            "name": "Zehra YILMAZ",
            "title": "Bilgisayar İşletmeni",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1031",
            "email": "zehra.yilmaz@kilis.edu.tr",
            "unitName": "Yazı İşleri Müdürlüğü",
            "sectionName": "Yazı İşleri Müdürlüğü"
          },
          {
            "id": "150-0-2",
            "name": "İbrahim Halil GÜNEŞ",
            "title": "Teknisyen",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1033",
            "email": "ibrahim.gunes@kilis.edu.tr",
            "unitName": "Yazı İşleri Müdürlüğü",
            "sectionName": "Yazı İşleri Müdürlüğü"
          },
          {
            "id": "150-0-3",
            "name": "Hurşit YILMAZ",
            "title": "Bilgisayar İşletmeni",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "1034",
            "email": "hursit.yilmaz@kilis.edu.tr",
            "unitName": "Yazı İşleri Müdürlüğü",
            "sectionName": "Yazı İşleri Müdürlüğü"
          }
        ]
      }
    ]
  },
  {
    "id": "50",
    "name": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
    "category": "fakulte",
    "subDepartments": [
      {
        "id": "27",
        "fullName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Beslenme ve Diyetetik Bölümü",
        "name": "Beslenme ve Diyetetik Bölümü"
      },
      {
        "id": "52",
        "fullName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Sağlık Yönetimi Bölümü",
        "name": "Sağlık Yönetimi Bölümü"
      },
      {
        "id": "99",
        "fullName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü",
        "name": "Hemşirelik Bölümü"
      }
    ],
    "sections": [
      {
        "id": "sec-50-0",
        "fullHeader": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "50-0-0",
            "name": "Prof. Dr. Yakup DOĞAN",
            "title": "Prof Dr",
            "role": "Dekan",
            "phone": "+90 (348) 814 26 66",
            "extension": "7000",
            "email": "yakupdogan@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi"
          },
          {
            "id": "50-0-1",
            "name": "Dr Öğr. Üyesi Fatma Esen SARIGÜLLÜ ÖNALAN",
            "title": "",
            "role": "Dekan yardımcısı",
            "phone": "+90 (348) 814 26 66",
            "extension": "7003",
            "email": "",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi"
          },
          {
            "id": "50-0-2",
            "name": "Dr. Öğr. Üyesi İslam ELAGÖZ",
            "title": "",
            "role": "Dekan yardımcısı",
            "phone": "+90 (348) 814 26 66",
            "extension": "7004",
            "email": "",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi"
          },
          {
            "id": "50-0-3",
            "name": "Ferhat ŞAKİR",
            "title": "",
            "role": "Fakülte sekreteri",
            "phone": "+90 (348) 814 26 66",
            "extension": "7005",
            "email": "",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi"
          },
          {
            "id": "50-0-4",
            "name": "Bedir TAŞDEMIR",
            "title": "",
            "role": "Dekan sekreteri",
            "phone": "+90 (348) 814 26 66",
            "extension": "7000",
            "email": "",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi"
          },
          {
            "id": "50-0-5",
            "name": "Abdülkadir AYDIN",
            "title": "",
            "role": "Mutemet",
            "phone": "+90 (348) 814 26 66",
            "extension": "7007",
            "email": "abdulkadiraydin@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi"
          },
          {
            "id": "50-0-6",
            "name": "Çay Ocağı",
            "title": "",
            "role": "",
            "phone": "+90 (348) 814 26 66",
            "extension": "7016",
            "email": "",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi"
          }
        ]
      },
      {
        "id": "sec-50-1",
        "subDepartmentId": "27",
        "fullHeader": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Beslenme ve Diyetetik Bölümü",
        "title": "Beslenme ve Diyetetik Bölümü",
        "contacts": [
          {
            "id": "50-1-0",
            "name": "Zehra GÖKÇE",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0348 814 26 66",
            "extension": "7025",
            "email": "zehragokce@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Beslenme ve Diyetetik Bölümü"
          },
          {
            "id": "50-1-1",
            "name": "Mehmet KÖTEN",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7008",
            "email": "mehmetkoten@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Beslenme ve Diyetetik Bölümü"
          },
          {
            "id": "50-1-2",
            "name": "Anıl UZUN ÖZCAN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7028",
            "email": "aniluzunozcan@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Beslenme ve Diyetetik Bölümü"
          },
          {
            "id": "50-1-3",
            "name": "Pınar GÜMÜŞ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 26 66",
            "extension": "7028",
            "email": "pinargumus@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Beslenme ve Diyetetik Bölümü"
          },
          {
            "id": "50-1-4",
            "name": "Saadet ÖZEN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7130",
            "email": "saadet.ozen@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Beslenme ve Diyetetik Bölümü"
          },
          {
            "id": "50-1-5",
            "name": "Beyza KARAYİĞİT",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "7130",
            "email": "beyzaozpalas@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Beslenme ve Diyetetik Bölümü"
          },
          {
            "id": "50-1-6",
            "name": "Elif Nisa GÖKÇEN",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0348 814 26 66",
            "extension": "1849",
            "email": "elifnisa.pak@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Beslenme ve Diyetetik Bölümü"
          }
        ]
      },
      {
        "id": "sec-50-2",
        "subDepartmentId": "52",
        "fullHeader": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Sağlık Yönetimi Bölümü",
        "title": "Sağlık Yönetimi Bölümü",
        "contacts": [
          {
            "id": "50-2-0",
            "name": "Merve KOÇ",
            "title": "Dr. Öğr. Üyesi",
            "role": "Bölüm Başkanı",
            "phone": "0 348 814 30 95",
            "extension": "7007",
            "email": "merveakis@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Sağlık Yönetimi Bölümü"
          },
          {
            "id": "50-2-1",
            "name": "İbrahim BOZKURT",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 30 95",
            "extension": "7026",
            "email": "ibrahim.bozkurt.kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Sağlık Yönetimi Bölümü"
          },
          {
            "id": "50-2-2",
            "name": "İlkay Sevinç TURAÇ",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 814 30 95",
            "extension": "7004",
            "email": "ilkaysevinc.turac@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Sağlık Yönetimi Bölümü"
          },
          {
            "id": "50-2-3",
            "name": "Yakup Safa ÇALI",
            "title": "Arş. Gör.",
            "role": "",
            "phone": "0 348 814 30 95",
            "extension": "7124",
            "email": "yakupsafacali@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi - Sağlık Yönetimi Bölümü"
          }
        ]
      },
      {
        "id": "sec-50-3",
        "subDepartmentId": "99",
        "fullHeader": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü",
        "title": "Hemşirelik Bölümü",
        "contacts": [
          {
            "id": "50-3-0",
            "name": "Erhan ELMAOĞLU",
            "title": "Doç.Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0 348 814 30 95",
            "extension": "7012",
            "email": "erhan.elmaoglu@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-1",
            "name": "Ebru ÖZTÜRK ÇOPUR",
            "title": "Doç.Dr.",
            "role": "Anabilim Dalı Başkanı",
            "phone": "0 348 814 30 95",
            "extension": "7016",
            "email": "ebruozturkcopur@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-2",
            "name": "Uğur DOĞAN",
            "title": "Doç.Dr.",
            "role": "Anabilim Dalı Başkanı",
            "phone": "0 348 814 30 95",
            "extension": "7026",
            "email": "ugur.dogan@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-3",
            "name": "Selver GÜLER",
            "title": "Doç.Dr.",
            "role": "Anabilim Dalı Başkanı",
            "phone": "0 348 814 30 95",
            "extension": "7020",
            "email": "selver.guler@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-4",
            "name": "Adem İMALI",
            "title": "Dr.Öğr.Üyesi",
            "role": "Anabilim Dalı Başkanı",
            "phone": "0 348 814 30 95",
            "extension": "7008",
            "email": "ademimali@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-5",
            "name": "İslam ELAGÖZ",
            "title": "Dr.Öğr.Üyesi",
            "role": "Anabilim Dalı Başkanı",
            "phone": "0 348 814 30 95",
            "extension": "7004",
            "email": "islam.elagoz@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-6",
            "name": "Çiğdem ÖZDEMİR",
            "title": "Dr.Öğr.Üyesi",
            "role": "Anabilim Dalı Başkanı",
            "phone": "0 348 814 30 95",
            "extension": "7009",
            "email": "cigdem.ozdemir@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-7",
            "name": "Funda Gül BİLGEN",
            "title": "Öğr.Gör.Dr.",
            "role": "Anabilim Dalı Başkanı",
            "phone": "0 348 814 30 95",
            "extension": "7013",
            "email": "fundabilgen@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-8",
            "name": "Meltem SUNGUR",
            "title": "Dr.Öğr.Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0 348 814 30 95",
            "extension": "7130",
            "email": "meltem.sungur@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-9",
            "name": "Canan BİRİMOĞLU OKUYAN",
            "title": "Doç.Dr.",
            "role": "Öğretim Üyesi",
            "phone": "0 348 814 30 95",
            "extension": "",
            "email": "",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-10",
            "name": "Fatma Esen SARIGÜLLÜ ÖNALAN",
            "title": "Dr.Öğr.Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0 348 814 30 95",
            "extension": "7003",
            "email": "esenonalan@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-11",
            "name": "Mustafa SATOUF",
            "title": "Dr.Öğr.Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0 348 814 30 95",
            "extension": "7132",
            "email": "mustafasatouf@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-12",
            "name": "Nuriye Nesrin İPEKÇİ",
            "title": "Dr.Öğr.Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0 348 814 30 95",
            "extension": "7011",
            "email": "nesrinipekci@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-13",
            "name": "Sibel Arslan",
            "title": "Dr.Öğr.Üyesi",
            "role": "Öğretim Üyesi",
            "phone": "0 348 814 30 95",
            "extension": "7015",
            "email": "sibel.arslan@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-14",
            "name": "Büşra ATSAL KILIÇ",
            "title": "Arş.Gör.Dr",
            "role": "Öğretim Elemanı",
            "phone": "0 348 814 30 95",
            "extension": "7130",
            "email": "busra.atsalkilic@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-15",
            "name": "Hacı Yusuf GÜLEÇ",
            "title": "Arş.Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0 348 814 30 95",
            "extension": "7124",
            "email": "h.yusuf.gulec@hotmail.com",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-16",
            "name": "Seda Sibel IŞIK",
            "title": "Arş.Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0 348 814 30 95",
            "extension": "7125",
            "email": "sedasibel.aslan@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          },
          {
            "id": "50-3-17",
            "name": "Beyza ERÇEN",
            "title": "Arş.Gör.",
            "role": "Öğretim Elemanı",
            "phone": "0 348 814 30 95",
            "extension": "7126",
            "email": "beyza.ercen@kilis.edu.tr",
            "unitName": "Yusuf Şerefoğlu Sağlık Bilimleri Fakültesi",
            "sectionName": "Yusuf Şerefoğlu Sağlık Bilimleri - Hemşirelik Bölümü"
          }
        ]
      }
    ]
  },
  {
    "id": "15",
    "name": "Ziraat Fakültesi",
    "category": "fakulte",
    "subDepartments": [],
    "sections": [
      {
        "id": "sec-15-0",
        "fullHeader": "Ziraat Fakültesi",
        "title": "Dekanlık / Yönetim & İdari Kadro",
        "contacts": [
          {
            "id": "15-0-0",
            "name": "Dekanlık",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-1",
            "name": "Demet DEMİROĞLU",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0 348 813 93 55",
            "extension": "7200",
            "email": "ddemiroglu@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-2",
            "name": "Faika Yaralı KARAKAN",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 813 93 55",
            "extension": "7202",
            "email": "faikayarali@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-3",
            "name": "Bekir Bülent ARPACI",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 813 93 55",
            "extension": "7226",
            "email": "bbarpaci@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-4",
            "name": "Kadir ÖZDEMİR",
            "title": "",
            "role": "Fakülte Sekreteri",
            "phone": "0 348 813 93 55",
            "extension": "7205",
            "email": "e-posta:kadirozdemir@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-5",
            "name": "Hayriye AKKUYU",
            "title": "",
            "role": "Dekan Sekreteri",
            "phone": "0 348 813 93 55",
            "extension": "7200",
            "email": "hayriyeakkuyu@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-6",
            "name": "Olgu ZORKİRİŞÇİ",
            "title": "",
            "role": "Dekan Sekreteri",
            "phone": "0 348 813 93 55",
            "extension": "7203",
            "email": "olgu.zorkirisci@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-7",
            "name": "Yılmaz KAYA",
            "title": "",
            "role": "Bölüm Sekreteri",
            "phone": "0 348 813 93 55",
            "extension": "7226",
            "email": "ykaya@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-8",
            "name": "Ali ORUÇ",
            "title": "",
            "role": "Yardımcı Personel",
            "phone": "0 348 813 93 55",
            "extension": "7236",
            "email": "",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-9",
            "name": "Meyve Yetiştirme ve Islahı Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-10",
            "name": "Hakan ÇETİNKAYA",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 813 93 55",
            "extension": "7214",
            "email": "hcetinkaya@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-11",
            "name": "Hatice GÖZEL",
            "title": "Dr. Öğretim Üyesi",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0 348 813 93 55",
            "extension": "7221",
            "email": "hatice.gozel@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-12",
            "name": "Serdar TÜRKER",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 813 93 55",
            "extension": "7222",
            "email": "serdar.turker@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-13",
            "name": "Burcu ÖZTAŞ KURT",
            "title": "Araş. Gör.",
            "role": "",
            "phone": "0 348 813 93 55",
            "extension": "7236",
            "email": "burcu.oztaskurt@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-14",
            "name": "Sebze Yetiştirme ve Islahı Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-15",
            "name": "Bekir Bülent ARPACI",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 813 93 55",
            "extension": "7204",
            "email": "bbarpaci@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-16",
            "name": "Faika YARALI KARAKAN",
            "title": "Doç. Dr.",
            "role": "Dekan Yardımcısı",
            "phone": "0 348 813 93 55",
            "extension": "7234",
            "email": "faikayarali@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-17",
            "name": "Ümit Haydar EROL",
            "title": "Doç. Dr.",
            "role": "Bölüm Başkan Yardımcısı",
            "phone": "0 348 813 93 55",
            "extension": "7216",
            "email": "umith.erol@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-18",
            "name": "Berna ERGUN ÇETİN",
            "title": "Araş. Gör.",
            "role": "",
            "phone": "0 348 813 93 55",
            "extension": "7236",
            "email": "bernae.cetin@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-19",
            "name": "Bağ Yetiştirme ve Islahı Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-20",
            "name": "Meryem KUZUCU",
            "title": "Prof. Dr.",
            "role": "Bölüm Başkanı",
            "phone": "0 348 813 93 55",
            "extension": "7211",
            "email": "mkuzucu@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-21",
            "name": "İbrahim Samet GÖKÇEN",
            "title": "Dr. Öğr. Üyesi",
            "role": "",
            "phone": "0 348 813 93 55",
            "extension": "7212",
            "email": "ibrahimsgokcen@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-22",
            "name": "Süs Bitkileri Yetiştirme ve Islahı Ana Bilim Dalı",
            "title": "",
            "role": "",
            "phone": "0 (348) 814 26 66",
            "extension": "",
            "email": "",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-23",
            "name": "Demet DEMİROĞLU",
            "title": "Prof. Dr.",
            "role": "Dekan",
            "phone": "0 348 813 93 55",
            "extension": "7220",
            "email": "ddemiroglu@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-24",
            "name": "Saliha TAŞÇIOĞLU",
            "title": "Doç. Dr.",
            "role": "",
            "phone": "0 348 813 93 55",
            "extension": "7210",
            "email": "salihatascioglu@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          },
          {
            "id": "15-0-25",
            "name": "Hafize Nur Sılay EMİR",
            "title": "Öğr. Gör. Dr.",
            "role": "",
            "phone": "0 348 813 93 55",
            "extension": "7236",
            "email": "silay.emir@kilis.edu.tr",
            "unitName": "Ziraat Fakültesi",
            "sectionName": "Ziraat Fakültesi"
          }
        ]
      }
    ]
  }
];
