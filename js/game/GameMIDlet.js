class GameMIDlet extends MIDlet {
  handleLoadingKeyPressed(keyCode, gameAction) {
    switch (this.loadState) {
      case 3:
        this.keyPressed(keyCode, gameAction);
        return;
      default:
        return;
    }
  }
  paintLoadingOverlay(g) {
    switch (this.loadState) {
      case 3:
        this.paintLoading(g);
        return;
      default:
        return;
    }
  }
  processLoading(keyCode, gameAction) {
    Ui.update(0);
    switch (this.loadState) {
      case -1:
        this.onLoadBeginWrapper();
        this.loadState = 3;
        return this.processLoading(keyCode, gameAction);
      case 3:
        Storage.setSetting(4, ((S.compare(Resources.getString$1(152), "1") === 0) ? 1 : 0));
        if (!this.soundAllowed) {
          this.sound.setEnabled(false);
        }
        if (this.loadStep(gameAction)) {
          return true;
        }
        if (!this.soundAllowed) {
          if (Storage.getSetting(3) === 1) {
            this.sound.setEnabled(true);
          }
          this.soundAllowed = true;
        }
        this.onLoadEndWrapper();
        this.loadState = -1;
        this.loading = false;
        Storage.setScreenId(0);
        return false;
      default:
        return true;
    }
  }
  releaseResources() {
    if (!this.resourcesReleased) {
      Resources.close();
      this.resourcesReleased = true;
    }
  }
  onLoadBeginWrapper() {
    this.onLoadBegin();
  }
  onLoadEndWrapper() {
    this.onLoadEnd();
  }
  calculateDeltaTime() {
    let i = 500;
    let currentTimeMillis = GameMIDlet.nowMs();
    let i2 = (((currentTimeMillis - this.lastFrameTime)) | 0);
    this.elapsedMs += i2;
    this.lastFrameTime = currentTimeMillis;
    if (i2 <= 500) {
      i = i2;
    }
    this.dtSum -= this.dtHistory[this.dtIndex];
    this.dtSum += i;
    this.dtHistory[this.dtIndex] = i;
    this.dtIndex = (((this.dtIndex + 1)) & 7);
    return this.dtSum >> 3;
  }
  getActiveScreen() {
    if (this.loading) {
      return null;
    }
    switch (Storage.getScreenId()) {
      case 0:
        return this.menu;
      case 1:
        return this;
      case 2:
        return this.highScores;
      case 3:
        return this.currentScreen;
      case 4:
        this.exitRequested = true;
        return null;
      case 6:
        return this.currentScreen;
      case 7:
        return this.store;
      default:
        return this.currentScreen;
    }
  }
  static getInstance() {
    return GameMIDlet.instance;
  }
  static saveSettingsRecord() {
    let dos = Storage.openWrite("settings");
    dos.writeInt(Storage.getSetting(0));
    dos.writeInt(Storage.getSetting(3));
    dos.close();
    Storage.close();
  }
  handleCommand(command) {
    if (this.currentScreen != null) {
      this.currentScreen.commandAction(command);
    } else if (this.loading && (this.loadState === 3)) {
      this.commandAction(command);
      this.handleLoadingKeyPressed(53, 8);
    }
  }
  paintCanvas(g) {
    if (!this.painting) {
      return;
    }
    if (this.currentScreen != null) {
      if ((this.currentScreen !== this) && Storage.dirty) {
        this.paintBackground(g);
      }
      this.currentScreen.paint(g, this.forceFullPaint);
    } else if (this.loading) {
      this.paintLoadingOverlay(g);
    }
    Coins.paintOverlay(g);   // [coins] effects + banners
  }
  destroyApp(unconditional) {
    try {
      this.destroyedExternally = true;
      this.exitRequested = true;
      if (this.thread != null) {
        this.thread.join();
        this.thread = null;
      }
    } catch (t) {
    }
  }
  keyReleasedRaw(keyCode) {
    if (this.currentScreen != null) {
      this.canvas.getGameAction(keyCode);
      if (this.currentScreen instanceof House) {
        (this.currentScreen).handleKeyReleased(keyCode);
      }
    }
  }
  keyPressedRaw(keyCode) {
    let i2 = 0;
    try {
      i2 = this.canvas.getGameAction(keyCode);
    } catch (e) {
    }
    if (this.currentScreen != null) {
      this.currentScreen.keyPressed(keyCode, i2);
    } else if (this.loading) {
      this.handleLoadingKeyPressed(keyCode, i2);
    }
  }
  keyRepeatedRaw(keyCode) {
    if (this.currentScreen != null) {
      this.canvas.getGameAction(keyCode);
    }
  }
  pauseApp() {
    try {
      this.sound.stopAll();
      if (!(((!this.loading || (this.loadState === 2)) || (this.loadState === 1)))) {
        this.soundAllowed = false;
        this.sound.setEnabled(false);
      }
      this.paused = true;
      this.onPause();
    } catch (t) {
    }
  }
  resume() {
    try {
      Storage.dirty = true;
      this.lastFrameTime = GameMIDlet.nowMs();
      this.paused = false;
      if (this.loadState !== -1) {
        Ui.update(0);
      }
    } catch (t) {
    }
  }
  static nowMs() {
    return Math.trunc(System.nanoTime() / 1000000);
  }
  paceFrame(frameStartNs) {
    let target = ((this.nextFrameNs === 0) ? (frameStartNs + GameMIDlet.FRAME_NS) : (this.nextFrameNs + GameMIDlet.FRAME_NS));
    let now = System.nanoTime();
    if (target < (now - GameMIDlet.FRAME_NS)) {
      target = now;
    }
    this.nextFrameNs = target;
    try {
      let left;
      while ((left = (target - System.nanoTime())) > 1500000) {
        Thread.sleep(Math.trunc(((left - 1000000)) / 1000000));
      }
      while ((target - System.nanoTime()) > 0) {
        Thread.yield();
      }
    } catch (e) {
      Thread.currentThread().interrupt();
    }
  }
  run() {
    this.lastTs = 0;
    const loop = (ts) => {
      if (ts - this.lastTs >= 15) {
        this.lastTs = ts;
        this.tick();
      }
      if (!this.exitRequested) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  tick() {
    if (!this.exitRequested) {
      let frameStartNs = System.nanoTime();
      try {
        if (!this.paused) {
          let i = this.calculateDeltaTime();
          this.currentScreen = this.getActiveScreen();
          if (this.currentScreen != null) {
            this.currentScreen.onModeChange();
            let p = this.getActiveScreen();
            if (this.currentScreen !== p) {
              if (p != null) {
                p.onEnter();
                this.resetTiming();
              }
              this.currentScreen = p;
            } else if (this.currentScreen === this.menu) {
              this.onMenuTick();
            }
            if (!((this.exitRequested || this.paused))) {
              if (this.currentScreen !== this) {
                this.updateBackground(i);
              }
              this.currentScreen.update(i, this.elapsedMs);
              this.repaintNow();
            }
          } else if (this.loading) {
            let d = this.processLoading(i, this.elapsedMs);
            if (!(((this.exitRequested || this.paused) || !d))) {
              this.repaintNow();
            }
          }
        }
      } catch (t) {
        console.error(t);
      }
    }
    try {
      if (this.exitRequested) {
        this.sound.stopAll();
        GameMIDlet.saveSettingsRecord();
        this.saveSettings();
        this.saveGame();
        this.releaseResources();
        if (!this.destroyedExternally) {
          this.notifyDestroyed();
        }
      }
    } catch (th2) {
    }
  }
  repaintNow() {
    this.painting = true;
    let canvas = this.canvas;
    canvas.repaint();
    canvas.serviceRepaints();
    this.painting = false;
  }
  startApp() {
    try {
      if (this.started) {
        this.resume();
        return;
      }
      this.loading = true;
      this.onInit();
      this.onLoad();
      this.canvas.setMidlet(this);
      this.canvas.setActive(true);
      this.thread = { join() {} };
      this.run();
      this.started = true;
    } catch (t) {
      console.error(t);
    }
  }
  fullRepaint() {
    this.forceFullPaint = true;
    this.repaintNow();
    this.forceFullPaint = false;
  }
  resetTiming() {
    let i = 0;
    this.elapsedMs = 0;
    this.lastFrameTime = GameMIDlet.nowMs();
    this.dtIndex = 0;
    while (i < 8) {
      this.dtHistory[i] = 40;
      i++;
    }
    this.dtSum = 320;
  }
  getCurrentScreen() {
    return this.currentScreen;
  }
  constructor() {
    super();
    this.highScores = null;
    this.painting = false;
    this.loadState = -1;
    this.thread = null;
    this.elapsedMs = -1;
    this.lastFrameTime = -1;
    this.dtSum = -1;
    this.currentScreen = null;
    this.exitRequested = false;
    this.started = false;
    this.destroyedExternally = false;
    this.paused = false;
    this.resourcesReleased = false;
    this.forceFullPaint = false;
    this.loading = false;
    this.soundAllowed = true;
    this.dtIndex = -1;
    this.dtHistory = null;
    this.canvas = null;
    this.sound = null;
    this.vibra = null;
    this.menu = null;
    this.store = null;
    this.nextFrameNs = 0;
    GameMIDlet.instance = this;
    try {
      this.dtHistory = new Int32Array(8);
      this.resetTiming();
      this.canvas = PlatformFactory.createCanvas();
      GameMIDlet.screenWidth = this.canvas.getWidth();
      GameMIDlet.screenHeight = this.canvas.getHeight();
      this.sound = PlatformFactory.createSoundPlayer();
      this.sound.setEnabled(true);
      Storage.setSetting(3, 1);
      Storage.setSetting(0, 1);
      this.vibra = PlatformFactory.createVibra();
      this.menu = new MenuController(this.canvas);
      this.store = new StoreScreen(this.menu, this.canvas);
      let dis = Storage.openRead("settings");
      if (dis != null) {
        Storage.setSetting(0, dis.readInt());
        Storage.setSetting(3, dis.readInt());
        if (Storage.getSetting(3) === 0) {
          this.sound.setEnabled(false);
        }
        dis.close();
      }
      Storage.close();
      Resources.init();
      Ui.setColorPalette(MenuController.getMenuHierarchy());
      Storage.setMenuFlag(4, 1);
      this.highScores = PlatformFactory.createHighScores();
      this.highScores.init(this, this.menu, this.canvas);
      Storage.setMenuFlag(7, 1);
      Storage.setMenuFlag(6, 1);
    } catch (t) {
      console.error(t);
    }
  }
}

GameMIDlet.$clinit = function () {
  GameMIDlet.screenWidth = 0;
  GameMIDlet.screenHeight = 0;
  GameMIDlet.instance = null;
  GameMIDlet.TARGET_FPS = 60;
  GameMIDlet.FRAME_NS = Math.trunc(1000000000 / GameMIDlet.TARGET_FPS);
};
