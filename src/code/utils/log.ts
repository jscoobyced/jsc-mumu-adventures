import { isDebugMode } from './debug'

export const jscLog = (message: string): void => {
  if (!isDebugMode()) return
  const datetime = new Date().toISOString()
  console.log(`[JSC Mumu Adventures] [${datetime}] ${message}`)
}
