/* v4: save slot picker in the menu and the statistics grid on the end screen. */
'use strict';
function fmtTime(sec){sec=Math.max(0,Math.floor(sec));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return (h?h+':'+String(m).padStart(2,'0'):String(m))+':'+String(s).padStart(2,'0')}
function slotSummary(cp){
 if(!cp)return ['PRÁZDNY'];
 const mp=cp.mission?.mars?.phase;
 const place=mp&&mp!=='none'?(mp==='surface'?'MARS · POVRCH':mp==='done'?'MARS · OPRAVENÉ':'MARS · ZASTÁVKA'):(sectors[cp.room]?.name||'').split(' / ')[0];
 return [place,`${fmtTime(cp.stats?.time||0)} · ${cp.score||0} b`];
}
function selectSlot(n){
 activeSlot=n;try{localStorage.setItem(SLOT_KEY,String(n))}catch{}
 checkpoint=readSlot(n);stats=checkpoint?.stats?{...freshStats(),...checkpoint.stats}:freshStats();
 $('continue').classList.toggle('hidden',!checkpoint);renderSlots();
}
function renderSlots(){
 const box=$('slots');if(!box)return;
 const saves=Array.from({length:SLOT_COUNT},(_,i)=>readSlot(i+1));
 // A first-time player has no saves, so the picker stays out of the way until one exists.
 box.classList.toggle('hidden',!saves.some(Boolean));
 const row=document.createElement('div');row.className='slotRow';
 saves.forEach((cp,i)=>{
  const b=document.createElement('button');b.type='button';b.className='secondary'+(activeSlot===i+1?' active':'');
  b.setAttribute('aria-pressed',activeSlot===i+1?'true':'false');
  const t=document.createElement('span');t.textContent='SLOT '+(i+1);
  b.append(t,...slotSummary(cp).map(line=>{const s=document.createElement('small');s.textContent=line;return s}));b.onclick=()=>selectSlot(i+1);row.append(b);
 });
 const hint=document.createElement('p');
 hint.textContent=saves[activeSlot-1]?`Nová hra prepíše slot ${activeSlot}. Pre iné uloženie vyber prázdny slot.`:`Nová hra sa uloží do slotu ${activeSlot}.`;
 box.replaceChildren(row,hint);renderMarsNote();
}
function renderMarsNote(){const n=$('marsStartNote');if(n)n.textContent=readSlot(activeSlot)?`Prepíše slot ${activeSlot}`:`Uloží sa do slotu ${activeSlot}`}
function renderEndStats(win){
 const acc=stats.shots?Math.min(100,Math.round(stats.hits/stats.shots*100)):0;
 const systems=['relay','cooling','isolated','drive'].filter(k=>shipSystems[k]).length;
 if(win&&stats.time>0&&(!bestTime||stats.time<bestTime)){bestTime=stats.time;try{localStorage.setItem(BEST_TIME_KEY,String(Math.round(bestTime)))}catch{}}
 const rows=[['ČAS HRY',fmtTime(stats.time)],['PRESNOSŤ',acc+' %'],['ZÁSAHY / VÝSTRELY',stats.hits+' / '+stats.shots],['SMRTI',String(stats.deaths)],['OBDRŽANÉ POŠKODENIE',String(Math.round(stats.damage))],['ZÁZNAMY V DENNÍKU',String(logs.length)],['OPRAVENÉ SYSTÉMY',systems+' / 4']];
 if(win&&bestTime)rows.push(['NAJLEPŠÍ ČAS',fmtTime(bestTime)]);
 $('endgrid').replaceChildren(...rows.map(([k,v])=>{const d=document.createElement('div'),a=document.createElement('span'),b=document.createElement('b');a.textContent=k;b.textContent=v;d.append(a,b);return d}));
}
renderSlots();
