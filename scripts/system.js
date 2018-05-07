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

Game.system.isItem = function (x, y) {
  for (const keyValue of Game.getEntity('item')) {
    if (x === keyValue[1].Position.getX() && y === keyValue[1].Position.getY()) {
      return keyValue[1]
    }
  }
  return null
}

Game.system.pcAct = function () {
  Game.getEntity('timer').engine.lock()

  if (Game.getEntity('harbinger').Counter.hasGhost()) {
    Game.input.listenEvent('add', lure)
  } else {
    Game.input.listenEvent('add', 'main')
  }

  // helper function
  function lure (e) {
    let item = Game.input.getAction(e, 'drop')
    let message = Game.getEntity('message').Message
    let bag = Game.getEntity('pc').Bagpack

    if (item) {
      if (bag.dropItem(item, true)) {
        message.pushMsg(Game.text.encounter('lure', item))
        message.pushMsg(Game.text.encounter('reaction', item))

        Game.input.listenEvent('remove', lure)
        Game.system.resetHarbinger(item)
        Game.system.unlockEngine(1)
      } else {
        message.setModeline(Game.text.encounter('more', item))
      }
    } else {
      message.setModeline(Game.text.encounter('invalid'))
    }

    Game.display.clear()
    Game.screens.main.display()
  }
}

Game.system.harbingerAct = function () {
  let message = Game.getEntity('message').Message
  let unlock = true

  Game.getEntity('timer').engine.lock()

  switch (Game.getEntity('harbinger').Counter.countdown()) {
    case 'warning':
      message.pushMsg(Game.text.encounter('warn'))
      break
    case 'ghost':
      if (Game.system.isDead()) {
        message.pushMsg(Game.text.encounter('dead'))
        message.pushMsg(Game.text.encounter('end'))

        unlock = false
      } else {
        message.pushMsg(Game.text.encounter('appear'))
      }
      break
  }

  unlock && Game.system.unlockEngine(1)
}

Game.system.move = function (direction) {
  let actor = Game.getEntity('pc')
  let duration = actor.Bagpack.getSpeed()
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

    Game.system.isItem(x, y) &&
      Game.getEntity('message').Message.pushMsg(
        Game.text.interact('find', Game.system.isItem(x, y).getEntityName()))

    Game.input.listenEvent('remove', 'main')
    Game.system.unlockEngine(duration)
  } else {
    Game.getEntity('message').Message.setModeline(
      Game.text.interact('forbidMove'))
  }
}

Game.system.unlockEngine = function (duration) {
  Game.getEntity('timer').scheduler.setDuration(duration)
  Game.getEntity('timer').engine.unlock()

  Game.display.clear()
  Game.screens.main.display()
}

Game.system.pickUp = function (x, y) {
  let item = Game.system.isItem(x, y)

  if (!item) {
    Game.getEntity('message').Message.setModeline(
      Game.text.interact('emptyFloor'))

    return false
  }

  if (Game.getEntity('pc').Bagpack.pickItem(item.getEntityName())) {
    Game.getEntity('message').Message.pushMsg(
      Game.text.interact('pick', item.getEntityName()))

    Game.getEntity('item').delete(item.getID())
    Game.system.unlockEngine(1)

    return true
  } else {
    Game.getEntity('message').Message.setModeline(
      Game.text.interact('fullBag'))

    return false
  }
}

Game.system.drop = function (item) {
  let x = Game.getEntity('pc').Position.getX()
  let y = Game.getEntity('pc').Position.getY()

  if (Game.system.isItem(x, y)) {
    Game.getEntity('message').Message.setModeline(
      Game.text.interact('occupiedFloor'))

    return false
  }

  if (!Game.getEntity('pc').Bagpack.dropItem(item)) {
    Game.getEntity('message').Message.setModeline(
      Game.text.interact('emptyBag'))

    return false
  } else {
    Game.entity[item](x, y)

    Game.getEntity('message').Message.pushMsg(
      Game.text.interact('drop', item))
    Game.system.unlockEngine(1)

    return true
  }
}

Game.system.isDead = function () {
  let hasSkull = Game.getEntity('pc').Bagpack.getSkull() > 0
  let hasCoin = Game.getEntity('pc').Bagpack.getCoin() > 1
  let hasGem = Game.getEntity('pc').Bagpack.getGem() > 0

  return !(hasSkull || hasCoin || hasGem)
}

Game.system.resetHarbinger = function (item) {
  Game.getEntity('harbinger').Counter.reset(item)
  Game.getEntity('harbinger').Position.setX(null)
  Game.getEntity('harbinger').Position.setY(null)
}
