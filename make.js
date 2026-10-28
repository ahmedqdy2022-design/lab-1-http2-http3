const fs = require('fs');

fs.mkdirSync('site/img', { recursive: true });
const files = fs.readdirSync('site/img').filter(f => /\.(jpe?g|png|webp)$/i.test(f));

const tpl = fs.readFileSync('template.html', 'utf8');
fs.writeFileSync('site/index.html', tpl.replace('/*FILES*/[]', JSON.stringify(files)));

console.log('Done: ' + files.length + ' images');
