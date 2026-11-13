import {newMessageId} from './chat.js';
export const ROBBERY={enabled:true,cooldownSeconds:1800,checkSeconds:120,chance:.025,fraction:.08,cap:500,minCash:1000};
export function migrateBank(s){s.bank??={version:1,balance:0,life:0,ops:[],history:[],lastRobbery:0};return s.bank;}
export function cashChange(s,delta,kind,args={}){
 const b=migrateBank(s);if(!Number.isSafeInteger(delta)||(!Number.isFinite(s.money+delta)||s.money+delta>Number.MAX_SAFE_INTEGER)||s.money+delta<0)throw Error('Invalid cash operation.');
 b.ops.push({id:newMessageId(),kind,args,context:{skills:{...s.skills},traits:[...(s.traits||[])],goal:s.goal,home:s.home},life:b.life});s.money+=delta;return b.ops.at(-1);
}
export function validBank(b){
 const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v),integer=n=>Number.isSafeInteger(n)&&n>=0;
 return b===undefined||object(b)&&b.version===1&&integer(b.balance)&&integer(b.life)&&Number.isFinite(b.lastRobbery)&&b.lastRobbery>=0&&Array.isArray(b.ops)&&b.ops.length<=500&&b.ops.every(o=>object(o)&&/^[0-9a-f-]{36}$/i.test(o.id)&&['purchase','basket','ride','refund','wage','courier-quote','courier','task','goal','deposit','withdraw','reset'].includes(o.kind)&&object(o.args)&&integer(o.life)&&object(o.context)&&object(o.context.skills)&&Object.values(o.context.skills).every(n=>Number.isFinite(n)&&n>=0)&&Array.isArray(o.context.traits))&&Array.isArray(b.history)&&b.history.length<=50&&b.history.every(t=>object(t)&&typeof t.id==='string'&&typeof t.kind==='string'&&Number.isFinite(t.amount)&&t.amount>=0&&Number.isFinite(t.at)&&Number.isFinite(t.cash)&&t.cash>=0&&integer(t.balance));
}
export function localTransfer(s,kind,amount,id=newMessageId(),at=Date.now()){
 const b=migrateBank(s);if(b.history.some(t=>t.id===id))return false;
 if(!['deposit','withdraw'].includes(kind)||!Number.isSafeInteger(amount)||amount<=0)throw Error('Enter a positive whole amount.');
 if((kind==='deposit'?s.money:b.balance)<amount)throw Error('Insufficient '+(kind==='deposit'?'carried cash':'deposited balance')+'.');
 s.money+=kind==='deposit'?-amount:amount;b.balance+=kind==='deposit'?amount:-amount;
 b.history.unshift({id,kind,amount,at,cash:s.money,balance:b.balance});b.history=b.history.slice(0,50);return true;
}
export function localRobbery(s,{at=Date.now(),random=Math.random,id=newMessageId(),eligible=false,config=ROBBERY}={}){
 const b=migrateBank(s);if(!eligible||!config.enabled||s.money<config.minCash||at-b.lastRobbery<config.cooldownSeconds*1000||random()>=config.chance)return null;
 const loss=Math.min(config.cap,Math.floor(s.money*config.fraction));if(b.history.some(t=>t.id===id))return null;
 s.money-=loss;b.lastRobbery=at;b.history.unshift({id,kind:'npc-robbery',amount:loss,at,cash:s.money,balance:b.balance});b.history=b.history.slice(0,50);return loss;
}
export function pruneCashOps(s,acknowledged=[],guest=false){const b=migrateBank(s),ids=new Set(acknowledged.map(o=>o.id));b.ops=guest?[]:b.ops.filter(o=>!ids.has(o.id));}
export function createBankUI({body,state,save,online,transfer,history}){
 let busy=false,notice='',confirm=null;const b=migrateBank(state),fmt=n=>'₦'+Math.floor(n).toLocaleString(),get=id=>body.querySelector('#'+id);
 const escape=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function draw(){body.innerHTML='<p class="eyebrow">CITY BANK · GAME CURRENCY</p><div class="bank-balances"><article>Carried cash<strong>'+fmt(state.money)+'</strong></article><article>Deposited<strong>'+fmt(b.balance)+'</strong></article></div><p>Your deposits are safe from fictional NPC street robberies. No real money or premium purchases are involved.</p><p role="status">'+escape(notice)+'</p>'+(confirm?'<p>Confirm '+confirm.kind+' of '+fmt(confirm.amount)+'?</p><button id="bank-confirm">Confirm transfer</button><button id="bank-cancel">Cancel</button>':'<label class="field">Amount<input id="bank-amount" type="number" inputmode="numeric" min="1" step="1"></label><button id="bank-deposit">Deposit carried cash</button><button id="bank-withdraw">Withdraw to carried cash</button>')+'<h3>Transactions</h3><button id="bank-history">Refresh history</button><ul class="bank-history">'+b.history.map(t=>'<li>'+escape(t.kind)+' · '+fmt(t.amount)+'<br><small>'+new Date(t.at).toLocaleString()+' · cash '+fmt(t.cash)+' · deposited '+fmt(t.balance)+'</small></li>').join('')+'</ul>';
 if(confirm){get('bank-cancel').onclick=()=>{confirm=null;draw()};get('bank-confirm').disabled=busy;get('bank-confirm').onclick=async()=>{if(busy)return;busy=true;try{if(online())await transfer(confirm);else {localTransfer(state,confirm.kind,confirm.amount,confirm.id);save()}confirm=null;notice='Transfer saved.'}catch(e){notice=e.message}finally{busy=false;draw()}};}
 else for(const kind of ['deposit','withdraw'])get('bank-'+kind).onclick=()=>{const amount=Number(get('bank-amount').value);if(!Number.isSafeInteger(amount)||amount<=0){notice='Enter a positive whole amount.';draw();return}confirm={kind,amount,id:newMessageId()};draw()};
 get('bank-history').onclick=async()=>{try{if(online())await history();notice='History updated.'}catch(e){notice=e.message}draw()};
 }draw();return {tick(){},dispose(){}};
}
