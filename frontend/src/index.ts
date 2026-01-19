// import { intro } from './intro'
import { initializeEventListeners } from './utils/eventListeners'
import { startGame } from './utils/game'

initializeEventListeners()
const myFont = new FontFace('MumuFont', 'url(fonts/mumu.ttf)')
myFont.load().then(() => {
  document.fonts.add(myFont)
  startGame()
  // intro()
})
