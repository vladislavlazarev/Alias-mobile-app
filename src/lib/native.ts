import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { KeepAwake } from '@capacitor-community/keep-awake'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

export const isNative = Capacitor.isNativePlatform()

export async function initNativeChrome(): Promise<void> {
  if (!isNative) return
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: true })
    }
  } catch {
    // плагин недоступен — не критично
  }
}

export function hideSplash(): void {
  if (isNative) SplashScreen.hide().catch(() => {})
}

/** Аппаратная кнопка «Назад» на Android. Обработчик возвращает false, если нужно свернуть приложение. */
export function onBackButton(handler: () => boolean): () => void {
  if (!isNative) return () => {}
  const sub = App.addListener('backButton', () => {
    if (!handler()) App.minimizeApp().catch(() => {})
  })
  return () => {
    void sub.then((s) => s.remove())
  }
}

/** Уход приложения в фон — чтобы поставить раунд на паузу. */
export function onAppHidden(handler: () => void): () => void {
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') handler()
  }
  document.addEventListener('visibilitychange', onVisibility)
  const sub = isNative
    ? App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) handler()
      })
    : null
  return () => {
    document.removeEventListener('visibilitychange', onVisibility)
    void sub?.then((s) => s.remove())
  }
}

let awake = false

/** Не даём экрану гаснуть, пока идёт партия. */
export function setKeepAwake(on: boolean): void {
  if (on === awake) return
  awake = on
  const p = on ? KeepAwake.keepAwake() : KeepAwake.allowSleep()
  p.catch(() => {
    awake = false
  })
}
