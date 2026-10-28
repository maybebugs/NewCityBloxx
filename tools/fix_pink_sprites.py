#!/usr/bin/env python3
"""Gives the pink tower the same sprite support as the other four towers.

1. images/hud/hud_icons.png   - adds the pink progress-cell strip (rows 32-34) so cell strip N = rows 20+3*(N-1) holds for
                                all five towers (the old, unused yellow cap moves down to rows 35-37).
2. images/city/building_shadow.png - frame 4 (the pink slot highlight in the build menu) was a plain box; it is rebuilt
                                from the pink building's own silhouette the same way frames 0-3 relate to theirs
                                (last animation frame, shifted by (2,0), dilated twice, 1px red outline).

Reads/writes assets.js directly; safe to re-run only on an unmodified original (it checks the sheet height).
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, binary_erosion

target = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets.js')
txt = open(target, encoding='utf-8').read()
head = 'window.__ASSETS='
data = json.loads(txt[len(head):txt.rindex(';')])
img = lambda k: Image.open(io.BytesIO(base64.b64decode(data[k]))).convert('RGBA')
def put(k, im):
    b = io.BytesIO(); im.save(b, 'PNG'); data[k] = base64.b64encode(b.getvalue()).decode()

# ---- 1. HUD progress cells
hud = img('images/hud/hud_icons.png')
if hud.height == 35:
    new = Image.new('RGBA', (hud.width, 38), (0, 0, 0, 0))
    new.paste(hud.crop((0, 0, hud.width, 32)), (0, 0))
    new.paste(hud.crop((0, 32, hud.width, 35)), (0, 35))      # keep the old cap
    px = new.load()
    BRIGHT, MID, LEFT, DARK = (0xE7, 0x72, 0xCA, 255), (0xD0, 0x67, 0xB6, 255), (0xB1, 0x57, 0x98, 255), (0x8E, 0x2A, 0x78, 255)
    for y in range(32, 35):
        for x in range(12):
            if y == 34: px[x, y] = DARK
            else: px[x, y] = LEFT if x < 2 else MID if x < 4 else BRIGHT
    put('images/hud/hud_icons.png', new)
    print('hud_icons.png: pink strip added')
else:
    print('hud_icons.png already', hud.size)

# ---- 2. build-menu highlight frame for the pink slot
sh = img('images/city/building_shadow.png')
fw = sh.width // 5
pink = img('images/city/building_4.png')
w, h = pink.width // 4, pink.height
mask = np.array(pink)[:, 3 * w:4 * w, 3] > 0
m = np.zeros((29, 29), bool)
for by in range(h):
    for bx in range(w):
        if mask[by, bx] and 0 <= bx + 2 < 29 and 0 <= by - h + 27 < 29:
            m[by - h + 27, bx + 2] = True
S8 = np.ones((3, 3), bool)
fill = binary_dilation(binary_dilation(m, S8), S8)
outline = fill & ~binary_erosion(fill)
frame = np.zeros((29, 29, 4), np.uint8)
frame[fill] = (255, 255, 255, 255)
frame[outline] = (254, 1, 0, 255)
a = np.array(sh)
a[:, 4 * fw:5 * fw] = frame[:, :fw]
put('images/city/building_shadow.png', Image.fromarray(a))
print('building_shadow.png: pink frame rebuilt')

with open(target, 'w', encoding='utf-8') as fh:
    fh.write(head + json.dumps(data, separators=(',', ':')) + ';\n')
