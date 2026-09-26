import { create } from 'zustand'
import { DEFAULT_SETTINGS } from '../game/presets'
import { MAX_TEAMS, MIN_TEAMS, makeTeam } from '../game/teams'
import type { GameSettings, Team } from '../game/types'
import { usePrefs } from './prefsStore'

export type Route = 'home' | 'setup-teams' | 'setup-rules' | 'rules' | 'settings' | 'game'

export interface ConfirmRequest {
  title: string
  message?: string
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  onConfirm(): void
}

interface UiState {
  route: Route
  /** 1 — вперёд, −1 — назад; нужен для направления анимации экранов. */
  direction: 1 | -1
  setupTeams: Team[]
  setupSettings: GameSettings
  confirm: ConfirmRequest | null
  toast: { id: number; text: string } | null

  go(route: Route, direction?: 1 | -1): void
  beginSetup(): void
  updateTeam(id: string, patch: Partial<Team>): void
  addTeam(): void
  removeTeam(id: string): void
  setSettings(patch: Partial<GameSettings>): void
  askConfirm(req: ConfirmRequest): void
  closeConfirm(): void
  showToast(text: string): void
}

export const useUi = create<UiState>()((set, get) => ({
  route: 'home',
  direction: 1,
  setupTeams: [],
  setupSettings: DEFAULT_SETTINGS,
  confirm: null,
  toast: null,

  go(route, direction = 1) {
    set({ route, direction })
  },

  beginSetup() {
    const { lastTeams, lastSettings } = usePrefs.getState()
    set({
      setupTeams: lastTeams.map((t) => ({ ...t, players: [...t.players] })),
      setupSettings: { ...lastSettings },
      route: 'setup-teams',
      direction: 1,
    })
  },

  updateTeam(id, patch) {
    set({ setupTeams: get().setupTeams.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
  },

  addTeam() {
    const teams = get().setupTeams
    if (teams.length >= MAX_TEAMS) return
    set({ setupTeams: [...teams, makeTeam(teams)] })
  },

  removeTeam(id) {
    const teams = get().setupTeams
    if (teams.length <= MIN_TEAMS) return
    set({ setupTeams: teams.filter((t) => t.id !== id) })
  },

  setSettings(patch) {
    set({ setupSettings: { ...get().setupSettings, ...patch } })
  },

  askConfirm(req) {
    set({ confirm: req })
  },

  closeConfirm() {
    set({ confirm: null })
  },

  showToast(text) {
    set({ toast: { id: Date.now(), text } })
  },
}))
