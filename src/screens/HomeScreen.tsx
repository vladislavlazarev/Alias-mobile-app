import { motion } from 'motion/react'
import { BookOpen, Drama, Layers, MessageSquareQuote, Play, Settings2, Sparkles, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, IconButton } from '../components/Button'
import { Wordmark } from '../components/Logo'
import { Card, Screen, SectionLabel } from '../components/Screen'
import { TeamDot } from '../components/TeamBadge'
import { ALL_WORDS, BASE_CATEGORIES, EXTRA_PACKS, TOTAL_WORDS } from '../data/wordpack'
import { unseenCount } from '../game/deck'
import { rankedTeams, roundNumber } from '../game/engine'
import { levelsLabel } from '../game/presets'
import { formatNumber, plural, pluralCount } from '../lib/format'
import { sfx } from '../lib/sound'
import { useGame } from '../store/gameStore'
import { getSeen, useSeenVersion } from '../store/seenWords'
import { useUi } from '../store/uiStore'
import { startNewGameFlow } from './navigation'

export function HomeScreen() {
  useSeenVersion()
  const game = useGame((s) => s.game)
  const go = useUi((s) => s.go)
  const fresh = unseenCount(ALL_WORDS, getSeen())
  const seenShare = TOTAL_WORDS ? 1 - fresh / TOTAL_WORDS : 0
  const activeGame = game && !game.winnerId ? game : null

  return (
    <Screen>
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-80" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-acid-400/10 blur-3xl"
      />

      <header className="relative flex items-center justify-between pt-2">
        <Wordmark />
        <IconButton label="Настройки" onClick={() => go('settings')}>
          <Settings2 className="size-5" />
        </IconButton>
      </header>

      <div className="relative -mx-1 mt-6 flex-1 overflow-y-auto px-1 pb-4 no-scrollbar">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[1.7rem] font-bold leading-[1.15] tracking-tight text-balance"
        >
          Объясняй слова, <span className="text-acid-400">не называя</span> их.
        </motion.p>

        <Card className="mt-6 overflow-hidden p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-display text-4xl font-black tabular tracking-tight">{formatNumber(TOTAL_WORDS)}</div>
              <div className="mt-1 text-sm text-ink-400">
                {plural(TOTAL_WORDS, 'слово', 'слова', 'слов')} · {BASE_CATEGORIES.length} тем
                {EXTRA_PACKS.length > 0 ? ` · ${pluralCount(EXTRA_PACKS.length, 'набор', 'набора', 'наборов')}` : ''}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-bold tabular text-acid-400">{formatNumber(fresh)}</div>
              <div className="text-xs text-ink-400">ещё не видели</div>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-750">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-aqua-400 to-acid-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(2, (1 - seenShare) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
            <Sparkles className="size-3.5 text-acid-400" />
            Слова не повторяются, пока вы не увидите все
          </p>
        </Card>

        {activeGame ? <ContinueCard /> : null}

        <div className="mt-7">
          <SectionLabel aside="скоро больше">Режимы</SectionLabel>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <ModeCard
            active
            icon={<Users className="size-5" />}
            title="Классика"
            text="Команды, таймер, темы и наборы на выбор"
            onClick={() => {
              sfx.unlock()
              startNewGameFlow()
            }}
          />
          <ModeCard icon={<Drama className="size-5" />} title="Крокодил" text="Показывай жестами, без слов" />
          <ModeCard icon={<MessageSquareQuote className="size-5" />} title="Одно слово" text="Объясни, сказав всего одно слово" />
          <ModeCard icon={<Layers className="size-5" />} title="Шляпа" text="Свои слова от каждого игрока" />
        </div>
      </div>

      <div className="relative flex flex-col gap-2.5 pt-2">
        <Button
          size="xl"
          block
          icon={<Play className="size-5 fill-current" />}
          onClick={() => {
            sfx.unlock()
            startNewGameFlow()
          }}
        >
          Новая игра
        </Button>
        <Button variant="ghost" size="md" icon={<BookOpen className="size-4" />} onClick={() => go('rules')}>
          Как играть
        </Button>
      </div>
    </Screen>
  )
}

function ContinueCard() {
  const game = useGame((s) => s.game)!
  const go = useUi((s) => s.go)
  const teams = rankedTeams(game)

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => {
        sfx.unlock()
        go('game')
      }}
      className="glow-acid mt-3 block w-full rounded-3xl bg-ink-850 p-5 text-left transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-acid-400">Партия идёт</div>
          <div className="mt-1 font-display text-lg font-bold">
            Раунд {roundNumber(game)} · {levelsLabel(game.settings.levels)}
          </div>
        </div>
        <span className="flex size-12 items-center justify-center rounded-2xl bg-acid-400 text-ink-950">
          <Play className="size-5 fill-current" />
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {teams.slice(0, 4).map((t) => (
          <div key={t.id} className="flex items-center gap-2.5 text-sm">
            <TeamDot team={t} />
            <span className="min-w-0 flex-1 truncate text-ink-200">{t.name}</span>
            <span className="font-display font-bold tabular">{t.score}</span>
            <span className="w-12 text-right text-xs text-ink-500">/ {game.settings.targetScore}</span>
          </div>
        ))}
      </div>
    </motion.button>
  )
}

function ModeCard({
  icon,
  title,
  text,
  active,
  onClick,
}: {
  icon: ReactNode
  title: string
  text: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={!active}
      onClick={onClick}
      className={
        active
          ? 'relative flex flex-col items-start rounded-3xl bg-acid-400/10 p-4 text-left ring-1 ring-inset ring-acid-400/40 transition active:scale-[0.98]'
          : 'relative flex flex-col items-start rounded-3xl bg-ink-900 p-4 text-left ring-1 ring-inset ring-ink-800'
      }
    >
      <span
        className={
          active
            ? 'flex size-10 items-center justify-center rounded-xl bg-acid-400 text-ink-950'
            : 'flex size-10 items-center justify-center rounded-xl bg-ink-800 text-ink-500'
        }
      >
        {icon}
      </span>
      <span className={active ? 'mt-3 font-display font-bold' : 'mt-3 font-display font-bold text-ink-400'}>{title}</span>
      <span className={active ? 'mt-1 text-xs leading-snug text-ink-300' : 'mt-1 text-xs leading-snug text-ink-500'}>
        {text}
      </span>
      {!active ? (
        <span className="absolute top-3 right-3 rounded-full bg-ink-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
          скоро
        </span>
      ) : null}
    </button>
  )
}
