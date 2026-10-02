(()=>{
const normalized=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'");
const cards=[...document.querySelectorAll('.film-card')];let lastQuery='';
function filterCatalog(value){const y=scrollY,q=normalized(value.trim());for(const card of cards){const match=card.querySelector('.track-matches'),tracks=JSON.parse(card.dataset.tracks),hits=q.length>=2?tracks.filter(t=>normalized(t).includes(q)):[];card.hidden=q.length>=2&&!normalized(card.dataset.search).includes(q)&&!hits.length;match.textContent=hits.join(' · ');match.hidden=!hits.length;}const empty=document.querySelector('#empty');if(empty)empty.hidden=cards.some(c=>!c.hidden);lastQuery=value;window.scrollTo(0,y);}
document.addEventListener('input',e=>{if(cards.length&&e.target.id==='gp-search-input')filterCatalog(e.target.value);},true);
document.addEventListener('giu:page-ready',()=>{const input=document.querySelector('#gp-search-input');if(cards.length&&input)input.placeholder='Film, brano o compositore';});
// On the index the lens searches track names as well as visible film metadata.
const toast=document.querySelector('.toast');let timer;
function notify(s){toast.textContent=s;clearTimeout(timer);timer=setTimeout(()=>toast.textContent='',3200);}
document.addEventListener('click',async e=>{
const button=e.target.closest('[data-preview]');if(button){const audio=document.querySelector('#audio'),player=document.querySelector('#player'),message=document.querySelector('#player-message');audio.pause();document.querySelector('#player-title').textContent=button.dataset.title;document.querySelector('#player-film').textContent=button.dataset.film;document.querySelector('#player-link').href=button.dataset.link;message.textContent='Caricamento dell’anteprima…';player.hidden=false;audio.src=button.dataset.preview;try{await audio.play();message.textContent='Anteprima online da Apple Music.';}catch{message.textContent='Usare i controlli audio oppure aprire Apple Music.';}return;}
const back=e.target.closest('[data-return]');if(back&&document.referrer&&new URL(document.referrer).origin===location.origin&&new URL(document.referrer).pathname===new URL(back.href).pathname){e.preventDefault();history.back();return;}
const ref=e.target.closest('a[href^="#fonte-"]');if(ref){const target=document.querySelector(ref.getAttribute('href'));if(target){e.preventDefault();target.closest('details').open=true;target.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',ref.getAttribute('href'));}}
});
document.querySelector('#audio')?.addEventListener('error',()=>document.querySelector('#player-message').textContent='Anteprima non disponibile. Aprire Apple Music.');
document.querySelector('#close-player')?.addEventListener('click',()=>{const a=document.querySelector('#audio');a.pause();a.removeAttribute('src');a.load();document.querySelector('#player').hidden=true;});
let printState;
window.addEventListener('beforeprint',()=>{printState={details:[...document.querySelectorAll('details')].map(d=>[d,d.open]),cards:cards.map(c=>[c,c.hidden])};printState.details.forEach(([d])=>d.open=true);cards.forEach(c=>c.hidden=false);});
window.addEventListener('afterprint',()=>{printState?.details.forEach(([d,open])=>d.open=open);printState?.cards.forEach(([c,hidden])=>c.hidden=hidden);});
document.querySelector('[data-print]')?.addEventListener('click',()=>{const sources=document.querySelector('.sources');if(window.GiuPageNative?.print){const open=sources.open;sources.open=true;window.GiuPageNative.print();setTimeout(()=>sources.open=open,1500);}else window.print();});
document.querySelectorAll('[data-print],[data-share]').forEach(b=>b.dataset.gpBound='true');
document.querySelector('[data-share]')?.addEventListener('click',async()=>{const url=document.querySelector('link[rel="canonical"]').href;try{if(navigator.share)await navigator.share({url});else{await navigator.clipboard.writeText(url);notify('Link copiato.');}}catch(err){if(err.name!=='AbortError')notify('Condivisione non disponibile.');}});
document.addEventListener('giu:close-search',()=>{if(cards.length)filterCatalog('');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cards.length)filterCatalog('');});
})();
