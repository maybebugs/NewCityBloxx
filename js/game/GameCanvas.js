class GameCanvas extends Canvas {
  paintSoftKeys(g) {
    let baselineY = (GameMIDlet.screenHeight - 2);
    g.setClip(0, (GameMIDlet.screenHeight - ((((this.softKeyFont.getHeight() + 2)) + 4))), GameMIDlet.screenWidth, (((this.softKeyFont.getHeight() + 2)) + 4));
    g.setFont(this.softKeyFont);
    if (this.leftCommand != null) {
      if (this.leftIcon != null) {
        g.drawImage(this.leftIcon, 2, baselineY, 36);
      } else {
        let label = this.leftCommand.getLabel();
        let stringWidth = this.softKeyFont.stringWidth(label);
        let x = (((this.rightCommand != null)) ? 4 : (((GameMIDlet.screenWidth >> 1)) - ((stringWidth >> 1))));
        let textY = (baselineY - 1);
        g.setColor(0);
        g.drawString(label, (x - 1), textY, 36);
        g.drawString(label, x, (textY - 1), 36);
        g.drawString(label, (x + 1), textY, 36);
        g.drawString(label, x, (textY + 1), 36);
        g.setColor(16777215);
        g.drawString(label, x, textY, 36);
      }
    }
    if (this.rightCommand == null) {
      return;
    }
    if (this.rightIcon != null) {
      g.drawImage(this.rightIcon, (GameMIDlet.screenWidth - 2), baselineY, 40);
      return;
    }
    let rightX = (GameMIDlet.screenWidth - 3);
    baselineY--;
    g.setColor(0);
    g.drawString(this.rightCommand.getLabel(), (rightX - 1), baselineY, 40);
    g.drawString(this.rightCommand.getLabel(), rightX, (baselineY - 1), 40);
    g.drawString(this.rightCommand.getLabel(), (rightX + 1), baselineY, 40);
    g.drawString(this.rightCommand.getLabel(), rightX, (baselineY + 1), 40);
    g.setColor(16777215);
    g.drawString(this.rightCommand.getLabel(), rightX, baselineY, 40);
  }
  setMidlet(gameMIDlet) {
    this.midlet = gameMIDlet;
    this.setCloseHandler({
run: () => {
  new Thread({
run: () => {
  try {
    this.midlet.destroyFromLauncher();
  } catch (t) {
  }
  System.exit(0);
}
}).start();
  new Thread({
run: () => {
  try {
    Thread.sleep(4000);
  } catch (e) {
  }
  System.exit(0);
}
}).start();
}
});
  }
  removeCommand(command) {
    switch (command.getCommandType()) {
      case 1:
      case 4:
      case 5:
      case 8:
        this.leftCommand = null;
        this.leftIcon = null;
        return;
      case 2:
      case 3:
      case 6:
      case 7:
        this.rightCommand = null;
        this.rightIcon = null;
        return;
      default:
        return;
    }
  }
  setCommand(command, image) {
    switch (command.getCommandType()) {
      case 1:
      case 4:
      case 5:
      case 8:
        this.leftCommand = command;
        this.leftIcon = image;
        return;
      case 2:
      case 3:
      case 6:
      case 7:
        this.rightCommand = command;
        this.rightIcon = image;
        return;
      default:
        return;
    }
  }
  setActive(active) {
    if (active) {
      this.suppressPause = false;
      this.justActivated = true;
      Display.getDisplay(this.midlet).setCurrent(this);
      return;
    }
    this.suppressPause = true;
  }
  hideNotify() {
    try {
      if (!this.suppressPause) {
        this.midlet.pauseApp();
      }
    } catch (t) {
    }
  }
  keyPressed(keyCode) {
    if (keyCode === -6) {
      try {
        if (this.leftCommand != null) {
          this.midlet.handleCommand(this.leftCommand);
        }
      } catch (t) {
      }
    } else if (keyCode === -7) {
      if (this.rightCommand != null) {
        this.midlet.handleCommand(this.rightCommand);
      }
    } else if ((keyCode !== -11) && (keyCode !== -12)) {
      this.midlet.keyPressedRaw(keyCode);
    }
  }
  keyReleased(keyCode) {
    if ((keyCode !== -6) && (keyCode !== -7)) {
      try {
        this.midlet.keyReleasedRaw(keyCode);
      } catch (t) {
      }
    }
  }
  keyRepeated(keyCode) {
    if ((keyCode !== -6) && (keyCode !== -7)) {
      try {
        this.midlet.keyRepeatedRaw(keyCode);
      } catch (t) {
      }
    }
  }
  paint(g) {
    try {
      this.midlet.paintCanvas(g);
      this.paintSoftKeys(g);
    } catch (t) {
      console.error(t);
    }
  }
  showNotify() {
    try {
      if (this.justActivated) {
        this.justActivated = false;
      } else {
        this.midlet.resume();
      }
    } catch (t) {
    }
  }
  pointerPressed(pointerX, pointerY) {
    if (pointerY >= (GameMIDlet.screenHeight - 26)) {
      if (pointerX < ((GameMIDlet.screenWidth / 3) | 0)) {
        this.keyPressed(-6);
        setTimeout(() => this.keyReleased(-6), 120);
        return;
      } else if (pointerX > ((Math.imul(GameMIDlet.screenWidth, 2) / 3) | 0)) {
        this.keyPressed(-7);
        setTimeout(() => this.keyReleased(-7), 120);
        return;
      } else {
        this.keyPressed(-5);
        setTimeout(() => this.keyReleased(-5), 120);
        return;
      }
    }
    let currentScreen = ((this.midlet != null) ? this.midlet.getCurrentScreen() : null);
    if (currentScreen instanceof MenuController) {
      let item = Ui.getItemAt(pointerX, pointerY);
      if (item >= 0) {
        (currentScreen).selectItem(item);
        return;
      }
      this.keyPressed(-5);
      setTimeout(() => this.keyReleased(-5), 120);
      return;
    } else if (currentScreen instanceof StoreScreen) {
      currentScreen.pointerPressed(pointerX, pointerY);
      return;
    } else if (currentScreen instanceof House) {
      if (House.getMode() === 2) {
        if (CityMode.handleClick(pointerX, pointerY)) {
          return;
        }
      } else if (House.getMode() !== 7) {
        let m = House.getMode();
        if (m === 4 || m === 5 || m === 6 || m === 8) {
          // dialogs: behave exactly like the fire key (it also leaves the dialog state when it closes)
          this.keyPressed(-5);
          setTimeout(() => this.keyReleased(-5), 120);
          return;
        }
        House.dropBlock();
        return;
      }
    }
    this.keyPressed(-5);
    setTimeout(() => this.keyReleased(-5), 120);
  }
  pointerReleased(pointerX, pointerY) {
  }
  constructor() {
    super();
    this.midlet = null;
    this.justActivated = false;
    this.suppressPause = false;
    this.leftCommand = null;
    this.rightCommand = null;
    this.leftIcon = null;
    this.rightIcon = null;
    this.softKeyFont = Font.getFont(32, 1, 8);
  }
}

GameCanvas.$clinit = function () {

};
