/* Muzzle, pickups, supply and tour start. */
'use strict';
function muzzle(e){const a=e.kind==='shield'?e.facing:Math.atan2(player.x-e.x,player.y-e.y),scale=e.kind==='boss'?1.7:1;if(e.kind==='turret')return{x:e.x+Math.sin(a)*.68,y:e.y+Math.cos(a)*.68,z:1.18};return{x:e.x+(.43*Math.cos(a)+.62*Math.sin(a))*scale,y:e.y+(-.43*Math.sin(a)+.62*Math.cos(a))*scale,z:.96*scale};}
function updatePickups(){for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];if(p.kind==='med'&&Math.hypot(p.x-player.x,p.y-player.y)<.75&&line(player.x,player.y,p.x,p.y)){const gained=Math.min(25,100-player.hp);player.hp=Math.min(100,player.hp+25);pickups.splice(i,1);notice(gained?`+${gained} HP · LEKÁRNIČKA`:'LEKÁRNIČKA ZOBRANÁ · ZDRAVIE PLNÉ',2);tone(620,.15,'sine',.035,1.4);hud();if(cleared[room])saveCheckpoint();}}}
function nearbyNova(){return pickups.find(p=>p.kind==='nova'&&Math.hypot(p.x-player.x,p.y-player.y)<1.65&&line(player.x,player.y,p.x,p.y));}
function atSupply(){return room===0&&Math.hypot(player.x-4.8,player.y-82)<1.8;}

function startTour(){tour=true;makeLevel();shipSystems={parts:true,relay:true,cooling:true,isolated:true,drive:true,emp:true};resetView();player={x:13.5,y:8.1,a:-Math.PI/2,pitch:0,hp:100};room=4;roomWave=0;totalWaves=0;entered=[true,true,true,true,true];cleared=[false,false,false,false,false];unlocked=false;weapon=0;ammo=16;goal('PREHLIADKA KOKPITU · WASD + MYŠ · E NAVIGÁCIA');notice('POKOJNÁ PREHLIADKA · CHECKPOINT KAMPANE ZOSTÁVA ULOŽENÝ',4);hud();lock();}
