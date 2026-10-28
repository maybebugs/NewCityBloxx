/* City maps: shapes + city plans. '#' buildable, '.' grass (void), '~' water, 'T' park, '=' road */
CityMode.MAPS = [
  { name: "Classic Grid", rows: ["#####","#####","#####","#####","#####"] },
  { name: "Diamond", rows: ["..#..",".###.","#####",".###.","..#.."] },
  { name: "Lakeside", rows: ["#####","#####","##~##","#####","#####"] },
  { name: "Heart", rows: [".#.#.","#####","#####",".###.","..#.."] },
  { name: "Crossroads", rows: [".###.","#####","##T##","#####",".###."] },
  { name: "Harbor", rows: ["#####","#####","#####","~####","~~###"] },
  { name: "Pyramid", rows: ["..#..",".###.","#####","#####","#####"] },
  { name: "Staircase", rows: ["#====","##===","###==","####=","#####"] }
];
CityMode.mapId = 0;

CityMode.mapChar = function (c, r) {
  if (c < 0 || c > 4 || r < 0 || r > 4) return '.';
  return CityMode.MAPS[CityMode.mapId].rows[r][c];
};
CityMode.isBlocked = function (c, r) { return CityMode.mapChar(c, r) !== '#'; };
CityMode.saveName = function () { return CityMode.mapId ? ("citymode_m" + CityMode.mapId) : "citymode"; };
CityMode.loadMapPref = function () {
  try { const v = parseInt(localStorage.getItem('citybloxx.map') || '0', 10); CityMode.mapId = (v >= 0 && v < CityMode.MAPS.length) ? v : 0; } catch (e) { CityMode.mapId = 0; }
};
CityMode.nearestFree = function () {
  let best = null, bd = 1e9;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    if (CityMode.isBlocked(c, r)) continue;
    const d = Math.abs(c - 2) + Math.abs(r - 2);
    if (d < bd) { bd = d; best = [c, r]; }
  }
  return best || [2, 2];
};
CityMode.fixCursor = function () {
  if (CityMode.cursorCol >= 0 && CityMode.isBlocked(CityMode.cursorCol, CityMode.cursorRow)) {
    const p = CityMode.nearestFree(); CityMode.cursorCol = p[0]; CityMode.cursorRow = p[1];
  }
};

CityMode.applyMap = function (id) {
  CityMode.mapId = id;
  try { localStorage.setItem('citybloxx.map', String(id)); } catch (e) {}
  CityMode.gridTops = null;
  CityMode.grid.fill(0); CityMode.cellLevels.fill(0);
  CityMode.level = 0; CityMode.unlockedBonusTier = 0; CityMode.levelBadgeIndex = 0;
  CityMode.population = 0; CityMode.populationTarget = 0; CityMode.populationPending = 0;
  CityMode.unlockedBuildingTier = 0; CityMode.highestTierUnlocked = 0; CityMode.unlockedSpecialTier = -1;
  CityMode.phase = 0; CityMode.populationFlashCount = 0; CityMode.populationFlashTimer = 0;
  CityMode.placementInProgress = false; CityMode.placementResultTimer = -1; CityMode.launchDelay = -1;
  CityMode.placeDelay = -1; CityMode.slideTimer = 0; CityMode.towerGameActive = false;
  CityMode.loadState();
  CityMode.towerGameActive = false; CityMode.modalActive = false;
  CityMode.updateUnlocks(); CityMode.recalculateSynergies();
  CityMode.selectedBuilding = 0;
  const p = CityMode.nearestFree(); CityMode.cursorCol = p[0]; CityMode.cursorRow = p[1];
  CityMode.needsRepaint = true;
  if (!CityMode.tutorialShown[0]) {
    House.showPrompt(Resources.getString$1(36), null, null);
    CityMode.tutorialShown[0] = true; CityMode.modalActive = true;
  }
};

CityMode.terrainImg = undefined;
CityMode.paintTerrain = function (g, x, y, ch) {
  if (CityMode.terrainImg === undefined) {
    const cv = (typeof Assets !== 'undefined') ? Assets.canvasOf('images/city/terrain.png') : null;
    CityMode.terrainImg = cv ? new Image(cv) : null;
  }
  const im = CityMode.terrainImg;
  if (!im) { g.setColor(0x219800); g.fillRect(x, y, 27, 27); return; }
  const W = GameMIDlet.screenWidth, H = GameMIDlet.screenHeight;
  const tile = (i) => { g.setClip(x, y, 27, 27); g.drawImage(im, x - i * 27, y, 20); g.setClip(0, 0, W, H); };
  const obj = (sx, sw, sh, dx, dy) => { g.setClip(x + dx, y + dy, sw, sh); g.drawImage(im, x + dx - sx, y + dy, 20); g.setClip(0, 0, W, H); };
  if (ch === '~') tile(1 + (((CityMode.animTick / 18) | 0) & 1));
  else if (ch === '=') tile(3);
  else if (ch === 'T') { tile(4); obj(162, 26, 24, 1, -3); }
  else tile(((x / 34) | 0) % 2 ? 0 : 5);
};

/* ---- map switch bar (two buttons below the grid) ---- */
CityMode.mapBarLayout = function () {
  const W = GameMIDlet.screenWidth, H = GameMIDlet.screenHeight;
  const gx = (((((((((((W - 28)) - 11)) - 173)) >> 1)) + 28)) + 11);
  const gy = (((((((((((H - 60)) - 56)) - 173)) + 1)) >> 1)) + 60);
  const gridBottom = gy + 173, panelY = H - 56;
  const gap = panelY - gridBottom;
  const h = Math.max(11, Math.min(27, gap - 2));
  const y = gridBottom + ((gap - h) >> 1);
  // same width as a grid cell, aligned with the first and last column
  return { h, left: { x: gx + 5, y, w: 27, h }, right: { x: gx + 5 + 4 * 34, y, w: 27, h } };
};
CityMode.mapBarEnabled = function () {
  return CityMode.assetsLoaded && !CityMode.towerGameActive && !CityMode.modalActive && House.screenState === 2;
};
CityMode.mapBarCanSwitch = function () {
  return CityMode.phase === 0 && !CityMode.placementInProgress && CityMode.placementResultTimer < 0 && CityMode.launchDelay < 0 && CityMode.placeDelay < 0;
};
CityMode.paintMapBar = function (g) {
  const L = CityMode.mapBarLayout(), ok = CityMode.mapBarCanSwitch();
  const OUT = 0x111900;
  const arrow = (r, dir) => {
    // chunky pixel-art chevron in the game's outline + yellow palette (no button plate)
    const n = (r.h >= 13 && r.h < 21) ? 5 : 3;
    const u = Math.max(1, Math.min(3, ((r.h - 2) / (2 * n + 1)) | 0));
    const aw = (n + 1) * u, ah = (2 * n + 1) * u;
    const ax = r.x + ((r.w - aw) >> 1), ay = r.y + ((r.h - ah) >> 1);
    const draw = (col, grow, inset) => {
      g.setColor(col);
      for (let k = -n; k <= n; k++) {
        const c0 = dir < 0 ? Math.abs(k) : 0, c1 = dir < 0 ? n : n - Math.abs(k);
        g.fillRect(ax + c0 * u - grow, ay + (k + n) * u - grow, (c1 - c0 + 1) * u + 2 * grow, u + 2 * grow);
      }
    };
    draw(OUT, 1);
    draw(ok ? 0xecd853 : 0x848484, 0);
    // lit upper edge like the block sprites
    g.setColor(ok ? 0xfff6a8 : 0xb0b0b0);
    for (let k = -n; k < 0; k++) {
      const c0 = dir < 0 ? Math.abs(k) : n - Math.abs(k);
      g.fillRect(ax + c0 * u, ay + (k + n) * u, u, u);
    }
  };
  arrow(L.left, -1); arrow(L.right, 1);
};
CityMode.switchMap = function (dir) {
  if (!CityMode.mapBarCanSwitch()) return;
  const n = CityMode.MAPS.length;
  CityMode.saveState();
  CityMode.applyMap((CityMode.mapId + dir + n) % n);
};
CityMode.mapBarPointer = function (px, py) {
  if (!CityMode.mapBarEnabled()) return false;
  const L = CityMode.mapBarLayout(), s = 6;
  const hit = (r) => px >= r.x - s && px < r.x + r.w + s && py >= r.y - s && py < r.y + r.h + s;
  if (hit(L.left)) { CityMode.switchMap(-1); return true; }
  if (hit(L.right)) { CityMode.switchMap(1); return true; }
  return false;
};

(function () {
  const origInput = CityMode.handleCityInput;
  CityMode.handleCityInput = function () {
    let dx = 0, dy = 0;
    const movable = CityMode.phase === 1 && !CityMode.modalActive && CityMode.placeDelay < 0 && !CityMode.placementInProgress && CityMode.placementResultTimer < 0;
    if (movable) { dx = CityMode.keyRight ? 1 : (CityMode.keyLeft ? -1 : 0); dy = CityMode.keyDown ? 1 : (CityMode.keyUp ? -1 : 0); }
    const pc = CityMode.cursorCol, pr = CityMode.cursorRow;
    origInput.call(CityMode);
    if (CityMode.cursorCol >= 0 && CityMode.isBlocked(CityMode.cursorCol, CityMode.cursorRow)) {
      if ((dx || dy) && (CityMode.cursorCol !== pc || CityMode.cursorRow !== pr)) {
        let c = CityMode.cursorCol, r = CityMode.cursorRow, steps = 1;
        while (c >= 0 && c < 5 && r >= 0 && r < 5 && CityMode.isBlocked(c, r)) { c += dx; r += dy; steps++; }
        if (c >= 0 && c < 5 && r >= 0 && r < 5) {
          CityMode.cursorCol = c; CityMode.cursorRow = r;
          CityMode.slideX *= steps; CityMode.slideY *= steps;
        } else { CityMode.cursorCol = pc; CityMode.cursorRow = pr; CityMode.slideTimer = 0; }
      } else CityMode.fixCursor();
    }
  };
  const origPaint = CityMode.paint;
  CityMode.paint = function (g) {
    origPaint.call(CityMode, g);
    if (CityMode.mapBarEnabled()) CityMode.paintMapBar(g);
  };
})();
