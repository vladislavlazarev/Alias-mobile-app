import { beforeEach, describe, expect, it } from 'vitest'
import { computeScores } from '../game/engine'
import { DEFAULT_SETTINGS } from '../game/presets'
import type { Team } from '../game/types'
import { useGame } from './gameStore'
import { getSeen, resetSeen } from './seenWords'

const teams: Team[] = [
  { id: 'a', name: 'Ёжики', color: 'lime', players: ['Аня', 'Боря'] },
  { id: 'b', name: 'Совы', color: 'cyan', players: [] },
]

describe('ход целиком', () => {
  beforeEach(() => {
    resetSeen()
    useGame.getState().quitGame()
  })

  it('от старта до подсчёта очков', () => {
    const g = useGame.getState()
    g.startGame(teams, { ...DEFAULT_SETTINGS, skipPenalty: true, lastWordForAll: true })
    expect(useGame.getState().turn).toMatchObject({ teamId: 'a', explainer: 'Аня', phase: 'ready' })

    g.startCountdown()
    g.startRound()
    const first = useGame.getState().turn!.current
    expect(first).toBeTruthy()

    g.answer('guessed')
    g.answer('guessed')
    g.answer('skipped')
    g.answer('guessed')
    const turn = useGame.getState().turn!
    expect(turn.results.map((r) => r.status)).toEqual(['guessed', 'guessed', 'skipped', 'guessed'])
    expect(turn.results[0].word).toBe(first)

    // все показанные слова уникальны и помечены как просмотренные
    const shown = [...turn.results.map((r) => r.word), turn.current!]
    expect(new Set(shown).size).toBe(shown.length)
    for (const w of shown) expect(getSeen().has(w)).toBe(true)

    g.timeUp()
    expect(useGame.getState().turn!.phase).toBe('lastword')
    g.resolveLastWord('b')
    expect(useGame.getState().turn!.phase).toBe('review')

    // исправляем пропуск на «угадано»
    g.toggleResult(2)
    g.finishTurn()

    const game = useGame.getState().game!
    expect(useGame.getState().turn).toBeNull()
    expect(computeScores(game)).toEqual({ a: 4, b: 1 })
    expect(game.explainerCursor.a).toBe(1)
  })

  it('пауза замораживает таймер', () => {
    const g = useGame.getState()
    g.startGame(teams, DEFAULT_SETTINGS)
    g.startCountdown()
    g.startRound()
    g.pause()
    const t = useGame.getState().turn!
    expect(t.phase).toBe('paused')
    expect(t.endsAt).toBeNull()
    expect(t.remainingMs).toBeGreaterThan(DEFAULT_SETTINGS.roundSeconds * 1000 - 1000)
    g.answer('guessed')
    expect(useGame.getState().turn!.results).toHaveLength(0)
    g.resume()
    expect(useGame.getState().turn!.phase).toBe('running')
  })

  it('досрочное завершение не засчитывает текущее слово', () => {
    const g = useGame.getState()
    g.startGame(teams, DEFAULT_SETTINGS)
    g.startCountdown()
    g.startRound()
    g.answer('guessed')
    g.pause()
    g.endTurnEarly()
    const t = useGame.getState().turn!
    expect(t.phase).toBe('review')
    expect(t.current).toBeNull()
    expect(t.results).toHaveLength(1)
  })
})
