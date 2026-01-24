import { ApplicationData } from '../models/ApplicationData'

declare global {
  interface Window {
    jsc: ApplicationData
  }
}

export const getJscData = (): ApplicationData => {
  return window.jsc
}
