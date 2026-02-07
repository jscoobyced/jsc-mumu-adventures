import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isDebugMode } from './debug'
import * as window from './window'

describe('debug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isDebugMode', () => {
    it('should return true when debug is true', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        debug: true,
        appVersion: '1.0.0',
        currentStatusData: undefined,
        cryptoKey: undefined,
      })

      expect(isDebugMode()).toBe(true)
    })

    it('should return false when debug is false', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        debug: false,
        appVersion: '1.0.0',
        currentStatusData: undefined,
        cryptoKey: undefined,
      })

      expect(isDebugMode()).toBe(false)
    })

    it('should return false when debug is undefined', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        appVersion: '1.0.0',
        currentStatusData: undefined,
        cryptoKey: undefined,
      } as never)

      expect(isDebugMode()).toBe(false)
    })

    it('should return false when debug is not strictly true', () => {
      vi.spyOn(window, 'getJscData').mockReturnValue({
        debug: 'true',
        appVersion: '1.0.0',
        currentStatusData: undefined,
        cryptoKey: undefined,
      } as never)

      expect(isDebugMode()).toBe(false)
    })
  })
})
