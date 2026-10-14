/* Cryo bay introduction adjoining the arena. */
'use strict';
// Compact introduction adjoining the original arena, using the same map and movement.
const cryoLayout={bounds:[9,86,18,97],spawn:{x:13,z:94},gun:{x:16.7,z:89.5},terminal:{x:17.05,z:93.1},pods:[{x:11.2,z:90.0},{x:11.2,z:92.65}]};
let intro={active:false,gun:true},cryoGunMesh,cryoGlassMesh;
function buildCryo(){
 intro={active:false,gun:true};
 for(let z=87;z<97;z++)for(let x=10;x<18;x++)map[z][x]='0';
 const door={x:13,y:86.5,axis:'z',cells:[[12,86],[13,86]],open:0,active:false,type:'cryo'};
 sideDoors.push(door);for(const [x,z]of door.cells)map[z][x]='9';
 const add=(x,z,w,d,h)=>colliders.push({x,z,w,d,h});
 for(const p of cryoLayout.pods)add(p.x,p.z,2.40,1.85,1.4);
 // The open bed sits behind the waking position, leaving its full forward route clear.
 add(13,95.6,1.85,2.30,1.4);
 add(17.15,89.5,1.5,2.25,2.48);add(17.30,93.1,1.20,1.40,2.0);
}
function decorateCryo(arr){const B=G.box,glass=[];
 // Ribs and floor skirting are attached to the room's actual walls and ceiling.
 for(const x of [10.07,17.93]){B(arr,x,.16,92,.14,.32,10,'#223944');B(arr,x,3.24,92,.20,.26,10,'#344e5b');}
 for(const z of [88,91.1,94.2]){B(arr,14,3.37,z,8,.25,.16,'#2b4351');B(arr,14,3.47,z,8,.035,.34,'#586d75');}
 for(const z of [89,92.3]){B(arr,13.5,3.31,z,2.35,.19,.43,'#506976');B(arr,13.5,3.204,z,2.08,.025,.29,'#98d5cb',3);lights.push({x:13.5,y:2.85,z,r:6,c:'#83aaa9'});}
 for(const z of [88,90,92,94])B(arr,14.7,.018,z,.08,.03,.55,'#648e85',3);
 B(arr,15.6,.016,88.1,1.1,.025,.08,'#a88753',3);
 for(const p of cryoLayout.pods){const {x,z}=p;
  // Low horizontal beds: pillow at the wall, feet and readout towards the aisle.
  for(const dx of [-.88,.88])for(const dz of [-.65,.65])B(arr,x+dx,.14,z+dz,.22,.28,.23,'#607882');
  B(arr,x,.46,z,2.30,.66,1.75,'#344d5b');B(arr,x,.82,z,2.34,.10,1.80,'#899b97');
  B(arr,x,.89,z,2.08,.09,1.40,'#1c3742');B(arr,x,.96,z,1.96,.08,1.25,'#76928b');B(arr,x-.76,1.04,z,.40,.14,1.02,'#b4c3ae');
  for(const dz of [-.80,.80])for(let i=0;i<8;i++){const xx=10.18+i*.26+.13,top=1.35-(xx-10.17)*.10;B(arr,xx,(top+.67)/2,z+dz,.264,top-.67,.10,'#4e6b77');}
  for(const dz of [-.71,.71])hydroTube(arr,[10.17,1.35,z+dz],[12.22,1.145,z+dz],.045,'#a2b5ae',6);
  for(const [xx,yy]of [[10.17,1.35],[12.22,1.145]])hydroTube(arr,[xx,yy,z-.71],[xx,yy,z+.71],.045,'#8ca3a6',6);
  G.quad(glass,[10.19,1.351,z-.66],[12.20,1.15,z-.66],[12.20,1.15,z+.66],[10.19,1.351,z+.66],[.10,.995,0],'#a8c8c9',5);
  for(const dz of [-.62,.62])G.quad(arr,[10.22,1.354,z+dz-.045],[12.17,1.159,z+dz-.045],[12.17,1.159,z+dz+.045],[10.22,1.354,z+dz+.045],[.10,.995,0],'#77999b');
  for(let i=0;i<8;i++){const xx=10.27+i*.24,zz=z+(i%2?.51:-.51);B(arr,xx,1.358-(xx-10.22)*.10,zz,.14,.018,.07+(i%3)*.025,'#6a9295');}
  B(arr,12.28,.88,z,.16,.55,1.48,'#607985');B(arr,12.371,.94,z,.018,.30,.60,'#102c39');
  for(let i=0;i<3;i++)B(arr,12.386,.865+i*.07,z-.04,.012,.021,.33-i*.07,i===2?'#d9b16f':'#96c2b0',3);
  for(const dz of [-.63,.63])B(arr,12.379,.91,z+dz,.025,.10,.10,'#c1c9b4');
 }
 // Alex's mattress is behind the spawn; its raised canopy is held by two hinge struts.
 for(const x of [12.30,13.70])for(const z of [94.70,96.47])B(arr,x,.15,z,.24,.30,.25,'#617c84');
 B(arr,13,.46,95.6,1.78,.68,2.22,'#3d5563');B(arr,13,.84,95.6,1.92,.10,2.28,'#8da39e');
 B(arr,13,.93,95.6,1.48,.10,1.98,'#708d86');B(arr,13,1.055,96.26,1.25,.18,.44,'#b9c6b0');
 // The rim and side rail have distinct outer planes; coincident faces caused flickering.
 for(const x of [12.10,13.90])B(arr,x,.94,95.6,.06,.25,2.24,'#627f89');
 for(const x of [12.16,13.84]){hydroTube(arr,[x,1.00,96.62],[x,2.38,95.64],.055,'#9aada9',6);hydroTube(arr,[x,.70,96.35],[x,1.95,95.96],.045,'#506e7c',6);}
 for(const [y,z]of [[1.00,96.62],[2.38,95.64]])hydroTube(arr,[12.16,y,z],[13.84,y,z],.055,'#8da5a6',6);
 G.quad(glass,[12.22,1.045,96.59],[13.78,1.045,96.59],[13.78,2.33,95.68],[12.22,2.33,95.68],[0,.578,.816],'#99bdc0',5);
 B(arr,13,.95,94.465,1.32,.31,.04,'#1b3340');label(arr,'ALEX',13.35,1.063,94.425,.05,'#a5c6b4',Math.PI);
 // Low supply pipes remain attached to the wall and enter each bed's head end.
 hydroTube(arr,[10.09,.58,88.5],[10.09,.58,93.6],.06,'#7c9294');
 for(const p of cryoLayout.pods)hydroTube(arr,[10.09,.58,p.z],[10.45,.58,p.z],.06,'#9eada4');
 // Gun cabinet joins the east wall. The rifle has two visible mounting brackets.
 B(arr,17.38,1.24,89.5,1.24,2.48,2.18,'#344c5a');B(arr,16.705,1.30,89.5,.12,2.08,1.86,'#7c8985');B(arr,16.629,1.30,89.5,.026,1.84,1.63,'#122b37');
 for(const z of [88.84,90.16])B(arr,16.595,1.35,z,.16,.10,.10,'#9da69a');
 B(arr,16.60,2.12,89.5,.06,.28,1.50,'#1c3642');label(arr,'PUSKA',16.554,2.225,88.99,.055,'#d2b37c',-Math.PI/2);
 for(const z of [88.59,90.41])for(const y of [.4,2.2])B(arr,16.618,y,z,.032,.07,.07,'#c8c1a5');
 // Compact medical console, attached to a floor cabinet and the east wall.
 B(arr,17.37,.48,93.1,1.04,.96,1.26,'#344d59');B(arr,17.30,1.0,93.1,1.2,.10,1.35,'#87978f');
 B(arr,17.50,1.42,93.1,.35,.75,1.10,'#536f79');B(arr,17.307,1.42,93.1,.05,.60,.91,'#b2bca7');B(arr,17.268,1.42,93.1,.025,.49,.78,'#0d2733');B(arr,17.248,1.42,93.1,.014,.42,.69,'#244b53',3);
 for(let i=0;i<4;i++)B(arr,17.235,1.27+i*.07,93.02,.008,.022,.35-i*.045,i===3?'#d3ac72':'#94b9ae',3);
 for(let row=0;row<3;row++)for(let k=0;k<6;k++)B(arr,16.83+row*.10,1.067,92.83+k*.10,.065,.026,.065,(row+k)%7?'#294653':'#8ca295');
 B(arr,16.83,1.07,93.58,.13,.04,.15,'#d1a264',3);B(arr,17.28,1.81,93.1,.055,.32,1.40,'#29444f');label(arr,'STATUS',17.238,1.92,92.47,.055,'#99b4a7',-Math.PI/2);
 // Door signage faces the waking player. The destination appears over the exit.
 for(const x of [11.85,14.15]){B(arr,x,1.65,86.5,.23,3.3,.48,'#70878c');B(arr,x,1.65,86.759,.055,2.84,.025,'#92c9bd',3);}
 // The entire plate sits in front of the solid jambs, so its first letter cannot hide in the wall.
 B(arr,13,3.17,86.82,2.80,.35,.70,'#667e87');B(arr,13,3.16,87.185,2.65,.30,.10,'#1a3340');label(arr,'SEKTOR 07',12.09,3.267,87.26,.053,'#c2cdb3');
 B(arr,14,3.1,96.98,7.2,.59,.15,'#233d4b');label(arr,'KRYOKOMORA',16.15,3.285,96.881,.094,'#91bbb4',Math.PI);
 const gun=[];
 B(gun,0,0,.08,.20,.27,.69,'#526b79');B(gun,-.025,.16,.08,.16,.07,.52,'#92a7a6');B(gun,0,0,-.47,.13,.15,.45,'#294755');
 B(gun,-.06,0,-.715,.045,.11,.06,'#91eee0',3);B(gun,0,-.18,.19,.13,.30,.14,'#1c3441');B(gun,0,-.15,.02,.15,.13,.20,'#354e5b');
 B(gun,0,.02,.54,.18,.26,.24,'#283e4e');for(let z=-.22;z<.24;z+=.09)B(gun,-.113,.03,z,.035,.13,.035,'#809699');B(gun,-.132,.1,-.03,.015,.055,.15,'#79d8ca',3);
 G.remove(cryoGunMesh);cryoGunMesh=G.mesh(gun);G.remove(cryoGlassMesh);cryoGlassMesh=G.mesh(glass);
}
function drawCryo(){if(!intro.gun)G.draw(cryoGunMesh,G.transform(16.55,1.40,89.5));}
function drawCryoGlass(){G.glass(cryoGlassMesh);}
function cryoTargets(put){if(!intro.gun)put('cryo','gun',cryoLayout.gun.x,cryoLayout.gun.z,1.65);put('cryo','status',cryoLayout.terminal.x,cryoLayout.terminal.z,1.6);}
function cryoLabel(id){return id==='gun'?'[ E ] ZOBRAŤ PULZNÚ PUŠKU · MK.04':'[ E ] KRYOKOMORA · MIESTNA DIAGNOSTIKA';}
function interactCryo(id){
 if(id==='gun'&&!intro.active)return;
 if(id==='gun'&&!intro.gun){intro.gun=true;weapon=0;ammo=weapons[0].cap;magazines[0]=ammo;reload=cooldown=0;goal('PUŠKA PRIPRAVENÁ · OTVOR DVERE DO SEKTORA 07');notice('MK.04 ZÍSKANÁ · ĽAVÉ TLAČIDLO STRIEĽA / R PREBÍJA',4);tone(360,.18,'triangle',.03,1.5);hud();saveCheckpoint();}
 else if(id==='status'){const title='KRYOKOMORA / MIESTNA DIAGNOSTIKA';addLog(title,'Kryobox Alexa Renna: núdzové prebudenie dokončené pomocou záložnej batérie. Hlavné napájanie je nedostupné. Automatická komunikácia s centrálnym systémom bola prerušená; tento terminál zobrazuje iba miestny záznam. Ostatné boxy sú prázdne. Núdzová výbava je v nástennom stojane pri východe. Po otvorení priepážky pokračuj do sektora 07.');saveCheckpoint();openJournal(title);}
}
