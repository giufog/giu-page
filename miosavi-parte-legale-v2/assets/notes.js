(() => {
  const points = document.querySelectorAll(".note-point");
  const index = document.getElementById("note-index-list");

  if (index) {
    points.forEach((point, position) => {
      const number = position + 1;
      const id = `nota-${number}`;
      point.id ||= id;

      const heading = point.querySelector("h3, summary, strong");
      const raw = (point.dataset.noteTitle || heading?.textContent || point.textContent).trim().replace(/\s+/g, " ");
      const title = raw.length > 58 ? raw.slice(0, 55) + "…" : raw;

      const marker = document.createElement("span");
      marker.className = "note-marker";
      marker.setAttribute("aria-label", `Riferimento per le note: numero ${number}`);
      marker.innerHTML = `N. <strong>${number}</strong>`;
      point.append(marker);

      const item = document.createElement("li");
      item.innerHTML = `<a href="#${point.id}">N. ${number} — ${title}</a>`;
      index.append(item);
    });
  }

  const pageCounter = document.getElementById("page-counter");
  const a4PrintableHeight = 994;
  const updatePageCounter = () => {
    if (!pageCounter) return;
    const total = Math.max(1, Math.ceil(document.documentElement.scrollHeight / a4PrintableHeight));
    const current = Math.min(total, Math.max(1, Math.floor(window.scrollY / a4PrintableHeight) + 1));
    pageCounter.textContent = `Pagina ${current} di ${total}`;
  };

  updatePageCounter();
  window.addEventListener("scroll", updatePageCounter, { passive: true });
  window.addEventListener("resize", updatePageCounter);
  window.addEventListener("load", updatePageCounter, { once: true });
})();
