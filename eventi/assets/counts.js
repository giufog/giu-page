/* Shared totals live on the server. Browser storage only suppresses rapid repeats. */
(() => {
  const endpoint = 'https://giu-page-eventi-update.docile-aspen-8173.chatgpt.site/api/events-counts';
  const counts = new Map();
  const receipts = new Map();
  const number = new Intl.NumberFormat('it-IT');
  const eye = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const share = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/></svg>';
  const valid = page => /^(index|[a-z0-9][a-z0-9-]{0,179})$/.test(page);
  function markup(page) {
    if (!valid(page)) return '';
    return `<div class="event-counts" data-event-counts="${page}"><span title="Aperture della pagina; le ricariche ravvicinate non si sommano">${eye}<b data-count-views>—</b><span>visualizzazioni</span></span><span title="Utilizzi del pulsante Condividi, non invii confermati o inoltri in WhatsApp">${share}<b data-count-shares>—</b><span>condivisioni</span></span></div>`;
  }
  function paint() {
    document.querySelectorAll('[data-event-counts]').forEach(node => {
      const item = counts.get(node.dataset.eventCounts);
      node.querySelector('[data-count-views]').textContent = item ? number.format(item.views) : '—';
      node.querySelector('[data-count-shares]').textContent = item ? number.format(item.shares) : '—';
      node.setAttribute('aria-label', item ? `${item.views} visualizzazioni, ${item.shares} utilizzi del pulsante Condividi` : 'Conteggi momentaneamente non disponibili');
    });
  }
  function receive(data) {
    if (!data.ok || !data.counts) throw new Error('Conteggi non disponibili');
    Object.entries(data.counts).forEach(([page, item]) => {
      const old = counts.get(page);
      counts.set(page, { views: Math.max(old?.views || 0, item.views), shares: Math.max(old?.shares || 0, item.shares) });
    });
    paint();
  }
  let timer;
  function refresh() {
    paint();
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const pages = [...new Set([...document.querySelectorAll('[data-event-counts]')].map(node => node.dataset.eventCounts))];
      try {
        for (let offset = 0; offset < pages.length; offset += 80) {
          const response = await fetch(`${endpoint}?pages=${encodeURIComponent(pages.slice(offset, offset + 80).join(','))}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
          if (!response.ok) throw new Error('Conteggi non disponibili');
          receive(await response.json());
        }
      } catch { /* Leave unavailable values as dashes, never invent zero totals. */ }
    }, 150);
  }
  function track(page, kind) {
    if (location.hostname !== 'giufog.github.io' || !valid(page)) return;
    const key = `eventi-count:${page}:${kind}`;
    const now = Date.now();
    let receipt = receipts.get(key);
    try { receipt = JSON.parse(localStorage.getItem(key)) || receipt; } catch { /* Storage may be unavailable. */ }
    if (!receipt || receipt.until <= now) {
      receipt = { token: crypto.randomUUID(), until: now + (kind === 'view' ? 1800000 : 10000) };
      receipts.set(key, receipt);
      try { localStorage.setItem(key, JSON.stringify(receipt)); } catch { /* In-page deduplication remains available. */ }
    }
    // Retry the same token safely: the database rejects duplicate increments.
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ page, kind, token: receipt.token }), keepalive: true })
      .then(response => { if (!response.ok) throw new Error('Conteggio non disponibile'); return response.json(); })
      .then(receive).catch(() => {});
  }
  function pageFromUrl(url) {
    try {
      const path = new URL(url, location.href).pathname;
      const detail = path.match(/\/eventi\/dettaglio\/([^/]+)\/(?:index\.html)?$/);
      return detail ? decodeURIComponent(detail[1]) : 'index';
    } catch { return 'index'; }
  }
  window.EventCounts = { markup, refresh, share: url => { try { track(pageFromUrl(url), 'share'); } catch { /* Never block sharing if telemetry is unavailable. */ } } };
  function start() {
    document.querySelectorAll('[data-counts-placeholder]').forEach(node => { node.outerHTML = markup(node.dataset.countsPlaceholder); });
    refresh();
    let recorded = false;
    function visibleVisit() {
      if (recorded || document.visibilityState !== 'visible') return;
      setTimeout(() => {
        if (recorded || document.visibilityState !== 'visible') return;
        recorded = true;
        track(pageFromUrl(location.href), 'view');
      }, 1000);
    }
    document.addEventListener('visibilitychange', visibleVisit);
    visibleVisit();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
