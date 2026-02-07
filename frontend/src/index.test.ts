import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockInitializeEventListeners = vi.fn()
const mockInitializeCryptoKey = vi.fn().mockResolvedValue(undefined)
const mockLoadCurrentStatus = vi.fn().mockResolvedValue(undefined)
const mockIntro = vi.fn()

vi.mock('./utils/eventListeners', () => ({
  initializeEventListeners: mockInitializeEventListeners,
}))

vi.mock('./utils/storage', () => ({
  initializeCryptoKey: mockInitializeCryptoKey,
  loadCurrentStatus: mockLoadCurrentStatus,
}))

vi.mock('./models/CurrentStatusData', () => ({
  defaultStatusData: {
    version: 1,
    currentLevel: 'A-1',
    health: 3,
    levelsData: [],
    playerData: { position: { x: 0, y: 0 }, inventory: [] },
  },
}))

vi.mock('./intro', () => ({
  intro: mockIntro,
}))

describe('index', () => {
  const mockFontLoad = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    mockFontLoad.mockResolvedValue(undefined)

    vi.stubGlobal(
      'FontFace',
      class MockFontFace {
        family: string
        source: string
        load = mockFontLoad
        constructor(family: string, source: string) {
          this.family = family
          this.source = source
        }
      },
    )

    vi.spyOn(document.fonts, 'add').mockImplementation(vi.fn())
  })

  it('should initialize all subsystems and start intro', async () => {
    await import('./index')

    // Wait for async operations to complete
    await vi.waitFor(() => {
      expect(mockIntro).toHaveBeenCalled()
    })

    // Event listeners initialized synchronously
    expect(mockInitializeEventListeners).toHaveBeenCalled()

    // Crypto and storage initialized asynchronously
    expect(mockInitializeCryptoKey).toHaveBeenCalled()
    expect(mockLoadCurrentStatus).toHaveBeenCalled()

    // Font loaded and added
    expect(mockFontLoad).toHaveBeenCalled()
    expect(document.fonts.add).toHaveBeenCalled()
  })
})
