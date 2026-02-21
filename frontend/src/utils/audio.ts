export const loadAudio = async (url: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.src = url
    audio.loop = true
    audio.volume = 0.5
    audio.oncanplaythrough = () => {
      resolve(audio)
    }
    audio.onerror = (e) =>
      reject(new Error(`Failed to load audio from ${url}: ${e}`))
  })
}
