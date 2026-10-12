/* Interview-prep shared behaviour. Works from file:// (no fetch, no build step).
   Pages provide optional globals:  window.BUGS = [{n,cat,title,why,fix}]   window.QA = [{cat,q,a}]
   Containers (optional):  #bugs-list  #qa-list
   Code blocks: <script type="text/plain" class="code" data-lang="yaml" data-title="compose.yaml">...</script>  */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // tiny inline formatter for data strings: `code` and **bold**
  const fmt = (s) => esc(String(s)).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const PAGE = location.pathname;

  /* theme */
  const root = document.documentElement;
  root.dataset.theme = store.get('ip-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function setupTools() {
    const b = $('#theme-btn');
    if (b) b.onclick = () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; store.set('ip-theme', root.dataset.theme); };
    const m = $('#menu-btn'), sb = $('.sidebar');
    if (m && sb) { m.onclick = () => sb.classList.toggle('open'); sb.addEventListener('click', (e) => { if (e.target.tagName === 'A') sb.classList.remove('open'); }); }
  }

  /* code blocks */
  function renderCode() {
    $$('script.code').forEach((s) => {
      const lang = s.dataset.lang || 'plaintext';
      const title = s.dataset.title || lang;
      const text = s.textContent.replace(/^\n/, '').replace(/\s+$/, '');
      const wrap = document.createElement('div');
      wrap.className = 'codeblock';
      wrap.innerHTML = `<div class="bar"><span>${esc(title)}</span><button type="button">Copy</button></div><pre><code class="language-${lang}">${esc(text)}</code></pre>`;
      wrap.querySelector('button').onclick = (e) => {
        navigator.clipboard?.writeText(text).then(() => { e.target.textContent = 'Copied ✓'; setTimeout(() => (e.target.textContent = 'Copy'), 1400); });
      };
      s.replaceWith(wrap);
    });
    if (window.hljs) $$('.codeblock code').forEach((c) => { try { hljs.highlightElement(c); } catch {} });
  }

  /* bugs */
  function renderBugs() {
    const host = $('#bugs-list'); if (!host || !window.BUGS) return;
    const cats = [...new Set(BUGS.map((b) => b.cat))];
    host.innerHTML = `<div class="filters"><input id="bug-q" type="search" placeholder="Search symptoms, e.g. ECONNREFUSED, 137, volume…">${
      ['All', ...cats].map((c, i) => `<button class="chip ${i ? '' : 'on'}" data-c="${esc(c)}">${esc(c)}</button>`).join('')
    }<button class="btn" id="bug-toggle">Expand all</button></div><div id="bug-items"></div><p class="small" id="bug-count"></p>`;
    const items = $('#bug-items', host);
    items.innerHTML = BUGS.map((b) => `<details class="acc bug" data-cat="${esc(b.cat)}"><summary><span class="numtag">#${b.n}</span><span>${fmt(b.title)}</span></summary><div class="body"><p><span class="lbl why">Why</span>${fmt(b.why)}</p><p><span class="lbl fix">Fix</span>${fmt(b.fix)}</p></div></details>`).join('');
    let cat = 'All';
    const apply = () => {
      const q = $('#bug-q').value.toLowerCase(); let n = 0;
      $$('.bug', items).forEach((d) => {
        const ok = (cat === 'All' || d.dataset.cat === cat) && (!q || d.textContent.toLowerCase().includes(q));
        d.classList.toggle('hidden', !ok); if (ok) n++;
      });
      $('#bug-count').textContent = `${n} of ${BUGS.length} shown`;
    };
    $('#bug-q').oninput = apply;
    $$('.chip', host).forEach((c) => (c.onclick = () => { $$('.chip', host).forEach((x) => x.classList.remove('on')); c.classList.add('on'); cat = c.dataset.c; apply(); }));
    let open = false;
    $('#bug-toggle').onclick = (e) => { open = !open; $$('.bug', items).forEach((d) => (d.open = open)); e.target.textContent = open ? 'Collapse all' : 'Expand all'; };
    apply();
  }

  /* Q&A */
  function renderQA() {
    const host = $('#qa-list'); if (!host || !window.QA) return;
    let html = '<div class="filters"><button class="btn" id="qa-toggle">Show all answers</button><button class="btn" id="qa-shuffle">🎲 Random question</button></div>', last = '';
    QA.forEach((x, i) => {
      if (x.cat !== last) { html += `<div class="qagroup">${esc(x.cat)}</div>`; last = x.cat; }
      html += `<details class="acc qa" id="qa${i}"><summary>${fmt(x.q)}</summary><div class="body"><span class="lbl ans">Say</span>${fmt(x.a)}</div></details>`;
    });
    host.innerHTML = html;
    let open = false;
    $('#qa-toggle').onclick = (e) => { open = !open; $$('.qa', host).forEach((d) => (d.open = open)); e.target.textContent = open ? 'Hide all answers' : 'Show all answers'; };
    $('#qa-shuffle').onclick = () => { $$('.qa', host).forEach((d) => (d.open = false)); const d = $('#qa' + Math.floor(Math.random() * QA.length), host); d.scrollIntoView({ block: 'center' }); };
  }

  /* checklists persist per page */
  function setupChecklists() {
    $$('ul.checklist').forEach((ul, g) => {
      $$('li', ul).forEach((li, i) => {
        const key = `ip-chk:${PAGE}:${g}:${i}`;
        const text = li.innerHTML;
        li.innerHTML = `<input type="checkbox"><span>${text}</span>`;
        const cb = li.firstChild;
        cb.checked = store.get(key) === '1'; li.classList.toggle('done', cb.checked);
        cb.onchange = () => { store.set(key, cb.checked ? '1' : '0'); li.classList.toggle('done', cb.checked); };
      });
    });
  }

  /* sidebar TOC from h2[id] + scrollspy + progress bar */
  function setupToc() {
    const nav = $('#toc'); if (!nav) return;
    const secs = $$('main h2[id]');
    nav.innerHTML = secs.map((h) => `<a href="#${h.id}">${h.innerHTML}</a>`).join('');
    const links = $$('a', nav);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)); }
    }), { rootMargin: '-20% 0px -70% 0px' });
    secs.forEach((h) => io.observe(h));
    const bar = $('#progress');
    addEventListener('scroll', () => { const h = document.documentElement; bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + '%'; }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupTools(); renderCode(); renderBugs(); renderQA(); setupChecklists(); setupToc();
  });
})();
