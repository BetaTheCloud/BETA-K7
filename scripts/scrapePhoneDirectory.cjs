const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const axiosInstance = axios.create({
  timeout: 12000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
});

function cleanText(t) {
  if (!t) return '';
  return t.replace(/\s+/g, ' ').trim();
}

async function scrapeDirectory() {
  console.log('Fetching main telefon-rehberi page...');
  const mainUrl = 'https://www.kilis.edu.tr/tr/iletisim/telefon-rehberi';
  const mainRes = await axiosInstance.get(mainUrl);
  const $main = cheerio.load(mainRes.data);

  const units = [];
  $main('#phone-book-department-select option').each((i, el) => {
    const val = $main(el).attr('value');
    const name = cleanText($main(el).text());
    if (val && name && name !== 'Birim Seçiniz') {
      let category = 'other';
      const nLower = name.toLowerCase();
      if (nLower.includes('fakülte') || nLower.includes('fakultesi')) {
        category = 'fakulte';
      } else if (nLower.includes('enstitü') || nLower.includes('enstitu')) {
        category = 'enstitu';
      } else if (nLower.includes('yüksekokul') || nLower.includes('meslek yüksekokulu') || nLower.includes('myo')) {
        category = 'yuksekokul';
      } else if (nLower.includes('konservatuvar')) {
        category = 'konservatuvar';
      } else if (nLower.includes('daire başkanlığı') || nLower.includes('sekreterlik') || nLower.includes('rektörlük') || nLower.includes('müdürlüğü') || nLower.includes('müşavirliği') || nLower.includes('güvenlik')) {
        category = 'idari';
      } else if (nLower.includes('koordinatörlüğü') || nLower.includes('merkezi') || nLower.includes('ofisi')) {
        category = 'koordinatorluk';
      }

      units.push({
        id: val,
        name,
        category,
        subDepartments: [],
        sections: []
      });
    }
  });

  console.log(`Discovered ${units.length} primary units. Fetching each unit data...`);

  // Concurrency helper
  const limit = 4;
  let index = 0;

  async function worker() {
    while (index < units.length) {
      const uIndex = index++;
      const unit = units[uIndex];
      const deptUrl = `${mainUrl}?department_id=${encodeURIComponent(unit.id)}`;
      try {
        console.log(`[${uIndex + 1}/${units.length}] Fetching: ${unit.name} (id: ${unit.id})`);
        const res = await axiosInstance.get(deptUrl);
        const $ = cheerio.load(res.data);

        // Sub departments select options
        const subs = [];
        $('#phone-book-sub-department-select option').each((j, opt) => {
          const sVal = $(opt).attr('value');
          const sName = cleanText($(opt).text());
          if (sVal && sName && !sName.includes('-- Bölüm Seçiniz --')) {
            // Remove unit name prefix if redundant
            let shortDeptName = sName;
            if (sName.includes(' - ')) {
              shortDeptName = sName.split(' - ').slice(1).join(' - ').trim();
            }
            subs.push({
              id: sVal,
              fullName: sName,
              name: shortDeptName
            });
          }
        });
        unit.subDepartments = subs;

        // Extract sections / containers
        const sections = [];
        $('.phone-book-container').each((cIdx, cEl) => {
          const headerText = cleanText($(cEl).find('.phone-book-header span:not(.phone-book-header-toggle)').text()) || unit.name;
          let subDeptId = '';
          const matchedSub = subs.find(s => s.fullName === headerText || headerText.includes(s.name));
          if (matchedSub) {
            subDeptId = matchedSub.id;
          }

          const contacts = [];
          $(cEl).find('.phone-book-row').each((rIdx, rEl) => {
            const name = cleanText($(rEl).find('.phone-book-name-inner').text()) || cleanText($(rEl).find('.phone-book-name').text());
            if (!name) return;

            const link = $(rEl).find('.phone-book-link-text').attr('href') || '';
            const unvan = cleanText($(rEl).find('[data-type=unvan] .phone-book-info-value').text());
            const gorev = cleanText($(rEl).find('[data-type=gorev] .phone-book-info-value').text());
            const telefon = cleanText($(rEl).find('[data-type=telefon] .phone-book-info-value').text()) || '0 (348) 814 26 66';
            const email = cleanText($(rEl).find('[data-type=email] .phone-book-info-value a').text()) || cleanText($(rEl).find('[data-type=email] .phone-book-info-value').text());
            const dahili = cleanText($(rEl).find('[data-type=dahili] .phone-book-info-value').text());

            contacts.push({
              id: `${unit.id}-${cIdx}-${rIdx}`,
              name,
              title: unvan,
              role: gorev,
              phone: telefon,
              extension: dahili,
              email,
              profileUrl: link || undefined,
              unitName: unit.name,
              sectionName: headerText
            });
          });

          if (contacts.length > 0) {
            let sectionTitle = headerText;
            if (headerText.includes(' - ')) {
              sectionTitle = headerText.split(' - ').slice(1).join(' - ').trim();
            } else if (headerText.trim() === unit.name.trim()) {
              sectionTitle = 'Dekanlık / Yönetim & İdari Kadro';
            }

            sections.push({
              id: `sec-${unit.id}-${cIdx}`,
              subDepartmentId: subDeptId || undefined,
              fullHeader: headerText,
              title: sectionTitle,
              contacts
            });
          }
        });

        unit.sections = sections;
      } catch (err) {
        console.warn(`Error scraping unit ${unit.name}:`, err.message);
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);

  const totalContacts = units.reduce((acc, u) => acc + u.sections.reduce((sAcc, s) => sAcc + s.contacts.length, 0), 0);
  console.log(`\nDONE! Total units: ${units.length}, Total contacts extracted: ${totalContacts}`);

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'phoneDirectoryData.ts');
  const fileContent = `/**
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

export const PHONE_DIRECTORY_DATA: DirectoryUnit[] = ${JSON.stringify(units, null, 2)};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Wrote structured dataset to: ${outputPath}`);
}

scrapeDirectory().catch(err => {
  console.error('Scrape failed:', err);
  process.exit(1);
});
