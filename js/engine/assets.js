/* Asset access. All game data is bundled in window.__ASSETS (base64) so the game also runs from file://. */
'use strict';

class Assets {
  static async load(onProgress) {
    const src = window.__ASSETS || {};
    const names = Object.keys(src);
    Assets.files = Object.create(null);
    Assets.imgs = Object.create(null);
    const pending = [];
    let done = 0;
    for (const name of names) {
      const bin = atob(src[name]);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      Assets.files[name] = u8;
      if (name.endsWith('.png')) {
        pending.push(new Promise((resolve) => {
          const img = document.createElement('img');
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            Assets.imgs[name] = c;
            if (onProgress) onProgress(++done / pending.length);
            resolve();
          };
          img.onerror = () => { console.error('bad png ' + name); resolve(); };
          img.src = 'data:image/png;base64,' + src[name];
        }));
      }
    }
    await Promise.all(pending);
  }

  static clean(path) {
    if (path == null) return null;
    let p = String(path).replace(/\\/g, '/');
    while (p.startsWith('/')) p = p.substring(1);
    if (p.indexOf('..') >= 0) return null;
    return p;
  }

  /** Opens an asset as a stream; null when missing. */
  static open(path) {
    const p = Assets.clean(path);
    const u8 = p && Assets.files[p];
    return u8 ? new ByteArrayInputStream(u8) : null;
  }

  static readBytes(path) {
    const p = Assets.clean(path);
    return (p && Assets.files[p]) || null;
  }

  static text(path) {
    const u8 = Assets.readBytes(path);
    return u8 ? new TextDecoder('utf-8').decode(u8) : null;
  }

  static canvasOf(path) {
    const p = Assets.clean(path);
    return (p && Assets.imgs[p]) || null;
  }

  static dirOf(path) {
    const i = path.lastIndexOf('/');
    return i < 0 ? '' : path.substring(0, i + 1);
  }
}
Assets.findPrefix = function (prefix) {
  for (const k of Object.keys(Assets.files)) if (k.startsWith(prefix)) return k;
  return null;
};

/** Names of the files directly inside a bundled folder, e.g. "bonus" (sorted). */
Assets.list = function (dir) {
  let clean = String(dir).replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
  if (clean.indexOf('..') >= 0) return [];
  const prefix = clean + '/', out = [];
  for (const k of Object.keys(Assets.files)) {
    if (k.startsWith(prefix) && k.indexOf('/', prefix.length) < 0 && k.length > prefix.length) out.push(k.substring(prefix.length));
  }
  return out.sort();
};
