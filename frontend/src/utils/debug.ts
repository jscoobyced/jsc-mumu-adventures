declare global {
  interface Window {
    jscDebug?: boolean
  }
}

export const isDebugMode = (): boolean => {
  return window.jscDebug === true
}
