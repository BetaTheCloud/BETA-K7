const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const headClosingTagIndex = html.indexOf('</head>');

const pwaMeta = `
    <meta name="theme-color" content="#1c1917" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="K7AÜ" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
  `;

if (!html.includes('mobile-web-app-capable')) {
  html = html.slice(0, headClosingTagIndex) + pwaMeta + html.slice(headClosingTagIndex);
  fs.writeFileSync('index.html', html);
}
console.log("index.html updated with PWA meta tags");
