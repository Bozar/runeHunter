'use strict'

Game.Component = {}

Game.Component.Message = function () {
  this._name = 'Message'

  this._message = []
  this._modeline = ''

  this.getMsgList = function () { return this._message }
  this.getModeline = function () {
    let text = this._modeline
    this._modeline = ''
    return text
  }

  this.setModeline = function (text) { this._modeline = text }
  this.pushMsg = function (text) { this._message.push(text) }
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

  this.setFov = function () { this._hasFov = !this._hasFov }
}

Game.Component.Display = function (char, color) {
  this._name = 'Display'

  this._character = char
  this._color = Game.getColor(color || 'white')

  this.getCharacter = function () { return this._character }
  this.getColor = function () { return this._color }
}

Game.Component.Position = function (range, x, y) {
  this._name = 'Position'

  this._x = x
  this._y = y
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

  this.hasGhost = function () { return this._count <= 0 }

  this.countdown = function () {
    this._count -= 1

    return this._count === this._warning
      ? 'warning'
      : this._count === 0
        ? 'ghost'
        : null
  }

  this.reset = function (item) {
    switch (item) {
      case 'gem':
        this._count = Math.floor(this._start * 1.4)
        break
      case 'skull':
        this._count = Math.floor(this._start * 0.6)
        break
      default:
        this._count = this._start
        break
    }
  }
}

Game.Component.Bagpack = function () {
  this._name = 'Bagpack'

  this._skull = 0
  this._coin = 0
  this._gem = 0
  this._rune = 0
  this._max = 9

  this.getSkull = function () { return this._skull }
  this.getCoin = function () { return this._coin }
  this.getGem = function () { return this._gem }
  this.getRune = function () { return this._rune }

  this.getTotal = function () {
    return this._skull + this._coin + this._gem + this._rune
  }
  this.getSpeed = function () {
    return Math.max(1, Math.ceil(this.getTotal() / 3))
  }

  this.pickItem = function (item) {
    if (this.getTotal() < this._max) {
      this['_' + item] += 1
      return true
    }
    return false
  }
  this.dropItem = function (item, hasGhost) {
    if (hasGhost && item === 'coin') {
      if (this._coin > 1) {
        this._coin -= 2
        return true
      }
      return false
    } else {
      if (this['_' + item] > 0) {
        this['_' + item] -= 1
        return true
      }
      return false
    }
  }
}
