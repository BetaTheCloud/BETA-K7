import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

async function getCourseTargets() {
  const url = 'https://obs.kilis.edu.tr/oibs/bologna/progCourses.aspx?lang=tr&curSunit=10459';
  const res = await axios.get(url, { httpsAgent: agent });
  const $ = cheerio.load(res.data);
  const courses = [];
  
  $('tr').each((i, el) => {
      const detailBtn = $(el).find('a[id*="btnDersAyrinti_"]');
      if (detailBtn.length > 0) {
          const href = detailBtn.attr('href');
          const m = href.match(/__doPostBack\('([^']*)'/);
          if (m) {
             courses.push(m[1]);
          }
      }
  });
  console.log(courses.slice(0, 5));
}
getCourseTargets();
