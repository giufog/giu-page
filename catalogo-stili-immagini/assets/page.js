// Shared page utilities reused from the approved page/Eventi script; no Eventi data or counters.
const toast = document.querySelector('.toast');
let toastTimer;
const sources = document.querySelector('.sources');
const pageCounter = document.querySelector('[data-page-counter]');

document.querySelectorAll('[data-menu-demo] details').forEach((details) => {
  details.open = false;
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    details.closest('[data-menu-demo]').querySelectorAll('details[open]').forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});

document.querySelectorAll('table').forEach((table) => {
  const headers = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent.trim());
  const rows = [...table.querySelectorAll('tbody tr')];
  if (!headers.length || !rows.length) return;
  const mobile = document.createElement('div');
  mobile.className = 'mobile-table';
  mobile.setAttribute('aria-label', 'Tabella in formato mobile');
  rows.forEach((row, rowIndex) => {
    const cells = [...row.children];
    const details = document.createElement('details');
    details.open = rowIndex === 0;
    const summary = document.createElement('summary');
    summary.innerHTML = `<span>${cells[0]?.textContent.trim() || `Riga ${rowIndex + 1}`}</span><img src="https://api.iconify.design/lucide/chevron-down.svg?color=%23173e35" alt="">`;
    const body = document.createElement('div');
    body.className = 'mobile-table__body';
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
      mobile.querySelectorAll('details[open]').forEach((other) => {
        if (other !== details) other.open = false;
      });
    });
    mobile.append(details);
  });
  table.closest('.table-wrap')?.insertAdjacentElement('afterend', mobile);
});
const backToTop = document.querySelector('[data-to-top]');

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

document.addEventListener('pointerdown', (event) => {
  document.querySelectorAll('details.menu[open]').forEach((menu) => {
    if (!menu.contains(event.target)) menu.removeAttribute('open');
  });
  if (
    searchPanel &&
    !searchPanel.hidden &&
    !searchPanel.contains(event.target) &&
    !searchToggle?.contains(event.target)
  ) {
    searchPanel.hidden = true;
    searchToggle?.setAttribute('aria-expanded', 'false');
    clearSearchHighlights();
    activeQuery = '';
  }
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
      clearSearchHighlights();
      activeQuery = '';
    }
  }
});

const searchToggle = document.querySelector('[data-search-toggle]');
const searchPanel = document.querySelector('#page-search');
const searchInput = document.querySelector('#page-search-input');
const searchPrevious = document.querySelector('[data-search-prev]');
const searchNext = document.querySelector('[data-search-next]');
const searchStatus = document.querySelector('.page-search__status');
let searchMatches = [];
let searchIndex = -1;
let activeQuery = '';

function clearSearchHighlights() {
  const parents = new Set();
  document.querySelectorAll('mark.search-highlight').forEach((mark) => {
    parents.add(mark.parentNode);
    mark.replaceWith(document.createTextNode(mark.textContent || ''));
  });
  parents.forEach((parent) => parent?.normalize());
  searchMatches = [];
  searchIndex = -1;
}

function collectSearchResults() {
  clearSearchHighlights();
  activeQuery = searchInput?.value.trim().toLocaleLowerCase('it') || '';
  if (activeQuery.length < 2) {
    if (searchPrevious) searchPrevious.disabled = true;
    if (searchNext) searchNext.disabled = true;
    if (searchStatus) searchStatus.textContent = 'Scrivi almeno due caratteri.';
    return;
  }

  const root = document.querySelector('#contenuto');
  if (!root) return;
  const excluded = 'script, style, noscript, input, textarea, select, option, button, svg, mark.search-highlight, [hidden], [aria-hidden="true"]';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      return parent && !parent.closest(excluded) && node.nodeValue.toLocaleLowerCase('it').includes(activeQuery)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const text = node.nodeValue;
    const normalized = text.toLocaleLowerCase('it');
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let foundAt = normalized.indexOf(activeQuery, cursor);
    while (foundAt !== -1) {
      if (foundAt > cursor) fragment.append(document.createTextNode(text.slice(cursor, foundAt)));
      const highlight = document.createElement('mark');
      highlight.className = 'search-highlight';
      highlight.textContent = text.slice(foundAt, foundAt + activeQuery.length);
      fragment.append(highlight);
      cursor = foundAt + activeQuery.length;
      foundAt = normalized.indexOf(activeQuery, cursor);
    }
    if (cursor < text.length) fragment.append(document.createTextNode(text.slice(cursor)));
    node.replaceWith(fragment);
  });

  searchMatches = [...root.querySelectorAll('mark.search-highlight')];
  if (searchPrevious) searchPrevious.disabled = searchMatches.length === 0;
  if (searchNext) searchNext.disabled = searchMatches.length === 0;
  if (!searchStatus) return;
  if (!searchMatches.length) {
    searchStatus.textContent = 'Nessun risultato.';
    return;
  }
  searchIndex = 0;
  activateSearchResult(false);
}

function revealSearchResult(result) {
  let details = result.closest('details');
  while (details) {
    details.open = true;
    details = details.parentElement?.closest('details');
  }
}

function activateSearchResult(shouldScroll = true) {
  searchMatches.forEach((match, index) => {
    match.classList.toggle('search-highlight--active', index === searchIndex);
  });
  const result = searchMatches[searchIndex];
  if (!result) return;
  revealSearchResult(result);
  if (searchStatus) searchStatus.textContent = `Risultato ${searchIndex + 1} di ${searchMatches.length}.`;
  if (shouldScroll) {
    requestAnimationFrame(() => result.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }));
  }
}

function showSearchResult(direction, { closeKeyboard = false } = {}) {
  if ((searchInput?.value.trim().toLocaleLowerCase('it') || '') !== activeQuery) {
    collectSearchResults();
  }
  if (!searchMatches.length) return;
  if (closeKeyboard) searchInput?.blur();
  searchIndex = (searchIndex + direction + searchMatches.length) % searchMatches.length;
  activateSearchResult();
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
    clearSearchHighlights();
    activeQuery = '';
  }
});
searchInput?.addEventListener('input', collectSearchResults);
searchInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    showSearchResult(event.shiftKey ? -1 : 1);
  }
});
searchPrevious?.addEventListener('click', () => showSearchResult(-1, { closeKeyboard: true }));
searchNext?.addEventListener('click', () => showSearchResult(1, { closeKeyboard: true }));
document.addEventListener('giu:close-search', () => {
  if (searchPanel) searchPanel.hidden = true;
  searchToggle?.setAttribute('aria-expanded', 'false');
  clearSearchHighlights();
  activeQuery = '';
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

async function shareContent(button) {
  const configuredUrl = button.dataset.shareUrl;
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  const url = configuredUrl ? new URL(configuredUrl, window.location.href).href : (canonical || window.location.href.split('#')[0]);
  try {
    if (navigator.share) {
      await navigator.share({ url });
      return;
    }
    await navigator.clipboard.writeText(url);
    showToast('Link copiato.');
  } catch (error) {
    if (error?.name !== 'AbortError') {
      showToast('Condivisione non disponibile.');
    }
  }
}

document.querySelectorAll('[data-share]').forEach((button) => {
  button.addEventListener('click', () => shareContent(button));
});

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
  printButton.addEventListener('click', async () => {
    const restoreCatalog = await window.catalogPreparePrint?.();
    const details = [...document.querySelectorAll('details')];
    const previouslyOpen = new Set(details.filter((item) => item.open));
    details.forEach((item) => { item.open = true; });

    const restoreDetails = () => {
      restoreCatalog?.();
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
