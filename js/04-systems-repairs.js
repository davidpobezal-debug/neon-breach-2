/* Ship systems and repair points: relay, cooling, isolation, drive, EMP. */
'use strict';
const repairRooms=[{bounds:[39,49,50,60],name:'DIELŇA',color:'#d5a467'},{bounds:[39,29,55,46],name:'HYDROPONIKA',color:'#6bbd89'}];
let shipSystems={parts:false,relay:false,cooling:false,isolated:false,drive:false,emp:false},empCooldown=0,empPulse=0,partMesh,repairMesh,driveComputerMesh,systemGlowMesh;
const repairPoints=[{id:'relay',x:41.35,y:56.4,room:1},{id:'cooling',x:hydroConsole.x,y:hydroConsole.z,room:2,rotation:hydroConsole.a},{id:'isolated',x:6.6,y:36.5,room:2,rotation:Math.PI/2},{id:'drive',x:22.5,y:19.5,room:3,rotation:-Math.PI/2}];
function buildSystemRooms(){
 shipSystems={parts:false,relay:false,cooling:false,isolated:false,drive:false,emp:false};empCooldown=empPulse=0;
 for(const s of repairRooms){const [x0,z0,x1,z1]=s.bounds;for(let z=z0+1;z<z1;z++)for(let x=x0+1;x<x1;x++)map[z][x]='0';}
 for(const z of [53,54])for(let x=35;x<=39;x++)map[z][x]='0';
 for(const z of [43,44])for(let x=38;x<=39;x++)map[z][x]='0';
 
 
 for(let z=31;z<44;z++)map[z][55]='5';
 // The north wall has pressure windows, but the coolant tanks retain a solid mounting bay.
 for(let x=44;x<55;x++)map[29][x]=x>=50&&x<=52?'1':'5';
 for(const z of [38,39]){map[z][38]='0';map[z][39]='9';}
 for(const z of [58,59]){map[z][37]='9';map[z][38]=map[z][39]='0';}sideDoors.push({x:37.5,y:59,axis:'x',cells:[[37,58],[37,59]],open:0,active:false,type:'relay'});
 sideDoors.push({x:39.5,y:39,axis:'x',cells:[[39,38],[39,39]],open:0,active:false,type:'hydro'});
 pickups.push({kind:'parts',x:47,y:54,permanent:true});
}
function decorateSystemRooms(arr){const B=G.box;
 for(const z of [52,54,56,58]){B(arr,44.5,3.35,z,4.3,.30,.40,'#405761');B(arr,44.5,3.19,z,4,.025,.28,'#806f59');lights.push({x:44.5,y:2.8,z,r:7,c:'#bf9c70'});}
 // Two short connecting corridors retain visible floor and ceiling.
 // Hydro entry has a clear overhead opening; the standalone strip was removed.
 // Armory shortcut: keep its lintel, remove only its standalone amber strip.
 for(const [x,z,w]of [[37.5,54,5]]){B(arr,x,3.3,z,w*.7,.045,.12,'#d7af71',3);}
 for(const [x,z]of [[41.5,51.5],[45.5,51.5]]){B(arr,x,.6,z,2,1.2,.95,'#3a4246');B(arr,x,1.24,z,2.1,.08,1.1,'#8c8170');for(let i=0;i<3;i++)B(arr,x-.6+i*.45,1.36,z,.25,.16,.35,'#6b8590');}
 // Housings intersect the east wall; no space remains behind standalone posts.
 for(const z of [52,53.4,54.8,56.2,57.6,59]){B(arr,50.01,1.7,z,.12,2.8,.5,'#344b55');B(arr,49.943,1.7,z,.024,1.9,.20,'#bd8d58',3);}
 // Cyan lamps share the exact emitting face of the orange members, so walking
 // sideways cannot slide one depth plane against the other. Rails are wall-mounted.
 for(const [z,a,b]of [[50.5,50.06,52.25],[54.1,53.15,55.05],[58.3,57.35,59.25]]){
  B(arr,50.01,2.8,(a+b)/2,.12,.13,b-a,'#344b55');
  B(arr,49.943,2.8,z,.024,.085,.72,'#46e6d5',3);
 }
 B(arr,43.5,2.98,50.10,2.5,.52,.12,'#213844');centeredLabel(arr,'DIELNA',43.5,3.15,50.18,.071,'#d7bb83');
 decorateHydro(arr);
 // A shortcut opens beside the security booth after relay repair.
 B(arr,38.5,.012,59,3,.025,2,'#6b6653',0);
 decorateRepairDetails(arr);
}
function makeSystemsAssets(){const B=G.box;
 const p=[];B(p,0,.25,0,.6,.5,.45,'#596874');B(p,0,.25,.24,.38,.20,.025,'#e3b875',3);for(const x of [-.2,.2])B(p,x,.55,0,.1,.1,.35,'#aac2b6');partMesh=G.mesh(p);
 const t=[];B(t,0,.65,0,.85,1.3,.5,'#385057');B(t,0,1.42,0,1.2,.6,.22,'#697e83');B(t,0,1.42,.13,1,.40,.02,'#1a393e');for(let i=0;i<3;i++)B(t,-.15,1.3+i*.11,.15,.5,.03,.02,'#cf9e69',3);for(const x of [-.32,.32]){B(t,x,.12,.26,.08,.12,.07,'#99a7a5');B(t,x,1.13,.24,.04,.08,.08,'#abb8b3');}B(t,0,1.1,.29,.82,.07,.38,'#60797b');for(let x=-.3;x<.35;x+=.1)for(let z=.22;z<.48;z+=.08)B(t,x,1.145,z,.065,.018,.045,'#1c333d');for(let y=.3;y<.9;y+=.13)B(t,0,y,.26,.52,.035,.015,'#182e39');B(t,.32,1.44,.155,.09,.24,.025,'#d2c18e',3);repairMesh=G.mesh(t);driveComputerMesh=makeBackupDriveAsset();
 const g=[];for(let z=52;z<59;z+=2)B(g,44.5,3.17,z,4,.018,.25,'#bce7d1',3);systemGlowMesh=G.mesh(g);
}
function drawSystems(){
 for(const p of repairPoints){if(p.id==='cooling')continue;const a=p.rotation||0;G.draw(p.id==='drive'?driveComputerMesh:repairMesh,G.transform(p.x,0,p.y,a));if(shipSystems[p.id])G.draw(orbMesh,G.transform(p.x+Math.sin(a)*.2,1.43,p.y+Math.cos(a)*.2,0,.09));}
 drawHydro();
 if(shipSystems.relay)G.draw(systemGlowMesh,G.transform(0,0,0));
 if(empPulse>0){const radius=(1-empPulse/.45)*5+.3;for(let i=0;i<28;i++){const a=i/28*Math.PI*2;G.draw(orbMesh,G.transform(player.x+Math.cos(a)*radius,.12,player.y+Math.sin(a)*radius,0,.09));}}
 if(!shipSystems.cooling&&room===2&&player.x>39)for(let i=0;i<6;i++)G.draw(orbMesh,G.transform(50.8+Math.sin(time+i)*.15,.3+(time+i*.3)%2.1,31.5,0,.045));
}
function repairLabel(p){if(shipSystems[p.id])return '[ E ] '+({relay:'POMOCNÉ NAPÁJANIE',cooling:'CHLADENIE',isolated:'REAKTOR ODPOJENÝ',drive:'ZÁLOŽNÝ POHON'}[p.id])+' / DIAGNOSTIKA';return '[ E ] '+({relay:shipSystems.parts?'VYMENIŤ REGULÁTOR · POMOCNÉ NAPÁJANIE':'CHÝBA REGULÁTOR · BALÍK V DIELNI',isolated:'ODPOJIŤ POŠKODENÝ REAKTOR',cooling:'UTESNIŤ OKRUH · CHLADENIE ZÁLOŽNÉHO POHONU',drive:eva.sealed?'TLAKOVÁ SKÚŠKA A ZÁLOŽNÝ POHON':'DIAGNOSTIKA · VONKAJŠÍ ÚNIK / SKAFANDROVŇA VPRAVO'}[p.id]);}
function useRepair(p){
 if(shipSystems[p.id]){openShipMap();return;}
 if((p.id==='relay'||p.id==='cooling')&&!shipSystems.parts){notice('CHÝBA SERVISNÝ BALÍK · DIELŇA ZA BEZPEČNOSTNOU MIESTNOSŤOU',4);return;}
 if(p.id==='relay'&&!power){notice('NAJPRV ODBLOKUJ MIESTNE RIADENIE · BEZPEČNOSTNÝ POČÍTAČ',4);return;}
 if(p.id==='isolated'&&!cleared[2]){notice('AEGIS DRŽÍ REAKTOR · NAJPRV PORAZ STRÁŽCU NOVA',4);return;}
 if(p.id==='cooling'&&!shipSystems.isolated){notice('NAJPRV ODPOJ POŠKODENÝ REAKTOR · ČERVENÝ PANEL PRI JADRE',4);return;}
 if(p.id==='drive'&&!eva.tested){notice(eva.sealed?'OPRAVA EŠTE NEMÁ TLAKOVÚ SKÚŠKU · VONKU OTVOR VENTIL':'VONKAJŠÍ OKRUH NETESNÍ · SKAFANDROVŇA JE VPRAVO V HANGÁRI',5);return;}
 if(p.id==='drive'&&(!eva.stowed||eva.suit)){notice('NAJPRV DOKONČI NÁVRAT · ODLOŽ SKAFANDER NA STOJAN V SKAFANDROVNI',5);return;}
 if(p.id==='drive'&&(!cleared[3]||!shipSystems.relay||!shipSystems.isolated||!shipSystems.cooling)){notice('ZÁLOŽNÝ POHON: POTREBUJE NAPÁJANIE, CHLADENIE A VYČISTENÝ HANGÁR',4);return;}
 shipSystems[p.id]=true;score+=400;
 if(p.id==='relay'){shipSystems.emp=true;sideDoors.find(d=>d.type==='relay').active=secretFound;notice('POMOCNÉ NAPÁJANIE OBNOVENÉ · EMP / Q · POKRAČUJ DO REAKTORA',5);addLog('DIELŇA / SERVISNÝ POSTUP','Regulátor prepája batériovú sieť s pomocným generátorom. Osvetlenie a servis fungujú, ale hlavný reaktor má prerazený prívod. Poraz strážcu NOVA a odpoj poškodené jadro. Potom v hydroponike utesni oddelený chladiaci okruh záložného pohonu. V balíku zostal chladiaci článok. Servisný EMP dočasne vyradí robotov a ich štíty.');}
 else if(p.id==='isolated'){notice('HLAVNÝ REAKTOR BEZPEČNE ODPOJENÝ · POKRAČUJ DO HYDROPONIKY',5);addLog('REAKTOR / NÚDZOVÉ ODPOJENIE','Prívod a tlakové uzávery poškodeného jadra sú uzavreté. Poškodené jadro a prerazený tlakový oddiel zostanú izolované. Vonkajšia oprava obnoví iba rozvod záložného pohonu. Pomocný generátor napája loď. Záložný pohon má vlastný zdroj, ale jeho chladiaci okruh treba najprv utesniť v hydroponike.');}
 else if(p.id==='cooling'){notice('VNÚTORNÉ CHLADENIE OBNOVENÉ · VONKAJŠIA VETVA NETESNÍ',5);addLog('HYDROPONIKA / CHLADENIE OBNOVENÉ','Nový článok uzavrel poškodený obtok. Hydroponika odovzdáva teplo vonkajším radiátorom; vnútorná časť okruhu je opäť funkčná. Hlavný reaktor zostáva odstavený. Tlaková skúška však odhalila únik na vonkajšej spojke. Po vyčistení hangára vezmi skafander a nástroj vo výstrojovni napravo. Vonkajšiu vetvu musíš utesniť pred spustením pohonu.');}
 else{notice('ZÁLOŽNÝ POHON ONLINE · JEDEN NÚDZOVÝ SKOK NA LYRU',5);addLog('HANGÁR / ZÁLOŽNÝ POHON','Hlavný reaktor odpojený. Pomocná sieť napája riadenie, chladiaci okruh drží tlak. Záložná pohonná jednotka má energiu na jeden núdzový warp. Poškodená časť trupu je izolovaná a nákladové uzávery zaistené. V kokpite obnov spojenie, získaj súradnice a odštartuj domov.');}
 refreshSystemGates();if(cleared[room])missionGoal();else goal('VYČISTI SEKTOR · OPRAVA SYSTÉMU DOKONČENÁ');persistMission();hud();tone(420,.55,'sine',.05,1.8);
}
function refreshSystemGates(){if(cleared[1])gates[1].active=power&&shipSystems.relay;if(cleared[2])gates[2].active=shipSystems.cooling&&shipSystems.isolated;if(cleared[3])gates[3].active=shipSystems.drive;}
function useEMP(){if(state!=='playing'||!shipSystems.emp||empCooldown>0)return;empCooldown=9;empPulse=.45;let count=0;for(const e of [...enemies,...defenses])if(Math.hypot(e.x-player.x,e.y-player.y)<6&&line(player.x,player.y,e.x,e.y)){e.stun=e.kind==='boss'?1:3;e.empDisabled=e.kind==='boss'?1:3;e.charge=e.windup=e.dash=0;e.attack=3;count++;}bolts=bolts.filter(b=>b.friendly||Math.hypot(b.x-player.x,b.y-player.y)>6);if(room===1&&!card&&Math.hypot(player.x-25.5,player.y-55)<3){sideDoors[0].active=true;notice('EMP · SERVISNÝ ZÁMOK UVOĽNENÝ',3);persistMission();}else notice(`EMP IMPULZ · VYRADENÉ JEDNOTKY ${count}`,2);tone(90,.4,'sawtooth',.06,4);}
function updateSystems(dt){empCooldown=Math.max(0,empCooldown-dt);empPulse=Math.max(0,empPulse-dt);for(const e of [...enemies,...defenses])e.empDisabled=Math.max(0,(e.empDisabled||0)-dt);$('empStatus').textContent=shipSystems.emp?(empCooldown>0?`Q / EMP ${Math.ceil(empCooldown)} s`:'Q / EMP PRIPRAVENÝ'):'M / STAV LODE';if(player.x>39)$('location').textContent=player.y>48?'DIELŇA / POMOCNÉ NAPÁJANIE':'HYDROPONIKA / CHLADIACI OKRUH';}
function openShipMap(){if(state!=='playing')return;state='systems';keys={};mouseDown=false;game.className='playing reading';$('shipmap').classList.remove('hidden');const items=[
 ['00 · KRYOKOMORA / SEKTOR 07',intro.active?(intro.gun?'OTVOR VÝSTUPNÚ PRIEPÁŽKU · E':'ZOBER PUŠKU ZO STOJANA PRI VÝCHODE · E'):'VÝBAVA ZÍSKANÁ · KRYOSPÁNOK UKONČENÝ'],
 ['01 · BEZPEČNOSTNÝ POČÍTAČ',power?'HOTOVO · MIESTNE RIADENIE ODOMKNUTÉ':'NÁKLADOVÁ PALUBA / KARTA ALEBO SERVISNÁ CESTA'],
 ['02 · POMOCNÉ NAPÁJANIE',shipSystems.relay?'HOTOVO · EMP PRIPRAVENÝ':shipSystems.parts?'REGULÁTOR → PANEL V DIELNI':'NÁJDI SERVISNÝ BALÍK V DIELNI'],
 ['03 · HLAVNÝ REAKTOR',shipSystems.isolated?'BEZPEČNE ODPOJENÝ · TRUP IZOLOVANÝ':'NEOPRAVITEĽNÝ / PORAZ STRÁŽCU NOVA A ODPOJ JADRO'],
 ['04 · CHLADENIE ZÁLOŽNÉHO POHONU',shipSystems.cooling?(eva.tested?'VNÚTORNÁ AJ VONKAJŠIA VETVA V PORIADKU':'VNÚTORNÝ OKRUH HOTOVÝ · VONKAJŠIA VETVA ČAKÁ'):'HYDROPONIKA / UTESNI OBTOK'],
 ['05 · VÝSTUP NA TRUP / SKAFANDROVŇA',eva.stowed?'HOTOVO · OBLEK ODLOŽENÝ':eva.tested?'NÁVRAT KOMOROU → ODLOŽIŤ OBLEK NA STOJAN':eva.sealed?'OTVOR VENTIL NA LÁVKE · OVER TESNOSŤ':eva.suit?'NÁSTROJ → KOMORA → VENTIL → TRHLINA':'HANGÁR / DVERE VPRAVO · OBLEK A NÁSTROJ'],
 ['06 · ZÁLOŽNÝ POHON',shipSystems.drive?'ONLINE · ENERGIA NA JEDEN SKOK':'VYČISTI HANGÁR / PREPNI PRAVÝ SERVISNÝ PANEL'],
 ['07 · KOKPIT / DOMOV',navReady?(mars.phase==='none'?'KURZ LYRA POTVRDENÝ · MEDZIZASTÁVKA MARS':'KURZ LYRA POTVRDENÝ'):mars.phase==='none'?'OBNOV SPOJENIE / ZÍSKAJ SÚRADNICE':mars.phase==='done'?'PREPOČÍTAJ KURZ NA LYRU':'KURZ BLOKOVANÝ · VYPÁLENÝ STABILIZÁTOR'],
 ...(mars.phase==='none'?[]:[['08 · MARS / SKLAD ARES-3',mars.phase==='done'?'HOTOVO · STABILIZÁTOR NAINŠTALOVANÝ':mars.phase==='returned'?(mars.oldCut?mars.seated?'ZVAR UPEVNENIE NA LÁVKE':'ZASAĎ NOVÝ STABILIZÁTOR NA LÁVKE':'ODREŽ STARÝ STABILIZÁTOR NA LÁVKE'):mars.phase==='surface'?(!mars.junction?'OPRAV ROZVODNÚ SKRINKU SKLADU':!mars.clamp?'ODREŽ UPÍNACIE PÁSY V SKLADE':!mars.part?'ZOBER STABILIZÁTOR':'VRÁŤ SA DO MODULU A VZLETNI'):'NASTÚP DO MODULU NA KONCI LÁVKY · SKAFANDER + ZVÁRAČKA']])];const list=$('systemRows');list.replaceChildren();for(const [name,status]of items){const row=document.createElement('p');row.textContent=name+' — '+status;list.append(row);}if(document.pointerLockElement)document.exitPointerLock();}
function closeShipMap(){if(state!=='systems')return;$('shipmap').classList.add('hidden');state='playing';game.className='playing';keys={};lock();}

// Exact furniture footprints replace coarse, sometimes invisible grid blocks.
function buildFurnitureCollision(){
 const add=(x,z,w,d,h=1.2)=>colliders.push({x,z,w,d,h});
 add(31.5,50.5,3.3,1);for(const x of [33.4,34.3])add(x,50.9,.48,.9,2.6);
 for(let z=60.5;z<63;z++)add(36.5,z,.75,.9,2.4);add(33,58.6,3,.7,.44);
 for(const z of [34.5,41.5]){add(29.8,z,2.7,1.05,.86);add(31.25,z,.12,.66,1.65);}add(28,37.5,2,.75);
 for(const z of crewBedZ)add(36.5,z,1,1.8,.9);add(34.3,43.5,1.3,.9);
 for(const x of [41.5,45.5])add(x,51.5,2.1,1.1);
 for(const p of hydroBeds)add(p.x,p.z,2.32,3.72,1.02);
 for(const x of [50.7,52])add(x,30.8,.55,.6,2.6);
 for(const p of repairPoints){if(p.id==='cooling'){add(p.x,p.y,2.3,2.2,2.15);continue;}const rotated=!!p.rotation;add(p.x,p.y,rotated?.85:1.2,rotated?1.2:.85,1.72);}
 for(const n of shipRecords){const pager=n.source==='PAGER',rotated=!!(n.rotation??(pager?0:n.x>16?-Math.PI/2:0));add(n.x,n.y,pager?.64:rotated?.95:1.1,pager?.44:rotated?1.1:.95,pager?.98:1.55);}
 for(const c of [bridgeLayout.chair,bridgeLayout.console])add(c.x,c.z,c.w,c.d,c.h);for(const x of [9.45,17.55])add(x,5.4,1.2,3.7,1.03);add(auxCabinet.x,auxCabinet.z,auxCabinet.w,auxCabinet.d,auxCabinet.h);add(40.18,56.4,.38,2.0,2.7);
}
function separateEnemies(dt){const units=[...enemies,...defenses];for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++){const a=units[i],b=units[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=.54)continue;const push=Math.min((.54-d)*.5,dt*.5),nx=d>.001?dx/d:1,ny=d>.001?dy/d:0;if(a.kind!=='turret')move(a,-nx*push,-ny*push,a.kind==='boss'?.35:.22);if(b.kind!=='turret')move(b,nx*push,ny*push,b.kind==='boss'?.35:.22);}}
function decorateRepairDetails(arr){const B=G.box;
 // Electrical cabinet and a free-standing control pedestal in separate footprints.
 B(arr,40.12,1.45,56.4,.18,2.5,1.9,'#233e48');
 for(let z=55.7;z<57.2;z+=.28){B(arr,40.24,1.5,z,.035,1.8,.12,'#6b8184');B(arr,40.27,2.25,z,.04,.06,.10,'#deae66',3);}
 const relay=repairPoints[0];
 for(const y of [.5,.72]){hydroTube(arr,[40.28,y,56.4],[relay.x-.40,y,relay.y],.045,'#ac976e',6);hydroTube(arr,[relay.x-.46,y,relay.y],[relay.x-.39,y,relay.y],.072,'#617d83',8);}
 for(const x of [41.5,45.5]){for(const z of [51.12,51.88])for(const dx of [-.86,.86])B(arr,x+dx,.54,z,.08,1,.08,'#96a4a0');for(let dx=-.75;dx<.8;dx+=.5){B(arr,x+dx,.65,52.01,.40,.28,.035,'#263a43');B(arr,x+dx,.69,52.04,.20,.035,.04,'#94a39d');}B(arr,x,1.45,51.11,.45,.08,.08,'#daa965');}
 // A cable tray remains overhead, safely above the walkable route.
 for(const z of [53.2,54.8]){B(arr,37.5,2.9,z,5,.1,.13,'#778f94');for(let x=35.5;x<40;x+=.8)B(arr,x,2.94,z,.06,.20,.3,'#344f58');}
 // Broken power conduits and a sealed bulkhead explain why the reactor stays off.
 for(let z=35.3;z<38;z+=.34){B(arr,3.08,1.55,z,.10,1.75,.08,'#17252d');B(arr,3.16,1.55,z,.08,1.4,.04,'#776950');}
 B(arr,4.5,3.1,36.5,2.6,.3,2.2,'#172630');
 for(const x of [3.5,5.5])B(arr,x,2.55,37.6,.16,.65,.22,'#6e5141');
 for(let i=0;i<5;i++)B(arr,6.05,.018,35.4+i*.45,.38,.025,.17,'#c09951',3);
 // Clear station markings and a grounded backup-drive cabinet beside the hangar.
 for(const p of repairPoints){if(p.id==='cooling')continue;const col=p.id==='isolated'?'#dd7054':p.id==='cooling'?'#82bca6':p.id==='drive'?'#80bde1':'#d8b179';
  for(const dx of (p.id==='drive'?[]:[-.85,.85]))B(arr,p.x+dx,.02,p.y,.045,.025,1.45,col,3);
  const a=p.rotation||0,dx=Math.sin(a),dz=Math.cos(a);B(arr,p.x-dx*.12,1.88,p.y-dz*.12,.06,.55,.06,'#73878c');B(arr,p.x,2.15,p.y,dx?.08:.38,.38,dx?.38:.08,'#1a2d39');for(let j=0;j<3;j++)B(arr,p.x+dz*(-.12+j*.12)+dx*.06,2.15,p.y-dx*(-.12+j*.12)+dz*.06,dx?.025:.045,.22,dx?.045:.025,col,3);B(arr,p.x+dx*.44,.92,p.y+dz*.44,dx?.025:.6,.10,dx?.6:.025,col,3);
 }
 decorateAuxStation(arr);
 // More readable doorway trim, without floor obstacles.
 for(const [x,z,w]of [[37.5,54,5],[39,44,2],[38.5,59,3]]){for(const zz of [z-.92,z+.92])B(arr,x,.015,zz,w,.02,.045,'#9f9c74',3);}
}
// Bilinear patches keep all four corners of a trapezoid. G.quad is deliberately
// restricted to parallelograms; using it here would flatten the tapered bow.
function hullPanel(arr,p,col,k=1){
 const rgb=[1,3,5].map(i=>parseInt(col.slice(i,i+2),16)/255),sub=(a,b)=>a.map((v,i)=>v-b[i]);
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const at=(u,v)=>p[0].map((_,i)=>p[0][i]*(1-u)*(1-v)+p[1][i]*u*(1-v)+p[2][i]*u*v+p[3][i]*(1-u)*v);
 const nx=k<2.5?Math.max(1,Math.ceil(Math.max(Math.hypot(...sub(p[1],p[0])),Math.hypot(...sub(p[2],p[3])))/.8)):1;
 const ny=k<2.5?Math.max(1,Math.ceil(Math.max(Math.hypot(...sub(p[3],p[0])),Math.hypot(...sub(p[2],p[1])))/.8)):1;
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
  const a=at(x/nx,y/ny),b=at((x+1)/nx,y/ny),c=at((x+1)/nx,(y+1)/ny),d=at(x/nx,(y+1)/ny);
  for(const t of [[a,b,c],[a,c,d]]){const n=cross(sub(t[1],t[0]),sub(t[2],t[0])),len=Math.hypot(...n);if(len<1e-8)continue;for(const v of t)arr.push(...v,...n.map(q=>q/len),...rgb,k);}
 }
}
// Closed rectangular section, with a stable local axis even for vertical rails.
function hullStrut(arr,a,b,w,col,d=w){
 const v=b.map((q,i)=>q-a[i]),len=Math.hypot(...v);if(len<1e-6)return;
 const f=v.map(q=>q/len),ref=Math.abs(f[1])<.9?[0,1,0]:[0,0,1];
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 let u=cross(f,ref),ul=Math.hypot(...u);u=u.map(q=>q/ul);const n=cross(f,u);
 const p=(q,s,t)=>q.map((v,i)=>v+u[i]*s*w/2+n[i]*t*d/2);
 const ends=q=>[p(q,-1,-1),p(q,1,-1),p(q,1,1),p(q,-1,1)],aa=ends(a),bb=ends(b);
 for(let i=0;i<4;i++){const j=(i+1)%4;hullPanel(arr,[aa[i],bb[i],bb[j],aa[j]],col);}
 hullPanel(arr,[...aa].reverse(),col);hullPanel(arr,bb,col);
}
// Complete alternate bridge: front-facing panoramic pressure cabin.
// Its coordinates stay on the original straight hangar/flight axis.
function panoramicBridgePanes(){
 return [
  [[11.12,.67,.40],[15.88,.67,.40],[15.57,3.03,1.66],[11.43,3.03,1.66]],
  [[8.03,.67,2.19],[10.94,.67,.48],[11.25,3.03,1.74],[8.52,3.03,3.27]],
  [[16.06,.67,.48],[18.97,.67,2.19],[18.48,3.03,3.27],[15.75,3.03,1.74]],
  [[7.91,.67,2.37],[7.91,.67,8.80],[8.38,3.03,8.80],[8.38,3.03,3.43]],
  [[19.09,.67,8.80],[19.09,.67,2.37],[18.62,3.03,3.43],[18.62,3.03,8.80]]
 ];
}
function decorateBridgeExterior(arr,glass){const B=G.box;
 const panes=panoramicBridgePanes();
 for(const [i,j,edge,next]of [[1,0,1,0],[0,2,1,0],[3,1,0,0],[2,4,1,1]]){
  const a=panes[i],b=panes[j],at=a[edge===0?3:2],bt=b[next===0?3:2];
  hullPanel(arr,[a[edge],b[next],bt,at],'#7b949e');
  hullPanel(arr,[at,bt,bt.map((v,k)=>k===1?3.61:v),at.map((v,k)=>k===1?3.61:v)],'#69828c');
  hullPanel(arr,[a[edge],b[next],b[next].map((v,k)=>k===1?-.30:v),a[edge].map((v,k)=>k===1?-.30:v)],'#546e7d');
 }
 for(const p of panes){
  hullPanel(glass,p,'#78bbc6',5);
  for(let i=0;i<4;i++){
   const j=(i+1)%4;
   hullStrut(arr,p[i],p[j],.145,'#899fa6',.14);
   // One dark pressure gasket sits physically inside its own metal frame.
   hullStrut(arr,p[i].map((v,k)=>v+(k===2?.045:0)),p[j].map((v,k)=>v+(k===2?.045:0)),.065,'#193846',.06);
  }
 }
 // Five faceted shoulders follow the actual five panes, including the side slope.
 for(const p of panes){
  const lower=p.slice(0,2),upper=[p[3],p[2]];
  hullPanel(arr,[lower[0],lower[1],lower[1].map((v,k)=>k===1?-.30:v),lower[0].map((v,k)=>k===1?-.30:v)],'#546e7d');
  hullPanel(arr,[upper[0],upper[1],upper[1].map((v,k)=>k===1?3.61:v),upper[0].map((v,k)=>k===1?3.61:v)],'#69828c');
  for(const edge of [p[0],p[1]]){
   if(edge[2]===8.80)continue;
   B(arr,edge[0],.43,edge[2],.27,.12,.19,'#203d50');
   B(arr,edge[0],.43,edge[2]-.11,.16,.035,.025,'#57d9cc',3);
  }
 }
 // Closed underside; no broad empty platform beyond the glass.
 const outline=[[11.03,.32],[15.97,.32],[19.17,2.20],[19.17,9.94],[7.83,9.94],[7.83,2.20]];
 for(let i=0;i<outline.length;i++){
  const a=outline[i],b=outline[(i+1)%outline.length];
  hullPanel(arr,[[a[0],-.30,a[1]],[b[0],-.30,b[1]],[b[0]*.96+13.5*.04,-.92,b[1]+.12],[a[0]*.96+13.5*.04,-.92,a[1]+.12]],'#354f65');
 }
 B(arr,13.5,-.95,5.8,2.4,.24,8.1,'#294759');
 // Roof follows the bevelled front, with separate pressure covers and fasteners.
 const roof=[[11.37,1.55],[15.63,1.55],[18.73,3.25],[18.73,10.0],[8.27,10.0],[8.27,3.25]];
 for(let i=0;i<roof.length;i++){
  const a=roof[i],b=roof[(i+1)%roof.length];
  hullPanel(arr,[[13.5,3.68,6],[b[0],3.61,b[1]],[a[0],3.61,a[1]],[13.5,3.68,6]],'#637e8c');
 }
 for(const x of [10.0,17.0]){
  hullStrut(arr,[x,3.73,4.0],[x,3.73,9.65],.08,'#223f53',.05);
  for(const z of [4.4,6.8,9.2])B(arr,x,3.742,z,.23,.035,.12,'#97a8a9');
 }
 B(arr,13.5,3.77,8.45,1.9,.18,1.12,'#294759');
 for(let z=8.03;z<8.92;z+=.14)B(arr,13.5,3.873,z,1.61,.018,.046,'#9aaeaf');
 // Rear service bulkhead is part of the room, not a separate corridor.
 decorateBridgeRearSeal(arr);
 B(arr,13.5,3.72,10.09,11.9,.28,.52,'#354f64');
 lights.push({x:13.5,y:5,z:-2,r:17,c:'#92b9c8'},{x:20,y:1,z:5,r:8,c:'#73999f'});
}
function decoratePanoramicBridgeDeck(arr){
 // Exact polygon avoids floating floor corners outside the faceted glass.
 const outline=[[11.08,.44],[15.92,.44],[18.99,2.23],[18.99,10],[8.01,10],[8.01,2.23]];
 for(let i=0;i<outline.length;i++){
  const a=outline[i],b=outline[(i+1)%outline.length];
  hullPanel(arr,[[13.5,0,6],[b[0],0,b[1]],[a[0],0,a[1]],[13.5,0,6]],'#304652',0);
 }
 // One ceiling below the external roof, with no rectangular legacy front slabs.
 const top=[[11.42,1.66],[15.58,1.66],[18.58,3.35],[18.58,10],[8.42,10],[8.42,3.35]];
 for(let i=0;i<top.length;i++){
  const a=top[i],b=top[(i+1)%top.length];
  hullPanel(arr,[[13.5,3.48,6],[a[0],3.48,a[1]],[b[0],3.48,b[1]],[13.5,3.48,6]],'#1b2f3d');
 }
}
function panoramicBridgeBlocked(x,z,r){
 if(z>9.1||x<7.5||x>19.5)return false;
 const y=1.45;
 for(const p of panoramicBridgePanes()){
  const t=(y-p[0][1])/(p[3][1]-p[0][1]);
  const a=p[0].map((v,k)=>v+(p[3][k]-v)*t),b=p[1].map((v,k)=>v+(p[2][k]-v)*t);
  const dx=b[0]-a[0],dz=b[2]-a[2],u=clamp(((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz),0,1);
  if(Math.hypot(x-a[0]-u*dx,z-a[2]-u*dz)<r+.08)return true;
 }
 return false;
}

function decorateAirlockExterior(arr){const B=G.box;
 // The chamber visible beside the EVA exit also needs a closed exterior shell.
 // Keep the aperture z=22.87..25.13 clear from floor to lintel at x=43.5.
 B(arr,40.5,-.34,24.4,7,.62,7,'#354f63');
 B(arr,40.5,3.68,24.4,7,.24,7,'#66808d');
 B(arr,43.8,3.55,24.4,.32,.10,7,'#324d60');
 for(const z of [21.04,27.76]){
  hullPanel(arr,[[37,-.65,z],[44,-.65,z],[43.3,-1.12,z],[37.7,-1.12,z]],'#354e62');
  B(arr,40.5,1.65,z,6.8,3.4,.18,'#4a687b');
  for(const x of [37.3,40.3,43.7])B(arr,x,1.65,z+(z<24?-.10:.10),.11,3.36,.065,'#243e50');
 }
 // The east side is split around the real moving hatch, with an angled hood.
 for(const [z,d]of [[21.94,1.70],[26.43,2.38]]){
  B(arr,44.02,1.50,z,.12,2.92,d,'#537486');
  hullPanel(arr,[[44.08,2.96,z-d/2],[44.08,2.96,z+d/2],[43.72,3.54,z+d/2],[43.72,3.54,z-d/2]],'#82979e');
  B(arr,44.09,.49,z,.04,.07,d-.14,'#223f51');B(arr,44.09,2.73,z,.04,.07,d-.14,'#223f51');
  for(const zz of [z-d/2+.14,z+d/2-.14])for(const y of [.66,2.58])B(arr,44.11,y,zz,.04,.075,.075,'#a9b2a6');
 }
 B(arr,43.85,3.39,24,.42,.40,2.3,'#536f7c');
 // Low, sealed observation viewport beside the hatch: rim, black inset, amber glass.
 B(arr,44.10,1.72,26.4,.06,1.45,1.36,'#253f50');
 B(arr,44.14,1.72,26.4,.024,1.20,1.12,'#102937');
 for(const zz of [25.92,26.88])B(arr,44.163,1.72,zz,.014,1.16,.035,'#79969c');
 B(arr,44.163,2.18,26.4,.016,.024,.93,'#67969d');B(arr,44.163,1.27,26.4,.016,.035,.90,'#758a89');
 // Ventilation at the opposite shoulder, above the deck and away from the opening.
 B(arr,44.11,1.66,21.98,.075,1.32,1.05,'#182f40');
 for(let y=1.12;y<2.3;y+=.16)B(arr,44.16,y,21.98,.04,.055,.87,'#8b9c9f');
 for(const z of [21.4,27.4]){
  B(arr,44.13,2.95,z,.16,.20,.44,'#243d48');B(arr,44.23,2.95,z,.026,.075,.26,'#5fcec7',3);
  // Lower shell and short ribs are authored by decorateExteriorFinish.
 }
}
function decorateHull(arr,glass){const B=G.box;
 decorateBridgeExterior(arr,glass);decorateAirlockExterior(arr);decorateExteriorFinish(arr);
 decorateServiceGallery(arr,glass);
 decorateCargoPowerPod(arr);
 decorateHydroExterior(arr);
}

function furnitureHit(x,y,z){return colliders.some(c=>z<c.h&&Math.abs(x-c.x)<c.w/2&&Math.abs(y-c.z)<c.d/2);}
function shotLine(x,y,tx,ty,z,tz){const steps=Math.max(1,Math.ceil(Math.hypot(tx-x,ty-y)/.1));for(let i=1;i<steps;i++){const t=i/steps,xx=x+(tx-x)*t,yy=y+(ty-y)*t;if(isWall(xx,yy)||furnitureHit(xx,yy,z+(tz-z)*t))return false;}return true;}

// The original assembly remains intact, mirrored onto the opposite cargo flank.
// Its old hull attachment x25.5 becomes x2.5; its centre shifts to z56.5.
function decorateOriginalPowerPod(arr){const B=G.box;
 const N=(a,x,y,z,...rest)=>B(a,x,y,z-6,...rest),NB=(a,p,q,w,c)=>beam(a,[p[0],p[1],p[2]-6],[q[0],q[1],q[2]-6],w,c);
 // Hangar view: a ruptured primary-power nacelle, physically attached to the hull.
 N(arr,29,-1.7,19,7,.65,15,'#283b49');
 for(const z of [13.5,24]){N(arr,31,-.7,z,10,1.4,.65,'#4a6068');N(arr,31,.08,z,10,.12,.22,'#88928a');}
 N(arr,36,-.4,18,4.5,1.6,16,'#172d3c');N(arr,37,2.5,18,3.6,.35,16,'#3a5161');
 // Separate armour plates expose dark machinery in the central impact cavity.
 for(const z of [11.4,13.8,22.2,24.6]){N(arr,33.65,1.25,z,.25,2.4,2.15,'#5b6e77');N(arr,33.48,1.5,z,.10,.07,1.85,'#a2a693');for(const y of [.3,2.1])N(arr,33.46,y,z,.09,.12,.16,'#bec1a6');}
 N(arr,37,1.1,18,1.4,2.5,5.9,'#0e202b');
 for(let z=15.6;z<21;z+=.65){N(arr,35.3,.8,z,1.8,.14,.22,'#74654f');N(arr,35.6,1.3,z,.13,1.4,.15,'#8e7e68');}
 for(let i=0;i<7;i++){const z=15.6+i*.75;N(arr,34.1+i%2*.42,2.05-i%3*.17,z,.38,.55,.48,'#53636b');N(arr,34.2+i%2*.22,-.2+i%3*.14,z,.48,.38,.5,'#6f7774');}
 for(const z of [16,19.4]){NB(arr,[33.6,2.6,z],[35.4,.8,z+.9],.16,'#9b8f73');NB(arr,[34.2,.1,z],[35.8,1.5,z+.8],.11,'#775640');}
 for(const z of [12,24]){N(arr,33.3,2.7,z,.18,.18,.5,'#e66c45',3);lights.push({x:32,y:2,z:z-6,r:7,c:'#d57c4e'});}
 N(arr,33.44,2.12,14,.03,.38,1.35,'#382e2b');
 for(const z of [11.4,13.8,22.2,24.6]){for(let y=.65;y<1.8;y+=.16)N(arr,33.46,y,z,.04,.045,1.25,'#344955');N(arr,33.45,2.1,z,.035,.13,.8,'#aa9571');for(const dz of [-.85,.85])for(const y of [.35,2.15])N(arr,33.4,y,z+dz,.08,.10,.10,'#8b9998');}
 for(const z of [16.2,18.1,20]){N(arr,36.15,1.2,z,.35,1.35,.65,'#3d4e54');for(let y=.65;y<1.8;y+=.18)N(arr,35.94,y,z,.08,.07,.55,'#927e66');N(arr,35.86,.68,z,.08,.08,.30,'#b26e40',3);}
 for(let k=0;k<5;k++)NB(arr,[34.3,2.3,15.1+k*.23],[35.6,.5+k*.17,16.2+k*.23],.045,k%2?'#5d7377':'#998a6b');
 for(const z of [15.2,20.9]){N(arr,33.8,1.2,z,.26,1.7,.4,'#1f2d34');N(arr,33.61,1.2,z,.12,1.2,.13,'#66554b');}
 

}
function decorateCargoPowerPod(arr){
 const a=[],first=lights.length;decorateOriginalPowerPod(a);
 for(let i=0;i<a.length;i+=10){a[i]=28-a[i];a[i+2]+=43.5;a[i+3]=-a[i+3];}
 // Reflection reverses handedness: restore triangle winding as well as normals.
 for(let i=0;i<a.length;i+=30)for(let k=0;k<10;k++){const tmp=a[i+10+k];a[i+10+k]=a[i+20+k];a[i+20+k]=tmp;}
 for(const v of a)arr.push(v);
 for(let i=first;i<lights.length;i++){lights[i].x=28-lights[i].x;lights[i].z+=43.5;}
}

// Authored finish shared by the original-position panoramic editions.
// These decorative spaces never carve cells in the playable map.
const auxCabinet={x:24.67,z:21.7,w:.60,d:1.20,h:2.70};
function auxCableRoute(){return [[24.62,.52,21.04],[24.62,.095,21.04],[24.62,.095,19.5],[22.85,.095,19.5],[22.85,.52,19.5],[22.80,.52,19.5]];}
function decorateAuxStation(arr){const B=G.box,c=auxCabinet;
 B(arr,c.x,1.35,c.z,c.w,c.h,c.d,'#253e4f');
 B(arr,24.345,1.35,c.z,.045,2.44,1.04,'#132c3a');
 for(let z=21.28;z<=22.13;z+=.17)B(arr,24.31,1.35,z,.045,2.12,.061,'#82959b');
 for(const z of [21.14,22.26]){B(arr,24.30,1.35,z,.09,2.63,.065,'#506d7c');for(const y of [.17,2.54])B(arr,24.245,y,z,.025,.065,.065,'#b1b9a9');}
 B(arr,24.60,.06,c.z,.76,.12,1.28,'#1c3544');
 B(arr,24.57,2.96,c.z,.80,.48,1.36,'#192f3e');
 B(arr,24.15,2.96,c.z,.035,.35,1.20,'#0c2330');
 centeredLabel(arr,'AUX',24.12,3.065,c.z,.078,'#e6ae69',-Math.PI/2);
 // The side socket is embedded in the cabinet; the final plug enters the CRT's rear.
 B(arr,24.62,.52,21.085,.25,.26,.13,'#3b5b68');B(arr,24.62,.52,21.009,.14,.12,.035,'#71c6bf',3);
 B(arr,22.83,.52,19.5,.10,.28,.26,'#3b5b68');
 const path=auxCableRoute();for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i];hullStrut(arr,a,b,.155,'#314b5b',.15);
  if(a[1]===b[1]){hullStrut(arr,[a[0],.179,a[2]],[b[0],.179,b[2]],.022,'#72bfc7',.018);}
  else{B(arr,a[0]-.082,(a[1]+b[1])/2,a[2],.018,Math.abs(a[1]-b[1]),.034,'#70bcbf',3);}
 }
 for(const p of path.slice(1,-1))B(arr,p[0],p[1],p[2],.19,.19,.19,'#587683');
 // One blue station marker lies in front of the original, unmoved computer.
 B(arr,21.63,.018,19.5,.045,.025,1.60,'#80bde1',3);
 for(const z of [18.70,20.30])B(arr,21.69,.018,z,.15,.025,.045,'#80bde1',3);
 lights.push({x:23.1,y:1.45,z:20.9,r:3.1,c:'#6a9dba'});
}
function makeBackupDriveAsset(){const B=G.box,a=[];
 B(a,0,.07,0,.95,.14,.69,'#203641');
 B(a,0,.60,-.025,.91,1.02,.59,'#3c5560');
 B(a,0,1.13,.045,1.12,.12,.82,'#748c91');
 B(a,0,1.45,-.14,1.18,.56,.31,'#5d7580');
 B(a,0,1.45,.034,1.03,.43,.045,'#7d9398');
 B(a,0,1.45,.063,.90,.32,.022,'#0c2530');
 for(let i=0;i<3;i++)B(a,-.15,1.36+i*.085,.080,.47-i*.045,.022,.014,'#dba466',3);
 B(a,.34,1.45,.080,.105,.24,.014,'#ddc28a',3);
 for(const x of [-.49,.49])for(const y of [1.25,1.65])B(a,x,y,.063,.036,.036,.012,'#b6bbaa');
 for(let row=0;row<3;row++){const y=1.217-row*.029,z=.16+row*.105;
  B(a,-.08,y-.032,z,.85,.064,.12,'#526e78');for(let col=0;col<8;col++)B(a,-.445+col*.105,y+.008,z,.073,.020,.065,'#1b343f');}
 B(a,.455,1.17,.30,.11,.12,.31,'#4b6570');B(a,.455,1.238,.30,.065,.02,.10,'#e4ab63',3);
 B(a,0,.72,.294,.73,.50,.026,'#172f3c');
 for(let y=.53;y<.94;y+=.081)B(a,0,y,.318,.62,.035,.023,'#587583');
 B(a,-.28,.995,.324,.27,.048,.026,'#76c6cc',3);
 for(const x of [-.36,.36])for(const y of [.20,1.04])B(a,x,y,.294,.045,.045,.027,'#adb4a6');
 B(a,0,.52,-.314,.24,.26,.038,'#203b49');
 return G.mesh(a);
}
function cockpitAmberRoute(){return [[8.36,9.80],[8.36,7.43],[10.25,7.43],[10.25,2.22]];}
function decorateCockpitAmber(arr){const B=G.box;
 for(const side of [-1,1]){const path=cockpitAmberRoute().map(([x,z])=>[side<0?x:27-x,.018,z]);
  for(let i=1;i<path.length;i++){
   hullStrut(arr,path[i-1],path[i],.115,'#162d38',.030);
   hullStrut(arr,path[i-1].map((v,k)=>k===1?.039:v),path[i].map((v,k)=>k===1?.039:v),.044,'#df9a57',.012);
   // The luminous face stays continuous at turns; restrained emission matches the old lane.
   const a=path[i-1],b=path[i],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz),nx=-dz/len*.022,nz=dx/len*.022;
   hullPanel(arr,[[a[0]+nx,.047,a[2]+nz],[b[0]+nx,.047,b[2]+nz],[b[0]-nx,.047,b[2]-nz],[a[0]-nx,.047,a[2]-nz]],'#df9a57',3);
  }
  for(const [x,y,z]of path)B(arr,x,.045,z,.046,.015,.046,'#df9a57',3);
 }
}
function decorateBridgeRearSeal(arr){const B=G.box;
 // A closed, sloping side return joins the pane at z8.8 to the original hangar.
 // Its interior face follows the glazing rake; square legacy walls left sky gaps.
 for(const side of [-1,1]){
  const mirror=x=>side<0?x:27-x;
  const front=8.755,back=10.18;
  const p=(x,y,z)=>[mirror(x),y,z];
  const crossSection=[[7.76,-.12],[8.025,-.12],[8.48,3.61],[7.76,3.61]];
  for(let i=0;i<4;i++){
   const aa=crossSection[i],bb=crossSection[(i+1)%4];
   hullPanel(arr,[p(...aa,front),p(...bb,front),p(...bb,back),p(...aa,back)],i===1?'#425e73':'#334e62');
  }
  hullPanel(arr,crossSection.map(([x,y])=>p(x,y,front)),'#425e73');
  hullPanel(arr,crossSection.map(([x,y])=>p(x,y,back)).reverse(),'#334e62');
  // Thin diagonal pressure rail lies against the return, without floating caps.
  hullStrut(arr,p(8.03,.04,8.76),p(8.414,3.035,8.76),.052,'#8398a0',.045);
  for(const y of [.31,2.99]){
   const x=8.025+(y+.12)/3.73*.455;
   B(arr,mirror(x+.014),y,8.91,.026,.05,.065,'#a4b1aa');
  }
  // Original wall's outer square cells join this collar behind the new cabin.
  B(arr,mirror(8.08),1.78,10.02,.68,3.56,.34,'#3e5a6c');
  B(arr,mirror(7.42),1.76,10.13,.28,3.52,.54,'#3e5a6c');
  hullPanel(arr,[p(7.00,2.92,10.02),p(8.50,2.92,10.02),p(8.50,3.63,10.02),p(7.00,3.63,10.02)],'#3e5a6c');
  B(arr,mirror(7.88),3.47,10.18,1.78,.32,.80,'#334e62');
 }
 B(arr,13.5,3.48,10.16,10.86,.16,.64,'#233b4c');
}
// Large pressure windows use the same two-layer tint, gaskets and marks as hydro.
function sidePressurePane(arr,glass,x,z0,z1,inside=-1,lightEdges=[],framed=true,railStart=z0-.045,postWallDepth=.34){const B=G.box,d=z1-z0,mid=(z0+z1)/2;
 for(const xx of [x-.018,x+.018])G.quad(glass,[xx,.80,z0+.08],[xx,.80,z1-.08],[xx,2.95,z1-.08],[xx,2.95,z0+.08],[inside,0,0],'#91b3c5',5);
 if(framed){
  const railEnd=z1+.045;
  for(const y of [.73,3.02])B(arr,x,y,(railStart+railEnd)/2,.34,.14,railEnd-railStart,'#617d8b');
  for(const z of [z0,z1])pressureFramePost(arr,x,z,inside,lightEdges.includes(z)?'#617d8b':'#3a5669',.13,postWallDepth);
 }
 for(const y of [.823,2.923])B(arr,x+inside*.022,y,mid,.018,.025,d-.17,'#112d3a');
 // Rubber overlaps the metal by 1mm, closing the former hairline gap. Its
 // vertical ends meet the horizontal seals without coplanar corner overlaps.
 for(const z of [z0+.083,z1-.083])B(arr,x+inside*.022,1.873,z,.018,2.075,.038,'#112d3a');
 for(const z of [z0+.25,z1-.25]){B(arr,x+inside*.031,.98,z,.012,.020,.14,'#72929e');B(arr,x+inside*.031,1.045,z+.055,.012,.11,.020,'#72929e');}
 G.quad(arr,[x+inside*.032,2.72,z0+.39],[x+inside*.032,2.72,z0+.45],[x+inside*.032,2.47,Math.min(z1-.34,z0+1.24)],[x+inside*.032,2.47,Math.min(z1-.40,z0+1.18)],[inside,0,0],'#294b57',3);
}
function pressureFramePost(arr,x,z,inside,color,depth=.13,wallDepth=.34){const B=G.box;
 // Stop at the rail edges (.80..2.95): intersecting front faces of posts
 // and rails also caused flicker at the four corners of each window.
 B(arr,x+inside*(.34-wallDepth)/2,1.875,z,wallDepth,2.15,depth,color);
 B(arr,x+inside*.183,1.875,z,.038,2.30,depth-.073,'#8d9ca0');
 for(const y of [.88,2.84])B(arr,x+inside*.21,y,z,.027,.055,.064,'#bdc3af');
}
function sidePressureWindow(arr,glass,x,ranges,inside=-1){const B=G.box,start=ranges[0][0],end=ranges.at(-1)[1];
 // Panes keep their original tint, gaskets and marks. Shared rails/posts are
 // authored ONCE: overlapping coplanar boxes caused unstable grey surfaces.
 for(const [a,b]of ranges)sidePressurePane(arr,glass,x,a,b,inside,[],false);
 for(const y of [.73,3.02])B(arr,x,y,(start+end)/2,.34,.14,end-start+.09,'#617d8b');
 for(const z of [start,end])pressureFramePost(arr,x,z,inside,'#617d8b');
 for(let i=1;i<ranges.length;i++){
  const a=ranges[i-1][1],b=ranges[i][0];
  pressureFramePost(arr,x,(a+b)/2,inside,'#3a5669',.13+b-a);
 }
}
function pressureWindowReturns(arr,x,start,end,inside=-1){const B=G.box;
 for(const [edge,dir]of [[start,-1],[end,1]]){
  B(arr,x+inside*.175,1.75,edge+dir*.09,.61,3.5,.05,'#354653');
  // Recess the rear seal from both side faces of the metal post.
  // Equal .13 depths drew competing surfaces along each outer vertical edge.
  B(arr,x-inside*.16,1.75,edge,.03,3.5,.10,'#243846');
 }
}
function hangarWindowEnd(){return 16.90;}
function hangarPressureRanges(){const a=11.06,b=hangarWindowEnd(),mid=(a+b)/2;return [[a,mid-.03],[mid+.03,b]];}
function decorateHangarPressureWindow(arr,glass){const B=G.box,end=hangarWindowEnd(),start=11.06;
 sidePressureWindow(arr,glass,25.43,hangarPressureRanges());
 pressureWindowReturns(arr,25.43,start,end);
 // Wall starts after the complete outer post rather than halfway through it.
 const wallStart=end+.065;
 for(let z=Math.floor(wallStart);z<21;z++){
  const a=Math.max(z,wallStart),b=z+1.005;if(b<=a)continue;
  const mid=(a+b)/2,d=b-a;
  B(arr,25.50,1.75,mid,.99,3.5,d,'#354653');
  B(arr,24.99,1.7,mid,.08,2.55,Math.min(d,Math.max(.08,d-.15)),'#2b3f4c');
  B(arr,24.99,.65,mid,.10,.055,d,'#132631');
  B(arr,24.99,2.48,mid,.10,.06,d,'#152936');
 }
}

function decorateCargoPressureWindow(arr,glass){const B=G.box;
 // The relocated machinery stays untouched; its observation glazing matches hydro.
 sidePressureWindow(arr,glass,2.57,[[54.06,56.98],[57.04,59.94]],1);
 pressureWindowReturns(arr,2.57,54.06,59.94,1);
}
function decorateSecurityPressureWindow(arr,glass){const B=G.box;
 // Existing observation aperture and cyan sill stay; only the pressure frame is new.
 sidePressureWindow(arr,glass,25.43,[[51.06,52.94]]);
 pressureWindowReturns(arr,25.43,51.06,52.94);
}
function serviceGalleryLayout(){return {x0:26.18,x1:43.94,z0:17.30,z1:19.89};}
function decorateServiceGallery(arr,glass){const B=G.box,r=serviceGalleryLayout(),cx=(r.x0+r.x1)/2,cz=(r.z0+r.z1)/2,w=r.x1-r.x0,d=r.z1-r.z0;
 // Set dressing only: all underlying cells remain solid, with no access door.
 B(arr,cx,-.14,cz,w,.28,d,'#344f62');B(arr,cx,3.46,cz,w,.24,d,'#567280');
 // Side rails butt against the front rail, without coplanar corner overlaps.
 for(const x of [r.x0,r.x1]){
  B(arr,x,.33,cz,.18,.66,d,'#405e73');B(arr,x,3.16,cz,.18,.36,d,'#47687c');
  // Keep perpendicular upright faces clear of one another at the corner.
  // A recessed backing seals the tiny join without covering either frame.
  const inside=x===r.x0?-1:1;
  B(arr,x-inside*.1025,1.75,r.z0+.1125,.085,3.5,.165,'#405e73');
  sidePressurePane(arr,glass,x,r.z0+.12,r.z1-.15,inside,[],true,r.z0+.17,.25);
 }
 B(arr,cx,.33,r.z0,w,.66,.18,'#405e73');B(arr,cx,3.16,r.z0,w,.36,.18,'#47687c');
 // Rotate the proven side-pane author to put three matching windows on the bow-facing wall.
 {
  const opaque=[],pane=[];sidePressureWindow(opaque,pane,0,[[26.37,28.77],[28.83,31.23],[31.29,33.69],[33.75,36.15],[36.21,38.61],[38.67,41.07],[41.13,43.75]],-1);
  for(const src of [opaque,pane])for(let i=0;i<src.length;i+=10){const x=src[i],z=src[i+2],nx=src[i+3],nz=src[i+5];src[i]=z;src[i+2]=r.z0-x;src[i+3]=nz;src[i+5]=-nx;}
  // Rotation (x,z)->(z,-x) preserves winding and maps the outer side to north.
  for(const v of opaque)arr.push(v);for(const v of pane)glass.push(v);
 }
 // A sealed service neck joins the existing airlock; it stays entirely outside both rooms.
 B(arr,40.39,-.14,20.51,7.1,.28,1.30,'#344f62');B(arr,40.39,3.46,20.51,7.1,.24,1.30,'#567280');
 B(arr,36.84,1.65,20.51,.18,3.30,1.30,'#3b586c');
 sidePressurePane(arr,glass,43.94,19.95,21.03,1);
 B(arr,40.39,-.67,20.51,6.84,.78,1.30,'#294559');
 for(const x of [28.0,31.45,34.85,38.3,41.8]){
  B(arr,x,.54,19.40,1.45,1.08,.67,'#2c4654');B(arr,x,1.12,19.40,1.57,.08,.76,'#70848a');
  B(arr,x,1.48,19.66,1.10,.58,.11,'#435e6d');B(arr,x,1.48,19.592,.93,.42,.025,'#102a36');
  for(let y=1.35;y<1.64;y+=.09)B(arr,x-.12,y,19.570,.50,.018,.012,'#4c9191',3);
  B(arr,x,.61,19.05,1.16,.61,.04,'#193443');for(let y=.42;y<.85;y+=.11)B(arr,x,y,19.017,.89,.028,.014,'#607882');
  B(arr,x,3.28,18.40,1.32,.075,.36,'#233c4b');B(arr,x,3.232,18.40,1.15,.020,.25,'#71b9ba',3);
 }
 // Closed tapered belly, not an unexplained broad platform or loose triangular bars.
 for(const [a,b]of [[[r.x0,r.z0],[r.x1,r.z0]],[[r.x1,r.z0],[r.x1,r.z1]],[[r.x0,r.z1],[r.x0,r.z0]]])hullPanel(arr,[[a[0],-.27,a[1]],[b[0],-.27,b[1]],[b[0]+(cx-b[0])*.08,-1.12,b[1]+(cz-b[1])*.08],[a[0]+(cx-a[0])*.08,-1.12,a[1]+(cz-a[1])*.08]],'#2b475b');
 B(arr,cx,-1.13,cz,w*.92,.16,d*.92,'#213c50');
 for(const x of [26.37,28.80,31.26,33.72,36.18,38.64,41.10,43.75]){
  hullStrut(arr,[x,-.27,r.z0-.10],[x,-1.13,r.z0+.22],.15,'#597987',.20);
  B(arr,x,.41,r.z0-.12,.21,.20,.045,'#243f50');B(arr,x,.41,r.z0-.150,.075,.090,.012,'#dca66a',3);
  B(arr,x,3.21,r.z0-.13,.18,.25,.065,'#243f50');B(arr,x,3.21,r.z0-.17,.07,.105,.020,'#dca66a',3);
 }
 lights.push({x:cx,y:2.8,z:19.5,r:5,c:'#7499a8'});
}
function decorateExteriorFinish(arr){const B=G.box;
 // Cladding sits outside the suit-room's original solid north wall.
 for(const x of [27.4,30.05,32.70,35.17]){
  B(arr,x,1.73,19.975,2.28,2.80,.09,'#3b586c');B(arr,x,1.73,19.920,2.02,2.49,.025,'#314f63');
  for(const dx of [-.87,.87])for(const y of [.67,2.77])B(arr,x+dx,y,19.891,.065,.065,.025,'#99aba7');
  B(arr,x,3.21,19.94,.10,.33,.13,'#526e7a');B(arr,x,3.21,19.86,.07,.13,.035,'#cc9459',3);
 }
 for(const x of [26.10,28.72,31.37,34.02,36.32])B(arr,x,1.72,19.925,.11,3.43,.13,'#627d88');
 B(arr,31.30,-.39,21.65,10.76,.80,3.36,'#294559');
 // The actual pressure chamber has short attached ribs, flush armour and bolts.
 for(const z of [21.04,27.76])for(const x of [38.68,41.82]){
  const side=z<24?-1:1;B(arr,x,1.72,z+side*.115,2.68,2.70,.055,'#37566c');
  for(const dx of [-1.16,1.16])for(const y of [.58,2.86])B(arr,x+dx,y,z+side*.16,.055,.055,.025,'#a4b1a9');
  B(arr,x,3.17,z+side*.14,.24,.22,.10,'#223e50');B(arr,x,3.17,z+side*.20,.075,.09,.024,'#d6a469',3);
 }
 B(arr,40.5,-.95,24.4,6.8,.34,6.70,'#29485e');
 for(const z of [21.42,27.37])for(const x of [38.0,41.1,43.45])hullStrut(arr,[x,-.31,z],[x,-1.00,z+(z<24?.25:-.25)],.17,'#668490',.23);
 // A continuous belly connects the deck to the hull instead of hanging empty boxes.
 B(arr,54,-.80,25.5,20,1.06,7.10,'#294458');
 for(const z of [21.88,29.12]){
  B(arr,54,-.59,z,19.95,.23,.14,'#6c8690');
  for(let x=45.2;x<64;x+=2.35){B(arr,x,-.86,z,2.02,.63,.10,'#213c50');for(const dx of [-.86,.86])B(arr,x+dx,-.62,z+(z<25?-.065:.065),.05,.05,.025,'#91a7aa');}
 }
}
