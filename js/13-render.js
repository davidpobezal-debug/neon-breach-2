/* Weapon overlay, scene render, warp, frame loop. */
'use strict';
// The pixel weapon overlay preserves the first version's visual identity.
const canvas=G.canvas,gunCanvas=$('weaponview'),gc=gunCanvas.getContext('2d');gunCanvas.width=480;gunCanvas.height=270;
function resizeGun(){const scale=touchInput.active?1:2;if(gunCanvas.width!==480*scale||gunCanvas.height!==270*scale){gunCanvas.width=480*scale;gunCanvas.height=270*scale;}gc.setTransform(scale,0,0,scale,0,0);gc.imageSmoothingEnabled=false;}
function drawGun(){resizeGun();gc.clearRect(0,0,480,270);if(!intro.gun)return;if(evaHoldingTool()&&state!=='flight'&&state!=='menu'&&state!=='ended'){drawEVATool();return;}if(state==='flight'||state==='menu'||state==='ended'&&flightTime)return;const bob=Math.sin(walk)*2,drop=reload?Math.sin(reload/weapons[weapon].reload*Math.PI)*55:0;gc.save();gc.translate(240+Math.sin(walk*.5)*2,270+bob+flash*50+drop);const r=(x,y,w,h,c)=>{gc.fillStyle=c;gc.fillRect(x,y,w,h)};
 r(-47,-28,39,28,'#172b35');r(30,-29,52,29,'#182d38');r(-39,-31,29,21,'#344d59');r(40,-30,26,25,'#344d59');if(weapon){r(-27,-56,54,56,'#463662');r(-20,-71,40,40,'#8268a3');r(-30,-77,12,28,'#394655');r(18,-77,12,28,'#394655');r(-26,-72,5,21,'#bb7bff');r(22,-72,5,21,'#bb7bff');r(-14,-76,28,26,'#162536');r(-10,-71,20,17,'#ce9bff');r(-5,-68,10,11,'#f1ddff');for(let y=-45;y<-10;y+=13)r(-17,y,34,5,'#ce9bff')}
 else{r(-26,-52,65,52,'#101c2a');r(-20,-60,52,60,'#3e5966');r(-15,-68,42,60,'#6c8792');r(-12,-72,36,10,'#1a2c39');r(-9,-86,30,18,'#263d4a');r(-5,-89,22,5,'#83bac1');r(-4,-82,20,8,'#06151e');r(1,-83,10,4,'#65fff0');r(-8,-64,28,7,'#11232e');r(-6,-60,24,3,'#47e9d8');for(let y=-48;y<-10;y+=13)r(-9,y,30,5,'#1a303f');r(27,-48,8,27,'#172c38');r(29,-45,5,14,'#ff8c50');r(-20,-42,5,20,'#b2ced1')}
 if(flash){gc.fillStyle=weapon?'#ddb7ff':'#fff0be';gc.beginPath();gc.moveTo(6,-86);gc.lineTo(-12,-107);gc.lineTo(0,-103);gc.lineTo(6,-130);gc.lineTo(13,-105);gc.lineTo(26,-114);gc.lineTo(19,-91);gc.closePath();gc.fill();r(1,-110,10,24,'#ffffff')}gc.restore()}
function render(){const localLights=[];for(const b of bolts.slice(-8))localLights.push({x:b.x,y:b.z,z:b.y,r:3,c:b.friendly?'#b374ff':'#56f8d4'});for(const e of [...enemies,...defenses])if(e.charge){const m=muzzle(e);localLights.push({x:m.x,y:m.z,z:m.y,r:3,c:'#83fff0'})}if(evaVacuum()&&keys.KeyE&&eva.valve&&!eva.sealed&&interactionTarget()?.data==='weld')localLights.push({x:60.4,y:1.35,z:27,r:3,c:'#d8f4ff'});if(flash)localLights.push({x:player.x,y:1.5,z:player.y,r:5,c:weapon?'#d394ff':'#ffb45e'});const mscene=marsSceneKind();marsPrepare(mscene,localLights);G.begin(player,localLights,time);
 if(mscene)marsDraw(mscene);else{
 G.draw(skyDome,G.transform(player.x,1.45,player.y));if(flightTime>9){const t=clamp((flightTime-9)/4,0,1);G.draw(mars.leg===1?marsGlobe:planetMesh,G.transform(20,3.5,-33,0,4+t*4));}G.draw(staticMesh);for(const g of gates){G.draw(doorL,G.transform(g.x-g.open*2.5,0,g.z));G.draw(doorR,G.transform(g.x+g.open*2.5,0,g.z))}
 G.draw(consoleMesh,G.transform(bridgeLayout.console.x,0,bridgeLayout.console.z));
 for(const b of barrels)if(b.alive)G.draw(barrelMesh,G.transform(b.x,0,b.y));
 drawSideDoors();drawSystems();drawEVA();drawCryo();drawActors();
 if(state==='flight'&&flightTime>2&&flightTime<9){drawWarp()}
 G.glass(glassMesh);drawCryoGlass();}
 G.finish();drawGun();drawFlightFlash();drawMarsOverlay();$('hitmarker').style.opacity=hit>0?1:0;$('damage').style.opacity=hurt*1.7;
}
let warpMesh;
function drawWarp(){const arr=[],speed=1+(flightTime-2)*.7;for(let i=0;i<180;i++){const a=i*2.399963,r=1+(i%16)*.45,z=-6-((time*(20+i%11)+i*2)%75),x=13.5+Math.cos(a)*r,y=1.45+Math.sin(a)*r,w=.025+(i%3)*.009,length=3+speed*(1+i%4);G.quad(arr,[x-w,y,z],[x+w,y,z],[x+w,y,z+length],[x-w,y,z+length],[0,1,0],i%4?'#83dafa':'#9992ef',3);}G.remove(warpMesh);warpMesh=G.mesh(arr);G.draw(warpMesh);}
function drawFlightFlash(){if(state!=='flight')return;let alpha=0;if(flightTime>2&&flightTime<2.65)alpha=(2.65-flightTime)/.65*.8;if(flightTime>8.8&&flightTime<9.25)alpha=Math.sin((flightTime-8.8)/.45*Math.PI)*.5;if(alpha){gc.fillStyle=`rgba(184,237,255,${alpha})`;gc.fillRect(0,0,480,270);}}

function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;update(dt);render();requestAnimationFrame(frame)}
