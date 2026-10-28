/* Standard MIDI File player on Web Audio (replacement for the JSR-135 / javax.sound Player). */
'use strict';

const MidiAudio = {
  muted: (() => { try { return localStorage.getItem('citybloxx.muted') === '1'; } catch (e) { return false; } })(),
  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('citybloxx.muted', m ? '1' : '0'); } catch (e) { /* ignore */ }
    if (this.master) this.master.gain.value = m ? 0 : 0.35;
  },
  ctx: null,
  master: null,
  noise: null,
  ensure() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = MidiAudio.muted ? 0 : 0.35;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp); comp.connect(this.ctx.destination);
    const len = this.ctx.sampleRate;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return this.ctx;
  },
  unlock() {
    const c = this.ensure();
    if (c && c.state === 'suspended') c.resume();
  },
};

/** Parses an SMF into a time-sorted flat event list (seconds). */
function parseMidi(u8) {
  let p = 0;
  const r32 = () => { const v = (u8[p] << 24 | u8[p + 1] << 16 | u8[p + 2] << 8 | u8[p + 3]) >>> 0; p += 4; return v; };
  const r16 = () => { const v = (u8[p] << 8) | u8[p + 1]; p += 2; return v; };
  if (u8[0] !== 0x4D || u8[1] !== 0x54) return null;
  p = 4; r32();
  const fmt = r16(), ntr = r16(), div = r16();
  const tracks = [];
  for (let t = 0; t < ntr; t++) {
    if (p + 8 > u8.length) break;
    p += 4; const len = r32(); const end = p + len;
    const ev = []; let tick = 0, run = 0;
    const vlq = () => { let v = 0, b; do { b = u8[p++]; v = (v << 7) | (b & 127); } while (b & 128); return v; };
    while (p < end) {
      tick += vlq();
      let st = u8[p];
      if (st & 128) { p++; if (st < 0xF0) run = st; } else st = run;
      if (st === 0xFF) {
        const type = u8[p++]; const l = vlq();
        if (type === 0x51) ev.push({ tick, k: 'tempo', v: (u8[p] << 16) | (u8[p + 1] << 8) | u8[p + 2] });
        p += l;
      } else if (st === 0xF0 || st === 0xF7) { const l = vlq(); p += l; }
      else {
        const type = st & 0xF0, ch = st & 15;
        if (type === 0xC0 || type === 0xD0) { ev.push({ tick, k: type === 0xC0 ? 'prog' : 'x', ch, a: u8[p] }); p += 1; }
        else {
          const a = u8[p], b = u8[p + 1]; p += 2;
          if (type === 0x90) ev.push({ tick, k: b > 0 ? 'on' : 'off', ch, a, b });
          else if (type === 0x80) ev.push({ tick, k: 'off', ch, a, b });
          else if (type === 0xB0) ev.push({ tick, k: 'cc', ch, a, b });
          else if (type === 0xE0) ev.push({ tick, k: 'bend', ch, a: ((b << 7) | a) - 8192 });
        }
      }
    }
    p = end;
    tracks.push(ev);
  }
  // merge + tempo map
  const all = [];
  tracks.forEach((ev, ti) => ev.forEach((e, i) => { e.o = ti * 1e6 + i; all.push(e); }));
  all.sort((x, y) => x.tick - y.tick || x.o - y.o);
  let tempo = 500000, lastTick = 0, time = 0;
  const out = [];
  for (const e of all) {
    time += (e.tick - lastTick) * tempo / (div * 1e6);
    lastTick = e.tick;
    if (e.k === 'tempo') { tempo = e.v; continue; }
    e.t = time; out.push(e);
  }
  return { events: out, duration: time };
}

function timbre(prog) {
  // [oscillator type, attack, decay-to level time, sustain, release, lowpass]
  if (prog < 8) return { type: 'triangle', a: 0.004, d: 0.5, s: 0.35, r: 0.12, lp: 5000 };
  if (prog < 16) return { type: 'sine', a: 0.003, d: 0.35, s: 0.15, r: 0.2, lp: 8000 };
  if (prog < 24) return { type: 'square', a: 0.01, d: 0.05, s: 0.55, r: 0.06, lp: 2500 };
  if (prog < 32) return { type: 'sawtooth', a: 0.003, d: 0.35, s: 0.25, r: 0.1, lp: 2800 };
  if (prog < 40) return { type: 'sawtooth', a: 0.005, d: 0.2, s: 0.55, r: 0.08, lp: 700 };
  if (prog < 56) return { type: 'sawtooth', a: 0.07, d: 0.2, s: 0.7, r: 0.2, lp: 2400 };
  if (prog < 64) return { type: 'sawtooth', a: 0.03, d: 0.1, s: 0.7, r: 0.08, lp: 3200 };
  if (prog < 80) return { type: 'square', a: 0.04, d: 0.1, s: 0.6, r: 0.1, lp: 3000 };
  if (prog < 88) return { type: 'square', a: 0.01, d: 0.1, s: 0.6, r: 0.08, lp: 4500 };
  if (prog < 104) return { type: 'triangle', a: 0.12, d: 0.3, s: 0.65, r: 0.35, lp: 3500 };
  return { type: 'sine', a: 0.005, d: 0.3, s: 0.3, r: 0.15, lp: 6000 };
}

class Player {
  constructor(is) {
    this.seq = null;
    try {
      const bytes = [];
      let b;
      while ((b = is.read()) >= 0) bytes.push(b);
      this.seq = parseMidi(Uint8Array.from(bytes));
    } catch (e) { this.seq = null; }
    this.loops = 1; this.listener = null; this.closed = false;
    this.playing = false; this.timer = null;
  }
  realize() {}
  prefetch() {}
  setLoopCount(n) { this.loops = n; }
  addPlayerListener(l) { this.listener = l; }
  getLevel() { return 100; }
  setLevel() {}

  start() {
    if (this.closed || !this.seq) return;
    const ctx = MidiAudio.ensure();
    if (!ctx) return;
    this.stop();
    this.playing = true;
    this.loopsLeft = this.loops;
    this.begin(ctx.currentTime + 0.05);
    this.timer = setInterval(() => this.pump(), 40);
  }

  begin(t0) {
    this.t0 = t0; this.idx = 0;
    this.chan = Array.from({ length: 16 }, () => ({ prog: 0, vol: 100, expr: 127, bend: 0 }));
    this.voices = [];
  }

  pump() {
    const ctx = MidiAudio.ctx;
    if (!this.playing || !ctx) return;
    const seq = this.seq;
    const horizon = ctx.currentTime + 0.25;
    while (this.idx < seq.events.length && this.t0 + seq.events[this.idx].t < horizon) {
      this.fire(seq.events[this.idx], this.t0 + seq.events[this.idx].t);
      this.idx++;
    }
    if (this.idx >= seq.events.length && ctx.currentTime > this.t0 + seq.duration + 0.3) {
      this.releaseAll(ctx.currentTime);
      if (this.loopsLeft === -1 || --this.loopsLeft > 0) { this.begin(Math.max(this.t0 + seq.duration + 0.3, ctx.currentTime)); }
      else {
        this.playing = false; clearInterval(this.timer); this.timer = null;
        if (this.listener) this.listener.playerUpdate(this, 'endOfMedia', null);
      }
    }
  }

  fire(e, when) {
    const ctx = MidiAudio.ctx, ch = this.chan[e.ch];
    switch (e.k) {
      case 'prog': ch.prog = e.a; break;
      case 'cc': if (e.a === 7) ch.vol = e.b; else if (e.a === 11) ch.expr = e.b; else if (e.a === 123 || e.a === 120) this.releaseChannel(e.ch, when); break;
      case 'bend': ch.bend = e.a / 8192 * 2; for (const v of this.voices) if (v.ch === e.ch && v.osc) v.osc.detune.setValueAtTime(ch.bend * 100, when); break;
      case 'on': if (e.ch === 9) this.drum(e.a, e.b, when); else this.note(e, when); break;
      case 'off': this.noteOff(e, when); break;
      default: break;
    }
  }

  note(e, when) {
    if (this.voices.length > 40) this.stealOldest(when);
    const ctx = MidiAudio.ctx, ch = this.chan[e.ch], tb = timbre(ch.prog);
    const f = 440 * Math.pow(2, (e.a - 69) / 12);
    const vel = (e.b / 127) * (ch.vol / 127) * (ch.expr / 127);
    const osc = ctx.createOscillator(); osc.type = tb.type; osc.frequency.value = f; osc.detune.value = ch.bend * 100;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(tb.lp, f * 8 + 400);
    const g = ctx.createGain();
    const peak = 0.28 * vel;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(peak, when + tb.a);
    g.gain.setTargetAtTime(peak * tb.s, when + tb.a, tb.d / 3);
    osc.connect(lp); lp.connect(g); g.connect(MidiAudio.master);
    osc.start(when);
    this.voices.push({ ch: e.ch, key: e.a, osc, g, tb, ended: false });
  }

  noteOff(e, when) {
    for (let i = 0; i < this.voices.length; i++) {
      const v = this.voices[i];
      if (v.ch === e.ch && v.key === e.a && !v.ended) { this.endVoice(v, when); this.voices.splice(i, 1); return; }
    }
  }

  endVoice(v, when) {
    v.ended = true;
    const g = v.g.gain;
    g.cancelScheduledValues(when);
    g.setTargetAtTime(0.0001, when, v.tb.r / 3);
    try { v.osc.stop(when + v.tb.r + 0.1); } catch (x) { /* already stopped */ }
  }

  releaseChannel(ch, when) {
    for (const v of this.voices) if (v.ch === ch && !v.ended) this.endVoice(v, when);
    this.voices = this.voices.filter((v) => !v.ended);
  }
  releaseAll(when) { for (const v of this.voices) if (!v.ended) this.endVoice(v, when); this.voices = []; }
  stealOldest(when) { const v = this.voices.shift(); if (v) this.endVoice(v, when); }

  drum(key, vel, when) {
    const ctx = MidiAudio.ctx, v = (vel / 127) * 0.6;
    const out = MidiAudio.master;
    const noiseBurst = (dur, type, freq, gain, q) => {
      const src = ctx.createBufferSource(); src.buffer = MidiAudio.noise;
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
      const g = ctx.createGain(); g.gain.setValueAtTime(gain * v, when); g.gain.exponentialRampToValueAtTime(0.001, when + dur);
      src.connect(f); f.connect(g); g.connect(out); src.start(when); src.stop(when + dur + 0.02);
    };
    const tone = (f0, f1, dur, gain) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, when); o.frequency.exponentialRampToValueAtTime(f1, when + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(gain * v, when); g.gain.exponentialRampToValueAtTime(0.001, when + dur);
      o.connect(g); g.connect(out); o.start(when); o.stop(when + dur + 0.02);
    };
    if (key === 35 || key === 36) tone(150, 45, 0.18, 1.1);
    else if (key === 38 || key === 40) { noiseBurst(0.14, 'highpass', 1500, 0.8); tone(220, 120, 0.08, 0.4); }
    else if (key === 37 || key === 39) noiseBurst(0.06, 'bandpass', 2000, 0.9, 2);
    else if (key === 42 || key === 44) noiseBurst(0.04, 'highpass', 7000, 0.5);
    else if (key === 46) noiseBurst(0.18, 'highpass', 6500, 0.5);
    else if (key === 49 || key === 57 || key === 51 || key === 52 || key === 55) noiseBurst(0.7, 'highpass', 5000, 0.5);
    else if (key >= 41 && key <= 50) tone(80 + (key - 41) * 20, 50, 0.22, 0.9);
    else noiseBurst(0.05, 'bandpass', 3000, 0.4, 1);
  }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.playing && MidiAudio.ctx) this.releaseAll(MidiAudio.ctx.currentTime);
    this.playing = false;
  }
  close() { this.closed = true; this.stop(); }
}
