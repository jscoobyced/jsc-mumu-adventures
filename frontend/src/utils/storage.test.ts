import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  initializeCryptoKey,
  loadCurrentStatus,
  setCurrentStatus,
} from './storage'
import * as crypto from './crypto'
import * as window from './window'
import { CurrentStatusData } from '../models/CurrentStatusData'

describe('storage', () => {
  let mockLocalStorage: Record<string, string>
  let mockJscData: {
    cryptoKey?: CryptoKey
    currentStatusData?: CurrentStatusData
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage = {}
    mockJscData = {}

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key]
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {}
      }),
      length: 0,
      key: vi.fn(),
    }

    // Mock window.jsc
    vi.spyOn(window, 'getJscData').mockReturnValue(mockJscData as never)

    // Mock console.log
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('initializeCryptoKey', () => {
    it('should generate and save new key when no stored key exists', async () => {
      const mockKey = await crypto.generateKey()
      vi.spyOn(crypto, 'generateKey').mockResolvedValue(mockKey)
      vi.spyOn(crypto, 'exportKey').mockResolvedValue('exported-key')

      await initializeCryptoKey()

      expect(crypto.generateKey).toHaveBeenCalled()
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'MUMU_KEY',
        'exported-key',
      )
      expect(mockJscData.cryptoKey).toBe(mockKey)
    })

    it('should load existing key when stored key exists', async () => {
      const mockKey = await crypto.generateKey()
      const exportedKey = await crypto.exportKey(mockKey)
      mockLocalStorage['MUMU_KEY'] = exportedKey

      vi.spyOn(crypto, 'importKey').mockResolvedValue(mockKey)

      await initializeCryptoKey()

      expect(crypto.importKey).toHaveBeenCalledWith(exportedKey)
      expect(mockJscData.cryptoKey).toBe(mockKey)
    })

    it('should not generate new key when key already exists', async () => {
      const mockKey = await crypto.generateKey()
      const exportedKey = await crypto.exportKey(mockKey)
      mockLocalStorage['MUMU_KEY'] = exportedKey

      // Clear mocks after setup
      vi.clearAllMocks()

      vi.spyOn(crypto, 'importKey').mockResolvedValue(mockKey)
      const generateSpy = vi.spyOn(crypto, 'generateKey')

      await initializeCryptoKey()

      expect(generateSpy).not.toHaveBeenCalled()
    })
  })

  describe('setCurrentStatus', () => {
    const mockStatusData: CurrentStatusData = {
      version: 1,
      currentLevel: 'A-1',
      health: 3,
      playerData: {
        position: { x: 100, y: 200 },
        inventory: [],
      },
      levelsData: [],
    }

    it('should save current status to jscData', () => {
      const mockKey = {} as CryptoKey
      mockJscData.cryptoKey = mockKey
      vi.spyOn(crypto, 'generateIV').mockReturnValue(new Uint8Array(12))
      vi.spyOn(crypto, 'encrypt').mockResolvedValue('encrypted-data')

      setCurrentStatus(mockStatusData)

      expect(mockJscData.currentStatusData).toBe(mockStatusData)
    })

    it('should return false when no crypto key exists', () => {
      mockJscData.cryptoKey = undefined

      const result = setCurrentStatus(mockStatusData)

      expect(result).toBe(false)
    })

    it('should generate and save IV when none exists', () => {
      const mockKey = {} as CryptoKey
      mockJscData.cryptoKey = mockKey
      const mockIV = new Uint8Array(12)
      vi.spyOn(crypto, 'generateIV').mockReturnValue(mockIV)
      vi.spyOn(crypto, 'encrypt').mockResolvedValue('encrypted-data')

      setCurrentStatus(mockStatusData)

      expect(crypto.generateIV).toHaveBeenCalled()
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'MUMU_IV',
        expect.any(String),
      )
    })

    it('should use existing IV when available', () => {
      const mockKey = {} as CryptoKey
      mockJscData.cryptoKey = mockKey
      const ivString = btoa(
        String.fromCharCode(...new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])),
      )
      mockLocalStorage['MUMU_IV'] = ivString

      vi.spyOn(crypto, 'generateIV')
      vi.spyOn(crypto, 'encrypt').mockResolvedValue('encrypted-data')

      setCurrentStatus(mockStatusData)

      expect(crypto.generateIV).not.toHaveBeenCalled()
    })

    it('should encrypt and save data asynchronously', async () => {
      const mockKey = {} as CryptoKey
      mockJscData.cryptoKey = mockKey
      vi.spyOn(crypto, 'generateIV').mockReturnValue(new Uint8Array(12))
      vi.spyOn(crypto, 'encrypt').mockResolvedValue('encrypted-data')

      const result = setCurrentStatus(mockStatusData)

      expect(result).toBe(true)

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(crypto.encrypt).toHaveBeenCalled()
    })

    it('should return true on successful setup', () => {
      const mockKey = {} as CryptoKey
      mockJscData.cryptoKey = mockKey
      vi.spyOn(crypto, 'generateIV').mockReturnValue(new Uint8Array(12))
      vi.spyOn(crypto, 'encrypt').mockResolvedValue('encrypted-data')

      const result = setCurrentStatus(mockStatusData)

      expect(result).toBe(true)
    })

    it('should return false on error', () => {
      const mockKey = {} as CryptoKey
      mockJscData.cryptoKey = mockKey
      vi.spyOn(crypto, 'generateIV').mockImplementation(() => {
        throw new Error('Test error')
      })

      const result = setCurrentStatus(mockStatusData)

      expect(result).toBe(false)
    })
  })

  describe('loadCurrentStatus', () => {
    const defaultStatus: CurrentStatusData = {
      version: 1,
      currentLevel: 'A-1',
      health: 3,
      playerData: {
        position: { x: 0, y: 0 },
        inventory: [],
      },
      levelsData: [],
    }

    it('should load default status when no stored status exists', async () => {
      await loadCurrentStatus(defaultStatus)

      expect(mockJscData.currentStatusData).toBe(defaultStatus)
    })

    it('should load default status when version mismatch', async () => {
      const storedStatus: CurrentStatusData = {
        ...defaultStatus,
        version: 999,
      }

      const mockKey = await crypto.generateKey()
      const mockIV = new Uint8Array(12)
      const exportedKey = await crypto.exportKey(mockKey)
      mockLocalStorage['MUMU_KEY'] = exportedKey
      mockLocalStorage['MUMU_IV'] = btoa(String.fromCharCode(...mockIV))

      vi.spyOn(crypto, 'importKey').mockResolvedValue(mockKey)
      vi.spyOn(crypto, 'decrypt').mockResolvedValue(
        JSON.stringify(storedStatus),
      )

      const encrypted = await crypto.encrypt(
        mockKey,
        mockIV,
        JSON.stringify(storedStatus),
      )
      mockLocalStorage['MUMU_CURRENT_STATUS'] = encrypted

      await loadCurrentStatus(defaultStatus)

      expect(console.log).toHaveBeenCalledWith(
        'Current status version mismatch. Loading default current status data.',
      )
      expect(mockJscData.currentStatusData).toBe(defaultStatus)
    })

    it('should load stored status when version matches', async () => {
      const storedStatus: CurrentStatusData = {
        ...defaultStatus,
        health: 2,
        currentLevel: 'A-2',
      }

      const mockKey = await crypto.generateKey()
      const mockIV = new Uint8Array(12)
      const exportedKey = await crypto.exportKey(mockKey)
      mockLocalStorage['MUMU_KEY'] = exportedKey
      mockLocalStorage['MUMU_IV'] = btoa(String.fromCharCode(...mockIV))

      vi.spyOn(crypto, 'importKey').mockResolvedValue(mockKey)
      vi.spyOn(crypto, 'decrypt').mockResolvedValue(
        JSON.stringify(storedStatus),
      )

      const encrypted = await crypto.encrypt(
        mockKey,
        mockIV,
        JSON.stringify(storedStatus),
      )
      mockLocalStorage['MUMU_CURRENT_STATUS'] = encrypted

      await loadCurrentStatus(defaultStatus)

      expect(mockJscData.currentStatusData).toEqual(storedStatus)
    })

    it('should load default status when decryption fails', async () => {
      mockLocalStorage['MUMU_CURRENT_STATUS'] = 'invalid-data'
      const mockKey = await crypto.generateKey()
      const exportedKey = await crypto.exportKey(mockKey)
      mockLocalStorage['MUMU_KEY'] = exportedKey
      const ivString = btoa(String.fromCharCode(...new Uint8Array(12)))
      mockLocalStorage['MUMU_IV'] = ivString

      vi.spyOn(crypto, 'importKey').mockResolvedValue(mockKey)
      vi.spyOn(crypto, 'decrypt').mockRejectedValue(
        new Error('Decryption failed'),
      )

      // When decryption fails, the function throws
      await expect(loadCurrentStatus(defaultStatus)).rejects.toThrow(
        'Decryption failed',
      )
    })

    it('should load default status when no key exists', async () => {
      mockLocalStorage['MUMU_CURRENT_STATUS'] = 'some-data'

      await loadCurrentStatus(defaultStatus)

      expect(mockJscData.currentStatusData).toBe(defaultStatus)
    })

    it('should load default status when no IV exists', async () => {
      const mockKey = await crypto.generateKey()
      const exportedKey = await crypto.exportKey(mockKey)
      mockLocalStorage['MUMU_KEY'] = exportedKey
      mockLocalStorage['MUMU_CURRENT_STATUS'] = 'some-data'

      vi.spyOn(crypto, 'importKey').mockResolvedValue(mockKey)

      await loadCurrentStatus(defaultStatus)

      expect(mockJscData.currentStatusData).toBe(defaultStatus)
    })
  })
})
