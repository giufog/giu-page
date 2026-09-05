(() => {
  if (!window.GiuPageNative) return;

  document.documentElement.setAttribute('data-giu-app', '');
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL('../', scriptUrl);
  const iconBase = 'https://api.iconify.design/lucide';
  const definitions = [
    { id: 'cucina', name: 'Cucina', icon: 'cooking-pot', color: '#c86432' },
    { id: 'eventi', name: 'Eventi', icon: 'calendar-days', color: '#b44672' },
    { id: 'lavoro', name: 'Lavoro', icon: 'briefcase-business', color: '#b7791f' },
    { id: 'legale', name: 'Legale', icon: 'scale', color: '#4f5a9a' },
    { id: 'medicina', name: 'Medicina', icon: 'stethoscope', color: '#167d83' },
    { id: 'varie', name: 'Varie', icon: 'layout-grid', color: '#7a5c99' }
  ];

  function icon(name, color) {
    return `${iconBase}/${name}.svg?color=${encodeURIComponent(color)}`;
  }

  function closeMenu(menu) {
    menu.removeAttribute('open');
  }

  function closeCategories(panel) {
    panel.querySelectorAll('.app-menu__toggle').forEach(button => button.setAttribute('aria-expanded', 'false'));
    panel.querySelectorAll('.app-menu__submenu').forEach(list => { list.hidden = true; });
  }

  function closeSearchPanels() {
    document.querySelectorAll('.gp-search, .page-search, .home-search').forEach(panel => {
      panel.hidden = true;
    });
    document.querySelectorAll('[data-gp-search-toggle], [data-search-toggle]').forEach(button => {
      button.setAttribute('aria-expanded', 'false');
    });
    document.dispatchEvent(new CustomEvent('giu:close-search'));
  }

  function buildMenu(catalog) {
    const slot = document.querySelector('[data-app-menu-slot]') || document.querySelector('.header-actions') || document.querySelector('.site-header__inner');
    if (!slot || document.querySelector('.app-menu')) return false;

    const menu = document.createElement('details');
    menu.className = 'app-menu';
    menu.innerHTML = `<summary class="icon-button" aria-label="Apri menu"><img src="${icon('menu', '#ffffff')}" alt=""></summary><nav class="app-menu__panel" aria-label="Navigazione e impostazioni"></nav>`;
    const panel = menu.querySelector('.app-menu__panel');

    // Reuse the native actions without introducing a second popup or toolbar.
    const native = window.GiuPageNative;
    const home = document.createElement('a');
    home.className = 'app-menu__action';
    home.href = siteRoot.href;
    home.innerHTML = `<img src="${icon('house', '#173e35')}" alt=""><span>Home</span>`;
    home.addEventListener('click', event => {
      closeMenu(menu);
      if (typeof native.goHome === 'function') {
        event.preventDefault();
        native.goHome();
      }
    });
    panel.append(home);

    if (typeof native.openSettings === 'function') {
      const settings = document.createElement('section');
      settings.className = 'app-menu__category';
      settings.innerHTML = `<button class="app-menu__toggle" type="button" aria-expanded="false" aria-controls="app-settings"><span class="app-menu__main"><img src="${icon('settings', '#173e35')}" alt=""><span class="app-menu__name">Impostazioni</span><span></span><img class="app-menu__chevron" src="${icon('chevron-right', '#173e35')}" alt=""></span></button><div class="app-menu__submenu" id="app-settings" hidden></div>`;
      const toggle = settings.querySelector('button');
      const submenu = settings.querySelector('.app-menu__submenu');
      [['Ricarica', 'reloadPage'], ['Apri nel browser', 'openInBrowser'], ['Indirizzo iniziale', 'openSettings']].forEach(([label, method]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.addEventListener('click', () => {
          closeMenu(menu);
          native[method]();
        });
        submenu.append(button);
      });
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        closeCategories(panel);
        toggle.setAttribute('aria-expanded', String(!open));
        submenu.hidden = open;
      });
      panel.append(settings);
    }

    const status = document.createElement('p');
    status.className = 'app-menu__status';
    status.setAttribute('role', 'status');
    status.textContent = 'Caricamento argomenti…';
    panel.append(status);
    catalog.then(pages => {
    status.remove();

    definitions.forEach(category => {
      const categoryPages = pages.filter(page => page.listed !== false && (page.category || 'varie') === category.id);
      const item = document.createElement('section');
      item.className = 'app-menu__category';
      item.style.setProperty('--category', category.color);
      item.innerHTML = `
        <button class="app-menu__toggle" type="button" aria-expanded="false">
          <span class="app-menu__main"><img src="${icon(category.icon, category.color)}" alt=""><span class="app-menu__name">${category.name}</span><span class="app-menu__count">${categoryPages.length} ${categoryPages.length === 1 ? 'pagina' : 'pagine'}</span><img class="app-menu__chevron" src="${icon('chevron-right', category.color)}" alt=""></span>
        </button>
        <div class="app-menu__submenu" hidden></div>`;
      const toggle = item.querySelector('.app-menu__toggle');
      const submenu = item.querySelector('.app-menu__submenu');
      categoryPages.forEach(page => {
        const link = document.createElement('a');
        link.href = page.url;
        link.textContent = page.title;
        submenu.append(link);
      });
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        closeCategories(panel);
        if (!open) {
          toggle.setAttribute('aria-expanded', 'true');
          submenu.hidden = false;
        }
      });
      panel.append(item);
    });
    }).catch(() => {
      status.textContent = 'Argomenti non disponibili. Usa Ricarica per riprovare.';
    });

    if (slot.hasAttribute('data-app-menu-slot')) slot.replaceWith(menu);
    else slot.append(menu);

    menu.addEventListener('toggle', () => {
      if (menu.open) closeSearchPanels();
      else closeCategories(panel);
    });

    document.addEventListener('click', event => {
      if (!event.target.closest('[data-gp-search-toggle], [data-search-toggle]')) return;
      closeMenu(menu);
      closeCategories(panel);
    });

    document.addEventListener('pointerdown', event => {
      if (menu.open && !menu.contains(event.target)) closeMenu(menu);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu(menu);
    });
    return true;
  }

  const catalog = fetch(new URL('catalogo.json', siteRoot), { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('catalogo')))
    .then(data => Array.isArray(data.pages) ? data.pages : []);
  // Home and settings remain available even if the catalog cannot be downloaded.
  catalog.catch(() => {});
  const install = () => buildMenu(catalog);
  document.addEventListener('giu:page-ready', install);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
