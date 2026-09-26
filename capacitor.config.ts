import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
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
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#07090a',
      overlaysWebView: true,
    },
  },
}

export default config
