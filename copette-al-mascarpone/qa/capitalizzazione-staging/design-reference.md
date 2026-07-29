# Giu Page — design reference

Riferimento fedele della home `https://giufog.github.io/giu-page/`, basato sui
file pubblicati del sito. Non contiene credenziali o dati riservati.

## Regola editoriale trasversale

La grafica standard ospita contenuti generali e impersonali. Titoli, descrizioni,
card, avvisi, tabelle, metadati e copertine non devono rivelare che la pagina è
stata creata per Giuseppe/Giu o a partire da una situazione personale
dell'utente. Generalizzare la formulazione senza cambiare significato, dati,
avvertenze o fonti. I riferimenti esterni necessari al contenuto sono ammessi.

## Riferimenti verificabili

- Home pubblica: `https://giufog.github.io/giu-page/`
- Standard grafico pubblico:
  `https://giufog.github.io/giu-page/pagina-esempio/`
- Pagina campione locale: `PAGINA-ESEMPIO/index.html`

Gli screenshot storici sono archiviati in `TMP Cancellabile` e non costituiscono
una dipendenza dello standard.

Questo documento e `PAGINA-ESEMPIO/index.html` sono due rappresentazioni dello
stesso standard. Qualunque modifica a uno dei due deve essere riportata
immediatamente nell'altro.

Per le pagine di contenuto, lo standard grafico pubblico è l'autorità visiva.
Prima di modificare o creare una pagina bisogna aprire standard e pagina allo
stesso viewport e confrontarli. Una pagina tematica non diventa un nuovo
standard soltanto perché è stata pubblicata più di recente.

## 1. Palette

| Colore | HEX | Utilizzo |
|---|---|---|
| Verde bosco | `#173E35` | Testo principale, estremità scura del gradiente header, icona GP. |
| Verde salvia | `#4D8A70` | Estremità chiara del gradiente header; dettagli dell'icona. |
| Verde azione | `#217A46` | Hover titoli card e bordo dei controlli in focus. |
| Rosso stampa | `#B23A3A` | Icona e testo del pulsante Stampa PDF. |
| Azzurro condivisione | `#2878B8` | Icona e testo di tutti i pulsanti Condividi. |
| Salvia chiara | `#E5F0E8` | Fondi leggeri, tag e stati selezionati. |
| Salvia molto chiara | `#E7F0E9` | Sfondo di riserva per l'area immagine della card. |
| Fondo pagina | `#F1F6F1` | Sfondo generale. |
| Bianco | `#FFFFFF` | Campi di ricerca/ordinamento e card. |
| Bordo salvia | `#D8E5DC` | Bordi di campi e card. |
| Testo secondario | `#64756B` | Data, descrizione, contatore e stato vuoto. |
| Verde chiaro icona | `#9BE878` | Due quadratini della favicon GP. |

Ombre e focus:

- input/select: `0 5px 18px rgb(23 62 53 / 5%)`;
- card: `0 10px 28px rgb(23 62 53 / 7%)`;
- focus: outline `3px solid rgb(77 138 112 / 24%)` e bordo `#217A46`.

## 2. Tipografia

Famiglia unica:

```text
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
"Segoe UI", sans-serif
```

Ogni titolo visibile deve iniziare con una lettera maiuscola. La stessa
capitalizzazione deve essere mantenuta nei metadati HTML, in `page.json` e nel
catalogo. Non trasformare automaticamente l'intero titolo in maiuscolo: si
normalizza almeno la prima lettera, conservando il resto della formulazione.

| Elemento | Dimensione | Peso / note |
|---|---:|---|
| Titolo header `h1` | `clamp(2rem, 7vw, 3.2rem)` | line-height `1`; margine `0`. |
| Titolo card `h2` | `1.25rem` | colore principale; transizione colore `0.15s ease`. |
| Data card | `.78rem` | colore secondario. |
| Corpo e controlli | dimensione base browser | `font: inherit`. |
| Descrizione card | dimensione base browser | line-height `1.5`, colore secondario. |
| Pulsante Condividi | dimensione base browser | peso `750`. |

## 3. Spaziature e dimensioni

- Larghezza massima di header interno e contenuto strutturale: `1600px`;
  desktop `width: min(1600px, calc(100vw - 48px))`.
- Il limite `68–72ch` si applica soltanto ai paragrafi lunghi, mai a pagina,
  hero, griglie, immagini, tabelle o card.
- Gutter: `24px` desktop, `16px` tablet, `12px` mobile.
- Header pagina di contenuto: altezza `64px`; su mobile `58px`.
  Non esiste un footer visibile nella home attuale.
- Contenuto: padding verticale `20px 0 40px`.
- Barra controlli: griglia due colonne uguali, gap orizzontale `16px`, verticale
  `12px`, margine sotto `24px`.
- Input/select: padding `10px 12px`, raggio massimo `6px`, bordo `1px`.
- Catalogo: griglia `repeat(auto-fit, minmax(280px, 1fr))`, gap `12–16px`.
- Card: raggio massimo `6px`, bordo `1px`, immagine in rapporto `16:9`.
- Corpo card: padding `12px` mobile e massimo `16px` desktop; nessuno spazio
  riservato artificialmente a pulsanti assoluti.
- Pulsante Condividi: nel normale flusso della card; altezza minima `44px`;
  padding `9px 14px`; raggio `6px`; icona a tre nodi `19px`; superficie bianca,
  icona e testo `#2878B8`.
- Stato vuoto: padding `55px 20px`.

Tutti i componenti dell'interfaccia sono rettangolari o quadrati arrotondati.
Sono vietati pillole, capsule, bottoni circolari, `border-radius:999px` e `50%`.
I raggi della pagina di contenuto sono `8px` per elementi piccoli, `12px` per
controlli e superfici ordinarie, `18px` per card principali. Il torna-su usa un
quadrato `48×48px` con raggio `14px`.

## 4. Struttura della pagina

La Home usa la stessa barra compatta e sticky delle pagine di contenuto: logo GP,
scritta `Giu Page`, lente di ricerca e menu a quattro linee contenente tutte le
pagine disponibili. Il catalogo è ordinato per data decrescente e non mostra un
selettore di ordinamento.

1. **Header `.hero`**: fascia con gradiente diagonale da `#173E35` a `#4D8A70`;
   contiene solo il titolo “Giu Page”.
2. **Main `.content`**: area centrata sul fondo salvia chiaro.
3. **Controlli `.toolbar`**: ricerca a sinistra, ordinamento a destra, contatore
   a tutta larghezza sotto. L'ordinamento predefinito mostra le pagine più
   recenti prima; l'alternativa è titolo A–Z.
4. **Catalogo `.catalog`**: card generate da `catalogo.json`. Ogni card ha
   copertina, data di inserimento, titolo, descrizione e pulsante Condividi.
   Il pulsante replica il componente delle pagine: superficie bianca, simbolo a
   tre nodi e testo azzurro-blu.
5. **Stato vuoto `.empty`**: compare solo senza pagine o quando il catalogo non
   è disponibile.
6. **Footer**: assente nella versione attuale della home.

### Barra globale delle pagine di contenuto

Questi valori sono invarianti e devono coincidere con “Standard grafico da
provare”:

| Elemento | Valori |
|---|---|
| Header interno | `64px`, padding `10px 20px`; mobile `58px`, padding `10px 16px` |
| Gruppo azioni | gap `8px`; nell'app: tre puntini nativi, lente, quattro linee |
| Lente e quattro linee | `44×44px`, raggio `12px`, bordo bianco al `38%`, sfondo trasparente |
| Tre puntini nativi | `44×44dp`, raggio `12dp`, stesso bordo e stessa quota verticale |
| Torna-su | `48×48px`, raggio `14px`, `left:14px`, `bottom:14px`, fondo `#E5F0E8` |
| Contatore | `right:12px`, `bottom:14px`, padding `7px 9px`, raggio `9px`, fondo bianco all'`82%` |

Il controllo a tre puntini è nativo Android. Il CSS della pagina non deve
compensarne la posizione o la forma. Qualunque modifica della barra globale
richiede un confronto sul telefono reale e, se necessario, una modifica
coordinata dell'app.

## 4A. Testata standard delle pagine di contenuto

La testata delle singole pagine usa lo stesso gradiente, ma segue una struttura
obbligatoria più ricca:

1. titolo `h1` come primo elemento visibile;
2. nessuna scritta, eyebrow, categoria o etichetta sopra il titolo;
3. descrizione `.hero__lead` di massimo 20 parole;
4. metadati `.page-meta` piccoli e secondari:
   `<pagine PDF>, create il <data>, e da <minuti> minuti di lettura.`;
5. due pulsanti affiancati: `.button--print` con testo `Stampa PDF` e
   `.button--share` con testo `Condividi`.

Non aggiungere ulteriori pulsanti nella testata. Il numero di pagine viene
verificato nell'anteprima di stampa A4 di Google Chrome. Il tempo di lettura usa
circa 200 parole al minuto, arrotondate per eccesso.

Il totale A4 deve coincidere nella riga metadati, in `data-total-pages`, nel testo
iniziale del contatore e in `pageCount` dentro `page.json`. Dopo ogni modifica a
contenuto o CSS di stampa il PDF va rigenerato: un numero copiato dalla versione
precedente è un errore.

Valori raccomandati:

- `.hero__lead`: margine superiore `7–10px`, colore bianco all'86%, dimensione
  `clamp(.94rem, 2vw, 1.1rem)`;
- `.page-meta`: `display:flex`, wrap attivo, gap `5px 9px`, margine superiore
  `17px`, colore bianco al 70%, dimensione `.86rem`;
- `.hero__actions`: margine superiore `19px`;
- `.button--print` e `.button--share`: stessa altezza minima `44px`, stessa
  superficie bianca, stesso bordo, ombra e raggio `12px`; devono restare
  affiancati in due colonne anche su mobile;
- `.button--print`: icona e testo rossi `#B23A3A`;
- `.button--share`: icona e testo azzurro-blu `#2878B8`; condivide soltanto
  l'URL previsto per WhatsApp; usa sempre l'icona a tre nodi collegati da
  `19px`. Lo stesso componente visivo si usa nelle card della Home.

La stampa usa `@page { size: A4; }`, nasconde header di navigazione, menu,
pulsanti e footer, apre temporaneamente le fonti e riduce le interruzioni dentro
card, avvisi e tabelle brevi.

I menu `<details class="menu">` si chiudono sia dal relativo pulsante sia con un
tocco/clic esterno o con il tasto `Escape`. Un'interazione interna non deve
chiudere anticipatamente il menu.

Il menu a quattro linee è l'unico indice della pagina: contiene tutte le sezioni,
chiude il pannello dopo la scelta e non viene duplicato nel contenuto o in una
barra laterale. La lente apre una ricerca reale con campo testuale, conteggio dei
risultati e navigazione mediante `Trova` o `Invio`.

I link interni scorrono alla sezione e aggiornano l'URL con
`history.replaceState()`, senza accumulare passaggi nella cronologia. Il pulsante
Indietro dell'app torna così alla pagina precedente o alla home.

## 5. Responsive

Il passaggio verticale/orizzontale deve mantenere lo stesso numero di pagine e
lo stesso eventuale filtro di ricerca. La Home ascolta i cambi di viewport e
ridisegna il catalogo completo; nell'app Android la rotazione non deve ricreare
la WebView né richiedere un aggiornamento manuale.

### Desktop da 900 px

- Header e contenuto occupano tutta la larghezza utile fino a `1600px`.
- Non lasciare complessivamente oltre il `10%` del viewport vuoto ai lati.
- Usare griglia a 12 colonne o `auto-fit/minmax()`; i blocchi indipendenti
  devono affiancarsi.
- Tabelle, confronti e griglie usano tutta la larghezza disponibile.
- Ingredienti, attrezzi, passaggi e altri elementi brevi ripetibili usano
  `repeat(auto-fit, minmax(..., 1fr))`: una sola riga sul desktop quando
  possibile e ritorno a capo automatico quando il viewport si restringe.
- Le tabelle restano complete su desktop; su mobile ogni riga diventa una card
  rettangolare, con prima cella come testata verde e celle successive in forma
  `etichetta | valore`, senza scorrimento orizzontale.
- Ogni pubblicazione che modifica CSS o JavaScript aggiorna il parametro di
  versione degli asset (`?v=AAAAMMGG-N`) per impedire a browser e WebView di
  mostrare una grafica precedente conservata in cache.

### Tablet da 600 a 899 px

- Gutter `16px`.
- Due colonne per contenuti indipendenti.
- Evitare il ritorno prematuro alla lunga successione verticale mobile.

### Mobile fino a 599 px

- Gutter `12px`.
- Una colonna per i blocchi complessi; coppie di azioni, ingredienti e dati
  brevi possono restare in due o tre colonne.
- Card `10–12px` di padding, sezioni distanti circa `24px`.
- La tabella diventa una serie di schede chiave/valore senza scorrimento
  orizzontale dell'intera pagina.
- Nel primo viewport devono comparire barra, titolo, descrizione, azioni e
  inizio reale del contenuto.

## 6. Classi CSS principali

| Classe / selettore | Valori chiave |
|---|---|
| `:root` | token palette; `color-scheme: light`; famiglia tipografica globale. |
| `body` | `margin: 0`; colore `--ink`; sfondo `--wash`. |
| `.hero` | gradiente `135deg`; padding compatto; testo bianco. |
| `.hero__inner`, `.content` | `width: min(1600px, calc(100% - 2 * var(--gutter)))`; `margin: 0 auto`. |
| `.content` | `padding: 20px 0 40px`. |
| `.toolbar` | grid 2 colonne `minmax(0, 1fr)`; `gap: 12px 16px`. |
| `.search input`, `.sort select` | larghezza 100%, padding `10px 12px`, raggio `6px`, bordo salvia. |
| `.count` | estensione su entrambe le colonne; colore secondario. |
| `.catalog` | auto-fit, card minime `280px`, gap `12–16px`. |
| `.card` | relativo, overflow nascosto, raggio massimo `6px`, bordo e ombra. |
| `.card__media` | `aspect-ratio: 16 / 9`; `object-fit: cover` per l'immagine. |
| `.card__body` | `padding: 12–16px`; nessun vuoto riservato a controlli assoluti. |
| `.share` | Home: nel flusso della card; altezza minima `44px`, superficie bianca, raggio `6px`, icona a tre nodi `19px` e icona/testo `#2878B8`. |
| `.empty` | testo centrato; `padding: 55px 20px`. |
| `.sr-only` | accessibilità: elemento nascosto visivamente. |
| `.hero__lead` | descrizione pagina, massimo 20 parole. |
| `.page-meta` | pagine PDF, data di creazione e tempo di lettura. |
| `.button--print` | primo pulsante sotto i metadati; usa `GiuPageNative.print()` nell'app e `window.print()` sul web. |
| `.button--share` | secondo pulsante sotto i metadati; condivide soltanto l'URL canonico. |
| `.page-search` | pannello ricerca aperto dalla lente, con risultati nel contenuto. |
| `.menu__panel` | indice unico della pagina, aperto dal pulsante a quattro linee. |
| `.page-counter` | contatore fisso in basso a destra: `Pagina X di Y`; destra `12px`, fondo `14px`, raggio `9px`; nella stampa è sostituito dal contatore reale nel margine A4. |
| `.back-to-top` | quadrato `48×48px`, raggio `14px`, sinistra/fondo `14px`, freccia `↑`, ritorno dolce all'inizio. |

## Icona

La favicon è `assets/gp-icon.svg`: quadrato verde bosco arrotondato, quattro
quadratini salvia in alto a sinistra e monogramma “GP” chiaro in basso a destra.
È l'icona di riferimento anche per l'applicazione e deve apparire nella barra
superiore prima della scritta `Giu Page`. Usare il file grafico reale, non una
scritta `GP` ricreata via HTML/CSS.
