import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { hideSplash, initNativeChrome } from './lib/native'
import { useGame } from './store/gameStore'
import { usePrefs } from './store/prefsStore'
import { flushSeen, loadSeen } from './store/seenWords'

async function whenHydrated(store: { persist: { hasHydrated(): boolean; onFinishHydration(fn: () => void): () => void } }) {
  if (store.persist.hasHydrated()) return
  await new Promise<void>((resolve) => {
    const unsub = store.persist.onFinishHydration(() => {
      unsub()
      resolve()
    })
  })
}

async function bootstrap() {
  await Promise.all([whenHydrated(useGame), whenHydrated(usePrefs), loadSeen(), initNativeChrome()])
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSeen()
  })
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  hideSplash()
}

void bootstrap()
