import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { poolFor } from '../data/wordpack'
import { pickWord } from '../game/deck'
import { commitTurn, createGame, currentTeam, explainerFor } from '../game/engine'
import { normalizeSettings } from '../game/presets'
import type { Game, GameSettings, Team, TurnDraft, WordStatus } from '../game/types'
import { getSeen, markSeen, seenChanged } from './seenWords'
import { storage } from './storage'

interface GameStore {
  game: Game | null
  turn: TurnDraft | null
  /** Счётчик перемешиваний колоды — UI показывает тост, когда он растёт. */
  reshuffles: number

  startGame(teams: Team[], settings: GameSettings): void
  prepareTurn(): void
  startCountdown(): void
  startRound(): void
  answer(status: WordStatus): void
  pause(): void
  resume(): void
  timeUp(): void
  resolveLastWord(guessedBy: string | null): void
  endTurnEarly(): void
  toggleResult(index: number): void
  setLastWordGuesser(teamId: string | null): void
  finishTurn(): void
  restartTurn(): void
  rematch(): void
  quitGame(): void
}

function usedWords(game: Game, turn: TurnDraft | null): Set<string> {
  const used = new Set<string>()
  for (const t of game.turns) {
    for (const w of t.words) used.add(w.word)
    if (t.lastWord) used.add(t.lastWord.word)
  }
  if (turn) {
    for (const w of turn.results) used.add(w.word)
    if (turn.current) used.add(turn.current)
  }
  return used
}

function remaining(turn: TurnDraft): number {
  return turn.endsAt ? Math.max(0, turn.endsAt - Date.now()) : turn.remainingMs
}

export const useGame = create<GameStore>()(
  persist(
    (set, get) => {
      const draw = (): string => {
        const { game, turn } = get()
        if (!game) throw new Error('no game')
        const seen = getSeen()
        const { word, reshuffled } = pickWord(poolFor(game.settings), seen, usedWords(game, turn))
        if (reshuffled) {
          seenChanged()
          set((s) => ({ reshuffles: s.reshuffles + 1 }))
        }
        markSeen(word)
        return word
      }

      const patchTurn = (patch: Partial<TurnDraft>) => {
        const turn = get().turn
        if (turn) set({ turn: { ...turn, ...patch } })
      }

      return {
        game: null,
        turn: null,
        reshuffles: 0,

        startGame(teams, settings) {
          set({ game: createGame(teams, settings), turn: null })
          get().prepareTurn()
        },

        prepareTurn() {
          const game = get().game
          if (!game || game.winnerId) return
          const team = currentTeam(game)
          set({
            turn: {
              teamId: team.id,
              explainer: explainerFor(game, team),
              phase: 'ready',
              endsAt: null,
              remainingMs: game.settings.roundSeconds * 1000,
              current: null,
              results: [],
              lastWord: null,
            },
          })
        },

        startCountdown() {
          patchTurn({ phase: 'countdown' })
        },

        startRound() {
          const { turn } = get()
          if (!turn || (turn.phase !== 'countdown' && turn.phase !== 'ready')) return
          const current = turn.current ?? draw()
          patchTurn({
            phase: 'running',
            current,
            endsAt: Date.now() + turn.remainingMs,
          })
        },

        answer(status) {
          const turn = get().turn
          if (!turn || turn.phase !== 'running' || !turn.current) return
          if (remaining(turn) <= 0) return
          const results = [...turn.results, { word: turn.current, status }]
          set({ turn: { ...turn, results } })
          patchTurn({ current: draw() })
        },

        pause() {
          const turn = get().turn
          if (!turn || turn.phase !== 'running') return
          patchTurn({ phase: 'paused', remainingMs: remaining(turn), endsAt: null })
        },

        resume() {
          const turn = get().turn
          if (!turn || turn.phase !== 'paused') return
          patchTurn({ phase: 'running', endsAt: Date.now() + turn.remainingMs })
        },

        timeUp() {
          const turn = get().turn
          if (!turn || turn.phase !== 'running') return
          patchTurn({
            phase: turn.current ? 'lastword' : 'review',
            endsAt: null,
            remainingMs: 0,
          })
        },

        resolveLastWord(guessedBy) {
          const turn = get().turn
          if (!turn || turn.phase !== 'lastword' || !turn.current) return
          patchTurn({
            phase: 'review',
            lastWord: { word: turn.current, guessedBy },
            current: null,
          })
        },

        endTurnEarly() {
          const turn = get().turn
          if (!turn) return
          // Недообъяснённое слово просто уходит в историю, очков не даёт.
          patchTurn({ phase: 'review', endsAt: null, remainingMs: 0, current: null })
        },

        toggleResult(index) {
          const turn = get().turn
          if (!turn) return
          const results = turn.results.map((r, i) =>
            i === index ? { ...r, status: r.status === 'guessed' ? ('skipped' as const) : ('guessed' as const) } : r,
          )
          patchTurn({ results })
        },

        setLastWordGuesser(teamId) {
          const turn = get().turn
          if (!turn?.lastWord) return
          patchTurn({ lastWord: { ...turn.lastWord, guessedBy: teamId } })
        },

        finishTurn() {
          const { game, turn } = get()
          if (!game || !turn) return
          set({
            game: commitTurn(game, {
              teamId: turn.teamId,
              explainer: turn.explainer,
              words: turn.results,
              lastWord: turn.lastWord,
            }),
            turn: null,
          })
        },

        restartTurn() {
          // Сыгранные в отменённом ходе слова остаются «просмотренными» — повторов не будет.
          get().prepareTurn()
        },

        rematch() {
          const game = get().game
          if (!game) return
          get().startGame(game.teams, game.settings)
        },

        quitGame() {
          set({ game: null, turn: null })
        },
      }
    },
    {
      name: 'alias:game',
      version: 1,
      storage: createJSONStorage(() => storage),
      partialize: (s) => ({ game: s.game, turn: s.turn }),
      // Если приложение закрыли посреди раунда — возвращаемся на паузу, а не в идущий таймер.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameStore>
        let turn = p.turn ?? null
        if (turn?.phase === 'running' && turn.endsAt) {
          const left = Math.max(0, turn.endsAt - Date.now())
          turn = left > 0
            ? { ...turn, phase: 'paused', remainingMs: left, endsAt: null }
            : { ...turn, phase: turn.current ? 'lastword' : 'review', remainingMs: 0, endsAt: null }
        } else if (turn?.phase === 'countdown') {
          turn = { ...turn, phase: 'ready' }
        }
        const game = p.game ? { ...p.game, settings: normalizeSettings(p.game.settings) } : null
        return { ...current, game, turn }
      },
    },
  ),
)
