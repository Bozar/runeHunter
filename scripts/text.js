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
