import { ApplicationData } from '../models/ApplicationData'

export const getApplicationData = () => {
  if (window.applicationData) {
    return window.applicationData as ApplicationData
  }
  return {
    appVersion: 'v0.0.0',
  }
}
