class MenuController {
  static setCaretPos(mc, value) {
    mc.caretPos = value;
    return value;
  }
  static setNameForm(mc, form) {
    mc.nameForm = form;
    return form;
  }
  static getNameInput(mc) {
    return mc.nameInput;
  }
  static setNameInput(mc, field) {
    mc.nameInput = field;
    return field;
  }
  static getMenuHierarchy() {
    return MenuController.palette;
  }
  static getCaretPos(mc) {
    return mc.caretPos;
  }
  static setTextSlot(mc, value) {
    mc.textSlot = value;
    return value;
  }
  static getPlayerName() {
    return MenuController.nameField.getString().trim().split(String.fromCharCode(10)).join(String.fromCharCode(32));
  }
  showMenu(menuId) {
    let k = 0;
    if (menuId === 19) {
      this.executeActions(2);
      return;
    }
    MenuController.menuData = new DataInputStream(Assets.open("data/menu.dat"));
    MenuController.readValue((-(((Math.imul(menuId, 2)) - 1))));
    MenuController.readValue((-MenuController.readValue(3)));
    let type = MenuController.readValue(2);
    MenuController.menuType = type;
    if (type === 7) {
      MenuController.readValue(2);
      MenuController.readValue((-Storage.getSetting(MenuController.readValue(2))));
      this.showMenu(MenuController.readValue(2));
    } else {
      MenuController.nextMenuId = MenuController.readValue(2);
      MenuController.backMenuId = MenuController.readValue(2);
      switch (type) {
        case 4:
          MenuController.targetScreenId = 1;
          break;
        case 5:
          MenuController.targetScreenId = 2;
          break;
        case 6:
          MenuController.targetScreenId = 3;
          break;
        default:
          MenuController.targetScreenId = 0;
          MenuController.needsParse = true;
          break;
      }
      if (Storage.getScreenId() !== MenuController.targetScreenId) {
        MenuController.screenChangePending = true;
      }
      Storage.setMenuId(menuId);
    }
    if (MenuController.commands != null) {
      while (k < MenuController.commands.length) {
        if (MenuController.commands[k] != null) {
          MenuController.canvas.removeCommand(MenuController.commands[k]);
        }
        k++;
      }
    }
    MenuController.commands = null;
  }
  static getTextSlot(mc) {
    return mc.textSlot;
  }
  static getCanvas() {
    return MenuController.canvas;
  }
  executeActions(actionFlags) {
    let bit = 7;
    let remaining = actionFlags;
    while (bit >= 0) {
      let row;
      let mask = 1;
      for (row = 0; row < bit; row++) {
        mask <<= 1;
      }
      if (remaining >= mask) {
        row = MenuController.entries[Storage.cursor][1];
        switch (bit) {
          case 0:
            Storage.menuCursors[(row - 1)] = 0;
            this.showMenu(row);
            break;
          case 1:
            MenuController.targetScreenId = 4;
            MenuController.screenChangePending = true;
            break;
          case 2:
            row = (((Storage.getSetting(MenuController.entries[Storage.cursor][0]) + MenuController.sideDir)) % MenuController.entries[Storage.cursor][3]);
            if (row < 0) {
              row = (MenuController.entries[Storage.cursor][3] - 1);
            }
            Storage.setSetting(MenuController.entries[Storage.cursor][0], row);
            Ui.setMenuItem(Storage.cursor, null, MenuController.optionTexts[(row + MenuController.entries[Storage.cursor][4])], 0);
            Ui.update(0);
            break;
          case 5:
            let count = MenuController.entries[Storage.cursor][5];
            let start = MenuController.entries[Storage.cursor][6];
            for (row = 0; row < count; row += 2) {
              Storage.setSetting(MenuController.valueData[(start + row)], MenuController.valueData[(((start + row)) + 1)]);
            }
            break;
        }
        row = (remaining - mask);
      } else {
        row = remaining;
      }
      bit--;
      remaining = row;
    }
  }
  static readValue(byteCount) {
    let value = 0;
    try {
      switch (byteCount) {
        case 1:
          value = MenuController.menuData.readByte();
          break;
        case 2:
          value = MenuController.menuData.readUnsignedByte();
          break;
        case 3:
          value = MenuController.menuData.readShort();
          break;
        case 4:
          value = MenuController.menuData.readInt();
          break;
        default:
          MenuController.menuData.skipBytes((-byteCount));
          break;
      }
    } catch (e) {
    }
    return value;
  }
  parseMenu() {
    let style = MenuController.readValue(2);
    let titleId = MenuController.readValue(3);
    MenuController.entries = newInstanceArr('int', new Int32Array([1, 8]));
    if (MenuController.menuType === 2) {
      Ui.openTextPanel(20, 0, (GameMIDlet.screenWidth - 40), (GameMIDlet.screenHeight - 0), 255, style, new Int32Array([-1, -1, -1]));
      Ui.setText(Resources.getString$1(titleId));
      return;
    }
    let iconId = MenuController.readValue(4);
    let icon = Resources.getImage(iconId);
    let title = Resources.getString$1(titleId);
    MenuController.readValue(1);
    let commandCount = MenuController.readValue(2);
    MenuController.commands = new Array(commandCount).fill(null);
    for (let k2 = 0; k2 < commandCount; k2++) {
      MenuController.commands[k2] = new Command(Resources.getString$1(MenuController.readValue(3)), MenuController.readValue(2), 1);
    }
    if (MenuController.menuType === 0) {
      MenuController.entryCount = 0;
      if (Storage.getMenuId() !== 18) {
        let total = MenuController.readValue(2);
        Ui.initMenuList(total, icon, title, style, 0, 0, -1, -1, null);
        MenuController.entries = newInstanceArr('int', new Int32Array([total, 8]));
        MenuController.optionTexts = new Array(MenuController.readValue(2)).fill(null);
        MenuController.valueData = new Int32Array(MenuController.readValue(2));
        let optionIndex = 0;
        let valueIndex = 0;
        for (let n = 0; n < total; n++) {
          let itemId = MenuController.readValue(2);
          let state = MenuController.readValue(2);
          if (state !== 0) {
            state = Storage.getMenuFlag(itemId);
          }
          MenuController.entries[MenuController.entryCount][7] = state;
          if (state !== 1) {
            MenuController.entries[MenuController.entryCount][0] = itemId;
            let text = Resources.getString$1(MenuController.readValue(3));
            let itemIcon = Resources.getImage(MenuController.readValue(4));
            MenuController.entries[MenuController.entryCount][1] = MenuController.readValue(2);
            MenuController.entries[MenuController.entryCount][2] = MenuController.readValue(2);
            let optionCount = MenuController.readValue(2);
            MenuController.entries[MenuController.entryCount][3] = optionCount;
            MenuController.entries[MenuController.entryCount][4] = optionIndex;
            if (optionCount > 0) {
              MenuController.entries[MenuController.entryCount][0] = MenuController.readValue(2);
              let selected = (optionIndex + Storage.getSetting(MenuController.entries[MenuController.entryCount][0]));
              for (let o2 = 0; o2 < optionCount; o2++) {
                MenuController.optionTexts[optionIndex] = (((text + " [") + Resources.getString$1(MenuController.readValue(3))) + "]");
                optionIndex++;
              }
              text = MenuController.optionTexts[selected];
            }
            let valueCount = MenuController.readValue(2);
            MenuController.entries[MenuController.entryCount][5] = valueCount;
            MenuController.entries[MenuController.entryCount][6] = valueIndex;
            if (valueCount > 0) {
              for (let v2 = 0; v2 < valueCount; v2++) {
                MenuController.valueData[valueIndex] = MenuController.readValue(2);
                valueIndex++;
              }
            }
            Ui.setMenuItem(MenuController.entryCount, itemIcon, text, state);
            MenuController.entryCount++;
          } else {
            MenuController.readValue(-8);
            let skipCount = MenuController.readValue(2);
            MenuController.readValue((-((Math.min(1, skipCount) + (Math.imul(skipCount, 2))))));
            let skipLen = MenuController.readValue(2);
            MenuController.readValue((-skipLen));
          }
        }
      }
    } else {
      let text = null;
      if (MenuController.menuType === 1) {
        text = Resources.getString$1(MenuController.readValue(3));
      }
      MenuController.entries[0][7] = 0;
      MenuController.entries[0][1] = MenuController.nextMenuId;
      MenuController.entries[0][2] = MenuController.readValue(2);
      let valueCount = MenuController.readValue(2);
      MenuController.entries[0][5] = valueCount;
      MenuController.valueData = new Int32Array(Math.imul(valueCount, 2));
      for (let n = 0; n < valueCount; n++) {
        MenuController.valueData[n] = MenuController.readValue(2);
      }
      Ui.openDialog(icon, title, style, 0, 0, -1, -1, null);
      Ui.setText(text);
    }
    try {
      MenuController.menuData.close();
    } catch (ex) {
    }
    MenuController.menuData = null;
    Storage.cursor = Storage.menuCursors[(Storage.getMenuId() - 1)];
    this.installCommands();
    Ui.update(0);
  }
  installCommands() {
    if (MenuController.menuType !== 3) {
      let i = 0;
      while (i < MenuController.commands.length) {
        MenuController.canvas.removeCommand(MenuController.commands[i]);
        if (((i !== 3) || (this.inputBuffer.length() === 0)) || (MenuController.commands[i].getCommandType() !== 2)) {
          MenuController.canvas.setCommand(MenuController.commands[i], null);
        }
        i++;
      }
    }
  }
  gotoMenu(which) {
    let targetMenuId;
    Storage.setScreenId(0);
    switch (which) {
      case 1:
        targetMenuId = MenuController.nextMenuId;
        break;
      case 2:
        targetMenuId = MenuController.backMenuId;
        break;
      default:
        return;
    }
    this.showMenu(targetMenuId);
  }
  update(delta, time) {
    if (MenuController.needsParse) {
      this.parseMenu();
      MenuController.needsParse = false;
      MenuController.moveDir = 0;
      MenuController.sideDir = 0;
      MenuController.selectPressed = false;
    }
    if (MenuController.moveDir !== 0) {
      if (MenuController.menuType === 0) {
        if (((Storage.cursor + MenuController.moveDir) >= 0) && ((Storage.cursor + MenuController.moveDir) < MenuController.entryCount)) {
          Storage.cursor += MenuController.moveDir;
          Ui.update(MenuController.moveDir);
          Storage.menuCursors[(Storage.getMenuId() - 1)] = Storage.cursor;
        }
      } else if (((MenuController.menuType === 2) && (MenuController.moveDir === 1)) && Ui.isOnLastPage()) {
        Ui.clearDialog();
        this.showMenu(MenuController.backMenuId);
      } else {
        Ui.update(MenuController.moveDir);
      }
      MenuController.moveDir = 0;
    }
    if (MenuController.sideDir !== 0) {
      if ((((MenuController.menuType === 0) && (Storage.cursor < MenuController.entries.length)) && (MenuController.entries[Storage.cursor][2] === 4)) && (MenuController.entries[Storage.cursor][7] === 0)) {
        this.executeActions(4);
      }
      MenuController.sideDir = 0;
    }
    if (MenuController.selectPressed) {
      MenuController.selectPressed = false;
      if (MenuController.menuType === 2) {
        Ui.clearDialog();
        this.showMenu(MenuController.backMenuId);
      } else if (MenuController.entries[Storage.cursor][7] === 0) {
        if (MenuController.entries[Storage.cursor][2] === 4) {
          MenuController.sideDir = 1;
          this.executeActions(MenuController.entries[Storage.cursor][2]);
          MenuController.sideDir = 0;
        } else {
          this.executeActions(MenuController.entries[Storage.cursor][2]);
        }
      }
    }
    if (MenuController.backPressed) {
      this.showMenu(MenuController.backMenuId);
      MenuController.backPressed = false;
    }
  }
  enterSubMenu(menuType, menuParam, cmds) {
    let inputMode = 3;
    menuType = menuType;
    MenuController.entryCount = menuParam;
    Storage.cursor = 0;
    if (menuType === 3) {
      let field;
      let self;
      switch (menuParam) {
        case 1:
          break;
        default:
          inputMode = 0;
          break;
      }
      this.nameForm = new Form(Resources.getString$1(146));
      if (Storage.getText(0) === "-") {
        field = new TextField("", "", 10, inputMode);
        self = this;
      } else {
        field = new TextField("", Storage.getText(0), 10, inputMode);
        self = this;
      }
      self.nameInput = field;
      this.nameForm.append(this.nameInput);
      for (const addCommand of cmds) {
        this.nameForm.addCommand(addCommand);
      }
      this.nameForm.addCommand(this.deleteCommand);
      this.nameForm.setCommandListener({
commandAction: (command, displayable) => {
  if (command === this.deleteCommand) {
    this.caretPos = this.nameInput.getCaretPosition();
    if ((this.caretPos !== 0) && (this.nameInput.size() !== 0)) {
      this.nameInput.delete((this.caretPos - 1), 1);
      return;
    }
    return;
  }
  this.textSlot = 0;
  Storage.setText(this.textSlot, this.nameInput.getString().trim().split(String.fromCharCode(10)).join(String.fromCharCode(32)));
  this.nameForm = null;
  this.nameInput = null;
  MenuController.getCanvas().setActive(true);
  GameMIDlet.getInstance().handleCommand(command);
}
});
      MenuController.nameField = this.nameInput;
      MenuController.canvas.setActive(false);
      Display.getDisplay(GameMIDlet.getInstance()).setCurrent(this.nameForm);
    }
    MenuController.commands = cmds;
    if (cmds != null) {
      this.installCommands();
    }
  }
  commandAction(command) {
    switch (command.getCommandType()) {
      case 2:
        if (((MenuController.menuType === 0) || (MenuController.menuType === 1)) || (MenuController.menuType === 3)) {
          MenuController.backPressed = true;
          return;
        }
        return;
      case 4:
        MenuController.selectPressed = true;
        return;
      case 7:
        this.executeActions(2);
        return;
      default:
        return;
    }
  }
  paint(g, fullRedraw) {
    Ui.paint(g);
  }
  keyPressed(keyCode, gameAction) {
    let unused = -1;
    if (keyCode === 50) {
      MenuController.moveDir = -1;
    } else if (keyCode === 56) {
      MenuController.moveDir = 1;
    } else if (keyCode === 53) {
      MenuController.selectPressed = true;
    } else {
      if (keyCode !== 52) {
        if (keyCode !== 54) {
          if (((((keyCode < 48) || (keyCode > 57))) && (keyCode !== 35)) && (keyCode !== 42)) {
            if (gameAction === 1) {
              MenuController.moveDir = -1;
              return;
            } else if (gameAction === 6) {
              MenuController.moveDir = 1;
              return;
            } else if (gameAction === 8) {
              MenuController.selectPressed = true;
              return;
            } else if (gameAction !== 2) {
              if (gameAction !== 5) {
                return;
              }
            }
          } else {
            return;
          }
        }
        unused = 1;
      }
      MenuController.sideDir = unused;
    }
  }
  onEnter() {
  }
  selectItem(index) {
    if ((index >= 0) && (index < MenuController.entryCount)) {
      Storage.cursor = index;
      if ((Storage.getMenuId() > 0) && ((Storage.getMenuId() - 1) < Storage.menuCursors.length)) {
        Storage.menuCursors[(Storage.getMenuId() - 1)] = index;
      }
      Ui.setCursor(index);
      MenuController.selectPressed = true;
    }
  }
  onModeChange() {
    if (MenuController.screenChangePending) {
      Ui.clearDialog();
      Storage.setScreenId(MenuController.targetScreenId);
      MenuController.screenChangePending = false;
    }
  }
  constructor(canvasArg) {
    this.deleteCommand = new Command(Resources.getString$1(150), 2, 0);
    this.inputBuffer = null;
    this.textSlot = 0;
    this.nameForm = null;
    this.nameInput = null;
    this.caretPos = 0;
    let k = 0;
    try {
      MenuController.canvas = canvasArg;
      MenuController.menuData = new DataInputStream(Assets.open("data/menu.dat"));
      MenuController.palette = new Int32Array(9);
      let d = MenuController.readValue(2);
      MenuController.readValue(Math.imul(((-d)), 2));
      while (k < 9) {
        MenuController.palette[k] = MenuController.readValue(4);
        k++;
      }
      MenuController.menuData.close();
      MenuController.menuData = null;
      Storage.menuCursors = new Int32Array(d);
      this.showMenu(6);
    } catch (e) {
    }
  }
}

MenuController.$clinit = function () {
  MenuController.palette = null;
  MenuController.entries = null;
  MenuController.optionTexts = null;
  MenuController.valueData = null;
  MenuController.entryCount = 0;
  MenuController.nextMenuId = 0;
  MenuController.backMenuId = 0;
  MenuController.menuType = 0;
  MenuController.menuData = null;
  MenuController.needsParse = false;
  MenuController.selectPressed = false;
  MenuController.backPressed = false;
  MenuController.moveDir = 0;
  MenuController.sideDir = 0;
  MenuController.canvas = null;
  MenuController.commands = null;
  MenuController.screenChangePending = false;
  MenuController.targetScreenId = 0;
  MenuController.nameField = null;
};
