/* Mars interlude, part 1: state, map cells, terrain and structures.
   Story: the backup drive burns out its right stabilizer on the way to LYRA. A spare waits in the supply
   depot ARES-3 on Mars. A small lander docked at the end of the service walkway takes the player down.
   The lander interior, the crater floor and the depot live in the unused south-east corner of the map
   (x >= 38, z >= 62), so the same walking, collision and enemy code works there unchanged. */
'use strict';
Object.assign(glyphs,{'3':['111','001','111','001','111'],'-':['000','000','111','000','000'],'4':['101','101','111','001','001']});
const MZ={lift:1.1,x0:38,z0:62,cx:56,cz:76,ax:14.5,az:13.5,
 lander:{x:56,z:120,cells:{x0:52,x1:59,z0:117,z1:122},inner:{x0:53,x1:58,z0:118,z1:121},hatch:{x:52,z:120}},
 dock:{x:67.4,z:25.5,a:-Math.PI/2,port:{x:62.6,z:25.5}},
 depot:{cells:{x0:51,x1:60,z0:63,z1:70},inner:{x0:52,x1:59,z0:64,z1:69},door:[[55,70],[56,70]],part:{x:56,z:65.1},junction:{x:61.5,z:67.5}},
 mount:{x:47.5,z:27.3}};
const marsZone=(x,z)=>x>=MZ.x0&&z>=MZ.z0;
function freshMars(){return{phase:'none',part:false,junction:false,doorOpen:false,clamp:false,oldCut:false,seated:false,installed:false,defenders:false,pr:{},cine:null,leg:0}}
let mars=freshMars(),marsTerrain,marsStruct,marsInterior,marsShell,marsGlass,marsSkyMesh,marsGlobe,marsCollar,marsHatchPanel,marsDoorPanel,marsPartMesh,marsClampMesh,marsJunctionBad,marsJunctionOk,marsOldUnit,marsNewUnit,marsLights=[],marsGear;
// Deterministic helpers: level geometry must not consume Math.random (tests replay a seeded sequence).
function mrng(seed){let s=seed>>>0||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function mhash(x,y){let h=Math.imul(x,374761393)+Math.imul(y,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function mnoise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),a=mhash(ix,iy),b=mhash(ix+1,iy),c=mhash(ix,iy+1),d=mhash(ix+1,iy+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const msmooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
// Walkable ground of the Mars level as a chain of capsules [x1,z1,x2,z2,radius]: landing plain in the south, a valley, a narrow rocky
// pass (with a fissure and a gantry bridge), the plateau in front of the abandoned station ARES-3 and a pocket beside its east wall.
const MARS_WALK=[[48,122,64,122,9.5],[56,118,54,106,6.6],[54,106,56,98,5],[56,98,56,86,3.6],[43,79,68,79,8],[63,70.5,63,65,2.4],[40.5,72,40.5,84,4.5]];
// The centre line of the dirt track (used for tyre marks and lamp posts).
const MARS_TRACK=[[56,118],[55,112],[54.6,106],[55.5,100],[56,94],[56,86],[55.8,80],[55.6,72]];
function marsSegD(x,z,a,b,c,d){const vx=c-a,vz=d-b,t=Math.max(0,Math.min(1,((x-a)*vx+(z-b)*vz)/(vx*vx+vz*vz||1)));return Math.hypot(x-(a+vx*t),z-(b+vz*t))}
function marsSmin(a,b,k){const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25}
function marsWalkD(x,z){let m=1e9;for(const s of MARS_WALK)m=m>1e8?marsSegD(x,z,s[0],s[1],s[2],s[3])-s[4]:marsSmin(m,marsSegD(x,z,s[0],s[1],s[2],s[3])-s[4],2.2);return m}
function marsTrackD(x,z){let m=1e9;for(let i=0;i<MARS_TRACK.length-1;i++)m=Math.min(m,marsSegD(x,z,MARS_TRACK[i][0],MARS_TRACK[i][1],MARS_TRACK[i+1][0],MARS_TRACK[i+1][1]));return m}
// Building pads that must be flat even though they are not walkable: the depot with its two side modules.
const MARS_PADS=[[41.5,60.5,70.6,71.5]]; // x0,z0,x1,z1 (world)
function marsPadD(x,z){let m=1e9;for(const p of MARS_PADS){const dx=Math.max(p[0]-x,0,x-p[2]),dz=Math.max(p[1]-z,0,z-p[3]);m=Math.min(m,Math.hypot(dx,dz))}return m}
// The fissure the gantry bridge crosses (z about 93, only in the pass).
const MARS_FISSURE={z:93,w:1.9,depth:4.2};
function marsFissure(x,z){const f=MARS_FISSURE,dz=Math.abs(z-f.z);if(dz>f.w+1.4||Math.abs(x-56)>4.6)return 0;return (1-msmooth(f.w-.6,f.w+1.4,dz))}
// Flat where the player can walk (eye height never needs terrain following); cliffs in layers outside, mesas far away.
function marsHeight(x,z){
 const d=Math.min(marsWalkD(x,z),marsPadD(x,z)-.4),n=mnoise(x*.09,z*.09),n2=mnoise(x*.23+9,z*.23),n3=mnoise(x*.03+3,z*.03+7);
 let h=0;
 if(d>.15){
  let v=msmooth(.15,5.5,d)*(7.5+3*n)+msmooth(6,16,d)*(5+5*n3)+msmooth(26,48,d)*(11+9*n3)+msmooth(.4,3,d)*(n2-.4)*1.6+msmooth(.6,6,d)*((mnoise(x*.55+5,z*.55)-.5)*1.9+(mnoise(x*1.3,z*1.3+2)-.5)*.7);
  // Strata: the cliffs climb in steps like the mesas in the concept art.
  const st=1.25,t=v/st,f=t-Math.floor(t);v=(Math.floor(t)+msmooth(.4,.7,f))*st;h=v}
 return h-marsFissure(x,z)*MARS_FISSURE.depth}
function marsOutsideCell(x,z){return marsWalkD(x+.5,z+.5)>=0}
function marsInLander(x=player.x,z=player.y){const c=MZ.lander.cells;return x>=c.x0&&x<c.x1+1&&z>=c.z0&&z<c.z1+1}
function marsInDepot(x=player.x,z=player.y){const c=MZ.depot.cells;return x>=c.x0&&x<c.x1+1&&z>=c.z0&&z<c.z1+1}
// Where the player is not inside a pressurised hull on the Martian surface.
function marsOutside(){return mars.phase==='surface'&&marsZone(player.x,player.y)&&!marsInLander()&&!marsInDepot()}
const cellFill=(c,ch)=>{for(let z=c.z0;z<=c.z1;z++)for(let x=c.x0;x<=c.x1;x++)map[z][x]=ch};
function buildMarsCells(){
 for(let z=MZ.z0+1;z<MH-1;z++)for(let x=MZ.x0+1;x<MW-1;x++)if(!marsOutsideCell(x,z))map[z][x]='0';
 const L=MZ.lander,D=MZ.depot;
 cellFill(L.cells,'1');cellFill(L.inner,'0');map[L.hatch.z][L.hatch.x]='9';
 cellFill(D.cells,'1');cellFill(D.inner,'0');for(const [x,z]of D.door)map[z][x]='9';
 const add=(x,z,w,d,h)=>colliders.push({x,z,w,d,h});
 // Lander furniture (world coordinates = local + lander origin).
 const lx=L.x,lz=L.z;
 add(lx,lz-1.5,5.4,.7,.95);add(lx-1.6,lz-.4,.5,.5,.9);add(lx+1.6,lz-.4,.5,.5,.9); // seats: slim colliders keep a wide aisle to the hatch
 
 add(lx-2,lz+1.55,1.8,.8,2.0);add(lx+2.2,lz+1.55,1.4,.8,2.0);add(lx+2.55,lz+.2,.7,1.2,.8);
 // Depot furniture.
 add(53,64.6,2.6,.6,2.0);add(58.9,64.6,1.4,.6,2.0);add(52.7,67,.7,3.2,1.9);add(59.3,67,.7,3.2,1.9);
 add(56,67.4,2.6,1.1,1.0);add(56,64.55,1.5,1.1,1.0);add(58.5,69.4,1,.5,1.2);
 // Outdoor props: boulders, fissure edges, wreck, containers (see 17b-mars-sites.js).
 for(const r of marsRocks())if(r.solid)add(r.x,r.z,r.r*1.5,r.r*1.5,r.r);
 marsSiteColliders(add);
 add(MZ.mount.x,MZ.mount.z,1.3,.9,1.1); // service-walkway stabilizer pylon
}
let marsRockCache=null;
function marsRocks(){if(marsRockCache)return marsRockCache;const R=mrng(77),list=[];
 const L=MZ.lander,free=(x,z)=>!(x>L.x-5.5&&x<L.x+5.5&&z>L.z-4.5&&z<L.z+4.5)&&!(x>49&&x<63&&z>60&&z<72)&&Math.hypot(x-(L.x-6),z-L.z)>2.4;
 // Scattered boulders on the open ground, kept away from the track; bigger ones along the cliff foot.
 for(let i=0;i<260&&list.length<120;i++){const x=MZ.x0+1+R()*32,z=64+R()*68,d=marsWalkD(x,z);if(d>-.4||!free(x,z))continue;
  const tr=marsTrackD(x,z),r=.3+R()*R()*(d<-3?.9:1.9);
  if(tr<2.1+r)continue;
  const edge=d>-3.2;if(!edge&&R()<.45)continue;
  list.push({x,z,r,solid:r>.8&&edge,seed:i*13+5})}
 return marsRockCache=list}
// Flat-shaded low-poly boulder: two rings and an apex.
function tri(a,p,q,r,col,k=2,from=null){
 const u=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],v=[r[0]-p[0],r[1]-p[1],r[2]-p[2]];let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(...n)||1;n=n.map(x=>x/l);
 if(from){const c=[(p[0]+q[0]+r[0])/3-from[0],(p[1]+q[1]+r[1])/3-from[1],(p[2]+q[2]+r[2])/3-from[2]];if(c[0]*n[0]+c[1]*n[1]+c[2]*n[2]<0)n=n.map(x=>-x)}
 const cc=G.color(col);for(const w of [p,q,r])a.push(...w,...n,...cc,k)}
function rock(a,x,z,r,seed){
 const R=mrng(seed),tint=.8+R()*.4,col='#'+[.46,.29,.21].map(c=>Math.round(Math.min(255,c*tint*255)).toString(16).padStart(2,'0')).join('');
 const n=6,ph=R()*6,low=[],up=[],c=[x,r*.35,z],squash=.55+R()*.35;
 for(let i=0;i<n;i++){const t=i/n*Math.PI*2+ph+R()*.35,rr=r*(.85+R()*.4);low.push([x+Math.cos(t)*rr,-.08,z+Math.sin(t)*rr*.85]);up.push([x+Math.cos(t+.2)*rr*.62,r*squash*(.7+R()*.35),z+Math.sin(t+.2)*rr*.55])}
 const top=[x+(R()-.5)*r*.3,r*squash*1.15,z+(R()-.5)*r*.3];
 for(let i=0;i<n;i++){const j=(i+1)%n;tri(a,low[i],low[j],up[j],col,2,c);tri(a,low[i],up[j],up[i],col,2,c);tri(a,up[i],up[j],top,col,2,c)}}
// Terrain: a 1 m mesh over the playable area and a 3 m mesh beyond it (the 3 m grid has a hole where the fine one sits;
// fine border vertices follow the coarse edge so no cracks show).
const MARS_FINE={x0:38,x1:71,z0:61,z1:133};
function buildMarsTerrain(){
 const cs=3,half=150,cells=half*2/cs,cx0=MZ.cx-half,cz0=MZ.cz-half,arr=[];
 const hc=(i,j)=>marsHeight(cx0+i*cs,cz0+j*cs);
 const coarseAt=(x,z)=>{const fi=(x-cx0)/cs,fj=(z-cz0)/cs,i=Math.floor(fi),j=Math.floor(fj),u=fi-i,v=fj-j;return hc(i,j)*(1-u)*(1-v)+hc(i+1,j)*u*(1-v)+hc(i,j+1)*(1-u)*v+hc(i+1,j+1)*u*v};
 const F=MARS_FINE;
 const vert=(x,z,fine)=>{
  const border=fine&&(x===F.x0||x===F.x1||z===F.z0||z===F.z1),e=fine?.5:1.5;
  const y=border?coarseAt(x,z):marsHeight(x,z),dx=(marsHeight(x+e,z)-marsHeight(x-e,z))/(2*e),dz=(marsHeight(x,z+e)-marsHeight(x,z-e))/(2*e),l=Math.hypot(dx,1,dz);
  const t=mnoise(x*.05+40,z*.05),slope=Math.min(1,Math.hypot(dx,dz)*1.5),walk=marsWalkD(x,z);
  const sand=[.70,.40,.24],dust=[.62,.35,.22],dark=[.34,.19,.15],strata=[.52,.27,.19];
  // Layered rock colour on the cliffs, packed dirt on the track, a darker foot where cliff meets floor.
  const band=.5+.5*Math.sin(y*2.6+mnoise(x*.3,z*.3)*3);
  const rock=[0,1,2].map(k=>strata[k]*(.78+.4*band)*(1-.25*slope)+dark[k]*.0);
  let c=[0,1,2].map(k=>sand[k]+(dust[k]-sand[k])*t);
  const tr=marsTrackD(x,z);if(walk<-.5&&tr<1.5)c=c.map((v,k)=>v+([.80,.50,.33][k]-v)*(1-tr/1.5)*.55);
  const m=msmooth(.05,.9,Math.max(slope,msmooth(.2,2.5,walk)));
  c=c.map((v,k)=>v*(1-m)+rock[k]*m);
  if(walk>0&&walk<1.6)c=c.map(v=>v*(.82+.18*walk/1.6));
  return [x,y,z,-dx/l,1/l,-dz/l,...c,2.7]};
 const quads=(x0,z0,x1,z1,step,fine,skip)=>{const nx=Math.round((x1-x0)/step),nz=Math.round((z1-z0)/step);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const xa=x0+i*step,za=z0+j*step,xb=xa+step,zb=za+step;if(skip&&skip(xa,za,xb,zb))continue;
   const A=vert(xa,za,fine),B=vert(xb,za,fine),C=vert(xb,zb,fine),D=vert(xa,zb,fine);
   for(const T of [[A,B,C],[A,C,D]]){const u=[T[1][0]-T[0][0],T[1][1]-T[0][1],T[1][2]-T[0][2]],v=[T[2][0]-T[0][0],T[2][1]-T[0][1],T[2][2]-T[0][2]];let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(n[1]<0)n=n.map(q=>-q);const l=Math.hypot(...n)||1;n=n.map(q=>q/l);
    const flatFloor=Math.abs(T[0][1])<.01&&Math.abs(T[1][1])<.01&&Math.abs(T[2][1])<.01;
    for(const V of T){arr.push(V[0],V[1],V[2],flatFloor?V[3]:n[0],flatFloor?V[4]:n[1],flatFloor?V[5]:n[2],V[6],V[7],V[8],V[9])}}}};
 quads(cx0,cz0,cx0+cells*cs,cz0+cells*cs,cs,false,(xa,za,xb,zb)=>xa>=F.x0&&xb<=F.x1&&za>=F.z0&&zb<=F.z1);
 quads(F.x0,F.z0,F.x1,F.z1,1,true,null);
 return arr}
function marsGeoStruct(a){
 for(const r of marsRocks())rock(a,r.x,r.z,r.r,r.seed);
 marsSitesGeo(a);marsLandscapeArt(a);marsWreckArt(a);
 marsDepotGeo(a);marsDepotArt(a);
}
function marsDepotGeo(a){
 const B=G.box,wall='#5f6c74',wallD='#2f3a41',trim='#4a4038',amber='#e9a25a';
 // Shell: 1 m thick walls, 3.2 m high, flat roof. Interior x 52..60, z 64..70.
 B(a,56,.03,67,10,.06,8,'#2c2a2a');
 B(a,56,1.6,63.5,10,3.2,1,wall);B(a,51.5,1.6,67,1,3.2,6,wall);B(a,60.5,1.6,67,1,3.2,6,wall);
 B(a,53,1.6,70.5,4,3.2,1,wall);B(a,59,1.6,70.5,4,3.2,1,wall);B(a,56,2.9,70.5,2,.6,1,wall);
 B(a,56,3.45,67,10.5,.5,8.5,'#46525a');
 B(a,56,.28,70.98,10.1,.56,.06,wallD);B(a,56,.28,63.02,10.1,.56,.06,wallD);B(a,60.98,.28,67,.06,.56,8,wallD);B(a,51.02,.28,67,.06,.56,8,wallD);
 // Interior liners.
 B(a,56,.07,67,9.9,.01,5.9,'#3a3532');for(let z=64.4;z<70;z+=.7)B(a,56,.08,z,9.8,.01,.05,'#141414');
 B(a,56,3.18,67,9.9,.04,5.9,'#6a5d52');
 for(const x of [54,58])B(a,x,3.14,67,.18,.04,5.8,'#fff0d0',3);
 // West and east shelves with crates.
 for(const [x,dir] of [[52.65,1],[59.35,-1]])for(let z=64.9;z<69.3;z+=1.1){B(a,x,.95,z,.6,1.9,.12,'#4a525a');for(const y of [.45,1.05,1.65]){B(a,x,y,z,.62,.05,1,'#6b7379');if((z*3+y*7|0)%3)B(a,x,y+.25,z,.46,.4,.7,((z*5|0)+(y*5|0))%2?'#8d6b3f':'#5f7077')}}
 // North wall racks, workbench, terminal.
 for(const x of [53.4,58.6]){B(a,x,1.0,64.4,1.6,2.0,.5,'#4a525a');for(const y of [.4,1.0,1.6])B(a,x,y,64.4,1.6,.05,.55,'#6b7379');B(a,x,.7,64.4,1.1,.42,.45,'#6e5a3e')}
 B(a,56,.5,67.4,2.6,1.0,1.1,'#5a4f45');B(a,56,1.03,67.4,2.7,.07,1.2,'#8a7a66');B(a,55.4,1.2,67.4,.4,.25,.3,'#38424a');
 B(a,58.5,.6,69.45,1.0,1.2,.4,'#2d3a43');B(a,58.5,1.12,69.3,.8,.5,.06,'#12303a');B(a,58.5,1.12,69.27,.7,.4,.02,'#3fd3c4',3);
 // Cage around the stabilizer, north centre.
 B(a,56,.18,64.55,1.7,.36,1.2,'#394047');for(const x of [-.8,.8])B(a,56+x,1.0,64.2,.08,1.8,.08,'#7a8288');B(a,56,1.9,64.4,1.7,.06,.6,'#7a8288');
}
function marsGeoLanderInterior(a){
 const B=G.box,panel='#2b3a40',dk='#1b2428',seat='#3a2f2a';
 // Interior liners, floor grating, lights (lander local coordinates: x -3..3, z -2..2).
 B(a,0,.075,0,5.9,.01,3.9,'#171d21');for(let z=-1.8;z<=1.8;z+=.45)B(a,0,.082,z,5.8,.006,.04,'#121416');
 B(a,0,2.66,0,5.9,.04,3.9,'#1f2a30');for(const x of [-1.5,1.5])B(a,x,2.63,0,.16,.04,3.6,'#ffe9c4',3);
 B(a,2.96,1.3,0,.06,2.3,3.9,panel);B(a,0,1.3,1.96,5.9,2.3,.06,panel);B(a,-2.96,1.3,-1,.06,2.3,2,panel);B(a,-2.96,1.3,1.5,.06,2.3,1,panel);
 B(a,-3,2.5,.5,.06,.35,1,panel);B(a,2.9,2.0,0,.04,.1,3.8,'#e08a3a');B(a,-2.9,2.0,-1,.04,.1,1.9,'#e08a3a');
 // Front console under the window with lit displays.
 B(a,0,.4,-1.5,5.4,.8,.7,dk);B(a,0,.83,-1.5,5.5,.07,.8,'#59646c');
 for(const x of [-1.9,0,1.9]){B(a,x,.97,-1.78,1.3,.22,.04,'#0d2a35');B(a,x,.97,-1.75,1.1,.02,.02,'#44e0d0',3);B(a,x,1.04,-1.75,.8,.02,.02,'#2a8d86',3);B(a,x,.9,-1.75,.4,.02,.02,'#d7a25f',3)}
 for(let i=0;i<7;i++)B(a,-2.3+i*.38,.88,-1.2,.1,.05,.1,i%3===1?'#e2a45a':'#3a8a92',3);
 B(a,0,.9,-1.1,.5,.06,.4,'#252b30');B(a,0,.95,-1.1,.12,.12,.12,'#e9a85b',3);
 // Two pilot seats.
 for(const x of [-1.6,1.6]){B(a,x,.3,-.4,.9,.5,.9,seat);B(a,x,.95,.1,.9,1.0,.2,seat);B(a,x,1.55,.1,.5,.25,.2,'#52443b');B(a,x-.5,.62,-.4,.08,.2,.8,'#242a30');B(a,x+.5,.62,-.4,.08,.2,.8,'#242a30');B(a,x,.05,-.4,.5,.1,.5,'#25292d')}
 // South wall: rack, docking port, locker; east wall: part cradle.
 B(a,-2,1.0,1.55,1.8,2.0,.8,'#46525c');for(const y of [.4,1.0,1.6]){B(a,-2,y,1.55,1.85,.05,.85,'#6b7379');B(a,-2.4+.45*(y>1),y+.22,1.55,.6,.35,.6,y>1?'#7e6c48':'#5f7077')}
 B(a,2.2,1.0,1.55,1.4,2.0,.8,'#3f4a52');B(a,2.2,1.45,1.15,1.1,.9,.04,'#1c2a30');B(a,2.2,1.45,1.12,.9,.7,.02,'#3fd3c4',3);
 B(a,0,1.3,1.9,1.7,1.7,.12,'#5d666d');B(a,0,1.3,1.84,1.3,1.3,.06,'#2a3138');B(a,0,1.3,1.8,.4,.4,.04,'#7f878d');B(a,0,2.25,1.8,.18,.08,.04,'#59f0a0',3);
 B(a,2.55,.35,.2,.7,.7,1.2,'#3a444d');B(a,2.6,.74,.2,.62,.04,1.1,'#9aa0a5');
 // Hatch frame, wall panel beside it.
 B(a,-2.9,1.4,-.2,.1,.5,.4,'#2e3940');B(a,-2.86,1.4,-.2,.03,.38,.3,'#3fd3c4',3);B(a,-2.88,1.15,.5,.06,2.3,.1,'#e08a3a');B(a,-2.88,1.15,1.05,.06,2.3,.1,'#e08a3a');B(a,-2.88,2.3,.5,.06,.1,1.05,'#e08a3a');
 // Crates against the east wall.
 B(a,2.4,.4,-1.3,.8,.8,.8,'#6a5638');B(a,2.4,1.0,-1.3,.6,.4,.6,'#4f6670');
}
function marsGeoDynamic(){const B=G.box,mk=f=>{const a=[];f(a);return G.mesh(a)};
 marsHatchPanel=mk(a=>{B(a,-3.5,1.15,.5,.42,2.3,1,'#9a948a');B(a,-3.7,1.15,.5,.04,.2,.5,'#e08a3a');B(a,-3.7,1.9,.5,.04,.4,.08,'#2a2a2a')});
 marsDoorPanel=mk(a=>{for(const s of [-1,1]){B(a,s*.5,1.3,0,.98,2.6,.5,'#9a8a76');B(a,s*.5,1.3,.27,.9,2.3,.04,'#4a4038');B(a,s*.1,1.3,.3,.06,2.3,.05,'#e9a25a')}});
 marsPartMesh=mk(a=>{B(a,0,.3,0,.9,.6,.9,'#3b4650');for(let i=0;i<4;i++)B(a,0,.25+i*.17,0,1.0,.07,1.0,'#c9904f');B(a,0,.55,0,.4,.95,.4,'#69f0e0',3);B(a,0,1.05,0,.8,.1,.8,'#59646c');B(a,0,.12,0,.2,.2,1.2,'#8a8f93')});
 marsClampMesh=mk(a=>{for(const z of [-.42,.42])B(a,0,.72,z,1.5,.12,.14,'#e0903a');for(const x of [-.72,.72])B(a,x,.5,0,.12,.7,.98,'#7a8288')});
 marsJunctionBad=mk(a=>{B(a,0,1.2,0,.4,.9,.8,'#3a4048');B(a,.22,1.35,0,.04,.3,.6,'#1b1f22');B(a,.24,1.5,-.2,.04,.06,.06,'#ff4a3a',3);B(a,.24,1.3,.1,.04,.06,.06,'#ff4a3a',3);B(a,.22,.62,0,.15,.5,.15,'#2a2a2a');B(a,.24,.88,0,.05,.1,.3,'#e9a25a',3)});
 marsJunctionOk=mk(a=>{B(a,0,1.2,0,.4,.9,.8,'#3a4048');B(a,.22,1.35,0,.04,.3,.6,'#1b1f22');B(a,.24,1.5,-.2,.04,.06,.06,'#59f0a0',3);B(a,.24,1.3,.1,.04,.06,.06,'#59f0a0',3);B(a,.22,.62,0,.15,.5,.15,'#2a2a2a');B(a,.24,.88,0,.05,.1,.3,'#59f0a0',3)});
 marsOldUnit=mk(a=>{B(a,0,.45,0,.9,.9,.9,'#2a2a2c');B(a,0,.95,0,.7,.14,.7,'#1a1a1c');for(let i=0;i<3;i++)B(a,0,.2+i*.22,0,1.0,.06,1.0,'#4a2a1a');B(a,.2,.7,.46,.3,.3,.03,'#ff6a2a',3)});
 marsNewUnit=mk(a=>{B(a,0,.3,0,.9,.6,.9,'#3b4650');for(let i=0;i<4;i++)B(a,0,.25+i*.17,0,1.0,.07,1.0,'#c9904f');B(a,0,.55,0,.4,.95,.4,'#69f0e0',3);B(a,0,1.05,0,.8,.1,.8,'#59646c')});
 const col=[];B(col,0,1.2,0,.7,2.4,2.2,'#6d747a');B(col,.01,1.2,0,.74,.2,2.3,'#e08a3a');B(col,0,.15,0,.76,.3,2.4,'#42454a');marsCollar=G.mesh(col);
}
function buildMars(){
 mars=freshMars();marsRockCache=null;
 for(const m of [marsTerrain,marsStruct,marsInterior,marsShell,marsGear,marsGlass,marsSkyMesh,marsGlobe,marsHatchPanel,marsDoorPanel,marsPartMesh,marsClampMesh,marsJunctionBad,marsJunctionOk,marsOldUnit,marsNewUnit,marsCollar])G.remove(m);
 buildMarsCells();
 marsTerrain=G.mesh(buildMarsTerrain());
 let a=[];marsGeoStruct(a);marsStruct=G.mesh(a);
 a=[];marsGeoLanderShell(a);marsLanderArt(a);marsShell=G.mesh(a);
 a=[];marsGeoLanderGear(a);marsGear=G.mesh(a);
 a=[];marsGeoLanderInterior(a);marsCabinArt(a);marsInterior=G.mesh(a);
 a=[];marsGeoGlass(a);marsGlass=G.mesh(a);
 a=[];G.sphere(a,170,'#000000',2.9);marsSkyMesh=G.mesh(a);
 a=[];G.sphere(a,1,'#ffffff',2.75);marsGlobe=G.mesh(a);
 marsGeoDynamic();
 marsLights=[{x:55,y:2.3,z:119.2,r:6,c:'#68d7d3',lift:true},{x:57.5,y:2.3,z:120.8,r:5,c:'#68d7d3',lift:true},{x:56,y:1.7,z:72.6,r:6,c:'#ffb868'},{x:59,y:1.6,z:114,r:6,c:'#ffb868'},{x:52,y:1.6,z:108,r:6,c:'#ffb868'},{x:58.4,y:1.6,z:101.6,r:6,c:'#ffb868'},{x:53.4,y:1.6,z:97,r:6,c:'#ffb868'},{x:56,y:1.4,z:93,r:6,c:'#ffb868'},{x:58.5,y:1.6,z:88,r:6,c:'#ffb868'},{x:53.5,y:1.6,z:83.5,r:6,c:'#ffb868'},{x:58.8,y:1.6,z:78,r:6,c:'#ffb868'},{x:44.8,y:1.6,z:75,r:6,c:'#69f0e0'},{x:44.8,y:1.6,z:85,r:6,c:'#ffb868'},{x:54,y:2.3,z:66,r:6.5,c:'#65c9cc'},{x:58,y:2.3,z:68,r:6.5,c:'#65c9cc'},{x:56,y:1.7,z:64.6,r:3.2,c:'#69f0e0'}];
}
// Door cells follow the door state; called after load and whenever a door changes.
function marsApplyState(){if(!map||!map.length)return;for(const [x,z]of MZ.depot.door)map[z][x]=mars.doorOpen?'0':'9';}
