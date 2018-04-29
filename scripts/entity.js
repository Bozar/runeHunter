'use strict'

// ----- Store entities +++++
Game.entities = new Map()
Game.entities.set('message', null)
Game.entities.set('seed', null)

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
