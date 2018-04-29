'use strict'

// ----- Version number, development switch, seed & color +++++
var Game = {}
Game._version = '0.0.1-dev'
Game._develop = true
Game.getVersion = function () { return this._version }
Game.getDevelop = function () { return this._develop }
Game.setDevelop = function () { this._develop = !this._develop }

// set seed manually for testing, '#' can be omitted
// there are no hyphens ('-') inside numbered seed
// example:
// Game._devSeed = '#12345'
Game.getDevSeed = function () { return this._devSeed }

Game._color = new Map()
Game._color.set(null, '')
Game._color.set('white', '#ABB2BF')
Game._color.set('black', '#262626')
Game._color.set('grey', '#666666')
Game._color.set('orange', '#FF9900')

Game.getColor = function (color) { return Game._color.get(color) }

// ----- Key-bindings +++++
Game.input = {}
Game.input.keybind = new Map()
// [mode1: [keybind1], mode2: [keybind2], ...]
// keybind1 -> [action1: [key1_1, key1_2, ...],
//              action2: [key2_1, key2_2, ...], ...]

// keys that cannot be remapped by player
Game.input.keybind.set('fixed', new Map())
Game.input.keybind.get('fixed').set('space', [' '])
Game.input.keybind.get('fixed').set('enter', ['Enter'])
Game.input.keybind.get('fixed').set('esc', ['Escape'])

// movement
Game.input.keybind.set('move', new Map())
Game.input.keybind.get('move').set('left', ['h', 'ArrowLeft'])
Game.input.keybind.get('move').set('down', ['j', 'ArrowDown'])
Game.input.keybind.get('move').set('up', ['k', 'ArrowUp'])
Game.input.keybind.get('move').set('right', ['l', 'ArrowRight'])

// drop treasure
Game.input.keybind.set('drop', new Map())
Game.input.keybind.get('drop').set('skull', ['s'])
Game.input.keybind.get('drop').set('coin', ['c'])
Game.input.keybind.get('drop').set('gem', ['g'])

Game.input.getAction = function (keyInput, mode) {
  if (!mode) {
    Game.getDevelop() && console.log('Undefined mode.')
    return null
  }

  for (const [key, value] of Game.input.keybind.get(mode)) {
    if (value.indexOf(keyInput.key) > -1) {
      return key
    }
  }
  return null
}

Game.input.listenEvent = function (event, handler) {
  handler = Game.screens[String(handler)]
    ? Game.screens[handler].keyInput
    : handler

  switch (event) {
    case 'add':
      window.addEventListener('keydown', handler)
      break
    case 'remove':
      window.removeEventListener('keydown', handler)
      break
  }
}

// ----- The position & size of screen elements +++++
Game.UI = function (width, height) {
  this._width = width || null
  this._height = height || null

  this._x = null
  this._y = null
}

Game.UI.prototype.getWidth = function () { return this._width }
Game.UI.prototype.getHeight = function () { return this._height }
Game.UI.prototype.getX = function () { return this._x }
Game.UI.prototype.getY = function () { return this._y }

Game.UI.canvas = new Game.UI(70, 26)

Game.display = new ROT.Display({
  width: Game.UI.canvas.getWidth(),
  height: Game.UI.canvas.getHeight(),
  fg: Game.getColor('white'),
  bg: Game.getColor('black'),
  fontSize: 20,
  fontFamily: (function () {
    let family = 'dejavu sans mono'
    family += ', consolas'
    family += ', monospace'

    return family
  }())
})

// ``` The main screen +++
Game.UI.padTopBottom = 0.5
Game.UI.padLeftRight = 1
Game.UI.padModeStatus = 1
Game.UI.padModeMessage = 0
Game.UI.padMessageDungeon = 1

Game.UI.status = new Game.UI(15, null)
Game.UI.status._height = Game.UI.canvas.getHeight() - Game.UI.padTopBottom * 2
Game.UI.status._x = Game.UI.canvas.getWidth() -
  Game.UI.padLeftRight - Game.UI.status.getWidth()
Game.UI.status._y = Game.UI.padTopBottom

Game.UI.modeline = new Game.UI(null, 1)
Game.UI.modeline._width = Game.UI.canvas.getWidth() - Game.UI.padLeftRight * 2 -
  Game.UI.padModeStatus - Game.UI.status.getWidth()
Game.UI.modeline._x = Game.UI.padLeftRight
Game.UI.modeline._y = Game.UI.canvas.getHeight() - Game.UI.padTopBottom -
  Game.UI.modeline.getHeight()

Game.UI.message = new Game.UI(Game.UI.modeline.getWidth(), 5)
Game.UI.message._x = Game.UI.modeline.getX()
Game.UI.message._y = Game.UI.modeline.getY() - Game.UI.padModeMessage -
  Game.UI.message.getHeight()

Game.UI.dungeon = new Game.UI(Game.UI.modeline.getWidth(), null)
Game.UI.dungeon._height = Game.UI.canvas.getHeight() - Game.UI.padTopBottom -
  Game.UI.modeline.getHeight() - Game.UI.padModeMessage -
  Game.UI.message.getHeight() - Game.UI.padMessageDungeon
// the dungeon size should be an integer
Game.UI.dungeon._height = Math.floor(Game.UI.dungeon._height)
Game.UI.dungeon._x = Game.UI.padLeftRight
Game.UI.dungeon._y = Game.UI.padTopBottom

// ``` UI blocks +++
Game.UI.turn = new Game.UI(Game.UI.status.getWidth(), 2)
Game.UI.turn._x = Game.UI.status.getX()
Game.UI.turn._y = Game.UI.status.getY() + 2

Game.UI.altar = new Game.UI(Game.UI.status.getWidth(), 1)
Game.UI.altar._x = Game.UI.status.getX()
Game.UI.altar._y = Game.UI.turn.getY() + Game.UI.turn.getHeight() + 1

Game.UI.treasure = new Game.UI(Game.UI.status.getWidth(), 4)
Game.UI.treasure._x = Game.UI.status.getX()
Game.UI.treasure._y = Game.UI.altar.getY() + Game.UI.altar.getHeight() + 1

// ----- Screen factory: display content, listen keyboard events +++++
Game.Screen = function (name, mode) {
  this._name = name || 'Unnamed Screen'
  this._mode = mode || 'main'
  this._modeLineText = ''
}

Game.Screen.prototype.getName = function () { return this._name }
Game.Screen.prototype.getMode = function () { return this._mode }
Game.Screen.prototype.getText = function () { return this._modeLineText }

Game.Screen.prototype.setMode = function (mode, text) {
  this._mode = mode || 'main'
  this._modeLineText = Game.text.modeLine(this._mode) + (text || '')
}

Game.Screen.prototype.enter = function () {
  Game.screens._currentName = this.getName()
  Game.screens._currentMode = this.getMode()

  this.initialize(this.getName())
  this.display()
}

Game.Screen.prototype.exit = function () {
  Game.screens._currentName = null
  Game.screens._currentMode = null

  Game.display.clear()
}

Game.Screen.prototype.initialize = function (name) {
  Game.getDevelop() && console.log('Enter screen: ' + name + '.')
}

Game.Screen.prototype.display = function () {
  Game.display.drawText(1, 1, 'Testing screen')
  Game.display.drawText(1, 2, 'Name: ' + Game.screens._currentName)
  Game.display.drawText(1, 3, 'Mode: ' + Game.screens._currentMode)
}

Game.Screen.prototype.keyInput = function (e) {
  Game.getDevelop() && console.log('Key pressed: ' + e.key)
}

// ----- In-game screens & helper functions +++++
Game.screens = {}
Game.screens._currentName = null
Game.screens._currentMode = null

// ``` Helper functions +++
Game.screens.colorfulText = function (text, fgColor, bgColor) {
  return bgColor
    ? '%c{' + Game.getColor(fgColor) + '}%b{' +
    Game.getColor(bgColor) + '}' + text + '%b{}%c{}'
    : '%c{' + Game.getColor(fgColor) + '}' + text + '%c{}'
}

Game.screens.drawAlignRight = function (x, y, width, text, color) {
  Game.display.drawText(x + width - text.length, y,
    color ? Game.screens.colorfulText(text, color) : text)
}

Game.screens.drawBorder = function () {
  let status = Game.UI.status
  let dungeon = Game.UI.dungeon

  for (let i = status.getY(); i < status.getHeight(); i++) {
    Game.display.draw(status.getX() - 1, i, '|')
  }
  for (let i = dungeon.getX(); i < dungeon.getWidth() + 1; i++) {
    Game.display.draw(i, dungeon.getY() + dungeon.getHeight(), '-')
  }
}

Game.screens.drawVersion = function () {
  let version = Game.getVersion()

  Game.getDevelop() && (version = 'Wiz|' + version)
  Game.screens.drawAlignRight(Game.UI.status.getX(), Game.UI.status.getY(),
    Game.UI.status.getWidth(), version, 'grey')
}

Game.screens.drawStatus = function () {
  let turn = 2
  let carry = 5
  let altar = 'Death'

  let hasSkull = 3
  let hasCoin = 1
  let hasGem = 0
  let hasRune = 3

  let needSkull = 1
  let needCoin = 2
  let needGem = 3
  let needRune = 3

  let skullColor = changeColor(hasSkull, needSkull)
  let coinColor = changeColor(hasCoin, needCoin)
  let gemColor = changeColor(hasGem, needGem)
  let runeColor = changeColor(hasRune, needRune)

  let align = 7

  let x = Game.UI.status.getX()
  let yTrn = Game.UI.turn.getY()
  let yAlt = Game.UI.altar.getY()
  let yTrs = Game.UI.treasure.getY()

  Game.display.drawText(x, yTrn, Game.text.ui('turn'))
  Game.display.drawText(x, yTrn + 1, Game.text.ui('carry'))
  Game.display.drawText(x + align, yTrn, turn.toString())
  Game.display.drawText(x + align, yTrn + 1, carry.toString())

  Game.display.drawText(x, yAlt, Game.text.ui('altar'))
  Game.display.drawText(x + align, yAlt, altar)

  Game.display.drawText(x, yTrs, Game.text.ui('skull'))
  Game.display.drawText(x + align, yTrs,
    Game.screens.colorfulText(hasSkull + '/' + needSkull, skullColor))

  Game.display.drawText(x, yTrs + 1, Game.text.ui('coin'))
  Game.display.drawText(x + align, yTrs + 1,
    Game.screens.colorfulText(hasCoin + '/' + needCoin, coinColor))

  Game.display.drawText(x, yTrs + 2, Game.text.ui('gem'))
  Game.display.drawText(x + align, yTrs + 2,
    Game.screens.colorfulText(hasGem + '/' + needGem, gemColor))

  Game.display.drawText(x, yTrs + 3, Game.text.ui('rune'))
  Game.display.drawText(x + align, yTrs + 3,
    Game.screens.colorfulText(hasRune + '/' + needRune, runeColor))

  function changeColor (hasItem, requireItem) {
    return hasItem >= requireItem ? 'orange' : 'white'
  }
}

Game.screens.drawSeed = function () {
  let seed = Game.entities.get('seed').Seed.getRawSeed()
  seed = seed.replace(/^(#{0,1}\d{5})(\d{5})$/, '$1-$2')

  Game.screens.drawAlignRight(
    Game.UI.status.getX(),
    Game.UI.status.getY() + Game.UI.status.getHeight() - 1,
    Game.UI.status.getWidth(),
    seed, 'grey')
}

Game.screens.drawModeLine = function (text) {
  Game.display.drawText(Game.UI.modeline.getX(), Game.UI.modeline.getY(), text)
}

// the text cannot be longer than the width of message block
Game.screens.drawMessage = function (text) {
  let msgList = []
  let x = Game.UI.message.getX()
  let y = Game.UI.message.getY()

  text && msgList.push(text)
  while (msgList.length > Game.UI.message.getHeight()) {
    msgList.shift()
  }
  y += Game.UI.message.getHeight() - msgList.length

  for (let i = 0; i < msgList.length; i++) {
    Game.display.drawText(x, y + i, msgList[i])
  }
}

// ``` In-game screens +++
Game.screens.main = new Game.Screen('main')

Game.screens.main.initialize = function () {
  console.log(Game.UI.dungeon.getWidth())
  console.log(Game.UI.dungeon.getHeight())
}

Game.screens.main.display = function () {
  Game.display.drawText(1, 1, 'hello world')
  Game.screens.drawBorder()
  Game.screens.drawVersion()
  Game.screens.drawStatus()
}

// ----- Initialization +++++
window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert(Game.text.error('browser'))
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())

  Game.display.clear()
  Game.screens.main.enter()
}
