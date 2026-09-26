export type Level = 'easy' | 'medium' | 'hard'
export type Difficulty = Level | 'mixed'

export type TeamColor = 'lime' | 'cyan' | 'pink' | 'yellow' | 'green' | 'blue'

export interface Team {
  id: string
  name: string
  color: TeamColor
  /** Необязательный список игроков: если задан, объясняющий меняется по кругу. */
  players: string[]
}

export interface GameSettings {
  difficulty: Difficulty
  roundSeconds: number
  targetScore: number
  /** −1 очко за каждое пропущенное слово. */
  skipPenalty: boolean
  /** Когда время вышло, последнее слово может угадать любая команда. */
  lastWordForAll: boolean
}

export type WordStatus = 'guessed' | 'skipped'

export interface WordResult {
  word: string
  status: WordStatus
}

export interface LastWord {
  word: string
  /** id команды, которая угадала, или null — никто не угадал. */
  guessedBy: string | null
}

export interface TurnRecord {
  teamId: string
  explainer: string | null
  words: WordResult[]
  lastWord: LastWord | null
}

export interface Game {
  id: string
  createdAt: number
  settings: GameSettings
  teams: Team[]
  turns: TurnRecord[]
  /** Сколько раз каждая команда уже объясняла — для ротации игроков. */
  explainerCursor: Record<string, number>
  winnerId: string | null
}

export type TurnPhase = 'ready' | 'countdown' | 'running' | 'paused' | 'lastword' | 'review'

/** Черновик текущего хода — сохраняется, чтобы игра переживала сворачивание приложения. */
export interface TurnDraft {
  teamId: string
  explainer: string | null
  phase: TurnPhase
  /** Момент окончания таймера (ms since epoch), пока таймер идёт. */
  endsAt: number | null
  /** Остаток времени в мс, когда таймер стоит. */
  remainingMs: number
  current: string | null
  results: WordResult[]
  lastWord: LastWord | null
}
