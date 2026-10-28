class SoundPlayer {
  stopLoopIfNeeded() {
    if ((this.loopPlayer != null) && !this.loopStopped) {
      this.stopLoopPlayer();
    }
  }
  startPlayer(resourceId, loopCount) {
    if (this.enabled && (resourceId !== -1)) {
      try {
        this.player = new Player(new ByteArrayInputStream(Resources.getBytes(resourceId)));
        this.player.setLoopCount(loopCount);
        this.player.addPlayerListener(this);
        this.player.prefetch();
        this.player.start();
      } catch (e) {
      }
    }
  }
  closeIfOwned() {
    if ((this.player != null) && this.ownsPlayer) {
      this.closePlayer();
    }
    this.ownsPlayer = false;
  }
  closePlayer() {
    try {
      this.player.close();
      this.player = null;
    } catch (e) {
    }
  }
  restartPlayer() {
    try {
      this.player.start();
    } catch (e) {
    }
  }
  stopLoopPlayer() {
    try {
      this.loopPlayer.stop();
    } catch (e) {
    }
  }
  stopAll() {
    this.closeIfOwned();
    this.stopLoopIfNeeded();
  }
  play(resourceId, loopCount) {
    if (this.enabled && (resourceId !== -1)) {
      this.closeIfOwned();
      this.ownsPlayer = true;
      this.startPlayer(resourceId, loopCount);
    }
  }
  preload(resourceId, load) {
    if (!this.preloaded.containsKey(resourceId) && load) {
      try {
        this.tempPlayer = new Player(new ByteArrayInputStream(Resources.getBytes(resourceId)));
        this.tempPlayer.realize();
        this.tempPlayer.prefetch();
        this.preloaded.put(resourceId, this.tempPlayer);
      } catch (e) {
      }
    }
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!this.enabled) {
      this.stopAll();
    }
  }
  playerUpdate(source, event, data) {
    if ((event !== "endOfMedia") || (source !== this.loopPlayer)) {
      return;
    }
    if (this.loopCount === 0) {
      this.restartPlayer();
      return;
    }
    if (this.loopCount !== -1) {
      this.loopCount--;
    }
    try {
      this.loopPlayer.start();
    } catch (e) {
    }
  }
  constructor() {
    this.player = null;
    this.loopPlayer = null;
    this.loopCount = 0;
    this.preloaded = new Hashtable();
    this.tempPlayer = null;
    this.enabled = true;
    this.ownsPlayer = false;
    this.loopStopped = false;
  }
}

SoundPlayer.$clinit = function () {

};
