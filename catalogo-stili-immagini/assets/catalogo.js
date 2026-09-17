(async()=>{
'use strict';
const response=await fetch('assets/catalogo.json?v=20260917-3');
if(!response.ok)throw new Error('Catalogo non disponibile');
const styles=(await response.json()).map(s=>({...s,image:s.image?'assets/'+s.image+'?v=20260917-3':'',thumbnail:s.thumbnail?'assets/'+s.thumbnail+'?v=20260917-3':'',attributionFile:s.attributionFile?'assets/'+s.attributionFile:''}));
const $=id=>document.getElementById(id);let category='Tutti',selected=null;
const categories=['Tutti',...new Set(styles.map(s=>s.category))];
categories.forEach(c=>{const b=document.createElement('button');b.className='chip';b.textContent=c;b.setAttribute('aria-pressed',c===category);b.onclick=()=>{category=c;document.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed',x.textContent===c));render()};$('filters').append(b)});
// Only attach image URLs near the viewport: browser reloads must not fetch all 296 images.
function loadThumbnail(img){
 if(!img.dataset.src)return;
 img.src=img.dataset.src;delete img.dataset.src;thumbnailObserver?.unobserve(img);
}
const thumbnailObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
 entries.forEach(entry=>{if(entry.isIntersecting)loadThumbnail(entry.target);});
},{rootMargin:'450px 0px'}):null;
function render(){
 const q=$('page-search-input').value.trim().toLocaleLowerCase('it');
 const num=String(parseInt(q.replace('#',''),10));
 const visible=styles.filter(s=>(category==='Tutti'||s.category===category)&&(!q||(/^#?\d+$/.test(q)?String(s.id)===num:[s.title,s.description,s.category,s.era].join(' ').toLocaleLowerCase('it').includes(q))));
 $('count').textContent=visible.length+' / '+styles.length+' stili';
 thumbnailObserver?.disconnect();$('grid').replaceChildren();$('empty').hidden=visible.length>0;
 const fragment=document.createDocumentFragment();
 visible.forEach((s,i)=>{
  const card=document.createElement('article');card.className='style-card';
  const button=document.createElement('a');button.className='preview';button.href='#stile-'+s.id;
  button.setAttribute('aria-label','Apri stile '+s.id+': '+s.title);
  const img=document.createElement('img');img.alt=s.title+' — '+s.description;
  img.decoding='async';img.draggable=false;
  img.onerror=()=>{img.alt='Anteprima non disponibile. Apri la scheda per la fonte.'};
  if(s.image){
   img.dataset.src=s.thumbnail||s.image;button.append(img);
   if(i<2||!thumbnailObserver)loadThumbnail(img);else thumbnailObserver.observe(img);
  }else{
   const notice=document.createElement('span');notice.textContent='Esempio storico · consulta la fonte';
   notice.style.cssText='display:block;padding:36px;color:#173e35';button.append(notice);
  }
  const number=document.createElement('span');number.className='number';number.textContent=String(s.id).padStart(2,'0');button.append(number);
  const view=document.createElement('span');view.className='view';view.textContent='Esplora stile ↗';button.append(view);
  button.onclick=e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();openStyle(s.id)};
  const title=document.createElement('h2');title.textContent=s.title;
  const sub=document.createElement('div');sub.className='sub';
  const cat=document.createElement('span');cat.textContent=s.category;
  const era=document.createElement('span');era.textContent=s.era;
  sub.append(cat,era);card.append(button,title,sub);fragment.append(card);
 });
 $('grid').append(fragment);
 if(typeof collectSearchResults==='function')collectSearchResults();
}
function link(text,url){const a=document.createElement('a');a.textContent=text;a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
function openStyle(id){selected=styles.find(s=>s.id===Number(id));if(!selected)return;const s=selected;$('detailImage').hidden=!s.image;$('sourceOnly').hidden=!!s.image;if(s.image)$('detailImage').src=s.image;else $('detailImage').removeAttribute('src');$('detailImage').alt=s.title+' — anteprima completa';$('detailNumber').textContent='STILE '+String(s.id).padStart(2,'0')+' · '+s.category.toUpperCase();$('detailTitle').textContent=s.title;$('description').textContent=s.description;$('example').textContent='Esempio di richiesta: «Genera [soggetto] con lo stile '+s.id+'» oppure «Trasforma questa foto con lo stile '+s.id+'».';$('prompt').value=s.prompt;$('original').textContent=s.originalPrompt;$('note').textContent=s.note;$('status').textContent='';$('originalDetails').open=false;const cr=$('credits');cr.replaceChildren();if(s.image)cr.append(document.createTextNode('Anteprima ridimensionata e compressa, senza ritagli.'),document.createElement('br'));if(s.source)cr.append(link('Fonte: '+s.sourceTitle,s.source),document.createElement('br'));else cr.append(document.createTextNode(s.sourceTitle),document.createElement('br'));s.authors.forEach(a=>cr.append(link(a.name,a.url),document.createTextNode(' · ')));cr.append(document.createElement('br'),document.createTextNode(s.license));if(s.remoteImage)cr.append(document.createElement('br'),link('Immagine originale online',s.remoteImage));if(s.attributionFile)cr.append(document.createTextNode(' · '),link('Attribuzione della fonte',s.attributionFile));if(!s.source.includes('jamez-bondos')&&!s.source.includes('openai/openai-cookbook')&&s.source)cr.append(document.createElement('br'),document.createTextNode('La licenza del repository non garantisce da sola i diritti di ogni immagine esterna.'));if(s.source.includes('#cases-'))cr.append(document.createElement('br'),document.createTextNode('Immagine: © 2025 Jamez Bondos, come attribuita dal repository. Prompt dei creatori indicati. Adattamento italiano: Codex.'));history.replaceState(null,'','#stile-'+s.id);if(!$('modal').open)$('modal').showModal()}
$('page-search-input').addEventListener('input',render);$('close').onclick=()=>$('modal').close();$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('modal').close()}});$('modal').addEventListener('close',()=>history.replaceState(null,'',location.pathname+location.search));
async function copy(text){try{await navigator.clipboard.writeText(text);$('status').textContent='Copiato. Incolla nella conversazione.'}catch{const field=document.createElement('textarea');field.value=text;field.style.position='fixed';field.style.opacity='0';$('modal').append(field);field.select();const ok=document.execCommand('copy');field.remove();$('status').textContent=ok?'Copiato. Incolla nella conversazione.':'Copia automatica non disponibile: seleziona il prompt e premi Ctrl+C.'}}
$('copyPrompt').onclick=()=>copy($('prompt').value);$('copyRequest').onclick=()=>copy('Usa lo stile '+selected.id+' — '+selected.title+' del Catalogo Stili Immagini.\n'+$('prompt').value);render();function openFromHash(){const initial=location.hash.match(/^#stile-(\d+)$/);if(initial)openStyle(initial[1]);}window.addEventListener('hashchange',openFromHash);openFromHash();
window.catalogPreparePrint=async()=>{
 const savedCategory=category,savedQuery=$('page-search-input').value;
 category='Tutti';$('page-search-input').value='';render();
 const restore=()=>{category=savedCategory;$('page-search-input').value=savedQuery;render();document.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed',x.textContent===category));};
 await Promise.all([...document.querySelectorAll('#grid img')].map(img=>{loadThumbnail(img);return img.decode().catch(()=>{});}));
 return restore;
};
// Also materialize deferred URLs when the browser's own print shortcut is used.
window.addEventListener('beforeprint',()=>document.querySelectorAll('#grid img').forEach(loadThumbnail));
})().catch(error=>{document.getElementById('count').textContent='Catalogo non disponibile';const empty=document.getElementById('empty');empty.hidden=false;empty.textContent='Non è stato possibile caricare gli stili. Ricarica la pagina per riprovare.';console.error(error);});
