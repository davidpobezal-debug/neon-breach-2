/* Extra collision volumes for decorative details. */
'use strict';
function buildDetailCollision(){
 for(const x of [28.5,30.1,31.7])colliders.push({x,z:21.17,w:1.25,d:.36,h:2.7});
 colliders.push({x:33.05,z:27.70,w:1.24,d:.48,h:1.75});
 for(const z of [37.4,38.25])colliders.push({x:31.84,z,w:.30,d:.75,h:2.34});
}
// Small, supported details stay inside existing furniture footprints.
function decorateRoomDetails(arr){const B=G.box;
 const bolt=(x,y,z)=>B(arr,x,y,z,.035,.035,.018,'#a5b8b7');
 // Suit lockers: recessed charging contacts, pressure lines, numbered bays.
 for(const [i,x]of [28.5,30.1,31.7].entries()){
  for(const dx of [-.52,.52]){B(arr,x+dx,1.35,21.29,.06,2.45,.08,'#68828a');for(const y of [.25,2.51])bolt(x+dx,y,21.34);}
  B(arr,x,2.40,21.32,.57,.10,.12,'#273e48');B(arr,x,2.39,21.395,.42,.035,.018,'#85dfca',3);
  for(const y of [.7,1.10,1.9]){B(arr,x-.39,y,21.35,.10,.14,.11,'#9c9e8e');B(arr,x-.39,y,21.412,.045,.05,.014,'#203b49');}
  B(arr,x,.24,21.37,.73,.06,.25,'#617b80');label(arr,'0'+(i+1),x+.17,2.65,21.34,.034,'#c2c9b4');
 }
 // The repair bench uses a mounted pegboard and a supported task lamp.
 B(arr,33.4,1.86,21.18,1.93,1.42,.17,'#29434e');B(arr,33.4,1.89,21.28,1.70,1.13,.04,'#536563');
 for(let x=32.72;x<34.2;x+=.18)for(let y=1.45;y<2.38;y+=.16)B(arr,x,y,21.308,.021,.021,.012,'#19313c');
 for(const x of [32.86,33.22,33.58]){B(arr,x,1.89,21.36,.065,.49,.07,'#b0b8a4');B(arr,x,2.11,21.37,.18,.14,.06,'#adbea9');B(arr,x,2.14,21.41,.075,.095,.01,'#344e54');B(arr,x,1.69,21.38,.07,.14,.06,'#d29556');}
 B(arr,33.4,2.59,21.40,1.96,.15,.58,'#3b5560');B(arr,33.4,2.51,21.46,1.55,.025,.35,'#ecb979',3);
 for(const x of [32.52,34.27])B(arr,x,2.48,21.21,.07,.3,.13,'#708a8b');
 for(const y of [.31,.59,.82]){B(arr,33.4,y,22.016,1.58,.20,.035,'#263f4c');B(arr,33.4,y+.05,22.05,.50,.035,.05,'#94a7a2');}
 lights.push({x:33.4,y:2.25,z:22.0,r:3,c:'#dba365'});
 // Wall oxygen manifold: every cylinder is strapped into the rack.
 for(const x of [32.65,33.05,33.45]){hydroTube(arr,[x,.12,27.70],[x,1.55,27.70],.12,'#6d898b',10);for(const y of [.35,1.28])B(arr,x,y,27.71,.29,.10,.32,'#344e5a');B(arr,x,1.64,27.70,.08,.18,.08,'#ad8d60');}
 B(arr,33.05,.08,27.70,1.24,.16,.48,'#263f4b');
 decorateSuitServiceStation(arr);
 // Workshop benches have dedicated tool panels and visible stored components.
 for(const x of [41.5,45.5]){
  B(arr,x,1.90,50.13,2.30,1.24,.18,'#2b424a');B(arr,x,1.93,50.235,2.08,1.02,.035,'#6c7166');
  for(let dx=-.87;dx<.9;dx+=.17)for(let y=1.52;y<2.35;y+=.16)B(arr,x+dx,y,50.26,.022,.022,.018,'#293e41');
  for(const dx of [-.65,-.24,.20,.64]){B(arr,x+dx,1.91,50.30,.06,.39,.055,'#c0c1a9');B(arr,x+dx,2.10,50.31,.17,.12,.06,'#bac2b2');B(arr,x+dx,2.13,50.35,.07,.085,.015,'#45585b');}
  for(const dx of [-.92,.92])B(arr,x+dx,2.53,50.20,.08,.26,.18,'#647c81');
  B(arr,x,2.67,50.47,2.18,.12,.78,'#3d535d');B(arr,x,2.60,50.53,1.80,.025,.42,'#e6b477',3);
  for(const y of [.30,.70]){B(arr,x,y,52.001,1.72,.29,.025,'#263d48');B(arr,x,y+.06,52.03,.66,.04,.05,'#9ba99c');}
  B(arr,x+.53,1.35,51.60,.42,.17,.34,'#253c46');B(arr,x+.53,1.45,51.60,.46,.04,.36,'#b17e52');
  for(const dx of [-.72,.72])for(const z of [51.02,51.98])bolt(x+dx,1.18,z);
 }
 // Medical storage and bedside fittings, aligned with the original couches.
 for(const z of [34.5,41.5]){
  for(const x of [28.65,30.55]){B(arr,x,.12,z,.28,.24,.72,'#1c3341');B(arr,x,.66,z-.57,.065,.21,.07,'#78979a');B(arr,x,.66,z+.57,.065,.21,.07,'#78979a');}
  for(const dz of [-.57,.57])B(arr,29.6,.78,z+dz,2.1,.07,.065,'#a3bcb3');
  for(let x=28.65;x<30.6;x+=.28)B(arr,x,.50,z+.533,.13,.10,.022,'#1b3441');
  B(arr,29.0,.48,z+.56,.32,.09,.025,'#4ba9a2',3);
 }
 // Shallow drawers attach directly to the east medical partition, away from doors.
 for(const z of [37.4,38.25]){
  B(arr,31.84,1.73,z,.28,1.21,.75,'#6d8586');B(arr,31.682,1.73,z,.027,1.03,.63,'#314f59');
  B(arr,31.66,1.65,z,.018,.32,.07,'#85c6ad');B(arr,31.658,1.65,z,.018,.075,.29,'#85c6ad');
  B(arr,31.65,1.98,z+.22,.05,.055,.13,'#c5c7ad');
 }
}

// Approved oxygen and spacesuit inspection station; south wall faces north.
function decorateSuitServiceStation(arr){const B=G.box,z=27.86;
 const metal='#344e5a',edge='#71858a',dark='#102631',cyan='#46e6d5',amber='#ff934d';
 // Fit the lower lamp/vent between display bottom1.25 and inner cabinet bottom.72.
 // Three equal clear gaps keep the vent wholly above the cabinet's bottom frame.
 const lowerGap=(1.25-.72-.14-.25)/3;
 const ventY=.72+lowerGap+.25/2,lampY=ventY+.25/2+lowerGap+.14/2;
 // Cabinet rear embeds in the native wall; every inset has a supported bezel.
 B(arr,30.65,1.83,27.985,2.32,2.38,.19,metal);
 B(arr,30.65,1.83,27.883,2.16,2.22,.025,'#273e49');
 // Cyan task lamp and amber lower readiness lamp, recessed into metal housings.
 for(const [x,y,w,c]of [[30.22,2.88,1.27,cyan],[30.22,lampY,.83,amber]]){
  B(arr,x,y,z,w+.16,.14,.055,dark);
  B(arr,x,y,27.824,w,.046,.025,c,3);
 }
 B(arr,30.22,2.00,z,1.35,1.50,.06,edge);
 B(arr,30.22,2.00,27.821,1.22,1.37,.025,'#081c25');
 // Pixel silhouette: helmet, shoulder seals, torso, gloves, legs and boots.
 const suit=[
  '000011110000','000110011000','000100001000','000110011000',
  '000011110000','001110011100','011000000110','010100001010',
  '010100001010','010100001010','010100001010','010100001010',
  '011100001110','000100001000','000111111000','000101101000',
  '000101101000','000101101000','000101101000','000101101000',
  '001101101100','001111111100'];
 const size=.039;
 for(let r=0;r<suit.length;r++)for(let c=0;c<suit[r].length;c++)if(suit[r][c]==='1')
  B(arr,30.56-c*size,2.53-r*size,27.801,size*.85,size*.85,.018,'#91e3d8',3);
 // Status bars sit alongside the silhouette, with a small amber caution symbol.
 for(let k=0;k<4;k++){
  B(arr,29.91,2.49-k*.19,27.802,.30,.066,.017,'#1c4a50');
  B(arr,29.925,2.49-k*.19,27.788,.27-k*.025,.035,.017,cyan,3);
 }
 for(const [dx,dy,w]of [[0,0,.028],[0,-.04,.062],[0,-.08,.097]])B(arr,29.92+dx,1.56+dy,27.798,w,.031,.018,amber,3);
 B(arr,29.92,1.485,27.780,.018,.043,.016,dark);
 B(arr,29.92,1.455,27.780,.018,.012,.016,dark);
 B(arr,30.22,1.42,27.798,.72,.025,.018,cyan,3);
 // Faceted pressure dial, a recessed circular face, ticks and a physical needle.
 const disk=(x,y,r,depth,c)=>{
  const zz=27.85-depth;
  hydroTube(arr,[x,y,27.88],[x,y,zz],r,c,16);
  const rgb=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);
  // G.quad authors parallelograms; circular caps need a true triangle fan.
  for(let k=0;k<16;k++){
   const a=k*Math.PI/8,b=(k+1)*Math.PI/8;
   for(const p of [[x,y,zz],[x+r*Math.cos(b),y+r*Math.sin(b),zz],[x+r*Math.cos(a),y+r*Math.sin(a),zz]])
    arr.push(...p,0,0,-1,...rgb,1);
  }
 };
 B(arr,31.38,2.36,z,.61,.65,.06,dark);
 disk(31.38,2.39,.235,.034,edge);disk(31.38,2.39,.19,.043,'#b0b8a5');
 for(let k=0;k<9;k++){
  const a=.25+k*Math.PI*.28;
  B(arr,31.38+Math.cos(a)*.16,2.39+Math.sin(a)*.16,27.800,.022,.022,.02,dark);
 }
 hydroTube(arr,[31.38,2.39,27.782],[31.30,2.49,27.782],.013,'#a55534',6);
 B(arr,31.38,2.39,27.777,.031,.031,.022,metal);
 // O₂: a full-size O and a smaller, lowered 2; no shared-font change.
 label(arr,'O',31.63,2.84,27.84,.036,'#9faeaa',Math.PI);
 label(arr,'2',31.508,2.74,27.84,.022,'#9faeaa',Math.PI);
 label(arr,'BAR',31.61,2.04,27.814,.031,'#bac8bd',Math.PI);
 // Two capped ports bolt to the cabinet. Enclosed pipes run to the bottle rack.
 for(const y of [1.64,1.23]){
  B(arr,31.39,y,z,.53,.30,.055,dark);
  disk(31.39,y,.118,.073,metal);disk(31.39,y,.078,.081,'#b49362');
  B(arr,31.39,y,27.758,.035,.098,.035,'#334955');
 }
 for(const [x,y]of [[31.70,1.64],[31.74,1.23]]){
  B(arr,x,y-.27,27.91,.18,.62,.12,metal);
  hydroTube(arr,[31.48,y,27.84],[x,y,27.84],.034,'#7a9695',6);
  hydroTube(arr,[x,y,27.84],[x,.84,27.84],.034,'#7a9695',6);
 }
 B(arr,32.10,.84,27.91,.86,.16,.13,metal);
 hydroTube(arr,[31.70,.84,27.84],[32.43,.84,27.84],.045,'#6e888a',8);
 B(arr,32.43,1.30,27.91,.15,1.02,.13,metal);
 hydroTube(arr,[32.43,.84,27.84],[32.43,1.80,27.84],.045,'#6e888a',8);
 B(arr,32.94,1.80,27.91,1.18,.17,.13,metal);
 hydroTube(arr,[32.43,1.80,27.84],[33.45,1.80,27.84],.045,'#6e888a',8);
 for(const x of [32.65,33.05,33.45])hydroTube(arr,[x,1.80,27.84],[x,1.73,27.70],.035,'#b3986e',8);
 // Small corner markings and supported ventilation rather than decorative stripes.
 // Preserve the left corner mark; remove only the circled mark at the cyan lamp end.
 for(const x of [31.68]){
  B(arr,x,2.94,27.845,.11,.025,.020,amber,3);
  B(arr,x,2.90,27.845,.025,.105,.020,amber,3);
 }
 B(arr,30.22,ventY,z,.81,.25,.055,dark);
 for(let k=0;k<4;k++)B(arr,30.22,ventY+.08-k*.051,27.82,.66,.017,.025,'#607b82');
 lights.push({x:30.22,y:2.75,z:27.56,r:2.7,c:'#46bdb7'},
  {x:30.22,y:lampY+.02,z:27.56,r:1.8,c:'#c98553'});
}
