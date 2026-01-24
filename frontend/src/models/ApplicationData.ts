import { CurrentStatusData } from './CurrentStatusData'

export interface ApplicationData {
  appVersion: string
  debug?: boolean
  currentStatusData?: CurrentStatusData
  cryptoKey?: CryptoKey
}
