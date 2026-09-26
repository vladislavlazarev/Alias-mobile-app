import { motion } from 'motion/react'
import { ArrowRight, Home, Mic } from 'lucide-react'
import { Button, IconButton } from '../../components/Button'
import { Screen, SectionLabel, TopBar } from '../../components/Screen'
import { TeamDot, teamStyle } from '../../components/TeamBadge'
import { currentTeam, explainerFor, rankedTeams, roundNumber, turnPointsFor } from '../../game/engine'
import { signed } from '../../lib/format'
import { useLatest } from '../../lib/useLatest'
import { haptic } from '../../lib/haptics'
import { useGame } from '../../store/gameStore'
import { exitToMenu } from '../navigation'

export function ScoreboardScreen() {
  const game = useLatest(useGame((s) => s.game))
  const prepareTurn = useGame((s) => s.prepareTurn)

  const ranked = rankedTeams(game)
  const lastTurn = game.turns.at(-1)
  const next = currentTeam(game)
  const nextExplainer = explainerFor(game, next)
  const target = game.settings.targetScore
  const round = roundNumber(game)
  const turnInRound = (game.turns.length % game.teams.length) + 1

  return (
    <Screen>
      <TopBar
        title="Счёт"
        subtitle={`Раунд ${round} · ход ${turnInRound} из ${game.teams.length} · игра до ${target}`}
        right={
          <IconButton label="В меню" onClick={exitToMenu}>
            <Home className="size-5" />
          </IconButton>
        }
      />

      <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-2 pb-4 no-scrollbar">
        <ol className="flex flex-col gap-2.5">
          {ranked.map((team, i) => {
            const delta = lastTurn ? turnPointsFor(lastTurn, team.id, game.settings) : 0
            const justPlayed = lastTurn?.teamId === team.id || delta !== 0
            const progress = Math.max(0, Math.min(1, team.score / target))
            return (
              <motion.li
                key={team.id}
                layout
                style={teamStyle(team)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-3xl bg-ink-850 p-4 ring-1 ring-inset ring-ink-750"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-display text-sm font-bold text-ink-500 tabular">{i + 1}</span>
                  <TeamDot team={team} />
                  <span className="min-w-0 flex-1 truncate font-display font-bold">{team.name}</span>
                  <span className="text-right font-display text-2xl font-black tabular">{team.score}</span>
                </div>
                <div className="mt-2.5 ml-8 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-750">
                    <motion.div
                      className="h-full rounded-full bg-(--team)"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 + i * 0.05 }}
                    />
                  </div>
                  {justPlayed ? (
                    <span className="min-w-9 text-right text-xs font-bold text-(--team) tabular">{delta === 0 ? '+0' : signed(delta)}</span>
                  ) : (
                    <span className="min-w-9" />
                  )}
                </div>
              </motion.li>
            )
          })}
        </ol>

        <div className="mt-7">
          <SectionLabel>Следующий ход</SectionLabel>
          <div
            style={teamStyle(next)}
            className="flex items-center gap-3 rounded-3xl bg-(--team)/10 p-4 ring-1 ring-inset ring-(--team)/30"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-(--team) font-display text-lg font-black text-ink-950">
              {(nextExplainer ?? next.name).slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-bold text-(--team)">{next.name}</div>
              {nextExplainer ? (
                <div className="flex items-center gap-1 text-sm text-ink-300">
                  <Mic className="size-3.5" /> объясняет {nextExplainer}
                </div>
              ) : (
                <div className="text-sm text-ink-400">готовятся объяснять</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          size="xl"
          block
          iconRight={<ArrowRight className="size-5" />}
          onClick={() => {
            haptic.light()
            prepareTurn()
          }}
        >
          Следующий ход
        </Button>
      </div>
    </Screen>
  )
}
