"""Hooks the coin system into the transpiled game sources (idempotent: skipped when already applied).

Usage: python3 tools/patch_coins.py js/game
Every anchor is asserted, so a changed source fails loudly instead of silently skipping a hook.
"""
import sys
D = sys.argv[1] if len(sys.argv) > 1 else 'js/game'
def rd(f): return open(D + '/' + f, encoding='utf-8').read()
def wr(f, s): open(D + '/' + f, 'w', encoding='utf-8').write(s)
def sub(f, anchor, new, marker):
    s = rd(f)
    if marker in s:
        print('  already applied:', f, '-', marker); return
    assert s.count(anchor) == 1, (f, anchor[:60], s.count(anchor))
    wr(f, s.replace(anchor, new, 1)); print('  patched:', f, '-', marker)

# ---- House: round start, landings, combos, result screen, HUD
sub('House.js', '  static initArrays() {\n    let z = true;\n',
    '  static initArrays() {\n    Coins.startRound();   // [coins] fresh per-round tally\n    let z = true;\n', '[coins] fresh per-round')
sub('House.js', '        House.addScore(House.comboBonus);\n        House.comboTimer = 0;\n      }\n      return true;\n    }\n    let direction = ((offset / abs) | 0);',
    '        House.addScore(House.comboBonus);\n        House.comboTimer = 0;\n      }\n      Coins.onLanding(abs < 25, House.phase === House.PHASE_ROOF);   // [coins] pay for the landing\n      return true;\n    }\n    let direction = ((offset / abs) | 0);',
    '[coins] pay for the landing')
sub('House.js', '  static cashInCombo() {\n', '  static cashInCombo() {\n    Coins.onCombo(House.comboCount);   // [coins] combo payout\n', '[coins] combo payout')
sub('House.js', '  buildResultText(isVictory) {\n', '  buildResultText(isVictory) {\n    const prevBest = House.progress[4];   // [coins] floor record before this round\n', '[coins] floor record')
sub('House.js', '    this.saveSettings();\n    House.showPrompt(resultText, null, null);\n    House.screenState = 6;',
    '    resultText += Coins.finishRound(House.gameMode === House.GAME_MODE_QUICK, House.blockCount, prevBest);   // [coins] summary lines\n    this.saveSettings();\n    House.showPrompt(resultText, null, null);\n    House.screenState = 6;',
    '[coins] summary lines')
sub('House.js', '    House.paintComboGauge(g);\n  }\n  static paintLives', '    House.paintComboGauge(g);\n    Coins.paintHud(g, false);   // [coins] counter\n  }\n  static paintLives', '[coins] counter')

# ---- CityMode: HUD + level rewards
sub('CityMode.js', '    CityMode.paintBuildingSelector(g, gridOriginX, gridOriginY);\n    if (CityMode.modalActive) {',
    '    CityMode.paintBuildingSelector(g, gridOriginX, gridOriginY);\n    Coins.paintHud(g, true);   // [coins] counter\n    if (CityMode.modalActive) {', '[coins] counter')
sub('CityMode.js', '    let i3 = CityMode.unlockedBuildingTier;\n', '    Coins.onCityLevel(CityMode.level);   // [coins] level rewards\n    let i3 = CityMode.unlockedBuildingTier;\n', '[coins] level rewards')

# ---- GameMIDlet: global overlay (flying coins, popups, reward banner) on top of whatever screen is showing
sub('GameMIDlet.js', '    } else if (this.loading) {\n      this.paintLoadingOverlay(g);\n    }\n  }\n  destroyApp',
    '    } else if (this.loading) {\n      this.paintLoadingOverlay(g);\n    }\n    Coins.paintOverlay(g);   // [coins] effects + banners\n  }\n  destroyApp', '[coins] effects + banners')
print('done')
