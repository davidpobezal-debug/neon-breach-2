/* Side branch: security booth, service loop, armoury, medbay, crew quarters, ship records. */
'use strict';
// A small hand-built branch: visible security booth, service loop and hidden armoury.
const sideSpaces=[{bounds:[25,49,35,56],name:'SECURITY'},{bounds:[25,56,29,66],name:'SERVICE'},{bounds:[29,57,37,65],name:'ARMORY'},{bounds:[25,32,32,46],name:'MEDBAY'},{bounds:[32,32,38,46],name:'CREW'}];
let portalMesh,secretMesh,pagerMesh,recordTerminalMesh,medicalLightMesh,medicalPowered=false,medicalReward=false;
const medicalFixtures=[26.3,31.1,33.6,37.6].flatMap(x=>[34,37.2,44].map(z=>({x,z})));
const crewBedZ=[34.5,36.6,41.4];
const shipRecords=[
 {x:11.3,y:84.5,room:0,source:'PAGER',title:'MIRA VALEOVÁ / POKYNY PRED KRYOSPÁNKOM',body:'Alex, tu Mira z údržby. Pred uložením do kryospánku ti nechávam servisné pokyny. Automatika ťa prebudí z kryospánku pred príletom na LYRU. Ak hlavné napájanie vypadne, skontroluj miestne riadenie na nákladovej palube. Bezpečnostný počítač je vpravo; vedľa neho je servisná cesta. V dielni nájdeš náhradný regulátor. Tento pager je uložený záznam, nie rádiové spojenie.'},
 {x:27.5,y:64.5,room:1,source:'PAGER',title:'JARO POLÁK / SERVISNÝ ZÁZNAM PRED NÁRAZOM',body:'Servisný technik Jaro Polák. Modul MK.04 je odložený v starom sklade za obložením. Dvere zo servisnej chodby sme prekryli pri prestavbe: pôvodný zámok nefungoval. Oproti potrubiu hľadaj tri škrabance nízko na pravej stene. Západku uvoľníš zatlačením panela. Toto nie je nová puška, ale modul jej nabíjania. Zadná servisná cesta vedie aj k bezpečnostnému počítaču.'},
 {x:23.1,y:44.3,room:2,source:'POČÍTAČ',title:'REAKTOR / AUTOMATICKÝ ARCHÍV INCIDENTU',body:'Čas 03:12 — náraz do úlomkov pri Saturne. Navigačné senzory odpojené. Náraz poškodil vonkajší plášť aj primárny energetický prívod. Reaktor nemožno na mieste opraviť: na červenom servisnom paneli ho fyzicky odpoj. Obývaná časť je za tlakovou priepážkou bezpečná. Čas 03:13 — palubná umelá inteligencia AEGIS vyhlásila karanténu a automaticky prebudila 12 osôb evidovaných v manifeste. Spustila evakuáciu záchranným modulom na domovskú stanicu LYRA a zablokovala ručné riadenie poškodených sektorov. Čas 03:14 — strážca NOVA prešiel na vlastné napájanie. Jeho pulzné jadro zostáva prenosné. Štítové jednotky sa otáčajú pomaly: zadná časť nemá pancier.'},
 {x:7.5,y:25.2,room:3,source:'PAGER',title:'EVAKUÁCIA / ULOŽENÝ MANIFEST',body:'03:19. AEGIS dokončila automatickú evakuáciu záchranným modulom na domovskú stanicu LYRA. Núdzový manifest: 12 evidovaných osôb, 12 evakuovaných. Servisný kryobox: bez dostupného záznamu; poškodený senzor obsadenia a prerušené spojenie s manifestom. AEGIS uzavrela poškodenú časť lode a každý ďalší pohyb v nej vyhodnocuje ako narušenie karantény. Záchranný modul sa odpája; má vlastný núdzový skok na maják LYRA. Poznámka údržby: hlavný reaktor je vyradený; záložný pohon potrebuje napájanie, vnútorné chladenie a tesnú vonkajšiu vetvu. Spojenie s domovskou stanicou LYRA sa dá obnoviť z hlavného panela v kokpite.'},
 {x:16.2,y:7.6,room:4,source:'POČÍTAČ',title:'NAVIGÁCIA / MIESTNY MANUÁL',body:'Komunikačná anténa je v pohotovostnom režime. Archív končí evakuáciou o 03:19. Hlavný panel obnoví spojenie a overí domovský maják LYRA. Hlavný reaktor je po náraze nepoužiteľný. Núdzový skok je možný len na záložnom pohone, po obnove jeho chladenia a potvrdení súradníc. Tento počítač je miestny a môže prevziať navigáciu aj pri poruche AEGIS. Diagnostika stabilizátorov po zapnutí spojenia určí, či pohon zvládne priamy návrat, alebo treba servisnú zastávku.'},
 {x:27,y:35,rotation:0,room:2,source:'ZDRAVOTNÝ TERMINÁL',title:'OŠETROVŇA / PACIENT ALEX RENN',body:'Alex Renn, navigačný technik ARGO-09. Zaradený do kryospánku pred dlhou cestou na LYRU. Kryobox je v oddelenej kryokomore pri aréne sektora 07. Identifikácia pacienta uložená v miestnom zdravotnom systéme. Miestny záznam eviduje trinástu osobu, ktorú centrálny manifest neobsahuje. Po náraze: spojenie s manifestom prerušené, senzor obsadenia neodpovedá. Záložná batéria udržiavala kryobox v prevádzke; oneskorené prebudenie nastalo dvadsať hodín po evakuácii.'},
 {x:35,y:35,room:2,source:'PAGER',title:'JARO / SÚKROMNÁ POZNÁMKA',body:'Pred návratom na LYRU ešte opraviť pravý stabilizátor. Alex si myslí, že tie zvuky robí motor. Mira vie, že je to moja kanvica na kávu. Do kajuty som odložil náhradné články a lekárničku. Ak sem niekto príde počas karantény, servisné dvere sa dajú otvoriť bez zapnutia obranného okruhu.'}
];
function buildSideSpaces(){
 medicalPowered=medicalReward=false;
 for(const s of sideSpaces){const [x0,z0,x1,z1]=s.bounds;for(let z=z0+1;z<z1;z++)for(let x=x0+1;x<x1;x++)map[z][x]='0';}
 for(const z of [51,52])map[z][25]='5';
 for(const z of [58,59,64,65])map[z][25]='0';
 sideDoors=[
  {x:25.5,y:55,axis:'x',cells:[[25,54],[25,55]],open:0,active:false,type:'card'},
  {x:28,y:56.5,axis:'z',cells:[[27,56],[28,56]],open:0,active:false,type:'service'},
  {x:29.5,y:62,axis:'x',cells:[[29,61],[29,62]],open:0,active:false,type:'secret'},
  {x:25.5,y:44,axis:'x',cells:[[25,43],[25,44]],open:0,active:false,type:'medical'},
  {x:25.5,y:35,axis:'x',cells:[[25,34],[25,35]],open:0,active:false,type:'quiet'}
 ];
 for(const d of sideDoors)for(const [x,z]of d.cells)map[z][x]='9';
 
 
 for(const z of [39,40])map[z][32]='0';
 
 pickups.push({kind:'mod',x:34.5,y:61.5});
}
function decorateSideSpaces(arr){const B=G.box;
 for(const s of sideSpaces){const [x0,z0,x1,z1]=s.bounds;
  const corridor=s.name==='SERVICE'||s.name==='CREW';for(let z=z0+2;z<z1;z+=3){const x=(x0+x1)/2,w=corridor?.55:1.8;B(arr,x,3.42,z,w+.18,.16,.32,'#344d58');B(arr,x,3.3275,z,w,.025,.15,corridor?'#d4a266':'#6bbbbf',3);lights.push({x,y:2.8,z,r:corridor?4:6,c:corridor?'#bc905a':'#6cbbcb'});}
 }
 // These diffusers have permanent ceiling housings; switching power changes only their light.
 for(const {x,z}of medicalFixtures){B(arr,x,3.39,z,.28,.22,1.40,'#40585e');B(arr,x,3.278,z,.20,.035,1.28,'#84968f');B(arr,x,3.267,z,.13,.025,1.16,'#72b2ac',3);lights.push({x,y:3.0,z,r:4,c:'#6eaaa5'});}
 // Wall-mounted security workstation and inset racks.
 B(arr,31.5,.5,50.5,3,1,1,'#283e4a');B(arr,31.5,1.25,50.38,3.3,.62,.20,'#3c5664');
 for(const x of [30.5,31.5,32.5]){B(arr,x,1.28,50.50,.83,.43,.035,'#071b29');B(arr,x,1.28,50.525,.68,.31,.02,'#1b465d',3);for(let j=0;j<4;j++)B(arr,x-.06,1.17+j*.06,50.54,.46-j*.05,.018,.012,'#619cad',3);}
 B(arr,31.5,1.02,50.99,.28,.06,.16,'#eaaa63',3);
 B(arr,31.35,2.085,50.06,3.65,.65,.10,'#172d38');B(arr,31.35,2.085,50.115,3.49,.49,.016,'#1e3944');
 label(arr,'SECURITY',29.68,2.30,50.145,.10,'#89bfce');
 for(const x of [33.4,34.3]){B(arr,x,1.3,50.9,.48,2.6,.9,'#1d3243');for(let y=.4;y<2.4;y+=.28){B(arr,x,y,51.38,.34,.06,.03,'#668294');B(arr,x+.1,y+.08,51.4,.055,.05,.025,'#5ab8ad',3);}}
 // Service route uses large pipes and directional floor arrows.
 decorateServiceWallPipes(arr);
 for(let z=57.5;z<66;z++){B(arr,27.5,.015,z,.035,.025,.40,'#9b804e',3);}
 B(arr,27.5,2.55,65.97,2.5,.50,.12,'#172b36');label(arr,'SERVICE',28.40,2.73,65.875,.075,'#d4b783',Math.PI);
 // Armory shelves are solid; the upgrade lies in the clear central aisle.
 for(let z=60.5;z<63;z++){B(arr,36.5,1.2,z,.75,2.4,.90,'#253747');for(let y=.5;y<2.3;y+=.55)B(arr,36.1,y,z,.08,.07,.90,'#78878d');}
 B(arr,33,.2,58.6,3,.40,.7,'#26394a');B(arr,33,.41,58.6,2.8,.035,.65,'#856d4d');B(arr,33,2.4,58.03,3.7,.7,.12,'#182d39');label(arr,'ARMORY',31.35,2.6,58.11,.12,'#ddba86');
 for(const d of sideDoors){if(d.type==='secret'||d.type==='hydro'||d.type==='cryo')continue;const a=d.axis==='x';B(arr,d.x,3.1,d.y,a?.3:2.45,.25,a?2.45:.3,'#527282');B(arr,d.x,.025,d.y,a?.35:2.4,.05,a?2.4:.35,'#1b2f3c');}
 // No exterior window behind engineering hardware: pipes read as ship machinery.
 for(let z=33;z<41;z+=1.2){B(arr,3.08,2.75,z,.10,.14,.65,'#6e777b');B(arr,3.09,2.50,z,.10,.10,.85,'#50707c');}
 B(arr,23.2,2.6,66.92,1.1,.62,.14,'#182d39');label(arr,'02',23.5,2.78,66.83,.10,'#8bb6c1',Math.PI);
 // Medical couches, privacy divider and compact lived-in crew cabins.
 for(const z of [34.5,41.5]){
  B(arr,29.8,.35,z,2.7,.7,1.05,'#344955');B(arr,29.8,.73,z,2.55,.08,1,'#8aa49c');B(arr,30.65,.80,z,.62,.11,.9,'#b6c2b0');
  B(arr,31.04,.60,z,.36,.12,.14,'#59747b');B(arr,31.25,.86,z,.10,.62,.12,'#82918c');
  // The broad screen faces west towards the bed; every layer stays inside its collider.
  B(arr,31.26,1.35,z,.10,.55,.55,'#263c45');B(arr,31.214,1.35,z,.018,.44,.45,'#6a8285');
  B(arr,31.20,1.35,z,.009,.36,.39,'#153c3e',3);
  for(let i=0;i<3;i++)B(arr,31.1925,1.24+i*.055,z-.055+i*.012,.004,.018,.22-i*.035,'#76b5a2',3);
  for(const [dz,y,h]of [[-.13,1.43,.015],[-.075,1.45,.055],[-.035,1.43,.10],[.01,1.46,.065],[.075,1.43,.015]])B(arr,31.1925,y,z+dz,.004,h,.037,'#a2c9ac',3);
  B(arr,31.1925,1.24,z+.135,.004,.028,.035,'#d7ad70',3);
 }
 B(arr,28,.55,37.5,2,1.1,.75,'#364c55');B(arr,28,1.15,37.5,1.85,.10,.7,'#6a8586');
 for(const z of crewBedZ){B(arr,36.5,.35,z,1,.7,1.8,'#2a3c48');B(arr,36.5,.74,z,1,.08,1.7,'#867966');B(arr,36.5,.82,z-.56,.8,.09,.4,'#aea794');B(arr,37.86,2.18,z,.18,.10,1.35,'#48606b');for(const dz of [-.48,.48]){B(arr,37.86,2.06,z+dz,.20,.06,.07,'#728384');B(arr,37.96,2.13,z+dz,.05,.18,.07,'#728384');}B(arr,37.86,2.30,z-.3,.12,.14,.25,'#a99a79');}
 B(arr,34.3,.65,43.5,1.2,1.3,.8,'#3a4850');B(arr,34.3,1.33,43.5,1.3,.06,.9,'#917d61');B(arr,34.1,1.45,43.5,.16,.23,.16,'#b4b5a0');
 B(arr,27.6,2.42,33.06,2.2,.65,.10,'#182e37');label(arr,'MED',26.75,2.65,33.135,.12,'#99c8b7');B(arr,34.5,2.42,33.06,2.7,.65,.10,'#242f34');label(arr,'CREW',33.3,2.65,33.135,.12,'#c6b58d');
 // Subtle maintenance markings also visible outside the optional routes.
 B(arr,24.94,1.8,45.5,.025,.5,.8,'#235347');B(arr,24.92,1.8,45.5,.027,.1,.6,'#89c5ad',3);
 B(arr,24.94,1.8,36.5,.025,.4,.7,'#524836');
}
function makeMissionAssets(){const B=G.box;
 const d=[];B(d,0,1.62,0,1.96,3.24,.18,'#2e4554');
 // Mirror the standard inset, access panel and hazard marks onto the reverse face.
 // Door size, travel, locks and collision cells remain unchanged.
 for(const face of [1,-1]){B(d,0,1.62,.11*face,1.70,2.91,.06,'#172f40');B(d,.55*face,1.50,.16*face,.20,.24,.025,'#679daa',3);for(let x=-.8;x<.8;x+=.25)B(d,x*face,.45,.16*face,.12,.14,.025,'#917544',3);}
 portalMesh=G.mesh(d);
 // Flush wall section: ordinary panels, one narrow seam and faint tool scratches.
 const panel=[];B(panel,0,1.75,0,1.99,3.5,.99,'#354653');B(panel,0,1.7,-.51,1.98,2.55,.08,'#2b3f4c');for(const y of [.65,2.48])B(panel,0,y,-.515,2,.055,.10,'#132631');B(panel,.38,1.7,-.558,.018,2.4,.008,'#233540');for(let i=0;i<3;i++)B(panel,.46+i*.07,1.12+i*.09,-.564,.20,.025,.008,'#87948c');secretMesh=G.mesh(panel);
 const pager=[];B(pager,0,.44,0,.55,.88,.40,'#253b48');B(pager,0,.90,0,.64,.04,.44,'#556674');B(pager,0,.94,0,.35,.035,.26,'#172431');B(pager,0,.965,.01,.27,.014,.18,'#75aaa9',3);for(let i=0;i<3;i++)B(pager,-.08+i*.08,.971,.06,.025,.008,.04,'#cbdfcd',3);B(pager,.22,.95,.08,.035,.015,.035,'#dbab72',3);pagerMesh=G.mesh(pager);
 const terminal=[];B(terminal,0,.45,0,.9,.9,.55,'#304651');B(terminal,0,.92,0,.15,.10,.12,'#607d83');B(terminal,0,1.22,0,1.1,.58,.18,'#5c777e');B(terminal,0,1.22,.11,.88,.40,.025,'#102933');B(terminal,0,1.22,.13,.75,.31,.018,'#3c706a',3);for(let i=0;i<4;i++)B(terminal,-.05,1.1+i*.07,.145,.54-i*.08,.019,.012,'#9fcdb3',3);B(terminal,0,.94,.30,.85,.09,.40,'#527179');recordTerminalMesh=G.mesh(terminal);
 const powered=[];for(const {x,z}of medicalFixtures)B(powered,x,3.247,z,.12,.016,1.14,'#a7e0cd',3);medicalLightMesh=G.mesh(powered);
 const c=[];B(c,0,.27,0,.38,.54,.055,'#83c9ec',3);B(c,0,.37,.035,.28,.16,.015,'#173a5a',3);B(c,-.08,.15,.036,.04,.11,.015,'#cfeef7',3);B(c,.04,.15,.036,.14,.05,.015,'#cfeef7',3);cardMesh=G.mesh(c);
 const mod=[];B(mod,0,.24,0,.5,.35,.3,'#46526a');B(mod,0,.24,.17,.36,.16,.035,'#e9ad63',3);for(const x of [-.14,0,.14])B(mod,x,.43,0,.065,.05,.21,'#c7d4cd');modMesh=G.mesh(mod);
 const t=[];B(t,0,.2,0,.95,.4,.85,'#263746');B(t,0,.7,0,.30,.7,.30,'#73828c');B(t,0,1.13,0,.75,.43,.55,'#385466');B(t,0,1.18,.4,.28,.21,.48,'#172e40');B(t,0,1.18,.655,.20,.14,.04,'#6cf3dd',3);for(const x of [-.28,.28])B(t,x,1.26,.30,.10,.06,.035,'#d8ac6c',3);turretMesh=G.mesh(t);
}
function drawSideDoors(){for(const d of sideDoors)if(d.type!=='hydro'&&d.open<.999)G.draw(d.type==='secret'?secretMesh:portalMesh,G.transform(d.x+(d.type==='secret'?Math.min(d.open*10,1)*.04:0),d.type==='secret'?0:d.open*3.5,d.y+(d.type==='secret'?d.open*2.05:0),d.axis==='x'?Math.PI/2:0));for(const n of shipRecords)G.draw(n.source==='PAGER'?pagerMesh:recordTerminalMesh,G.transform(n.x,0,n.y,n.rotation??(n.source==='PAGER'?0:n.x>16?-Math.PI/2:0)));if(medicalPowered)G.draw(medicalLightMesh,G.transform(0,0,0));}
function nearbyDoor(){return sideDoors.find(d=>!d.active&&(d.type==='secret'?Math.hypot(player.x-d.x,player.y-d.y)<1.15&&Math.abs(angle(Math.atan2(d.y-player.y,d.x-player.x)-player.a))<.42:Math.hypot(player.x-d.x,player.y-d.y)<1.75));}
function atSecurity(){return room===1&&Math.hypot(player.x-31.5,player.y-51.7)<1.8;}
function atServiceLog(){return room===1&&Math.hypot(player.x-27.5,player.y-64.5)<1.5;}
function nearbyRecord(){return shipRecords.find(n=>n.room===room&&Math.hypot(player.x-n.x,player.y-n.y)<1.35&&line(player.x,player.y,n.x,n.y));}
function interactionTarget(){
 const candidates=[];const put=(kind,data,x,y,reach)=>{const distance=Math.hypot(x-player.x,y-player.y),aim=Math.abs(angle(Math.atan2(y-player.y,x-player.x)-player.a));if(distance<reach&&(distance<.3||aim<.7)&&line(player.x,player.y,kind==='door'?x+(player.x-x)*Math.min(1,.65/Math.max(distance,.01)):x,kind==='door'?y+(player.y-y)*Math.min(1,.65/Math.max(distance,.01)):y))candidates.push({kind,data,distance,aim});};
 evaTargets(put);cryoTargets(put);marsTargets(put);
 for(const p of pickups)if(p.kind!=='med')put('loot',p,p.x,p.y,1.65);
 if(room===0&&!supplyUsed)put('supply',null,4.3,82,1.55);
 if(entered[1])put('security',null,31.5,51.7,1.8);
 for(const d of sideDoors)if(d.type!=='relay'&&!d.active&&(d.type!=='secret'||Math.hypot(d.x-player.x,d.y-player.y)<1.35))put('door',d,d.x,d.y,d.type==='secret'?1.35:1.75);
 for(const p of repairPoints)put('repair',p,p.x,p.y,1.7);
 for(const n of shipRecords)put('record',n,n.x,n.y,1.4);
 if(room===4)put('nav',null,13.5,4.8,2.1);
 return candidates.sort((a,b)=>(a.aim*.8+a.distance)-(b.aim*.8+b.distance))[0];
}
function readRecord(n){addLog(n.title,n.body);persistMission();openJournal(n.title);tone(480,.12,'sine',.025,1.4);}
function nearbyLoot(){return pickups.find(p=>p.kind!=='med'&&Math.hypot(p.x-player.x,p.y-player.y)<1.65&&line(player.x,player.y,p.x,p.y));}
function interactionLabel(){
 const t=interactionTarget();if(!t)return '';if(t.kind==='eva')return evaLabel(t.data);if(t.kind==='cryo')return cryoLabel(t.data);if(t.kind==='mars')return marsLabel(t.data);const p=t.kind==='loot'?t.data:null;if(p)return p.kind==='parts'?'[ E ] ZOBRAŤ SERVISNÝ BALÍK / REGULÁTOR + CHLADIACI ČLÁNOK':p.kind==='nova'?'[ E ] ZOBRAŤ NEON NOVA':p.kind==='card'?'[ E ] ZOBRAŤ PRÍSTUPOVÚ KARTU':'[ E ] MODUL · RÝCHLEJŠIE PREBÍJANIE';
 if(t.kind==='repair')return repairLabel(t.data);
 if(t.kind==='supply')return '[ E ] OTVORIŤ ZDRAVOTNÉ ZÁSOBY';
 if(t.kind==='security')return power?'[ E ] PALUBNÝ POČÍTAČ / DIAGNOSTIKA':'[ E ] VYPNÚŤ OBRANU A OBNOVIŤ NAPÁJANIE';
 if(t.kind==='door'){const d=t.data;return d.type==='cryo'?(!intro.gun?'NAJPRV ZOBER PUŠKU ZO STOJANA VPRAVO':'[ E ] OTVORIŤ PRIEPÁŽKU · SEKTOR 07'):d.type==='evaAccess'?'[ E ] OTVORIŤ DVERE DO SKAFANDROVNE':d.type==='medical'?'[ E ] OŠETROVŇA · PLNÉ NAPÁJANIE / AKTIVUJE OBRANU':d.type==='quiet'?'[ E ] SERVISNÝ VSTUP · BEZ OBRANNÉHO OKRUHU':d.type==='secret'?'[ E ] PRESKÚMAŤ POŠKRIABANÝ PANEL':d.type==='card'&&!card?'[ E ] ZÁMOK · POTREBUJEŠ MODRÚ KARTU':'[ E ] OTVORIŤ DVERE';}
 if(t.kind==='record')return '[ E ] '+(t.data.source==='PAGER'?'PREČÍTAŤ DÁTOVÝ PAGER':'PREČÍTAŤ ZÁZNAMY · '+t.data.source);
 if(mars.phase!=='none'&&mars.phase!=='done')return 'PRAVÝ STABILIZÁTOR JE VYPÁLENÝ · POTREBUJEŠ NÁHRADNÝ Z ARES-3';
 return navReady?(mars.phase==='none'?'[ E ] SPUSTIŤ WARP · MEDZIZASTÁVKA MARS':'[ E ] SPUSTIŤ WARP · ODLET NA LYRU'):(mars.phase==='done'?'[ E ] PREPOČÍTAŤ KURZ NA LYRU':'[ E ] ZAPNÚŤ SPOJENIE A OVERIŤ KURZ');
}
function interact(){if(state!=='playing')return;
 const t=interactionTarget();if(!t)return;if(t.kind==='eva'){interactEVA(t.data);return;}if(t.kind==='cryo'){interactCryo(t.data);return;}if(t.kind==='mars'){interactMars(t.data);return;}const p=t.kind==='loot'?t.data:null;if(p){pickups.splice(pickups.indexOf(p),1);if(p.kind==='parts'){shipSystems.parts=true;notice('SERVISNÝ BALÍK ZÍSKANÝ · VRÁŤ SA K ROZVODNI V DIELNI',4);}else if(p.kind==='nova'){unlocked=true;switchWeapon(1);notice('NEON NOVA ZÍSKANÁ · 1 / 2 PREPÍNAJ ZBRANE',4);}else if(p.kind==='card'){card=true;notice('PRÍSTUPOVÁ KARTA · BEZPEČNOSTNÁ MIESTNOSŤ',4);}else{upgraded=true;weapons[0].reload=.82;score+=350;notice('MODUL MK.04 · PREBÍJANIE RÝCHLEJŠIE O 32 %',4);addLog('MODUL MK.04','Servisný modul skracuje prebíjanie základnej pušky z 1,2 na 0,82 sekundy.');}persistMission();hud();return;}
 if(t.kind==='repair'){useRepair(t.data);return;}
 if(t.kind==='supply'){supplyUsed=true;dropPickup({kind:'med',x:5.2,y:82});notice('ZÁSOBY OTVORENÉ · LEKÁRNIČKA +25 HP',3);tone(400,.2,'triangle',.03,1.8);return;}
 if(t.kind==='security'){if(!power){power=true;defenses=defenses.filter(e=>e.kind!=='turret');bolts=bolts.filter(b=>b.friendly);alarmTimer=0;dropWaveMed();if(!enemies.length&&!cleared[1]&&nextWave<=0)waveCleared();refreshSystemGates();score+=250;addLog('ARGO-09 / BEZPEČNOSTNÝ POČÍTAČ','Miestne napájanie obnovené. Ochranná vežička odpojená. Palubná umelá inteligencia AEGIS odmieta miestny príkaz: PRIORITA KARANTÉNA. Evakuačný manifest obsahuje 12 osôb. Servisný kryobox po poškodení senzora chýba v centrálnej evidencii. Miestny zdravotný archív v ošetrovni vpravo pri reaktore eviduje nesúlad; nájdeš tam aj zásoby. AEGIS teraz tvoj pohyb označuje ako anomáliu.');notice('NAPÁJANIE OBNOVENÉ · VEŽIČKA VYPNUTÁ',4);tone(520,.6,'sine',.045,1.6);missionGoal();persistMission();}else openJournal('ARGO-09 / BEZPEČNOSTNÝ POČÍTAČ');return;}
 const d=t.kind==='door'?t.data:null;if(d){if(d.type==='cryo'&&!intro.gun){notice('PUŠKA JE V NÁSTENNOM STOJANE VPRAVO OD VÝCHODU',4);return;}if(d.type==='card'&&!card){notice('KARTA JE U MODRÉHO STRÁŽCU · ALEBO POUŽI SERVISNÚ CESTU',4);return;}d.active=true;if(d.type==='medical'){medicalPowered=true;if(!medicalReward){medicalReward=true;dropPickup({kind:'med',x:28,y:42,permanent:true});dropPickup({kind:'med',x:35.4,y:43,permanent:true});defenses.push(enemy(30,40,'shield'),enemy(35,40,'runner'));notice('OŠETROVŇA ZAPNUTÁ · OBRANA PREBUDENÁ · ZÁSOBY SPRÍSTUPNENÉ',4);}}if(d.type==='secret'){secretFound=true;score+=200;if(shipSystems.relay)sideDoors.find(d=>d.type==='relay').active=true;notice('TAJOMSTVO OBJAVENÉ · SKRYTÁ ZBROJNICA',4);}else if(d.type!=='medical')notice(d.type==='quiet'?'SERVISNÝ VSTUP OTVORENÝ · OBRANA SPÍ':'DVERE ODOMKNUTÉ',2);tone(90,.3,'sawtooth',.025,1.7);persistMission();hud();return;}
 const n=t.kind==='record'?t.data:null;if(n){readRecord(n);return;}
 if(t.kind==='nav'){if(!shipSystems.drive){notice('ZÁLOŽNÝ POHON JE ODPOJENÝ · PREPNI HO NA PANELI V HANGÁRI',4);return;}
  if(mars.phase!=='none'&&mars.phase!=='done'){notice('PRAVÝ STABILIZÁTOR JE VYPÁLENÝ · NÁHRADNÝ DIEL JE V SKLADE ARES-3 NA MARSE',5);return;}
  if(mars.phase==='done'&&!navReady){navReady=true;goal('KURZ NA LYRU POTVRDENÝ · STLAČ E NA SPUSTENIE WARPU');notice('KURZ NA LYRU PREPOČÍTANÝ · STABILIZÁTORY V PORIADKU · WARP PRIPRAVENÝ',5);tone(520,.3,'sine',.035,1.5);saveCheckpoint();return;}if(!navReady){navReady=true;goal('KURZ POTVRDENÝ · STLAČ E NA SPUSTENIE WARPU');notice('NAVIGÁCIA: LYRA · MEDZIZASTÁVKA MARS / ARES-3 · POHON PRIPRAVENÝ',5);tone(520,.3,'sine',.035,1.5);addLog('KOKPIT / ŽIVÁ SPRÁVA · SPOJENIE OBNOVENÉ','Alex? Tu Mira zo stanice LYRA. Záchranný modul dorazil. Prijímame tvoj signál z ARGO-09! AEGIS nás po náraze prebudila a evakuovala na LYRU. Tvoj kryobox však pre poškodený senzor a prerušené spojenie chýbal v centrálnom manifeste. AEGIS ťa preto neprebudila a pri evakuácii sme nevedeli, že si zostal na palube. Jaro potvrdil domovský maják a posiela súradnice. Si pri Saturne. Jaro preveril telemetriu: poškodený pravý stabilizátor záložného pohonu vydrží iba krátky skok. Priamy návrat na LYRU by nezvládol. Preto posielame kurz na Mars, kde je starý automatický sklad ARES-3 s kompatibilným náhradným dielom. Na obežnej dráhe vypni pohon, zostúp modulom KESTREL-2 a vymeň stabilizátor. Potom môžeš pokračovať na LYRU. Čakáme ťa doma.');saveCheckpoint();openJournal('KOKPIT / ŽIVÁ SPRÁVA · SPOJENIE OBNOVENÉ');}else launch();}
}
function missionGoal(){
 if(intro.active){goal(intro.gun?'OTVOR DVERE DO SEKTORA 07 · E PRI VÝCHODE':'ZOBER PUŠKU · STOJAN NAPRAVO PRI VÝCHODE / E');return;}
 if(room===0){goal(cleared[0]?'PREJDI VEĽKÝMI DVERAMI NA NÁKLADOVÚ PALUBU · PAGERY: E / DENNÍK: J':'PREŽI DVE VLNY V ARÉNE · POTOM SA OTVORIA VEĽKÉ DVERE');return;}
 if(room===1){goal(!power?'OBNOV RIADENIE · BEZPEČNOSTNÝ POČÍTAČ VPRAVO / KARTA ALEBO SERVISNÁ CESTA':!shipSystems.parts?'NÁJDI SERVISNÝ BALÍK · DIELŇA ZA BEZPEČNOSTNOU MIESTNOSŤOU':!shipSystems.relay?'VYMEŇ REGULÁTOR · ROZVODŇA V DIELNI':!cleared[1]?'VYČISTI NÁKLADOVÚ PALUBU · NAPÁJANIE JE OBNOVENÉ':'PREJDI PREDNOU PRIEPÁŽKOU DO REAKTORA NOVA');return;}
 if(room===2){goal(!cleared[2]?'VYČISTI REAKTOR · V POSLEDNEJ VLNE PORAZ STRÁŽCU NOVA':!shipSystems.isolated?'ODPOJ HLAVNÝ REAKTOR · ČERVENÝ PANEL PRI JADRE VĽAVO':!shipSystems.cooling?'OBNOV CHLADENIE · HYDROPONIKA VPRAVO CEZ OBYTNÚ PALUBU':'PREJDI PREDNOU PRIEPÁŽKOU DO HANGÁRA');return;}
 if(room===3){let text;
  if(!cleared[3])text='VYČISTI HANGÁR · POTOM SKONTROLUJ ZÁLOŽNÝ POHON';
  else if(eva.phase!=='idle')text='PRETLAKOVÁ KOMORA PRACUJE · POČKAJ NA OTVORENIE POKLOPU';
  else if(!eva.sealed){text=!eva.suit?'VONKAJŠÍ ÚNIK · NÁJDI SKAFANDROVŇU / DVERE VPRAVO V HANGÁRI':!eva.tool?'ZOBER ZVÁRACÍ NÁSTROJ · STÔL VEDĽA SKAFANDROV':evaVacuum()?!eva.valve?'UZAVRI VENTIL · ŽLTÉ KOLESO PRI BIELOM ÚNIKU':'UTESNI TRHLINU · MIER NA POTRUBIE A DRŽ E':'VSTÚP DO PRETLAKOVEJ KOMORY · PRI PANELI STLAČ E A SPUSŤ VÝSTUP';}
  else text=!eva.tested?(evaVacuum()?'OTVOR ŽLTÝ VENTIL PRI ZVARE · OVER TESNOSŤ OPRAVY':'VRÁŤ SA CEZ KOMORU NA LÁVKU · TREBA OTVORIŤ VENTIL A OVERIŤ OPRAVU'):evaVacuum()?'VRÁŤ SA DO KOMORY · PRI PANELI STLAČ E A OBNOV TLAK':!eva.stowed?'ODLOŽ SKAFANDER · PÔVODNÝ STOJAN V SKAFANDROVNI':!shipSystems.drive?'VRÁŤ SA DO HANGÁRA · PREPNI ZÁLOŽNÝ POHON NA PRAVOM PANELI':'PREJDI PREDNÝMI DVERAMI DO KOKPITU';
  goal(text);return;
 }
 {const g=marsGoal();goal(g||(navReady?'KURZ DOMOV POTVRDENÝ · E NA HLAVNOM PANELI SPUSTÍ WARP':'KOKPIT · E NA HLAVNOM PANELI OBNOVÍ SPOJENIE A OVERÍ KURZ'));}
}
function physicalDeck(){return player.y>=67?0:player.y>=48?1:player.y>=28?2:player.y>=10?3:4;}
function updateSideSystems(dt){
 for(const d of sideDoors)if(d.active&&d.open<1){d.open=Math.min(1,d.open+dt*.9);if(d.open===1)for(const [x,z]of d.cells)map[z][x]='0';}
 if(room===1&&!cleared[1]&&!alarmTriggered&&!power&&player.y<58&&player.x<24){alarmTriggered=true;alarmTimer=2.5;notice('AEGIS · POSILY PRICHÁDZAJÚ Z PREDNEJ ČASTI PALUBY',3);tone(720,.35,'square',.025,.7);}
 if(alarmTimer>0){alarmTimer-=dt;if(alarmTimer<=0&&!power){for(const [x,y,kind]of [[7.5,51.5,'runner'],[18.5,51.5,'drone']]){const e=enemy(x,y,kind);e.attack=1.5;enemies.push(e);}nextWave=0;}}
 const location=player.x>32&&player.y>32&&player.y<46?'OBYTNÁ PALUBA':player.x>25&&player.y>32&&player.y<46?'OŠETROVŇA':player.x>29&&player.y>57&&player.y<65?'SKRYTÁ ZBROJNICA':player.x>25&&player.y>56?'SERVISNÁ CHODBA':player.x>25&&player.y<56?'BEZPEČNOSTNÁ MIESTNOSŤ':sectors[physicalDeck()].name;
 $('location').textContent=player.y>86?'KRYOKOMORA / PREBUDENIE':location;$('equipment').textContent=[card?'KARTA ✓':'',upgraded?'MK.04 MOD ✓':'',secretFound?'TAJOMSTVO 1/1':''].filter(Boolean).join(' · ');
}
function persistMission(){if(tour||!checkpoint)return;if(cleared[room]){saveCheckpoint();return;}checkpoint.mission={mars:{...mars,cine:null,leg:0},eva:{...eva},systems:{...shipSystems},card,power,upgraded,secretFound,medicalPowered,medicalReward,alarmTriggered:false,logs:[...logs],doors:sideDoors.map(d=>d.active?1:0),doorStates:Object.fromEntries(sideDoors.map(d=>[d.type,d.active?1:0])),defenses:defenses.map(e=>({...e}))};checkpoint.unlocked=unlocked;checkpoint.weapon=weapon;if(upgraded||shipSystems.relay||shipSystems.cooling||shipSystems.isolated||shipSystems.drive)checkpoint.score=Math.max(checkpoint.score,score);checkpoint.pickups=pickups.filter(p=>p.kind==='mod'||p.permanent).map(p=>({...p}));try{localStorage.setItem(slotKey(activeSlot),JSON.stringify(checkpoint));}catch{}}
function restoreMission(m,n){
 if(m){shipSystems={...shipSystems,...m.systems};medicalPowered=!!m.medicalPowered;medicalReward=!!m.medicalReward;card=!!m.card;power=!!m.power;upgraded=!!m.upgraded;secretFound=!!m.secretFound;alarmTriggered=!!m.alarmTriggered;logs=(m.logs||[]).map(l=>({...l,body:reviewedRecordText(l.title,l.body)}));defenses=(m.defenses||[]).map(e=>({...e}));for(let i=0;i<sideDoors.length;i++){const d=sideDoors[i];d.open=m.doorStates?.[d.type]??m.doors?.[i]??0;d.active=d.open===1;if(d.active)for(const [x,z]of d.cells)map[z][x]='0';}}
 else{power=n>1;defenses=n===1?[enemy(23.5,58,'turret')]:[];}
 mars=Object.assign(freshMars(),m?.mars||{},{cine:null,leg:0});marsApplyState();
 weapons[0].reload=upgraded?.82:1.2;if(power)defenses=defenses.filter(e=>e.kind!=='turret');
}
function reviewedRecordText(title,body){
 const record=shipRecords.find(n=>n.title===title);if(record)return record.body;
 const updated={"ARGO-09 / BEZPEČNOSTNÝ POČÍTAČ":"Miestne napájanie obnovené. Ochranná vežička odpojená. Palubná umelá inteligencia AEGIS odmieta miestny príkaz: PRIORITA KARANTÉNA. Evakuačný manifest obsahuje 12 osôb. Servisný kryobox po poškodení senzora chýba v centrálnej evidencii. Miestny zdravotný archív v ošetrovni vpravo pri reaktore eviduje nesúlad; nájdeš tam aj zásoby. AEGIS teraz tvoj pohyb označuje ako anomáliu.","KOKPIT / ŽIVÁ SPRÁVA · SPOJENIE OBNOVENÉ":"Alex? Tu Mira zo stanice LYRA. Záchranný modul dorazil. Prijímame tvoj signál z ARGO-09! AEGIS nás po náraze prebudila a evakuovala na LYRU. Tvoj kryobox však pre poškodený senzor a prerušené spojenie chýbal v centrálnom manifeste. AEGIS ťa preto neprebudila a pri evakuácii sme nevedeli, že si zostal na palube. Jaro potvrdil domovský maják a posiela súradnice. Si pri Saturne. Jaro preveril telemetriu: poškodený pravý stabilizátor záložného pohonu vydrží iba krátky skok. Priamy návrat na LYRU by nezvládol. Preto posielame kurz na Mars, kde je starý automatický sklad ARES-3 s kompatibilným náhradným dielom. Na obežnej dráhe vypni pohon, zostúp modulom KESTREL-2 a vymeň stabilizátor. Potom môžeš pokračovať na LYRU. Čakáme ťa doma.","DIELŇA / SERVISNÝ POSTUP":"Regulátor prepája batériovú sieť s pomocným generátorom. Osvetlenie a servis fungujú, ale hlavný reaktor má prerazený prívod. Poraz strážcu NOVA a odpoj poškodené jadro. Potom v hydroponike utesni oddelený chladiaci okruh záložného pohonu. V balíku zostal chladiaci článok. Servisný EMP dočasne vyradí robotov a ich štíty.","KRYOKOMORA / MIESTNA DIAGNOSTIKA":"Kryobox Alexa Renna: núdzové prebudenie dokončené pomocou záložnej batérie. Hlavné napájanie je nedostupné. Automatická komunikácia s centrálnym systémom bola prerušená; tento terminál zobrazuje iba miestny záznam. Ostatné boxy sú prázdne. Núdzová výbava je v nástennom stojane pri východe. Po otvorení priepážky pokračuj do sektora 07."};
 return MARS_RECORDS[title]||updated[title]||body;
}
function addLog(title,body){if(!logs.some(l=>l.title===title))logs.push({title,body});$('comm').textContent='ZÁZNAM ULOŽENÝ · DENNÍK OTVORÍŠ KLÁVESOM J';$('comm').style.opacity=1;commTimer=4;}
function openJournal(recordTitle=null){if(state!=='playing')return;state='reading';keys={};mouseDown=false;game.className='playing reading';const list=$('journalEntries');list.replaceChildren();$('journalTitle').textContent=recordTitle?(recordTitle.includes('ŽIVÁ SPRÁVA')?'PRIJATÁ KOMUNIKÁCIA':shipRecords.find(n=>n.title===recordTitle)?.source==='PAGER'?'DÁTOVÝ PAGER':'PALUBNÝ POČÍTAČ'):'PALUBNÝ DENNÍK';$('journal').classList.toggle('device',!!recordTitle);const entries=recordTitle?logs.filter(l=>l.title===recordTitle):logs;for(const l of entries){const title=document.createElement('h3'),body=document.createElement('p');title.textContent=l.title;body.textContent=touchInput.formatText(reviewedRecordText(l.title,l.body));list.append(title,body);}if(!entries.length){const body=document.createElement('p');body.textContent='Zatiaľ nemáš žiadne správy. Hľadaj dátové pagery a palubné počítače.';list.append(body);}$('journal').classList.remove('hidden');if(document.pointerLockElement)document.exitPointerLock();}
function closeJournal(resumeGame=true){$('journal').classList.add('hidden');if(resumeGame&&state==='reading'){state='playing';keys={};game.className='playing';lock();}}

// The SERVICE conduits embed in solid native panels and stop at every opening.
// Their original colours/heights remain; no loose ends cross the access route.
function decorateServiceWallPipes(arr){
 const B=G.box,start=57.2,end=65.2;
 for(const [wallX,faceX]of [[25,25.99],[29,29.01]]){
  let spanStart=null;
  const emit=to=>{
   if(spanStart===null)return;
   const length=to-spanStart;
   B(arr,faceX,2.65,(spanStart+to)/2,.15,.15,length,'#7b807b');
   B(arr,faceX,2.85,(spanStart+to)/2,.13,.13,length,'#486576');
   spanStart=null;
  };
  for(let z=Math.floor(start);z<Math.ceil(end);z++){
   const a=Math.max(start,z),b=Math.min(end,z+1),solid=['1','2','3'].includes(map[z][wallX]);
   if(solid){if(spanStart===null)spanStart=a;}
   else emit(a);
   if(b===end)emit(b);
  }
 }
}
