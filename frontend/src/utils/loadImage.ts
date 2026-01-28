// Keep a list of loaded images to prevent redundant loading
const loadedImages: Record<string, HTMLImageElement> = {}

/**
 * Loads an image from the given source URL.
 * Caches the loaded image to avoid redundant network requests.
 * @param src - The source URL of the image to load.
 * @returns A promise that resolves to the loaded HTMLImageElement.
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  if (loadedImages[src]) {
    return Promise.resolve(loadedImages[src])
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      loadedImages[src] = img
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}
