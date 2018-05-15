# Rune Hunter

![image](https://github.com/Bozar/runeHunter/doc/youWin.png)

Rune Hunter is a coffe break Roguelike game written in Javascript with [rot.js](https://github.com/ondras/rot.js). Explore the dungeon, stay away from ghosts, and collect 3 runes as quickly as possible.

## Your Goal

* Explore the dungeon and collect treasure.
* Make sacrifice at the altar to get a rune.
* Collect 3 runes to beat the game.

## Tips

* The more you carry, the more turns it takes to move 1 step.
* You cannot drop the rune.
* A satisified ghost needs more time to reappear.

## Keybindings

* Move: arrow keys, hjkl
* Pick up: Space
* Drop the skull/coin/gem: s/c/g, 1/2/3
* Print the seed in the browser console: d
* Switch the wizard mode: ~

Wizard mode:

* Switch the fog of war: f
* Create a/an skull/coin/gem/altar: S/C/G/A
* Print the current turn in the browser console: t

## Miscellaneous

Search `Game._devSeed` in `scripts/game.js` to manually set a seed.

`doc/designNote.pdf` is the paper prototype I made for Rune Hunter.
