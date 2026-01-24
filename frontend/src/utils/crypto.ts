const crypto = window.crypto

export const generateIV = (): BufferSource => {
  return crypto.getRandomValues(new Uint8Array(12))
}

export const generateKey = async (): Promise<CryptoKey> => {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  )
  return key
}

export const exportKey = async (key: CryptoKey) => {
  const rawKey = await crypto.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(rawKey)))
}

export const importKey = async (key: string) => {
  const rawKey = Uint8Array.from(atob(key), (char) => char.charCodeAt(0))
  return await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  )
}

export const encrypt = async (
  key: CryptoKey,
  iv: BufferSource,
  message: string,
) => {
  const encodedText = new TextEncoder().encode(message)
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: key.algorithm.name,
      iv,
    },
    key,
    encodedText,
  )
  return btoa(String.fromCharCode(...new Uint8Array(encryptedData)))
}

export const decrypt = async (
  key: CryptoKey,
  iv: BufferSource,
  messageBase64: string,
) => {
  const decodedString = atob(messageBase64)
  const len = decodedString.length
  const buffer = new ArrayBuffer(len)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < len; i++) {
    view[i] = decodedString.charCodeAt(i)
  }
  const decrypted = await crypto.subtle.decrypt(
    {
      name: key.algorithm.name,
      iv: iv,
    },
    key,
    view,
  )
  return new TextDecoder().decode(decrypted)
}
