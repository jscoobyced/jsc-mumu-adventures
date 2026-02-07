import { beforeEach, describe, expect, it, vi } from 'vitest'
import { jscLog } from './log'
import * as debug from './debug'

describe('log', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('jscLog', () => {
    it('should log message when debug mode is enabled', () => {
      vi.spyOn(debug, 'isDebugMode').mockReturnValue(true)
      const message = 'Test message'

      jscLog(message)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[JSC Mumu Adventures]'),
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(message),
      )
    })

    it('should not log message when debug mode is disabled', () => {
      vi.spyOn(debug, 'isDebugMode').mockReturnValue(false)

      jscLog('Test message')

      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should include ISO timestamp in log message', () => {
      vi.spyOn(debug, 'isDebugMode').mockReturnValue(true)
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-02-07T04:00:00.000Z'))

      jscLog('Test message')

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('2026-02-07T04:00:00.000Z'),
      )

      vi.useRealTimers()
    })

    it('should format log message correctly', () => {
      vi.spyOn(debug, 'isDebugMode').mockReturnValue(true)
      const message = 'Player moved to position'

      jscLog(message)

      const call = consoleLogSpy.mock.calls[0][0]
      expect(call).toMatch(/\[JSC Mumu Adventures\] \[.*\] Player moved to position/)
    })

    it('should handle empty message', () => {
      vi.spyOn(debug, 'isDebugMode').mockReturnValue(true)

      jscLog('')

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[JSC Mumu Adventures]'),
      )
    })

    it('should handle special characters in message', () => {
      vi.spyOn(debug, 'isDebugMode').mockReturnValue(true)
      const message = 'Player has $100 and 50% health'

      jscLog(message)

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(message),
      )
    })
  })
})
