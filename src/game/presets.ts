import type { GameSettings, Level } from './types'

export const ROUND_TIMES = [30, 45, 60, 90, 120] as const
export const TARGET_SCORES = [20, 30, 50, 75, 100] as const

export const LEVELS: Level[] = ['easy', 'medium', 'hard']

export const DEFAULT_SETTINGS: GameSettings = {
  levels: ['medium'],
  excludedCategories: [],
  packs: [],
  roundSeconds: 60,
  targetScore: 50,
  skipPenalty: true,
  lastWordForAll: true,
}

export interface LevelMeta {
  id: Level
  title: string
  hint: string
  examples: string[]
  dots: number
}

export const LEVEL_META: LevelMeta[] = [
  { id: 'easy', title: 'Лёгкий', hint: 'Для детей и разогрева', examples: ['кошка', 'мяч', 'дождь'], dots: 1 },
  { id: 'medium', title: 'Средний', hint: 'Классика для взрослых', examples: ['телескоп', 'ипотека'], dots: 2 },
  { id: 'hard', title: 'Сложный', hint: 'Абстракции и выражения', examples: ['ностальгия', 'парадокс'], dots: 3 },
]

export function levelTitle(level: Level): string {
  return LEVEL_META.find((l) => l.id === level)?.title ?? level
}

export function sortLevels(levels: Level[]): Level[] {
  return LEVELS.filter((l) => levels.includes(l))
}

export function levelsLabel(levels: Level[]): string {
  const sorted = sortLevels(levels)
  if (sorted.length === LEVELS.length) return 'Все уровни'
  return sorted.map(levelTitle).join(' + ')
}

/**
 * Приводит сохранённые настройки к актуальному виду:
 * старые версии хранили одну сложность `difficulty` ('easy' | 'medium' | 'hard' | 'mixed').
 */
export function normalizeSettings(raw: unknown): GameSettings {
  const r = (raw ?? {}) as Partial<GameSettings> & { difficulty?: string }
  let levels = Array.isArray(r.levels) ? sortLevels(r.levels.filter((l): l is Level => LEVELS.includes(l))) : []
  if (levels.length === 0) {
    if (r.difficulty === 'mixed') levels = [...LEVELS]
    else if (LEVELS.includes(r.difficulty as Level)) levels = [r.difficulty as Level]
    else levels = [...DEFAULT_SETTINGS.levels]
  }
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
  return {
    levels,
    excludedCategories: strings(r.excludedCategories),
    packs: strings(r.packs),
    roundSeconds: typeof r.roundSeconds === 'number' ? r.roundSeconds : DEFAULT_SETTINGS.roundSeconds,
    targetScore: typeof r.targetScore === 'number' ? r.targetScore : DEFAULT_SETTINGS.targetScore,
    skipPenalty: typeof r.skipPenalty === 'boolean' ? r.skipPenalty : DEFAULT_SETTINGS.skipPenalty,
    lastWordForAll: typeof r.lastWordForAll === 'boolean' ? r.lastWordForAll : DEFAULT_SETTINGS.lastWordForAll,
  }
}
