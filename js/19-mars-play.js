/* Mars interlude, part 3: objectives, interactions, welding, doors, cinematics and arrival. */
'use strict';
const MARS_RECORDS={
 "ARES-3 / SKLADOVÝ DENNÍK": "ARES-3 je automatický zásobovací sklad pre lode triedy ARGO. Posádka ho po poslednej prachovej búrke opustila; dohľad zabezpečuje miestny uzol siete AEGIS. Maják ARGO-09 stále vysiela karanténny príznak. Uzol preto neuznáva tvoje servisné oprávnenie a po obnovení napájania aktivuje ochranu zásob. Núdzový prívod otvoril dvere, bezpečnostný okruh však zostal nezávislý. Evidencia: 1 náhradný stabilizátor záložného pohonu, v prepravnej klietke pri severnej stene. Diel je zaistený pásmi, ktoré treba odrezať zváračkou. Servisný rozvod kyslíka dopĺňa zásobu v uzavretom skafandri. Povrch Marsu je nedýchateľný; prilbu neotváraj.",
 "KOKPIT / VÝPADOK POHONU · MARS": "Krátky skok na plánovanú servisnú zastávku je dokončený. Pravý stabilizátor záložného pohonu pri ukončení skoku definitívne zlyhal; bezpečnostná poistka pohon odstavila na obežnej dráhe Marsu. Priamy návrat na LYRU by nezvládol. Logistický archív potvrdzuje náhradný diel v sklade ARES-3. Pristávací modul KESTREL-2 je pripojený na konci servisnej lávky a má vlastné nezávislé motory. Vezmi skafander aj zváračku, prejdi komorou a nastúp do modulu. Po návrate vymeň stabilizátor na lávke a prepočítaj kurz na LYRU.",
 "SURVEY-04 / POSLEDNÝ SERVISNÝ ZÁZNAM": "Prieskumný transportér SURVEY-04 bol počas búrky zatlačený do skalnej steny. Posádka stihla odísť do ARES-3 a neskôr bola vyzdvihnutá zásobovacou loďou. Motor vo vraku je prasknutý a pre ARGO-09 nepoužiteľný. Nepoškodený náhradný stabilizátor bol ešte pred evakuáciou uložený do skladu ARES-3. Prepravná klietka chráni diel pred prachom. Núdzový prívod skladu je na východnej stene."
};
const MARS_HOLD={junction:5,clamp:4,cut:4,weld:6};
let marsToolOut=false,marsHatchWarn=0;
const marsActive=()=>mars.phase!=='none';
const marsThreat=()=>[...enemies,...defenses].some(e=>!(e.dormant&&!mars.doorOpen)&&Math.hypot(e.x-player.x,e.y-player.y)<9&&shotLine(e.x,e.y,player.x,player.y,1.4,1.4));
// A hold-to-weld action the current target offers, or null.
function marsHold(a){
 if(a==='junction'&&!mars.junction)return{key:'junction',dur:MARS_HOLD.junction};
 if(a==='clamp'&&mars.doorOpen&&!mars.clamp)return{key:'clamp',dur:MARS_HOLD.clamp};
 if(a==='mount'&&!mars.oldCut)return{key:'cut',dur:MARS_HOLD.cut};
 if(a==='mount'&&mars.seated&&!mars.installed)return{key:'weld',dur:MARS_HOLD.weld};
 return null}
function marsTargets(put){
 if(mars.phase==='none')return;
 if(!marsZone(player.x,player.y)){
  if(evaExterior(player.x,player.y)&&eva.suit){
   if(mars.phase!=='surface')put('mars','board',MZ.dock.port.x,MZ.dock.port.z,2.4);
   put('mars','mount',MZ.mount.x,MZ.mount.z-.5,2.1);
  }
  return;
 }
 const L=MZ.lander,D=MZ.depot;
 if(marsInLander()){put('mars','seat',L.x,L.z-.9,1.9);if(mars.phase!=='surface')put('mars','port',L.x,L.z+1.9,1.7);}
 if(mars.phase!=='surface')return;
 if(!mars.junction)put('mars','junction',D.junction.x+.1,D.junction.z,2.0);
 if(mars.doorOpen&&!mars.clamp)put('mars','clamp',D.part.x,D.part.z+.8,2.1);
 if(mars.clamp&&!mars.part)put('mars','part',D.part.x,D.part.z+.6,2.0);
 if(marsInDepot())put('mars','terminal',58.5,68.9,1.7);
 put('mars','survey',43.7,74,1.8);
}
function pct(k){return Math.floor((mars.pr[k]||0)*100)}
function marsLabel(a){
 const hold=marsHold(a),armed=eva.suit&&eva.tool;
 if(hold){if(!armed)return 'CHÝBA ZVÁRACÍ NÁSTROJ';if(marsThreat())return 'ROBOTY V DOSAHU · NAJPRV ICH VYRAĎ';
  const what={junction:'OPRAVIŤ ROZVODNÚ SKRINKU',clamp:'ODREZAŤ UPÍNACIE PÁSY STABILIZÁTORA',cut:'ODREZAŤ VYPÁLENÝ STABILIZÁTOR',weld:'ZVARIŤ UPEVNENIE NOVÉHO STABILIZÁTORA'}[hold.key];return '[ DRŽ E ] '+what+' · '+pct(hold.key)+' %'}
 switch(a){
  case 'board':return mars.phase==='done'?'PRISTÁVACÍ MODUL ZOSTÁVA PRIPOJENÝ':'[ E ] NASTÚPIŤ DO PRISTÁVACIEHO MODULU';
  case 'port':return '[ E ] VYSTÚPIŤ NA SERVISNÚ LÁVKU ARGO-09';
  case 'seat':return mars.phase==='orbit'?'[ E ] ODPOJIŤ MODUL A PRISTÁŤ PRI SKLADE ARES-3':mars.phase==='surface'?(mars.part?'[ E ] VZLET · NÁVRAT NA ARGO-09':'[ E ] VZLET BEZ STABILIZÁTORA · NÁVRAT NA ARGO-09'):'MODUL JE PRIPOJENÝ K ARGO-09 · SPOJOVACÍ PORT NA ZADNEJ STENE';
  case 'junction':return '';
  case 'clamp':return 'UPÍNACIE PÁSY ODREZANÉ';
  case 'part':return '[ E ] ZOBRAŤ NÁHRADNÝ STABILIZÁTOR';
  case 'survey':return '[ E ] PREČÍTAŤ ZÁZNAM VRAKU SURVEY-04';
  case 'terminal':return '[ E ] PREČÍTAŤ SKLADOVÝ DENNÍK ARES-3';
  case 'mount':return mars.installed?'STABILIZÁTOR OPRAVENÝ · PRAVÝ MOTOR V PORIADKU':!mars.oldCut?'':mars.seated?'':mars.part?'[ E ] ZASADIŤ NÁHRADNÝ STABILIZÁTOR':'MONTÁŽNA KONZOLA VOĽNÁ · CHÝBA NÁHRADNÝ STABILIZÁTOR';
 }
 return '';
}
function interactMars(a){
 const L=MZ.lander;
 if(a==='board'){if(mars.phase==='done'){notice('MODUL ZOSTÁVA PRIPOJENÝ',3);return}
  player.x=L.x;player.y=L.z+1.15;player.a=-Math.PI/2;player.pitch=0;player.suitVX=player.suitVZ=0;tone(160,.5,'sawtooth',.03,.7);
  notice('PRISTÁVACÍ MODUL KESTREL-2 · PILOTNÝ PULT JE PRI OKNE',5);
  addLog('KESTREL-2 / PALUBNÝ ZÁZNAM','Malý pristávací modul triedy KESTREL: dvojmiestny kokpit, nákladný priestor a vlastný pohon. Na ARGO-09 slúži na zásobovacie lety. Modul sa odpojí a pristane aj bez celej lode. Pilotný pult je pod oknom, spojovací port na zadnej stene vedie späť na lávku.');
  persistMission();missionGoal();return}
 if(a==='port'){player.x=MZ.dock.port.x-.5;player.y=MZ.dock.port.z;player.a=Math.PI;player.pitch=0;player.suitVX=player.suitVZ=0;tone(140,.4,'triangle',.03,.8);notice('SERVISNÁ LÁVKA · VÁKUUM · MAGNETICKÉ TOPÁNKY',3);missionGoal();return}
 if(a==='seat'){
  if(mars.phase==='orbit')marsStartCine('descent');
  else if(mars.phase==='surface'){
   if(marsThreat()){notice('ROBOTY V DOSAHU · VZLET JE NEBEZPEČNÝ',3);return}
   marsStartCine('ascent')}
  else notice('MODUL JE PRIPOJENÝ · VYSTÚP SPOJOVACÍM PORTOM NA ZADNEJ STENE',4);
  return}
 if(a==='part'&&mars.clamp&&!mars.part){mars.part=true;score+=500;notice('NÁHRADNÝ STABILIZÁTOR ZÍSKANÝ · VRÁŤ SA DO MODULU',5);tone(520,.3,'sine',.04,1.5);
  addLog('ARES-3 / NÁHRADNÝ STABILIZÁTOR','Stabilizátor pravého motora je odpojený od klietky a pripravený na prenos. Hmotnosť je malá, ale kryt je citlivý. Modul ho uloží do prepravnej kolísky pri východnej stene. Na lodi ho treba zasadiť do montážnej konzoly na lávke a zvariť.');
  persistMission();saveCheckpoint();missionGoal();return}
 if(a==='survey'){addLog("SURVEY-04 / POSLEDNÝ SERVISNÝ ZÁZNAM",MARS_RECORDS["SURVEY-04 / POSLEDNÝ SERVISNÝ ZÁZNAM"]);persistMission();openJournal('SURVEY-04 / POSLEDNÝ SERVISNÝ ZÁZNAM');return}
 if(a==='terminal'){addLog("ARES-3 / SKLADOVÝ DENNÍK",MARS_RECORDS["ARES-3 / SKLADOVÝ DENNÍK"]);persistMission();openJournal('ARES-3 / SKLADOVÝ DENNÍK');return}
 if(a==='mount'){
  if(mars.oldCut&&!mars.seated&&mars.part){mars.seated=true;notice('NÁHRADNÝ STABILIZÁTOR ZASADENÝ · TERAZ ZVAR UPEVNENIE',5);tone(300,.25,'triangle',.04,1.4);missionGoal();persistMission();return}
  const h=marsHold('mount');if(h&&!(eva.suit&&eva.tool))notice('CHÝBA ZVÁRACÍ NÁSTROJ',3);
  return}
 const h=marsHold(a);if(h&&!(eva.suit&&eva.tool))notice('POTREBUJEŠ ZVÁRACÍ NÁSTROJ',3);
}
function marsFinishHold(key){
 if(key==='junction'){mars.junction=true;score+=400;notice('PRÍVOD OBNOVENÝ · DVERE SKLADU SA OTVORIA PRI PRÍCHODE',5);addLog('ARES-3 / PRÍVOD OBNOVENÝ','Rozvodná skrinka je opravená. Dvere skladu majú napájanie. Vnútri sú aktívne obranné roboty AEGIS. Do skladu vstúp pripravený.');}
 if(key==='clamp'){mars.clamp=true;score+=500;notice('UPÍNACIE PÁSY ODREZANÉ · ZOBER STABILIZÁTOR',5)}
 if(key==='cut'){mars.oldCut=true;score+=450;notice(mars.part?'VYPÁLENÝ STABILIZÁTOR ODREZANÝ · ZASAĎ NÁHRADNÝ':'VYPÁLENÝ STABILIZÁTOR ODREZANÝ · NÁHRADNÝ JE V SKLADE ARES-3',5);addLog('PRAVÝ STABILIZÁTOR / DEMONTÁŽ','Vypálený stabilizátor je odrezaný od montážnej konzoly. Konzola je voľná pre náhradný diel zo skladu ARES-3.')}
 if(key==='weld'){mars.installed=true;mars.phase='done';score+=900;navReady=false;notice('STABILIZÁTOR NAINŠTALOVANÝ · VRÁŤ SA KOMOROU A ODLOŽ SKAFANDER',6);addLog('PRAVÝ STABILIZÁTOR / NAINŠTALOVANÝ','Náhradný stabilizátor je zvarený v konzole. Záložný pohon opäť drží kurz. Vráť sa komorou, odlož skafander a v kokpite prepočítaj kurz na Lyru.');}
 tone(620,.3,'sine',.04,1.6);saveCheckpoint();missionGoal();hud();
}
function marsGoal(){
 const p=mars.phase;if(p==='none')return '';
 const inZone=marsZone(player.x,player.y),walkway=evaExterior(player.x,player.y);
 if(p==='orbit'||p==='returned'){
  if(!inZone){
   if(!(eva.suit&&eva.tool))return p==='orbit'?'MARS · NÁHRADNÝ STABILIZÁTOR JE V SKLADE ARES-3 · SKAFANDER A ZVÁRACÍ NÁSTROJ V HANGÁRI VPRAVO':'NA LÁVKE PREBER STABILIZÁTOR · VEZMI SKAFANDER A NÁSTROJ V HANGÁRI VPRAVO';
   if(!walkway)return 'VSTÚP DO PRETLAKOVEJ KOMORY A VYJDI NA SERVISNÚ LÁVKU';
   if(p==='returned'){return !mars.oldCut?'ODREŽ VYPÁLENÝ STABILIZÁTOR · PRAVÝ BOK LÁVKY':!mars.seated?'ZASAĎ NÁHRADNÝ STABILIZÁTOR DO MONTÁŽNEJ KONZOLY':'ZVAR UPEVNENIE · DRŽ E'}
   return 'PREJDI LÁVKU DO KONCA A NASTÚP DO PRISTÁVACIEHO MODULU';
  }
  if(p==='returned')return 'VYSTÚP NA LÁVKU SPOJOVACÍM PORTOM NA ZADNEJ STENE MODULU';
  return 'SADNI SI K PILOTNÉMU PULTU POD OKNOM · ODPOJ MODUL A PRISTAŇ';
 }
 if(p==='surface'){
  if(!mars.junction)return 'SKLAD ARES-3 JE BEZ PRÍVODU · OPRAV ROZVODNÚ SKRINKU NA VÝCHODNEJ STENE';
  if(!mars.clamp)return mars.doorOpen?'VYČISTI SKLAD · POTOM ODREŽ UPÍNACIE PÁSY STABILIZÁTORA PRI SEVERNEJ STENE':'VSTÚP DO SKLADU · DVERE SA OTVORIA PRI PRÍCHODE';
  if(!mars.part)return 'ZOBER STABILIZÁTOR Z KLIETKY';
  return 'VRÁŤ SA DO MODULU · PILOTNÝ PULT: VZLET';
 }
 if(p==='done'){
  if(eva.suit)return walkway||evaVacuum()?'VRÁŤ SA DO KOMORY · PRI PANELI STLAČ E A OBNOV TLAK':'ODLOŽ SKAFANDER · PÔVODNÝ STOJAN V SKAFANDROVNI';
  return navReady?'KURZ NA LYRU POTVRDENÝ · E NA HLAVNOM PANELI SPUSTÍ WARP':'KOKPIT · E NA HLAVNOM PANELI PREPOČÍTA KURZ NA LYRU';
 }
 return '';
}
function marsStartCine(kind){
 const L=MZ.lander;mars.cine=kind;state='flight';flightTime=0;keys={};mouseDown=false;bolts=[];
 player.x=L.x;player.y=L.z-.4;player.a=-Math.PI/2;player.pitch=0;player.suitVX=player.suitVZ=0;
 game.className='playing flying';$('interaction').textContent='';$('cinematic').classList.remove('hidden');
 $('guide').classList.add('hidden');guideTimer=0;tone(45,2.2,'sawtooth',.04,4);
}
function updateMarsCine(dt){
 player.lift=MZ.lift;
 const i=marsCineInfo();$('cinematic').innerHTML=i.text+' <small>'+i.sub+'</small>';marsCineShake(i);
 if(i.shake>.2&&Math.floor(time*7)!==Math.floor((time-dt)*7))tone(55+(Math.floor(time*7)%4)*9,.1,'sawtooth',.018*i.shake,.6);
 if(!i.done)return;
 const kind=mars.cine;mars.cine=null;state='playing';game.className='playing';flightTime=0;$('cinematic').classList.add('hidden');player.pitch=0;player.lift=kind==='descent'?MZ.lift:0;
 if(kind==='descent')marsLand();else marsDock();
}
function marsSpawnDepot(){
 if(mars.defenders)return;mars.defenders=true;
 for(const [x,y,k] of [[54,66.2,'shooter'],[58,66.4,'shooter'],[55,68.6,'runner'],[57.4,68.8,'runner'],[56,66.9,'guard']]){const e=enemy(x,y,k);e.dormant=true;e.attack=1.4;defenses.push(e)}
}
function marsLand(){
 mars.phase='surface';marsSpawnDepot();
 addLog('MARS / PRISTÁTIE PRI ARES-3','Modul stojí v kráteri pri sklade ARES-3. Vzduch je riedky a nedýchateľný, skafander drží kyslík. Sklad je na severe. Rozvodná skrinka na východnej stene nemá prívod, bez nej sa dvere neotvoria. Zváračka je pripravená.');
 showGuide('MARS · KRÁTER ARES-3','Poklop sa otvorí automaticky, keď si v skafandri. Sklad je na severe. Najprv oprav rozvodnú skrinku na východnej stene (drž E so zváračkou), potom vstúp. Kyslík sa dopĺňa v module a zo servisného rozvodu v sklade.',14);
 notice('PRISTÁTIE DOKONČENÉ · SKLAD ARES-3 NA SEVERE',6);tone(90,.8,'sine',.04,.5);
 saveCheckpoint();missionGoal();hud();
}
function marsDock(){
 mars.phase=mars.part?'returned':'orbit';
 notice(mars.part?'DOKOVANIE DOKONČENÉ · VYSTÚP NA LÁVKU A NAINŠTALUJ STABILIZÁTOR':'DOKOVANIE DOKONČENÉ · NÁHRADNÝ STABILIZÁTOR EŠTE CHÝBA',6);
 saveCheckpoint();missionGoal();hud();
}
// End of the first warp leg: the drive drops out of warp near Mars with the right stabilizer burnt out.
function marsArrive(){
 mars.leg=0;mars.phase='orbit';navReady=false;state='playing';flightTime=0;game.className='playing';$('cinematic').classList.add('hidden');
 eva.stowed=false;eva.suit=false;eva.tool=false;eva.pressure='inside';$('helmet').classList.add('hidden');
 player.x=13.5;player.y=5.3;player.a=-Math.PI/2;player.pitch=0;
 addLog("KOKPIT / VÝPADOK POHONU · MARS",MARS_RECORDS["KOKPIT / VÝPADOK POHONU · MARS"]);
 notice('PRAVÝ STABILIZÁTOR SA VYPÁLIL · MEDZIZASTÁVKA PRI MARSE',7);tone(80,1.2,'sawtooth',.04,.4);
 showGuide('MARS · MEDZIZASTÁVKA','Servisná zastávka je dosiahnutá. Pohon je po zlyhaní stabilizátora odstavený. Náhradný stabilizátor je v sklade ARES-3 na Marse. V hangári vpravo vezmi skafander aj zváračku, prejdi komorou na lávku a nastúp do pristávacieho modulu na jej konci.',14);
 saveCheckpoint();missionGoal();hud();
 try{lock()}catch{}
}
// Safety net: if the player ever ends up inside furniture or a wall (after a cinematic, a closing door, an old save), move to the nearest free spot.
function marsUnstick(){
 if(!blocked(player.x,player.y,.2))return false;
 for(let r=.1;r<=3;r+=.1)for(let k=0;k<20;k++){const a=k/20*Math.PI*2,x=player.x+Math.cos(a)*r,y=player.y+Math.sin(a)*r;if(!blocked(x,y,.22)){player.x=x;player.y=y;player.suitVX=player.suitVZ=0;return true}}
 return false;
}
// Eye height above the floor level: inside the lander and on its stairs the floor is MZ.lift above the ground.
function marsEyeLift(){
 if(mars.phase!=='surface'||!marsZone(player.x,player.y))return 0;
 const L=MZ.lander,lx=player.x-L.x,lz=player.y-L.z;
 if(marsInLander())return MZ.lift;
 if(lx<-4&&lx>-6.9&&lz>-.4&&lz<1.4)return MZ.lift*(lx+6.9)/2.9;
 return 0;
}
function updateMars(dt){
 if(mars.phase!=='surface')player.lift=0;else player.lift=(player.lift||0)+(marsEyeLift()-(player.lift||0))*Math.min(1,dt*12);
 if(mars.phase==='none'){return}
 const inZone=marsZone(player.x,player.y);marsUnstick();
 // Sliding hatch of the lander (on the surface only) and the depot door.
 const L=MZ.lander,hx=L.hatch.x+.5,hz=L.hatch.z+.5;
 const hd=Math.hypot(player.x-hx,player.y-hz);
 if(mars.phase==='surface'){
  if(hd<2.4&&eva.suit){mars.hatchOpen=true}
  else if(hd<2.4&&marsHatchWarn<=0&&inZone){marsHatchWarn=4;notice('POKLOP SA NEOTVORÍ · NIE SI V SKAFANDRI',3)}
  else if(hd>3.4&&!(player.x>=L.hatch.x&&player.x<L.hatch.x+1&&Math.abs(player.y-hz)<.6))mars.hatchOpen=false;
 }else mars.hatchOpen=false;
 marsHatchWarn=Math.max(0,marsHatchWarn-dt);
 mars.hatchAnim=Math.max(0,Math.min(1,(mars.hatchAnim||0)+(mars.hatchOpen?dt*1.6:-dt*1.6)));
 if(map[L.hatch.z])map[L.hatch.z][L.hatch.x]=mars.hatchAnim>.98?'0':'9';
 if(mars.junction&&!mars.doorOpen&&Math.hypot(player.x-56,player.y-71)<3.4&&mars.phase==='surface'){mars.doorOpen=true;marsApplyState();notice('DVERE SKLADU SA OTVÁRAJÚ · ROBOTY AEGIS SÚ AKTÍVNE',4);tone(110,.6,'sawtooth',.03,1.4)}
 mars.doorAnim=Math.max(0,Math.min(1,(mars.doorAnim??0)+(mars.doorOpen?dt*.9:-dt*.9)));
 // Hold-to-weld at the current target.
 const t=interactionTarget();let holding=false,holdKey=null,holdPct=0;
 if(t?.kind==='mars'&&keys.KeyE){
  const h=marsHold(t.data);
  if(h&&eva.suit&&eva.tool&&!marsThreat()){holding=true;const k=holdKey=h.key;mars.pr[k]=Math.min(1,(mars.pr[k]||0)+dt/h.dur);holdPct=mars.pr[k];
   mars.pr.spark=.12;
   const sx=t.data==='junction'?MZ.depot.junction.x:t.data==='clamp'?MZ.depot.part.x:MZ.mount.x,sz=t.data==='junction'?MZ.depot.junction.z:t.data==='clamp'?MZ.depot.part.z:MZ.mount.z;
   mars.sparkLight={x:sx,y:1.3,z:sz,r:3,c:'#d8f4ff'};
   if(Math.floor(time*12)!==Math.floor((time-dt)*12)){burst(sx,sz,'#ffac6d',2);tone(230,.06,'sawtooth',.018,.7)}
   if(mars.pr[k]>=1){mars.pr[k]=1;keys.KeyE=false;marsFinishHold(k)}}
 }
 mars.pr.spark=Math.max(0,(mars.pr.spark||0)-dt);
 marsToolOut=holding&&inZone;
 if(inZone){
  const where=marsInLander()?'PRISTÁVACÍ MODUL KESTREL-2':marsInDepot()?'SKLAD ARES-3':mars.phase==='surface'?'POVRCH MARSU / KRÁTER':'PRISTÁVACÍ MODUL KESTREL-2';
  $('location').textContent=where;$('wave').textContent='MARS · MEDZIZASTÁVKA';
  $('oxygenMode').textContent=marsOutside()?'ATMOSFÉRA MARSU · SKAFANDER UZAVRETÝ':marsInDepot()?'SERVISNÝ PRÍVOD O₂ · PRILBA UZAVRETÁ':'UZAVRETÁ PRILBA · TLAK V PORIADKU';
 }
 // Pull progress at the walkway mount into the same HUD line the ship weld uses.
 if(holding)$('repairProgress').textContent='ZVAR / '+Math.floor(holdPct*100)+' %';
}

// Menu shortcut: the ship is repaired, the player stands at the navigation panel and the first warp leg (to Mars) is ready.
function startMarsChapter(){
 stats=freshStats();makeLevel();
 const doors=Object.fromEntries(sideDoors.map(d=>[d.type,1]));
 checkpoint={version:2,savedAt:Date.now(),stats:{...stats},intro:{active:false,gun:true},
  mission:{mars:freshMars(),eva:{suit:false,tool:false,valve:false,sealed:true,tested:true,returned:true,stowed:true,progress:1},
   systems:{parts:true,relay:true,cooling:true,isolated:true,drive:true,emp:true},card:true,power:true,upgraded:false,secretFound:false,
   medicalPowered:true,medicalReward:true,alarmTriggered:false,logs:[{title:'KOKPIT / ŽIVÁ SPRÁVA · SPOJENIE OBNOVENÉ',body:''}],doors:[],doorStates:doors,defenses:[]},
  pickups:[],navReady:true,supplyUsed:true,room:4,roomWave:0,totalWaves:10,cleared:[true,true,true,true,false],entered:[true,true,true,true,true],
  active:[true,true,true,true],score:0,kills:0,unlocked:true,weapon:0,player:{x:13.5,y:6.4,a:-Math.PI/2,pitch:0,hp:100},barrels:[]};
 restore();
 notice('KOKPIT · SERVISNÁ ZASTÁVKA MARS · E NA HLAVNOM PANELI SPUSTÍ WARP',6);saveCheckpoint();
}
if($('marsStart'))$('marsStart').onclick=startMarsChapter;
