import { CurrentStatusData } from '../models/CurrentStatusData'
import {
  decrypt,
  encrypt,
  exportKey,
  generateIV,
  generateKey,
  importKey,
} from './crypto'
import { getJscData } from './window'

const CURRENT_STATUS = 'MUMU_CURRENT_STATUS'
const INITIALIZATION_VECTOR = 'MUMU_IV'
const MUMU_KEY = 'MUMU_KEY'

export const initializeCryptoKey = async () => {
  const storedKey = await getCryptoKey()
  if (!storedKey) {
    const key = await generateKey()
    await saveCryptoKey(key)
    getJscData().cryptoKey = key
  } else {
    getJscData().cryptoKey = storedKey
  }
}

const saveInitializationVector = (iv: BufferSource) => {
  const ivArray = new Uint8Array(iv as ArrayBuffer)
  const ivString = btoa(String.fromCharCode(...ivArray))
  localStorage.setItem(INITIALIZATION_VECTOR, ivString)
}

const getInitializationVector = (): BufferSource | undefined => {
  const ivString = localStorage.getItem(INITIALIZATION_VECTOR)
  if (ivString) {
    return Uint8Array.from(atob(ivString), (char) => char.charCodeAt(0))
  }
}

const saveCryptoKey = async (key: CryptoKey) => {
  const keyString = await exportKey(key)
  localStorage.setItem(MUMU_KEY, keyString)
}

const getCryptoKey = async () => {
  const keyString = localStorage.getItem(MUMU_KEY)
  if (keyString) {
    const key = await importKey(keyString)
    return key
  }
}

export const setCurrentStatus = (data: CurrentStatusData): boolean => {
  getJscData().currentStatusData = data
  try {
    let iv = getInitializationVector()
    if (!iv) {
      iv = generateIV()
      saveInitializationVector(iv)
    }
    const key = getJscData().cryptoKey
    if (!key) {
      return false
    }
    // Storing is asynchronous
    ;(async () => {
      const encrypted = await encrypt(key, iv, JSON.stringify(data))
      localStorage.setItem(CURRENT_STATUS, encrypted)
    })()
    return true
  } catch (error) {
    void error
  }
  return false
}

export const loadCurrentStatus = async (
  defaultCurrentStatus: CurrentStatusData,
) => {
  const currentStatus = await getCurrentStatus()
  if (currentStatus?.version !== defaultCurrentStatus.version) {
    getJscData().currentStatusData = defaultCurrentStatus
    return
  }
  getJscData().currentStatusData = currentStatus ?? defaultCurrentStatus
}

const getCurrentStatus = async () => {
  const stringData = localStorage.getItem(CURRENT_STATUS)
  if (stringData) {
    const iv = getInitializationVector()
    const key = await getCryptoKey()
    if (key && iv) {
      const decrypted = await decrypt(key, iv, stringData)
      return JSON.parse(decrypted) as CurrentStatusData
    }
  }
  return undefined
}
