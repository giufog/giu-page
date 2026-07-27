const toast = document.querySelector('.toast');
let toastTimer;
const sources = document.querySelector('.sources');

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

document.addEventListener('pointerdown', (event) => {
  document.querySelectorAll('details.menu[open]').forEach((menu) => {
    if (!menu.contains(event.target)) menu.removeAttribute('open');
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelectorAll('details.menu[open]').forEach((menu) => {
      menu.removeAttribute('open');
    });
    const searchPanel = document.querySelector('#page-search');
    const searchToggle = document.querySelector('[data-search-toggle]');
    if (searchPanel && !searchPanel.hidden) {
      searchPanel.hidden = true;
      searchToggle?.setAttribute('aria-expanded', 'false');
      searchToggle?.focus();
    }
  }
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
  if (willOpen) {
    searchInput.focus();
  } else {
    clearSearchResult();
  }
});
searchInput?.addEventListener('input', collectSearchResults);
searchInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    showNextSearchResult();
  }
});
searchNext?.addEventListener('click', showNextSearchResult);

document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () => {
    toast.textContent = button.dataset.toast;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  });
});
document.querySelectorAll('[data-dialog]').forEach((button) => {
  button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal());
});
document.querySelectorAll('.segmented button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.segmented .is-selected')?.classList.remove('is-selected');
    button.classList.add('is-selected');
  });
});

const printButton = document.querySelector('[data-print]');
if (printButton) {
  printButton.addEventListener('click', () => {
    const details = [...document.querySelectorAll('details')];
    const previouslyOpen = new Set(details.filter((item) => item.open));
    details.forEach((item) => { item.open = true; });

    const restoreDetails = () => {
      details.forEach((item) => { item.open = previouslyOpen.has(item); });
      window.removeEventListener('afterprint', restoreDetails);
    };

    if (window.GiuPageNative && typeof window.GiuPageNative.print === 'function') {
      window.GiuPageNative.print();
      window.setTimeout(restoreDetails, 1500);
    } else {
      window.addEventListener('afterprint', restoreDetails);
      window.print();
    }
  });
}
