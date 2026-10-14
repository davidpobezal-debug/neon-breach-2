#!/usr/bin/env python3
"""HUD layout check: fills every HUD element with long text and reports elements that overlap.

Windows up to 730 px high must have no overlaps at all, except the known case where the interaction
prompt meets the crosshair when a boss bar, a comm message and a prompt are all on screen at the
minimum window height (and the comm message meets it at 560 px). Taller windows keep the original layout and are only reported.

    python3 tests/check_hud_layout.py
"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _harness import launch, open_page, sync_playwright

SIZES = [(1280, 560), (1280, 600), (1366, 657), (1536, 730), (1600, 800), (1919, 910), (1920, 1080)]
KNOWN = {(1280, 560): {'interaction x #crosshair', 'comm x #crosshair'}, (1280, 600): {'interaction x #crosshair'}}
STRICT_UP_TO = 730

JS = '''()=>{
 const $=id=>document.getElementById(id);
 game.className='playing';
 $('objective').textContent='ZABEZPEČ PRETLAKOVÚ KOMORU · PRIPOJ SKAFANDER A PRENES DIEL DO DIELNE NA PALUBE 2 · POTOM SA VRÁŤ';
 $('location').textContent='HYDROPONIKA / ŠERVISNÁ SMYČKA';
 $('equipment').textContent='SKAFANDER · ZVÁRAČKA · KARTA';
 $('empStatus').textContent='EMP PRIPRAVENÝ · Q';
 $('comm').textContent='AEGIS: Tvoj postup je zaznamenaný. Vráť sa na stanovište alebo bude lokalita uzavretá. Toto je posledné varovanie pred uzamknutím všetkých východov z miestnosti.';
 $('interaction').textContent='[E] OPRAVIŤ CHLADIACI RELÉ';
 $('notice').textContent='KYSLÍK POD 30 % · VRÁŤ SA DO KOMORY A OBNOV TLAK';
 $('guideTitle').textContent='ÚLOHA';
 $('guideBody').textContent='Si Alex Renn, navigačný technik ARGO-09. Prebudil ťa miestny systém napájaný zo záložnej batérie. Zober pušku zo stojana napravo pri východe. Pri predmetoch a dverách stlač E. Kláves M zobrazí stav lode a ďalší krok.';
 for(const id of ['guide','bossbar','helmet'])$(id).classList.remove('hidden');
 $('airlockStatus').textContent='PRETLAK 100 %';
 const ids=['objective','location','equipment','empStatus','comm','interaction','notice','guide','bossbar','oxygen','progress','score','airlockStatus','repairProgress'];
 const sel=['.health','.ammo','header','footer','#crosshair'];
 const els=[...ids.map(i=>[i,$(i)]),...sel.map(c=>[c,document.querySelector(c)])].filter(([n,e])=>e);
 const R=els.map(([n,e])=>{const r=e.getBoundingClientRect();return {n,x:r.left,y:r.top,r:r.right,b:r.bottom,vis:getComputedStyle(e).display!=='none'&&r.width>0&&r.height>0}}).filter(o=>o.vis);
 const out=[];
 for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const a=R[i],b=R[j];
  const ox=Math.min(a.r,b.r)-Math.max(a.x,b.x),oy=Math.min(a.b,b.b)-Math.max(a.y,b.y);
  if(ox>2&&oy>2)out.push(a.n+' x '+b.n);}
 const off=R.filter(o=>o.r>innerWidth+1||o.b>innerHeight+1||o.x<-1||o.y<-1).map(o=>o.n);
 return {overlaps:out,offscreen:off};
}'''


def main():
    bad = False
    with sync_playwright() as p:
        browser = launch(p)
        for w, h in SIZES:
            ctx, page, _ = open_page(browser, w, h)
            r = page.evaluate(JS)
            ctx.close()
            unexpected = [o for o in r['overlaps'] if o not in KNOWN.get((w, h), set())]
            strict = h <= STRICT_UP_TO
            status = 'FAIL' if (strict and (unexpected or r['offscreen'])) else 'ok  '
            bad |= status == 'FAIL'
            print('%s %4dx%-4d overlaps=%s offscreen=%s' % (status, w, h, json.dumps(r['overlaps'], ensure_ascii=False), r['offscreen']))
        browser.close()
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
