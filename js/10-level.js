/* Level construction: makeLevel and makeAssets. */
'use strict';
function makeLevel(){map=Array.from({length:MH},()=>Array(MW).fill('1'));props=[];colliders=[];barrels=[];lights=[];pickups=[];waveMedDropped=false;waveMedDeaths=[];navReady=false;supplyUsed=false;card=power=upgraded=secretFound=alarmTriggered=false;logs=[];defenses=[];sideDoors=[];commTimer=alarmTimer=0;weapons[0].reload=1.2;
 for(const s of sectors){const [x0,y0,x1,y1]=s.bounds;for(let y=y0+1;y<y1;y++)for(let x=x0+1;x<x1;x++)map[y][x]='0'}
 for(const g of gates){g.open=0;g.active=false;for(let x=11;x<16;x++)map[g.row][x]='4'}
 // Familiar paired columns in the starting arena; later rooms stay generously sized.
 for(const [x,z,t] of [[6,71,'2'],[7,71,'2'],[6,72,'2'],[7,72,'2'],[19,71,'3'],[20,71,'3'],[19,72,'3'],[20,72,'3'],[6,79,'2'],[7,79,'2'],[19,79,'3'],[20,79,'3'],[10,75,'2'],[17,75,'3'],[6,53,'2'],[21,53,'3'],[6,61,'2'],[21,61,'3'],[7,34,'2'],[20,34,'3'],[7,42,'2'],[20,42,'3'],[5,17,'2'],[22,17,'3']])map[z][x]=t;
 for(let x=8;x<19;x++)map[1][x]='5';for(let y=2;y<9;y++){map[y][7]='5';map[y][19]='5'}for(let y=54;y<60;y++)map[y][2]='5';for(let y=11;y<21;y++)map[y][25]='5';
 for(let z=35;z<38;z++)for(let x=3;x<6;x++)map[z][x]='8';
 const crates=[[5,83],[6,83],[21,83],[22,83],[5,69],[22,69],[5,64],[6,64],[20,64],[21,64],[8,57],[9,57],[18,57],[19,57],[4,50],[22,50],[4,45],[5,45],[22,45],[9,38],[18,38],[4,30],[22,30],[4,24],[5,24],[21,24],[22,24],[7,15],[8,15],[19,15],[20,15]];
 for(const [x,z]of crates){if(map[z][x]==='0'){map[z][x]='6';props.push({x:x+.5,y:z+.5,h:1.05+(x%3)*.2})}}
 for(const [x,z]of [[8.5,81],[18.5,70],[8.5,63],[19.5,51],[10.5,54],[5.5,39],[21.5,35],[10.5,32],[7.5,23],[20.5,13]])barrels.push({x,y:z,hp:1,alive:true});
 buildSideSpaces();buildSystemRooms();buildEVA();buildCryo();buildFurnitureCollision();buildMars();buildEVACollision();buildDetailCollision();const arr=[],glass=[];const B=G.box;
 buildDeckSurfaces(arr);decoratePanoramicBridgeDeck(arr);
 for(const s of sectors){const [x0,z0,x1,z1]=s.bounds;
  if(s===sectors[4])continue; // New cabin has its own fitted roof and lighting.
  if(z0>10)B(arr,13.5,CEIL-.025,(z0+z1)/2,.08,.045,z1-z0,'#2c8d8b',3);
  for(let z=z0+2;z<z1;z+=4){B(arr,(x0+x1)/2,CEIL-.08,z,x1-x0,.18,.16,'#111e29');for(const [x,c]of [[x0+1,'#53f5dc'],[x1-1,'#ff9852']]){lights.push({x,y:2.1,z,r:7,c});B(arr,x,CEIL-.18,z,.55,.06,.4,c,3)}}
  // Directional lane markings make the route through the vessel easy to read.
  for(let z=z0+1;z<z1;z+=1.6){B(arr,11,.008,z,.045,.015,.7,'#498f8e',3);B(arr,16,.008,z,.045,.015,.7,'#8b6740',3)}
 }
 for(let z=0;z<MH;z++)for(let x=0;x<MW;x++){const t=map[z][x];if(marsZone(x,z))continue;if(t==='V'||t==='0'||t==='4'||t==='6'||t==='9')continue;if(t==='8')continue;const exposed=[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dz])=>['0','4','6','8','9'].includes(map[z+dz]?.[x+dx]));if(!exposed)continue;
  // The complete new cabin supplies its own glass and frames.
  if(t==='5'&&x>=7&&x<=20&&z<10)continue;
  if(t==='5'&&x===55&&z>=31&&z<44){B(arr,55.5,.22,z+.5,1,.44,1,'#293e4c');B(arr,55.5,3.3,z+.5,1,.4,1,'#293e4c');hydroWindowGlass(glass,z);continue;}
  if(t==='5'&&z===29&&x>=44&&x<55){B(arr,x+.5,.22,29.5,1,.44,1,'#293e4c');B(arr,x+.5,3.3,29.5,1,.4,1,'#293e4c');hydroNorthGlass(glass,x);continue;}
  if(t==='5'){
   if(x===25&&z>=11&&z<21){
    // The last sill tile stops exactly at the approved window edge. Wall cells
    // retain their existing solid collision, but no glass parts hide behind panels.
    const span=Math.min(z+1,hangarWindowEnd())-z;
    if(span>0){
     B(arr,x+.5,.28,z+span/2,1,.56,span,'#243846');
     B(arr,x+.5,3.24,z+span/2,1,.52,span,'#243846');
     B(arr,x+.5,.60,z+span/2,1,.045,span,'#3eaaa9',3);
    }
    continue;
   }
   B(arr,x+.5,.28,z+.5,1,.56,1,'#243846');B(arr,x+.5,3.24,z+.5,1,.52,1,'#243846');
   const front=z===1;if(!(x===25&&z===20))B(arr,x+.5,.60,z+.5,1,.045,1.02,'#3eaaa9',3); // No cyan sill through the solid AUX bay.
   if(x===2&&z>=54&&z<60||x===25&&z>=51&&z<53)continue; // Authored cargo/security panes replace tile glass and posts.
   if(front)G.quad(glass,[x,.56,z+.53],[x+1,.56,z+.53],[x+1,2.98,z+.53],[x,2.98,z+.53],[0,0,1],'#62baca',5);
   else G.quad(glass,[x+.5,.56,z],[x+.5,.56,z+1],[x+.5,2.98,z+1],[x+.5,2.98,z],[x<13?1:-1,0,0],'#62baca',5);
   if(!front&&z%3===0)B(arr,x+.5,1.75,z,.16,2.7,.15,'#405869');continue;
  }
  // Exact tile edges close the previous .01-wide see-through wall seams.
  B(arr,x+.5,1.75,z+.5,1,3.5,1,t==='2'?'#38505b':t==='3'?'#4c484a':'#354653');
  for(const [dx,dz] of [[0,1],[0,-1],[1,0],[-1,0]])if(['0','4','6','8','9'].includes(map[z+dz]?.[x+dx])){const xx=x+.5+dx*.51,zz=z+.5+dz*.51,ww=dx?.08:.85,dd=dz?.08:.85;
   B(arr,xx,1.7,zz,ww,2.55,dd,'#2b3f4c');B(arr,xx,.65,zz,dx?.10:1,.055,dz?.10:1,'#132631');B(arr,xx,2.48,zz,dx?.10:1,.06,dz?.10:1,'#152936');
   const cyan=t!=='3'&&(x<13||x%2===0),c=cyan?'#46e6d5':'#ff934d';
   if(t==='2'||t==='3'){B(arr,xx-dz*.32,1.7,zz+dx*.32,dx?.12:.08,2.7,dz?.12:.08,c,3);B(arr,xx+dz*.32,1.7,zz-dx*.32,dx?.12:.08,2.7,dz?.12:.08,c,3);lights.push({x:xx+dx*.6,y:1.4,z:zz+dz*.6,r:5,c})}
   else if(!wallDetailReserved(x,z,dx,dz)&&!(x===50&&dx===-1&&[50,54,58].includes(z))&&(x+z)%4===0){B(arr,xx,2.8,zz,dx?.12:.72,.085,dz?.12:.72,c,3)}
   if(t==='1'&&!wallDetailReserved(x,z,dx,dz)&&!relocatedWallGrille(x,z,dx,dz)&&(x+z)%6===0){B(arr,xx+dx*.04,1.8,zz+dz*.04,dx?.13:.6,.5,dz?.13:.6,'#071923');B(arr,xx+dx*.08,1.8,zz+dz*.08,dx?.02:.48,.38,dz?.02:.48,cyan?'#12675f':'#6f421f',3);for(let n=0;n<4;n++)B(arr,xx+dx*.10,1.69+n*.065,zz+dz*.10,dx?.025:.32,.025,dz?.025:.32,c,3)}
  }
 }
 for(const p of props){B(arr,p.x,p.h/2,p.y,.96,p.h,.96,'#263b49');B(arr,p.x,p.h*.48,p.y+.49,.74,p.h*.72,.035,'#182c39');for(const x of [-.4,.4]){B(arr,p.x+x,p.h/2,p.y,.07,p.h,.99,'#51616a')}B(arr,p.x-.28,p.h*.5,p.y+.515,.06,p.h*.52,.03,p.x<13?'#40baaf':'#d67c44',3);B(arr,p.x,p.h+.015,p.y,.97,.03,.97,'#3b515f')}
 // Reactor core: vertical machinery along the wall, not a blockage in the fight space.
 B(arr,4.5,.30,36.5,3,.60,3,'#223443');B(arr,4.5,1.7,36.5,1.8,2.2,1.8,'#18283c');
 for(let i=0;i<6;i++){B(arr,4.5,.85+i*.30,37.42,1.35,.085,.045,'#66514e');B(arr,5.42,.85+i*.30,36.5,.045,.085,1.35,'#66514e');}
 for(const x of [3.35,5.65]){B(arr,x,1.5,36.5,.20,2.4,.24,'#65757d');B(arr,x,.67,36.5,.29,.10,.32,'#e7a25d',3);}
 B(arr,4.5,2.79,37.44,2.2,.36,.08,'#203641');label(arr,'CORE',3.75,2.91,37.49,.10,'#b3bdc6');
 lights.push({x:5.5,y:1.5,z:38.2,r:6,c:'#ad725a'});
 decorateHangarPressureWindow(arr,glass);decorateCargoPressureWindow(arr,glass);decorateSecurityPressureWindow(arr,glass);decorateAlignedWallGrilles(arr);
 decorateBridgeInterior(arr);
 decorateShip(arr);decorateSideSpaces(arr);decorateSystemRooms(arr);decorateHull(arr,glass);decorateEVA(arr);decorateWayfinding(arr);decorateRoomDetails(arr);decorateCryo(arr);
 for(const g of gates){for(const x of [-2.75,2.75]){B(arr,g.x+x,1.75,g.z,.48,3.5,.6,'#375866');B(arr,g.x+x,1.75,g.z+.34,.10,3.1,.04,'#47f0d8',3)}B(arr,g.x,3.18,g.z,5.8,.4,.6,'#375866');B(arr,g.x,3.18,g.z+.34,5.1,.09,.04,'#4dedd8',3);lights.push({x:g.x,y:2.6,z:g.z+1.5,r:5,c:'#3dd7c6'})}
 G.remove(staticMesh);staticMesh=G.mesh(G.bake(arr,lights,colliders));G.remove(glassMesh);glassMesh=G.mesh(glass);
}
function makeAssets(){const B=G.box;
 for(const kind of ['drone','shooter','runner','boss','guard','shield']){const a=[],boss=kind==='boss',c=boss?'#785195':kind==='guard'?'#375d87':kind==='shooter'?'#34616a':kind==='runner'?'#725942':'#44606d',accent=boss?'#c58cff':kind==='guard'?'#89c8ff':kind==='shooter'?'#53ffdd':kind==='runner'?'#ffb56c':'#ff8950';
  B(a,0,.82,0,.60,.52,.38,c);B(a,0,1.2,0,.57,.35,.42,'#3b5360');B(a,0,1.25,.22,.44,.17,.035,'#091a25');for(const x of [-.13,.13]){B(a,x,1.26,.245,.105,.065,.04,accent,3);B(a,x,1.285,.27,.07,.018,.02,'#fff1ca',3)}B(a,0,1.02,.2,.34,.04,.025,'#182b35');B(a,0,.86,.23,.18,.18,.05,accent,3);B(a,0,.86,.266,.09,.09,.025,'#eaf8ef',3);
  for(const x of [-.38,.38]){B(a,x,.9,0,.16,.26,.22,c);B(a,x,.64,.03,.13,.31,.16,'#253e4d');B(a,x,.52,.06,.15,.12,.2,accent);}
  for(const x of [-.19,.19]){B(a,x,.36,0,.17,.4,.23,'#263c49');B(a,x,.10,.06,.24,.16,.36,'#446671');B(a,x,.18,.20,.18,.06,.03,'#329992',3)}
  B(a,0,.59,0,.45,.10,.27,'#193443');B(a,0,1.4,0,.43,.06,.32,'#738692');
  if(kind==='shooter'||kind==='guard'||boss){B(a,.43,.96,.30,.20,.22,.50,'#1b3443');B(a,.43,.96,.57,.14,.13,.06,accent,3);B(a,.43,.98,.38,.22,.035,.28,'#8ceae1',3)}
  if(kind==='guard'){B(a,0,1.44,0,.6,.09,.40,'#7397aa');B(a,0,.81,.27,.38,.32,.08,'#233e5b');B(a,0,.8,.33,.21,.06,.03,'#88bded',3);}
  if(kind==='shield'){B(a,-.12,.86,.37,.85,1.2,.15,'#667579');B(a,-.12,.93,.46,.69,.90,.03,'#2b4658');B(a,-.12,1.24,.48,.55,.11,.025,'#d3aa69',3);B(a,-.12,.85,.48,.60,.045,.025,'#91cbd2',3);}
  if(kind==='runner'){B(a,0,.93,.24,.33,.055,.06,'#ffd088',3);for(const x of [-.3,.3])B(a,x,1.26,0,.13,.10,.36,'#a7805b');}
  if(boss){for(const x of [-.34,.34]){B(a,x,1.45,0,.12,.38,.24,'#a681bd');B(a,x,1.6,.13,.10,.14,.04,'#e4b8ff',3)}B(a,0,.73,.25,.34,.045,.04,'#b688e3',3)}robotMeshes[kind]=G.mesh(a);
 }
 const a=[];B(a,-1.25,1.5,0,2.45,2.9,.18,'#354652');B(a,-1.25,1.5,.12,2.12,2.5,.07,'#293e4a');for(let i=0;i<8;i++){B(a,-2.30+i*.29,.37,.18,.15,.15,.035,i%2?'#a96a36':'#1c2b34')}B(a,-.13,1.65,.20,.22,.4,.10,'#152f3c');B(a,-.13,1.65,.26,.13,.25,.025,'#58ead2',3);doorL=G.mesh(a);const b=[];B(b,1.25,1.5,0,2.45,2.9,.18,'#354652');B(b,1.25,1.5,.12,2.12,2.5,.07,'#293e4a');for(let i=0;i<8;i++)B(b,.13+i*.29,.37,.18,.15,.15,.035,i%2?'#a96a36':'#1c2b34');doorR=G.mesh(b);
 const o=[];G.sphere(o,1,'#69ffe5',3);orbMesh=G.mesh(o);const n=[];G.sphere(n,1,'#cc9dff',3);novaOrb=G.mesh(n);
 const r=[];B(r,0,.55,0,.55,1.1,.55,'#273d45');B(r,0,.97,0,.6,.12,.6,'#658087');B(r,0,.15,0,.6,.12,.6,'#658087');for(const z of [-.29,.29])B(r,0,.57,z,.3,.5,.035,'#61f5cf',3);B(r,0,1.04,0,.22,.05,.22,'#eab259',3);barrelMesh=G.mesh(r);
 const p=[];G.sphere(p,1,'#31869d',6,true);planetMesh=G.mesh(p);
 const sky=[];G.sphere(sky,170,'#102033',4);skyDome=G.mesh(sky);
 // The original bright green tile and dark cross, carried into a shallow 3D case.
 const med=[];B(med,0,.24,0,.46,.46,.13,'#61ffcb',3);
 for(const z of [-.073,.073]){B(med,0,.24,z,.105,.30,.018,'#123a39',3);B(med,0,.24,z,.30,.105,.018,'#123a39',3);}
 B(med,0,.48,0,.24,.035,.075,'#3dac91',3);medMesh=G.mesh(med);

 const loot=[];B(loot,0,.16,0,.8,.10,.55,'#243545');B(loot,0,.20,0,.73,.015,.48,'#79608e');B(loot,0,.42,0,.58,.25,.25,'#647182');B(loot,.35,.43,0,.38,.17,.19,'#bb8ced',3);B(loot,-.12,.27,0,.15,.25,.14,'#34445d');for(const z of [-.17,.17])B(loot,.1,.45,z,.65,.045,.045,'#d0a0ff',3);weaponMesh=G.mesh(loot);
 const c=[];B(c,0,.37,0,3.2,.74,.8,'#273e4b');B(c,0,.76,0,3.6,.10,1.15,'#566b78');
 // Sloped instrument faces, leaving the window above them clear.
 for(const x of [-1.1,0,1.1]){
  // A closed wedge rests in the worktop and supports the entire sloped display.
  G.quad(c,[x-.52,.815,.23],[x+.52,.815,.23],[x+.52,1.12,-.32],[x-.52,1.12,-.32],[0,.8745,.485],'#3c5661');
  G.quad(c,[x+.52,.8,-.32],[x-.52,.8,-.32],[x-.52,1.12,-.32],[x+.52,1.12,-.32],[0,0,-1],'#2a424e');
  G.quad(c,[x-.52,.8,.23],[x+.52,.8,.23],[x+.52,.815,.23],[x-.52,.815,.23],[0,0,1],'#58717a');
  // Side cheeks use triangles because the quad helper is for parallelograms.
  for(const side of [-1,1]){const xx=x+side*.52,a=[xx,.8,.23],b=[xx,.8,-.32],d=[xx,.815,.23],top=[xx,1.12,-.32];for(const p of [a,b,top,a,top,d])c.push(...p,side,0,0,56/255,80/255,91/255,1);}
  G.quad(c,[x-.48,.84,.2],[x+.48,.84,.2],[x+.48,1.12,-.3],[x-.48,1.12,-.3],[0,.87,.49],'#081d29',3);
  const R=(u,v,w,h,col)=>{const pt=(u,v)=>[x+u,.852+v*.56,.19-v];G.quad(c,pt(u,v),pt(u+w,v),pt(u+w,v+h),pt(u,v+h),[0,.87,.49],col,3);};
  R(-.4,.425,.79,.018,'#417d86');R(-.4,.37,.24,.018,'#afaf87');
  if(x===0){
   for(let j=0;j<28;j++){const a=j/28*Math.PI*2;R(Math.cos(a)*.18-.015,.21+Math.sin(a)*.145,.012,.012,'#317883');}
   R(-.25,.21,.48,.008,'#214d61');R(-.015,.05,.008,.30,'#214d61');
   for(let j=0;j<6;j++)R(-.17+j*.038,.11+j*.026,.018,.012,'#cda26c');R(.045,.28,.025,.018,'#83d5c8');
   R(.28,.08,.075,.16,'#25516b');R(.30,.10,.03,.07,'#5fb4b1');
  }else if(x<0){
   for(let j=0;j<5;j++){R(-.4,.08+j*.054,.30+(j%3)*.07,.012,'#3a8b8d');R(.10,.08+j*.054,.20-j*.025,.012,'#274e61');}
   R(.3,.08,.05,.12,'#bc865b');R(.3,.25,.05,.06,'#438776');
  }else{
   for(let j=0;j<7;j++){R(-.36+j*.075,.08,.035,.08+(j%4)*.035,j===5?'#d3a561':'#3f9198');}
   R(-.38,.30,.58,.009,'#28566a');R(-.38,.35,.58,.009,'#28566a');R(.27,.30,.10,.055,'#64a894');
  }
  for(let n=0;n<5;n++)B(c,x-.3+n*.14,.83,.38,.07,.035,.075,n===3?'#ddac65':'#35616e',3);
 }
 B(c,0,.85,.35,.25,.055,.22,'#e9a85b',3);B(c,0,.88,.35,.12,.02,.10,'#ffe5a6',3);consoleMesh=G.mesh(c);

}
