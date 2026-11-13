const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const APP_GROUPS={daily:['jobs','tasks','map','food','ride','shopping','inventory','bank'],social:['profile','chat','account'],media:['movies','camera','gallery','music'],personal:['wallpaper','fonts','settings']};
export function createPhoneHome({body,names,icon,state,open,status}){
 let category='all',search='',page=0;const size=12;
 const time=()=>{const h=Math.floor(state.time/60);return String(h).padStart(2,'0')+':'+String(Math.floor(state.time%60)).padStart(2,'0')};
 function draw(){
 const list=Object.entries(names).filter(([id,name])=>(category==='all'||APP_GROUPS[category]?.includes(id))&&name.toLowerCase().includes(search.toLowerCase())),pages=Math.max(1,Math.ceil(list.length/size));page=Math.min(page,pages-1);
 body.innerHTML='<div class="phone-widgets"><article class="phone-time-widget"><small>YOUR NEIGHBOURHOOD</small><strong id="phone-game-time">'+time()+'</strong><span>Day '+state.day+' · Lagos game time</span></article><article class="phone-wallet-widget"><small>Carried cash</small><strong>₦'+Math.floor(state.money).toLocaleString()+'</strong><span id="phone-sync-label">'+esc(status())+'</span></article></div><label class="phone-search"><span>Search apps</span><input id="phone-search" type="search" placeholder="Find an app" value="'+esc(search)+'" autocomplete="off"></label><nav class="phone-categories" aria-label="App categories">'+Object.entries({all:'All',daily:'Daily life',social:'People',media:'Media',personal:'Personal'}).map(([id,label])=>'<button id="category-'+id+'" aria-pressed="'+(category===id)+'">'+label+'</button>').join('')+'</nav><div class="app-grid">'+list.slice(page*size,(page+1)*size).map(([id,name])=>'<button id="phone-'+id+'" class="app"><span class="app-icon app-'+id+'">'+icon(id)+'</span><span>'+esc(name)+'</span></button>').join('')+'</div>'+(!list.length?'<p>No matching apps.</p>':'')+'<div class="phone-pages"><button id="apps-prev" aria-label="Previous app page">‹</button><span>Page '+(page+1)+' of '+pages+'</span><button id="apps-next" aria-label="Next app page">›</button></div>';
 for(const [id]of list.slice(page*size,(page+1)*size))body.querySelector('#phone-'+id).onclick=()=>open(id);
 for(const id of ['all',...Object.keys(APP_GROUPS)])body.querySelector('#category-'+id).onclick=()=>{category=id;page=0;draw()};
 const input=body.querySelector('#phone-search');input.oninput=()=>{search=input.value;page=0;draw();const n=body.querySelector('#phone-search');n.focus();n.setSelectionRange?.(search.length,search.length)};
 body.querySelector('#apps-prev').disabled=page===0;body.querySelector('#apps-next').disabled=page>=pages-1;
 body.querySelector('#apps-prev').onclick=()=>{page--;draw()};body.querySelector('#apps-next').onclick=()=>{page++;draw()};
 }
 draw();return {tick(){const t=body.querySelector('#phone-game-time');if(t)t.textContent=time();const s=body.querySelector('#phone-sync-label');if(s)s.textContent=status()},dispose(){}};
}
