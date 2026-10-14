/* Concept-art pass: anchored hardware and readable cyan/amber accents.
   These meshes stay inside existing hulls or outside the walkable route. No new obstacles. */
'use strict';
function marsDisplay(a,x,y,z,w,h,face='z',seed=0){
 const B=G.box,px=face==='x';
 const box=(u,v,ww,hh,c,k=1,off=0)=>B(a,x+(px?off:u),y+v,z+(px?u:off),px?.025:ww,hh,px?ww:.025,c,k);
 box(0,0,w+.12,h+.12,'#35464f',1);box(0,0,w,h,'#071e29',1,.025);
 const R=mrng(seed+911);
 for(let i=0;i<5;i++){const len=w*(.24+R()*.55);box(-w*.41+len/2,h*.33-i*h*.15,len,.022,i===0?MC.cyan:'#35a49d',3,.05)}
 box(w*.33,-h*.32,.07,.055,MC.amberL,3,.055);
}
function marsLanderArt(a){
 const B=G.box;
 // Recessed side inspection panels and fasteners; all hardware is attached to the hull.
 for(const s of [-1,1])for(const z of [-2.05,-.6,2.3]){
  B(a,s*4.14,1.5,z,.055,.92,.66,'#354a58');
  for(const dy of [-.37,.37])for(const dz of [-.24,.24])B(a,s*4.18,1.5+dy,z+dz,.02,.05,.05,'#8c9aa2');
  for(let j=0;j<4;j++)B(a,s*4.19,1.33+j*.11,z,.02,.045,.4,'#152631');
 }
 // Sloping shoulder armour gives the compact hull a distinct spacecraft silhouette.
 for(const s of [-1,1]){
  mPlate(a,[s*2.7,3.71,-1.8],[s*4.05,3.18,-2.4],[s*4.05,3.18,1.25],[s*2.7,3.71,1.5],'#526879');
  beam3(a,[s*2.72,3.73,-1.7],[s*4.04,3.2,-2.35],.085,MC.steelL);
  for(const z of [-1.5,-.6,.3]){B(a,s*4.12,1.5,z,.09,1.3,.065,'#263944');B(a,s*4.18,2.35,z,.03,.1,.12,MC.amberL,3)}
  // Recessed attitude thrusters: no permanent flame while docked or parked.
  mPrism(a,s*3.42,3.45,2.18,'y',.3,.5,MC.steelL,8);
  mPrism(a,s*3.42,3.72,2.18,'y',.22,.07,'#12232b',8);
  B(a,s*2.4,3.22,3.15,1.2,.14,.85,'#20313b');
  for(let j=0;j<5;j++)B(a,s*2.4,3.32,2.83+j*.15,1.12,.07,.065,'#79838a');
 }
 // Vertical canopy mullions carry the brow down to the nose, rather than a floating lip.
 for(const x of [-3.4,0,3.4])beam3(a,[x,2.3,-3.71],[x*.99,.22,-3.98],.09,'#263e49');
 for(const x of [-2.6,2.6])B(a,x,.77,-3.06,.55,.045,.035,MC.cyan,3);
 // Leg mount bolts, lock hatches and physical panel joints.
 for(const s of [-1,1])for(const z of [-2.1,2.1]){B(a,s*4.13,.48,z,.05,.32,.4,'#24343e');for(const y of [.38,.58])B(a,s*4.17,y,z,.025,.055,.055,MC.steelL)}
}
function marsCabinArt(a){
 const B=G.box;
 // Central aisle, individual floor plates, underside light sources and overhead ribs.
 for(let z=-1.6;z<1.8;z+=.55){B(a,0,.095,z,1.6,.016,.48,'#30444d');B(a,0,.108,z,1.1,.01,.025,'#75949a')}
 for(const x of [-.9,.9])B(a,x,.115,.2,.035,.025,3.25,MC.cyan,3);
 for(const z of [-1.15,.75]){B(a,0,2.54,z,5.8,.14,.12,'#3f5661');for(const x of [-2.7,2.7])B(a,x,1.93,z,.12,1.15,.12,'#3f5661')}
 for(const x of [-1.9,0,1.9])marsDisplay(a,x,1.04,-1.71,1.18,.31,'z',Math.round(x*9));
 B(a,0,.89,-1.25,2.35,.06,.1,'#172b35');
 for(let i=0;i<9;i++)B(a,-1+i*.25,.935,-1.22,.11,.03,.065,i===4?MC.amberL:'#718f99',i===4?3:1);
 // Two clearly separate pilot stations with harnesses and headrest inserts.
 for(const x of [-1.6,1.6]){B(a,x,1.51,-.025,.44,.22,.04,'#355b66');for(const s of [-1,1])beam3(a,[x+s*.27,1.38,-.025],[x+s*.24,.5,-.04],.055,'#162b36');B(a,x,.79,-.027,.18,.12,.05,MC.steelL)}
 marsDisplay(a,2.82,1.7,.02,1,.66,'x',3);
 B(a,0,2.32,1.76,2.0,.26,.04,'#162a35');mSign(a,'KESTREL-2',0,2.37,1.73,.043,'#92c7c9',Math.PI);
 for(const x of [-2.75,2.75])for(let y=.55;y<2.3;y+=.55)B(a,x,y,1.9,.06,.06,.035,MC.steelL);
 B(a,2.2,1.45,1.07,1.02,.8,.02,'#09212d');marsDisplay(a,2.2,1.45,1.04,.9,.68,'z',21);
}
function marsDepotArt(a){
 const B=G.box;
 // Paired cool ceiling fixtures and ribbed steel liners frame the salvage objective.
 for(const x of [54,58])B(a,x,3.105,67,.17,.025,5.6,MC.cyan,3);
 for(const z of [64.2,66.5,69.6]){B(a,56,3.02,z,7.9,.15,.13,'#29404d');for(const x of [52.08,59.92])B(a,x,1.58,z,.13,2.85,.13,'#29404d')}
 for(const x of [54.6,57.4]){B(a,x,1.6,64.035,.12,2.9,.055,'#354f5b');B(a,x,1.6,64.08,.04,2.4,.025,MC.cyan,3)}
 // Oxygen servicing is a physical wall installation rather than a breathable open warehouse.
 mPrism(a,52.22,1.28,69.45,'y',.15,.85,'#647d86',8);
 for(const y of [.93,1.6])B(a,52.2,y,69.45,.26,.06,.38,'#29434d');
 B(a,52.33,1.83,69.45,.04,.2,.24,MC.cyanD,3);
 B(a,56,2.62,64.12,2.4,.33,.04,'#182c37');mSign(a,'ARGO / SPARE',56,2.65,64.16,.05,'#9ac9ca');
 for(const x of [52.91,59.09])for(let z=65;z<69.4;z+=1.1)for(const y of [.65,1.25,1.85]){B(a,x,y,z,.02,.16,.29,'#213c46');B(a,x,y+.035,z,.025,.025,.12,MC.amberL,3)}
 // A segmented inspection mat at the bench, not an illuminated line across the room.
 B(a,56,1.078,67.4,2.4,.018,.95,'#263d46');for(let x=55;x<57.1;x+=.32)B(a,x,1.09,67.4,.02,.01,.76,'#5d7c85');
 marsDisplay(a,58.5,1.13,69.235,.7,.42,'z',9);
 // External pressure ribs and a chamfered awning surround the existing door opening.
 for(const x of [51.3,54.3,57.7,60.7]){B(a,x,1.7,71.12,.18,3.1,.2,MC.steelD);for(const y of [.55,2.6])B(a,x,y,71.235,.07,.07,.025,MC.steelL)}
 mPlate(a,[54.4,3.45,71.12],[57.6,3.45,71.12],[57.95,3.12,71.62],[54.05,3.12,71.62],'#344955');
 B(a,56,3.15,71.64,3.2,.065,.045,MC.amberL,3);
 marsDisplay(a,53.8,1.3,71.67,.66,.58,'z',5);
 for(const x of [52.9,59.1])B(a,x,2.83,71.15,1.3,.045,.04,MC.cyan,3);
 // Bevels and anchor plates around the existing pressure-door frame.
 for(const s of [-1,1]){
  mPlate(a,[56+s*1.13,2.63,71.27],[56+s*1.65,3.04,71.27],[56+s*1.88,2.68,71.27],[56+s*1.38,2.22,71.27],MC.steelL);
  mPlate(a,[56+s*1.13,.15,71.27],[56+s*1.65,.05,71.27],[56+s*1.88,.43,71.27],[56+s*1.38,.63,71.27],MC.steelD);
  for(const y of [.8,1.7,2.45])B(a,56+s*1.48,y,71.29,.075,.075,.045,MC.steelL);
 }
 // Solar-cell divisions, maintenance labels and coolant fittings.
 for(let x=52.5;x<58.3;x+=.22)for(const z of [68.5,69.3])B(a,x,3.94,z,.016,.012,.6,'#6a8e9f');
 mSign(a,'SERVICE',59.2,.65,71.19,.045,'#a4bbc0');
}
function marsLandscapeArt(a){
 // Layered outcrops are placed entirely beyond the existing collision boundary.
 const pillars=[[45,113,1.7,5.8],[66.4,111,1.4,6.7],[48.7,101.5,1.15,5.2],[62.5,101,1.0,6.4],[50.3,91,1.15,7.4],[62,89.5,1.0,5.9],[45.5,89,1.25,6.6],[66,89,1.6,6.8]];
 for(let i=0;i<pillars.length;i++){
  const [x,z,r,h]=pillars[i];if(marsWalkD(x,z)<r+.4)continue;
  const R=mrng(300+i),base=Math.max(.1,marsHeight(x,z)-2),n=7,ph=R()*6.28;
  let prev=[];for(let j=0;j<n;j++){const t=j/n*6.283+ph;prev.push([x+Math.cos(t)*r,base,z+Math.sin(t)*r])}
  for(let k=1;k<=7;k++){
   const y=base+h*k/7,rr=r*(1-k*.072)*(k%2?.96:1.09),ring=[];
   for(let j=0;j<n;j++){const t=j/n*6.283+ph;ring.push([x+Math.cos(t)*rr,y+(R()-.5)*.17,z+Math.sin(t)*rr])}
   const col=k%3===0?'#9b5538':k%3===1?'#a65e3e':'#b56c46';
   for(let j=0;j<n;j++){const q=(j+1)%n;tri(a,prev[j],prev[q],ring[q],col,2.7,[x,y-.3,z]);tri(a,prev[j],ring[q],ring[j],col,2.7,[x,y-.3,z])}
   prev=ring;
  }
  for(let j=0;j<n;j++)tri(a,prev[j],prev[(j+1)%n],[x,base+h,z],'#b9764c',2.7);
 }
 // Tiny loose stones are visual only and never block the route or consume gameplay RNG.
 const R=mrng(1827);
 for(let i=0;i<180;i++){const x=39+R()*31,z=72+R()*58;if(marsWalkD(x,z)>-.5||marsTrackD(x,z)<1.25||marsInLander(x,z)||marsInDepot(x,z))continue;rock(a,x,z,.045+R()*.09,800+i)}
 // Old survey marks guide the player through the otherwise uninhabited terrain.
 for(const [x,z] of [[58.4,111],[52.4,103.8],[58.4,86.8]]){G.box(a,x,.48,z,.06,.96,.06,MC.steelD);G.box(a,x,.83,z,.36,.19,.08,'#2d414b');G.box(a,x,.85,z+.048,.24,.03,.015,MC.cyan,3)}
}
function marsWreckArt(a){
 const B=G.box,hx=39.4,hz=80;
 // Broken longitudinal spars and staggered torn plates, anchored to the wreck.
 for(const dz of [-4.8,-2.8,.5,3.2]){
  const y=4.08+(dz>0?.2:0);
  mPlate(a,[hx-2.5,y,hz+dz],[hx+2.5,y,hz+dz],[hx+2.15,y+.65,hz+dz+.8],[hx-2.3,y+.5,hz+dz+.95],dz>0?MC.rust:MC.steelD);
  beam3(a,[hx+2.55,3.85,hz+dz],[hx+3.35,3.4,hz+dz+.8],.14,MC.steelL);
 }
 // Ruptured power train is optional scenery; the mission's spare remains clearly labelled in the depot.
 for(const z of [78.2,79.2,80.2]){B(a,43.86,1.02,z,.12,.36,.48,MC.steelX);B(a,43.94,1.04,z,.04,.15,.34,MC.cyan,3)}
 marsDisplay(a,43.4,1.23,74,.42,.58,'x',14);
 mSign(a,'SURVEY-04',42.98,2.94,75.4,.06,'#adbec5',Math.PI/2);
 for(const dz of [-1.8,1.8])mHose(a,[42.95,2.85,79.5+dz],[43.65,.28,79.5+dz*.75],.07,MC.black,.22,8);
}
