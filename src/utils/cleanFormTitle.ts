/**
 * Cleans and normalizes raw form titles and filenames to proper Turkish.
 * Eliminates issues like "ek_sinav_dilekcesi (1)", "mazeretli_not_bildirimi (1)",
 * leading numeric IDs, raw underscores, and lowercase letters.
 */
export function cleanTurkishFormTitle(raw: string): string {
  if (!raw) return 'Dilekçe / Form';
  let title = decodeURIComponent(raw).trim();

  // Strip path if URL
  if (title.includes('/')) {
    title = title.split('/').pop() || title;
  }

  // Strip file extension
  title = title.replace(/\.(docx?|pdf|xlsx?|xls|txt)$/i, '');

  // Strip leading timestamps/IDs like "914493791766659460." or "167167731766829088."
  title = title.replace(/^\d{6,}\./, '');
  title = title.replace(/^[0-9.]+\./, '');

  // Strip numbering prefixes like "1- ", "2. ", "10- "
  title = title.replace(/^[0-9]+[-\.\s]+/, '');

  // Strip duplicate indices at end like "(1)", "(2)", "(2026)"
  title = title.replace(/\s*\(\d+\)\s*$/g, '');

  // Split camelCase words (e.g. genelAmacliDilekce -> genel Amacli Dilekce)
  title = title.replace(/([a-zğüşıöç])([A-ZĞÜŞİÖÇ])/g, '$1 $2');

  // Replace underscores, dashes, dots and clean up whitespaces
  title = title.replace(/[_\.\-]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Normalized key for exact matching dictionary
  const normalized = title
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();

  const exactMap: Record<string, string> = {
    'ek sinav dilekcesi': 'Ek Sınav Dilekçesi',
    'ek sinav icin dilekce': 'Ek Sınav Başvuru Dilekçesi',
    'azami dilekce ornegi': 'Azami Süre Sonu Ek Sınav Başvuru Dilekçesi',
    'ogrenci diploma kayip dilekcesi': 'Öğrenci Diploma Kayıp Dilekçesi',
    'ogrenci kimlik karti kayip dilekcesi': 'Öğrenci Kimlik Kartı Kayıp Dilekçesi',
    'ornek ders dagilim formu': 'Örnek Ders Dağılım Formu',
    'ozel ogrenci basvuru formu': 'Özel Öğrenci Başvuru Formu',
    'ozel ogr.ogrenim protokolu': 'Özel Öğrenci Öğrenim Protokolü',
    'ozel ogrenci ogrenim protokolu': 'Özel Öğrenci Öğrenim Protokolü',
    'harc dilekcesi': 'Katkı Payı / Harç İade Dilekçesi',
    'para iade dilekcesi': 'Harç / Para İade Dilekçesi',
    'agno yatay gecis tablo ornegi': 'AGNO ile Yatay Geçiş Değerlendirme Tablosu',
    'ek madde-1 yatay gecis sonuclarin ilani tablosu': 'Ek Madde-1 Yatay Geçiş Sonuç İlanı Tablosu',
    'ek madde-1 yatay gecis sonuclari ilani tablosu': 'Ek Madde-1 Yatay Geçiş Sonuç İlanı Tablosu',
    'ilisik kesme formu': 'Üniversiteden İlişik Kesme Formu',
    'universiteden ilisik kesme formu': 'Üniversiteden İlişik Kesme Formu',
    'not bildirim formu': 'Mazeretli Not Bildirim Formu',
    'mazeretli not bildirimi': 'Mazeretli Not Bildirim Formu',
    'intibak formu': 'Ders İntibak ve Muafiyet Formu',
    'ders katalog ornegi': 'Bologna Ders Kataloğu ve Bilgi Paketi Formu',
    'standart form yaz okulu acilacak dersler': 'Yaz Okulu Açılması Planlanan Dersler Formu',
    'yaz okulunda universite disi ders alma formu': 'Üniversite Dışından Yaz Okulu Ders Alma Formu',
    'yaz okul kayit formu ornegi': 'Yaz Okulu Ön Kayıt ve Ders Seçim Formu',
    'yatay gecise engel yoktur formu': 'Yatay Geçişe Engel Durum Olmadığına Dair Belge Formu',
    'yatay gecis basvuru dilekcesi': 'Yatay Geçiş Başvuru Dilekçesi',
    'not itiraz dilekcesi': 'Not İtiraz Dilekçesi',
    'not itiraz formu': 'Not İtiraz Dilekçesi',
    'ozel ogrenci formu gelen': 'Özel Öğrenci Başvuru Formu (Gelen)',
    'ozel ogrenci gelen': 'Özel Öğrenci Başvuru Formu (Gelen)',
    'ozel ogrenci formu giden': 'Özel Öğrenci Başvuru Formu (Giden)',
    'ozel ogrenci giden': 'Özel Öğrenci Başvuru Formu (Giden)',
    'vize sinavi mazeret dilekcesi': 'Vize Sınavı Mazeret Dilekçesi',
    'vize mazeret dilekcesi': 'Vize Sınavı Mazeret Dilekçesi',
    'mazeret sinavi basvuru formu': 'Mazeret Sınavı Başvuru Formu',
    'mazaret sinavi basvuru formu': 'Mazeret Sınavı Başvuru Formu',
    'ders muafiyet dilekcesi': 'Ders Muafiyet Dilekçesi',
    'burs basvuru formu': 'Burs Başvuru Formu',
    'burs basvuru formu yeni': 'Burs Başvuru Formu',
    'kayit sildirme dilekcesi': 'Kayıt Sildirme Dilekçesi',
    'kayit dondurma basvuru formu': 'Kayıt Dondurma Başvuru Formu',
    'kayit dondurma basvuru formu 2': 'Kayıt Dondurma Başvuru Formu',
    'kayit dondurma formu': 'Kayıt Dondurma Başvuru Formu',
    'genel amacli dilekce': 'Genel Amaçlı Öğrenci Dilekçesi',
    'toplanti tutanagi taslak': 'Toplantı Tutanağı Taslak Formu',
    'komisyonlar icin toplanti tutanagi formu taslak': 'Komisyonlar İçin Toplantı Tutanağı Taslağı',
    'ogretmenlik uygulamasi telafi': 'Öğretmenlik Uygulaması Telafi Dilekçesi',
    'ogretmenlik uygulamasi telafi dilekcesi': 'Öğretmenlik Uygulaması Telafi Dilekçesi',
    'sertifikanin baska biri tarafindan alinabilmesi icin dilekce': 'Sertifikanın Başka Biri Tarafından Alınabilmesi İçin Yetki Dilekçesi',
    'pedagojik formasyon kayit sildirme dilekcesi': 'Pedagojik Formasyon Kayıt Sildirme Dilekçesi',
    'sertifika ikinci nusha talep dilekcesi': 'Sertifika İkinci Nüsha Talep Dilekçesi',
    'formasyon muafiyet basvuru formu': 'Pedagojik Formasyon Muafiyet Başvuru Formu',
    'muafiyet basvuru formu': 'Pedagojik Formasyon Muafiyet Başvuru Formu'
  };

  if (exactMap[normalized]) {
    return exactMap[normalized];
  }

  // Proper Title-Casing in Turkish
  const words = title.split(' ');
  return words
    .map((word) => {
      if (!word) return '';
      // Retain acronyms like EBYS, AGNO, TDE, BAP, SKS
      if (word.length <= 4 && word === word.toUpperCase()) return word;
      const first = word[0].toLocaleUpperCase('tr-TR');
      const rest = word.slice(1).toLocaleLowerCase('tr-TR');
      return first + rest;
    })
    .join(' ');
}
