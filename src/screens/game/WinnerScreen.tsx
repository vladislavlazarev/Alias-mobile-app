import { motion } from 'motion/react'
import { Crown, Home, RotateCcw, Trophy, Zap } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '../../components/Button'
import { Confetti } from '../../components/Confetti'
import { Screen } from '../../components/Screen'
import { TeamDot, teamStyle } from '../../components/TeamBadge'
import { gameStats, rankedTeams } from '../../game/engine'
import { plural } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useGame } from '../../store/gameStore'
import { useUi } from '../../store/uiStore'

export function WinnerScreen() {
  // Снимок на момент победы: после «Реванша» стор уже содержит новую партию, а экран ещё уезжает.
  const [game] = useState(() => useGame.getState().game!)
  const winner = game.teams.find((t) => t.id === game.winnerId)!
  const ranked = rankedTeams(game)
  const stats = gameStats(game)
  const bestTeam = stats.bestTurn ? game.teams.find((t) => t.id === stats.bestTurn!.teamId) : undefined

  return (
    <Screen>
      <Confetti />
      <div
        aria-hidden
        style={teamStyle(winner)}
        className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-(--team)/20 blur-3xl"
      />

      <div className="relative -mx-1 flex-1 overflow-y-auto px-1 pb-4 no-scrollbar">
        <div style={teamStyle(winner)} className="flex flex-col items-center pt-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, stiffness: 160 }}
            className="flex size-24 items-center justify-center rounded-[2rem] bg-(--team) text-ink-950 shadow-[0_20px_60px_-15px_var(--team)]"
          >
            <Trophy className="size-12" strokeWidth={2.2} />
          </motion.div>
          <div className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-ink-400">Победа!</div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 font-display text-[2.4rem] font-black leading-[1.05] tracking-tight text-balance break-words text-(--team)"
          >
            {winner.name}
          </motion.h1>
          <div className="mt-2 text-ink-300">
            {ranked[0].score} {plural(ranked[0].score, 'очко', 'очка', 'очков')} за {stats.turnsPlayed}{' '}
            {plural(stats.turnsPlayed, 'ход', 'хода', 'ходов')}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2.5">
          <Stat icon={<Zap className="size-4" />} value={String(stats.totalGuessed)} label="слов угадано" />
          {bestTeam && stats.bestTurn ? (
            <Stat
              icon={<Crown className="size-4" />}
              value={`+${stats.bestTurn.points}`}
              label={`лучший ход: ${stats.bestTurn.explainer ?? bestTeam.name}`}
            />
          ) : null}
          {stats.topExplainer ? (
            <div className="col-span-2">
              <Stat
                icon={<Crown className="size-4" />}
                value={stats.topExplainer.name}
                label={`лучший объясняющий · ${stats.topExplainer.guessed} ${plural(stats.topExplainer.guessed, 'слово', 'слова', 'слов')}`}
              />
            </div>
          ) : null}
        </div>

        <ol className="mt-6 flex flex-col gap-1.5">
          {ranked.map((t, i) => (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-ink-850 px-4 py-3 ring-1 ring-inset ring-ink-750">
              <span className="w-4 font-display text-sm font-bold text-ink-500 tabular">{i + 1}</span>
              <TeamDot team={t} />
              <span className="min-w-0 flex-1 truncate font-semibold">{t.name}</span>
              <span className="font-display text-lg font-bold tabular">{t.score}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative flex flex-col gap-2.5 pt-2">
        <Button
          size="xl"
          block
          icon={<RotateCcw className="size-5" />}
          onClick={() => {
            haptic.medium()
            useGame.getState().rematch()
          }}
        >
          Реванш
        </Button>
        <Button
          variant="secondary"
          block
          icon={<Home className="size-4" />}
          onClick={() => {
            useGame.getState().quitGame()
            useUi.getState().go('home', -1)
          }}
        >
          В меню
        </Button>
      </div>
    </Screen>
  )
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="h-full rounded-3xl bg-ink-850 p-4 ring-1 ring-inset ring-ink-750">
      <div className="flex items-center gap-1.5 text-acid-400">{icon}</div>
      <div className="mt-2 truncate font-display text-2xl font-black tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs leading-snug text-ink-400">{label}</div>
    </div>
  )
}
