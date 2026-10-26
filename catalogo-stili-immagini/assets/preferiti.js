/* Preferiti privati del profilo browser/WebView. Nessun dato inviato al sito. */
(() => {
 'use strict';
 const KEY='giu-page:catalogo-stili-immagini:preferiti:v1';
 const CATALOG='catalogo-stili-immagini';
 const heart='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21C10 19 2 13 2 7.5C2 1.8 8.5 .5 12 5.5C15.5 .5 22 1.8 22 7.5C22 13 14 19 12 21Z"/></svg>';
 let ids=new Set(),only=false,broken=false,known=new Set(),onChange=()=>{};
 let message='',error=false;
 const $=id=>document.getElementById(id);
 function parse(raw){
  const data=JSON.parse(raw);
  if(!data||data.schemaVersion!==1||data.catalog!==CATALOG||!Array.isArray(data.ids)||data.ids.length>10000||!data.ids.every(id=>Number.isSafeInteger(id)&&id>0))throw Error('Backup non valido');
  return new Set(data.ids);
 }
 function read(){const raw=localStorage.getItem(KEY);return raw===null?new Set():parse(raw);}
 try{ids=read();}catch(e){broken=true;message='Preferiti non leggibili o salvataggio bloccato. I dati esistenti non vengono sovrascritti.';error=true;}
 function encode(set){return JSON.stringify({schemaVersion:1,catalog:CATALOG,ids:[...set].sort((a,b)=>a-b)});}
 function tell(text,isError=false){message=text;error=isError;const node=$('favoritesStatus');if(node){node.textContent=text;node.dataset.error=String(isError);}if(isError&&typeof window.showToast==='function')window.showToast(text);}
 function sync(){
  document.querySelectorAll('[data-favorite-id]').forEach(b=>{
   const active=ids.has(Number(b.dataset.favoriteId));b.setAttribute('aria-pressed',String(active));
   b.setAttribute('aria-label',(active?'Rimuovi dai preferiti: ':'Aggiungi ai preferiti: ')+b.dataset.favoriteTitle);
   b.title=b.getAttribute('aria-label');
  });
  const count=[...ids].filter(id=>known.has(id)).length;
  const filter=$('favoritesFilter');if(filter){filter.setAttribute('aria-pressed',String(only));filter.querySelector('span').textContent='Preferiti ('+count+')';}
  document.body.classList.toggle('favorites-only',only);
 }
 function save(next){
  try{const raw=encode(next);localStorage.setItem(KEY,raw);if(localStorage.getItem(KEY)!==raw)throw Error('Scrittura non confermata');ids=next;broken=false;sync();onChange();tell('Preferiti salvati su questo dispositivo.');return true;}
  catch(e){tell('Impossibile salvare i preferiti. La selezione non è stata modificata. Verificare le impostazioni di archiviazione.',true);return false;}
 }
 function toggle(id){
  if(broken){tell('Salvataggio non disponibile o dati non leggibili. Ripristinare un backup prima di modificare i preferiti.',true);return;}
  try{const next=read();next.has(id)?next.delete(id):next.add(id);save(next);}catch(e){broken=true;tell('Preferiti non leggibili. I dati esistenti sono stati conservati.',true);}
 }
 function button(id,title,withText=false){
  const b=document.createElement('button');b.type='button';b.className='favorite-heart';b.dataset.favoriteId=id;b.dataset.favoriteTitle=title;b.innerHTML=heart;
  if(withText){b.classList.add('favorite-detail');const label=document.createElement('span');label.textContent='Preferito';b.append(label);}
  b.onclick=()=>toggle(Number(id));const active=ids.has(Number(id));b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',(active?'Rimuovi dai preferiti: ':'Aggiungi ai preferiti: ')+title);b.title=b.getAttribute('aria-label');return b;
 }
 function init(styles,callback){
  known=new Set(styles.map(s=>s.id));onChange=()=>{const active=document.activeElement;const id=active?.dataset.favoriteId;const detail=active?.id==='detailFavorite';callback();if(id&&!detail)(document.querySelector('#grid [data-favorite-id="'+id+'"]')||$('favoritesFilter'))?.focus({preventScroll:true});};
  const actions=document.querySelector('.hero__actions')||document.querySelector('.controls');
  const filter=document.createElement('button');filter.type='button';filter.id='favoritesFilter';filter.className='button button--favorites';filter.innerHTML=heart+'<span>Preferiti</span>';filter.setAttribute('aria-controls','grid');filter.onclick=()=>{only=!only;sync();onChange();};actions.append(filter);
  const panel=document.createElement('details');panel.className='favorites-backup';panel.innerHTML='<summary>Salvataggio dei preferiti</summary><p>I preferiti restano in questa app o in questo browser, su questo dispositivo. Non sono sincronizzati tra dispositivi. La cancellazione dei dati o la disinstallazione può eliminarli: conservare una copia del backup in un luogo sicuro.</p><div class="favorites-backup-actions"><button type="button" id="favoritesExport">Copia backup</button><button type="button" id="favoritesImport">Ripristina backup</button></div><label for="favoritesBackup">Backup dei preferiti</label><textarea id="favoritesBackup" rows="3" spellcheck="false" placeholder="Copiare il backup oppure incollarlo qui per ripristinarlo."></textarea>';
  const status=document.createElement('p');status.id='favoritesStatus';status.className='favorites-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const host=document.querySelector('.catalog-options')||document.querySelector('.controls');host.after(panel,status);
  $('favoritesExport').onclick=async()=>{
   if(broken){tell('Preferiti non leggibili: esportazione sospesa per non produrre un backup incompleto.',true);return;}
   try{ids=read();sync();}catch(e){tell('Preferiti non leggibili. Esportazione non eseguita.',true);return;}
   const text=encode(ids);const field=$('favoritesBackup');field.value=text;
   try{await navigator.clipboard.writeText(text);tell('Backup copiato. Conservarlo fuori dall’app, per esempio in una nota personale.');}
   catch(e){field.focus();field.select();tell('Backup pronto nel campo: selezionare e copiare il testo, poi conservarlo fuori dall’app.');}
  };
  $('favoritesImport').onclick=()=>{
   let imported;try{const raw=$('favoritesBackup').value;if(raw.length>200000)throw Error();imported=parse(raw);}catch(e){tell('Backup non valido. Nessun preferito è stato modificato.',true);return;}
   let current=ids;try{current=read();}catch(e){/* Un backup valido permette di recuperare un archivio illeggibile. */}
   if(save(new Set([...current,...imported])))tell('Backup ripristinato e unito ai preferiti esistenti.');
  };
  tell(message,error);sync();
 }
 window.addEventListener('storage',e=>{if(e.key!==KEY&&e.key!==null)return;try{ids=read();broken=false;sync();onChange();tell('Preferiti aggiornati da un’altra scheda.');}catch(e){broken=true;tell('Preferiti non leggibili. I dati esistenti sono stati conservati.',true);}});
 window.CatalogFavorites={init,button,has:id=>ids.has(id),get only(){return only;},setOnly:value=>{only=!!value;sync();}};
})();
