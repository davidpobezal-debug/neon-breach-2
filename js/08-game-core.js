/* Helpers, constants and the bridge layout/interior. */
'use strict';
const $=id=>document.getElementById(id),game=$('game');
const touchInput={active:false,forward:0,side:0,reset(){},sync(){},formatText(text){return text;}};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
const MW=72,MH=132,CEIL=3.5;
const bridgeLocalLayout={console:{x:13.5,z:4.5,w:3.6,d:1.15,h:1.12},chair:{x:13.5,z:6.4,w:1.16,d:1.04,h:1.8},flight:{x:13.5,z:5.6}};
const bridgeOffset={x:0,z:0};
const bridgeLayout=Object.fromEntries(Object.entries(bridgeLocalLayout).map(([k,p])=>[k,{...p,x:p.x+bridgeOffset.x,z:p.z+bridgeOffset.z}]));
// Move complete authored geometry, normals unchanged, and its lights together.
function bridgeGeometry(arr,glass,author){const a=[],b=[],first=lights.length;author(a,b);for(let i=0;i<a.length;i+=10){a[i]+=bridgeOffset.x;a[i+2]+=bridgeOffset.z;}for(let i=0;i<b.length;i+=10){b[i]+=bridgeOffset.x;b[i+2]+=bridgeOffset.z;}for(const v of a)arr.push(v);if(glass)for(const v of b)glass.push(v);for(let i=first;i<lights.length;i++){lights[i].x+=bridgeOffset.x;lights[i].z+=bridgeOffset.z;}}
function decorateBridgeInterior(arr){bridgeGeometry(arr,null,a=>{const arr=a,B=G.box;
 // Low instruments and layered structural ribs frame an unobstructed panorama.
 for(const x of [9.45,17.55]){
  B(arr,x,.42,5.4,1.12,.84,3.6,'#243c49');B(arr,x,.86,5.4,1.2,.08,3.7,'#506874');
  B(arr,x,.93,5.4,.94,.08,3.2,'#0b202c');
  for(let i=0;i<3;i++){B(arr,x,.99,4.45+i*.9,.68,.02,.56,'#123d49',3);for(let j=0;j<4;j++)B(arr,x-.22+j*.14,1.005,4.45+i*.9,.035,.015,.12+j*.06,j===3?'#efab67':'#4cafa8',3);}
  for(let z=4;z<7;z+=.22)B(arr,x,.35,z,.65,.035,.035,'#101f2a');
 }
 // Panoramic cabin has no old square window frame behind its pressure glazing.
 for(const x of [8.66,18.34])for(const z of [5.5,8.5]){
  B(arr,x,3.36,z,.12,.26,.36,'#425e70');B(arr,x,3.217,z,.075,.02,.29,'#68b6b3',3);lights.push({x,y:2.9,z,r:4,c:'#68b6b3'});
 }
 decorateCockpitAmber(arr);
 // Raised navigation platform, edge lighting and a recognisable captain's seat.
 B(arr,13.5,.04,4.6,4.4,.08,5,'#233b47',0);
 for(const x of [11.3,15.7])B(arr,x,.09,4.6,.035,.025,5,'#459d9d',3);
 const seat=bridgeLocalLayout.chair;
 // The pilot faces the centre navigation screen; the base is bolted to the raised deck.
 B(arr,seat.x,.12,seat.z,.78,.08,.76,'#263e4b');B(arr,seat.x,.40,seat.z,.28,.50,.28,'#59737b');
 for(const dx of [-.29,.29])for(const dz of [-.27,.27])B(arr,seat.x+dx,.17,seat.z+dz,.07,.035,.07,'#9caaa4');
 B(arr,seat.x,.76,seat.z,.85,.16,.78,'#3b5362');B(arr,seat.x,1.25,seat.z+.32,.82,1.10,.19,'#405568');
 B(arr,seat.x,1.25,seat.z+.205,.61,.73,.075,'#253d4c');B(arr,seat.x,1.70,seat.z+.27,.61,.17,.24,'#263b4c');
 for(const dx of [-.51,.51]){B(arr,seat.x+dx,.88,seat.z+.1,.09,.30,.10,'#3c5360');B(arr,seat.x+dx,1.04,seat.z,.13,.13,.85,'#758b94');B(arr,seat.x+dx,1.115,seat.z-.25,.07,.023,.14,dx>0?'#c79256':'#69b3aa',3);}
 for(let z=5;z<9;z+=2){B(arr,13.5,3.25,z,9.9,.18,.18,'#162936');for(const x of [8.62,18.38])B(arr,x,3.11,z,.11,.025,1.25,'#499895',3);}
 lights.push({x:12,y:1.7,z:4.7,r:5,c:'#66ded4'},{x:16,y:2,z:3,r:6,c:'#6b94c9'});

 // Recessed ceiling strips and bolted supports remain above the pilot's panorama.
 for(const x of [10.5,16.5])for(const z of [4.8,7.8]){
  B(arr,x,3.42,z,1.9,.12,.56,'#3d5665');
  B(arr,x,3.345,z,1.64,.025,.37,'#a6dbc9',3);
  for(const dx of [-.78,.78])B(arr,x+dx,3.38,z,.045,.085,.40,'#718b91');
  lights.push({x,y:2.9,z,r:4,c:'#80bdad'});
 }
 B(arr,13.5,3.28,1.97,1.5,.24,.08,'#142936');centeredLabel(arr,'NAV',13.5,3.36,2.03,.047,'#659795');

 });}
