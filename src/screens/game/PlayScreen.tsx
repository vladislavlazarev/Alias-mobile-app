import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { Check, Flag, Home, Pause, Play, SkipForward, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, IconButton } from '../../components/Button'
import { FitWord } from '../../components/FitWord'
import { Screen } from '../../components/Screen'
import { teamStyle } from '../../components/TeamBadge'
import { categoryOf } from '../../data/wordpack'
import { draftPoints } from '../../game/engine'
import type { WordStatus } from '../../game/types'
import { cx } from '../../lib/cx'
import { signed } from '../../lib/format'
import { useLatest } from '../../lib/useLatest'
import { haptic } from '../../lib/haptics'
import { onAppHidden } from '../../lib/native'
import { sfx } from '../../lib/sound'
import { useGame } from '../../store/gameStore'
import { usePrefs } from '../../store/prefsStore'
import { useUi } from '../../store/uiStore'
import { exitToMenu } from '../navigation'

export function PlayScreen() {
  const phase = useGame((s) => s.turn?.phase)
  const reshuffles = useGame((s) => s.reshuffles)
  const lastReshuffles = useRef(reshuffles)

  useEffect(() => {
    if (reshuffles > lastReshuffles.current) {
      useUi.getState().showToast('Вы увидели все слова этого уровня — колода перемешана заново')
    }
    lastReshuffles.current = reshuffles
  }, [reshuffles])

  useEffect(() => onAppHidden(() => useGame.getState().pause()), [])

  if (phase === 'countdown') return <Countdown />
  return <RoundView />
}

function Countdown() {
  const startRound = useGame((s) => s.startRound)
  const [n, setN] = useState(3)

  useEffect(() => {
    if (n === 0) {
      sfx.go()
      haptic.heavy()
      usePrefs.getState().markTutorialSeen()
      startRound()
      return
    }
    sfx.countdown()
    haptic.light()
    const t = setTimeout(() => setN(n - 1), 650)
    return () => clearTimeout(t)
  }, [n, startRound])

  return (
    <div className="flex h-full items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={n}
          initial={{ scale: 2.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: 'spring', damping: 16, stiffness: 260 }}
          className="font-display text-[9rem] font-black leading-none text-acid-400 tabular"
        >
          {n > 0 ? n : 'Го!'}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function useRemainingMs(endsAt: number | null, remainingMs: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!endsAt) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [endsAt])
  return endsAt ? Math.max(0, endsAt - now) : remainingMs
}

function RoundView() {
  const game = useLatest(useGame((s) => s.game))
  const turn = useLatest(useGame((s) => s.turn))
  const { answer, pause, timeUp } = useGame.getState()
  const [dir, setDir] = useState<1 | -1>(1)

  const team = game.teams.find((t) => t.id === turn.teamId)!
  const total = game.settings.roundSeconds * 1000
  const ms = useRemainingMs(turn.phase === 'running' ? turn.endsAt : null, turn.remainingMs)
  const secs = Math.ceil(ms / 1000)
  const running = turn.phase === 'running'
  const lastWord = turn.phase === 'lastword'
  const urgent = running && secs <= 10

  useEffect(() => {
    if (running && secs <= 5 && secs > 0) {
      sfx.tick()
      haptic.light()
    }
  }, [secs, running])

  const expired = running && ms <= 0
  useEffect(() => {
    if (!expired) return
    sfx.timeUp()
    haptic.warning()
    timeUp()
  }, [expired, timeUp])

  const onAnswer = (status: WordStatus) => {
    if (!running || ms <= 0) return
    setDir(status === 'guessed' ? 1 : -1)
    if (status === 'guessed') {
      sfx.correct()
      haptic.medium()
    } else {
      sfx.skip()
      haptic.light()
    }
    answer(status)
  }

  const guessed = turn.results.filter((r) => r.status === 'guessed').length
  const skipped = turn.results.length - guessed
  const points = draftPoints(turn.results, game.settings)

  return (
    <Screen className="gap-3">
      <header style={teamStyle(team)} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <IconButton label="Пауза" onClick={pause} disabled={!running} className="disabled:opacity-40">
          <Pause className="size-5 fill-current" />
        </IconButton>
        <div className="min-w-0 text-center">
          <motion.div
            key={urgent ? secs : 'calm'}
            initial={urgent ? { scale: 1.25 } : false}
            animate={{ scale: 1 }}
            className={cx(
              'font-display text-4xl font-black leading-none tabular tracking-tight',
              lastWord ? 'text-sun-400' : urgent ? 'text-hot-400' : 'text-ink-100',
            )}
          >
            {lastWord ? '0:00' : formatClock(secs)}
          </motion.div>
          <div className="mt-1.5 truncate text-xs font-bold text-(--team)">
            {team.name}
            {turn.explainer ? <span className="text-ink-400"> · {turn.explainer}</span> : null}
          </div>
        </div>
        <div
          aria-label="Очки за ход"
          className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-ink-800/80 px-2.5 font-display text-base font-bold tabular ring-1 ring-inset ring-ink-700"
        >
          {signed(points)}
        </div>
      </header>

      <div className="h-1.5 overflow-hidden rounded-full bg-ink-800" style={teamStyle(team)}>
        <div
          className={cx(
            'h-full rounded-full transition-[width] duration-100 ease-linear',
            urgent ? 'bg-hot-400' : lastWord ? 'bg-sun-400' : 'bg-(--team)',
          )}
          style={{ width: `${(ms / total) * 100}%` }}
        />
      </div>

      <div className="relative flex-1">
        <AnimatePresence custom={dir} initial={false}>
          {turn.current ? (
            <WordCard
              key={`${turn.results.length}:${turn.current}`}
              word={turn.current}
              draggable={running}
              lastWord={lastWord}
              onAnswer={onAnswer}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {lastWord ? (
        <LastWordPanel />
      ) : (
        <>
          <div className="flex items-center justify-center gap-5 text-sm font-bold tabular">
            <span className="flex items-center gap-1.5 text-acid-400">
              <Check className="size-4" strokeWidth={3} /> {guessed}
            </span>
            <span className="flex items-center gap-1.5 text-hot-400">
              <X className="size-4" strokeWidth={3} /> {skipped}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!running}
              onClick={() => onAnswer('skipped')}
              className="flex h-20 flex-col items-center justify-center gap-1 rounded-3xl bg-hot-400/12 text-hot-300 ring-1 ring-inset ring-hot-400/30 transition active:scale-95 disabled:opacity-50"
            >
              <SkipForward className="size-6" />
              <span className="font-display text-sm font-bold">Пропуск</span>
            </button>
            <button
              type="button"
              disabled={!running}
              onClick={() => onAnswer('guessed')}
              className="flex h-20 flex-col items-center justify-center gap-1 rounded-3xl bg-acid-400 text-ink-950 shadow-[0_12px_32px_-12px_rgb(198_242_78/0.7)] transition active:scale-95 disabled:opacity-50"
            >
              <Check className="size-7" strokeWidth={3} />
              <span className="font-display text-sm font-bold">Угадали</span>
            </button>
          </div>
        </>
      )}

      <AnimatePresence>{turn.phase === 'paused' ? <PauseOverlay ms={ms} /> : null}</AnimatePresence>
    </Screen>
  )
}

function formatClock(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const cardVariants = {
  enter: { scale: 0.9, opacity: 0, y: 24 },
  center: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 300 } },
  exit: (dir: number) => ({
    y: dir * -700,
    opacity: 0,
    rotate: dir * -6,
    transition: { duration: 0.28, ease: 'easeIn' as const },
  }),
}

function WordCard({
  word,
  draggable,
  lastWord,
  onAnswer,
}: {
  word: string
  draggable: boolean
  lastWord: boolean
  onAnswer: (s: WordStatus) => void
}) {
  const y = useMotionValue(0)
  const rotate = useTransform(y, [-240, 0, 240], [-5, 0, 5])
  const guessOpacity = useTransform(y, [-150, -20], [1, 0])
  const skipOpacity = useTransform(y, [20, 150], [0, 1])
  const category = categoryOf(word)

  return (
    <motion.div
      className="absolute inset-0 touch-none"
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      style={{ y, rotate }}
      drag={draggable ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.y < -90 || info.velocity.y < -650) onAnswer('guessed')
        else if (info.offset.y > 90 || info.velocity.y > 650) onAnswer('skipped')
      }}
    >
      <div
        className={cx(
          'relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[2.25rem] bg-ink-850 px-6 ring-1 ring-inset',
          lastWord ? 'ring-2 ring-sun-400 shadow-[0_0_60px_-10px_rgb(255_210_63/0.45)]' : 'ring-ink-700',
        )}
      >
        <motion.div style={{ opacity: guessOpacity }} className="pointer-events-none absolute inset-0 bg-acid-400/15">
          <div className="absolute inset-x-0 top-6 text-center font-display text-sm font-black tracking-[0.3em] text-acid-400">
            УГАДАЛИ
          </div>
        </motion.div>
        <motion.div style={{ opacity: skipOpacity }} className="pointer-events-none absolute inset-0 bg-hot-400/15">
          <div className="absolute inset-x-0 bottom-6 text-center font-display text-sm font-black tracking-[0.3em] text-hot-400">
            ПРОПУСК
          </div>
        </motion.div>

        {lastWord ? (
          <div className="absolute top-5 flex items-center gap-1.5 rounded-full bg-sun-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sun-300">
            <Flag className="size-3.5" /> Последнее слово
          </div>
        ) : category ? (
          <div className="absolute top-5 text-xs font-semibold text-ink-500">
            {category.emoji} {category.name}
          </div>
        ) : null}

        <FitWord word={word} />

        {draggable ? (
          <div className="absolute bottom-5 flex flex-col items-center gap-0.5 text-[11px] font-semibold text-ink-600">
            <span>↑ угадали · пропуск ↓</span>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

function LastWordPanel() {
  const game = useLatest(useGame((s) => s.game))
  const turn = useLatest(useGame((s) => s.turn))
  const resolveLastWord = useGame((s) => s.resolveLastWord)

  const resolve = (teamId: string | null) => {
    if (teamId) {
      sfx.correct()
      haptic.medium()
    } else {
      haptic.light()
    }
    resolveLastWord(teamId)
  }

  if (!game.settings.lastWordForAll) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-center font-display text-lg font-bold text-sun-300">Время вышло! Успели угадать?</p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="danger" size="xl" onClick={() => resolve(null)}>
            Нет
          </Button>
          <Button size="xl" onClick={() => resolve(turn.teamId)}>
            Угадали
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-center font-display text-lg font-bold text-sun-300">Время вышло! Кто угадал?</p>
      <div className={cx('grid gap-2', game.teams.length > 3 ? 'grid-cols-2' : 'grid-cols-1')}>
        {game.teams.map((t) => (
          <button
            key={t.id}
            type="button"
            style={teamStyle(t)}
            onClick={() => resolve(t.id)}
            className="flex h-13 items-center justify-center gap-2 truncate rounded-2xl bg-(--team)/12 px-3 font-display text-sm font-bold text-(--team) ring-1 ring-inset ring-(--team)/35 transition active:scale-95"
          >
            <span className="size-2 shrink-0 rounded-full bg-(--team)" />
            <span className="truncate">{t.name}</span>
          </button>
        ))}
      </div>
      <Button variant="secondary" size="md" onClick={() => resolve(null)}>
        Никто не угадал
      </Button>
    </div>
  )
}

function PauseOverlay({ ms }: { ms: number }) {
  const resume = useGame((s) => s.resume)
  const endTurnEarly = useGame((s) => s.endTurnEarly)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-ink-950/90 px-safe pt-safe pb-safe backdrop-blur-xl"
    >
      <div className="text-sm font-bold uppercase tracking-[0.2em] text-ink-400">Пауза</div>
      <div className="font-display text-7xl font-black tabular">{formatClock(Math.ceil(ms / 1000))}</div>
      <p className="mb-6 text-sm text-ink-400">Слово скрыто, чтобы никто не подсмотрел</p>
      <div className="flex w-full max-w-xs flex-col gap-2.5">
        <Button size="xl" icon={<Play className="size-5 fill-current" />} onClick={resume}>
          Продолжить
        </Button>
        <Button variant="secondary" onClick={endTurnEarly}>
          Закончить ход
        </Button>
        <Button variant="ghost" icon={<Home className="size-4" />} onClick={exitToMenu}>
          Выйти в меню
        </Button>
      </div>
    </motion.div>
  )
}
