import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS, normalizeSettings } from '../game/presets'
import { defaultTeams } from '../game/teams'
import type { GameSettings, Team } from '../game/types'
import { storage } from './storage'

interface PrefsState {
  sound: boolean
  vibration: boolean
  /** Последние настройки и команды — компания обычно играет одним составом. */
  lastSettings: GameSettings
  lastTeams: Team[]
  tutorialSeen: boolean
  setSound(on: boolean): void
  setVibration(on: boolean): void
  rememberSetup(teams: Team[], settings: GameSettings): void
  markTutorialSeen(): void
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      sound: true,
      vibration: true,
      lastSettings: DEFAULT_SETTINGS,
      lastTeams: defaultTeams(),
      tutorialSeen: false,
      setSound: (sound) => set({ sound }),
      setVibration: (vibration) => set({ vibration }),
      rememberSetup: (teams, settings) => set({ lastTeams: teams, lastSettings: settings }),
      markTutorialSeen: () => set({ tutorialSeen: true }),
    }),
    {
      name: 'alias:prefs',
      version: 1,
      storage: createJSONStorage(() => storage),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PrefsState>
        return {
          ...current,
          ...p,
          lastSettings: normalizeSettings(p.lastSettings),
          lastTeams: p.lastTeams && p.lastTeams.length >= 2 ? p.lastTeams : current.lastTeams,
        }
      },
    },
  ),
)
