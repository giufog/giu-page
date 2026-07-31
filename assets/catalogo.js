const CATEGORY_DEFINITIONS = [
  { id: 'cucina', name: 'Cucina', icon: 'cooking-pot', color: '#c86432', description: 'Ricette, ingredienti e preparazioni da ritrovare con facilità.' },
  { id: 'medicina', name: 'Medicina', icon: 'stethoscope', color: '#167d83', description: 'Salute, prevenzione e confronti informativi organizzati per tema.' },
  { id: 'legale', name: 'Legale', icon: 'scale', color: '#4f5a9a', description: 'Documenti, quesiti e riferimenti giuridici raccolti in un unico spazio.' },
  { id: 'lavoro', name: 'Lavoro', icon: 'briefcase-business', color: '#b7791f', description: 'Attività, strumenti e documenti operativi per progetti professionali.' },
  { id: 'varie', name: 'Varie', icon: 'layout-grid', color: '#7a5c99', description: 'Contenuti trasversali che non appartengono a una sezione specifica.' }
];

const elements = {
  home: document.querySelector('[data-home]'),
  topic: document.querySelector('[data-topic]'),
  categoryGrid: document.querySelector('[data-category-grid]'),
  pageGrid: document.querySelector('[data-page-grid]'),
  topicTitle: document.querySelector('[data-topic-title]'),
  topicDescription: document.querySelector('[data-topic-description]'),
  topicCount: document.querySelector('[data-topic-count]'),
  topicEmpty: document.querySelector('[data-topic-empty]'),
  catalogEmpty: document.querySelector('[data-catalog-empty]'),
  searchPanel: document.querySelector('#home-search'),
  searchToggle: document.querySelector('[data-search-toggle]'),
  searchInput: document.querySelector('#search'),
  searchLabel: document.querySelector('[data-search-label]'),
  toast: document.querySelector('.toast')
};

let pages = [];
let activeCategory = null;
let toastTimer = 0;

function normalize(value) {
  return String(value || '').toLocaleLowerCase('it');
}

function iconUrl(name, color) {
  return `https://api.iconify.design/lucide/${name}.svg?color=${encodeURIComponent(color)}`;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(date);
}

function listedPages() {
  return pages.filter(page => page.listed !== false);
}

function pagesFor(categoryId) {
  return listedPages()
    .filter(page => (page.category || 'varie') === categoryId)
    .sort((a, b) => String(b.createdAt || b.updatedAt || '').localeCompare(String(a.createdAt || a.updatedAt || '')));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 2400);
}

async function sharePage(page) {
  const url = page.shareUrl || page.url;
  if (navigator.share) {
    await navigator.share({ url });
    return;
  }
  await navigator.clipboard.writeText(url);
  showToast('Link copiato.');
}

function categoryCard(category) {
  const categoryPages = pagesFor(category.id);
  const button = document.createElement('button');
  button.className = 'category-card';
  button.type = 'button';
  button.style.setProperty('--category', category.color);
  button.setAttribute('aria-label', `Apri ${category.name}, ${categoryPages.length} ${categoryPages.length === 1 ? 'pagina' : 'pagine'}`);
  button.innerHTML = `
    <span class="category-icon"><img src="${iconUrl(category.icon, category.color)}" alt=""></span>
    <span><h2>${category.name}</h2></span>
    <p>${category.description}</p>
    <span class="category-meta"><span class="category-count">${categoryPages.length} ${categoryPages.length === 1 ? 'pagina' : 'pagine'}</span><img class="category-arrow" src="${iconUrl('arrow-right', category.color)}" alt=""></span>`;
  button.addEventListener('click', () => showCategory(category));
  return button;
}

function renderCategories(query = '') {
  const value = normalize(query.trim());
  elements.categoryGrid.replaceChildren();
  for (const category of CATEGORY_DEFINITIONS) {
    const text = `${category.name} ${category.description} ${pagesFor(category.id).map(page => `${page.title} ${page.description} ${(page.tags || []).join(' ')}`).join(' ')}`;
    if (!value || normalize(text).includes(value)) elements.categoryGrid.append(categoryCard(category));
  }
}

function pageCard(page) {
  const article = document.createElement('article');
  article.className = 'page-card';
  article.innerHTML = `
    <div class="page-cover"><img src="${page.coverImageUrl || './assets/gp-icon.svg'}" alt="Copertina di ${page.title}" loading="lazy"></div>
    <div class="page-body">
      <time datetime="${page.createdAt || ''}">${formatDate(page.createdAt || page.updatedAt)}</time>
      <h2>${page.title}</h2>
      <p>${page.description || ''}</p>
      <div class="page-actions">
        <a href="${page.url}">Apri pagina</a>
        <button class="share-button" type="button"><img src="${iconUrl('share-2', '#2878b8')}" alt=""><span>Condividi</span></button>
      </div>
    </div>`;
  article.querySelector('.share-button').addEventListener('click', () => {
    sharePage(page).catch(error => {
      if (error?.name !== 'AbortError') showToast('Condivisione non disponibile.');
    });
  });
  return article;
}

function renderPages(query = '') {
  if (!activeCategory) return;
  const value = normalize(query.trim());
  const visible = pagesFor(activeCategory.id).filter(page => !value || normalize(`${page.title} ${page.description} ${(page.tags || []).join(' ')}`).includes(value));
  elements.pageGrid.replaceChildren();
  visible.forEach(page => elements.pageGrid.append(pageCard(page)));
  elements.topicCount.textContent = `${visible.length} ${visible.length === 1 ? 'pagina' : 'pagine'}`;
  elements.topicEmpty.hidden = visible.length !== 0;
}

function closeSearch() {
  elements.searchPanel.hidden = true;
  elements.searchToggle.setAttribute('aria-expanded', 'false');
}

function showCategory(category) {
  activeCategory = category;
  elements.home.hidden = true;
  elements.topic.hidden = false;
  elements.topicTitle.textContent = category.name;
  elements.topicTitle.style.color = category.color;
  elements.topicDescription.textContent = category.description;
  elements.searchInput.value = '';
  elements.searchLabel.textContent = `Cerca in ${category.name}`;
  renderPages();
  history.replaceState(null, '', `#${category.id}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHome() {
  activeCategory = null;
  elements.home.hidden = false;
  elements.topic.hidden = true;
  elements.searchInput.value = '';
  elements.searchLabel.textContent = 'Cerca titolo o argomento';
  renderCategories();
  history.replaceState(null, '', `${location.pathname}${location.search}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

elements.searchToggle.addEventListener('click', () => {
  const open = elements.searchPanel.hidden;
  elements.searchPanel.hidden = !open;
  elements.searchToggle.setAttribute('aria-expanded', String(open));
  document.querySelectorAll('details[open]').forEach(details => details.removeAttribute('open'));
  if (open) elements.searchInput.focus();
});

elements.searchInput.addEventListener('input', () => {
  if (activeCategory) renderPages(elements.searchInput.value);
  else renderCategories(elements.searchInput.value);
});

document.querySelector('[data-back]').addEventListener('click', showHome);

document.addEventListener('pointerdown', event => {
  if (!elements.searchPanel.hidden && !elements.searchPanel.contains(event.target) && !elements.searchToggle.contains(event.target)) closeSearch();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeSearch();
});

fetch('./catalogo.json', { cache: 'no-store' })
  .then(response => {
    if (!response.ok) throw new Error(`Catalogo non disponibile: ${response.status}`);
    return response.json();
  })
  .then(data => {
    pages = Array.isArray(data.pages) ? data.pages : [];
    renderCategories();
    const requestedCategory = CATEGORY_DEFINITIONS.find(category => `#${category.id}` === location.hash);
    if (requestedCategory) showCategory(requestedCategory);
    document.dispatchEvent(new CustomEvent('giu:catalog-ready', { detail: { pages, categories: CATEGORY_DEFINITIONS } }));
  })
  .catch(error => {
    elements.home.hidden = true;
    elements.catalogEmpty.hidden = false;
    elements.catalogEmpty.querySelector('p').textContent = error.message;
  });
