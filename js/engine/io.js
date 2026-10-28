/* java.io replacements: byte streams over typed arrays. */
'use strict';

class ByteArrayInputStream {
  constructor(buf, off, len) {
    this.b = buf instanceof Uint8Array ? buf : new Uint8Array(buf.buffer ? buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) : buf);
    this.p = off || 0;
    this.end = len === undefined ? this.b.length : Math.min(this.b.length, this.p + len);
    this.markPos = 0;
  }
  read() { return this.p < this.end ? this.b[this.p++] : -1; }
  available() { return this.end - this.p; }
  skip(n) { const k = Math.max(0, Math.min(n, this.end - this.p)); this.p += k; return k; }
  markSupported() { return true; }
  mark() { this.markPos = this.p; }
  reset() { this.p = this.markPos; }
  close() {}
}

class DataInputStream {
  constructor(is) { this.is = is; }
  eof() { throw new Error('EOFException'); }
  read() { return this.is.read(); }
  available() { return this.is.available(); }
  readUnsignedByte() { const v = this.is.read(); if (v < 0) this.eof(); return v; }
  readByte() { return (this.readUnsignedByte() << 24) >> 24; }
  readBoolean() { return this.readUnsignedByte() !== 0; }
  readUnsignedShort() { const a = this.readUnsignedByte(), b = this.readUnsignedByte(); return (a << 8) | b; }
  readShort() { return (this.readUnsignedShort() << 16) >> 16; }
  readChar() { return this.readUnsignedShort(); }
  readInt() {
    const a = this.readUnsignedByte(), b = this.readUnsignedByte(), c = this.readUnsignedByte(), d = this.readUnsignedByte();
    return (a << 24) | (b << 16) | (c << 8) | d;
  }
  skipBytes(n) { return n > 0 ? this.is.skip(n) : 0; }
  markSupported() { return this.is.markSupported(); }
  mark(n) { this.is.mark(n); }
  reset() { this.is.reset(); }
  readFully(arr) { for (let i = 0; i < arr.length; i++) arr[i] = this.readUnsignedByte(); }
  readUTF() {
    const n = this.readUnsignedShort();
    let s = '';
    let i = 0;
    const bytes = new Uint8Array(n);
    for (let k = 0; k < n; k++) bytes[k] = this.readUnsignedByte();
    while (i < n) {
      const c = bytes[i];
      if (c < 0x80) { s += String.fromCharCode(c); i++; }
      else if ((c & 0xE0) === 0xC0) { s += String.fromCharCode(((c & 0x1F) << 6) | (bytes[i + 1] & 0x3F)); i += 2; }
      else { s += String.fromCharCode(((c & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F)); i += 3; }
    }
    return s;
  }
  close() { this.is.close(); }
}

class ByteArrayOutputStream {
  constructor() { this.a = []; }
  write(b) { this.a.push(b & 255); }
  toByteArray() { return Int8Array.from(this.a); }
  size() { return this.a.length; }
  close() {}
}

class DataOutputStream {
  constructor(os) { this.os = os; }
  write(b) { this.os.write(b); }
  writeByte(v) { this.os.write(v); }
  writeBoolean(v) { this.os.write(v ? 1 : 0); }
  writeShort(v) { this.os.write(v >> 8); this.os.write(v); }
  writeChar(v) { this.writeShort(v); }
  writeInt(v) { this.os.write(v >> 24); this.os.write(v >> 16); this.os.write(v >> 8); this.os.write(v); }
  writeUTF(s) {
    const bytes = [];
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c >= 1 && c < 0x80) bytes.push(c);
      else if (c < 0x800) bytes.push(0xC0 | (c >> 6), 0x80 | (c & 63));
      else bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    this.writeShort(bytes.length);
    for (const b of bytes) this.os.write(b);
  }
  close() { this.os.close(); }
}
const InputStream = ByteArrayInputStream;
