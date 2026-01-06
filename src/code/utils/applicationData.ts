import { ApplicationData } from '../models/ApplicationData'

export const getApplicationData = () => {
  // @ts-expect-error - We inject this property in index.html
  if (window.applicationData) {
    // @ts-expect-error - We inject this property in index.html
    return window.applicationData as ApplicationData
  }
  return {
    appVersion: 'v0.0.0',
  }
}
