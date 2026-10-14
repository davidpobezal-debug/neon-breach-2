/* Wall labels, grilles, deck surfaces, ship decoration. */
'use strict';
function beam(arr,a,b,w,col){const v=b.map((n,i)=>n-a[i]),len=Math.hypot(...v),u=[v[1]/len*w/2,-v[0]/len*w/2,0],z=[0,0,w/2];const p=(q,sgn,sgnz)=>q.map((n,i)=>n+u[i]*sgn+z[i]*sgnz);for(const q of [[1,1,-1,1],[-1,-1,1,-1]])G.quad(arr,p(a,q[0],q[1]),p(b,q[0],q[1]),p(b,q[2],q[3]),p(a,q[2],q[3]),[0,0,1],col);G.quad(arr,p(a,1,-1),p(b,1,-1),p(b,1,1),p(a,1,1),[1,0,0],col);G.quad(arr,p(a,-1,1),p(b,-1,1),p(b,-1,-1),p(a,-1,-1),[-1,0,0],col);}
const glyphs={
 '0':['111','101','101','101','111'],'7':['111','001','010','010','010'],
 'A':['010','101','111','101','101'],'B':['110','101','110','101','110'],
 'C':['111','100','100','100','111'],'D':['110','101','101','101','110'],
 'E':['111','100','110','100','111'],'G':['111','100','101','101','111'],
 'H':['101','101','111','101','101'],'I':['111','010','010','010','111'],
 'F':['111','100','110','100','100'],'K':['101','101','110','101','101'],'L':['100','100','100','100','111'],'P':['110','101','110','100','100'],'T':['111','010','010','010','010'],'U':['101','101','101','101','111'],'Y':['101','101','010','010','010'],'2':['111','001','111','100','111'],
 'M':['10001','11011','10101','10001','10001'],'N':['101','111','111','111','101'],
 'O':['111','101','101','101','111'],'R':['110','101','110','101','101'],
 'W':['10001','10001','10101','11011','10001'],'S':['111','100','111','001','111'],'V':['101','101','101','101','010']};
Object.assign(glyphs,{K:['101','101','110','101','101'],U:['101','101','101','101','111'],X:['101','101','010','101','101'],Y:['101','101','010','010','010'],T:['111','010','010','010','010'],P:['110','101','110','100','100'],H:['101','101','111','101','101']});
function label(arr,text,x,y,z,size,col,facing=0){let offset=0;const ca=Math.cos(facing),sa=Math.sin(facing);for(const ch of text){const g=glyphs[ch];if(!g){offset+=size*3;continue;}for(let r=0;r<5;r++)for(let c=0;c<g[r].length;c++)if(g[r][c]==='1'){const t=offset+c*size;G.box(arr,x+ca*t,y-r*size,z-sa*t,size*.86*Math.abs(ca)+.025*Math.abs(sa),size*.86,size*.86*Math.abs(sa)+.025*Math.abs(ca),col,3);}offset+=(g[0].length+1)*size;}}
function centeredLabel(arr,text,x,y,z,size,col,facing=0){let offset=0,min=Infinity,max=-Infinity;for(const ch of text){const g=glyphs[ch];if(!g){offset+=size*3;continue;}for(const row of g)for(let c=0;c<row.length;c++)if(row[c]==='1'){min=Math.min(min,offset+c*size);max=Math.max(max,offset+c*size);}offset+=(g[0].length+1)*size;}const mid=Number.isFinite(min)?(min+max)/2:0;label(arr,text,x-Math.cos(facing)*mid,y,z+Math.sin(facing)*mid,size,col,facing);}
// Local alignments from the annotated room screenshots; colours stay unchanged.
function relocatedWallGrille(x,z,dx,dz){return x===25&&dx===-1&&(z===29||z===41)||x===8&&z===10&&dz===-1||x===50&&dx===-1&&(z===52||z===58);}
function decorateAlignedWallGrilles(arr){const B=G.box;
 const face=(xx,zz,dx,dz,c,back)=>{
  B(arr,xx+dx*.04,1.8,zz+dz*.04,dx?.13:.6,.5,dz?.13:.6,'#071923');
  B(arr,xx+dx*.08,1.8,zz+dz*.08,dx?.02:.48,.38,dz?.02:.48,back,3);
  for(let n=0;n<4;n++)B(arr,xx+dx*.10,1.69+n*.065,zz+dz*.10,dx?.025:.32,.025,dz?.025:.32,c,3);
 };
 for(const z of [31.5,39.5])face(24.99,z,-1,0,'#ff934d','#6f421f');
 // The rear-left cockpit grille now sits between the x9 and x10 wall seams.
 face(9.5,9.99,0,-1,'#46e6d5','#12675f');
 // Workshop grilles sit midway between adjacent orange strips. Their frames
 // embed in the wall and their glowing bars share the strips' front plane.
 for(const z of [52.7,58.3]){
  B(arr,50.01,1.8,z,.124,.50,.60,'#071923');
  // Preserve the old black visible backing: its coloured insert stays
  // recessed behind the opaque face, while only the cyan bars protrude.
  B(arr,49.956,1.8,z,.012,.38,.48,'#12675f',3);
  for(let n=0;n<4;n++)B(arr,49.933,1.69+n*.065,z,.004,.025,.32,'#46e6d5',3);
 }
}
function wallDetailReserved(x,z,dx,dz){
 if(x>=9&&x<=18&&z>=86&&z<=97)return true;
 if(z===10&&dz===1&&x>=3&&x<=24)return true;
 // Door reveals need clear pockets for their moving leaves.
 if(['4','9'].includes(map[z+dz]?.[x+dx]))return true;
 if(x>=25&&x<=44&&z>=20&&z<=28)return true;
 if(x===25&&dx===-1&&z>=51&&z<=53)return true;
 if(x===35&&dx===-1&&z>=50&&z<=52)return true;
 if(x>=39&&x<=55&&z>=29&&z<=46)return true;
 if(x>=37&&x<=39&&z>=42&&z<=45)return true;
 if(x===39&&dx===1&&z>=55&&z<=57)return true;
 // Authored shelves and signs occupy these wall faces; keep automatic displays clear.
 if(z===49&&dz===1&&x>=29&&x<=34)return true;
 if(x===38&&dx===-1){for(const centre of crewBedZ)if(Math.abs(z+.5-centre)<1.25)return true;}
 if(z===49&&dz===1&&x>=40&&x<=46)return true;
 if(z===66&&dz===-1&&x>=26&&x<=28)return true;
 if(x===2&&dx===1&&z>=32&&z<=41)return true;
 // Reserve the full footprint of the authored arena grilles, including neighbouring tiles.
 if((x===3&&dx===1||x===24&&dx===-1)&&dz===0){for(let centre=70;centre<86;centre+=4)if(Math.abs(z+.5-centre)<1.1)return true;}
 return false;
}
function buildDeckSurfaces(arr){
 // One floor/ceiling pair per map cell: adjoining rooms cannot draw competing surfaces.
 for(let z=0;z<MH;z++)for(let x=0;x<MW;x++){
  if(x>7&&x<20&&z>1&&z<10)continue;
  if(!['0','4','6','8','9'].includes(map[z][x])||evaExterior(x,z)||marsZone(x,z))continue;
  let floor='#304652',ceiling='#273945';
  const within=s=>x>s.bounds[0]&&x<s.bounds[2]&&z>s.bounds[1]&&z<s.bounds[3];
  const side=sideSpaces.find(within),repair=repairRooms.find(within);
  if(side){floor=side.name==='CREW'?'#3d3c35':side.name==='MEDBAY'?'#30433e':'#233948';ceiling='#1b2e3c';}
  if(repair){floor=repair.name==='DIELŇA'?'#42382e':'#253d33';ceiling='#1c3037';}
  G.quad(arr,[x,0,z],[x+1,0,z],[x+1,0,z+1],[x,0,z+1],[0,1,0],floor,0);
  if(!evaExterior(x,z))G.quad(arr,[x,CEIL,z+1],[x+1,CEIL,z+1],[x+1,CEIL,z],[x,CEIL,z],[0,-1,0],ceiling);
 }
}
function decorateShip(arr){const B=G.box;
 // Arena wall modules alternate ventilation and inset service panels.
 for(const x of [4.05,23.95])for(let z=70;z<86;z+=4){
  B(arr,x,1.4,z,.12,1.65,1.5,'#152d3b');for(let k=0;k<7;k++)B(arr,x+(x<13?.08:-.08),.9+k*.15,z,.045,.04,1.25,'#516572');
  B(arr,x,2.6,z,.17,.10,1.6,x<13?'#3e9f9e':'#bb784c',3);
 }
 for(const [x,z]of [[7,72],[20,72],[6.5,79.5],[19.5,79.5],[10.5,75.5],[17.5,75.5]]){B(arr,x,.14,z,1.13,.28,1.13,'#182b37');B(arr,x,3.18,z,1.1,.32,1.1,'#172b38');}
 for(const x of [8.8,18.2])for(let z=70;z<86;z+=2){B(arr,x,.013,z,.06,.02,.45,x<13?'#367b7d':'#855f44',3);}
 B(arr,13.5,3.18,67.91,1.6,.38,.10,'#142836');label(arr,'07',13.26,3.30,67.985,.065,'#67bfb8');
 // Short threshold frames give the large rooms distinct entrances.
 for(const g of gates){B(arr,13.5,.015,g.z+1.1,5,.025,1.0,'#182c37',0);for(let x=11.15;x<16;x+=.4)B(arr,x,.033,g.z+1.48,.18,.02,.15,'#9c7848',3);}
 B(arr,4.1,1.25,82,.18,.9,.7,'#243f49');B(arr,4.23,1.35,82,.035,.18,.45,'#65c6b0',3);B(arr,4.25,1.35,82,.035,.47,.13,'#65c6b0',3);
 B(arr,13.5,3.18,10.91,2.2,.38,.10,'#182b39');label(arr,'BRIDGE',12.70,3.31,10.985,.07,'#69c0b8');
 // Authored pairs mirror the doorway centre; procedural tile parity cannot offset them.
 for(const x of [6.5,10.5,16.5,20.5])B(arr,x,2.8,11.03,.72,.085,.10,'#46e6d5',3);
 for(const x of [8.5,18.5]){B(arr,x,1.8,11.05,.60,.50,.13,'#071923');B(arr,x,1.8,11.12,.48,.38,.02,'#12675f',3);for(let n=0;n<4;n++)B(arr,x,1.69+n*.065,11.145,.32,.025,.025,'#46e6d5',3);}
 // A few fine screen readouts, not walls covered in emissive stripes.


}
