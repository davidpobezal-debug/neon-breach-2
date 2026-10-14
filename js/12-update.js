/* Main per-frame update. */
'use strict';
function update(dt){touchInput.sync();time+=dt;if(state==='playing')stats.time+=dt;updateMessages(dt);if(state==='flight'){flightTime+=dt;if(mars.cine){updateMarsCine(dt);return}player.x+=(bridgeLayout.flight.x-player.x)*dt*2;player.y+=(bridgeLayout.flight.z-player.y)*dt*2;player.a+=angle(-Math.PI/2-player.a)*dt*2;player.pitch=0;$('cinematic').innerHTML=mars.leg===1?(flightTime<2?'POHON SA NABÍJA <small>AUTOPILOT AKTÍVNY</small>':flightTime<9?'WARP SKOK <small>KURZ: LYRA · MEDZIZASTÁVKA MARS</small>':'MARS NA DOHĽAD <small>SKOK DOKONČENÝ · STABILIZÁTOR ZLYHAL</small>'):flightTime<2?'POHON SA NABÍJA <small>AUTOPILOT AKTÍVNY</small>':flightTime<9?'WARP SKOK <small>KURZ: DOMOV</small>':'DOMOV NA DOHĽAD <small>SKOK DOKONČENÝ · VITAJ DOMA</small>';if(flightTime>16){if(mars.leg===1)marsArrive();else finish(true)}return}if(state!=='playing')return;
 for(const g of gates)if(g.active&&g.open<1){g.open=Math.min(1,g.open+dt*.5);if(g.open===1)for(let x=11;x<16;x++)map[g.row][x]='0'}
 cooldown=Math.max(0,cooldown-dt);flash=Math.max(0,flash-dt);hit=Math.max(0,hit-dt);hurt=Math.max(0,hurt-dt);if(reload){reload-=dt;if(reload<=0){reload=0;ammo=weapons[weapon].cap;magazines[weapon]=ammo;hud();tone(330,.08,'triangle',.03,1.5)}}
 player.a+=((keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0))*dt*2;player.pitch=clamp(player.pitch+((keys.ArrowUp?1:0)-(keys.ArrowDown?1:0))*dt*.8,-.65,.65);
 let f=(keys.KeyW?1:0)-(keys.KeyS?1:0)+(touchInput.active?touchInput.forward:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0)+(touchInput.active?touchInput.side:0),n=Math.max(1,Math.hypot(f,s));const outside=evaVacuum(),speed=outside?(marsOutside()?2.3:1.65):eva.suit?2.6:(keys.ShiftLeft||keys.ShiftRight?5.5:3.4);f=f/n*speed;s=s/n*speed;const dx=Math.cos(player.a)*f-Math.sin(player.a)*s,dz=Math.sin(player.a)*f+Math.cos(player.a)*s;if(outside){const blend=1-Math.exp(-dt*6);player.suitVX=(player.suitVX||0)+(dx-(player.suitVX||0))*blend;player.suitVZ=(player.suitVZ||0)+(dz-(player.suitVZ||0))*blend;move(player,player.suitVX*dt,player.suitVZ*dt);}else{player.suitVX=player.suitVZ=0;move(player,dx*dt,dz*dt);}if(f||s)walk+=dt*speed*(outside?1.15:2);
 if(intro.active&&intro.gun&&player.y<86){intro.active=false;spawnWave();saveCheckpoint();notice('SEKTOR 07 · PAGER VĽAVO PRI VÝCHODE / E PREČÍTAŤ',5);}
 for(let n=1;n<5;n++)if(!entered[n]&&gates[n-1].open===1&&player.y<gates[n-1].row){enterRoom(n);break}
 if(mouseDown||keys.Space)shoot();
 flowTimer-=dt;if(flowTimer<=0){calculateFlow();flowTimer=.35}
 updateSideSystems(dt);updateSystems(dt);updateEVA(dt);if(state!=='playing')return;updateMars(dt);if(state!=='playing')return;
 for(const e of [...enemies,...defenses]){
  if(e.dormant&&!mars.doorOpen)continue;
  if(e.kind==='shield'){const target=Math.atan2(player.x-e.x,player.y-e.y);e.facing+=clamp(angle(target-e.facing),-dt*.85,dt*.85);}
  e.phase+=dt*3;e.flash=Math.max(0,e.flash-dt);e.attack-=dt;e.stun=Math.max(0,e.stun-dt);if(e.stun)continue;
  const d=Math.hypot(player.x-e.x,player.y-e.y),ranged=['shooter','guard','boss','turret'].includes(e.kind),visible=shotLine(e.x,e.y,player.x,player.y,1.45,1.45);
  if(e.kind==='turret'&&!power)e.phase+=dt;
  if(e.windup>0){e.windup=Math.max(0,e.windup-dt);if(!e.windup){e.dash=.42;e.dx=(player.x-e.x)/Math.max(d,.01);e.dy=(player.y-e.y)/Math.max(d,.01);}continue;}
  if(e.dash>0){e.dash-=dt;move(e,e.dx*4.3*dt,e.dy*4.3*dt,.22);}
  else if(e.kind==='runner'&&d>2.5&&d<7&&visible&&e.attack<=0){e.windup=.4;e.attack=2.5;tone(260,.12,'triangle',.025,1.7);}
  if(e.charge>0){e.charge=Math.max(0,e.charge-dt);if(!e.charge&&visible){fireEnemy(e);e.attack=e.kind==='turret'?1.6:e.kind==='boss'?1.5:1.3+Math.random()*.35;}}
  else if(ranged&&d<18&&visible&&e.attack<=0){e.chargeMax=e.kind==='turret'?.65:e.kind==='boss'?(e.attackIndex%2?.8:.5):.4;e.charge=e.chargeMax;tone(650,.12,'sine',.014,1.2);}
  if(e.kind!=='turret'&&!e.charge&&!e.windup&&!e.dash){
   if(ranged&&visible&&d>=4.3&&d<=8){const a=Math.atan2(player.y-e.y,player.x-e.x),ox=e.x,oy=e.y;move(e,-Math.sin(a)*e.strafe*dt*.75,Math.cos(a)*e.strafe*dt*.75);if(Math.hypot(e.x-ox,e.y-oy)<dt*.1)e.strafe*=-1;}
   else if(ranged&&visible&&d<4.3){const a=Math.atan2(player.y-e.y,player.x-e.x);move(e,-Math.cos(a)*dt*.7,-Math.sin(a)*dt*.7);}
   else if(d>(ranged?6:.7)||!visible)enemyMove(e,dt);
  }
  if(e.kind!=='turret'&&visible&&d<.8&&e.attack<=0){hurtPlayer(e.kind==='runner'?8:ranged?14:11);e.attack=.85;if(state!=='playing')break;}
 }

 separateEnemies(dt);
 updateBolts(dt);if(state!=='playing')return;
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=dt*5;if(p.life<=0)particles.splice(i,1)}
 if(nextWave>0){nextWave-=dt;if(nextWave<=0)spawnWave()}
 updatePickups();$('interaction').textContent=interactionLabel();
}
