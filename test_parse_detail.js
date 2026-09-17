import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import qs from 'qs';

const agent = new https.Agent({ rejectUnauthorized: false });

async function getCourseDetail() {
  const url = 'https://obs.kilis.edu.tr/oibs/bologna/progCourses.aspx?lang=tr&curSunit=10459';
  
  const getRes = await axios.get(url, { httpsAgent: agent });
  const $1 = cheerio.load(getRes.data);
  const viewstate = $1('#__VIEWSTATE').val();
  const viewstategenerator = $1('#__VIEWSTATEGENERATOR').val();
  const eventvalidation = $1('#__EVENTVALIDATION').val();

  const postData = {
    __EVENTTARGET: 'grdBolognaDersler$ctl05$btnDersAyrinti',
    __EVENTARGUMENT: '',
    __VIEWSTATE: viewstate,
    __VIEWSTATEGENERATOR: viewstategenerator,
    __EVENTVALIDATION: eventvalidation
  };

  const postRes = await axios.post(url, qs.stringify(postData), {
    httpsAgent: agent,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const $ = cheerio.load(postRes.data);
  
  const outcomes = [];
  const weeklyTopics = [];
  let description = "Ders içeriği Bologna sisteminden alınmıştır.";
  
  // Tables:
  // Usually the table with "Hafta Konu" is the weekly topics.
  $('table').each((i, tbl) => {
     const text = $(tbl).text().trim();
     if (text.includes('Sıra No') && text.includes('Açıklama') && !text.includes('Hafta')) {
         // Learning outcomes table
         $(tbl).find('tr').each((j, tr) => {
             const tds = $(tr).find('td');
             if (tds.length >= 2) {
                 const num = $(tds[0]).text().trim();
                 const desc = $(tds[1]).text().trim();
                 if (num && !isNaN(num)) {
                     outcomes.push(desc);
                 }
             }
         });
     }
     
     if (text.includes('Hafta') && text.includes('Konu') && text.includes('Ön Hazırlık')) {
         // Weekly topics
         $(tbl).find('tr').each((j, tr) => {
             const tds = $(tr).find('td');
             if (tds.length >= 2) {
                 const week = $(tds[0]).text().trim();
                 const topic = $(tds[1]).text().trim();
                 if (week && !isNaN(week)) {
                     weeklyTopics.push({ week: parseInt(week, 10), topic });
                 }
             }
         });
     }
  });

  console.log("Outcomes:", outcomes);
  console.log("Weekly Topics:", weeklyTopics);
}
getCourseDetail();
