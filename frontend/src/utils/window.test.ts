import { beforeEach, describe, expect, it } from 'vitest'
import { ApplicationData } from '../models/ApplicationData'
import { getJscData } from './window'

describe('window', () => {
  beforeEach(() => {
    // Clean up window.jsc before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).jsc
  })

  describe('getJscData', () => {
    it('should return ApplicationData from window.jsc', () => {
      const mockData: ApplicationData = {
        appVersion: '1.0.0',
        debug: false,
        currentStatusData: undefined,
        cryptoKey: undefined,
      }

      window.jsc = mockData

      expect(getJscData()).toBe(mockData)
    })

    it('should return same reference on multiple calls', () => {
      const mockData: ApplicationData = {
        appVersion: '1.0.0',
        debug: true,
        currentStatusData: undefined,
        cryptoKey: undefined,
      }

      window.jsc = mockData

      const firstCall = getJscData()
      const secondCall = getJscData()

      expect(firstCall).toBe(secondCall)
      expect(firstCall).toBe(mockData)
    })

    it('should allow reading debug flag', () => {
      window.jsc = {
        appVersion: '1.0.0',
        debug: true,
        currentStatusData: undefined,
        cryptoKey: undefined,
      }

      expect(getJscData().debug).toBe(true)
    })

    it('should allow reading version', () => {
      window.jsc = {
        appVersion: '2.5.3',
        debug: false,
        currentStatusData: undefined,
        cryptoKey: undefined,
      }

      expect(getJscData().appVersion).toBe('2.5.3')
    })

    it('should return undefined for uninitialized properties', () => {
      window.jsc = {
        appVersion: '1.0.0',
        debug: false,
        currentStatusData: undefined,
        cryptoKey: undefined,
      }

      const data = getJscData()
      expect(data.currentStatusData).toBeUndefined()
      expect(data.cryptoKey).toBeUndefined()
    })
  })
})
