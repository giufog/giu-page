# Benchmark 130-10 immagini / 140-10 specifiche - 2026-07-21

## Esito sintetico

Il benchmark isolato e concluso: `18/18` esecuzioni completate, nessuna scrittura nel catalogo PostgreSQL,
`102/102` immagini scaricate correttamente per il solo controllo locale e `94/94` test automatici esistenti
superati dopo le modifiche al runtime batch.

Il test non giustifica ancora una 130-10/140-10 Codex-only in produzione. Codex Luna e affidabile e piu
prudente, ma Antigravity resta sensibilmente migliore nel caso Aiper con fonti variante precise. La
strategia consigliata e Codex-first con Antigravity eccezionale soltanto quando mancano immagini esatte o
la copertura tecnica resta insufficiente.

## Integrazione benchmark separato immagini

Il 21 luglio e stato completato anche il giro separato `variant/images` sui tre casi primari, senza
scritture nel catalogo: `9/9` confronti (tre provider per Roborock Black, Worx WR344E e Aiper Gray).

| Corpo | Giri | Tempo totale | Media | Immagini | Match esatti | Probabili | Conflitti |
|---|---:|---:|---:|---:|---:|---:|---:|
| Codex GPT-5.6 Luna | 3 | 85,03 s | 28,34 s | 12 | 6 | 1 | 0 |
| Codex GPT-5.4 Mini | 3 | 113,15 s | 37,72 s | 10 | 6 | 3 | 0 |
| Antigravity Flash Medium | 3 | 79,70 s | 26,57 s | 18 | 8 | 5 | 2 |

I prompt erano identici per provider (33.452 byte ciascuno). Antigravity e stato migliore nel solo
caso Aiper (1 esatto contro 0), ma ha anche proposto due conflitti e piu candidati da validare. Luna e
la scelta predefinita: e piu rapida di Mini, restituisce gli stessi sei match esatti nei casi Roborock e
Worx e non introduce conflitti. Mini rimane la coda/giudice meccanico; Antigravity scatta soltanto se
Luna non produce nessun candidato `exact` o `probable` utilizzabile, oppure se permane una contraddizione
variant-colore-configurazione. Il fallback va registrato nel risultato.

## Perimetro

- Roborock Saros 20 Sonic: variante nera e bianca, differenza visibile di colore.
- Worx Landroid Vision Cloud 4WD: WR344E 4000 m2 e WR340E 600 m2, MPN e specifiche differenti.
- Aiper Seagull SE: Gray & Teal e Snow White & Teal, inclusa una variante senza identificatori salvati.
- Confronto fonti: `110_model.model_sources_json` contro `120_variant.variant_sources_json` piu fonti degli
  identificatori.
- Confronto provider: identico prompt ed identici estratti per Codex GPT-5.6 Luna e Antigravity Flash.
- La testa meccanica scarica e scansiona tutta la pagina; al corpo passa estratti pertinenti e candidati
  immagine gia rilevati. I prompt finali sono compresi tra circa 17 e 19,5 KB.

## Risultati quantitativi

| Provider | Giri | Media | Mediana | Immagini scaricate | Match esatti | Campi tecnici |
|---|---:|---:|---:|---:|---:|---:|
| Codex Luna | 9 | 51,65 s | 50,67 s | 52/52 | 9 | 52 |
| Antigravity Flash | 9 | 46,73 s | 32,48 s | 50/50 | 18 | 67 |

La media Antigravity e penalizzata da un singolo caso Aiper da 154 secondi; normalmente e stato piu rapido.
Il volume totale del prompt e identico per i provider: `160.336` byte ciascuno. I byte stderr di Codex
includono la telemetria interna della CLI e non equivalgono ai token fatturati.

## Fonti modello contro fonti variante

Sui tre casi primari confrontabili:

| Fonti | Esecuzioni | Immagini esatte | Campi tecnici | Tempo totale |
|---|---:|---:|---:|---:|
| Modello | 6 | 6 | 34 | 240,2 s |
| Variante | 6 | 19 | 49 | 383,1 s |

Le fonti variante migliorano nettamente Worx e Aiper. Non serve pero creare ora una procedura 120-20:
la specializzazione e gia materializzata in `120_variant.variant_sources_json` e nelle fonti degli
`identifiers`. La 130-10/140-10 deve prima usare queste fonti quando disponibili e ripiegare sulle fonti
modello come copertura aggiuntiva.

## Osservazioni qualitative

- Roborock: entrambi riconoscono il colore target; le immagini del colore opposto vengono marcate come
  conflitto e non come match. Codex evita correttamente di trasformare SKU/EAN in `product_code` senza
  prova esplicita.
- Worx: con la pagina WR344E specifica entrambi arrivano a `6/6` immagini esatte e agli stessi otto campi
  principali; con sole fonti modello Codex non dichiara immagini esatte.
- Aiper Gray: dalle fonti modello entrambi restano generici. Con fonti variante Codex trova sette campi ma
  nessuna immagine esplicitamente legata al colore; Antigravity trova cinque immagini esatte e quindici
  campi, inclusi autonomia, ciclo, tipo piscina e capacita di pulizia.
- Aiper White: l'assenza di identificatori impedisce una conferma forte del colore. Il record deve restare
  incompleto, non essere riempito per analogia.
- Antigravity tende a compilare piu dati; Codex e piu conservativo. La coda dovra validare tipi, unita e
  presenza dell'evidenza senza eliminare risultati corretti solo perche piu numerosi.

## Decisioni progettuali consigliate

### 130-10 immagini

1. Unita di lavoro: una `120_variant` approvata.
2. Fonti: prima `variant_sources_json` e fonti identificatori; poi fonti modello come integrazione.
3. Testa meccanica: scansione completa, estrazione URL/alt/metadati/JSON incorporato e deduplica.
4. Corpo Codex Luna: selezione del match variante, colore originale e colore normalizzato.
5. Antigravity: fallback solo se Codex non trova alcuna immagine esatta/probabile utilizzabile o resta una
   contraddizione non risolta.
6. Coda meccanica/Codex Mini: URL scaricabile, MIME, hash, dimensioni, duplicati, conflitti e metadata
   legali. L'originale non va ritagliato; la copia quadrata sara una fase successiva.

Le tabelle specs hanno gia la colonna `images JSONB`. Una 130-10 eseguita prima della 140-10 potrebbe fare
upsert della riga specs con `variant_id`, `product_type` minimo richiesto e immagini; e tecnicamente
possibile, ma accoppia prematuramente immagini e scheda tecnica. Prima della produzione va deciso se
accettare questo upsert parziale o eseguire la 140-10 prima della 130-10. Non e stata fatta alcuna modifica
di schema.

### 140-10 specifiche

1. La sottocategoria determina dinamicamente la tabella `specs_*` esistente.
2. Lo schema e i commenti colonna diventano il contratto del prompt.
3. I campi amministrativi (`public_id`, punteggi, flag pubblicazione, insertion date) non vengono cercati
   sul web.
4. Il corpo restituisce solo valori documentati, con fonte, evidenza, unita, confidenza e scope
   `model_common`, `variant_specific` o `market_specific`.
5. La coda valida tipo PostgreSQL, unita e conflitti. I valori non supportati restano null.

## Aspetti legali delle immagini

Tutte le immagini del benchmark sono marcate `local_test_only=true` e `publication_eligible=false`.
Nessun agente puo dedurre una licenza dalla semplice disponibilita pubblica o dall'attribuzione. Per ogni
immagine di produzione serviranno titolare, fonte, licenza/autorizzazione, data di verifica e permessi
espliciti per download, memorizzazione, modifica, uso commerciale e pubblicazione; in assenza di prova lo
stato resta `unknown` e non pubblicabile.

Il semplice hotlink non e una scorciatoia automaticamente sicura: va verificato rispetto ai termini della
fonte, alle misure anti-framing e alla giurisprudenza applicabile. La verifica legale definitiva resta da
affidare a un avvocato prima della pubblicazione.

## Artefatti

- Runner ripetibile: `Database locale/Postgres/run_130140_source_provider_benchmark.py`.
- Report grezzo: `TMP Cancellabile/benchmark_130_140_20260721/benchmark_report_v2.json`.
- Audit compatto: `TMP Cancellabile/benchmark_130_140_20260721/benchmark_audit.json`.
- Galleria per controllo umano: `TMP Cancellabile/benchmark_130_140_20260721/image_gallery.html`.
- Evidenze e immagini sono temporanee e possono essere eliminate dopo la valutazione.
