import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import qs from 'qs';

const agent = new https.Agent({ rejectUnauthorized: false });

async function getCourseDetail() {
  const url = 'https://obs.kilis.edu.tr/oibs/bologna/progCourses.aspx?lang=tr&curSunit=10459';
  
  // 1. GET
  const getRes = await axios.get(url, { httpsAgent: agent });
  const $1 = cheerio.load(getRes.data);
  const viewstate = $1('#__VIEWSTATE').val();
  const viewstategenerator = $1('#__VIEWSTATEGENERATOR').val();
  const eventvalidation = $1('#__EVENTVALIDATION').val();

  // 2. POST
  const postData = {
    __EVENTTARGET: 'grdBolognaDersler$ctl05$btnDersAyrinti',
    __EVENTARGUMENT: '',
    __VIEWSTATE: viewstate,
    __VIEWSTATEGENERATOR: viewstategenerator,
    __EVENTVALIDATION: eventvalidation
  };

  const postRes = await axios.post(url, qs.stringify(postData), {
    httpsAgent: agent,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': url
    }
  });

  const $2 = cheerio.load(postRes.data);
  console.log("Title found:", $2('title').text());
  
  // Let's find some elements that look like topics or outcomes
  // Try to grab all tables or divs
  const texts = [];
  $2('table').each((i, tbl) => {
     texts.push(`Table ${i}: ` + $2(tbl).text().substring(0, 100).replace(/\s+/g, ' '));
  });
  console.log(texts);
}
getCourseDetail();
