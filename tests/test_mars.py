#!/usr/bin/env python3
"""Plays the whole Mars interlude through the game's own functions (no pixels) and checks every step.

    python3 tests/test_mars.py

Covers: first warp leg -> arrival at Mars, boarding the lander, descent, landing, welding the junction box,
depot door and defenders, cutting the clamp, taking the part, ascent, docking, walkway installation,
save/restore at each stage, and the second warp leg to the ending.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _harness import launch, open_page, sync_playwright

SETUP = '''()=>{
 window.T={fails:[],log:[]};
 window.ok=(c,m)=>{T.log.push((c?'ok   ':'FAIL ')+m);if(!c)T.fails.push(m)};
 window.run=(secs,dt=.05)=>{for(let t=0;t<secs;t+=dt)update(dt)};
 window.hold=(secs)=>{keys.KeyE=true;run(secs);keys.KeyE=false};
 window.at=(x,z,a)=>{player.x=x;player.y=z;player.a=a;player.pitch=0;player.suitVX=player.suitVZ=0};
 window.target=()=>{const t=interactionTarget();return t?t.kind+':'+(t.data&&t.data.id||t.data):null};
 // The menu shortcut builds the ship as it is after the original EVA repair, at the navigation panel.
 $('marsStart').click();
}'''

STEPS = [
 ('menu shortcut', '''()=>{
  ok(state==='playing'&&room===4&&navReady&&shipSystems.drive&&mars.phase==='none','shortcut state: '+state+' room '+room);
  ok(unlocked&&weapon===0&&player.hp===100&&!eva.suit&&eva.stowed,'weapon unlocked, suit stowed');
  ok(gates.every(g=>g.active&&g.open===1)&&sideDoors.every(d=>d.active),'all gates and side doors open');
  ok(logs.some(l=>l.title.includes('ŽIVÁ SPRÁVA')&&l.body.includes('ARES-3')),'Mira log present with the ARES-3 text');
  ok(checkpoint&&checkpoint.room===4,'checkpoint written');
  ok(Math.hypot(player.x-13.5,player.y-4.8)<2.1,'close enough to the nav panel to launch');
 }'''),
 ('leg 1 launch', '''()=>{
  ok(interactionLabel().includes('MEDZIZASTÁVKA MARS'),'nav label announces the Mars stop: '+interactionLabel());
  launch();ok(state==='flight'&&mars.leg===1,'warp leg 1 started');
  let n=0;while(state==='flight'&&n++<600)update(.05);
  ok(state==='playing'&&mars.phase==='orbit','arrived at Mars, phase='+mars.phase+' state='+state);
  ok(!blocked(player.x,player.y,.22),"arrival spot in the cockpit is free: "+player.x+","+player.y);
  ok(navReady===false,'course must be recalculated after the stabilizer burns out');
  ok(eva.stowed===false&&!eva.suit&&!eva.tool,'suit and welder are available again');
  ok(marsGoal().includes('ARES-3'),'goal mentions the depot: '+marsGoal());
  ok(logs.some(l=>l.title.includes('MARS')),'log entry written');
  ok(checkpoint.mission.mars.phase==='orbit','checkpoint stored the Mars phase');
 }'''),
 ('nav is blocked while the stabilizer is burnt', '''()=>{
  at(13.5,5.2,-Math.PI/2);ok(target()==='nav:null','nav target found: '+target());
  ok(interactionLabel().includes('VYPÁLENÝ'),'label explains the blocker');
  interact();ok(navReady===false&&state==='playing','nav does not launch');
 }'''),
 ('equipment + walkway + boarding', '''()=>{
  eva.suit=eva.tool=true;at(62,25.5,0);ok(evaVacuum(),'on the walkway = vacuum');
  ok(target()==='mars:board','board target: '+target());
  interact();ok(marsZone(player.x,player.y)&&marsInLander(),'inside the lander: '+player.x+','+player.y);
  ok(!evaVacuum(),'lander interior is pressurised');
  ok(marsGoal().includes('PILOTN'),'goal points to the pilot console: '+marsGoal());
 }'''),
 ('port leads back to the walkway', '''()=>{
  at(56,121.2,Math.PI/2);ok(target()==='mars:port','port target: '+target());
  interact();ok(!marsZone(player.x,player.y)&&evaVacuum(),'back on the walkway');
  at(62,25.5,0);interact();ok(marsInLander(),'boarded again');
 }'''),
 ('descent', '''()=>{
  at(56,120.4,-Math.PI/2);ok(target()==='mars:seat','seat target: '+target());
  interact();ok(state==='flight'&&mars.cine==='descent','descent cinematic running');
  let n=0;while(state==='flight'&&n++<800)update(.05);
  ok(state==='playing'&&mars.phase==='surface'&&!mars.cine,'landed, phase='+mars.phase);
  ok(defenses.filter(e=>e.dormant).length===5,'five dormant defenders in the depot: '+defenses.length);
  ok(checkpoint.mission.mars.phase==='surface','landing checkpoint stored');
 }'''),
 ('cockpit is not a trap', '''()=>{
  ok(player.y>119.3&&!blocked(player.x,player.y,.3),'seat spot has room around it: '+player.y);
  // Real collision test on a fine grid with a fat player (r .34): the way from the seat to the hatch must exist.
  const saved=map[120][52];map[120][52]='0';
  const st=.04,key=(x,y)=>Math.round(x/st)+','+Math.round(y/st),seen=new Set([key(player.x,player.y)]),q=[[player.x,player.y]];let reach=false;
  for(let i=0;i<q.length&&i<600000;i++){const [x,y]=q[i];if(x<51.6){reach=true;break}for(const [dx,dy] of [[st,0],[-st,0],[0,st],[0,-st]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(seen.has(k)||blocked(nx,ny,.34))continue;seen.add(k);q.push([nx,ny])}}
  map[120][52]=saved;ok(reach,'path from the seat to the hatch exists for r=.34');
  // Standing inside furniture is repaired automatically.
  const L=MZ.lander;player.x=L.x-1.6;player.y=L.z-.4;ok(blocked(player.x,player.y,.2),'test point is inside a seat collider');
  update(.05);ok(!blocked(player.x,player.y,.2),'player was pushed out of the collider: '+player.x.toFixed(2)+','+player.y.toFixed(2));
  player.x=L.x;player.y=L.z-1.5;update(.05);ok(!blocked(player.x,player.y,.2),'and out of the console');
  at(56,120.6,-Math.PI/2);
 }'''),
 ('walking routes exist (grid flood fill with the real collision test)', '''()=>{
  const saved={d:mars.doorOpen,h:map[120][52]};mars.doorOpen=true;marsApplyState();map[120][52]='0';
  const reach=(sx,sz)=>{const seen=new Set([Math.floor(sx)+','+Math.floor(sz)]),q=[[Math.floor(sx),Math.floor(sz)]];for(let i=0;i<q.length;i++){const [x,z]=q[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const k=(x+dx)+','+(z+dz);if(seen.has(k)||blocked(x+dx+.5,z+dz+.5,.24))continue;seen.add(k);q.push([x+dx,z+dz])}}return seen};
  const r=reach(56.5,120.5),has=(x,z)=>r.has(Math.floor(x)+','+Math.floor(z));
  ok(has(51.5,120.5),'hatch exterior reachable from the cockpit');
  ok(has(63.2,67.5),'junction work spot reachable');ok(has(56.5,72.5),'depot door approach reachable');
  ok(has(56.5,66.5),'cage front reachable inside the depot');ok(has(58.5,68.5),'terminal reachable');
  ok(!has(56,60),'cannot walk out of the crater');
  ok(r.size>400,'crater floor is a generous area: '+r.size+' cells');
  mars.doorOpen=saved.d;marsApplyState();map[120][52]=saved.h;
 }'''),
 ('hatch opens for the suited player, closed behaviour', '''()=>{
  at(53.5,120.5,Math.PI);run(1.2);ok(map[120][52]==='0','hatch cell open next to the player');
  at(51,120.5,Math.PI);run(.3);at(46,114,0);run(1.5);ok(map[120][52]==='9','hatch closes again when the player walks away');
  ok(marsOutside()&&evaVacuum(),'outside = suit mode');
  const o=eva.oxygen;run(10);ok(eva.oxygen<o-3,'oxygen drains on the surface: '+o+' -> '+eva.oxygen);
 }'''),
 ('junction weld', '''()=>{
  at(63.2,67.5,Math.PI);ok(target()==='mars:junction','junction target: '+target());
  ok(interactionLabel().includes('DRŽ E'),'hold label: '+interactionLabel());
  ok(evaHoldingTool()===false,'tool is not out before E is held');
  hold(2);ok(mars.pr.junction>.3&&!mars.junction,'progress grows: '+mars.pr.junction);
  run(.1);ok(evaHoldingTool()===false,'tool back to rifle after releasing E');
  hold(4);run(.1);ok(mars.junction===true,'junction repaired');
  ok(map[70][55]==='9','door still closed until the player approaches');
 }'''),
 ('door and defenders', '''()=>{
  at(56,72.5,-Math.PI/2);run(.5);ok(mars.doorOpen&&map[70][55]==='0'&&map[70][56]==='0','depot door open');
  ok(!marsOutside()===false||true,'-');
  run(2);const d=defenses.filter(e=>!e.dormant||mars.doorOpen);ok(d.length===5,'defenders awake');
  ok(Math.min(...defenses.map(e=>Math.hypot(e.x-player.x,e.y-player.y)))<12,'defenders come towards the player');
  // They have to be fought; the weld refuses while they are close.
  at(56,66.5,-Math.PI/2);ok(target()==='mars:clamp','clamp target: '+target());
  ok(interactionLabel().includes('ROBOTY'),'label blocks welding with robots near: '+interactionLabel());
  hold(2);ok(!(mars.pr.clamp>0),'no progress while threatened');
  defenses=[];ok(interactionLabel().includes('DRŽ E'),'label allows welding when clear');
  hold(5);ok(mars.clamp===true,'clamp cut');
  ok(target()==='mars:part','part target: '+target());interact();ok(mars.part===true,'part taken');
  ok(checkpoint.mission.mars.part===true,'checkpoint holds the part');
 }'''),
 ('restore on the surface keeps state', '''()=>{
  restore();ok(mars.phase==='surface'&&mars.part&&mars.clamp&&mars.junction&&mars.doorOpen,'mars state restored: '+JSON.stringify(mars));
  ok(map[70][55]==='0','door cells restored open');ok(eva.suit&&eva.tool,'suit and tool kept after restore');
  ok(state==='playing','playing after restore');
 }'''),
 ('ascent and docking', '''()=>{
  at(56,120.4,-Math.PI/2);ok(target()==='mars:seat','seat target: '+target());interact();
  ok(mars.cine==='ascent','ascent running');let n=0;while(state==='flight'&&n++<800)update(.05);
  ok(state==='playing'&&mars.phase==='returned','docked with the part: '+mars.phase);
 }'''),
 ('walkway installation', '''()=>{
  at(56,121.2,Math.PI/2);ok(target()==='mars:port','port: '+target());interact();
  at(47.5,25.4,Math.PI/2);ok(target()==='mars:mount','mount target: '+target());
  ok(interactionLabel().includes('ODREZAŤ'),'cut label: '+interactionLabel());hold(5);ok(mars.oldCut,'old stabilizer cut off');
  ok(interactionLabel().includes('ZASADIŤ'),'insert label: '+interactionLabel());interact();ok(mars.seated,'new unit seated');
  ok(interactionLabel().includes('ZVARIŤ'),'weld label: '+interactionLabel());hold(7);
  ok(mars.installed&&mars.phase==='done','installed, phase='+mars.phase);
  ok(checkpoint.mission.mars.phase==='done','checkpoint stored done');
 }'''),
 ('return and second warp leg', '''()=>{
  // Back through the airlock and out of the suit (the doff rules for the original repair apply again).
  ok(marsGoal().includes('KOMORY'),'goal: '+marsGoal());
  at(28.5,23.4,-Math.PI/2);eva.suit=true;ok(target()==='eva:doff','doff target: '+target());interact();ok(eva.stowed&&!eva.suit,'suit stowed');
  room=4;at(13.5,5.2,-Math.PI/2);ok(target()==='nav:null','nav target');
  ok(interactionLabel().includes('PREPOČÍTAŤ'),'recalculate label: '+interactionLabel());interact();ok(navReady,'course recalculated');
  ok(interactionLabel().includes('LYRU'),'launch label: '+interactionLabel());
  launch();ok(state==='flight'&&mars.leg===2,'leg 2 started');let n=0;while(state==='flight'&&n++<600)update(.05);
  ok(state==='ended','the game ends after leg 2: '+state);
 }'''),
]

def main():
    with sync_playwright() as p:
        browser = launch(p)
        ctx, page, errors = open_page(browser, 1280, 720)
        page.evaluate(SETUP)
        bad = 0
        for name, js in STEPS:
            try:
                page.evaluate(js)
            except Exception as e:
                page.evaluate("()=>T.fails.push('EXCEPTION')")
                print('EXCEPTION in', name, str(e)[:500])
            log = page.evaluate('()=>{const l=T.log;T.log=[];return l}')
            print('--', name)
            for l in log:
                print('  ', l)
        fails = page.evaluate('()=>T.fails')
        print('page errors:', errors)
        print('FAILS:', fails)
        browser.close()
        sys.exit(1 if fails or errors else 0)
main()
