/* Sectors, gates, weapons, mutable game state, saved progress loading, tone/notice/hud helpers. */
'use strict';
const sectors=[
 {name:'ARÉNA / SEKTOR 07',bounds:[3,67,24,86],waves:2,entry:[13.5,83],color:'#5ae8d8'},
 {name:'NÁKLADOVÁ PALUBA',bounds:[2,48,25,67],waves:3,entry:[13.5,65],color:'#5ae8d8'},
 {name:'REAKTOR NOVA',bounds:[2,28,25,48],waves:3,entry:[13.5,46],color:'#c589ff'},
 {name:'HANGÁR / POSLEDNÝ ODPOR',bounds:[2,10,25,28],waves:2,entry:[13.5,26],color:'#ffa260'},
 {name:'KOKPIT',bounds:[7,1,19,10],waves:0,entry:[13.5,8.5],color:'#5ae8d8'}];
const gates=[67,48,28,10].map((z,i)=>({x:13.5,z:z+.5,row:z,open:0,active:false,name:sectors[i+1].name}));
const weapons=[{name:'PULZNÁ PUŠKA / MK.04',cap:16,damage:1,delay:.17,reload:1.2},{name:'NEON NOVA / BOSS CORE',cap:7,damage:5,delay:.42,reload:1.5}];
let colliders=[],map=[],props=[],barrels=[],lights=[],staticMesh,doorL,doorR,robotMeshes={},orbMesh,novaOrb,barrelMesh,planetMesh,skyMesh,skyDome,consoleMesh;
let defenses=[],sideDoors=[],cardMesh,modMesh,turretMesh,card=false,power=false,upgraded=false,secretFound=false,logs=[],commTimer=0,alarmTimer=0,alarmTriggered=false,warpFlash=0;
let pickups=[],medMesh,weaponMesh,glassMesh,navReady=false,tour=false,supplyUsed=false;
let waveMedDropped=false,waveMedDeaths=[];
let state='menu',player={x:13.5,y:83,a:-Math.PI/2,pitch:0,hp:100},keys={},enemies=[],bolts=[],particles=[];
let room=0,roomWave=0,totalWaves=0,cleared=[false,false,false,false,false],entered=[true,false,false,false,false];
let score=0,kills=0,weapon=0,unlocked=false,ammo=16,magazines=[16,7],reload=0,cooldown=0,flash=0,hurt=0,hit=0,time=0,nextWave=0,noticeTimer=0,walk=0,flightTime=0;
let mouseDown=false,muted=false,audio,checkpoint=null,flow=[],flowTimer=0,objective='',best=0,last=performance.now();
// The continuation owns its saves. Import the supplied version once without modifying its slots.
const SAVE_KEY='neon-breach-next-mars-checkpoint',SLOT_COUNT=3,SLOT_KEY='neon-breach-next-active-slot',BEST_TIME_KEY='neon-breach-next-best-time';
let activeSlot=1,bestTime=0;
const slotKey=n=>n===1?SAVE_KEY:`${SAVE_KEY}-slot${n}`;
try{
 const marker='neon-breach-next-imported';
 if(!localStorage.getItem(marker)){
  for(let n=1;n<=SLOT_COUNT;n++){
   const oldKey='neon-breach-kokpit-clear-view-checkpoint'+(n===1?'':`-slot${n}`),raw=localStorage.getItem(oldKey);
   if(raw&&!localStorage.getItem(slotKey(n))&&JSON.parse(raw)?.version===2)localStorage.setItem(slotKey(n),raw);
  }
  localStorage.setItem(marker,'1');
 }
}catch{}
function readSlot(n){try{const s=JSON.parse(localStorage.getItem(slotKey(n))||'null');return s?.version===2?s:null}catch{return null}}
function freshStats(){return{time:0,shots:0,hits:0,deaths:0,damage:0}}
let stats=freshStats();
try{best=+(localStorage.getItem('neon-breach-next-best')||0);activeSlot=+localStorage.getItem(SLOT_KEY)||1;if(activeSlot<1||activeSlot>SLOT_COUNT)activeSlot=1;bestTime=+(localStorage.getItem(BEST_TIME_KEY)||0);checkpoint=readSlot(activeSlot);if(checkpoint?.stats)stats={...freshStats(),...checkpoint.stats}}catch{}
function tone(freq,duration,type='square',volume=.035,slide=.3){if(muted)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,freq*slide),audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}}
function notice(text,duration=3){$('notice').textContent=text;$('notice').style.opacity=1;noticeTimer=duration}
function hud(){ $('health').textContent=Math.ceil(player.hp);$('healthbar').style.width=player.hp+'%';$('ammo').textContent=ammo;$('weaponname').textContent=weapons[weapon].name;$('reloadtext').textContent=reload?'PREBÍJAM…':unlocked?'1 / 2 — ZBRAŇ · R — PREBIŤ':'R — PREBIŤ';$('score').innerHTML=String(score).padStart(5,'0')+' <span>BODOV</span>';$('wave').textContent=sectors[room].waves?`${sectors[room].name} · ${roomWave}/${sectors[room].waves}`:'KOKPIT / NAVIGÁCIA';$('objective').textContent=objective;$('progress').textContent=`${totalWaves} / 10 VĹN`;const boss=enemies.find(e=>e.kind==='boss');$('bossbar').classList.toggle('hidden',!boss);if(boss)$('bosshealth').style.width=100*boss.hp/boss.maxhp+'%';if(!intro.gun){$('weaponname').textContent='PRÁZDNE RUKY';$('ammo').textContent='—';$('reloadtext').textContent='NÁJDI PUŠKU · E';}refreshHeldToolHUD();}
function goal(text){if(objective===text)return;objective=text;hud()}
