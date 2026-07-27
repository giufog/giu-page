const catalog = document.querySelector('#catalog');
const empty = document.querySelector('#empty');
const count = document.querySelector('#count');
const search = document.querySelector('#search');
const searchToggle = document.querySelector('[data-search-toggle]');
const searchPanel = document.querySelector('#home-search');
const pageMenu = document.querySelector('#page-menu');
const template = document.querySelector('#card-template');
let pages = [];

function normalize(value) {
  return String(value || '').toLocaleLowerCase('it');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(date);
}

function insertionDate(page) {
  return String(page.createdAt || page.updatedAt || '');
}

async function sharePage(page) {
  const shareUrl = page.shareUrl || page.url;
  if (navigator.share) {
    await navigator.share({ url: shareUrl });
    return;
  }
  await navigator.clipboard.writeText(shareUrl);
  window.alert('Link copiato negli appunti.');
}

function closeSearch() {
  searchPanel.hidden = true;
  searchToggle.setAttribute('aria-expanded', 'false');
}

searchToggle.addEventListener('click', () => {
  const open = searchPanel.hidden;
  searchPanel.hidden = !open;
  searchToggle.setAttribute('aria-expanded', String(open));
  document.querySelectorAll('details.menu[open]').forEach(menu => menu.removeAttribute('open'));
  if (open) search.focus();
});

document.addEventListener('click', event => {
  document.querySelectorAll('details.menu[open]').forEach(menu => {
    if (!menu.contains(event.target)) menu.removeAttribute('open');
  });
  if (!searchPanel.hidden && !searchPanel.contains(event.target) && !searchToggle.contains(event.target)) {
    closeSearch();
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('details.menu[open]').forEach(menu => menu.removeAttribute('open'));
  if (!searchPanel.hidden) closeSearch();
});

function renderMenu() {
  pageMenu.replaceChildren();
  for (const page of pages.filter(page => page.listed !== false).sort((a, b) => insertionDate(b).localeCompare(insertionDate(a)))) {
    const link = document.createElement('a');
    link.href = page.url;
    link.textContent = page.title;
    pageMenu.append(link);
  }
}

function render() {
  const query = normalize(search.value.trim());
  const visible = pages
    .filter(page => page.listed !== false)
    .filter(page => normalize([page.title, page.description, ...(page.tags || [])].join(' ')).includes(query))
    .sort((a, b) => insertionDate(b).localeCompare(insertionDate(a)));

  catalog.replaceChildren();
  empty.hidden = visible.length !== 0;
  count.textContent = `${visible.length} ${visible.length === 1 ? 'pagina' : 'pagine'}`;

  for (const page of visible) {
    const card = template.content.cloneNode(true);
    const link = card.querySelector('.card__link');
    const media = card.querySelector('.card__media');
    const image = media.querySelector('img');
    link.href = page.url;
    card.querySelector('.card__date').textContent = formatDate(insertionDate(page));
    card.querySelector('.card__title').textContent = page.title;
    card.querySelector('.card__description').textContent = page.description || '';
    if (page.coverImageUrl) {
      media.hidden = false;
      image.src = page.coverImageUrl;
      image.alt = `Copertina di ${page.title}`;
    }
    card.querySelector('.share').addEventListener('click', () => {
      sharePage(page).catch(() => window.prompt('Copia questo link:', page.shareUrl || page.url));
    });
    catalog.append(card);
  }
}

fetch('./catalogo.json', { cache: 'no-store' })
  .then(response => {
    if (!response.ok) throw new Error(`Catalogo non disponibile: ${response.status}`);
    return response.json();
  })
  .then(data => {
    pages = Array.isArray(data.pages) ? data.pages : [];
    renderMenu();
    render();
  })
  .catch(error => {
    empty.hidden = false;
    empty.querySelector('h1').textContent = 'Catalogo non disponibile';
    empty.querySelector('p').textContent = error.message;
    count.textContent = '';
  });

search.addEventListener('input', render);

let viewportRefreshFrame = 0;

function refreshCatalogAfterResize() {
  window.cancelAnimationFrame(viewportRefreshFrame);
  viewportRefreshFrame = window.requestAnimationFrame(() => {
    if (pages.length) render();
  });
}

window.addEventListener('resize', refreshCatalogAfterResize);
window.visualViewport?.addEventListener('resize', refreshCatalogAfterResize);
