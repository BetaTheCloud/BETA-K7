# Görsel Tekrarlama ve Çoklu Gösterim Sorununun Çözümü

## Tespit Edilen Tekrarlama Noktaları

1. **Kapak Görseli ve Gövde Metni (`contentHtml`) Arasındaki Çift Gösterim**:
   - Duyuru afişi hem modalın üst kısmında ana kapak görseli (`currentDisplayImage`) olarak gösterilip hem de altındaki `contentHtml` gövdesi içerisinde ikinci kez render ediliyordu.
   - **Çözüm**: `cleanDetailContentHtml` içerisinde `areImagesEqual(safeSrc, coverImg)` kontrolü eklenerek, modalın üstünde zaten tam boyutta sergilenen afişin metin gövdesi içerisinde tekrar etmesi engellendi.

2. **Farklı Dizin Yollarındaki Aynı Dosyaların Galeri Küçük Resimlerinde Tekrarlaması**:
   - Üniversite CMS sistemi aynı görseli hem `/images/announcements/` hem de `/contentFiles/` altına farklı zaman damgası önekleriyle yüklemekteydi (örneğin MMF 1514 duyurusu). Bu durum `allImages` dizisinde 2 adet birebir aynı resim oluşmasına ve altta gereksiz switcher butonları çıkmasına sebep oluyordu.
   - **Çözüm**: `getImageSignature` ve `areImagesEqual` algoritmaları entegre edildi. Sunucu ve istemci tarafında kanonik dosya imzası eşleşen kopyalar tekilleştirildi (`images count: 1`).

3. **Görsellerin "Ekli Belgeler ve Dosyalar" Bölümünde 3. Kez Tekrarlaması**:
   - Duyuru afişine verilen linkler (`.jpeg`, `.png`), ekli belge tarayıcısı tarafından PDF veya Word belgesi gibi algılanıp "Ekli Belgeler" listesine ekleniyordu (örneğin Eğitim Fakültesi 1517 duyurusu).
   - **Çözüm**: Ekli belge listesi taranırken, duyurunun kapak veya galeri görseliyle eşleşen resim dosyaları ekli dosya listesinden filtrelendi. Yalnızca gerçek dökümanlar (PDF, Word, Excel, sınav takvimleri) listede tutuldu.

## Doğrulama
- `compile_applet` ve `lint_applet` sıfır hatayla geçti.
- MMF, İİBF, İTBF ve Eğitim fakültesi duyurularında görsel sayısı 1'e indirgendi, dökümanlar (İİBF PDF vize takvimi) ve metinler (İTBF açıklaması) bozulmadan korundu.
