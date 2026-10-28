class Ui {
  static clearDialog() {
    Ui.dismissDialog();
    Storage.dirty = true;
  }
  static update(delta) {
    let atEnd = false;
    if (Ui.paged) {
      Ui.pageIndex += delta;
      Ui.pageIndex = Math.max(0, Ui.pageIndex);
      Ui.pageIndex = Math.min((Ui.pages.length - 1), Ui.pageIndex);
      if (Ui.pageIndex === (Ui.pages.length - 1)) {
        atEnd = true;
      }
      Ui.onLastPage = atEnd;
    }
    Storage.dirty = true;
    Ui.cursor = Storage.cursor;
  }
  static openTextPanel(x, y, width, height, alpha, align, colors) {
    Ui.dismissDialog();
    Ui.mode = 3;
    Ui.backgroundAlpha = alpha;
    Ui.textAlign = align;
    Ui.boxX = x;
    Ui.boxY = y;
    Ui.boxWidth = width;
    Ui.boxWidth = Math.min(Ui.boxWidth, (GameMIDlet.screenWidth - Ui.boxX));
    Ui.boxHeight = height;
    Ui.boxHeight = Math.min(Ui.boxHeight, (GameMIDlet.screenHeight - Ui.boxY));
    Ui.textWidth = (((Ui.boxWidth - 16)) + 0);
    if (colors != null) {
      for (let k = 0; k < 3; k++) {
        Ui.colorOverride[k] = colors[k];
      }
    }
    Storage.dirty = true;
  }
  static setMenuItem(index, icon, text, value) {
    if (Ui.mode === 1) {
      if (icon != null) {
        Ui.iconMaxHeight = Math.max(Ui.iconMaxHeight, icon.getHeight());
        Ui.iconMaxWidth = Math.max(Ui.iconMaxWidth, icon.getWidth());
      }
      if ((index + 1) > Ui.itemCount) {
        Ui.itemCount++;
      }
      Ui.itemIcons[index] = icon;
      Ui.itemLines[index] = Ui.wrapLines(text, (((Ui.boxWidth - 24)) - Ui.iconMaxWidth), Ui.bodyFont);
      Ui.itemValues[index] = value;
    }
  }
  static initMenuList(count, icon, title, align, x, y, width, height, unused) {
    Ui.itemCount = 0;
    Ui.dismissDialog();
    Ui.itemIcons = new Array(count).fill(null);
    Ui.itemLines = new Array(count).fill(null);
    Ui.itemValues = new Int32Array(count);
    Ui.boxX = x;
    Ui.boxY = y;
    Ui.boxWidth = width;
    Ui.boxHeight = height;
    Ui.mode = 1;
    Ui.textAlign = align;
    Ui.setHeader(icon, title);
    Ui.tickerStart = 0;
    Storage.dirty = true;
  }
  static setText(text) {
    Ui.pages = Ui.wrapPages(text, (((Ui.boxHeight - 36)) - 16), Ui.textWidth, Ui.bodyFont);
    Ui.bodyFont.getHeight();
    if (Ui.pages.length > 1) {
      Ui.paged = true;
      Ui.pageIndex = 0;
    } else {
      Ui.onLastPage = true;
    }
    Storage.dirty = true;
  }
  static paint(g) {
    switch (Ui.mode) {
      case 1:
        Ui.paintList(g);
        break;
      case 2:
        Ui.paintDialog(g);
        break;
      case 3:
        Ui.paintPanel(g);
        break;
    }
    if ((Ui.headerEmpty || (Ui.headerLines == null)) || (Ui.headerLines.length === 1)) {
      Storage.dirty = false;
    }
  }
  static paintUpArrow(g, x, y, resetClip) {
    g.setClip(x, y, 18, 18);
    g.drawImage(Ui.arrowSprite, x, y, 20);
    if (resetClip) {
      g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    }
  }
  static paintText(g, showEndMarker) {
    let left = Ui.boxX;
    let right = (Ui.boxX + Ui.boxWidth);
    let centerX = (Ui.boxX + (((Ui.boxWidth / 2) | 0)));
    let top = Ui.boxY;
    let bottom = (Ui.boxY + Ui.boxHeight);
    let y = (top + 8);
    let fontHeight = Ui.bodyFont.getHeight();
    let textX = (left + 8);
    if (Storage.getSetting(4) === 1) {
      textX = (right - 8);
    }
    if (Ui.mode === 2) {
      textX = ((Storage.getSetting(4) === 0) ? (textX + 8) : (textX - 8));
    }
    g.setColor(((Ui.colorOverride[0] === -1) ? Ui.palette[2] : Ui.colorOverride[0]));
    g.setFont(Ui.bodyFont);
    if (Ui.paged && (Ui.pageIndex > 0)) {
      Ui.paintUpArrow(g, (centerX - 9), (top + 2), false);
    }
    y += 18;
    g.setClip(left, top, right, bottom);
    for (let line = 0; line < Ui.pages[Ui.pageIndex].length; line++) {
      if (Ui.textAlign === 1) {
        g.drawString(Ui.pages[Ui.pageIndex][line], centerX, y, 17);
      } else {
        let anchor = 24;
        if (Storage.getSetting(4) === 0) {
          anchor = 20;
        }
        g.drawString(Ui.pages[Ui.pageIndex][line], textX, y, anchor);
      }
      y += fontHeight;
    }
    if (Ui.onLastPage) {
      if (showEndMarker) {
        Ui.paintDownArrow(g, (centerX - 9), (((bottom - 18)) - 1), true);
      }
    } else if (Ui.paged) {
      Ui.paintDownArrow(g, (centerX - 9), (((bottom - 18)) - 1), false);
    }
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
  }
  static setHeader(icon, text) {
    Ui.headerEmpty = false;
    Ui.headerIcon = icon;
    if (text == null) {
      Ui.headerLines = [""];
      Ui.headerEmpty = true;
    } else {
      let availWidth = (GameMIDlet.screenWidth - 6);
      Ui.headerLines = Ui.wrapLines(text, ((Ui.headerIcon != null) ? (availWidth - 30) : (availWidth - 8)), Ui.headerFont);
    }
    Ui.headerTop = 0;
    Ui.headerHeight = 26;
    if (Ui.headerIcon != null) {
      Ui.headerHeight = Math.max(Ui.headerHeight, (((Ui.headerIcon.getHeight() + 12)) + Ui.headerFont.getHeight()));
    }
    Ui.boxY = Math.max(Ui.boxY, (Ui.headerTop + Ui.headerHeight));
    if (Ui.boxWidth === -1) {
      Ui.boxWidth = GameMIDlet.screenWidth;
    }
    Ui.boxWidth = Math.min(Ui.boxWidth, (GameMIDlet.screenWidth - Ui.boxX));
    if (Ui.boxHeight === -1) {
      Ui.boxHeight = GameMIDlet.screenHeight;
    }
    Ui.boxHeight = Math.min((((GameMIDlet.screenHeight - Ui.boxY)) - Ui.softKeyHeight), Ui.boxHeight);
    Storage.dirty = true;
  }
  static openDialog(icon, text, align, x, y, width, height, unused) {
    Ui.dismissDialog();
    Ui.mode = 2;
    Ui.boxX = x;
    Ui.boxY = y;
    Ui.boxWidth = width;
    Ui.boxHeight = height;
    Ui.backgroundAlpha = 255;
    Ui.textAlign = align;
    Ui.setHeader(icon, text);
    Ui.textWidth = (((Ui.boxWidth - 32)) + 0);
    Storage.dirty = true;
  }
  static setColorPalette(colors) {
    Ui.headerFont = Font.getFont(32, 1, 0);
    Ui.bodyFont = Font.getFont(32, 0, 8);
    Ui.boldSmallFont = Font.getFont(32, 1, 8);
    Ui.softKeyHeight = (Font.getFont(32, 1, 8).getHeight() + 4);
    Ui.palette = colors;
    Ui.arrowSprite = Resources.getImage(0);
    Storage.dirty = true;
  }
  static wrapLines(text, maxWidth, font) {
    return Ui.wrapPages(text, -1, maxWidth, font)[0];
  }
  static wrapPages(text, maxHeight, maxWidth, font) {
    if (text == null) {
      return [new Array(0).fill(null)];
    }
    System.currentTimeMillis();
    let len = text.length;
    let pages = new Vector();
    let page = null;
    let pos = 0;
    let pageUsed = 0;
    let lineWidth = 0;
    let line = null;
    let segStart;
    let segEnd = 0;
    let fontHeight = font.getHeight();
    let nextNewline = 0;
    let nextTag = 0;
    let nextPos;
    do {
      let pageBreak = false;
      let lineBreak = false;
      let tooLong = false;
      if (page == null) {
        page = new Vector();
        pageUsed = 0;
      }
      if (nextNewline <= pos) {
        nextNewline = text.indexOf(String.fromCharCode(10), pos);
        if (nextNewline === -1) {
          nextNewline = len;
        }
      }
      if (nextTag <= pos) {
        nextTag = text.indexOf("\\p", pos);
        if (nextTag === -1) {
          nextTag = len;
        }
      }
      if (nextTag < nextNewline) {
        segStart = pos;
        segEnd = nextTag;
        nextPos = (nextTag + "\\p".length);
        pageBreak = true;
        lineBreak = true;
      } else if (nextNewline < nextTag) {
        segStart = pos;
        segEnd = nextNewline;
        nextPos = (nextNewline + 1);
        lineBreak = true;
      } else {
        segStart = pos;
        segEnd = len;
        nextPos = len;
      }
      let space = text.indexOf(String.fromCharCode(32), segStart);
      let dot = text.indexOf(String.fromCharCode(46), segStart);
      let brk = Ui.nextBreak(text, len, space, dot);
      brk = Math.min(brk, segEnd);
      let width = (lineWidth + font.substringWidth(text, pos, (brk - pos)));
      let lastGood = -1;
      while ((width < maxWidth) && (brk !== -1)) {
        lastGood = brk;
        if (brk === segEnd) {
          break;
        }
        space = text.indexOf(String.fromCharCode(32), (brk + 1));
        dot = text.indexOf(String.fromCharCode(46), (brk + 1));
        brk = Ui.nextBreak(text, len, space, dot);
        if ((brk > segEnd) || (brk === -1)) {
          brk = segEnd;
        }
        width = (lineWidth + font.substringWidth(text, pos, (brk - pos)));
      }
      if (lastGood === -1) {
        tooLong = true;
      } else if (lastGood < segEnd) {
        segEnd = lastGood;
        nextPos = ((text.charCodeAt(lastGood) === 32) ? (lastGood + 1) : lastGood);
        lineBreak = true;
        pageBreak = false;
      }
      width = (lineWidth + font.substringWidth(text, pos, (segEnd - pos)));
      line = text.substring(pos, segEnd);
      if (tooLong) {
        nextPos = pos;
        do {
          nextPos++;
          let sub = text.substring(pos, nextPos);
          if (font.stringWidth(sub) < maxWidth) {
            line = sub;
          } else {
            nextPos--;
            break;
          }
        } while (nextPos < len);
        lineBreak = true;
      }
      lineWidth = width;
      if (lineBreak) {
        if ((maxHeight !== -1) && ((pageUsed + fontHeight) > maxHeight)) {
          pages.addElement(page);
          page = new Vector();
          pageUsed = 0;
        }
        page.addElement(line);
        pageUsed += fontHeight;
        line = null;
        lineWidth = 0;
      }
      if (pageBreak) {
        pages.addElement(page);
        page = null;
      }
      pos = nextPos;
    } while (pos < len);
    if (page != null) {
      if (line != null) {
        if ((maxHeight !== -1) && ((pageUsed + fontHeight) > maxHeight)) {
          pages.addElement(page);
          page = new Vector();
        }
        page.addElement(line);
      }
      pages.addElement(page);
    }
    let result = new Array(pages.size()).fill(null);
    for (let i = 0; i < pages.size(); i++) {
      let p = pages.elementAt(i);
      let n = p.size();
      result[i] = new Array(n).fill(null);
      for (let j = 0; j < n; j++) {
        result[i][j] = p.elementAt(j);
      }
    }
    return result;
  }
  static nextBreak(text, len, space, dot) {
    let brk;
    if ((space === -1) && (dot === -1)) {
      return len;
    }
    if (space === -1) {
      brk = (dot + 1);
      if (brk < len) {
        if ((text.charCodeAt(brk) === 46) || (text.charCodeAt(brk) === 32)) {
          return len;
        }
        return brk;
      }
      return len;
    }
    if ((dot !== -1) && (dot < space)) {
      brk = (dot + 1);
      if (brk < len) {
        if ((text.charCodeAt(brk) === 46) || (text.charCodeAt(brk) === 32)) {
          return space;
        }
        return brk;
      }
      return space;
    }
    return space;
  }
  static paintList(g) {
    Ui.paintHeader(g);
    if (Storage.dirty) {
      let rowHeight = Math.max(Ui.bodyFont.getHeight(), (Ui.iconMaxHeight + 2));
      g.setFont(Ui.bodyFont);
      let textX = ((Storage.getSetting(4) === 1) ? (((((Ui.boxX + Ui.boxWidth)) - 16)) - Ui.iconMaxWidth) : (((Ui.boxX + 16)) + Ui.iconMaxWidth));
      let iconX = ((Storage.getSetting(4) === 1) ? (((Ui.boxX + Ui.boxWidth)) - 8) : (Ui.boxX + 8));
      if (Ui.textAlign === 1) {
        textX = (Ui.boxX + ((Ui.boxWidth >> 1)));
      }
      let listTop = (Ui.boxY + 8);
      let y = listTop;
      let listHeight = (Ui.boxHeight - 16);
      let visibleRows = ((listHeight / ((rowHeight + 0))) | 0);
      if (visibleRows < Ui.itemCount) {
        listTop = (((Ui.boxY + 18)) + 8);
        y = listTop;
        listHeight = (Ui.boxHeight - 52);
        visibleRows = ((listHeight / ((rowHeight + 0))) | 0);
      }
      let halfRows = (((visibleRows - 1)) >> 1);
      let iconYOffset = (((rowHeight - Ui.iconMaxHeight)) >> 1);
      let textYOffset = (((rowHeight - Ui.bodyFont.getHeight())) >> 1);
      let selectedY = rowHeight;
      let totalHeight = 0;
      for (let k = 0; k < Ui.itemCount; k++) {
        let item = Ui.itemLines[k];
        if (k === Ui.cursor) {
          selectedY = totalHeight;
        }
        let itemHeight = (rowHeight + (Math.imul(Ui.bodyFont.getHeight(), ((item.length - 1)))));
        totalHeight += itemHeight;
      }
      let scroll = (selectedY - (Math.imul(halfRows, rowHeight)));
      let moreAbove = false;
      let moreBelow = false;
      scroll = Math.min(scroll, (totalHeight - (Math.imul(visibleRows, rowHeight))));
      scroll = Math.max(0, scroll);
      y -= scroll;
      for (let k = 0; k < Ui.itemCount; k++) {
        let item = Ui.itemLines[k];
        if (k === Ui.cursor) {
          g.setColor(Ui.palette[6]);
          if (Storage.getSetting(4) === 1) {
            let hiliteWidth = (((((Ui.bodyFont.stringWidth(Ui.itemLines[k][0]) + 16)) + Ui.iconMaxWidth)) + 3);
            g.fillRect((((((Ui.boxX + Ui.boxWidth)) - 4)) - hiliteWidth), (y - 1), hiliteWidth, (rowHeight + (Math.imul(Ui.bodyFont.getHeight(), ((item.length - 1))))));
          } else {
            g.fillRect((Ui.boxX + 8), (y - 1), (Ui.boxWidth - 16), (rowHeight + (Math.imul(Ui.bodyFont.getHeight(), ((item.length - 1))))));
          }
        }
        if (Ui.itemValues[k] === 2) {
          g.setColor(Ui.palette[5]);
        } else {
          g.setColor(Ui.palette[2]);
          g.setFont(Ui.bodyFont);
          if (GameMIDlet.getInstance().loadState === 1) {
            g.setColor(0);
          }
          if (k === Ui.cursor) {
            g.setColor(Ui.palette[7]);
            if (GameMIDlet.getInstance().loadState === 1) {
              g.setColor(16777215);
            }
            g.setFont(Ui.boldSmallFont);
          }
        }
        let anchor = 17;
        if (Ui.textAlign === 0) {
          anchor = ((Storage.getSetting(4) === 0) ? 20 : 24);
        }
        for (let j = 0; j < item.length; j++) {
          if ((y >= listTop) && ((y + rowHeight) <= (listTop + listHeight))) {
            if ((Ui.itemIcons[k] != null) && (j === 0)) {
              let offset = 0;
              if (Ui.textAlign === 1) {
                let maxWidth = 0;
                for (let m2 = 0; m2 < item.length; m2++) {
                  maxWidth = Math.max(maxWidth, Ui.bodyFont.stringWidth(item[m2]));
                }
                offset = (textX - ((((Ui.iconMaxWidth + 8)) + ((maxWidth >> 1)))));
              }
              if (k === Ui.cursor) {
                offset++;
              } else {
                offset--;
              }
              if (Storage.getSetting(4) === 1) {
                g.drawImage(Ui.itemIcons[k], (iconX - offset), (((y + iconYOffset)) - 1), 24);
              } else {
                g.drawImage(Ui.itemIcons[k], (iconX + offset), (((y + iconYOffset)) - 1), 20);
              }
            }
            g.drawString(item[j], textX, (y + textYOffset), anchor);
          } else if (k < Ui.cursor) {
            moreAbove = true;
          } else {
            moreBelow = true;
          }
          if (j < (item.length - 1)) {
            y += Ui.bodyFont.getHeight();
          }
        }
        y += rowHeight;
      }
      if (moreAbove) {
        Ui.paintUpArrow(g, (((Ui.boxX + (((Ui.boxWidth / 2) | 0)))) - 9), (Ui.boxY + 8), true);
      }
      if (moreBelow) {
        Ui.paintDownArrow(g, (((Ui.boxX + (((Ui.boxWidth / 2) | 0)))) - 9), (((((Ui.boxY + Ui.boxHeight)) - 18)) - 8), false);
      }
    }
  }
  static getItemAt(px, py) {
    if ((((Ui.mode !== 1) || (Ui.itemLines == null)) || (Ui.itemCount <= 0)) || (Ui.bodyFont == null)) {
      return -1;
    }
    if ((px < Ui.boxX) || (px > (Ui.boxX + Ui.boxWidth))) {
      return -1;
    }
    let rowHeight = (Math.max(Ui.iconMaxHeight, Ui.bodyFont.getHeight()) + 2);
    let listTop = (Ui.boxY + 8);
    let y = listTop;
    let listHeight = (Ui.boxHeight - 16);
    let visibleRows = ((listHeight / rowHeight) | 0);
    if (visibleRows < Ui.itemCount) {
      listTop = (((Ui.boxY + 18)) + 8);
      y = listTop;
      listHeight = (Ui.boxHeight - 52);
      visibleRows = ((listHeight / rowHeight) | 0);
    }
    let halfRows = (((visibleRows - 1)) >> 1);
    let selectedY = rowHeight;
    let totalHeight = 0;
    for (let k = 0; k < Ui.itemCount; k++) {
      if (k === Ui.cursor) {
        selectedY = totalHeight;
      }
      let itemHeight = (rowHeight + (Math.imul(Ui.bodyFont.getHeight(), ((Ui.itemLines[k].length - 1)))));
      totalHeight += itemHeight;
    }
    let scroll = (selectedY - (Math.imul(halfRows, rowHeight)));
    scroll = Math.min(scroll, (totalHeight - (Math.imul(visibleRows, rowHeight))));
    scroll = Math.max(0, scroll);
    y -= scroll;
    for (let k = 0; k < Ui.itemCount; k++) {
      let itemHeight = (rowHeight + (Math.imul(Ui.bodyFont.getHeight(), ((Ui.itemLines[k].length - 1)))));
      if ((((py >= (y - 1)) && (py < (y + itemHeight))) && (py >= listTop)) && (py <= (listTop + listHeight))) {
        return k;
      }
      y += itemHeight;
    }
    return -1;
  }
  static setCursor(index) {
    Ui.cursor = index;
    Storage.cursor = index;
    Storage.dirty = true;
  }
  static paintDownArrow(g, x, y, atEnd) {
    let srcY = (atEnd ? ((y - 36)) : ((y - 18)));
    g.setClip(x, y, 18, 18);
    g.drawImage(Ui.arrowSprite, x, srcY, 20);
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
  }
  static isOnLastPage() {
    return Ui.onLastPage;
  }
  static dismissDialog() {
    Ui.mode = 0;
    Ui.headerLines = null;
    Ui.onLastPage = false;
    Ui.pageIndex = 0;
    Ui.itemCount = 0;
    Ui.cursor = 0;
    Ui.headerIcon = null;
    Ui.itemIcons = null;
    Ui.iconMaxHeight = 0;
    Ui.iconMaxWidth = 0;
    Ui.itemLines = null;
    Ui.itemValues = null;
    Ui.pages = null;
    Ui.textWidth = -1;
    Ui.boxX = -1;
    Ui.boxY = -1;
    Ui.boxWidth = -1;
    Ui.boxHeight = -1;
    Ui.headerHeight = -1;
    Ui.headerTop = -1;
    Ui.backgroundAlpha = -1;
    for (let i = 0; i < Ui.colorOverride.length; i++) {
      Ui.colorOverride[i] = -1;
    }
    Ui.paged = false;
  }
  static paintDialog(g) {
    Ui.paintHeader(g);
    if (Storage.dirty) {
      Ui.paintText(g, false);
    }
  }
  static paintPanel(g) {
    if (Storage.dirty) {
      let right = (Ui.boxX + Ui.boxWidth);
      let bottom = (Ui.boxY + Ui.boxHeight);
      g.setClip(Ui.boxX, Ui.boxY, right, bottom);
      if (Ui.backgroundAlpha !== 0) {
        let bgColor = (((Ui.colorOverride[1] === -1)) ? Ui.palette[4] : Ui.colorOverride[1]);
        g.setColor(bgColor);
        g.fillRect(Ui.boxX, Ui.boxY, Ui.boxWidth, Ui.boxHeight);
        let borderColor = (((Ui.colorOverride[2] === -1)) ? Ui.palette[8] : Ui.colorOverride[2]);
        g.setColor(borderColor);
        g.drawLine(Ui.boxX, Ui.boxY, right, Ui.boxY);
        g.drawLine(right, Ui.boxY, right, bottom);
        g.drawLine(Ui.boxX, bottom, right, bottom);
        g.drawLine(Ui.boxX, Ui.boxY, Ui.boxX, bottom);
      }
      Ui.paintText(g, true);
    }
  }
  static paintHeader(g) {
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    let x = ((Storage.getSetting(4) === 1) ? (GameMIDlet.screenWidth - 14) : 14);
    g.setColor(Ui.palette[1]);
    if (Ui.headerEmpty ? Storage.dirty : ((((Storage.dirty || (Ui.headerLines.length > 1))) && (Ui.headerIcon != null)))) {
      g.drawImage(Ui.headerIcon, (GameMIDlet.screenWidth >> 1), (6 + Ui.headerTop), 17);
    }
    if (Ui.headerLines == null) {
      return;
    }
    let textY = (Ui.headerTop + ((((Ui.headerHeight - Ui.headerFont.getHeight())) >> 1)));
    if (Ui.headerIcon != null) {
      textY += (((Ui.headerIcon.getHeight() + Ui.headerFont.getHeight())) >> 1);
    }
    g.setColor(Ui.palette[0]);
    g.setFont(Ui.headerFont);
    let anchor = 20;
    if (Storage.getSetting(4) === 1) {
      anchor = 24;
    }
    if ((Ui.headerIcon == null) && (Ui.textAlign === 1)) {
      x = (GameMIDlet.screenWidth >> 1);
      anchor = 17;
    }
    if ((Ui.headerIcon != null) && (Storage.getSetting(4) === 0)) {
      x = (GameMIDlet.screenWidth >> 1);
      anchor = 17;
    }
    if ((Ui.headerIcon != null) && (Storage.getSetting(4) === 1)) {
      x = (GameMIDlet.screenWidth >> 1);
      anchor = 17;
    }
    if (Ui.headerLines.length > 1) {
      let now = System.currentTimeMillis();
      if (Ui.tickerStart === 0) {
        Ui.tickerStart = now;
      }
      let elapsed = (((now - Ui.tickerStart)) | 0);
      let t = (elapsed % (((Math.imul(1500, Ui.headerLines.length)) + 500)));
      let index = ((t / 1500) | 0);
      let phase = (t % 1500);
      if (index < Ui.headerLines.length) {
        phase -= 1000;
      } else {
        index = -1;
      }
      let clipX = g.getClipX();
      let clipY = g.getClipY();
      let clipW = g.getClipWidth();
      let clipH = g.getClipHeight();
      g.setClip(0, Ui.headerTop, GameMIDlet.screenWidth, Ui.headerHeight);
      let current = null;
      if (index >= 0) {
        current = Ui.headerLines[index];
      }
      if (phase < 0) {
        if (current != null) {
          g.drawString(current, x, textY, anchor);
        }
      } else {
        let next = null;
        if ((index + 1) < Ui.headerLines.length) {
          next = Ui.headerLines[(index + 1)];
        }
        let shift = (((Math.imul(Ui.headerHeight, phase)) / 500) | 0);
        if (current != null) {
          g.drawString(current, x, (textY - shift), anchor);
        }
        if (next != null) {
          g.drawString(next, x, (((textY + Ui.headerHeight)) - shift), anchor);
        }
      }
      g.setClip(clipX, clipY, clipW, clipH);
      return;
    }
    if (Storage.dirty) {
      g.drawString(Ui.headerLines[0], x, textY, anchor);
    }
  }
}

Ui.$clinit = function () {
  Ui.backgroundAlpha = -1;
  Ui.colorOverride = new Int32Array(3);
  Ui.headerFont = null;
  Ui.bodyFont = null;
  Ui.boldSmallFont = null;
  Ui.headerEmpty = false;
  Ui.mode = -1;
  Ui.headerIcon = null;
  Ui.cursor = 0;
  Ui.headerLines = null;
  Ui.palette = null;
  Ui.softKeyHeight = 0;
  Ui.textAlign = 0;
  Ui.paged = false;
  Ui.pageIndex = 0;
  Ui.arrowSprite = null;
  Ui.onLastPage = false;
  Ui.itemCount = 0;
  Ui.tickerStart = 0;
  Ui.itemIcons = null;
  Ui.itemLines = null;
  Ui.itemValues = null;
  Ui.iconMaxHeight = 0;
  Ui.iconMaxWidth = 0;
  Ui.pages = null;
  Ui.textWidth = -1;
  Ui.boxX = -1;
  Ui.boxY = -1;
  Ui.boxWidth = -1;
  Ui.boxHeight = -1;
  Ui.headerHeight = -1;
  Ui.headerTop = -1;
};
