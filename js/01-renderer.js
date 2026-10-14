/* WebGL renderer (object G): shaders, meshes, lights, post pass. */
'use strict';
/* Small, dependency-free WebGL renderer for NEON BREACH II. */
'use strict';
const G=(()=>{
 const canvas=document.getElementById('view');const gl=canvas.getContext('webgl',{antialias:false,alpha:false});
 if(!gl){document.getElementById('notice').textContent='Táto hra potrebuje zapnutú grafickú akceleráciu prehliadača.';throw Error('WebGL unavailable')}
 const derivatives=gl.getExtension('OES_standard_derivatives');
 // The classic fract(sin(x)*43758.5453) hash is very sensitive to how a GPU evaluates sin() for large
 // arguments. Stars and floor/wall grain feed it large cell coordinates, so they use a sin-free hash
 // that gives the same result on every GPU. Add ?hash=old to the URL to get the previous hash back.
 const legacyHash=/[?&]hash=old\b/.test(location.search);
 const depthTextures=gl.getExtension('WEBGL_depth_texture');
 const vs=`attribute vec3 p;attribute vec3 n;attribute vec3 c;attribute float k;uniform mat4 vp;uniform mat4 model;varying vec3 P;varying vec3 N;varying vec3 C;varying float K;void main(){vec4 w=model*vec4(p,1.);P=w.xyz;N=mat3(model)*n;C=c;K=k;gl_Position=vp*w;}`;
 const fs=`${derivatives?'#extension GL_OES_standard_derivatives : enable\n':''}${legacyHash?'':'#define SAFE_HASH\n'}precision highp float;
varying vec3 P;varying vec3 N;varying vec3 C;varying float K;
uniform vec3 eye;uniform vec4 lp[12];uniform vec3 lc[12];uniform float clock;
// Scene environment. The defaults are the ship's own values, so existing scenes look exactly as before.
uniform vec3 fogc;uniform float fogd;uniform vec3 amb;uniform vec3 sunDir;uniform vec3 sunCol;uniform float marsMode;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float hash2(vec2 p){
#ifdef SAFE_HASH
 vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);
#else
 return hash(p);
#endif
}
// The sin hash is not uniform, so it produced fewer stars than a uniform hash would at the same cut-off;
// the safe hash uses a higher cut-off to keep the same average star density as before.
#ifdef SAFE_HASH
#define STAR_CUT .98
#else
#define STAR_CUT .968
#endif
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return noise(p)*.55+noise(p*2.03)*.27+noise(p*4.07)*.12+noise(p*8.11)*.06;}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash2(i),hash2(i+vec2(1,0)),f.x),mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),f.x),f.y);}
float vfbm(vec2 p){return vnoise(p)*.55+vnoise(p*2.03)*.27+vnoise(p*4.07)*.12+vnoise(p*8.11)*.06;}
// Fade material marks smaller than a screen pixel instead of letting them shimmer.
float footprint(vec2 uv){return ${derivatives?'max(length(dFdx(uv)),length(dFdy(uv)))':'length(eye-P)*.0025'};}
float detail(vec2 uv,float frequency){return 1.-smoothstep(.45,1.25,footprint(uv)*frequency);}
void main(){
 vec3 normal=normalize(N);vec3 view=normalize(eye-P);
 if(K>3.5&&K<4.5){
  vec3 q=normal;vec3 aq=abs(q);vec2 uv;float face;
  if(aq.z>=aq.x&&aq.z>=aq.y){uv=q.xy/aq.z;face=q.z>0.?1.:2.;}
  else if(aq.x>=aq.y){uv=q.zy/aq.x;face=q.x>0.?3.:4.;}
  else{uv=q.xz/aq.y;face=q.y>0.?5.:6.;}
  float mist=fbm(q.xy*4.+q.z*2.);float ribbon=pow(max(0.,1.-abs(q.y*.95+q.x*.38-.08)),6.);
  vec3 sky=vec3(.006,.013,.029)+ribbon*pow(mist,2.)*vec3(.11,.16,.29);
  sky+=pow(max(0.,fbm(q.yz*5.)-.42),2.)*vec3(.22,.08,.25);
  vec2 grid=uv*130.;vec2 cell=floor(grid);float h=hash2(cell+face*67.);
  vec2 centre=vec2(.23+.54*hash2(cell+17.),.23+.54*hash2(cell+39.));
  float star=(1.-smoothstep(.06,.17,length(fract(grid)-centre)))*step(STAR_CUT,h);
  sky+=star*mix(vec3(.38,.59,.82),vec3(.92,.9,.78),hash2(cell+83.));
  gl_FragColor=vec4(sky,1.);return;
 }
 if(K>4.5&&K<5.5){
  // Restrained reflection of overhead light, stronger at grazing angles.
  float edge=pow(1.-abs(dot(normal,view)),4.);
  vec3 reflected=reflect(-view,normal);
  float ceiling=pow(max(0.,reflected.y),9.);
  float sheen=smoothstep(.86,.98,sin(P.x*.19+P.y*.65+P.z*.13));
  vec3 tint=vec3(.10,.23,.28)+sheen*vec3(.035,.055,.06)+ceiling*vec3(.22,.31,.32);
  bool exteriorCanopy=marsMode>.5&&(eye.x<53.||eye.x>59.||eye.z<118.||eye.z>122.);
  if(exteriorCanopy)tint=mix(tint,vec3(.035,.34,.37),.60);
  gl_FragColor=vec4(tint,(exteriorCanopy?.15:.043)+edge*.19+ceiling*.052+sheen*.018);return;
 }
 if(K>5.5&&K<6.5){
  vec3 q=normal;vec2 uv=vec2(atan(q.z,q.x)*1.6,q.y*4.);
  float terrain=fbm(uv*2.4+vec2(1.3,.7));
  vec3 sea=mix(vec3(.014,.075,.17),vec3(.025,.24,.38),terrain);
  vec3 land=mix(vec3(.055,.19,.14),vec3(.28,.36,.21),smoothstep(.53,.74,terrain));
  vec3 col=mix(sea,land,smoothstep(.49,.53,terrain));
  float cloud=smoothstep(.54,.72,fbm(uv*4.+vec2(q.y*2.,.8)));
  col=mix(col,vec3(.76,.87,.89),cloud*.9);
  col=mix(col,vec3(.7,.85,.89),smoothstep(.83,.98,abs(q.y))*.8);
  float day=smoothstep(-.2,.75,dot(q,normalize(vec3(-.7,.6,.65))));
  col*=.09+day*.96;float rim=pow(1.-max(0.,dot(normal,view)),3.8);
  col+=vec3(.07,.33,.57)*rim*(.25+day*.75);
  gl_FragColor=vec4(col,1.);return;
 }
 if(K>6.5&&K<7.5){
  vec3 q=normal;
  // The cloud belts share the actual ring tilt, with seamless longitudinal wisps.
  vec3 pole=normalize(vec3(0.,.9075,-.42)),sun=normalize(vec3(-.6,.5,.5));
  float latitude=dot(q,pole);vec2 longitudePlane=vec2(q.x,dot(q,normalize(vec3(0.,.42,.9075))));
  float turbulence=fbm(longitudePlane*vec2(7.,9.)+vec2(latitude*3.,latitude*5.));
  float belt=latitude+(turbulence-.5)*.025*(1.-abs(latitude));
  float broad=.5+.5*sin(belt*19.5+.45*sin(belt*7.));
  float narrow=.5+.5*sin(belt*64.+(turbulence-.5)*2.);
  vec3 col=mix(vec3(.48,.39,.27),vec3(.86,.78,.60),.28+broad*.46+narrow*.13);
  float wisps=fbm(longitudePlane*vec2(19.,25.)+vec2(latitude*8.,latitude*31.));
  float storm=pow(max(0.,dot(q,normalize(vec3(-.78,.44,.44)))),85.);
  col+=vec3(.085,.074,.050)*(wisps-.5)+vec3(.055,.050,.035)*storm*(.4+wisps);
  col=mix(col,vec3(.57,.59,.53),smoothstep(.65,.97,abs(latitude))*.32);
  // Analytic ring shadow uses the same annulus, gap and sunlight as eva.js.
  // All lengths are in planet radii, so moving/scaling Saturn cannot detach it.
  float travel=-latitude/dot(sun,pole);float ringRadius=length(q+sun*travel);
  float annulus=smoothstep(1.29,1.32,ringRadius)*(1.-smoothstep(1.82,1.86,ringRadius));
  float gap=smoothstep(1.555,1.565,ringRadius)*(1.-smoothstep(1.595,1.605,ringRadius));
  float ringShadow=annulus*(1.-gap)*step(.001,travel);
  float sunlight=max(0.,dot(q,sun));
  col*=vec3(.035,.047,.065)+vec3(pow(sunlight,.62)*.98*(1.-ringShadow*.66));
  float rim=pow(1.-abs(dot(q,view)),4.);
  col+=vec3(.15,.17,.17)*rim*(.12+sunlight*.35);
  gl_FragColor=vec4(col,1.);return;
 }

 if(abs(K-2.7)<.02){
  // Martian ground: dust, pebbles, broad colour drifts; lit by the low sun and veiled by dust haze.
  vec2 uv=P.xz;vec3 base=C;
  float big=vfbm(uv*.05),mid=vfbm(uv*.42+3.1),pebble=hash2(floor(uv*9.));
  base*=.74+big*.52;base*=.93+mid*.14;
  base*=1.-step(.968,pebble)*.12*detail(uv,9.);
  float cliff=1.-smoothstep(.3,.82,normal.y);float band=.5+.5*sin(P.y*3.7+vfbm(uv*.12)*1.1);
  base*=mix(1.,.83+band*.3,cliff);base+=vec3(.07,.022,.006)*cliff*band;
  float ripple=sin(uv.x*1.7+vfbm(uv*.6)*5.)*.5+.5;base*=.96+ripple*.06*detail(uv,2.);
  vec3 col=base*(amb+sunCol*max(0.,dot(normal,sunDir)));
  col=mix(col,fogc,1.-exp(-length(eye-P)*fogd));col=col/(col+vec3(.74));gl_FragColor=vec4(pow(col,vec3(.86)),1.);return;
 }
 if(abs(K-2.75)<.02){
  // Mars seen from orbit.
  vec3 q=normal;vec2 uv=vec2(atan(q.z,q.x)*2.,q.y*4.);
  float t=vfbm(uv*2.1),maria=smoothstep(.5,.68,vfbm(uv*1.2+5.));
  vec3 col=mix(vec3(.50,.22,.11),vec3(.80,.44,.21),t);col=mix(col,vec3(.20,.09,.07),maria*.7);
  col=mix(col,vec3(.9,.86,.82),smoothstep(.84,.95,abs(q.y)));
  float day=smoothstep(-.12,.72,dot(q,sunDir));col*=.05+day*1.02;
  float rim=pow(1.-max(0.,dot(normal,view)),3.4);col+=vec3(.75,.38,.24)*rim*(.15+day*.7);
  gl_FragColor=vec4(col,1.);return;
 }
 if(abs(K-2.9)<.02){
  // Martian daytime sky: butterscotch dust, pale haze at the horizon, blue glow around the sun.
  vec3 q=normalize(N);float h=q.y;
  vec3 col=mix(vec3(.88,.62,.46),vec3(.50,.32,.23),smoothstep(0.,.75,h));
  col=mix(col,vec3(.86,.70,.58),pow(1.-clamp(abs(h)*2.2,0.,1.),3.)*.55);
  float haze=vfbm(vec2(atan(q.z,q.x)*3.,h*9.));col*=.94+haze*.12;
  float s=max(0.,dot(q,sunDir));col+=vec3(.55,.62,.72)*pow(s,10.)*.30+vec3(.95,.72,.5)*pow(s,3.)*.15;
  col+=vec3(1.,.93,.8)*smoothstep(.9987,.9994,s)*1.3;
  col=mix(col,vec3(.40,.22,.15),smoothstep(0.,-.35,h));
  gl_FragColor=vec4(col,1.);return;
 }
 bool baked=K>7.5;float material=baked?K-8.:K;
 // Shade the actual interior surfaces, not the entire view through a cockpit window.
 // The flag is zero in every original ship scene. The lander remains at these coordinates during its cinematic.
 float cabinFloor=marsMode>1.5?-.05:.95;
 bool sheltered=marsMode>.5&&((P.x>53.01&&P.x<58.99&&P.z>118.01&&P.z<121.99&&P.y>cabinFloor&&P.y<4.1)||(P.x>51.99&&P.x<60.01&&P.z>63.99&&P.z<70.01&&P.y<3.21));
 vec3 base=C;vec3 light=baked?vec3(1.):sheltered?vec3(.24,.37,.44):amb;vec3 spec=vec3(0.);
 float grain=hash2(floor(P.xz*14.)+floor(P.y*14.));
 if(material<.5){vec2 f=fract(P.xz);float seam=step(.018,min(min(f.x,f.y),min(1.-f.x,1.-f.y)));base*=mix(.98,mix(.58,1.,seam),detail(P.xz,18.));base*=mix(.98,.88+grain*.20,detail(P.xz,14.));
  if(P.x>39.5&&P.x<55.3&&P.z>29.5&&P.z<46.){
   vec2 tile=floor(P.xz);base*=.91+hash2(tile)*.16;
   float scratch=step(.988,hash2(floor(P.xz*36.)))*step(.67,grain);base+=vec3(.018,.023,.019)*scratch*detail(P.xz,36.);
   // Soft, fixed light footprints from the physical grow lamps; no camera-dependent popping.
   float spill=0.;for(int j=0;j<4;j++){vec2 lamp=vec2(j<2?44.5:51.5,(j==0||j==2)?35.4:40.6);vec2 q=(P.xz-lamp)/vec2(1.7,2.5);spill+=exp(-dot(q,q)*.65);}
   base+=vec3(.013,.034,.018)*spill;
  }}
 else if(material<2.5){
  vec2 uv=abs(normal.x)>.5?P.zy:abs(normal.y)>.5?P.xz:P.xy;
  float fine=hash2(floor(uv*34.)),visible=detail(uv,34.);base*=mix(.985,.92+fine*.13,visible);
  if(material>1.5){float wear=step(.98,fine)*step(.55,grain);base+=vec3(.045,.049,.04)*wear*visible;}
 }
 if(marsMode>.5&&!sheltered&&material<2.5){
  vec2 uv=abs(normal.x)>.5?P.zy:abs(normal.y)>.5?P.xz:P.xy;
  float weather=vfbm(uv*1.8),chips=hash2(floor(uv*18.));
  float rust=smoothstep(.60,.74,weather)*(.5+step(.78,chips)*.5);
  base=mix(base,vec3(.37,.15,.075),rust*.30*detail(uv,18.));
  float dust=(1.-smoothstep(.1,.8,P.y))*max(0.,normal.y*.5+.5);
  base=mix(base,vec3(.49,.25,.14),dust*.20);
 }
 if(material>2.5){gl_FragColor=vec4(base,1.);return;}
 if(!baked&&!sheltered)light+=sunCol*max(0.,dot(normal,sunDir));
 for(int i=0;i<12;i++){vec3 d=lp[i].xyz-P;float dist=length(d);float att=pow(max(0.,1.-dist/lp[i].w),2.);vec3 dir=d/max(dist,.001);light+=lc[i]*max(0.,dot(normal,dir))*att*1.2;vec3 halfV=normalize(dir+view);spec+=lc[i]*pow(max(0.,dot(normal,halfV)),material<.5?28.:18.)*att*(material<.5?.18:.06);}
 vec3 col=base*light+spec;float fog=1.-exp(-length(eye-P)*(sheltered?.007:fogd));col=mix(col,sheltered?vec3(.018,.032,.045):fogc,fog);col=col/(col+vec3(.74));gl_FragColor=vec4(pow(col,vec3(.86)),1.);
}`;
 function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
 const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
 const attrs=['p','n','c','k'].map(x=>gl.getAttribLocation(prog,x)),uniforms={};for(const x of ['vp','model','eye','lp','lc','clock','fogc','fogd','amb','sunDir','sunCol','marsMode'])uniforms[x]=gl.getUniformLocation(prog,x==='lp'||x==='lc'?x+'[0]':x);
 const post=gl.createProgram();gl.attachShader(post,shader(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}'));gl.attachShader(post,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 uv;uniform sampler2D source;uniform vec2 texel;vec3 bright(vec2 off){vec3 c=texture2D(source,uv+off*texel).rgb;return c*max(0.,max(c.r,max(c.g,c.b))-.65);}void main(){vec3 c=texture2D(source,uv).rgb;vec3 glow=bright(vec2(2.,0.))+bright(vec2(-2.,0.))+bright(vec2(0.,2.))+bright(vec2(0.,-2.))+bright(vec2(3.,3.))+bright(vec2(-3.,3.))+bright(vec2(3.,-3.))+bright(vec2(-3.,-3.));gl_FragColor=vec4(c+glow*.085,1.);}`));gl.linkProgram(post);if(!gl.getProgramParameter(post,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(post));const screen=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,screen);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);const postPos=gl.getAttribLocation(post,'position'),postTexel=gl.getUniformLocation(post,'texel'),postSource=gl.getUniformLocation(post,'source');
 // Optional presentation mode: ?scale=sharp stretches the image to the physical screen with "sharp
 // bilinear" (even pixels at non-whole zoom ratios, but softer at small ratios such as 1.5x).
 // The default is the original crisp nearest-neighbour stretch done by the browser.
 const legacyScale=!/[?&]scale=sharp\b/.test(location.search);
 let present=null,presentSource,presentSrc,presentOut,presentSharp,postFrame=null,postTexture=null,postW=0,postH=0,devW=0,devH=0,presentFailed=false,imageRendering=null;
 const presenting=()=>!presentFailed&&!legacyScale&&!document.documentElement.classList.contains('touch-mode');
 try{
  const presentVertex='attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
  const presentFragment=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv;uniform sampler2D source;uniform vec2 srcSize;uniform vec2 outSize;uniform float sharp;
void main(){
 vec2 pix=uv*srcSize;vec2 target=floor(pix)+.5;
 if(sharp>.5){
  vec2 scale=outSize/srcSize;vec2 region=max(.5-.5/scale,0.);vec2 d=fract(pix)-.5;
  vec2 sharpPos=floor(pix)+(d-clamp(d,-region,region))*scale+.5;
  target=mix(pix,sharpPos,step(vec2(1.),scale));
 }
 gl_FragColor=vec4(texture2D(source,target/srcSize).rgb,1.);
}`;
  present=gl.createProgram();gl.attachShader(present,shader(gl.VERTEX_SHADER,presentVertex));gl.attachShader(present,shader(gl.FRAGMENT_SHADER,presentFragment));
  gl.bindAttribLocation(present,postPos,'position');gl.linkProgram(present);
  if(!gl.getProgramParameter(present,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(present));
  presentSource=gl.getUniformLocation(present,'source');presentSrc=gl.getUniformLocation(present,'srcSize');presentOut=gl.getUniformLocation(present,'outSize');presentSharp=gl.getUniformLocation(present,'sharp');
 }catch(e){present=null;presentFailed=true}
 // Exact size of the canvas in physical pixels (falls back to CSS size x devicePixelRatio).
 try{if(typeof ResizeObserver==='function')new ResizeObserver(entries=>{const box=entries[entries.length-1].devicePixelContentBoxSize;if(box&&box[0]){devW=Math.round(box[0].inlineSize);devH=Math.round(box[0].blockSize)}}).observe(canvas,{box:'device-pixel-content-box'})}catch(e){}
 // The observer value is exact (it already accounts for rounding at fractional zoom); it is only
 // trusted when it agrees with CSS size x devicePixelRatio, otherwise the calculation is used.
 function deviceSize(){const r=window.devicePixelRatio||1,cw=Math.round(canvas.clientWidth*r),ch=Math.round(canvas.clientHeight*r);return [Math.min(8192,Math.max(1,Math.abs(devW-cw)<=2?devW:cw)),Math.min(8192,Math.max(1,Math.abs(devH-ch)<=2?devH:ch))]}
 function allocPost(w,h){
  if(!postFrame){postFrame=gl.createFramebuffer();postTexture=gl.createTexture()}
  gl.bindTexture(gl.TEXTURE_2D,postTexture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  gl.bindFramebuffer(gl.FRAMEBUFFER,postFrame);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,postTexture,0);
  const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindTexture(gl.TEXTURE_2D,null);
  if(ok){postW=w;postH=h}else presentFailed=true;
 }
 const frame=gl.createFramebuffer(),texture=gl.createTexture(),depth=gl.createRenderbuffer(),depthTexture=depthTextures?gl.createTexture():null;let targetW=0,targetH=0,depth16=false;
 function target(w,h){
  const setupTexture=()=>{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);};
  gl.bindTexture(gl.TEXTURE_2D,texture);setupTexture();gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  gl.bindFramebuffer(gl.FRAMEBUFFER,frame);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
  // 16-bit depth loses centimetre-sized panel separation across a room. Prefer
  // the higher precision depth format provided by WebGL 1's depth extension.
  if(depthTexture){gl.bindTexture(gl.TEXTURE_2D,depthTexture);setupTexture();gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,w,h,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,depthTexture,0);}
  if(!depthTexture||gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){depth16=true;gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);}
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Incomplete render target');
  gl.bindTexture(gl.TEXTURE_2D,null);targetW=w;targetH=h;
 }
 function setImageRendering(value){if(imageRendering!==value){imageRendering=value;canvas.style.imageRendering=value}}
 function finish(){
  if(!presenting()){setImageRendering('');legacyFinish();return}
  // Pass 1: the unchanged glow pass, into an internal-resolution texture.
  gl.bindFramebuffer(gl.FRAMEBUFFER,postFrame);gl.viewport(0,0,targetW,targetH);gl.disable(gl.DEPTH_TEST);gl.useProgram(post);
  for(const a of attrs)gl.disableVertexAttribArray(a);
  gl.bindBuffer(gl.ARRAY_BUFFER,screen);gl.enableVertexAttribArray(postPos);gl.vertexAttribPointer(postPos,2,gl.FLOAT,false,0,0);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(postSource,0);gl.uniform2f(postTexel,1/targetW,1/targetH);gl.drawArrays(gl.TRIANGLES,0,6);
  // Pass 2: stretch it to the physical pixels of the canvas.
  const [dw,dh]=deviceSize();if(canvas.width!==dw||canvas.height!==dh){canvas.width=dw;canvas.height=dh}
  setImageRendering('auto');
  const sx=dw/targetW,sy=dh/targetH,whole=sx>=1&&sy>=1&&Math.abs(sx-Math.round(sx))<.002&&Math.abs(sy-Math.round(sy))<.002;
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,dw,dh);gl.useProgram(present);
  gl.bindTexture(gl.TEXTURE_2D,postTexture);gl.uniform1i(presentSource,0);gl.uniform2f(presentSrc,targetW,targetH);gl.uniform2f(presentOut,dw,dh);gl.uniform1f(presentSharp,whole?0:1);
  gl.vertexAttribPointer(postPos,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,6);
 }
 function legacyFinish(){gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.disable(gl.DEPTH_TEST);gl.useProgram(post);for(const a of attrs)gl.disableVertexAttribArray(a);gl.bindBuffer(gl.ARRAY_BUFFER,screen);gl.enableVertexAttribArray(postPos);gl.vertexAttribPointer(postPos,2,gl.FLOAT,false,0,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(postSource,0);gl.uniform2f(postTexel,1/targetW,1/targetH);gl.drawArrays(gl.TRIANGLES,0,6)}
 const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
 function multiply(a,b){const r=new Float32Array(16);for(let col=0;col<4;col++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[col*4+row]+=a[k*4+row]*b[col*4+k];return r}
 function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),r=new Float32Array(16);r[0]=f/aspect;r[5]=f;r[10]=(far+near)/(near-far);r[11]=-1;r[14]=2*far*near/(near-far);return r}
 function view(x,y,z,a,pitch){const forward=[Math.cos(a)*Math.cos(pitch),Math.sin(pitch),Math.sin(a)*Math.cos(pitch)],right=[-Math.sin(a),0,Math.cos(a)],up=[-Math.cos(a)*Math.sin(pitch),Math.cos(pitch),-Math.sin(a)*Math.sin(pitch)];return new Float32Array([right[0],up[0],-forward[0],0,right[1],up[1],-forward[1],0,right[2],up[2],-forward[2],0,-(right[0]*x+right[2]*z),-(up[0]*x+up[1]*y+up[2]*z),forward[0]*x+forward[1]*y+forward[2]*z,1])}
 function transform(x,y,z,a=0,scale=1){const c=Math.cos(a)*scale,s=Math.sin(a)*scale;return new Float32Array([c,0,-s,0,0,scale,0,0,s,0,c,0,x,y,z,1])}
 function color(hex){if(Array.isArray(hex))return hex;return [parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255]}
 function vertex(arr,v,n,c,k){arr.push(...v,...n,...c,k)}
 function quad(arr,a,b,c,d,n,col,k=1){col=color(col);const len=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));const nx=k<2.5?Math.ceil(len(a,b)/.85):1,ny=k<2.5?Math.ceil(len(a,d)/.85):1;const at=(u,v)=>a.map((x,i)=>x+(b[i]-x)*u+(d[i]-x)*v);for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const aa=at(x/nx,y/ny),bb=at((x+1)/nx,y/ny),cc=at((x+1)/nx,(y+1)/ny),dd=at(x/nx,(y+1)/ny);for(const v of [aa,bb,cc,aa,cc,dd])vertex(arr,v,n,col,k)}}
 function box(arr,x,y,z,w,h,d,col,k=1){const a=x-w/2,b=x+w/2,e=y-h/2,f=y+h/2,g=z-d/2,i=z+d/2;quad(arr,[a,e,g],[b,e,g],[b,f,g],[a,f,g],[0,0,-1],col,k);quad(arr,[b,e,i],[a,e,i],[a,f,i],[b,f,i],[0,0,1],col,k);quad(arr,[a,e,i],[a,e,g],[a,f,g],[a,f,i],[-1,0,0],col,k);quad(arr,[b,e,g],[b,e,i],[b,f,i],[b,f,g],[1,0,0],col,k);quad(arr,[a,f,g],[b,f,g],[b,f,i],[a,f,i],[0,1,0],col,k);quad(arr,[a,e,i],[b,e,i],[b,e,g],[a,e,g],[0,-1,0],col,k)}
 function sphere(arr,r,col,k=2,planet=false){const seg=planet?72:28,lat=planet?40:18;const point=(i,j)=>{let a=i/seg*Math.PI*2,b=j/lat*Math.PI;return [Math.cos(a)*Math.sin(b),Math.cos(b),Math.sin(a)*Math.sin(b)]};for(let j=0;j<lat;j++)for(let i=0;i<seg;i++){const pts=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];let cc=color(col);if(planet){const q=pts[0],v=Math.sin(q[0]*17+q[2]*3)+Math.cos(q[1]*19-q[0]*7)+Math.sin(q[2]*21+q[1]*4);cc=color(v>.4?'#439c83':v>0?'#67b8a3':'#186c99');if(Math.sin(q[0]*25+q[1]*22)>.86&&Math.cos(q[2]*15)>.1)cc=color('#afd9d4');const shade=Math.max(.12,.55+q[0]*.35+q[1]*.24);cc=cc.map(v=>v*shade)}for(const q of [pts[0],pts[1],pts[2],pts[0],pts[2],pts[3]])vertex(arr,q.map(v=>v*r),q,cc,k)}}
 function mesh(arr,mode=gl.TRIANGLES){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);return {b,count:arr.length/10,mode}}
 function draw(m,model=identity()){if(!m)return;gl.bindBuffer(gl.ARRAY_BUFFER,m.b);for(let i=0;i<4;i++){gl.enableVertexAttribArray(attrs[i]);gl.vertexAttribPointer(attrs[i],i===3?1:3,gl.FLOAT,false,40,[0,12,24,36][i])}gl.uniformMatrix4fv(uniforms.model,false,model);gl.drawArrays(m.mode,0,m.count)}
 // Bake fixed fixtures into subdivided geometry once; camera motion cannot change them.
 function bake(arr,lamps,occluders=[]){const cache=new Map();const ls=lamps.map(l=>({...l,rgb:color(l.c)}));for(let i=0;i<arr.length;i+=10){if(arr[i+9]>2.5)continue;const x=arr[i],y=arr[i+1],z=arr[i+2],nx=arr[i+3],ny=arr[i+4],nz=arr[i+5];const key=[x,y,z,nx,ny,nz].map(v=>v.toFixed(2)).join(',');let lit=cache.get(key);if(!lit){lit=[.24,.3,.38];for(const l of ls){const dx=l.x-x,dy=l.y-y,dz=l.z-z,dist=Math.hypot(dx,dy,dz);if(dist>=l.r)continue;const a=Math.pow(1-dist/l.r,2)*Math.max(0,(dx*nx+dy*ny+dz*nz)/Math.max(.01,dist))*.58;for(let c=0;c<3;c++)lit[c]+=l.rgb[c]*a;}cache.set(key,lit);}let ao=1;
 if(x>39.5&&x<55.3&&z>29.5&&z<46.5){
  if(ny>.5&&y<.08){for(const ob of occluders){if(ob.x<39)continue;const dx=Math.max(0,Math.abs(x-ob.x)-ob.w/2),dz=Math.max(0,Math.abs(z-ob.z)-ob.d/2),d=Math.hypot(dx,dz);if(d<1.2)ao=Math.min(ao,.28+.72*(1-Math.exp(-d*3.5)));}ao*=.78+.22*Math.min(1,Math.min(x-39.5,55.3-x,z-29.5,46.5-z));}
  else if(Math.abs(ny)<.5)ao=.67+.33*Math.min(1,y/.8);
 }
 for(let c=0;c<3;c++)arr[i+6+c]*=lit[c]*ao;arr[i+9]+=8;}return arr;}
 function glass(m,model){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);draw(m,model);gl.depthMask(true);gl.disable(gl.BLEND);}
 function remove(m){if(m)gl.deleteBuffer(m.b)}
 // The offscreen target and visible canvas must always use the same resolution.
 function renderSize(){
  const cw=Math.max(1,canvas.clientWidth),ch=Math.max(1,canvas.clientHeight),aspect=cw/ch;
  const mobile=document.documentElement?.classList.contains('touch-mode');
  const desktopWidth=Number(document.documentElement?.dataset?.desktopResolution)||640;
  const width=mobile?Math.max(240,Math.min(640,Math.round(Math.sqrt(240000*aspect)),Math.round(cw))):Math.min(desktopWidth,Math.max(640,Math.round(cw)));
  return {aspect,width,height:Math.max(1,Math.round(width/aspect))};
 }
 // Scene environment; the ship's values are the defaults. The game sets env before begin().
 const env={fog:[.016,.028,.042],fogd:.009,amb:[.46,.56,.64],sunDir:[-.62,.44,.66],sunCol:[0,0,0],clear:[.016,.032,.061]};
 function begin(player,lights,time){const {aspect,width,height}=renderSize();if(!presenting()&&(canvas.width!==width||canvas.height!==height)){canvas.width=width;canvas.height=height}gl.viewport(0,0,width,height);gl.clearColor(env.clear[0],env.clear[1],env.clear[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);const eye=[player.x,1.45+(player.lift||0),player.y];gl.uniformMatrix4fv(uniforms.vp,false,multiply(perspective(1.14,aspect,.12,240),view(...eye,player.a,player.pitch)));gl.uniform3fv(uniforms.eye,eye);gl.uniform1f(uniforms.clock,time);gl.uniform3fv(uniforms.fogc,env.fog);gl.uniform1f(uniforms.fogd,env.fogd);gl.uniform3fv(uniforms.amb,env.amb);{const d=env.sunDir,l=Math.hypot(...d);gl.uniform3f(uniforms.sunDir,d[0]/l,d[1]/l,d[2]/l)}gl.uniform3fv(uniforms.sunCol,env.sunCol);gl.uniform1f(uniforms.marsMode,env.mars||0);const nearest=lights.slice(0,12);const pos=new Float32Array(48),cols=new Float32Array(36);for(let i=0;i<12;i++){const l=nearest[i]||{x:0,y:0,z:0,r:1,c:[0,0,0]};pos.set([l.x,l.y,l.z,l.r],i*4);cols.set(color(l.c),i*3)}gl.uniform4fv(uniforms.lp,pos);gl.uniform3fv(uniforms.lc,cols)}
 const originalBegin=begin;begin=function(...args){gl.useProgram(prog);const {width:w,height:h}=renderSize();if(presenting()&&(postW!==w||postH!==h))allocPost(w,h);if(w!==targetW||h!==targetH)target(w,h);else gl.bindFramebuffer(gl.FRAMEBUFFER,frame);originalBegin(...args)};
 // ?debug=1 shows a small panel with the facts that decide how the image is drawn on this machine.
 if(/[?&]debug\b/.test(location.search))setInterval(()=>{
  let el=document.getElementById('gpuDebug');
  if(!el){el=document.createElement('pre');el.id='gpuDebug';el.style.cssText='position:fixed;left:8px;top:8px;z-index:99;margin:0;padding:8px;background:#000c;color:#9fe;font:11px monospace;white-space:pre;pointer-events:none';document.body.appendChild(el)}
  const ext=gl.getExtension('WEBGL_debug_renderer_info');
  el.textContent=['GPU: '+(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)),
   'dpr '+devicePixelRatio+'  css '+canvas.clientWidth+'x'+canvas.clientHeight,
   'canvas '+canvas.width+'x'+canvas.height+'  internal '+targetW+'x'+targetH+'  sharp scaling '+presenting(),
   'derivatives '+!!derivatives+'  depthTexture '+!!depthTextures+'  depth16 fallback '+depth16,
   'hash '+(legacyHash?'old (sin)':'safe')].join('\n');
 },1000);
 return {gl,canvas,env,identity,multiply,transform,quad,box,sphere,mesh,draw,remove,begin,finish,color,bake,glass};
})();
