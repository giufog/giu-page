const SERVICE_BASE = 'https://giu-page-eventi-update.docile-aspen-8173.chatgpt.site';
const target = document.querySelector('[data-event-detail]');
const wantedSlug = new URLSearchParams(location.search).get('evento') || '';

function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function sourceImages(item) {
  return [...new Set([item.image, item.imageServiceUrl, item.imageRemoteUrl].filter(Boolean))]
    .map(value => /^https?:/i.test(value) ? value : `../../${value.replace(/^\.\//, '')}`);
}

function dateLabel(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value.slice(0, 10)}T12:00:00`)).replace('.', '');
}

function compactDateRange(item) {
  const occurrences = item.occurrenceDates || [];
  const start = occurrences[0] || item.startDate?.slice(0, 10);
  const end = occurrences[occurrences.length - 1] || item.endDate?.slice(0, 10) || start;
  if (!start) return '';
  return start === end ? dateLabel(start) : `da ${dateLabel(start)} a ${dateLabel(end)}`;
}

function navigationUrl(item) {
  const raw = item.mapsUrl || '';
  let webUrl = raw;
  try {
    const url = new URL(raw);
    if (raw.includes('/maps/dir/')) {
      url.searchParams.set('api', '1');
      url.searchParams.set('travelmode', 'driving');
      url.searchParams.set('dir_action', 'navigate');
      webUrl = url.href;
    }
    if (/Android/i.test(navigator.userAgent)) {
      const destination = url.searchParams.get('destination') || url.searchParams.get('query');
      if (destination) return `google.navigation:q=${encodeURIComponent(destination)}&mode=d`;
    }
    return webUrl;
  } catch (_) {
    return raw;
  }
}

function eventHasEnded(item, now = new Date()) {
  const rawEnd = item.endDate || item.startDate;
  if (!rawEnd) return false;
  const hasExplicitEndTime = Boolean(item.endDate && item.endDate.length > 10);
  const end = new Date(hasExplicitEndTime ? rawEnd : `${rawEnd.slice(0, 10)}T23:59:59`);
  return !Number.isNaN(end.getTime()) && end < now;
}

function renderUnavailable(expired = false) {
  document.title = `${expired ? 'Evento concluso' : 'Evento non disponibile'} | Giu Page`;
  target.innerHTML = `<section class="empty-state"><h1>${expired ? 'Evento concluso' : 'Evento non trovato'}</h1><p>${expired ? 'La scheda è stata rimossa perché l’evento è terminato.' : 'La scheda potrebbe essere stata rimossa o aggiornata.'}</p><a href="../">Torna agli eventi</a></section>`;
}

function renderProgram(item) {
  return (item.program || []).map(group => `<section class="schedule-day"><h3>${escapeHtml(group.label)}</h3><ul>${(group.items || []).map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul></section>`).join('') || '<p>Il programma dettagliato non è ancora disponibile.</p>';
}

function renderSources(item) {
  return (item.sources || []).map(source => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener"><b>${escapeHtml(source.name)}</b><span>${escapeHtml(source.role || 'Fonte')}</span></a></li>`).join('');
}

function renderRating(item) {
  const value = Number(item.rating?.value);
  const count = Number(item.rating?.count);
  if (!(value >= 1 && value <= 5 && count > 0)) return '';
  const stars = Array.from({length:5}, (_, index) => index + 1 <= Math.round(value) ? '★' : '☆').join('');
  return `<p class="event-rating event-rating--detail" aria-label="Valutazione ${value.toFixed(1)} su 5, ${count} recensioni"><span>${stars}</span><b>${value.toFixed(1)}</b><small>${count} recensioni verificate alla fonte</small></p>`;
}

function render(item) {
  const imageCandidates = sourceImages(item);
  const image = imageCandidates.shift();
  const dates = compactDateRange(item);
  const mapsUrl = navigationUrl(item);
  const original = item.originalTitle ? `<p class="detail-original">Titolo originale: ${escapeHtml(item.originalTitle)}</p>` : '';
  document.title = `${item.title} | Giu Page`;
  document.body.classList.add(`detail-page--${item.zone || 'friuli'}`);
  target.innerHTML = `
    ${image ? `<div class="event-detail__media"><img src="${escapeHtml(image)}" data-image-fallbacks="${encodeURIComponent(JSON.stringify(imageCandidates))}" alt="${escapeHtml(item.imageAlt || item.title)}"></div>` : ''}
    <div class="event-detail__intro">
      <span class="detail-zone">${escapeHtml(({friuli:'Friuli',mare:'Mare',austria:'Austria'})[item.zone] || item.zone)}</span>
      <p class="detail-date">${escapeHtml(dates)}</p><h1>${escapeHtml(item.title)}</h1>${original}${renderRating(item)}
      <p class="detail-lead">${escapeHtml(item.description)}</p>
      <div class="detail-actions"><a class="detail-button detail-button--maps" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener"><img src="https://api.iconify.design/lucide/map-pin.svg?color=%23ffffff" alt="">Indicazioni</a><button class="detail-button detail-button--share" type="button" data-share><img src="https://api.iconify.design/lucide/share-2.svg?color=%232878b8" alt="">Condividi</button></div>
    </div>
    <dl class="detail-info" aria-label="Informazioni pratiche">
      <div><dt>Costi e prenotazioni</dt><dd>${escapeHtml(item.admission?.label || 'Costo non indicato')} · ${escapeHtml(item.booking?.label || 'Prenotazione non indicata')}</dd></div>
      <div><dt>Programma</dt><dd><b>${escapeHtml(item.programStatus?.label || 'Da verificare')}</b>. ${escapeHtml(item.programStatus?.note || '')}</dd></div>
      <div><dt>In caso di maltempo</dt><dd>${escapeHtml(item.weatherPlan || 'Nessuna indicazione specifica pubblicata.')}</dd></div>
      <div><dt>Note</dt><dd>${escapeHtml(item.notesSummary || 'Nessuna nota aggiuntiva pubblicata.')}</dd></div>
    </dl>
    <div class="detail-layout"><div class="detail-main">
      <section class="detail-section"><p class="eyebrow eyebrow--eventi">L’EVENTO</p><h2>Descrizione completa</h2><div class="detail-copy">${(item.detailParagraphs || [item.longDescription]).filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`).join('')}</div></section>
      <section class="detail-section"><p class="eyebrow eyebrow--eventi">IL PROGRAMMA</p><h2>Programma e orari</h2><div class="schedule-list">${renderProgram(item)}</div></section>
      <section class="detail-section"><p class="eyebrow eyebrow--eventi">INFORMAZIONI UTILI</p><h2>Prima di partire</h2><ul class="detail-notes">${(item.practicalNotes || []).map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul></section>
    </div><aside class="detail-aside">
      <section class="detail-place"><p class="eyebrow eyebrow--eventi">DOVE</p><h2>Luogo</h2><p>${escapeHtml(item.locationLabel)}</p><a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener">Apri in Google Maps</a></section>
      <section class="detail-sources"><p class="eyebrow eyebrow--eventi">VERIFICA</p><h2>Fonti</h2><ul>${renderSources(item)}</ul></section>
    </aside></div>
    <footer class="detail-bottom-actions"><a class="detail-button detail-button--back" href="../../">Torna agli eventi</a><button class="detail-button detail-button--share" type="button" data-share><img src="https://api.iconify.design/lucide/share-2.svg?color=%232878b8" alt="">Condividi</button></footer>`;
  target.querySelectorAll('[data-share]').forEach(button => button.addEventListener('click', async () => {
    const message = [item.title, item.description, location.href].filter(Boolean).join('\n\n');
    try { if (navigator.share) await navigator.share({title:item.title,text:message}); else { await navigator.clipboard.writeText(message); button.textContent='Link copiato'; } } catch (_) {}
  }));
  target.querySelector('.event-detail__media img')?.addEventListener('error', event => {
    const failedImage = event.currentTarget;
    let candidates = [];
    try { candidates = JSON.parse(decodeURIComponent(failedImage.dataset.imageFallbacks || '[]')); } catch (_) {}
    const next = candidates.shift();
    if (next) {
      failedImage.dataset.imageFallbacks = encodeURIComponent(JSON.stringify(candidates));
      failedImage.src = next;
    } else failedImage.closest('.event-detail__media')?.remove();
  });
}

async function loadData() {
  try {
    const response = await fetch(`${SERVICE_BASE}/api/events-data`, { cache: 'no-store' });
    if (!response.ok) throw new Error('remote unavailable');
    return await response.json();
  } catch (_) {
    return window.EVENTS_DATA || {events:[]};
  }
}

loadData().then(data => {
  const item = (data.events || []).find(event => event.slug === wantedSlug);
  if (item && !eventHasEnded(item)) {
    if (location.search && wantedSlug) history.replaceState(null, '', `${encodeURIComponent(wantedSlug)}/index.html`);
    document.querySelectorAll('.detail-page .brand, .detail-header-back, .detail-back').forEach(link => { link.href = '../../'; });
    render(item);
  }
  else renderUnavailable(Boolean(item));
});
