"""Shared helpers for the NEON BREACH browser tests.

The tests drive Chromium through Playwright with software WebGL (SwiftShader) so the 3D output
does not depend on the GPU of the machine that runs them. Time, requestAnimationFrame and
Math.random are replaced, so every run renders exactly the same frames.

    pip install playwright pillow numpy && playwright install chromium
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
# NB_INDEX can point the tests at another build (for example the single-file build or an older version).
INDEX = Path(os.environ.get('NB_INDEX') or ROOT / 'index.html')

CHROMIUM_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
                 '--ignore-gpu-blocklist', '--enable-webgl']

# Fake clock + seeded Math.random + a requestAnimationFrame that stops after N frames, so the page is
# idle (and screenshots are stable) once the first frames are drawn. Pointer lock is disabled because
# a headless page can hang on it.
INIT_SCRIPT = '''(()=>{
Element.prototype.requestPointerLock=function(){};
const real=window.requestAnimationFrame.bind(window);let f=0;
window.__max=__MAX__;window.__frames=0;
const fake=()=>f*16.6667;performance.now=fake;
let seed=__SEED__;Math.random=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296};
window.requestAnimationFrame=cb=>real(()=>{if(window.__frames>=window.__max)return;window.__frames++;f++;cb(fake())});
})();'''


def init_script(frames=3, seed=12345):
    return INIT_SCRIPT.replace('__MAX__', str(frames)).replace('__SEED__', str(seed))


def open_page(browser, width, height, dpr=1, mobile=False, query='', frames=3, seed=12345):
    """Open the game with the deterministic harness and wait for the first frames."""
    kw = dict(viewport={'width': width, 'height': height}, device_scale_factor=dpr)
    if mobile:
        kw.update(is_mobile=True, has_touch=True)
    ctx = browser.new_context(**kw)
    # Web fonts come from Google Fonts; block them so text always uses the same fallback font.
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.abort())
    page = ctx.new_page()
    page.add_init_script(init_script(frames, seed))
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(INDEX.as_uri() + (query or os.environ.get('NB_QUERY', '')))
    page.wait_for_function('window.__frames>=window.__max', timeout=240000)
    page.wait_for_timeout(300)
    return ctx, page, errors


def launch(p):
    return p.chromium.launch(args=CHROMIUM_ARGS)
