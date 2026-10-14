/* Mobile viewport fitting, fullscreen and rotate prompts. */
'use strict';
// Fit the visible mobile viewport; fullscreen still requires browser permission.
(()=>{
 if(!document.documentElement||typeof window.matchMedia!=='function')return;
 const root=document.documentElement,overlay=$('rotatePhone'),button=$('mobileFullscreen');
 if(!overlay||!button)return;
 let portraitDismissed=false,lastPortrait=null,lastMode=null,pending=false,wasFullscreen=false,guideWasPlaying=false;
 const standaloneMode=window.matchMedia('(display-mode: standalone)'),fullscreenMode=window.matchMedia('(display-mode: fullscreen)');
 const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const isApp=()=>navigator.standalone===true||standaloneMode.matches||(fullscreenMode.matches&&!isFullscreen());
 const needsIOSGuide=()=>isIOS&&!isApp()&&(!(game.requestFullscreen||game.webkitRequestFullscreen)||document.fullscreenEnabled===false);
 const isFullscreen=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
 const portrait=()=> (window.innerHeight||root.clientHeight)>(window.innerWidth||root.clientWidth);
 const message=text=>{
  $('fullscreenStatus').textContent=text;
  $('rotateStatus').textContent=text;
  if(state==='playing')notice(text,5);
 };
 function sync(){
  const on=touchInput.active,vertical=portrait();
  const height=Math.round(window.visualViewport?.height||window.innerHeight||root.clientHeight);
  if(height>0)root.style.setProperty?.('--mobile-height',height+'px');
  if(!vertical)portraitDismissed=false;
  const show=on&&vertical&&!portraitDismissed;
  overlay.classList.toggle('hidden',!show);
  if(show&&state==='playing')pause();
  button.classList.toggle('hidden',isApp());
  $('rotateFullscreen').classList.toggle('hidden',isApp());
  $('iosInstallTip').classList.toggle('hidden',!on||!isIOS||isApp());
  $('rotateHelp').textContent=isApp()?'Na šírku máš viac miesta na výhľad aj ovládanie.':needsIOSGuide()?'Na iPhone otvor hru z ikony na ploche, aby sa spustila bez líšt Safari. Na šírku máš viac miesta na ovládanie.':'Na šírku máš viac miesta na výhľad aj ovládanie. Pri štarte hra požiada o celú obrazovku.';
  button.textContent=needsIOSGuide()?'NA PLOCHU':isFullscreen()?'ZMENŠIŤ':'CELÁ OBRAZOVKA';
  $('rotateFullscreen').textContent=needsIOSGuide()?'AKO HRAŤ BEZ LIŠTY':'CELÁ OBRAZOVKA';
  button.setAttribute?.('aria-label',needsIOSGuide()?'Návod na spustenie z plochy iPhonu':isFullscreen()?'Ukončiť celú obrazovku':'Zobraziť hru na celú obrazovku');
  if(isApp()||needsIOSGuide()){$('fullscreenStatus').textContent='';$('rotateStatus').textContent='';}
  lastMode=on;
 }
 async function requestFullscreen(){
  if(!touchInput.active||isFullscreen()||isApp()||needsIOSGuide()||pending)return;
  const request=game.requestFullscreen||game.webkitRequestFullscreen;
  if(!request){message('Tento prehliadač nepodporuje celú obrazovku hry. Rozhranie sa prispôsobí dostupnému displeju.');return;}
  pending=true;
  try{await request.call(game,{navigationUI:'hide'});$('fullscreenStatus').textContent='';$('rotateStatus').textContent='';}
  catch{message('Pre celú obrazovku ťukni na CELÁ OBRAZOVKA. Ak ju prehliadač nepovolí, môžeš hrať v okne.');}
  finally{pending=false;sync();}
 }
 touchInput.requestFullscreen=requestFullscreen;
 function openIOSGuide(){
  guideWasPlaying=state==='playing';touchInput.reset();pause();
  $('iosInstallHelp').classList.remove('hidden');$('iosInstallClose').focus?.();
 }
 $('iosInstallOpen').addEventListener('click',openIOSGuide);
 $('iosInstallClose').addEventListener('click',()=>{
  $('iosInstallHelp').classList.add('hidden');
  if(guideWasPlaying&&state==='paused')resume();
  guideWasPlaying=false;
 });
 async function screenAction(){
  if(needsIOSGuide()){openIOSGuide();return;}
  if(isFullscreen()){
   try{await (document.exitFullscreen||document.webkitExitFullscreen)?.call(document);}catch{}
  }else await requestFullscreen();
 }
 button.addEventListener('click',screenAction);
 $('rotateFullscreen').addEventListener('click',screenAction);
 $('rotateContinue').addEventListener('click',()=>{portraitDismissed=true;sync();});
 function resize(){
  touchInput.reset();
  const vertical=portrait();
  if(touchInput.active&&lastPortrait!==null&&vertical!==lastPortrait){
   if(vertical){portraitDismissed=false;pause();}
   else requestFullscreen();
  }
  lastPortrait=vertical;sync();
 }
 function fullscreenChanged(){
  const full=isFullscreen();
  if(wasFullscreen&&!full&&touchInput.active)pause();
  wasFullscreen=full;resize();
 }
 window.addEventListener('resize',resize);
 window.addEventListener('orientationchange',resize);
 window.visualViewport?.addEventListener('resize',resize);
 document.addEventListener('fullscreenchange',fullscreenChanged);
 document.addEventListener('webkitfullscreenchange',fullscreenChanged);
 standaloneMode.addEventListener?.('change',sync);fullscreenMode.addEventListener?.('change',sync);
 const controlsSync=touchInput.sync;

 touchInput.sync=()=>{controlsSync();if(lastMode!==touchInput.active)sync();};
 lastPortrait=portrait();sync();
})();
