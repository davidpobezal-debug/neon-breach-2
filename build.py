#!/usr/bin/env python3
"""Builds one self-contained HTML file from index.html + css/ + js/.

    python3 build.py                 # writes dist/neon-breach.html
    python3 build.py other/path.html

The single file behaves exactly like the multi-file version; it is handy for sending the game
around or opening it from a disk. Scripts keep their order and stay separate <script> blocks.
"""
import re, sys
from pathlib import Path

root = Path(__file__).resolve().parent
out = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'dist' / 'neon-breach.html'
html = (root / 'index.html').read_text(encoding='utf8')
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
              lambda m: '<style>' + (root / m.group(1)).read_text(encoding='utf8').rstrip('\n') + '</style>', html)
html = re.sub(r'<script src="([^"]+)"></script>',
              lambda m: '<script>\n' + (root / m.group(1)).read_text(encoding='utf8').rstrip('\n') + '\n</script>', html)
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html, encoding='utf8')
print('built', out, len(html), 'bytes')
