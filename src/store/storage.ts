import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import type { StateStorage } from 'zustand/middleware'

/**
 * В нативном приложении пишем в Preferences (UserDefaults / SharedPreferences) —
 * их ОС не чистит, в отличие от localStorage внутри WebView. В браузере — localStorage.
 */
const native = Capacitor.isNativePlatform()

export const storage: StateStorage & { removeItem(key: string): Promise<void> | void } = {
  async getItem(key) {
    if (native) return (await Preferences.get({ key })).value
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  async setItem(key, value) {
    if (native) return Preferences.set({ key, value })
    try {
      localStorage.setItem(key, value)
    } catch {
      // приватный режим / переполнение — игра продолжит работать без сохранения
    }
  },
  async removeItem(key) {
    if (native) return Preferences.remove({ key })
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}
