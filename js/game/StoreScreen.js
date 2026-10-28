/* Store: unlock tower tops with coins, then equip one per tower colour.
   Unlocks are global (buy once, use on any tower). Order = price ladder (cheapest first).
   Buying is a deliberate two-step: first press arms it, second press pays - and a model that fails to load is never charged. */
class StoreScreen {
  onEnter() {
    this.leaving = false;
    CustomTops.rescan();
    this.options = CustomTops.options();
    this.selectSlot(this.slot);
    this.toast = null;
    this.armKey = null;
    this.armTime = 0;
    this.burst = 0;
    this.shake = 0;
    this.canvas.removeCommand(new Command("", Command.OK, 1));
    this.canvas.removeCommand(new Command("", Command.EXIT, 1));
    this.canvas.setCommand(this.equipCommand, null);
    this.canvas.setCommand(this.backCommand, null);
    Storage.dirty = true;
  }
  onModeChange() {
  }
  cur() {
    return this.options.get(this.index);
  }
  disarm() {
    this.armKey = null;
    this.armTime = 0;
  }
  selectSlot(s) {
    this.slot = (((s + CustomTops.NAMES.length)) % CustomTops.NAMES.length);
    let cur = CustomTops.getAssigned(this.slot);
    this.index = 0;
    for (let i = 0; i < this.options.size(); i++) {
      if (this.options.get(i).key() === cur.key()) {
        this.index = i;
      }
    }
    this.disarm();
  }
  step(d) {
    const n = this.options.size();
    this.index = (((this.index + d) % n) + n) % n;
    this.disarm();
  }
  /** Enter / tap on the preview: equip what you own, buy what you can afford (after a confirming second press). */
  equip() {
    let o = this.cur();
    if (!CustomTops.owned(o)) {
      this.tryBuy(o);
      return;
    }
    if (CustomTops.meshFor(this.slot, o) == null) {
      this.say(("Could not load " + o.label));
      return;
    }
    CustomTops.assign(this.slot, o);
    this.say(((CustomTops.NAMES[this.slot] + " tower: ") + o.label));
  }
  tryBuy(o) {
    const bal = Coins.balance();
    if (bal < o.price) {
      this.say("Need " + (o.price - bal) + " more coins");
      this.shake = 380;
      this.disarm();
      Coins.sfx(House.SFX_MISS_DROP);
      return;
    }
    if (this.armKey !== o.key()) {          // first press: arm
      this.armKey = o.key();
      this.armTime = 4000;
      return;
    }
    if (CustomTops.meshFor(this.slot, o) == null) {   // never charge for a broken model
      this.say("Could not load " + o.label);
      this.disarm();
      return;
    }
    if (!Coins.buy(o.key(), o.price)) {
      this.disarm();
      return;
    }
    CustomTops.assign(this.slot, o);        // auto-equip on the selected tower: instant payoff
    this.disarm();
    this.burst = 1000;
    this.say("Unlocked " + o.label + "!");
    Coins.floatText("-" + o.price, GameMIDlet.screenWidth - 36, 30, true);
    Coins.sfx(House.SFX_PERFECT_DROP);
  }
  say(t) {
    this.toast = t;
    this.toastTime = 2.2;
  }
  leave() {
    if (this.leaving) {
      return;
    }
    this.leaving = true;
    this.canvas.removeCommand(this.equipCommand);
    this.canvas.removeCommand(this.backCommand);
    this.menu.returnFromStore();
  }
  commandAction(command) {
    if ((command === this.equipCommand) || (command.getCommandType() === Command.OK)) {
      this.equip();
    } else {
      this.leave();
    }
  }
  keyPressed(keyCode, gameAction) {
    if (this.options == null) {
      return;
    }
    if (((keyCode === -1) || (keyCode === 50)) || (gameAction === 1)) {
      this.step(-1);
    } else if (((keyCode === -2) || (keyCode === 56)) || (gameAction === 6)) {
      this.step(1);
    } else if (((keyCode === -3) || (keyCode === 52)) || (gameAction === 2)) {
      this.selectSlot((this.slot - 1));
    } else if (((keyCode === -4) || (keyCode === 54)) || (gameAction === 5)) {
      this.selectSlot((this.slot + 1));
    } else if (((keyCode === -5) || (keyCode === 53)) || (gameAction === 8)) {
      this.equip();
    } else if (keyCode === 48) {
      CustomTops.reloadAll();
      this.options = CustomTops.options();
      this.selectSlot(this.slot);
      this.say(((("Reloaded " + ((this.options.size() - 2))) + " custom model(s)")));
    }
  }
  pointerPressed(px, py) {
    if (this.options == null) return;
    const w = GameMIDlet.screenWidth;
    if (py >= 26 && py < 64) {                       // tower chips
      const chipW = 42, gap = 3, cnt = CustomTops.NAMES.length;
      const x0 = ((w - (cnt * chipW + (cnt - 1) * gap)) / 2) | 0;
      const i = Math.floor((px - x0) / (chipW + gap));
      if (i >= 0 && i < cnt) this.selectSlot(i);
    } else if (py >= 66 && py < 230) {               // preview: left = previous, right = next, middle = equip / buy
      if (px < w / 3) this.step(-1);
      else if (px > w * 2 / 3) this.step(1);
      else this.equip();
    } else if (py >= 230 && py < 270) {              // label row: < >
      this.step(px < w / 2 ? -1 : 1);
    }
  }
  update(delta, time) {
    let dt = (delta / 1000);
    this.angle += (dt * 0.18);
    if (this.angle > 1) {
      this.angle -= 1;
    }
    this.clock += dt;
    if (this.toastTime > 0) {
      this.toastTime -= dt;
    }
    if (this.armTime > 0) {
      this.armTime -= delta;
      if (this.armTime <= 0) this.disarm();
    }
    if (this.burst > 0) this.burst -= delta;
    if (this.shake > 0) this.shake -= delta;
  }
  paint(g, fullRedraw) {
    let w = GameMIDlet.screenWidth, h = GameMIDlet.screenHeight;
    g.setClip(0, 0, w, h);
    for (let y = 0; y < h; y += 4) {
      let t = ((Math.imul(y, 255) / h) | 0);
      g.setColor((18 + ((t / 12) | 0)), (24 + ((t / 8) | 0)), (52 + ((t / 5) | 0)));
      g.fillRect(0, y, w, 4);
    }
    const opt = this.cur();
    const owned = CustomTops.owned(opt);
    const bal = Coins.balance();
    const affordable = bal >= opt.price;
    const equipped = (CustomTops.getAssigned(this.slot).key() === opt.key());
    const armed = (this.armKey === opt.key());
    const blink = (((this.clock * 3) | 0) % 2) === 0;
    // keep the left soft key honest
    this.equipCommand.label = owned ? "Equip" : (armed ? "Confirm" : (affordable ? "Buy" : "Locked"));

    // ---- header: collection progress (left), title, coin balance (right)
    g.setFont(this.titleFont);
    this.drawShadow(g, "STORE", ((w / 2) | 0), 6, 16777215);
    g.setFont(this.smallFont);
    Coins.paintLock(g, 7, 5);
    this.drawShadowAt(g, CustomTops.ownedCount() + "/" + CustomTops.paidCount(), 22, 8, 13160680, Graphics.TOP | Graphics.LEFT);
    Coins.paintBalance(g, w - 6, 5, true);

    // ---- tower chips
    let chipW = 42, gap = 3;
    let x0 = ((((w - ((Math.imul(CustomTops.NAMES.length, chipW) + Math.imul(((CustomTops.NAMES.length - 1)), gap))))) / 2) | 0);
    g.setFont(this.smallFont);
    for (let i = 0; i < CustomTops.NAMES.length; i++) {
      let x = (x0 + Math.imul(i, ((chipW + gap))));
      let sel = (i === this.slot);
      let y = (sel ? 30 : 34);
      let hh = (sel ? 28 : 24);
      g.setColor((sel ? 16777215 : 0));
      g.fillRect((x - 2), (y - 2), (chipW + 4), (hh + 4));
      g.setColor(CustomTops.COLORS[i]);
      g.fillRect(x, y, chipW, hh);
      let custom = (CustomTops.getAssigned(i).kind !== CustomTops.KIND_DEFAULT);
      g.setColor(0);
      g.drawString(CustomTops.NAMES[i], (x + ((chipW / 2) | 0)), (y + 3), (Graphics.TOP | Graphics.HCENTER));
      if (custom) {
        g.setColor(16777215);
        g.fillRect(((x + ((chipW / 2) | 0)) - 5), ((y + hh) - 9), 10, 5);
        g.setColor(0);
        g.drawRect(((x + ((chipW / 2) | 0)) - 5), ((y + hh) - 9), 9, 4);
      }
    }

    // ---- preview panel
    let py = 66, ph = 164;
    const tierCol = CustomTops.TIER_COLORS[opt.tier];
    g.setColor(725024);
    g.fillRect(8, py, (w - 16), ph);
    const flash = (this.burst > 0 && (((this.burst / 90) | 0) % 2) === 0);
    g.setColor(flash ? 16777215 : CustomTops.COLORS[this.slot]);
    g.drawRect(8, py, (w - 17), (ph - 1));
    g.drawRect(9, (py + 1), (w - 19), (ph - 3));
    let mesh = CustomTops.meshFor(this.slot, opt);
    if (mesh != null) {
      let b = mesh.bounds();
      let extent = Math.max((b[4] - b[1]), (1.15 * Math.max((b[3] - b[0]), (b[5] - b[2]))));
      let camZ = Math.max(500.0, ((2.2 * extent) + 100.0));
      let centerY = (((b[1] + b[4])) / 2);
      Renderer3D.setFov(45.0);
      Renderer3D.lookAt(0.0, 0.0, camZ, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0);
      Renderer3D.beginFrame(g);
      g.setClip(10, (py + 2), (w - 20), (ph - 4));
      mesh.resetTransform();
      mesh.translate(0.0, (((-centerY) + ((12.0 * camZ) / 250.0)) + ((Math.sin((this.clock * 2.2)) * 0.05) * extent)), 0.0);
      mesh.rotate(this.angle, 0.0, 1.0, 0.0);
      mesh.render();
      Renderer3D.endFrame();
      g.setClip(0, 0, w, h);
    } else {
      g.setColor(16777215);
      g.setFont(this.bodyFont);
      g.drawString("Model failed to load", ((w / 2) | 0), (py + ((ph / 2) | 0)), (Graphics.HCENTER | Graphics.VCENTER));
    }
    g.setClip(0, 0, w, h);
    g.setColor(0xFFFFFF);
    for (let k = 0; k < 2; k++) {
      let ax = k === 0 ? 16 : w - 16, ay = py + ((ph / 2) | 0);
      for (let r = 0; r < 6; r++) g.fillRect(k === 0 ? ax + r : ax - r, ay - r - 1, 1, 2 * r + 2);
    }
    // rarity tag (top-left) + lock / owned mark (top-right)
    g.setFont(this.tagFont);
    this.drawShadowAt(g, CustomTops.TIER_NAMES[opt.tier], 15, py + 6, tierCol, Graphics.TOP | Graphics.LEFT);
    if (!owned) {
      Coins.paintLock(g, w - 26, py + 5);
    } else if (opt.price > 0) {
      this.drawShadowAt(g, "OWNED", w - 15, py + 6, 8191100, Graphics.TOP | Graphics.RIGHT);
    }
    // legendary tops twinkle
    if (opt.tier === 4) {
      const sp = [[22, 40], [w - 30, 58], [34, ph - 50], [w - 44, ph - 62]];
      for (let k = 0; k < sp.length; k++) {
        const ph2 = (this.clock * 2.4 + k * 0.9) % 3;
        if (ph2 < 1.2) Coins.paintSpark(g, sp[k][0], py + sp[k][1], [0, 1, 2, 1, 0][Math.min(4, (ph2 / 1.2 * 5) | 0)]);
      }
    }
    // price strip (locked tops only): red digits when you cannot afford it yet
    if (!owned) {
      const sy = py + ph - 24, sh = 18, off = this.shake > 0 ? ((((this.shake / 45) | 0) % 2) === 0 ? 3 : -3) : 0;
      g.ctx.globalAlpha = 0.62;
      g.setColor(0);
      g.fillRect(12, sy, w - 24, sh);
      g.ctx.globalAlpha = 1;
      const txt = String(opt.price), tw = 14 + 4 + Coins.numWidth(txt), sx = (((w - tw) / 2) | 0) + off;
      Coins.paintCoin(g, sx, sy + 2, affordable ? (((this.clock * 9) | 0) % 8) : 0);
      Coins.drawNum(g, txt, sx + 18, sy + 3, !affordable);
    }
    // purchase burst
    if (this.burst > 0) {
      const p = 1 - this.burst / 1000, cx = (w / 2) | 0, cy = py + ((ph / 2) | 0);
      for (let k = 0; k < 12; k++) {
        const a = k * Math.PI / 6 + p, r = 18 + p * 70 + (k % 2) * 14;
        Coins.paintSpark(g, (cx + Math.cos(a) * r) | 0, (cy + Math.sin(a) * r * 0.85) | 0, [0, 1, 2, 2, 1, 0][Math.min(5, (p * 6) | 0)]);
      }
    }
    if ((this.toast != null) && (this.toastTime > 0)) {
      g.setFont(this.bodyFont);
      let tw = (this.bodyFont.stringWidth(this.toast) + 16);
      g.setColor(0);
      g.fillRect(((((w - tw)) / 2) | 0), (py + 26), tw, (this.bodyFont.getHeight() + 6));
      this.drawShadow(g, this.toast, ((w / 2) | 0), (py + 29), 16769126);
    }

    // ---- below the panel: name, status, call to action, goal bar, key hints
    g.setFont(this.bodyFont);
    this.drawShadow(g, ((("< " + opt.label) + " >")), ((w / 2) | 0), ((py + ph) + 3), (equipped ? 8191100 : (owned ? 16777215 : 12105936)));
    g.setFont(this.smallFont);
    const state = equipped ? "   EQUIPPED" : (owned ? "   OWNED" : "   LOCKED");
    this.drawShadow(g, (((((this.index + 1)) + " / ") + this.options.size()) + state), ((w / 2) | 0), (((py + ph) + 3) + this.bodyFont.getHeight()), 13160680);

    let cta, ctaCol;
    const goal = owned ? CustomTops.nextGoal() : opt;
    if (!owned) {
      if (armed) { cta = "Tap / Enter again to CONFIRM"; ctaCol = blink ? 16750656 : 16777215; }
      else if (affordable) { cta = "Tap / Enter = BUY"; ctaCol = blink ? 16769126 : 16777215; }
      else { cta = "Need " + (opt.price - bal) + " more coins"; ctaCol = 16746632; }
    } else if (goal != null) {
      cta = "Next: " + goal.label + " - " + Math.max(0, goal.price - bal) + " more";
      ctaCol = 10135240;
    } else {
      cta = "Collection complete!";
      ctaCol = 16769126;
    }
    const ty = ((py + ph) + 3) + this.bodyFont.getHeight() + this.smallFont.getHeight() + 1;
    this.drawShadow(g, cta, ((w / 2) | 0), ty, ctaCol);
    if (goal != null && goal.price > 0) {      // goal-gradient bar toward the item in focus
      const bw = 150, bx = ((w - bw) / 2) | 0, by = ty + this.smallFont.getHeight() + 2;
      const frac = Math.max(0, Math.min(1, bal / goal.price));
      g.setColor(0x481C00);
      g.fillRect(bx, by, bw, 7);
      g.setColor(0x2A1A10);
      g.fillRect(bx + 1, by + 1, bw - 2, 5);
      const fw = Math.round((bw - 2) * frac);
      if (fw > 0) {
        g.setColor(frac >= 1 && blink ? 0xFFFF00 : 0xFFB400);
        g.fillRect(bx + 1, by + 1, fw, 5);
        g.setColor(0xFFE0A1);
        g.fillRect(bx + 1, by + 1, fw, 1);
      }
    }
    g.setFont(this.smallFont);
    this.drawShadow(g, "\u2190\u2192 tower  \u2191\u2193 top", ((w / 2) | 0), ty + this.smallFont.getHeight() + 12, 8421536);
  }
  drawShadow(g, s, cx, y, color) {
    this.drawShadowAt(g, s, cx, y, color, (Graphics.TOP | Graphics.HCENTER));
  }
  drawShadowAt(g, s, x, y, color, anchor) {
    g.setColor(0);
    g.drawString(s, (x + 1), (y + 1), anchor);
    g.setColor(color);
    g.drawString(s, x, y, anchor);
  }
  constructor(menu, canvas) {
    this.canvas = null;
    this.menu = null;
    this.equipCommand = new Command("Equip", Command.OK, 1);
    this.backCommand = new Command("Back", Command.BACK, 1);
    this.options = null;
    this.slot = 0;
    this.index = 0;
    this.angle = 0;
    this.clock = 0;
    this.toast = null;
    this.toastTime = 0;
    this.leaving = false;
    this.armKey = null;
    this.armTime = 0;
    this.burst = 0;
    this.shake = 0;
    this.titleFont = Font.getFont(0, Font.STYLE_BOLD, Font.SIZE_LARGE);
    this.bodyFont = Font.getFont(0, Font.STYLE_BOLD, Font.SIZE_MEDIUM);
    this.smallFont = Font.getFont(0, Font.STYLE_PLAIN, Font.SIZE_SMALL);
    this.tagFont = Font.getFont(0, Font.STYLE_BOLD, Font.SIZE_SMALL);
    this.menu = menu;
    this.canvas = canvas;
  }
}

StoreScreen.$clinit = function () {

};
