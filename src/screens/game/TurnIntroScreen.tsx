import { motion } from 'motion/react'
import { ArrowDown, ArrowUp, Home, Mic, Swords } from 'lucide-react'
import { Button, IconButton } from '../../components/Button'
import { Screen } from '../../components/Screen'
import { teamStyle } from '../../components/TeamBadge'
import { computeScores, guessersFor, isTieBreak, roundNumber } from '../../game/engine'
import { difficultyTitle } from '../../game/presets'
import { plural } from '../../lib/format'
import { useLatest } from '../../lib/useLatest'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { useGame } from '../../store/gameStore'
import { usePrefs } from '../../store/prefsStore'
import { exitToMenu } from '../navigation'

export function TurnIntroScreen() {
  const game = useLatest(useGame((s) => s.game))
  const turn = useLatest(useGame((s) => s.turn))
  const startCountdown = useGame((s) => s.startCountdown)
  const tutorialSeen = usePrefs((s) => s.tutorialSeen)

  const team = game.teams.find((t) => t.id === turn.teamId)!
  const score = computeScores(game)[team.id]
  const left = Math.max(0, game.settings.targetScore - score)
  const guessers = guessersFor(team, turn.explainer)
  const tieBreak = isTieBreak(game)

  return (
    <Screen>
      <div
        aria-hidden
        style={teamStyle(team)}
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-(--team)/15 blur-3xl"
      />
      <header className="relative flex items-center justify-between pb-2">
        <IconButton label="В меню" onClick={exitToMenu}>
          <Home className="size-5" />
        </IconButton>
        <div className="text-center">
          <div className="font-display text-sm font-bold">Раунд {roundNumber(game)}</div>
          <div className="text-xs text-ink-400">
            {difficultyTitle(game.settings.difficulty)} · {game.settings.roundSeconds} сек
          </div>
        </div>
        <div className="size-11" />
      </header>

      <div style={teamStyle(team)} className="relative flex flex-1 flex-col items-center justify-center text-center">
        {tieBreak ? (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sun-400/15 px-4 py-2 text-sm font-bold text-sun-300 ring-1 ring-sun-400/30">
            <Swords className="size-4" /> Ничья! Играем ещё круг
          </div>
        ) : null}

        <div className="text-sm font-bold uppercase tracking-[0.18em] text-ink-400">Ход команды</div>
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 180 }}
          className="mt-3 max-w-full font-display text-[2.6rem] font-black leading-[1.05] tracking-tight text-balance break-words text-(--team)"
        >
          {team.name}
        </motion.h1>

        {turn.explainer ? (
          <div className="mt-8 flex flex-col items-center">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-(--team)/40 animate-pulse-ring" />
              <span className="relative flex size-20 items-center justify-center rounded-full bg-(--team) font-display text-3xl font-black text-ink-950">
                {turn.explainer.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-ink-400">
              <Mic className="size-4" /> Объясняет
            </div>
            <div className="font-display text-2xl font-bold">{turn.explainer}</div>
            {guessers.length > 0 ? (
              <div className="mt-2 max-w-xs text-sm text-ink-400">Угадывают: {guessers.join(', ')}</div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex items-center gap-6 rounded-2xl bg-ink-850/80 px-5 py-3 ring-1 ring-inset ring-ink-750">
          <div>
            <div className="font-display text-2xl font-bold tabular">{score}</div>
            <div className="text-xs text-ink-400">{plural(score, 'очко', 'очка', 'очков')}</div>
          </div>
          <div className="h-8 w-px bg-ink-700" />
          <div>
            <div className="font-display text-2xl font-bold tabular text-(--team)">{left}</div>
            <div className="text-xs text-ink-400">до победы</div>
          </div>
        </div>

        {!tutorialSeen ? (
          <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-2 text-sm font-semibold">
            <div className="flex items-center gap-2 rounded-2xl bg-acid-400/10 px-3 py-2.5 text-acid-300 ring-1 ring-inset ring-acid-400/25">
              <ArrowUp className="size-4 shrink-0" /> Вверх — угадали
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-hot-400/10 px-3 py-2.5 text-hot-300 ring-1 ring-inset ring-hot-400/25">
              <ArrowDown className="size-4 shrink-0" /> Вниз — пропуск
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative flex flex-col items-center gap-3 pt-2">
        <p className="text-sm text-ink-500">
          {turn.explainer ? `Передайте телефон: ${turn.explainer}` : 'Передайте телефон объясняющему'}
        </p>
        <Button
          size="xl"
          block
          onClick={() => {
            sfx.unlock()
            haptic.medium()
            startCountdown()
          }}
        >
          Я готов!
        </Button>
      </div>
    </Screen>
  )
}
