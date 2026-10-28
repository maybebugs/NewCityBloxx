#!/usr/bin/env python3
"""Makes the cyan tower the 6th regular tower type (towerType 6; special variants move from 6..10 to 7..12). Usage: python3 tools/patch_cyan.py js/game"""
import sys
D = sys.argv[1] if len(sys.argv) > 1 else 'js/game'
def rd(f): return open(D + '/' + f, encoding='utf-8').read()
def wr(f, s): open(D + '/' + f, 'w', encoding='utf-8').write(s)
def sub(f, a, b, n=1):
    s = rd(f)
    if a not in s:
        assert b in s, (f, 'neither old nor new text found', a[:80]); print('  already:', a[:50].strip()); return
    assert s.count(a) == n, (f, a[:80], s.count(a))
    wr(f, s.replace(a, b)); print('  patched:', a[:60].strip())

H, C = 'House.js', 'CityMode.js'
# ---- House: per-type tables
sub(H, 'House.LIFE_ICON_BY_TYPE = new Int32Array([0, 2, 4, 6, 10]);', 'House.LIFE_ICON_BY_TYPE = new Int32Array([0, 2, 4, 6, 10, 12]);')
sub(H, 'House.LIFE_ICON_LOSS_BY_TYPE = new Int32Array([1, 3, 5, 7, 11]);', 'House.LIFE_ICON_LOSS_BY_TYPE = new Int32Array([1, 3, 5, 7, 11, 13]);')
sub(H, 'House.MEDAL_BY_TYPE = new Int32Array([0, 1, 2, 3, 5]);', 'House.MEDAL_BY_TYPE = new Int32Array([0, 1, 2, 3, 5, 6]);')
sub(H, 'House.goalByTowerType = new Int32Array([10, 20, 30, 40, 50]);', 'House.goalByTowerType = new Int32Array([10, 20, 30, 40, 50, 60]);')
sub(H, 'House.scoreThresholds = new Int32Array([70, 250, 550, 1000, 1500]);', 'House.scoreThresholds = new Int32Array([70, 250, 550, 1000, 1500, 2200]);')
sub(H, 'House.swingAmplitudeXByType = new Int32Array([213, 256, 298, 341, 384, 427]);', 'House.swingAmplitudeXByType = new Int32Array([213, 256, 298, 341, 384, 427, 469]);')
sub(H, 'House.swingAmplitudeYByType = new Int32Array([85, 106, 128, 149, 170, 191]);', 'House.swingAmplitudeYByType = new Int32Array([85, 106, 128, 149, 170, 191, 213]);')
sub(H, 'House.swingPeriodTable = new Int32Array([1670, 1700, 1650, 1600, 1550, 1500, 1450, 1400]);', 'House.swingPeriodTable = new Int32Array([1670, 1700, 1650, 1600, 1550, 1500, 1450, 1400, 1350, 1300]);')
sub(H, 'if (House.towerType > 5) {\n            House.towerType -= 5;', 'if (House.towerType > 6) {\n            House.towerType -= 6;')
sub(H, 'new Int32Array([7, 8, 9, 10, 11, 12, 13, 14, 20, 21, 22, 23, 24, 30, 31, 32, 33, 34, 40, 41, 42, 43, 44])', 'new Int32Array([7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25, 30, 31, 32, 33, 34, 35, 40, 41, 42, 43, 44, 45])')
# ---- Coins / CustomTops / Store
sub('Coins.js', 'const idx = Math.max(0, Math.min(4, House.towerType - 1));', 'const idx = Math.max(0, Math.min(5, House.towerType - 1));')
sub('Coins.js', 'TOWER_DONE: [10, 20, 35, 50, 75],   // finished city tower: blue, red, green, yellow, pink', 'TOWER_DONE: [10, 20, 35, 50, 75, 100],   // finished city tower: blue, red, green, yellow, pink, cyan')
sub('CustomTops.js', '[24, 4, 4], [23, 4, 5]];', '[24, 4, 4], [23, 4, 5], [23, 4, 5]];')
sub('CustomTops.js', "CustomTops.NAMES = ['Blue', 'Yellow', 'Green', 'Red', 'Pink'];", "CustomTops.NAMES = ['Blue', 'Yellow', 'Green', 'Red', 'Pink', 'Cyan'];")
sub('CustomTops.js', 'CustomTops.TYPES = [1, 4, 3, 2, 5];', 'CustomTops.TYPES = [1, 4, 3, 2, 5, 6];')
sub('CustomTops.js', "CustomTops.chosen = ['default', 'default', 'default', 'default', 'default'];", "CustomTops.chosen = ['default', 'default', 'default', 'default', 'default', 'default'];")
sub('StoreScreen.js', 'let chipW = 42, gap = 3;', 'let gap = 3, chipW = Math.min(42, ((w - 6 - (CustomTops.NAMES.length - 1) * gap) / CustomTops.NAMES.length) | 0);')
sub('StoreScreen.js', 'const chipW = 42, gap = 3, cnt = CustomTops.NAMES.length;', 'const gap = 3, cnt = CustomTops.NAMES.length, chipW = Math.min(42, ((w - 6 - (cnt - 1) * gap) / cnt) | 0);')
# ---- CityMode
sub(C, 'CityMode.buildingNames = [Resources.getString$1(83), Resources.getString$1(84), Resources.getString$1(85), Resources.getString$1(86), CityMode.PINK_NAME, Resources.getString$1(87), Resources.getString$1(88), Resources.getString$1(89), Resources.getString$1(90), CityMode.PINK_SPECIAL_NAME];',
    'CityMode.buildingNames = [Resources.getString$1(83), Resources.getString$1(84), Resources.getString$1(85), Resources.getString$1(86), CityMode.PINK_NAME, CityMode.CYAN_NAME, Resources.getString$1(87), Resources.getString$1(88), Resources.getString$1(89), Resources.getString$1(90), CityMode.PINK_SPECIAL_NAME, CityMode.CYAN_SPECIAL_NAME];')
sub(C, 'Resources.getString$1(102), CityMode.PINK_HELP];', 'Resources.getString$1(102), CityMode.PINK_HELP, CityMode.CYAN_HELP];')
sub(C, 'CityMode.helpLines = new Array(15).fill(null);', 'CityMode.helpLines = new Array(18).fill(null);', n=2)
sub(C, 'CityMode.buildingSprites = new Array(6).fill(null);', 'CityMode.buildingSprites = new Array(7).fill(null);')
sub(C, 'CityMode.buildingSprites[4] = Resources.getImage(CityMode.PINK_SPRITE_RESOURCE);', 'CityMode.buildingSprites[4] = Resources.getImage(CityMode.PINK_SPRITE_RESOURCE);\n    CityMode.buildingSprites[5] = Resources.getImage(CityMode.CYAN_SPRITE_RESOURCE);')
sub(C, 'getWidth() / 5) | 0);', 'getWidth() / CityMode.BUILDING_COUNT) | 0);', n=2)
sub(C, 'for (let t = 1; t <= 5; t++) CustomTops.iconForKey', 'for (let t = 1; t <= 6; t++) CustomTops.iconForKey')
sub(C, 'CityMode.BUILDING_COUNT = 5;\n  CityMode.SHADOW_SPRITE = 5;\n  CityMode.PINK_SPRITE_RESOURCE = 100;', 'CityMode.BUILDING_COUNT = 6;\n  CityMode.SHADOW_SPRITE = 6;\n  CityMode.PINK_SPRITE_RESOURCE = 100;\n  CityMode.CYAN_SPRITE_RESOURCE = 102;')
sub(C, '  CityMode.PINK_UNLOCK = "New building unlocked: the Pink Tower!";',
    '  CityMode.PINK_UNLOCK = "New building unlocked: the Pink Tower!";\n  CityMode.CYAN_NAME = "Cyan Tower";\n  CityMode.CYAN_SPECIAL_NAME = "Special Cyan Tower";\n  CityMode.CYAN_HELP = "Cyan Tower: build it on a plot touching the Pink Tower and two other building types.";\n  CityMode.CYAN_UNLOCK = "New building unlocked: the Cyan Tower!";')
sub(C, 'CityMode.buildingColors = new Int32Array([-12357161, -2024952, -15618292, -2449664, -2076516, -16044658, -8122095, -16491520, -11520000, -29496]);',
    'CityMode.buildingColors = new Int32Array([-12357161, -2024952, -15618292, -2449664, -2076516, -14430232, -16044658, -8122095, -16491520, -11520000, -29496, -6619137]);')
sub(C, 'CityMode.cellPalette = new Int32Array([-16755552, -6290944, -16738304, -7120384, -5227380, -12793601, -38586, -13107401, -983296, -32576]);',
    'CityMode.cellPalette = new Int32Array([-16755552, -6290944, -16738304, -7120384, -5227380, -16744305, -12793601, -38586, -13107401, -983296, -32576, -8388353]);')
sub(C, 'CityMode.tierColorsPrimary = new Int32Array([-12355561, -11506121, -10983088, -10329750, -6657400]);', 'CityMode.tierColorsPrimary = new Int32Array([-12355561, -11506121, -10983088, -10329750, -6657400, -10282336]);')
sub(C, 'CityMode.tierColorsSecondary = new Int32Array([-8864728, -8409274, -8084131, -7693196, -4682586]);', 'CityMode.tierColorsSecondary = new Int32Array([-8864728, -8409274, -8084131, -7693196, -4682586, -7618362]);')
sub(C, 'CityMode.buildingUnlockLevels = new Int32Array([0, 3, 6, 10, 13]);', 'CityMode.buildingUnlockLevels = new Int32Array([0, 3, 6, 10, 13, 16]);')
sub(C, 'CityMode.specialUnlockLevels = new Int32Array([8, 12, 14, 16, 18]);', 'CityMode.specialUnlockLevels = new Int32Array([8, 12, 14, 16, 18, 20]);')
sub(C, 'return (CityMode.unlockedSpecialTier >= CityMode.selectedBuilding) ? (CityMode.selectedBuilding + 6) : (CityMode.selectedBuilding + 1);', 'return (CityMode.unlockedSpecialTier >= CityMode.selectedBuilding) ? (CityMode.selectedBuilding + 7) : (CityMode.selectedBuilding + 1);')
sub(C, 'House.showPrompt(Resources.getString$2(51, [CityMode.buildingNames[9]]), null, null);', 'House.showPrompt(Resources.getString$2(51, [CityMode.buildingNames[10]]), null, null);')
# unlock prompts for the cyan tower (kept in localStorage so the save format stays untouched)
sub(C, '    if (!((((CityMode.modalActive || CityMode.pinkPrompt[0])',
    '''    if (!((CityMode.modalActive || CityMode.placementInProgress) || CityMode.unlockedBuildingTier < 5 || CityMode.cyanSeen('b'))) {
      House.showPrompt(CityMode.CYAN_UNLOCK, null, null);
      CityMode.cyanSeen('b', true);
      CityMode.modalActive = true;
    }
    if (!((CityMode.modalActive || CityMode.placementInProgress) || CityMode.unlockedSpecialTier < 5 || CityMode.cyanSeen('s'))) {
      House.showPrompt(Resources.getString$2(51, [CityMode.buildingNames[11]]), null, null);
      CityMode.cyanSeen('s', true);
      CityMode.modalActive = true;
    }
    if (!((((CityMode.modalActive || CityMode.pinkPrompt[0])''')
sub(C, '  static getBuildingTowerType() {', '''  static cyanSeen(k, set) {
    try {
      if (set) localStorage.setItem('citybloxx.cyan.' + k, '1');
      return localStorage.getItem('citybloxx.cyan.' + k) === '1';
    } catch (e) { return true; }
  }
  static getBuildingTowerType() {''')
# synergy level 5: plot touching the pink tower and (at least) two other building types
sub(C, '        CityMode.cellLevels[((Math.imul(i, 5)) + i2)] = i3;',
    '''        if (iArr.indexOf(5) >= 0 && new Set(Array.from(iArr).filter((t) => t > 0 && t <= 5)).size >= 3) {
          i3 = 5;   // cyan tower plot: pink neighbour + at least two other building types
        }
        CityMode.cellLevels[((Math.imul(i, 5)) + i2)] = i3;''')
sub('CustomTops.js', 'CustomTops.COLORS = [0x4A90E2, 0xF2C230, 0x4CAF50, 0xE04848, 0xF06FB5];', 'CustomTops.COLORS = [0x4A90E2, 0xF2C230, 0x4CAF50, 0xE04848, 0xF06FB5, 0x2CC8E0];')
print('done')
