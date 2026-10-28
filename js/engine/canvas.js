/* MIDP-like application shell for the browser: Canvas (240x320 logical screen), Display, Form, Command, MIDlet, RecordStore. */
'use strict';

class Displayable {}

class Command {
  constructor(label, type, priority) { this.label = label == null ? '' : label; this.type = type; this.priority = priority; }
  getLabel() { return this.label; }
  getCommandType() { return this.type; }
  getPriority() { return this.priority; }
}
Command.SCREEN = 1; Command.BACK = 2; Command.CANCEL = 3; Command.OK = 4; Command.HELP = 5; Command.STOP = 6; Command.EXIT = 7; Command.ITEM = 8;

class TextField {
  constructor(label, text, maxSize, constraints) {
    this.maxSize = maxSize;
    this.text = (text == null ? '' : text).substring(0, maxSize);
    this.caret = this.text.length;
  }
  getString() { return this.text; }
  setString(s) { this.text = (s == null ? '' : s).substring(0, this.maxSize); this.caret = this.text.length; }
  getCaretPosition() { return this.caret; }
  size() { return this.text.length; }
  getMaxSize() { return this.maxSize; }
  delete(offset, length) {
    if (offset >= 0 && offset + length <= this.text.length) this.text = this.text.substring(0, offset) + this.text.substring(offset + length);
    if (this.caret > this.text.length) this.caret = this.text.length;
  }
}

class Form extends Displayable {
  constructor(title) { super(); this.title = title == null ? '' : title; this.commands = []; this.field = null; this.listener = null; }
  append(f) { this.field = f; return 0; }
  addCommand(c) { this.commands.push(c); }
  setCommandListener(l) { this.listener = l; }
}

class RecordStoreException extends Error {}

class RecordStore {
  static key(name) { return 'citybloxx.rms.' + name.replace(/[^A-Za-z0-9_.-]/g, '_'); }
  static read(name) {
    try {
      const s = localStorage.getItem(RecordStore.key(name));
      if (s !== null) {
        const bin = atob(s); const u = new Int8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        return u;
      }
    } catch (e) { /* storage unavailable: fall through to memory */ }
    return RecordStore.mem.get(name) || null;
  }
  static openRecordStore(name, create) {
    const data = RecordStore.read(name);
    if (data === null && !create) throw new RecordStoreException('not found: ' + name);
    return new RecordStore(name, data);
  }
  constructor(name, data) { this.name = name; this.data = data; }
  getNumRecords() { return this.data === null ? 0 : 1; }
  getRecord(id) {
    if (this.data === null) throw new RecordStoreException('empty');
    return this.data.slice();
  }
  addRecord(d, off, len) { this.setRecord(1, d, off, len); return 1; }
  setRecord(id, d, off, len) {
    const c = new Int8Array(len);
    for (let i = 0; i < len; i++) c[i] = d[off + i];
    this.data = c;
    RecordStore.mem.set(this.name, c);
    try {
      let s = '';
      for (let i = 0; i < c.length; i += 4096) s += String.fromCharCode.apply(null, Array.from(c.subarray(i, i + 4096), (v) => v & 255));
      localStorage.setItem(RecordStore.key(this.name), btoa(s));
    } catch (e) { /* keep the in-memory copy only */ }
  }
  closeRecordStore() {}
}
RecordStore.mem = new Map();

class MIDlet {
  getAppProperty(key) { return MIDlet.PROPS[key] === undefined ? null : MIDlet.PROPS[key]; }
  notifyDestroyed() { Display.shutdown(); }
  startFromLauncher() { this.startApp(); }
  destroyFromLauncher() { this.destroyApp(true); }
}
MIDlet.PROPS = { 'DChoc-Rain-Probability': '20', 'DChoc-Rain-Duration': '60', 'DChoc-Snow-Probability': '30', 'DChoc-Snow-Duration': '50' };

class Canvas extends Displayable {
  constructor() {
    super();
    this.visible = document.getElementById('screen');
    this.S = 0;
    this.screen = null; this.sctx = null;
    this.setScale(this.wantedScale());
    this.vctx = this.visible.getContext('2d', { alpha: false });
    this.repaintRequested = true;
    this.down = new Set();
    this.closeHandler = null;
    this.active = false;
    Canvas.current = this;
    this.installInput();
  }

  static LOGICAL_W = 240;
  static LOGICAL_H = 320;
  static MAX_3D_SCALE = Number(new URLSearchParams(location.search).get('q3d')) || 2;

  setCloseHandler(r) { this.closeHandler = r; }

  installInput() {
    if (Canvas.inputInstalled) return;
    Canvas.inputInstalled = true;
    const self = () => Canvas.current;
    window.addEventListener('keydown', (e) => {
      if (Display.formOpen || e.ctrlKey || e.metaKey || e.altKey) return;
      const code = Canvas.mapKey(e);
      if (code === 0) return;
      e.preventDefault();
      Display.audioUnlock();
      const c = self();
      if (e.repeat || c.down.has(e.code)) { c.down.add(e.code); c.safe(() => c.keyRepeated(code)); return; }
      c.down.add(e.code);
      c.safe(() => c.keyPressed(code));
    });
    window.addEventListener('keyup', (e) => {
      if (Display.formOpen) return;
      const code = Canvas.mapKey(e);
      const c = self();
      c.down.delete(e.code);
      if (code !== 0) { e.preventDefault(); c.safe(() => c.keyReleased(code)); }
    });
    window.addEventListener('blur', () => { const c = self(); for (const k of c.down) { /* release held keys */ } c.down.clear(); });
    const vis = this.visible;
    const toLogical = (e) => {
      const r = vis.getBoundingClientRect();
      return [Math.floor((e.clientX - r.left) * Canvas.LOGICAL_W / r.width), Math.floor((e.clientY - r.top) * Canvas.LOGICAL_H / r.height)];
    };
    vis.addEventListener('pointerdown', (e) => {
      if (Display.formOpen) return;
      e.preventDefault(); Display.audioUnlock();
      const [x, y] = toLogical(e);
      if (x >= 0 && x < Canvas.LOGICAL_W && y >= 0 && y < Canvas.LOGICAL_H) { const c = self(); c.safe(() => c.pointerPressed(x, y)); }
    });
    vis.addEventListener('pointerup', (e) => {
      if (Display.formOpen) return;
      const [x, y] = toLogical(e); const c = self(); c.safe(() => c.pointerReleased(x, y));
    });
    vis.addEventListener('wheel', (e) => {
      e.preventDefault();
      const c = self();
      const code = e.deltaY < 0 ? -1 : -2;
      c.safe(() => c.keyPressed(code)); setTimeout(() => c.safe(() => c.keyReleased(code)), 120);
    }, { passive: false });
    document.addEventListener('visibilitychange', () => {
      const c = self();
      if (!c.active) return;
      if (document.hidden) c.unfocus(); else c.focus();
    });
    window.addEventListener('resize', () => { Canvas.current && Canvas.current.present(); });
  }

  safe(fn) { try { fn(); } catch (e) { console.error(e); } }

  static mapKey(e) {
    switch (e.code) {
      case 'ArrowUp': return -1;
      case 'ArrowDown': return -2;
      case 'ArrowLeft': return -3;
      case 'ArrowRight': return -4;
      case 'Enter': case 'NumpadEnter': case 'Space': return -5;
      case 'F1': return -6;
      case 'F2': case 'Escape': return -7;
      case 'Backspace': case 'Delete': return -8;
      case 'KeyW': return 50;
      case 'KeyA': return 52;
      case 'KeyS': return 56;
      case 'KeyD': return 54;
      case 'KeyQ': return 100;   // camera yaw left
      case 'KeyE': return 101;   // camera yaw right
      case 'KeyZ': return 102;   // camera pitch down
      case 'KeyX': return 103;   // camera pitch up
      case 'KeyC': return 104;   // toggle free camera
      case 'NumpadMultiply': return 42;
      default: break;
    }
    if (/^Digit[0-9]$/.test(e.code)) return 48 + (e.code.charCodeAt(5) - 48);
    if (/^Numpad[0-9]$/.test(e.code)) return 48 + (e.code.charCodeAt(6) - 48);
    if (e.key === '*') return 42;
    if (e.key === '#') return 35;
    return 0;
  }

  focus() { this.active = true; Canvas.current = this; this.showNotify(); }
  unfocus() { this.hideNotify(); }

  getWidth() { return Canvas.LOGICAL_W; }
  getHeight() { return Canvas.LOGICAL_H; }

  getGameAction(k) {
    switch (k) {
      case -1: case 50: return 1;
      case -2: case 56: return 6;
      case -3: case 52: return 2;
      case -4: case 54: return 5;
      case -5: case 53: return 8;
      case 49: return 9;
      case 51: return 10;
      case 55: return 11;
      case 57: return 12;
      default: return 0;
    }
  }

  getKeyName(k) {
    // Texts say "press key %U": show the keys that actually work in the browser.
    switch (k) {
      case 53: return 'Space';
      case 50: return '\u2191';
      case 56: return '\u2193';
      case 52: return '\u2190';
      case 54: return '\u2192';
      case -6: return 'F1';
      case -7: return 'Esc';
      default: break;
    }
    if (k >= 48 && k <= 57) return String.fromCharCode(k);
    if (k === 42) return '*';
    if (k === 35) return '#';
    return 'Key ' + k;
  }

  repaint() { this.repaintRequested = true; }

  serviceRepaints() {
    if (!this.repaintRequested) return;
    this.repaintRequested = false;
    const g = new Graphics(this.sctx, Canvas.LOGICAL_W, Canvas.LOGICAL_H);
    try {
      this.paint(g);
      Graphics3D.flushPending();
    } finally { g.dispose(); }
    this.present();
  }

  /** Integer render scale: device pixels per logical pixel, rounded up (max 4) so the picture is never upscaled blurrily. */
  wantedScale() {
    const stage = this.visible.parentElement;
    const cw = stage.clientWidth || 240, ch = stage.clientHeight || 320;
    const target = Math.min(cw / Canvas.LOGICAL_W, ch / Canvas.LOGICAL_H) * (window.devicePixelRatio || 1);
    return Math.max(1, Math.min(4, Math.ceil(target - 0.05)));
  }

  setScale(S) {
    if (S === this.S) return;
    const n = document.createElement('canvas');
    n.width = Canvas.LOGICAL_W * S; n.height = Canvas.LOGICAL_H * S;
    const nctx = n.getContext('2d', { alpha: false });
    nctx.imageSmoothingEnabled = false;
    if (this.screen) { Graphics3D.flushPending(); nctx.drawImage(this.screen, 0, 0, n.width, n.height); }
    else { nctx.fillStyle = '#000'; nctx.fillRect(0, 0, n.width, n.height); }
    this.screen = n; this.sctx = nctx; this.S = S;
    Graphics3D.setScale(Math.min(S, Canvas.MAX_3D_SCALE));
    this.repaintRequested = true;
  }

  present() {
    this.setScale(this.wantedScale());
    const vis = this.visible, stage = vis.parentElement;
    const cw = stage.clientWidth, ch = stage.clientHeight;
    if (cw === 0 || ch === 0) return;
    const s = Math.min(cw / Canvas.LOGICAL_W, ch / Canvas.LOGICAL_H);
    const dpr = window.devicePixelRatio || 1;
    const bw = Math.max(1, Math.round(Canvas.LOGICAL_W * s * dpr)), bh = Math.max(1, Math.round(Canvas.LOGICAL_H * s * dpr));
    if (vis.width !== bw || vis.height !== bh) {
      vis.width = bw; vis.height = bh;
      vis.style.width = (bw / dpr) + 'px'; vis.style.height = (bh / dpr) + 'px';
    }
    this.vctx.imageSmoothingEnabled = bw !== this.screen.width;
    this.vctx.imageSmoothingQuality = 'high';
    this.vctx.drawImage(this.screen, 0, 0, bw, bh);
  }

  paint(g) {}
  showNotify() {}
  hideNotify() {}
  keyPressed(k) {}
  keyReleased(k) {}
  keyRepeated(k) {}
  pointerPressed(x, y) {}
  pointerReleased(x, y) {}
}
Canvas.UP = 1; Canvas.LEFT = 2; Canvas.RIGHT = 5; Canvas.DOWN = 6; Canvas.FIRE = 8;
Canvas.GAME_A = 9; Canvas.GAME_B = 10; Canvas.GAME_C = 11; Canvas.GAME_D = 12;
Canvas.current = null;
Canvas.inputInstalled = false;

class Display {
  static getDisplay(midlet) { return Display.INSTANCE; }

  static audioUnlock() { if (typeof MidiAudio !== 'undefined') MidiAudio.unlock(); }

  static shutdown() {
    const o = document.getElementById('overlay');
    o.innerHTML = '<div class="box"><h2>City Bloxx</h2><p>Game closed.</p><button id="again">Play again</button></div>';
    o.style.display = 'flex';
    document.getElementById('again').onclick = () => location.reload();
  }

  setCurrent(d) {
    Display.closeForm();
    if (d instanceof Form) { if (Display.last) Display.last.unfocus(); Display.showForm(d); }
    else if (d instanceof Canvas) { Display.last = d; d.focus(); }
  }

  static closeForm() {
    const o = document.getElementById('overlay');
    if (Display.formOpen) { o.style.display = 'none'; o.innerHTML = ''; Display.formOpen = false; }
  }

  static showForm(form) {
    const o = document.getElementById('overlay');
    o.innerHTML = '';
    const box = document.createElement('div'); box.className = 'box';
    const h = document.createElement('h2'); h.textContent = form.title; box.appendChild(h);
    const tf = document.createElement('input');
    tf.type = 'text'; tf.maxLength = form.field ? form.field.getMaxSize() : 10; tf.value = form.field ? form.field.getString() : '';
    tf.autocomplete = 'off'; tf.spellcheck = false; box.appendChild(tf);
    const row = document.createElement('div'); row.className = 'row'; box.appendChild(row);
    const n = form.commands.length - 1;    // the last command is the internal "delete" command (backspace works natively)
    let first = null;
    for (let i = 0; i < n; i++) {
      const c = form.commands[i];
      const b = document.createElement('button');
      b.textContent = c.getLabel().length === 0 ? 'OK' : c.getLabel();
      b.onclick = () => {
        if (form.field) form.field.setString(tf.value);
        const l = form.listener;
        setTimeout(() => { if (l) l.commandAction(c, form); }, 0);
      };
      if (!first) first = b;
      row.appendChild(b);
    }
    tf.addEventListener('keydown', (e) => { if (e.key === 'Enter' && first) { e.preventDefault(); first.click(); } });
    o.appendChild(box); o.style.display = 'flex';
    Display.formOpen = true;
    setTimeout(() => { tf.focus(); tf.select(); }, 0);
  }
}
Display.INSTANCE = new Display();
Display.formOpen = false;
Display.last = null;
