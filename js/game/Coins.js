'use strict';

/**
 * Coin economy for City Bloxx (see COINS_DESIGN.md for the reasoning behind every number).
 *
 *  - Earn:  every landed block, perfect drops, combos, finished towers, quick-mode runs, city levels, daily streak,
 *           and a handful of one-time "firsts". Coins are banked the instant they are earned (a failed tower still pays).
 *  - Spend: unlocking tower tops in the Store (see CustomTops / StoreScreen).
 *  - Show:  HUD counter, flying coins, "+N" popups and a slide-in reward banner (all drawn by paintOverlay, which
 *           GameMIDlet.paintCanvas calls last so effects float above any screen).
 *
 * State lives in localStorage ("citybloxx.coins") so it survives reloads; everything degrades to in-memory if
 * storage is unavailable.
 */
class Coins {
  /* ------------------------------------------------------------------ persistence */
  static blank() {
    return { v: 1, balance: 0, lifetime: 0, spent: 0, owned: {}, streak: 0, lastDay: '', cityLevelPaid: 0, flags: {} };
  }

  static load() {
    let raw = null;
    try { raw = localStorage.getItem(Coins.KEY); } catch (e) { /* storage blocked */ }
    let st = null;
    if (raw) { try { st = JSON.parse(raw); } catch (e) { st = null; } }
    if (st && st.v === 1) {
      st = Object.assign(Coins.blank(), st);
      st.owned = st.owned || {};
      st.flags = st.flags || {};
    } else {
      st = Coins.blank();
      Coins.migrate(st);
      Coins.fresh = true;
    }
    Coins.state = st;
    Coins.shown = st.balance;
  }

  /** Players who already equipped tops before the coin system existed keep them (nobody loses what they use). */
  static migrate(st) {
    try {
      const raw = localStorage.getItem('citybloxx.store');
      if (!raw) return;
      const p = JSON.parse(raw);
      for (const k of Object.keys(p)) if (p[k] && p[k] !== 'default') st.owned[p[k]] = 1;
    } catch (e) { /* ignore */ }
  }

  static save() {
    try { localStorage.setItem(Coins.KEY, JSON.stringify(Coins.state)); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ queries */
  static balance() { return Coins.state.balance; }
  static owns(key) { return !!Coins.state.owned[key]; }
  static ownedCount() { return Object.keys(Coins.state.owned).length; }

  /** No coins while the city cheat is on (it would make the economy meaningless). */
  static enabled() {
    return !(typeof CityMode !== 'undefined' && CityMode.isCheatActive && CityMode.isCheatActive());
  }

  /* ------------------------------------------------------------------ earning */
  static startRound() {
    Coins.round = { earned: 0, landings: 0, perfects: 0, combo: 0, closed: false };
  }

  /**
   * Adds coins. opts: sx/sy = screen position the coins pop out of (omit for a silent count-up),
   * round:false = do not count towards the round summary, text:false = no "+N" popup.
   */
  static award(n, opts) {
    opts = opts || {};
    n = Math.floor(n);
    if (!(n > 0) || !Coins.enabled()) return 0;
    const st = Coins.state;
    st.balance += n;
    st.lifetime += n;
    if (opts.round !== false) Coins.round.earned += n;
    Coins.save();
    if (opts.sx !== undefined && Coins.hudVisible()) {
      Coins.spawnCoins(n, opts.sx, opts.sy);
      if (opts.text !== false) Coins.floatText('+' + n, opts.sx, opts.sy - 10, false);
    }
    return n;
  }

  /** Where the top floor is on screen (the popup origin for in-tower rewards). */
  static towerPos() {
    try {
      const s = House.topFloorSlot;
      return {
        x: House.centerX + ((((House.floorX[s] - House.camX) * 32)) >> 8),
        y: House.centerY - ((((House.floorY[s] - House.camY) * 32)) >> 8),
      };
    } catch (e) {
      return { x: GameMIDlet.screenWidth >> 1, y: GameMIDlet.screenHeight >> 1 };
    }
  }

  /** A block was placed on the tower (not tumbled). */
  static onLanding(perfect, isRoof) {
    if (!Coins.enabled()) return;
    const R = Coins.R, r = Coins.round, p = Coins.towerPos();
    r.landings++;
    if (perfect) {
      r.perfects++;
      Coins.flag('firstPerfect', R.FIRST_PERFECT, 'FIRST PERFECT!', 'Nice stacking');
    }
    Coins.award(perfect ? R.PERFECT : R.GOOD, { sx: p.x, sy: p.y });
    if (House.gameMode === House.GAME_MODE_QUICK) Coins.quickMilestones(House.blockCount);
    if (isRoof) Coins.onTowerComplete(p);
  }

  /** The combo meter paid out (called from House.cashInCombo). */
  static onCombo(count) {
    if (!Coins.enabled() || count < Coins.R.COMBO_MIN) return;
    const n = Math.min(count, Coins.R.COMBO_CAP), p = Coins.towerPos();
    Coins.round.combo += n;
    Coins.award(n, { sx: p.x, sy: p.y - 14 });
    if (count >= 5) Coins.flag('combo5', Coins.R.COMBO_5, 'COMBO x5!', 'On fire');
  }

  /** The roof landed: city-mode tower finished. */
  static onTowerComplete(p) {
    const R = Coins.R;
    const idx = Math.max(0, Math.min(4, House.towerType - 1));
    const roofBonus = House.landingQuality === 2;
    let n = R.TOWER_DONE[idx];
    if (roofBonus) n = Math.round(n * R.ROOF_BONUS_MULT);
    Coins.award(n, { sx: p.x, sy: p.y, text: false });
    Coins.banner({ title: roofBonus ? 'BONUS ROOF!' : 'TOWER COMPLETE', amount: n, sub: roofBonus ? 'x' + R.ROOF_BONUS_MULT + ' payout' : '' });
    Coins.flag('firstTower', R.FIRST_TOWER, 'FIRST TOWER!', 'Your city grows');
  }

  /** One-time rewards for reaching floor counts in quick mode. */
  static quickMilestones(blocks) {
    const m = Coins.R.QUICK_MILESTONES;
    for (const k of Object.keys(m)) {
      if (blocks >= Number(k)) Coins.flag('q' + k, m[k], k + ' FLOORS!', 'Quick mode');
    }
  }

  /** Called when the city level rises: pays every level once (existing saves get a one-time catch-up). */
  static onCityLevel(level) {
    const st = Coins.state;
    if (!Coins.enabled() || !(level > st.cityLevelPaid)) return;
    let sum = 0;
    const from = st.cityLevelPaid + 1;
    for (let l = from; l <= level; l++) sum += Coins.R.CITY_LEVEL_BASE + Coins.R.CITY_LEVEL_STEP * l;
    st.cityLevelPaid = level;
    Coins.award(sum, { round: false });
    Coins.banner({
      title: from < level ? 'CITY LEVELS ' + from + '-' + level : 'CITY LEVEL ' + level,
      amount: sum,
      sub: from < level && from === 1 ? 'Veteran bonus' : 'Your city grows',
    });
  }

  /** One-time reward by name. */
  static flag(name, amount, title, sub) {
    const st = Coins.state;
    if (st.flags[name] || !Coins.enabled()) return;
    st.flags[name] = 1;
    Coins.award(amount, {});
    Coins.banner({ title: title, amount: amount, sub: sub || '' });
  }

  /** End of a round: pays the quick-mode run bonus and returns the summary lines for the result prompt. */
  static finishRound(quick, blocks, prevBest) {
    const r = Coins.round, R = Coins.R;
    if (r.closed) return '';
    r.closed = true;
    let bonus = 0;
    if (quick && blocks >= 10) {
      bonus += Math.floor(blocks / 10) * R.QUICK_PER_10;
      if (blocks > prevBest) bonus += R.QUICK_RECORD;
    }
    if (bonus > 0) Coins.award(bonus, {});
    let out = '';
    if (r.earned > 0) out += '\nCoins: +' + r.earned;
    if (bonus > 0) out += '\nRun bonus: +' + bonus;
    return out;
  }

  /* ------------------------------------------------------------------ daily streak */
  static today() {
    const d = new Date(), p = (n) => (n < 10 ? '0' : '') + n;
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  static dayNum(s) {
    const a = s.split('-').map(Number);
    return Math.floor(Date.UTC(a[0], a[1] - 1, a[2]) / 86400000);
  }

  /** Welcome gift on first launch, then one bonus per calendar day; a missed day restarts the 7-day cycle. */
  static checkDaily() {
    const st = Coins.state, R = Coins.R, today = Coins.today();
    if (st.lastDay === today) return;
    if (st.lastDay === '') {
      st.lastDay = today; st.streak = 1;
      Coins.award(R.WELCOME, { round: false });
      Coins.banner({ title: 'WELCOME GIFT', amount: R.WELCOME, sub: 'Spend it in the Store' });
      return;
    }
    const diff = Coins.dayNum(today) - Coins.dayNum(st.lastDay);
    if (diff < 0) return;                               // clock moved backwards: no free coins
    st.streak = diff === 1 ? st.streak + 1 : 1;
    st.lastDay = today;
    const day = ((st.streak - 1) % 7) + 1, n = R.DAILY[day - 1];
    Coins.award(n, { round: false });
    Coins.banner({
      title: day === 7 ? 'WEEKLY JACKPOT' : 'DAILY BONUS',
      amount: n,
      sub: 'Day ' + day + '/7' + (day < 7 ? '  next +' + R.DAILY[day] : ''),
    });
  }

  /* ------------------------------------------------------------------ spending */
  /** Buys an item. Returns false (and charges nothing) if the player cannot afford it. */
  static buy(key, price) {
    const st = Coins.state;
    if (st.owned[key]) return true;
    if (st.balance < price) return false;
    st.balance -= price;
    st.spent += price;
    st.owned[key] = 1;
    Coins.save();
    return true;
  }

  static sfx(id) {
    try { if (House.soundPlayer) House.soundPlayer.play(id, 1); } catch (e) { /* audio is optional */ }
  }

  /* ------------------------------------------------------------------ effects */
  static spawnCoins(n, sx, sy) {
    const t = Coins.target;
    if (!t) return;
    const cnt = Math.min(6, n), base = Math.floor(n / cnt);
    for (let i = 0; i < cnt; i++) {
      Coins.fx.push({
        k: 'coin', t: 0, delay: i * 70, dur: 620 + i * 30,
        sx: sx + (i - (cnt - 1) / 2) * 5, sy: sy, tx: t.x, ty: t.y,
        val: base + (i === 0 ? n - base * cnt : 0), x: sx, y: sy,
      });
    }
  }
  static floatText(str, x, y, red) {
    Coins.fx.push({ k: 'text', t: 0, dur: 1000, x: x, y: y, str: str, red: !!red });
  }
  static sparkAt(x, y) { Coins.fx.push({ k: 'spark', t: 0, dur: 320, x: x, y: y }); }

  static banner(b) {
    b.t = 0; b.dur = 2800;
    Coins.banners.push(b);
  }

  static step(dt) {
    let inflight = 0;
    for (let i = Coins.fx.length - 1; i >= 0; i--) {
      const f = Coins.fx[i];
      f.t += dt;
      if (f.k === 'coin') {
        const p = (f.t - f.delay) / f.dur;
        if (p >= 1) {
          Coins.fx.splice(i, 1);
          Coins.pulse = 1;
          Coins.sparkAt(f.tx, f.ty);
          continue;
        }
        inflight += f.val;
        if (p > 0) {
          const e = p * p * (3 - 2 * p);
          f.x = f.sx + (f.tx - f.sx) * e;
          f.y = f.sy + (f.ty - f.sy) * e - 26 * Math.sin(Math.PI * p) * (1 - p * 0.4);
        }
      } else if (f.t >= f.dur) {
        Coins.fx.splice(i, 1);
      }
    }
    if (Coins.banners.length > 0) {
      const b = Coins.banners[0];
      b.t += dt;
      if (b.t >= b.dur) Coins.banners.shift();
    }
    if (Coins.pulse > 0) Coins.pulse = Math.max(0, Coins.pulse - dt / 480);
    // the HUD number counts up as coins land (not the moment they are earned)
    const target = Math.max(0, Coins.state.balance - inflight), d = target - Coins.shown;
    if (d > 0) Coins.shown = Math.min(target, Coins.shown + Math.max(1, Math.ceil(d * 0.25)));
    else if (d < 0) Coins.shown = Math.max(target, Coins.shown + Math.min(-1, Math.floor(d * 0.25)));
  }

  /** Called by GameMIDlet.paintCanvas after the current screen painted. */
  static paintOverlay(g) {
    const now = performance.now();
    let dt = now - Coins.last;
    Coins.last = now;
    if (!(dt >= 0)) dt = 16;
    Coins.step(Math.min(dt, 100));
    const active = Coins.fx.length > 0 || Coins.banners.length > 0;
    if (!active) {
      if (Coins.wasActive) { Storage.dirty = true; Coins.wasActive = false; }   // one last clean repaint of menus
      return;
    }
    Coins.wasActive = true;
    Storage.dirty = true;
    const w = GameMIDlet.screenWidth, h = GameMIDlet.screenHeight;
    g.setClip(0, 0, w, h);
    for (const f of Coins.fx) {
      if (f.k === 'coin') {
        if (f.t < f.delay) continue;
        Coins.paintCoin(g, Math.round(f.x) - 7, Math.round(f.y) - 7, Math.floor(f.t / 70) % 8);
      } else if (f.k === 'spark') {
        const idx = [0, 1, 2, 1, 0][Math.min(4, Math.floor((f.t / f.dur) * 5))];
        Coins.blit(g, Coins.img('images/ui/coin_sparkle.png'), idx * 9, 0, 9, 9, Math.round(f.x) - 4, Math.round(f.y) - 4);
      } else if (f.k === 'text') {
        const p = f.t / f.dur, a = p > 0.6 ? 1 - (p - 0.6) / 0.4 : 1;
        g.ctx.globalAlpha = Math.max(0, a);
        Coins.drawNum(g, f.str, Math.round(f.x - Coins.numWidth(f.str) / 2), Math.round(f.y - 18 * p), f.red);
        g.ctx.globalAlpha = 1;
      }
    }
    if (Coins.banners.length > 0) Coins.paintBanner(g, Coins.banners[0]);
  }

  /* ------------------------------------------------------------------ drawing helpers */
  static img(path) { return Assets.canvasOf(path); }

  /** Draws a sub-rectangle of a sprite sheet (respects the current clip, honours the sprite-smoothing toggle). */
  static blit(g, cv, sx, sy, sw, sh, dx, dy) {
    if (!cv) return;
    g.sync();
    const c = g.ctx;
    c.imageSmoothingEnabled = Graphics.smooth && g.s > 1;
    c.drawImage(cv, sx, sy, sw, sh, dx, dy, sw, sh);
  }

  static paintCoin(g, x, y, frame) { Coins.blit(g, Coins.img('images/ui/coin_sheet.png'), frame * 14, 0, 14, 14, x, y); }
  static paintCoinBig(g, x, y) { Coins.blit(g, Coins.img('images/ui/coin_big.png'), 0, 0, 22, 22, x, y); }
  static paintLock(g, x, y) { Coins.blit(g, Coins.img('images/ui/lock_icon.png'), 0, 0, 12, 14, x, y); }
  static paintSpark(g, x, y, idx) { Coins.blit(g, Coins.img('images/ui/coin_sparkle.png'), idx * 9, 0, 9, 9, x, y); }

  static numWidth(s) { return s.length * 6 + 1; }

  /** Bitmap numbers using the game's own digit sheets (white = digits_16 incl. + - / x, red = digits_17). */
  static drawNum(g, str, x, y, red) {
    const cv = Coins.img(red ? 'images/fonts/digits_17.png' : 'images/fonts/digits_16.png');
    if (!cv) return;
    const map = red ? '0123456789-' : '0123456789+-/x';
    for (let i = str.length - 1; i >= 0; i--) {          // right to left, like the game's own drawDigits
      const gi = map.indexOf(str.charAt(i));
      if (gi < 0) continue;
      Coins.blit(g, cv, gi * 7, 0, 7, 12, x + i * 6, y);
    }
  }

  /** Coin icon + balance. Remembers the icon centre as the target the flying coins aim for. */
  static paintBalance(g, x, y, rightAlign) {
    const txt = String(Math.max(0, Math.floor(Coins.shown)));
    const total = 14 + 3 + Coins.numWidth(txt);
    const left = rightAlign ? x - total : x;
    Coins.target = { x: left + 7, y: y + 7 };
    Coins.targetStamp = performance.now();
    const frame = Coins.pulse > 0 ? Math.floor((1 - Coins.pulse) * 8) % 8 : 0;
    const bump = Coins.pulse > 0.55 ? -1 : 0;
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);   // earlier HUD code leaves arbitrary clips behind
    Coins.paintCoin(g, left, y + bump, frame);
    Coins.drawNum(g, txt, left + 17, y + 1 + bump, false);
  }

  static hudVisible() { return Coins.target != null && (performance.now() - Coins.targetStamp) < 400; }

  /** In-game HUD (tower view: top-left; city view: right under the top bar). */
  static paintHud(g, city) {
    if (city) Coins.paintBalance(g, GameMIDlet.screenWidth - 6, 59, true);
    else Coins.paintBalance(g, 6, 4, false);
  }

  static outText(g, s, x, y, color, anchor) {
    g.setColor(0x481C00);
    g.drawString(s, x - 1, y, anchor); g.drawString(s, x + 1, y, anchor);
    g.drawString(s, x, y - 1, anchor); g.drawString(s, x, y + 1, anchor);
    g.setColor(color);
    g.drawString(s, x, y, anchor);
  }

  static paintBanner(g, b) {
    const W = GameMIDlet.screenWidth, w = Math.min(W - 12, 228), h = 36, x = (W - w) >> 1;
    const IN = 280, OUT = 280;
    let e = 1;
    if (b.t < IN) { const p = b.t / IN; e = 1 - (1 - p) * (1 - p); }
    else if (b.t > b.dur - OUT) { const p = (b.dur - b.t) / OUT; e = p * p; }
    const y = Math.round(-h - 2 + (h + 2 + 8) * e);
    g.setClip(0, 0, W, GameMIDlet.screenHeight);
    g.setColor(0x481C00); g.fillRect(x, y, w, h);
    g.setColor(0xFFB400); g.fillRect(x + 1, y + 1, w - 2, h - 2);
    g.setColor(0x481C00); g.fillRect(x + 2, y + 2, w - 4, h - 4);
    g.setColor(0x6B2E0A); g.fillRect(x + 3, y + 3, w - 6, h - 6);
    g.setColor(0x8A431A); g.fillRect(x + 3, y + 3, w - 6, 2);
    Coins.paintCoinBig(g, x + 7, y + 7);
    const tw = Math.floor(b.t / 140) % 6;
    if (tw < 3) Coins.paintSpark(g, x + 24 - tw * 2, y + 4 + tw, [0, 1, 2][tw]);
    g.setFont(Coins.fontBold());
    Coins.outText(g, b.title, x + 36, y + 4, 0xFFE060, Graphics.TOP | Graphics.LEFT);
    Coins.drawNum(g, '+' + b.amount, x + 36, y + 20, false);
    if (b.sub) {
      g.setFont(Coins.fontSmall());
      Coins.outText(g, b.sub, x + w - 7, y + 20, 0xFFE0A1, Graphics.TOP | Graphics.RIGHT);
    }
  }

  static fontBold() { return Font.getFont(0, Font.STYLE_BOLD, Font.SIZE_SMALL); }
  static fontSmall() { return Font.getFont(0, Font.STYLE_PLAIN, Font.SIZE_SMALL); }
}

/* ---- tuning table. Prices live in CustomTops.CATALOG; reasoning for all of it is in COINS_DESIGN.md ---- */
Coins.KEY = 'citybloxx.coins';
Coins.R = {
  GOOD: 1,                      // block placed without tumbling
  PERFECT: 2,                   // |offset| < 25: twice the pay, and it feeds the combo
  COMBO_MIN: 3,                 // combo payout starts at x3 ...
  COMBO_CAP: 10,                // ... pays the combo count, capped
  TOWER_DONE: [10, 20, 35, 50, 75],   // finished city tower: blue, red, green, yellow, pink
  ROOF_BONUS_MULT: 1.5,         // bonus roof landing
  QUICK_PER_10: 2,              // quick mode: per 10 floors on game over
  QUICK_RECORD: 25,             // quick mode: new floor record
  QUICK_MILESTONES: { 25: 30, 50: 75, 100: 200, 150: 300 },   // one-time
  FIRST_PERFECT: 10,
  FIRST_TOWER: 50,
  COMBO_5: 20,
  CITY_LEVEL_BASE: 15,          // city level L pays 15 + 5*L, once
  CITY_LEVEL_STEP: 5,
  WELCOME: 100,                 // first launch: enough for a first purchase after one short round
  DAILY: [20, 30, 40, 60, 80, 100, 200],   // 7-day streak, day 7 is the jackpot
};
Coins.fx = [];
Coins.banners = [];
Coins.round = { earned: 0, landings: 0, perfects: 0, combo: 0, closed: true };
Coins.target = null;
Coins.targetStamp = 0;
Coins.pulse = 0;
Coins.shown = 0;
Coins.last = 0;
Coins.wasActive = false;
Coins.fresh = false;
Coins.state = null;
Coins.$clinit = function () { Coins.load(); };
