import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

async function scrapeCourses() {
  try {
    const res = await axios.get('https://obs.kilis.edu.tr/oibs/bologna/progCourses.aspx?lang=tr&curSunit=10459', { httpsAgent: agent });
    const $ = cheerio.load(res.data);
    const courses = [];
    
    let currentSemester = 1;
    
    $('tr').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('Yarıyıl Ders Planı')) {
             const m = text.match(/(\d+)\.\s*Yarıyıl/i);
             if (m) {
                 currentSemester = parseInt(m[1], 10);
             }
        }
        
        // Find links that might contain course code
        const codeLink = $(el).find('a[id*="btnDersKod_"]');
        if (codeLink.length > 0) {
            const code = codeLink.text().trim();
            const idNum = codeLink.attr('id').split('_').pop();
            
            const name = $(el).find(`span[id*="lblDersAd_"]`).text().trim();
            const ects = $(el).find(`span[id*="lblAKTS_"]`).text().trim();
            const type = $(el).find(`span[id*="Label5_"]`).text().trim();
            const creditStr = $(el).find(`span[id*="Label3_"]`).text().trim();
            
            courses.push({
               id: `crs-${idNum}`,
               code: code,
               name: name,
               semester: currentSemester,
               ects: parseInt(ects, 10) || 0,
               credit: creditStr,
               type: type,
               language: 'Türkçe',
               description: 'Ders içeriği Bologna sisteminden alınmıştır.'
            });
        }
    });
    
    console.log(`Found ${courses.length} courses.`);
    console.log(JSON.stringify(courses.slice(0, 5), null, 2));
    
  } catch (err) {
    console.error(err.message);
  }
}
scrapeCourses();
