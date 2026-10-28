'use strict';

/** User-added tower-top models (the web version of dropping files into assets/bonus). Persisted in IndexedDB. */
const UserModels = {
  db() {
    return new Promise((res) => {
      try {
        const r = indexedDB.open('citybloxx', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('bonus');
        r.onsuccess = () => res(r.result);
        r.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  },
  decodePng(name, bytes) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(new Blob([bytes], { type: /\.png$/i.test(name) ? 'image/png' : /\.gif$/i.test(name) ? 'image/gif' : 'image/jpeg' }));
      const img = document.createElement('img');
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0); URL.revokeObjectURL(url); resolve(c);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  },
  async register(name, bytes) {
    const isImg = /\.(png|jpe?g|gif)$/i.test(name);
    if (isImg) {
      const c = await UserModels.decodePng(name, bytes);
      if (!c) return false;
      Assets.imgs['bonus/' + name] = c; Assets.imgs['bonus/textures/' + name] = c;
      Assets.files['bonus/textures/' + name] = bytes;
    } else Assets.files['bonus/' + name] = bytes;
    return true;
  },
  async restore() {
    const db = await UserModels.db();
    if (!db) return;
    await new Promise((res) => {
      const tx = db.transaction('bonus', 'readonly'), st = tx.objectStore('bonus'), req = st.openCursor();
      const jobs = [];
      req.onsuccess = () => {
        const cur = req.result;
        if (cur) { jobs.push(UserModels.register(cur.key, new Uint8Array(cur.value))); cur.continue(); }
        else Promise.all(jobs).then(res);
      };
      req.onerror = () => res();
    });
  },
  async add(files) {
    const db = await UserModels.db();
    let n = 0;
    for (const f of files) {
      const name = f.name.replace(/[\\/]/g, '_');
      if (!/\.(obj|mtl|properties|png|jpe?g|gif)$/i.test(name)) continue;
      const bytes = new Uint8Array(await f.arrayBuffer());
      if (!(await UserModels.register(name, bytes))) continue;
      n++;
      if (db) db.transaction('bonus', 'readwrite').objectStore('bonus').put(bytes, name);
    }
    return n;
  },
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(UserModels.tt); UserModels.tt = setTimeout(() => { t.style.display = 'none'; }, 3500);
  },
};
(async function () {
  const pct = document.getElementById('pct');
  await Assets.load((p) => { pct.textContent = Math.round(p * 100) + '%'; });
  // web fonts (subset of DejaVu Sans Mono) so text metrics are identical everywhere
  try {
    for (const [file, weight] of [['fonts/mono.woff', 'normal'], ['fonts/mono-bold.woff', 'bold']]) {
      const ff = new FontFace('DejaVu Sans Mono', Assets.readBytes(file).buffer, { weight });
      await ff.load(); document.fonts.add(ff);
    }
  } catch (e) { console.warn('font load failed', e); }
  await UserModels.restore();
  const order = ['Storage', 'Coins', 'Lang', 'Resources', 'Vibra', 'SoundPlayer', 'Mesh3D', 'CustomTops', 'Renderer3D', 'Ui', 'CityMode', 'GameMIDlet', 'House', 'MenuController', 'GameCanvas', 'StoreScreen', 'PlatformFactory'];
  for (const n of order) eval(n + '.$clinit()');       // HighScores statics are initialised lazily (needs screen size)
  document.getElementById('loading').style.display = 'none';
  const game = new House();
  window.game = game;
  document.getElementById('bBack').onclick = (e) => {
    e.target.blur();
    const c = Canvas.current;
    c.keyPressed(-7); setTimeout(() => c.keyReleased(-7), 120);   // right soft key = Back / Exit
  };
  document.getElementById('bAdd').onclick = (e) => { e.target.blur(); document.getElementById('fileIn').click(); };
  document.getElementById('fileIn').onchange = async (e) => {
    const n = await UserModels.add(Array.from(e.target.files));
    e.target.value = '';
    UserModels.toast(n > 0 ? 'Added ' + n + ' file(s). Open the Store to use them.' : 'No usable files selected');
    if (n > 0) CustomTops.reloadAll();
  };
  // toolbar: fullscreen / sound / sprite smoothing
  const full = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); };
  const snd = document.getElementById('bSnd'), sm = document.getElementById('bSm');
  const showSnd = () => { snd.textContent = MidiAudio.muted ? '🔇' : '🔊'; snd.classList.toggle('off', MidiAudio.muted); };
  const showSm = () => sm.classList.toggle('off', !Graphics.smooth);
  const toggleSnd = () => { MidiAudio.setMuted(!MidiAudio.muted); showSnd(); };
  const toggleSm = () => { Graphics.smooth = !Graphics.smooth; try { localStorage.setItem('citybloxx.smooth', Graphics.smooth ? '1' : '0'); } catch (e) {} showSm(); };
  try { Graphics.smooth = localStorage.getItem('citybloxx.smooth') === '1'; } catch (e) {}
  document.getElementById('bFull').onclick = (e) => { e.target.blur(); full(); };
  snd.onclick = (e) => { e.target.blur(); MidiAudio.unlock(); toggleSnd(); };
  sm.onclick = (e) => { e.target.blur(); toggleSm(); };
  showSnd(); showSm();
  window.addEventListener('keydown', (e) => {
    if (Display.formOpen || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'KeyF') full(); else if (e.code === 'KeyM') toggleSnd(); else if (e.code === 'KeyP') toggleSm();
  });
  game.startFromLauncher();
  Coins.checkDaily();   // welcome gift / daily streak bonus (shown as a banner)
})().catch((e) => { console.error(e); document.getElementById('pct').textContent = 'Error: ' + e.message; });
