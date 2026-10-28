#!/usr/bin/env python3
"""Generates images/city/terrain.png (map terrain tiles) in the game's own palette/shading style."""
from PIL import Image
import os, sys
H = lambda s: (int(s[0:2],16), int(s[2:4],16), int(s[4:6],16), 255)
OUT = H('111900'); T = 27
GR = dict(top=H('219800'), hi=H('36ec36'), mid=H('11af0c'), side=H('045c00'), dk=H('012700'))
WA = dict(top=H('4371d7'), hi=H('9ce0ff'), mid=H('28bdff'), side=H('0b2d8e'), dk=H('0c009e'), out=H('0f0870'), sh=H('257bae'))
RD = dict(top=H('676767'), hi=H('b0b0b0'), mid=H('848484'), side=H('222222'), curb=H('c5c5c5'))
YEL = H('ecd853'); RED = H('f04b0f'); PINK = H('fbd3bd'); WHITE = H('e9e9e9')

def slab(top, side, outline=OUT, edge_hi=None):
    """27x27 block tile like the game's cubes: outline, darker left face + bottom lip, lit top face."""
    im = Image.new('RGBA', (T, T), (0,0,0,0)); p = im.load()
    for y in range(T):
        for x in range(T):
            if x == 0 or x == T-1 or y == 0 or y == T-1: p[x,y] = outline
            elif x <= 2 or y >= T-4: p[x,y] = side
            else: p[x,y] = top
    for x in range(3, T-1): p[x, T-4] = outline          # lip edge
    for y in range(1, T-3): p[2, y] = outline            # left face edge
    for x in (0, T-1):
        for y in (0, T-1): p[x,y] = (0,0,0,0)            # chipped corners like the sprites
    if edge_hi:
        for x in range(3, T-1): p[x,1] = edge_hi
        for y in range(1, T-4): p[3,y] = edge_hi
    return im

def put(im, pts, col):
    p = im.load()
    for x, y in pts:
        if 3 <= x < T-1 and 1 <= y < T-4: p[x,y] = col

def grass(seed=0, dark=False):
    im = slab(GR['top'], GR['side'], edge_hi=GR['hi'])
    put(im, [(x,y) for y in range(2,T-4) for x in range(4,T-1) if (x*7+y*13+seed) % 11 == 0], GR['mid'])
    put(im, [(x,y) for y in range(2,T-4) for x in range(4,T-1) if (x*5+y*3+seed) % 17 == 0], GR['hi'])
    # little grass tufts (2px chevrons)
    for tx, ty in [(8,8),(18,14),(11,18),(21,6)]:
        put(im, [(tx,ty),(tx+2,ty),(tx+1,ty-1)], GR['dk'])
    lip = im.load()
    for x in range(3,T-1,3): lip[x,T-3] = GR['dk']       # lip vents like the green block
    return im

def water(frame):
    im = slab(WA['top'], WA['side'], outline=WA['out'], edge_hi=WA['mid'])
    put(im, [(x,y) for y in range(2,T-4) for x in range(4,T-1) if (x+y) % 2 == 0 and (y % 6) in (1,2)], WA['sh'])
    for row, y in enumerate((6, 12, 18)):
        o = ((frame*3) + row*4) % 9
        for k in range(2):
            x0 = 5 + o + k*10
            put(im, [(x0+i, y) for i in range(4)], WA['hi'])
            put(im, [(x0+i, y+1) for i in range(1,3)], WA['mid'])
    put(im, [(9+frame*8,9),(20-frame*7,16)], WHITE)
    lip = im.load()
    for x in range(3,T-1,3): lip[x,T-3] = WA['dk']
    return im

def road():
    im = slab(RD['top'], RD['side'], outline=OUT, edge_hi=RD['curb'])
    put(im, [(x,y) for y in range(2,T-4) for x in range(4,T-1) if (x*3+y*5) % 7 == 0], RD['mid'])
    put(im, [(x,y) for y in range(2,T-4) for x in range(4,T-1) if (x*11+y*7) % 23 == 0], RD['hi'])
    for x0 in (5, 14, 23):                               # centre dashes
        put(im, [(x0+i, 11) for i in range(5)], YEL); put(im, [(x0+i, 12) for i in range(5)], H('ffc900'))
    for y in (2, T-6): put(im, [(x,y) for x in range(4,T-1)], RD['curb'])   # kerbs
    lip = im.load()
    for x in range(3,T-1,3): lip[x,T-3] = H('000000')
    return im

def park():
    im = grass(5)
    put(im, [(7,20),(8,20),(7,21)], YEL); put(im, [(20,20),(21,20),(21,21)], RED)
    put(im, [(10,6),(11,6)], PINK); put(im, [(22,9),(22,10)], YEL)
    return im

def tree():
    t = Image.open(os.path.join(os.path.dirname(__file__), '..', 'tree_src.png')).convert('RGBA')
    pal = [H('1b3d18'), H('2c5a26'), H('101d0e'), H('4b8011'), H('090605')]
    s = t.resize((26, 24), Image.BOX)
    p = s.load()
    for y in range(s.height):
        for x in range(s.width):
            r,g,b,a = p[x,y]
            if a < 110: p[x,y] = (0,0,0,0)
            else: p[x,y] = min(pal, key=lambda c: (c[0]-r)**2+(c[1]-g)**2+(c[2]-b)**2)
    return s

W = T*6 + 26 + 14
sheet = Image.new('RGBA', (W, 32), (0,0,0,0))
for i, im in enumerate([grass(0), water(0), water(1), road(), park(), grass(3)]):
    sheet.alpha_composite(im, (i*T, 0))
tr = tree(); sheet.alpha_composite(tr, (T*6, 0))
# small flower bush
bush = Image.new('RGBA', (14, 10), (0,0,0,0)); bp = bush.load()
for y in range(10):
    for x in range(14):
        dx, dy = x-6.5, y-6
        if dx*dx/42 + dy*dy/20 <= 1: bp[x,y] = H('1b3d18') if (x+y)%3 else H('2c5a26')
for x,y in [(3,4),(7,3),(10,5)]: bp[x,y] = RED
for x,y in [(5,6),(9,7)]: bp[x,y] = YEL
sheet.alpha_composite(bush, (T*6+26, 0))
out = sys.argv[1]; os.makedirs(os.path.dirname(out), exist_ok=True); sheet.save(out); print(sheet.size)
