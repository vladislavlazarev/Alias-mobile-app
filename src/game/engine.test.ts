import { describe, expect, it } from 'vitest'
import {
  commitTurn,
  computeScores,
  createGame,
  currentTeam,
  explainerFor,
  findWinner,
  gameStats,
  guessersFor,
  isTieBreak,
  roundNumber,
} from './engine'
import { DEFAULT_SETTINGS } from './presets'
import type { GameSettings, Team, TurnRecord } from './types'

const teams: Team[] = [
  { id: 'a', name: 'Ёжики', color: 'lime', players: ['Аня', 'Боря'] },
  { id: 'b', name: 'Совы', color: 'cyan', players: [] },
]

function turn(teamId: string, guessed: number, skipped: number, lastBy?: string | null): TurnRecord {
  return {
    teamId,
    explainer: null,
    words: [
      ...Array.from({ length: guessed }, (_, i) => ({ word: `g${teamId}${i}`, status: 'guessed' as const })),
      ...Array.from({ length: skipped }, (_, i) => ({ word: `s${teamId}${i}`, status: 'skipped' as const })),
    ],
    lastWord: lastBy === undefined ? null : { word: `last${teamId}`, guessedBy: lastBy },
  }
}

function play(settings: Partial<GameSettings>, ...turns: TurnRecord[]) {
  let game = createGame(teams, { ...DEFAULT_SETTINGS, ...settings })
  for (const t of turns) game = commitTurn(game, t)
  return game
}

describe('подсчёт очков', () => {
  it('угаданные +1, пропуски −1 при штрафе', () => {
    const game = play({ skipPenalty: true }, turn('a', 5, 2))
    expect(computeScores(game)).toEqual({ a: 3, b: 0 })
  })

  it('без штрафа пропуски не отнимают очки', () => {
    const game = play({ skipPenalty: false }, turn('a', 5, 2))
    expect(computeScores(game)).toEqual({ a: 5, b: 0 })
  })

  it('последнее слово может достаться чужой команде', () => {
    const game = play({}, turn('a', 3, 0, 'b'))
    expect(computeScores(game)).toEqual({ a: 3, b: 1 })
  })

  it('счёт может уйти в минус', () => {
    const game = play({ skipPenalty: true }, turn('a', 0, 3))
    expect(computeScores(game).a).toBe(-3)
  })
})

describe('очерёдность', () => {
  it('команды ходят по кругу, раунды считаются', () => {
    let game = play({})
    expect(currentTeam(game).id).toBe('a')
    expect(roundNumber(game)).toBe(1)
    game = commitTurn(game, turn('a', 1, 0))
    expect(currentTeam(game).id).toBe('b')
    game = commitTurn(game, turn('b', 1, 0))
    expect(currentTeam(game).id).toBe('a')
    expect(roundNumber(game)).toBe(2)
  })

  it('объясняющий меняется внутри команды', () => {
    let game = play({})
    expect(explainerFor(game, teams[0])).toBe('Аня')
    game = commitTurn(game, { ...turn('a', 1, 0), explainer: 'Аня' })
    game = commitTurn(game, turn('b', 1, 0))
    expect(explainerFor(game, teams[0])).toBe('Боря')
    expect(explainerFor(game, teams[1])).toBeNull()
    expect(guessersFor(teams[0], 'Боря')).toEqual(['Аня'])
  })
})

describe('победа', () => {
  it('не объявляется посреди круга', () => {
    const game = play({ targetScore: 5 }, turn('a', 6, 0))
    expect(findWinner(game)).toBeNull()
    expect(game.winnerId).toBeNull()
  })

  it('объявляется в конце круга', () => {
    const game = play({ targetScore: 5 }, turn('a', 6, 0), turn('b', 2, 0))
    expect(game.winnerId).toBe('a')
  })

  it('побеждает тот, у кого больше, даже если оба перешли порог', () => {
    const game = play({ targetScore: 5 }, turn('a', 6, 0), turn('b', 8, 0))
    expect(game.winnerId).toBe('b')
  })

  it('при ничьей играется ещё круг', () => {
    let game = play({ targetScore: 5 }, turn('a', 6, 0), turn('b', 6, 0))
    expect(game.winnerId).toBeNull()
    expect(isTieBreak(game)).toBe(true)
    game = commitTurn(game, turn('a', 1, 0))
    game = commitTurn(game, turn('b', 0, 0))
    expect(game.winnerId).toBe('a')
  })
})

describe('статистика', () => {
  it('считает угаданные слова и лучший ход', () => {
    const game = play(
      {},
      { ...turn('a', 4, 1, 'a'), explainer: 'Аня' },
      turn('b', 7, 0),
      { ...turn('a', 2, 0), explainer: 'Боря' },
    )
    const stats = gameStats(game)
    expect(stats.totalGuessed).toBe(4 + 1 + 7 + 2)
    expect(stats.totalSkipped).toBe(1)
    expect(stats.bestTurn).toMatchObject({ teamId: 'b', points: 7 })
    expect(stats.topExplainer).toMatchObject({ name: 'Аня', guessed: 5 })
  })
})
