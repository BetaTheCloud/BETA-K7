import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

async function scrapeFaculties() {
  try {
    const res = await axios.get('https://obs.kilis.edu.tr/oibs/bologna/unitSelection.aspx?type=lis&lang=tr', { httpsAgent: agent });
    const $ = cheerio.load(res.data);
    const faculties = [];
    
    // Elements like <a data-bs-toggle="collapse" href="#x12">İLAHİYAT FAKÜLTESİ</a>
    $('a[data-bs-toggle="collapse"]').each((i, el) => {
      const facName = $(el).text().trim();
      const targetId = $(el).attr('href'); // e.g., #x12
      
      const departments = [];
      // The departments are usually in list-group-items under the target id? No, in ASP.NET accordions they are usually adjacent or in a div with that id.
      // Let's find the div with id = targetId
      const collapseDiv = $(targetId);
      if (collapseDiv.length) {
         collapseDiv.find('.list-group-item a').each((j, depEl) => {
             const depName = $(depEl).text().trim();
             const depHref = $(depEl).attr('href'); // index.aspx?lang=tr&curOp=showPac&curUnit=12&curSunit=10459
             departments.push({ name: depName, href: depHref });
         });
      } else {
         // Maybe it's just following elements
         let nextEl = $(el).next();
         while(nextEl.length && !nextEl.is('a[data-bs-toggle="collapse"]')) {
             if (nextEl.hasClass('list-group-item')) {
                 const depEl = nextEl.find('a');
                 const depName = depEl.text().trim();
                 const depHref = depEl.attr('href');
                 departments.push({ name: depName, href: depHref });
             }
             nextEl = nextEl.next();
         }
      }
      faculties.push({ name: facName, targetId, departments });
    });
    
    console.log(JSON.stringify(faculties, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
scrapeFaculties();
