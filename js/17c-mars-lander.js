/* Mars interlude, part 1c: the KESTREL-2 lander (hull, landing gear + boarding stage, glass). Local coordinates:
   x -4..4 (west..east), z -3..3 (north = nose with the cockpit window, west = hatch, south = engines and docking collar). */
'use strict';
function marsGeoLanderShell(a){
 const B=G.box,hull='#4a5660',hullL='#66737d',hullD='#30393f',dark='#1f262b',acc=MC.amber;
 // Core walls (collision-matching): north wall with the cockpit window, east and south walls, west wall with the hatch opening.
 B(a,0,.35,-2.5,8,.7,1,hull);B(a,0,2.575,-2.5,8,.25,1,hull);B(a,-3.6,1.575,-2.5,.8,1.75,1,hull);B(a,3.6,1.575,-2.5,.8,1.75,1,hull);
 B(a,0,1.35,2.5,8,2.7,1,hull);B(a,3.5,1.35,0,1,2.7,4,hull);
 B(a,-3.5,1.35,-1,1,2.7,2,hull);B(a,-3.5,1.35,1.5,1,2.7,1,hull);B(a,-3.5,2.5,.5,1,.4,1,hull);
 B(a,0,2.95,0,8,.5,6,hull);
 B(a,0,.03,0,8,.06,6,dark);
 // Skirt around the hull with hazard chevrons at the nose.
 for(const [x,z,w,d] of [[0,3.04,8.2,.08],[4.04,0,.08,6]])B(a,x,.2,z,w,.4,d,dark);
 B(a,-4.04,.2,-1.5,.08,.4,3,dark);B(a,-4.04,.2,2,.08,.4,2,dark);
 // ---- Nose: chin slope, brow, cheeks, canopy frame and lamps (the angular teal canopy of the concept art).
 mPlate(a,[-4,.7,-3],[4,.7,-3],[3.5,.2,-3.95],[-3.5,.2,-3.95],hullD);
 mPlate(a,[-4,2.75,-3],[4,2.75,-3],[3.4,2.3,-3.7],[-3.4,2.3,-3.7],hullL);
 mPlate(a,[-4,2.75,-3],[-4,.7,-3],[-3.5,.2,-3.95],[-3.4,2.3,-3.7],hull);
 mPlate(a,[4,2.75,-3],[4,.7,-3],[3.5,.2,-3.95],[3.4,2.3,-3.7],hull);
 for(const x of [-3.2,-1.6,0,1.6,3.2])beam3(a,[x,.75,-3.05],[x*1.05,.25,-3.92],.13,hullD);
 for(const x of [-3.3,-1.65,0,1.65,3.3])beam3(a,[x,2.45,-3.04],[x*1.0,2.3,-3.66],.12,hullD);
 B(a,0,2.31,-3.69,6.8,.06,.06,MC.cyan,3);B(a,0,.22,-3.96,7.0,.06,.04,MC.cyan,3);
 for(const x of [-3.45,3.45]){B(a,x,.5,-3.88,.55,.3,.12,'#2a2f33');B(a,x,.5,-3.95,.45,.2,.05,MC.amberL,3)}
 for(let x=-3.6;x<3.7;x+=.6)B(a,x,.1,-3.97,.3,.14,.03,(Math.round(x/.6)&1)?acc:'#2a2a2a');
 B(a,0,2.78,-3.1,6.2,.1,.3,hullD);B(a,0,2.74,-3.32,5.4,.04,.05,'#f4e2b0',3);
 // ---- Roof: raised hump with a spine, radiator fins aft, mast and dish, thruster pods.
 B(a,0,3.45,-.2,5.4,.5,3.4,hullL);B(a,0,3.72,-.2,4.6,.05,2.8,hull);B(a,0,3.76,-.2,.1,.04,2.8,hullD);
 for(let x=-2.2;x<=2.3;x+=.45)B(a,x,3.5,2.15,.12,.5,1.1,hullD);
 B(a,0,3.3,2.0,5.2,.12,1.7,dark);
 B(a,-3.1,3.7,-1.8,.14,1.1,.14,'#7e8488');B(a,-3.1,4.3,-1.8,.05,.5,.05,'#7e8488');B(a,-3.1,4.58,-1.8,.1,.06,.1,'#ff5a4a',3);
 mDish(a,[2.6,4.15,-1.2],[.5,.8,-.3],.9,'#c4ccd0');B(a,2.6,3.9,-1.2,.1,.45,.1,hullD);
 for(const x of [-3.3,3.3])for(const z of [-2.2,2.2])B(a,x,3.4,z,.7,.28,.7,dark);
 // ---- Side armour: inset panels, light strips, vents, name. East side (visible from the track).
 for(const z of [-2.05,-.6,.85,2.3])B(a,4.05,1.45,z,.05,1.5,1.2,hullL);
 for(const z of [-2.05,-.6,.85,2.3])B(a,4.08,2.1,z,.03,.08,1.0,hullD);
 B(a,4.07,2.65,0,.04,.1,5.6,acc,3);B(a,4.07,.8,0,.04,.07,5.6,MC.cyanD,3);
 for(let i=0;i<4;i++)B(a,4.1,1.0+i*.14,2.4,.04,.05,.8,dark);
 mSign(a,'KESTREL',4.09,1.9,.2,.11,'#c9d4d8',Math.PI/2);
 mSign(a,'MK4',4.09,1.2,.2,.1,acc,Math.PI/2);
 // West side next to the hatch: panels, lights, status lamps.
 for(const z of [-2.1,-.7,2.3])B(a,-4.05,1.45,z,.05,1.4,1.1,hullL);
 B(a,-4.07,2.65,-1.2,.04,.1,3.2,acc,3);B(a,-4.07,2.65,2.1,.04,.1,1.6,acc,3);
 // Hatch frame (outside) with amber light strips and a call panel.
 for(const z of [-.12,1.12])B(a,-4.08,1.2,z,.14,2.5,.18,hullD);B(a,-4.08,2.5,.5,.14,.22,1.45,hullD);
 B(a,-4.16,1.2,-.12,.03,2.4,.05,acc,3);B(a,-4.16,1.2,1.12,.03,2.4,.05,acc,3);B(a,-4.16,2.4,.5,.03,.05,1.2,acc,3);
 B(a,-4.12,1.35,1.5,.1,.35,.4,'#0d2a35');B(a,-4.14,1.35,1.5,.04,.28,.32,MC.cyan,3);
 // ---- Aft: engine bells and the docking collar on the south face.
 for(const x of [-2.9,2.9]){B(a,x,1.0,3.5,1.1,1.3,.8,dark);B(a,x,1.0,3.93,.8,.9,.1,'#14232c',1);for(const dy of [-.5,.5])B(a,x,1.0+dy,3.95,1.2,.06,.1,hullD)}
 B(a,0,1.3,3.12,1.9,2.1,.24,'#5b6268');B(a,0,1.3,3.26,1.5,1.7,.08,'#2d3338');B(a,0,2.4,3.3,1.2,.1,.1,acc);
}
// Landing gear, boarding stage, markings: only drawn while the lander stands on the ground.
function marsGeoLanderGear(a){
 const B=G.box,hullL='#6c7983',dark='#242c32',hullD='#39444c';
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const ax=sx*3.75,az=sz*2.55,fx=sx*4.95,fz=sz*3.95;
  beam3(a,[ax,1.55,az],[fx,.3,fz],.26,hullL);beam3(a,[ax,1.55,az],[fx*.92+ax*.08,.7,fz*.92+az*.08],.38,hullD);
  beam3(a,[sx*3.95,.7,sz*2.9],[fx,.25,fz],.1,hullD);
  B(a,fx,.09,fz,1.1,.18,1.1,dark);B(a,fx,.2,fz,.9,.04,.9,'#7a8288');B(a,fx,.15,fz+sz*.56,.9,.04,.04,MC.amberL,3);
  mPrism(a,fx,.4,fz,'y',.16,.4,'#8c979d',8,1,true)}
 // Stairs to the hatch (west): the hull floor is 1.1 m above the ground. Six solid steps with amber nosing, rails on both sides.
 const H=MZ.lift,n=6,sx0=-6.9,sw=.48;
 for(let i=0;i<n;i++){const top=(i+1)*H/n,xc=sx0+i*sw+sw/2;B(a,xc,top/2,.5,sw,top,1.4,'#2b343a');B(a,xc,top+.006,.5,sw-.04,.012,1.32,'#3a454c');B(a,xc-sw/2+.03,top+.012,.5,.05,.02,1.32,MC.amberL,3);for(let k=0;k<5;k++)B(a,xc+.05,top+.016,-.1+k*.3,.2,.01,.06,MC.steelL)}
 for(const z of [-.25,1.25]){beam3(a,[sx0,.95,z],[-4.0,.95+H,z],.07,MC.steelL);beam3(a,[sx0,.55,z],[-4.0,.55+H,z],.05,MC.steel);
  for(let i=0;i<=n;i+=2){const x=sx0+i*sw,y=i*H/n;B(a,x,y/2+.45,z,.06,y+.9,.06,MC.steel)}
  beam3(a,[sx0,.1,z],[-4.0,H+.1,z],.05,MC.amberL)}
 B(a,sx0-.25,.03,.5,.5,.06,1.6,'#2d363c');B(a,sx0+.06,.06,.5,.05,.03,1.5,MC.amberL,3);
 B(a,-4.22,H+.45,1.45,.5,1.0,.3,MC.steelX);B(a,-4.22,H+.8,1.29,.36,.4,.03,'#0d2a35');B(a,-4.22,H+.8,1.27,.3,.32,.02,MC.cyan,3);
 // Bolted support frame under the nose chin.
 B(a,0,.1,-4.4,6.2,.2,.4,dark);
}
// Cockpit glass: the window itself plus a sloped canopy pane in front of it (world coordinates, glass is not transformed).
function marsGeoGlass(a){
 const q=(p,n)=>G.quad(a,p[0],p[1],p[2],p[3],n,'#8fb8c6',5);
 const L=MZ.lander,x=L.x,z=L.z;
 q([[x-3.2,.7,z-2.46],[x+3.2,.7,z-2.46],[x+3.2,2.45,z-2.46],[x-3.2,2.45,z-2.46]],[0,0,1]);
 // Sloped canopy: from the brow down to the chin, covering the window like a bubble.
 q([[x-3.4,2.3,z-3.7],[x+3.4,2.3,z-3.7],[x+3.5,.2,z-3.95],[x-3.5,.2,z-3.95]],[0,.6,-.8]);
}
