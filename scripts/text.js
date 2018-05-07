'use strict'

Game.text = {}

Game.text.ui = function (id) {
  let text = new Map()

  text.set('turn', 'Turn:')
  text.set('carry', 'Carry:')
  text.set('altar', 'Altar:')
  text.set('skull', 'Skull:')
  text.set('coin', 'Coin:')
  text.set('gem', 'Gem:')
  text.set('rune', 'Rune:')

  return text.get(id)
}

Game.text.item = function (id) {
  let text = new Map()

  text.set('skull', 'Alluring Skull')
  text.set('coin', 'Double-Headed Coin')
  text.set('gem', 'Red Stone of Aja')

  return text.get(id)
}

// move, pick up and drop
Game.text.interact = function (id, item) {
  let text = new Map()

  text.set('find', 'You find the ' + Game.text.item(item) + '.')
  text.set('pick', 'You pick up the ' + Game.text.item(item) + '.')
  text.set('drop', 'You drop the ' + Game.text.item(item) + '.')
  text.set('emptyFloor', 'There is nothing to pick up here.')
  text.set('emptyBag', 'You have nothing to drop.')
  text.set('occupiedFloor', 'You cannot drop the item here.')
  text.set('fullBag', 'Your bag is full.')
  text.set('forbidMove', 'You cannot move there.')

  return text.get(id)
}

// lure away the ghost
Game.text.encounter = function (id, item) {
  let text = new Map()

  text.set('warn', 'Something bad is going to happen.')
  text.set('dead', 'You are caught by the ghost.')
  text.set('appear', 'The ghost appears from nowhere!')
  text.set('invalid', 'You need to drop some treasure.')
  text.set('end', '===The End===')
  text.set('more', 'You need more ' + item + 's.')
  text.set('lure', 'You lure away the ghost with the ' +
    Game.text.item(item) + '.')
  text.set('reaction', 'The ghost is ' + getReaction(item) + '.')

  return text.get(id)

  function getReaction (item) {
    switch (item) {
      case 'skull':
        return 'irritated'
      case 'coin':
        return 'silent'
      case 'gem':
        return 'satisfied'
    }
  }
}
