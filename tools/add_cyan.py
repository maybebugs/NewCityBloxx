#!/usr/bin/env python3
"""Adds the 6th (cyan) tower: textures, models (regular + special top), sprites/icons, and patches the JS. Idempotent-ish: run on the pink-era build."""
import base64, io, json, math, os, re, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_dilation, binary_erosion

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
AP = os.path.join(ROOT, 'assets.js')
txt = open(AP, encoding='utf-8').read(); H = 'window.__ASSETS='
data = json.loads(txt[len(H):txt.rindex(';')])
b64 = lambda b: base64.b64encode(b).decode()
raw = lambda k: base64.b64decode(data[k])
img = lambda k: Image.open(io.BytesIO(raw(k))).convert('RGBA')
def put(k, im):
    b = io.BytesIO(); im.save(b, 'PNG'); data[k] = b64(b.getvalue())
def putt(k, s): data[k] = b64(s.encode())

# ------------------------------------------------------------------ colour helpers
def to_cyan(im, mul=None):
    a = np.array(im.convert('RGBA')).astype(np.float32)
    if mul is not None: a[..., :3] *= np.array(mul, np.float32)
    rgb = Image.fromarray(a[..., :3].clip(0, 255).astype(np.uint8), 'RGB').convert('HSV')
    h = np.array(rgb).astype(np.float32)
    hue, sat = h[..., 0], h[..., 1]
    m = (hue >= 190) & (hue <= 250) & (sat > 50)            # magenta / pink hues only (doors, beams stay as they are)
    hue[m] = 131 + (hue[m] - 223) * 0.3
    h[..., 0] = hue
    out = np.array(Image.fromarray(h.clip(0, 255).astype(np.uint8), 'HSV').convert('RGB'))
    return Image.fromarray(np.dstack([out, a[..., 3].astype(np.uint8)]), 'RGBA')
PINK_TINT = (1.0, 0.411765, 0.705882)
def cyan_px(c):
    return tuple(to_cyan(Image.new('RGBA', (1, 1), c + (255,))).getpixel((0, 0))[:3])

# ------------------------------------------------------------------ 1. block textures (hue-shifted pink -> cyan, tint baked in)
for a, b in (('floor_5_0', 'floor_6_0'), ('falling_5_0', 'falling_6_0'), ('falling_5_2', 'falling_6_2')):
    put('models/textures/%s.png' % b, to_cyan(img('models/textures/%s.png' % a), PINK_TINT))
for kind in ('floor', 'falling'):
    data['models/textures/%s_6_1.png' % kind] = data['models/textures/%s_5_1.png' % kind]
for n in (1,):
    pass
# falling_5_1 is the shared beam texture; falling_5 also uses part with *_1 (already copied above)

# ------------------------------------------------------------------ 2. new top textures (hand-drawn pixel art, same flat-shaded + dark outline style)
OUT, D1, M1, L1, W1, G1, G2, DK = (8, 58, 77), (22, 126, 156), (54, 196, 224), (127, 230, 245), (222, 252, 255), (255, 210, 74), (176, 120, 20), (4, 34, 46)
def tex64():
    im = Image.new('RGBA', (64, 64), OUT + (255,)); return im, ImageDraw.Draw(im)
def block_roof(d, x0, y0):          # A: slab / cornice side 32x32
    d.rectangle([x0, y0, x0 + 31, y0 + 31], fill=M1)
    d.rectangle([x0, y0, x0 + 31, y0 + 3], fill=L1); d.rectangle([x0, y0 + 4, x0 + 31, y0 + 5], fill=W1)
    d.rectangle([x0, y0 + 24, x0 + 31, y0 + 31], fill=D1); d.rectangle([x0, y0 + 30, x0 + 31, y0 + 31], fill=OUT)
    for i in range(0, 32, 8):
        d.rectangle([x0 + i, y0 + 8, x0 + i, y0 + 23], fill=D1); d.point((x0 + i + 1, y0 + 8), fill=L1)
    for x in (4, 12, 20, 28): d.point((x0 + x, y0 + 27), fill=L1)
def facet(d, x0, y0, g=((255, 255, 255),)):   # B: crystal glass 32x32, bright left edge -> deep right edge
    for x in range(32):
        t = x / 31
        c = tuple(int(W1[i] * (1 - t) ** 1.2 + M1[i] * (1 - abs(t - .45) * 1.6 if t < .45 else 0) + 0) if False else int(L1[i] * (1 - t) + D1[i] * t) for i in range(3))
        d.line([x0 + x, y0, x0 + x, y0 + 31], fill=c)
    for y in range(32):
        d.line([x0, y0 + y, x0 + 9 - (y % 32) // 4, y0 + y], fill=W1) if y < 28 else None
    d.rectangle([x0, y0, x0 + 31, y0 + 1], fill=OUT); d.rectangle([x0, y0 + 30, x0 + 31, y0 + 31], fill=OUT)
    d.line([x0 + 31, y0, x0 + 31, y0 + 31], fill=OUT); d.line([x0, y0, x0, y0 + 31], fill=OUT)
    for k in range(4): d.point((x0 + 14 + k, y0 + 24 - k * 5), fill=W1)
def windows(d, x0, y0):             # C: tier wall with windows 32x32
    d.rectangle([x0, y0, x0 + 31, y0 + 31], fill=M1); d.rectangle([x0 + 16, y0, x0 + 31, y0 + 31], fill=L1)
    for wx in (3, 19):
        for wy in (4, 17):
            d.rectangle([x0 + wx, y0 + wy, x0 + wx + 9, y0 + wy + 9], fill=OUT)
            d.rectangle([x0 + wx + 1, y0 + wy + 1, x0 + wx + 8, y0 + wy + 8], fill=(24, 80, 130))
            d.rectangle([x0 + wx + 1, y0 + wy + 1, x0 + wx + 3, y0 + wy + 8], fill=(90, 190, 240)); d.line([x0 + wx + 4, y0 + wy + 1, x0 + wx + 4, y0 + wy + 8], fill=OUT)
    d.rectangle([x0, y0 + 30, x0 + 31, y0 + 31], fill=D1)
def topface(d, x0, y0):             # D: roof top face / plain light panel 32x32
    d.rectangle([x0, y0, x0 + 31, y0 + 31], fill=L1)
    for i in range(0, 32, 8): d.line([x0 + i, y0, x0 + i, y0 + 31], fill=M1); d.line([x0, y0 + i, x0 + 31, y0 + i], fill=M1)
    d.rectangle([x0, y0, x0 + 31, y0 + 31], outline=OUT)
t, d = tex64(); block_roof(d, 0, 0); facet(d, 32, 0); windows(d, 0, 32); topface(d, 32, 32); put('models/textures/top_6_0.png', t)
data['models/textures/top_6_1.png'] = data['models/textures/top_5_1.png']
# special top: gold ring + glass crystal + dark mast
t, d = tex64()
d.rectangle([0, 0, 31, 31], fill=G1); d.rectangle([0, 0, 31, 4], fill=(255, 245, 160)); d.rectangle([0, 20, 31, 31], fill=G2); d.rectangle([0, 29, 31, 31], fill=OUT)
for x in (5, 16, 27): d.rectangle([x - 1, 9, x + 1, 16], fill=OUT); d.rectangle([x, 10, x, 15], fill=L1)
facet(d, 32, 0)
d.rectangle([0, 32, 31, 63], fill=D1); d.rectangle([0, 32, 7, 63], fill=M1)
for y in range(34, 62, 8): d.rectangle([0, y, 31, y + 2], fill=L1); d.rectangle([0, y + 3, 31, y + 3], fill=OUT)
topface(d, 32, 32)
for y in range(32, 64, 4): d.point((50, y), fill=G1)
put('models/textures/top_bonus_6_0.png', t)
data['models/textures/top_bonus_6_1.png'] = data['models/textures/top_5_1.png']

# ------------------------------------------------------------------ 3. models
def mtl(name, nmat):
    s = '# materials for %s\n' % name
    for i in range(nmat):
        s += ('\nnewmtl %s_mat%d\nKa 1.0 1.0 1.0\nKd 1.0 1.0 1.0\nKs 0.0 0.0 0.0\nd 1.0\nillum 0\nmap_Kd textures/%s_%d.png\n'
              '#@blend REPLACE\n#@alpha_threshold 0\n#@depth_test true\n#@depth_write true\n#@cull BACK\n#@winding CCW\n#@texture_function MODULATE\n#@clamp false\n') % (name, i, name, i)
    return s
def recolor_obj(src, dst, col):      # copy pink block model, new vertex colour + names
    s = raw('models/%s.obj' % src).decode().replace(src, dst)
    s = re.sub(r'^(v (?:\S+ ){3})\S+ \S+ \S+', lambda m: m.group(1) + '%.6f %.6f %.6f' % col, s, flags=re.M)
    putt('models/%s.obj' % dst, s); putt('models/%s.mtl' % dst, mtl(dst, 2))
for n in ('floor', 'falling'): recolor_obj(n + '_5', n + '_6', (1.0, 1.0, 1.0))

class Mesh:
    def __init__(s): s.v = []; s.t = []; s.f = []
    def poly(s, pts, uvs, ctr):
        """convex polygon (pts CCW unknown) -> fan of triangles oriented so the normal points away from ctr (CCW from outside)"""
        P = [np.array(p, float) for p in pts]
        n = np.cross(P[1] - P[0], P[2] - P[0]); c = sum(P) / len(P)
        if np.dot(n, c - np.array(ctr, float)) < 0: P.reverse(); uvs = uvs[::-1]
        base = len(s.v)
        for p, uv in zip(P, uvs): s.v.append(p); s.t.append(uv)
        for i in range(1, len(P) - 1): s.f.append((base, base + i, base + i + 1))
    def obj(s, name):
        o = 'mtllib %s.mtl\no %s\n' % (name, name)
        for p in s.v: o += 'v %.6f %.6f %.6f 1.000000 1.000000 1.000000\n' % tuple(p)
        for u in s.t: o += 'vt %.6f %.6f\n' % u
        o += 'g %s_part0\nusemtl %s_mat0\n' % (name, name)
        for a, b, c in s.f: o += 'f %d/%d %d/%d %d/%d\n' % (a + 1, a + 1, b + 1, b + 1, c + 1, c + 1)
        return o
def R(x0, y0, x1, y1): return (x0 / 64, 1 - y0 / 64, x1 / 64, 1 - y1 / 64)   # pixel rect -> uv rect
RA, RB, RC, RD = R(1, 1, 31, 31), R(33, 1, 63, 31), R(1, 33, 31, 63), R(33, 33, 63, 63)
def quad(m, pts, r, ctr):
    u0, v0, u1, v1 = r; m.poly(pts, [(u0, v0), (u1, v0), (u1, v1), (u0, v1)], ctr)
def tri(m, pts, r, ctr):
    u0, v0, u1, v1 = r; m.poly(pts, [(u0, v0), (u1, v0), ((u0 + u1) / 2, v1)], ctr)
def box(m, cx, y0, y1, cz, hx, hz, side, top):
    c = (cx, (y0 + y1) / 2, cz); X0, X1, Z0, Z1 = cx - hx, cx + hx, cz - hz, cz + hz
    for pts in (((X0, y0, Z1), (X1, y0, Z1), (X1, y1, Z1), (X0, y1, Z1)), ((X1, y0, Z0), (X0, y0, Z0), (X0, y1, Z0), (X1, y1, Z0)),
                ((X1, y0, Z1), (X1, y0, Z0), (X1, y1, Z0), (X1, y1, Z1)), ((X0, y0, Z0), (X0, y0, Z1), (X0, y1, Z1), (X0, y1, Z0))):
        quad(m, pts, side, c)
    quad(m, ((X0, y1, Z0), (X1, y1, Z0), (X1, y1, Z1), (X0, y1, Z1)), top, c)
    quad(m, ((X0, y0, Z0), (X1, y0, Z0), (X1, y0, Z1), (X0, y0, Z1)), top, c)
def ring(cx, cz, y, r, n, rot=0.0): return [(cx + r * math.cos(rot + 2 * math.pi * i / n), y, cz + r * math.sin(rot + 2 * math.pi * i / n)) for i in range(n)]
def frustum(m, cx, cz, y0, y1, r0, r1, n, side, cap, rot=math.pi / 8):
    a, b = ring(cx, cz, y0, r0, n, rot), ring(cx, cz, y1, r1, n, rot); c = (cx, (y0 + y1) / 2, cz)
    for i in range(n):
        j = (i + 1) % n; quad(m, (a[i], a[j], b[j], b[i]), side, c)
    if r1 > 0.5: quad(m, b, cap, c) if n == 4 else m.poly(b, [(RD[0] + (RD[2] - RD[0]) * (.5 + .5 * math.cos(2 * math.pi * i / n)), RD[3] + (RD[1] - RD[3]) * (.5 + .5 * math.sin(2 * math.pi * i / n))) for i in range(n)], c)
def pyramid(m, cx, cz, y0, y1, r, n, side, rot=math.pi / 8):
    a = ring(cx, cz, y0, r, n, rot); tip = (cx, y1, cz); c = (cx, (y0 + y1) / 2, cz)
    for i in range(n): tri(m, (a[i], a[(i + 1) % n], tip), side, c)
def octa(m, cx, cy, cz, rx, ry, side):
    a = ring(cx, cz, cy, rx, 4, math.pi / 4); top, bot = (cx, cy + ry, cz), (cx, cy - ry, cz)
    for i in range(4): tri(m, (a[i], a[(i + 1) % 4], top), side, (cx, cy, cz)); tri(m, (a[i], a[(i + 1) % 4], bot), side, (cx, cy, cz))
def torus(m, cx, cy, cz, Rm, r, seg, tube, side):
    for i in range(seg):
        a0, a1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg; cen = (cx + Rm * math.cos((a0 + a1) / 2), cy, cz + Rm * math.sin((a0 + a1) / 2))
        def P(a, k):
            q = 2 * math.pi * k / tube + math.pi / tube
            rr = Rm + r * math.cos(q); return (cx + rr * math.cos(a), cy + r * math.sin(q), cz + rr * math.sin(a))
        for k in range(tube): quad(m, (P(a0, k), P(a1, k), P(a1, k + 1), P(a0, k + 1)), side, cen)

# regular top: roof slab + cornice, windowed octagonal tiers, glass spire, four corner crystals
m = Mesh()
box(m, 0, -128, -80, 0, 128, 128, RA, RD); box(m, 0, -80, -60, 0, 150, 150, RA, RD)
frustum(m, 0, 0, -60, 60, 105, 85, 8, RC, RD); frustum(m, 0, 0, 60, 130, 85, 60, 8, RC, RD)
frustum(m, 0, 0, 130, 175, 60, 38, 8, RA, RD); frustum(m, 0, 0, 175, 250, 38, 22, 8, RB, RD); pyramid(m, 0, 0, 250, 330, 22, 8, RB)
for sx in (-1, 1):
    for sz in (-1, 1): pyramid(m, 118 * sx, 118 * sz, -60, 40, 24, 4, RB, math.pi / 4)
putt('models/top_6.obj', m.obj('top_6')); putt('models/top_6.mtl', mtl('top_6', 1))
# special top: pedestal, mast, floating crystal inside a gold ring with four orbiting gems
m = Mesh()
box(m, 0, -128, -88, 0, 145, 145, RC, RD)
frustum(m, 0, 0, -88, -20, 110, 70, 8, RC, RD); frustum(m, 0, 0, -20, 200, 24, 14, 4, RC, RD, math.pi / 4)
CY = 320; octa(m, 0, CY, 0, 80, 105, RB); torus(m, 0, CY, 0, 122, 11, 18, 6, RA)
for k in range(4):
    a = k * math.pi / 2; octa(m, 122 * math.cos(a), CY + 38 * (1 if k % 2 else -1), 122 * math.sin(a), 16, 24, RB)
putt('models/top_bonus_6.obj', m.obj('top_bonus_6')); putt('models/top_bonus_6.mtl', mtl('top_bonus_6', 1))

# model index
ix = raw('models/models.txt').decode().rstrip('\n')
for i, f in ((15, 'floor_6'), (25, 'falling_6'), (35, 'top_6'), (45, 'top_bonus_6')):
    if not re.search(r'^%d\t' % i, ix, re.M): ix += '\n%d\t%s.obj' % (i, f)
putt('models/models.txt', ix + '\n')

# ------------------------------------------------------------------ 4. sprites & HUD icons
b4 = img('images/city/building_4.png')
if 'images/city/building_5.png' not in data: put('images/city/building_5.png', to_cyan(b4))
b5 = img('images/city/building_5.png')
mf = ''.join(l for l in [raw('manifest.txt').decode()]).rstrip('\n')
if not re.search(r'^102\t', mf, re.M): mf += '\n102\timages/city/building_5.png'
putt('manifest.txt', mf + '\n')
# shadow / slot-highlight sheet: 6th frame from the cyan building silhouette (same recipe as the pink one)
sh = img('images/city/building_shadow.png')
if sh.width == 145:
    fw = 29; w, h = b5.width // 4, b5.height
    mask = np.array(b5)[:, 3 * w:4 * w, 3] > 0
    mm = np.zeros((29, 29), bool)
    for by in range(h):
        for bx in range(w):
            if mask[by, bx] and 0 <= bx + 2 < 29 and 0 <= by - h + 27 < 29: mm[by - h + 27, bx + 2] = True
    S8 = np.ones((3, 3), bool); fill = binary_dilation(binary_dilation(mm, S8), S8); outline = fill & ~binary_erosion(fill)
    fr = np.zeros((29, 29, 4), np.uint8); fr[fill] = (255, 255, 255, 255); fr[outline] = (254, 1, 0, 255)
    new = Image.new('RGBA', (174, 29), (0, 0, 0, 0)); new.paste(sh, (0, 0)); new.paste(Image.fromarray(fr, 'RGBA'), (145, 0)); put('images/city/building_shadow.png', new)
# HUD progress strip (rows 35-37 = strip for tower 6; the old unused cap lived there)
hud = img('images/hud/hud_icons.png'); px = hud.load()
for y in range(35, 38):
    for x in range(14):
        px[x, y] = (0, 0, 0, 0)
for y in range(35, 38):
    for x in range(12):
        src = hud.getpixel((x, y - 3))
        px[x, y] = to_cyan(Image.new('RGBA', (1, 1), src)).getpixel((0, 0))
put('images/hud/hud_icons.png', hud)
# life icons: frames 12/13 (normal / losing) from the pink pair 10/11
li = img('images/hud/life_icons.png')
if li.width == 132:
    new = Image.new('RGBA', (156, li.height), (0, 0, 0, 0)); new.paste(li, (0, 0)); new.paste(to_cyan(li.crop((110, 0, 132, li.height))), (132, 0)); put('images/hud/life_icons.png', new)
# medals: frame 6 = cyan medal with "60"
md = img('images/hud/level_medals.png')
if md.width == 120:
    new = Image.new('RGBA', (140, md.height), (0, 0, 0, 0)); new.paste(md, (0, 0)); f = to_cyan(md.crop((100, 0, 120, md.height)))
    f = f.copy(); fp = f.load(); fp[6, 10] = (255, 255, 255, 255); fp[7, 10] = (255, 255, 255, 255)      # the 5 becomes a 6
    new.paste(f, (120, 0)); put('images/hud/level_medals.png', new)

open(AP, 'w', encoding='utf-8').write(H + json.dumps(data, separators=(',', ':')) + ';\n')
print('assets ok')
