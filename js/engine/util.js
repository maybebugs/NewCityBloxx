/* Java compatibility helpers used by the transpiled game classes. */
'use strict';

/** Java-style string conversion of a float/double ("1" -> "1.0"). */
function fstr(x) {
  if (Number.isInteger(x)) return x.toFixed(1);
  return String(x);
}

function hashCode(o) {
  if (typeof o === 'string') {
    let h = 0;
    for (let i = 0; i < o.length; i++) h = (Math.imul(31, h) + o.charCodeAt(i)) | 0;
    return h;
  }
  return 0;
}

/** new int[a][b]... (fully or partially specified). */
function mkArr(base, dims, extra) {
  const make = (d) => {
    const n = dims[d];
    if (d === dims.length - 1) {
      if (extra > 0 || base === null) return new Array(n).fill(null);
      switch (base) {
        case 'int': return new Int32Array(n);
        case 'short': return new Int16Array(n);
        case 'byte': return new Int8Array(n);
        case 'char': return new Uint16Array(n);
        case 'float': return new Float32Array(n);
        case 'double': case 'long': return new Float64Array(n);
        case 'boolean': return new Array(n).fill(false);
        default: return new Array(n).fill(null);
      }
    }
    const a = new Array(n);
    for (let i = 0; i < n; i++) a[i] = make(d + 1);
    return a;
  };
  return make(0);
}

/** java.lang.reflect.Array.newInstance(componentType, int[] dims) */
function newInstanceArr(type, dims) {
  if (typeof dims === 'number') dims = [dims];
  const base = (typeof type === 'string') ? type : null;   // String.class -> null element
  return mkArr(base, Array.from(dims), 0);
}

const S = {
  compare(a, b) {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const d = a.charCodeAt(i) - b.charCodeAt(i);
      if (d !== 0) return d;
    }
    return a.length - b.length;
  },
  toCharArray(s) {
    const r = new Uint16Array(s.length);
    for (let i = 0; i < s.length; i++) r[i] = s.charCodeAt(i);
    return r;
  },
  getBytes(s) { return new Int8Array(new TextEncoder().encode(s)); },
  newString(a) {
    if (a === undefined) return '';
    if (typeof a === 'string') return a;
    if (a instanceof Uint16Array) return String.fromCharCode.apply(null, a);
    return new TextDecoder().decode(Uint8Array.from(a, (v) => v & 255));
  },
};

const Integer = {
  MAX_VALUE: 2147483647, MIN_VALUE: -2147483648, TYPE: 'int',
  parseInt(s, radix) {
    const v = parseInt(s, radix || 10);
    if (Number.isNaN(v) || !/^[+-]?[0-9a-zA-Z]+$/.test(String(s).trim())) throw new Error('NumberFormatException: ' + s);
    return v | 0;
  },
  toHexString(v) { return (v >>> 0).toString(16); },
  valueOf(v) { return v; },
};

const Character = {
  isDigit(c) { return c >= 48 && c <= 57; },
  isLetter(c) { return /\p{L}/u.test(String.fromCharCode(c)); },
  toUpperCase(c) { return String.fromCharCode(c).toUpperCase().charCodeAt(0); },
  toLowerCase(c) { return String.fromCharCode(c).toLowerCase().charCodeAt(0); },
};

const System = {
  out: { println(s) { console.log(s); }, print(s) { console.log(s); } },
  err: { println(s) { console.error(s); }, print(s) { console.error(s); } },
  currentTimeMillis() { return Date.now(); },
  nanoTime() { return Math.floor(performance.now() * 1e6); },
  arraycopy(src, sp, dst, dp, n) {
    if (src === dst && sp < dp) { for (let i = n - 1; i >= 0; i--) dst[dp + i] = src[sp + i]; }
    else for (let i = 0; i < n; i++) dst[dp + i] = src[sp + i];
  },
  gc() {},
  exit() {},
  setProperty() {},
};

const Thread = { sleep() {}, yield() {}, currentThread() { return { interrupt() {} }; } };

class JRandom {
  nextInt(bound) {
    if (bound === undefined) return (Math.random() * 4294967296) | 0;
    return Math.floor(Math.random() * bound);
  }
}

class Vector {
  constructor() { this.a = []; }
  addElement(o) { this.a.push(o); }
  add(o) { this.a.push(o); return true; }
  elementAt(i) { return this.a[i]; }
  get(i) { return this.a[i]; }
  firstElement() { return this.a[0]; }
  lastElement() { return this.a[this.a.length - 1]; }
  size() { return this.a.length; }
  removeAllElements() { this.a.length = 0; }
  removeElementAt(i) { this.a.splice(i, 1); }
  insertElementAt(o, i) { this.a.splice(i, 0, o); }
  setElementAt(o, i) { this.a[i] = o; }
  isEmpty() { return this.a.length === 0; }
  copyInto(arr) { for (let i = 0; i < this.a.length; i++) arr[i] = this.a[i]; }
}

class Hashtable {
  constructor() { this.m = new Map(); }
  get(k) { const v = this.m.get(k); return v === undefined ? null : v; }
  put(k, v) { const o = this.get(k); this.m.set(k, v); return o; }
  containsKey(k) { return this.m.has(k); }
  remove(k) { const o = this.get(k); this.m.delete(k); return o; }
  size() { return this.m.size; }
  clear() { this.m.clear(); }
}
const HashMap = Hashtable;

class StringBuffer {
  constructor(s) { this.s = s === undefined || typeof s === 'number' ? '' : String(s); }
  append(x) { this.s += x; return this; }
  length() { return this.s.length; }
  charAt(i) { return this.s.charCodeAt(i); }
  toString() { return this.s; }
  setLength(n) { this.s = this.s.substring(0, n); }
  deleteCharAt(i) { this.s = this.s.substring(0, i) + this.s.substring(i + 1); return this; }
  insert(i, x) { this.s = this.s.substring(0, i) + x + this.s.substring(i); return this; }
}
const StringBuilder = StringBuffer;
