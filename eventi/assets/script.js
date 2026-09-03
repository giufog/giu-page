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
    clearSearchResult();
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

function clearSearchResult() {
  document.querySelector('.search-result')?.classList.remove('search-result');
}

function collectSearchResults() {
  clearSearchResult();
  activeQuery = searchInput.value.trim().toLocaleLowerCase('it');
  searchIndex = -1;
  if (activeQuery.length < 2) {
    searchMatches = [];
    if (searchPrevious) searchPrevious.disabled = true;
    if (searchNext) searchNext.disabled = true;
    searchStatus.textContent = 'Scrivi almeno due caratteri.';
    return;
  }
  searchMatches = [...document.querySelectorAll('.article h2, .article h3, .article p, .article li, .article th, .article td')]
    .filter((element) => element.textContent.toLocaleLowerCase('it').includes(activeQuery));
  if (searchPrevious) searchPrevious.disabled = searchMatches.length === 0;
  if (searchNext) searchNext.disabled = searchMatches.length === 0;
  searchStatus.textContent = searchMatches.length
    ? searchMatches.length === 1
      ? '1 risultato. Usa le frecce per raggiungerlo.'
      : `${searchMatches.length} risultati. Usa le frecce per scorrerli.`
    : 'Nessun risultato.';
}

function showSearchResult(direction) {
  if (searchInput.value.trim().toLocaleLowerCase('it') !== activeQuery) {
    collectSearchResults();
  }
  if (!searchMatches.length) return;
  clearSearchResult();
  searchIndex = searchIndex < 0
    ? direction < 0 ? searchMatches.length - 1 : 0
    : (searchIndex + direction + searchMatches.length) % searchMatches.length;
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
    showSearchResult(event.shiftKey ? -1 : 1);
  }
});
searchPrevious?.addEventListener('click', () => showSearchResult(-1));
searchNext?.addEventListener('click', () => showSearchResult(1));

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
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
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
const eventSearch = document.querySelector('[data-event-search]');
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
  const lead = document.querySelector('[data-event-lead]');
  const meta = document.querySelector('[data-event-meta]');
  if (lead && data?.range) {
    lead.textContent = `Appuntamenti dal ${shortDate(data.range.from)} al ${shortDate(data.range.to)}, ordinati da Tarcento verso le altre zone.`;
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

function eventDateLabel(item) {
  if (item.dateLabel) return item.dateLabel;
  if (item.occurrenceDates?.length) return item.occurrenceDates.map(shortDate).join(' · ');
  const start = item.startDate?.slice(0, 10);
  const end = item.endDate?.slice(0, 10) || start;
  return start === end ? shortDate(start) : `${shortDate(start)} – ${shortDate(end)}`;
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

function eventMatchesText(item) {
  const terms = normalizeSearch(eventSearch?.value).trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const searchable = normalizeSearch([
    item.title, item.originalTitle, item.description, item.longDescription, item.city,
    item.venue, ...(item.tags || []), ...(item.detailParagraphs || []),
    ...(item.program || []).flatMap((day) => day.items || [])
  ].join(' '));
  return terms.every((term) => searchable.includes(term));
}

function updateFilterCounts() {
  const searched = allEvents.filter(eventMatchesText);
  document.querySelectorAll('[data-area-filters] [data-area], [data-day-filters] [data-period]').forEach((button) => {
    const area = button.dataset.area;
    const count = searched.filter((item) => area
      ? eventMatchesArea(item, area) && eventOccursInPeriod(item, activePeriod)
      : eventMatchesArea(item, activeArea) && eventOccursInPeriod(item, button.dataset.period)
    ).length;
    button.dataset.label ||= button.textContent.trim();
    button.innerHTML = `${escapeHtml(button.dataset.label)} <span class="filter-count">${count}</span>`;
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

function renderEvents() {
  if (!eventList) return;
  const visible = allEvents.filter((item) =>
    eventMatchesArea(item, activeArea) && eventOccursInPeriod(item, activePeriod) && eventMatchesText(item)
  ).sort((a, b) => (a.distanceFromTarcentoKm ?? 9999) - (b.distanceFromTarcentoKm ?? 9999));
  eventList.innerHTML = visible.map((item) => {
    const days = eventDateLabel(item);
    const startTime = eventTimeLabel(item.startDate);
    const zone = item.zone || 'friuli';
    const information = [
      ['Costi e prenotazioni', combinedCostAndBooking(item)],
      ['Programma', item.programStatus?.label || 'Da verificare'],
      ['In caso di maltempo', item.weatherPlan || 'Nessuna indicazione specifica pubblicata.'],
      ['Note', eventNotes(item)]
    ].map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
    const imageUrl = item.imageServiceUrl || item.imageRemoteUrl || item.image;
    const image = imageUrl ? `<a class="event-card__media" href="${escapeHtml(item.detailPath)}" aria-label="Apri dettagli: ${escapeHtml(item.title)}">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="lazy" decoding="async">
    </a>` : '';
    return `<article class="event-card event-card--${escapeHtml(zone)}" data-searchable>
      <div class="event-card__date"><span>${days}</span><span>${startTime ? `dalle ${startTime}` : 'orario da verificare'}</span></div>
      ${image}
      <div class="event-card__body">
        <h3><a href="${escapeHtml(item.detailPath)}">${escapeHtml(item.title)}</a></h3>
        ${eventRating(item)}
        <p class="event-card__description">${escapeHtml(item.description)}</p>
        <a class="event-card__location" href="${escapeHtml(item.mapsUrl)}" target="_blank" rel="noopener" aria-label="Apri su Google Maps: ${escapeHtml(item.locationLabel)}">
          <img src="https://api.iconify.design/lucide/map-pin.svg?color=%23173e35" alt="">
          <span>${escapeHtml(item.locationLabel)}</span>
          <b>Apri Maps</b>
        </a>
        <dl class="event-card__info">${information}</dl>
        <div class="event-card__actions">
          <a class="event-card__button event-card__button--primary" href="${escapeHtml(item.detailPath)}"><img src="https://api.iconify.design/lucide/file-text.svg?color=%23ffffff" alt="">Apri dettagli</a>
          <button class="event-card__button event-card__button--share" type="button" data-share-event data-share-url="${escapeHtml(item.detailPath)}" data-share-title="${escapeHtml(item.title)}" data-share-text="${escapeHtml(item.description)}"><img src="https://api.iconify.design/lucide/share-2.svg?color=%232878b8" alt="">Condividi</button>
        </div>
      </div>
    </article>`;
  }).join('');
  eventList.querySelectorAll('.event-card__media img').forEach((image) => {
    image.addEventListener('error', () => image.closest('.event-card__media')?.remove(), { once: true });
  });
  eventList.querySelectorAll('[data-share-event]').forEach((button) => {
    button.addEventListener('click', () => shareContent(button));
  });
  if (eventCount) eventCount.textContent = `${visible.length} ${visible.length === 1 ? 'evento mostrato' : 'eventi mostrati'}`;
  updateFilterCounts();
  if (eventEmpty) {
    eventEmpty.hidden = visible.length !== 0;
    if (!visible.length) {
      const areaLabel = { all: 'le zone selezionate', friuli: 'il Friuli', mare: 'il Mare', austria: 'l’Austria' }[activeArea];
      eventEmpty.textContent = `Nessun evento trovato per ${areaLabel}, il periodo e le parole cercate. Prova a cambiare un filtro o svuotare la ricerca.`;
    }
  }
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
eventSearch?.addEventListener('input', renderEvents);

if (eventList) {
  fetch(`${eventsServiceBase}/api/events-data`, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Dati remoti non disponibili');
      return response.json();
    })
    .catch(() => window.EVENTS_DATA)
    .then((data) => {
      if (!data?.events) throw new Error('Dati non disponibili');
      configureEventPeriods(data);
      configureFreshness(data);
      allEvents = data.events || [];
      renderEvents();
    })
    .catch(() => {
      eventList.innerHTML = '<div class="empty-state">Non è stato possibile caricare gli eventi.</div>';
      if (eventCount) eventCount.textContent = 'Dati non disponibili';
    });
}
