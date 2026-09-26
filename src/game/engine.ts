import type { Game, GameSettings, Team, TurnRecord, WordResult } from './types'

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function createGame(teams: Team[], settings: GameSettings): Game {
  return {
    id: uid(),
    createdAt: Date.now(),
    settings: { ...settings },
    teams: teams.map((t) => ({ ...t, players: t.players.filter((p) => p.trim().length > 0) })),
    turns: [],
    explainerCursor: Object.fromEntries(teams.map((t) => [t.id, 0])),
    winnerId: null,
  }
}

/** Очки, которые ход приносит команде teamId (последнее слово может достаться чужой команде). */
export function turnPointsFor(turn: TurnRecord, teamId: string, settings: GameSettings): number {
  let points = 0
  if (turn.teamId === teamId) {
    for (const w of turn.words) {
      if (w.status === 'guessed') points += 1
      else if (settings.skipPenalty) points -= 1
    }
  }
  if (turn.lastWord?.guessedBy === teamId) points += 1
  return points
}

export function draftPoints(results: WordResult[], settings: GameSettings): number {
  return results.reduce(
    (sum, w) => sum + (w.status === 'guessed' ? 1 : settings.skipPenalty ? -1 : 0),
    0,
  )
}

export function computeScores(game: Game): Record<string, number> {
  const scores: Record<string, number> = Object.fromEntries(game.teams.map((t) => [t.id, 0]))
  for (const turn of game.turns) {
    for (const team of game.teams) {
      scores[team.id] += turnPointsFor(turn, team.id, game.settings)
    }
  }
  return scores
}

export function currentTeam(game: Game): Team {
  return game.teams[game.turns.length % game.teams.length]
}

/** Номер раунда (круга), начиная с 1. */
export function roundNumber(game: Game): number {
  return Math.floor(game.turns.length / game.teams.length) + 1
}

export function explainerFor(game: Game, team: Team): string | null {
  if (team.players.length === 0) return null
  const cursor = game.explainerCursor[team.id] ?? 0
  return team.players[cursor % team.players.length]
}

/** Остальные игроки команды — те, кто угадывает. */
export function guessersFor(team: Team, explainer: string | null): string[] {
  if (!explainer) return team.players
  const idx = team.players.indexOf(explainer)
  return team.players.filter((_, i) => i !== idx)
}

/**
 * Победитель определяется только в конце круга, чтобы у всех команд было одинаковое число ходов.
 * При равенстве лидеров игра продолжается ещё один круг.
 */
export function findWinner(game: Game): string | null {
  const n = game.teams.length
  if (game.turns.length === 0 || game.turns.length % n !== 0) return null
  const scores = computeScores(game)
  const max = Math.max(...Object.values(scores))
  if (max < game.settings.targetScore) return null
  const leaders = game.teams.filter((t) => scores[t.id] === max)
  return leaders.length === 1 ? leaders[0].id : null
}

export function isTieBreak(game: Game): boolean {
  const n = game.teams.length
  if (game.turns.length === 0 || game.turns.length % n !== 0) return false
  const scores = computeScores(game)
  const max = Math.max(...Object.values(scores))
  return max >= game.settings.targetScore && game.teams.filter((t) => scores[t.id] === max).length > 1
}

export function commitTurn(game: Game, turn: TurnRecord): Game {
  const next: Game = {
    ...game,
    turns: [...game.turns, turn],
    explainerCursor: {
      ...game.explainerCursor,
      [turn.teamId]: (game.explainerCursor[turn.teamId] ?? 0) + 1,
    },
  }
  next.winnerId = findWinner(next)
  return next
}

export function rankedTeams(game: Game): Array<Team & { score: number }> {
  const scores = computeScores(game)
  return game.teams
    .map((t) => ({ ...t, score: scores[t.id] }))
    .sort((a, b) => b.score - a.score)
}

export interface GameStats {
  totalGuessed: number
  totalSkipped: number
  bestTurn: { teamId: string; explainer: string | null; points: number } | null
  topExplainer: { name: string; teamId: string; guessed: number } | null
  turnsPlayed: number
}

export function gameStats(game: Game): GameStats {
  let totalGuessed = 0
  let totalSkipped = 0
  let bestTurn: GameStats['bestTurn'] = null
  const byExplainer = new Map<string, { name: string; teamId: string; guessed: number }>()

  for (const turn of game.turns) {
    const guessed = turn.words.filter((w) => w.status === 'guessed').length
    const skipped = turn.words.length - guessed
    totalGuessed += guessed + (turn.lastWord?.guessedBy ? 1 : 0)
    totalSkipped += skipped
    const points = turnPointsFor(turn, turn.teamId, game.settings)
    if (!bestTurn || points > bestTurn.points) {
      bestTurn = { teamId: turn.teamId, explainer: turn.explainer, points }
    }
    if (turn.explainer) {
      const key = `${turn.teamId}:${turn.explainer}`
      const entry = byExplainer.get(key) ?? { name: turn.explainer, teamId: turn.teamId, guessed: 0 }
      entry.guessed += guessed + (turn.lastWord?.guessedBy === turn.teamId ? 1 : 0)
      byExplainer.set(key, entry)
    }
  }

  let topExplainer: GameStats['topExplainer'] = null
  for (const e of byExplainer.values()) {
    if (!topExplainer || e.guessed > topExplainer.guessed) topExplainer = e
  }

  return { totalGuessed, totalSkipped, bestTurn, topExplainer, turnsPlayed: game.turns.length }
}
