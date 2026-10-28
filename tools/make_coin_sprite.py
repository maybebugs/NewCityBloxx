#!/usr/bin/env python3
"""Generates the City Bloxx coin sprites (pixel art, palette sampled from the game's own sprites).

Outputs (PNG, RGBA, no anti-aliasing):
  images/ui/coin_sheet.png   - 8 spin frames 14x14, laid out left->right
  images/ui/coin_big.png     - 22x22 coin used in the Store header / reward popups
  images/ui/coin_sparkle.png - 3 frames 9x9, twinkle that plays on pickup
  images/ui/lock_icon.png    - 12x14 padlock for locked tops

Usage:  python3 tools/make_coin_sprite.py [out_dir]     (default: ./sprites_out)
Then:   python3 tools/add_assets.py sprites_out          (injects them into assets.js)
"""
import math
import os
import sys
from PIL import Image

# ---- palette, sampled from hud_icons / status_icons / combo_star / level_medals --------------------
OUTLINE = (0x48, 0x1C, 0x00, 255)   # the game's dark-brown outline
DARK    = (0x6C, 0x4C, 0x00, 255)   # deep shade
SHADE   = (0xA1, 0x71, 0x00, 255)   # rim shade
GOLD    = (0xFF, 0xB4, 0x00, 255)   # main orange-gold (citizen / star fill)
BRIGHT  = (0xFF, 0xE0, 0xA1, 255)   # medal highlight
YELLOW  = (0xFF, 0xFF, 0x00, 255)   # hot highlight
WHITE   = (0xFF, 0xFF, 0xFF, 255)
CLEAR   = (0, 0, 0, 0)

# lock palette (purple store icon + same outline)
PURPLE  = (0x8E, 0x2E, 0x9E, 255)
LILAC   = (0xC7, 0x7B, 0xD6, 255)
STEEL   = (0xAD, 0x9C, 0x83, 255)   # the grey-beige used by the game's "locked" status icons
STEEL_D = (0x75, 0x69, 0x55, 255)


def coin_frame(size, half_w):
    """One coin seen from the front, squashed horizontally to `half_w` (radius in x).
    size   : canvas edge in px (square)
    half_w : horizontal radius, 0.5..size/2 (size/2 = full face, small = edge-on)"""
    im = Image.new('RGBA', (size, size), CLEAR)
    px = im.load()
    cx = cy = (size - 1) / 2.0
    ry = size / 2.0 - 0.15
    rx = max(0.6, half_w)

    def inside(x, y, shrink=0.0):
        a = max(0.35, rx - shrink)
        b = max(0.35, ry - shrink)
        return ((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 <= 1.0

    for y in range(size):
        for x in range(size):
            if not inside(x, y):
                continue
            if not inside(x, y, 1.0):
                px[x, y] = OUTLINE                       # 1px dark outline
            elif not inside(x, y, 2.0) and rx > 2.2:
                px[x, y] = SHADE                         # rim
            else:
                px[x, y] = GOLD
    # bevel: bright top-left, shadow bottom-right on the rim (only while the face is wide enough)
    if rx > 3.0:
        for y in range(size):
            for x in range(size):
                if px[x, y] == SHADE:
                    if (x - cx) * 0.5 + (y - cy) < -1.0:
                        px[x, y] = BRIGHT
                    elif (x - cx) * 0.5 + (y - cy) > 1.5:
                        px[x, y] = DARK
    # embossed star-ish emblem (a plain vertical slot reads as "coin" even at 14px)
    if rx > size * 0.30:
        mid = int(round(cx))
        span = max(2, int(size * 0.28))
        top = int(round(cy)) - span // 2 - 1
        for yy in range(top, top + span + 2):
            for xx in (mid, mid + 1) if size % 2 == 0 else (mid,):
                if 0 <= xx < size and px[xx, yy][3]:
                    px[xx, yy] = SHADE if yy == top + span + 1 else YELLOW
        # tiny glint
        gx, gy = int(cx - rx * 0.45), int(cy - ry * 0.45)
        if 0 <= gx < size and px[gx, gy][3] and px[gx, gy] != OUTLINE:
            px[gx, gy] = WHITE
    elif rx > 1.4:
        # edge-on: a lighter stripe down the middle so the thin coin still reads as metal
        for y in range(size):
            for x in range(size):
                if px[x, y] == GOLD and abs(x - cx) < 0.8:
                    px[x, y] = BRIGHT
    return im


def spin_sheet(size=14):
    # a full turn: face -> 3/4 -> edge -> 3/4 (back side) -> face; 8 frames
    widths = [size / 2, size * 0.42, size * 0.27, size * 0.14, size * 0.14, size * 0.27, size * 0.42, size * 0.48]
    sheet = Image.new('RGBA', (size * len(widths), size), CLEAR)
    for i, w in enumerate(widths):
        sheet.paste(coin_frame(size, w), (i * size, 0))
    return sheet


def sparkle_sheet(s=9):
    """4-point twinkle in 3 sizes, same yellow/orange as the game's combo sparks."""
    sheet = Image.new('RGBA', (s * 3, s), CLEAR)
    px = sheet.load()
    c = s // 2
    arms = [1, 3, 4]
    for f, a in enumerate(arms):
        ox = f * s
        for d in range(-a, a + 1):
            col = YELLOW if abs(d) <= a // 2 else GOLD
            px[ox + c + d, c] = col
            px[ox + c, c + d] = col
        px[ox + c, c] = WHITE
        if a >= 3:
            for dx, dy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
                px[ox + c + dx, c + dy] = GOLD
    return sheet


def lock_icon():
    w, h = 12, 14
    im = Image.new('RGBA', (w, h), CLEAR)
    px = im.load()
    # shackle
    for x in range(3, 9):
        px[x, 0] = OUTLINE
    for y in range(1, 6):
        px[2, y] = OUTLINE
        px[9, y] = OUTLINE
        px[3, y] = STEEL if y > 1 else CLEAR
        px[8, y] = STEEL_D if y > 1 else CLEAR
    for x in range(3, 9):
        px[x, 1] = STEEL
    # body
    for y in range(6, 14):
        for x in range(0, 12):
            edge = x in (0, 11) or y in (6, 13)
            px[x, y] = OUTLINE if edge else (LILAC if y == 7 else PURPLE)
    for (x, y) in ((5, 8), (6, 8), (4, 9), (7, 9), (5, 9), (6, 9), (5, 10), (6, 10), (5, 11), (6, 11)):   # keyhole
        px[x, y] = OUTLINE
    return im


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'sprites_out'
    d = os.path.join(out, 'images', 'ui')
    os.makedirs(d, exist_ok=True)
    spin_sheet(14).save(os.path.join(d, 'coin_sheet.png'))
    coin_frame(22, 11).save(os.path.join(d, 'coin_big.png'))
    sparkle_sheet(9).save(os.path.join(d, 'coin_sparkle.png'))
    lock_icon().save(os.path.join(d, 'lock_icon.png'))
    print('wrote sprites to', d)


if __name__ == '__main__':
    main()
