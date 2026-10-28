class CityMode {
  static init() {
    CityMode.font = House.getGameFont();
    CityMode.hintLinesVisible = 51;
    CityMode.hintLinesVisible -= 2;
    CityMode.hintLinesVisible = ((CityMode.hintLinesVisible / CityMode.font.getHeight()) | 0);
    CityMode.grid = new Int32Array(75);
    CityMode.cellLevels = new Int32Array(25);
    CityMode.tutorialShown = new Array(46).fill(false);
    CityMode.highlightCells = new Int32Array(16);
    CityMode.buildingNames = [Resources.getString$1(83), Resources.getString$1(84), Resources.getString$1(85), Resources.getString$1(86), CityMode.PINK_NAME, Resources.getString$1(87), Resources.getString$1(88), Resources.getString$1(89), Resources.getString$1(90), CityMode.PINK_SPECIAL_NAME];
    CityMode.helpLines = new Array(15).fill(null);
    let i = (GameMIDlet.screenWidth - 20);
    let strArr = [Resources.getString$1(99), Resources.getString$1(100), Resources.getString$1(101), Resources.getString$1(102), CityMode.PINK_HELP];
    for (let i2 = 0; i2 < CityMode.BUILDING_COUNT; i2++) {
      CityMode.helpLines[i2] = House.wrapText(strArr[i2], CityMode.font, i);
      CityMode.helpLines[(i2 + CityMode.BUILDING_COUNT)] = House.wrapText(Resources.getString$2(62, [CityMode.buildingNames[i2], String(House.scoreThresholds[i2])]), CityMode.font, i);
      CityMode.helpLines[(i2 + (Math.imul(CityMode.BUILDING_COUNT, 2)))] = House.wrapText(Resources.getString$2(63, [String(CityMode.levelThresholds[CityMode.buildingUnlockLevels[i2]])]), CityMode.font, i);
    }
    CityMode.hintPlaceable = House.wrapText(Resources.getString$1(65), CityMode.font, i);
    CityMode.hintCellTooLow = House.wrapText(Resources.getString$1(66), CityMode.font, i);
    CityMode.hintOffGrid = House.wrapText(Resources.getString$1(64), CityMode.font, i);
  }
  static showTutorialHint(hintTypeIndex) {
    let zArr;
    let i2;
    switch (hintTypeIndex) {
      case 0:
        House.showPrompt(Resources.getString$1(36), null, null);
        zArr = CityMode.tutorialShown;
        i2 = 0;
        break;
      case 3:
        House.showPrompt(Resources.getString$1(39), null, null);
        zArr = CityMode.tutorialShown;
        i2 = 3;
        break;
      case 38:
        if (House.towersCompleted === 2) {
          House.showPrompt(Resources.getString$1(46), null, null);
          zArr = CityMode.tutorialShown;
          i2 = 38;
          break;
        }
        return;
      default:
        return;
    }
    zArr[i2] = true;
    CityMode.modalActive = true;
  }
  static handleKeyPressed(keyCode, gameAction) {
    let c = CityMode.mapGameAction(keyCode, gameAction);
    if (c === 0) {
      CityMode.keyUp = true;
    } else if (c === 1) {
      CityMode.keyDown = true;
    } else if (c === 2) {
      CityMode.keyLeft = true;
    } else if (c === 3) {
      CityMode.keyRight = true;
    } else if (c === 5) {
      CityMode.keyFire = true;
    }
    c = (keyCode - 48);
    if ((c >= 0) && (c <= 9)) {
      let cArr = CityMode.cheatCode;
      let i3 = CityMode.cheatIndex;
      CityMode.cheatIndex = (i3 + 1);
      if (c === (cArr[i3] - 48)) {
        if (CityMode.cheatIndex === CityMode.cheatCode.length) {
          CityMode.cheatActive = true;
          CityMode.cheatIndex = 0;
          CityMode.updateUnlocks();
          return;
        }
        return;
      }
    }
    CityMode.cheatIndex = 0;
  }
  static startPlacement(cellX, cellY, buildingTier) {
    CityMode.towerGameActive = false;
    CityMode.phase = 1;
    CityMode.pieceType = cellX;
    CityMode.pieceValue = cellY;
    CityMode.pieceVariant = buildingTier;
    CityMode.cursorCol = 2;
    CityMode.cursorRow = 2;
    CityMode.placeDelay = 700;
    CityMode.placeTimer = 0;
    CityMode.cursorActive = true;
    if (CityMode.cheatActive && (cellY === 0)) {
      CityMode.randomizeBuildingStats();
    }
    if (!CityMode.tutorialShown[3]) {
      House.showPrompt(((Resources.getString$1(39) + "\n") + Resources.getString$1(158)), null, null);
      CityMode.tutorialShown[3] = true;
      CityMode.modalActive = true;
    }
    if (!CityMode.tutorialShown[38] && (House.towersCompleted === 2)) {
      House.showPrompt(Resources.getString$1(46), null, null);
      CityMode.tutorialShown[38] = true;
      CityMode.modalActive = true;
    }
  }
  static paint(g) {
    if (CityMode.populationGauge == null) {
      return;
    }
    CityMode.paintSkyBackground(g);
    CityMode.paintTopHUD(g);
    CityMode.paintBottomHintPanel(g);
    let gridOriginX = (((((((((((GameMIDlet.screenWidth - 28)) - 11)) - 173)) >> 1)) + 28)) + 11);
    let gridOriginY = (((((((((((GameMIDlet.screenHeight - 60)) - 56)) - 173)) + 1)) >> 1)) + 60);
    CityMode.paintCityGrid(g, gridOriginX, gridOriginY);
    CityMode.paintPlacedBuildings(g, gridOriginX, gridOriginY);
    CityMode.paintPlacementPiece(g, gridOriginX, gridOriginY);
    CityMode.paintBuildingSelector(g, gridOriginX, gridOriginY);
    if (CityMode.modalActive) {
      House.paintTutorialModal(g);
    }
    CityMode.needsRepaint = false;
  }
  static paintSkyBackground(g) {
    let bottomY = (GameMIDlet.screenHeight - 55);
    for (let y = 58; y <= bottomY; y++) {
      let r = (CityMode.skyGradient[0] + ((((Math.imul(CityMode.skyGradient[3], ((y - 58)))) / ((bottomY - 58))) | 0)));
      let gr = (CityMode.skyGradient[1] + ((((Math.imul(CityMode.skyGradient[4], ((y - 58)))) / ((bottomY - 58))) | 0)));
      let b = (CityMode.skyGradient[2] + ((((Math.imul(CityMode.skyGradient[5], ((y - 58)))) / ((bottomY - 58))) | 0)));
      g.setColor(r, gr, b);
      g.drawLine(0, y, GameMIDlet.screenWidth, y);
    }
  }
  static paintTopHUD(g) {
    let curY = 0;
    for (let band = 0; band < 18; band++) {
      g.setColor(CityMode.bandColors[band]);
      if (band === 2) {
        g.fillRect(3, curY, 56, 40);
      } else if (band === 3) {
        g.fillRect(59, curY, (((GameMIDlet.screenWidth - 6)) - 56), 40);
        curY += 40;
      } else {
        g.drawLine(3, curY, (GameMIDlet.screenWidth - 3), curY);
        curY++;
      }
    }
    let maxGaugeWidth = (GameMIDlet.screenWidth - 6);
    let gaugeFillWidth;
    if (CityMode.level < (CityMode.levelThresholds.length - 1)) {
      let lvlIdx = CityMode.level;
      while ((lvlIdx < (CityMode.levelThresholds.length - 2)) && ((CityMode.population + CityMode.populationPending) > CityMode.levelThresholds[(lvlIdx + 1)])) {
        lvlIdx++;
      }
      let currentThreshold = CityMode.levelThresholds[lvlIdx];
      let nextThreshold = CityMode.levelThresholds[(lvlIdx + 1)];
      gaugeFillWidth = (((Math.imul(maxGaugeWidth, ((((CityMode.population + CityMode.populationPending)) - currentThreshold)))) / ((nextThreshold - currentThreshold))) | 0);
    } else {
      gaugeFillWidth = maxGaugeWidth;
    }
    g.setColor(-89856);
    g.fillRect(3, 43, gaugeFillWidth, 6);
    g.setColor(-130816);
    g.fillRect(3, 49, gaugeFillWidth, 3);
    g.setClip(0, 0, 3, CityMode.populationGauge.getHeight());
    g.drawImage(CityMode.populationGauge, 0, 0, 20);
    g.setClip((GameMIDlet.screenWidth - 3), 0, 3, CityMode.populationGauge.getHeight());
    g.drawImage(CityMode.populationGauge, (((GameMIDlet.screenWidth - 3)) - 3), 0, 20);
    let iconOffsetX = 0;
    let levelBoxColor = -15922164;
    if (CityMode.level === 0) {
      iconOffsetX = -42;
      levelBoxColor = -4602071;
    }
    g.setClip(8, 12, 14, CityMode.statusIcons.getHeight());
    g.drawImage(CityMode.statusIcons, (iconOffsetX + 8), 12, 20);
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    g.setColor(-5858534);
    g.drawLine(24, 16, 53, 16);
    g.setColor(levelBoxColor);
    g.fillRect(24, 17, 30, 10);
    g.setColor(-1971082);
    g.drawLine(24, 27, 53, 27);
    if (CityMode.level > 0) {
      CityMode.drawBitmapNumber(g, CityMode.digitFont, (CityMode.level + "<20"), 54, 18, 7, 6, 1, 0);
    }
    g.setClip(76, 12, 14, CityMode.statusIcons.getHeight());
    g.drawImage(CityMode.statusIcons, 62, 12, 20);
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    if (CityMode.populationFlashTimer >= 0) {
      CityMode.drawBitmapNumber(g, CityMode.digitSheetCurrent, ":", 96, 16, 7, 0, 0, 0);
    }
    for (let barIdx = 0; barIdx < 6; barIdx++) {
      let barOffset = (((barIdx === 5)) ? 3 : ((((5 - barIdx) <= CityMode.populationFlashCount) ? CityMode.flashColorIndex : 0)));
      g.setClip(((Math.imul(barIdx, 14)) + 100), 10, 14, 25);
      g.drawImage(CityMode.hudBarSprite, ((Math.imul(((barIdx - barOffset)), 14)) + 100), 10, 20);
    }
    let popDigitSheet = CityMode.digitSheetA;
    if (((CityMode.populationFlashCount === 0) && (CityMode.populationFlashTimer >= 0)) && ((CityMode.populationFlashTimer % 400) < 200)) {
      popDigitSheet = CityMode.digitSheetCurrent;
    }
    CityMode.drawBitmapNumber(g, popDigitSheet, String(CityMode.population), 167, 16, 7, 14, 5, CityMode.populationFlashCount);
    let currentCellType = (((CityMode.cursorCol >= 0)) ? CityMode.grid[((Math.imul((((Math.imul(CityMode.cursorRow, 5)) + CityMode.cursorCol)), 3)) + 0)] : 0);
    let borderColor;
    let fillColor;
    let iconXOffset;
    if (((CityMode.phase === 0) || (CityMode.placementResultTimer >= 0)) || CityMode.placementInProgress) {
      borderColor = -3686478;
      fillColor = -5399421;
      iconXOffset = -56;
    } else {
      borderColor = -1907998;
      fillColor = -15922164;
      iconXOffset = -28;
    }
    let boxStartX = (GameMIDlet.screenWidth - 60);
    g.setClip(boxStartX, 12, 14, CityMode.statusIcons.getHeight());
    g.drawImage(CityMode.statusIcons, (iconXOffset + boxStartX), 12, 20);
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    let boxInnerX = (boxStartX + 20);
    g.setColor(borderColor);
    g.fillRect(boxInnerX, 8, 30, 12);
    g.setColor(fillColor);
    g.fillRect((boxInnerX + 1), 9, 28, 10);
    if (currentCellType === 0) {
      borderColor = -3686478;
      fillColor = -5399421;
    }
    g.setColor(borderColor);
    g.fillRect(boxInnerX, 21, 30, 12);
    g.setColor(fillColor);
    g.fillRect((boxInnerX + 1), 22, 28, 10);
    if (((CityMode.phase === 1) && (CityMode.placementResultTimer < 0)) && !CityMode.placementInProgress) {
      g.setColor(CityMode.buildingColors[(((CityMode.pieceType + CityMode.BUILDING_COUNT)) - 1)]);
      g.fillRect((boxInnerX + 1), 9, 7, 10);
      g.setColor(CityMode.buildingColors[(CityMode.pieceType - 1)]);
      g.fillRect((boxInnerX + 1), 9, 6, 9);
      CityMode.drawBitmapNumber(g, CityMode.digitFont, String(CityMode.pieceValue), (boxInnerX + 26), 9, 7, 6, 1, 0);
      if (currentCellType > 0) {
        g.setColor(CityMode.buildingColors[(((currentCellType + CityMode.BUILDING_COUNT)) - 1)]);
        g.fillRect((boxInnerX + 1), 22, 7, 10);
        g.setColor(CityMode.buildingColors[(currentCellType - 1)]);
        g.fillRect((boxInnerX + 1), 22, 6, 9);
        let cellValue = CityMode.grid[((Math.imul((((Math.imul(CityMode.cursorRow, 5)) + CityMode.cursorCol)), 3)) + 1)];
        CityMode.drawBitmapNumber(g, CityMode.digitFont, String(cellValue), (boxInnerX + 26), 22, 7, 6, 1, 0);
      }
    }
  }
  static paintBottomHintPanel(g) {
    let panelY = (GameMIDlet.screenHeight - 56);
    g.setColor(-15463412);
    g.drawLine(3, panelY, (GameMIDlet.screenWidth - 3), panelY);
    g.setColor(-8556946);
    g.drawLine(3, (panelY + 1), (GameMIDlet.screenWidth - 3), (panelY + 1));
    g.setColor(-1318431);
    g.drawLine(3, (panelY + 2), (GameMIDlet.screenWidth - 3), (panelY + 2));
    g.setColor(-1);
    g.fillRect(3, (panelY + 3), (GameMIDlet.screenWidth - 6), 51);
    g.setColor(-1318431);
    g.drawLine(3, (((panelY + 56)) - 2), (GameMIDlet.screenWidth - 3), (((panelY + 56)) - 2));
    g.setColor(-8556946);
    g.drawLine(3, (((panelY + 56)) - 1), (GameMIDlet.screenWidth - 3), (((panelY + 56)) - 1));
    g.setClip(0, panelY, 3, CityMode.populationGauge.getHeight());
    g.drawImage(CityMode.populationGauge, -6, panelY, 20);
    g.setClip((GameMIDlet.screenWidth - 3), panelY, 3, CityMode.populationGauge.getHeight());
    g.drawImage(CityMode.populationGauge, (GameMIDlet.screenWidth - 12), panelY, 20);
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    let textY = (panelY + 4);
    g.setColor(-16777216);
    g.setFont(CityMode.font);
    let isRtl = (((Storage.getSetting(4) === 1)) ? 1 : 0);
    let textX = (((isRtl === 1)) ? ((GameMIDlet.screenWidth - 10)) : 10);
    let anchor = (((isRtl === 1)) ? 24 : 20);
    for (let line = CityMode.hintScroll; (line < (CityMode.hintScroll + CityMode.hintLinesVisible)) && (line < CityMode.hintLines.length); line++) {
      g.drawString(CityMode.hintLines[line], textX, textY, anchor);
      textY += CityMode.font.getHeight();
    }
  }
  static paintCityGrid(g, gridOriginX, gridOriginY) {
    let animOffset = 0;
    if (CityMode.placementResultTimer >= 0) {
      animOffset = (CityMode.placementResultTimer - 750);
      if (animOffset > 0) {
        animOffset = (-animOffset);
      }
      animOffset += 750;
    }
    if (CityMode.phase === 1) {
      let iconSlide = 0;
      if (CityMode.placementResultTimer >= 0) {
        iconSlide = (((Math.imul(((-((((gridOriginX - 37)) + ((CityMode.buildIcon.getWidth() << 1)))))), animOffset)) / 750) | 0);
      }
      g.drawImage(CityMode.buildIcon, (iconSlide + ((gridOriginX - 37))), (gridOriginY + 140), 20);
    }
    g.setColor(-1);
    g.fillRect(gridOriginX, gridOriginY, 173, 173);
    g.setColor(-12566464);
    g.fillRect((gridOriginX + 1), (gridOriginY + 1), 171, 171);
    let targetTier = (((CityMode.phase === 1)) ? ((CityMode.pieceType - 1)) : CityMode.selectedBuilding);
    let c1R = (((CityMode.cellPalette[targetTier] >> 16)) & 255);
    let c1G = (((CityMode.cellPalette[targetTier] >> 8)) & 255);
    let c1B = (CityMode.cellPalette[targetTier] & 255);
    let c2R = (((CityMode.cellPalette[(targetTier + CityMode.BUILDING_COUNT)] >> 16)) & 255);
    let c2G = (((CityMode.cellPalette[(targetTier + CityMode.BUILDING_COUNT)] >> 8)) & 255);
    let c2B = (CityMode.cellPalette[(targetTier + CityMode.BUILDING_COUNT)] & 255);
    let blink = (CityMode.blinkTimer800 - 400);
    if (blink > 0) {
      blink = (-blink);
    }
    blink += 400;
    let blendedColor = (((((((c1R + ((((Math.imul(((c2R - c1R)), blink)) / 400) | 0)))) << 16)) | ((((c1G + ((((Math.imul(((c2G - c1G)), blink)) / 400) | 0)))) << 8)))) | ((((((Math.imul(blink, ((c2B - c1B)))) / 400) | 0)) + c1B)));
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        let colSec = CityMode.tierColorsSecondary[CityMode.unlockedBuildingTier];
        let colPri = CityMode.tierColorsPrimary[CityMode.unlockedBuildingTier];
        if (((((CityMode.cellLevels[((Math.imul(r, 5)) + c)] >= targetTier) && !CityMode.placementInProgress) && (CityMode.placementResultTimer < 0)) && (CityMode.selectedBuilding <= CityMode.unlockedBuildingTier)) && (((CityMode.placeDelay < 0) || (CityMode.phase !== 1)))) {
          colPri = blendedColor;
          colSec = blendedColor;
        }
        g.setColor(CityMode.tierColorsPrimary[CityMode.unlockedBuildingTier]);
        g.fillRect((((gridOriginX + 5)) + (Math.imul(c, 34))), (((gridOriginY + 5)) + (Math.imul(r, 34))), 27, 27);
        g.setColor(colSec);
        g.fillRect((((((gridOriginX + 5)) + 1)) + (Math.imul(c, 34))), (((((gridOriginY + 5)) + 1)) + (Math.imul(r, 34))), 25, 25);
        g.setColor(colPri);
        g.fillRect((((((gridOriginX + 5)) + 2)) + (Math.imul(c, 34))), (((((gridOriginY + 5)) + 2)) + (Math.imul(r, 34))), 23, 23);
        g.setColor(CityMode.tierColorsSecondary[CityMode.unlockedBuildingTier]);
        g.fillRect((((((gridOriginX + 5)) + 3)) + (Math.imul(c, 34))), (((((gridOriginY + 5)) + 3)) + (Math.imul(r, 34))), 21, 21);
      }
    }
    g.setStrokeStyle(1);
    g.setColor(-7171438);
    for (let i = 0; i < 4; i++) {
      let lineX = (((((((gridOriginX + 5)) + 27)) + 3)) + (Math.imul(i, 34)));
      g.drawLine(lineX, (((gridOriginY + 5)) + 1), lineX, (((((gridOriginY + 173)) - 5)) - 2));
    }
    for (let i = 0; i < 4; i++) {
      let lineY = (((((((gridOriginY + 5)) + 27)) + 3)) + (Math.imul(i, 34)));
      g.drawLine((((gridOriginX + 5)) + 1), lineY, (((((gridOriginX + 173)) - 5)) - 2), lineY);
    }
    g.setStrokeStyle(0);
    g.setColor(-13108);
    let animTickShift = ((Math.imul(CityMode.animTick, 32)) >> 8);
    for (let i = 0; i < 4; i++) {
      let startY = ((Math.imul(CityMode.highlightCells[((Math.imul(i, 2)) + 0)], 34)) + ((gridOriginY + 5)));
      let endY = (((((((gridOriginY + 5)) + (Math.imul(CityMode.highlightCells[((Math.imul(i, 2)) + 1)], 34)))) - 7)) - 1);
      let lineX = ((Math.imul(i, 34)) + ((((((gridOriginX + 5)) + 27)) + 3)));
      for (let segY = (startY + animTickShift); segY < endY; segY += 9) {
        g.drawLine((lineX - 1), segY, (lineX - 1), (segY + 1));
      }
      for (let segY = (endY - animTickShift); segY > startY; segY -= 9) {
        g.drawLine((lineX + 1), segY, (lineX + 1), (segY + 1));
      }
    }
    for (let i = 0; i < 4; i++) {
      let startX = ((Math.imul(CityMode.highlightCells[((((Math.imul(i, 2)) + 8)) + 0)], 34)) + ((gridOriginX + 5)));
      let endX = (((((((gridOriginX + 5)) + (Math.imul(CityMode.highlightCells[((((Math.imul(i, 2)) + 8)) + 1)], 34)))) - 7)) - 1);
      let lineY = ((Math.imul(i, 34)) + ((((((gridOriginY + 5)) + 27)) + 3)));
      for (let segX = (startX + animTickShift); segX < endX; segX += 9) {
        g.drawLine(segX, (lineY + 1), (segX + 1), (lineY + 1));
      }
      for (let segX = (endX - animTickShift); segX > startX; segX -= 9) {
        g.drawLine(segX, (lineY - 1), (segX + 1), (lineY - 1));
      }
    }
  }
  static paintPlacedBuildings(g, gridOriginX, gridOriginY) {
    for (let cellIdx = 0; cellIdx < 25; cellIdx++) {
      let bType = CityMode.grid[((Math.imul(cellIdx, 3)) + 0)];
      let bVariant = CityMode.grid[((Math.imul(cellIdx, 3)) + 2)];
      if (bType !== 0) {
        let frameWidth = ((CityMode.buildingSprites[(bType - 1)].getWidth() / 4) | 0);
        let frameHeight = CityMode.buildingSprites[(bType - 1)].getHeight();
        let drawX = (((gridOriginX + 8)) + (Math.imul(((cellIdx % 5)), 34)));
        let drawY = (((((gridOriginY + 29)) + (Math.imul((((cellIdx / 5) | 0)), 34)))) - frameHeight);
        g.setClip(drawX, drawY, frameWidth, frameHeight);
        g.drawImage(CityMode.buildingSprites[(bType - 1)], (drawX - (Math.imul(frameWidth, bVariant))), drawY, 20);
      }
    }
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
  }
  static paintPlacementPiece(g, gridOriginX, gridOriginY) {
    if ((CityMode.phase !== 1) || (CityMode.placementResultTimer >= 0)) {
      return;
    }
    let effectImage = null;
    let drawX;
    let drawY;
    if (CityMode.cursorCol >= 0) {
      drawX = (((gridOriginX + 8)) + (Math.imul(CityMode.cursorCol, 34)));
      drawY = ((gridOriginY + 29) + (Math.imul(CityMode.cursorRow, 34)));
    } else {
      drawX = (((gridOriginX - 37)) + 5);
      drawY = ((gridOriginY + 140) + 21);
    }
    let effectDrawX = drawX;
    let effectDrawY = drawY;
    if (CityMode.placementInProgress) {
      let animProgress = (CityMode.placeAnimTimer - 2250);
      if ((animProgress > 0) && (CityMode.cursorCol >= 0)) {
        drawX += (((Math.imul(animProgress, 9)) / 750) | 0);
        drawY += (((Math.imul(animProgress, -9)) / 750) | 0);
      }
      if (CityMode.cursorCol >= 0) {
        let frameCount = (CityMode.targetCellEmpty ? 6 : 4);
        let timer = (CityMode.targetCellEmpty ? animProgress : ((CityMode.placeAnimTimer - 1500)));
        let frameIdx = (5 - ((((Math.imul(frameCount, timer)) / 750) | 0)));
        if ((timer >= 0) && (timer < 750)) {
          let frameWidth = ((CityMode.tileEffectFrames.getWidth() / 6) | 0);
          let frameHeight = CityMode.tileEffectFrames.getHeight();
          g.setClip((drawX - 10), (drawY - 31), frameWidth, frameHeight);
          effectImage = CityMode.tileEffectFrames;
          effectDrawX = (((drawX - 10)) - (Math.imul(frameIdx, frameWidth)));
          effectDrawY = (drawY - 31);
        }
      } else {
        let timer = animProgress;
        if ((timer >= 0) && (timer < 750)) {
          let frameIdx = (5 - ((((Math.imul(timer, 6)) / 750) | 0)));
          let frameWidth = ((CityMode.dustEffectFrames.getWidth() / 6) | 0);
          let frameHeight = CityMode.dustEffectFrames.getHeight();
          g.setClip((drawX - 8), (drawY - 24), frameWidth, frameHeight);
          effectImage = CityMode.dustEffectFrames;
          effectDrawX = (((drawX - 8)) - (Math.imul(frameIdx, frameWidth)));
          effectDrawY = (drawY - 24);
        }
      }
    } else {
      let targetX = (drawX + 9);
      let targetY = (drawY - 9);
      let offsetX;
      let offsetY;
      if (CityMode.placeDelay >= 0) {
        offsetX = (targetX + ((((Math.imul(CityMode.placeDelay, 20)) / 700) | 0)));
        offsetY = (((((Math.imul(CityMode.placeDelay, -20)) / 700) | 0)) + targetY);
      } else {
        let timer = (CityMode.placeTimer - 1000);
        if (timer > 0) {
          timer = (-timer);
        }
        timer += 1000;
        offsetX = (((((Math.imul(timer, -3)) / 1001) | 0)) + targetX);
        offsetY = (((((Math.imul(timer, 3)) / 1001) | 0)) + targetY);
      }
      if (CityMode.slideTimer > 0) {
        offsetX += (((Math.imul(CityMode.slideX, CityMode.slideTimer)) / 150) | 0);
        offsetY += (((Math.imul(CityMode.slideY, CityMode.slideTimer)) / 150) | 0);
      }
      if (CityMode.placeDelay < 0) {
        let shadowWidth = ((CityMode.buildingSprites[CityMode.SHADOW_SPRITE].getWidth() / 5) | 0);
        let shadowHeight = CityMode.buildingSprites[CityMode.SHADOW_SPRITE].getHeight();
        g.setClip((offsetX - 2), (offsetY - 27), shadowWidth, shadowHeight);
        effectImage = CityMode.buildingSprites[CityMode.SHADOW_SPRITE];
        effectDrawX = (((offsetX - 2)) - (Math.imul(shadowWidth, 4)));
        effectDrawY = (offsetY - 27);
      }
      drawX = offsetX;
      drawY = offsetY;
    }
    if (effectImage != null) {
      g.drawImage(effectImage, effectDrawX, effectDrawY, 20);
    }
    if (!CityMode.placementInProgress || (CityMode.cursorCol >= 0)) {
      let pieceWidth = ((CityMode.buildingSprites[(CityMode.pieceType - 1)].getWidth() / 4) | 0);
      let pieceHeight = CityMode.buildingSprites[(CityMode.pieceType - 1)].getHeight();
      let bDrawY = (drawY - pieceHeight);
      g.setClip(drawX, bDrawY, pieceWidth, pieceHeight);
      g.drawImage(CityMode.buildingSprites[(CityMode.pieceType - 1)], (drawX - (Math.imul(CityMode.pieceVariant, pieceWidth))), bDrawY, 20);
    }
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
  }
  static paintBuildingSelector(g, gridOriginX, gridOriginY) {
    if (CityMode.phase !== 0) {
      return;
    }
    let panelX = (gridOriginX - 39);
    let panelY = gridOriginY;
    if (CityMode.placementResultTimer >= 0) {
      let animProgress = (CityMode.placementResultTimer - 750);
      if (animProgress > 0) {
        animProgress = (-animProgress);
      }
      animProgress += 750;
      panelX = (((((Math.imul(animProgress, ((-((panelX + 56)))))) / 750) | 0)) + panelX);
    }
    g.setColor(-8556946);
    g.fillRect(panelX, panelY, 28, ((Math.imul(CityMode.BUILDING_COUNT, 24)) + 4));
    g.setColor(-1);
    g.fillRect((panelX + 1), (panelY + 1), 26, ((Math.imul(CityMode.BUILDING_COUNT, 24)) + 2));
    for (let tier = 0; tier < CityMode.BUILDING_COUNT; tier++) {
      let slotX = (panelX + 3);
      let slotY = ((Math.imul(tier, 24)) + ((panelY + 3)));
      g.setColor(-5460820);
      if ((tier === CityMode.selectedBuilding) && (CityMode.blinkTimer < 250)) {
        g.setColor(-89856);
      }
      g.fillRect(slotX, slotY, 22, 22);
      if (tier <= CityMode.unlockedSpecialTier) {
        g.setClip((slotX - 5), (slotY + 12), 10, CityMode.statusIcons.getHeight());
        g.drawImage(CityMode.statusIcons, (((((((slotX - 5)) - 28)) - 14)) - 28), (slotY + 12), 20);
      }
      if (tier <= CityMode.unlockedBuildingTier) {
        let bX = (slotX + 3);
        let bY = (slotY + 19);
        if (tier === CityMode.selectedBuilding) {
          if (CityMode.launchDelay < 250) {
            bX += 2;
            bY -= 2;
          }
          let shadowWidth = ((CityMode.buildingSprites[CityMode.SHADOW_SPRITE].getWidth() / 5) | 0);
          let shadowHeight = CityMode.buildingSprites[CityMode.SHADOW_SPRITE].getHeight();
          g.setClip((bX - 2), (bY - 27), shadowWidth, shadowHeight);
          g.drawImage(CityMode.buildingSprites[CityMode.SHADOW_SPRITE], (((bX - 2)) - (Math.imul(shadowWidth, tier))), (bY - 27), 20);
        }
        let spriteWidth = ((CityMode.buildingSprites[tier].getWidth() / 4) | 0);
        let spriteHeight = CityMode.buildingSprites[tier].getHeight();
        let drawSpriteY = (bY - spriteHeight);
        g.setClip(bX, drawSpriteY, spriteWidth, spriteHeight);
        g.drawImage(CityMode.buildingSprites[tier], (bX - (Math.imul(spriteWidth, 3))), drawSpriteY, 20);
      }
      g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    }
  }
  static drawBitmapNumber(g, fontImage, numberStr, x, y, digitWidth, digitHeight, charSpacing, anchor) {
    if (fontImage == null) {
      return;
    }
    let toCharArray = S.toCharArray(numberStr);
    let height = fontImage.getHeight();
    let length = toCharArray.length;
    if (charSpacing <= length) {
      charSpacing = length;
    }
    let length2 = (((toCharArray.length - 1)) - anchor);
    while (anchor < charSpacing) {
      length = ((length2 >= 0) ? (toCharArray[length2] - 48) : 0);
      g.setClip((((x - (Math.imul(anchor, digitHeight)))) - digitWidth), y, digitWidth, height);
      g.drawImage(fontImage, (((((x - (Math.imul(anchor, digitHeight)))) - digitWidth)) - (Math.imul(length, digitWidth))), y, 20);
      anchor++;
      length2--;
    }
    g.setClip(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
  }
  static enterCity() {
    CityMode.towerGameActive = false;
    CityMode.phase = 0;
    CityMode.cursorCol = 2;
    CityMode.cursorRow = 2;
    CityMode.population = 0;
    CityMode.populationFlashCount = 0;
    CityMode.cheatIndex = 0;
    CityMode.unlockedSpecialTier = -1;
    CityMode.modalActive = false;
    CityMode.needsRepaint = true;
    CityMode.slideTimer = 0;
    CityMode.placementInProgress = false;
    CityMode.populationFlashTimer = 0;
    CityMode.populationPending = 0;
    CityMode.highScorePending = false;
    CityMode.population = 0;
    CityMode.launchDelay = -1;
    CityMode.placementResultTimer = -1;
    CityMode.loadState();
    CityMode.updateUnlocks();
    CityMode.recalculateSynergies();
    CityMode.selectedBuilding = 0;
    if (!CityMode.tutorialShown[0]) {
      House.showPrompt(Resources.getString$1(36), null, null);
      CityMode.tutorialShown[0] = true;
      CityMode.modalActive = true;
    }
  }
  static update(deltaMs, totalTimeMs) {
    if (CityMode.slideTimer >= 0) {
      CityMode.slideTimer -= deltaMs;
    }
    if (CityMode.populationFlashTimer >= 0) {
      CityMode.populationFlashTimer -= deltaMs;
      if (CityMode.populationFlashCount > 0) {
        CityMode.flashColorIndex = (((CityMode.flashColorIndex % 2)) + 1);
        if (CityMode.populationFlashTimer < 0) {
          CityMode.populationFlashCount--;
          CityMode.populationFlashTimer = ((CityMode.populationFlashCount > 0) ? 300 : 1199);
        }
      }
    }
    CityMode.animTick += (deltaMs >> 4);
    CityMode.animTick %= 71;
    if (CityMode.phase === 0) {
      CityMode.blinkTimer += deltaMs;
      CityMode.blinkTimer %= 500;
    }
    CityMode.blinkTimer800 += deltaMs;
    CityMode.blinkTimer800 %= 800;
    CityMode.checkCityTutorialPrompts();
    if (CityMode.launchDelay >= 0) {
      CityMode.launchDelay -= deltaMs;
      if (CityMode.launchDelay < 0) {
        CityMode.towerGameActive = true;
        CityMode.clearInputState();
      }
    }
    if (CityMode.phase === 1) {
      if (CityMode.placeDelay >= 0) {
        CityMode.placeDelay -= deltaMs;
      } else {
        CityMode.placeTimer += deltaMs;
        CityMode.placeTimer %= 2000;
      }
    }
    if (CityMode.placementResultTimer >= 0) {
      CityMode.placementResultTimer -= deltaMs;
      if ((CityMode.phase === 1) && (CityMode.placementResultTimer < 750)) {
        CityMode.phase = 0;
      }
    }
    if (CityMode.placementInProgress && !CityMode.modalActive) {
      let active = CityMode.cursorActive;
      CityMode.placeAnimTimer -= deltaMs;
      if (CityMode.cursorCol >= 0) {
        CityMode.populationPending = 0;
        if (CityMode.placeAnimTimer > 0) {
          CityMode.populationPending = (((Math.imul(((CityMode.populationTarget - CityMode.population)), CityMode.placeAnimTimer)) / 3000) | 0);
        }
      }
      if (((CityMode.placeAnimTimer < 0) && CityMode.cursorActive) && (CityMode.cursorCol >= 0)) {
        CityMode.grid[((Math.imul((((Math.imul(CityMode.cursorRow, 5)) + CityMode.cursorCol)), 3)) + 0)] = CityMode.pieceType;
        CityMode.grid[((Math.imul((((Math.imul(CityMode.cursorRow, 5)) + CityMode.cursorCol)), 3)) + 1)] = CityMode.pieceValue;
        CityMode.grid[((Math.imul((((Math.imul(CityMode.cursorRow, 5)) + CityMode.cursorCol)), 3)) + 2)] = CityMode.pieceVariant;
        CityMode.saveState();
        CityMode.updateUnlocks();
        active = false;
      } else if (CityMode.placeAnimTimer < 0) {
        if (CityMode.cursorCol >= 0) {
          CityMode.highScorePending = true;
          CityMode.recalculateSynergies();
        }
        if (!CityMode.tutorialShown[4]) {
          House.showPrompt(Resources.getString$1(40), null, null);
          CityMode.tutorialShown[4] = true;
          CityMode.modalActive = true;
        }
        CityMode.placementResultTimer = 1500;
        CityMode.placementInProgress = false;
        active = true;
      }
      CityMode.cursorActive = active;
    }
    CityMode.handleCityInput();
    CityMode.updateCityHintText(totalTimeMs);
  }
  static checkCityTutorialPrompts() {
    if (!((CityMode.modalActive || CityMode.tutorialShown[1]))) {
      House.showPrompt(Resources.getString$1(37), null, null);
      CityMode.tutorialShown[1] = true;
      CityMode.modalActive = true;
    }
    if (!((CityMode.modalActive || CityMode.tutorialShown[2]))) {
      House.showPrompt(Resources.getString$1(38), null, null);
      CityMode.tutorialShown[2] = true;
      CityMode.modalActive = true;
    }
    if (!(((CityMode.modalActive || CityMode.tutorialShown[5]) || (CityMode.level !== 1)))) {
      House.showPrompt(Resources.getString$2(41, [String(CityMode.levelThresholds[CityMode.level])]), null, null);
      CityMode.tutorialShown[5] = true;
      CityMode.modalActive = true;
    }
    if (((!CityMode.modalActive && !CityMode.tutorialShown[(CityMode.level + 4)]) && (CityMode.level > 1)) && (CityMode.level < 20)) {
      let promptResId;
      switch (CityMode.level) {
        case 5:
          promptResId = 58;
          break;
        case 17:
          promptResId = 59;
          break;
        case 19:
          promptResId = 60;
          break;
        default:
          promptResId = 43;
          break;
      }
      House.showPrompt(Resources.getString$2(promptResId, [String(CityMode.levelThresholds[CityMode.level])]), null, null);
      CityMode.tutorialShown[(CityMode.level + 4)] = true;
      CityMode.modalActive = true;
    }
    if (!(((CityMode.modalActive || CityMode.tutorialShown[43]) || (CityMode.level !== 20)))) {
      House.showPrompt(Resources.getString$1(52), null, null);
      CityMode.tutorialShown[43] = true;
      CityMode.modalActive = true;
    }
    if (!(((CityMode.modalActive || CityMode.tutorialShown[24]) || (CityMode.unlockedBonusTier !== 1)))) {
      House.showPrompt(Resources.getString$1(45), null, CityMode.levelBadges[0]);
      CityMode.levelBadgeIndex = 0;
      CityMode.tutorialShown[24] = true;
      CityMode.modalActive = true;
    }
    if (!(((CityMode.modalActive || CityMode.tutorialShown[(CityMode.unlockedBonusTier + 23)]) || (CityMode.unlockedBonusTier <= 1)))) {
      House.showPrompt(Resources.getString$2(44, [CityMode.levelNames[(CityMode.unlockedBonusTier - 1)], CityMode.levelNames[CityMode.unlockedBonusTier]]), null, CityMode.levelBadges[(CityMode.unlockedBonusTier - 1)]);
      CityMode.levelBadgeIndex = (CityMode.unlockedBonusTier - 1);
      CityMode.tutorialShown[(CityMode.unlockedBonusTier + 23)] = true;
      CityMode.modalActive = true;
    }
    if (!(((CityMode.modalActive || CityMode.tutorialShown[33]) || (CityMode.level !== 2)))) {
      House.showPrompt(Resources.getString$1(42), null, null);
      CityMode.tutorialShown[33] = true;
      CityMode.modalActive = true;
    }
    if (!(((((CityMode.modalActive || (CityMode.unlockedBuildingTier > 3)) || CityMode.tutorialShown[(CityMode.unlockedBuildingTier + 33)]) || (CityMode.unlockedBuildingTier <= 0)) || CityMode.placementInProgress))) {
      House.showPrompt(CityMode.unlockMessages[(CityMode.unlockedBuildingTier - 1)], null, null);
      CityMode.tutorialShown[(CityMode.unlockedBuildingTier + 33)] = true;
      CityMode.modalActive = true;
    }
    if (!(((CityMode.modalActive || CityMode.tutorialShown[37]) || !CityMode.tutorialShown[34]))) {
      House.showPrompt(Resources.getString$1(48), null, null);
      CityMode.tutorialShown[37] = true;
      CityMode.modalActive = true;
    }
    if (!((((CityMode.modalActive || CityMode.pinkPrompt[0]) || (CityMode.unlockedBuildingTier < 4)) || CityMode.placementInProgress))) {
      House.showPrompt(CityMode.PINK_UNLOCK, null, null);
      CityMode.pinkPrompt[0] = true;
      CityMode.modalActive = true;
    }
    if (!((((CityMode.modalActive || CityMode.pinkPrompt[1]) || (CityMode.unlockedSpecialTier < 4)) || CityMode.placementInProgress))) {
      House.showPrompt(Resources.getString$2(51, [CityMode.buildingNames[9]]), null, null);
      CityMode.pinkPrompt[1] = true;
      CityMode.modalActive = true;
    }
    if (!(((((CityMode.modalActive || (CityMode.unlockedSpecialTier > 3)) || CityMode.tutorialShown[(CityMode.unlockedSpecialTier + 39)]) || (CityMode.unlockedSpecialTier < 0)) || CityMode.placementInProgress))) {
      House.showPrompt(Resources.getString$2(51, [CityMode.buildingNames[(CityMode.unlockedSpecialTier + CityMode.BUILDING_COUNT)]]), null, null);
      CityMode.tutorialShown[(CityMode.unlockedSpecialTier + 39)] = true;
      CityMode.modalActive = true;
    }
    if (!(((CityMode.modalActive || CityMode.tutorialShown[44]) || !CityMode.buildingHintPending))) {
      House.showPrompt(Resources.getString$2(53, [CityMode.levelNames[CityMode.unlockedBonusTier]]), null, null);
      CityMode.tutorialShown[44] = true;
      CityMode.modalActive = true;
    }
    if (!(((CityMode.modalActive || CityMode.tutorialShown[45]) || !CityMode.tutorialShown[44]))) {
      House.showPrompt(Resources.getString$2(54, [String(CityMode.levelThresholds[20])]), null, null);
      CityMode.tutorialShown[45] = true;
      CityMode.modalActive = true;
    }
  }
  static handleCityInput() {
    if (CityMode.modalActive) {
      if (CityMode.keyUp) {
        House.handleModalAction(-1);
        CityMode.clearInputState();
      } else if (CityMode.keyDown) {
        if (House.handleModalAction(1)) {
          CityMode.modalActive = false;
          CityMode.needsRepaint = true;
          CityMode.saveState();
        }
        CityMode.clearInputState();
      } else if (CityMode.keyFire) {
        if (House.handleModalAction(0)) {
          CityMode.modalActive = false;
          CityMode.needsRepaint = true;
          CityMode.saveState();
        }
        CityMode.clearInputState();
      }
    } else if (CityMode.phase === 0) {
      if ((CityMode.launchDelay < 0) && (CityMode.placementResultTimer < 0)) {
        if (CityMode.keyUp) {
          if (CityMode.selectedBuilding > 0) {
            CityMode.selectedBuilding--;
          }
        } else if (CityMode.keyDown) {
          if (CityMode.selectedBuilding < (CityMode.BUILDING_COUNT - 1)) {
            CityMode.selectedBuilding++;
          }
        } else if (CityMode.keyFire && (((((CityMode.selectedBuilding <= CityMode.unlockedBuildingTier) && (CityMode.selectedBuilding <= CityMode.highestTierUnlocked))) || CityMode.cheatActive))) {
          CityMode.launchDelay = 500;
        }
      }
    } else if (((CityMode.placeDelay < 0) && !CityMode.placementInProgress) && (CityMode.placementResultTimer < 0)) {
      if (CityMode.keyUp) {
        if ((CityMode.cursorCol >= 0) && (CityMode.cursorRow > 0)) {
          CityMode.cursorRow--;
          CityMode.slideX = 0;
          CityMode.slideY = 34;
          CityMode.slideTimer = 150;
        }
      } else if (CityMode.keyDown) {
        if (CityMode.cursorRow < 4) {
          CityMode.cursorRow++;
          CityMode.slideX = 0;
          CityMode.slideY = -34;
          CityMode.slideTimer = 150;
        }
      } else if (CityMode.keyLeft) {
        if (CityMode.cursorCol > 0) {
          CityMode.cursorCol--;
          CityMode.slideX = 34;
          CityMode.slideY = 0;
          CityMode.slideTimer = 150;
        } else if (CityMode.cursorCol === 0) {
          CityMode.slideX = ((((Math.imul(CityMode.cursorCol, 34)) + 8)) + 32);
          CityMode.slideY = ((((Math.imul(CityMode.cursorRow, 34)) + 29)) - 161);
          CityMode.cursorCol--;
          CityMode.cursorRow = 4;
          CityMode.slideTimer = 150;
        }
      } else if (CityMode.keyRight) {
        if (CityMode.cursorCol < 0) {
          CityMode.cursorCol++;
          CityMode.slideX = (-32 - (((Math.imul(CityMode.cursorCol, 34)) + 8)));
          CityMode.slideY = (161 - (((Math.imul(CityMode.cursorRow, 34)) + 29)));
          CityMode.slideTimer = 150;
        } else if (CityMode.cursorCol < 4) {
          CityMode.cursorCol++;
          CityMode.slideX = -34;
          CityMode.slideY = 0;
          CityMode.slideTimer = 150;
        }
      } else if (CityMode.keyFire && ((((CityMode.cursorCol < 0) || (CityMode.cellLevels[((Math.imul(CityMode.cursorRow, 5)) + CityMode.cursorCol)] >= (CityMode.pieceType - 1))) || CityMode.cheatActive))) {
        CityMode.placementInProgress = true;
        CityMode.placeAnimTimer = 3000;
        if (CityMode.cursorCol >= 0) {
          CityMode.populationTarget = CityMode.population;
          CityMode.population -= CityMode.grid[((Math.imul((((Math.imul(CityMode.cursorRow, 5)) + CityMode.cursorCol)), 3)) + 1)];
          CityMode.population += CityMode.pieceValue;
          CityMode.populationPending = (CityMode.populationTarget - CityMode.population);
          CityMode.digitSheetCurrent = CityMode.digitSheetA;
          let maxHintWidth = (GameMIDlet.screenWidth - 20);
          let message;
          if (CityMode.population > CityMode.populationTarget) {
            message = Resources.getString$2(67, [String((CityMode.population - CityMode.populationTarget))]);
          } else if (CityMode.population < CityMode.populationTarget) {
            message = Resources.getString$2(69, [String((CityMode.populationTarget - CityMode.population))]);
            CityMode.digitSheetCurrent = CityMode.digitSheetB;
          } else {
            message = Resources.getString$1(68);
          }
          CityMode.hintCustom = House.wrapText(message, CityMode.font, maxHintWidth);
          if (((CityMode.population / 10000) | 0) !== ((CityMode.populationTarget / 10000) | 0)) {
            CityMode.populationFlashCount = 5;
          } else if (((CityMode.population / 1000) | 0) !== ((CityMode.populationTarget / 1000) | 0)) {
            CityMode.populationFlashCount = 4;
          } else if (((CityMode.population / 100) | 0) !== ((CityMode.populationTarget / 100) | 0)) {
            CityMode.populationFlashCount = 3;
          } else if (((CityMode.population / 10) | 0) !== ((CityMode.populationTarget / 10) | 0)) {
            CityMode.populationFlashCount = 2;
          } else if (CityMode.population !== CityMode.populationTarget) {
            CityMode.populationFlashCount = 1;
          } else {
            CityMode.populationFlashCount = 0;
          }
          if (CityMode.populationFlashCount > 0) {
            CityMode.populationFlashTimer = 300;
          }
          let cellIndex = ((Math.imul((((Math.imul(CityMode.cursorRow, 5)) + CityMode.cursorCol)), 3)) + 0);
          CityMode.targetCellEmpty = ((CityMode.grid[cellIndex] === 0));
          CityMode.grid[cellIndex] = 0;
        }
      }
    }
    CityMode.clearInputState();
  }
  static updateCityHintText(totalTimeMs) {
    if (CityMode.helpLines == null) {
      CityMode.helpLines = new Array(15).fill(null);
    }
    let nextHint;
    if (CityMode.phase === 0) {
      nextHint = (((CityMode.selectedBuilding <= CityMode.unlockedSpecialTier)) ? CityMode.helpLines[(CityMode.selectedBuilding + CityMode.BUILDING_COUNT)] : (((CityMode.selectedBuilding <= CityMode.unlockedBuildingTier)) ? CityMode.helpLines[CityMode.selectedBuilding] : CityMode.helpLines[(CityMode.selectedBuilding + (Math.imul(CityMode.BUILDING_COUNT, 2)))]));
    } else {
      if (CityMode.hintCustom == null) {
        let maxHintWidth = (GameMIDlet.screenWidth - 20);
        let message;
        if (CityMode.population > CityMode.populationTarget) {
          message = Resources.getString$2(67, [String((CityMode.population - CityMode.populationTarget))]);
        } else if (CityMode.population < CityMode.populationTarget) {
          message = Resources.getString$2(69, [String((CityMode.populationTarget - CityMode.population))]);
          CityMode.digitSheetCurrent = CityMode.digitSheetB;
        } else {
          message = Resources.getString$1(68);
        }
        CityMode.hintCustom = House.wrapText(message, CityMode.font, maxHintWidth);
      }
      nextHint = (((CityMode.cursorCol < 0)) ? CityMode.hintOffGrid : (((CityMode.placementInProgress || (CityMode.placementResultTimer >= 0))) ? CityMode.hintCustom : (((CityMode.cellLevels[((Math.imul(CityMode.cursorRow, 5)) + CityMode.cursorCol)] < (CityMode.pieceType - 1))) ? CityMode.hintCellTooLow : CityMode.hintPlaceable)));
    }
    let prevHint = CityMode.hintLines;
    CityMode.hintLines = nextHint;
    CityMode.hintScrollTimer -= totalTimeMs;
    if (CityMode.hintLines !== prevHint) {
      CityMode.hintScrollTimer = 2000;
      CityMode.hintScroll = 0;
    }
    if ((CityMode.hintScrollTimer < 0) && (CityMode.hintLines.length > CityMode.hintLinesVisible)) {
      CityMode.hintScrollTimer = 2000;
      CityMode.hintScroll += CityMode.hintLinesVisible;
      if (CityMode.hintScroll >= (CityMode.hintLines.length + CityMode.hintLinesVisible)) {
        CityMode.hintScroll = 0;
      }
    }
  }
  static mapGameAction(keyCode, gameAction) {
    if (keyCode === 50) {
      return 0;
    }
    if (keyCode === 56) {
      return 1;
    }
    if (keyCode === 52) {
      return 2;
    }
    if (keyCode === 54) {
      return 3;
    }
    if (keyCode !== 53) {
      if (gameAction === 1) {
        return 0;
      }
      if (gameAction === 6) {
        return 1;
      }
      if (gameAction === 2) {
        return 2;
      }
      if (gameAction === 5) {
        return 3;
      }
      if (gameAction !== 8) {
        return -1;
      }
    }
    return 5;
  }
  static loadAssets() {
    CityMode.assetsLoaded = false;
    House.soundPlayer.stopAll();
    CityMode.populationGauge = Resources.getImage(21);
    CityMode.statusIcons = Resources.getImage(22);
    CityMode.hudBarSprite = Resources.getImage(23);
    if (!House.updateLoadingProgress(20)) {
      return false;
    }
    CityMode.buildIcon = Resources.getImage(24);
    CityMode.buildingSprites = new Array(6).fill(null);
    CityMode.buildingSprites[0] = Resources.getImage(25);
    if (!House.updateLoadingProgress(25)) {
      return false;
    }
    CityMode.buildingSprites[1] = Resources.getImage(26);
    CityMode.buildingSprites[2] = Resources.getImage(27);
    CityMode.buildingSprites[3] = Resources.getImage(28);
    if (!House.updateLoadingProgress(30)) {
      return false;
    }
    CityMode.buildingSprites[4] = Resources.getImage(CityMode.PINK_SPRITE_RESOURCE);
    CityMode.buildingSprites[CityMode.SHADOW_SPRITE] = Resources.getImage(29);
    CityMode.tileEffectFrames = Resources.getImage(30);
    if (!House.updateLoadingProgress(40)) {
      return false;
    }
    CityMode.dustEffectFrames = Resources.getImage(31);
    CityMode.digitFont = Resources.getImage(15);
    CityMode.digitSheetA = Resources.getImage(16);
    CityMode.digitSheetCurrent = CityMode.digitSheetA;
    if (!House.updateLoadingProgress(50)) {
      return false;
    }
    CityMode.digitSheetB = Resources.getImage(17);
    CityMode.levelBadges = new Array(9).fill(null);
    CityMode.levelBadges[0] = Resources.getImage(71);
    if (!House.updateLoadingProgress(60)) {
      return false;
    }
    CityMode.levelBadges[1] = Resources.getImage(72);
    CityMode.levelBadges[2] = Resources.getImage(73);
    if (!House.updateLoadingProgress(70)) {
      return false;
    }
    CityMode.levelBadges[3] = Resources.getImage(74);
    CityMode.levelBadges[4] = Resources.getImage(75);
    if (!House.updateLoadingProgress(80)) {
      return false;
    }
    CityMode.levelBadges[5] = Resources.getImage(76);
    CityMode.levelBadges[6] = Resources.getImage(77);
    if (!House.updateLoadingProgress(90)) {
      return false;
    }
    CityMode.levelBadges[7] = Resources.getImage(78);
    CityMode.levelBadges[8] = Resources.getImage(79);
    if (!House.updateLoadingProgress(100)) {
      return false;
    }
    CityMode.levelNames = ["-", Resources.getString$1(71), Resources.getString$1(72), Resources.getString$1(73), Resources.getString$1(74), Resources.getString$1(75), Resources.getString$1(76), Resources.getString$1(77), Resources.getString$1(78), Resources.getString$1(79)];
    CityMode.unlockMessages = [Resources.getString$1(47), Resources.getString$1(49), Resources.getString$1(50)];
    CityMode.assetsLoaded = true;
    return true;
  }
  static getBuildingTowerType() {
    return (CityMode.unlockedSpecialTier >= CityMode.selectedBuilding) ? (CityMode.selectedBuilding + 6) : (CityMode.selectedBuilding + 1);
  }
  static clearInputState() {
    CityMode.keyUp = false;
    CityMode.keyDown = false;
    CityMode.keyLeft = false;
    CityMode.keyRight = false;
    CityMode.keyFire = false;
  }
  static isTowerGameActive() {
    return CityMode.towerGameActive;
  }
  static updateUnlocks() {
    let i;
    let i2 = 0;
    for (i = 0; i < CityMode.levelThresholds.length; i++) {
      if ((CityMode.population + CityMode.populationPending) >= CityMode.levelThresholds[i]) {
        CityMode.level = i;
      }
    }
    let i3 = CityMode.unlockedBuildingTier;
    for (i = 0; i < CityMode.buildingUnlockLevels.length; i++) {
      if ((CityMode.level >= CityMode.buildingUnlockLevels[i]) || CityMode.cheatActive) {
        CityMode.unlockedBuildingTier = i;
      }
      if ((CityMode.level >= CityMode.specialUnlockLevels[i]) || CityMode.cheatActive) {
        CityMode.unlockedSpecialTier = i;
      }
    }
    if (i3 !== CityMode.unlockedBuildingTier) {
      CityMode.selectedBuilding = CityMode.unlockedBuildingTier;
    }
    while (i2 < CityMode.bonusUnlockLevels.length) {
      if (CityMode.level >= CityMode.bonusUnlockLevels[i2]) {
        CityMode.unlockedBonusTier = i2;
      }
      i2++;
    }
  }
  static recalculateSynergies() {
    let i;
    let i2;
    let iArr = new Int32Array(4);
    let zArr = new Array(4).fill(false);
    CityMode.highestTierUnlocked = 0;
    CityMode.buildingHintPending = true;
    for (i = 0; i < 5; i++) {
      for (i2 = 0; i2 < 5; i2++) {
        let i3;
        for (i3 = 0; i3 < iArr.length; i3++) {
          iArr[i3] = 0;
        }
        for (i3 = 0; i3 < zArr.length; i3++) {
          zArr[i3] = false;
        }
        if ((i2 - 1) >= 0) {
          iArr[0] = CityMode.grid[((Math.imul((((Math.imul(i, 5)) + ((i2 - 1)))), 3)) + 0)];
        }
        if ((i2 + 1) < 5) {
          iArr[1] = CityMode.grid[((Math.imul((((Math.imul(i, 5)) + ((i2 + 1)))), 3)) + 0)];
        }
        if ((i - 1) >= 0) {
          iArr[2] = CityMode.grid[((Math.imul((((Math.imul(((i - 1)), 5)) + i2)), 3)) + 0)];
        }
        if ((i + 1) < 5) {
          iArr[3] = CityMode.grid[((Math.imul((((Math.imul(((i + 1)), 5)) + i2)), 3)) + 0)];
        }
        i3 = 0;
        while (i3 < iArr.length) {
          if ((iArr[i3] > 0) && (iArr[i3] <= 4)) {
            zArr[(iArr[i3] - 1)] = true;
          }
          i3++;
        }
        i3 = (((((zArr[0] && zArr[1]) && zArr[2]) && zArr[3])) ? 4 : ((((zArr[0] && zArr[1]) && zArr[2])) ? 3 : (((zArr[0] && zArr[1])) ? 2 : (zArr[0] ? 1 : 0))));
        CityMode.cellLevels[((Math.imul(i, 5)) + i2)] = i3;
        if (i3 > CityMode.highestTierUnlocked) {
          CityMode.highestTierUnlocked = i3;
        }
        if (CityMode.grid[((Math.imul((((Math.imul(i, 5)) + i2)), 3)) + 0)] === 0) {
          CityMode.buildingHintPending = false;
        }
      }
    }
    for (let c = 0; c < 4; c++) {
      let first = -1;
      let last = -1;
      for (let r = 0; r < 5; r++) {
        let left = CityMode.grid[((Math.imul((((Math.imul(r, 5)) + c)), 3)) + 0)];
        let right = CityMode.grid[((Math.imul((((((Math.imul(r, 5)) + c)) + 1)), 3)) + 0)];
        if ((left > 0) && (right > 0)) {
          if (first < 0) {
            first = r;
          }
          last = (r + 1);
        }
      }
      CityMode.highlightCells[((Math.imul(c, 2)) + 0)] = first;
      CityMode.highlightCells[((Math.imul(c, 2)) + 1)] = last;
    }
    for (let r = 0; r < 4; r++) {
      let first = -1;
      let last = -1;
      for (let c = 0; c < 5; c++) {
        let upper = CityMode.grid[((Math.imul((((Math.imul(r, 5)) + c)), 3)) + 0)];
        let lower = CityMode.grid[((Math.imul((((Math.imul(((r + 1)), 5)) + c)), 3)) + 0)];
        if ((upper > 0) && (lower > 0)) {
          if (first < 0) {
            first = c;
          }
          last = (c + 1);
        }
      }
      CityMode.highlightCells[((((Math.imul(r, 2)) + 8)) + 0)] = first;
      CityMode.highlightCells[((((Math.imul(r, 2)) + 8)) + 1)] = last;
    }
  }
  static isCheatActive() {
    return CityMode.cheatActive;
  }
  static consumeHighScoreFlag() {
    let z = CityMode.highScorePending;
    CityMode.highScorePending = false;
    return z;
  }
  static getPopulation() {
    return CityMode.population;
  }
  static unloadAssets() {
    CityMode.populationGauge = null;
    CityMode.statusIcons = null;
    CityMode.hudBarSprite = null;
    CityMode.buildIcon = null;
    CityMode.buildingSprites = null;
    CityMode.tileEffectFrames = null;
    CityMode.dustEffectFrames = null;
    CityMode.digitFont = null;
    CityMode.digitSheetA = null;
    CityMode.digitSheetB = null;
    CityMode.levelBadges = null;
    CityMode.levelNames = null;
    CityMode.unlockMessages = null;
    System.gc();
  }
  static loadState() {
    try {
      let in_ = Storage.openRead("citymode");
      if (in_ == null) {
        return;
      }
      House.gameMode = in_.readInt();
      House.screenState = in_.readInt();
      CityMode.phase = in_.readInt();
      CityMode.towerGameActive = in_.readBoolean();
      CityMode.level = in_.readInt();
      CityMode.unlockedBonusTier = in_.readInt();
      CityMode.levelBadgeIndex = in_.readInt();
      CityMode.population = in_.readInt();
      CityMode.populationTarget = in_.readInt();
      CityMode.populationPending = in_.readInt();
      CityMode.pieceValue = in_.readInt();
      CityMode.cursorCol = in_.readInt();
      CityMode.cursorRow = in_.readInt();
      CityMode.pieceType = in_.readInt();
      CityMode.pieceVariant = in_.readInt();
      CityMode.placementInProgress = in_.readBoolean();
      CityMode.placeAnimTimer = in_.readInt();
      CityMode.flashColorIndex = in_.readInt();
      CityMode.populationFlashTimer = in_.readInt();
      CityMode.placementResultTimer = in_.readInt();
      CityMode.populationFlashCount = in_.readInt();
      CityMode.selectedBuilding = in_.readInt();
      CityMode.blinkTimer = in_.readInt();
      CityMode.blinkTimer800 = in_.readInt();
      CityMode.launchDelay = in_.readInt();
      CityMode.placeDelay = in_.readInt();
      CityMode.placeTimer = in_.readInt();
      CityMode.slideTimer = in_.readInt();
      CityMode.slideX = in_.readInt();
      CityMode.slideY = in_.readInt();
      CityMode.unlockedBuildingTier = in_.readInt();
      CityMode.highestTierUnlocked = in_.readInt();
      CityMode.unlockedSpecialTier = in_.readInt();
      CityMode.animTick = in_.readInt();
      CityMode.targetCellEmpty = in_.readBoolean();
      CityMode.modalActive = in_.readBoolean();
      for (let i = 0; i < 16; i++) {
        CityMode.highlightCells[i] = in_.readInt();
      }
      for (let i = 0; i < 25; i++) {
        CityMode.cellLevels[i] = in_.readInt();
      }
      for (let i = 0; i < 25; i++) {
        CityMode.grid[((Math.imul(i, 3)) + 0)] = in_.readByte();
        CityMode.grid[((Math.imul(i, 3)) + 1)] = in_.readInt();
        CityMode.grid[((Math.imul(i, 3)) + 2)] = in_.readByte();
      }
      for (let i = 0; i < CityMode.tutorialShown.length; i++) {
        CityMode.tutorialShown[i] = in_.readBoolean();
      }
      CityMode.reservedZ = in_.readInt();
      CityMode.tutorialShown[CityMode.reservedZ] = in_.readBoolean();
      try {
        CityMode.pinkPrompt[0] = in_.readBoolean();
        CityMode.pinkPrompt[1] = in_.readBoolean();
      } catch (oldSave) {
      }
      Storage.close();
      if (CityMode.modalActive) {
        CityMode.modalActive = false;
      }
      CityMode.showTutorialHint(CityMode.reservedZ);
    } catch (ex) {
      System.out.println(("Exception in CityMode::loadState(), e:" + (ex).message));
    }
  }
  static saveState() {
    if (CityMode.cheatActive) {
      return;
    }
    try {
      let out = Storage.openWrite("citymode");
      out.writeInt(House.gameMode);
      out.writeInt(House.screenState);
      out.writeInt(CityMode.phase);
      out.writeBoolean(CityMode.towerGameActive);
      out.writeInt(CityMode.level);
      out.writeInt(CityMode.unlockedBonusTier);
      out.writeInt(CityMode.levelBadgeIndex);
      out.writeInt(CityMode.population);
      out.writeInt(CityMode.populationTarget);
      out.writeInt(CityMode.populationPending);
      out.writeInt(CityMode.pieceValue);
      out.writeInt(CityMode.cursorCol);
      out.writeInt(CityMode.cursorRow);
      out.writeInt(CityMode.pieceType);
      out.writeInt(CityMode.pieceVariant);
      out.writeBoolean(CityMode.placementInProgress);
      out.writeInt(CityMode.placeAnimTimer);
      out.writeInt(CityMode.flashColorIndex);
      out.writeInt(CityMode.populationFlashTimer);
      out.writeInt(CityMode.placementResultTimer);
      out.writeInt(CityMode.populationFlashCount);
      out.writeInt(CityMode.selectedBuilding);
      out.writeInt(CityMode.blinkTimer);
      out.writeInt(CityMode.blinkTimer800);
      out.writeInt(CityMode.launchDelay);
      out.writeInt(CityMode.placeDelay);
      out.writeInt(CityMode.placeTimer);
      out.writeInt(CityMode.slideTimer);
      out.writeInt(CityMode.slideX);
      out.writeInt(CityMode.slideY);
      out.writeInt(CityMode.unlockedBuildingTier);
      out.writeInt(CityMode.highestTierUnlocked);
      out.writeInt(CityMode.unlockedSpecialTier);
      out.writeInt(CityMode.animTick);
      out.writeBoolean(CityMode.targetCellEmpty);
      out.writeBoolean(CityMode.modalActive);
      for (let i = 0; i < 16; i++) {
        out.writeInt(CityMode.highlightCells[i]);
      }
      for (let i = 0; i < 25; i++) {
        out.writeInt(CityMode.cellLevels[i]);
      }
      for (let i = 0; i < 25; i++) {
        out.writeByte(CityMode.grid[((Math.imul(i, 3)) + 0)]);
        out.writeInt(CityMode.grid[((Math.imul(i, 3)) + 1)]);
        out.writeByte(CityMode.grid[((Math.imul(i, 3)) + 2)]);
      }
      for (let i = 0; i < CityMode.tutorialShown.length; i++) {
        out.writeBoolean(CityMode.tutorialShown[i]);
        if ((i === 0) && CityMode.tutorialShown[i]) {
          CityMode.reservedZ = 0;
        } else if (((i !== 0) && !CityMode.tutorialShown[i]) && CityMode.tutorialShown[(i - 1)]) {
          CityMode.reservedZ = (i - 1);
        }
      }
      if (CityMode.modalActive) {
        CityMode.tutorialShown[CityMode.reservedZ] = false;
      }
      out.writeInt(CityMode.reservedZ);
      out.writeBoolean(CityMode.tutorialShown[CityMode.reservedZ]);
      out.writeBoolean(CityMode.pinkPrompt[0]);
      out.writeBoolean(CityMode.pinkPrompt[1]);
      Storage.close();
    } catch (ex) {
      console.error(ex);
      System.out.println(("Exception in CityMode::saveState(), e:" + (ex).message));
    }
  }
  static randomizeBuildingStats() {
    CityMode.pieceVariant = House.random(3);
    CityMode.pieceValue = ((Math.imul(((CityMode.pieceType - 1)), 100)) + House.random(Math.imul(CityMode.pieceType, 100)));
  }
  static handleClick(px, py) {
    if (CityMode.modalActive) {
      CityMode.keyFire = true;
      return true;
    }
    let i8 = (((((((((((GameMIDlet.screenWidth - 28)) - 11)) - 173)) >> 1)) + 28)) + 11);
    let i5 = (((((((((((GameMIDlet.screenHeight - 60)) - 56)) - 173)) + 1)) >> 1)) + 60);
    if (CityMode.phase === 0) {
      let selX = (((i8 - 39)) + 3);
      let selY = (i5 + 3);
      if ((((px >= selX) && (px < (selX + 26))) && (py >= selY)) && (py < (selY + Math.imul(CityMode.BUILDING_COUNT, 24)))) {
        let clickedType = ((((py - selY)) / 24) | 0);
        if ((clickedType >= 0) && (clickedType < CityMode.BUILDING_COUNT)) {
          if ((CityMode.selectedBuilding === clickedType) && (((((CityMode.selectedBuilding <= CityMode.unlockedBuildingTier) && (CityMode.selectedBuilding <= CityMode.highestTierUnlocked))) || CityMode.cheatActive))) {
            CityMode.launchDelay = 500;
          } else {
            CityMode.selectedBuilding = clickedType;
          }
          return true;
        }
      }
    }
    let roofX = (i8 - 37);
    let roofY = (i5 + 140);
    if ((((px >= (roofX - 5)) && (px <= (roofX + 35))) && (py >= roofY)) && (py <= (roofY + 35))) {
      if (CityMode.cursorCol === -1) {
        CityMode.keyFire = true;
      } else {
        CityMode.cursorCol = -1;
        CityMode.cursorRow = 4;
      }
      return true;
    }
    let gridX = (i8 + 5);
    let gridY = (i5 + 5);
    if ((((px >= gridX) && (px < (gridX + Math.imul(5, 34)))) && (py >= gridY)) && (py < (gridY + Math.imul(5, 34)))) {
      let col = ((((px - gridX)) / 34) | 0);
      let row = ((((py - gridY)) / 34) | 0);
      if ((((col >= 0) && (col < 5)) && (row >= 0)) && (row < 5)) {
        if ((CityMode.cursorCol === col) && (CityMode.cursorRow === row)) {
          CityMode.keyFire = true;
        } else {
          CityMode.cursorCol = col;
          CityMode.cursorRow = row;
        }
        return true;
      }
    }
    return false;
  }
}

CityMode.$clinit = function () {
  CityMode.skyGradient = new Int32Array([175, 229, 255, -87, -89, 0]);
  CityMode.bandColors = new Int32Array([-8556946, -1318431, -3351282, -5399421, -11456464, -14475756, -14475756, -14475756, -14475756, -14475756, -14475756, -14475756, -14475756, -14475756, -11456464, -1318431, -8556946, -15463412]);
  CityMode.buildingColors = new Int32Array([-12357161, -2024952, -15618292, -2449664, -2076516, -16044658, -8122095, -16491520, -11520000, -29496]);
  CityMode.tierColorsPrimary = new Int32Array([-12355561, -11506121, -10983088, -10329750, -6657400]);
  CityMode.tierColorsSecondary = new Int32Array([-8864728, -8409274, -8084131, -7693196, -4682586]);
  CityMode.cellPalette = new Int32Array([-16755552, -6290944, -16738304, -7120384, -5227380, -12793601, -38586, -13107401, -983296, -32576]);
  CityMode.keyUp = false;
  CityMode.keyDown = false;
  CityMode.keyLeft = false;
  CityMode.keyRight = false;
  CityMode.keyFire = false;
  CityMode.populationGauge = null;
  CityMode.statusIcons = null;
  CityMode.hudBarSprite = null;
  CityMode.buildIcon = null;
  CityMode.buildingSprites = null;
  CityMode.BUILDING_COUNT = 5;
  CityMode.SHADOW_SPRITE = 5;
  CityMode.PINK_SPRITE_RESOURCE = 100;
  CityMode.PINK_NAME = "Pink Tower";
  CityMode.PINK_SPECIAL_NAME = "Special Pink Tower";
  CityMode.PINK_HELP = "Pink Tower: build it on a plot that touches all four other building types.";
  CityMode.PINK_UNLOCK = "New building unlocked: the Pink Tower!";
  CityMode.pinkPrompt = new Array(2).fill(false);
  CityMode.tileEffectFrames = null;
  CityMode.dustEffectFrames = null;
  CityMode.digitFont = null;
  CityMode.digitSheetA = null;
  CityMode.digitSheetB = null;
  CityMode.levelThresholds = new Int32Array([0, 75, 150, 250, 400, 600, 800, 1000, 1400, 1800, 2200, 3000, 4000, 5000, 6500, 8000, 9500, 11500, 14000, 17000, 19000]);
  CityMode.pieceType = 0;
  CityMode.pieceValue = 0;
  CityMode.pieceVariant = 0;
  CityMode.slideX = 0;
  CityMode.grid = null;
  CityMode.animTick = 0;
  CityMode.highlightCells = null;
  CityMode.hintLinesVisible = 0;
  CityMode.hintScroll = 0;
  CityMode.hintScrollTimer = 0;
  CityMode.placeDelay = 0;
  CityMode.placeTimer = 0;
  CityMode.cursorActive = true;
  CityMode.slideY = 0;
  CityMode.placeAnimTimer = 0;
  CityMode.font = null;
  CityMode.helpLines = null;
  CityMode.hintPlaceable = null;
  CityMode.hintCellTooLow = null;
  CityMode.hintOffGrid = null;
  CityMode.hintCustom = null;
  CityMode.buildingUnlockLevels = new Int32Array([0, 3, 6, 10, 13]);
  CityMode.specialUnlockLevels = new Int32Array([8, 12, 14, 16, 18]);
  CityMode.unlockedBuildingTier = 0;
  CityMode.bonusUnlockLevels = new Int32Array([0, 1, 4, 7, 9, 11, 13, 15, 18, 20]);
  CityMode.levelNames = null;
  CityMode.unlockMessages = null;
  CityMode.buildingNames = null;
  CityMode.flashColorIndex = 0;
  CityMode.digitSheetCurrent = null;
  CityMode.blinkTimer = 0;
  CityMode.targetCellEmpty = false;
  CityMode.cheatActive = false;
  CityMode.cheatCode = S.toCharArray("626428826");
  CityMode.cheatIndex = 0;
  CityMode.populationTarget = 0;
  CityMode.blinkTimer800 = 0;
  CityMode.buildingHintPending = false;
  CityMode.highestTierUnlocked = 0;
  CityMode.cellLevels = null;
  CityMode.levelBadges = null;
  CityMode.towerGameActive = false;
  CityMode.selectedBuilding = 0;
  CityMode.phase = 0;
  CityMode.population = 0;
  CityMode.level = 0;
  CityMode.cursorCol = 0;
  CityMode.cursorRow = 0;
  CityMode.slideTimer = 0;
  CityMode.placementInProgress = false;
  CityMode.unlockedSpecialTier = 0;
  CityMode.unlockedBonusTier = 0;
  CityMode.modalActive = false;
  CityMode.levelBadgeIndex = -1;
  CityMode.needsRepaint = false;
  CityMode.tutorialShown = null;
  CityMode.populationFlashTimer = 0;
  CityMode.populationFlashCount = 0;
  CityMode.populationPending = 0;
  CityMode.highScorePending = false;
  CityMode.hintLines = null;
  CityMode.launchDelay = 0;
  CityMode.placementResultTimer = 0;
  CityMode.reservedZ = -1;
  CityMode.assetsLoaded = false;
  {
    let iArr = new Int32Array([2, 8, 4, 6, 5]);
  }
};
