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
  document.querySelectorAll('mark.search-highlight').forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));
  document.querySelector('.search-result')?.classList.remove('search-result');
}

function collectSearchResults() {
  const y=window.scrollY;
  document.querySelectorAll('mark.search-highlight').forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));
  document.querySelector('main').normalize();
  searchMatches=[];searchIndex=-1;
  const query=searchInput.value.trim().toLocaleLowerCase('it');
  if(query.length>=2) {
    const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);
    const nodes=[];let node;
    while(node=walker.nextNode()) if(!node.parentElement.closest('script,style,button,details.sources')) nodes.push(node);
    nodes.forEach(node=>{
      const value=node.textContent,lower=value.toLocaleLowerCase('it');let pos=0,index;const fragment=document.createDocumentFragment();let found=false;
      while((index=lower.indexOf(query,pos))!==-1){found=true;fragment.append(document.createTextNode(value.slice(pos,index)));const mark=document.createElement('mark');mark.className='search-highlight';mark.textContent=value.slice(index,index+query.length);fragment.append(mark);searchMatches.push(mark);pos=index+query.length;}
      if(found){fragment.append(document.createTextNode(value.slice(pos)));node.replaceWith(fragment);}
    });
  }
  searchPrevious.disabled=searchNext.disabled=searchMatches.length===0;
  searchStatus.textContent=query.length<2?'Scrivi almeno due caratteri.':`${searchMatches.length} risultati.`;
  window.scrollTo({top:y,behavior:'instant'});
}
function showSearchResult(direction){if(!searchMatches.length)return;searchMatches.forEach(m=>m.classList.remove('search-active'));searchIndex=(searchIndex+direction+searchMatches.length)%searchMatches.length;const mark=searchMatches[searchIndex];mark.classList.add('search-active');mark.scrollIntoView({behavior:'smooth',block:'center'});searchStatus.textContent=`Risultato ${searchIndex+1} di ${searchMatches.length}.`;}
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

document.querySelector('[data-share]')?.addEventListener('click', async (event) => {
  if(!document.querySelector('link[rel=canonical]')) { toast.textContent='La condivisione sarà disponibile dopo la pubblicazione.'; toast.classList.add('is-visible'); setTimeout(()=>toast.classList.remove('is-visible'),3200); return; }
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

function navigationUrl(item) {
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

function applyAndroidMapLinks(root = document) {
  if (!/Android/i.test(navigator.userAgent)) return;
  const inGiuPageApp = Boolean(window.GiuPageNative);
  root.querySelectorAll('a[data-map-link]').forEach(link => {
    const webUrl = link.dataset.webMapsUrl || navigationUrl({mapsUrl: link.href});
    link.dataset.webMapsUrl = webUrl;
    link.href = inGiuPageApp ? androidGeoUrl(webUrl) : androidMapsIntentUrl(webUrl);
    link.removeAttribute('target');
  });
}


applyAndroidMapLinks();
function updateProgress(){const max=document.documentElement.scrollHeight-window.innerHeight;document.documentElement.style.setProperty('--reading-progress',`${max>0?window.scrollY/max*100:0}%`)}window.addEventListener('scroll',updateProgress,{passive:true});window.addEventListener('resize',updateProgress);updateProgress();let sourceWasOpen=false;window.addEventListener('beforeprint',()=>{sourceWasOpen=sources.open;sources.open=true});window.addEventListener('afterprint',()=>{sources.open=sourceWasOpen});