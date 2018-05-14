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

Game.system.pcHere = function (x, y) {
  let pcX = Game.getEntity('pc').Position.getX()
  let pcY = Game.getEntity('pc').Position.getY()

  return (x === pcX) && (y === pcY)
}

Game.system.isAltar = function (x, y) {
  return x === Game.getEntity('altar').Position.getX() &&
    y === Game.getEntity('altar').Position.getY()
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
        message.pushMsg(Game.text.interact('drop', item))
        message.pushMsg(Game.text.encounter('reaction', item))

        Game.input.listenEvent('remove', lure)
        Game.system.resetHarbinger(item)
        Game.system.unlockEngine(1)
      } else {
        message.setModeline(Game.text.encounter('more'))
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
        message.pushMsg(Game.text.encounter('lose'))
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
  let message = Game.getEntity('message').Message

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
      message.pushMsg(Game.text.interact('find',
        Game.system.isItem(x, y).getEntityName()))

    Game.input.listenEvent('remove', 'main')
    Game.system.unlockEngine(duration)
  } else if (Game.system.isAltar(x, y)) {
    if (Game.system.sacrificeItem()) {
      actor.Bagpack.pickItem('rune')
      message.pushMsg(Game.text.altar('sacrifice'))
      message.pushMsg(Game.text.altar('reaction',
        Game.getEntity('altar').Sacrifice.getAltarName()))
      Game.getEntity('altar').Sacrifice.nextAltar()
      if (actor.Bagpack.getRune() === 3) {
        message.pushMsg(Game.text.altar('win'))
        message.pushMsg(Game.text.altar('turn'))
        message.pushMsg(Game.text.encounter('end'))
        Game.input.listenEvent('remove', 'main')
      } else {
        Game.input.listenEvent('remove', 'main')
        Game.system.unlockEngine(1)
      }
    } else {
      message.setModeline(Game.text.encounter('more'))
    }
  } else {
    message.setModeline(Game.text.interact('forbidMove'))
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

Game.system.initialItem = function () {
  let maxSkull = 18
  let maxCoin = 4 + Math.floor(ROT.RNG.getUniform() * 5)
  let x = null
  let y = null

  let width = Game.getEntity('dungeon').Dungeon.getWidth()
  let height = Game.getEntity('dungeon').Dungeon.getHeight()

  for (let i = 0; i < maxSkull; i++) {
    Game.entity.skull.apply(null, findPosition())
  }
  for (let i = 0; i < maxCoin; i++) {
    Game.entity.coin.apply(null, findPosition())
  }

  function findPosition () {
    do {
      x = Math.floor(ROT.RNG.getUniform() * width)
      y = Math.floor(ROT.RNG.getUniform() * height)
    } while (!Game.system.isFloor(x, y) ||
    Game.system.isItem(x, y) || Game.system.pcHere(x, y))

    return [x, y]
  }
}

Game.system.sacrificeItem = function () {
  let needItem = Game.getEntity('altar').Sacrifice.getItemList()
  let bag = Game.getEntity('pc').Bagpack
  let hasItem = bag.getSkull() >= needItem[0] &&
    bag.getCoin() >= needItem[1] &&
    bag.getGem() >= needItem[2]

  if (hasItem) {
    for (let i = 0; i < needItem[0]; i++) {
      bag.dropItem('skull')
    }
    for (let i = 0; i < needItem[1]; i++) {
      bag.dropItem('coin')
    } for (let i = 0; i < needItem[2]; i++) {
      bag.dropItem('gem')
    }
    return true
  }
  return false
}
