/* Hydroponics room layout, console, hatches, windows. */
'use strict';
// One shared layout feeds rendering, collision, lighting and the preview.
const hydroBeds=[{x:44.5,z:35.4},{x:51.5,z:35.4},{x:44.5,z:40.6},{x:51.5,z:40.6}];
const hydroConsole={x:41.8,z:42.4,a:.55,w:1.85,d:1.55};
let hydroConsoleMesh,hydroScreenMesh,hydroScreenReadyMesh,hydroHatchL,hydroHatchR;
function hydroWindowGlass(glass,z){
 // Two separated pressure panes give glass a readable tint without hiding the machinery outside.
 for(const x of [55.12,55.16])G.quad(glass,[x,.48,z],[x,.48,z+1],[x,3.03,z+1],[x,3.03,z],[-1,0,0],'#91b3c5',5);
}
function hydroNorthGlass(glass,x){
 for(const z of [30.12,30.16])G.quad(glass,[x,.48,z],[x+1,.48,z],[x+1,3.03,z],[x,3.03,z],[0,0,1],'#91b3c5',5);
}
function hydroTube(arr,a,b,r,col,segments=8){
 const v=b.map((n,i)=>n-a[i]),len=Math.hypot(...v);if(!len)return;const w=v.map(n=>n/len);
 const ref=Math.abs(w[1])>.9?[1,0,0]:[0,1,0];let u=[w[1]*ref[2]-w[2]*ref[1],w[2]*ref[0]-w[0]*ref[2],w[0]*ref[1]-w[1]*ref[0]],ul=Math.hypot(...u);u=u.map(n=>n/ul);const t=[w[1]*u[2]-w[2]*u[1],w[2]*u[0]-w[0]*u[2],w[0]*u[1]-w[1]*u[0]];
 const point=(base,ang)=>base.map((n,i)=>n+r*(u[i]*Math.cos(ang)+t[i]*Math.sin(ang)));
 for(let k=0;k<segments;k++){const q=k*Math.PI*2/segments,qq=(k+1)*Math.PI*2/segments,n=u.map((v,i)=>v*Math.cos((q+qq)/2)+t[i]*Math.sin((q+qq)/2));G.quad(arr,point(a,q),point(b,q),point(b,qq),point(a,qq),n,col);}
}
function hydroFloorGrate(arr,x,z,w,d){const B=G.box;B(arr,x,.011,z,w,.018,d,'#0d2027');const long=d>w;for(let t=-(long?d:w)/2+.06;t<(long?d:w)/2;t+=.14)B(arr,x+(long?0:t),.029,z+(long?t:0),long?w:.05,.028,long?.05:d,'#53676a');}
function hydroPlant(arr,x,z,seed){const B=G.box;const rnd=n=>{const v=Math.sin(seed*83.17+n*37.41)*431.315;return v-Math.floor(v);};const h=.45+rnd(1)*.65;
 const palette=['#426144','#64854a','#84a957','#a4bf69','#547c48'];
 hydroTube(arr,[x,1.01,z],[x+.08,1.02+h,z-.04],.025,'#678649',5);
 // Stepped clusters form leaves with volume; alternating branches avoid repeated crosses.
 for(let k=0;k<5;k++){const a=rnd(k+4)*Math.PI*2,spread=.17+rnd(k+30)*.17,yy=1.15+h*k/5;
  const ex=x+Math.cos(a)*spread,ez=z+Math.sin(a)*spread;
  hydroTube(arr,[x+.04,yy-.10,z],[ex,yy+.02,ez],.017,'#5e7d43',5);
  for(let j=0;j<3;j++){const f=(j+1)/3,sz=j===1?.15:.10;B(arr,x+(ex-x)*f,yy+f*.07,z+(ez-z)*f,sz,.10+(j===1?.03:0),sz,palette[(seed+k+j)%palette.length]);}
 }
 B(arr,x+.08,1.03+h,z-.04,.13,.16,.12,palette[3]);
}
function hydroCoolantPort(){const p=hydroConsole,c=Math.cos(p.a),s=Math.sin(p.a);return [p.x-.74*c-.06*s,.3,p.z+.74*s-.06*c];}
function hydroCoolantLines(){
 const lines=[[[40.3,.3,42.4],[40.3,.3,31.4]],[[40.3,.3,31.4],[52.55,.3,31.4]],[[40.3,.3,42.4],hydroCoolantPort()],[[50.7,2.5,32],[52.55,2.5,32]],[[52.55,2.5,32],[52.55,.3,32]],[[52.55,.3,32],[52.55,.3,31.4]]];
 for(const x of [50.7,52])lines.push([[x,2.5,30.8],[x,2.5,32]],[[x,.3,30.8],[x,.3,31.4]]);
 return lines;
}
function decorateHydro(arr){const B=G.box;
 // Lower wall skirts and structural ribs replace random illuminated wall tiles.
 for(const x of [40.06,54.93]){B(arr,x,.16,37.5,.13,.3,15,'#172c36');B(arr,x,3.18,37.5,.22,.25,15,'#263b48');}
 for(let z=30.6;z<46;z+=2.4){
  B(arr,47.5,3.36,z,15,.24,.16,'#1b2d38');B(arr,47.5,3.49,z,15,.035,.35,'#4a6068');
  for(const x of [40.14,54.85]){if(x>50&&z>31&&z<44)continue;B(arr,x,1.7,z,.14,2.8,.11,'#1c303b');B(arr,x,1.7,z+.08,.065,2.5,.04,'#5b6f77');}
 }
 for(const z of [31,33.3,36.2,41.1]){B(arr,40.15,2.82,z,.14,.16,.7,'#34444a');B(arr,40.235,2.82,z,.025,.09,.52,'#cfa26a',3);}
 // The entry lamp belongs entirely to the solid jamb at z45..46.
 // Its housing also overlaps the wall trim instead of hanging ahead of it.
 B(arr,40.095,2.82,45.55,.16,.16,.7,'#34444a');
 B(arr,40.185,2.82,45.55,.025,.09,.52,'#cfa26a',3);
 for(const z of [31,45]){B(arr,47.5,3.25,z,1.6,.09,.14,'#a3c9ad',3);lights.push({x:47.5,y:2.95,z,r:7,c:'#779caa'});}
 // Every bed has soil, side service panels, separate feet, pipes and a supported lamp.
 for(const [index,p]of hydroBeds.entries()){
  const {x,z}=p;const w=2.2,d=3.6;
  for(const dx of [-.87,.87])for(const dz of [-1.42,1.42]){B(arr,x+dx,.12,z+dz,.23,.24,.3,'#192c33');B(arr,x+dx,.25,z+dz,.18,.13,.24,'#596b68');}
  B(arr,x,.51,z,w,.68,d,'#2d4547',2);B(arr,x,.91,z,w+.12,.14,d+.12,'#738476');B(arr,x,.98,z,w-.22,.03,d-.23,'#18281f');
  for(let k=0;k<27;k++){const dx=Math.sin(k*31+index)*.86,dz=Math.cos(k*17+index)*1.52;B(arr,x+dx,1.01,z+dz,.07,.035,.08,k%3?'#29392a':'#49553a');}
  for(const side of [-1,1]){
   B(arr,x+side*1.115,.55,z,.035,.46,3.2,'#152b33');B(arr,x+side*1.145,.55,z,.025,.33,2.5,'#3b5554');
   for(let dz=-1.35;dz<1.5;dz+=.9){B(arr,x+side*1.17,.56,z+dz,.05,.34,.065,'#879081');for(const yy of [.38,.73])B(arr,x+side*1.2,yy,z+dz,.04,.06,.06,'#a4ac92');}
   hydroTube(arr,[x+side*1.17,.32,z-1.3],[x+side*1.17,.32,z+1.3],.075,'#768b83');
   // Both exposed ends turn into the sealed grow-bed housing.
   for(const dz of [-1.3,1.3])hydroTube(arr,[x+side*1.17,.32,z+dz],[x+side*1.04,.32,z+dz],.075,'#768b83');
   for(const dz of [-1.15,0,1.15])B(arr,x+side*1.18,.32,z+dz,.21,.21,.09,'#344d50');
  }
  B(arr,x,.53,z+1.83,1.78,.52,.035,'#162e37');
  for(let k=0;k<8;k++)B(arr,x-.70+k*.2,.54,z+1.865,.09,.31,.025,'#556b65');
  B(arr,x-.72,.73,z+1.89,.13,.15,.025,'#dfa15a',3);
  hydroFloorGrate(arr,x-1.4,z,.22,4.05);hydroFloorGrate(arr,x+1.4,z,.22,4.05);hydroFloorGrate(arr,x,z+2.0,2.8,.22);
  for(let row=0;row<5;row++)for(let col=0;col<3;col++)hydroPlant(arr,x-.64+col*.61+Math.sin(row+col)*.06,z-1.32+row*.66,index*17+row*3+col);
  // Ceiling hangers meet both lamp and structural ceiling. The underside emits gently.
  for(const dz of [-1.15,1.15]){B(arr,x,3.16,z+dz,.10,.64,.12,'#526863');B(arr,x,3.43,z+dz,.30,.1,.32,'#273d47');}
  B(arr,x,2.83,z,2.30,.17,3.3,'#455c5b');B(arr,x,2.73,z,2.15,.055,3.14,'#99ca96',3);
  for(const dx of [-1.14,1.14])B(arr,x+dx,2.82,z,.07,.19,3.4,'#708477');
  B(arr,x,2.95,z,1.9,.06,2.9,'#253e43');
  lights.push({x,y:2.57,z,r:4.6,c:'#a0ce83'},{x:x-1.4,y:1.4,z:z+.6,r:3.5,c:'#537e66'});
 }
 // Rigid pressure-window frame, sill, embedded fasteners and emergency shutters.
 for(const y of [.5,3.04]){B(arr,55.02,y,37.5,.42,.22,13.2,'#71818a');B(arr,54.79,y,37.5,.045,.06,13,'#253f4d');}
 for(const z of [31,34.25,37.5,40.75,44]){B(arr,55.05,1.77,z,.35,2.55,.14,'#334c5c');B(arr,54.84,1.77,z,.075,2.4,.06,'#71848c');for(const y of [.66,2.89])B(arr,54.78,y,z,.04,.07,.09,'#a6b3ab');}
 for(let z=31.4;z<44;z+=.75){B(arr,54.8,.28,z,.06,.18,.4,'#243d4a');B(arr,54.75,.3,z,.04,.035,.26,'#849695');}
 // Dark rubber gaskets and subtle etched reflections sit on the inner pressure pane.
 for(const start of [31,34.25,37.5,40.75]){
  for(const y of [.615,2.925])B(arr,55.10,y,start+1.625,.035,.03,3.14,'#142e3b');
  for(const z of [start+.07,start+3.18])B(arr,55.10,1.77,z,.035,2.34,.04,'#142e3b');
  for(const z of [start+.25,start+2.88]){B(arr,55.09,.87,z,.014,.028,.16,'#66818a');B(arr,55.09,.93,z+.065,.014,.13,.028,'#66818a');}
  G.quad(arr,[55.105,2.71,start+.40],[55.105,2.71,start+.48],[55.105,2.38,start+1.68],[55.105,2.38,start+1.60],[-1,0,0],'#294b57',3);
 }
 // North glazing faces the exterior walkway; its tanks are fixed to a real pressure bulkhead.
 for(const y of [.50,3.04]){B(arr,49.5,y,30.02,11,.22,.42,'#71818a');B(arr,49.5,y,30.25,10.8,.06,.045,'#253f4d');}
 for(const x of [44.02,47,49.97,53.03,54.98]){
  B(arr,x,1.77,30.05,.16,2.55,.35,'#334c5c');
  // Only the last silver inset shared its west face x54.95 with the native
  // corner wall. Shift inset and its bolts 25mm into the room; frame unchanged.
  const trimX=x===54.98?x-.025:x;
  B(arr,trimX,1.77,30.26,.06,2.40,.075,'#71848c');
  for(const y of [.66,2.89])B(arr,trimX,y,30.31,.09,.07,.04,'#a6b3ab');
 }
 for(const [a,b]of [[44.12,46.9],[47.1,49.87],[53.13,54.88]]){
  for(const y of [.615,2.925])B(arr,(a+b)/2,y,30.19,b-a,.03,.035,'#142e3b');
  for(const x of [a,b])B(arr,x,1.77,30.19,.04,2.34,.035,'#142e3b');
  G.quad(arr,[a+.20,2.70,30.195],[a+.30,2.70,30.195],[b-.35,2.31,30.195],[b-.45,2.31,30.195],[0,0,1],'#456570',3);
  for(const x of [a+.20,b-.20]){B(arr,x,.87,30.20,.16,.028,.014,'#829da4');B(arr,x+.065,.93,30.20,.028,.13,.014,'#829da4');}
 }
 B(arr,51.5,1.70,30.055,3.0,3.4,.12,'#2c4551');
 for(const x of [50.7,52])for(const y of [.65,2.20])B(arr,x,y,30.38,.70,.12,.54,'#627a7b');
 // A narrow service backboard stays on solid west wall, clear of both access passages and vent.
 B(arr,40.06,1.40,42.275,.12,2.25,1.15,'#203b46');
 for(const z of [41.78,42.76])for(const y of [.40,2.40])B(arr,40.135,y,z,.04,.07,.07,'#788d8b');
 // Supply and return have real junctions; no tube ends in the room.
 for(const x of [50.7,52]){
  hydroTube(arr,[x,.27,30.8],[x,2.55,30.8],.30,'#526e69');
  for(const y of [.3,1.4,2.5])B(arr,x,y,30.8,.65,.11,.66,'#96a396');
  B(arr,x,1.45,31.115,.12,1.5,.035,'#7cba9a',3);
 }
 for(const line of hydroCoolantLines())hydroTube(arr,line[0],line[1],.075,'#809a8c');
 for(const x of [50.7,52,52.55]){
  B(arr,x,2.5,32,.22,.22,.22,'#445e61');
  B(arr,x,.3,31.4,.22,.22,.22,'#445e61');
 }
 for(const y of [.55,1.5,2.35]){
  B(arr,52.55,y,31.07,.22,.10,1.95,'#526b6d');
  B(arr,52.55,y,30.21,.34,.16,.22,'#324b55');
 }
 // Connector is inside the actual rotated pedestal, not beside its bounding box.
 const port=hydroCoolantPort();B(arr,port[0],port[1],port[2],.23,.23,.23,'#5c7776');
 for(let z=32;z<43;z+=1.2)B(arr,40.3,.3,z,.26,.26,.08,'#283f48');
 // Vents are always bolted onto solid wall sections, never onto a door opening.
 for(const z of [36.2,41.1])hydroVent(arr,40.08,2.1,z);
 B(arr,51.5,3.0,30.24,2.8,.35,.13,'#1b303c');label(arr,'HYDROPONICS',50.28,3.12,30.335,.056,'#90bba8');
 for(let x=40.5;x<54.5;x+=1.5){B(arr,x,.016,45.5,.32,.022,.12,'#8d8055');}
 decorateHydroHatch(arr);
}
function hydroVent(arr,x,y,z){const B=G.box;B(arr,x,y,z,.16,1.08,1.08,'#172a35');B(arr,x+.10,y,z,.08,.94,.94,'#566e74');B(arr,x+.15,y,z,.035,.77,.77,'#0d202a');
 for(let k=0;k<6;k++){const a=k*Math.PI/3;hydroTube(arr,[x+.18,y,z],[x+.18,y+Math.cos(a)*.30,z+Math.sin(a)*.30],.085,'#344a53',4);}B(arr,x+.21,y,z,.05,.18,.18,'#7b8b8b');
 for(let t=-.38;t<.4;t+=.12)B(arr,x+.25,y,z+t,.025,.82,.025,'#53666e');for(const dy of [-.48,.48])for(const dz of [-.48,.48])B(arr,x+.17,y+dy,z+dz,.04,.055,.055,'#acb5a7');}
function makeHydroAssets(){const B=G.box,t=[];
 // Bespoke console: wide faceted pedestal, large recessed CRT, sloped keyboard and feet.
 B(t,0,.08,0,1.7,.16,1.25,'#182c34');B(t,0,.48,-.06,1.52,.72,1.05,'#3b5255',2);B(t,0,.85,.04,1.74,.10,1.25,'#708078');
 B(t,0,1.52,-.24,1.75,1.25,.57,'#455d5d',2);B(t,0,1.52,.063,1.53,1.03,.07,'#829084');B(t,0,1.52,.109,1.34,.84,.06,'#101f26');B(t,0,1.52,.146,1.20,.71,.016,'#153c38',3);
 for(const x of [-.79,.79])for(const y of [1.03,2.01]){B(t,x,y,.077,.065,.065,.035,'#9ca797');B(t,x,y,.101,.034,.012,.012,'#273c43');}
 // Keyboard slopes downward towards the player in physical tiers.
 for(let row=0;row<4;row++){const y=1.04-row*.055,z=.28+row*.115;B(t,-.18,y-.035,z,1.15,.09,.13,'#596f6c');for(let k=0;k<10;k++)B(t,-.69+k*.108,y+.018,z,.077,.033,.068,(row+k)%9===0?'#95a797':'#233c42');}
 B(t,.62,.93,.45,.34,.12,.45,'#344d52');for(const z of [.30,.45,.60])B(t,.62,1.0,z,.19,.05,.085,z===.45?'#d99b50':'#89a493',z===.45?3:1);
 B(t,0,.52,.49,1.20,.45,.04,'#172e38');for(let y=.35;y<.73;y+=.08)B(t,0,y,.525,1.05,.035,.03,'#566f70');
 for(const x of [-.68,.68]){B(t,x,.19,.53,.10,.12,.08,'#9da89c');B(t,x,.68,.54,.075,.075,.045,'#9da89c');}
 for(const x of [-.86,.86]){hydroTube(t,[x,.2,-.1],[x,.74,-.1],.065,'#1e333b');hydroTube(t,[x,.2,-.1],[x+.22*Math.sign(x),.2,-.6],.065,'#1e333b');B(t,x+.22*Math.sign(x),.13,-.6,.23,.26,.25,'#344e55');}
 hydroConsoleMesh=G.mesh(t);
 const screen=(ready)=>{const a=[],col=ready?'#84cdaa':'#d3ab6b';label(a,'COOLANT',-.52,1.79,.162,.027,'#8dcbbb');
  for(const [x,y,w,h]of [[-.34,1.43,.025,.39],[-.04,1.43,.025,.39],[-.19,1.62,.32,.023],[-.19,1.24,.32,.023],[.12,1.5,.27,.02],[.25,1.37,.02,.26],[-.08,1.24,.4,.02]])B(a,x,y,.164,w,h,.01,'#6cae98',3);
  B(a,-.19,1.38,.166,.24,ready?.27:.11,.012,ready?'#75bca2':'#456c61',3);for(let k=0;k<5;k++)B(a,.44,1.27+k*.075,.164,.19,.032,.01,k<2||ready?'#83c7aa':col,3);
  label(a,ready?'ONLINE':'BYPASS',-.50,1.12,.164,.024,col);return G.mesh(a);};
 hydroScreenMesh=screen(false);hydroScreenReadyMesh=screen(true);
 const leaf=(side)=>{const a=[];B(a,side*.49,1.45,0,.98,2.9,.20,'#385363');B(a,side*.49,1.45,.12,.79,2.5,.08,'#203c4c');B(a,side*.08,1.45,.18,.07,2.7,.04,'#8b9b94');for(const y of [.5,2.4])B(a,side*.49,y,.18,.62,.08,.04,'#829086');return G.mesh(a);};hydroHatchL=leaf(-1);hydroHatchR=leaf(1);
}
function decorateHydroHatch(arr){const B=G.box;for(const z of [37.85,40.15]){B(arr,39.8,1.65,z,.5,3.3,.24,'#687a7d');B(arr,40.09,1.65,z,.08,2.8,.07,'#c3985c',3);}B(arr,39.8,3.15,39,.6,.30,2.55,'#6c8085');B(arr,39.8,2.95,39,.65,.12,2.15,'#152e3c');B(arr,39.8,.035,39,.7,.07,2.3,'#788579');
 // Pockets remain behind solid wall; fully retracted leaves are not drawn through it.
 for(const z of [37.25,40.75])B(arr,39.91,1.5,z,.13,2.9,.94,'#233c4a');
}
function drawHydro(){const p=hydroConsole;G.draw(hydroConsoleMesh,G.transform(p.x,0,p.z,p.a));G.draw(shipSystems.cooling?hydroScreenReadyMesh:hydroScreenMesh,G.transform(p.x,0,p.z,p.a));
 const d=sideDoors.find(d=>d.type==='hydro');if(d&&d.open<.999){G.draw(hydroHatchL,G.transform(d.x,0,d.y+d.open,Math.PI/2));G.draw(hydroHatchR,G.transform(d.x,0,d.y-d.open,Math.PI/2));}
}
function decorateHydroExterior(arr){const B=G.box;
 // A continuous outboard nacelle, attached by visible structural arms, with a torn service bay.
 B(arr,60,-1.35,38,8,.6,19,'#283e4e');
 for(const z of [31.5,43.5]){B(arr,59,-.5,z,7,.65,.55,'#587382');B(arr,59,-.10,z,7,.10,.18,'#98a9a4');}
 B(arr,62.3,.75,38,2.7,2.4,18,'#192e3d');B(arr,62.3,2.02,38,2.6,.28,18,'#536d7d');
 for(let z=29.8;z<47;z+=1.25){const damaged=z>36&&z<39.7;
  B(arr,62.3,2.2,z,2.2,.11,1.14,'#738693');B(arr,61,1,z,.14,2.5,.09,'#91a2a6');
  if(!damaged){B(arr,60.82,1.1,z,.23,1.87,1.10,'#4b697c',2);B(arr,60.68,1.1,z,.04,1.43,.82,'#344f65');for(let y=.5;y<1.8;y+=.18)B(arr,60.64,y,z,.03,.035,.65,'#6f8592');for(const y of [.28,1.89])for(const dz of [-.4,.4])B(arr,60.63,y,z+dz,.04,.07,.07,'#a4b2ac');}
  else{B(arr,61.5,1.05,z,.4,1.8,.55,'#253f4c');for(let y=.35;y<1.8;y+=.22)B(arr,61.25,y,z,.1,.07,.57,'#957e64');B(arr,60.85,.12,z,.45,.25,.75,'#4f5e65');}
 }
 for(let k=0;k<7;k++){const z=36.2+k*.48;hydroTube(arr,[60.65,2.1,z],[61.2,.5+k%3*.3,z+.4],.025,k%2?'#b59a73':'#547a86',5);}
 for(const z of [30.5,45.5]){B(arr,61.3,2.48,z,.09,.75,.09,'#4d6474');B(arr,61.3,2.85,z,.20,.16,.17,'#dda052',3);}
 // Outboard radiator slab removed; the attached window-visible machinery remains.
 for(const z of [32,43])hydroTube(arr,[55.3,-.1,z],[61.4,-.1,z],.12,'#7f9b9d');
 lights.push({x:57,y:3,z:37,r:13,c:'#a0b7c8'});
}
function startHydroTour(){tour=true;makeLevel();resetView();shipSystems={parts:true,relay:true,cooling:false,isolated:true,drive:false,emp:true};player={x:48,y:44.7,a:-1.65,pitch:0,hp:100};room=2;roomWave=totalWaves=score=kills=weapon=0;unlocked=false;ammo=16;magazines=[16,7];entered=[true,true,true,true,true];cleared=[true,true,true,false,false];power=true;for(const d of sideDoors){d.active=true;d.open=1;for(const [x,z]of d.cells)map[z][x]='0';}enemies=[];goal('HYDROPONIKA · PREHLIADKA / E POČÍTAČ · T SKÚŠKA BOJA');notice('PREHLIADKA NEPREPÍŠE TVOJ POSTUP · ESC PAUZA',4);hud();lock();}
function hydroCombatTrial(){if(!tour||room!==2||state!=='playing'||enemies.length)return;player.hp=100;ammo=weapons[weapon].cap;magazines[weapon]=ammo;roomWave=3;nextWave=0;enemies=[enemy(47.5,31.5,'shooter'),enemy(41.8,33.3,'runner'),enemy(53.5,32.5,'shield')];goal('SKÚŠKA BOJA · KRYTY / POHYB / Q EMP');hud();}
