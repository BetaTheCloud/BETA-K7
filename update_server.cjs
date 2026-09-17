const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const bolognaRoutes = `
let cachedFaculties = null;
let cachedFacultiesTime = 0;
const CACHE_FAC_TTL = 3600 * 1000; // 1 hour

app.get('/api/bologna/faculties', async (req, res) => {
  try {
    if (Date.now() - cachedFacultiesTime < CACHE_FAC_TTL && cachedFaculties) {
      return res.json(cachedFaculties);
    }
    
    const response = await axiosInstance.get('https://obs.kilis.edu.tr/oibs/bologna/unitSelection.aspx?type=lis&lang=tr');
    const $ = cheerio.load(response.data);
    const faculties = [];
    
    $('a[data-bs-toggle="collapse"]').each((i, el) => {
      const facName = $(el).text().trim();
      const targetId = $(el).attr('href'); 
      
      const departments = [];
      const collapseDiv = $(targetId);
      if (collapseDiv.length) {
         collapseDiv.find('.list-group-item a').each((j, depEl) => {
             const depName = $(depEl).text().trim();
             const depHref = $(depEl).attr('href');
             const m = depHref.match(/curSunit=(\\d+)/);
             if (m) {
                 departments.push({ id: \`dep-\${m[1]}\`, name: depName, href: depHref, sUnitId: m[1] });
             }
         });
      }
      
      if (departments.length > 0) {
        faculties.push({ id: \`fac-\${i}\`, name: facName, departments });
      }
    });
    
    cachedFaculties = faculties;
    cachedFacultiesTime = Date.now();
    res.json(faculties);
  } catch (error) {
    console.error("Faculties fetch error", error);
    res.status(500).json({ error: 'Failed to fetch faculties' });
  }
});

app.get('/api/bologna/courses', async (req, res) => {
  try {
    const sUnitId = req.query.sunit;
    if (!sUnitId) {
       return res.status(400).json({ error: 'sunit parameter is required' });
    }
    
    const response = await axiosInstance.get(\`https://obs.kilis.edu.tr/oibs/bologna/progCourses.aspx?lang=tr&curSunit=\${sUnitId}\`);
    const $ = cheerio.load(response.data);
    const courses = [];
    let currentSemester = 1;
    
    $('tr').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('Yarıyıl Ders Planı')) {
             const m = text.match(/(\\d+)\\.\\s*Yarıyıl/i);
             if (m) currentSemester = parseInt(m[1], 10);
        }
        
        const codeLink = $(el).find('a[id*="btnDersKod_"]');
        if (codeLink.length > 0) {
            const code = codeLink.text().trim();
            const idNum = codeLink.attr('id').split('_').pop();
            
            const name = $(el).find(\`span[id*="lblDersAd_"]\`).text().trim();
            const ects = $(el).find(\`span[id*="lblAKTS_"]\`).text().trim();
            const type = $(el).find(\`span[id*="Label5_"]\`).text().trim();
            const creditStr = $(el).find(\`span[id*="Label3_"]\`).text().trim();
            
            courses.push({
               id: \`crs-\${idNum}\`,
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
    
    res.json(courses);
  } catch (error) {
    console.error("Courses fetch error", error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});
`;

serverCode = serverCode.replace("app.get('/api/announcements'", bolognaRoutes + "\napp.get('/api/announcements'");
fs.writeFileSync('server.ts', serverCode);
console.log("Updated server.ts successfully");
