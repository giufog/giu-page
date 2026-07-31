(() => {
  const ICONS = 'https://api.iconify.design/lucide';
  const currentScript = document.currentScript;
  const scriptUrl = new URL(currentScript.src);
  const siteRoot = new URL('../', scriptUrl);
  const pageRoot = new URL('./', location.href);
  const canonical = document.querySelector('link[rel="canonical"]')?.href || location.href.split('#')[0].split('?')[0];
  let pageData = null;
  let activeMarks = [];

  const icon = (name, color) => `${ICONS}/${name}.svg?color=${encodeURIComponent(color)}`;

  function replaceBrandLinks() {
    document.querySelectorAll('.site-header a.brand').forEach(link => {
      const span = document.createElement('span');
      span.className = link.className;
      span.setAttribute('aria-label', 'Giu Page');
      while (link.firstChild) span.append(link.firstChild);
      link.replaceWith(span);
    });
    document.querySelectorAll('.site-header .brand__mark:not(img)').forEach(mark => {
      const image = document.createElement('img');
      image.className = 'brand__mark';
      image.src = new URL('assets/gp-icon.svg', siteRoot);
      image.alt = '';
      mark.replaceWith(image);
    });
  }

  function existingHeaderIsStandard() {
    return Boolean(document.querySelector('.site-header .site-header__inner'));
  }

  function buildHeader() {
    if (existingHeaderIsStandard()) return document.querySelector('.site-header');
    const header = document.createElement('header');
    header.className = 'site-header gp-generated-header';
    header.innerHTML = `
      <div class="site-header__inner">
        <span class="brand" aria-label="Giu Page"><img src="${new URL('assets/gp-icon.svg', siteRoot)}" alt=""><span>Giu Page</span></span>
        <div class="header-actions">
          <button class="icon-button" type="button" aria-label="Cerca nella pagina" aria-expanded="false" data-gp-search-toggle><img src="${icon('search', '#ffffff')}" alt=""></button>
          <details class="page-index-menu"><summary class="icon-button" aria-label="Indice della pagina"><img src="${icon('list', '#ffffff')}" alt=""></summary><nav class="gp-index-panel" aria-label="Indice della pagina"></nav></details>
          <span data-app-menu-slot></span>
        </div>
      </div>`;
    document.body.prepend(header);
    const oldTopbar = document.querySelector('body > .topbar');
    if (oldTopbar && oldTopbar !== header) oldTopbar.hidden = true;
    return header;
  }

  function ensureSlots(header) {
    let actions = header.querySelector('.header-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'header-actions';
      actions.innerHTML = `<button class="icon-button" type="button" aria-label="Cerca nella pagina" aria-expanded="false" data-gp-search-toggle><img src="${icon('search', '#ffffff')}" alt=""></button><details class="page-index-menu"><summary class="icon-button" aria-label="Indice della pagina"><img src="${icon('list', '#ffffff')}" alt=""></summary><nav class="gp-index-panel" aria-label="Indice della pagina"></nav></details><span data-app-menu-slot></span>`;
      header.querySelectorAll(':scope > .site-header__inner > [data-share], :scope > .site-header__inner > .share-button').forEach(button => button.remove());
      (header.querySelector('.site-header__inner') || header).append(actions);
    }
    header.querySelectorAll('details.menu').forEach(menu => menu.classList.add('page-index-menu'));
    if (!actions.querySelector('[data-app-menu-slot]') && !actions.querySelector('.app-menu')) {
      const slot = document.createElement('span');
      slot.setAttribute('data-app-menu-slot', '');
      actions.append(slot);
    }
  }

  function buildIndex() {
    const panel = document.querySelector('.gp-index-panel');
    if (!panel) return;
    const sections = [...document.querySelectorAll('main section[id]')].filter(section => section.id !== 'inizio');
    sections.slice(0, 18).forEach(section => {
      const title = section.querySelector('h2, h1, h3');
      if (!title) return;
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.textContent = title.textContent.trim();
      link.addEventListener('click', event => {
        event.preventDefault();
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${section.id}`);
        link.closest('details')?.removeAttribute('open');
      });
      panel.append(link);
    });
    document.querySelectorAll('main > nav[aria-label*="Indice"], main .internal-nav').forEach(nav => nav.classList.add('gp-inline-index'));
  }

  function addProgress(header) {
    if (header.querySelector('.gp-reading-progress')) return;
    const progress = document.createElement('div');
    progress.className = 'gp-reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<i></i>';
    header.append(progress);
    const bar = progress.firstElementChild;
    const update = () => {
      const maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      bar.style.width = `${Math.min(100, Math.max(0, scrollY / maximum * 100))}%`;
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  function clearMarks() {
    activeMarks.forEach(mark => mark.replaceWith(document.createTextNode(mark.textContent)));
    activeMarks = [];
  }

  function searchPage(value) {
    clearMarks();
    const query = value.trim();
    if (query.length < 2) return 0;
    const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const root = document.querySelector('main') || document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest('script, style, mark, button, summary') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!pattern.test(node.nodeValue)) return;
      pattern.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let last = 0;
      node.nodeValue.replace(pattern, (match, offset) => {
        fragment.append(document.createTextNode(node.nodeValue.slice(last, offset)));
        const mark = document.createElement('mark');
        mark.dataset.gpSearchMark = '';
        mark.textContent = match;
        activeMarks.push(mark);
        fragment.append(mark);
        last = offset + match.length;
        return match;
      });
      fragment.append(document.createTextNode(node.nodeValue.slice(last)));
      node.replaceWith(fragment);
    });
    activeMarks[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return activeMarks.length;
  }

  function ensureSearch(header) {
    if (header.querySelector('.page-search, .gp-search')) return;
    const panel = document.createElement('div');
    panel.className = 'gp-search';
    panel.hidden = true;
    panel.innerHTML = '<div class="gp-search__inner"><label for="gp-search-input">Cerca nella pagina</label><input id="gp-search-input" type="search" placeholder="Scrivi almeno due caratteri"><small>Scrivi almeno due caratteri.</small></div>';
    header.append(panel);
    const toggle = header.querySelector('[data-gp-search-toggle]');
    const input = panel.querySelector('input');
    const status = panel.querySelector('small');
    toggle?.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) input.focus();
      else clearMarks();
    });
    input.addEventListener('input', () => {
      const count = searchPage(input.value);
      status.textContent = input.value.trim().length < 2 ? 'Scrivi almeno due caratteri.' : `${count} ${count === 1 ? 'risultato' : 'risultati'}.`;
    });
    document.addEventListener('pointerdown', event => {
      if (!panel.hidden && !panel.contains(event.target) && !toggle?.contains(event.target)) {
        panel.hidden = true;
        toggle?.setAttribute('aria-expanded', 'false');
        clearMarks();
      }
    });
  }

  function enhanceSections() {
    document.querySelectorAll('main section').forEach(section => {
      if (!section.classList.contains('hero') && !section.closest('.hero') && section.id !== 'inizio') section.classList.add('gp-modern-section');
    });
  }

  function enhanceTables() {
    document.querySelectorAll('table').forEach(table => {
      if (table.dataset.gpEnhanced) return;
      const headers = [...table.querySelectorAll('thead th')].map(cell => cell.textContent.trim());
      const rows = [...table.querySelectorAll('tbody tr')];
      if (!headers.length || !rows.length) return;
      table.dataset.gpEnhanced = 'true';
      table.classList.add('gp-responsive-source');
      const mobile = document.createElement('div');
      mobile.className = 'gp-mobile-table';
      mobile.setAttribute('aria-label', table.getAttribute('aria-label') || 'Tabella in formato mobile');
      rows.forEach((row, rowIndex) => {
        const cells = [...row.children];
        const details = document.createElement('details');
        if (rowIndex === 0) details.open = true;
        const summary = document.createElement('summary');
        summary.innerHTML = `<span>${cells[0]?.textContent.trim() || `Riga ${rowIndex + 1}`}</span><img src="${icon('chevron-down', '#173e35')}" alt="">`;
        const body = document.createElement('div');
        body.className = 'gp-mobile-table__body';
        cells.slice(1).forEach((cell, index) => {
          const label = document.createElement('strong');
          label.textContent = headers[index + 1] || `Dato ${index + 1}`;
          const value = document.createElement('p');
          value.innerHTML = cell.innerHTML;
          body.append(label, value);
        });
        details.append(summary, body);
        details.addEventListener('toggle', () => {
          if (!details.open) return;
          mobile.querySelectorAll('details[open]').forEach(other => {
            if (other !== details) other.open = false;
          });
        });
        mobile.append(details);
      });
      table.insertAdjacentElement('afterend', mobile);
    });
  }

  function addBackToTop() {
    const existing = document.querySelector('.back-to-top');
    if (existing) {
      existing.innerHTML = `<img src="${icon('arrow-up', '#173e35')}" alt="">`;
      return;
    }
    const button = document.createElement('a');
    button.className = 'gp-back-to-top';
    button.href = '#';
    button.setAttribute('aria-label', "Torna all'inizio");
    button.innerHTML = `<img src="${icon('arrow-up', '#173e35')}" alt="">`;
    button.addEventListener('click', event => {
      event.preventDefault();
      scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', `${location.pathname}${location.search}`);
    });
    document.body.append(button);
  }

  function ensureHeroActions() {
    if (document.querySelector('[data-print]') && document.querySelector('[data-share]')) return;
    const title = document.querySelector('.hero h1, .page-header h1, header > .hero h1, main h1');
    if (!title) return;
    const host = title.closest('.hero__inner, .page-header__inner, .hero, .page-header') || title.parentElement;
    if (!host) return;
    const meta = document.createElement('p');
    meta.className = 'gp-page-meta';
    meta.textContent = pageData ? `${pageData.pageCount || 1} ${pageData.pageCount === 1 ? 'pagina' : 'pagine'}, create il ${new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${pageData.createdAt}T12:00:00`))}, e da ${pageData.readingMinutes || 1} minuti di lettura.` : 'Pagina informativa.';
    const actions = document.createElement('div');
    actions.className = 'gp-hero-actions';
    actions.innerHTML = `<button type="button" data-print><img src="${icon('printer', '#b23a3a')}" alt="">Stampa PDF</button><button type="button" data-share><img src="${icon('share-2', '#2878b8')}" alt="">Condividi</button>`;
    host.append(meta, actions);
  }

  function bindActions() {
    document.querySelectorAll('[data-print]').forEach(button => {
      if (button.dataset.gpBound) return;
      button.dataset.gpBound = 'true';
      button.addEventListener('click', () => {
        if (window.GiuPageNative?.print) window.GiuPageNative.print();
        else window.print();
      });
    });
    document.querySelectorAll('[data-share]').forEach(button => {
      if (button.dataset.gpBound) return;
      button.dataset.gpBound = 'true';
      button.addEventListener('click', async () => {
        try {
          if (navigator.share) await navigator.share({ url: canonical });
          else await navigator.clipboard.writeText(canonical);
        } catch (error) {
          if (error?.name !== 'AbortError') window.prompt('Copia questo link:', canonical);
        }
      });
    });
  }

  function closeMenus() {
    document.querySelectorAll('details[open]').forEach(details => {
      if (details.closest('.site-header')) details.removeAttribute('open');
    });
  }

  function bindGlobalDismissal() {
    document.addEventListener('pointerdown', event => {
      document.querySelectorAll('.site-header details[open]').forEach(details => {
        if (!details.contains(event.target)) details.removeAttribute('open');
      });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenus();
    });
  }

  function initialize() {
    document.body.classList.add('gp-page');
    if (pageData?.slug) document.body.dataset.gpSlug = pageData.slug;
    replaceBrandLinks();
    const header = buildHeader();
    ensureSlots(header);
    buildIndex();
    ensureSearch(header);
    addProgress(header);
    enhanceSections();
    enhanceTables();
    ensureHeroActions();
    bindActions();
    addBackToTop();
    bindGlobalDismissal();
    document.dispatchEvent(new CustomEvent('giu:page-ready'));
  }

  fetch(new URL('page.json', pageRoot), { cache: 'no-store' })
    .then(response => response.ok ? response.json() : null)
    .then(data => { pageData = data; })
    .catch(() => {})
    .finally(initialize);
})();
