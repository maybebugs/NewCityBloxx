class House extends GameMIDlet {
  static modelType() {
    return House.pinkTower ? House.PINK_MODEL_TYPE : House.towerType;
  }
  static updateCitizens() {
    let i = 0;
    while (i < 8) {
      let i2 = House.citizens[0][i];
      if (i2 !== 0) {
        let i3 = 0;
        let i4 = (House.gameTime - House.citizens[4][i]);
        let i5;
        let i6;
        switch (i2) {
          case 1:
            i2 = ((i4 / 500) | 0);
            i3 = (i4 - (Math.imul(i2, 500)));
            if (i2 > 5) {
              i2 = 5;
              i3 = 500;
            }
            i5 = House.citizens[1][i];
            i6 = House.citizens[2][i];
            let i7 = House.citizens[5][i];
            House.citizens[7][i] = (((i5 - ((((Math.imul(House.jumpArcX[i2], ((i5 - House.citizens[9][i])))) / 45) | 0)))) - ((((Math.imul(((i5 - House.citizens[9][i])), (Math.imul(((House.jumpArcX[(i2 + 1)] - House.jumpArcX[i2])), i3)))) / 22500) | 0)));
            House.citizens[8][i] = (((i6 - ((((Math.imul(House.jumpArcY[i2], ((((i6 - (Math.imul(((i7 - 1)), 256)))) - 128)))) / 15) | 0)))) - ((((Math.imul((Math.imul(i3, ((House.jumpArcY[(i2 + 1)] - House.jumpArcY[i2])))), ((((i6 - (Math.imul(((i7 - 1)), 256)))) - 128)))) / 7500) | 0)));
            i2 = ((((((((i4 - 1200)) / 280) | 0)) % 8)) + 1);
            if (i2 > 5) {
              i2 = (5 - ((i2 - 5)));
            }
            if (i4 >= 2000) {
              i3 = (Math.min(4, (House.blockCount - 1)) - ((House.blockCount - House.citizens[5][i])));
              if ((Math.abs((House.citizens[7][i] - House.floorX[i3])) < 128) && (House.citizens[8][i] <= ((Math.imul(((i7 - 1)), 256)) + 128))) {
                House.citizens[0][i] = 2;
                i4 = (House.citizens[7][i] - House.floorX[i3]);
                i3 = ((((Math.imul(((i7 - 1)), 256)) + 128)) - House.citizens[8][i]);
                House.citizens[1][i] = i4;
                House.citizens[2][i] = i3;
                House.citizens[4][i] = House.gameTime;
                i3 = 1;
                if (i4 < 0) {
                  i3 = -1;
                }
                House.citizens[9][i] = i3;
                House.citizens[6][i] = 1;
                i3 = i2;
                break;
              }
              i3 = i2;
              break;
            }
            i3 = i2;
            break;
          case 2:
            i3 = (Math.min(4, (House.blockCount - 1)) - ((House.blockCount - House.citizens[5][i])));
            i2 = House.citizens[1][i];
            i5 = House.citizens[2][i];
            i6 = House.citizens[9][i];
            House.citizens[7][i] = (((i2 + House.floorX[i3])) - ((((Math.imul(i6, i4)) / 12) | 0)));
            if (Math.abs((House.citizens[7][i] - House.floorX[i3])) < 64) {
              House.citizens[7][i] = (House.floorX[i3] + (Math.imul(i6, 64)));
            }
            House.citizens[8][i] = Math.min(House.floorY[i3], ((((i4 / 12) | 0)) + ((House.floorY[i3] - i5))));
            if ((House.citizens[7][i] === (House.floorX[i3] + (Math.imul(i6, 64)))) && (House.citizens[8][i] === House.floorY[i3])) {
              House.citizens[1][i] = Math.imul(i6, 64);
              House.citizens[0][i] = 5;
              House.citizens[4][i] = House.gameTime;
            }
            i3 = ((((((House.gameTime / 200) | 0)) % 2)) + 6);
            break;
          case 3:
            i3 = House.citizens[5][i];
            House.citizens[7][i] = (House.citizens[1][i] - ((((Math.imul(i3, i4)) / 30) | 0)));
            House.citizens[8][i] = (House.citizens[2][i] - ((((Math.imul(Math.abs((10 - i3)), i4)) / 30) | 0)));
            i3 = ((((((i4 / 280) | 0)) % 8)) + 1);
            if (i3 > 5) {
              i3 = (5 - ((i3 - 5)));
              break;
            }
            break;
          case 4:
            i3 = House.citizens[5][i];
            House.citizens[7][i] = (House.citizens[1][i] - ((((Math.imul((Math.imul(House.citizens[6][i], ((10 - i3)))), i4)) / 15) | 0)));
            House.citizens[8][i] = (((((Math.imul((Math.imul(i3, House.citizens[6][i])), i4)) / 15) | 0)) + House.citizens[2][i]);
            if (i4 > 300) {
              House.citizens[1][i] = House.citizens[7][i];
              House.citizens[2][i] = House.citizens[8][i];
              House.citizens[0][i] = 3;
              House.citizens[4][i] = House.gameTime;
            }
            i3 = 0;
            break;
          case 5:
            i3 = (Math.min(4, (House.blockCount - 1)) - ((House.blockCount - House.citizens[5][i])));
            House.citizens[7][i] = (House.floorX[i3] + House.citizens[1][i]);
            House.citizens[8][i] = House.floorY[i3];
            if (i4 > 500) {
              House.citizens[0][i] = 0;
            }
            i3 = 7;
            break;
        }
        if (((House.citizens[8][i] < (House.camY - ((House.viewHeightUnits >> 1)))) || (House.citizens[7][i] < (((House.camX - ((House.viewWidthUnits >> 1)))) - 256))) || (House.citizens[7][i] > (((House.camX + ((House.viewWidthUnits >> 1)))) + 256))) {
          House.citizens[0][i] = 0;
        }
        House.citizens[3][i] = i3;
      }
      i++;
    }
  }
  static loseLives(count) {
    House.lastHitTime = House.gameTime;
    House.vibrator.vibrate(800);
    House.lastLossAmount = count;
    House.lives -= count;
    House.lastLossTime = House.gameTime;
    if ((House.lives === 0) && !CityMode.isCheatActive()) {
      House.phase = House.PHASE_ROUND_OVER;
    }
  }
  static clearWeather() {
    let i;
    for (i = 0; i < 2; i++) {
      House.spawnEffect(i, 0, 0, 0, 0, 0, 0);
    }
    for (i = 0; i < 300; i++) {
      let iArr = House.weatherParticles[i];
      iArr[0] = 0;
      iArr[1] = 0;
      iArr[2] = 0;
      iArr[3] = 0;
      iArr[4] = 0;
      iArr[5] = 0;
      iArr[6] = 0;
    }
  }
  static spawnWeatherParticles() {
    let i = 0;
    for (let i2 = 0; i2 < 2; i2++) {
      let iArr = House.weatherEmitters[i2];
      let i3 = (iArr[5] + 1);
      let i4 = (iArr[6] + 1);
      let i5 = (iArr[1] >> 10);
      for (let i6 = 0; i6 < i5; i6++) {
        let iArr2 = House.weatherParticles[(i6 + i)];
        iArr2[0] = 1;
        iArr2[1] = House.random(House.weatherAreaWidth);
        iArr2[2] = House.random(House.weatherAreaHeight);
        iArr2[3] = House.random(4);
        iArr2[4] = House.random(368640);
        iArr2[5] = ((((((iArr[3] + House.random(i3))) - (((i3 / 2) | 0)))) / ((4 - iArr2[3]))) | 0);
        iArr2[6] = ((((((iArr[4] + House.random(i4))) - (((i4 / 2) | 0)))) / ((4 - iArr2[3]))) | 0);
      }
      iArr[2] = 0;
      i += iArr[0];
    }
  }
  static updateFlyers() {
    let i = 0;
    while (i < 9) {
      let iArr = House.flyers[i];
      let i2 = iArr[0];
      if (i2 !== 0) {
        iArr = House.flyers[i];
        iArr[1] = (iArr[1] + House.flyerTable[3][i2]);
        if (((House.flyers[i][1] > (House.viewWidthUnits + House.flyerSizes[(i2 - 1)])) || (House.flyers[i][1] < (((-House.viewWidthUnits)) - House.flyerSizes[(i2 - 1)]))) || ((((((Math.imul(House.camY, 3)) / 4) | 0)) - House.flyers[i][2]) > (House.viewHeightUnits + House.flyerSizes[(i2 - 1)]))) {
          House.flyers[i][0] = 0;
          House.flyers[i][3] = (House.gameTime + House.random(2000));
          if (House.flyerCounts[i2] >= 0) {
            iArr = House.flyerCounts;
            iArr[i2] = (iArr[i2] + 1);
          }
        }
      } else if (iArr[3] < House.gameTime) {
        House.spawnFlyer(i);
      }
      i++;
    }
  }
  static findLandingFloor() {
    let i = -1;
    do {
      if (House.blockY[0] < House.floorY[House.floorIndex]) {
        House.floorIndex = Math.max(0, (House.floorIndex - 1));
      }
      if ((((House.blockY[0] >= (House.floorY[House.floorIndex] + 256)) || (House.blockY[0] <= (House.floorY[House.floorIndex] - 256))) || (House.blockX[0] >= (House.floorX[House.floorIndex] + 256))) || (House.blockX[0] <= (House.floorX[House.floorIndex] - 256))) {
        return i;
      }
      i = House.floorIndex;
      House.floorIndex--;
    } while (House.floorIndex >= 0);
    return i;
  }
  static handleLanding() {
    let slot = House.findLandingFloor();
    if (((House.phase === House.PHASE_ROOF) && (House.floorIndex !== 4)) && (slot !== 4)) {
      House.landingQuality = 0;
      House.blockState[0] = House.BLOCK_RETURNING;
      House.loseLives(1);
      return false;
    }
    if (slot === -1) {
      return false;
    }
    House.fallStartTime = House.gameTime;
    let offset = (House.blockX[0] - House.floorX[slot]);
    let abs = Math.abs(offset);
    if (House.blockCount === 0) {
      House.lastLandTime = House.gameTime;
      House.lastHitTime = House.gameTime;
      House.vibrator.vibrate(800);
      House.blockState[0] = House.BLOCK_LANDED;
      House.blockAngle[0] = 0;
      House.foundationOffset = offset;
      House.scrolledOffsetSum = offset;
      House.offsetSum = offset;
      House.changeFloorCount(1);
      return true;
    }
    if (slot === Math.min(4, (House.blockCount - 1))) {
      House.nudgeSwayPhase(offset);
      if ((offset > 127) || (offset < -127)) {
        if (House.comboTimer > 0) {
          House.cashInCombo();
        }
        if (House.phase === House.PHASE_ROOF) {
          House.landingQuality = 0;
          House.blockState[0] = House.BLOCK_RETURNING;
          House.loseLives(1);
          return false;
        }
        House.blockState[0] = House.BLOCK_TUMBLING;
        let direction = ((offset / Math.abs(offset)) | 0);
        House.toppleBlocks(direction, -1);
        House.blockVelX[0] = Math.imul(direction, 500);
        House.blockStartY[0] = House.blockY[0];
        House.blockTargetAngle[0] = Math.imul(((-direction)), 45);
        House.blockTargetTilt[0] = Math.imul(((1 - (Math.imul(House.random(2), 2)))), 60);
        House.fallStartTime = House.gameTime;
        House.blockVelY[0] = 50;
        return false;
      }
      House.blockState[0] = House.BLOCK_LANDED;
      House.lastLandTime = House.gameTime;
      if (House.comboCount === 0) {
        House.comboBonus = 0;
        House.comboCount++;
      } else if (House.comboTimer > 0) {
        House.comboCount++;
      }
      if (House.comboCount > 1) {
        House.maxCombo = Math.max(House.maxCombo, House.comboCount);
      }
      House.offsetSum += offset;
      if (abs < 25) {
        if (((House.progress[2] === 0) && !House.perfectTipActiveCity) && !House.perfectTipActiveQuick) {
          if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
            House.perfectTipActiveCity = true;
          } else if (House.gameMode === House.GAME_MODE_QUICK) {
            House.perfectTipActiveQuick = true;
          }
          House.showPrompt(Resources.getString$1(35), null, null);
          House.screenState = 8;
        }
        House.landingOffsets[(House.blockCount % 20)] = ((0) << 24 >> 24);
        if (House.phase !== House.PHASE_ROOF) {
          House.comboTimer = 6000;
        }
        House.spawnCitizens(4, (House.blockCount + 1));
        House.lastPerfectTime = House.gameTime;
      } else {
        House.landingOffsets[(House.blockCount % 20)] = ((offset) << 24 >> 24);
        House.spawnCitizens(((abs < 50) ? 3 : ((abs < 80) ? 2 : 1)), (House.blockCount + 1));
      }
      for (let k = 1; k < 5; k++) {
        House.floorSway[(k - 1)] = House.floorSway[k];
      }
      House.floorSway[slot] = ((offset / 4) | 0);
      if (House.random(2) === 0) {
        House.floorSway[slot] = (-House.floorSway[slot]);
      }
      House.changeFloorCount(1);
      if (House.phase === House.PHASE_ROOF) {
        if (House.bonusEligible) {
          House.comboBonus = (((Math.imul(((128 - abs)), House.towerType)) / 2) | 0);
          House.landingQuality = 2;
        } else {
          House.comboBonus = ((((128 - abs)) / ((5 - House.towerType))) | 0);
          House.landingQuality = 1;
        }
        House.addScore(House.comboBonus);
        House.comboTimer = 0;
      }
      return true;
    }
    let direction = ((offset / abs) | 0);
    House.toppleBlocks((-direction), (((Math.min(4, (House.blockCount - 1)) - slot)) + 1));
    if (House.comboTimer > 0) {
      House.cashInCombo();
    }
    House.blockState[0] = House.BLOCK_TUMBLING;
    House.blockVelX[0] = Math.imul(direction, 500);
    House.blockStartY[0] = House.blockY[0];
    House.blockTargetAngle[0] = Math.imul(((-direction)), 45);
    House.fallStartTime = House.gameTime;
    House.blockVelY[0] = 50;
    return true;
  }
  static cashInCombo() {
    House.score += House.comboBonus;
    House.comboCount = 0;
    House.comboTimer = 0;
  }
  static clearKeys() {
    House.inputSelect = false;
    House.inputUp = false;
    House.inputDown = false;
  }
  handleInput() {
    let i = 0;
    let i2 = 0;
    if (!House.inputSelect) {
      if (House.inputDown) {
        if ((((((House.screenState === 4) || (House.screenState === 5)) || (House.screenState === 6)) || (House.screenState === 8))) && House.handleModalAction(1)) {
          i = 1;
        }
      } else if (House.inputUp) {
        House.handleModalAction(-1);
      }
    } else if ((((((House.screenState === 4) || (House.screenState === 5)) || (House.screenState === 6)) || (House.screenState === 8))) && House.handleModalAction(0)) {
      i = 1;
    } else if ((((House.screenState === 1) || (House.screenState === 3))) && (House.blockState[0] === House.BLOCK_HANGING)) {
      House.camY = House.camTargetY;
      House.blockState[0] = House.BLOCK_DROPPED;
      House.blockStartY[0] = House.hookY;
      House.blockTargetAngle[0] = 0;
      House.fallStartTime = House.gameTime;
      House.clearKeys();
    }
    if (i !== 0) {
      if (House.screenState === 4) {
        let iArr;
        if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
          iArr = House.progress;
        } else {
          iArr = House.progress;
          i2 = 1;
        }
        iArr[i2] = 1;
        this.saveSettings();
        House.screenState = 1;
      } else if (House.screenState === 5) {
        if (House.roundFinishedCity) {
          House.roundFinishedCity = false;
        }
        if (House.roundFinishedQuick) {
          House.roundFinishedQuick = false;
        }
        this.buildResultText(false);
        if (House.gameMode === House.GAME_MODE_QUICK) {
          this.clearSavedGame(1);
        }
      } else if (House.screenState === 6) {
        if (House.roundFinishedCity) {
          House.roundFinishedCity = false;
        }
        if (House.roundFinishedQuick) {
          House.roundFinishedQuick = false;
        }
        if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
          CityMode.startPlacement((House.pinkTower ? 5 : House.towerType), House.score, House.landingQuality);
          House.screenState = 7;
          House.nextScreenState = 2;
        } else {
          this.soundEnabled = false;
          this.pendingModeChange = 3;
          House.saveTowerQuickMode();
        }
        if (House.gameMode === House.GAME_MODE_QUICK) {
          this.clearSavedGame(1);
        }
      } else if (House.screenState === 8) {
        House.screenState = 1;
        House.progress[2] = 1;
        this.saveSettings();
        if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
          House.perfectTipActiveCity = false;
        } else if (House.gameMode === House.GAME_MODE_QUICK) {
          House.perfectTipActiveQuick = false;
        }
      }
    }
    House.clearKeys();
  }
  static initArrays() {
    let z = true;
    House.blockState = new Int32Array(5);
    House.blockAngle = new Int32Array(5);
    House.blockTargetAngle = new Int32Array(5);
    House.blockX = new Int32Array(5);
    House.blockY = new Int32Array(5);
    House.blockVelX = new Int32Array(5);
    House.blockVelY = new Int32Array(5);
    House.blockStartY = new Int32Array(5);
    House.gameTime = 0;
    House.landingOffsets = new Int8Array(20);
    House.blockCount = 0;
    House.foundationOffset = 0;
    House.unusedValue = 0;
    House.scrolledOffsetSum = 0;
    House.pivotX = 0;
    House.pivotY = 2432;
    House.floorAngle = new Int32Array(5);
    House.floorX = new Int32Array(5);
    House.floorY = new Int32Array(5);
    House.floorY[0] = -256;
    House.hookX = 0;
    House.camX = House.pivotX;
    House.camY = House.pivotY;
    House.blockState[0] = House.BLOCK_HANGING;
    House.ropeLength = 1664;
    House.camTargetY = 512;
    House.camEaseStart = (House.gameTime + 3000);
    House.blockY[0] = (House.pivotY - House.ropeLength);
    House.hookY = (House.pivotY - House.ropeLength);
    House.floorSway = new Int32Array(5);
    House.blockTilt = new Int32Array(5);
    House.blockTargetTilt = new Int32Array(5);
    House.swayOffset = 0;
    House.offsetSum = 0;
    House.swayAmplitude = 0;
    House.swayPhase = 0;
    House.gameTime = 0;
    House.score = 0;
    House.comboTimer = -2000;
    House.lives = 3;
    House.landingQuality = 0;
    House.floorIndex = 1;
    House.citizens = newInstanceArr('int', new Int32Array([11, 8]));
    House.craneTime = 2000;
    House.swingPeriod = House.swingPeriodTable[House.towerType];
    House.swingAmplitudeX = 128;
    House.swingAmplitudeY = 64;
    House.craneYOffset = 0;
    House.lastPerfectTime = (House.gameTime - 600);
    House.skyStage = -1;
    House.lastLandTime = (House.gameTime - 100);
    House.initClouds();
    House.skylineStart = 0;
    House.comboBonus = 0;
    House.phase = House.PHASE_INTRO;
    House.maxCombo = 0;
    House.lastHitTime = (House.gameTime - 800);
    House.clearKeys();
    House.raining = (House.rainChance >= House.random(1024));
    House.snowing = (House.snowChance >= House.random(1024));
    if (1024 < House.random(1024)) {
      z = false;
    }
    House.reservedFlagA = z;
    House.rainTriggered = false;
    House.snowTriggered = false;
    House.weatherPhase = 0;
    House.lightingEnabled = false;
    House.reservedFlagB = false;
    House.clearWeather();
    House.flyers = newInstanceArr('int', new Int32Array([9, 6]));
    House.flyerCounts = new Int32Array([8, 3, 2, 1, 1, 8, 2, 8, 1, 1, 4, 4, -1, 8, -1, 1, 5, 4, -1, 5, 2, -1, 1, 1, -1, -1, -1, -1, -1]);
    House.lostBlocks = newInstanceArr('int', new Int32Array([2, 5]));
  }
  static initClouds() {
    House.clouds = newInstanceArr('int', new Int32Array([12, 7]));
    let i = ((GameMIDlet.screenWidth / 12) | 0);
    for (let i2 = 0; i2 < 12; i2++) {
      let i3 = (House.random(8) + 8);
      House.clouds[i2][1] = i3;
      House.clouds[i2][0] = ((Math.imul(i2, i)) - House.random(i3));
      House.clouds[i2][2] = (House.random(256) + 640);
      House.clouds[i2][3] = (House.random(16) + 16);
      House.clouds[i2][4] = 1;
      House.clouds[i2][5] = House.cloudColors[House.random(3)];
      House.clouds[i2][6] = House.random(3);
    }
  }
  static initSinTable() {
    let i = 0;
    let i2 = 32768;
    let j = Math.trunc((((((32768) * 31416)) * 2)) / 3600000);
    House.sinTable = new Int32Array(360);
    let i3 = 0;
    while (i < 360) {
      House.sinTable[i] = i3;
      i2 = ((((i2) - (Math.floor((((i3) * j)) / Math.pow(2, 15))))) | 0);
      i3 = ((((i3) + (Math.floor((((i2) * j)) / Math.pow(2, 15))))) | 0);
      i++;
    }
  }
  static buildCrcTable() {
    let iArr = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let i2 = i;
      for (let i3 = 0; i3 < 8; i3++) {
        i2 = ((((i2 & 1)) === 0) ? (i2 >>> 1) : (((i2 >>> 1)) ^ -306674912));
      }
      iArr[i] = i2;
    }
    return iArr;
  }
  static resetPrompt() {
    House.promptPageCount = 0;
    House.promptPage = 0;
    House.promptShownTime = 0;
    House.promptOptions = null;
    House.promptImage = null;
    House.promptImageHeight = 0;
  }
  static isLastPromptPage() {
    return House.promptPage === (House.promptPageCount + -1);
  }
  static shiftDecay(value, target, decayRate) {
    return value >> (((target / decayRate) | 0));
  }
  static interpolate(a, b, numerator, denominator, minValue) {
    return ((b - a) === 0) ? 0 : (((((Math.imul(((denominator - numerator)), minValue)) / ((b - a))) | 0)) + numerator);
  }
  static shadeColor(color, shadeLevel, isDark) {
    if (!House.lightingEnabled || !isDark) {
      return color;
    }
    let i3 = ((Math.imul(((((65280 & color)) >> 8)), shadeLevel)) >> 10);
    return ((((Math.max(0, Math.min(((Math.imul(((((16711680 & color)) >> 16)), shadeLevel)) >> 10), 255)) << 16)) | ((Math.max(0, Math.min(i3, 255)) << 8)))) | Math.max(0, Math.min(((Math.imul(((((color & 255)) >> 0)), shadeLevel)) >> 10), 255));
  }
  static spawnEffect(effectType, x, y, velX, velY, lifeTime, count) {
    let iArr = House.weatherEmitters[effectType];
    iArr[0] = x;
    iArr[1] = y;
    iArr[2] = 0;
    iArr[3] = velX;
    iArr[4] = velY;
    iArr[5] = lifeTime;
    iArr[6] = count;
  }
  static showPrompt(promptText, options, promptIcon) {
    House.resetPrompt();
    House.promptLines = null;
    if (promptText != null) {
      House.promptLines = House.wrapText(promptText, House.gameFont, (GameMIDlet.screenWidth - ((((House.promptMarginX + House.promptPaddingX)) << 1))));
      let length = House.promptLines.length;
      House.promptLineHeight = (House.gameFont.getHeight() + 2);
      House.promptLinesPerPage = ((((GameMIDlet.screenHeight - ((((House.promptMarginY + House.promptPaddingY)) << 1)))) / House.promptLineHeight) | 0);
      House.promptPageCount = ((length / House.promptLinesPerPage) | 0);
      if ((length % House.promptLinesPerPage) > 0) {
        House.promptPageCount++;
      }
      if (options != null) {
        if ((((length - (Math.imul(((House.promptPageCount - 1)), House.promptLinesPerPage)))) + options.length) > House.promptLinesPerPage) {
          House.promptPageCount++;
        }
        House.promptOptions = options;
      }
      if (promptIcon != null) {
        House.promptImage = promptIcon;
        House.promptImageHeight = House.promptImage.getHeight();
        if ((GameMIDlet.screenHeight - ((((House.promptMarginY + House.promptPaddingY)) << 1))) < ((Math.imul(((length - (Math.imul(((House.promptPageCount - 1)), House.promptLinesPerPage)))), House.promptLineHeight)) + House.promptImageHeight)) {
          House.promptPageCount++;
        }
      }
      House.promptShownTime = House.gameTime;
    }
  }
  static paintSkyline(g, baseY) {
    let i2 = House.skylineStart;
    while (i2 < House.skylineRects.length) {
      let s = House.skylineBounds[i2][1];
      let i3 = (((((House.centerY - House.skylineBounds[i2][0])) - s)) + baseY);
      if ((i3 + s) >= 0) {
        if (i3 <= GameMIDlet.screenHeight) {
          g.setColor(House.shadeColor(House.skylineColors[House.skylineRects[i2][2]], House.lightLevel, true));
          g.fillRect((House.skylineRects[i2][0] & 255), i3, (House.skylineRects[i2][1] & 255), s);
        }
        i2++;
      } else {
        return;
      }
    }
  }
  static drawSnowflake(g, x, y, size) {
    if (size > 1) {
      g.setColor(14540287);
      g.fillRect((x + 1), (y + 1), (size - 1), (size - 1));
      g.drawLine(x, y, x, y);
      g.drawLine((x + size), y, (x + size), y);
      g.drawLine(x, (y + size), x, (y + size));
      g.drawLine((x + size), (y + size), (x + size), (y + size));
      return;
    }
    g.setColor(11184861);
    g.fillRect(x, y, (size + 1), (size + 1));
  }
  static setClipRect(g, x, y, width, height) {
    g.setClip(x, y, width, height);
  }
  static drawRainDrop(g, startX, startY, endX, endY, color) {
    let i6;
    let i7;
    if (color < 0) {
      g.setColor(House.shadeColor(11184844, ((((House.lightLevel / 2) | 0)) + 512), true));
      g.drawLine(startX, startY, (endX + startX), (endY + startY));
    }
    if (color < 2) {
      g.setColor(House.shadeColor(11184844, ((((House.lightLevel / 4) | 0)) + 768), true));
      i6 = startY;
      i7 = startX;
    } else {
      g.setColor(11184844);
      g.drawLine(startX, startY, (endX + startX), (endY + startY));
      g.setColor(16777215);
      i7 = (endX + startX);
      i6 = (endY + startY);
    }
    g.drawLine(i7, i6, (endX + startX), (endY + startY));
  }
  static drawDigitsA(g, value, x, y, anchor, isGoldSheet) {
    let i5 = 0;
    let i6 = (x - 6);
    while (true) {
      if ((value <= 0) && (i5 >= anchor)) {
        break;
      }
      House.setClipRect(g, i6, y, 7, 12);
      let i7 = (value % 10);
      value = ((value / 10) | 0);
      g.drawImage(House.digitSheetA, (i6 - (Math.imul(i7, 7))), y, 20);
      i6 -= 6;
      i5++;
    }
    if (isGoldSheet) {
      House.setClipRect(g, i6, y, 7, 12);
      g.drawImage(House.digitSheetA, (i6 - 70), y, 20);
    }
  }
  static paintSky(g, scrollOffset, withSun, withStars) {
    let i2 = ((Math.imul(((((((Math.imul(scrollOffset, 2)) / 3) | 0)) % House.skyStageLength)), 32)) >> 8);
    let i3 = ((((((Math.imul(scrollOffset, 2)) / 3) | 0)) / House.skyStageLength) | 0);
    if (i3 !== House.skyStage) {
      let iArr;
      House.skyStage = i3;
      if (withSun) {
        House.skyColorLow = House.skyPalette[(((i3 % 3)) + 1)];
        iArr = House.skyPalette;
        i3 = (((((i3 + 1)) % 3)) + 1);
      } else {
        House.skyColorLow = House.skyPalette[Math.min(House.skyStage, Math.max(9, (((((House.skyStage - 9)) % 8)) + 9)))];
        iArr = House.skyPalette;
        i3 = Math.min((House.skyStage + 1), Math.max(9, (((((((House.skyStage + 1)) - 9)) % 8)) + 9)));
      }
      House.skyColorHigh = iArr[i3];
      House.skyColorMid = (((((((((((((House.skyColorLow & -65536)) >> 16)) + ((((House.skyColorHigh & -65536)) >> 16)))) >> 1)) << 16)) + ((((((((((House.skyColorLow & -16711936)) >> 8)) + ((((House.skyColorHigh & -16711936)) >> 8)))) >> 1)) << 8)))) + ((((((House.skyColorLow & -16776961)) + ((House.skyColorHigh & -16776961)))) >> 1)));
      House.horizonBumpX = (((GameMIDlet.screenWidth >> 2)) + House.random((GameMIDlet.screenWidth >> 1)));
    }
    if (i2 < GameMIDlet.screenHeight) {
      g.setColor(House.shadeColor(House.skyColorLow, (House.lightLevel + House.flashLevel), withStars));
      g.fillRect(0, i2, GameMIDlet.screenWidth, (GameMIDlet.screenHeight - i2));
    }
    if (i2 > 0) {
      g.setColor(House.shadeColor(House.skyColorHigh, (House.lightLevel + House.flashLevel), withStars));
      g.fillRect(0, 0, GameMIDlet.screenWidth, i2);
    }
    g.setColor(House.shadeColor(House.skyColorMid, (House.lightLevel + House.flashLevel), withStars));
    g.fillRect(0, (i2 - 7), House.horizonBumpX, 7);
    g.fillRect(House.horizonBumpX, (i2 - 1), (GameMIDlet.screenWidth - House.horizonBumpX), 7);
    g.fillRect((House.horizonBumpX - 24), (i2 - 2), 48, 3);
    g.fillRect((House.horizonBumpX - 18), (i2 - 3), 36, 5);
    g.fillRect((House.horizonBumpX - 16), (i2 - 5), 32, 9);
    g.fillRect((House.horizonBumpX - 15), (i2 - 6), 30, 11);
    g.fillRect((House.horizonBumpX - 13), (i2 - 7), 26, 13);
  }
  buildResultText(isVictory) {
    let resultText = (Resources.getString$2(93, [String(House.score)]) + "\n");
    let bonusText = Resources.getString$1(96);
    if (isVictory && (House.score > House.progress[3])) {
      House.newRecord = true;
      resultText = ((resultText + bonusText) + "\n");
      House.progress[3] = House.score;
    }
    resultText = ((resultText + Resources.getString$2(94, [String(House.blockCount)])) + "\n");
    if (isVictory && (House.blockCount > House.progress[4])) {
      House.newRecord = true;
      resultText = ((resultText + bonusText) + "\n");
      House.progress[4] = House.blockCount;
    }
    resultText = (resultText + Resources.getString$2(95, [String(House.maxCombo)]));
    if (isVictory && (House.maxCombo > House.progress[5])) {
      resultText = ((resultText + "\n") + bonusText);
      House.progress[5] = House.maxCombo;
    }
    this.saveSettings();
    House.showPrompt(resultText, null, null);
    House.screenState = 6;
    House.phase = House.PHASE_RESULT;
    if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
      House.roundFinishedCity = true;
    } else if (House.gameMode === House.GAME_MODE_QUICK) {
      House.roundFinishedQuick = true;
    }
    if ((House.gameMode === House.GAME_MODE_QUICK) && !CityMode.isCheatActive()) {
      this.highScores.submitScore(1, new Int32Array([House.score, House.blockCount]), null);
    }
    if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
      House.towersCompleted++;
    }
  }
  static hasSavedGame(saveSlotOrGameMode) {
    return (saveSlotOrGameMode === 3) ? (Storage.getMenuFlag(8) === 0) : ((saveSlotOrGameMode === 1) ? (Storage.getMenuFlag(9) === 0) : false);
  }
  static wrapText(text, font, maxWidth) {
    if (text == null) {
      return new Array(0).fill(null);
    }
    let lineStart = 0;
    let pos = 0;
    let newline = 0;
    let length = text.length;
    let lines = new Vector();
    while (newline < length) {
      newline = text.indexOf(String.fromCharCode(10), lineStart);
      if (newline === -1) {
        newline = length;
      }
      let done = false;
      while (!done) {
        pos = lineStart;
        let width = 0;
        let lastSpace = -1;
        while ((width < maxWidth) && (pos < newline)) {
          let c = text.charCodeAt(pos);
          width += font.stringWidth(String.fromCharCode(c));
          pos++;
          if (c === 32) {
            lastSpace = pos;
          }
        }
        if ((pos === newline) && (width <= maxWidth)) {
          done = true;
        } else if (lastSpace !== -1) {
          pos = lastSpace;
        } else {
          pos--;
        }
        lines.addElement(text.substring(lineStart, pos));
        if (done && (pos < length)) {
          pos++;
        }
        lineStart = pos;
      }
    }
    let result = new Array(lines.size()).fill(null);
    for (let i = 0; i < result.length; i++) {
      result[i] = S.newString((lines.elementAt(i)).trim());
    }
    return result;
  }
  static renderBlock(blockSlot, x, y, angle, blockType) {
    let i6 = 0;
    if (x >= -256) {
      let dVar;
      if (angle === 888) {
        dVar = (House.bonusEligible ? House.topMeshBonus : House.topMesh);
      } else {
        if (angle === 999) {
          dVar = House.fallingMesh;
          angle = 0;
        } else {
          dVar = House.floorMesh;
        }
        i6 = angle;
      }
      dVar.resetTransform();
      dVar.translate(blockSlot, x, y);
      dVar.rotate(((i6) / 360.0), 0.0, 0.0, 1.0);
      dVar.rotate(((blockType) / 360.0), 0.0, 1.0, 0.0);
      dVar.render();
    }
  }
  static drawSparks(g, x, y, count) {
    let iArr = new Int32Array([512, 256, 128, 64, 32, 16, 8, 4, 2, 1]);
    let iArr2 = new Int32Array([6885390, 12152341, 14540064, 15658544, 16777008, 16777088, 16777215, 16777215, 16777215, 16777215]);
    House.random(10);
    let i4 = ((Math.imul(count, 4)) + 4);
    let i5 = ((Math.imul(count, 4)) + 4);
    for (let i6 = 0; i6 < 8; i6++) {
      let i7 = House.random(i4);
      let i8 = House.random(i5);
      g.setColor(iArr2[i6]);
      g.fillRect((i7 + x), (i8 + y), (count + 1), (count + 1));
    }
  }
  static drawCitizen(g, citizenIdx, x, y, frame, citizenType) {
    House.setClipRect(g, citizenIdx, x, 21, 28);
    let image = ((citizenType === 1) ? House.citizenSpriteA : House.citizenSpriteB);
    if (frame < 0) {
      g.drawImageFlipped(image, (citizenIdx - (Math.imul(((9 - y)), 21))), x, 20);
      return;
    }
    let i6;
    if (frame < 0) {
      i6 = (citizenIdx - (Math.imul(((7 - y)), 21)));
      x -= 28;
    } else {
      i6 = (citizenIdx - (Math.imul(y, 21)));
    }
    g.drawImage(image, i6, x, 20);
  }
  static drawDigitsB(g, value, x, y, anchor, isGoldSheet) {
    let i5 = 0;
    let i6 = (x - 6);
    while (true) {
      if ((value <= 0) && (i5 >= anchor)) {
        break;
      }
      House.setClipRect(g, i6, y, 7, 9);
      let i7 = (value % 10);
      value = ((value / 10) | 0);
      g.drawImage(House.digitSheetB, (i6 - (Math.imul(i7, 7))), y, 20);
      i6 -= 6;
      i5++;
    }
    if (isGoldSheet) {
      House.setClipRect(g, i6, y, 7, 9);
      g.drawImage(House.digitSheetB, (i6 - 70), y, 20);
    }
  }
  static paintWeatherLayer(g, foreground) {
    let iArr;
    let i;
    let i2 = (foreground ? House.weatherEmitters[0][0] : 0);
    if (foreground) {
      iArr = House.weatherEmitters;
      i = 1;
    } else {
      iArr = House.weatherEmitters;
      i = 0;
    }
    let iArr2 = iArr[i];
    for (let i3 = 0; i3 < iArr2[0]; i3++) {
      let iArr3 = House.weatherParticles[(i3 + i2)];
      if (iArr3[0] === 1) {
        switch (House.weatherType) {
          case 1:
            House.drawRainDrop(g, (iArr3[1] >> 10), (iArr3[2] >> 10), ((Math.imul(iArr3[5], 32)) >> 10), ((Math.imul(iArr3[6], 32)) >> 10), (foreground ? iArr3[3] : -1));
            break;
          case 2:
            House.drawSnowflake(g, (iArr3[1] >> 10), (iArr3[2] >> 10), (iArr3[3] >> ((foreground ? 0 : 1))));
            break;
          case 3:
            House.drawSparks(g, (iArr3[1] >> 10), (iArr3[2] >> 10), 0);
            break;
          default:
            break;
        }
      }
    }
  }
  static spawnCitizens(floorSlot, count) {
    if (House.phase !== House.PHASE_ROOF) {
      House.addScore(floorSlot);
      let i3 = (floorSlot >> 1);
      for (let i4 = 0; (i4 < 8) && (i3 > 0); i4++) {
        if (House.citizens[0][i4] === 0) {
          House.citizens[0][i4] = 1;
          House.citizens[5][i4] = count;
          let i5 = (1 - (Math.imul(House.random(2), 2)));
          House.citizens[1][i4] = (House.camX + (Math.imul(((((House.viewWidthUnits >> 1)) + 256)), i5)));
          House.citizens[9][i4] = House.offsetSum;
          let i6 = House.random(1000);
          House.citizens[2][i4] = (((House.camY + ((House.viewHeightUnits >> 1)))) + House.random(768));
          House.citizens[4][i4] = (House.gameTime - i6);
          House.citizens[10][i4] = House.random(2);
          House.citizens[6][i4] = (-i5);
          i3--;
        }
      }
    }
  }
  handleKeyReleased(keyCode) {
    if (keyCode === 50) {
      House.camKeyW = false;
    } else if (keyCode === 56) {
      House.camKeyS = false;
    } else if (keyCode === 52) {
      House.camKeyA = false;
    } else if (keyCode === 54) {
      House.camKeyD = false;
    } else if (keyCode === 100) {
      House.camKeyQ = false;
    } else if (keyCode === 101) {
      House.camKeyE = false;
    } else if (keyCode === 102) {
      House.camKeyZ = false;
    } else if (keyCode === 103) {
      House.camKeyX = false;
    }
  }
  static paintTutorialModal(g) {
    let i;
    let i2 = 0;
    let i3 = (GameMIDlet.screenHeight - ((((House.promptMarginX + House.promptPaddingY)) << 1)));
    let min = Math.min(i3, (((Math.imul(((House.gameTime - House.promptShownTime)), i3)) / 600) | 0));
    House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    g.setColor(8220270);
    g.drawRect(House.promptMarginX, (House.promptMarginY + ((i3 - min))), (GameMIDlet.screenWidth - ((House.promptMarginX << 1))), (((GameMIDlet.screenHeight - ((House.promptMarginY << 1)))) - ((i3 - min))));
    g.setColor(15458785);
    g.drawRect((House.promptMarginX + 1), (((House.promptMarginY + 1)) + ((i3 - min))), (GameMIDlet.screenWidth - ((((House.promptMarginX + 1)) << 1))), (((GameMIDlet.screenHeight - ((((House.promptMarginY + 1)) << 1)))) - ((i3 - min))));
    g.drawRect((House.promptMarginX + 2), (((House.promptMarginY + 2)) + ((i3 - min))), (GameMIDlet.screenWidth - ((((House.promptMarginX + 2)) << 1))), (((GameMIDlet.screenHeight - ((((House.promptMarginY + 2)) << 1)))) - ((i3 - min))));
    g.setColor(9524565);
    g.drawRect((House.promptMarginX + 3), (((House.promptMarginY + 3)) + ((i3 - min))), (GameMIDlet.screenWidth - ((((House.promptMarginX + 3)) << 1))), (((GameMIDlet.screenHeight - ((((House.promptMarginY + 3)) << 1)))) - ((i3 - min))));
    g.setColor(16777215);
    g.fillRect((House.promptMarginX + 4), (((House.promptMarginY + 4)) + ((i3 - min))), (((GameMIDlet.screenWidth - ((((House.promptMarginX + 4)) << 1)))) + 1), (((((GameMIDlet.screenHeight - ((((House.promptMarginY + 4)) << 1)))) + 1)) - ((i3 - min))));
    g.setColor(1313804);
    g.drawLine((((GameMIDlet.screenWidth - House.promptMarginX)) + 1), (((House.promptMarginY + ((i3 - min)))) + 1), (((GameMIDlet.screenWidth - House.promptMarginX)) + 1), (GameMIDlet.screenHeight - House.promptMarginY));
    g.drawLine((House.promptMarginX + 1), (((GameMIDlet.screenHeight - House.promptMarginY)) + 1), (((GameMIDlet.screenWidth - House.promptMarginX)) + 1), (((GameMIDlet.screenHeight - House.promptMarginY)) + 1));
    House.setClipRect(g, 0, (((House.promptMarginY + 4)) + ((i3 - min))), GameMIDlet.screenWidth, (((((GameMIDlet.screenHeight - ((((House.promptMarginY + 4)) << 1)))) + 1)) - ((((i3 - min)) + 18))));
    for (i = 0; i < House.promptLinesPerPage; i++) {
      if (((Math.imul(House.promptPage, House.promptLinesPerPage)) + i) < House.promptLines.length) {
        g.drawString(House.promptLines[((Math.imul(House.promptPage, House.promptLinesPerPage)) + i)], (GameMIDlet.screenWidth >> 1), (((((House.promptMarginY + House.promptPaddingY)) + (Math.imul(House.promptLineHeight, i)))) + ((i3 - min))), 17);
      }
    }
    if (House.isLastPromptPage() && (House.promptOptions != null)) {
      i = Math.max(0, (House.promptLines.length - (Math.imul(House.promptPage, House.promptLinesPerPage))));
      g.setColor(16266752);
      g.drawRect((((House.promptMarginX + House.promptPaddingX)) + 4), (((((House.promptMarginY + House.promptPaddingY)) + (Math.imul(((House.promptSelection + i)), House.promptLineHeight)))) + ((i3 - min))), (GameMIDlet.screenWidth - ((((((House.promptMarginX + 4)) + House.promptPaddingX)) << 1))), House.promptLineHeight);
      while (i2 < House.promptOptions.length) {
        g.drawString(House.promptOptions[i2], (GameMIDlet.screenWidth >> 1), (((((House.promptMarginY + House.promptPaddingY)) + (Math.imul(((i + i2)), House.promptLineHeight)))) + ((i3 - min))), 17);
        i2++;
      }
    } else if (House.isLastPromptPage() && (House.promptImage != null)) {
      i = Math.max(0, (House.promptLines.length - (Math.imul(House.promptPage, House.promptLinesPerPage))));
      g.drawImage(House.promptImage, (GameMIDlet.screenWidth >> 1), ((((Math.imul(i, House.promptLineHeight)) + ((House.promptMarginY + House.promptPaddingY)))) + ((i3 - min))), 17);
    }
    if ((House.gameTime - House.promptShownTime) >= 600) {
      i = 1;
      if (House.isLastPromptPage()) {
        i = 2;
      }
      House.setClipRect(g, (((GameMIDlet.screenWidth - 18)) >> 1), (((((GameMIDlet.screenHeight - House.promptMarginY)) - 18)) - 4), 18, 18);
      g.drawImage(House.arrowSprite, (((GameMIDlet.screenWidth - 18)) >> 1), (((((GameMIDlet.screenHeight - House.promptMarginY)) - (Math.imul(((i + 1)), 18)))) - 4), 20);
      if (House.promptPage > 0) {
        House.setClipRect(g, (((GameMIDlet.screenWidth - 18)) >> 1), (House.promptMarginY + 4), 18, 18);
        g.drawImage(House.arrowSprite, (((GameMIDlet.screenWidth - 18)) >> 1), (House.promptMarginY + 4), 20);
      }
    }
  }
  static toppleBlocks(fromSlot, reason) {
    let i3;
    let i4;
    if (reason !== -1) {
      i3 = House.topFloorSlot;
      if (reason > 4) {
        reason = 4;
      }
      for (i4 = 0; i4 < reason; i4++) {
        if (House.blockCount === 1) {
          House.loseLives(1);
          return;
        }
        House.blockTargetAngle[(i4 + 1)] = Math.imul(((-fromSlot)), 45);
        House.blockVelY[(i4 + 1)] = ((Math.imul(((4 - i4)), 30)) + 50);
        House.blockVelX[(i4 + 1)] = ((Math.imul(fromSlot, 400)) - (Math.imul(((4 - i4)), 30)));
        House.blockState[(i4 + 1)] = House.BLOCK_TUMBLING;
        House.blockY[(i4 + 1)] = House.floorY[i3];
        House.blockX[(i4 + 1)] = House.floorX[i3];
        House.blockStartY[(i4 + 1)] = House.blockY[(i4 + 1)];
        House.blockTargetTilt[(i4 + 1)] = Math.imul(((1 - (Math.imul(House.random(2), 2)))), 60);
        House.blockTilt[(i4 + 1)] = 0;
        House.slotDelay[(i4 + 1)] = 0;
        House.blockAngle[(i4 + 1)] = House.floorAngle[i3];
        House.evacuateFloor(House.blockCount);
        House.changeFloorCount(-1);
        i3--;
      }
      if (!House.blockLostThisFrame) {
        House.loseLives(1);
        return;
      }
      return;
    }
    let i5 = 20;
    i3 = 1;
    for (i4 = Math.min(4, (House.blockCount - 1)); i4 > 0; i4--) {
      let i6 = (House.floorX[i4] - House.floorX[(i4 - 1)]);
      if (Math.abs(i6) <= i5) {
        break;
      }
      i6 = ((i6 / Math.abs(i6)) | 0);
      Math.min((5 - i3), i4);
      House.blockTargetAngle[i3] = Math.imul(((-i6)), 45);
      House.blockVelY[i3] = 50;
      House.blockVelX[i3] = Math.imul(i6, 400);
      House.blockState[i3] = House.BLOCK_DEBRIS_WAITING;
      House.slotDelay[i3] = House.slotDelays[i3];
      House.blockTargetTilt[i3] = Math.imul(((1 - (Math.imul(House.random(2), 2)))), 60);
      House.blockTilt[i3] = 0;
      i3++;
      i5 <<= 1;
    }
    House.loseLives(1);
  }
  static mapKey(keyCode, gameAction) {
    let i3 = -1;
    if (keyCode === 53) {
      i3 = 0;
    } else if (keyCode === 56) {
      i3 = 2;
    } else if (keyCode === 50) {
      i3 = 1;
    }
    return (gameAction === 8) ? 0 : ((gameAction === 6) ? 2 : ((gameAction === 1) ? 1 : i3));
  }
  static paintFlyers(g) {
    let frameW;
    let frameH;
    let i = (((Math.imul(House.camY, 3)) / 4) | 0);
    for (let i2 = 0; i2 < 9; i2++) {
      let iArr = House.flyers[i2];
      let i3 = iArr[0];
      if (i3 !== 0) {
        let i4 = (((House.centerX + (Math.imul(((iArr[1] - House.camX)), 32)))) >> 8);
        let i5 = (((House.centerY - (Math.imul(((iArr[2] - i)), 32)))) >> 8);
        if (i3 === 13) {
          g.setColor(255, 255, 255);
          g.drawLine(i4, i5, i4, i5);
        } else if ((i3 === 6) || (i3 === 12)) {
          frameW = (House.flyerFrames[(i3 - 1)].getWidth() >> 1);
          frameH = House.flyerFrames[(i3 - 1)].getHeight();
          House.setClipRect(g, (i4 - ((frameW >> 1))), (i5 - ((frameH >> 1))), frameW, frameH);
          g.drawImage(House.flyerFrames[(i3 - 1)], (((i4 - ((frameW >> 1)))) - (Math.imul(frameW, (((((House.gameTime / 400) | 0)) % 2))))), (i5 - ((frameH >> 1))), 20);
          House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        } else if (i3 === 28) {
          frameW = House.flyerFrames[(i3 - 1)].getWidth();
          frameH = (House.flyerFrames[(i3 - 1)].getHeight() >> 1);
          House.setClipRect(g, (i4 - ((frameW >> 1))), (i5 - ((frameH >> 1))), frameW, frameH);
          g.drawImage(House.flyerFrames[(i3 - 1)], (i4 - ((frameW >> 1))), (((i5 - ((frameH >> 1)))) - (Math.imul((((((House.gameTime / 400) | 0)) % 2)), frameH))), 20);
          House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        } else {
          g.drawImage(House.flyerFrames[(i3 - 1)], i4, i5, 3);
        }
      }
    }
  }
  static updateLoadingProgress(progressPercent) {
    House.loadingProgress = progressPercent;
    GameMIDlet.getInstance().fullRepaint();
    return !House.loadCancelled;
  }
  static saveTowerQuickMode() {
    try {
      let i;
      let i2;
      let dos = Storage.openWrite("quickModeRS");
      dos.writeInt(House.gameMode);
      dos.writeInt(House.screenState);
      dos.writeInt(House.phase);
      dos.writeInt(House.gameTime);
      dos.writeInt(House.centerX);
      dos.writeInt(House.centerY);
      dos.writeInt(House.camX);
      dos.writeInt(House.camY);
      dos.writeInt(House.camZ);
      dos.writeInt(House.camTargetY);
      dos.writeInt(House.camEaseStart);
      dos.writeInt(House.pivotX);
      dos.writeInt(House.pivotY);
      dos.writeInt(House.hookX);
      dos.writeInt(House.hookY);
      dos.writeInt(House.swingAngle);
      dos.writeInt(House.craneTime);
      dos.writeInt(House.craneYOffset);
      dos.writeInt(House.ropeLength);
      dos.writeInt(House.swingPeriod);
      dos.writeInt(House.prevHookX);
      dos.writeInt(House.prevHookY);
      dos.writeInt(House.swingAmplitudeX);
      dos.writeInt(House.swingAmplitudeY);
      dos.writeInt(House.skyStage);
      dos.writeInt(House.fenceHeight);
      dos.writeInt(House.fenceContainerWidth);
      dos.writeInt(House.fenceChainWidth);
      dos.writeInt(House.fenceWoodWidth);
      dos.writeInt(House.skyStageLength);
      dos.writeInt(House.blockCount);
      dos.writeInt(House.blockGoal);
      dos.writeInt((House.towerType + ((House.pinkTower ? House.SAVE_PINK_FLAG : 0))));
      dos.writeInt(House.foundationOffset);
      dos.writeInt(House.unusedValue);
      dos.writeInt(House.scrolledOffsetSum);
      dos.writeInt(House.offsetSum);
      dos.writeInt(House.topFloorSlot);
      dos.writeInt(House.swayAngle);
      dos.writeInt(House.swayAmplitude);
      dos.writeInt(House.swayPhase);
      for (const value of House.floorX) {
        dos.writeInt(value);
      }
      for (const value of House.floorY) {
        dos.writeInt(value);
      }
      for (const value of House.floorSway) {
        dos.writeInt(value);
      }
      for (const value of House.floorAngle) {
        dos.writeInt(value);
      }
      dos.writeBoolean(House.bonusEligible);
      dos.writeInt(House.floorIndex);
      dos.writeInt(House.landingQuality);
      for (const value of House.blockX) {
        dos.writeInt(value);
      }
      for (const value of House.blockY) {
        dos.writeInt(value);
      }
      for (const value of House.blockState) {
        dos.writeInt(value);
      }
      for (const value of House.blockTilt) {
        dos.writeInt(value);
      }
      for (const value of House.blockAngle) {
        dos.writeInt(value);
      }
      for (const value of House.blockVelX) {
        dos.writeInt(value);
      }
      for (const value of House.blockVelY) {
        dos.writeInt(value);
      }
      for (const value of House.blockStartY) {
        dos.writeInt(value);
      }
      for (const value of House.blockTargetAngle) {
        dos.writeInt(value);
      }
      for (const writeByte of House.landingOffsets) {
        dos.writeByte(writeByte);
      }
      for (const value of House.blockTargetTilt) {
        dos.writeInt(value);
      }
      for (let row = 0; row < 8; row++) {
        for (i = 0; i < 8; i++) {
          dos.writeInt(House.citizens[row][i]);
        }
      }
      for (let row = 0; row < 2; row++) {
        for (i = 0; i < 5; i++) {
          dos.writeInt(House.lostBlocks[row][i]);
        }
      }
      dos.writeInt(House.hudX);
      dos.writeInt(House.hudHeight);
      dos.writeInt(House.score);
      dos.writeInt(House.lives);
      dos.writeInt(House.lastLossAmount);
      dos.writeInt(House.lastLossTime);
      dos.writeInt(House.lastPerfectTime);
      dos.writeInt(House.comboTimer);
      dos.writeInt(House.comboBonus);
      dos.writeInt(House.comboCount);
      dos.writeInt(House.lastLandTime);
      dos.writeInt(House.skylineStart);
      for (let row = 0; row < 12; row++) {
        for (i = 0; i < 7; i++) {
          dos.writeInt(House.clouds[row][i]);
        }
      }
      for (let row = 0; row < 9; row++) {
        for (i = 0; i < 6; i++) {
          dos.writeInt(House.flyers[row][i]);
        }
      }
      for (const value of House.progress) {
        dos.writeInt(value);
      }
      dos.writeBoolean(House.roundFinishedQuick);
      dos.writeInt(House.maxCombo);
      dos.writeBoolean(House.perfectTipActiveQuick);
      dos.writeBoolean(House.newRecord);
      dos.writeBoolean(House.raining);
      dos.writeBoolean(House.snowing);
      dos.writeBoolean(House.reservedFlagA);
      dos.writeBoolean(House.rainTriggered);
      dos.writeBoolean(House.snowTriggered);
      dos.writeBoolean(House.lightingEnabled);
      dos.writeBoolean(House.reservedFlagB);
      dos.writeInt(House.lightLevel);
      dos.writeInt(House.lightBefore);
      dos.writeInt(House.lightTarget);
      dos.writeInt(House.lightFadeDuration);
      dos.writeInt(House.flashLevel);
      dos.writeInt(House.flashPeak);
      dos.writeInt(House.flashStart);
      dos.writeInt(House.flashTimer);
      dos.writeInt(House.flashDuration);
      dos.writeInt(House.reservedStateFlag);
      dos.writeInt(House.weatherPhase);
      dos.writeInt(House.phaseDuration);
      dos.writeInt(House.rampUpDuration);
      dos.writeInt(House.peakDuration);
      dos.writeInt(House.rampDownDuration);
      dos.writeInt(House.weatherTimer);
      dos.writeInt(House.weatherType);
      dos.writeInt(House.reservedValue);
      for (let row = 0; row < 2; row++) {
        for (i = 0; i < 7; i++) {
          dos.writeInt(House.weatherEmitters[row][i]);
        }
      }
      dos.writeInt(House.lastHitTime);
      Storage.close();
    } catch (e) {
      console.error(e);
      System.out.println(("Exception in saveTowerQuickMode(), e:" + (e).message));
    }
  }
  render3D(g) {
    let i;
    let dVar = null;
    Renderer3D.setFov(55.0);
    House.applyCameraLook();
    if (((House.phase === House.PHASE_ROOF) || (House.blockState[0] === House.BLOCK_RETURNING)) || (((House.phase === House.PHASE_INTRO) && (House.blockState[0] !== House.BLOCK_DROPPED)))) {
      Renderer3D.projected[0] = House.hookX;
      Renderer3D.projected[1] = ((House.hookY + 528));
      Renderer3D.projected[2] = 0.0;
      Renderer3D.projected[3] = 1.0;
      Renderer3D.project(Renderer3D.projected);
      g.setColor(0);
      i = (House.centerX + (((Math.imul(((House.pivotX - House.camX)), 32)) >> 8)));
      let i2 = (House.centerY - (((Math.imul(((House.pivotY - House.camY)), 32)) >> 8)));
      let i3 = (Renderer3D.projected[0] | 0);
      let i4 = (Renderer3D.projected[1] | 0);
      g.drawImage(House.craneArmSprite, (i + 4), i2, 40);
      g.drawLine(i, i2, i3, i4);
      g.drawLine((i + 1), i2, (i3 + 1), i4);
    }
    Renderer3D.beginFrame(g);
    if (House.blockCount <= 5) {
      House.groundMesh.resetTransform();
      House.groundMesh.render();
    }
    if (House.phase === House.PHASE_PLAYING) {
      House.craneHookMesh.resetTransform();
      House.craneHookMesh.translate(House.hookX, House.hookY, 0.0);
      House.craneHookMesh.rotate(((House.swingAngle) / 540.0), 0.0, 0.0, 1.0);
      dVar = House.craneHookMesh;
    } else if (((House.phase === House.PHASE_ROOF) || (House.blockState[0] === House.BLOCK_RETURNING)) || (((House.phase === House.PHASE_INTRO) && (House.blockState[0] !== House.BLOCK_DROPPED)))) {
      House.craneHookStaticMesh.resetTransform();
      House.craneHookStaticMesh.translate(House.hookX, House.hookY, 0.0);
      dVar = House.craneHookStaticMesh;
    }
    if (dVar != null) {
      dVar.render();
    }
    i = 0;
    while (i < 5) {
      if (!(((House.blockState[i] === House.BLOCK_LANDED) || (House.blockState[i] === 0)))) {
        House.renderBlock(House.blockX[i], House.blockY[i], 0, House.blockAngle[i], House.blockTilt[i]);
      }
      i++;
    }
    for (i = 0; i < Math.min(House.blockCount, 5); i++) {
      House.renderBlock(House.floorX[i], House.floorY[i], House.floorSway[i], (-House.floorAngle[i]), 0);
    }
    Renderer3D.endFrame();
  }
  static paintLoadingScreen(g) {
    House.paintSky(g, ((Math.imul(House.loadingScroll, 32)) >> 8), true, false);
    let i = ((((GameMIDlet.screenWidth << 1)) / 3) | 0);
    let height = (((GameMIDlet.screenHeight >> 1)) + ((House.loadingImage.getHeight() >> 3)));
    g.drawImage(House.loadingImage, (GameMIDlet.screenWidth >> 1), height, 33);
    height += (House.loadingImage.getHeight() >> 3);
    g.setColor(-15463412);
    g.fillRect((((((GameMIDlet.screenWidth >> 1)) - ((i >> 1)))) + 1), (height + 1), i, 10);
    g.setColor(-8556946);
    g.fillRect((((GameMIDlet.screenWidth >> 1)) - ((i >> 1))), height, i, 10);
    g.setColor(-1);
    g.fillRect((((((GameMIDlet.screenWidth >> 1)) - ((i >> 1)))) + 1), (height + 1), (i - 2), 8);
    g.setColor(-14475756);
    g.fillRect((((((GameMIDlet.screenWidth >> 1)) - ((i >> 1)))) + 2), (height + 2), (i - 4), 6);
    g.setColor(-4980736);
    g.fillRect((((((GameMIDlet.screenWidth >> 1)) - ((i >> 1)))) + 2), (height + 2), (((Math.imul(House.loadingProgress, ((i - 4)))) / 100) | 0), 6);
    g.setColor(-9895936);
    g.fillRect((((((GameMIDlet.screenWidth >> 1)) - ((i >> 1)))) + 3), (height + 3), (((((Math.imul(House.loadingProgress, ((i - 4)))) / 100) | 0)) - 1), 5);
    g.setColor(-487168);
    g.fillRect((((((GameMIDlet.screenWidth >> 1)) - ((i >> 1)))) + 3), (height + 3), (((((Math.imul(House.loadingProgress, ((i - 4)))) / 100) | 0)) - 2), 1);
    g.setColor(-510464);
    g.fillRect((((((GameMIDlet.screenWidth >> 1)) - ((i >> 1)))) + 3), (height + 4), (((((Math.imul(((i - 4)), House.loadingProgress)) / 100) | 0)) - 2), 3);
  }
  static saveTowerCityMode() {
    try {
      let i;
      let i2;
      let dos = Storage.openWrite("cityModeRS");
      dos.writeInt(House.gameMode);
      dos.writeInt(House.screenState);
      dos.writeInt(House.phase);
      dos.writeInt(House.gameTime);
      dos.writeInt(House.centerX);
      dos.writeInt(House.centerY);
      dos.writeInt(House.camX);
      dos.writeInt(House.camY);
      dos.writeInt(House.camZ);
      dos.writeInt(House.camTargetY);
      dos.writeInt(House.camEaseStart);
      dos.writeInt(House.pivotX);
      dos.writeInt(House.pivotY);
      dos.writeInt(House.hookX);
      dos.writeInt(House.hookY);
      dos.writeInt(House.swingAngle);
      dos.writeInt(House.craneTime);
      dos.writeInt(House.craneYOffset);
      dos.writeInt(House.ropeLength);
      dos.writeInt(House.swingPeriod);
      dos.writeInt(House.prevHookX);
      dos.writeInt(House.prevHookY);
      dos.writeInt(House.swingAmplitudeX);
      dos.writeInt(House.swingAmplitudeY);
      dos.writeInt(House.skyStage);
      dos.writeInt(House.fenceHeight);
      dos.writeInt(House.fenceContainerWidth);
      dos.writeInt(House.fenceChainWidth);
      dos.writeInt(House.fenceWoodWidth);
      dos.writeInt(House.skyStageLength);
      dos.writeInt(House.blockCount);
      dos.writeInt(House.blockGoal);
      dos.writeInt((House.towerType + ((House.pinkTower ? House.SAVE_PINK_FLAG : 0))));
      dos.writeInt(House.foundationOffset);
      dos.writeInt(House.unusedValue);
      dos.writeInt(House.scrolledOffsetSum);
      dos.writeInt(House.offsetSum);
      dos.writeInt(House.topFloorSlot);
      dos.writeInt(House.swayAngle);
      dos.writeInt(House.swayAmplitude);
      dos.writeInt(House.swayPhase);
      for (const value of House.floorX) {
        dos.writeInt(value);
      }
      for (const value of House.floorY) {
        dos.writeInt(value);
      }
      for (const value of House.floorSway) {
        dos.writeInt(value);
      }
      for (const value of House.floorAngle) {
        dos.writeInt(value);
      }
      dos.writeBoolean(House.bonusEligible);
      dos.writeInt(House.floorIndex);
      dos.writeInt(House.landingQuality);
      for (const value of House.blockX) {
        dos.writeInt(value);
      }
      for (const value of House.blockY) {
        dos.writeInt(value);
      }
      for (const value of House.blockState) {
        dos.writeInt(value);
      }
      for (const value of House.blockTilt) {
        dos.writeInt(value);
      }
      for (const value of House.blockAngle) {
        dos.writeInt(value);
      }
      for (const value of House.blockVelX) {
        dos.writeInt(value);
      }
      for (const value of House.blockVelY) {
        dos.writeInt(value);
      }
      for (const value of House.blockStartY) {
        dos.writeInt(value);
      }
      for (const value of House.blockTargetAngle) {
        dos.writeInt(value);
      }
      for (const writeByte of House.landingOffsets) {
        dos.writeByte(writeByte);
      }
      for (const value of House.blockTargetTilt) {
        dos.writeInt(value);
      }
      for (let row = 0; row < 8; row++) {
        for (i = 0; i < 8; i++) {
          dos.writeInt(House.citizens[row][i]);
        }
      }
      for (let row = 0; row < 2; row++) {
        for (i = 0; i < 5; i++) {
          dos.writeInt(House.lostBlocks[row][i]);
        }
      }
      dos.writeInt(House.hudX);
      dos.writeInt(House.hudHeight);
      dos.writeInt(House.score);
      dos.writeInt(House.lives);
      dos.writeInt(House.lastLossAmount);
      dos.writeInt(House.lastLossTime);
      dos.writeInt(House.lastPerfectTime);
      dos.writeInt(House.comboTimer);
      dos.writeInt(House.comboBonus);
      dos.writeInt(House.comboCount);
      dos.writeInt(House.lastLandTime);
      dos.writeInt(House.skylineStart);
      for (let row = 0; row < 12; row++) {
        for (i = 0; i < 7; i++) {
          dos.writeInt(House.clouds[row][i]);
        }
      }
      for (let row = 0; row < 9; row++) {
        for (i = 0; i < 6; i++) {
          dos.writeInt(House.flyers[row][i]);
        }
      }
      for (const value of House.progress) {
        dos.writeInt(value);
      }
      dos.writeBoolean(House.roundFinishedCity);
      dos.writeInt(House.maxCombo);
      dos.writeBoolean(House.perfectTipActiveCity);
      dos.writeBoolean(House.newRecord);
      dos.writeBoolean(House.raining);
      dos.writeBoolean(House.snowing);
      dos.writeBoolean(House.reservedFlagA);
      dos.writeBoolean(House.rainTriggered);
      dos.writeBoolean(House.snowTriggered);
      dos.writeBoolean(House.lightingEnabled);
      dos.writeBoolean(House.reservedFlagB);
      dos.writeInt(House.lightLevel);
      dos.writeInt(House.lightBefore);
      dos.writeInt(House.lightTarget);
      dos.writeInt(House.lightFadeDuration);
      dos.writeInt(House.flashLevel);
      dos.writeInt(House.flashPeak);
      dos.writeInt(House.flashStart);
      dos.writeInt(House.flashTimer);
      dos.writeInt(House.flashDuration);
      dos.writeInt(House.reservedStateFlag);
      dos.writeInt(House.weatherPhase);
      dos.writeInt(House.phaseDuration);
      dos.writeInt(House.rampUpDuration);
      dos.writeInt(House.peakDuration);
      dos.writeInt(House.rampDownDuration);
      dos.writeInt(House.weatherTimer);
      dos.writeInt(House.weatherType);
      dos.writeInt(House.reservedValue);
      for (let row = 0; row < 2; row++) {
        for (i = 0; i < 7; i++) {
          dos.writeInt(House.weatherEmitters[row][i]);
        }
      }
      dos.writeInt(House.lastHitTime);
      Storage.close();
    } catch (e) {
      console.error(e);
      System.out.println(("Exception in saveTowerCityMode(), e:" + (e).message));
    }
  }
  static paintPerfectEffect(g) {
    let i = 0;
    let i2 = (House.gameTime - House.lastPerfectTime);
    if (i2 < 600) {
      let i3 = 48;
      let i4 = 32;
      let i5 = (House.centerX + ((((Math.imul(((House.floorX[House.topFloorSlot] - House.camX)), 32)) / 256) | 0)));
      let i6 = (House.centerY - ((((Math.imul(((House.floorY[House.topFloorSlot] - House.camY)), 32)) / 256) | 0)));
      if (i2 < 30) {
        g.setColor(16777215);
      } else if (i2 < 200) {
        g.setColor(255, (255 - ((i2 >> 2))), 0);
        i4 = (48 - ((((Math.imul(i2, 32)) / 200) | 0)));
        i3 = Math.max(2, (6 - ((((Math.imul(i2, 6)) / 200) | 0))));
        g.fillRect((i5 - ((i4 >> 1))), (((((32 - i3)) >> 1)) + i6), i4, i3);
        i3 = (((((Math.imul(i2, 32)) / 200) | 0)) + 16);
        i4 = (((((Math.imul(i2, 32)) / 400) | 0)) + 16);
        g.drawLine((i5 + 16), (i6 + 16), (i5 + i3), (i6 + i4));
        g.drawLine((i5 - 16), (i6 + 16), (i5 - i3), (i6 + i4));
        g.drawLine((i5 - 16), (i6 - 16), (i5 - i4), (i6 - i4));
      } else {
        i = ((((i2 / 50) | 0)) % 3);
      }
      House.setClipRect(g, (((i5 + i3)) - 6), (((i6 + i4)) - 6), 13, 13);
      g.drawImage(House.sparkSprite, (((((i5 + i3)) - 6)) - (Math.imul(i, 13))), (((i6 - 6)) + i4), 20);
      House.setClipRect(g, (((i5 - i3)) - 6), (((i6 + i4)) - 6), 13, 13);
      g.drawImage(House.sparkSprite, (((((i5 - i3)) - 6)) - (Math.imul(i, 13))), (i4 + ((i6 - 6))), 20);
      House.setClipRect(g, (((i5 - i3)) - 6), (((i6 - i3)) - 6), 13, 13);
      g.drawImage(House.sparkSprite, (((((i5 - i3)) - 6)) - (Math.imul(i, 13))), (((i6 - 6)) - i3), 20);
    }
  }
  static random(bound) {
    return Math.abs((House.rng.nextInt() % bound));
  }
  static paintScenery(g) {
    let i;
    House.applyCameraLook();
    Renderer3D.projected[0] = 0.0;
    Renderer3D.projected[1] = -19.0;
    Renderer3D.projected[2] = -80.0;
    Renderer3D.projected[3] = 1.0;
    Renderer3D.project(Renderer3D.projected);
    let i2 = (((((Renderer3D.projected[1] | 0)) - House.fenceHeight)) + 9);
    House.paintSky(g, House.camY, false, true);
    House.paintClouds(g);
    House.paintSkyline(g, i2);
    House.paintFlyers(g);
    if ((i2 - House.treeWidth) < GameMIDlet.screenHeight) {
      g.drawImage(House.treeSprite, (((GameMIDlet.screenWidth >> 1)) + ((House.fenceContainerWidth >> 1))), (((i2 - House.treeWidth)) + 9), 17);
    }
    if (i2 < GameMIDlet.screenHeight) {
      let i3 = (((GameMIDlet.screenWidth >> 1)) - ((House.fenceContainerWidth >> 1)));
      let image = House.fenceContainerSprite;
      let i4 = i3;
      let graphics2 = g;
      while (true) {
        graphics2.drawImage(image, i4, i2, 20);
        i3 = (i4 - House.fenceChainWidth);
        if (i3 <= (0 - House.fenceChainWidth)) {
          break;
        }
        image = House.fenceChainSprite;
        i4 = i3;
        graphics2 = g;
      }
      i3 = (GameMIDlet.screenWidth >> 1);
      i = (House.fenceContainerWidth >> 1);
      while (true) {
        i3 += i;
        if (i3 >= GameMIDlet.screenWidth) {
          break;
        }
        g.drawImage(House.fenceWoodSprite, i3, i2, 20);
        i = House.fenceWoodWidth;
      }
    }
    i = (House.fenceHeight + i2);
    if (i < GameMIDlet.screenHeight) {
      g.setColor(4602900);
      g.fillRect(0, i, GameMIDlet.screenWidth, 2);
      g.setColor(1972495);
      g.fillRect(0, (i + 2), GameMIDlet.screenWidth, (((GameMIDlet.screenHeight - 2)) - i));
    }
  }
  static sin(angleBrads) {
    return (angleBrads < 0) ? (-House.sinTable[Math.abs(angleBrads)]) : House.sinTable[angleBrads];
  }
  static paintHud(g) {
    House.paintLives(g);
    House.paintScore(g);
    House.paintTowerProgress(g);
    House.paintComboGauge(g);
  }
  static paintLives(g) {
    House.setClipRect(g, (((((House.hudX + ((House.hudX >> 1)))) + 14)) + 4), (((GameMIDlet.screenHeight - House.hudHeight)) - 72), 11, 72);
    let normalIndex = (House.pinkTower ? House.LIFE_ICON_PINK : Math.imul(((House.towerType - 1)), 2));
    let losingIndex = (House.pinkTower ? House.LIFE_ICON_PINK_LOSS : ((Math.imul(((House.towerType - 1)), 2)) + 1));
    for (let i = 0; i <= 3; i++) {
      let iconIndex = normalIndex;
      if (i > House.lives) {
        iconIndex = (((((House.gameTime - House.lastLossTime) >= 100) || (i > (House.lives + House.lastLossAmount)))) ? House.LIFE_ICON_EMPTY : losingIndex);
      } else if ((House.lives === 1) && (((((House.gameTime / 500) | 0)) % 2) === 0)) {
        iconIndex = House.LIFE_ICON_BLINK;
      }
      g.drawImage(House.lifeIcons, (((((((House.hudX + ((House.hudX >> 1)))) + 14)) - (Math.imul(iconIndex, 11)))) + 4), (((GameMIDlet.screenHeight - House.hudHeight)) - (Math.imul(i, 12))), 20);
    }
  }
  static paintScore(g) {
    if (House.blockCount > 0) {
      House.drawDigitsA(g, House.score, (GameMIDlet.screenWidth - House.hudX), (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - 12), 5, false);
      House.setClipRect(g, (((((((GameMIDlet.screenWidth - House.hudX)) - 28)) - 3)) - 11), (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - 19), 11, 19);
      g.drawImage(House.hudIcons, (((((((GameMIDlet.screenWidth - House.hudX)) - 28)) - 3)) - 11), (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - 19), 20);
    }
  }
  static paintTowerProgress(g) {
    if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
      House.setClipRect(g, (House.hudX - 3), (((((GameMIDlet.screenHeight - House.hudHeight)) - 21)) - (Math.imul(House.blockGoal, 3))), 20, 21);
      let medalIndex = (House.pinkTower ? House.MEDAL_PINK : ((House.towerType - 1)));
      if ((House.phase === House.PHASE_ROOF) && (((((House.gameTime / 500) | 0)) % 2) === 0)) {
        medalIndex = House.MEDAL_ROOF;
      }
      g.drawImage(House.levelMedals, (((House.hudX - 3)) - (Math.imul(medalIndex, 20))), (((((GameMIDlet.screenHeight - House.hudHeight)) - 21)) - (Math.imul(House.blockGoal, 3))), 20);
      for (let f = 0; f < Math.min(House.blockCount, (House.blockGoal - 1)); f++) {
        House.setClipRect(g, House.hudX, (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - (Math.imul(((f + 1)), 3))), 14, 3);
        g.drawImage(House.hudIcons, (House.hudX + 2), (((((((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - 20)) - (Math.imul(((f + 1)), 3)))) - (Math.imul(((House.towerType - 1)), 3))), 20);
      }
      House.setClipRect(g, (House.hudX - 1), (((GameMIDlet.screenHeight - House.hudHeight)) - 2), 14, 2);
      g.drawImage(House.hudIcons, (((House.hudX + 2)) - 1), (((((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - 28)) - 1), 20);
      House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
      g.setColor(4725760);
      g.drawLine((House.hudX - 1), (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - (Math.imul(((House.blockGoal - 1)), 3))), (House.hudX - 1), (((GameMIDlet.screenHeight - House.hudHeight)) - 2));
      g.drawLine((House.hudX + 14), (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - (Math.imul(((House.blockGoal - 1)), 3))), (House.hudX + 14), (((GameMIDlet.screenHeight - House.hudHeight)) - 2));
      g.setColor(16776960);
      g.drawLine(House.hudX, (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - (Math.imul(((House.blockGoal - 1)), 3))), House.hudX, (((GameMIDlet.screenHeight - House.hudHeight)) - 2));
      g.drawLine((((House.hudX + 14)) - 1), (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - (Math.imul(((House.blockGoal - 1)), 3))), (((House.hudX + 14)) - 1), (((GameMIDlet.screenHeight - House.hudHeight)) - 2));
      g.setColor(2301460);
      g.fillRect((House.hudX + 1), (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - (Math.imul(((House.blockGoal - 1)), 3))), 12, Math.imul(((((House.blockGoal - House.blockCount)) - 1)), 3));
      if (((House.gameTime - House.lastLandTime) < 100) && (House.phase !== House.PHASE_ROUND_OVER)) {
        g.setColor(16776960);
        g.fillRect((House.hudX + 1), (((((GameMIDlet.screenHeight - House.hudHeight)) - 2)) - (Math.imul(House.blockCount, 3))), 12, 3);
      }
    } else {
      House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
      g.drawImage(House.floorCounterFrame, (House.hudX - 9), (((GameMIDlet.screenHeight - House.hudHeight)) - 50), 20);
      House.drawDigitsB(g, House.blockCount, (((House.hudX - 9)) + 23), (((((GameMIDlet.screenHeight - House.hudHeight)) - 50)) + 37), 3, false);
    }
    House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
  }
  static paintComboGauge(g) {
    if (House.comboTimer > 0) {
      g.setColor(107, 26, 0);
      g.drawRect((((((((GameMIDlet.screenWidth >> 1)) - ((GameMIDlet.screenWidth >> 2)))) - 2)) - 1), (House.hudHeight - 1), (((((GameMIDlet.screenWidth >> 1)) + 4)) + 1), 9);
      g.setColor(252, 255, 0);
      g.drawRect((((((GameMIDlet.screenWidth >> 1)) - ((GameMIDlet.screenWidth >> 2)))) - 2), House.hudHeight, (((((GameMIDlet.screenWidth >> 1)) + 4)) - 1), 7);
      if (House.comboTimer > 5850) {
        g.setColor(255, 255, 255);
      }
      g.fillRect((((GameMIDlet.screenWidth >> 1)) - ((GameMIDlet.screenWidth >> 2))), (House.hudHeight + 2), (((Math.imul(House.comboTimer, ((GameMIDlet.screenWidth >> 1)))) / 6000) | 0), 4);
      House.setClipRect(g, (((((GameMIDlet.screenWidth >> 1)) - ((GameMIDlet.screenWidth >> 2)))) - 11), (House.hudHeight - 7), 22, 22);
      g.drawImage(House.comboStarSprite, (((((((GameMIDlet.screenWidth >> 1)) - ((GameMIDlet.screenWidth >> 2)))) - 11)) - (Math.imul((((((House.gameTime / 80) | 0)) % 4)), 22))), (House.hudHeight - 7), 20);
      if ((House.blockState[0] === House.BLOCK_HANGING) || (House.blockState[0] === House.BLOCK_DROPPED)) {
        let sprX = (House.centerX + (((Math.imul(((House.blockX[0] - House.camX)), 32)) >> 8)));
        let sprY = (House.centerY - (((Math.imul(((House.blockY[0] - House.camY)), 32)) >> 8)));
        House.setClipRect(g, (sprX - 22), (sprY - 22), 44, 44);
        g.drawImage(House.comboSparkleSprite, (((sprX - 22)) - (Math.imul((((((House.gameTime / 100) | 0)) % 3)), 44))), (sprY - 22), 20);
      }
      if (House.comboCount > 0) {
        for (let slot = House.topFloorSlot; slot > Math.max(0, (House.topFloorSlot - House.comboCount)); slot--) {
          let sprX = (House.centerX + (((Math.imul(((House.floorX[slot] - House.camX)), 32)) >> 8)));
          let sprY = (House.centerY - (((Math.imul(((House.floorY[slot] - House.camY)), 32)) >> 8)));
          House.setClipRect(g, (sprX - 22), (sprY - 22), 44, 44);
          g.drawImage(House.comboSparkleSprite, (((sprX - 22)) - (Math.imul((((((((House.gameTime / 100) | 0)) + slot)) % 3)), 44))), (sprY - 22), 20);
        }
        if (House.comboCount > 1) {
          House.setClipRect(g, (((((GameMIDlet.screenWidth >> 1)) + ((GameMIDlet.screenWidth >> 2)))) + 5), House.hudHeight, 7, 12);
          g.drawImage(House.digitSheetA, (((((((GameMIDlet.screenWidth >> 1)) + ((GameMIDlet.screenWidth >> 2)))) + 5)) - 91), (House.hudHeight - 2), 20);
          let digits = ((House.comboCount > 9) ? 2 : 1);
          House.drawDigitsA(g, House.comboCount, (((((((((GameMIDlet.screenWidth >> 1)) + ((GameMIDlet.screenWidth >> 2)))) + 10)) + 2)) + (Math.imul(digits, 7))), (House.hudHeight - 2), digits, false);
        }
      }
    } else if (((House.comboBonus !== 0) && (House.comboTimer > -2000)) && (((((((-House.comboTimer)) / 100) | 0)) % 2) === 0)) {
      House.drawDigitsA(g, House.comboBonus, (((GameMIDlet.screenWidth >> 1)) + 14), House.hudHeight, 3, true);
    }
  }
  static negCos(angleBrads) {
    return House.sin((angleBrads - 90));
  }
  static paintCitizens(g) {
    for (let i = 0; i < 8; i++) {
      if (House.citizens[0][i] !== 0) {
        House.drawCitizen(g, (((House.centerX + (((Math.imul(((House.citizens[7][i] - House.camX)), 32)) >> 8)))) - 10), (((House.centerY - (((Math.imul(((House.citizens[8][i] - House.camY)), 32)) >> 8)))) - 14), House.citizens[3][i], House.citizens[6][i], House.citizens[10][i]);
      }
    }
  }
  static paintClouds(g) {
    let i = ((Math.imul(House.camY, 32)) >> 8);
    for (let i2 = 0; i2 < 12; i2++) {
      let iArr = House.clouds[i2];
      if (iArr[4] !== 0) {
        let i3;
        let i4 = House.clouds[i2][2];
        let i5 = (((House.centerY - i4)) + i);
        let i6 = (i5 + i4);
        if (i5 < 0) {
          i5 = 0;
          i3 = 0;
        } else {
          i3 = 1;
        }
        if ((i5 + i6) > GameMIDlet.screenHeight) {
          i6 = (GameMIDlet.screenHeight - i5);
        }
        if (i5 > (GameMIDlet.screenHeight + 32)) {
          House.clouds[i2][4] = 0;
        } else {
          g.setColor(House.shadeColor(iArr[5], House.lightLevel, true));
          let i7 = iArr[1];
          if (i5 < GameMIDlet.screenHeight) {
            g.fillRect(House.clouds[i2][0], i5, i7, i6);
          }
          if (i3 !== 0) {
            let roofType = iArr[6];
            if (roofType === 1) {
              g.fillRect((House.clouds[i2][0] + ((i7 >> 1))), (i5 - House.clouds[i2][3]), 3, House.clouds[i2][3]);
              if (((((((House.gameTime + i4)) / 200) | 0)) % 2) === 0) {
                g.setColor(16711680);
                g.fillRect((House.clouds[i2][0] + ((i7 >> 1))), (i5 - House.clouds[i2][3]), 3, 3);
              }
            } else if (roofType === 2) {
              g.fillRect((House.clouds[i2][0] + (((i7 / 10) | 0))), (i5 - 16), (i7 - (((i7 / 5) | 0))), 16);
            }
          }
        }
      }
    }
  }
  static handleModalAction(action) {
    if ((House.gameTime >= House.promptShownTime) && ((House.gameTime - House.promptShownTime) < 300)) {
      return false;
    }
    House.clearKeys();
    let O = House.isLastPromptPage();
    if (!O || (House.promptOptions == null)) {
      if (action === 0) {
        action = 1;
      }
      House.promptPage += action;
      if (House.promptPage < 0) {
        House.promptPage = 0;
      } else if ((House.promptPage >= House.promptPageCount) && O) {
        House.resetPrompt();
        return true;
      }
      return false;
    }
    House.promptSelection = Math.min((House.promptSelection + action), (House.promptOptions.length - 1));
    if (House.promptSelection < 0) {
      House.promptPage = Math.max(0, (House.promptPage - 1));
      House.promptSelection = 0;
    } else if (action === 0) {
      House.resetPrompt();
      return true;
    }
    return false;
  }
  static raiseCamera(targetHeight) {
    House.camEaseStart = House.gameTime;
    House.camTargetY = ((House.blockCount > 1) ? (House.camTargetY + targetHeight) : 512);
  }
  static getGameFont() {
    return House.gameFont;
  }
  static updateCrane(dt) {
    House.craneTime += dt;
    if (House.blockState[0] === House.BLOCK_ROPE_LOWERING) {
      House.ropeLength += (((Math.imul(dt, 2)) / 3) | 0);
      let i2 = 1664;
      if (House.phase === House.PHASE_ROOF) {
        i2 = 1408;
      }
      if (House.ropeLength >= i2) {
        House.ropeLength = i2;
        House.blockState[0] = House.BLOCK_HANGING;
      }
    }
    House.hookX = ((Math.imul(House.swingAmplitudeX, House.negCos((((((Math.imul(House.craneTime, 200)) / House.swingPeriod) | 0)) % 360)))) >> 15);
    House.swingAngle = (House.hookX >> 4);
    House.hookY = (((-(((Math.imul(House.swingAmplitudeY, House.sin((((((Math.imul(House.craneTime, 200)) / House.swingPeriod) | 0)) % 360)))) >> 15)))) + ((((House.pivotY - House.craneYOffset)) - House.ropeLength)));
    if ((House.blockState[0] === House.BLOCK_HANGING) && (House.phase !== House.PHASE_INTRO)) {
      House.blockVelX[0] = (((Math.imul(((House.hookX - House.prevHookX)), 256)) / dt) | 0);
      House.blockVelY[0] = (((Math.imul(((House.hookY - House.prevHookY)), 256)) / dt) | 0);
    }
    House.prevHookX = House.hookX;
    House.prevHookY = House.hookY;
  }
  static updateTowerSway(dt) {
    let i2;
    House.swayCos = 0;
    if (House.phase !== House.PHASE_ROUND_OVER) {
      House.swayPhase = (((House.swayPhase + dt)) % 3600);
      House.swayCos = House.negCos(((House.swayPhase / 10) | 0));
      i2 = ((Math.imul(House.swayAmplitude, House.swayCos)) >> 16);
    } else if (House.swayAngle > 0) {
      i2 = (House.swayAngle - 1);
    } else if (House.swayAngle < 0) {
      i2 = (House.swayAngle + 1);
    } else {
      i2 = 0;
    }
    House.swayAngle = i2;
    House.swayOffset = ((((-(Math.imul(House.swayCos, House.swayAmplitude)))) / 10000) | 0);
    House.negCos(House.swayAngle);
  }
  static nudgeSwayPhase(deltaPhase) {
    Math.max(Math.abs(0), 80);
    let i2 = 1;
    if (House.blockVelX[0] !== 0) {
      i2 = ((House.blockVelX[0] / Math.abs(House.blockVelX[0])) | 0);
    }
    if (House.swayPhase < 1800) {
      i2 = (House.swayPhase - (Math.imul((Math.imul(i2, 0)), 2)));
    } else {
      i2 = ((Math.imul((Math.imul(i2, 0)), 2)) + House.swayPhase);
    }
    House.swayPhase = i2;
  }
  static easeAngle(current, target, elapsedMs) {
    if (current === House.ANGLE_NONE) {
      return current;
    }
    if (current < target) {
      return Math.min(target, (current + ((((Math.imul(((target - current)), elapsedMs)) / House.ROTATION_EASE_MS) | 0))));
    }
    if (current > target) {
      return Math.max(target, (current - ((((Math.imul(elapsedMs, ((current - target)))) / House.ROTATION_EASE_MS) | 0))));
    }
    return current;
  }
  static updateBlockPhysics(dt) {
    House.blockLostThisFrame = false;
    let anyBlockMoving = false;
    for (let slot = 0; slot < House.BLOCK_SLOTS; slot++) {
      let state = House.blockState[slot];
      if ((state === House.BLOCK_HANGING) || (state === House.BLOCK_ROPE_LOWERING)) {
        House.blockAngle[slot] = House.swingAngle;
        House.blockX[slot] = House.hookX;
        House.blockY[slot] = House.hookY;
        return;
      }
      if (state === House.BLOCK_RETURNING) {
        House.blockY[slot] += ((Math.imul(((House.gameTime - House.fallStartTime)), House.RETURN_SPEED)) >> 8);
        if ((House.blockY[slot] >= (House.pivotY - House.RETURN_STOP_BELOW_TOP)) && (House.phase !== House.PHASE_ROUND_OVER)) {
          House.blockState[House.CRANE_SLOT] = House.BLOCK_ROPE_LOWERING;
          House.ropeLength = 0;
          House.floorIndex = Math.min(4, (House.blockCount - 1));
          House.swingPeriod = House.swingPeriodTable[1];
        }
        House.hookX = House.blockX[House.CRANE_SLOT];
        House.hookY = House.blockY[House.CRANE_SLOT];
        House.blockAngle[House.CRANE_SLOT] = House.ANGLE_RETURNING;
        return;
      }
      if (state === House.BLOCK_DEBRIS_WAITING) {
        if ((House.fallStartTime + House.slotDelay[slot]) < House.gameTime) {
          House.blockY[slot] = House.floorY[House.topFloorSlot];
          House.blockX[slot] = House.floorX[House.topFloorSlot];
          House.blockState[slot] = House.BLOCK_TUMBLING;
          House.blockStartY[slot] = House.blockY[slot];
          House.blockAngle[slot] = House.floorAngle[House.topFloorSlot];
          House.evacuateFloor(House.blockCount);
          House.changeFloorCount(-1);
        }
        anyBlockMoving = true;
      } else if ((state === House.BLOCK_DROPPED) || (state === House.BLOCK_TUMBLING)) {
        let elapsed = (((House.gameTime - House.fallStartTime)) - House.slotDelay[slot]);
        House.blockAngle[slot] = House.easeAngle(House.blockAngle[slot], House.blockTargetAngle[slot], elapsed);
        House.blockTilt[slot] = House.easeAngle(House.blockTilt[slot], House.blockTargetTilt[slot], elapsed);
        let gravityDivisor = (((House.phase === House.PHASE_ROOF)) ? House.GRAVITY_DIVISOR_ROOF : House.GRAVITY_DIVISOR);
        let previousY = House.blockY[slot];
        House.blockY[slot] = (((House.blockStartY[slot] + ((((Math.imul(House.blockVelY[slot], elapsed)) / 256) | 0)))) - ((((Math.imul(elapsed, elapsed)) / gravityDivisor) | 0)));
        if (House.blockY[slot] < (previousY - House.MAX_FALL_PER_FRAME)) {
          House.blockY[slot] = (previousY - House.MAX_FALL_PER_FRAME);
        }
        House.blockX[slot] = (House.blockX[slot] + ((((Math.imul(House.blockVelX[slot], dt)) / 512) | 0)));
        if (House.blockY[slot] < (House.camY - ((House.viewHeightUnits >> 1)))) {
          House.lostBlocks[House.LOST_SCREEN_X][slot] = (House.centerX + (((Math.imul(((House.blockX[slot] - House.camX)), 32)) >> 8)));
          House.lostBlocks[House.LOST_TIME][slot] = House.gameTime;
          House.blockState[slot] = House.BLOCK_LANDED;
          if (state === House.BLOCK_DROPPED) {
            if (House.comboTimer > 0) {
              House.cashInCombo();
            }
            House.loseLives(1);
            House.blockLostThisFrame = true;
          }
        }
        if ((state === House.BLOCK_DROPPED) && House.handleLanding()) {
          if (House.phase === House.PHASE_INTRO) {
            House.phase = House.PHASE_PLAYING;
          } else if (((House.blockCount === (House.blockGoal - 1)) && (House.gameMode === House.GAME_MODE_CITY_TOWER)) && (House.phase !== House.PHASE_ROOF)) {
            House.phase = House.PHASE_ROOF;
            if (House.comboTimer > 0) {
              House.cashInCombo();
            }
            if (House.bonusEligible && (House.score < House.scoreThresholds[(House.pinkTower ? 4 : (House.towerType - 1))])) {
              House.bonusEligible = false;
            }
            House.blockY[House.CRANE_SLOT] = House.pivotY;
            House.blockState[House.CRANE_SLOT] = House.BLOCK_ROPE_LOWERING;
            House.ropeLength = 0;
            House.floorIndex = Math.min(4, (House.blockCount - 1));
            House.swingPeriod = House.swingPeriodTable[1];
          } else if (House.phase === House.PHASE_ROOF) {
            House.phase = House.PHASE_ROUND_OVER;
            House.fallStartTime = House.gameTime;
          }
        }
        anyBlockMoving = true;
      }
    }
    if ((House.phase === House.PHASE_ROOF) || (House.phase === House.PHASE_ROUND_OVER)) {
      House.hookX = House.blockX[House.CRANE_SLOT];
      House.hookY = House.blockY[House.CRANE_SLOT];
      if (House.phase !== House.PHASE_ROUND_OVER) {
        House.blockAngle[House.CRANE_SLOT] = House.ANGLE_RETURNING;
      }
    }
    if (((House.blockState[House.CRANE_SLOT] === House.BLOCK_LANDED) && (House.fallStartTime < (House.gameTime - House.REHANG_DELAY_MS))) && !anyBlockMoving) {
      House.ropeLength = House.FULL_ROPE_LENGTH;
      if (House.phase !== House.PHASE_ROUND_OVER) {
        House.blockState[House.CRANE_SLOT] = House.BLOCK_HANGING;
        House.blockX[House.CRANE_SLOT] = House.hookX;
        House.blockY[House.CRANE_SLOT] = House.hookY;
        House.blockTargetTilt[House.CRANE_SLOT] = 0;
        House.blockTilt[House.CRANE_SLOT] = 0;
        House.floorIndex = Math.max(0, Math.min(4, (House.blockCount - 1)));
      }
    }
  }
  static evacuateFloor(floorSlot) {
    let abs = Math.abs(House.landingOffsets[(floorSlot % 20)]);
    abs = ((abs < 25) ? 4 : ((abs < 50) ? 3 : ((abs < 80) ? 2 : 1)));
    let i2 = (abs >> 1);
    let i3 = 0;
    while (i3 < 8) {
      if ((House.citizens[5][i3] !== floorSlot) || (House.citizens[0][i3] === 0)) {
        abs = i2;
      } else {
        House.citizens[1][i3] = House.citizens[7][i3];
        House.citizens[2][i3] = House.citizens[8][i3];
        House.citizens[0][i3] = 3;
        House.citizens[5][i3] = (((Math.imul((((House.citizens[1][i3] < 0) ? -1 : 1)), ((House.citizens[4][i3] - House.gameTime)))) / 500) | 0);
        House.citizens[4][i3] = House.gameTime;
        abs = (i2 - 1);
      }
      i3++;
      i2 = abs;
    }
    i3 = 0;
    while ((i3 < 8) && (i2 > 0)) {
      if (House.citizens[0][i3] === 0) {
        House.citizens[4][i3] = House.gameTime;
        House.citizens[0][i3] = 4;
        House.citizens[5][i3] = House.random(4);
        abs = House.random(2);
        if (abs === 0) {
          abs = -1;
        }
        House.citizens[6][i3] = abs;
        abs = (Math.min(4, (House.blockCount - 1)) - ((House.blockCount - floorSlot)));
        House.citizens[1][i3] = House.floorX[abs];
        House.citizens[2][i3] = House.floorY[abs];
        abs = (i2 - 1);
      } else {
        abs = i2;
      }
      i3++;
      i2 = abs;
    }
  }
  static updateWeather(dt) {
    let i2 = 2;
    House.weatherTimer = Math.min((House.weatherTimer + dt), House.phaseDuration);
    switch (House.weatherPhase) {
      case 0:
        let z;
        if (((House.raining && !House.rainTriggered) && (House.camY >= 0)) && (House.camY <= 3840)) {
          House.rainTriggered = true;
          House.clearWeather();
          House.startWeather(1);
          i2 = 1;
        } else if (((!House.snowing || House.snowTriggered) || (House.camY < 10240)) || (House.camY > 12800)) {
          z = false;
          if (z) {
            House.lightLevel = 1024;
            House.flashLevel = 0;
            House.weatherPhase = 1;
            House.phaseDuration = House.rampUpDuration;
            House.weatherTimer = 0;
            return;
          }
          return;
        } else {
          House.snowTriggered = true;
          House.clearWeather();
          House.startWeather(2);
        }
        House.weatherType = i2;
        House.lightingEnabled = true;
        z = true;
        if (z) {
          House.lightLevel = 1024;
          House.flashLevel = 0;
          House.weatherPhase = 1;
          House.phaseDuration = House.rampUpDuration;
          House.weatherTimer = 0;
          return;
        }
        return;
      case 1:
        House.lightLevel = House.interpolate(0, House.lightFadeDuration, 1024, House.lightTarget, Math.min(House.weatherTimer, House.lightFadeDuration));
        House.weatherEmitters[0][1] = Math.imul(House.weatherEmitters[0][0], House.interpolate(0, House.phaseDuration, 0, 512, Math.min(House.weatherTimer, House.phaseDuration)));
        House.weatherEmitters[1][1] = Math.imul(House.interpolate(0, House.phaseDuration, 0, 512, Math.min(House.weatherTimer, House.phaseDuration)), House.weatherEmitters[1][0]);
        if (House.weatherTimer === House.phaseDuration) {
          House.weatherPhase = 2;
          House.phaseDuration = House.peakDuration;
          House.weatherTimer = 0;
          break;
        }
        break;
      case 2:
        let halfPhase = ((House.phaseDuration / 2) | 0);
        if (House.weatherTimer < halfPhase) {
          let interp = House.interpolate(0, halfPhase, 512, 1024, (Math.min(House.weatherTimer, halfPhase) + 512));
          House.weatherEmitters[0][1] = Math.imul(House.weatherEmitters[0][0], interp);
          House.weatherEmitters[1][1] = Math.imul(House.weatherEmitters[1][0], interp);
        } else {
          let timerOffset = Math.min((House.weatherTimer - halfPhase), halfPhase);
          let interp = House.interpolate(halfPhase, House.phaseDuration, 1024, 512, (timerOffset + 1024));
          House.weatherEmitters[0][1] = Math.imul(House.weatherEmitters[0][0], interp);
          House.weatherEmitters[1][1] = Math.imul(House.weatherEmitters[1][0], interp);
        }
        if (House.weatherType === 1) {
          House.flashTimer = Math.min((House.flashTimer + dt), House.flashDuration);
          if (House.random(100) === 7) {
            House.flashPeak = 512;
            House.flashStart = 0;
            House.flashTimer = 0;
            House.flashLevel = House.flashPeak;
          }
          if (House.flashLevel > 0) {
            House.flashLevel = House.shiftDecay(House.flashLevel, House.flashTimer, House.flashDuration);
          }
        }
        if (House.weatherTimer === House.phaseDuration) {
          House.weatherPhase = 3;
          House.lightBefore = House.lightLevel;
          House.phaseDuration = House.rampDownDuration;
          House.weatherTimer = 0;
          break;
        }
        break;
      case 3:
        House.lightLevel = House.interpolate(0, House.lightFadeDuration, House.lightBefore, 1024, Math.min(House.weatherTimer, House.lightFadeDuration));
        House.weatherEmitters[0][1] = Math.imul(House.weatherEmitters[0][0], House.interpolate(0, (House.phaseDuration - 1000), 512, 0, Math.min(House.weatherTimer, (House.phaseDuration - 1000))));
        House.weatherEmitters[1][1] = Math.imul(House.interpolate(0, (House.phaseDuration - 1000), 512, 0, Math.min(House.weatherTimer, (House.phaseDuration - 1000))), House.weatherEmitters[1][0]);
        if (House.weatherTimer === House.phaseDuration) {
          House.weatherPhase = 0;
          House.clearWeather();
          return;
        }
        break;
      default:
        return;
    }
    House.updateWeatherParticles(dt);
  }
  static startWeather(weatherType) {
    let iArr;
    let i2;
    if (weatherType === 1) {
      iArr = House.weatherParams;
      i2 = 0;
    } else {
      iArr = House.weatherParams;
      i2 = 1;
    }
    let iArr2 = iArr[i2];
    House.rampUpDuration = (iArr2[0] + House.random((iArr2[1] + 1)));
    House.peakDuration = (iArr2[2] + House.random((iArr2[3] + 1)));
    House.rampDownDuration = (iArr2[4] + House.random((iArr2[5] + 1)));
    House.lightBefore = House.lightLevel;
    House.lightTarget = iArr2[6];
    House.lightFadeDuration = iArr2[7];
    let i3 = iArr2[8];
    let i4 = (House.random(2) - 1);
    House.spawnEffect(0, (300 - i3), 0, Math.imul(i4, iArr2[10]), iArr2[13], iArr2[11], iArr2[11]);
    House.spawnEffect(1, i3, 0, Math.imul(i4, iArr2[15]), iArr2[18], iArr2[16], iArr2[16]);
  }
  loadResources() {
    House.soundPlayer.stopAll();
    if (!House.updateLoadingProgress(0)) {
      return false;
    }
    let i;
    let dis = Resources.openStream(89);
    try {
      this.skylineBandCount = dis.readUnsignedByte();
      House.skylineRects = newInstanceArr('byte', new Int32Array([this.skylineBandCount, 3]));
      House.skylineBounds = newInstanceArr('short', new Int32Array([this.skylineBandCount, 2]));
      this.skylinePaletteSize = dis.readUnsignedByte();
      House.skylineColors = new Int32Array(this.skylinePaletteSize);
      for (i = 0; i < this.skylinePaletteSize; i++) {
        House.skylineColors[i] = dis.readInt();
      }
      for (i = 0; i < this.skylineBandCount; i++) {
        let readUnsignedByte = dis.readUnsignedByte();
        let readUnsignedByte2 = dis.readUnsignedByte();
        let readUnsignedShort = dis.readUnsignedShort();
        let readUnsignedShort2 = dis.readUnsignedShort();
        House.skylineRects[i][0] = ((((((Math.imul(GameMIDlet.screenWidth, readUnsignedByte)) / 176) | 0))) << 24 >> 24);
        House.skylineRects[i][1] = ((Math.max(1, (((((Math.imul(((readUnsignedByte + readUnsignedByte2)), GameMIDlet.screenWidth)) / 176) | 0)) - House.skylineRects[i][0]))) << 24 >> 24);
        House.skylineBounds[i][0] = ((((((Math.imul(((readUnsignedShort << 1)), 32)) / 32) | 0))) << 16 >> 16);
        House.skylineBounds[i][1] = ((Math.max(1, (((((Math.imul(((((readUnsignedShort + readUnsignedShort2)) << 1)), 32)) / 32) | 0)) - House.skylineBounds[i][0]))) << 16 >> 16);
        House.skylineRects[i][2] = ((dis.readUnsignedByte()) << 24 >> 24);
      }
      dis.close();
    } catch (e) {
    }
    if (!House.updateLoadingProgress(10)) {
      return false;
    }
    if (House.floorMesh == null) {
      House.floorMesh = Renderer3D.getModel((House.modelType() + 9), House.RES_3D_MODELS_PACKAGE, true);
      if (!House.updateLoadingProgress(12)) {
        return false;
      }
      House.fallingMesh = Renderer3D.getModel((House.modelType() + 19), House.RES_3D_MODELS_PACKAGE, true);
      if (!House.updateLoadingProgress(13)) {
        return false;
      }
      House.topMesh = Renderer3D.getModel((House.modelType() + 29), House.RES_3D_MODELS_PACKAGE, true);
      if (!House.updateLoadingProgress(14)) {
        return false;
      }
      House.topMeshBonus = Renderer3D.getModel((House.modelType() + 39), House.RES_3D_MODELS_PACKAGE, true);
      let storeTop = CustomTops.gameTop(House.modelType());
      if (storeTop != null) {
        House.topMesh = storeTop;
        House.topMeshBonus = storeTop;
      }
      if (!House.updateLoadingProgress(16)) {
        return false;
      }
      House.groundMesh = Renderer3D.getModel(9, House.RES_3D_MODELS_PACKAGE, true);
      if (!House.updateLoadingProgress(18)) {
        return false;
      }
      House.craneHookMesh = Renderer3D.getModel(8, House.RES_3D_MODELS_PACKAGE, true);
      if (!House.updateLoadingProgress(19)) {
        return false;
      }
      House.craneHookStaticMesh = Renderer3D.getModel(7, House.RES_3D_MODELS_PACKAGE, true);
    }
    if (!House.updateLoadingProgress(20)) {
      return false;
    }
    Resources.getImage(32);
    if (!House.updateLoadingProgress(30)) {
      return false;
    }
    House.levelMedals = Resources.getImage(14);
    House.digitSheetB = Resources.getImage(15);
    House.digitSheetA = Resources.getImage(16);
    House.hudIcons = Resources.getImage(18);
    House.lifeIcons = Resources.getImage(19);
    House.floorCounterFrame = Resources.getImage(20);
    if (!House.updateLoadingProgress(40)) {
      return false;
    }
    try {
      House.fenceContainerSprite = Resources.getImage(33);
      House.fenceChainSprite = Resources.getImage(34);
      House.fenceWoodSprite = Resources.getImage(35);
      House.treeSprite = Resources.getImage(36);
    } catch (e) {
      console.error(e);
    }
    if (!House.updateLoadingProgress(50)) {
      return false;
    }
    House.flyerFrames = new Array(28).fill(null);
    let imageIndex = 0;
    while (imageIndex < 28) {
      let iArr;
      let i2;
      House.flyerFrames[imageIndex] = Resources.getImage(House.flyerImageIds[imageIndex]);
      if (House.flyerFrames[imageIndex] != null) {
        i = (((Math.imul(Math.max(House.flyerFrames[imageIndex].getHeight(), House.flyerFrames[imageIndex].getWidth()), 256)) / 32) | 0);
        iArr = House.flyerSizes;
        i2 = imageIndex;
      } else {
        i2 = imageIndex;
        iArr = House.flyerSizes;
        i = 1;
      }
      iArr[i2] = i;
      if ((imageIndex === 5) || (imageIndex === 11)) {
        let iArr2 = House.flyerSizes;
        iArr2[imageIndex] = ((iArr2[imageIndex] / 2) | 0);
      }
      imageIndex++;
    }
    if (!House.updateLoadingProgress(60)) {
      return false;
    }
    House.sparkSprite = Resources.getImage(37);
    if (!House.updateLoadingProgress(70)) {
      return false;
    }
    House.fenceHeight = House.fenceContainerSprite.getHeight();
    House.fenceContainerWidth = House.fenceContainerSprite.getWidth();
    House.fenceWoodWidth = House.fenceWoodSprite.getWidth();
    House.fenceChainWidth = House.fenceChainSprite.getWidth();
    House.treeWidth = House.treeSprite.getWidth();
    House.craneArmSprite = Resources.getImage(41);
    House.comboStarSprite = Resources.getImage(38);
    House.comboSparkleSprite = Resources.getImage(39);
    if (!House.updateLoadingProgress(80)) {
      return false;
    }
    House.waterSplashSprite = Resources.getImage(40);
    System.gc();
    this.resetTiming();
    return House.updateLoadingProgress(100);
  }
  static unloadModels() {
    House.floorMesh = null;
    House.topMesh = null;
    House.fallingMesh = null;
    House.topMeshBonus = null;
    House.groundMesh = null;
    House.craneHookMesh = null;
    House.craneHookStaticMesh = null;
    House.skylineRects = null;
    House.skylineBounds = null;
    House.skylineColors = null;
    House.levelMedals = null;
    House.digitSheetB = null;
    House.digitSheetA = null;
    House.hudIcons = null;
    House.lifeIcons = null;
    House.floorCounterFrame = null;
    House.fenceContainerSprite = null;
    House.fenceChainSprite = null;
    House.fenceWoodSprite = null;
    House.treeSprite = null;
    House.sparkSprite = null;
    System.gc();
    House.waterSplashSprite = null;
  }
  static updateWeatherParticles(dt) {
    let i2 = 0;
    let i3 = 0;
    while (i2 < 2) {
      let iArr = House.weatherEmitters[i2];
      iArr[2] = (iArr[2] + (Math.imul((((((((Math.imul(iArr[1], iArr[4])) / 2) | 0)) / House.weatherAreaHeight) | 0)), dt)));
      for (let i4 = 0; i4 < iArr[0]; i4++) {
        let iArr3 = House.weatherParticles[(i4 + i3)];
        if (iArr3[0] === 1) {
          let i5 = ((((Math.imul(House.camY, 256)) >> 8)) + 384);
          iArr3[1] = (iArr3[1] + (Math.imul(iArr3[5], dt)));
          iArr3[2] = (iArr3[2] + (Math.imul(iArr3[6], dt)));
          switch (House.weatherType) {
            case 2:
              iArr3[4] = (iArr3[4] + (Math.imul((((Math.imul(((3 - iArr3[3])), 90)) + 90)), dt)));
              iArr3[4] = (iArr3[4] % 368640);
              iArr3[1] = (iArr3[1] + (((Math.imul((Math.imul(iArr3[3], 64)), House.sin((iArr3[4] >> 10)))) >> 15)));
              break;
          }
          if (iArr3[2] > House.weatherAreaHeight) {
            iArr3[0] = 0;
          } else if ((i5 < 1024) && (iArr3[2] > (((Math.imul(i5, House.weatherAreaHeight)) / 1024) | 0))) {
            iArr3[0] = 0;
          } else if (iArr3[1] < 0) {
            iArr3[1] = House.weatherAreaWidth;
          } else if (iArr3[1] > House.weatherAreaWidth) {
            iArr3[1] = 0;
          }
        } else if (iArr[2] >= 1024) {
          let i5 = (iArr[5] + 1);
          let i7 = (iArr[6] + 1);
          iArr3[0] = 1;
          iArr3[1] = House.random(House.weatherAreaWidth);
          iArr3[2] = 0;
          iArr3[3] = House.random(4);
          iArr3[4] = House.random(368640);
          iArr3[5] = ((((((iArr[3] + House.random(i5))) - (((i5 / 2) | 0)))) / ((4 - iArr3[3]))) | 0);
          iArr3[6] = ((((((iArr[4] + House.random(i7))) - (((i7 / 2) | 0)))) / ((4 - iArr3[3]))) | 0);
          iArr[2] = (iArr[2] - 1024);
        }
      }
      i2++;
      i3 += iArr[0];
    }
  }
  initScreenLayout() {
    let i;
    House.centerX = (GameMIDlet.screenWidth >> 1);
    House.centerY = (((GameMIDlet.screenHeight >> 1)) + 0);
    House.viewWidthUnits = (((Math.imul(GameMIDlet.screenWidth, 256)) / 32) | 0);
    House.viewHeightUnits = (((Math.imul(GameMIDlet.screenHeight, 256)) / 32) | 0);
    House.loadingImage = Resources.getImage(9);
    House.arrowSprite = Resources.getImage(0);
    if (House.citizenSpriteA == null) {
      House.citizenSpriteA = Resources.getImage(12);
    }
    if (House.citizenSpriteB == null) {
      House.citizenSpriteB = Resources.getImage(13);
    }
    if (House.cloudLargeSprite == null) {
      House.cloudLargeSprite = Resources.getImage(69);
    }
    if (House.cloudSmallSprite == null) {
      House.cloudSmallSprite = Resources.getImage(70);
    }
    if (House.flyerFrames == null) {
      House.flyerFrames = new Array(28).fill(null);
    }
    if (House.flyerFrames[3] == null) {
      House.flyerFrames[3] = Resources.getImage(45);
    }
    House.skyStage = -1;
    let i2 = 0;
    let i3 = 0;
    for (i = 0; i <= 6; i++) {
      House.jumpArcX[i] = i2;
      House.jumpArcY[i] = i3;
      i2 += (i + 5);
      i3 += (5 - i);
    }
    House.hudX = ((GameMIDlet.screenWidth / 20) | 0);
    House.hudHeight = ((GameMIDlet.screenHeight / 15) | 0);
    this.skylineSegmentCount = 24;
    this.skylineSegmentCount = 13;
    House.skylineSegments = newInstanceArr('short', new Int32Array([2, this.skylineSegmentCount]));
    for (i = 0; i < this.skylineSegmentCount; i++) {
      let s = (((Math.imul((((i / 5) | 0)), 45))) << 16 >> 16);
      House.skylineSegments[0][i] = (((Math.imul(((i % 5)), 45))) << 16 >> 16);
      House.skylineSegments[1][i] = s;
    }
    House.camZ = 128;
    for (i = GameMIDlet.screenHeight; i > 48; i = (((Renderer3D.projected[1] - ((0.5 * (GameMIDlet.screenHeight))))) | 0)) {
      House.camZ += 100;
      Renderer3D.lookAt(0.0, 0.0, House.camZ, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0);
      Renderer3D.projected[0] = 0.0;
      Renderer3D.projected[1] = -384.0;
      Renderer3D.projected[2] = 128.0;
      Renderer3D.projected[3] = 1.0;
      Renderer3D.project(Renderer3D.projected);
    }
    House.skyStageLength = Math.max(House.viewHeightUnits, 2048);
    House.scoreThresholds = new Int32Array([70, 250, 550, 1000, 1500]);
    this.onLoad();
    if (House.hasSavedGame(3)) {
      House.hasCitySave = true;
    }
    if (House.hasSavedGame(1)) {
      House.hasQuickSave = true;
    }
  }
  static spawnFlyer(flyerType) {
    let i2 = 0;
    let i3 = 0;
    while (i3 <= 28) {
      if (((House.skyStage >= House.flyerTable[0][i3]) && (House.skyStage < House.flyerTable[1][i3])) && (((((House.flyerCounts[i3] > 0) || (House.flyerCounts[i3] === -1))) && (House.random(100) < House.flyerTable[2][i3])))) {
        i2 = i3;
        break;
      }
      i3++;
    }
    if (i2 === 0) {
      House.flyers[flyerType][0] = i2;
      House.flyers[flyerType][3] = (((House.gameTime + 1000)) + House.random(2500));
      return;
    }
    let iArr;
    let i4;
    let iArr2 = House.flyerCounts;
    iArr2[i2] = (iArr2[i2] - 1);
    if ((House.flyerTable[3][i2] === 0) || (House.random(2) === 0)) {
      House.flyers[flyerType][1] = House.random(House.viewWidthUnits);
      iArr = House.flyers[flyerType];
      i4 = (House.flyerSizes[(i2 - 1)] + ((((Math.imul(House.camY, 3)) / 4) | 0)));
      i3 = 512;
    } else {
      if (House.flyerTable[3][i2] > 0) {
        i3 = (0 - House.flyerSizes[(i2 - 1)]);
      } else {
        i3 = (House.viewWidthUnits + House.flyerSizes[(i2 - 1)]);
      }
      House.flyers[flyerType][1] = i3;
      iArr = House.flyers[flyerType];
      i4 = (((((((Math.imul(House.camY, 3)) / 4) | 0)) - ((House.viewHeightUnits >> 1)))) - 512);
      i3 = 1024;
    }
    iArr[2] = (House.random(i3) + i4);
    House.flyers[flyerType][0] = i2;
  }
  static updateCamera() {
    if (House.camY < House.camTargetY) {
      House.camY = Math.min(House.camTargetY, (House.camTargetY + ((((Math.imul(((((House.gameTime - House.camEaseStart)) - 500)), 256)) / 500) | 0))));
      if ((House.phase !== House.PHASE_ROOF) && (House.phase !== House.PHASE_INTRO)) {
        House.pivotY = ((House.camY + 1792) + 128);
      }
    } else if (House.camY > House.camTargetY) {
      House.camY = Math.max(House.camTargetY, (House.camTargetY - ((((Math.imul(((((House.gameTime - House.camEaseStart)) - 500)), 256)) / 500) | 0))));
      House.skylineStart = 0;
      if ((House.phase !== House.PHASE_ROOF) && (House.phase !== House.PHASE_INTRO)) {
        House.pivotY = ((House.camY + 1792) + 128);
      }
    }
    if ((House.gameTime - House.lastHitTime) < 800) {
      House.camY = (((House.camY + 32)) - House.random(64));
    }
  }
  static addScore(points) {
    let i2;
    if (House.phase === House.PHASE_ROOF) {
      i2 = (House.score + points);
    } else if (points > 0) {
      if (House.comboTimer > 0) {
        House.comboBonus += Math.imul(House.comboCount, (((Math.imul((((House.blockCount / 10) | 0)), 2)) + 2)));
      }
      i2 = (House.score + (((((House.blockCount / 10) | 0)) + points)));
    } else {
      i2 = (House.score - (((((House.blockCount / 10) | 0)) - points)));
    }
    House.score = i2;
  }
  static layoutTower() {
    let i = (House.scrolledOffsetSum + House.swayOffset);
    let max = Math.max(0, (House.blockCount - 5));
    let i2 = ((Math.imul(((max - 1)), 256)) + 128);
    let i3 = 0;
    let i4 = 0;
    while (max < House.blockCount) {
      let i5;
      let i6;
      let iArr;
      let b = House.landingOffsets[(max % 20)];
      if (House.swayCos > 0) {
        if (b < ((0) << 24 >> 24)) {
          i5 = Math.imul((Math.imul(House.towerInstability, b)), House.swayCos);
          i6 = 29491200;
        } else {
          i6 = (-(Math.imul((Math.imul(House.towerInstability, b)), House.swayCos)));
          i5 = i6;
          i6 = 58982400;
        }
      } else if (b > ((0) << 24 >> 24)) {
        i5 = (-(Math.imul((Math.imul(House.towerInstability, b)), House.swayCos)));
        i6 = 29491200;
      } else {
        i6 = Math.imul((Math.imul(House.towerInstability, b)), House.swayCos);
        i5 = i6;
        i6 = 58982400;
      }
      i6 = ((i5 / i6) | 0);
      if ((max === (House.blockCount - 1)) && (max !== (House.blockGoal - 1))) {
        i5 = (House.gameTime - House.lastLandTime);
        if (i5 < 100) {
          i3 = ((((((i3 / 8) | 0)) + (((b / 6) | 0)))) + ((((Math.imul(i5, b)) / 600) | 0)));
        } else if (i5 < 500) {
          i3 = ((((((i3 / 8) | 0)) + (((b / 6) | 0)))) + ((((Math.imul(((400 - ((i5 - 100)))), b)) / 2400) | 0)));
          House.landingBounce = i3;
        } else if (i5 < 800) {
          i3 = (House.landingBounce - ((((Math.imul(((House.landingBounce - i3)), ((i5 - 500)))) / 300) | 0)));
        }
      }
      i3 += i6;
      let i7 = ((House.swayCos > 0) ? (i3 >> 1) : (-((i3 >> 1))));
      if (max === 0) {
        i6 = -999;
        iArr = House.floorAngle;
        i5 = 0;
      } else if (((House.phase === House.PHASE_ROUND_OVER) && (max === (House.blockCount - 1))) && (House.landingQuality !== 0)) {
        iArr = House.floorAngle;
        i5 = 4;
        i6 = -888;
      } else {
        i5 = i4;
        iArr = House.floorAngle;
        i6 = i3;
      }
      iArr[i5] = i6;
      i += ((Math.imul(i3, 2)) + b);
      House.floorX[i4] = i;
      House.floorY[i4] = (((i2 + i7)) + 256);
      i2 = House.floorY[i4];
      i4++;
      max++;
    }
  }
  static changeFloorCount(delta) {
    let abs;
    let i2;
    let i3 = 128;
    if (delta < 0) {
      abs = Math.abs(House.landingOffsets[(((House.blockCount - 1)) % 20)]);
      abs = ((abs < 25) ? -4 : ((abs < 50) ? -3 : ((abs < 80) ? -2 : -1)));
      House.addScore(abs);
    }
    if ((delta > 0) && (House.blockCount > 4)) {
      House.scrolledOffsetSum += House.landingOffsets[(House.bottomFloor % 20)];
    } else if (delta < 0) {
      House.offsetSum -= House.landingOffsets[(((House.blockCount - 1)) % 20)];
    }
    House.blockCount += delta;
    House.bottomFloor = Math.max(0, (House.blockCount - 5));
    House.topFloorSlot = Math.min(4, (House.blockCount - 1));
    if (delta < 0) {
      House.scrolledOffsetSum -= House.landingOffsets[(House.bottomFloor % 20)];
    }
    House.towerInstability = 0;
    for (abs = House.bottomFloor; abs < House.blockCount; abs++) {
      House.towerInstability += Math.abs(House.landingOffsets[(abs % 20)]);
    }
    House.towerInstability = ((House.towerInstability / 5) | 0);
    House.towerInstability = Math.min((((Math.imul(House.blockCount, House.towerInstability)) / 20) | 0), 100);
    House.swayAmplitude = Math.min(((((House.blockCount / 2) | 0)) + (((Math.abs(House.offsetSum) / 20) | 0))), (((Math.imul(House.blockCount, (((((House.blockCount / 2) | 0)) + (((Math.abs(House.offsetSum) / 20) | 0)))))) / 6) | 0));
    if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
      i2 = Math.max(1, House.swingPeriod);
      abs = House.towerType;
      House.swingPeriod = (House.swingPeriodTable[abs] - ((((Math.imul(House.blockCount, ((House.swingPeriodTable[abs] - House.swingPeriodTable[(abs + 2)])))) / Math.max(1, House.blockGoal)) | 0)));
      House.swingAmplitudeX = Math.min(House.swingAmplitudeXByType[abs], (House.swingAmplitudeXByType[1] + ((((Math.imul(House.blockCount, ((House.swingAmplitudeXByType[abs] - House.swingAmplitudeXByType[1])))) / ((House.blockGoal >> 1))) | 0))));
      House.swingAmplitudeY = Math.min(House.swingAmplitudeYByType[abs], (((((Math.imul(((House.swingAmplitudeYByType[abs] - House.swingAmplitudeYByType[1])), House.blockCount)) / ((House.blockGoal >> 1))) | 0)) + House.swingAmplitudeYByType[1]));
      abs = (((Math.imul(House.blockCount, 256)) / 100) | 0);
    } else {
      i2 = Math.max(1, House.swingPeriod);
      House.swingAmplitudeX = Math.min(House.swingAmplitudeXByType[House.towerType], (House.swingAmplitudeXByType[0] + ((((Math.imul(House.blockCount, ((House.swingAmplitudeXByType[House.towerType] - House.swingAmplitudeXByType[0])))) / 60) | 0))));
      House.swingAmplitudeY = Math.min(House.swingAmplitudeYByType[House.towerType], (House.swingAmplitudeYByType[0] + ((((Math.imul(House.blockCount, ((House.swingAmplitudeYByType[House.towerType] - House.swingAmplitudeYByType[0])))) / 60) | 0))));
      if (House.blockCount < 100) {
        House.craneYOffset = (-Math.min(128, (((Math.imul(House.blockCount, 256)) / 200) | 0)));
        House.swingPeriod = Math.max(House.swingPeriodTable[(House.towerType + 2)], (House.swingPeriodTable[0] - ((((Math.imul(House.blockCount, ((House.swingPeriodTable[0] - House.swingPeriodTable[(House.towerType + 2)])))) / 100) | 0))));
        House.craneTime = (((Math.imul(House.craneTime, House.swingPeriod)) / Math.max(1, i2)) | 0);
        if ((House.phase !== House.PHASE_ROOF) && (House.phase !== House.PHASE_INTRO)) {
          House.raiseCamera(Math.imul(delta, 256));
          return;
        }
      }
      House.swingPeriod = (House.swingPeriodTable[(House.towerType + 1)] - ((((Math.imul(((House.blockCount - 100)), 100)) / 150) | 0)));
      i3 = 256;
      abs = (((((Math.imul(((House.blockCount - 100)), 256)) / 300) | 0)) + 128);
    }
    House.craneYOffset = (-Math.min(i3, abs));
    House.craneTime = (((Math.imul(House.craneTime, House.swingPeriod)) / Math.max(1, i2)) | 0);
    if ((House.phase !== House.PHASE_ROOF) && (House.phase !== House.PHASE_INTRO)) {
      House.raiseCamera(Math.imul(delta, 256));
    }
  }
  onInit() {
    House.initSinTable();
    let strArr = [this.canvas.getKeyName(52), this.canvas.getKeyName(54), this.canvas.getKeyName(50), this.canvas.getKeyName(56), this.canvas.getKeyName(53)];
  }
  update(delta, totalTime) {
    if (this.pendingModeChange === 0) {
      let i3 = 0;
      if (House.screenState === 7) {
        if (House.hasCitySave || House.hasQuickSave) {
          House.floorMesh = null;
          House.topMesh = null;
          House.fallingMesh = null;
          House.topMeshBonus = null;
          House.groundMesh = null;
          House.craneHookMesh = null;
          House.craneHookStaticMesh = null;
        }
        if (House.nextScreenState === 2) {
          House.updateLoadingProgress(5);
          if (House.cityInitPending) {
            House.cityInitPending = false;
            if (!House.cityInitialized) {
              CityMode.init();
              House.updateLoadingProgress(10);
              House.cityInitialized = true;
            }
            if (!CityMode.towerGameActive) {
              CityMode.enterCity();
            }
          }
          House.unloadModels();
          House.updateLoadingProgress(15);
          if (CityMode.loadAssets()) {
            this.resetTiming();
            this.sound.play(House.AUDIO_CITY_THEME, -1);
            House.screenState = House.nextScreenState;
            House.roundFinishedCity = false;
            House.roundFinishedQuick = false;
          } else {
            return;
          }
        }
        if (House.nextScreenState !== 2) {
          CityMode.unloadAssets();
          if (this.loadResources()) {
            House.skyStage = -1;
            this.resetTiming();
            if (!((House.roundFinishedCity && House.roundFinishedQuick))) {
              this.sound.play(House.AUDIO_TOWER_THEME, -1);
            }
            if (House.gameMode === House.GAME_MODE_QUICK) {
              if (House.roundFinishedQuick) {
                if (!House.newRecord) {
                  House.soundPlayer.play(House.SFX_GOOD_DROP, 1);
                }
                if (House.newRecord) {
                  House.soundPlayer.play(House.SFX_PERFECT_DROP, 1);
                }
              }
              if (House.progress[1] === 0) {
                House.showPrompt(Resources.getString$2(34, ["3"]), null, null);
                i3 = 4;
              } else {
                i3 = House.nextScreenState;
              }
            } else {
              if (House.roundFinishedCity) {
                let oVar;
                if (House.landingQuality === 0) {
                  oVar = House.soundPlayer;
                  i3 = -2147483565;
                } else if (House.landingQuality === 2) {
                  oVar = House.soundPlayer;
                  i3 = -2147483563;
                } else {
                  oVar = House.soundPlayer;
                  i3 = -2147483564;
                }
                oVar.play(i3, 1);
              }
              if (House.progress[0] === 0) {
                House.showPrompt(Resources.getString$2(55, ["3"]), null, null);
                i3 = 4;
                House.phase = House.PHASE_INTRO;
              } else {
                i3 = House.nextScreenState;
              }
            }
            House.screenState = i3;
          } else {
            return;
          }
        }
      }
      i3 = ((delta > 150) ? 150 : delta);
      if (House.screenState === 2) {
        House.gameTime += i3;
        CityMode.update(i3, delta);
        if (CityMode.consumeHighScoreFlag() && !CityMode.isCheatActive()) {
          this.highScores.submitScore(0, new Int32Array([CityMode.getPopulation(), 0]), "-");
        }
        if (CityMode.isTowerGameActive()) {
          let z;
          House.towerType = CityMode.getBuildingTowerType();
          if (House.towerType > 5) {
            House.towerType -= 5;
            z = true;
          } else {
            z = false;
          }
          House.pinkTower = (House.towerType === 5);
          if (House.pinkTower) {
            House.towerType = 4;
          }
          House.bonusEligible = z;
          House.blockGoal = (House.pinkTower ? House.PINK_BLOCK_GOAL : House.goalByTowerType[(House.towerType - 1)]);
          House.initArrays();
          House.screenState = 7;
          House.nextScreenState = 1;
          return;
        }
        return;
      }
      this.handleInput();
      if ((House.phase === House.PHASE_ROUND_OVER) && ((House.gameTime - House.fallStartTime) > 2000)) {
        if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
          House.roundFinishedCity = true;
          House.soundPlayer.stopAll();
          if (House.landingQuality === 0) {
            House.soundPlayer.play(House.SFX_MISS_DROP, 1);
            House.showPrompt(Resources.getString$1(56), null, null);
            House.screenState = 5;
          } else if (House.landingQuality === 2) {
            House.soundPlayer.play(House.SFX_PERFECT_DROP, 1);
            House.showPrompt(Resources.getString$1(57), null, null);
            House.screenState = 5;
          } else {
            House.soundPlayer.play(House.SFX_GOOD_DROP, 1);
            this.buildResultText(false);
          }
        } else {
          House.roundFinishedQuick = true;
          House.soundPlayer.stopAll();
          this.buildResultText(true);
          if (!House.newRecord) {
            House.soundPlayer.play(House.SFX_GOOD_DROP, 1);
          }
          if (House.newRecord) {
            House.soundPlayer.play(House.SFX_PERFECT_DROP, 1);
          }
        }
        House.phase = House.PHASE_RESULT;
      }
      this.physicsAccumulatorMs = (i3 + this.physicsAccumulatorMs);
      if (this.physicsAccumulatorMs >= 25) {
        House.gameTime += this.physicsAccumulatorMs;
        if ((((House.screenState === 4) || (House.screenState === 6)) || (House.screenState === 5)) || (House.screenState === 8)) {
          this.physicsAccumulatorMs = 0;
          return;
        }
        if (House.freeCamera) {
          House.updateFreeCamera(this.physicsAccumulatorMs);
        } else {
          House.updateCamera();
        }
        House.updateWeather(this.physicsAccumulatorMs);
        House.updateFlyers();
        House.updateCrane(this.physicsAccumulatorMs);
        House.updateBlockPhysics(this.physicsAccumulatorMs);
        House.updateTowerSway(this.physicsAccumulatorMs);
        House.layoutTower();
        House.updateCitizens();
        if (House.comboTimer > 0) {
          House.comboTimer = (((House.comboTimer - this.physicsAccumulatorMs)) - ((((Math.imul(((House.comboCount - 1)), this.physicsAccumulatorMs)) / 6) | 0)));
          if (House.comboTimer <= 0) {
            House.cashInCombo();
          }
        } else if (House.comboTimer > -2000) {
          House.comboTimer -= this.physicsAccumulatorMs;
        }
        this.physicsAccumulatorMs = 0;
      }
    }
  }
  commandAction(command) {
    if (command === this.softKeyCommand) {
      if (House.screenState === 7) {
        House.loadCancelled = true;
      }
      this.pendingModeChange = 2;
      this.soundEnabled = false;
    }
  }
  paintLoading(g) {
    if (this.loadingNeedsRepaint) {
      let image = null;
      if (this.loadingScreenType === 0) {
        House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        g.setColor(-1);
        g.fillRect(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        if (this.splashImage != null) {
          image = this.splashImage;
        }
        this.loadingNeedsRepaint = false;
      }
      if (this.loadingScreenType === 1) {
        House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        g.setColor(10143978);
        g.fillRect(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        if (House.cloudLargeSprite == null) {
          House.cloudLargeSprite = Resources.getImage(69);
        }
        if (House.cloudSmallSprite == null) {
          House.cloudSmallSprite = Resources.getImage(70);
        }
        if (House.citizenSpriteA == null) {
          House.citizenSpriteA = Resources.getImage(12);
        }
        if (House.citizenSpriteB == null) {
          House.citizenSpriteB = Resources.getImage(13);
        }
        if (House.flyerFrames == null) {
          House.flyerFrames = new Array(28).fill(null);
          if (House.flyerFrames[3] == null) {
            House.flyerFrames[3] = Resources.getImage(45);
          }
        }
        House.setClipRect(g, (GameMIDlet.screenWidth >> 1), 30, House.flyerFrames[3].getWidth(), House.flyerFrames[3].getHeight());
        g.drawImage(House.flyerFrames[3], (GameMIDlet.screenWidth >> 1), 30, 20);
        House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        House.setClipRect(g, 10, 40, House.cloudSmallSprite.getWidth(), House.cloudSmallSprite.getHeight());
        g.drawImage(House.cloudSmallSprite, 10, 40, 20);
        House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        House.setClipRect(g, (GameMIDlet.screenWidth - 80), 60, House.cloudLargeSprite.getWidth(), House.cloudLargeSprite.getHeight());
        g.drawImage(House.cloudLargeSprite, (GameMIDlet.screenWidth - 80), 60, 20);
        House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        House.drawCitizen(g, 20, (GameMIDlet.screenHeight - 40), 4, 1, 1);
        House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        House.drawCitizen(g, 80, (GameMIDlet.screenHeight - 50), 1, -1, 0);
        House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        House.drawCitizen(g, 20, 50, 2, -1, 0);
        House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        House.setClipRect(g, (GameMIDlet.screenWidth - 60), (GameMIDlet.screenHeight - 40), House.cloudSmallSprite.getWidth(), House.cloudSmallSprite.getHeight());
        g.drawImage(House.cloudSmallSprite, (GameMIDlet.screenWidth - 60), (GameMIDlet.screenHeight - 40), 20);
        House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        if (this.titleLogoImage != null) {
          image = this.titleLogoImage;
        }
      }
      this.loadingNeedsRepaint = false;
      if (image != null) {
        g.drawImage(image, (GameMIDlet.screenWidth >> 1), (GameMIDlet.screenHeight >> 1), 3);
      }
      this.loadingNeedsRepaint = false;
    }
  }
  paint(g, fullRedraw) {
    if (this.pendingModeChange === 0) {
      if (House.screenState === 7) {
        House.paintLoadingScreen(g);
        return;
      }
      g.setFont(House.gameFont);
      if (House.screenState === 2) {
        if (CityMode.assetsLoaded) {
          CityMode.paint(g);
        } else if (House.loadingImage != null) {
          House.paintLoadingScreen(g);
        } else {
          g.setColor(0);
          g.fillRect(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        }
        return;
      }
      if ((((House.skylineRects == null) || (House.skylineBounds == null)) || (House.clouds == null)) || (House.flyers == null)) {
        if (House.loadingImage != null) {
          House.paintLoadingScreen(g);
        } else {
          g.setColor(0);
          g.fillRect(0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
        }
        return;
      }
      House.paintScenery(g);
      House.paintWeatherLayer(g, false);
      if (House.phase === House.PHASE_ROOF) {
        House.blockAngle[0] = 888;
      }
      if (House.phase === House.PHASE_INTRO) {
        House.blockAngle[0] = 999;
      }
      this.render3D(g);
      House.paintWeatherLayer(g, true);
      House.paintPerfectEffect(g);
      House.paintCitizens(g);
      if (House.blockCount > 5) {
        for (let i = 0; i < 5; i++) {
          if ((House.gameTime - House.lostBlocks[1][i]) < 300) {
            let i2 = House.lostBlocks[0][i];
            let i3 = ((((House.gameTime - House.lostBlocks[1][i])) / 100) | 0);
            House.setClipRect(g, (i2 - 11), (GameMIDlet.screenHeight - 34), 23, 34);
            g.drawImage(House.waterSplashSprite, (((i2 - 11)) - (Math.imul(i3, 23))), (GameMIDlet.screenHeight - 34), 20);
          }
        }
      }
      House.paintHud(g);
      if ((((House.screenState === 4) || (House.screenState === 6)) || (House.screenState === 5)) || (House.screenState === 8)) {
        House.paintTutorialModal(g);
      }
    }
  }
  onPause() {
    House.loadCancelled = true;
    this.pendingModeChange = 2;
  }
  clearSavedGame(saveSlotOrGameMode) {
    let i2 = 0;
    if (saveSlotOrGameMode === 3) {
      i2 = 8;
    } else if (saveSlotOrGameMode === 1) {
      i2 = 9;
      this.saveSettings();
    }
    Storage.setMenuFlag(i2, 1);
    Storage.setSetting(10, 0);
    this.saveSettings();
  }
  keyPressed(keyCode, gameAction) {
    if (House.screenState === 2) {
      CityMode.handleKeyPressed(keyCode, gameAction);
      return;
    }
    if ((keyCode === 35) && CityMode.isCheatActive()) {
      House.phase = House.PHASE_ROUND_OVER;
    }
    if (this.loadingScreenType !== -1) {
      this.loadingKeyPressed = true;
      return;
    }
    if (House.screenState === 7) {
      return;
    }
    if (keyCode === 104) {
      House.freeCamera = !House.freeCamera;
      House.clearKeys();
      House.clearCamKeys();
      if (House.freeCamera) {
        House.savedCamX = House.camX;
        House.savedCamY = House.camY;
        House.savedCamZ = House.camZ;
        House.camYaw = 0;
        House.camPitch = 0;
      } else {
        House.camX = House.savedCamX;
        House.camY = House.savedCamY;
        House.camZ = House.savedCamZ;
        House.camYaw = 0;
        House.camPitch = 0;
      }
      return;
    }
    if (House.freeCamera) {
      if (keyCode === 50) {
        House.camKeyW = true;
      } else if (keyCode === 56) {
        House.camKeyS = true;
      } else if (keyCode === 52) {
        House.camKeyA = true;
      } else if (keyCode === 54) {
        House.camKeyD = true;
      } else if (keyCode === 100) {
        House.camKeyQ = true;
      } else if (keyCode === 101) {
        House.camKeyE = true;
      } else if (keyCode === 102) {
        House.camKeyZ = true;
      } else if (keyCode === 103) {
        House.camKeyX = true;
      }
      return;
    }
    let e = House.mapKey(keyCode, gameAction);
    if (e === 0) {
      House.inputSelect = true;
    } else if (e === 1) {
      House.inputUp = true;
    } else if (e === 2) {
      House.inputDown = true;
    }
  }
  static clearCamKeys() {
    House.camKeyW = House.camKeyA = House.camKeyS = House.camKeyD = false;
    House.camKeyQ = House.camKeyE = House.camKeyZ = House.camKeyX = false;
  }
  static applyCameraLook() {
    let yawRad = (House.camYaw * Math.PI / 180);
    let pitchRad = (House.camPitch * Math.PI / 180);
    let cosP = Math.cos(pitchRad);
    let dx = ((Math.sin(yawRad) * cosP));
    let dy = Math.sin(pitchRad);
    let dz = (((-Math.cos(yawRad)) * cosP));
    Renderer3D.lookAt(House.camX, House.camY, House.camZ, dx, dy, dz, 0.0, 1.0, 0.0);
  }
  static updateFreeCamera(dt) {
    let yawRad = (House.camYaw * Math.PI / 180);
    let pitchRad = (House.camPitch * Math.PI / 180);
    let cosP = Math.cos(pitchRad);
    let fx = ((Math.sin(yawRad) * cosP));
    let fy = Math.sin(pitchRad);
    let fz = (((-Math.cos(yawRad)) * cosP));
    let rx = Math.cos(yawRad);
    let rz = Math.sin(yawRad);
    let move = (House.CAM_MOVE_PER_MS * dt);
    let rot = (House.CAM_ROTATE_PER_MS * dt);
    if (House.camKeyW) {
      House.camX = ((House.camX + (fx * move)) | 0);
      House.camY = ((House.camY + (fy * move)) | 0);
      House.camZ = ((House.camZ + (fz * move)) | 0);
    }
    if (House.camKeyS) {
      House.camX = ((House.camX - (fx * move)) | 0);
      House.camY = ((House.camY - (fy * move)) | 0);
      House.camZ = ((House.camZ - (fz * move)) | 0);
    }
    if (House.camKeyD) {
      House.camX = ((House.camX + (rx * move)) | 0);
      House.camZ = ((House.camZ + (rz * move)) | 0);
    }
    if (House.camKeyA) {
      House.camX = ((House.camX - (rx * move)) | 0);
      House.camZ = ((House.camZ - (rz * move)) | 0);
    }
    if (House.camKeyQ) {
      House.camYaw -= rot;
    }
    if (House.camKeyE) {
      House.camYaw += rot;
    }
    if (House.camKeyZ) {
      House.camPitch -= rot;
    }
    if (House.camKeyX) {
      House.camPitch += rot;
    }
    if (House.camPitch > House.CAM_PITCH_LIMIT) {
      House.camPitch = House.CAM_PITCH_LIMIT;
    }
    if (House.camPitch < (-House.CAM_PITCH_LIMIT)) {
      House.camPitch = (-House.CAM_PITCH_LIMIT);
    }
    while (House.camYaw >= 360) {
      House.camYaw -= 360;
    }
    while (House.camYaw < 0) {
      House.camYaw += 360;
    }
  }
  paintBackground(g) {
    let i;
    let i2;
    let i3;
    if (House.flyerFrames[3] == null) {
      House.flyerFrames[3] = Resources.getImage(45);
    }
    if (House.menuCloudInit == null) {
      House.menuCloudInit = new Int32Array(20);
      for (i = 0; i < ((House.menuCloudInit.length / 5) | 0); i++) {
        House.menuCloudInit[((Math.imul(i, 5)) + 1)] = House.viewHeightUnits;
      }
    }
    House.paintSky(g, ((Math.imul(House.loadingScroll, 32)) >> 8), true, false);
    for (i = 0; i < ((House.menuClouds.length / 5) | 0); i++) {
      if (House.menuClouds[((Math.imul(i, 5)) + 4)] === 0) {
        i2 = ((Math.imul(House.menuClouds[((Math.imul(i, 5)) + 0)], 32)) >> 8);
        i3 = ((Math.imul(House.menuClouds[((Math.imul(i, 5)) + 1)], 32)) >> 8);
        House.setClipRect(g, i2, i3, House.cloudSmallSprite.getWidth(), House.cloudSmallSprite.getHeight());
        g.drawImage(House.cloudSmallSprite, i2, i3, 20);
      }
    }
    for (i = 0; i < ((House.menuClouds.length / 5) | 0); i++) {
      if (House.menuClouds[((Math.imul(i, 5)) + 4)] === 1) {
        i2 = ((Math.imul(House.menuClouds[((Math.imul(i, 5)) + 0)], 32)) >> 8);
        i3 = ((Math.imul(House.menuClouds[((Math.imul(i, 5)) + 1)], 32)) >> 8);
        House.setClipRect(g, i2, i3, House.cloudLargeSprite.getWidth(), House.cloudLargeSprite.getHeight());
        g.drawImage(House.cloudLargeSprite, i2, i3, 20);
      }
    }
    for (let i4 = 0; i4 < ((House.menuCitizens.length / 6) | 0); i4++) {
      i2 = ((Math.imul(House.menuCitizens[((Math.imul(i4, 6)) + 0)], 32)) >> 8);
      i3 = ((Math.imul(House.menuCitizens[((Math.imul(i4, 6)) + 1)], 32)) >> 8);
      let i5 = (House.menuCitizens[((Math.imul(i4, 6)) + 2)] + 1);
      if (i5 > 5) {
        i5 = (5 - ((i5 - 5)));
      }
      House.drawCitizen(g, i2, i3, i5, ((House.menuCitizens[((Math.imul(i4, 6)) + 3)] < 0) ? -1 : 1), House.menuCitizens[((Math.imul(i4, 6)) + 5)]);
    }
    for (i = 0; i < ((House.menuCloudInit.length / 5) | 0); i++) {
      i2 = ((Math.imul(House.menuCloudInit[((Math.imul(i, 5)) + 0)], 32)) >> 8);
      i3 = (((GameMIDlet.screenHeight - (Math.imul(House.menuCloudInit[((Math.imul(i, 5)) + 1)], 32)))) >> 8);
      House.setClipRect(g, i2, i3, House.flyerFrames[3].getWidth(), House.flyerFrames[3].getHeight());
      g.drawImage(House.flyerFrames[3], i2, i3, 20);
      House.setClipRect(g, 0, 0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    }
  }
  saveGame() {
    this.saveSettings();
    if (House.gameMode === 2) {
      if (!CityMode.isCheatActive()) {
        this.highScores.submitScore(1, new Int32Array([House.score, House.blockCount]), MenuController.getPlayerName());
      }
    } else if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
      CityMode.saveState();
      House.saveTowerCityMode();
    } else {
      House.saveTowerQuickMode();
    }
  }
  markSavedGame(saveSlotOrGameMode) {
    let i2 = 9;
    if (saveSlotOrGameMode === 3) {
      Storage.setMenuFlag(8, 0);
    } else {
      if (saveSlotOrGameMode === 1) {
        Storage.setMenuFlag(9, 0);
        i2 = 10;
      }
      this.saveSettings();
    }
    Storage.setSetting(i2, 1);
    this.saveSettings();
  }
  saveSettings() {
    if (!CityMode.isCheatActive()) {
      try {
        let dos = Storage.openWrite("towermode");
        for (let i = 0; i < 6; i++) {
          dos.writeInt(House.progress[i]);
        }
        dos.writeBoolean(House.hasSavedGame(1));
        dos.writeBoolean(House.hasSavedGame(3));
        Storage.close();
      } catch (e) {
      }
    }
  }
  loadStep(step) {
    let z = false;
    if (this.loadingScreenType === -1) {
      this.loadingScreenType = 1;
      this.loadingTimeoutMs = (step + 3000);
      this.loadingNeedsRepaint = true;
    }
    if (this.loadingScreenType !== 1) {
      return true;
    }
    if ((this.loadingTimeoutMs < step) || this.loadingKeyPressed) {
      this.initScreenLayout();
      this.loadingScreenType = -1;
      this.loadingKeyPressed = false;
    } else {
      z = true;
    }
    if (this.soundEnabled && !this.titleBgmStarted) {
      this.sound.play(House.AUDIO_TITLE_THEME, -1);
      this.titleBgmStarted = true;
    }
    this.loadingNeedsRepaint = true;
    return z;
  }
  onLoad() {
    let i = 1;
    House.progress = new Int32Array(6);
    Storage.setMenuFlag(9, 1);
    Storage.setSetting(10, 0);
    Storage.setMenuFlag(8, 1);
    Storage.setSetting(9, 0);
    try {
      let i2;
      let i3;
      let i4;
      let dis = Storage.openRead("towermode");
      if (dis == null) return;   // no saved data (browser storage empty): start fresh
      for (i2 = 0; i2 < 6; i2++) {
        House.progress[i2] = dis.readInt();
      }
      if (dis.readBoolean()) {
        Storage.setMenuFlag(9, 0);
        i2 = 10;
        i3 = 1;
      } else {
        Storage.setMenuFlag(9, 1);
        i2 = 10;
        i3 = 0;
      }
      Storage.setSetting(i2, i3);
      if (dis.readBoolean()) {
        Storage.setMenuFlag(8, 0);
        i4 = 9;
      } else {
        Storage.setMenuFlag(8, 1);
        i = 0;
        i4 = 9;
      }
      Storage.setSetting(i4, i);
      Storage.close();
    } catch (e) {
    }
  }
  keyReleasedRaw(keyCode) {
    super.keyReleasedRaw(keyCode);
  }
  formatNumber(number) {
    return String(number);
  }
  loadTowerQuickMode() {
    let i = 0;
    try {
      let i2;
      let i3;
      let dis = Storage.openRead("quickModeRS");
      if (dis == null) return;   // no saved data (browser storage empty): start fresh
      House.gameMode = dis.readInt();
      House.screenState = dis.readInt();
      House.phase = dis.readInt();
      House.gameTime = dis.readInt();
      House.centerX = dis.readInt();
      House.centerY = dis.readInt();
      House.camX = dis.readInt();
      House.camY = dis.readInt();
      House.camZ = dis.readInt();
      House.camTargetY = dis.readInt();
      House.camEaseStart = dis.readInt();
      House.pivotX = dis.readInt();
      House.pivotY = dis.readInt();
      House.hookX = dis.readInt();
      House.hookY = dis.readInt();
      House.swingAngle = dis.readInt();
      House.craneTime = dis.readInt();
      House.craneYOffset = dis.readInt();
      House.ropeLength = dis.readInt();
      House.swingPeriod = dis.readInt();
      House.prevHookX = dis.readInt();
      House.prevHookY = dis.readInt();
      House.swingAmplitudeX = dis.readInt();
      House.swingAmplitudeY = dis.readInt();
      House.skyStage = dis.readInt();
      House.fenceHeight = dis.readInt();
      House.fenceContainerWidth = dis.readInt();
      House.fenceChainWidth = dis.readInt();
      House.fenceWoodWidth = dis.readInt();
      House.skyStageLength = dis.readInt();
      House.blockCount = dis.readInt();
      House.blockGoal = dis.readInt();
      House.towerType = dis.readInt();
      House.pinkTower = (House.towerType >= House.SAVE_PINK_FLAG);
      if (House.pinkTower) {
        House.towerType -= House.SAVE_PINK_FLAG;
      }
      House.foundationOffset = dis.readInt();
      House.unusedValue = dis.readInt();
      House.scrolledOffsetSum = dis.readInt();
      House.offsetSum = dis.readInt();
      House.topFloorSlot = dis.readInt();
      House.swayAngle = dis.readInt();
      House.swayAmplitude = dis.readInt();
      House.swayPhase = dis.readInt();
      for (i2 = 0; i2 < House.floorX.length; i2++) {
        House.floorX[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.floorY.length; i2++) {
        House.floorY[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.floorSway.length; i2++) {
        House.floorSway[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.floorAngle.length; i2++) {
        House.floorAngle[i2] = dis.readInt();
      }
      House.bonusEligible = dis.readBoolean();
      House.floorIndex = dis.readInt();
      House.landingQuality = dis.readInt();
      for (i2 = 0; i2 < House.blockX.length; i2++) {
        House.blockX[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockY.length; i2++) {
        House.blockY[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockState.length; i2++) {
        House.blockState[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockTilt.length; i2++) {
        House.blockTilt[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockAngle.length; i2++) {
        House.blockAngle[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockVelX.length; i2++) {
        House.blockVelX[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockVelY.length; i2++) {
        House.blockVelY[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockStartY.length; i2++) {
        House.blockStartY[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockTargetAngle.length; i2++) {
        House.blockTargetAngle[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.landingOffsets.length; i2++) {
        House.landingOffsets[i2] = dis.readByte();
      }
      for (i2 = 0; i2 < House.blockTargetTilt.length; i2++) {
        House.blockTargetTilt[i2] = dis.readInt();
      }
      for (i3 = 0; i3 < 8; i3++) {
        for (i2 = 0; i2 < 8; i2++) {
          House.citizens[i3][i2] = dis.readInt();
        }
      }
      for (i3 = 0; i3 < 2; i3++) {
        for (i2 = 0; i2 < 5; i2++) {
          House.lostBlocks[i3][i2] = dis.readInt();
        }
      }
      House.hudX = dis.readInt();
      House.hudHeight = dis.readInt();
      House.score = dis.readInt();
      House.lives = dis.readInt();
      House.lastLossAmount = dis.readInt();
      House.lastLossTime = dis.readInt();
      House.lastPerfectTime = dis.readInt();
      House.comboTimer = dis.readInt();
      House.comboBonus = dis.readInt();
      House.comboCount = dis.readInt();
      House.lastLandTime = dis.readInt();
      House.skylineStart = dis.readInt();
      for (i3 = 0; i3 < 12; i3++) {
        for (i2 = 0; i2 < 7; i2++) {
          House.clouds[i3][i2] = dis.readInt();
        }
      }
      for (i3 = 0; i3 < 9; i3++) {
        for (i2 = 0; i2 < 6; i2++) {
          House.flyers[i3][i2] = dis.readInt();
        }
      }
      for (i2 = 0; i2 < House.progress.length; i2++) {
        House.progress[i2] = dis.readInt();
      }
      House.roundFinishedQuick = dis.readBoolean();
      House.maxCombo = dis.readInt();
      House.perfectTipActiveQuick = dis.readBoolean();
      House.newRecord = dis.readBoolean();
      House.raining = dis.readBoolean();
      House.snowing = dis.readBoolean();
      House.reservedFlagA = dis.readBoolean();
      House.rainTriggered = dis.readBoolean();
      House.snowTriggered = dis.readBoolean();
      House.lightingEnabled = dis.readBoolean();
      House.reservedFlagB = dis.readBoolean();
      House.lightLevel = dis.readInt();
      House.lightBefore = dis.readInt();
      House.lightTarget = dis.readInt();
      House.lightFadeDuration = dis.readInt();
      House.flashLevel = dis.readInt();
      House.flashPeak = dis.readInt();
      House.flashStart = dis.readInt();
      House.flashTimer = dis.readInt();
      House.flashDuration = dis.readInt();
      House.reservedStateFlag = dis.readInt();
      House.weatherPhase = dis.readInt();
      House.phaseDuration = dis.readInt();
      House.rampUpDuration = dis.readInt();
      House.peakDuration = dis.readInt();
      House.rampDownDuration = dis.readInt();
      House.weatherTimer = dis.readInt();
      House.weatherType = dis.readInt();
      House.reservedValue = dis.readInt();
      for (i3 = 0; i3 < 2; i3++) {
        for (i2 = 0; i2 < 7; i2++) {
          House.weatherEmitters[i3][i2] = dis.readInt();
        }
      }
      while (i < 2) {
        let iArr = House.weatherEmitters[i];
        iArr[0] = House.weatherEmitters[i][0];
        iArr[1] = House.weatherEmitters[i][1];
        iArr[2] = House.weatherEmitters[i][2];
        iArr[3] = House.weatherEmitters[i][3];
        iArr[4] = House.weatherEmitters[i][4];
        iArr[5] = House.weatherEmitters[i][5];
        iArr[6] = House.weatherEmitters[i][6];
        i++;
      }
      House.lastHitTime = dis.readInt();
      Storage.close();
      if (House.blockState[0] === House.BLOCK_LANDED) {
        House.ropeLength = 1664;
        if (House.phase !== House.PHASE_ROUND_OVER) {
          House.blockState[0] = House.BLOCK_HANGING;
          House.blockX[0] = House.hookX;
          House.blockY[0] = House.hookY;
          House.blockTargetTilt[0] = 0;
          House.blockTilt[0] = 0;
          House.floorIndex = Math.max(0, Math.min(4, (House.blockCount - 1)));
        }
      }
      if (House.roundFinishedQuick) {
        this.buildResultText(true);
        House.phase = House.PHASE_RESULT;
      }
      if (((House.progress[2] === 0) && (House.progress[1] !== 0)) && House.perfectTipActiveQuick) {
        House.showPrompt(Resources.getString$1(35), null, null);
        House.screenState = 8;
      }
    } catch (e) {
      console.error(e);
      System.out.println(("Exception in loadTowerQuickMode(), e:" + (e).message));
    }
  }
  updateBackground(dt) {
    let i2;
    let i3 = 0;
    if (House.menuClouds == null) {
      House.menuClouds = new Int32Array(40);
      for (i2 = 0; i2 < ((House.menuClouds.length / 5) | 0); i2++) {
        House.menuClouds[((Math.imul(i2, 5)) + 1)] = House.viewHeightUnits;
      }
    }
    if (House.menuCitizens == null) {
      House.menuCitizens = new Int32Array(18);
      for (i2 = 0; i2 < ((House.menuCitizens.length / 6) | 0); i2++) {
        House.menuCitizens[((Math.imul(i2, 6)) + 1)] = House.viewHeightUnits;
      }
    }
    if (House.flyerFrames[3] == null) {
      House.flyerFrames[3] = Resources.getImage(45);
    }
    if (House.menuCloudInit == null) {
      House.menuCloudInit = new Int32Array(20);
      for (i2 = 0; i2 < ((House.menuCloudInit.length / 5) | 0); i2++) {
        House.menuCloudInit[((Math.imul(i2, 5)) + 1)] = House.viewHeightUnits;
      }
    }
    if (dt > 150) {
      dt = 150;
    }
    House.backgroundTimer += dt;
    if (House.backgroundTimer >= 25) {
      let i4;
      let i5;
      let iArr;
      let i6;
      let iArr2;
      let i7;
      let i8 = House.backgroundTimer;
      House.backgroundTimer = 0;
      House.loadingScroll += (i8 >> 1);
      for (i2 = 0; i2 < ((House.menuClouds.length / 5) | 0); i2++) {
        i4 = House.menuClouds[((Math.imul(i2, 5)) + 2)];
        i5 = House.menuClouds[((Math.imul(i2, 5)) + 3)];
        iArr = House.menuClouds;
        i6 = ((Math.imul(i2, 5)) + 0);
        iArr[i6] = ((((Math.imul(i4, i8)) >> 6)) + iArr[i6]);
        iArr2 = House.menuClouds;
        i7 = ((Math.imul(i2, 5)) + 1);
        iArr2[i7] = ((((Math.imul(i5, i8)) >> 6)) + iArr2[i7]);
        if (House.menuClouds[((Math.imul(i2, 5)) + 1)] >= House.viewHeightUnits) {
          House.menuClouds[((Math.imul(i2, 5)) + 0)] = ((((((-((((House.cloudLargeSprite.getWidth() >> 1)) << 8)))) / 32) | 0)) + House.random(House.viewWidthUnits));
          House.menuClouds[((Math.imul(i2, 5)) + 1)] = ((((((-((House.cloudLargeSprite.getHeight() << 8)))) / 32) | 0)) - House.random(House.viewHeightUnits));
          i4 = House.random(2);
          House.menuClouds[((Math.imul(i2, 5)) + 4)] = i4;
          House.menuClouds[((Math.imul(i2, 5)) + 2)] = ((Math.imul(i4, 0)) + 0);
          House.menuClouds[((Math.imul(i2, 5)) + 3)] = ((Math.imul(i4, 3)) + 6);
        }
      }
      House.menuCitizenTimer -= i8;
      if (House.menuCitizenTimer < 0) {
        House.menuCitizenTimer = 300;
        for (i2 = 0; i2 < ((House.menuCitizens.length / 6) | 0); i2++) {
          iArr2 = House.menuCitizens;
          i5 = ((Math.imul(i2, 6)) + 2);
          iArr = House.menuCitizens;
          i6 = ((Math.imul(i2, 6)) + 2);
          let i9 = (iArr[i6] + 1);
          iArr[i6] = i9;
          iArr2[i5] = (i9 % 8);
        }
      }
      for (i2 = 0; i2 < ((House.menuCitizens.length / 6) | 0); i2++) {
        i4 = House.menuCitizens[((Math.imul(i2, 6)) + 3)];
        i5 = House.menuCitizens[((Math.imul(i2, 6)) + 4)];
        iArr = House.menuCitizens;
        i6 = ((Math.imul(i2, 6)) + 0);
        iArr[i6] = ((((Math.imul(i4, i8)) >> 6)) + iArr[i6]);
        iArr2 = House.menuCitizens;
        i7 = ((Math.imul(i2, 6)) + 1);
        iArr2[i7] = ((((Math.imul(i5, i8)) >> 6)) + iArr2[i7]);
        if (House.menuCitizens[((Math.imul(i2, 6)) + 1)] >= House.viewHeightUnits) {
          House.menuCitizens[((Math.imul(i2, 6)) + 0)] = House.random(House.viewWidthUnits);
          House.menuCitizens[((Math.imul(i2, 6)) + 1)] = (-224 - House.random(House.viewHeightUnits));
          House.menuCitizens[((Math.imul(i2, 6)) + 2)] = House.random(8);
          House.menuCitizens[((Math.imul(i2, 6)) + 3)] = (House.random(16) - 8);
          House.menuCitizens[((Math.imul(i2, 6)) + 4)] = (House.random(10) + 10);
          House.menuCitizens[((Math.imul(i2, 6)) + 5)] = House.random(2);
        }
      }
      while (i3 < ((House.menuCloudInit.length / 5) | 0)) {
        i2 = House.menuCloudInit[((Math.imul(i3, 5)) + 2)];
        i4 = House.menuCloudInit[((Math.imul(i3, 5)) + 3)];
        let iArr3 = House.menuCloudInit;
        i7 = ((Math.imul(i3, 5)) + 0);
        iArr3[i7] = ((((Math.imul(i2, i8)) >> 6)) + iArr3[i7]);
        let iArr4 = House.menuCloudInit;
        i5 = ((Math.imul(i3, 5)) + 1);
        iArr4[i5] = ((((Math.imul(i4, i8)) >> 6)) + iArr4[i5]);
        if (House.menuCloudInit[((Math.imul(i3, 5)) + 1)] >= House.viewHeightUnits) {
          House.menuCloudInit[((Math.imul(i3, 5)) + 0)] = ((((((((-((((House.flyerFrames[3].getWidth() >> 1)) << 8)))) / 32) | 0)) + House.random(House.viewWidthUnits))) - House.viewWidthUnits);
          House.menuCloudInit[((Math.imul(i3, 5)) + 1)] = ((((((-((House.flyerFrames[3].getHeight() << 8)))) / 32) | 0)) - House.random(House.viewHeightUnits));
          i2 = House.random(2);
          House.menuCloudInit[((Math.imul(i3, 5)) + 2)] = ((Math.imul(i2, 6)) + 6);
          House.menuCloudInit[((Math.imul(i3, 5)) + 3)] = ((Math.imul(i2, 3)) + 6);
        }
        i3++;
      }
      Storage.dirty = true;
    }
  }
  loadTowerInfoCityMode() {
    let i = 0;
    System.out.println("loadTowerInfoCityMode()");
    try {
      let i2;
      let i3;
      let dis = Storage.openRead("cityModeRS");
      if (dis == null) return;   // no saved data (browser storage empty): start fresh
      House.gameMode = dis.readInt();
      House.screenState = dis.readInt();
      House.phase = dis.readInt();
      House.gameTime = dis.readInt();
      House.centerX = dis.readInt();
      House.centerY = dis.readInt();
      House.camX = dis.readInt();
      House.camY = dis.readInt();
      House.camZ = dis.readInt();
      House.camTargetY = dis.readInt();
      House.camEaseStart = dis.readInt();
      House.pivotX = dis.readInt();
      House.pivotY = dis.readInt();
      House.hookX = dis.readInt();
      House.hookY = dis.readInt();
      House.swingAngle = dis.readInt();
      House.craneTime = dis.readInt();
      House.craneYOffset = dis.readInt();
      House.ropeLength = dis.readInt();
      House.swingPeriod = dis.readInt();
      House.prevHookX = dis.readInt();
      House.prevHookY = dis.readInt();
      House.swingAmplitudeX = dis.readInt();
      House.swingAmplitudeY = dis.readInt();
      House.skyStage = dis.readInt();
      House.fenceHeight = dis.readInt();
      House.fenceContainerWidth = dis.readInt();
      House.fenceChainWidth = dis.readInt();
      House.fenceWoodWidth = dis.readInt();
      House.skyStageLength = dis.readInt();
      House.blockCount = dis.readInt();
      House.blockGoal = dis.readInt();
      House.towerType = dis.readInt();
      House.pinkTower = (House.towerType >= House.SAVE_PINK_FLAG);
      if (House.pinkTower) {
        House.towerType -= House.SAVE_PINK_FLAG;
      }
      House.foundationOffset = dis.readInt();
      House.unusedValue = dis.readInt();
      House.scrolledOffsetSum = dis.readInt();
      House.offsetSum = dis.readInt();
      House.topFloorSlot = dis.readInt();
      House.swayAngle = dis.readInt();
      House.swayAmplitude = dis.readInt();
      House.swayPhase = dis.readInt();
      for (i2 = 0; i2 < House.floorX.length; i2++) {
        House.floorX[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.floorY.length; i2++) {
        House.floorY[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.floorSway.length; i2++) {
        House.floorSway[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.floorAngle.length; i2++) {
        House.floorAngle[i2] = dis.readInt();
      }
      House.bonusEligible = dis.readBoolean();
      House.floorIndex = dis.readInt();
      House.landingQuality = dis.readInt();
      for (i2 = 0; i2 < House.blockX.length; i2++) {
        House.blockX[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockY.length; i2++) {
        House.blockY[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockState.length; i2++) {
        House.blockState[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockTilt.length; i2++) {
        House.blockTilt[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockAngle.length; i2++) {
        House.blockAngle[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockVelX.length; i2++) {
        House.blockVelX[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockVelY.length; i2++) {
        House.blockVelY[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockStartY.length; i2++) {
        House.blockStartY[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.blockTargetAngle.length; i2++) {
        House.blockTargetAngle[i2] = dis.readInt();
      }
      for (i2 = 0; i2 < House.landingOffsets.length; i2++) {
        House.landingOffsets[i2] = dis.readByte();
      }
      for (i2 = 0; i2 < House.blockTargetTilt.length; i2++) {
        House.blockTargetTilt[i2] = dis.readInt();
      }
      for (i3 = 0; i3 < 8; i3++) {
        for (i2 = 0; i2 < 8; i2++) {
          House.citizens[i3][i2] = dis.readInt();
        }
      }
      for (i3 = 0; i3 < 2; i3++) {
        for (i2 = 0; i2 < 5; i2++) {
          House.lostBlocks[i3][i2] = dis.readInt();
        }
      }
      House.hudX = dis.readInt();
      House.hudHeight = dis.readInt();
      House.score = dis.readInt();
      House.lives = dis.readInt();
      House.lastLossAmount = dis.readInt();
      House.lastLossTime = dis.readInt();
      House.lastPerfectTime = dis.readInt();
      House.comboTimer = dis.readInt();
      House.comboBonus = dis.readInt();
      House.comboCount = dis.readInt();
      House.lastLandTime = dis.readInt();
      House.skylineStart = dis.readInt();
      for (i3 = 0; i3 < 12; i3++) {
        for (i2 = 0; i2 < 7; i2++) {
          House.clouds[i3][i2] = dis.readInt();
        }
      }
      for (i3 = 0; i3 < 9; i3++) {
        for (i2 = 0; i2 < 6; i2++) {
          House.flyers[i3][i2] = dis.readInt();
        }
      }
      for (i2 = 0; i2 < House.progress.length; i2++) {
        House.progress[i2] = dis.readInt();
      }
      House.roundFinishedCity = dis.readBoolean();
      House.maxCombo = dis.readInt();
      House.perfectTipActiveCity = dis.readBoolean();
      House.newRecord = dis.readBoolean();
      House.raining = dis.readBoolean();
      House.snowing = dis.readBoolean();
      House.reservedFlagA = dis.readBoolean();
      House.rainTriggered = dis.readBoolean();
      House.snowTriggered = dis.readBoolean();
      House.lightingEnabled = dis.readBoolean();
      House.reservedFlagB = dis.readBoolean();
      House.lightLevel = dis.readInt();
      House.lightBefore = dis.readInt();
      House.lightTarget = dis.readInt();
      House.lightFadeDuration = dis.readInt();
      House.flashLevel = dis.readInt();
      House.flashPeak = dis.readInt();
      House.flashStart = dis.readInt();
      House.flashTimer = dis.readInt();
      House.flashDuration = dis.readInt();
      House.reservedStateFlag = dis.readInt();
      House.weatherPhase = dis.readInt();
      House.phaseDuration = dis.readInt();
      House.rampUpDuration = dis.readInt();
      House.peakDuration = dis.readInt();
      House.rampDownDuration = dis.readInt();
      House.weatherTimer = dis.readInt();
      House.weatherType = dis.readInt();
      House.reservedValue = dis.readInt();
      for (i3 = 0; i3 < 2; i3++) {
        for (i2 = 0; i2 < 7; i2++) {
          House.weatherEmitters[i3][i2] = dis.readInt();
        }
      }
      while (i < 2) {
        let iArr = House.weatherEmitters[i];
        iArr[0] = House.weatherEmitters[i][0];
        iArr[1] = House.weatherEmitters[i][1];
        iArr[2] = House.weatherEmitters[i][2];
        iArr[3] = House.weatherEmitters[i][3];
        iArr[4] = House.weatherEmitters[i][4];
        iArr[5] = House.weatherEmitters[i][5];
        iArr[6] = House.weatherEmitters[i][6];
        i++;
      }
      House.lastHitTime = dis.readInt();
      Storage.close();
      if (House.blockState[0] === House.BLOCK_LANDED) {
        House.ropeLength = 1664;
        if (House.phase !== House.PHASE_ROUND_OVER) {
          House.blockState[0] = House.BLOCK_HANGING;
          House.blockX[0] = House.hookX;
          House.blockY[0] = House.hookY;
          House.blockTargetTilt[0] = 0;
          House.blockTilt[0] = 0;
          House.floorIndex = Math.max(0, Math.min(4, (House.blockCount - 1)));
        }
      }
      if (House.roundFinishedCity) {
        if (House.landingQuality === 0) {
          House.showPrompt(Resources.getString$1(56), null, null);
          House.screenState = 5;
        } else if (House.landingQuality === 2) {
          House.showPrompt(Resources.getString$1(57), null, null);
          House.screenState = 5;
        } else {
          this.buildResultText(false);
        }
        House.phase = House.PHASE_RESULT;
      }
      if (((House.progress[2] === 0) && (House.progress[0] !== 0)) && House.perfectTipActiveCity) {
        House.showPrompt(Resources.getString$1(35), null, null);
        House.screenState = 8;
      }
    } catch (e) {
    }
  }
  onLoadBegin() {
    this.splashImage = Resources.getImage(-1);
    this.titleLogoImage = Resources.getImage(11);
  }
  onLoadEnd() {
    this.splashImage = null;
    this.titleLogoImage = null;
  }
  onMenuTick() {
    let z;
    let house;
    let z2 = true;
    let z3 = this.soundEnabled;
    if (Storage.getSetting(3) === 1) {
      z = true;
      house = this;
    } else {
      z = false;
      house = this;
    }
    house.soundEnabled = z;
    this.sound.setEnabled(this.soundEnabled);
    if (!z3 && this.soundEnabled) {
      this.sound.play(House.AUDIO_TITLE_THEME, -1);
    }
    if (this.vibra != null) {
      if (Storage.getSetting(0) !== 1) {
        z2 = false;
      }
      House.vibrationOn = z2;
      this.vibra.setEnabled(House.vibrationOn);
    }
  }
  onEnter() {
    let i = 2;
    let i2 = 1;
    this.softKeyCommand = new Command("", 2, 1);
    House.promptMarginX = ((GameMIDlet.screenWidth / 44) | 0);
    House.promptMarginY = Math.max(House.promptMarginX, (((((GameMIDlet.screenHeight - (Math.imul(((House.gameFont.getHeight() + 2)), 5)))) - 48)) >> 1));
    House.promptPaddingY = 24;
    House.promptPaddingX = ((GameMIDlet.screenWidth / 14) | 0);
    House.loadCancelled = false;
    this.pendingModeChange = 0;
    this.canvas.setCommand(this.softKeyCommand, this.softKeyArrowImage);
    if (Storage.getSetting(12) === 3) {
      if (!House.hasCitySave) {
        House.hasCitySave = true;
      }
      House.gameMode = House.GAME_MODE_CITY_TOWER;
      CityMode.init();
      CityMode.loadState();
      CityMode.towerGameActive = false;
      CityMode.clearInputState();
      House.nextScreenState = 2;
      House.screenState = 7;
    } else if (Storage.getSetting(12) === 4) {
      if (!House.hasQuickSave) {
        House.hasQuickSave = true;
      }
      House.gameMode = House.GAME_MODE_QUICK;
      House.towerType = 4;
      House.pinkTower = false;
      House.blockGoal = House.goalByTowerType[(House.towerType - 1)];
      House.initArrays();
      this.loadTowerQuickMode();
      House.spawnWeatherParticles();
      House.nextScreenState = 1;
      House.screenState = 7;
    } else {
      House.gameMode = Storage.getSetting(12);
      if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
        House.cityInitPending = true;
        if (House.hasCitySave) {
          let i3;
          if (CityMode.isTowerGameActive()) {
            CityMode.towerGameActive = false;
          }
          if (House.cityInitialized) {
            House.cityInitialized = false;
          }
          CityMode.init();
          if (House.bonusEligible) {
            House.bonusEligible = false;
          }
          if (CityMode.unlockedBonusTier > 0) {
            CityMode.unlockedBonusTier = 0;
          }
          if (CityMode.level > 0) {
            CityMode.level = 0;
          }
          if (CityMode.population > 0) {
            CityMode.population = 0;
          }
          if (((CityMode.grid == null) || (CityMode.tutorialShown == null)) || (CityMode.cellLevels == null)) {
            CityMode.grid = new Int32Array(75);
            CityMode.tutorialShown = new Array(46).fill(false);
            CityMode.cellLevels = new Int32Array(25);
          }
          for (i3 = 0; i3 < CityMode.grid.length; i3++) {
            CityMode.grid[i3] = 0;
          }
          for (i3 = 0; i3 < CityMode.tutorialShown.length; i3++) {
            CityMode.tutorialShown[i3] = false;
          }
          CityMode.phase = 0;
          CityMode.cursorCol = 2;
          CityMode.cursorRow = 2;
          CityMode.population = 0;
          CityMode.populationFlashCount = 0;
          CityMode.unlockedSpecialTier = -1;
          CityMode.modalActive = false;
          CityMode.needsRepaint = true;
          CityMode.slideTimer = 0;
          CityMode.placementInProgress = false;
          CityMode.populationFlashTimer = 0;
          CityMode.populationPending = 0;
          CityMode.highScorePending = false;
          CityMode.launchDelay = -1;
          CityMode.placementResultTimer = -1;
          CityMode.updateUnlocks();
          CityMode.recalculateSynergies();
          CityMode.selectedBuilding = 0;
          if (!CityMode.tutorialShown[0]) {
            House.showPrompt(Resources.getString$1(36), null, null);
            CityMode.tutorialShown[0] = true;
            CityMode.modalActive = true;
          }
        }
        House.roundFinishedCity = false;
        House.screenState = 7;
        i = 2;
      } else {
        House.towerType = 4;
        House.pinkTower = false;
        House.blockGoal = House.goalByTowerType[(House.towerType - 1)];
        House.initArrays();
        House.roundFinishedQuick = false;
        House.screenState = 7;
        i = 1;
      }
      House.nextScreenState = i;
      if (House.gameMode !== House.GAME_MODE_QUICK) {
        i2 = 3;
      }
      this.markSavedGame(i2);
    }
  }
  onModeChange() {
    switch (this.pendingModeChange) {
      case 1:
        House.unloadModels();
        if (House.cityInitialized) {
          CityMode.unloadAssets();
        }
        House.skyStage = -1;
        if (this.softKeyCommand != null) {
          this.canvas.removeCommand(this.softKeyCommand);
        }
        this.menu.gotoMenu(1);
        break;
      case 2:
        let printStream;
        let str;
        House.unloadModels();
        if (House.cityInitialized) {
          CityMode.unloadAssets();
        }
        House.skyStage = -1;
        if (this.softKeyCommand != null) {
          this.canvas.removeCommand(this.softKeyCommand);
        }
        House.screenState = 7;
        CityMode.towerGameActive = false;
        if (House.gameMode !== House.GAME_MODE_QUICK) {
          if (House.gameMode === House.GAME_MODE_CITY_TOWER) {
            this.markSavedGame(3);
            House.hasCitySave = true;
            CityMode.saveState();
            House.saveTowerCityMode();
            printStream = System.out;
            str = "saveToweInfoCityMode() in MODE_CHANGE_BACK";
          }
          this.menu.gotoMenu(2);
          break;
        }
        this.markSavedGame(1);
        House.hasQuickSave = true;
        House.saveTowerQuickMode();
        printStream = System.out;
        str = "saveToweInfoQuickMode() in MODE_CHANGE_BACK";
        printStream.println(str);
        this.menu.gotoMenu(2);
        break;
      case 3:
        Storage.setScreenId(2);
        House.gameMode = Storage.getScreenId();
        break;
    }
    this.pendingModeChange = 0;
  }
  getHighScoreLayout() {
    return House.HIGH_SCORE_LAYOUT;
  }
  static getMode() {
    return House.screenState;
  }
  static dropBlock() {
    if (House.screenState === 2) {
      CityMode.handleClick(0, 0);
    } else if ((((House.screenState === 4) || (House.screenState === 5)) || (House.screenState === 6)) || (House.screenState === 8)) {
      House.handleModalAction(0);
    } else if (House.screenState !== 7) {
      House.inputSelect = true;
    }
  }
  constructor() {
    super();
    this.loadingScreenType = -1;
    this.loadingTimeoutMs = -1;
    this.loadingKeyPressed = false;
    this.splashImage = null;
    this.titleLogoImage = null;
    this.loadingNeedsRepaint = false;
    this.pendingModeChange = 0;
    this.softKeyCommand = null;
    this.softKeyArrowImage = null;
    this.soundEnabled = true;
    this.titleBgmStarted = false;
    this.physicsAccumulatorMs = 0;
    this.skylineBandCount = 0;
    this.skylinePaletteSize = 0;
    this.skylineSegmentCount = 0;
    try {
      System.arraycopy(new Int8Array(262144), 0, new Int8Array(262144), 1, 261888);
    } catch (t) {
    }
    let i = 512;
    let i2 = 60000;
    let i3 = 307;
    let i4 = 50000;
    try {
      i = Integer.parseInt(GameMIDlet.getInstance().getAppProperty("DChoc-Rain-Probability"));
    } catch (e) {
    }
    try {
      i2 = Math.imul(Integer.parseInt(GameMIDlet.getInstance().getAppProperty("DChoc-Rain-Duration")), 1000);
    } catch (e) {
    }
    try {
      i3 = Integer.parseInt(GameMIDlet.getInstance().getAppProperty("DChoc-Snow-Probability"));
    } catch (e3) {
    }
    try {
      i4 = Math.imul(Integer.parseInt(GameMIDlet.getInstance().getAppProperty("DChoc-Snow-Duration")), 1000);
    } catch (e4) {
    }
    House.rainChance = (((Math.imul(i, 1024)) / 100) | 0);
    House.snowChance = (((Math.imul(i3, 1024)) / 100) | 0);
    let weather = new Array(2).fill(null);
    weather[0] = new Int32Array([((i2 / 3) | 0), ((i2 / 30) | 0), ((i2 / 3) | 0), ((i2 / 12) | 0), ((i2 / 3) | 0), ((i2 / 30) | 0), 409, ((i2 / 3) | 0), 90, 1024, 32, 4, 5, 128, 16, 96, 0, 10, 256, 64]);
    weather[1] = new Int32Array([((i4 / 5) | 0), ((i4 / 25) | 0), (((Math.imul(i4, 3)) / 5) | 0), ((i4 / 10) | 0), ((i4 / 5) | 0), ((i4 / 25) | 0), 819, ((i4 / 5) | 0), 90, 1024, 2, 0, 10, 50, 10, 2, 0, 10, 150, 32]);
    House.weatherParams = weather;
    this.softKeyArrowImage = Resources.getImage(10);
    House.vibrator = this.vibra;
    House.soundPlayer = this.sound;
    this.sound.preload(House.AUDIO_TITLE_THEME, false);
    this.sound.preload(House.AUDIO_TOWER_THEME, false);
    this.sound.preload(House.AUDIO_CITY_THEME, false);
    this.sound.preload(House.SFX_MISS_DROP, false);
    this.sound.preload(House.SFX_GOOD_DROP, false);
    this.sound.preload(House.SFX_PERFECT_DROP, false);
    Renderer3D.init(0, GameMIDlet.screenWidth, GameMIDlet.screenHeight);
    Renderer3D.preloadModels(new Int32Array([7, 8, 9, 10, 11, 12, 13, 14, 20, 21, 22, 23, 24, 30, 31, 32, 33, 34, 40, 41, 42, 43, 44]), House.RES_3D_MODELS_PACKAGE);
    House.weatherAreaWidth = Math.imul(GameMIDlet.screenWidth, 1024);
    House.weatherAreaHeight = Math.imul(GameMIDlet.screenHeight, 1024);
  }
}

House.$clinit = function () {
  House.weatherAreaWidth = 0;
  House.weatherAreaHeight = 0;
  House.vibrationOn = true;
  House.levelMedals = null;
  House.hudIcons = null;
  House.floorCounterFrame = null;
  House.lifeIcons = null;
  House.digitSheetB = null;
  House.digitSheetA = null;
  House.HIGH_SCORE_LAYOUT = [new Int32Array([92, -1, -1]), new Int32Array([91, -1, -1])];
  House.blockY = new Int32Array(5);
  House.blockVelX = new Int32Array(5);
  House.blockVelY = new Int32Array(5);
  House.blockStartY = new Int32Array(5);
  House.fallStartTime = 0;
  House.landingOffsets = new Int8Array(20);
  House.skylineSegments = null;
  House.ropeLength = 1664;
  House.pivotX = 0;
  House.pivotY = 0;
  House.hookX = 0;
  House.hookY = 0;
  House.swingAngle = 0;
  House.prevHookX = 0;
  House.prevHookY = 0;
  House.craneTime = 0;
  House.swingAmplitudeXByType = new Int32Array([213, 256, 298, 341, 384]);
  House.swingAmplitudeYByType = new Int32Array([85, 106, 128, 149, 170]);
  House.swingPeriodTable = new Int32Array([1670, 1700, 1650, 1600, 1550, 1500, 1450]);
  House.centerX = 0;
  House.centerY = 0;
  House.camX = 0;
  House.camY = 0;
  House.camTargetY = 0;
  House.camEaseStart = 0;
  House.nextScreenState = 0;
  House.citizenSpriteA = null;
  House.citizenSpriteB = null;
  House.cloudLargeSprite = null;
  House.cloudSmallSprite = null;
  House.fenceContainerSprite = null;
  House.fenceChainSprite = null;
  House.fenceWoodSprite = null;
  House.treeSprite = null;
  House.sparkSprite = null;
  House.arrowSprite = null;
  House.craneArmSprite = null;
  House.comboStarSprite = null;
  House.comboSparkleSprite = null;
  House.waterSplashSprite = null;
  House.fenceHeight = 0;
  House.fenceContainerWidth = 0;
  House.fenceWoodWidth = 0;
  House.fenceChainWidth = 0;
  House.treeWidth = 0;
  House.inputSelect = false;
  House.inputUp = false;
  House.inputDown = false;
  House.blockState = new Int32Array(5);
  House.blockAngle = new Int32Array(5);
  House.blockTargetAngle = new Int32Array(5);
  House.blockX = new Int32Array(5);
  House.soundPlayer = null;
  House.comboTimer = 0;
  House.comboBonus = 0;
  House.maxCombo = 0;
  House.bonusEligible = false;
  House.citizens = (newInstanceArr('int', new Int32Array([8, 8])));
  House.jumpArcY = new Int32Array(11);
  House.jumpArcX = new Int32Array(11);
  House.skylineBounds = null;
  House.skylineRects = null;
  House.skylineColors = null;
  House.skyColorLow = 0;
  House.skyColorHigh = 0;
  House.skyColorMid = 0;
  House.horizonBumpX = 0;
  House.skyPalette = new Int32Array([11720434, 10143978, 8436711, 6729700, 5344996, 4225726, 1858454, 802684, 1257578, 3416140, 3615825, 2968395, 4876098, 6768419, 5449523, 8399403, 5315119]);
  House.promptPageCount = 0;
  House.promptPage = 0;
  House.promptPaddingY = 0;
  House.promptPaddingX = 0;
  House.promptMarginX = 0;
  House.promptMarginY = 0;
  House.promptLinesPerPage = 0;
  House.promptLineHeight = 0;
  House.promptShownTime = 0;
  House.promptOptions = null;
  House.promptSelection = 0;
  House.lives = 0;
  House.lastLossAmount = 0;
  House.lastLossTime = 0;
  House.viewWidthUnits = 0;
  House.viewHeightUnits = 0;
  House.newRecord = false;
  House.blockGoal = 0;
  House.floorAngle = new Int32Array(5);
  House.floorX = new Int32Array(5);
  House.floorY = new Int32Array(5);
  House.phase = 0;
  House.towerType = 0;
  House.pinkTower = false;
  House.PINK_MODEL_TYPE = 5;
  House.PINK_BLOCK_GOAL = 50;
  House.SAVE_PINK_FLAG = 100;
  House.offsetSum = 0;
  House.scrolledOffsetSum = 0;
  House.foundationOffset = 0;
  House.unusedValue = 0;
  House.landingQuality = 0;
  House.swayOffset = 0;
  House.blockCount = 0;
  House.score = 0;
  House.swayAngle = 0;
  House.swayAmplitude = 0;
  House.swayPhase = 0;
  House.bottomFloor = 0;
  House.topFloorSlot = 0;
  House.comboCount = 0;
  House.vibrator = null;
  House.topMeshBonus = null;
  House.fallingMesh = null;
  House.groundMesh = null;
  House.craneHookMesh = null;
  House.craneHookStaticMesh = null;
  House.floorSway = new Int32Array(5);
  House.blockTilt = new Int32Array(5);
  House.blockTargetTilt = new Int32Array(5);
  House.camZ = 0;
  House.cityInitPending = false;
  House.blockLostThisFrame = false;
  House.lastHitTime = 0;
  House.craneYOffset = 0;
  House.swingPeriod = 0;
  House.swingAmplitudeX = 0;
  House.swingAmplitudeY = 0;
  House.swayCos = 0;
  House.landingBounce = 0;
  House.rainChance = 0;
  House.snowChance = 0;
  House.weatherParams = null;
  House.raining = false;
  House.snowing = false;
  House.reservedFlagA = false;
  House.rainTriggered = false;
  House.promptImage = null;
  House.promptImageHeight = 0;
  House.loadingProgress = 0;
  House.skyStageLength = 0;
  House.flyerFrames = null;
  House.rng = new JRandom();
  House.gameTime = 0;
  House.lastPerfectTime = 0;
  House.sinTable = null;
  House.progress = new Int32Array(6);
  House.slotDelays = new Int32Array([0, 150, 350, 550, 750]);
  House.slotDelay = new Int32Array(5);
  House.lostBlocks = (newInstanceArr('int', new Int32Array([2, 5])));
  House.hudX = 0;
  House.hudHeight = 0;
  House.skyStage = 0;
  House.backgroundTimer = 0;
  House.loadingScroll = 0;
  House.menuCitizens = null;
  House.menuCitizenTimer = 0;
  House.menuClouds = null;
  House.menuCloudInit = null;
  House.loadingImage = null;
  House.cityInitialized = false;
  House.floorMesh = null;
  House.topMesh = null;
  House.towersCompleted = 0;
  House.flyers = (newInstanceArr('int', new Int32Array([9, 6])));
  House.flyerImageIds = new Int32Array([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, -1, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68]);
  House.floorIndex = 0;
  House.lastLandTime = 0;
  House.towerInstability = 0;
  House.clouds = null;
  House.cloudColors = new Int32Array([7317456, 6070481, 5216461]);
  House.skylineStart = 0;
  House.snowTriggered = false;
  House.weatherEmitters = (newInstanceArr('int', new Int32Array([2, 7])));
  House.weatherParticles = (newInstanceArr('int', new Int32Array([300, 7])));
  House.lightingEnabled = false;
  House.reservedFlagB = false;
  House.lightLevel = 0;
  House.lightBefore = 0;
  House.lightTarget = 0;
  House.lightFadeDuration = 0;
  House.flashLevel = 0;
  House.flashPeak = 0;
  House.flashStart = 0;
  House.flashTimer = 0;
  House.flashDuration = 100;
  House.reservedStateFlag = 0;
  House.weatherPhase = 0;
  House.phaseDuration = 0;
  House.rampUpDuration = 0;
  House.peakDuration = 0;
  House.rampDownDuration = 0;
  House.weatherTimer = 0;
  House.weatherType = 2;
  House.reservedValue = 0;
  House.flyerCounts = null;
  House.flyerSizes = new Int32Array(28);
  House.flyerTable = [new Int32Array([0, 0, 0, 2, 3, 2, 3, 3, 4, 5, 6, 6, 6, 7, 8, 8, 9, 9, 10, 10, 11, 12, 12, 13, 14, 15, 17, 18, 21]), new Int32Array([1, 1, 1, 3, 4, 4, 4, 5, 5, 6, 7, 7, 7, 999, 9, 10, 999, 999, 11, 999, 12, 13, 14, 999, 15, 16, 18, 19, 999]), new Int32Array([0, 30, 30, 20, 20, 40, 60, 60, 30, 30, 50, 50, 10, 50, 100, 20, 40, 50, 100, 30, 100, 100, 30, 10, 100, 100, 100, 100, 100]), new Int32Array([60, 2, 1, 3, 2, 2, -2, 3, -4, 5, 2, 2, 6, 0, 0, -2, 0, 0, 0, 0, 0, 0, 3, -3, 0, 0, 0, 0, -3])];
  House.GAME_MODE_CITY_TOWER = 5;
  House.GAME_MODE_QUICK = 6;
  House.SCREEN_STATE_QUICK_TOWER = 1;
  House.SCREEN_STATE_CITY_VIEW = 2;
  House.SCREEN_STATE_CITY_TOWER = 3;
  House.SCREEN_STATE_PAUSE = 4;
  House.SCREEN_STATE_ROUND_OVER = 5;
  House.SCREEN_STATE_GAME_OVER = 6;
  House.SCREEN_STATE_LOADING = 7;
  House.SCREEN_STATE_TUTORIAL = 8;
  House.AUDIO_TITLE_THEME = -2147483568;
  House.AUDIO_TOWER_THEME = -2147483567;
  House.AUDIO_CITY_THEME = -2147483566;
  House.SFX_MISS_DROP = -2147483565;
  House.SFX_GOOD_DROP = -2147483564;
  House.SFX_PERFECT_DROP = -2147483563;
  House.RES_3D_MODELS_PACKAGE = -2147483558;
  House.freeCamera = false;
  House.camYaw = 0;
  House.camPitch = 0;
  House.camKeyW = false;
  House.camKeyA = false;
  House.camKeyS = false;
  House.camKeyD = false;
  House.camKeyQ = false;
  House.camKeyE = false;
  House.camKeyZ = false;
  House.camKeyX = false;
  House.savedCamX = 0;
  House.savedCamY = 0;
  House.savedCamZ = 0;
  House.CAM_MOVE_PER_MS = 0.6;
  House.CAM_ROTATE_PER_MS = 0.06;
  House.CAM_PITCH_LIMIT = 89;
  House.LIFE_ICON_EMPTY = 8;
  House.LIFE_ICON_BLINK = 9;
  House.LIFE_ICON_PINK = 10;
  House.LIFE_ICON_PINK_LOSS = 11;
  House.MEDAL_ROOF = 4;
  House.MEDAL_PINK = 5;
  House.gameMode = 0;
  House.screenState = 0;
  House.roundFinishedQuick = false;
  House.roundFinishedCity = false;
  House.perfectTipActiveCity = false;
  House.perfectTipActiveQuick = false;
  House.goalByTowerType = new Int32Array([10, 20, 30, 40]);
  House.scoreThresholds = null;
  House.promptLines = null;
  House.loadCancelled = false;
  House.gameFont = Font.getFont(32, 0, 8);
  House.hasQuickSave = false;
  House.hasCitySave = false;
  House.BLOCK_SLOTS = 5;
  House.CRANE_SLOT = 0;
  House.BLOCK_HANGING = 1;
  House.BLOCK_DROPPED = 2;
  House.BLOCK_RETURNING = 3;
  House.BLOCK_LANDED = 4;
  House.BLOCK_TUMBLING = 5;
  House.BLOCK_ROPE_LOWERING = 6;
  House.BLOCK_DEBRIS_WAITING = 7;
  House.PHASE_PLAYING = 0;
  House.PHASE_ROOF = 1;
  House.PHASE_ROUND_OVER = 2;
  House.PHASE_RESULT = 3;
  House.PHASE_INTRO = 4;
  House.ANGLE_NONE = 999;
  House.ANGLE_RETURNING = 888;
  House.LOST_SCREEN_X = 0;
  House.LOST_TIME = 1;
  House.ROTATION_EASE_MS = 500;
  House.GRAVITY_DIVISOR = 200;
  House.GRAVITY_DIVISOR_ROOF = 400;
  House.MAX_FALL_PER_FRAME = 256;
  House.RETURN_SPEED = 15;
  House.RETURN_STOP_BELOW_TOP = 512;
  House.REHANG_DELAY_MS = 400;
  House.FULL_ROPE_LENGTH = 1664;
  {
    House.buildCrcTable();
  }
};
