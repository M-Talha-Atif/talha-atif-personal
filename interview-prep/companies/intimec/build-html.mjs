// Regenerates index.html from intimec-defense.md (single source of truth).
// Usage:  node build-html.mjs
// Supported markdown: # ## ### ####, paragraphs, **bold**, *italic*, `code`, tables, bullet/numbered lists (1 nesting level),
// blockquotes (callouts), fenced code, ```text diagram:NAME (replaced by an SVG from diagrams.mjs), "#### Q: ..." (collapsible answers).
import fs from 'node:fs';
import { diagrams } from './diagrams.mjs';

const here = new URL('.', import.meta.url);
const md = fs.readFileSync(new URL('intimec-defense.md', here), 'utf8').replace(/\r\n/g, '\n');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(raw) {
  const codes = [];
  let t = esc(raw).replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  t = t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  t = t.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g, '$1<i>$2</i>');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

const lines = md.split('\n');
const out = [];
let i = 0, inQA = false, qaFirst = false, title = 'Intimec Defense';

const closeQA = () => { if (inQA) { out.push('</div></details>'); inQA = false; } };

function renderList(startIdx) {
  const items = [];
  let j = startIdx;
  while (j < lines.length) {
    const m = lines[j].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (!m) break;
    const indent = m[1].length, ordered = /\d/.test(m[2]);
    if (indent >= 2 && items.length) {
      const last = items[items.length - 1];
      (last.children = last.children || { ordered, items: [] }).items.push(m[3]);
    } else items.push({ ordered, text: m[3] });
    j++;
  }
  const tag = (o) => (o ? 'ol' : 'ul');
  const html = [`<${tag(items[0].ordered)}>`];
  for (const it of items) {
    let s = `<li>${inline(it.text)}`;
    if (it.children) s += `<${tag(it.children.ordered)}>${it.children.items.map((x) => `<li>${inline(x)}</li>`).join('')}</${tag(it.children.ordered)}>`;
    html.push(s + '</li>');
  }
  html.push(`</${tag(items[0].ordered)}>`);
  return { html: html.join(''), next: j };
}

function renderTable(startIdx) {
  const rows = [];
  let j = startIdx;
  while (j < lines.length && lines[j].trim().startsWith('|')) { rows.push(lines[j].trim()); j++; }
  const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  let h = '<div class="tablewrap"><table><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr>';
  for (const r of body) h += '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
  return { html: h + '</table></div>', next: j };
}

while (i < lines.length) {
  const line = lines[i];

  // fenced code / diagram
  const fence = line.match(/^```(\S*)\s*(.*)$/);
  if (fence) {
    const lang = fence[1] || 'text', extra = fence[2] || '';
    const body = [];
    i++;
    while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
    i++;
    const dm = extra.match(/diagram:(\w+)/);
    if (dm && diagrams[dm[1]]) {
      out.push(`<figure class="diagram">${diagrams[dm[1]].svg}<figcaption>${esc(diagrams[dm[1]].caption)}</figcaption></figure>`);
    } else {
      const hl = lang === 'text' ? 'plaintext' : lang;
      out.push(`<script type="text/plain" class="code" data-lang="${hl}" data-title="${hl}">\n${body.join('\n')}\n</script>`);
    }
    continue;
  }

  const hm = line.match(/^(#{1,4})\s+(.*)$/);
  if (hm) {
    const level = hm[1].length, text = hm[2];
    if (level < 4 || !/^Q:\s/.test(text)) closeQA();
    if (level === 1) { title = text; out.push(`<h1>${inline(text)}</h1>`); }
    else if (level === 2) {
      const nm = text.match(/^(\d+)\.\s+(.*)$/);
      out.push(nm ? `<h2 id="s${nm[1]}"><span class="num">${nm[1]}</span>${inline(nm[2])}</h2>` : `<h2>${inline(text)}</h2>`);
    } else if (level === 3) out.push(`<h3>${inline(text)}</h3>`);
    else if (/^Q:\s/.test(text)) {
      closeQA();
      out.push(`<details class="acc"><summary>${inline(text.replace(/^Q:\s*/, ''))}</summary><div class="body">`);
      inQA = true; qaFirst = true;
    } else out.push(`<h4>${inline(text)}</h4>`);
    i++; continue;
  }

  if (/^---+\s*$/.test(line)) { i++; continue; }
  if (line.trim() === '') { i++; continue; }

  if (line.trim().startsWith('|') && lines[i + 1] && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1].trim())) {
    const t = renderTable(i); out.push(t.html); i = t.next; continue;
  }

  if (/^(\s*)([-*]|\d+\.)\s+/.test(line)) {
    const l = renderList(i); out.push(l.html); i = l.next; continue;
  }

  if (line.startsWith('>')) {
    const q = [];
    while (i < lines.length && lines[i].startsWith('>')) q.push(lines[i++].replace(/^>\s?/, ''));
    const text = q.join(' ').trim();
    const cls = /^"/.test(text) ? 'callout say' : /⚠/.test(text) ? 'callout warn' : 'callout';
    const label = cls === 'callout say' ? '<b class="t">Say it like this</b>' : cls === 'callout warn' ? '<b class="t">Careful</b>' : '';
    out.push(`<div class="${cls}">${label}<p>${inline(text)}</p></div>`);
    continue;
  }

  // paragraph
  const p = [];
  while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4}\s|```|\||>|---+\s*$)/.test(lines[i]) && !/^(\s*)([-*]|\d+\.)\s+/.test(lines[i])) p.push(lines[i++]);
  const prefix = inQA && qaFirst ? '<span class="lbl ans">Say</span>' : '';
  qaFirst = false;
  out.push(`<p>${prefix}${inline(p.join(' '))}</p>`);
}
closeQA();

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<script>try{var t=localStorage.getItem('ip-theme');document.documentElement.dataset.theme=t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}</script>
<link rel="stylesheet" href="../../assets/style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script defer src="../../assets/app.js"></script>
</head>
<body>
<div id="progress"></div>
<svg width="0" height="0" style="position:absolute"><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10z" style="fill:var(--muted)"/></marker></defs></svg>
<button class="btn menu-btn" id="menu-btn">☰ Menu</button>
<aside class="sidebar">
  <div class="logo">🏢 Intimec</div>
  <div class="sub">Engineering defense</div>
  <nav id="toc"></nav>
  <div class="tools"><button class="btn" id="theme-btn">🌓 Theme</button><a class="btn" href="../../index.html" style="text-decoration:none">All topics</a></div>
</aside>
<main>
${out.join('\n')}
</main>
</body>
</html>
`;
fs.writeFileSync(new URL('index.html', here), page);
console.log(`index.html written (${page.length} bytes, ${out.length} blocks)`);
