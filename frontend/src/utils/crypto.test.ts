import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  decrypt,
  encrypt,
  exportKey,
  generateIV,
  generateKey,
  importKey,
} from './crypto'

describe('crypto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateIV', () => {
    it('should generate initialization vector', () => {
      const iv = generateIV()

      expect(iv).toBeDefined()
      expect(iv).toBeInstanceOf(Uint8Array)
    })

    it('should generate 12-byte IV', () => {
      const iv = generateIV() as Uint8Array

      expect(iv.length).toBe(12)
    })

    it('should generate different IVs on each call', () => {
      const iv1 = generateIV() as Uint8Array
      const iv2 = generateIV() as Uint8Array

      expect(iv1).not.toEqual(iv2)
    })
  })

  describe('generateKey', () => {
    it('should generate AES-GCM key', async () => {
      const key = await generateKey()

      expect(key).toBeDefined()
      expect(key.type).toBe('secret')
    })

    it('should generate extractable key', async () => {
      const key = await generateKey()

      expect(key.extractable).toBe(true)
    })

    it('should generate 256-bit key', async () => {
      const key = await generateKey()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((key.algorithm as any).length).toBe(256)
    })

    it('should generate key with encrypt and decrypt usages', async () => {
      const key = await generateKey()

      expect(key.usages).toContain('encrypt')
      expect(key.usages).toContain('decrypt')
    })
  })

  describe('exportKey', () => {
    it('should export key as base64 string', async () => {
      const key = await generateKey()
      const result = await exportKey(key)

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should export key in base64 format', async () => {
      const key = await generateKey()
      const result = await exportKey(key)

      // Base64 pattern
      expect(result).toMatch(/^[A-Za-z0-9+/=]+$/)
    })
  })

  describe('importKey', () => {
    it('should import key from base64 string', async () => {
      const key = await generateKey()
      const exported = await exportKey(key)

      const imported = await importKey(exported)

      expect(imported).toBeDefined()
      expect(imported.type).toBe('secret')
    })

    it('should import key with correct algorithm', async () => {
      const key = await generateKey()
      const exported = await exportKey(key)

      const imported = await importKey(exported)

      expect(imported.algorithm.name).toBe('AES-GCM')
    })

    it('should import key with encrypt and decrypt usages', async () => {
      const key = await generateKey()
      const exported = await exportKey(key)

      const imported = await importKey(exported)

      expect(imported.usages).toContain('encrypt')
      expect(imported.usages).toContain('decrypt')
    })

    it('should roundtrip export and import', async () => {
      const originalKey = await generateKey()
      const exported = await exportKey(originalKey)
      const imported = await importKey(exported)

      const testMessage = 'test message'
      const iv = generateIV()

      const encrypted = await encrypt(originalKey, iv, testMessage)
      const decrypted = await decrypt(imported, iv, encrypted)

      expect(decrypted).toBe(testMessage)
    })
  })

  describe('encrypt', () => {
    it('should encrypt message', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const message = 'Hello, World!'

      const encrypted = await encrypt(key, iv, message)

      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')
      expect(encrypted).not.toBe(message)
    })

    it('should return base64 encoded string', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const message = 'Test message'

      const encrypted = await encrypt(key, iv, message)

      expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/)
    })

    it('should produce different ciphertext with different IVs', async () => {
      const key = await generateKey()
      const iv1 = generateIV()
      const iv2 = generateIV()
      const message = 'Same message'

      const encrypted1 = await encrypt(key, iv1, message)
      const encrypted2 = await encrypt(key, iv2, message)

      expect(encrypted1).not.toBe(encrypted2)
    })

    it('should encrypt empty string', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const message = ''

      const encrypted = await encrypt(key, iv, message)

      expect(encrypted).toBeDefined()
      expect(typeof encrypted).toBe('string')
    })

    it('should encrypt special characters', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const message = '!@#$%^&*()_+-=[]{}|;:,.<>?'

      const encrypted = await encrypt(key, iv, message)

      expect(encrypted).toBeDefined()
      const decrypted = await decrypt(key, iv, encrypted)
      expect(decrypted).toBe(message)
    })

    it('should encrypt unicode characters', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const message = '你好世界 🌍 Привет'

      const encrypted = await encrypt(key, iv, message)

      const decrypted = await decrypt(key, iv, encrypted)
      expect(decrypted).toBe(message)
    })
  })

  describe('decrypt', () => {
    it('should decrypt encrypted message', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const message = 'Secret message'

      const encrypted = await encrypt(key, iv, message)
      const decrypted = await decrypt(key, iv, encrypted)

      expect(decrypted).toBe(message)
    })

    it('should decrypt empty string', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const message = ''

      const encrypted = await encrypt(key, iv, message)
      const decrypted = await decrypt(key, iv, encrypted)

      expect(decrypted).toBe(message)
    })

    it('should decrypt long message', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const message = 'A'.repeat(1000)

      const encrypted = await encrypt(key, iv, message)
      const decrypted = await decrypt(key, iv, encrypted)

      expect(decrypted).toBe(message)
    })

    it('should decrypt JSON data', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const data = { name: 'Player', health: 3, position: { x: 100, y: 200 } }
      const message = JSON.stringify(data)

      const encrypted = await encrypt(key, iv, message)
      const decrypted = await decrypt(key, iv, encrypted)

      expect(JSON.parse(decrypted)).toEqual(data)
    })

    it('should handle multiline text', async () => {
      const key = await generateKey()
      const iv = generateIV()
      const message = 'Line 1\nLine 2\nLine 3'

      const encrypted = await encrypt(key, iv, message)
      const decrypted = await decrypt(key, iv, encrypted)

      expect(decrypted).toBe(message)
    })
  })

  describe('encryption/decryption integration', () => {
    it('should fail to decrypt with wrong key', async () => {
      const key1 = await generateKey()
      const key2 = await generateKey()
      const iv = generateIV()
      const message = 'Secret'

      const encrypted = await encrypt(key1, iv, message)

      await expect(decrypt(key2, iv, encrypted)).rejects.toThrow()
    })

    it('should fail to decrypt with wrong IV', async () => {
      const key = await generateKey()
      const iv1 = generateIV()
      const iv2 = generateIV()
      const message = 'Secret'

      const encrypted = await encrypt(key, iv1, message)

      await expect(decrypt(key, iv2, encrypted)).rejects.toThrow()
    })

    it('should handle multiple encrypt/decrypt cycles', async () => {
      const key = await generateKey()
      const iv = generateIV()

      for (let i = 0; i < 10; i++) {
        const message = `Message ${i}`
        const encrypted = await encrypt(key, iv, message)
        const decrypted = await decrypt(key, iv, encrypted)
        expect(decrypted).toBe(message)
      }
    })
  })
})
