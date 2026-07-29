const toast = document.querySelector('.toast');
let toastTimer;
const pageCounter = document.querySelector('[data-page-counter]');
const backToTop = document.querySelector('[data-to-top]');
const compactDetails = [...document.querySelectorAll('.compact-details')];
const compactLayout = window.matchMedia('(max-width: 699px)');

function syncCompactDetails(event) {
  compactDetails.forEach((item) => {
    item.open = !event.matches;
  });
  updatePageCounter();
}

syncCompactDetails(compactLayout);
compactLayout.addEventListener?.('change', syncCompactDetails);

function updatePageCounter() {
  if (!pageCounter) return;
  const total = Math.max(1, Number(pageCounter.dataset.totalPages) || 1);
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  const current = Math.min(total, Math.floor(progress * total) + 1);
  pageCounter.textContent = `Pagina ${current} di ${total}`;
}

updatePageCounter();
window.addEventListener('scroll', updatePageCounter, { passive: true });
window.addEventListener('resize', updatePageCounter);

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', link.getAttribute('href'));
    document.querySelectorAll('details.menu[open]').forEach((menu) => {
      menu.removeAttribute('open');
    });
  });
});

const searchToggle = document.querySelector('[data-search-toggle]');
const searchPanel = document.querySelector('#page-search');
const searchInput = document.querySelector('#page-search-input');
const searchNext = document.querySelector('[data-search-next]');
const searchStatus = document.querySelector('.page-search__status');
let searchMatches = [];
let searchIndex = -1;
let activeQuery = '';

function clearSearchResult() {
  document.querySelector('.search-result')?.classList.remove('search-result');
}

function collectSearchResults() {
  clearSearchResult();
  activeQuery = searchInput.value.trim().toLocaleLowerCase('it');
  searchIndex = -1;
  if (activeQuery.length < 2) {
    searchMatches = [];
    searchStatus.textContent = 'Scrivi almeno due caratteri.';
    return;
  }
  searchMatches = [...document.querySelectorAll('.article h2, .article h3, .article p, .article li, .article th, .article td')]
    .filter((element) => element.textContent.toLocaleLowerCase('it').includes(activeQuery));
  searchStatus.textContent = searchMatches.length
    ? `${searchMatches.length} risultati. Premi Trova per scorrerli.`
    : 'Nessun risultato.';
}

function showNextSearchResult() {
  if (searchInput.value.trim().toLocaleLowerCase('it') !== activeQuery) {
    collectSearchResults();
  }
  if (!searchMatches.length) return;
  clearSearchResult();
  searchIndex = (searchIndex + 1) % searchMatches.length;
  const result = searchMatches[searchIndex];
  result.classList.add('search-result');
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  searchStatus.textContent = `Risultato ${searchIndex + 1} di ${searchMatches.length}.`;
}

searchToggle?.addEventListener('click', () => {
  const willOpen = searchPanel.hidden;
  searchPanel.hidden = !willOpen;
  searchToggle.setAttribute('aria-expanded', String(willOpen));
  document.querySelectorAll('details.menu[open]').forEach((menu) => {
    menu.removeAttribute('open');
  });
  if (willOpen) searchInput.focus();
  else clearSearchResult();
});

searchInput?.addEventListener('input', collectSearchResults);
searchInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    showNextSearchResult();
  }
});
searchNext?.addEventListener('click', showNextSearchResult);

document.addEventListener('pointerdown', (event) => {
  document.querySelectorAll('details.menu[open]').forEach((menu) => {
    if (!menu.contains(event.target)) menu.removeAttribute('open');
  });
  if (searchPanel && !searchPanel.hidden && !searchPanel.contains(event.target) && !searchToggle?.contains(event.target)) {
    searchPanel.hidden = true;
    searchToggle?.setAttribute('aria-expanded', 'false');
    clearSearchResult();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('details.menu[open]').forEach((menu) => menu.removeAttribute('open'));
  if (searchPanel && !searchPanel.hidden) {
    searchPanel.hidden = true;
    searchToggle?.setAttribute('aria-expanded', 'false');
    searchToggle?.focus();
    clearSearchResult();
  }
});

document.querySelector('[data-share]')?.addEventListener('click', async (event) => {
  const configuredUrl = event.currentTarget.dataset.shareUrl;
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  const url = configuredUrl || canonical || window.location.href.split('#')[0];
  try {
    if (navigator.share) {
      await navigator.share({ url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.textContent = 'Link copiato.';
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  } catch (error) {
    if (error?.name !== 'AbortError') {
      toast.textContent = 'Condivisione non disponibile.';
      toast.classList.add('is-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
    }
  }
});

const printButton = document.querySelector('[data-print]');
printButton?.addEventListener('click', () => {
  const details = [...document.querySelectorAll('details')];
  const previouslyOpen = new Set(details.filter((item) => item.open));
  details.forEach((item) => { item.open = true; });
  const restoreDetails = () => {
    details.forEach((item) => { item.open = previouslyOpen.has(item); });
    window.removeEventListener('afterprint', restoreDetails);
  };
  window.addEventListener('afterprint', restoreDetails);
  window.print();
});
