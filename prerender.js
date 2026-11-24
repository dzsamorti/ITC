// A magyar szövegeket beírja az index.html-be, hogy a Google JavaScript nélkül is lássa őket.
// A js/i18n.js szerkesztése után futtasd újra:  node prerender.js
// (A böngészőben a main.js ugyanezeket a szövegeket írja be, így a látvány nem változik.)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8'), ctx);
const HU = ctx.window.ITC_I18N.hu;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
const get = (key) => {
  if (!(key in HU)) throw new Error('Hiányzó kulcs: ' + key);
  return HU[key];
};

const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');

// Egy elem tartalmának cseréje: <tag ... data-x="kulcs" ...>RÉGI</tag>
function fill(attr, render) {
  const re = new RegExp(`<([a-z0-9]+)((?:\\s[^>]*)?\\s${attr}="([^"]+)"[^>]*)>([\\s\\S]*?)</\\1>`, 'g');
  html = html.replace(re, (m, tag, attrs, key, inner) => {
    if (new RegExp(`<${tag}[\\s>]`).test(inner)) throw new Error(`Beágyazott <${tag}> a(z) ${key} elemben`);
    return `<${tag}${attrs}>${render(get(key))}</${tag}>`;
  });
}

fill('data-i18n', (v) => esc(v));
fill('data-i18n-html', (v) => v);
fill('data-i18n-list', (v) => v.map((i) => `<li>${esc(i)}</li>`).join(''));
fill('data-i18n-tags', (v) => v.map((t) => `<span class="tag">${esc(t)}</span>`)
  .join('<span class="sep" aria-hidden="true">|</span>​'));

// Attribútumok (aria-label, placeholder stb.)
html = html.replace(/(<[^>]*\sdata-i18n-attr="([^"]+)"[^>]*>)/g, (m, tagText, spec) => {
  let out = tagText;
  spec.split(';').forEach((pair) => {
    const [name, key] = pair.split(':');
    const val = escAttr(get(key));
    const attrRe = new RegExp(`\\s${name}="[^"]*"`);
    out = attrRe.test(out) ? out.replace(attrRe, ` ${name}="${val}"`) : out.replace(/\s*(\/?)>$/, ` ${name}="${val}"$1>`);
  });
  return out;
});

// Cím és leírás
html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(get('meta.title'))}</title>`)
  .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escAttr(get('meta.description'))}$2`);

fs.writeFileSync(file, html);
console.log('index.html frissítve,', Math.round(html.length / 1024) + ' KB');
