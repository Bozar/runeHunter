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
  text.set('death', 'Death')
  text.set('trick', 'Trick')
  text.set('greed', 'Greed')

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
  text.set('lose', 'You are caught by the ghost.')
  text.set('appear', 'The ghost appears from nowhere!')
  text.set('invalid', 'You need to drop some treasure.')
  text.set('end', '===The End===')
  text.set('more', 'You need more treasure.')
  text.set('reaction', 'The ghost vanishes' + getReaction(item))

  return text.get(id)

  function getReaction (item) {
    switch (item) {
      case 'skull':
        return ' with anger.'
      case 'gem':
        return ' with satisfaction.'
      default:
        return '.'
    }
  }
}

// make sacrifice to the god
Game.text.altar = function (id, item) {
  let text = new Map()

  text.set('win', 'You leave the dungeon alive with 3 runes!')
  text.set('turn', 'Final turn: ' + getTurn())
  text.set('sacrifice', 'You make a sacrifice.')
  text.set('reaction', getReaction(item))

  function getTurn () {
    return Math.floor(Game.getEntity('timer').scheduler.getTime())
  }

  function getReaction (item) {
    let god = new Map()
    god.set('death', 'The God of Death is indifferent to you.')
    god.set('trick', 'The God of Trickery whispers to you.')
    god.set('greed', 'The God of Greed smiles to you.')

    return god.get(item)
  }
  return text.get(id)
}

Game.text.tutorial = function (id) {
  let text = new Map()

  text.set('move', 'Press arrow keys or hjkl to move around.')
  text.set('drop', 'Press s/c/g to drop the skull/coin/gem.')
  text.set('pick', 'Press Space to pick up.')
  text.set('speed', 'Your speed (turn) is slowed down by the carry weight.')
  text.set('altar', 'Make sacrifice at the Altar to get a rune.')

  return text.get(id)
}
