(() => {
  const q = (selector, scope = document) => scope.querySelector(selector);
  const qa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const searchToggle = q('[data-search-toggle]');
  const searchPanel = q('#page-search');
  const searchInput = q('#page-search-input');
  const searchStatus = q('.page-search__status');
  const prevButton = q('[data-search-prev]');
  const nextButton = q('[data-search-next]');
  const menu = q('.menu');
  const article = q('.article');
  const toast = q('.toast');
  const toTop = q('[data-to-top]');
  let marks = [];
  let current = -1;
  let toastTimer;

  if (new URLSearchParams(location.search).has('print')) {
    qa('.sources').forEach((details) => { details.open = true; });
  }

  qa('table').forEach((table) => {
    const headers = qa('thead th', table).map((cell) => cell.textContent.trim());
    const rows = qa('tbody tr', table);
    if (!headers.length || !rows.length) return;
    const mobile = document.createElement('div');
    mobile.className = 'mobile-table';
    mobile.setAttribute('aria-label', 'Riepilogo in formato mobile');
    rows.forEach((row, rowIndex) => {
      const cells = [...row.children];
      const details = document.createElement('details');
      details.open = rowIndex === 0;
      const summary = document.createElement('summary');
      const label = document.createElement('span');
      label.textContent = cells[0]?.textContent.trim() || `Riga ${rowIndex + 1}`;
      const chevron = document.createElement('img');
      chevron.src = 'https://api.iconify.design/lucide/chevron-down.svg?color=%23173e35';
      chevron.alt = '';
      summary.append(label, chevron);
      const body = document.createElement('div');
      body.className = 'mobile-table__body';
      cells.slice(1).forEach((cell, index) => {
        const term = document.createElement('strong');
        term.textContent = headers[index + 1] || `Dato ${index + 1}`;
        const value = document.createElement('p');
        value.innerHTML = cell.innerHTML;
        body.append(term, value);
      });
      details.append(summary, body);
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        qa('details[open]', mobile).forEach((other) => {
          if (other !== details) other.open = false;
        });
      });
      mobile.append(details);
    });
    table.closest('.table-wrap')?.insertAdjacentElement('afterend', mobile);
  });

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2500);
  };

  const clearMarks = () => {
    qa('mark[data-page-mark]').forEach((mark) => mark.replaceWith(document.createTextNode(mark.textContent)));
    article.normalize();
    marks = [];
    current = -1;
  };

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const collectTextNodes = () => {
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue.trim() || parent.closest('script, style, mark')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  };

  const selectMark = (index, shouldScroll = true) => {
    if (!marks.length) return;
    marks.forEach((mark) => mark.classList.remove('is-current'));
    current = (index + marks.length) % marks.length;
    marks[current].classList.add('is-current');
    searchStatus.textContent = `Risultato ${current + 1} di ${marks.length}`;
    if (shouldScroll) marks[current].scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const runSearch = () => {
    clearMarks();
    const term = searchInput.value.trim();
    if (term.length < 2) {
      searchStatus.textContent = 'Scrivi almeno due caratteri.';
      prevButton.disabled = true;
      nextButton.disabled = true;
      return;
    }
    const expression = new RegExp(escapeRegExp(term), 'gi');
    collectTextNodes().forEach((node) => {
      const text = node.nodeValue;
      if (!expression.test(text)) return;
      expression.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let last = 0;
      text.replace(expression, (match, offset) => {
        fragment.append(text.slice(last, offset));
        const mark = document.createElement('mark');
        mark.dataset.pageMark = '';
        mark.textContent = match;
        fragment.append(mark);
        last = offset + match.length;
        return match;
      });
      fragment.append(text.slice(last));
      node.replaceWith(fragment);
    });
    marks = qa('mark[data-page-mark]', article);
    prevButton.disabled = marks.length < 2;
    nextButton.disabled = marks.length < 2;
    if (!marks.length) {
      searchStatus.textContent = 'Nessun risultato.';
      return;
    }
    selectMark(0, false);
  };

  searchToggle.addEventListener('click', () => {
    const open = searchPanel.hidden;
    searchPanel.hidden = !open;
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      menu.open = false;
      searchInput.focus({ preventScroll: true });
    } else {
      clearMarks();
      searchInput.value = '';
      searchStatus.textContent = 'Scrivi almeno due caratteri.';
    }
  });
  searchInput.addEventListener('input', runSearch);
  prevButton.addEventListener('click', () => selectMark(current - 1));
  nextButton.addEventListener('click', () => selectMark(current + 1));

  menu.addEventListener('toggle', () => {
    if (menu.open) {
      searchPanel.hidden = true;
      searchToggle.setAttribute('aria-expanded', 'false');
      clearMarks();
    }
  });
  qa('.menu__panel a').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const target = q(link.getAttribute('href'));
    menu.open = false;
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', location.pathname + location.search);
  }));

  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    menu.open = false;
    if (!searchPanel.hidden) searchToggle.click();
  });

  q('[data-print]').addEventListener('click', () => window.print());
  const printDetails = qa('.sources');
  const printStates = new Map();
  window.addEventListener('beforeprint', () => {
    printDetails.forEach((details) => {
      printStates.set(details, details.open);
      details.open = true;
    });
  });
  window.addEventListener('afterprint', () => {
    printDetails.forEach((details) => {
      details.open = printStates.get(details) ?? false;
    });
    printStates.clear();
  });
  q('[data-share]').addEventListener('click', async (event) => {
    const url = event.currentTarget.dataset.shareUrl;
    try {
      if (navigator.share) await navigator.share({ url });
      else {
        await navigator.clipboard.writeText(url);
        showToast('Link copiato negli appunti.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') showToast('Non è stato possibile condividere il link.');
    }
  });

  const updateTopButton = () => toTop.classList.toggle('is-visible', window.scrollY > 650);
  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
