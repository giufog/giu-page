# Design QA — Copette al mascarpone

Data: 29 luglio 2026

## Riferimento vincolante

- Pagina: `https://giufog.github.io/giu-page/pagina-esempio/`
- Titolo del riferimento: `Standard grafico da provare`
- Standard locale: `F:\05 - Vibecoding\Codex\Pagine online\PAGINA-ESEMPIO`

## Confronto visivo

Evidenze principali:

- `standard-desktop-01-top.png`
- `implementation-desktop-top.png`
- `standard-mobile-01-top.png`
- `implementation-mobile-top.png`
- `implementation-desktop-variants.png`
- `implementation-desktop-table.png`
- `implementation-mobile-recipe.png`
- `implementation-mobile-menu.png`
- `implementation-mobile-search.png`

Sono stati confrontati nello stesso controllo visivo il riferimento desktop e
l'implementazione desktop.

## Controlli eseguiti

- viewport desktop: `1440 × 1000`;
- viewport mobile: `390 × 844`;
- nessun overflow orizzontale dell'intera pagina;
- nessuna immagine mancante;
- un solo `h1`;
- nessun `id` duplicato;
- menu mobile aperto e verificato: 6 collegamenti;
- ricerca verificata con la parola `mascarpone`: 25 risultati;
- pulsante “torna su” verificato con scorrimento e ritorno a `scrollY = 0`;
- pulsante “torna su”: `48 × 48 px`, fondo `rgb(229, 240, 232)`,
  testo `rgb(23, 62, 53)`, raggio `14 px`;
- contatore: fondo bianco semitrasparente e raggio `9 px`;
- tabella larga contenuta in un'area con scorrimento proprio, senza allargare
  il documento;
- nessun overlay di errore locale.

## Esito

**Superato.**

Difetti aperti:

- P0: nessuno;
- P1: nessuno;
- P2: nessuno.

La pagina locale rispetta la struttura e i controlli dello standard grafico del
27 luglio 2026. Nessuna pubblicazione è stata eseguita durante la revisione.
