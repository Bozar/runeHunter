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

  this._width = Game.UI.dungeon.getWidth()
  this._height = Game.UI.dungeon.getHeight()
  this._terrain = new Map()   // z,x,y: 0(floor) or 1(wall)
  this._memory = []           // explored dungeon

  this.getWidth = function () { return this._width }
  this.getHeight = function () { return this._height }

  this.getTerrain = function () { return this._terrain }
  this.getMemory = function () { return this._memory }
}
