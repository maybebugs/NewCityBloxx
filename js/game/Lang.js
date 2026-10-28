class Lang {
  static getString(index, formatArgs) {
    let result;
    {
      try {
        if (Lang.instance == null) {
          Lang.instance = new Lang();
        }
        if (Lang.langStream == null) {
          let inputStream = Assets.open(("lang/lang." + Lang.locale));
          if (inputStream == null) {
            let dash = Lang.locale.indexOf(String.fromCharCode(45));
            if (dash > 0) {
              inputStream = Assets.open(("lang/lang." + Lang.locale.substring(0, dash)));
            }
          }
          if (inputStream == null) {
            let base = Lang.locale.split("-")[0];
            let alt = Assets.findPrefix("lang/lang." + base + "-");
            if (alt != null) inputStream = Assets.open(alt);
          }
          if (inputStream == null) {
            inputStream = Assets.open("lang/lang.en-US");
          }
          if (inputStream == null) {
            inputStream = Assets.open("lang/lang.xx");
          }
          if (inputStream == null) {
            return "X";
          }
          Lang.langStream = new DataInputStream(inputStream);
          Lang.langStream.mark(512);
        }
        Lang.langStream.skipBytes(Math.imul(index, 2));
        Lang.langStream.skipBytes((((Lang.langStream.readUnsignedShort() - (Math.imul(index, 2)))) - 2));
        result = Lang.langStream.readUTF();
        if (Lang.langStream.markSupported()) {
          try {
            Lang.langStream.reset();
          } catch (e) {
            Lang.langStream.close();
            Lang.langStream = null;
          }
        } else {
          Lang.langStream.close();
          Lang.langStream = null;
        }
        if (formatArgs != null) {
          if (formatArgs.length === 1) {
            result = Lang.replaceAll(result, "%U", formatArgs[0]);
          } else {
            for (let i = 0; i < formatArgs.length; i++) {
              result = Lang.replaceAll(result, (("%" + i) + "U"), formatArgs[i]);
            }
          }
        }
      } catch (e) {
        Lang.langStream = null;
        result = "E";
      }
    }
    return result;
  }
  static replaceAll(text, targetKey, replacement) {
    let idx;
    do {
      idx = text.indexOf(targetKey);
      if (idx >= 0) {
        text = ((text.substring(0, idx) + replacement) + text.substring((targetKey.length + idx)));
      }
    } while (idx >= 0);
    return text;
  }
  constructor() {
  }
}

Lang.$clinit = function () {
  Lang.locale = (new URLSearchParams(location.search).get('lang') || navigator.language || 'en-US');
  Lang.instance = null;
  Lang.langStream = null;
};
