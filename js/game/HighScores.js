class HighScores {
  save() {
    try {
      let dos = Storage.openWrite("HoF");
      dos.writeUTF(this.playerName);
      for (let i = 0; i < HighScores.layout.length; i++) {
        for (let i2 = 0; i2 < 3; i2++) {
          dos.writeUTF(this.names[i][i2]);
          for (const writeInt of this.scores[i][i2]) {
            dos.writeInt(writeInt);
          }
        }
      }
      dos.close();
      Storage.close();
    } catch (e) {
    }
  }
  paintScoreTable(g) {
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    g.setFont(HighScores.bodyFont);
    g.setColor(0);
    let isRtl = ((Storage.getSetting(4) === 1));
    let topSectionX = (isRtl ? ((HighScores.rightEdge - 8)) : ((HighScores.nameX + 8)));
    let topAnchor = (isRtl ? 24 : 20);
    g.setFont(HighScores.boldFont);
    g.drawString((Resources.getString$1(92) + ":"), topSectionX, 42, topAnchor);
    g.setFont(HighScores.bodyFont);
    let curY = (HighScores.lineHeight + 42);
    let modeLabel = (isRtl ? ((" " + Resources.getString$1(154))) : ((Resources.getString$1(154) + " ")));
    g.drawString(modeLabel, topSectionX, curY, topAnchor);
    curY += HighScores.lineHeight;
    g.drawImage(HighScores.gradientHeader, 0, (curY - 3), 20);
    let iconX = (isRtl ? ((topSectionX - HighScores.headerScoreIcon.getWidth())) : topSectionX);
    g.setClip(iconX, (curY + 2), HighScores.headerScoreIcon.getWidth(), HighScores.headerScoreIcon.getHeight());
    g.drawImage(HighScores.headerScoreIcon, iconX, (curY + 2), 20);
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    let scoreStr = this.midlet.formatNumber(this.scores[0][0][0]);
    if (isRtl) {
      g.drawString(scoreStr, (((iconX - 8)) - HighScores.bodyFont.stringWidth("000000")), curY, 20);
    } else {
      g.drawString(scoreStr, ((((iconX + HighScores.headerScoreIcon.getWidth()) + 8)) + HighScores.bodyFont.stringWidth("000000")), curY, 24);
    }
    curY += (((Math.imul(HighScores.lineHeight, 3)) / 2) | 0);
    g.setFont(HighScores.boldFont);
    g.drawString((Resources.getString$1(91) + ":"), topSectionX, curY, topAnchor);
    g.setFont(HighScores.bodyFont);
    let rowY = (curY + HighScores.lineHeight);
    for (let row = 0; row < 3; row++) {
      g.drawImage(HighScores.gradientRow, 0, (rowY - 3), 20);
      let rankStr = (((row + 1)) + ". ");
      if (isRtl) {
        g.drawString(rankStr, HighScores.rightEdge, rowY, 20);
      } else {
        g.drawString(rankStr, HighScores.nameX, rowY, 24);
      }
      let playerName = this.names[1][row];
      if (isRtl) {
        let nameIconX = (HighScores.scoreRight - HighScores.rowScoreIcon.getWidth());
        g.setClip(nameIconX, (rowY + 2), HighScores.rowScoreIcon.getWidth(), HighScores.rowScoreIcon.getHeight());
        g.drawImage(HighScores.rowScoreIcon, nameIconX, (rowY + 2), 20);
        g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        g.drawString(playerName, (nameIconX - 8), rowY, 24);
      } else {
        g.setClip(HighScores.scoreLeft, (rowY + 2), HighScores.rowScoreIcon.getWidth(), HighScores.rowScoreIcon.getHeight());
        g.drawImage(HighScores.rowScoreIcon, HighScores.scoreLeft, (rowY + 2), 20);
        g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        g.drawString(playerName, ((HighScores.scoreLeft + HighScores.rowScoreIcon.getWidth()) + 8), rowY, 20);
      }
      rowY += HighScores.lineHeight;
      let rowScoreStr = this.midlet.formatNumber(this.scores[1][row][0]);
      if (isRtl) {
        let hIconX = (HighScores.scoreRight - HighScores.headerScoreIcon.getWidth());
        g.setClip(hIconX, (rowY + 2), HighScores.headerScoreIcon.getWidth(), HighScores.headerScoreIcon.getHeight());
        g.drawImage(HighScores.headerScoreIcon, hIconX, (rowY + 2), 20);
        g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        let scoreTextX = (((hIconX - 8)) - HighScores.bodyFont.stringWidth("000000"));
        g.drawString(rowScoreStr, scoreTextX, rowY, 20);
        let floorsStr = this.midlet.formatNumber(this.scores[1][row][1]);
        let uIconX = (((scoreTextX - 64)) - HighScores.unusedIcon.getWidth());
        g.setClip(uIconX, (rowY + 2), HighScores.unusedIcon.getWidth(), HighScores.unusedIcon.getHeight());
        g.drawImage(HighScores.unusedIcon, uIconX, (rowY + 2), 20);
        g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        g.drawString(floorsStr, (((uIconX - 8)) - HighScores.bodyFont.stringWidth("000")), rowY, 20);
      } else {
        g.setClip(HighScores.scoreLeft, (rowY + 2), HighScores.headerScoreIcon.getWidth(), HighScores.headerScoreIcon.getHeight());
        g.drawImage(HighScores.headerScoreIcon, HighScores.scoreLeft, (rowY + 2), 20);
        g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        let scoreTextX = ((((HighScores.scoreLeft + HighScores.headerScoreIcon.getWidth()) + 8)) + HighScores.bodyFont.stringWidth("000000"));
        g.drawString(rowScoreStr, scoreTextX, rowY, 24);
        let floorsStr = this.midlet.formatNumber(this.scores[1][row][1]);
        let uIconX = (scoreTextX + 64);
        g.setClip(uIconX, (rowY + 2), HighScores.unusedIcon.getWidth(), HighScores.unusedIcon.getHeight());
        g.drawImage(HighScores.unusedIcon, uIconX, (rowY + 2), 20);
        g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        g.drawString(floorsStr, ((((uIconX + HighScores.unusedIcon.getWidth()) + 8)) + HighScores.bodyFont.stringWidth("000")), rowY, 24);
      }
      rowY += HighScores.lineHeight;
    }
    let arrowY = (HighScores.lineHeight + rowY);
    if (((Math.imul(HighScores.lineHeight, 3)) + arrowY) <= (GameMIDlet.screenHeight - 8)) {
      HighScores.endVisible = true;
      HighScores.paintArrow(g, arrowY, false);
      return;
    }
    Ui.paintDownArrow(g, ((((GameMIDlet.screenWidth - 18)) / 2) | 0), (GameMIDlet.screenHeight - 36), false);
  }
  static paintArrow(g, y, withArrow) {
    if (withArrow) {
      Ui.paintUpArrow(g, (((GameMIDlet.screenWidth - 18)) >> 1), y, true);
      y = (((y + 18)) + 8);
    }
    g.setFont(HighScores.bodyFont);
    let label155 = ("- " + Resources.getString$1(155));
    let label156 = ("- " + Resources.getString$1(156));
    let label157 = ("- " + Resources.getString$1(157));
    if (Storage.getSetting(4) === 1) {
      let icon1X = (HighScores.scoreRight - HighScores.rowScoreIcon.getWidth());
      g.setClip(icon1X, (y + 2), HighScores.rowScoreIcon.getWidth(), HighScores.rowScoreIcon.getHeight());
      g.drawImage(HighScores.rowScoreIcon, icon1X, (y + 2), 20);
      g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
      g.drawString(label155, (icon1X - 8), y, 24);
      let y2 = (y + HighScores.lineHeight);
      let icon2X = (HighScores.scoreRight - HighScores.headerScoreIcon.getWidth());
      g.setClip(icon2X, (y2 + 2), HighScores.headerScoreIcon.getWidth(), HighScores.headerScoreIcon.getHeight());
      g.drawImage(HighScores.headerScoreIcon, icon2X, (y2 + 2), 20);
      g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
      g.drawString(label156, (icon2X - 8), y2, 24);
      let y3 = (y2 + HighScores.lineHeight);
      let icon3X = (HighScores.scoreRight - HighScores.unusedIcon.getWidth());
      g.setClip(icon3X, (y3 + 2), HighScores.unusedIcon.getWidth(), HighScores.unusedIcon.getHeight());
      g.drawImage(HighScores.unusedIcon, icon3X, (y3 + 2), 20);
      g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
      g.drawString(label157, (icon3X - 8), y3, 24);
    } else {
      g.setClip(HighScores.scoreLeft, (y + 2), HighScores.rowScoreIcon.getWidth(), HighScores.rowScoreIcon.getHeight());
      g.drawImage(HighScores.rowScoreIcon, HighScores.scoreLeft, (y + 2), 20);
      g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
      g.drawString(label155, ((HighScores.scoreLeft + HighScores.rowScoreIcon.getWidth()) + 8), y, 20);
      let y2 = (y + HighScores.lineHeight);
      g.setClip(HighScores.scoreLeft, (y2 + 2), HighScores.headerScoreIcon.getWidth(), HighScores.headerScoreIcon.getHeight());
      g.drawImage(HighScores.headerScoreIcon, HighScores.scoreLeft, (y2 + 2), 20);
      g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
      g.drawString(label156, ((HighScores.scoreLeft + HighScores.headerScoreIcon.getWidth()) + 8), y2, 20);
      let y3 = (y2 + HighScores.lineHeight);
      g.setClip(HighScores.scoreLeft, (y3 + 2), HighScores.unusedIcon.getWidth(), HighScores.unusedIcon.getHeight());
      g.drawImage(HighScores.unusedIcon, HighScores.scoreLeft, (y3 + 2), 20);
      g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
      g.drawString(label157, ((HighScores.scoreLeft + HighScores.unusedIcon.getWidth()) + 8), y3, 20);
    }
  }
  insertScore(score, name) {
    let i;
    let copy = new Int32Array(score.length);
    for (i = 0; i < score.length; i++) {
      copy[i] = score[i];
    }
    i = 0;
    for (let slot = 2; slot >= 0; slot--) {
      if ((score[0] > this.scores[this.pendingMode][slot][0]) && (i === 0)) {
        this.scores[this.pendingMode][(slot + 1)] = this.scores[this.pendingMode][slot];
        this.names[this.pendingMode][(slot + 1)] = this.names[this.pendingMode][slot];
        this.pendingRank--;
        if (slot === 0) {
          this.scores[this.pendingMode][slot] = copy;
          this.names[this.pendingMode][slot] = name;
          i = 1;
        }
      }
      if ((score[0] <= this.scores[this.pendingMode][slot][0]) && (i === 0)) {
        this.scores[this.pendingMode][(slot + 1)] = copy;
        this.names[this.pendingMode][(slot + 1)] = name;
        i = 1;
      }
    }
    this.save();
  }
  installSoftkeys() {
    if (this.softkeys != null) {
      for (let idx = 0; idx < this.softkeys.length; idx++) {
        HighScores.canvas.removeCommand(this.softkeys[idx]);
      }
      this.softkeys = null;
    }
    if (this.requestedState === 2) {
      Ui.openDialog(null, Resources.getString$1(146), 0, 0, 0, -1, -1, null);
      Storage.setText(0, this.playerName);
      HighScores.okCommand = new Command(Resources.getString$1(5), 4, 1);
      this.softkeys = [HighScores.okCommand];
      this.menu.enterSubMenu(3, 0, this.softkeys);
    } else if (this.requestedState === 1) {
      this.returnState = -2;
      Ui.openDialog(null, Resources.getString$1(151), 0, 0, 0, -1, -1, "");
      Ui.setText("");
      new Command(Resources.getString$1(143), 4, 1);
      HighScores.backCommand = new Command(Resources.getString$1(7), 2, 1);
      this.softkeys = [HighScores.backCommand];
      this.menu.enterSubMenu(1, 1, this.softkeys);
    }
    this.state = this.requestedState;
  }
  static createGradient(width, height) {
    let pixels = new Int32Array((Math.imul(width, height)));
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        let i5 = ((Math.imul(col, 2)) - width);
        i5 = (((Math.imul(i5, i5)) / width) | 0);
        i5 = (((Math.imul(i5, i5)) / width) | 0);
        let i6 = ((Math.imul(row, 2)) - height);
        pixels[((Math.imul(row, width)) + col)] = (((((((((Math.imul((Math.imul(((width - ((((Math.imul(i5, i5)) / width) | 0)))), 160)), ((height - ((((Math.imul(i6, i6)) / height) | 0)))))) / (Math.imul(width, height))) | 0)) & 255)) << 24)) | 16777215);
      }
    }
    return Image.createRGBImage(pixels, width, height, true);
  }
  submitNameAndSave() {
    switch (this.state) {
      case 2:
        this.requestedState = -1;
        this.playerName = Storage.getText(0);
        this.insertScore(this.pendingScore, this.playerName);
        (this.midlet).clearSavedGame(1);
        return;
      default:
        return;
    }
  }
  cancelEntry() {
    try {
      let dis = Storage.openRead("HoF");
      this.playerName = dis.readUTF();
      for (let i = 0; i < HighScores.layout.length; i++) {
        for (let i2 = 0; i2 < 3; i2++) {
          this.names[i][i2] = dis.readUTF();
          for (let i3 = 0; i3 < this.scores[i][i2].length; i3++) {
            this.scores[i][i2][i3] = dis.readInt();
          }
        }
      }
      dis.close();
      Storage.close();
    } catch (e) {
    }
  }
  submitScore(mode, score, name) {
    let newState;
    let self;
    this.pendingRank = 4;
    for (newState = 0; newState < score.length; newState++) {
      this.pendingScore[newState] = score[newState];
    }
    this.pendingMode = mode;
    let self2;
    if (this.pendingScore[0] <= this.scores[mode][2][0]) {
      self2 = this;
      self = self2;
      newState = -1;
    } else if (name == null) {
      newState = 2;
      self = this;
    } else {
      let target;
      if (name !== "-") {
        target = this.pendingScore;
        self = this;
      } else {
        target = this.pendingScore;
        name = "-";
        self = this;
      }
      self.insertScore(target, name);
      self2 = this;
      self = self2;
      newState = -1;
    }
    self.requestedState = newState;
    return this.pendingRank;
  }
  update(delta, elapsedMs) {
    if (this.requestedState !== 0) {
      this.installSoftkeys();
      this.requestedState = 0;
    }
    if (this.submitRequested) {
      this.submitNameAndSave();
      this.submitRequested = false;
      return;
    }
    this.menu.update(delta, elapsedMs);
  }
  init(app, menuCtl, canvasArg) {
    HighScores.canvas = canvasArg;
    this.midlet = app;
    this.menu = menuCtl;
    Display.getDisplay(app);
    HighScores.layout = this.midlet.getHighScoreLayout();
    this.names = newInstanceArr(null, new Int32Array([HighScores.layout.length, 4]));
    let length = (HighScores.layout[0].length - 1);
    if (length === 0) {
      length = 1;
    }
    this.pendingScore = new Int32Array(length);
    this.scores = newInstanceArr('int', new Int32Array([HighScores.layout.length, 4, length]));
    try {
      let dis = Storage.openRead("HoF");
      if (dis != null) {
        dis.close();
        Storage.close();
        this.cancelEntry();
        return;
      }
      Storage.close();
      this.playerName = "-";
      for (let i = 0; i < this.scores.length; i++) {
        for (let i2 = 0; i2 < this.scores[i].length; i2++) {
          this.names[i][i2] = "-";
          for (length = 0; length < this.scores[i][i2].length; length++) {
            this.scores[i][i2][length] = 0;
          }
        }
      }
      this.save();
    } catch (e) {
    }
  }
  commandAction(command) {
    switch (command.getCommandType()) {
      case 2:
      case 3:
        if (this.state === 2) {
          this.menu.commandAction(command);
          return;
        } else {
          this.requestedState = this.returnState;
          return;
        }
      case 4:
        this.submitRequested = true;
        return;
      default:
        return;
    }
  }
  paint(g, fullRedraw) {
    if (this.state === 1) {
      Ui.paint(g);
      if ((HighScores.atTop || HighScores.firstPaint) || HighScores.endVisible) {
        this.paintScoreTable(g);
      }
      if (HighScores.scrolledDown && !HighScores.endVisible) {
        HighScores.paintArrow(g, 42, true);
      }
    }
  }
  keyPressed(keyCode, gameAction) {
    if ((keyCode === 56) || (gameAction === 6)) {
      HighScores.scrolledDown = true;
      HighScores.atTop = false;
      HighScores.firstPaint = false;
    } else if ((keyCode === 50) || (gameAction === 1)) {
      HighScores.scrolledDown = false;
      HighScores.atTop = true;
    } else if ((keyCode !== 53) && (gameAction !== 8)) {
      this.menu.keyPressed(keyCode, gameAction);
    }
  }
  onEnter() {
    if (Storage.getSetting(13) === 1) {
      this.requestedState = 1;
      Storage.setSetting(13, 0);
    }
  }
  onModeChange() {
    let menuCtl;
    let page;
    if (this.state === -2) {
      menuCtl = this.menu;
      page = 2;
    } else if (this.state === -1) {
      menuCtl = this.menu;
      page = 1;
    } else {
      return;
    }
    menuCtl.gotoMenu(page);
  }
  constructor() {
    this.names = (null);
    this.scores = (null);
    this.playerName = null;
    this.pendingScore = null;
    this.pendingMode = 0;
    this.pendingRank = 0;
    this.midlet = null;
    this.menu = null;
    this.requestedState = 0;
    this.state = 0;
    this.returnState = 0;
    this.submitRequested = false;
    this.softkeys = null;
    HighScores.rowScoreIcon = Resources.getImage(6);
    HighScores.headerScoreIcon = Resources.getImage(7);
    HighScores.unusedIcon = Resources.getImage(8);
    HighScores.gradientHeader = HighScores.createGradient(GameMIDlet.screenWidth, HighScores.lineHeight);
    HighScores.gradientRow = HighScores.createGradient(GameMIDlet.screenWidth, Math.imul(HighScores.lineHeight, 2));
  }
}

HighScores.$clinit = function () {
  HighScores.headerScoreIcon = null;
  HighScores.unusedIcon = null;
  HighScores.gradientHeader = null;
  HighScores.gradientRow = null;
  HighScores.scrolledDown = false;
  HighScores.atTop = false;
  HighScores.firstPaint = true;
  HighScores.endVisible = false;
  HighScores.canvas = null;
  HighScores.layout = null;
  HighScores.okCommand = null;
  HighScores.backCommand = null;
  HighScores.rankWidth = Font.getFont(32, 0, 8).stringWidth("3. ");
  HighScores.nameX = ((HighScores.rankWidth + 8));
  HighScores.rightEdge = ((((GameMIDlet.screenWidth - 8)) - HighScores.rankWidth));
  HighScores.scoreRight = ((HighScores.rightEdge - 8));
  HighScores.scoreLeft = ((HighScores.nameX + 8));
  HighScores.lineHeight = Font.getFont(32, 0, 8).getHeight();
  HighScores.bodyFont = Font.getFont(32, 0, 8);
  HighScores.boldFont = Font.getFont(32, 1, 8);
  HighScores.rowScoreIcon = null;
  {
    Font.getFont(32, 0, 8).stringWidth("999999");
  }
};
