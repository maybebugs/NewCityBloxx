/* Store backend: pick a custom 3D top for each of the 5 towers (hand-port of CustomTops.java).
   Models are OBJ files (+ optional MTL / textures / .properties) in the bundled "bonus" folder; choices are kept in localStorage. */
class CustomTopsOption {
  constructor(kind, file, label) {
    this.kind = kind; this.file = file; this.label = label;
    this.price = CustomTops.priceFor(kind, file);     // coins; 0 = free
    this.tier = CustomTops.tierFor(kind, file, this.price);
  }
  key() { return this.kind === 0 ? 'default' : this.kind === 1 ? 'bonus' : 'file:' + this.file; }
}

/** Minimal java.util.Properties parser (key=value / key:value, # and ! comments, backslash escapes). */
function parseProperties(text) {
  const p = {};
  for (let line of (text || '').split(/\r?\n/)) {
    line = line.replace(/^\s+/, '');
    if (!line || line[0] === '#' || line[0] === '!') continue;
    const m = /^((?:\\.|[^=:\s\\])+)\s*[=:\s]\s*(.*)$/.exec(line);
    if (!m) { p[line] = ''; continue; }
    const unesc = (s) => s.replace(/\\(.)/g, '$1');
    p[unesc(m[1])] = unesc(m[2].replace(/\s+#.*$/, '').trim());
  }
  return p;
}

class CustomTops {
  static num(p, key, def) {
    const v = parseFloat(p[key]);
    return Number.isNaN(v) ? def : v;
  }

  static rescan() {
    CustomTops.loadPrefs();
    CustomTops.options_.length = 0;
    CustomTops.options_.push(new CustomTopsOption(0, null, 'Default'));
    CustomTops.options_.push(new CustomTopsOption(1, null, 'Classic Bonus'));
    for (const f of Assets.list('bonus')) {
      if (f.toLowerCase().endsWith('.obj')) CustomTops.options_.push(new CustomTopsOption(2, f, CustomTops.labelFor(f)));
    }
    // Store order = the price ladder: Default first, then cheapest -> most expensive, user-added models last.
    const rank = (o) => (o.kind === 0 ? -1 : (o.kind === 2 && !(o.file in CustomTops.CATALOG)) ? 1e9 : o.price);
    CustomTops.options_.sort((a, b) => (rank(a) - rank(b)) || a.label.localeCompare(b.label));
  }

  /** Price in coins of a bundled top; anything not in the catalog (Default, models you add yourself) is free. */
  static priceFor(kind, file) {
    if (kind === 1) return CustomTops.CATALOG['@classic'];
    if (kind === 2 && file in CustomTops.CATALOG) return CustomTops.CATALOG[file];
    return 0;
  }

  static tierFor(kind, file, price) {
    if (kind === 0) return 0;                                    // STARTER
    if (kind === 2 && !(file in CustomTops.CATALOG)) return 5;   // CUSTOM (your own models)
    if (price <= 300) return 1;                                  // COMMON
    if (price <= 800) return 2;                                  // RARE
    if (price <= 2000) return 3;                                 // EPIC
    return 4;                                                    // LEGENDARY
  }

  static owned(o) { return o.price <= 0 || Coins.owns(o.key()); }

  /** Cheapest top the player does not own yet (the "next goal"), or null when the collection is complete. */
  static nextGoal() {
    if (CustomTops.options_.length === 0) CustomTops.rescan();
    for (const o of CustomTops.options_) if (!CustomTops.owned(o)) return o;
    return null;
  }

  static ownedCount() {
    let n = 0;
    for (const o of CustomTops.options_) if (o.price > 0 && Coins.owns(o.key())) n++;
    return n;
  }
  static paidCount() {
    let n = 0;
    for (const o of CustomTops.options_) if (o.price > 0) n++;
    return n;
  }

  static reloadAll() {
    CustomTops.meshCache.clear();
    Model.clearFileCache();
    CustomTops.rescan();
  }

  /** Vector-like list (size()/get()) of the selectable tops. */
  static options() {
    if (CustomTops.options_.length === 0) CustomTops.rescan();
    const v = new Vector();
    for (const o of CustomTops.options_) v.add(o);
    return v;
  }

  static labelFor(file) {
    const n = CustomTops.config(file).name;
    if (n && n.trim().length > 0) return n.trim();
    let base = file.substring(0, file.length - 4).replace(/_/g, ' ').trim();
    if (base.toLowerCase().startsWith('top ')) base = base.substring(4);
    if (base.length === 0) base = file;
    return base.charAt(0).toUpperCase() + base.substring(1);
  }

  static config(objFile) {
    return parseProperties(Assets.text(CustomTops.BONUS_DIR + objFile.substring(0, objFile.length - 4) + '.properties'));
  }

  static getAssigned(slot) {
    if (CustomTops.options_.length === 0) CustomTops.rescan();
    const key = CustomTops.chosen[slot];
    for (const o of CustomTops.options_) if (o.key() === key) return CustomTops.owned(o) ? o : CustomTops.options_[0];
    return CustomTops.options_[0];
  }

  static assign(slot, o) { CustomTops.chosen[slot] = o.key(); CustomTops.savePrefs(); }

  static loadPrefs() {
    if (CustomTops.loadedPrefs) return;
    CustomTops.loadedPrefs = true;
    try {
      const raw = localStorage.getItem('citybloxx.store');
      if (!raw) return;
      const p = JSON.parse(raw);
      for (let i = 0; i < CustomTops.NAMES.length; i++) {
        const v = p[CustomTops.NAMES[i].toLowerCase()];
        if (v) CustomTops.chosen[i] = v;
      }
    } catch (e) { console.warn('store prefs: ' + e); }
  }

  static savePrefs() {
    try {
      const p = {};
      for (let i = 0; i < CustomTops.NAMES.length; i++) p[CustomTops.NAMES[i].toLowerCase()] = CustomTops.chosen[i];
      localStorage.setItem('citybloxx.store', JSON.stringify(p));
    } catch (e) { console.warn('Could not save store choices: ' + e); }
  }

  /** Mesh to show for an option in the Store preview: custom files are auto-fitted. */
  static meshFor(slot, o) {
    const type = CustomTops.TYPES[slot];
    switch (o.kind) {
      case 0: return Renderer3D.getModel(type + 29, 0, true);
      case 1: return Renderer3D.getModel(type + 39, 0, true);
      default: return CustomTops.fileMesh(o.file, true);
    }
  }

  /** In-game: custom top for a tower model type (1..5), or null to keep the original top. */
  static gameTop(towerModelType) {
    for (let slot = 0; slot < CustomTops.TYPES.length; slot++) {
      if (CustomTops.TYPES[slot] === towerModelType) {
        const o = CustomTops.getAssigned(slot);
        switch (o.kind) {
          case 0: return null;
          case 1: return Renderer3D.getModel(towerModelType + 39, 0, true);
          default: return CustomTops.fileMesh(o.file, false);
        }
      }
    }
    return null;
  }

  static fileMesh(file, preview) {
    const key = (preview ? 'p:' : 'g:') + file;
    const cached = CustomTops.meshCache.get(key);
    if (cached) return cached;
    const src = Model.loadFile(CustomTops.BONUS_DIR + file);
    if (!src) return null;
    const m = src.copy();            // never mutate the shared cached Model
    CustomTops.fit(m, CustomTops.config(file), preview);
    const mesh = new Mesh3D(m);
    mesh.setupAppearance();          // REPLACE + clamp, like the built-in tops
    CustomTops.meshCache.set(key, mesh);
    return mesh;
  }

  /**
   * Positions a model so its base sits at y = -128 and it is centred on X/Z. Scaling is opt-in and driven by height:
   * the Store preview fits by default; gameplay keeps the authored size unless fitgameplay=true / height= / maxwidth= / size=.
   */
  static fit(m, cfg, preview) {
    const p = m.pos;
    const rot = CustomTops.num(cfg, 'rotate', 0);
    if (rot !== 0) {
      const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180);
      for (let i = 0; i < p.length; i += 3) {
        const x = p[i], z = p[i + 2];
        p[i] = x * c + z * s;
        p[i + 2] = -x * s + z * c;
      }
    }
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < p.length; i += 3) {
      minX = Math.min(minX, p[i]); maxX = Math.max(maxX, p[i]);
      minY = Math.min(minY, p[i + 1]); maxY = Math.max(maxY, p[i + 1]);
      minZ = Math.min(minZ, p[i + 2]); maxZ = Math.max(maxZ, p[i + 2]);
    }
    let targetH = NaN, maxW = NaN;
    const sizeStr = cfg.size;
    if (sizeStr && sizeStr.indexOf('x') > 0) {
      const wh = sizeStr.trim().split('x');
      const w = parseFloat(wh[0]), h = parseFloat(wh[1]);
      if (!Number.isNaN(w) && !Number.isNaN(h)) { maxW = w; targetH = h; }
    }
    if (cfg.height !== undefined) targetH = CustomTops.num(cfg, 'height', targetH);
    if (cfg.maxwidth !== undefined) maxW = CustomTops.num(cfg, 'maxwidth', maxW);
    const explicitSize = !Number.isNaN(targetH) || !Number.isNaN(maxW);
    let doFit;
    if (explicitSize) doFit = true;
    else {
      const fitAllowed = cfg.fit === undefined || cfg.fit.trim().toLowerCase() !== 'false';
      doFit = preview ? fitAllowed : (fitAllowed && (cfg.fitgameplay || 'false').trim().toLowerCase() === 'true');
    }
    let scale = CustomTops.num(cfg, 'scale', 1);
    const yoff = CustomTops.num(cfg, 'yoffset', 0);
    if (doFit) {
      if (Number.isNaN(targetH)) targetH = 420;
      const h = maxY - minY;
      if (h > 1e-6 && targetH > 1e-6) scale *= targetH / h;
      if (!Number.isNaN(maxW) && maxW > 1e-6) {
        const w = Math.max(maxX - minX, maxZ - minZ);
        if (w > 1e-6) { const ws = maxW / w; if (ws < scale) scale = ws; }
      }
    }
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2, baseY = -128;
    for (let i = 0; i < p.length; i += 3) {
      p[i] = (p[i] - cx) * scale;
      p[i + 1] = (p[i + 1] - minY) * scale + baseY + yoff;
      p[i + 2] = (p[i + 2] - cz) * scale;
    }
    const cullBack = (cfg.cull || 'none').trim().toLowerCase() === 'back';
    for (const s of m.subs) if (!cullBack) s.culling = Model.CULL_NONE;
  }
}

CustomTops.NAMES = ['Blue', 'Yellow', 'Green', 'Red', 'Pink'];
CustomTops.TYPES = [1, 4, 3, 2, 5];
CustomTops.COLORS = [0x4A90E2, 0xF2C230, 0x4CAF50, 0xE04848, 0xF06FB5];
CustomTops.KIND_DEFAULT = 0; CustomTops.KIND_CLASSIC_BONUS = 1; CustomTops.KIND_FILE = 2;
CustomTops.BONUS_DIR = 'bonus/';
CustomTops.options_ = [];
CustomTops.chosen = ['default', 'default', 'default', 'default', 'default'];
CustomTops.meshCache = new Map();
CustomTops.loadedPrefs = false;
CustomTops.$clinit = function () {};

/* ---- Store price list (coins). Ladder logic: see COINS_DESIGN.md. Tier = price band. ------------------------------
   COMMON <=300   cheap, instantly readable shapes -> the first purchase lands inside the first session
   RARE   <=800   vehicles, nature, sci-fi          -> a few sessions of saving
   EPIC   <=2000  skyline landmarks (tall, iconic)  -> mid-term goal
   LEGEND >2000   status symbols                    -> long-term flex
   Files not listed here (models you add yourself with the box button) are always free. */
CustomTops.CATALOG = {
  '@classic': 400,                    // the original game's bonus top (nostalgia item)
  // COMMON
  'top_potato.obj': 100,              // Copper Spud   - joke-cheap "starter" purchase
  'top_vlccone.obj': 120,             // Cone Blocker  - construction theme fits the game
  'top_cucumber.obj': 120,            // Tall Cuke
  'top_basketball.obj': 150,          // Hoops
  'top_tennisball.obj': 150,          // Match Point
  'top_football.obj': 150,            // Pigskin
  'top_apple.obj': 180,               // Big Apple
  'top_orange.obj': 180,              // Juicy Orange
  'top_poop.obj': 200,                // Swirl Pile    - meme item, priced as a laugh
  'top_donut.obj': 220,               // Sugar Ring
  'top_candycane.obj': 250,           // Candy Cane
  'top_spiral.obj': 250,              // Candy Spiral
  'top_wine.obj': 300,                // Velvet Bottle
  'top_bonus_5.obj': 300,             // Bonus Peach
  // RARE
  'top_knot.obj': 350,                // Frost Knot
  'top_celltower.obj': 400,           // Signal Mast
  'top_rose.obj': 450,                // Velvet Rose
  'top_plug.obj': 500,                // Fluff Plug
  'top_breast_up.obj': 500,           // Sky Peak
  'top_dildo.obj': 500,               // Pink Rocket
  'top_wand.obj': 550,                // Star Wand
  'top_airplane.obj': 600,            // Jet Liner
  'top_earth.obj': 650,               // Blue Marble
  'top_locomotive.obj': 700,          // SD70ACe
  'top_c17.obj': 750,                 // Globemaster
  'top_ufo.obj': 800,                 // Little Saucer
  // EPIC
  'top_clocktower.obj': 900,          // Old Clock
  'top_militarytower.obj': 1100,      // Watchtower
  'top_tokyotower.obj': 1400,         // Tokyo Tower
  'top_liberty.obj': 1700,            // Lady Liberty
  'top_heavengate.obj': 2000,         // Heaven Gate
  // LEGENDARY
  'top_devil.obj': 2500,              // Block Devil
  'top_crown.obj': 3500,              // Gold Crown
  'top_diamond.obj': 5000,            // Ice Gem       - the ultimate flex
};
CustomTops.TIER_NAMES = ['STARTER', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'CUSTOM'];
CustomTops.TIER_COLORS = [0xB8C4D8, 0xE8E8E8, 0x5AB0FF, 0xC77BFF, 0xFFC82A, 0x7CE0C0];
