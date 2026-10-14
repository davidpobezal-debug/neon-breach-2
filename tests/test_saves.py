#!/usr/bin/env python3
"""Functional test for save slots, statistics and the old single-slot save format.

    python3 tests/test_saves.py
"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _harness import launch, open_page, sync_playwright, INDEX, init_script

ok = True

def check(name, cond, extra=''):
    global ok
    print(('PASS ' if cond else 'FAIL ') + name, extra)
    if not cond:
        ok = False

def check(name,cond,extra=''):
    global ok
    print(('PASS ' if cond else 'FAIL ')+name,extra)
    if not cond: ok=False
with sync_playwright() as p:
    b=launch(p)
    ctx,pg,errs=open_page(b,1280,720)
    ev=pg.evaluate
    check('fresh load: no saves, slots hidden', ev("()=>document.getElementById('slots').classList.contains('hidden')&&checkpoint===null"))
    ev("()=>{start();for(let i=0;i<120;i++)update(.05);stats.shots=10;stats.hits=7;hurtPlayer(30);saveCheckpoint();}")
    r=ev("()=>({s:JSON.parse(localStorage.getItem('neon-breach-next-mars-checkpoint')),vis:!document.getElementById('slots').classList.contains('hidden')})")
    check('slot 1 uses continuation key and stores stats', r['s'] and r['s']['version']==2 and r['s']['stats']['shots']==10 and r['s']['stats']['time']>5 and r['s']['stats']['damage']==30, json.dumps(r['s']['stats']))
    check('slot picker visible after first save', r['vis'])
    ev("()=>{$('menuPause').onclick();}")
    check('menu: continue visible, picker has 3 buttons', ev("()=>!$('continue').classList.contains('hidden')&&document.querySelectorAll('#slots .slotRow button').length===3"))
    ev("()=>document.querySelectorAll('#slots .slotRow button')[1].click()")
    r=ev("()=>({a:activeSlot,cont:$('continue').classList.contains('hidden'),ls:localStorage.getItem('neon-breach-next-active-slot'),hint:document.querySelector('#slots p').textContent})")
    check('select empty slot 2: continue hidden, active persisted', r['a']==2 and r['cont'] and r['ls']=='2', r['hint'])
    ev("()=>{start();for(let i=0;i<40;i++)update(.05);saveCheckpoint();}")
    r=ev("()=>({k1:!!localStorage.getItem('neon-breach-next-mars-checkpoint'),k2:!!localStorage.getItem('neon-breach-next-mars-checkpoint-slot2'),t1:JSON.parse(localStorage.getItem('neon-breach-next-mars-checkpoint')).stats.shots,t2:JSON.parse(localStorage.getItem('neon-breach-next-mars-checkpoint-slot2')).stats.shots})")
    check('new game in slot 2 leaves slot 1 untouched', r['k1'] and r['k2'] and r['t1']==10 and r['t2']==0, json.dumps(r))
    # reload: active slot persists
    pg.reload(); pg.wait_for_function('window.__frames>=window.__max',timeout=240000)
    r=ev("()=>({a:activeSlot,cp:!!checkpoint,vis:!$('slots').classList.contains('hidden'),txt:[...document.querySelectorAll('#slots .slotRow button')].map(b=>b.textContent)})")
    check('after reload slot 2 active and loaded', r['a']==2 and r['cp'] and r['vis'], json.dumps(r['txt'],ensure_ascii=False))
    # select slot 1 and continue
    ev("()=>document.querySelectorAll('#slots .slotRow button')[0].click()")
    ev("()=>{restore();}")
    r=ev("()=>({shots:stats.shots,state:state,hp:player.hp})")
    check('restore slot 1 resumes with its stats', r['shots']==10 and r['state']=='playing', json.dumps(r))
    # death flow keeps counters, end grid shows
    ev("()=>{stats.time+=30;hurtPlayer(999);}")
    r=ev("()=>({deaths:stats.deaths,grid:[...document.querySelectorAll('#endgrid div')].map(d=>d.textContent),cp:!$('checkpoint').classList.contains('hidden')})")
    check('death counted, grid filled, checkpoint button', r['deaths']==1 and len(r['grid'])==7 and r['cp'], json.dumps(r['grid'],ensure_ascii=False))
    ev("()=>{restore();}")
    r=ev("()=>({deaths:stats.deaths,time:Math.round(stats.time)})")
    check('after retry deaths and time are kept', r['deaths']==1 and r['time']>=30, json.dumps(r))
    # win flow
    ev("()=>{finish(true);}")
    r=ev("()=>({grid:[...document.querySelectorAll('#endgrid div')].map(d=>d.textContent),best:localStorage.getItem('neon-breach-next-best-time'),cp:$('checkpoint').classList.contains('hidden')})")
    check('win shows best time and stores it', len(r['grid'])==8 and r['best'] and r['cp'], json.dumps(r,ensure_ascii=False))
    check('no page errors', not errs, str(errs[:3]))
    ctx.close()
    # legacy checkpoint without stats
    ctx,pg,_=open_page(b,1280,720)
    pg.evaluate("()=>{start();saveCheckpoint();const cp=JSON.parse(localStorage.getItem('neon-breach-next-mars-checkpoint'));delete cp.stats;delete cp.savedAt;localStorage.setItem('neon-breach-next-mars-checkpoint',JSON.stringify(cp));}")
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.reload(); pg.wait_for_function('window.__frames>=window.__max',timeout=240000)
    r=pg.evaluate("()=>{const ok=!!checkpoint;restore();return {ok,stats:{...stats},state}}")
    check('legacy checkpoint (no stats) loads and restores', r['ok'] and r['state']=='playing' and r['stats']['time']==0 and not errs, json.dumps(r)+str(errs[:2]))
    b.close()
print('ALL OK' if ok else 'FAILURES')
sys.exit(0 if ok else 1)
