"""Browser patches applied on top of the transpiled sources (idempotent per fresh transpile)."""
import re, sys
D = sys.argv[1]
def rd(f): return open(D + '/' + f).read()
def wr(f, s): open(D + '/' + f, 'w').write(s)
def sub(f, a, b):
    s = rd(f); assert a in s, (f, a[:50]); wr(f, s.replace(a, b, 1))

# Lang: browser locale + base-language fallback
sub('Lang.js', 'java.util.Locale.getDefault().toLanguageTag()', "(new URLSearchParams(location.search).get('lang') || navigator.language || 'en-US')")
sub('Lang.js', '          if (inputStream == null) {\n            inputStream = Assets.open("lang/lang.en-US");',
    '          if (inputStream == null) {\n            let base = Lang.locale.split("-")[0];\n            let alt = Assets.findPrefix("lang/lang." + base + "-");\n            if (alt != null) inputStream = Assets.open(alt);\n          }\n          if (inputStream == null) {\n            inputStream = Assets.open("lang/lang.en-US");')

# Resources: manifest from bundle, preloaded images
s = rd('Resources.js')
a = s.index('      let r = new BufferedReader'); b = s.index('      r.close();') + len('      r.close();')
s = s[:a] + '''      for (let line of (Assets.text("manifest.txt") || "").split("\\n")) {
        line = line.trim();
        if (line.length === 0 || line.charCodeAt(0) === 35) continue;
        let p = line.split(/\\s+/, 2);
        if (p.length === 2) Resources.manifest.put(parseInt(p[0], 10), p[1]);
      }''' + s[b:]
a = s.index('  static getImage(resourceId) {'); b = s.index('  static getString$1')
s = s[:a] + '''  static getImage(resourceId) {
    let path = Resources.pathOf(resourceId);
    let cv = (path == null) ? null : Assets.canvasOf(path);
    return (cv == null) ? null : new Image(cv);
  }
''' + s[b:]
wr('Resources.js', s)

# GameMIDlet: requestAnimationFrame loop
sub('GameMIDlet.js', '  run() {\n    while (!this.exitRequested) {',
    '  run() {\n    this.lastTs = 0;\n    const loop = (ts) => {\n      if (ts - this.lastTs >= 15) {\n        this.lastTs = ts;\n        this.tick();\n      }\n      if (!this.exitRequested) requestAnimationFrame(loop);\n    };\n    requestAnimationFrame(loop);\n  }\n  tick() {\n    if (!this.exitRequested) {')
sub('GameMIDlet.js', '        this.paceFrame(frameStartNs);\n', '')
sub('GameMIDlet.js', '        try {\n          Thread.sleep(10);\n        } catch (ignored) {\n        }\n', '')
sub('GameMIDlet.js', '      this.thread = new Thread(this, "game-loop");\n      this.thread.start();', '      this.thread = { join() {} };\n      this.run();')

# House: missing save data -> fresh start
s = rd('House.js')
for n in ('towermode', 'quickModeRS', 'cityModeRS'):
    a = '      let dis = Storage.openRead("%s");\n' % n
    assert a in s, n
    s = s.replace(a, a + '      if (dis == null) return;   // no saved data (browser storage empty): start fresh\n')
wr('House.js', s)

# PlatformFactory: lazy HighScores statics
sub('PlatformFactory.js', 'return new HighScores();', 'HighScores.$clinit();\n    return new HighScores();')

# GameCanvas: touch taps
s = rd('GameCanvas.js')
a = s.index('  pointerPressed('); b = s.index('  pointerReleased(')
seg = re.sub(r'this\.keyReleased\((-?\d+)\);', r'setTimeout(() => this.keyReleased(\1), 120);', s[a:b])
old = "      } else if (House.getMode() !== 7) {\n        House.dropBlock();\n        return;\n      }"
assert old in seg
seg = seg.replace(old, """      } else if (House.getMode() !== 7) {
        let m = House.getMode();
        if (m === 4 || m === 5 || m === 6 || m === 8) {
          // dialogs: behave exactly like the fire key (it also leaves the dialog state when it closes)
          this.keyPressed(-5);
          setTimeout(() => this.keyReleased(-5), 120);
          return;
        }
        House.dropBlock();
        return;
      }""")
wr('GameCanvas.js', s[:a] + seg + s[b:])
print('patched')

# ---- touch support (Store screen) + Back button hook
sub('StoreScreen.js', '  update(delta, time) {', '''  pointerPressed(px, py) {
    if (this.options == null) return;
    const n = this.options.size();
    const w = GameMIDlet.screenWidth;
    if (py >= 26 && py < 64) {                       // tower chips
      const chipW = 42, gap = 3, cnt = CustomTops.NAMES.length;
      const x0 = ((w - (cnt * chipW + (cnt - 1) * gap)) / 2) | 0;
      const i = Math.floor((px - x0) / (chipW + gap));
      if (i >= 0 && i < cnt) this.selectSlot(i);
    } else if (py >= 66 && py < 230) {               // preview: left = previous, right = next, middle = equip
      if (px < w / 3) this.index = (this.index - 1 + n) % n;
      else if (px > w * 2 / 3) this.index = (this.index + 1) % n;
      else this.equip();
    } else if (py >= 230 && py < 270) {              // label row: < >
      this.index = px < w / 2 ? (this.index - 1 + n) % n : (this.index + 1) % n;
    }
  }
  update(delta, time) {''')
# draw tap arrows on the preview panel edges
sub('StoreScreen.js', '    let equipped = ', '''    g.setColor(0xFFFFFF);
    for (let k = 0; k < 2; k++) {
      let ax = k === 0 ? 16 : w - 16, dir = k === 0 ? -1 : 1, ay = py + ((ph / 2) | 0);
      for (let r = 0; r < 6; r++) g.fillRect(k === 0 ? ax + r : ax - r, ay - r - 1, 1, 2 * r + 2);
    }
    let equipped = ''')
sub('GameCanvas.js', '    } else if (currentScreen instanceof House) {', '''    } else if (currentScreen instanceof StoreScreen) {
      currentScreen.pointerPressed(pointerX, pointerY);
      return;
    } else if (currentScreen instanceof House) {''')
print('touch patched')
