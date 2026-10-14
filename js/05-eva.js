/* EVA: suit, tool, airlock, valve, welding, exterior. */
'use strict';
// EVA shares the ship's map and collision model; no separate movement controls.
const evaLayout={suit:{x:28.5,z:21.8},tool:{x:33.4,z:21.8},control:{x:39,z:25.7},valve:{x:57.5,z:26.8},leak:{x:60.4,z:26.8}};
let eva={},evaDoors=[],evaSuitMesh,evaToolMesh,evaPanelMesh,evaValveMesh,evaSealMesh,evaCloudMesh,gasPlanetMesh,gasRingMesh,guideTimer=0,evaTour=false,breathClock=0,bootClock=0,evaValveAngle=0,evaToolVisible=false;
function evaExterior(x,z){return x>=44&&z>=12&&z<29;}
function evaChamber(){return player.x>37&&player.x<44&&player.y>22&&player.y<27;}
// Held equipment is persistent across the pressure-door sill.
function evaHoldingTool(){return !!(eva.suit&&eva.tool&&!eva.stowed)&&(!marsZone(player.x,player.y)||marsToolOut);}
function refreshHeldToolHUD(){if(evaHoldingTool()){$('weaponname').textContent='ZVÁRACÍ NÁSTROJ / ARC-07';$('ammo').textContent=eva.sealed?'OK':Math.floor(eva.progress*100);$('reloadtext').textContent=eva.sealed?'ZVAR DOKONČENÝ':'DRŽ E · MIER NA TRHLINU';}}
function shipVacuum(){return evaExterior(player.x,player.y)||(evaChamber()&&eva.pressure==='vacuum');}
// Vacuum or the thin Martian air: both need the suit and drain oxygen.
function evaVacuum(){return shipVacuum()||marsOutside();}
function buildEVA(){
 eva={suit:false,tool:false,valve:false,sealed:false,tested:false,returned:false,stowed:false,progress:0,oxygen:100,pressure:'inside',phase:'idle',cycle:0,diagnosed:false,warned:false,tutorial:false};guideTimer=0;evaTour=false;breathClock=bootClock=evaValveAngle=0;evaToolVisible=false;
 // Vacuum is empty space, not an invisible room full of walls and ceiling.
 for(let z=12;z<29;z++)for(let x=44;x<MW;x++)map[z][x]='V';
 for(let z=21;z<28;z++)for(let x=26;x<36;x++)map[z][x]='0';
 for(let z=22;z<27;z++)for(let x=37;x<43;x++)map[z][x]='0';
 for(let z=22;z<29;z++)for(let x=44;x<64;x++)map[z][x]='0';
 sideDoors.push({x:25.5,y:24,axis:'x',cells:[[25,23],[25,24]],open:0,active:false,type:'evaAccess'});
 // Dynamic door cells must never also be baked as static walls.
 for(const [x,z]of sideDoors[sideDoors.length-1].cells)map[z][x]='9';
 evaDoors=[{x:36.5,z:24,open:1,cells:[[36,23],[36,24]]},{x:43.5,z:24,open:0,cells:[[43,23],[43,24]]}];
 for(const d of evaDoors)setEVADoor(d,d.open);
}
function setEVADoor(d,open){d.open=clamp(open,0,1);for(const [x,z]of d.cells)map[z][x]=d.open===1?'0':'9';}
function buildEVACollision(){
 const add=(x,z,w,d,h)=>colliders.push({x,z,w,d,h});
 add(28.5,21.725,1.5,.75,2.6);add(33.4,21.65,2,.8,1.1);add(39,25.9,1.15,.45,1.8);
 for(const z of [22.12,28.88])add(54,z,19.5,.16,.95);add(63.87,25.5,.16,6.8,.95);
 add(53,22.55,.65,.6,2.0);add(59.5,27.65,7,.55,1.8);
 // The two exterior shoulders flank the hatch; their visual trim has real collision.
 add(44.06,21.94,.34,1.70,3.7);add(44.06,26.43,.34,2.38,3.7);
}
function evaPlate(arr,text,x,y,z,w,facing=0){G.box(arr,x,y-.13,z,w,.42,.09,'#192e3b');label(arr,text,x+(facing? w*.43:-w*.43),y,z+(facing?-.065:.065),Math.min(.065,w/(text.length*4.8)),'#b9ccb6',facing);}
function decorateEVA(arr){const B=G.box;
 // Equipment room: recessed racks, empty stations, workbench and physical kit.
 for(const x of [28.5,30.1,31.7]){B(arr,x,1.35,21.09,1.25,2.7,.18,'#304955');B(arr,x,1.35,21.22,1.06,2.35,.08,'#10232e');for(const y of [.35,2.45])B(arr,x,y,21.31,.8,.06,.11,'#839196');}
 B(arr,28.5,1.3,21.7,.10,2.6,.5,'#435c65');B(arr,28.5,2.51,21.75,1.2,.08,.7,'#768c91');B(arr,28.5,2.28,21.8,.07,.50,.07,'#83969a');
 B(arr,33.4,.48,21.65,1.85,.95,.70,'#324852');B(arr,33.4,1.0,21.65,2,.10,.8,'#8a8c7b');
 for(const x of [32.75,34.1])B(arr,x,.14,21.65,.10,.28,.62,'#60767b');
 // All five fixtures occupy native wall-panel centres between vertical seams.
 // Housings embed in the actual east wall face35.95.
 for(const z of [21.5,22.5,25.5,26.5,27.5]){
  B(arr,35.995,2.55,z,.15,.12,.55,'#5e796f');
  B(arr,35.911,2.55,z,.020,.04,.30,'#b4d3b7',3);
 }
 for(const x of [27.5,32.8]){B(arr,x,3.22,24.5,1.8,.13,.36,'#385260');B(arr,x,3.14,24.5,1.60,.025,.26,'#9dd9cd',3);lights.push({x,y:2.8,z:24.5,r:5,c:'#8caeb1'});}
 evaPlate(arr,'SKAFANDRE',30.1,3.18,21.30,3.6);
 // Pressure chamber has its own sealed frames, viewport and gauges.
 for(const d of evaDoors){for(const z of [d.z-1.13,d.z+1.13])B(arr,d.x,1.6,z,.34,3.2,.20,'#6b838c');B(arr,d.x,3.18,d.z,.34,.27,2.45,'#6b838c');B(arr,d.x,.024,d.z,.42,.048,2.4,'#586871');}
 for(const x of [37.15,42.82])for(const z of [22.15,26.82]){B(arr,x,1.65,z,.11,3.3,.11,'#4e6876');B(arr,x,1.65,z+.08,.04,2.6,.025,'#93a89c');}
 for(const z of [22.15,26.84]){B(arr,40,3.15,z,5.65,.2,.18,'#385667');B(arr,40,.13,z,5.65,.22,.15,'#324755');}
 B(arr,40,3.27,24,2.4,.11,.36,'#768a8e');B(arr,40,3.20,24,2.1,.02,.27,'#9bced5',3);
 B(arr,39,.65,25.9,.13,1.3,.24,'#66818a');B(arr,39,1.4,25.86,1.10,.62,.17,'#496573');
 B(arr,39,1.4,25.75,.88,.42,.025,'#102e3e');B(arr,39,1.10,25.72,.88,.08,.30,'#72918b');
 evaPlate(arr,'PRETLAKOVA KOMORA',40,2.78,26.87,4.6,Math.PI);
 lights.push({x:39,y:2.7,z:24,r:6,c:'#739ec0'});
 // Service deck: a broad safe walking surface, bolted ribs, railing and radiator bay.
 B(arr,54,-.25,25.5,20,.46,7,'#243b4b');
 for(let x=44.5;x<64;x+=1.25){B(arr,x,-.025,25.5,1.17,.05,6.6,'#526572');B(arr,x,.014,24,.045,.025,3.2,'#9f8d65');for(const z of [22.25,28.65])B(arr,x,.02,z,.08,.04,.1,'#a7b2a6');}
 for(const z of [22.12,28.88]){B(arr,53.9,.95,z,20,.08,.12,'#7f9196');B(arr,53.9,.42,z,20,.05,.09,'#3b596a');for(let x=44.5;x<64;x+=2){B(arr,x,.48,z,.09,.96,.12,'#5d7685');B(arr,x,.83,z,.13,.05,.17,'#c2a06b',3);}}
 B(arr,63.87,.95,25.5,.12,.08,6.8,'#7f9196');for(const z of [23,25,27])B(arr,63.87,.48,z,.12,.96,.09,'#5d7685');
 for(let x=45;x<63;x+=2.5){B(arr,x,.065,24,.18,.08,.23,'#263d46');B(arr,x,.112,24,.08,.012,.14,'#74d7cd',3);}
 // Damage and the leaking pipe sit beyond the walking lane, with real supports.
 for(let x=48;x<63;x+=2)B(arr,x,-.7,27.8,.20,1.2,1.1,'#5d7384');
 B(arr,59.5,.55,27.72,7,1.1,.50,'#213d4e');B(arr,59.5,1.20,27.72,7,.16,.65,'#7f8e8e');
 hydroTube(arr,[55.8,1.3,27.30],[62.8,1.3,27.30],.14,'#8a9da1');
 for(const x of [56,58.2,61.8]){B(arr,x,.63,27.25,.16,1.1,.19,'#597381');B(arr,x,1.3,27.3,.12,.40,.4,'#536875');}
 B(arr,60.4,1.31,27.12,.5,.33,.09,'#112632');B(arr,60.12,1.52,27.26,.16,.22,.2,'#9a7965');B(arr,60.69,1.17,27.23,.17,.22,.2,'#889a9d');
 B(arr,53,.68,22.55,.52,1.36,.47,'#506b7c');B(arr,53,1.55,22.55,.075,.65,.08,'#8b9b9a');B(arr,53,1.32,22.86,.38,.32,.07,'#a3a18c');
 B(arr,53,1.32,22.915,.19,.17,.045,'#1d3647');evaPlate(arr,'SERVIS',52.50,1.91,22.52,1.2);
 lights.push({x:53,y:2,z:25,r:8,c:'#7398b3'},{x:60.4,y:1.9,z:26,r:6,c:'#92acb9'});
 // Obsolete lower slabs, radiator shelf and its long arms removed.
 // The continuous sealed belly in decorateExteriorFinish supports the real deck.
}
function makeEVAAssets(){const B=G.box,a=[];
 // The suit is clearly recognisable before it is equipped.
 B(a,0,1.28,0,.64,.76,.38,'#a5b8b4');B(a,0,1.26,.23,.43,.48,.13,'#466771');B(a,0,1.78,0,.58,.52,.49,'#b8c6bc');B(a,0,1.79,.275,.44,.25,.06,'#123349');B(a,0,1.82,.315,.29,.12,.025,'#62a9b8',3);
 for(const x of [-.21,.21]){B(a,x,.68,0,.26,.64,.29,'#94a9ac');B(a,x,.30,.12,.31,.18,.47,'#4b6571');B(a,x,.23,.14,.33,.07,.50,'#bed0c4');}
 for(const x of [-.44,.44]){B(a,x,1.19,0,.22,.74,.29,'#8fa6aa');B(a,x,.86,.09,.23,.19,.29,'#55747d');}
 B(a,0,1.23,-.28,.47,.68,.21,'#435e6c');
 // Helmet rim, tinted visor, pressure seals, chest gauges and oxygen hoses.
 B(a,0,1.79,.309,.51,.33,.07,'#70838a');B(a,0,1.79,.35,.42,.24,.025,'#574632');B(a,-.09,1.86,.37,.17,.035,.018,'#e3bd81');
 for(const x of [-.21,.21])for(const y of [.55,.79])B(a,x,y,.014,.275,.055,.31,'#45606a');
 for(const x of [-.44,.44]){B(a,x,1.38,.014,.25,.07,.32,'#617982');B(a,x,.97,.02,.245,.05,.33,'#2c4453');}
 B(a,0,1.48,.297,.37,.055,.025,'#b0c3b7');B(a,-.095,1.29,.31,.14,.12,.034,'#142e3e');B(a,-.095,1.31,.331,.085,.04,.018,'#65cfbf',3);
 for(const y of [1.17,1.24,1.31])B(a,.12,y,.31,.075,.035,.027,y===1.17?'#cb9758':'#9dac9d');
 hydroTube(a,[.27,1.37,.21],[.33,1.01,.29],.042,'#bca976',8);hydroTube(a,[.33,1.01,.29],[.17,.94,.16],.042,'#bca976',8);
 evaSuitMesh=G.mesh(a);
 // ARC-07 lies on a protective mat: grip, cell, copper nozzle and insulated cable.
 const t=[];B(t,0,1.065,0,1.08,.025,.52,'#142b35');
 B(t,-.12,1.18,0,.48,.20,.24,'#415e6d');B(t,-.13,1.29,0,.42,.025,.21,'#99aaa6');
 B(t,-.37,1.18,0,.10,.22,.27,'#223f50');B(t,-.35,1.18,.145,.07,.12,.025,'#cc945e');
 B(t,-.13,1.15,.20,.12,.15,.23,'#243641');B(t,-.13,1.23,.28,.13,.04,.11,'#71888a');
 for(let z=.14;z<.32;z+=.045)B(t,-.13,1.232,z,.12,.012,.015,'#b3bab0');
 hydroTube(t,[.12,1.20,0],[.48,1.20,0],.075,'#ac805e',10);
 for(const x of [.14,.22,.30])hydroTube(t,[x,1.20,0],[x+.025,1.20,0],.095,'#d2b487',10);
 hydroTube(t,[.44,1.20,0],[.57,1.20,0],.047,'#9eafb0',8);
 B(t,.578,1.20,0,.014,.033,.033,'#6bebda',3);
 B(t,-.15,1.235,-.14,.22,.09,.035,'#122c38');B(t,-.15,1.25,-.16,.15,.03,.012,'#77e6d2',3);
 for(let x=-.29;x<-.02;x+=.06)B(t,x,1.305,0,.025,.016,.12,'#203e4b');
 for(let i=0;i<12;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;hydroTube(t,[-.35+.22*Math.cos(a),1.10,-.22-.11*Math.sin(a)],[-.35+.22*Math.cos(b),1.10,-.22-.11*Math.sin(b)],.024,'#263d46',6);}
 evaToolMesh=G.mesh(t);
 const p=[];B(p,0,0,0,.14,.23,.026,'#cde6d1',3);evaPanelMesh=G.mesh(p);
 const v=[];
 // Open rim and spokes in the XY plane, on a fixed Z-axis spindle.
 for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;hydroTube(v,[.30*Math.cos(a),.30*Math.sin(a),0],[.30*Math.cos(b),.30*Math.sin(b),0],.035,'#c9985c',6);}
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;hydroTube(v,[0,0,0],[.27*Math.cos(a),.27*Math.sin(a),0],.028,'#92775a',6);}
 hydroTube(v,[0,0,-.035],[0,0,.10],.075,'#6a8790',10);B(v,0,.30,-.025,.065,.06,.04,'#f1dfb1');evaValveMesh=G.mesh(v);
 const s=[];B(s,0,0,0,.58,.39,.075,'#98aead');for(const x of [-.22,.22])for(const y of [-.12,.12])B(s,x,y,.05,.06,.06,.025,'#d5dfca');evaSealMesh=G.mesh(s);
 const cloud=[];G.sphere(cloud,1,'#cad8df',3);evaCloudMesh=G.mesh(cloud);
 const planet=[];G.sphere(planet,1,'#cbb897',7,true);gasPlanetMesh=G.mesh(planet);
 const ring=[];const point=(r,a)=>[r*Math.cos(a),r*Math.sin(a)*.42,r*Math.sin(a)*.9075];
 // Contiguous fine rings; the broad dark gap is the Cassini division.
 const sun=[-.6,.5,.5],sn=Math.hypot(...sun);for(let i=0;i<3;i++)sun[i]/=sn;
 for(let band=0;band<70;band++){const r=1.30+band*.55/70,r2=r+.55/70;if(r<1.60&&r2>1.56)continue;
  const grain=.82+.10*Math.sin(band*2.7)+.06*Math.cos(band*.73),brightness=(r<1.42?.72:r>1.60?.87:1)*grain;
  for(let i=0;i<144;i++){const a=i*Math.PI*2/144,b=(i+1)*Math.PI*2/144,pts=[point(r,a),point(r,b),point(r2,b),point(r,a),point(r2,b),point(r2,a)];
   for(const v of pts){const dot=v.reduce((n,x,j)=>n+x*sun[j],0),disc=dot*dot-(v.reduce((n,x)=>n+x*x,0)-1),shade=dot<0&&disc>0?.18:1;ring.push(...v,0,.9075,-.42,...[.80,.73,.61].map(c=>c*brightness*shade),3);}
  }
 }gasRingMesh=G.mesh(ring);
}
function drawEVA(){
 for(const d of evaDoors)if(d.open<.999)G.draw(portalMesh,G.transform(d.x,d.open*3.5,d.z,Math.PI/2));
 if(!eva.suit)G.draw(evaSuitMesh,G.transform(evaLayout.suit.x,0,evaLayout.suit.z));
 if(!eva.tool)G.draw(evaToolMesh,G.transform(evaLayout.tool.x,0,evaLayout.tool.z));
 G.draw(evaPanelMesh,G.transform(38.75,1.4,25.72));
 const c=Math.cos(evaValveAngle),s=Math.sin(evaValveAngle);
 G.draw(evaValveMesh,[c,s,0,0,-s,c,0,0,0,0,1,0,evaLayout.valve.x,1.35,27.04,1]);
 if(eva.sealed)G.draw(evaSealMesh,G.transform(evaLayout.leak.x,1.32,27.06));
 if(!eva.sealed){const amount=eva.valve?.3:1;for(let i=0;i<16;i++){const t=(time*.63+i/16)%1;G.draw(evaCloudMesh,G.transform(60.4+Math.sin(i*2.4)*t*.44,1.35+t*2.2,27.04-t*.85,0,(.055+t*.23)*amount));}}
 if(!(state==='flight'&&flightTime>=2)){if(mars.phase==='none'){G.draw(gasPlanetMesh,G.transform(165,31,-42,0,20));G.draw(gasRingMesh,G.transform(165,31,-42,0,20));}else G.draw(marsGlobe,G.transform(150,26,-62,0,34));}
 drawMarsShip();
}
function evaTargets(put){
 if(room<3)return;
 if(!eva.suit&&!eva.stowed)put('eva','suit',evaLayout.suit.x,22.15,1.9);
 if(eva.suit&&eva.tested&&eva.returned&&!evaVacuum()&&(mars.phase==='none'||mars.phase==='done'))put('eva','doff',evaLayout.suit.x,22.15,1.9);
 if(!eva.tool&&!eva.stowed)put('eva','tool',evaLayout.tool.x,22.15,1.9);
 if(evaChamber())put('eva','airlock',evaLayout.control.x,evaLayout.control.z,2.0);
 if(evaExterior(player.x,player.y)){
  if(!eva.valve||eva.sealed)put('eva','valve',evaLayout.valve.x,evaLayout.valve.z,2.0);
  put('eva','weld',evaLayout.leak.x,evaLayout.leak.z,2.0);
 }
}
function evaLabel(action){return {
 suit:'[ E ] OBLIECŤ SKAFANDER · KYSLÍK 100 % · MAGNETICKÉ TOPÁNKY',tool:'[ E ] ZOBRAŤ ZVÁRACÍ NÁSTROJ A OPRAVNÚ OBJÍMKU',
 airlock:eva.phase!=='idle'?'KOMORA PRACUJE · '+Math.ceil(eva.cycle)+' s':eva.pressure==='inside'?'[ E ] ZAČAŤ VÝSTUP · UZAVRIEŤ KOMORU':'[ E ] NÁVRAT · OBNOVIŤ TLAK A DOPLNIŤ KYSLÍK',
 doff:'[ E ] ODLOŽIŤ SKAFANDER A VRÁTIŤ NÁSTROJ · DOKONČIŤ VÝSTUP',
 valve:eva.sealed?(eva.valve?'[ E ] OTVORIŤ VENTIL · SKÚŠKA TESNOSTI':'VENTIL OTVORENÝ · TLAK DRŽÍ'):eva.valve?'VENTIL UZAVRETÝ · TERAZ UTESNI TRHLINU':'[ E ] UZAVRIEŤ POŠKODENÚ VETVU',
 weld:eva.sealed?(eva.tested?'OPRAVA OVERENÁ · VRÁŤ SA DO KOMORY':'ZVAR HOTOVÝ · OTVOR ŽLTÝ VENTIL A OVER TESNOSŤ'):!eva.valve?'NAJPRV UZAVRI ŽLTÝ VENTIL':!eva.tool?'CHÝBA ZVÁRACÍ NÁSTROJ':'[ DRŽ E ] UTESNIŤ TRHLINU · '+Math.floor(eva.progress*100)+' %'
 }[action];}
function interactEVA(action){
 if(action==='suit'){eva.suit=true;eva.oxygen=100;notice(eva.tool?'SKAFANDER PRIPRAVENÝ · VSTÚP DO PRETLAKOVEJ KOMORY':'SKAFANDER PRIPRAVENÝ · ZOBER NÁSTROJ NA STOLE PRI SKAFANDROCH',5);tone(330,.4,'sine',.04,1.7);saveCheckpoint();}
 if(action==='tool'){eva.tool=true;notice(eva.suit?'NÁSTROJ ZÍSKANÝ · VSTÚP DO PRETLAKOVEJ KOMORY':'NÁSTROJ ZÍSKANÝ · OBLEČ SKAFANDER NA OZNAČENOM STOJANE',5);saveCheckpoint();}
 if(action==='airlock'&&eva.phase==='idle'){
  if(!evaChamber())return;
  if(!cleared[3]){notice('AEGIS OVLÁDA HANGÁR · PRED VÝSTUPOM DOKONČI BOJ',5);return;}
  if(!eva.suit||!eva.tool){notice('PRED VÝSTUPOM POTREBUJEŠ SKAFANDER AJ OPRAVÁRENSKÝ NÁSTROJ',5);return;}
  if(eva.pressure==='inside'){saveCheckpoint();eva.phase='closeInner';eva.cycle=1.4;setEVADoor(evaDoors[0],.999);notice('VNÚTORNÉ DVERE SA ZATVÁRAJÚ · ODSÁVANIE KOMORY',4);}
  else{eva.phase='closeOuter';eva.cycle=1.4;setEVADoor(evaDoors[1],.999);notice('VONKAJŠÍ POKLOP SA ZATVÁRA · OBNOVA TLAKU',4);}
  keys.KeyE=false;tone(90,.8,'sawtooth',.025,1.3);
 }
 if(action==='doff'&&eva.suit&&eva.tested&&eva.returned&&!evaVacuum()&&eva.pressure==='inside'){
  eva.suit=eva.tool=false;eva.stowed=true;$('helmet').classList.add('hidden');evaToolVisible=false;hud();notice(mars.phase==='done'?'SKAFANDER ODLOŽENÝ · V KOKPITE PREPOČÍTAJ KURZ NA LYRU':'SKAFANDER ODLOŽENÝ · V HANGÁRI SPUSŤ ZÁLOŽNÝ POHON',5);saveCheckpoint();return;
 }
 if(action==='valve'&&eva.suit&&eva.sealed){eva.valve=false;eva.tested=true;notice('VENTIL OTVORENÝ · OKRUH DRŽÍ TLAK · VRÁŤ SA DO KOMORY',5);tone(530,.3,'sine',.03,1.3);return;}
 if(action==='valve'&&eva.suit){eva.valve=true;notice('VETVA UZAVRETÁ · MIER NÁSTROJOM NA TRHLINU A DRŽ E',5);tone(120,.3,'triangle',.03,1.4);}

}
function updateEVA(dt){
 evaValveAngle+=clamp((eva.valve?Math.PI*1.5:0)-evaValveAngle,-dt*7,dt*7);
 const phases={closeInner:['pumpOut',3.2],pumpOut:['openOuter',1.4],openOuter:['idle',0],closeOuter:['pumpIn',3.2],pumpIn:['openInner',1.4],openInner:['idle',0]};
 if(eva.phase!=='idle'){
  const phase=eva.phase;eva.cycle=Math.max(0,eva.cycle-dt);
  if(phase==='closeInner')setEVADoor(evaDoors[0],eva.cycle/1.4);
  if(phase==='closeOuter')setEVADoor(evaDoors[1],eva.cycle/1.4);
  if(phase==='openOuter')setEVADoor(evaDoors[1],1-eva.cycle/1.4);
  if(phase==='openInner')setEVADoor(evaDoors[0],1-eva.cycle/1.4);
  if(!eva.cycle){const [next,duration]=phases[phase];eva.phase=next;eva.cycle=duration;
   if(phase==='pumpOut')eva.pressure='vacuum';
   if(phase==='pumpIn'){eva.pressure='inside';eva.oxygen=100;if(eva.tested)eva.returned=true;}
   if(next==='idle'){notice(phase==='openOuter'?'POKLOP OTVORENÝ · MAGNETICKÉ TOPÁNKY AKTÍVNE · NÁJDI VENTIL PRI ÚNIKU':eva.tested?'TLAK OBNOVENÝ · ODLOŽ SKAFANDER NA PÔVODNÝ STOJAN':'KYSLÍK DOPLNENÝ · OPRAVA EŠTE ČAKÁ · NA PANELI SPUSŤ NOVÝ VÝSTUP',5);if(phase==='openInner')saveCheckpoint();}
  }
 }
 if(evaVacuum()){
  if(!eva.suit){hurtPlayer(100);return;}
  eva.oxygen=Math.max(0,eva.oxygen-dt*.55);
  if(eva.oxygen<30&&!eva.warned){eva.warned=true;notice(marsOutside()?'KYSLÍK POD 30 % · VRÁŤ SA DO MODULU ALEBO DO SKLADU':'KYSLÍK POD 30 % · VRÁŤ SA DO KOMORY A OBNOV TLAK',6);tone(600,.6,'sine',.04,.6);}
  if(!eva.oxygen)hurtPlayer(dt*22);
  breathClock-=dt;bootClock-=dt;
  if(breathClock<=0){breathClock=eva.oxygen<30?1.9:3.2;suitBreath();}
  if(bootClock<=0&&(keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD||(touchInput.active&&Math.hypot(touchInput.forward,touchInput.side)>.1))){bootClock=.85;tone(65,.08,'triangle',.013,.55);}
 }else if(eva.suit){eva.oxygen=Math.min(100,eva.oxygen+dt*12);if(eva.oxygen>35)eva.warned=false;}
 const target=interactionTarget();
 if(keys.KeyE&&target?.kind==='eva'&&target.data==='weld'&&eva.valve&&eva.tool&&!eva.sealed){
  eva.progress=Math.min(1,eva.progress+dt/6);if(Math.floor(time*12)!==Math.floor((time-dt)*12)){burst(60.4,27.02,'#ffac6d',2);tone(230,.06,'sawtooth',.018,.7);}
  if(eva.progress===1){eva.sealed=true;score+=650;keys.KeyE=false;notice('TRHLINA UTESNENÁ · OTVOR VENTIL A OVER TESNOSŤ',6);addLog('VONKAJŠÍ OKRUH / OPRAVA','Objímka utesnila poškodené potrubie. Uzatvorená vetva je bezpečná. Otvor ventil a over tesnosť. Potom sa vráť do komory, obnov tlak, odlož skafander na pôvodný stojan a na paneli v hangári spusti záložný pohon.');}
 }
 $('helmet').classList.toggle('hidden',!eva.suit||state==='flight');
 $('healthLabel').textContent=eva.suit?'INTEGRITA SKAFANDRA':'ZDRAVIE';
 $('oxygenValue').textContent=Math.ceil(eva.oxygen)+' %';
 $('oxygenFill').style.width=eva.oxygen+'%';
 $('oxygenMode').textContent=marsOutside()?'ATMOSFÉRA MARSU · SKAFANDER UZAVRETÝ':evaVacuum()?'MAGNETICKÉ TOPÁNKY · VÁKUUM':'UZAVRETÁ PRILBA · TLAK V PORIADKU';
 $('oxygen').classList.toggle('low',eva.oxygen<30);$('oxygen').classList.toggle('critical',eva.oxygen<15);
 const toolVisible=evaHoldingTool();if(evaToolVisible&&!toolVisible)hud();evaToolVisible=toolVisible;
 refreshHeldToolHUD();
 $('hud').classList.toggle('repairTool',toolVisible);$('hud').classList.toggle('unarmed',!intro.gun);
 $('wave').textContent=intro.active?'KRYOKOMORA / PREBUDENIE':room<4?sectors[room].name+' · '+roomWave+'/'+sectors[room].waves:'KOKPIT / NAVIGÁCIA';
 if(evaExterior(player.x,player.y)){$('location').textContent='VONKAJŠÍ TRUP / SERVISNÁ LÁVKA';$('wave').textContent='VÝSTUP NA TRUP';}
 else if(evaChamber())$('location').textContent='PRETLAKOVÁ KOMORA';
 else if(player.x>25&&player.x<36&&player.y>20&&player.y<28)$('location').textContent='SKAFANDROVŇA / VÝSTROJ NA TRUP';
 if(room===3&&cleared[3]&&!eva.diagnosed){eva.diagnosed=true;addLog('POHON / TLAKOVÁ DIAGNOSTIKA','Vnútorné chladenie funguje. Vonkajšia spojka však po náraze netesní. Skafandrovňa je napravo v hangári. Vezmi oblek a nástroj, prejdi komorou, uzavri ventil a utesni trhlinu. Otvorením ventilu over tesnosť, vráť sa komorou a odlož oblek na pôvodný stojan. Potom sa vráť k tomuto panelu.');showGuide('ZÁLOŽNÝ POHON: VONKAJŠÍ ÚNIK','Skafandrovňa je napravo v hangári. Oblek → nástroj → komora → ventil → oprava → skúška → návrat → odloženie obleku.',10);}
 if(!tour||evaTour)missionGoal();
 $('airlockStatus').textContent=evaChamber()?'KOMORA · '+(eva.phase==='idle'?(eva.pressure==='inside'?'TLAK 1 BAR':'VÁKUUM'):eva.phase==='pumpOut'?'ODSÁVANIE':eva.phase==='pumpIn'?'OBNOVA TLAKU':'POHYB DVERÍ'):'';
 $('repairProgress').textContent=evaVacuum()&&eva.valve&&!eva.sealed?'OBJÍMKA / ZVAR '+Math.floor(eva.progress*100)+' %':'';
}
function suitBreath(){
 if(muted)return;try{
  audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();
  const duration=1.2,buffer=audio.createBuffer(1,Math.floor(audio.sampleRate*duration),audio.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.sin(i/data.length*Math.PI);
  const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=750;gain.gain.value=.045;source.connect(filter);filter.connect(gain);gain.connect(audio.destination);source.start();
 }catch{}
}
function decorateWayfinding(arr){
 // Plates on solid walls mark ordinary branches; secrets keep their subtle clues.
 const sign=(x,y,z,text,d)=>{G.box(arr,x,y-.13,z,.075,.42,d,'#1b3542');centeredLabel(arr,text,x-.07,y,z,Math.min(.065,d/(text.length*4.8)),'#94c9bc',-Math.PI/2);};
 sign(24.94,3.28,55,'RIADENIE',2.45);sign(35.94,2.78,51.4,'DIELNA',2.0);sign(24.94,2.78,26.0,'SKAFANDRE',2.5);
 for(let x=18;x<25;x+=1.3){G.box(arr,x,.012,26,.70,.02,.05,'#bba064',3);}
 G.box(arr,38.5,3.37,44,.25,.26,2.12,'#4f6c7c');G.box(arr,38.5,3.09,44,.14,.32,1.8,'#18313d');
 label(arr,'HYDRO',38.40,3.18,43.3,.065,'#9abdab',-Math.PI/2);
}
function restoreEVA(saved){
 const aliases={'MIRA VALEOVÁ / ULOŽENÉ PRED EVAKUÁCIOU':'MIRA VALEOVÁ / POKYNY PRED KRYOSPÁNKOM','MIRA / ZÁZNAM PRI ODLETE MODULU':'EVAKUÁCIA / ULOŽENÝ MANIFEST'};
 logs=logs.map(l=>{const title=aliases[l.title]||l.title,n=shipRecords.find(n=>n.title===title);if(n)return{title,body:n.body};let body=l.body.replace(/pripni lano, /gi,'').replace(/lano → /gi,'').replace('obnov tlak a na paneli','obnov tlak, odlož skafander na stojan a na paneli');if(title==='POHON / TLAKOVÁ DIAGNOSTIKA')body='Vonkajšia vetva netesní. V hangári vpravo vezmi skafander a nástroj, prejdi tlakovou komorou. Uzavri ventil, utesni spoj, otvor ventil a over tlak. Vráť sa komorou, odlož oblek na stojan a spusti záložný pohon.';return{title,body};});
 if(saved)Object.assign(eva,saved);
 if(saved?.tested===undefined)eva.tested=!!(eva.sealed&&!eva.valve);
 if(shipSystems.drive&&mars.phase==='none'){eva.sealed=eva.tested=eva.returned=eva.stowed=true;eva.suit=eva.tool=false;eva.progress=1;}else if(shipSystems.drive)eva.sealed=eva.tested=eva.returned=true;
 delete eva.tether;eva.phase='idle';eva.cycle=0;eva.pressure='inside';eva.oxygen=100;evaValveAngle=eva.valve?Math.PI*1.5:0;
 setEVADoor(evaDoors[0],1);setEVADoor(evaDoors[1],0);
 // Reload never strands a player on a depressurised deck with a closed hatch.
 if(evaExterior(player.x,player.y)||evaChamber()){player.x=31;player.y=24;player.a=0;}
 if(eva.tested)eva.returned=true;
}
function showGuide(title,body,seconds=10){$('guideTitle').textContent=title;$('guideBody').textContent=body;$('guide').classList.remove('hidden');guideTimer=seconds;}
function showPagerGuide(){if(eva.tutorial)return;eva.tutorial=true;addLog('AKO POSTUPOVAŤ NA LODI','Pagery a palubné počítače obsahujú záznamy posádky a servisné rady. Pri zariadení stlač E. J otvorí uložené záznamy; M zobrazí stav lode a ďalší krok. Aktuálny cieľ je vždy vľavo hore. Prvý pager je v sektore 07 vľavo pri dverách z kryokomory.');showGuide('PRVÉ DVERE SÚ OTVORENÉ','Čítaj dátové pagery a terminály klávesom E. Odhalia príbeh aj servisné rady. J: denník · M: ďalší krok. Nákladová paluba je za veľkými dverami.',12);}
function updateMessages(dt){
 if(noticeTimer>0){noticeTimer=Math.max(0,noticeTimer-dt);$('notice').style.opacity=Math.min(1,noticeTimer);if(!noticeTimer)$('notice').textContent='';}
 if(commTimer>0){commTimer=Math.max(0,commTimer-dt);$('comm').style.opacity=Math.min(1,commTimer);if(!commTimer)$('comm').textContent='';}
 if(guideTimer>0){guideTimer=Math.max(0,guideTimer-dt);if(!guideTimer)$('guide').classList.add('hidden');}
}
function drawEVATool(){
 gc.save();gc.translate(240+Math.sin(walk*.55)*1.3,270+Math.sin(walk*.35)*1.2);
 const r=(x,y,w,h,c)=>{gc.fillStyle=c;gc.fillRect(x,y,w,h)};
 const poly=(points,c)=>{gc.fillStyle=c;gc.beginPath();gc.moveTo(...points[0]);for(const p of points.slice(1))gc.lineTo(...p);gc.closePath();gc.fill();};
 // Perspective: the grip is near the right hand; the narrowing barrel points away, towards the crosshair.
 poly([[58,-14],[96,-24],[120,0],[61,0]],'#213845');poly([[65,-12],[94,-20],[110,0],[68,0]],'#91aaa6');
 poly([[-35,0],[-19,-33],[7,-48],[29,-27],[17,0]],'#304a54');poly([[-25,0],[-11,-29],[10,-39],[23,-24],[10,0]],'#9cafaa');
 r(58,-36,38,20,'#273d49');for(let y=-34;y<-18;y+=4)r(62,y,31,2,'#8da19d');
 poly([[40,-52],[61,-57],[89,-38],[88,-24],[69,-16],[47,-29]],'#6f8985');
 poly([[45,-52],[61,-53],[78,-40],[72,-33],[54,-39]],'#b0beb1');
 poly([[1,-53],[14,-62],[33,-54],[32,-40],[13,-34],[0,-40]],'#78948d');r(5,-52,6,13,'#bbcab8');r(14,-55,6,16,'#91a99e');
 // Rear battery and body show their top and right faces, rather than a broad side-on profile.
 poly([[34,-63],[60,-68],[78,-48],[73,-24],[48,-23],[30,-42]],'#142c39');
 poly([[30,-80],[48,-82],[67,-64],[70,-40],[48,-37],[27,-59]],'#516d79');
 poly([[30,-80],[48,-82],[62,-67],[43,-63],[26,-73]],'#a6b8b1');
 poly([[48,-82],[67,-64],[70,-40],[62,-38],[57,-62]],'#2c4757');
 poly([[36,-57],[55,-53],[62,-35],[46,-29],[37,-37]],'#233b47');r(44,-43,4,11,'#a5b0a7');
 poly([[53,-31],[72,-33],[73,-25],[55,-22]],'#304a55');r(59,-30,8,3,'#c79860');
 // Copper heat rings shrink into depth. The small forward ceramic tip stays close to the aim axis.
 poly([[17,-103],[29,-102],[40,-81],[24,-74],[13,-86]],'#976e50');
 for(const [x,y,w,h]of [[22,-86,17,6],[18,-94,16,5],[15,-101,14,4]]){r(x,y,w,h,'#cdb086');r(x+1,y,Math.max(3,w-5),2,'#ead1a5');}
 poly([[12,-111],[22,-112],[28,-102],[15,-101]],'#9eb5b0');r(12,-115,9,5,'#405e65');r(14,-117,5,3,'#84e4d6');
 poly([[37,-69],[52,-64],[56,-51],[42,-56]],'#17343f');poly([[40,-66],[49,-63],[51,-59],[42,-62]],'#66cfc1');
 for(const [x,y]of [[30,-74],[57,-65],[65,-44],[49,-42]])r(x,y,2,2,'#d2d4b6');
 for(let k=0;k<3;k++)poly([[54+k*3,-60+k*3],[57+k*3,-58+k*3],[60+k*3,-49+k*3],[57+k*3,-51+k*3]],'#203a47');
 poly([[70,-40],[81,-40],[86,-11],[76,-8]],'#203945');r(78,-14,8,14,'#29434e');
 const target=interactionTarget();if(keys.KeyE&&target?.kind==='eva'&&target.data==='weld'&&eva.valve&&!eva.sealed){r(12,-125,6,8,'#eaffee');r(9,-132,11,8,'#6de9ef');r(13,-138,4,7,'#fff7bf');}
 gc.restore();
}

function startEVATour(){
 tour=true;makeLevel();resetView();evaTour=true;shipSystems={parts:true,relay:true,cooling:true,isolated:true,drive:false,emp:true};power=true;
 player={x:31,y:24,a:-Math.PI/2,pitch:0,hp:100};room=3;roomWave=score=kills=weapon=0;unlocked=false;ammo=16;magazines=[16,7];totalWaves=8;entered=[true,true,true,true,false];cleared=[true,true,true,true,false];enemies=[];defenses=[];
 for(const d of sideDoors){d.active=true;d.open=1;for(const[x,z]of d.cells)map[z][x]='0';}
 for(let i=0;i<3;i++){gates[i].active=true;gates[i].open=1;for(let x=11;x<16;x++)map[gates[i].row][x]='0';}
 showGuide('SKÚŠKA VÝSTUPU NA TRUP','Vezmi oblek zo stojana a nástroj zo susedného stola. Vstúp do komory. Sleduj cieľ vľavo hore; E používa predmety, pri zváraní ho drž.',12);missionGoal();hud();lock();
}
