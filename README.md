# City Bloxx – browser port (JavaScript)

Open `index.html` in any modern browser (works straight from the file system – no server needed).

## Controls
Arrow keys / WASD – move, **Space / Enter** – select / drop block, **F1** – left soft key, **Esc** – right soft key,
Backspace – clear, mouse click / touch – tap (drops the block), mouse wheel – up/down in menus.
**F** fullscreen, **M** sound on/off, **P** smooth/crisp sprites (also toolbar buttons, top right).
Toolbar (top right): ↩️ Back (same as Esc), 📦 add models, fullscreen, sound, sprite smoothing.
In the Store on touch screens: tap a tower chip to pick it, tap the left/right side of the preview (or the ◀ ▶ arrows) for the previous/next top, tap the middle to equip, and use ↩️ or the bottom-right "Back" to leave.
Language follows the browser language (`?lang=de` overrides). Progress and high scores are stored in `localStorage`.

## Layout
- `index.html`, `style.css`, `assets.js` (all game assets, base64) – page + data
- `js/engine/` – platform layer written for the browser: Canvas 2D graphics, software 3D rasteriser + OBJ loader,
  Web Audio MIDI player, byte streams, storage, input
- `js/game/` – the game itself (House, CityMode, Ui, MenuController, HighScores, …), translated 1:1 from the Java sources
  with `tools/j2js.py` (type-aware Java→JS translator) and then patched (main loop → requestAnimationFrame,
  resource loading, locale)
- `tools/bundle.py` – rebuilds `assets.js` from the original `assets/` folder

## Rendering
The game renders at the real screen resolution (integer scale 1–4×, text and shapes as vectors, 3D at up to 2×; `?q3d=3` raises 3D quality).
Sprites are scaled crisp by default; press **P** for smoothed sprites.

## Coins
Earn coins by stacking (perfects, combos, finished towers, daily streak) and spend them in the Store to unlock tops. Full economy and price list: `COINS_DESIGN.md`. Progress is stored in `localStorage` (`citybloxx.coins`).

## New in the upgraded version
- **Pink Tower** – 5th building in City mode (unlocks at level 13), own models, sprites and goal. It is a regular tower type 5 (50 floors) driven by the same per-type tables as the other four (`tools/patch_pink.py`, `tools/fix_pink_sprites.py`).
- **Store** (main menu) – choose a custom 3D top for each of the 5 towers (Left/Right = tower, Up/Down = top, Enter = equip, 0 = reload).
  34 extra tops are bundled. The 📦 button (top right) adds your own `.obj` (+ `.mtl`, textures, optional `.properties` – see below);
  files are kept in the browser (IndexedDB), choices in localStorage.
- **Free camera** – **C** toggles it; **W/A/S/D** move, **Q/E** turn, **Z/X** look up/down.
- Transparent texture texels are no longer drawn black.

`.properties` keys next to a model: `name`, `scale`, `rotate`, `yoffset`, `fit`, `fitgameplay`, `height`, `maxwidth`, `size=WxH`, `cull=back`.
