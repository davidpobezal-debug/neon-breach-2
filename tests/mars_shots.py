#!/usr/bin/env python3
"""Renders scenes of the Mars interlude to tests/out_mars/*.png (canvas only) for looking at them.

    python3 tests/mars_shots.py                # every scene
    python3 tests/mars_shots.py lander depot   # scenes whose name contains one of the words
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _harness import launch, open_page, sync_playwright

OUT = Path(__file__).resolve().parent / 'out_mars'
HIDE_DOM = '#game>*:not(canvas){visibility:hidden!important}'
BASE = 'start();intro={active:false,gun:true};room=4;eva.stowed=false;eva.suit=true;eva.tool=true;'
def at(x, z, a, pitch=0, phase='surface', extra=''):
    return BASE + "mars.phase='%s';%s;player.x=%s;player.y=%s;player.a=%s;player.pitch=%s;for(let i=0;i<40;i++)update(.016);render();" % (phase, extra, x, z, a, pitch)
PI = 3.14159265
SCENES = {
 'lander_dock_north': at(56, 120.6, -PI/2, 0, 'orbit'),
 'lander_dock_south': at(56, 120.4, PI/2, 0, 'orbit'),
 'lander_dock_east':  at(55, 120, 0, 0, 'orbit'),
 'lander_dock_west':  at(57, 120, PI, -.05, 'orbit'),
 'lander_land_north': at(56, 120.6, -PI/2, 0, 'surface'),
 'lander_34_nw':      at(47, 113, .67, .0, 'surface'),
 'lander_34_ne':      at(65.5, 113, 2.47, .0, 'surface'),
 'lander_front':      at(56, 109, PI/2, .0, 'surface'),
 'lander_34_sw':      at(46.5, 127, -.62, .0, 'surface'),
 'site_hatch':        at(47.5, 121.5, 0, 0, 'surface'),
 'site_pad_wide':     at(46, 127, -.6, .02, 'surface'),
 'site_pad_south':    at(58, 114, PI/2+.4, 0, 'surface'),
 'site_plain_north':  at(56, 113, -PI/2, 0, 'surface'),
 'site_valley':       at(55, 104, -PI/2, 0, 'surface'),
 'site_pass':         at(56, 100, -PI/2, -.02, 'surface'),
 'site_bridge':       at(56, 96.8, -PI/2, -.18, 'surface'),
 'site_bridge_side':  at(53.4, 98, -1.2, -.12, 'surface'),
 'site_beacon':       at(57, 99.8, -.4, 0, 'surface'),
 'site_plateau':      at(56, 86, -PI/2, 0, 'surface'),
 'site_station':      at(56, 80, -PI/2, 0, 'surface'),
 'site_station_door': at(55, 75.6, -PI/2, .02, 'surface'),
 'site_station_east': at(62, 74, -PI/2-.5, 0, 'surface', "mars.junction=false"),
 'site_station_west': at(49, 74, -PI/2+.7, 0, 'surface'),
 'site_wreck':        at(51, 80, PI, 0, 'surface'),
 'site_wreck_close':  at(47, 76, PI+.35, 0, 'surface'),
 'site_wreck_far':    at(54, 88, PI+.9, 0, 'surface'),
 'surface_junction':  at(63.5, 69, PI+.3, 0, 'surface', "mars.junction=false"),
 'depot_door':        at(56, 73.5, -PI/2, 0, 'surface', "mars.junction=true;mars.doorOpen=true;marsApplyState();mars.doorAnim=1"),
 'depot_inside':      at(56, 69.3, -PI/2, 0, 'surface', "mars.junction=true;mars.doorOpen=true;marsApplyState();mars.doorAnim=1"),
 'depot_part':        at(56, 67, -PI/2, 0, 'surface', "mars.junction=true;mars.doorOpen=true;marsApplyState();mars.doorAnim=1;mars.defenders=true;mars.clamp=false"),
 'ship_dock':         at(59, 25.5, 0, 0, 'orbit'),
 'ship_mount':        at(47.5, 25.2, 0.9, 0, 'orbit'),
 'ship_orbit_sky':    at(50, 25.5, -.8, .25, 'orbit'),
}
for t in (1, 8, 14, 16, 19, 23, 26):
    SCENES['descent_%02d' % t] = BASE + "mars.phase='orbit';player.x=56;player.y=119.6;marsStartCine('descent');flightTime=%s;time=%s;update(.016);render();" % (t, t)
for t in (1, 5, 10, 12.5, 16, 20):
    SCENES['ascent_%02d' % int(t)] = BASE + "mars.phase='surface';player.x=56;player.y=119.6;marsStartCine('ascent');flightTime=%s;time=%s;update(.016);render();" % (t, t)

def main():
    words = sys.argv[1:]
    OUT.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = launch(p)
        ctx, page, errors = open_page(browser, 1280, 720)
        page.add_style_tag(content=HIDE_DOM)
        for name, js in SCENES.items():
            if words and not any(w in name for w in words):
                continue
            try:
                page.evaluate('()=>{' + js + '}')
            except Exception as e:
                print(name, 'EVAL ERROR', str(e)[:400])
            page.wait_for_timeout(150)
            page.screenshot(path=str(OUT / (name + '.png')), timeout=120000)
            print(name, 'errors:', errors[-2:])
        browser.close()
main()
