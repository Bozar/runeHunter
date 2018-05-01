'use strict'

Game.Component = {}

Game.Component.Message = function () {
  this._name = 'Message'

  this._message = []

  this.getMsgList = function () { return this._message }
}

Game.Component.Seed = function () {
  this._name = 'Seed'

  this._seed = null       // to start the RNG engine
  this._rawSeed = null    // player's input

  this.getSeed = function () { return this._seed }
  this.getRawSeed = function () { return this._rawSeed }
  this.setSeed = function (seed) {
    if (!seed) {
      this._seed =
        Math.floor((Math.random() * 9 + 1) * Math.pow(10, 9)).toString()
      this._rawSeed = this._seed
    } else {
      this._seed = seed.toString().replace(/^#{0,1}(.+)$/, '$1')
      this._rawSeed = seed
    }
  }
}

Game.Component.Dungeon = function () {
  this._name = 'Dungeon'

  this._width = Game.UI.dungeon.getWidth() - 2
  this._height = Game.UI.dungeon.getHeight() - 2
  this._padding = 1           // do not draw along the UI border
  this._terrain = new Map()   // z,x,y: 0(floor) or 1(wall)
  this._memory = []           // explored dungeon
  this._hasFov = true         // only draw whatever the PC can see

  this.getWidth = function () { return this._width }
  this.getHeight = function () { return this._height }
  this.getPadding = function () { return this._padding }
  this.getTerrain = function () { return this._terrain }
  this.getMemory = function () { return this._memory }
  this.getFov = function () { return this._hasFov }

  this.setFov = function (hasFov) { this._hasFov = hasFov }
}

Game.Component.Display = function (char, color) {
  this._name = 'Display'

  this._character = char
  this._color = Game.getColor(color || 'white')

  this.getCharacter = function () { return this._character }
  this.getColor = function () { return this._color }
}

Game.Component.Position = function (range) {
  this._name = 'Position'

  this._x = null
  this._y = null
  this._sight = range || 0   // how far one can see

  this.getX = function () { return this._x }
  this.getY = function () { return this._y }
  this.getSight = function () { return this._sight }

  this.setX = function (pos) { this._x = pos }
  this.setY = function (pos) { this._y = pos }
}

Game.Component.Counter = function () {
  this._name = 'Counter'

  this._start = 50
  this._warning = 10
  this._count = this._start
  this._hasGhost = false

  this.getGhost = function () { return this._hasGhost }

  this.countdown = function () {
    this._count -= 1
    this._hasGhost = this._count === 0

    return this._count === this._warning
      ? 'warning'
      : this._count === 0
        ? 'ghost'
        : null
  }

  this.reset = function () {
    this._count = this._start
    this._hasGhost = false
  }
}
