/* Small software 3D rasteriser (replacement for the M3G Graphics3D used by the game) + OBJ model loader.
   Pixels are collected in an RGBA buffer and composited onto the 2D target lazily: any 2D drawing call on
   the target flushes pending 3D first, so draw order is preserved. The depth buffer persists until clearDepth(). */
'use strict';

const G3_W = 240, G3_H = 320;
const BLEND_ALPHA = 64, BLEND_REPLACE = 68;
const FUNC_REPLACE = 228, FUNC_MODULATE = 227;
const CULL_BACK = 160, CULL_FRONT = 161, CULL_NONE = 162;

class Graphics3D {
  static identity() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; }

  static mul(a, b) {
    const r = new Float32Array(16);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[i * 4 + k] * b[k * 4 + j];
        r[i * 4 + j] = s;
      }
    return r;
  }

  static invert(m) {
    const a = new Float64Array(32);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) a[i * 8 + j] = m[i * 4 + j];
      a[i * 8 + 4 + i] = 1;
    }
    for (let c = 0; c < 4; c++) {
      let p = c;
      for (let r = c + 1; r < 4; r++) if (Math.abs(a[r * 8 + c]) > Math.abs(a[p * 8 + c])) p = r;
      if (Math.abs(a[p * 8 + c]) < 1e-12) return Graphics3D.identity();
      if (p !== c) for (let k = 0; k < 8; k++) { const t = a[c * 8 + k]; a[c * 8 + k] = a[p * 8 + k]; a[p * 8 + k] = t; }
      const d = a[c * 8 + c];
      for (let k = 0; k < 8; k++) a[c * 8 + k] /= d;
      for (let r = 0; r < 4; r++) if (r !== c) {
        const f = a[r * 8 + c];
        if (f !== 0) for (let k = 0; k < 8; k++) a[r * 8 + k] -= f * a[c * 8 + k];
      }
    }
    const out = new Float32Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) out[i * 4 + j] = a[i * 8 + 4 + j];
    return out;
  }

  static translation(x, y, z) {
    const m = Graphics3D.identity();
    m[3] = x; m[7] = y; m[11] = z;
    return m;
  }

  /** Rotation by angle (degrees) around the axis, like M3G Transform.postRotate. */
  static rotation(angleDeg, ax, ay, az) {
    const len = Math.sqrt(ax * ax + ay * ay + az * az);
    if (len === 0) return Graphics3D.identity();
    const x = ax / len, y = ay / len, z = az / len;
    const a = angleDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), t = 1 - c;
    const m = Graphics3D.identity();
    m[0] = t * x * x + c;     m[1] = t * x * y - s * z; m[2] = t * x * z + s * y;
    m[4] = t * x * y + s * z; m[5] = t * y * y + c;     m[6] = t * y * z - s * x;
    m[8] = t * x * z - s * y; m[9] = t * y * z + s * x; m[10] = t * z * z + c;
    return m;
  }

  static perspective(fovyDeg, aspect, near, far) {
    const f = 1.0 / Math.tan((fovyDeg * Math.PI / 180) * 0.5);
    const m = new Float32Array(16);
    m[0] = f / aspect;
    m[5] = f;
    m[10] = -(far + near) / (far - near);
    m[11] = -2 * far * near / (far - near);
    m[14] = -1;
    return m;
  }

  static transform(m, v) {
    const x = v[0], y = v[1], z = v[2], w = v[3];
    v[0] = m[0] * x + m[1] * y + m[2] * z + m[3] * w;
    v[1] = m[4] * x + m[5] * y + m[6] * z + m[7] * w;
    v[2] = m[8] * x + m[9] * y + m[10] * z + m[11] * w;
    v[3] = m[12] * x + m[13] * y + m[14] * z + m[15] * w;
  }

  static setCamera(cameraToWorld, projection) {
    Graphics3D.view = Graphics3D.invert(cameraToWorld);
    Graphics3D.proj = projection;
  }

  /** Internal 3D resolution = k x the 240x320 logical screen. */
  static setScale(k) {
    const S = Graphics3D;
    if (S.k === k) return;
    S.flushPending();
    S.k = k; S.W = G3_W * k; S.H = G3_H * k;
    S.scratch.width = S.W; S.scratch.height = S.H;
    S.scratchCtx = S.scratch.getContext('2d');
    S.imageData = S.scratchCtx.createImageData(S.W, S.H);
    S.color = new Uint32Array(S.imageData.data.buffer);
    S.depth = new Float32Array(S.W * S.H);
    S.dirty = false;
  }

  static bindTarget(g, x, y, w, h) {
    const k = Graphics3D.k;
    Graphics3D.flushPending();
    Graphics3D.target = g;
    Graphics3D.vpX = x * k; Graphics3D.vpY = y * k; Graphics3D.vpW = w * k; Graphics3D.vpH = h * k;
    Graphics3D.clipX0 = Math.max(0, g.getClipX()) * k;
    Graphics3D.clipY0 = Math.max(0, g.getClipY()) * k;
    Graphics3D.clipX1 = Math.min(G3_W, g.getClipX() + g.getClipWidth()) * k;
    Graphics3D.clipY1 = Math.min(G3_H, g.getClipY() + g.getClipHeight()) * k;
  }

  static releaseTarget() { Graphics3D.flushPending(); Graphics3D.target = null; }

  static clearDepth() { Graphics3D.depth.fill(Infinity); }

  static flushPending() {
    const S = Graphics3D;
    if (!S.dirty || S.pendingTarget === null) { S.dirty = false; S.pendingTarget = null; return; }
    const t = S.pendingTarget;
    S.pendingTarget = null;
    const k = S.k;
    const x0 = Math.floor(S.dMinX / k) * k, y0 = Math.floor(S.dMinY / k) * k;
    const x1 = (Math.floor(S.dMaxX / k) + 1) * k, y1 = (Math.floor(S.dMaxY / k) + 1) * k;
    const w = x1 - x0, h = y1 - y0;
    if (w > 0 && h > 0) {
      S.scratchCtx.putImageData(S.imageData, 0, 0, x0, y0, w, h);
      t.ctx.imageSmoothingEnabled = k !== t.s;      // smooth only when 3D resolution differs from the screen buffer
      t.ctx.drawImage(S.scratch, x0, y0, w, h, x0 / k, y0 / k, w / k, h / k);
      t.ctx.imageSmoothingEnabled = false;
      for (let y = y0; y < y1; y++) S.color.fill(0, y * S.W + x0, y * S.W + x1);
    }
    S.dirty = false;
  }

  static render(m, model) {
    const S = Graphics3D;
    if (S.target === null || !m) return;
    const mv = Graphics3D.mul(S.view, model);
    const mvp = Graphics3D.mul(S.proj, mv);
    const n = m.vertexCount;
    if (S.clipBuf.length < n * 4) S.clipBuf = new Float64Array(n * 4);
    const clip = S.clipBuf, pos = m.pos;
    for (let i = 0; i < n; i++) {
      const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
      clip[i * 4] = mvp[0] * x + mvp[1] * y + mvp[2] * z + mvp[3];
      clip[i * 4 + 1] = mvp[4] * x + mvp[5] * y + mvp[6] * z + mvp[7];
      clip[i * 4 + 2] = mvp[8] * x + mvp[9] * y + mvp[10] * z + mvp[11];
      clip[i * 4 + 3] = mvp[12] * x + mvp[13] * y + mvp[14] * z + mvp[15];
    }
    const uv = m.uv, colors = m.colors, poly = S.poly, tmp = S.tmp;
    for (const s of m.subs) {
      const t = s.tris;
      for (let i = 0; i + 2 < t.length; i += 3) {
        const i0 = t[i] * 4, i1 = t[i + 1] * 4, i2 = t[i + 2] * 4;
        const w0 = clip[i0 + 3], w1 = clip[i1 + 3], w2 = clip[i2 + 3];
        if (clip[i0] > w0 && clip[i1] > w1 && clip[i2] > w2) continue;
        if (clip[i0] < -w0 && clip[i1] < -w1 && clip[i2] < -w2) continue;
        if (clip[i0 + 1] > w0 && clip[i1 + 1] > w1 && clip[i2 + 1] > w2) continue;
        if (clip[i0 + 1] < -w0 && clip[i1 + 1] < -w1 && clip[i2 + 1] < -w2) continue;
        if (clip[i0 + 2] > w0 && clip[i1 + 2] > w1 && clip[i2 + 2] > w2) continue;

        let cnt = 0;
        for (let k = 0; k < 3; k++) {
          const vi = t[i + k];
          const p = poly[cnt++];
          p[0] = clip[vi * 4]; p[1] = clip[vi * 4 + 1]; p[2] = clip[vi * 4 + 2]; p[3] = clip[vi * 4 + 3];
          if (uv) { p[4] = uv[vi * 2]; p[5] = uv[vi * 2 + 1]; } else { p[4] = 0; p[5] = 0; }
          const c = colors[vi];
          p[6] = (c >> 16) & 255; p[7] = (c >> 8) & 255; p[8] = c & 255; p[9] = (c >>> 24);
        }
        // clip against the near plane: z >= -w
        let outCnt = 0;
        for (let k = 0; k < cnt; k++) {
          const a = poly[k], b = poly[(k + 1) % cnt];
          const da = a[2] + a[3], db = b[2] + b[3];
          if (da >= 0) tmp[outCnt++].set(a);
          if ((da >= 0) !== (db >= 0)) {
            const f = da / (da - db);
            const o = tmp[outCnt++];
            for (let q = 0; q < 10; q++) o[q] = a[q] + (b[q] - a[q]) * f;
          }
        }
        if (outCnt < 3) continue;
        for (let k = 1; k + 1 < outCnt; k++) Graphics3D.drawTri(s, tmp[0], tmp[k], tmp[k + 1]);
      }
    }
  }

  static drawTri(s, a, b, c) {
    const S = Graphics3D;
    const sx = S.sx, sy = S.sy, sz = S.sz, iw = S.iw;
    for (let i = 0; i < 3; i++) {
      const v = i === 0 ? a : i === 1 ? b : c;
      const w = v[3];
      if (w <= 1e-6) return;
      const inv = 1 / w;
      iw[i] = inv;
      sx[i] = S.vpX + (v[0] * inv * 0.5 + 0.5) * S.vpW;
      sy[i] = S.vpY + (-v[1] * inv * 0.5 + 0.5) * S.vpH;
      sz[i] = v[2] * inv;
    }
    const area = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sx[2] - sx[0]) * (sy[1] - sy[0]);
    if (area === 0) return;
    const ccwOnScreen = area < 0;
    const front = s.windingCCW ? ccwOnScreen : !ccwOnScreen;
    if (s.culling === CULL_BACK && !front) return;
    if (s.culling === CULL_FRONT && front) return;

    const fminX = Math.min(sx[0], sx[1], sx[2]), fmaxX = Math.max(sx[0], sx[1], sx[2]);
    const fminY = Math.min(sy[0], sy[1], sy[2]), fmaxY = Math.max(sy[0], sy[1], sy[2]);
    if (fmaxX < S.clipX0 || fminX > S.clipX1 || fmaxY < S.clipY0 || fminY > S.clipY1) return;
    const minX = Math.max(S.clipX0, Math.floor(fminX));
    const maxX = Math.min(S.clipX1 - 1, Math.ceil(fmaxX));
    const minY = Math.max(S.clipY0, Math.floor(fminY));
    const maxY = Math.min(S.clipY1 - 1, Math.ceil(fmaxY));
    if (minX > maxX || minY > maxY) return;

    const invArea = 1 / area;
    const dw0dx = (sy[1] - sy[2]) * invArea;
    const dw1dx = (sy[2] - sy[0]) * invArea;
    const px0 = minX + 0.5;
    const iw0 = iw[0], iw1 = iw[1], iw2 = iw[2];
    const sz0 = sz[0], sz1 = sz[1], sz2 = sz[2];

    const tex = s.tex;
    const texPx = tex ? tex.argb : null;
    const tw = tex ? tex.w : 0, th = tex ? tex.h : 0;
    const clamp = s.clamp, modulate = s.texFunc === FUNC_MODULATE;
    const alphaBlend = s.blending === BLEND_ALPHA;
    const depthTest = s.depthTest, depthWrite = s.depthWrite;
    const thr = s.alphaThreshold;
    const depth = S.depth, color = S.color;
    const a4 = a[4], b4 = b[4], c4 = c[4], a5 = a[5], b5 = b[5], c5 = c[5];
    const a6 = a[6], b6 = b[6], c6 = c[6], a7 = a[7], b7 = b[7], c7 = c[7];
    const a8 = a[8], b8 = b[8], c8 = c[8], a9 = a[9], b9 = b[9], c9 = c[9];
    const sx0 = sx[0], sx1 = sx[1], sx2 = sx[2], sy0 = sy[0], sy1 = sy[1], sy2 = sy[2];

    for (let y = minY; y <= maxY; y++) {
      const py = y + 0.5;
      let w0 = ((sx1 - px0) * (sy2 - py) - (sx2 - px0) * (sy1 - py)) * invArea;
      let w1 = ((sx2 - px0) * (sy0 - py) - (sx0 - px0) * (sy2 - py)) * invArea;
      let entered = false;
      let di = y * S.W + minX;
      for (let x = minX; x <= maxX; x++, di++, w0 += dw0dx, w1 += dw1dx) {
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) {
          if (entered) break;
          continue;
        }
        entered = true;
        const z = w0 * sz0 + w1 * sz1 + w2 * sz2;
        if (z < -1 || z > 1) continue;
        if (depthTest && z > depth[di]) continue;
        const p0 = w0 * iw0, p1 = w1 * iw1, p2 = w2 * iw2;
        const ps = p0 + p1 + p2;
        if (ps === 0) continue;
        const invPs = 1 / ps;
        const k0 = p0 * invPs, k1 = p1 * invPs, k2 = p2 * invPs;
        let r, g, bl, al;
        const vr = k0 * a6 + k1 * b6 + k2 * c6;
        const vg = k0 * a7 + k1 * b7 + k2 * c7;
        const vb = k0 * a8 + k1 * b8 + k2 * c8;
        const va = k0 * a9 + k1 * b9 + k2 * c9;
        if (texPx !== null) {
          const u = (k0 * a4 + k1 * b4 + k2 * c4) * tw;
          const t = (k0 * a5 + k1 * b5 + k2 * c5) * th;
          let tx = u | 0; if (u < 0) tx--;
          let ty = t | 0; if (t < 0) ty--;
          if (clamp) {
            tx = tx < 0 ? 0 : (tx >= tw ? tw - 1 : tx);
            ty = ty < 0 ? 0 : (ty >= th ? th - 1 : ty);
          } else {
            tx %= tw; if (tx < 0) tx += tw;
            ty %= th; if (ty < 0) ty += th;
          }
          const tc = texPx[ty * tw + tx];
          r = (tc >> 16) & 255; g = (tc >> 8) & 255; bl = tc & 255; al = tc >>> 24;
          if (modulate) {
            r = (r * vr / 255) | 0; g = (g * vg / 255) | 0; bl = (bl * vb / 255) | 0; al = (al * va / 255) | 0;
          }
        } else {
          r = vr | 0; g = vg | 0; bl = vb | 0; al = va | 0;
        }
        if (thr > 0 && al < thr) continue;
        if (al <= 0) continue;   // texels the texture marks fully transparent must not turn opaque black
        if (!alphaBlend) al = 255;
        if (depthWrite) depth[di] = z;
        const dst = color[di];
        if (al >= 255) {
          color[di] = 0xFF000000 | (bl << 16) | (g << 8) | r;
        } else if (al > 0) {
          const da = dst >>> 24;
          if (da === 0) {
            color[di] = (al << 24) | (bl << 16) | (g << 8) | r;
          } else {
            const fa = al / 255;
            const nr = (r * fa + (dst & 255) * (1 - fa)) | 0;
            const ng = (g * fa + ((dst >> 8) & 255) * (1 - fa)) | 0;
            const nb = (bl * fa + ((dst >> 16) & 255) * (1 - fa)) | 0;
            color[di] = 0xFF000000 | (nb << 16) | (ng << 8) | nr;
          }
        } else continue;
        if (!S.dirty) { S.dirty = true; S.dMinX = x; S.dMaxX = x; S.dMinY = y; S.dMaxY = y; }
        else { if (x < S.dMinX) S.dMinX = x; if (x > S.dMaxX) S.dMaxX = x; if (y < S.dMinY) S.dMinY = y; if (y > S.dMaxY) S.dMaxY = y; }
        S.pendingTarget = S.target;
      }
    }
  }
}
Graphics3D.pendingTarget = null;
Graphics3D.k = 1; Graphics3D.W = G3_W; Graphics3D.H = G3_H;
Graphics3D.target = null;
Graphics3D.scratch = document.createElement('canvas');
Graphics3D.scratch.width = G3_W; Graphics3D.scratch.height = G3_H;
Graphics3D.scratchCtx = Graphics3D.scratch.getContext('2d');
Graphics3D.imageData = Graphics3D.scratchCtx.createImageData(G3_W, G3_H);
Graphics3D.color = new Uint32Array(Graphics3D.imageData.data.buffer);
Graphics3D.depth = new Float32Array(G3_W * G3_H);
Graphics3D.dMinX = 0; Graphics3D.dMinY = 0; Graphics3D.dMaxX = 0; Graphics3D.dMaxY = 0;
Graphics3D.dirty = false;
Graphics3D.vpX = 0; Graphics3D.vpY = 0; Graphics3D.vpW = G3_W; Graphics3D.vpH = G3_H;
Graphics3D.clipX0 = 0; Graphics3D.clipY0 = 0; Graphics3D.clipX1 = G3_W; Graphics3D.clipY1 = G3_H;
Graphics3D.view = Graphics3D.identity();
Graphics3D.proj = Graphics3D.identity();
Graphics3D.clipBuf = new Float64Array(4 * 1024);
Graphics3D.poly = Array.from({ length: 12 }, () => new Float64Array(10));
Graphics3D.tmp = Array.from({ length: 12 }, () => new Float64Array(10));
Graphics3D.sx = new Float64Array(3); Graphics3D.sy = new Float64Array(3);
Graphics3D.sz = new Float64Array(3); Graphics3D.iw = new Float64Array(3);

/* ---------------------------------------------------------------- OBJ models */
class Model {
  static find(userId) {
    let m = Model.cache.get(userId);
    if (m) return m;
    if (!Model.index) Model.loadIndex();
    const file = Model.index.get(userId);
    if (!file) return null;
    try {
      m = Model.loadObj('models/' + file);
      m.userId = userId;
      Model.cache.set(userId, m);
      return m;
    } catch (e) { console.error(e); return null; }
  }

  static loadIndex() {
    Model.index = new Map();
    const txt = Assets.text('models/models.txt') || '';
    for (let line of txt.split('\n')) {
      line = line.trim();
      if (!line || line[0] === '#') continue;
      const p = line.split(/\s+/);
      if (p.length >= 2) Model.index.set(parseInt(p[0], 10), p[1]);
    }
  }

  static newMat() {
    return { texPath: null, blending: BLEND_REPLACE, alphaThreshold: 0, culling: CULL_BACK, texFunc: FUNC_MODULATE, depthTest: true, depthWrite: true, windingCCW: true, clamp: false, kdR: 1, kdG: 1, kdB: 1, hasKd: false };
  }

  static parseMtl(path, out) {
    const txt = Assets.text(path);
    if (txt === null) return;
    let cur = null;
    for (let line of txt.split('\n')) {
      line = line.trim();
      if (line.startsWith('newmtl ')) { cur = Model.newMat(); out.set(line.substring(7).trim(), cur); }
      else if (cur === null) continue;
      else if (line.startsWith('map_Kd ')) {
        let tp = line.substring(7).trim().replace(/\\/g, '/');
        if (tp.startsWith('-')) tp = tp.substring(tp.lastIndexOf(' ') + 1);
        cur.texPath = Assets.dirOf(path) + tp;
      } else if (line.startsWith('Kd ')) {
        const k = line.split(/\s+/);
        const r = parseFloat(k[1]), gg = parseFloat(k[2]), b = parseFloat(k[3]);
        if (!Number.isNaN(r + gg + b)) { cur.kdR = r; cur.kdG = gg; cur.kdB = b; cur.hasKd = !(r >= 0.999 && gg >= 0.999 && b >= 0.999); }
      }
      else if (line.startsWith('#@')) {
        const p = line.substring(2).trim().split(/\s+/);
        if (p.length < 2) continue;
        const k = p[0], v = p[1].trim();
        if (k === 'blend') cur.blending = v === 'ALPHA' ? BLEND_ALPHA : BLEND_REPLACE;
        else if (k === 'alpha_threshold') cur.alphaThreshold = parseInt(v, 10);
        else if (k === 'depth_test') cur.depthTest = v === 'true';
        else if (k === 'depth_write') cur.depthWrite = v === 'true';
        else if (k === 'cull') cur.culling = v === 'FRONT' ? CULL_FRONT : v === 'NONE' ? CULL_NONE : CULL_BACK;
        else if (k === 'winding') cur.windingCCW = v !== 'CW';
        else if (k === 'texture_function') cur.texFunc = v === 'REPLACE' ? FUNC_REPLACE : FUNC_MODULATE;
        else if (k === 'clamp') cur.clamp = v === 'true';
      }
    }
  }

  static loadTexture(path) {
    let t = Model.textures.get(path);
    if (t) return t;
    let cv = Assets.canvasOf(path);
    if (!cv) {
      // forgiving lookup: exporters often write absolute paths -> try just the file name nearby
      const name = path.substring(path.lastIndexOf('/') + 1), dir = Assets.dirOf(path);
      const tx = dir.lastIndexOf('textures/'), base = tx >= 0 ? dir.substring(0, tx) : dir;
      cv = Assets.canvasOf(dir + name) || Assets.canvasOf(base + name) || Assets.canvasOf(base + 'textures/' + name);
    }
    if (!cv) return null;
    const id = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    t = { w: cv.width, h: cv.height, argb: new Int32Array(cv.width * cv.height) };
    for (let i = 0; i < t.argb.length; i++) {
      t.argb[i] = (id[i * 4 + 3] << 24) | (id[i * 4] << 16) | (id[i * 4 + 1] << 8) | id[i * 4 + 2];
    }
    Model.textures.set(path, t);
    return t;
  }

  static loadObj(objPath) {
    const txt = Assets.text(objPath);
    if (txt === null) throw new Error('missing asset ' + objPath);
    const vx = [], vt = [], vc = [];
    let haveColors = false, nv = 0, nvt = 0, defaultColor = 0xFFFFFFFF | 0;
    const materials = new Map();
    const unify = new Map();
    const outPos = [], outUv = [], outCol = [];
    let anyUv = false;
    const subMats = [], subTris = [];
    let current = null, curMat = Model.newMat(), curDirty = true;
    const idx = (i, count) => (i > 0 ? i - 1 : count + i);
    for (let line of txt.split('\n')) {
      line = line.trim();
      if (!line) continue;
      if (line[0] === '#') {
        if (line.startsWith('#@default_color ')) defaultColor = parseInt(line.substring(16).trim(), 16) | 0;
        continue;
      }
      const t = line.split(/\s+/);
      const key = t[0];
      if (key === 'v') {
        vx.push(parseFloat(t[1]), parseFloat(t[2]), parseFloat(t[3]));
        if (t.length >= 7) { haveColors = true; vc.push(parseFloat(t[4]), parseFloat(t[5]), parseFloat(t[6])); }
        else vc.push(-1, -1, -1);
        nv++;
      } else if (key === 'vt') {
        vt.push(parseFloat(t[1]), 1 - (t.length > 2 ? parseFloat(t[2]) : 0));
        nvt++;
      } else if (key === 'mtllib') {
        Model.parseMtl(Assets.dirOf(objPath) + line.substring(6).trim(), materials);
      } else if (key === 'usemtl') {
        const m = materials.get(line.substring(6).trim());
        curMat = m || Model.newMat();
        curDirty = true;
      } else if (key === 'f') {
        if (curDirty) { current = []; subTris.push(current); subMats.push(curMat); curDirty = false; }
        const cnt = t.length - 1;
        const face = new Array(cnt);
        for (let k = 0; k < cnt; k++) {
          const c = t[k + 1].split('/');
          const vi = idx(parseInt(c[0], 10), nv);
          const ti = (c.length > 1 && c[1].length > 0) ? idx(parseInt(c[1], 10), nvt) : -1;
          const ukey = subTris.length + ',' + vi + ',' + ti;
          let u = unify.get(ukey);
          if (u === undefined) {
            u = outPos.length / 3;
            unify.set(ukey, u);
            outPos.push(vx[vi * 3], vx[vi * 3 + 1], vx[vi * 3 + 2]);
            if (ti >= 0) { outUv.push(vt[ti * 2], vt[ti * 2 + 1]); anyUv = true; } else outUv.push(0, 0);
            if (vc[vi * 3] < 0 && curMat.texPath == null && curMat.hasKd) {
              haveColors = true;
              outCol.push(curMat.kdR, curMat.kdG, curMat.kdB);
            } else outCol.push(vc[vi * 3], vc[vi * 3 + 1], vc[vi * 3 + 2]);
          }
          face[k] = u;
        }
        for (let k = 1; k + 1 < cnt; k++) current.push(face[0], face[k], face[k + 1]);
      }
    }
    const m = new Model();
    m.defaultColor = defaultColor;
    m.vertexCount = outPos.length / 3;
    m.pos = Float32Array.from(outPos);
    m.uv = anyUv ? Float32Array.from(outUv) : null;
    m.colors = new Int32Array(m.vertexCount);
    for (let v = 0; v < m.vertexCount; v++) {
      const cr = outCol[v * 3];
      if (!haveColors || cr < 0) m.colors[v] = defaultColor;
      else {
        const rr = Math.round(cr * 255), gg = Math.round(outCol[v * 3 + 1] * 255), bb = Math.round(outCol[v * 3 + 2] * 255);
        m.colors[v] = 0xFF000000 | (rr << 16) | (gg << 8) | bb;
      }
    }
    m.subs = subTris.map((tris, i) => {
      const mt = subMats[i];
      return {
        tris: Int32Array.from(tris), blending: mt.blending, alphaThreshold: mt.alphaThreshold, depthTest: mt.depthTest,
        depthWrite: mt.depthWrite, culling: mt.culling, windingCCW: mt.windingCCW, texFunc: mt.texFunc, clamp: mt.clamp,
        tex: mt.texPath ? Model.loadTexture(mt.texPath) : null,
      };
    });
    return m;
  }

  /** Loads (and caches) a model straight from an OBJ file in the asset bundle, e.g. "bonus/top_peach.obj"; null on failure. */
  static loadFile(objPath) {
    let m = Model.fileCache.get(objPath);
    if (m) return m;
    try {
      m = Model.loadObj(objPath);
      if (m.vertexCount === 0 || m.subs.length === 0) return null;
      Model.fileCache.set(objPath, m);
      return m;
    } catch (e) { console.error('Could not load model ' + objPath + ': ' + e); return null; }
  }

  static clearFileCache() { Model.fileCache.clear(); Model.textures.clear(); }

  /** Deep copy so it can be fitted independently (fit() mutates pos / subs). */
  copy() {
    const m = new Model();
    m.userId = this.userId; m.vertexCount = this.vertexCount;
    m.pos = this.pos ? this.pos.slice() : null;
    m.uv = this.uv ? this.uv.slice() : null;
    m.colors = this.colors ? this.colors.slice() : null;
    m.defaultColor = this.defaultColor;
    m.subs = this.subs.map((s) => Object.assign({}, s));
    return m;
  }

  /** What Mesh3D.setupAppearance() did on the original: textures use REPLACE + clamp. */
  setupAppearance() { for (const s of this.subs) { s.texFunc = FUNC_REPLACE; s.clamp = true; } }
}
Model.cache = new Map();
Model.fileCache = new Map();
Model.textures = new Map();
Model.index = null;
Model.BLEND_ALPHA = BLEND_ALPHA; Model.BLEND_REPLACE = BLEND_REPLACE;
Model.FUNC_REPLACE = FUNC_REPLACE; Model.FUNC_MODULATE = FUNC_MODULATE;
Model.CULL_BACK = CULL_BACK; Model.CULL_FRONT = CULL_FRONT; Model.CULL_NONE = CULL_NONE;
