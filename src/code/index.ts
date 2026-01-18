import { intro } from './intro'
import { initializeEventListeners } from './utils/eventListeners'

initializeEventListeners()
const myFont = new FontFace('MumuFont', 'url(fonts/mumu.ttf)')
myFont.load().then(() => {
  document.fonts.add(myFont)
  // startGame()
  intro()
})
