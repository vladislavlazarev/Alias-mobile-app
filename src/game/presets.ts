import type { Difficulty, GameSettings } from './types'

export const ROUND_TIMES = [30, 45, 60, 90, 120] as const
export const TARGET_SCORES = [20, 30, 50, 75, 100] as const

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'medium',
  roundSeconds: 60,
  targetScore: 50,
  skipPenalty: true,
  lastWordForAll: true,
}

export interface DifficultyMeta {
  id: Difficulty
  title: string
  hint: string
  examples: string[]
  dots: number
}

export const DIFFICULTIES: DifficultyMeta[] = [
  {
    id: 'easy',
    title: 'Лёгкий',
    hint: 'Простые слова — для детей и разогрева',
    examples: ['кошка', 'мяч', 'дождь'],
    dots: 1,
  },
  {
    id: 'medium',
    title: 'Средний',
    hint: 'Классика для взрослой компании',
    examples: ['телескоп', 'ипотека', 'кальмар'],
    dots: 2,
  },
  {
    id: 'hard',
    title: 'Сложный',
    hint: 'Абстракции, термины и выражения',
    examples: ['ностальгия', 'парадокс', 'эффект плацебо'],
    dots: 3,
  },
  {
    id: 'mixed',
    title: 'Микс',
    hint: 'Все уровни вперемешку',
    examples: ['мяч', 'ипотека', 'парадокс'],
    dots: 0,
  },
]

export function difficultyTitle(d: Difficulty): string {
  return DIFFICULTIES.find((x) => x.id === d)?.title ?? d
}
