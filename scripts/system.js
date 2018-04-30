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

Game.system.isAltar = function (x, y) {
  return false
}

Game.system.pcAct = function () {
  Game.entities.get('timer').engine.lock()

  Game.input.listenEvent('add', 'main')
}

Game.system.move = function (direction, actor) {
  let duration = 1
  let x = actor.Position.getX()
  let y = actor.Position.getY()

  switch (direction) {
    case 'left':
      x -= 1
      break
    case 'right':
      x += 1
      break
    case 'up':
      y -= 1
      break
    case 'down':
      y += 1
      break
  }

  if (Game.system.isFloor(x, y) && !Game.system.isAltar(x, y)) {
    actor.Position.setX(x)
    actor.Position.setY(y)

    Game.input.listenEvent('remove', 'main')
    Game.system.unlockEngine(duration)
  } else {
    console.log('you cannot move there')
  }
}

Game.system.unlockEngine = function (duration) {
  Game.entities.get('timer').scheduler.setDuration(duration)
  Game.entities.get('timer').engine.unlock()

  Game.display.clear()
  Game.screens.main.display()
}
