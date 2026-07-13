const catalog = document.querySelector('#catalog');
const empty = document.querySelector('#empty');
const count = document.querySelector('#count');
const search = document.querySelector('#search');
const sort = document.querySelector('#sort');
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
  const data = { url: shareUrl };
  if (navigator.share) {
    await navigator.share(data);
    return;
  }
  await navigator.clipboard.writeText(shareUrl);
  window.alert('Link copiato negli appunti.');
}

function insertionDate(page) {
  return String(page.createdAt || page.updatedAt || '');
}

function render() {
  const query = normalize(search.value.trim());
  const visible = pages.filter(page => {
    const haystack = normalize([page.title, page.description, ...(page.tags || [])].join(' '));
    return page.listed !== false && haystack.includes(query);
  });

  visible.sort((a, b) => {
    if (sort.value === 'title') return String(a.title || '').localeCompare(String(b.title || ''), 'it');
    return insertionDate(b).localeCompare(insertionDate(a));
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
    card.querySelector('.card__date').textContent = formatDate(insertionDate(page));
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
    render();
  })
  .catch(error => {
    empty.hidden = false;
    empty.querySelector('h2').textContent = 'Catalogo non disponibile';
    empty.querySelector('p').textContent = error.message;
    count.textContent = '';
  });

search.addEventListener('input', render);
sort.addEventListener('change', render);