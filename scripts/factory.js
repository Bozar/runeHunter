'use strict'

// Entity factory
// http://vasir.net/blog/game-development/how-to-build-entity-component-system-in-javascript
Game.Factory = function (name) {
  this._entityName = name
  this._id = createID()

  function createID () {
    // 12345678-{repeat}-{repeat}-{repeat}
    let randomNumber = ''

    while (randomNumber.length < 32) {
      randomNumber += (Math.random() * Math.pow(10, 8) | 0).toString(16)
    }
    return randomNumber.replace(/.{8}/g, '$&' + '-').slice(0, 35)
  }
}

Game.Factory.prototype.getID = function () { return this._id }
Game.Factory.prototype.getEntityName = function () { return this._entityName }

Game.Factory.prototype.addComponent = function (component, newName) {
  if (newName) {
    this[newName] = component
  } else {
    this[component._name] = component
  }
}
Game.Factory.prototype.removeComponent = function (name) {
  delete this[name]
}

Game.Factory.prototype.print = function () {
  console.log(JSON.stringify(this, null, 2))
}
