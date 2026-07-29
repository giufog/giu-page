# Pagine online — manuale operativo centrale

Questo file è la fonte principale per creare e pubblicare pagine su **Giu Page**.
Deve essere letto integralmente da qualunque progetto Codex incaricato di creare,
adattare, controllare o pubblicare una pagina.

## ISTRUZIONE IMMEDIATA PER QUALUNQUE AGENTE CODEX

Se stai leggendo questo file da un altro progetto, devi occuparti tu dell'intero
flusso tecnico. L'utente deve soltanto:

1. indicare il titolo, se non è già presente;
2. approvare l'anteprima HTML;
3. scegliere una delle quattro copertine;
4. autorizzare la pubblicazione.

Non chiedere all'utente account GitHub, repository, branch, password, codici,
comandi, configurazioni o operazioni nel browser. Non mandarlo su GitHub e non
delegargli passaggi tecnici. Tutti i dati non segreti necessari sono già in
questo manuale e in `pubblicazione.config.json`; l'autorizzazione tecnica è già
installata sul PC.

Per pubblicare devi usare esclusivamente:

```text
F:\05 - Vibecoding\Codex\Pagine online\pubblica-giu-page.ps1
```

Il risultato è valido soltanto quando:

- lo script restituisce `PUBBLICAZIONE_COMPLETATA`;
- l'URL pubblico risponde correttamente;
- pagina, CSS, immagini e collegamenti funzionano;
- la copertina e i metadati WhatsApp sono corretti;
- la pagina compare in `catalogo.json` e nella Home;
- non sono stati pubblicati segreti o percorsi locali.

Se qualcosa fallisce, diagnostica e correggi autonomamente script, clone tecnico,
configurazione SSH, struttura della pagina o conflitto Git. Non sostituire il
flusso con login web, GitHub CLI o richieste di codici all'utente.

## 0. Regola fondamentale

Il progetto `Pagine online` è soltanto un **hub di istruzioni, configurazione e
riferimenti grafici**.

Le pagine, le anteprime HTML, le quattro proposte di copertina e gli altri file
di lavorazione devono essere creati e conservati **nel progetto che sta
realizzando la pagina**, non dentro `Pagine online`.

Il progetto esterno viene qui soltanto per leggere:

- questo manuale;
- `design-reference.md`;
- `PAGINA-ESEMPIO/`;
- `pubblicazione.config.json`;
- le istruzioni di autenticazione e pubblicazione GitHub.

Non creare nuove cartelle `ANTEPRIMA_*`, `DA_PUBBLICARE`,
`EXPORT_PAGINA_ONLINE`, `.pubblica-tmp` o cartelle di copertine nella root di
`Pagine online`.

## 0A. Pubblicazione senza login ripetuti

Per la normale pubblicazione **non aprire GitHub nel browser e non avviare il
login interattivo**. Ogni progetto o nuova chat deve usare il pubblicatore
centrale `pubblica-giu-page.ps1`. Lo script usa una deploy key SSH già
autorizzata in lettura e scrittura esclusivamente sul repository
`giufog/giu-page`, branch `main`.

Il pubblicatore centrale PowerShell con deploy key SSH è il percorso unico
ordinario. Il connettore GitHub di Codex è soltanto una risorsa tecnica di
emergenza per diagnosticare o ripristinare il flusso, non una procedura da
proporre all'utente.

Non usare GitHub CLI, browser, password, SMS, codici 2FA o recovery code per
pubblicare. La verifica umana di GitHub è estranea al flusso tecnico.

### Procedura express obbligatoria

Quando l'utente scrive `Ok, pubblica con l'immagine N`, l'agente deve:

1. verificare che l'immagine scelta sia salvata come
   `assets/share-whatsapp.jpg`;
2. verificare `index.html`, `page.json`, asset, metadati Open Graph e
   `catalogo.json`;
3. leggere `pubblicazione.config.json`;
4. eseguire:

   ```powershell
   & "C:\Program Files\PowerShell\7\pwsh.exe" -NoProfile -File `
      "F:\05 - Vibecoding\Codex\Pagine online\pubblica-giu-page.ps1" `
      -SourcePath "<CARTELLA_FINALE_DELLA_PAGINA>" `
      -CommitMessage "Pubblica <TITOLO_DELLA_PAGINA>"
   ```

5. attendere `PUBBLICAZIONE_COMPLETATA`;
6. verificare GitHub Pages, Home, copertina e URL pubblico;
7. restituire il collegamento pubblico soltanto dopo i controlli.

Non chiedere quale account, repository o branch usare: sono già definiti.
Non aprire GitHub e non eseguire `gh auth login`. Se lo script segnala un errore,
diagnosticare chiave SSH, clone o conflitto Git senza deviare verso il login web.

### Preflight tecnico, quando serve

Per controllare il collegamento prima della pubblicazione senza creare commit:

```powershell
& "C:\Program Files\PowerShell\7\pwsh.exe" -NoProfile -File `
  "F:\05 - Vibecoding\Codex\Pagine online\pubblica-giu-page.ps1" `
  -SourcePath "<CARTELLA_FINALE_DELLA_PAGINA>" `
  -ValidateOnly
```

L'esito corretto è:

```text
PUBBLICATORE_PRONTO
Accesso SSH, repository e branch main verificati senza login interattivo.
```

Il controllo va eseguito dall'agente, non richiesto all'utente. Se l'ambiente
protetto di Codex blocca rete o Git, ripetere il medesimo comando tramite
l'esecuzione autorizzata del pubblicatore centrale; non cambiare metodo.

## 0B. Regola editoriale obbligatoria: nessun riferimento personale

Ogni pagina pubblica deve essere scritta come contenuto **generale e
impersonale**, utile a qualunque lettore. Non deve mai far capire, nemmeno
indirettamente, che la pagina è stata creata per Giuseppe/Giu, per l'utente che
ha dato l'incarico o a partire da una sua situazione personale.

Questa regola si applica anche quando la richiesta originale è formulata in
prima persona o contiene problemi, sintomi, esigenze, abitudini o circostanze
personali.

Esempi:

- non scrivere `Giu ha un problema di forfora`;
- non scrivere `l'utente soffre di forfora`;
- non scrivere `questa pagina è stata preparata per il problema descritto da
  Giuseppe`;
- scrivere invece `Per problemi di forfora...`, `In presenza di forfora...` o
  `Le possibili opzioni per la forfora sono...`.

Eliminare o generalizzare:

- nome, cognome, soprannome e iniziali dell'utente;
- formule come `io`, `tu`, `il mio caso`, `nel tuo caso`, `la tua situazione`;
- riferimenti a chat, richieste, conversazioni o progetti personali;
- dettagli biografici, sanitari, familiari, lavorativi o geografici che possano
  rendere riconoscibile il destinatario, salvo esplicita richiesta contraria;
- frasi che presentino una conclusione come consiglio personale rivolto
  direttamente all'utente.

Sono ammessi nomi e riferimenti esterni necessari al contenuto, come autori,
enti, professionisti citati nelle fonti, marchi, istituzioni e personaggi
pubblici. Non devono però essere collegati all'identità o alla situazione
personale dell'utente.

Prima di creare l'anteprima, fare un controllo editoriale specifico e
generalizzare ogni riferimento personale senza alterare dati, avvertenze,
significato tecnico o fonti. Se l'utente chiede esplicitamente una pagina
personale, privata o nominativa, fermarsi e chiedere conferma prima di derogare a
questa regola.

## 0C. Sincronizzazione obbligatoria tra manuale e pagina di esempio

`pagineonline.md`, `design-reference.md`, `README.md` e
`PAGINA-ESEMPIO/index.html` descrivono e mostrano **un unico standard**. Devono
sempre combaciare.

- Se viene modificata la grafica, la struttura o una funzione della pagina di
  esempio, aggiornare nello stesso lavoro i file MD interessati.
- Se viene aggiunta o modificata una regola nei file MD, aggiornare nello stesso
  lavoro la pagina di esempio affinché la mostri concretamente.
- Non dichiarare conclusa una modifica finché documentazione e pagina di esempio
  sono coerenti.
- In caso di differenza, non scegliere arbitrariamente quale versione seguire:
  confrontarle, correggere entrambe e mantenere la decisione più recente
  approvata dall'utente.

La pagina di esempio è la dimostrazione visiva e funzionale del manuale; il
manuale è la descrizione operativa della pagina di esempio.

### Ordine di autorità e controllo prima di lavorare

All'inizio di ogni lavoro su una pagina Giu Page, anche se la richiesta proviene
da un altro progetto:

1. leggere integralmente questo manuale e `design-reference.md`;
2. aprire la pagina pubblica
   `https://giufog.github.io/giu-page/pagina-esempio/`;
3. aprire `PAGINA-ESEMPIO/index.html`;
4. confrontare le due versioni alla stessa larghezza;
5. usare come autorità visiva l'ultima decisione esplicita dell'utente e, in sua
   assenza, la pagina pubblica “Standard grafico da provare”.

Non usare come standard una pagina tematica pubblicata di recente: può contenere
una modifica non ancora approvata o un errore. Se pagina pubblica, esempio locale
e manuale non coincidono, fermare la lavorazione grafica, individuare la
differenza e riallinearli prima di applicare lo stile a una nuova pagina.

## 1. Procedura prioritaria per gli altri progetti

Quando l'utente chiede in un altro progetto:

```text
Leggi F:\05 - Vibecoding\Codex\Pagine online\pagineonline.md
Crea la pagina HTML e le quattro proposte di copertina secondo lo standard.
Il titolo della pagina è: <TITOLO SCELTO DALL'UTENTE>
Mostrami l'anteprima e non pubblicare finché non ti scrivo:
Ok, pubblica con l'immagine N.
```

l'agente deve svolgere questa procedura.

1. Leggere integralmente:

   ```text
   F:\05 - Vibecoding\Codex\Pagine online\pagineonline.md
   F:\05 - Vibecoding\Codex\Pagine online\design-reference.md
   ```

2. Usare come riferimento visivo e funzionale:

   ```text
   F:\05 - Vibecoding\Codex\Pagine online\PAGINA-ESEMPIO\index.html
   ```

3. Cercare per prima cosa un titolo fornito esplicitamente dall'utente nella
   richiesta, per esempio `Il titolo della pagina è: ...`. Quel titolo è
   vincolante. Usarlo come titolo visibile, titolo del catalogo e base dello
   slug. Non ricavare automaticamente il titolo dal nome della chat.
4. Se l'utente non ha indicato esplicitamente il titolo, **fermarsi e chiederlo
   immediatamente**, prima di creare file, slug, pagina o copertine. Non ricavare
   più automaticamente il titolo dal nome della chat.
5. Creare nel **proprio progetto** una cartella di lavorazione chiaramente
   riconoscibile. Percorso consigliato:

   ```text
   <RADICE_PROGETTO_CORRENTE>\ANTEPRIMA_PAGINA_ONLINE\<slug>\
   ```

6. Dopo aver ottenuto il titolo, creare lì per prima cosa il pacchetto statico e
   la pagina HTML locale completa, applicando integralmente lo standard Giu Page.
   Prima di presentarla, generalizzare ogni riferimento personale secondo la
   sezione 0B e verificarla su desktop e soprattutto su mobile.
7. Appena la pagina è pronta:
   - comunicarlo subito con la frase `Questa è la pagina HTML pronta da aprire`;
   - fornire il percorso o URL locale cliccabile;
   - preferibilmente aprirla direttamente in **Google Chrome**;
   - non aspettare l'approvazione prima di iniziare le copertine.
8. Mentre l'utente controlla la pagina nel browser, continuare subito il lavoro e
   generare quattro copertine WhatsApp autonome, numerate da 1 a 4. Se gli
   strumenti consentono operazioni parallele, usarle per ridurre l'attesa; la
   pagina HTML deve comunque essere consegnata per prima.
9. Mostrare all'utente:
   - l'anteprima HTML locale;
   - le quattro copertine complete e non ritagliate.
10. Fermarsi e attendere:
    - approvazione della pagina;
    - scelta esplicita della copertina;
    - comando esplicito `Ok, pubblica con l'immagine N`, dove `N` è `1`, `2`,
      `3` o `4`.
11. Solo dopo tutte le conferme, pubblicare direttamente su GitHub seguendo le
    sezioni 12 e 13.
12. Verificare deployment, pagina pubblica, immagini e condivisione.
13. Pulire soltanto i file temporanei creati nel proprio progetto e soltanto
    dopo la pubblicazione riuscita.

La creazione dell'anteprima non autorizza la pubblicazione. La scelta della
copertina non autorizza da sola la pubblicazione. L'approvazione della pagina
non autorizza a scegliere automaticamente una copertina. Il comando finale
consigliato riunisce entrambe le decisioni:

```text
La pagina va bene. Ok, pubblica con l'immagine 2.
```

## 2. Risorse ufficiali

| Voce | Valore |
|---|---|
| Account GitHub | `giufog` |
| Repository | `giufog/giu-page` |
| Repository web | `https://github.com/giufog/giu-page` |
| Branch pubblicato | `main` |
| GitHub Pages | branch `main`, cartella radice `/` |
| Home pubblica | `https://giufog.github.io/giu-page/` |
| Catalogo | `catalogo.json` nella radice |
| Configurazione locale | `pubblicazione.config.json` |

Ogni pagina viene pubblicata direttamente in una cartella con il proprio slug:

```text
https://giufog.github.io/giu-page/<slug>/
```

Non aggiungere una cartella intermedia `pagine`.

### Home pubblica

La Home usa la stessa barra superiore delle pagine:

- logo GP e scritta `Giu Page`;
- testata compatta e sticky, che resta visibile durante lo scorrimento;
- lente che apre la ricerca e si richiude premendo fuori;
- menu a quattro linee con l'elenco di tutte le pagine disponibili;
- nell'app, pulsante nativo a tre puntini inserito prima della lente.

Il catalogo è ordinato sempre per data di inserimento, dalla pagina più recente
alla più vecchia. Non mostrare il selettore di ordinamento finché questa regola
non viene modificata.

Ogni card della Home mostra in basso a destra il pulsante `Condividi` con lo
stesso componente delle singole pagine: superficie bianca, altezza minima
`44px`, raggio `6px`, icona di condivisione a tre nodi da `19px` e icona/testo
azzurro-blu `#2878B8`. Il pulsante condivide soltanto l'URL della pagina; titolo,
descrizione e copertina provengono dai metadati Open Graph.

## 3. Titolo, slug e aggiornamenti

- Ogni titolo deve iniziare con una lettera maiuscola. La regola vale per il
  titolo principale, i titoli di sezioni e card, `<title>`, `og:title`,
  `twitter:title`, `page.json` e catalogo. Se l'utente scrive il titolo con
  l'iniziale minuscola, normalizzare esclusivamente la prima lettera senza
  alterare le altre parole.
- Il titolo esplicitamente scritto dall'utente nella richiesta è l'unica fonte
  automatica autorizzata.
- Riconoscere formule equivalenti come `il titolo è`, `titolo della pagina:`,
  `chiamala`, `pubblicala come` o altre istruzioni inequivocabili.
- Non sostituire, correggere o abbreviare automaticamente il titolo fornito,
  salvo la capitalizzazione obbligatoria della prima lettera.
- Se la richiesta non contiene un titolo esplicito, chiederlo immediatamente.
- Non usare più automaticamente il titolo della chat come ripiego.
- Lo slug deve essere minuscolo, descrittivo, stabile, senza spazi e separato da
  trattini.
- Lo slug si ricava dal titolo soltanto alla prima pubblicazione.
- Per aggiornamenti successivi mantenere lo stesso slug anche se cambia il
  titolo visibile.
- Prima di creare una nuova pagina controllare `chat-pages.json` e il catalogo
  remoto per evitare duplicati.
- Se il titolo è troncato, generico o ambiguo, chiedere conferma.
- `Home` è riservato alla pagina principale.

Esempio di comando completo da un altro progetto:

```text
Leggi integralmente:
F:\05 - Vibecoding\Codex\Pagine online\pagineonline.md

Crea nel progetto corrente la pagina HTML locale e quattro proposte di copertina
secondo lo standard Giu Page.

Il titolo della pagina è: Forfora e prurito del cuoio capelluto

Mostrami l'anteprima HTML e le quattro copertine. Non pubblicare nulla finché non
approvo la pagina e ti scrivo: Ok, pubblica con l'immagine N.
```

Se il comando non contiene `Il titolo della pagina è: ...`, la prima risposta
deve essere una domanda breve:

```text
Qual è il titolo esatto della pagina?
```

Ricevuto il titolo, l'agente deve realizzare e consegnare **prima** l'HTML:

```text
Questa è la pagina HTML pronta da aprire:
<percorso o URL locale cliccabile>
```

Deve preferibilmente aprire l'anteprima in Google Chrome. Subito dopo, senza
attendere un altro messaggio, deve generare e mostrare le quattro copertine.

Esempio:

```text
Titolo: Forfora e prurito del cuoio capelluto
Slug: forfora-prurito-cuoio-capelluto
URL: https://giufog.github.io/giu-page/forfora-prurito-cuoio-capelluto/
```

## 4. Conservazione obbligatoria dei contenuti

Quando si adatta una pagina già esistente, l'intervento predefinito è
**esclusivamente grafico e tecnico**.

Non modificare, riassumere, correggere, tagliare, integrare, semplificare,
riordinare o reinterpretare senza autorizzazione:

- testi e titoli;
- dati e date;
- sezioni e ordine dei contenuti;
- tabelle;
- etichette;
- avvertenze;
- fonti;
- collegamenti;
- funzioni e azioni disponibili.

Sono consentite soltanto modifiche tecniche che non cambiano il contenuto:
percorsi relativi, metadati, accessibilità, wrapper necessari al layout e
adattamento responsive.

Fa eccezione la generalizzazione obbligatoria prevista dalla sezione 0B:
rimuovere riferimenti all'identità e al caso personale dell'utente conservando
integralmente significato, dati, avvertenze, struttura e fonti. Questa
trasformazione editoriale è autorizzata dallo standard e deve essere eseguita
anche quando si adatta una pagina esistente.

Prima di mostrare l'anteprima, confrontare sorgente e risultato. Se un elemento
non può essere conservato, fermarsi e segnalarlo.

## 5. Pacchetto statico

La cartella locale della pagina deve avere questa struttura:

```text
<slug>/
|-- index.html
|-- page.json
`-- assets/
    |-- style.css
    |-- script.js
    |-- share-whatsapp.jpg
    `-- immagini, font e documenti necessari
```

Regole:

- `index.html` e `page.json` sono obbligatori;
- usare percorsi relativi all'interno del pacchetto;
- non usare `file://`, `localhost` o percorsi assoluti Windows nei file finali;
- copiare localmente tutte le risorse essenziali;
- non includere cache, `node_modules`, sorgenti inutili, file `.env` o segreti;
- non incorporare immagini grandi in Base64 nell'HTML o nel CSS;
- usare nomi file minuscoli, senza spazi e comprensibili;
- la pagina deve funzionare come sito statico senza PHP, database o server
  applicativo.

## 6. Standard grafico Giu Page

Il riferimento completo è `design-reference.md`. I token principali sono:

| Uso | Valore |
|---|---|
| Verde bosco e testo forte | `#173E35` |
| Verde salvia principale | `#4D8A70` |
| Verde azione | `#217A46` |
| Superficie verde chiara | `#E5F0E8` |
| Bordo salvia | `#D8E5DC` |
| Fondo pagina | `#F1F6F1` |
| Testo secondario | `#64756B` |
| Verde luminoso, solo dettaglio | `#9BE878` |

Font:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Regole principali:

- mobile-first;
- contenitore generale fluido fino a `1600px`;
- la misura di lettura `68–72ch` vale soltanto per paragrafi lunghi, mai per
  l'intero layout, hero, griglie, immagini, tabelle o schede;
- corpo principale almeno `16px` su mobile;
- controlli cliccabili alti almeno `44px`;
- bordi e ombre discreti;
- raggi di riferimento: `8px` per elementi piccoli, `12px` per controlli e
  superfici ordinarie, `18px` per card principali;
- sono vietati pillole, capsule, pulsanti circolari e
  `border-radius: 999px` o `50%`; il pulsante torna-su è un quadrato arrotondato,
  non un cerchio;
- tabelle larghe usano tutta la larghezza disponibile; sul telefono devono
  trasformarsi in schede chiave/valore leggibili, non restare tabelle da oltre
  1000px che obbligano allo scorrimento orizzontale;
- nessun overflow orizzontale dell'intera pagina;
- ruotare il dispositivo non deve ridurre, filtrare o perdere le card: dopo
  ogni cambio di viewport il catalogo deve essere ridisegnato integralmente
  senza richiedere `Ricarica`;
- pulsante “torna su” fisso in basso a sinistra quando la pagina è lunga;
- animazioni limitate e compatibili con `prefers-reduced-motion`.

### Layout denso e uso obbligatorio dello spazio

Lo spazio vuoto serve soltanto a separare gruppi logici. Non deve diventare la
parte dominante della pagina. È vietato usare una colonna stretta centrata come
layout generale.

Token di riferimento:

```css
:root {
  --layout-max: 1600px;
  --text-measure: 72ch;
  --gutter-mobile: 12px;
  --gutter-tablet: 16px;
  --gutter-desktop: 24px;
  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 18px;
}
```

Regole misurabili:

- desktop: `width: min(1600px, calc(100vw - 48px))`;
- a `1440px` il contenuto deve occupare circa `1392px`, salvo paragrafi lunghi;
- a `390px` i margini ordinari sono `12px`, lasciando `366px` utili;
- tra `900px` e `1600px` non lasciare complessivamente oltre il `10%` del
  viewport vuoto ai lati;
- fino a `599px`: una colonna, salvo coppie di azioni e dati brevi;
- da `600px` a `899px`: due colonne quando i blocchi sono indipendenti;
- da `900px`: griglia a 12 colonne o
  `repeat(auto-fit, minmax(280px, 1fr))`;
- gli elementi brevi e ripetibili dello stesso gruppo — ingredienti, attrezzi,
  passaggi, dati tecnici — usano sempre
  `repeat(auto-fit, minmax(MINIMO_LEGGIBILE, 1fr))`: sullo schermo grande
  occupano una sola riga quando ci stanno e vanno a capo automaticamente
  soltanto quando la larghezza diminuisce;
- non dividere ingredienti e procedura in due colonne principali se questo
  costringe ingredienti, attrezzi o passaggi a inutili righe aggiuntive;
- su desktop una ricetta con cinque ingredienti brevi deve tentare cinque
  colonne; una procedura con quattro passaggi brevi deve tentare quattro
  colonne. Tablet e mobile riducono automaticamente il numero di colonne;
- se due blocchi possono stare affiancati senza compromettere la lettura,
  devono stare affiancati su tablet o desktop;
- è vietato mantenere su desktop la stessa lunga successione verticale usata
  su mobile.

Densità:

- distanza tra sezioni: `24px` mobile, massimo `32px` desktop;
- distanza tra titolo e contenuto: `8–12px`;
- gap tra elementi collegati: `6–8px`;
- gap tra card: `8–12px` mobile, massimo `16px` desktop;
- padding card: `10–12px` mobile, massimo `16px` desktop;
- padding hero: massimo `24px` mobile e `32px` desktop;
- corpo testo: `16px`, line-height `1.42–1.5`;
- niente altezze minime decorative o spazi riservati ad azioni assolute.

Contenuti:

- mostrare titolo, descrizione necessaria, immagine e dati realmente utili;
- vietate eyebrow, kicker, categorie, numerazioni decorative e micro-etichette
  prive di funzione;
- non ripetere la stessa informazione in titolo, sottotitolo, etichetta,
  callout e card;
- le immagini delle card usano rapporti coerenti `16:9`, `3:2` o `4:3`;
- su desktop immagine e testo vanno affiancati quando questo riduce lo
  scorrimento;
- evitare una card separata per ogni singola riga se una griglia compatta
  comunica meglio gli stessi dati;
- evitare card annidate dentro altre card.

Tabelle responsive approvate:

- desktop e tablet largo: tabella completa a tutta la larghezza utile;
- mobile: nascondere l'intestazione orizzontale e trasformare ogni riga in una
  card rettangolare;
- la prima cella diventa la testata verde della card;
- le altre celle diventano righe `etichetta | valore`, usando `::before` per
  ripetere il nome della colonna;
- nessuno scorrimento orizzontale obbligatorio;
- contenuto, ordine e significato della tabella restano invariati;
- questo è lo standard ufficiale approvato e va riutilizzato nelle nuove
  pagine quando una tabella non entra nello schermo del telefono.

Cache busting obbligatorio:

- a ogni modifica di CSS o JavaScript pubblicata, aggiornare la versione negli
  URL caricati da `index.html`, per esempio
  `assets/style.css?v=AAAAMMGG-N` e `assets/script.js?v=AAAAMMGG-N`;
- non pubblicare una correzione grafica lasciando invariato l'URL dell'asset:
  browser, WhatsApp Web e WebView dell'applicazione potrebbero continuare a
  mostrare la versione precedente;
- dopo la pubblicazione verificare che l'HTML online contenga la nuova versione
  e che il layout corrisponda al CSS appena pubblicato.

### Componenti globali immutabili

Le misure seguenti provengono dalla pagina pubblica “Standard grafico da
provare” e non si reinterpretano nelle singole pagine:

| Componente | Specifica obbligatoria |
|---|---|
| Header interno | altezza `64px`; su mobile `58px`; padding `10px 20px`, su mobile `10px 16px` |
| Azioni header | gap `8px`; ordine nell'app: tre puntini nativi, lente, menu HTML a quattro linee |
| Lente e menu a quattro linee | `44×44px`, raggio `12px`, sfondo trasparente, bordo bianco al `38%` |
| Pulsante nativo a tre puntini | stesso rettangolo `44×44dp`, raggio `12dp`, stesso bordo e allineamento verticale degli altri due controlli |
| Pulsante torna-su | `48×48px`, raggio `14px`, fondo `#E5F0E8`, sinistra `14px`, fondo `14px` |
| Contatore pagina | destra `12px`, fondo `14px`, padding `7px 9px`, raggio `9px`, fondo bianco all'`82%` |

Il menu a tre puntini appartiene all'app Android, non all'HTML. Se una modifica
alla testata rende diversi i tre puntini, la lente e il menu a quattro linee, non
si corregge una singola pagina per compensare. Si ripristinano i valori standard
oppure si aggiorna nello stesso lavoro anche il componente nativo dell'app, poi
si ricontrollano entrambi i riferimenti sul telefono reale.

Verifica obbligatoria a `360×800`, `390×844`, `768×1024`, `1280×720`,
`1440×900` e `1920×1080`. La pagina non è approvabile se:

- oltre il `10%` dello schermo desktop resta inutilizzato ai lati;
- un layout che potrebbe essere a due o tre colonne resta verticale;
- compaiono pillole, cerchi o raggi diversi da quelli definiti dallo standard;
- compaiono micro-etichette decorative o testi ridondanti;
- una card contiene grandi aree vuote;
- nel primo viewport mobile non sono visibili barra, titolo, descrizione,
  azioni principali e inizio reale del contenuto.

### Testata

La testata deve restare pulita: gradiente salvia e contenuto testuale necessario.
Non aggiungere cerchi, bolle, reticoli, pattern, illustrazioni decorative, forme
astratte o immagini ornamentali. Le immagini pertinenti vanno nel contenuto.

Nella barra superiore, prima della scritta `Giu Page`, usare sempre il logo
ufficiale `assets/gp-icon.svg`, identico all'icona dell'applicazione. Non
ricreare il monogramma `GP` con testo HTML dentro un rettangolo. Lo stesso file
deve essere dichiarato come favicon della pagina.

La testata standard di una pagina di contenuto deve mostrare, in quest'ordine:

1. **solo il titolo principale** come primo elemento; non inserire sopra il titolo
   eyebrow, kicker, categoria, stato, nome progetto, diciture come “documento”,
   “pagina di esempio” o altre scritte introduttive;
2. una descrizione sintetica di **massimo 20 parole**;
3. una riga di metadati piccoli:

   ```text
   <numero> pagine, create il <data>, e da <numero> minuti di lettura.
   ```

4. due pulsanti affiancati: `Stampa PDF` e `Condividi`.

Non aggiungere altri pulsanti nella testata. Eventuali menu di navigazione
restano fuori da questo gruppo. `Condividi` deve inviare soltanto l'URL canonico:
titolo, descrizione e copertina vengono prodotti dai metadati Open Graph.
I due pulsanti devono restare sulla stessa riga anche su mobile, avere identica
superficie bianca, altezza e dimensione. Icona e testo di `Stampa PDF` sono
rossi; icona e testo di `Condividi` sono azzurro-blu.
L'icona `Condividi` è sempre quella a tre nodi collegati, larga e alta `19px`;
lo stesso simbolo e lo stesso trattamento vengono usati nelle card della Home.

### Calcolo dei metadati della testata

- `Creata il` usa la data della prima creazione della pagina.
- Il tempo di lettura si calcola sul testo leggibile della pagina usando circa
  `200 parole/minuto`, arrotondando sempre per eccesso e con minimo 1 minuto.
- Il numero di pagine indica le pagine prodotte dalla stampa in PDF A4, non il
  numero di sezioni HTML.
- Calcolare il numero soltanto quando il contenuto e il CSS di stampa sono
  stabili: aprire l'anteprima di stampa di Google Chrome, destinazione
  `Salva come PDF`, formato A4, e leggere il totale mostrato.
- Se il totale cambia dopo modifiche sostanziali, aggiornare il metadato prima
  della pubblicazione.
- Il valore deve coincidere in quattro punti: riga dei metadati, attributo
  `data-total-pages`, testo iniziale `Pagina 1 di Y` e `pageCount` in
  `page.json`.
- Non copiare il totale dalla versione precedente. Ogni modifica a contenuto,
  spaziature, font, larghezze o CSS di stampa obbliga a rigenerare il PDF A4 e a
  leggere nuovamente il totale. Un contatore coerente nel codice ma diverso dal
  PDF è un errore.

Ogni pagina lunga deve mostrare in basso a destra un contatore discreto
`Pagina X di Y`, aggiornato durante lo scorrimento e coerente con `pageCount`.
Nella stampa il contatore a schermo viene nascosto e sostituito dal piè di pagina
A4:

```css
@page {
  size: A4;
  margin: 14mm 14mm 18mm;
  @bottom-right {
    content: "Pagina " counter(page) " di " counter(pages);
  }
}
```

Struttura raccomandata:

```html
<section class="hero">
  <h1>Titolo della pagina</h1>
  <p class="hero__lead">Descrizione entro venti parole.</p>
  <div class="page-meta">
    <span>13 pagine, create il 27 luglio 2026, e da 5 minuti di lettura.</span>
  </div>
  <div class="hero__actions">
    <button type="button" data-print>Stampa PDF</button>
    <button type="button" data-share>Condividi</button>
  </div>
</section>
```

Il pulsante deve aprire la finestra di stampa del browser con `window.print()`.
Nell'app Android deve invece chiamare `GiuPageNative.print()` quando
l'interfaccia è disponibile, così si apre il servizio di stampa nativo.
Prima della stampa aprire temporaneamente i pannelli `details` necessari, quindi
ripristinare il loro stato dopo `afterprint`. Il CSS deve includere `@page`
formato A4, nascondere menu e pulsanti e impedire per quanto possibile che card
brevi o avvisi vengano spezzati tra due pagine.

### Colori semantici

Colori esterni alla palette sono ammessi soltanto con significato stabile:

- verde: esito positivo;
- ambra: attenzione o dato da verificare;
- rosso: rischio, errore o azione distruttiva;
- blu: solo quando necessario per una semantica informativa distinta, non come
  decorazione generale.

### Fonti

Quando esistono fonti reali, devono essere citate **sempre alla fine della
pagina**, dopo l'ultima sezione di contenuto, usando lo stesso componente
raffigurato in `PAGINA-ESEMPIO/index.html`. Non inserire un secondo elenco di
fonti nell'introduzione, nelle card o in una barra laterale.

Le fonti finali devono stare in un pannello:

```html
<details class="sources">
  <summary>Fonti e riferimenti</summary>
  ...
</details>
```

Il pannello è chiuso per impostazione predefinita sullo schermo e può essere
aperto automaticamente durante la stampa. Ogni fonte deve conservare titolo,
URL, editore o autore, data e contesto quando disponibili.

Non inventare fonti, URL, autori, date o verifiche. Se la pagina non usa fonti,
omettere completamente il pannello. Se una fonte sostiene una specifica
affermazione importante, è ammesso un richiamo numerico discreto nel testo, ma
la scheda completa della fonte resta comunque nell'elenco finale.

### Menu apribili

Il pulsante a quattro linee nella testata contiene sempre l'indice della pagina.
Non duplicare l'indice nel corpo, in una colonna laterale o in una card. Ogni
voce porta alla sezione corrispondente e chiude il menu.

La lente deve aprire un campo di ricerca realmente funzionante. La ricerca
interroga titoli, paragrafi, elenchi e tabelle, indica il numero dei risultati e
permette di scorrerli con `Trova` o `Invio`. Come il menu, il pannello di ricerca
si chiude premendo nuovamente la lente, con `Escape` oppure toccando fuori.

Le pagine lunghe mostrano anche un pulsante fisso quadrato in basso a sinistra
con freccia `↑`, che riporta dolcemente all'inizio. In basso a destra rimane il
contatore `Pagina X di Y`.

I collegamenti interni `#sezione` devono scorrere alla destinazione senza
aggiungere una nuova voce alla cronologia. Usare `history.replaceState()`, non
`location.hash` né la navigazione predefinita. Nell'app, Indietro deve quindi
tornare alla pagina precedente o alla home senza ripercorrere ogni sezione
visitata.

Ogni menu basato su `<details>` deve:

- aprirsi premendo il proprio pulsante;
- richiudersi premendo nuovamente lo stesso pulsante;
- richiudersi anche toccando o cliccando in qualunque punto esterno al menu;
- richiudersi premendo `Escape`;
- non chiudersi quando si interagisce con il contenuto interno.

Applicare un listener `pointerdown` sul documento e chiudere soltanto i
`details.menu[open]` che non contengono `event.target`. Questa regola è
obbligatoria sia nel browser sia nella WebView dell'app.

## 7. Anteprima HTML obbligatoria

Prima della pubblicazione:

1. completare l'HTML prima di generare le copertine;
2. servire o aprire localmente `index.html`, preferibilmente in Google Chrome;
3. scrivere subito all'utente:

   ```text
   Questa è la pagina HTML pronta da aprire:
   <percorso o URL locale cliccabile>
   ```

4. dopo aver consegnato o aperto l'HTML, iniziare immediatamente la generazione
   delle quattro copertine senza attendere un'altra risposta;
5. controllare almeno una viewport desktop e una mobile da `390px`;
6. verificare che nessun testo, tabella o controllo sia tagliato;
7. provare menu, pannelli, link, pulsanti, stampa e condivisione;
8. verificare caricamento di CSS, JavaScript, immagini, font e documenti;
9. cercare riferimenti a file mancanti, `localhost`, `file://`, segreti e
   percorsi locali;
10. premere `Stampa PDF`, controllare l'anteprima A4 e aggiornare il numero
    effettivo di pagine mostrato nella testata;
11. verificare che il PDF non contenga menu, pulsanti, elementi tagliati o pagine
    vuote anomale;
12. validare `page.json`;
13. se JuPage è disponibile, aprire sullo stesso telefono prima “Standard
    grafico da provare” e poi la nuova pagina; acquisire entrambe le schermate
    allo stesso orientamento e confrontare header, tre puntini nativi, lente,
    menu a quattro linee, torna-su e contatore;
14. misurare o verificare i valori della tabella “Componenti globali
    immutabili”; la sola somiglianza a occhio non basta;
15. non pubblicare.

## 8. Quattro copertine obbligatorie

Creare sempre **quattro immagini autonome e realmente diverse**, ciascuna:

- esattamente `1200 × 630`;
- orizzontale;
- coerente con il contenuto della pagina;
- comprensibile anche senza testo;
- senza watermark;
- senza loghi o marchi non autorizzati;
- senza testo piccolo o essenziale;
- non derivata da uno screenshot casuale della pagina.

Salvarle nella cartella di anteprima del progetto corrente, per esempio:

```text
ANTEPRIMA_PAGINA_ONLINE/<slug>/COPERTINE/
|-- copertina-1.jpg
|-- copertina-2.jpg
|-- copertina-3.jpg
`-- copertina-4.jpg
```

### Modalità di presentazione

- Numerare chiaramente le proposte `1`, `2`, `3`, `4`.
- Creare una tavola ad alta qualità `2 × 2`, due immagini sopra e due sotto.
- Ogni immagine deve restare completa nel rapporto `1200 / 630`.
- Usare `object-fit: contain`, mai `cover`.
- Non ritagliare, non trasformare in quadrati e non comprimere quattro immagini
  su una sola riga.
- Mostrare la tavola nella chat alla massima larghezza disponibile.
- Se l'utente chiede di vederle singolarmente, mostrarle una per volta mantenendo
  proporzioni e file originali.
- Attendere la scelta esplicita.

Dopo la scelta:

1. copiare soltanto l'immagine approvata in:

   ```text
   assets/share-whatsapp.jpg
   ```

2. mantenerla in JPEG leggero ma nitido;
3. aggiornare `page.json` e i metadati social;
4. non pubblicare le proposte scartate.

## 9. `page.json`

Struttura minima:

```json
{
  "schemaVersion": 1,
  "title": "Titolo leggibile",
  "slug": "slug-stabile",
  "description": "Descrizione breve per catalogo e anteprima.",
  "createdAt": "AAAA-MM-GG",
  "updatedAt": "AAAA-MM-GG",
  "pageCount": 13,
  "readingMinutes": 5,
  "coverImage": "assets/share-whatsapp.jpg",
  "tags": ["tag-uno", "tag-due"],
  "listed": true
}
```

La descrizione deve essere sintetica, informativa, avere al massimo 20 parole e
non ripetere inutilmente il titolo. `pageCount` contiene il totale verificato
nell'anteprima PDF A4; `readingMinutes` contiene il tempo calcolato a circa
200 parole al minuto. `listed: true` inserisce la pagina nella home pubblica.

## 10. Condivisione WhatsApp

Ogni pagina deve replicare il comportamento già verificato con
`apparecchi-acustici`: WhatsApp mostra immagine, titolo e descrizione, mentre il
messaggio inviato dal pulsante contiene soltanto il collegamento.

Nel `<head>` inserire URL assoluti HTTPS:

```html
<link rel="canonical" href="https://giufog.github.io/giu-page/<slug>/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Giu Page">
<meta property="og:title" content="Titolo della pagina">
<meta property="og:description" content="Descrizione breve">
<meta property="og:url" content="https://giufog.github.io/giu-page/<slug>/">
<meta property="og:image" content="https://giufog.github.io/giu-page/<slug>/assets/share-whatsapp.jpg">
<meta property="og:image:secure_url" content="https://giufog.github.io/giu-page/<slug>/assets/share-whatsapp.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Descrizione sintetica della copertina">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Titolo della pagina">
<meta name="twitter:description" content="Descrizione breve">
<meta name="twitter:image" content="https://giufog.github.io/giu-page/<slug>/assets/share-whatsapp.jpg">
```

Il pulsante Condividi deve inviare **soltanto l'URL**:

```javascript
const shareUrl = "https://giufog.github.io/giu-page/<slug>/";

if (navigator.share) {
  await navigator.share({ url: shareUrl });
} else if (navigator.clipboard) {
  await navigator.clipboard.writeText(shareUrl);
}
```

Non inviare anche titolo e descrizione nel testo del messaggio: WhatsApp li
mostra già nella scheda e il risultato diventerebbe ripetitivo.

`og:site_name="Giu Page"` e la favicon identificano il progetto, ma WhatsApp
mostra comunque il dominio reale del collegamento, attualmente
`giufog.github.io`. Non è possibile sostituire quella riga con `Giu Page`
tramite HTML, Open Graph o favicon. Per visualizzare un nome differente serve un
dominio personalizzato configurato su GitHub Pages.

Se WhatsApp conserva una vecchia anteprima, condividere temporaneamente:

```text
https://giufog.github.io/giu-page/<slug>/?wa=AAAAMMGG-1
```

Il parametro serve soltanto a forzare la rilettura; il canonical e `og:url`
restano senza parametro.

## 11. Catalogo della home

Durante la pubblicazione aggiornare `catalogo.json` nella stessa operazione della
pagina. Ogni voce deve contenere almeno:

```json
{
  "slug": "slug-stabile",
  "title": "Titolo leggibile",
  "description": "Descrizione breve",
  "url": "https://giufog.github.io/giu-page/slug-stabile/",
  "createdAt": "AAAA-MM-GG",
  "updatedAt": "AAAA-MM-GG",
  "coverImageUrl": "https://giufog.github.io/giu-page/slug-stabile/assets/share-whatsapp.jpg",
  "tags": ["tag"],
  "listed": true
}
```

Per gli aggiornamenti preservare `createdAt`, aggiornare `updatedAt` e non creare
duplicati dello stesso slug.

## 12. Accesso GitHub senza richieste 2FA ripetute

### Metodo principale obbligatorio: pubblicatore centrale SSH

La pubblicazione ordinaria usa:

```text
F:\05 - Vibecoding\Codex\Pagine online\pubblica-giu-page.ps1
```

La deploy key è già registrata nel repository con permesso `Read/write`; la
chiave privata è custodita nel profilo SSH locale di Windows e non è contenuta
nel manuale o nel repository. Il clone tecnico è:

```text
F:\05 - Vibecoding\Codex\Pagine online\.publisher\giu-page
```

Parametri fissi:

| Voce | Valore |
|---|---|
| Account | `giufog` |
| Repository | `giufog/giu-page` |
| Branch | `main` |
| Sito | `https://giufog.github.io/giu-page/` |
| Alias SSH | `github-giu-page` |
| Chiave SSH operativa | `C:\Users\Joy\.ssh\giu-page-deploy-ed25519` |
| Clone tecnico | `F:\05 - Vibecoding\Codex\Pagine online\.publisher\giu-page` |

Procedura per qualunque nuova chat o progetto:

1. leggere integralmente questo file e `design-reference.md`;
2. ottenere approvazione della pagina e scelta della copertina;
3. eseguire il pubblicatore centrale passando la cartella finale;
4. verificare commit, catalogo e sito pubblico.

Il connettore GitHub può essere usato come riserva se lo script è
temporaneamente indisponibile. Anche in quel caso non usare login web o GitHub
CLI.

### Diagnostica autonoma obbligatoria

Una nuova chat non deve fermarsi al primo errore e non deve trasferire il
problema all'utente. Applicare questa tabella:

| Errore | Azione dell'agente |
|---|---|
| L'ambiente protetto blocca rete, `sh.exe` o pipe | Ripetere lo stesso comando del pubblicatore tramite esecuzione autorizzata. |
| `Chiave SSH di pubblicazione non trovata` | Verificare il profilo `C:\Users\Joy\.ssh\` e ripristinare la copia operativa locale da `segreti-locali\ssh\` senza mostrarne il contenuto. |
| `Permission denied (publickey)` | Eseguire `C:\Windows\System32\OpenSSH\ssh.exe -T github-giu-page`, controllare alias, permessi del file e deploy key del solo repository. |
| Clone tecnico assente | Lasciare che `pubblica-giu-page.ps1` lo ricrei automaticamente. |
| Clone tecnico con modifiche | Ispezionare `git status` e preservare il lavoro; pubblicare o mettere al sicuro le modifiche legittime. Non usare reset distruttivi. |
| Aggiornamento non fast-forward o conflitto | Fare fetch, confrontare il branch remoto e integrare le modifiche senza force push. Poi rilanciare lo script. |
| `page.json` o slug non valido | Correggere il pacchetto locale rispettando questo manuale, quindi rilanciare. |
| File o copertina mancanti | Correggere riferimenti e asset locali prima del nuovo tentativo. |
| GitHub Pages non ancora aggiornato | Attendere il deployment e ricontrollare URL e asset; non creare commit duplicati. |

Test SSH atteso:

```text
Hi giufog/giu-page! You've successfully authenticated, but GitHub does not provide shell access.
```

Questa risposta conferma che la chiave è limitata al repository corretto. Il
codice di uscita non-zero del comando `ssh -T` è normale quando GitHub rifiuta
la shell interattiva; ciò non indica un fallimento della pubblicazione.

La copia locale della chiave è materiale riservato: può essere usata
automaticamente per un ripristino sullo stesso PC, ma non deve mai essere
stampata, inserita in un prompt, copiata in una pagina o aggiunta a un commit.

### Regole di sicurezza

Non salvare nel manuale, nel repository, in una pagina o in una chat:

- password;
- token;
- cookie;
- chiavi SSH;
- setup key 2FA;
- codici SMS;
- codici di recupero.

La 2FA resta confinata all'eventuale amministrazione umana del sito GitHub e non
deve mai bloccare creazione, aggiornamento o pubblicazione delle pagine.

## 13. Pubblicazione GitHub

La pubblicazione è autorizzata soltanto dopo un comando inequivocabile che
approvi la pagina e scelga la copertina, preferibilmente:

```text
Ok, pubblica con l'immagine 1.
```

Se il comando non identifica chiaramente una delle quattro immagini, chiedere
quale copertina usare prima di pubblicare.

### Controlli immediatamente precedenti

1. `page.json` valido e slug corretto.
2. Contenuti approvati e completi.
3. Nessun nome o riferimento che faccia intuire che la pagina è stata creata
   per Giuseppe/Giu o per il caso personale dell'utente.
4. Testo formulato in modo generale e impersonale, salvo deroga esplicita
   confermata dall'utente.
5. Copertina scelta salvata come `assets/share-whatsapp.jpg`.
6. Metadati Open Graph assoluti e corretti.
7. Nessun segreto o percorso locale.
8. Nessun file mancante.
9. `catalogo.json` aggiornato senza duplicati.
10. pubblicatore centrale verificato eseguendo
    `pubblica-giu-page.ps1 -SourcePath "<cartella-finale>" -ValidateOnly`;
    l'esito deve contenere `PUBBLICATORE_PRONTO`.
11. Pagina di esempio e file MD ancora coerenti se il lavoro modifica lo
    standard generale.

### Metodo principale: pubblicatore centrale

Eseguire dalla PowerShell di Windows:

```powershell
& "F:\05 - Vibecoding\Codex\Pagine online\pubblica-giu-page.ps1" `
  -SourcePath "<PERCORSO_ASSOLUTO_DELLA_CARTELLA_FINALE>" `
  -CommitMessage "Pubblica <titolo>"
```

Il pubblicatore esegue automaticamente:

1. validazione di `index.html`, `page.json` e slug;
2. aggiornamento non distruttivo del clone tecnico dal branch `main`;
3. copia completa della pagina nella cartella remota `<slug>/`;
4. aggiornamento di `catalogo.json` senza duplicare lo slug;
5. un solo commit contenente pagina, risorse e catalogo;
6. push SSH su `main`, senza login interattivo.

Se il branch remoto è cambiato, lo script accetta soltanto un aggiornamento
fast-forward e non sovrascrive la cronologia. In caso di conflitto deve fermarsi
e diagnosticare il clone tecnico; non deve aprire il login GitHub.

Percorsi remoti:

```text
<slug>/index.html
<slug>/page.json
<slug>/assets/...
catalogo.json
```

Pagina, copertina e catalogo vengono inclusi nello stesso commit, impedendo alla
home di puntare temporaneamente a file non ancora presenti. Il connettore GitHub
è ammesso soltanto come riserva tecnica se il pubblicatore centrale è
indisponibile. Non usare `git reset --hard`, force push o sovrascritture della
cronologia.

### Verifica dopo il commit

1. Controllare il deployment GitHub Pages fino allo stato `built`.
2. Aprire:

   ```text
   https://giufog.github.io/giu-page/<slug>/
   ```

3. Verificare risposta HTTP, CSS, immagini, link e copertina.
4. Controllare la home e la nuova voce di catalogo.
5. Provare il pulsante Condividi.
6. Se necessario, usare il parametro `?wa=...` per la cache di WhatsApp.
7. Aggiornare `chat-pages.json` nel progetto centrale con titolo, slug e URL.

Non dichiarare conclusa la pubblicazione finché pagina, catalogo, copertina e
deployment non sono verificati.

## 14. Pulizia

La pulizia riguarda soltanto il progetto che ha creato la pagina.

- Non eliminare nulla prima del deployment riuscito.
- Eliminare soltanto la cartella temporanea della pagina appena pubblicata.
- Verificare sempre il percorso assoluto prima di una rimozione ricorsiva.
- Non cancellare sorgenti originali, documenti dell'utente o altre anteprime.
- La cronologia GitHub resta l'archivio della versione pubblicata.
- Non depositare copie permanenti della pagina pubblicata in `Pagine online`.

La cartella `TMP Cancellabile` del progetto centrale contiene materiale storico
e temporaneo precedente: non deve essere usata come destinazione delle nuove
pagine create dagli altri progetti.

## 15. Risposta finale dopo la pubblicazione

Comunicare in modo conciso:

- titolo e slug;
- URL pubblico cliccabile;
- copertina scelta;
- aggiornamento del catalogo;
- esito del deployment GitHub Pages;
- eventuale parametro WhatsApp usato;
- percorso locale pulito o mantenuto.

## 16. File centrali da mantenere

Nella root di `Pagine online` devono restare soltanto i riferimenti operativi:

```text
pagineonline.md
design-reference.md
README.md
chat-pages.json
pubblicazione.config.json
pubblicazione.config.example.json
pubblica-giu-page.ps1
.gitignore
PAGINA-ESEMPIO/
segreti-locali/
TMP Cancellabile/
```

Le cartelle tecniche nascoste gestite da Codex possono restare. Le anteprime,
copertine, importazioni, applicazioni sperimentali, screenshot storici e
documenti superati devono stare in `TMP Cancellabile`, non nella root.
