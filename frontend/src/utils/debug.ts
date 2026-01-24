import { getJscData } from './window'

export const isDebugMode = (): boolean => {
  return getJscData().debug === true
}
