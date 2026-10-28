"""Makes the pink tower a regular fifth tower type (towerType 5) instead of a type-4 tower with a `pinkTower` flag.
Every lookup that used to branch on the flag is now a table indexed by towerType, like the other four towers.
Idempotent.   Usage: python3 tools/patch_pink.py js/game
"""
import sys
D = sys.argv[1] if len(sys.argv) > 1 else 'js/game'
def rd(f): return open(D + '/' + f, encoding='utf-8').read()
def wr(f, s): open(D + '/' + f, 'w', encoding='utf-8').write(s)
def sub(f, a, b, n=1):
    s = rd(f)
    if a not in s:
        assert b in s, (f, 'neither old nor new text found', a[:70]); print('  already applied:', a[:50].strip()); return
    assert s.count(a) == n, (f, a[:70], s.count(a))
    wr(f, s.replace(a, b)); print('  patched:', a[:60].strip())

H = 'House.js'
sub(H, 'return House.pinkTower ? House.PINK_MODEL_TYPE : House.towerType;', 'return House.towerType;')
# combo bonus: (5 - type) would be 0 for type 5
sub(H, '((128 - abs)) / ((5 - House.towerType))) | 0)', '((128 - abs)) / Math.max(1, (5 - House.towerType))) | 0)')
sub(H, 'CityMode.startPlacement((House.pinkTower ? 5 : House.towerType), House.score, House.landingQuality);',
       'CityMode.startPlacement(House.towerType, House.score, House.landingQuality);')
# HUD sprites by type
sub(H, '''    let normalIndex = (House.pinkTower ? House.LIFE_ICON_PINK : Math.imul(((House.towerType - 1)), 2));
    let losingIndex = (House.pinkTower ? House.LIFE_ICON_PINK_LOSS : ((Math.imul(((House.towerType - 1)), 2)) + 1));''',
'''    let normalIndex = House.LIFE_ICON_BY_TYPE[(House.towerType - 1)];
    let losingIndex = House.LIFE_ICON_LOSS_BY_TYPE[(House.towerType - 1)];''')
sub(H, 'let medalIndex = (House.pinkTower ? House.MEDAL_PINK : ((House.towerType - 1)));', 'let medalIndex = House.MEDAL_BY_TYPE[(House.towerType - 1)];')
sub(H, 'House.scoreThresholds[(House.pinkTower ? 4 : (House.towerType - 1))]', 'House.scoreThresholds[(House.towerType - 1)]')
# tower start from the city
sub(H, '''          House.pinkTower = (House.towerType === 5);
          if (House.pinkTower) {
            House.towerType = 4;
          }
          House.bonusEligible = z;
          House.blockGoal = (House.pinkTower ? House.PINK_BLOCK_GOAL : House.goalByTowerType[(House.towerType - 1)]);''',
'''          House.bonusEligible = z;
          House.blockGoal = House.goalByTowerType[(House.towerType - 1)];''')
# saves: plain towerType; old saves stored pink as 4 + 100
sub(H, 'dos.writeInt((House.towerType + ((House.pinkTower ? House.SAVE_PINK_FLAG : 0))));', 'dos.writeInt(House.towerType);', n=2)
sub(H, '''      House.pinkTower = (House.towerType >= House.SAVE_PINK_FLAG);
      if (House.pinkTower) {
        House.towerType -= House.SAVE_PINK_FLAG;
      }''',
'''      if (House.towerType >= House.SAVE_PINK_FLAG) {
        House.towerType = 5;   // saves from before the pink tower became type 5 stored it as 4 + 100
      }''', n=2)
sub(H, '      House.towerType = 4;\n      House.pinkTower = false;\n', '      House.towerType = 4;\n')
sub(H, '        House.towerType = 4;\n        House.pinkTower = false;\n', '        House.towerType = 4;\n')
# tables
sub(H, '  House.pinkTower = false;\n  House.PINK_MODEL_TYPE = 5;\n  House.PINK_BLOCK_GOAL = 50;\n  House.SAVE_PINK_FLAG = 100;\n', '  House.SAVE_PINK_FLAG = 100;\n')
sub(H, 'House.swingAmplitudeXByType = new Int32Array([213, 256, 298, 341, 384]);', 'House.swingAmplitudeXByType = new Int32Array([213, 256, 298, 341, 384, 427]);')
sub(H, 'House.swingAmplitudeYByType = new Int32Array([85, 106, 128, 149, 170]);', 'House.swingAmplitudeYByType = new Int32Array([85, 106, 128, 149, 170, 191]);')
sub(H, 'House.swingPeriodTable = new Int32Array([1670, 1700, 1650, 1600, 1550, 1500, 1450]);', 'House.swingPeriodTable = new Int32Array([1670, 1700, 1650, 1600, 1550, 1500, 1450, 1400]);')
sub(H, '  House.LIFE_ICON_PINK = 10;\n  House.LIFE_ICON_PINK_LOSS = 11;\n  House.MEDAL_ROOF = 4;\n  House.MEDAL_PINK = 5;\n',
       '  House.LIFE_ICON_BY_TYPE = new Int32Array([0, 2, 4, 6, 10]);        // life-icon sheet: 2 per tower (normal, losing), pink last\n'
       '  House.LIFE_ICON_LOSS_BY_TYPE = new Int32Array([1, 3, 5, 7, 11]);\n'
       '  House.MEDAL_ROOF = 4;\n  House.MEDAL_BY_TYPE = new Int32Array([0, 1, 2, 3, 5]);   // medal sheet: roof flash sits between yellow and pink\n')
sub(H, 'House.goalByTowerType = new Int32Array([10, 20, 30, 40]);', 'House.goalByTowerType = new Int32Array([10, 20, 30, 40, 50]);')
sub('Coins.js', 'const idx = House.pinkTower ? 4 : Math.max(0, Math.min(3, House.towerType - 1));', 'const idx = Math.max(0, Math.min(4, House.towerType - 1));')
print('done')
