'use strict'

// ----- Store entities +++++
Game.entities = new Map()
Game.entities.set('message', null)
Game.entities.set('seed', null)
Game.entities.set('dungeon', null)
Game.entities.set('pc', null)
Game.entities.set('timer', null)
Game.entities.set('harbinger', null)
Game.entities.set('item', new Map())

// ----- Create a single entity +++++
Game.entity = {}
Game.getEntity = function (id) { return Game.entities.get(id) }

Game.entity.message = function () {
  let e = new Game.Factory('message')

  e.addComponent(new Game.Component.Message())

  Game.entities.set('message', e)
}

Game.entity.seed = function () {
  let e = new Game.Factory('seed')

  e.addComponent(new Game.Component.Seed())

  Game.entities.set('seed', e)
}

Game.entity.dungeon = function () {
  let e = new Game.Factory('dungeon')
  e.addComponent(new Game.Component.Dungeon())

  cellular()
  e.light = function (x, y) {
    return e.Dungeon.getTerrain().get(x + ',' + y) === 0
  }
  e.fov = new ROT.FOV.PreciseShadowcasting(e.light)

  Game.entities.set('dungeon', e)

  // helper functions
  function cellular () {
    let cell = new ROT.Map.Cellular(e.Dungeon.getWidth(), e.Dungeon.getHeight())

    cell.randomize(0.5)
    for (let i = 0; i < 5; i++) { cell.create() }
    cell.connect(function (x, y, wall) {
      e.Dungeon.getTerrain().set(x + ',' + y, wall)
    })
  }
}

Game.entity.pc = function () {
  let e = new Game.Factory('pc')

  e.addComponent(new Game.Component.Position(5))
  e.addComponent(new Game.Component.Display('@'))
  e.addComponent(new Game.Component.Bagpack())

  e.act = Game.system.pcAct

  Game.entities.set('pc', e)
}

Game.entity.timer = function () {
  let e = new Game.Factory('timer')

  e.scheduler = new ROT.Scheduler.Action()
  e.engine = new ROT.Engine(e.scheduler)

  Game.entities.set('timer', e)
}

Game.entity.harbinger = function () {
  let e = new Game.Factory('harbinger')

  e.addComponent(new Game.Component.Counter())
  e.act = Game.system.harbingerAct

  Game.entities.set('harbinger', e)
}

Game.entity.skull = function (x, y) {
  let e = new Game.Factory('skull')

  e.addComponent(new Game.Component.Position(0, x, y))
  e.addComponent(new Game.Component.Display('?'))

  Game.entities.get('item').set(e.getID(), e)
}

Game.entity.coin = function (x, y) {
  let e = new Game.Factory('coin')

  e.addComponent(new Game.Component.Position(0, x, y))
  e.addComponent(new Game.Component.Display('$'))

  Game.entities.get('item').set(e.getID(), e)
}

Game.entity.gem = function (x, y) {
  let e = new Game.Factory('gem')

  e.addComponent(new Game.Component.Position(0, x, y))
  e.addComponent(new Game.Component.Display('*'))

  Game.entities.get('item').set(e.getID(), e)
}
