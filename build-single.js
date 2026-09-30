// Egyetlen, önálló index.html készítése a dist/ mappába (CSS, JS és kép beágyazva).
const fs = require('fs');
const path = require('path');
const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const b64 = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(root, f)).toString('base64');
const favicon = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(root, 'assets/favicon.svg')).toString('base64');

const css = read('css/style.css')
  .replace('url("../assets/img/hero-port.jpg")', () => `url("${b64('assets/img/hero-port.jpg')}")`)
  .replace('url("../assets/img/hero-left.jpg")', () => `url("${b64('assets/img/hero-left.jpg')}")`);
if (css.includes('../assets/')) throw new Error('Maradt kép-hivatkozás a CSS-ben');
const js = read('js/i18n.js') + '\n' + read('js/main.js');

let html = read('index.html')
  .replace('<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">', `<link rel="icon" href="${favicon}" type="image/svg+xml">`)
  .replace('<link rel="preload" href="assets/img/hero-port.jpg" as="image">\n', '')
  .replace('<link rel="stylesheet" href="css/style.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script src="js/i18n.js"></script>\n  <script src="js/main.js"></script>', () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`);

if (/(href|src)="(css|js|assets)\//.test(html)) throw new Error('Maradt külső hivatkozás');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
console.log('dist/index.html', Math.round(html.length / 1024) + ' KB');
