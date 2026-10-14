#!/usr/bin/env python3
"""Touch layout check: phone-sized landscape windows with every HUD element filled with long text
(the worst case), reports elements that overlap each other, the touch controls or the screen edge.

    python3 tests/check_mobile_layout.py            # prints the table, exit 1 when something overlaps
    python3 tests/check_mobile_layout.py --shots    # also saves tests/out_mobile/<size>.png
"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _harness import launch, open_page, sync_playwright, ROOT

SIZES = [(932, 430), (915, 412), (896, 414), (844, 390), (812, 375), (740, 360), (667, 375), (640, 360), (568, 320)]
if '--only' in sys.argv:
    SIZES = [tuple(map(int, sys.argv[sys.argv.index('--only') + 1].split('x')))]

# bossbar+comm are never both useful on a 320 px high phone, but the check keeps them in as the worst case.
JS = '''()=>{
 const $=id=>document.getElementById(id);
 game.className='playing';
 $('objective').textContent='ZABEZPEČ PRETLAKOVÚ KOMORU · PRIPOJ SKAFANDER A PRENES DIEL DO DIELNE NA PALUBE 2 · POTOM SA VRÁŤ';
 $('location').textContent='HYDROPONIKA / ŠERVISNÁ SMYČKA';
 $('empStatus').textContent='EMP PRIPRAVENÝ · Q';
 $('comm').textContent='AEGIS: Tvoj postup je zaznamenaný. Vráť sa na stanovište alebo bude lokalita uzavretá. Toto je posledné varovanie pred uzamknutím všetkých východov z miestnosti.';
 $('interaction').textContent='[E] OPRAVIŤ CHLADIACI RELÉ';
 $('notice').textContent='KYSLÍK POD 30 % · VRÁŤ SA DO KOMORY A OBNOV TLAK';
 $('guideTitle').textContent='ÚLOHA';
 $('guideBody').textContent='Si Alex Renn, navigačný technik ARGO-09. Prebudil ťa miestny systém napájaný zo záložnej batérie. Zober pušku zo stojana napravo pri východe. Pri predmetoch a dverách stlač E. Kláves M zobrazí stav lode a ďalší krok.';
 for(const id of ['guide','bossbar','helmet'])$(id).classList.remove('hidden');
 $('airlockStatus').textContent='PRETLAK 100 %';
 $('touchControls').style.display='block';
 const ids=['objective','location','empStatus','comm','interaction','notice','guide','bossbar','oxygen','progress','score','airlockStatus','repairProgress','movePad','touchToolbar','touchActions','touchLookHint'];
 const sel=['.health','.ammo','#crosshair','#sound','.touchToolbar','.touchActions'];
 const els=[...ids.map(i=>[i,$(i)]),...sel.map(c=>[c,document.querySelector(c)])].filter(([n,e])=>e);
 const seen=new Set(),R=[];
 for(const [n,e] of els){if(seen.has(e))continue;seen.add(e);const r=e.getBoundingClientRect(),cs=getComputedStyle(e);
  if(cs.display!=='none'&&r.width>0&&r.height>0)R.push({n:n.replace(/^[.#]/,''),x:r.left,y:r.top,r:r.right,b:r.bottom})}
 const out=[];
 for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const a=R[i],b=R[j];
  const ox=Math.min(a.r,b.r)-Math.max(a.x,b.x),oy=Math.min(a.b,b.b)-Math.max(a.y,b.y);
  if(ox>2&&oy>2)out.push(a.n+' x '+b.n);}
 window.__R=R;
 const off=R.filter(o=>o.r>innerWidth+1||o.b>innerHeight+1||o.x<-1||o.y<-1).map(o=>o.n);
 return {overlaps:out,offscreen:off,html:document.documentElement.className};
}'''


def main():
    shots = '--shots' in sys.argv
    bad = False
    outdir = ROOT / 'tests' / 'out_mobile'
    if shots:
        outdir.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = launch(p)
        for w, h in SIZES:
            ctx, page, _ = open_page(browser, w, h, dpr=1, mobile=True)
            r = page.evaluate(JS)
            if shots:
                page.wait_for_timeout(100)
                page.screenshot(path=str(outdir / ('%dx%d.png' % (w, h))))
            if '--rects' in sys.argv:
                print(json.dumps([[o['n'],round(o['x']),round(o['y']),round(o['r']),round(o['b'])] for o in page.evaluate('()=>window.__R')]))
            ctx.close()
            fail = bool(r['overlaps'] or r['offscreen'])
            bad |= fail
            print('%s %4dx%-4d %s overlaps=%s offscreen=%s' % ('FAIL' if fail else 'ok  ', w, h,
                  'touch' if 'touch-mode' in r['html'] else 'NO-TOUCH-MODE', json.dumps(r['overlaps'], ensure_ascii=False), r['offscreen']))
        browser.close()
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
