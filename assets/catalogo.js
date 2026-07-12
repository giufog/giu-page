const catalog = document.querySelector('#catalog');
const empty = document.querySelector('#empty');
const count = document.querySelector('#count');
const search = document.querySelector('#search');
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

async function sharePage(page) {
  const shareUrl = page.shareUrl || page.url;
  const data = { title: page.title, text: page.description, url: shareUrl };
  if (navigator.share) {
    await navigator.share(data);
    return;
  }
  await navigator.clipboard.writeText(shareUrl);
  window.alert('Link copiato negli appunti.');
}

function render() {
  const query = normalize(search.value.trim());
  const visible = pages.filter(page => {
    const haystack = normalize([page.title, page.description, ...(page.tags || [])].join(' '));
    return page.listed !== false && haystack.includes(query);
  });

  catalog.replaceChildren();
  empty.hidden = visible.length !== 0;
  count.textContent = `${visible.length} ${visible.length === 1 ? 'pagina' : 'pagine'}`;

  for (const page of visible) {
    const card = template.content.cloneNode(true);
    const link = card.querySelector('.card__link');
    const media = card.querySelector('.card__media');
    const image = media.querySelector('img');
    link.href = page.url;
    card.querySelector('.card__date').textContent = formatDate(page.updatedAt || page.createdAt);
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
    pages.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    render();
  })
  .catch(error => {
    empty.hidden = false;
    empty.querySelector('h2').textContent = 'Catalogo non disponibile';
    empty.querySelector('p').textContent = error.message;
    count.textContent = '';
  });

search.addEventListener('input', render);
