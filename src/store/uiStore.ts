import { create } from 'zustand'
import { BASE_CATEGORIES } from '../data/wordpack'
import { DEFAULT_SETTINGS, sortLevels } from '../game/presets'
import { MAX_TEAMS, MIN_TEAMS, makeTeam } from '../game/teams'
import type { GameSettings, Level, Team } from '../game/types'
import { usePrefs } from './prefsStore'

export type Route = 'home' | 'setup-teams' | 'setup-words' | 'setup-rules' | 'rules' | 'settings' | 'game'

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
  /** false — нельзя снять последний уровень. */
  toggleLevel(level: Level): boolean
  toggleCategory(id: string): void
  setAllCategories(on: boolean): void
  togglePack(id: string): void
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

  toggleLevel(level) {
    const { levels } = get().setupSettings
    if (levels.includes(level)) {
      if (levels.length === 1) return false
      get().setSettings({ levels: levels.filter((l) => l !== level) })
    } else {
      get().setSettings({ levels: sortLevels([...levels, level]) })
    }
    return true
  },

  toggleCategory(id) {
    const { excludedCategories } = get().setupSettings
    get().setSettings({
      excludedCategories: excludedCategories.includes(id)
        ? excludedCategories.filter((c) => c !== id)
        : [...excludedCategories, id],
    })
  },

  setAllCategories(on) {
    get().setSettings({ excludedCategories: on ? [] : BASE_CATEGORIES.map((c) => c.id) })
  },

  togglePack(id) {
    const { packs } = get().setupSettings
    get().setSettings({ packs: packs.includes(id) ? packs.filter((p) => p !== id) : [...packs, id] })
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
