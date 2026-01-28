import { intro } from './intro'
import { defaultStatusData } from './models/CurrentStatusData'
import { initializeEventListeners } from './utils/eventListeners'
import { initializeCryptoKey, loadCurrentStatus } from './utils/storage'

initializeEventListeners()
;(async () => {
  await initializeCryptoKey()
  await loadCurrentStatus(defaultStatusData)
})()

const myFont = new FontFace('MumuFont', 'url(fonts/mumu.ttf)')
myFont.load().then(() => {
  document.fonts.add(myFont)
  intro()
})
