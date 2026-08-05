(() => {
  const canonical = 'https://giufog.github.io/giu-page/artrosi-alle-anche/';
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  qa('[data-responsive-table]').forEach((table) => {
    const target = table.parentElement.querySelector('[data-mobile-table]');
    if (!target) return;
    const headers = qa('thead th', table).map((cell) => cell.textContent.trim());
    qa('tbody tr', table).forEach((row, index) => {
      const cells = qa('td', row).map((cell) => cell.innerHTML);
      const details = document.createElement('details');
      if (index === 0) details.open = true;
      const summary = document.createElement('summary');
      summary.innerHTML = `<span>${cells[0]}</span><span aria-hidden="true">⌄</span>`;
      const dl = document.createElement('dl');
      cells.slice(1).forEach((value, cellIndex) => {
        const wrap = document.createElement('div');
        wrap.innerHTML = `<dt>${headers[cellIndex + 1]}</dt><dd>${value}</dd>`;
        dl.appendChild(wrap);
      });
      details.append(summary, dl);
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        qa('details', target).forEach((other) => { if (other !== details) other.open = false; });
      });
      target.appendChild(details);
    });
  });

  const searchToggle = q('[data-search-toggle]');
  const searchPanel = q('#page-search');
  const searchInput = q('#page-search-input');
  const searchStatus = q('.page-search__status');
  const prevButton = q('[data-search-prev]');
  const nextButton = q('[data-search-next]');
  let hits = [];
  let current = -1;

  function clearHits() {
    qa('mark.search-hit').forEach((mark) => mark.replaceWith(document.createTextNode(mark.textContent)));
    q('main').normalize();
    hits = [];
    current = -1;
  }

  function updateSearch() {
    const term = searchInput.value.trim();
    const y = window.scrollY;
    clearHits();
    if (term.length < 2) {
      searchStatus.textContent = 'Scrivi almeno due caratteri.';
      prevButton.disabled = nextButton.disabled = true;
      return;
    }
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'gi');
    const nodes = [];
    const walker = document.createTreeWalker(q('main'), NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style, mark, summary')) return NodeFilter.FILTER_REJECT;
        return pattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      let last = 0;
      node.nodeValue.replace(pattern, (match, offset) => {
        fragment.append(node.nodeValue.slice(last, offset));
        const mark = document.createElement('mark');
        mark.className = 'search-hit';
        mark.textContent = match;
        fragment.append(mark);
        hits.push(mark);
        last = offset + match.length;
        return match;
      });
      fragment.append(node.nodeValue.slice(last));
      node.replaceWith(fragment);
    });
    searchStatus.textContent = hits.length ? `${hits.length} risultati` : 'Nessun risultato';
    prevButton.disabled = nextButton.disabled = !hits.length;
    requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'auto' }));
  }

  function goToHit(delta) {
    if (!hits.length) return;
    if (current >= 0) hits[current].classList.remove('is-current');
    current = (current + delta + hits.length) % hits.length;
    hits[current].classList.add('is-current');
    hits[current].scrollIntoView({ block: 'center', behavior: 'smooth' });
    searchStatus.textContent = `Risultato ${current + 1} di ${hits.length}`;
  }

  searchToggle.addEventListener('click', () => {
    const open = searchPanel.hidden;
    searchPanel.hidden = !open;
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) searchInput.focus(); else { searchInput.value = ''; clearHits(); }
  });
  searchInput.addEventListener('input', updateSearch);
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); goToHit(event.shiftKey ? -1 : 1); }
  });
  prevButton.addEventListener('click', () => goToHit(-1));
  nextButton.addEventListener('click', () => goToHit(1));

  document.addEventListener('pointerdown', (event) => {
    qa('details.menu[open]').forEach((menu) => { if (!menu.contains(event.target)) menu.open = false; });
    if (!searchPanel.hidden && !searchPanel.contains(event.target) && !searchToggle.contains(event.target)) {
      searchPanel.hidden = true;
      searchToggle.setAttribute('aria-expanded', 'false');
      searchInput.value = '';
      clearHits();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    qa('details.menu[open]').forEach((menu) => { menu.open = false; });
    if (!searchPanel.hidden) searchToggle.click();
  });

  qa('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
    const target = q(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', location.pathname + location.search);
    const menu = link.closest('details.menu');
    if (menu) menu.open = false;
  }));

  q('[data-share]').addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ url: canonical });
      else if (navigator.clipboard) await navigator.clipboard.writeText(canonical);
    } catch (error) {
      if (error.name !== 'AbortError') console.warn('Condivisione non disponibile', error);
    }
  });

  const sourceDetails = q('.sources');
  let sourceWasOpen = false;
  window.addEventListener('beforeprint', () => {
    sourceWasOpen = sourceDetails.open;
    sourceDetails.open = true;
  });
  q('[data-print]').addEventListener('click', () => {
    if (window.GiuPageNative?.print) window.GiuPageNative.print();
    else window.print();
  });
  window.addEventListener('afterprint', () => { sourceDetails.open = sourceWasOpen; });

  const progress = q('[data-progress]');
  const toTop = q('[data-to-top]');
  function updateScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, (scrollY / max) * 100) : 0}%`;
    toTop.classList.toggle('is-visible', scrollY > 500);
  }
  addEventListener('scroll', updateScroll, { passive: true });
  addEventListener('resize', updateScroll);
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  updateScroll();
})();
