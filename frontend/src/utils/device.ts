// Check if the touch event is supported
export const isTouchSupported =
  'ontouchstart' in window || navigator.maxTouchPoints > 0

export const isMobile = isTouchSupported && window.innerWidth <= 840
