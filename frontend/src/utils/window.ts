import { ApplicationData } from '../models/ApplicationData'
import { CurrentStatusData } from '../models/CurrentStatusData'

declare global {
  interface Window {
    jscDebug?: boolean
    applicationData?: ApplicationData
    currentStatusData?: CurrentStatusData
    cryptoKey?: CryptoKey
  }
}
