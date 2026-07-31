(() => {
  if (!window.GiuPageNative) return;

  document.documentElement.setAttribute('data-giu-app', '');
  const scriptUrl = new URL(document.currentScript.src);
  const siteRoot = new URL('../', scriptUrl);
  const iconBase = 'https://api.iconify.design/lucide';
  const definitions = [
    { id: 'cucina', name: 'Cucina', icon: 'cooking-pot', color: '#c86432' },
    { id: 'medicina', name: 'Medicina', icon: 'stethoscope', color: '#167d83' },
    { id: 'legale', name: 'Legale', icon: 'scale', color: '#4f5a9a' },
    { id: 'lavoro', name: 'Lavoro', icon: 'briefcase-business', color: '#b7791f' },
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

  function buildMenu(pages) {
    const slot = document.querySelector('[data-app-menu-slot]') || document.querySelector('.header-actions') || document.querySelector('.site-header__inner');
    if (!slot || document.querySelector('.app-menu')) return false;

    const menu = document.createElement('details');
    menu.className = 'app-menu';
    menu.innerHTML = `<summary class="icon-button" aria-label="Apri argomenti e pagine"><img src="${icon('menu', '#ffffff')}" alt=""></summary><nav class="app-menu__panel" aria-label="Argomenti e pagine"></nav>`;
    const panel = menu.querySelector('.app-menu__panel');

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

    if (slot.hasAttribute('data-app-menu-slot')) slot.replaceWith(menu);
    else slot.append(menu);

    menu.addEventListener('toggle', () => {
      if (!menu.open) closeCategories(panel);
    });

    document.addEventListener('pointerdown', event => {
      if (menu.open && !menu.contains(event.target)) closeMenu(menu);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu(menu);
    });
    return true;
  }

  fetch(new URL('catalogo.json', siteRoot), { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('catalogo')))
    .then(data => {
      const pages = Array.isArray(data.pages) ? data.pages : [];
      const install = () => {
        if (!document.querySelector('.app-menu')) buildMenu(pages);
      };
      document.addEventListener('giu:page-ready', install, { once: true });
      const usesSharedTheme = Boolean(document.querySelector('script[src*="/assets/page-theme.js"], script[src^="../assets/page-theme.js"]'));
      if (document.body.classList.contains('gp-page') || !usesSharedTheme) install();
    })
    .catch(() => {});
})();
