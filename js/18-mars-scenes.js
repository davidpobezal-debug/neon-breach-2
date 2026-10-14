/* Mars interlude, part 2: which scene is drawn, its lighting, descent/ascent cinematics and overlays. */
'use strict';
const ENV_SHIP={fog:[.016,.028,.042],fogd:.009,amb:[.46,.56,.64],sunDir:[-.62,.44,.66],sunCol:[0,0,0],clear:[.016,.032,.061]};
const ENV_MARS={fog:[.68,.46,.34],fogd:.0105,amb:[.29,.26,.27],sunDir:[-.65,.62,.43],sunCol:[1.30,.96,.67],clear:[.55,.34,.24]};
const ENV_DOCK={fog:[.02,.025,.035],fogd:.0012,amb:[.40,.38,.36],sunDir:[-.62,.44,.66],sunCol:[0,0,0],clear:[0,0,.02]};
const mixv=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const mars_ease=t=>t*t*(3-2*t);
// Descent / ascent timeline. Returns everything the renderer, HUD and overlay need for the current time.
function marsCineInfo(){
 const t=flightTime;
 if(mars.cine==='descent'){
  const D=27;let text='',sub='',globeD=0,alt=0,atm=0,plasma=0,dust=0,shake=0;
  if(t<5){text='ODPOJENIE OD ARGO-09';sub='KLEMY UVOĽNENÉ · MANÉVROVACIE MOTORY';globeD=150-t*3;shake=t>3.4?(t-3.4)*.5:0}
  else if(t<12){text='DEORBITÁCIA';sub='BRZDIACI MANÉVER · KURZ SKLAD ARES-3';globeD=135-mars_ease((t-5)/7)*125;shake=.7}
  else if(t<18){text='VSTUP DO ATMOSFÉRY';sub='TEPELNÝ ŠTÍT · TRASA NAD KRÁTEROM';atm=t>=13?1:0;alt=240;plasma=t<13?(t-12):(1-Math.max(0,t-15)/3)*1;shake=1}
  else if(t<25){const s=(t-18)/7;text='KLESANIE';alt=240*Math.pow(1-s,1.7);sub='VÝŠKA '+Math.round(alt)+' m · MOTORY NA 80 %';atm=1;shake=.35*(1-s)+.12;dust=Math.max(0,(s-.82)*3.5)}
  else{text='DOTYK';sub='MOTORY VYPNUTÉ · PRISTÁVACIE NOHY ZAISTENÉ';atm=1;dust=Math.max(0,1-(t-25)/2)}
  return{D,text,sub,globeD,alt,atm,plasma,dust,shake,done:t>=D,pitch:-.2*mars_ease(Math.min(1,Math.max(0,(t-17)/6)))}
 }
 const D=21;let text='',sub='',globeD=0,alt=0,atm=1,plasma=0,dust=0,shake=0,flash=0;
 if(t<3){text='ZAPÁLENIE MOTOROV';sub='ŤAH 100 % · ODLEPENIE OD POVRCHU';dust=1-t/3*.4;shake=.8}
 else if(t<12){const s=(t-3)/9;alt=240*Math.pow(s,1.6);text='STÚPANIE';sub='VÝŠKA '+Math.round(alt)+' m';dust=Math.max(0,.6-(t-3)/4);shake=.5*(1-s)+.15}
 else if(t<14){text='VÝSTUP Z ATMOSFÉRY';sub='TLAK KLESÁ · OBLOHA TMAVNE';alt=240;atm=t<13?1:0;flash=Math.sin((t-12)/2*Math.PI)*.6;globeD=12;shake=.2}
 else{text=t<18?'ORBITÁLNY MANÉVER':'DOKOVANIE · ARGO-09';sub=t<18?'KURZ NA SERVISNÚ LÁVKU':'KLEMY ZACHYTENÉ · TLAK VYROVNANÝ';atm=0;globeD=12+mars_ease((t-14)/7)*140}
 return{D,text,sub,globeD,alt,atm,plasma,dust,shake,flash,done:t>=D,pitch:0}
}
// Which scene replaces the ship while the player is inside the Mars area ('surface', 'dock' or 'cine').
function marsSceneKind(){
 if(state==='flight'&&mars.cine)return 'cine';
 if(mars.phase==='none'||!marsZone(player.x,player.y))return null;
 return mars.phase==='surface'?'surface':'dock';
}
// Called before G.begin: picks lighting and adds the nearest lamps.
function marsPrepare(kind,lights){
 let env=ENV_SHIP;
 if(kind==='surface')env=ENV_MARS;
 else if(kind==='dock')env=ENV_DOCK;
 else if(kind==='cine'){const i=marsCineInfo();env=i.atm?{...ENV_MARS,fogd:ENV_MARS.fogd*(.4+.6*(1-i.alt/240))}:ENV_DOCK}
 const sheltered=(kind==='surface'||kind==='dock'||kind==='cine')&&marsInLander()||kind==='surface'&&marsInDepot();
 Object.assign(G.env,env);
 G.env.mars=kind==='dock'?2:kind?1:0;
 if(!kind)return;
 const near=marsLights.filter(l=>(!sheltered||(marsInLander()?l.lift:!l.lift&&l.z<70))&&Math.hypot(l.x-player.x,l.z-player.y)<l.r+12).sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.y)-Math.hypot(b.x-player.x,b.z-player.y));
 const ll=(kind==='surface'||kind==='cine')?MZ.lift:0;
 for(const l of near)lights.push(l.lift?{...l,y:l.y+ll}:l);
 if(mars.pr?.spark>0&&mars.sparkLight)lights.push(mars.sparkLight);
}
function drawActors(){
 for(const e of [...enemies,...defenses]){const a=e.kind==='shield'?e.facing:Math.atan2(player.x-e.x,player.y-e.y),scale=e.kind==='boss'?1.7:e.kind==='runner'?.88:1;G.draw(e.kind==='turret'?turretMesh:robotMeshes[e.kind],G.transform(e.x,Math.sin(e.phase)*.025,e.y,a,scale));if(e.charge){const m=muzzle(e);G.draw(orbMesh,G.transform(m.x,m.z,m.y,0,(.07+(1-e.charge/e.chargeMax)*.07)*scale));}if(e.windup)G.draw(orbMesh,G.transform(e.x,.92,e.y,0,.12));if(e.flash)G.draw(novaOrb,G.transform(e.x,e.kind==='boss'?1.5:.9,e.y,0,.10))}
 for(const b of bolts){G.draw(b.friendly?novaOrb:orbMesh,G.transform(b.x,b.z,b.y,0,b.r));G.draw(b.friendly?novaOrb:orbMesh,G.transform(b.x-b.vx*.025,b.z,b.y-b.vy*.025,0,b.r*.55))}
 for(const p of particles)G.draw(p.c==='#cc9dff'?novaOrb:orbMesh,G.transform(p.x,p.z,p.y,0,p.life*.065));
 for(const p of pickups)G.draw(p.kind==='parts'?partMesh:p.kind==='nova'?weaponMesh:p.kind==='card'?cardMesh:p.kind==='mod'?modMesh:medMesh,G.transform(p.x,.12+Math.sin(time*2.4+p.x)*.055,p.y,p.kind==='med'?Math.atan2(player.x-p.x,player.y-p.y):time*.35));
}
// Draws the Mars scene. `lift` lowers the ground during descent and ascent (the lander stays put).
function marsDraw(kind){
 const L=MZ.lander,ll=(kind==='surface'||kind==='cine')?MZ.lift:0,ey=1.45+(player.lift||0);let ground=kind==='surface',lift=0,space=kind==='dock',globeD=0;
 if(kind==='cine'){const i=marsCineInfo();ground=!!i.atm&&i.alt<235;lift=i.alt;space=!i.atm;globeD=i.globeD}
 if(space){G.draw(skyDome,G.transform(player.x,ey,player.y));
  // Mars fills the view ahead; its distance is the "altitude" during the cinematics.
  const R=60,D=kind==='cine'?globeD:70,dir=[0,-.22,-1],l=Math.hypot(...dir);
  G.draw(marsGlobe,G.transform(player.x+dir[0]/l*(D+R),ey+dir[1]/l*(D+R)+(kind==='dock'?-5:0),player.y+dir[2]/l*(D+R)+(kind==='dock'?-10:0),0,R))}
 else G.draw(marsSkyMesh,G.transform(player.x,ey,player.y));
 if(ground){G.draw(marsTerrain,G.transform(0,-lift,0));G.draw(marsStruct,G.transform(0,-lift,0));
  // Sliding doors, junction box, stabilizer in its cage.
  const D=MZ.depot,open=mars.doorOpen?1:0;
  G.draw(marsDoorPanel,G.transform(56,.01+(mars.doorAnim??open)*2.5-lift,70.55));
  G.draw(mars.junction?marsJunctionOk:marsJunctionBad,G.transform(D.junction.x-.2,-lift,D.junction.z));
  if(!mars.part){G.draw(marsPartMesh,G.transform(D.part.x,.36-lift,D.part.z));if(!mars.clamp)G.draw(marsClampMesh,G.transform(D.part.x,.36-lift,D.part.z))}}
 // The lander: shell and interior share one frame so the player can walk straight in and out of the hatch.
 G.draw(marsShell,G.transform(L.x,ll,L.z));G.draw(marsInterior,G.transform(L.x,ll,L.z));
 if(ll)G.draw(marsGear,G.transform(L.x,0,L.z));
 G.draw(marsHatchPanel,G.transform(L.x,ll+(mars.hatchAnim||0)*2.4,L.z));
 if(mars.part&&kind!=='cine')G.draw(marsPartMesh,G.transform(L.x+2.55,.62+ll,L.z+.2,.3,.72));
 drawActors();
 G.glass(marsGlass,G.transform(0,ll,0));
}
// Ship-side Mars content: the docked lander, its collar and the stabilizer mount on the service walkway.
function drawMarsShip(){
 if(mars.phase==='none')return;
 const docked=mars.phase!=='surface';
 if(docked){G.draw(marsShell,G.transform(MZ.dock.x,0,MZ.dock.z,MZ.dock.a));G.draw(marsCollar,G.transform(64.18,0,MZ.dock.z))}
 const m=MZ.mount;
 if(!mars.oldCut)G.draw(marsOldUnit,G.transform(m.x,0,m.z));
 else if(mars.installed)G.draw(marsNewUnit,G.transform(m.x,0,m.z));
 else if(mars.seated)G.draw(marsNewUnit,G.transform(m.x,0,m.z));
}
// Orange plasma during atmospheric entry, dust on touchdown/lift-off, white flash on leaving the atmosphere.
function drawMarsOverlay(){
 if(!(state==='flight'&&mars.cine))return;
 const i=marsCineInfo(),w=480,h=270;
 if(i.plasma>0){const a=Math.min(1,i.plasma),f=.75+.25*Math.sin(time*40);
  const g=gc.createLinearGradient(0,0,0,h);g.addColorStop(0,`rgba(255,120,30,${.35*a*f})`);g.addColorStop(.5,`rgba(255,200,120,${.8*a*f})`);g.addColorStop(1,`rgba(255,90,20,${.5*a*f})`);gc.fillStyle=g;gc.fillRect(0,0,w,h);
  for(let k=0;k<26;k++){const x=(k*37+time*350)%w,y=(k*53)%h;gc.fillStyle=`rgba(255,240,200,${.35*a})`;gc.fillRect(x,y,26+(k%4)*10,1+(k%2))}}
 if(i.dust>0){gc.fillStyle=`rgba(190,125,85,${Math.min(.75,i.dust*.75)})`;gc.fillRect(0,0,w,h);for(let k=0;k<30;k++){gc.fillStyle=`rgba(230,170,120,${.15*i.dust})`;gc.fillRect((k*61+time*60)%w,(k*29)%h,60,8)}}
 if(i.flash>0){gc.fillStyle=`rgba(255,235,210,${i.flash})`;gc.fillRect(0,0,w,h)}
}
// Free camera shake for the cinematics (small angle wobble; the cabin itself never moves).
function marsCineShake(info){const s=info.shake||0;player.a=-Math.PI/2+Math.sin(time*47)*.0045*s+Math.sin(time*13)*.003*s;player.pitch=(info.pitch||0)+Math.sin(time*39+1)*.0045*s}
