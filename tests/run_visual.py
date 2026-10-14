#!/usr/bin/env python3
"""Visual regression test: renders fixed scenes and compares them with tests/baseline/*.png.

    python3 tests/run_visual.py            # compare against the baseline
    python3 tests/run_visual.py --update   # write new baseline images (do this after an intended visual change)
    python3 tests/run_visual.py --only eva # run scenes whose name contains "eva"

Only the canvases are compared (3D view + weapon overlay); HTML text is hidden so the result does
not depend on installed fonts. Differences are written to tests/out/<scene>.diff.png.
"""
import argparse, os, sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _harness import launch, open_page, sync_playwright

HERE = Path(__file__).resolve().parent
BASE, OUT = Path(os.environ.get('NB_BASELINE') or HERE / 'baseline'), HERE / 'out'

CRYO = 'start();intro.gun=true;for(let i=0;i<6;i++)update(.016);render();'
EVA = ('start();intro.gun=true;eva.suit=true;eva.tool=true;player.x=52;player.y=20;player.a=-1.2;'
       'player.pitch=.12;for(let i=0;i<4;i++)update(.016);render();')
WARP = "state='flight';flightTime=%s;time=%s;player.x=13.5;player.y=4.8;player.a=-Math.PI/2;player.pitch=0;render();"
# (name, width, height, dpr, mobile, setup script)
SCENES = [
    ('menu_1280x720',   1280, 720, 1, False, 'render();'),
    ('cryo_1280x720',   1280, 720, 1, False, CRYO),
    ('cryo_wide_1919x910', 1919, 910, 1, False, CRYO),
    ('cryo_low_1280x560',  1280, 560, 1, False, CRYO),
    ('eva_1280x720',    1280, 720, 1, False, EVA),
    ('warp_5s',         1280, 720, 1, False, WARP % (5.0, 5.0)),
    ('warp_12s',        1280, 720, 1, False, WARP % (12.0, 12.0)),
    ('mobile_844x390',  844, 390, 3, True, 'render();'),
]
HIDE_DOM = '#game>*:not(canvas){visibility:hidden!important}'


def shoot(browser, scene):
    name, w, h, dpr, mobile, setup = scene
    ctx, page, errors = open_page(browser, w, h, dpr, mobile)
    page.add_style_tag(content=HIDE_DOM)
    page.evaluate('()=>{' + setup + '}')
    page.wait_for_timeout(300)
    OUT.mkdir(exist_ok=True)
    path = OUT / (name + '.png')
    page.screenshot(path=str(path), timeout=120000)
    ctx.close()
    return path, errors


def compare(new, old, tolerance):
    a = np.asarray(Image.open(new).convert('RGB')).astype(int)
    b = np.asarray(Image.open(old).convert('RGB')).astype(int)
    if a.shape != b.shape:
        return None, None, 'size %s != baseline %s' % (a.shape[:2], b.shape[:2])
    d = np.abs(a - b).max(axis=2)
    bad = d > tolerance
    return int(d.max()), int(bad.sum()), bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--update', action='store_true')
    ap.add_argument('--only', default='')
    ap.add_argument('--tolerance', type=int, default=0, help='largest per-channel difference that is still a pass')
    args = ap.parse_args()
    failed = []
    with sync_playwright() as p:
        browser = launch(p)
        for scene in SCENES:
            name = scene[0]
            if args.only and args.only not in name:
                continue
            path, errors = shoot(browser, scene)
            if errors:
                print('ERROR  %-22s page errors: %s' % (name, errors[:2])); failed.append(name); continue
            ref = BASE / (name + '.png')
            if args.update:
                BASE.mkdir(exist_ok=True); ref.write_bytes(path.read_bytes()); print('SAVED  ', name); continue
            if not ref.exists():
                print('MISSING %-22s (run with --update)' % name); failed.append(name); continue
            mx, n, bad = compare(path, ref, args.tolerance)
            if mx is None:
                print('FAIL   %-22s %s' % (name, bad)); failed.append(name)
            elif n:
                mask = np.zeros(bad.shape + (3,), dtype=np.uint8); mask[bad] = (255, 40, 40)
                Image.fromarray(mask).save(OUT / (name + '.diff.png'))
                print('FAIL   %-22s %d pixels differ (max %d) -> out/%s.diff.png' % (name, n, mx, name)); failed.append(name)
            else:
                print('OK     %-22s identical' % name)
        browser.close()
    if failed and not args.update:
        print('\n%d scene(s) differ from the baseline.' % len(failed)); sys.exit(1)


if __name__ == '__main__':
    main()
