/* Mars interlude, part 1b: the places of the Mars level (landing pad, rocky pass with the gantry bridge, the abandoned
   station ARES-3 with its side modules, the wreck) built from boxes, prisms and plates in the same chunky style as the ship.
   Palette: dark blue-grey steel, rust, amber lamps (emissive k=3) and cyan screens. World coordinates. */
'use strict';
const MC={steel:'#5b6870',steelD:'#3b464e',steelL:'#7d8b93',steelX:'#2a333a',rust:'#7d4a33',rustD:'#5a3426',sand:'#b46c43',amber:'#e9a25a',amberL:'#ffb867',cyan:'#69f0e0',cyanD:'#2a8d86',hazard:'#d9a24a',black:'#1e2226'};
// A plate through four points (normal from the points).
function mPlate(a,p0,p1,p2,p3,col,k=1){const u=p1.map((v,i)=>v-p0[i]),v=p3.map((x,i)=>x-p0[i]);let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(...n)||1;G.quad(a,p0,p1,p2,p3,n.map(x=>x/l),col,k)}
// Prism (cylinder with `sides` sides) along an axis, optionally closed at both ends.
function mPrism(a,cx,cy,cz,axis,r,len,col,sides=10,k=1,caps=true,r2=null){
 const pt=(t,rr)=>axis==='x'?[0,Math.cos(t)*rr,Math.sin(t)*rr]:axis==='z'?[Math.cos(t)*rr,Math.sin(t)*rr,0]:[Math.cos(t)*rr,0,Math.sin(t)*rr];
 const h=len/2,off=axis==='x'?[h,0,0]:axis==='z'?[0,0,h]:[0,h,0],e=r2==null?r:r2;
 const P=(p,s)=>[cx+p[0]+off[0]*s,cy+p[1]+off[1]*s,cz+p[2]+off[2]*s];
 for(let i=0;i<sides;i++){const t0=i/sides*Math.PI*2,t1=(i+1)/sides*Math.PI*2,tm=(t0+t1)/2,n=pt(tm,1);
  G.quad(a,P(pt(t0,r),-1),P(pt(t0,e),1),P(pt(t1,e),1),P(pt(t1,r),-1),n,col,k);
  if(caps)for(const s of [-1,1]){const rr=s<0?r:e,c=P([0,0,0],s),sgn=axis==='x'?[s,0,0]:axis==='z'?[0,0,s]:[0,s,0];G.quad(a,c,P(pt(t0,rr),s),P(pt(t1,rr),s),c,sgn,col,k)}}}
// A lamp post: pole, lamp head (emissive) and a small solar panel.
function mLamp(a,x,z,h=2.0,y0=0){const B=G.box;B(a,x,y0+h/2,z,.1,h,.1,MC.steelD);B(a,x,y0+h+.06,z,.34,.14,.34,MC.steelX);B(a,x,y0+h-.02,z,.24,.06,.24,MC.amberL,3);B(a,x+.18,y0+h-.4,z,.34,.04,.24,'#1c2f4d');B(a,x,y0+.08,z,.34,.16,.34,MC.steelX)}
// A sagging cable/hose between two points as short segments.
function mHose(a,p,q,w,col,sag=.3,n=8){let prev=p;for(let i=1;i<=n;i++){const t=i/n,pt=[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t-Math.sin(t*Math.PI)*sag,p[2]+(q[2]-p[2])*t];beam3(a,prev,pt,w,col);prev=pt}}
// A beam between any two points (square section).
function beam3(a,p,q,w,col){const v=q.map((n,i)=>n-p[i]),len=Math.hypot(...v)||1,d=v.map(x=>x/len);let up=Math.abs(d[1])>.9?[1,0,0]:[0,1,0];
 const s=[d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]],sl=Math.hypot(...s)||1,S=s.map(x=>x/sl*w/2),U=[d[1]*S[2]-d[2]*S[1],d[2]*S[0]-d[0]*S[2],d[0]*S[1]-d[1]*S[0]];
 const c=(P,a1,a2)=>P.map((x,i)=>x+S[i]*a1+U[i]*a2);
 for(const [a1,a2,b1,b2] of [[1,1,-1,1],[-1,1,-1,-1],[-1,-1,1,-1],[1,-1,1,1]])G.quad(a,c(p,a1,a2),c(q,a1,a2),c(q,b1,b2),c(p,b1,b2),[0,1,0],col)}
// Shallow dish (paraboloid) facing `axis`.
function mDish(a,c,axis,r,col,back='#3a444b'){const l=Math.hypot(...axis),n=axis.map(x=>x/l);let up=Math.abs(n[1])>.9?[1,0,0]:[0,1,0];
 const u=[n[1]*up[2]-n[2]*up[1],n[2]*up[0]-n[0]*up[2],n[0]*up[1]-n[1]*up[0]],ul=Math.hypot(...u),U=u.map(x=>x/ul),V=[n[1]*U[2]-n[2]*U[1],n[2]*U[0]-n[0]*U[2],n[0]*U[1]-n[1]*U[0]];
 const P=(rho,t)=>c.map((x,i)=>x+U[i]*Math.cos(t)*rho+V[i]*Math.sin(t)*rho+n[i]*rho*rho*.16/r*2.2),S=14,rings=[0,.35,.7,1];
 for(let j=0;j<3;j++)for(let i=0;i<S;i++){const t0=i/S*Math.PI*2,t1=(i+1)/S*Math.PI*2;G.quad(a,P(rings[j]*r,t0),P(rings[j+1]*r,t0),P(rings[j+1]*r,t1),P(rings[j]*r,t1),n,(i+j)%2?col:'#aab5ba')}
 G.box(a,c[0]-n[0]*.05,c[1]-n[1]*.05,c[2]-n[2]*.05,.16,.16,.16,back)}
// Pixel text on a wall facing +z (facing 0) or -z (PI).
function mSign(a,text,x,y,z,size,col,facing=0){centeredLabel(a,text,x,y,z,size,col,facing)}

// ---------------------------------------------------------------------------------------------------------------------------------
// Ground details: cable runs, pads, sand drifts, lamp posts along the track.
function marsGroundGeo(a){
 const B=G.box,L=MZ.lander;
 // Landing pad: dark tiles with an amber frame, corner lamps, hoses to a fuel unit.
 const px=L.x-.5,pz=L.z+.2;
 B(a,px,.025,pz,13.4,.05,10.8,'#2a2f34');B(a,px,.052,pz,13.0,.01,10.4,'#343b41');
 for(let i=-6;i<=6;i++)B(a,px+i,.058,pz,.04,.004,10.4,'#20262a');for(let j=-5;j<=5;j++)B(a,px,.058,pz+j,13,.004,.04,'#20262a');
 for(const [dx,dz,w,d] of [[0,-5.45,13.6,.16],[0,5.45,13.6,.16],[-6.75,0,.16,10.9],[6.75,0,.16,10.9]])B(a,px+dx,.07,pz+dz,w,.04,d,MC.hazard);
 for(const [dx,dz] of [[-6.75,-5.45],[6.75,-5.45],[-6.75,5.45],[6.75,5.45]])mLamp(a,px+dx,pz+dz,1.5);
 // Supply boxes and the fuel unit at the east edge, linked to the lander by black hoses.
 B(a,L.x+6.1,.55,L.z-3.3,1.4,1.1,1.1,MC.steelD);B(a,L.x+6.1,1.14,L.z-3.3,1.5,.08,1.2,MC.steelL);B(a,L.x+5.38,.62,L.z-3.3,.03,.4,.5,MC.cyan,3);
 for(const [dz,c] of [[-1.2,'#8a6a3a'],[.0,'#5b6e78'],[1.4,'#8a6a3a']])B(a,L.x+6.0,.35,L.z+2.2+dz,.9,.7,.8,c);
 mPrism(a,L.x+5.6,.55,L.z+4.1,'z',.55,1.8,MC.steel,12,1);mPrism(a,L.x+5.6,.55,L.z+4.1,'z',.58,.16,MC.amber,12,1,false);
 mHose(a,[L.x+4.4,.35,L.z+2.7],[L.x+5.4,.35,L.z+3.8],.14,MC.black,.2,6);
 mHose(a,[L.x+4.4,.5,L.z-2.1],[L.x+5.5,.4,L.z-3.0],.14,MC.black,.25,6);
 // Lamp posts along the track.
 for(const [x,z] of [[59.0,114],[52.0,108],[58.4,101.6],[53.4,97],[58.5,88],[53.5,83.5],[58.8,78]])mLamp(a,x,z,1.9);
 // Cable run on the ground from the pass to the station.
 let prev=[57.3,.04,100];for(const [x,z] of [[57.6,95],[57.7,88],[57.4,82],[56.4,76.5],[56.2,72]]){const q=[x,.04,z];beam3(a,prev,q,.09,MC.black);prev=q}
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Rocky pass: gantry bridge over the fissure, a beacon terminal on a pole and cliff-side cable trays.
function marsPassGeo(a){
 const B=G.box,f=MARS_FISSURE,zc=f.z;
 // Gantry: grating deck on two beams, side rails with posts, lamps at the corners, cross braces under it.
 const x0=54.8,x1=57.2,z0=zc-3.3,z1=zc+3.3,len=z1-z0,cz=(z0+z1)/2;
 B(a,56,-.07,cz,2.5,.14,len,'#242b30');
 for(let z=z0+.15;z<z1;z+=.3)B(a,56,.012,z,2.3,.04,.14,MC.steelL);
 B(a,56,.005,cz,.1,.02,len,MC.hazard);
 for(const x of [x0+.1,x1-.1]){B(a,x,-.36,cz,.2,.5,len,MC.steelD);B(a,x,.4,cz,.07,.07,len,MC.steelL);B(a,x,.9,cz,.07,.07,len,MC.steelL);
  for(let z=z0+.2;z<=z1;z+=1.1)B(a,x,.46,z,.07,.95,.07,MC.steel)}
 for(let z=z0+.6;z<z1;z+=1.4){B(a,56,-.52,z,2.4,.1,.12,MC.steelD);beam3(a,[x0,-.3,z],[56,-.9,z],.07,MC.steelD);beam3(a,[x1,-.3,z],[56,-.9,z],.07,MC.steelD)}
 for(const [x,z] of [[x0-.1,z0],[x1+.1,z0],[x0-.1,z1],[x1+.1,z1]])mLamp(a,x,z,1.5);
 // Strip lights along the deck edge.
 for(const x of [x0+.22,x1-.22])B(a,x,.04,cz,.04,.02,len-.4,MC.amberL,3);
 // Entry plates and "WARNING" sign at the north end.
 B(a,56,.015,z0-.5,2.4,.03,1.0,'#2d363c');B(a,56,.015,z1+.5,2.4,.03,1.0,'#2d363c');
 // Beacon terminal on a pole (right side of the pass, south of the bridge).
 const tx=59.2,tz=z1+1.3;B(a,tx,.9,tz,.14,1.8,.14,MC.steelD);B(a,tx,1.65,tz,.6,.85,.28,MC.steelX);B(a,tx-.05,1.68,tz-.15,.44,.56,.03,'#0d2a35');B(a,tx-.05,1.68,tz-.17,.38,.5,.02,MC.cyan,3);B(a,tx-.05,1.55,tz-.17,.28,.03,.02,MC.cyanD,3);B(a,tx,2.2,tz,.1,.4,.1,MC.steel);B(a,tx,2.46,tz,.06,.06,.06,'#ff5a4a',3);
 // Cable trays on the west rock wall.
 for(const z of [86,88,90])B(a,52.1,.5,z,.18,.12,1.6,MC.steelD);
}

// ---------------------------------------------------------------------------------------------------------------------------------
// The abandoned station: depot with the airlock frontage, tower, dish, two side modules, bent pipe, drifts of sand.
function marsDepotExterior(a){
 const B=G.box,amber=MC.amber;
 // Door surround: chamfered octagon look around the opening (x 55..57), amber light strips, bolt rows.
 for(const x of [54.9,57.1])B(a,x,1.3,71.04,.22,2.6,.1,amber,3);B(a,56,2.65,71.04,2.4,.22,.1,amber,3);
 for(const s of [-1,1]){mPlate(a,[56+s*1.05,2.6,71.07],[56+s*1.35,2.6,71.07],[56+s*1.35,2.2,71.07],[56+s*1.05,2.6,71.07],MC.steelD);B(a,56+s*1.55,1.3,71.06,.28,2.6,.12,MC.steelD);B(a,56+s*1.55,2.5,71.12,.2,.2,.06,MC.steelL)}
 for(let k=0;k<6;k++)B(a,55.1+k*.34,2.88,71.1,.17,.18,.03,k%2?'#2b2b2b':amber);
 mSign(a,'ARES-3',59.2,2.7,71.07,.085,'#f2a65a',0);
 // Wall plating: seams, rivets, hazard band, sand drift against the foot.
 const seam='#2e373d',faces=[[56,71.02,'z',10],[56,62.98,'z',10]];
 for(const [cx,z,ax,w] of faces)for(let x=51.6;x<=60.4;x+=1.6)B(a,x,1.75,z,.05,2.5,.03,seam);
 for(let z=63.8;z<=70.4;z+=1.6){B(a,61.02,1.75,z,.03,2.5,.05,seam);B(a,50.98,1.75,z,.03,2.5,.05,seam)}
 for(const x of [51.9,60.1])for(let y=.4;y<3.1;y+=.45)B(a,x,y,71.04,.07,.07,.04,MC.steelL);
 B(a,52.9,.22,71.03,3.4,.44,.06,MC.hazard);B(a,59.1,.22,71.03,3.4,.44,.06,MC.hazard);
 for(let k=0;k<9;k++){B(a,51.3+k*.38,.22,71.07,.18,.44,.03,'#2b2b2b');B(a,57.8+k*.38,.22,71.07,.18,.44,.03,'#2b2b2b')}
 // Roof: raised spine, vents, pipe run, solar field.
 B(a,56,3.95,67,9.6,.18,1.2,MC.steelD);for(let x=52;x<=60;x+=2)B(a,x,4.15,67,.5,.3,.7,MC.steelX);
 for(const z of [65,69])mPrism(a,56,3.8,z,'x',.14,8.6,MC.steelL,6,1);
 for(let i=0;i<4;i++){B(a,53+i*1.5,3.88,69,1.35,.06,1.8,'#1c2f4d');B(a,53+i*1.5,3.92,69,1.3,.015,1.75,'#2d4c7c')}
 // Tower (west corner of the roof): lattice legs, cross braces, ring platforms, beacon on top.
 const tx=52.8,tz=64.4,th=15;
 for(const [dx,dz] of [[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])beam3(a,[tx+dx,3.7,tz+dz],[tx+dx*.45,3.7+th,tz+dz*.45],.1,MC.steelL);
 for(let y=3.7;y<3.7+th-1;y+=2){const s=1-(y-3.7)/th*.55,t=1-(y+2-3.7)/th*.55;B(a,tx,y+.02,tz,s*1.1,.06,s*1.1,MC.steelD);
  beam3(a,[tx-.5*s,y,tz-.5*s],[tx+.5*t,y+2,tz-.5*t],.05,MC.steelD);beam3(a,[tx+.5*s,y,tz+.5*s],[tx-.5*t,y+2,tz+.5*t],.05,MC.steelD)}
 B(a,tx,3.7+th+.1,tz,.5,.5,.5,MC.steelX);B(a,tx,3.7+th+.52,tz,.2,.3,.2,MC.cyan,3);B(a,tx,3.7+th+.8,tz,.06,.5,.06,MC.steelL);
 for(const y of [8.5,12]){B(a,tx+.9,y,tz,.7,.06,.1,MC.steelL);B(a,tx+1.25,y,tz,.1,.3,.1,MC.amberL,3)}
 // Dish on a boom at the east end.
 B(a,59.6,5.1,64.4,.2,2.8,.2,MC.steelD);B(a,59.6,6.55,64.4,.4,.15,.4,MC.steelX);mDish(a,[59.6,7.2,64.9],[.2,.6,.8],1.6,'#c4ccd0');B(a,59.6,6.9,64.4,.1,.8,.1,MC.steelL);beam3(a,[59.6,7.2,64.9],[59.6,8.55,66.1],.07,MC.steelL);B(a,59.6,8.6,66.2,.14,.14,.14,MC.cyan,3);
 // Terminal cabinet and lamp to the left of the door (as in the concept art).
 B(a,53.8,.6,71.6,.9,1.2,.5,MC.steelD);B(a,53.8,1.3,71.5,.8,.7,.06,'#0d2a35');B(a,53.8,1.3,71.46,.7,.6,.02,MC.cyan,3);for(let i=0;i<4;i++)B(a,53.8,1.1+i*.1,71.44,.5-i*.08,.02,.02,MC.cyanD,3);B(a,53.8,.16,71.95,.9,.1,.5,MC.steelX);
 mLamp(a,52.6,72.0,2.3);
 // Porch: low grated platform in front of the door with side rails and amber edge lights.
 B(a,56,.07,72.1,3.4,.14,2.0,'#2a3238');for(let x=54.5;x<=57.5;x+=.3)B(a,x,.15,72.1,.1,.02,1.9,MC.steelL);for(const x of [54.4,57.6]){B(a,x,.55,72.1,.06,.06,2,MC.steelL);for(const z of [71.3,72.1,72.9])B(a,x,.3,z,.06,.55,.06,MC.steel)}
 B(a,56,.16,73.12,3.4,.03,.06,MC.amberL,3);

 // Panel inlays: slightly proud plates in three steel tones, vent grilles, vertical conduits with amber collars, wall lamps.
 const tones=['#66737b','#5a666e','#707d85'];
 const inlay=(face,coord,a0,a1,y0,y1,i)=>{const t=tones[Math.abs(Math.round(i*7+a0*3))%3],w=a1-a0,h=y1-y0,m=(a0+a1)/2,yc=(y0+y1)/2;
  if(face==='S')B(a,m,yc,71.035,w,h,.03,t);else if(face==='N')B(a,m,yc,62.965,w,h,.03,t);else if(face==='E')B(a,60.97+.04,yc,m,.03,h,w,t);else B(a,51.03-.04,yc,m,.03,h,w,t)};
 for(const [a0,a1] of [[51.15,52.55],[52.7,54.1]])for(const [y0,y1] of [[.65,1.85],[2.0,2.95]])inlay('S',0,a0,a1,y0,y1,a0);
 for(const [a0,a1] of [[58.0,59.4],[59.55,60.85]])for(const [y0,y1] of [[.65,1.85],[2.0,2.95]])inlay('S',0,a0,a1,y0,y1,a0+3);
 for(let x=51.3;x<60.6;x+=1.55)for(const [y0,y1] of [[.65,1.85],[2.0,2.95]])inlay('N',0,x,x+1.4,y0,y1,x);
 for(let z=63.3;z<70.5;z+=1.6)for(const [y0,y1] of [[.65,1.85],[2.0,2.95]]){inlay('E',0,z,z+1.45,y0,y1,z);inlay('W',0,z,z+1.45,y0,y1,z+5)}
 for(const [x,y] of [[59.4,1.3],[52.6,1.3]]){B(a,x,y,71.07,.8,.5,.05,MC.steelX);for(let i=0;i<5;i++)B(a,x,y-.18+i*.09,71.1,.7,.03,.03,'#10161a')}
 for(const x of [54.15,57.85]){mPrism(a,x,1.8,71.1,'y',.09,2.8,MC.steelL,6,1);for(const y of [.7,1.5,2.4])mPrism(a,x,y,71.1,'y',.12,.1,MC.amber,6,1,false)}
 for(const x of [54.4,57.6]){B(a,x,3.0,71.09,.3,.12,.1,MC.steelX);B(a,x,3.0,71.15,.2,.07,.03,MC.amberL,3)}
 for(const x of [52.2,53.6,58.4,59.8])B(a,x,.9,71.06,.04,1.8,.02,MC.rustD);
 // Hazard door number and status lamps beside the door.
 mSign(a,'01',54.9,3.2,71.07,.07,'#9fd0d4',0);
 for(const [x,c] of [[57.2,MC.cyan],[57.4,MC.amberL],[57.6,'#ff6a4a']])B(a,x,3.2,71.07,.1,.1,.03,c,3);
 // Roof edge: gutter-like rail and warning lights at the corners.
 for(const [x,z] of [[50.9,62.9],[61.1,62.9],[50.9,71.1],[61.1,71.1]]){B(a,x,3.78,z,.22,.2,.22,MC.steelX);B(a,x,3.92,z,.14,.06,.14,'#ff6a4a',3)}
 // Sand drifts against the foot of the walls (low wedges).
 for(const [x,z,w,d,h] of [[52.4,71.6,3.2,1.0,.34],[59.6,71.6,3.4,1.2,.4],[61.7,64.6,.9,3.4,.34],[50.2,66,.9,3.2,.4]])B(a,x,h/2,z,w,h,d,MC.sand);
}
function marsModulesGeo(a){
 const B=G.box;
 // West module: horizontal tank with rings, windows, a round hatch at its end, cradles underneath.
 const cz=66.6,r=1.75;
 mPrism(a,45.8,r+.05,cz,'x',r,10,MC.steel,12,1,true);
 for(let x=41.2;x<=50.4;x+=1.8){mPrism(a,x,r+.05,cz,'x',r+.07,.2,MC.steelD,12,1,false)}
 mPrism(a,40.7,r+.05,cz,'x',1.0,.2,MC.steelX,12,1,true);mPrism(a,40.55,r+.05,cz,'x',.7,.1,MC.steelL,12,1,true);
 B(a,40.5,r+.05,cz,.1,.12,1.1,MC.amber,3);B(a,40.5,r+.05,cz,.1,1.1,.12,MC.amber,3);
 for(const x of [43.1,45.9,48.7]){B(a,x,2.0,cz+r-.02,.7,.4,.06,'#0d2a35');B(a,x,2.0,cz+r+.0,.62,.3,.03,MC.amberL,3)}
 for(const x of [42.2,49.4]){B(a,x,.45,cz,.5,.9,3.0,MC.steelD);B(a,x,.9,cz,.7,.12,3.0,MC.steelX)}
 B(a,50.7,2.0,cz,.8,1.8,1.8,MC.steelD);B(a,50.9,2.0,cz,.5,1.5,1.5,MC.steelX);
 mPrism(a,45.8,3.5,cz-.4,'x',.17,8.8,MC.steelL,6,1);
 // Rust streaks under the windows.
 for(const x of [43.1,45.9,48.7])B(a,x,1.35,cz+r-.07,.12,.9,.03,MC.rustD);
 // East module (shorter), reached by a raised pipe from the depot's east wall.
 const ex=68.5;mPrism(a,ex,r+.05,cz,'x',r,5.6,MC.steel,12,1,true);
 for(let x=66.3;x<=70.8;x+=1.8)mPrism(a,x,r+.05,cz,'x',r+.07,.2,MC.steelD,12,1,false);
 B(a,ex,2.0,cz+r-.02,.7,.4,.06,'#0d2a35');B(a,ex,2.0,cz+r,.62,.3,.03,MC.amberL,3);
 B(a,66.0,2.0,cz,.5,1.5,1.5,MC.steelX);
 mPrism(a,63.5,2.9,cz,'x',.28,5.0,MC.steelL,8,1);for(const x of [61.4,65.5])mPrism(a,x,2.9,cz,'x',.34,.2,MC.amber,8,1,false);
 // Bent pipe lying across the apron east of the door (the broken line in the concept art).
 mPrism(a,64.6,.38,73.2,'x',.34,3.2,MC.steelL,8,1,true);mPrism(a,66.5,.38,74.0,'z',.34,2.4,MC.steelL,8,1,true);mPrism(a,66.1,.38,73.2,'x',.4,.3,MC.amber,8,1,false);
}

// ---------------------------------------------------------------------------------------------------------------------------------
// The wreck of a supply ship in the west rock face: a torn hull with an open service bay (cyan strips, engine drum, terminal).
function marsWreckGeo(a){
 const B=G.box,hx=39.4,hz=80,bz=hz-.5;
 // Hull body: stepped, rounded-looking section with panel lines, leaning into the cliff.
 B(a,hx,1.7,hz-1,6.4,3.4,12,MC.steelD);B(a,hx,3.7,hz-1,5.4,.9,11.2,MC.steel);B(a,hx,4.35,hz-1.4,4.0,.6,10,MC.steelD);B(a,hx-.2,4.8,hz-1.8,2.4,.4,8,MC.steel);
 for(let z=hz-6.4;z<=hz+4.6;z+=1.55){B(a,hx+3.23,1.9,z,.1,3.2,.1,MC.steelX);B(a,hx+2.73,3.75,z,.1,.9,.1,MC.steelX)}
 for(const [z0,z1,y0,y1,t] of [[hz-6.2,hz-4.2,.6,2.8,MC.steel],[hz+1.8,hz+4.4,.7,3.0,MC.steelL],[hz-3.6,hz-1.7,2.0,3.1,MC.rustD]])B(a,hx+3.26,(y0+y1)/2,(z0+z1)/2,.05,y1-y0,z1-z0,t);
 // Torn stern: bare ribs (arches) with a few plates still hanging on them.
 const rib=(z,s)=>{const pts=[[-3.2,0],[-3.2,2.2*s],[-2.2,3.6*s],[0,4.2*s],[2.2,3.6*s],[3.2,2.2*s],[3.2,0]];for(let i=0;i<pts.length-1;i++)beam3(a,[hx+pts[i][0],pts[i][1],z],[hx+pts[i+1][0],pts[i+1][1],z],.22,MC.steelL)};
 rib(hz+5.4,1);rib(hz+6.5,.9);rib(hz+7.6,.7);rib(hz+8.6,.45);
 for(const z of [hz+5.4,hz+6.5,hz+7.6])beam3(a,[hx-3.1,.1,z],[hx-3.1,.1,z+1.1],.14,MC.steelL);
 beam3(a,[hx+2.9,2.0,hz+5.4],[hx+2.4,3.3,hz+8.0],.14,MC.steelD);beam3(a,[hx-2.9,1.6,hz+5.4],[hx-2.8,3.0,hz+7.8],.14,MC.steelD);
 mPlate(a,[hx+3.3,.2,hz+5.5],[hx+3.4,2.4,hz+5.5],[hx+3.9,2.0,hz+7.4],[hx+3.7,.1,hz+7.4],MC.steel);
 mPlate(a,[hx+2.0,3.9,hz+5.5],[hx+3.0,3.0,hz+5.6],[hx+3.6,3.4,hz+7.0],[hx+2.4,4.2,hz+7.0],MC.rust);
 // Service bay: amber frame, lit back wall in cyan strips, engine drum with rings on a cradle.
 B(a,hx+3.4,2.0,bz,.2,3.0,5.2,MC.steelX);for(const dz of [-2.7,2.7])B(a,hx+3.55,1.55,bz+dz,.34,3.2,.3,MC.steelL);B(a,hx+3.55,3.2,bz,.34,.3,5.7,MC.steelL);
 for(const dz of [-2.7,2.7])B(a,hx+3.75,1.55,bz+dz,.06,3.1,.08,MC.amberL,3);B(a,hx+3.75,3.04,bz,.06,.08,5.4,MC.amberL,3);
 for(let i=0;i<4;i++)B(a,hx+3.46,.6+i*.7,bz,.04,.1,4.7,i%2?MC.cyanD:MC.cyan,3);
 for(let i=0;i<5;i++){B(a,hx+3.44,1.5,bz-2.1+i*1.05,.04,2.6,.08,MC.steelD)}
 mPrism(a,hx+4.4,1.0,bz,'z',.85,2.2,MC.steel,12,1,true);for(const dz of [-.9,-.3,.3,.9])mPrism(a,hx+4.4,1.0,bz+dz,'z',.9,.16,MC.amber,12,1,false);
 mPrism(a,hx+4.4,1.0,bz+1.3,'z',.5,.5,MC.steelX,12,1,true);B(a,hx+4.4,.28,bz,1.8,.56,2.6,MC.steelD);B(a,hx+4.4,1.95,bz,.5,.4,.5,MC.cyan,3);
 for(const dz of [-.8,.8])beam3(a,[hx+4.4,1.9,bz+dz],[hx+3.5,3.0,bz+dz*1.6],.09,MC.black);
 B(a,hx+3.8,.04,bz,1.0,.05,5.0,'#2d363c');
 // Sealed side door with a terminal (cyan screen on a stand) north of the bay.
 B(a,hx+3.4,1.4,hz-4.6,.16,2.6,1.7,MC.steel);B(a,hx+3.5,1.4,hz-4.6,.06,2.3,1.4,MC.steelX);B(a,hx+3.52,1.4,hz-4.6,.04,.5,.04,MC.amberL,3);
 for(const dz of [-.8,.8])B(a,hx+3.56,1.4,hz-4.6+dz,.04,2.4,.05,MC.amberL,3);
 B(a,hx+4.3,.55,hz-6.0,.8,1.1,.5,MC.steelD);B(a,hx+3.9,1.2,hz-6.0,.04,.6,.4,'#0d2a35');B(a,hx+3.88,1.2,hz-6.0,.02,.5,.34,MC.cyan,3);for(let i=0;i<3;i++)B(a,hx+3.87,1.0+i*.12,hz-6.0,.02,.03,.28-i*.06,MC.cyanD,3);
 // Debris, crates, pipes, tracks, sand banks.
 B(a,hx+5.0,.4,hz+4.8,1.4,.8,1.0,MC.rust);B(a,hx+5.1,.9,hz+4.7,1.2,.2,.9,MC.steelD);B(a,hx+5.4,.3,hz+6.0,.9,.6,.8,MC.steel);B(a,hx+5.6,.22,hz-2.8,1.6,.12,.9,MC.steelL);
 mPrism(a,hx+5.2,.34,hz+2.7,'z',.34,3.0,MC.steelL,8,1,true);mPrism(a,hx+5.2,.34,hz+2.7,'z',.4,.3,MC.amber,8,1,false);
 mPlate(a,[hx+4.3,.05,hz+7.4],[hx+5.7,.05,hz+7.6],[hx+5.6,.9,hz+8.2],[hx+4.5,.7,hz+7.9],MC.steel);
 B(a,hx+4.6,.14,hz-7.7,1.6,.28,.8,MC.steelX);B(a,hx+5.8,.25,hz-8.0,.9,.5,.9,MC.rust);
 for(const [dx,dz,w,d,h] of [[3.6,-7.7,2.4,1.8,.7],[4.6,8.4,2.8,2.0,.8],[1.5,9.5,3.0,2.0,.9],[-1.5,-8,3,2,1]])B(a,hx+dx,h/2,hz+dz,w,h,d,MC.sand);
 mLamp(a,hx+5.2,hz-4.4,2.0);mLamp(a,hx+5.2,hz+4.6,2.0);
}

function marsSitesGeo(a){marsGroundGeo(a);marsPassGeo(a);marsDepotExterior(a);marsModulesGeo(a);marsWreckGeo(a)}

// Colliders of the outdoor structures.
function marsSiteColliders(add){
 const f=MARS_FISSURE;
 // Fissure: only the bridge corridor (x 54.8..57.2) is open, the rest of the pass is closed off along the edge.
 add(53.35,f.z,2.9,4.2,1);add(58.65,f.z,2.9,4.2,1);
 // Bridge deck bounds stay open; rails are visual.
 // Depot side modules and sand drifts, wreck hull, pad crates.
 add(45.8,66.6,10.4,3.6,3.5);add(68.5,66.6,5.8,3.6,3.5);
 add(40.6,80,9,14.2,4);
 {const L=MZ.lander;add(L.x-5.45,L.z-.3,2.9,.14,1);add(L.x-5.45,L.z+1.3,2.9,.14,1);}
 add(MZ.lander.x+6.1,MZ.lander.z-3.3,1.4,1.1,1.1);add(MZ.lander.x+5.6,MZ.lander.z+4.1,1.2,1.8,1.1);
 add(53.8,71.9,.9,.5,1.2);
}
