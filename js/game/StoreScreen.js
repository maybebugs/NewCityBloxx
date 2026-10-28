class StoreScreen {
  onEnter() {
    this.leaving = false;
    CustomTops.rescan();
    this.options = CustomTops.options();
    this.selectSlot(this.slot);
    this.toast = null;
    this.canvas.removeCommand(new Command("", Command.OK, 1));
    this.canvas.removeCommand(new Command("", Command.EXIT, 1));
    this.canvas.setCommand(this.equipCommand, null);
    this.canvas.setCommand(this.backCommand, null);
    Storage.dirty = true;
  }
  onModeChange() {
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
  }
  equip() {
    let o = this.options.get(this.index);
    if (CustomTops.meshFor(this.slot, o) == null) {
      this.say(("Could not load " + o.label));
      return;
    }
    CustomTops.assign(this.slot, o);
    this.say(((CustomTops.NAMES[this.slot] + " tower: ") + o.label));
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
      this.index = ((((this.index - 1) + this.options.size())) % this.options.size());
    } else if (((keyCode === -2) || (keyCode === 56)) || (gameAction === 6)) {
      this.index = (((this.index + 1)) % this.options.size());
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
      this.say((("Reloaded " + ((this.options.size() - 2))) + " custom model(s)"));
    }
  }
  pointerPressed(px, py) {
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
  }
  paint(g, fullRedraw) {
    let w = GameMIDlet.screenWidth, h = GameMIDlet.screenHeight;
    g.setClip(0, 0, w, h);
    for (let y = 0; y < h; y += 4) {
      let t = ((Math.imul(y, 255) / h) | 0);
      g.setColor((18 + ((t / 12) | 0)), (24 + ((t / 8) | 0)), (52 + ((t / 5) | 0)));
      g.fillRect(0, y, w, 4);
    }
    g.setFont(this.titleFont);
    this.drawShadow(g, "STORE", ((w / 2) | 0), 6, 16777215);
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
    let py = 66, ph = 164;
    g.setColor(725024);
    g.fillRect(8, py, (w - 16), ph);
    g.setColor(CustomTops.COLORS[this.slot]);
    g.drawRect(8, py, (w - 17), (ph - 1));
    g.drawRect(9, (py + 1), (w - 19), (ph - 3));
    let opt = this.options.get(this.index);
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
      let ax = k === 0 ? 16 : w - 16, dir = k === 0 ? -1 : 1, ay = py + ((ph / 2) | 0);
      for (let r = 0; r < 6; r++) g.fillRect(k === 0 ? ax + r : ax - r, ay - r - 1, 1, 2 * r + 2);
    }
    let equipped = (CustomTops.getAssigned(this.slot).key() === opt.key());
    g.setFont(this.bodyFont);
    this.drawShadow(g, (("< " + opt.label) + " >"), ((w / 2) | 0), ((py + ph) + 4), (equipped ? 8191100 : 16777215));
    g.setFont(this.smallFont);
    this.drawShadow(g, (((((this.index + 1)) + " / ") + this.options.size()) + ((equipped ? "   EQUIPPED" : ""))), ((w / 2) | 0), (((py + ph) + 4) + this.bodyFont.getHeight()), 13160680);
    let ty = ((((py + ph) + 6) + this.bodyFont.getHeight()) + this.smallFont.getHeight());
    this.drawShadow(g, "Left/Right: tower   Up/Down: top", ((w / 2) | 0), ty, 10135240);
    this.drawShadow(g, "Enter: equip   0: reload models", ((w / 2) | 0), ((ty + this.smallFont.getHeight()) - 1), 10135240);
    if ((this.toast != null) && (this.toastTime > 0)) {
      g.setFont(this.bodyFont);
      let tw = (this.bodyFont.stringWidth(this.toast) + 16);
      g.setColor(0);
      g.fillRect(((((w - tw)) / 2) | 0), (py + 8), tw, (this.bodyFont.getHeight() + 6));
      this.drawShadow(g, this.toast, ((w / 2) | 0), (py + 11), 16769126);
    }
  }
  drawShadow(g, s, cx, y, color) {
    g.setColor(0);
    g.drawString(s, (cx + 1), (y + 1), (Graphics.TOP | Graphics.HCENTER));
    g.setColor(color);
    g.drawString(s, cx, y, (Graphics.TOP | Graphics.HCENTER));
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
    this.titleFont = Font.getFont(0, Font.STYLE_BOLD, Font.SIZE_LARGE);
    this.bodyFont = Font.getFont(0, Font.STYLE_BOLD, Font.SIZE_MEDIUM);
    this.smallFont = Font.getFont(0, Font.STYLE_PLAIN, Font.SIZE_SMALL);
    this.menu = menu;
    this.canvas = canvas;
  }
}

StoreScreen.$clinit = function () {

};
