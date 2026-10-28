class Storage {
  static getMenuId() {
    return Storage.menuId;
  }
  static getSetting(settingIndex) {
    return Storage.settings[settingIndex];
  }
  static openRead(name) {
    try {
      let rs = RecordStore.openRecordStore(name, false);
      Storage.in_ = new DataInputStream(new ByteArrayInputStream(rs.getRecord(1)));
      rs.closeRecordStore();
    } catch (e) {
      Storage.in_ = null;
    }
    return Storage.in_;
  }
  static setSetting(settingIndex, value) {
    Storage.settings[settingIndex] = value;
  }
  static setText(textIndex, text) {
    Storage.texts[textIndex] = text;
  }
  static getScreenId() {
    return Storage.screenId;
  }
  static getMenuFlag(flagIndex) {
    return Storage.menuFlags[flagIndex];
  }
  static openWrite(name) {
    try {
      Storage.recordName = name;
      Storage.writeBuffer = new ByteArrayOutputStream();
      Storage.out = new DataOutputStream(Storage.writeBuffer);
    } catch (e) {
    }
    return Storage.out;
  }
  static setMenuFlag(flagIndex, value) {
    Storage.menuFlags[flagIndex] = value;
  }
  static getText(textIndex) {
    return Storage.texts[textIndex];
  }
  static close() {
    try {
      if (Storage.writeBuffer != null) {
        Storage.flush();
      }
      if (Storage.out != null) {
        Storage.out.close();
        Storage.out = null;
      }
      if (Storage.in_ != null) {
        Storage.in_.close();
        Storage.in_ = null;
      }
    } catch (e) {
    }
  }
  static flush() {
    try {
      let data = Storage.writeBuffer.toByteArray();
      Storage.writeBuffer.close();
      Storage.writeBuffer = null;
      let rs = RecordStore.openRecordStore(Storage.recordName, true);
      if (rs.getNumRecords() > 0) {
        rs.setRecord(1, data, 0, data.length);
      } else {
        rs.addRecord(data, 0, data.length);
      }
      rs.closeRecordStore();
    } catch (e) {
    }
  }
  static setMenuId(id) {
    Storage.menuId = id;
  }
  static setScreenId(id) {
    Storage.screenId = id;
  }
}

Storage.$clinit = function () {
  Storage.cursor = 0;
  Storage.menuCursors = null;
  Storage.dirty = false;
  Storage.unused = false;
  Storage.menuId = 0;
  Storage.screenId = 5;
  Storage.recordName = null;
  Storage.writeBuffer = null;
  Storage.out = null;
  Storage.in_ = null;
  Storage.settings = new Int32Array(14);
  Storage.menuFlags = new Int32Array(12);
  Storage.texts = new Array(1).fill(null);
};
