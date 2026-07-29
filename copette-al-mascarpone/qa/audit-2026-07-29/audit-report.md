# Audit critico — Copette al mascarpone

Data: 29 luglio 2026  
Pagina controllata: `http://127.0.0.1:8011/copette-al-mascarpone/`  
Viewport desktop: 1440 × 1000 px  
Viewport mobile: 390 × 844 px

## Esito

La prima versione non era pronta per una nuova pubblicazione. I difetti principali
erano contenutistici prima ancora che grafici: le schede iniziali mostravano
etichette editoriali e voti non richiesti; la terza ricetta ripeteva una cottura
incoerente con il procedimento; le durate della seconda ricetta non coincidevano
con il totale dichiarato; la tabella finale rompeva la griglia e lasciava una
nota metodologica sospesa fra tabella e fonti.

La versione locale è stata corretta. La versione pubblica non è stata aggiornata.

## Percorso verificato

1. Apertura e intestazione della pagina.
2. Nota sulla provenienza e struttura della ricetta.
3. Tre schede di selezione.
4. Prima ricetta completa.
5. Seconda ricetta completa.
6. Terza ricetta completa.
7. Tabella degli ingredienti.
8. Fonti e piè di pagina.
9. Ripetizione dei passaggi principali a 390 × 844 px.
10. Prova del collegamento della prima scheda, della ricerca interna e del menu.

## Difetti riscontrati nella prima versione

### 1. Schede iniziali non conformi alla richiesta

Gravità: alta.

Nelle schede comparivano «Corrispondenza più vicina», «La più essenziale»,
«Tecnica variegata trovata», due voti e il numero dei votanti. Questi elementi
non erano stati richiesti e trasformavano la pagina in un rapporto editoriale.

Evidenza: [02-varianti.png](02-varianti.png).

Correzione: ogni scheda ora contiene soltanto immagine, titolo completo, breve
descrizione e tempi in forma naturale.

Confronto: [13-fixed-varianti.png](13-fixed-varianti.png) e
[14-fixed-varianti-bottom.png](14-fixed-varianti-bottom.png).

### 2. Tempo di cottura falso o fuorviante

Gravità: critica.

La terza ricetta mostrava «Cottura 1 min indicato» e «Tempo totale 21 min»,
ma il procedimento pubblicato non contiene alcuna fase termica. Il dato deriva
da un campo strutturato incoerente della fonte e non doveva essere ripetuto.

Evidenza: [05-ricetta-3.png](05-ricetta-3.png).

Correzione: sono rimasti «Preparazione 20 min» e «Tempo totale 20 min». La nota
nelle fonti documenta l'anomalia.

Confronto: [16-fixed-recipe-3.png](16-fixed-recipe-3.png).

### 3. Durate incoerenti nella seconda ricetta

Gravità: alta.

La scheda dichiarava 5 minuti, mentre la ricetta completa mostrava 5–7 minuti
e le fasi sommate arrivavano a 7 minuti.

Correzione: preparazione e totale sono entrambi 5 minuti; le tre fasi sono state
ricalibrate a 1 + 2 + 2 minuti.

Confronto: [15-fixed-recipe-2.png](15-fixed-recipe-2.png).

### 4. Terminologia poco culinaria

Gravità: media.

«Lavorazione» era usato al posto di «Preparazione» e i tempi nelle schede erano
presentati come coppie di metadati. La lettura risultava tecnica e frammentata.

Correzione: uso di «Preparazione» e frasi come «25 minuti» e
«Tenere 2 ore in frigorifero».

### 5. Gerarchia e densità visiva

Gravità: media.

Le etichette sopra i titoli, i metadati ridondanti e le emoji degli ingredienti
creavano rumore e incoerenza. Le emoji non erano vere miniature.

Correzione: rimosse etichette ed emoji; i titoli sono il primo elemento testuale
di ogni ricetta; le schede degli ingredienti sono uniformi.

### 6. Tabella finale fuori griglia

Gravità: alta.

La tabella larga usciva bruscamente dal riquadro introduttivo; la nota
metodologica compariva dopo la tabella in un blocco stretto e poco collegato;
le fonti iniziavano dopo uno spazio visivamente casuale.

Evidenze: [06-analisi.png](06-analisi.png) e [07-fonti.png](07-fonti.png).

Correzione: legenda e metodo sono raccolti prima della tabella; la tabella
mantiene la larghezza di lettura necessaria ma è agganciata allo stesso
contenitore; fonti e piè di pagina hanno spaziatura coerente.

Confronto: [17-fixed-analysis.png](17-fixed-analysis.png) e
[19-fixed-sources-bottom.png](19-fixed-sources-bottom.png).

### 7. Provenienza regionale non verificata

Gravità: alta sul piano dell'accuratezza.

La richiesta ricordava un dessert mangiato nel Centro Italia, ma nessuna delle
fonti trovate dimostra un'origine centro-italiana.

Correzione: la pagina lo dichiara subito e presenta le proposte come ricette
italiane, senza inventare un'identità regionale.

Confronto: [12-fixed-top.png](12-fixed-top.png).

### 8. Attribuzione fotografica insufficiente

Gravità: media.

Le didascalie dicevano soltanto «Fotografia associata alla ricetta pubblicata».

Correzione: ogni fotografia della ricetta completa collega direttamente la
fonte corrispondente. Prima di una futura pubblicazione resta comunque da
verificare la licenza o l'autorizzazione al riuso delle immagini.

## Accessibilità

- Titolo `h1` unico e gerarchia dei titoli coerente.
- Collegamento «Salta al contenuto» presente.
- Pulsanti di ricerca, menu, stampa e condivisione hanno nomi accessibili.
- Le immagini caricano correttamente e hanno testo alternativo.
- La tabella usa intestazioni di colonna e di riga.
- A 390 px la tabella richiede scorrimento orizzontale: è una scelta necessaria
  per non comprimere sei colonne fino a renderle illeggibili.
- Il pulsante «torna su» resta quadrato, salvia chiaro e con etichetta accessibile.

## Verifiche automatiche superate

- nessun `id` duplicato;
- nessuna immagine locale mancante;
- sei righe dati nella tabella e intestazioni corrette;
- assenza di voti, etichette editoriali e «cottura 1 min» nel testo della pagina;
- collegamento della prima scheda funzionante;
- ricerca interna funzionante, con 13 risultati per «cacao»;
- menu funzionante, con 6 collegamenti;
- nessun errore nella console del browser;
- controllo visivo desktop e mobile completato.

## Limiti prima della prossima pubblicazione

1. Verificare la licenza o ottenere l'autorizzazione per le tre fotografie
   riprese dalle fonti; in alternativa sostituirle con immagini originali.
2. Ricontrollare il numero di pagine nell'anteprima di stampa del browser:
   la stampa automatica non è disponibile nel browser di prova.
3. La provenienza centro-italiana non è dimostrata dalle fonti trovate e non
   deve essere dichiarata.

## Screenshot mobile della versione corretta

- [20-fixed-mobile-top.png](20-fixed-mobile-top.png)
- [21-fixed-mobile-variants.png](21-fixed-mobile-variants.png)
- [22-fixed-mobile-recipe.png](22-fixed-mobile-recipe.png)
- [23-fixed-mobile-analysis.png](23-fixed-mobile-analysis.png)
