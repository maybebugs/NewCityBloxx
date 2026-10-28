/* lcdui-style Font / Graphics / Image on top of Canvas 2D. */
'use strict';

const MONO_FAMILY = '"DejaVu Sans Mono", "Liberation Mono", Menlo, Consolas, "Courier New", monospace';
const SANS_FAMILY = '"DejaVu Sans", "Liberation Sans", Arial, Helvetica, sans-serif';
let _metricsCtx = null;
function metricsCtx() {
  if (!_metricsCtx) _metricsCtx = document.createElement('canvas').getContext('2d');
  return _metricsCtx;
}

class Font {
  static getFont(face, style, size) {
    const key = (face << 16) | (style << 8) | size;
    let f = Font.cache.get(key);
    if (!f) { f = new Font(face, style, size); Font.cache.set(key, f); }
    return f;
  }
  constructor(face, style, size) {
    this.px = size === 8 ? 11 : (size === 16 ? 17 : 13);
    this.bold = (style & 1) !== 0;
    this.italic = (style & 2) !== 0;
    this.mono = face === 32;
    this.css = (this.italic ? 'italic ' : '') + (this.bold ? 'bold ' : '') + this.px + 'px ' + (this.mono ? MONO_FAMILY : SANS_FAMILY);
    this.ascent = Math.ceil(this.px * 0.93);
    this.descent = Math.ceil(this.px * 0.24);
    this.height = this.ascent + this.descent;
    this.spacing = 0;
    this.wcache = new Map();
    this.refresh();
  }
  /** (Re)compute metrics; called again once web fonts are loaded. */
  refresh() {
    const m = metricsCtx();
    m.font = this.css;
    if (this.mono) {
      const adv = m.measureText('M').width;
      this.adv = Math.max(1, Math.round(adv));
      this.spacing = this.adv - adv;   // letter spacing that makes every glyph advance an integer
    }
    this.wcache.clear();
  }
  getHeight() { return this.height; }
  getBaselinePosition() { return this.ascent; }
  stringWidth(s) {
    let w = this.wcache.get(s);
    if (w === undefined) {
      if (this.mono) {
        let n = 0;
        const m = metricsCtx(); m.font = this.css;
        for (const ch of s) {
          const code = ch.codePointAt(0);
          n += (code < 0x2E80) ? this.adv : Math.round(m.measureText(ch).width);
        }
        w = n;
      } else {
        const m = metricsCtx(); m.font = this.css; w = Math.round(m.measureText(s).width);
      }
      if (this.wcache.size > 4000) this.wcache.clear();
      this.wcache.set(s, w);
    }
    return w;
  }
  substringWidth(s, off, len) { return this.stringWidth(s.substring(off, off + len)); }
  charWidth(c) { return this.stringWidth(String.fromCharCode(c)); }
}
Font.cache = new Map();
Font.STYLE_PLAIN = 0; Font.STYLE_BOLD = 1; Font.STYLE_ITALIC = 2;
Font.SIZE_MEDIUM = 0; Font.SIZE_SMALL = 8; Font.SIZE_LARGE = 16;

class Graphics {
  /** ctx: CanvasRenderingContext2D of a w x h surface. */
  constructor(ctx, w, h) {
    this.ctx = ctx; this.w = w; this.h = h;
    this.s = ctx.canvas.width / w;      // device pixels per logical pixel
    this.font = Font.getFont(0, 0, 0);
    this.rgb = 0; this.css = '#000';
    this.clipX = 0; this.clipY = 0; this.clipW = w; this.clipH = h;
    this.stroke = 0;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.textBaseline = 'alphabetic';
    this.applyState();
    this.setClip(0, 0, w, h);
  }
  applyState() {
    const c = this.ctx;
    c.fillStyle = this.css;
    c.font = this.font.css;
    if ('letterSpacing' in c) c.letterSpacing = this.font.mono ? this.font.spacing + 'px' : '0px';
  }
  sync() { if (Graphics3D.pendingTarget === this) Graphics3D.flushPending(); }

  setColor(r, g, b) {
    let rgb = r;
    if (g !== undefined) rgb = ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
    rgb &= 0xFFFFFF;
    if (rgb !== this.rgb || this.css === null) {
      this.rgb = rgb;
      this.css = '#' + (rgb | 0x1000000).toString(16).substring(1);
    }
    this.ctx.fillStyle = this.css;
  }
  setFont(f) { if (f) { this.font = f; this.applyState(); } }
  getFont() { return this.font; }

  setClip(x, y, w, h) {
    this.sync();
    this.clipX = x; this.clipY = y; this.clipW = w; this.clipH = h;
    const c = this.ctx;
    c.restore(); c.save();
    c.imageSmoothingEnabled = false;
    c.textBaseline = 'alphabetic';
    c.setTransform(this.s, 0, 0, this.s, 0, 0);
    c.beginPath(); c.rect(x, y, Math.max(0, w), Math.max(0, h)); c.clip();
    this.applyState();
  }
  getClipX() { return this.clipX; }
  getClipY() { return this.clipY; }
  getClipWidth() { return this.clipW; }
  getClipHeight() { return this.clipH; }
  setStrokeStyle(s) { this.stroke = s; }

  fillRect(x, y, w, h) { this.sync(); if (w > 0 && h > 0) this.ctx.fillRect(x, y, w, h); }
  px(x, y) { this.ctx.fillRect(x, y, 1, 1); }
  hline(x1, x2, y) {
    if (this.stroke === 1) { for (let x = x1; x <= x2; x++) if (((x - x1) & 1) === 0) this.px(x, y); }
    else this.ctx.fillRect(x1, y, x2 - x1 + 1, 1);
  }
  vline(x, y1, y2) {
    if (this.stroke === 1) { for (let y = y1; y <= y2; y++) if (((y - y1) & 1) === 0) this.px(x, y); }
    else this.ctx.fillRect(x, y1, 1, y2 - y1 + 1);
  }
  drawRect(x, y, w, h) {
    this.sync();
    if (w < 0 || h < 0) return;
    this.hline(x, x + w, y); this.hline(x, x + w, y + h);
    if (h > 1) { this.vline(x, y + 1, y + h - 1); this.vline(x + w, y + 1, y + h - 1); }
  }
  drawLine(x1, y1, x2, y2) {
    this.sync();
    if (y1 === y2) { this.hline(Math.min(x1, x2), Math.max(x1, x2), y1); return; }
    if (x1 === x2) { this.vline(x1, Math.min(y1, y2), Math.max(y1, y2)); return; }
    let dx = Math.abs(x2 - x1), dy = -Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
    let err = dx + dy, i = 0;
    for (;;) {
      if (this.stroke !== 1 || (i & 1) === 0) this.px(x1, y1);
      i++;
      if (x1 === x2 && y1 === y2) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x1 += sx; }
      if (e2 <= dx) { err += dx; y1 += sy; }
    }
  }

  drawString(s, x, y, anchor) {
    if (s == null || s.length === 0) return;
    this.sync();
    const f = this.font;
    const sw = f.stringWidth(s);
    let px = x;
    if ((anchor & 1) !== 0) px = x - (sw >> 1);
    else if ((anchor & 8) !== 0) px = x - sw;
    let py;
    if ((anchor & 64) !== 0) py = y;
    else if ((anchor & 32) !== 0) py = y - f.descent;
    else py = y + f.ascent;
    this.ctx.fillText(s, px, py);
  }

  drawImage(im, x, y, anchor) { this.drawImageImpl(im, x, y, anchor, false); }
  drawImageFlipped(im, x, y, anchor) { this.drawImageImpl(im, x, y, anchor, true); }
  drawImageImpl(im, x, y, anchor, flip) {
    if (!im) return;
    this.sync();
    const iw = im.getWidth(), ih = im.getHeight();
    let px = x, py = y;
    if ((anchor & 1) !== 0) px = x - (iw >> 1);
    else if ((anchor & 8) !== 0) px = x - iw;
    if ((anchor & 2) !== 0) py = y - (ih >> 1);
    else if ((anchor & 32) !== 0) py = y - ih;
    const c = this.ctx;
    c.imageSmoothingEnabled = Graphics.smooth && this.s > 1;
    if (flip) {
      c.save(); c.translate(px + iw, py); c.scale(-1, 1); c.drawImage(im.canvas, 0, 0); c.restore();
    } else c.drawImage(im.canvas, px, py);
  }
  dispose() { this.ctx.restore(); }
}
Graphics.smooth = false;
Graphics.HCENTER = 1; Graphics.VCENTER = 2; Graphics.LEFT = 4; Graphics.RIGHT = 8;
Graphics.TOP = 16; Graphics.BOTTOM = 32; Graphics.BASELINE = 64;
Graphics.SOLID = 0; Graphics.DOTTED = 1;

class Image {
  constructor(canvas) { this.canvas = canvas; }
  static fromCanvas(c) { return new Image(c); }
  static createImage(a, b, c) {
    if (typeof a === 'number') {
      const cv = document.createElement('canvas');
      cv.width = Math.max(1, a); cv.height = Math.max(1, b);
      return new Image(cv);
    }
    throw new Error('Image.createImage(bytes) is not supported; images are preloaded');
  }
  static createRGBImage(rgb, w, h, alpha) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const id = ctx.createImageData(w, h);
    const u32 = new Uint32Array(id.data.buffer);
    for (let i = 0; i < w * h; i++) {
      const p = rgb[i];
      const a = alpha ? (p >>> 24) : 255;
      u32[i] = (a << 24) | ((p & 255) << 16) | (p & 0xFF00) | ((p >> 16) & 255);
    }
    ctx.putImageData(id, 0, 0);
    return new Image(cv);
  }
  getWidth() { return this.canvas.width; }
  getHeight() { return this.canvas.height; }
  getGraphics() { return new Graphics(this.canvas.getContext('2d'), this.canvas.width, this.canvas.height); }
}
