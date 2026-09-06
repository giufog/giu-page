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
  const title = button.dataset.shareTitle || document.title;
  const text = button.dataset.shareText || '';
  const message = [title, text, url].filter(Boolean).join('\n\n');
  try {
    if (navigator.share) {
      await navigator.share({ title, text: message, url });
      return;
    }
    await navigator.clipboard.writeText(message);
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

const eventList = document.querySelector('[data-events-list]');
const eventCount = document.querySelector('[data-results-count]');
const eventEmpty = document.querySelector('[data-empty-state]');
let allEvents = [];
let activeArea = 'all';
let activePeriod = 'all';
const eventsServiceBase = 'https://giu-page-eventi-update.docile-aspen-8173.chatgpt.site';
let eventPeriods = {
  weekday1: ['2026-08-31', '2026-09-04'],
  sat1: ['2026-09-05', '2026-09-05'],
  sun1: ['2026-09-06', '2026-09-06'],
  weekday2: ['2026-09-07', '2026-09-11'],
  sat2: ['2026-09-12', '2026-09-12'],
  sun2: ['2026-09-13', '2026-09-13']
};

function configureEventPeriods(data) {
  if (!Array.isArray(data?.periods) || !data.periods.length) return;
  eventPeriods = Object.fromEntries(data.periods.map((period) => [period.id, [period.from, period.to]]));
  const row = document.querySelector('[data-day-filters]');
  if (!row) return;
  row.innerHTML = '<button class="filter-button is-selected" type="button" data-period="all">Tutti</button>' + data.periods
    .map((period) => `<button class="filter-button" type="button" data-period="${escapeHtml(period.id)}">${escapeHtml(period.label)}</button>`)
    .join('');
  bindEventFilters('[data-day-filters] [data-period]', 'period', (value) => { activePeriod = value; });
}

function configureFreshness(data) {
  const title = document.querySelector('#titolo-pagina');
  const meta = document.querySelector('[data-event-meta]');
  if (title && data?.range) {
    title.textContent = `Eventi dal ${longDate(data.range.from)} a ${longDate(data.range.to)}`;
    document.title = `${title.textContent} | Giu Page`;
  }
  if (meta) {
    const checked = data?.generatedAt ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(data.generatedAt)) : 'non indicato';
    meta.textContent = `${data?.events?.length || 0} eventi · ultimo controllo ${checked}`;
  }
}

const nativeRefresh = document.querySelector('[data-native-refresh]');
const nativeRefreshButton = document.querySelector('[data-native-refresh-button]');
if (window.GiuPageNative && typeof window.GiuPageNative.requestEventRefresh === 'function') {
  if (nativeRefresh) nativeRefresh.hidden = false;
  nativeRefreshButton?.addEventListener('click', () => {
    nativeRefreshButton.disabled = true;
    nativeRefreshButton.textContent = 'Aggiornamento richiesto…';
    try {
      window.GiuPageNative.requestEventRefresh();
      showToast('Richiesta inviata. Riapri Eventi tra qualche minuto.');
    } catch (_) {
      showToast('Impossibile avviare l’aggiornamento.');
    }
    window.setTimeout(() => {
      nativeRefreshButton.disabled = false;
      nativeRefreshButton.textContent = 'Aggiorna eventi';
    }, 15000);
  });
}

function eventTimeLabel(value) {
  if (!value || !value.includes('T')) return '';
  return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function shortDate(value) {
  const date = new Date(`${value}T12:00:00+02:00`);
  return new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(date).replace('.', '');
}

function longDate(value) {
  const date = new Date(`${value}T12:00:00+02:00`);
  return new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

function eventDateLabel(item) {
  if (item.dateLabel) return item.dateLabel;
  const start = item.startDate?.slice(0, 10);
  const end = item.endDate?.slice(0, 10) || start;
  if (!start) return '';
  return start === end ? shortDate(start) : `da ${shortDate(start)} a ${shortDate(end)}`;
}

function eventOccursInPeriod(item, period) {
  if (period === 'all') return true;
  const [rangeStart, rangeEnd] = eventPeriods[period];
  const occurrences = item.occurrenceDates || [];
  if (occurrences.length) return occurrences.some((date) => date >= rangeStart && date <= rangeEnd);
  const start = item.startDate?.slice(0, 10);
  const end = item.endDate?.slice(0, 10) || start;
  return Boolean(start && start <= rangeEnd && end >= rangeStart);
}

function eventMatchesArea(item, area) {
  return area === 'all' || (item.zones || [item.zone]).includes(area);
}

function normalizeSearch(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it');
}

function normalizedEventTitle(value) {
  return normalizeSearch(value).replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizedEventTitleBase(value) {
  const base = String(value || '').split(/\s[-–—]\s|:\s|\.\s/)[0];
  return normalizedEventTitle(base);
}

function eventSourceHost(item) {
  try {
    return new URL(item.sourceUrl).hostname.replace(/^www\./, '');
  } catch (_) {
    return '';
  }
}

function eventLocationsAreCompatible(first, second) {
  const firstCity = normalizeSearch(first.city).trim();
  const secondCity = normalizeSearch(second.city).trim();
  if (!firstCity || !secondCity) return false;
  if (firstCity === secondCity) return true;

  const genericCity = 'friuli venezia giulia';
  const genericItem = firstCity === genericCity ? first : secondCity === genericCity ? second : null;
  const specificCity = firstCity === genericCity ? secondCity : secondCity === genericCity ? firstCity : '';
  if (!genericItem || !specificCity) return false;
  const placeName = specificCity.split(' ')[0];
  const genericText = normalizeSearch([
    genericItem.title, genericItem.locationLabel, genericItem.venue, genericItem.description,
    ...(genericItem.detailParagraphs || [])
  ].join(' '));
  return placeName.length >= 4 && genericText.includes(placeName);
}

function eventDates(item) {
  const occurrences = item.occurrenceDates || [];
  if (occurrences.length) return occurrences;
  const start = item.startDate?.slice(0, 10);
  const end = item.endDate?.slice(0, 10) || start;
  return start ? [start, end] : [];
}

function eventDateRangesOverlap(first, second) {
  const firstDates = eventDates(first);
  const secondDates = eventDates(second);
  if (!firstDates.length || !secondDates.length) return false;
  if (first.occurrenceDates?.length && second.occurrenceDates?.length) {
    const secondDateSet = new Set(secondDates);
    return firstDates.some((date) => secondDateSet.has(date));
  }
  const firstStart = firstDates[0];
  const firstEnd = firstDates[firstDates.length - 1];
  const secondStart = secondDates[0];
  const secondEnd = secondDates[secondDates.length - 1];
  return firstStart <= secondEnd && secondStart <= firstEnd;
}

function isGenericImportedEvent(item) {
  return /^(evento pubblicato da|evento in austria\b)/i.test(String(item.description || '').trim());
}

function areDuplicateEvents(first, second) {
  if (!eventLocationsAreCompatible(first, second) || !eventDateRangesOverlap(first, second)) return false;

  const firstTitle = normalizedEventTitle(first.title);
  const secondTitle = normalizedEventTitle(second.title);
  if (!firstTitle || !secondTitle) return false;
  if (firstTitle === secondTitle) return true;

  const titleContainsOther = firstTitle.includes(secondTitle) || secondTitle.includes(firstTitle);
  if (titleContainsOther && isGenericImportedEvent(first) !== isGenericImportedEvent(second)) return true;

  const firstBase = normalizedEventTitleBase(first.title);
  const secondBase = normalizedEventTitleBase(second.title);
  const matchingBase = firstBase.length >= 10 && secondBase.length >= 10
    && (firstBase.includes(secondBase) || secondBase.includes(firstBase));
  const firstHost = eventSourceHost(first);
  const secondHost = eventSourceHost(second);
  return matchingBase && firstHost && secondHost && firstHost !== secondHost;
}

function eventQualityScore(item) {
  const programItems = (item.program || []).reduce((total, group) => total + (group.items || []).length, 0);
  return (item.image || item.imageRemoteUrl || item.imageServiceUrl ? 5 : 0)
    + Math.min((item.sources || []).length, 4)
    + Math.min((item.detailParagraphs || []).length, 6)
    + Math.min(programItems, 5)
    + (isGenericImportedEvent(item) ? 0 : 4);
}

function mergeDuplicateEvents(first, second) {
  const primary = eventQualityScore(first) >= eventQualityScore(second) ? first : second;
  const secondary = primary === first ? second : first;
  const sourcesByUrl = new Map([...(primary.sources || []), ...(secondary.sources || [])]
    .filter((source) => source?.url)
    .map((source) => [source.url, source]));
  return {
    ...primary,
    occurrenceDates: [...new Set([...eventDates(first), ...eventDates(second)])].sort(),
    zones: [...new Set([...(primary.zones || [primary.zone]), ...(secondary.zones || [secondary.zone])].filter(Boolean))],
    sources: [...sourcesByUrl.values()]
  };
}

function deduplicateEvents(events) {
  return events.reduce((unique, item) => {
    const duplicateIndex = unique.findIndex((candidate) => areDuplicateEvents(candidate, item));
    if (duplicateIndex < 0) unique.push(item);
    else unique[duplicateIndex] = mergeDuplicateEvents(unique[duplicateIndex], item);
    return unique;
  }, []);
}

function updateFilterCounts() {
  document.querySelectorAll('[data-area-filters] [data-area], [data-day-filters] [data-period]').forEach((button) => {
    const area = button.dataset.area;
    const count = allEvents.filter((item) => area
      ? eventMatchesArea(item, area) && eventOccursInPeriod(item, activePeriod)
      : eventMatchesArea(item, activeArea) && eventOccursInPeriod(item, button.dataset.period)
    ).length;
    button.dataset.label ||= button.textContent.trim();
    button.innerHTML = `${escapeHtml(button.dataset.label)} <span class="filter-count" data-count="${count}" aria-hidden="true">${count}</span>`;
    button.setAttribute('aria-label', `${button.dataset.label}, ${count} ${count === 1 ? 'evento' : 'eventi'}`);
    button.setAttribute('aria-pressed', String(area ? area === activeArea : button.dataset.period === activePeriod));
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function combinedCostAndBooking(item) {
  const cost = item.admission?.label || 'Costo non indicato';
  const booking = item.booking?.label || 'Prenotazione non indicata';
  return `${cost} · ${booking}`;
}

function eventNotes(item) {
  if (item.notesSummary) return item.notesSummary;
  if (item.cardNote) return item.cardNote;
  if (item.practicalNotes?.length) return item.practicalNotes[0];
  return 'Nessuna nota aggiuntiva pubblicata.';
}

function eventRating(item) {
  const value = Number(item.rating?.value);
  const count = Number(item.rating?.count);
  if (!(value >= 1 && value <= 5 && count > 0)) return '';
  const stars = Array.from({ length: 5 }, (_, index) => index + 1 <= Math.round(value) ? '★' : '☆').join('');
  return `<p class="event-rating" aria-label="Valutazione ${value.toFixed(1)} su 5, ${count} recensioni"><span>${stars}</span><b>${value.toFixed(1)}</b><small>${count} recensioni</small></p>`;
}

function eventDetailPath(item) {
  return `dettaglio/${encodeURIComponent(item.slug)}/index.html`;
}

function eventMapsUrl(item) {
  const raw = item.mapsUrl || '';
  try {
    const url = new URL(raw);
    const destination = url.searchParams.get('destination') || url.searchParams.get('query');
    if (!destination) return raw;
    const directions = new URL('https://www.google.com/maps/dir/');
    directions.searchParams.set('api', '1');
    directions.searchParams.set('destination', destination);
    directions.searchParams.set('travelmode', 'driving');
    return directions.href;
  } catch (_) {
    return raw;
  }
}

function androidMapsIntentUrl(webUrl) {
  try {
    const url = new URL(webUrl);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('google.com')) return webUrl;
    return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
  } catch (_) {
    return webUrl;
  }
}

function androidGeoUrl(webUrl) {
  try {
    const destination = new URL(webUrl).searchParams.get('destination');
    return destination ? `geo:0,0?q=${encodeURIComponent(destination)}` : webUrl;
  } catch (_) {
    return webUrl;
  }
}

function applyAndroidMapLinks() {
  if (!/Android/i.test(navigator.userAgent)) return;
  const inGiuPageApp = Boolean(window.GiuPageNative);
  document.querySelectorAll('a[data-map-link]').forEach((link) => {
    const webUrl = link.dataset.webMapsUrl || eventMapsUrl({ mapsUrl: link.href });
    link.dataset.webMapsUrl = webUrl;
    link.href = inGiuPageApp ? androidGeoUrl(webUrl) : androidMapsIntentUrl(webUrl);
    link.removeAttribute('target');
  });
}

function renderEvents() {
  if (!eventList) return;
  const visible = allEvents.filter((item) =>
    eventMatchesArea(item, activeArea) && eventOccursInPeriod(item, activePeriod)
  ).sort((a, b) => (a.distanceFromTarcentoKm ?? 9999) - (b.distanceFromTarcentoKm ?? 9999));
  eventList.innerHTML = visible.map((item, index) => {
    const days = eventDateLabel(item);
    const startTime = eventTimeLabel(item.startDate);
    const zone = item.zone || 'friuli';
    const information = [
      ['Costi e prenotazioni', combinedCostAndBooking(item)],
      ['Programma', item.programStatus?.label || 'Da verificare'],
      ['In caso di maltempo', item.weatherPlan || 'Nessuna indicazione specifica pubblicata.'],
      ['Note', eventNotes(item)]
    ].map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
    const imageCandidates = eventImageCandidates(item);
    const imageUrl = imageCandidates.shift();
    const detailPath = eventDetailPath(item);
    const mapsUrl = eventMapsUrl(item);
    const image = imageUrl ? `<a class="event-card__media" href="${escapeHtml(detailPath)}" aria-label="Apri pagina: ${escapeHtml(item.title)}">
      <img src="${escapeHtml(imageUrl)}" data-image-fallbacks="${encodeURIComponent(JSON.stringify(imageCandidates))}" alt="${escapeHtml(item.imageAlt || item.title)}" width="640" height="360" loading="${index === 0 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'low'}" decoding="async">
    </a>` : '';
    return `<article class="event-card event-card--${escapeHtml(zone)}" data-searchable>
      <div class="event-card__date"><span>${days}</span>${startTime ? `<span>dalle ${startTime}</span>` : ''}</div>
      ${image}
      <div class="event-card__body">
        <h3><a href="${escapeHtml(detailPath)}">${escapeHtml(item.title)}</a></h3>
        ${eventRating(item)}
        <p class="event-card__description">${escapeHtml(item.description)}</p>
        <a class="event-card__location" href="${escapeHtml(mapsUrl)}" data-map-link target="_blank" rel="noopener" aria-label="Apri su Google Maps: ${escapeHtml(item.locationLabel)}">
          <img src="https://api.iconify.design/lucide/map-pin.svg?color=%23173e35" alt="">
          <span>${escapeHtml(item.locationLabel)}</span>
          <b>Apri Maps</b>
        </a>
        <dl class="event-card__info">${information}</dl>
        <div class="event-card__actions">
          <a class="event-card__button event-card__button--primary" href="${escapeHtml(detailPath)}"><img src="https://api.iconify.design/lucide/file-text.svg?color=%23ffffff" alt="">Apri pagina</a>
          <button class="event-card__button event-card__button--share" type="button" data-share-event data-share-url="${escapeHtml(detailPath)}" data-share-title="${escapeHtml(item.title)}" data-share-text="${escapeHtml(item.description)}"><img src="https://api.iconify.design/lucide/share-2.svg?color=%232878b8" alt="">Condividi</button>
        </div>
      </div>
    </article>`;
  }).join('');
  applyAndroidMapLinks();
  if (eventCount) eventCount.textContent = `${visible.length} ${visible.length === 1 ? 'evento mostrato' : 'eventi mostrati'}`;
  updateFilterCounts();
  if (eventEmpty) {
    eventEmpty.hidden = visible.length !== 0;
    if (!visible.length) {
      const areaLabel = { all: 'le zone selezionate', friuli: 'il Friuli', mare: 'il Mare', austria: 'l’Austria' }[activeArea];
      eventEmpty.textContent = `Nessun evento trovato per ${areaLabel} nel periodo selezionato. Prova a cambiare un filtro.`;
    }
  }
  if (activeQuery.length >= 2 && searchInput) collectSearchResults();
}

function bindEventFilters(selector, dataName, onChange) {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll(selector).forEach((item) => item.classList.toggle('is-selected', item === button));
      onChange(button.dataset[dataName]);
      renderEvents();
    });
  });
}

bindEventFilters('[data-area-filters] [data-area]', 'area', (value) => { activeArea = value; });
bindEventFilters('[data-day-filters] [data-period]', 'period', (value) => { activePeriod = value; });

eventList?.addEventListener('click', (event) => {
  const shareButton = event.target.closest('[data-share-event]');
  if (shareButton) shareContent(shareButton);
});
eventList?.addEventListener('error', (event) => {
  if (!event.target.matches('.event-card__media img')) return;
  const image = event.target;
  let candidates = [];
  try { candidates = JSON.parse(decodeURIComponent(image.dataset.imageFallbacks || '[]')); } catch (_) {}
  const next = candidates.shift();
  if (next) {
    image.dataset.imageFallbacks = encodeURIComponent(JSON.stringify(candidates));
    image.src = next;
  } else image.closest('.event-card__media')?.remove();
}, true);

let activeEventsDataSignature = '';
let activeEventsDataTimestamp = 0;

function eventsDataSignature(data) {
  const events = data?.events || [];
  return [data?.generatedAt || '', events.length, events[0]?.slug || '', events[events.length - 1]?.slug || ''].join('|');
}

function eventsDataTimestamp(data) {
  const timestamp = Date.parse(data?.generatedAt || '');
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function eventHasEnded(item, now = new Date()) {
  const rawEnd = item.endDate || item.startDate;
  if (!rawEnd) return false;
  const hasExplicitEndTime = Boolean(item.endDate && item.endDate.length > 10);
  const end = new Date(hasExplicitEndTime ? rawEnd : `${rawEnd.slice(0, 10)}T23:59:59`);
  return !Number.isNaN(end.getTime()) && end < now;
}

function eventImageCandidates(item) {
  return [...new Set([item.image, item.imageServiceUrl, item.imageRemoteUrl].filter(Boolean))];
}

function applyEventsData(data) {
  if (!data?.events) throw new Error('Dati non disponibili');
  allEvents = deduplicateEvents(data.events).filter((item) => !eventHasEnded(item));
  activeEventsDataSignature = eventsDataSignature(data);
  activeEventsDataTimestamp = eventsDataTimestamp(data);
  configureEventPeriods(data);
  configureFreshness({ ...data, events: allEvents });
  renderEvents();
}

if (eventList) {
  if (window.EVENTS_DATA?.events) applyEventsData(window.EVENTS_DATA);

  const eventsRequestController = new AbortController();
  const eventsRequestTimeout = window.setTimeout(() => eventsRequestController.abort(), 5000);
  fetch(`${eventsServiceBase}/api/events-data`, { cache: 'no-store', signal: eventsRequestController.signal })
    .then((response) => {
      if (!response.ok) throw new Error('Dati remoti non disponibili');
      return response.json();
    })
    .then((data) => {
      const remoteTimestamp = eventsDataTimestamp(data);
      if ((!allEvents.length || remoteTimestamp > activeEventsDataTimestamp)
        && eventsDataSignature(data) !== activeEventsDataSignature) applyEventsData(data);
    })
    .catch(() => {
      if (!allEvents.length) {
        eventList.innerHTML = '<div class="empty-state">Non è stato possibile caricare gli eventi.</div>';
        if (eventCount) eventCount.textContent = 'Dati non disponibili';
      }
    })
    .finally(() => window.clearTimeout(eventsRequestTimeout));
}

applyAndroidMapLinks();
