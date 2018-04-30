'use strict'

Game.system = {}

Game.system.isFloor = function (x, y) {
  return Game.getEntity('dungeon').Dungeon.getTerrain().get(x + ',' + y) === 0
}

Game.system.placePC = function () {
  let x = null
  let y = null
  let width = Game.getEntity('dungeon').Dungeon.getWidth()
  let height = Game.getEntity('dungeon').Dungeon.getHeight()
  let border = Game.getEntity('pc').Position.getSight()

  do {
    x = Math.floor(width * ROT.RNG.getUniform())
    y = Math.floor(height * ROT.RNG.getUniform())
  } while (!Game.system.isFloor(x, y) ||
  x < border || x > width - border ||
  y < border || y > height - border)

  Game.getEntity('pc').Position.setX(x)
  Game.getEntity('pc').Position.setY(y)
}

Game.system.isPC = function (actor) {
  return actor.getID() === Game.getEntity('pc').getID()
}
