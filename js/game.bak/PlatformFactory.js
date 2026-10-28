class PlatformFactory {
  static createCanvas() {
    return new GameCanvas();
  }
  static createVibra() {
    return new Vibra();
  }
  static createSoundPlayer() {
    return new SoundPlayer();
  }
  static createHighScores() {
    HighScores.$clinit();
    return new HighScores();
  }
}

PlatformFactory.$clinit = function () {

};
