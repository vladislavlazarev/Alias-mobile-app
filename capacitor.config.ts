import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // Перед публикацией замените на свой идентификатор (его нельзя сменить после первого релиза).
  appId: 'com.vlazarev.alias',
  appName: 'Alias',
  webDir: 'dist',
  backgroundColor: '#07090a',
  ios: {
    contentInset: 'never',
    backgroundColor: '#07090a',
  },
  android: {
    backgroundColor: '#07090a',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: '#07090a',
      showSpinner: false,
    },
    SystemBars: {
      // Приложение рисуется под системными панелями, отступы берутся из env(safe-area-inset-*).
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'DARK',
    },
  },
}

export default config
