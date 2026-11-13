import {MOVIES,movieAvailable} from './movie-catalogue.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createMoviesApp({body,state,save,now=Date.now}){
 let video=null,selected=null,lastSaved=-Infinity,alive=true;
 state.movieWatch??={};
 const el=id=>body.querySelector('#'+id);
 function remember(force=false){if(!video||!selected||!Number.isFinite(video.currentTime)||!force&&now()-lastSaved<5000)return;const value=video.ended?0:Math.max(0,video.currentTime),completed=!!video.ended;if(state.movieWatch[selected.id]?.position===value&&state.movieWatch[selected.id]?.completed===completed)return;state.movieWatch[selected.id]={position:value,completed};lastSaved=now();save();}
 function stop(){if(video){remember(true);for(const event of ['loadedmetadata','waiting','playing','pause','timeupdate','ended','error'])video['on'+event]=null;video.pause();video.removeAttribute('src');video.load();video=null;}}
 function catalogue(){stop();selected=null;body.innerHTML='<p class="eyebrow">CITY &amp; US ORIGINALS</p><h3>A little cinema, wherever you are.</h3>'+MOVIES.filter(f=>movieAvailable(f,now())).map(f=>'<button class="movie-card" id="movie-'+f.id+'"><img src="'+esc(f.artwork)+'" alt=""><span><strong>'+esc(f.title)+'</strong><br>'+esc(f.durationLabel)+'</span></button>').join('')+'<p class="note">Commercial films will appear only after rights and playable content are supplied. This catalogue currently contains our original sample.</p>';for(const f of MOVIES.filter(f=>movieAvailable(f,now())))el('movie-'+f.id).onclick=()=>details(f);}
 function details(f){stop();selected=f;body.innerHTML='<img class="movie-poster" src="'+esc(f.artwork)+'" alt=""><h3>'+esc(f.title)+'</h3><p>'+esc(f.description)+'</p><p>'+esc(f.credit)+' · '+f.year+'</p><p class="note">'+esc(f.rights)+'</p><button id="movie-play" class="primary">'+(state.movieWatch[f.id]?.position>1?'Resume film':'Play film')+'</button><button id="movie-start" class="secondary">Play from beginning</button><button id="movie-back" class="secondary">Back to catalogue</button>';el('movie-play').onclick=()=>play(f,false);el('movie-start').onclick=()=>play(f,true);el('movie-back').onclick=catalogue;}
 function play(f,restart){
 if(!movieAvailable(f,now())){catalogue();return;}
 stop();
 body.innerHTML='<h3>'+esc(f.title)+'</h3><video class="movie-player" id="movie-video" controls playsinline preload="metadata" poster="'+esc(f.artwork)+'"></video><p id="movie-status" role="status">Loading film…</p><button id="movie-fullscreen" class="secondary">Fullscreen</button><button id="movie-retry" class="secondary" hidden>Retry playback</button><button id="movie-details" class="secondary">Film details</button>';video=el('movie-video');const current=video;selected=f;
 const status=text=>{if(alive&&video===current)el('movie-status').textContent=text};
 current.onloadedmetadata=()=>{const resume=restart?0:state.movieWatch[f.id]?.position||0;if(resume>0&&Number.isFinite(current.duration)&&resume<current.duration-1)current.currentTime=resume;status('Ready. Use the player controls to play, pause, seek or adjust sound.');current.play().catch(()=>status('Tap Play to begin.'))};
 current.onwaiting=()=>status('Buffering… your watch position is saved.');current.onplaying=()=>status('Playing · position saves automatically');current.onpause=()=>{remember(true);status('Paused · position saved')};current.ontimeupdate=()=>remember();current.onended=()=>{remember(true);status('Film finished. Thank you for watching.');};
 current.onerror=()=>{status('The film could not load or its format is unsupported. Your watch position is retained.');el('movie-retry').hidden=false};
 current.src=f.url;current.load();
 el('movie-retry').onclick=()=>{remember(true);play(f,false)};
 el('movie-fullscreen').onclick=async()=>{try{if(current.requestFullscreen)await current.requestFullscreen();else if(current.webkitEnterFullscreen)current.webkitEnterFullscreen();else status('Use the player’s fullscreen control if supported.')}catch{status('Fullscreen was unavailable. Playback controls still work.')}};
 el('movie-details').onclick=()=>details(f);
 }
 catalogue();return {tick(){if(video&&!movieAvailable(selected,now())){stop();catalogue()}},pause(){remember(true);video?.pause()},dispose(){stop();alive=false}};
}
