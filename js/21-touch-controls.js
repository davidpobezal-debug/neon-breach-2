/* Touch input (pointer capture). */
'use strict';
// Pointer capture keeps movement, looking and held actions independent per finger.
(()=>{
 if(!document.documentElement||typeof window.matchMedia!=='function')return;
 const root=document.documentElement,coarse=window.matchMedia('(pointer: coarse)'),noHover=window.matchMedia('(hover: none)');
 const pad=$('movePad'),knob=$('moveKnob'),look=$('lookPad');
 if(!pad||!look)return;
 let moveId=null,lookId=null,lookX=0,lookY=0;
 const held=new Map(),prompts=new Map();
 const capture=(el,id)=>{try{el.setPointerCapture(id)}catch{}};
 const reset=()=>{
  moveId=lookId=null;touchInput.forward=touchInput.side=0;
  knob.style.transform='translate(-50%,-50%)';
  for(const [el,hold]of held){if(hold.code)keys[hold.code]=false;if(hold.fire)mouseDown=false;el.classList.remove('pressed');}
  held.clear();
 };
 touchInput.reset=reset;
 const setMode=on=>{
  if(touchInput.active===on)return;reset();touchInput.active=on;root.classList.toggle('touch-mode',on);
  $('touchHelp').classList.toggle('hidden',!on);
  if(on&&document.pointerLockElement)document.exitPointerLock();
  if(!on)for(const [el,p]of prompts){if(el.textContent===p.display)el.textContent=p.original;} 
 };
 const detect=()=>setMode(coarse.matches||(typeof navigator!=='undefined'&&navigator.maxTouchPoints>0&&noHover.matches));
 coarse.addEventListener?.('change',detect);noHover.addEventListener?.('change',detect);detect();
 document.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch')setMode(true);
  else if(e.pointerType==='mouse'&&window.matchMedia('(pointer: fine)').matches)setMode(false);
 },{passive:true});
 const playable=e=>touchInput.active&&state==='playing'&&e.pointerType!=='mouse';
 const moveStick=e=>{
  const r=pad.getBoundingClientRect(),radius=r.width*.34;
  let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
  const distance=Math.hypot(x,y);if(distance>radius){x*=radius/distance;y*=radius/distance;}
  const amount=Math.hypot(x,y)/radius;
  const scale=amount<.12?0:(amount-.12)/(.88*Math.max(amount,.001));
  touchInput.side=x/radius*scale;touchInput.forward=-y/radius*scale;
  knob.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;
 };
 pad.addEventListener('pointerdown',e=>{if(!playable(e)||moveId!==null)return;e.preventDefault();moveId=e.pointerId;capture(pad,moveId);moveStick(e);});
 pad.addEventListener('pointermove',e=>{if(e.pointerId!==moveId)return;e.preventDefault();if(state==='playing')moveStick(e);else reset();});
 const stopMove=e=>{if(e.pointerId!==moveId)return;moveId=null;touchInput.forward=touchInput.side=0;knob.style.transform='translate(-50%,-50%)';};
 for(const kind of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(kind,stopMove);
 look.addEventListener('pointerdown',e=>{if(!playable(e)||lookId!==null)return;e.preventDefault();lookId=e.pointerId;lookX=e.clientX;lookY=e.clientY;capture(look,lookId);});
 look.addEventListener('pointermove',e=>{
  if(e.pointerId!==lookId)return;e.preventDefault();
  if(state==='playing'){
   const sensitivity=4.6/Math.max(320,look.ownerDocument.documentElement.clientWidth);
   player.a+=(e.clientX-lookX)*sensitivity;
   player.pitch=clamp(player.pitch-(e.clientY-lookY)*sensitivity,-.65,.65);
  }
  lookX=e.clientX;lookY=e.clientY;
 });
 const stopLook=e=>{if(e.pointerId===lookId)lookId=null;};
 for(const kind of ['pointerup','pointercancel','lostpointercapture'])look.addEventListener(kind,stopLook);
 function holdButton(id,code,fire=false){
  const el=$(id);
  el.addEventListener('pointerdown',e=>{
   if(!playable(e)||el.disabled||held.has(el))return;e.preventDefault();capture(el,e.pointerId);
   held.set(el,{id:e.pointerId,code,fire});el.classList.add('pressed');
   if(code)keys[code]=true;
   if(fire){mouseDown=true;shoot();}
   if(code==='KeyE')interact();
  });
  const stop=e=>{const hold=held.get(el);if(!hold||hold.id!==e.pointerId)return;
   if(hold.code)keys[hold.code]=false;if(hold.fire)mouseDown=false;held.delete(el);el.classList.remove('pressed');};
  for(const kind of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(kind,stop);
 }
 holdButton('touchFire',null,true);holdButton('touchInteract','KeyE');holdButton('touchSprint','ShiftLeft');
 const tap=(id,fn)=>$(id).addEventListener('click',()=>{if(state!=='playing')return;fn();if(state!=='playing')reset();});
 tap('touchReload',beginReload);tap('touchWeapon',()=>switchWeapon(weapon===0?1:0));tap('touchEMP',useEMP);
 tap('touchMap',openShipMap);tap('touchJournal',()=>openJournal());tap('touchPause',pause);
 for(const el of [pad,look,$('touchControls')])el.addEventListener('contextmenu',e=>e.preventDefault());
 window.addEventListener('blur',reset);window.addEventListener('resize',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){reset();pause();}});
 const translate=text=>text
  .replace(/ĽAVÉ TLAČIDLO STRIEĽA \/ R PREBÍJA/g,'STREĽBA / PREBIŤ')
  .replace(/stlač E\b/g,'ťukni na POUŽIŤ').replace(/klávesom E\b/g,'tlačidlom POUŽIŤ')
  .replace(/Kláves M\b/g,'Tlačidlo STAV LODE').replace(/\bJ otvorí/g,'Tlačidlo DENNÍK otvorí')
  .replace(/\bM zobrazí/g,'Tlačidlo STAV LODE zobrazí').replace(/KLÁVESOM J/g,'TLAČIDLOM DENNÍK')
  .replace(/EMP \/ Q/g,'EMP').replace(/Q \/ EMP/g,'EMP')
  .replace(/WASD \+ MYŠ/g,'DOTYKOVÉ OVLÁDANIE').replace(/KLÁVESOM E/g,'TLAČIDLOM POUŽIŤ')
  .replace(/STLAČ E/g,'ŤUKNI NA POUŽIŤ').replace(/DRŽ E/g,'DRŽ POUŽIŤ').replace(/\bE\b/g,'POUŽIŤ')
  .replace(/\bESC\b/g,'PAUZA').replace(/\bMYŠ\b/g,'POHĽAD').replace(/\bWASD\b/g,'JOYSTICK')
  .replace(/\bQ EMP\b/g,'EMP').replace(/1 \/ 2 — ZBRAŇ/g,'ZBRAŇ').replace(/R — PREBIŤ/g,'PREBIŤ').replace(/\bR —/g,'PREBIŤ').replace(/\bM\b/g,'STAV LODE').replace(/\bJ\b/g,'DENNÍK');
 touchInput.formatText=text=>touchInput.active?translate(text):text;
 touchInput.sync=()=>{
  if(state!=='playing')reset();
  if(!touchInput.active)return;
  const tool=evaHoldingTool();
  $('touchFire').disabled=!intro.gun||tool;$('touchReload').disabled=!intro.gun||tool;
  $('touchWeapon').disabled=!unlocked||tool;$('touchEMP').disabled=!shipSystems.emp;
  $('touchInteract').textContent=tool&&interactionTarget()?.data==='weld'?'ZVÁRAŤ':'POUŽIŤ';
  for(const id of ['objective','interaction','guideBody','notice','reloadtext','airlockStatus','comm','empStatus','journalClose','mapClose','pauseHelp']){
   const el=$(id);if(!el)continue;const previous=prompts.get(el),value=el.textContent;
   const original=previous&&value===previous.display?previous.original:value;
   const display=['journalClose','mapClose'].includes(id)?'SPÄŤ DO HRY':id==='pauseHelp'?'Hra je pozastavená. Ťukni na POKRAČOVAŤ.':translate(original||'');if(value!==display)el.textContent=display;prompts.set(el,{original,display});
  }
 };
})();
