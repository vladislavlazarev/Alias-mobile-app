import { Flag, MinusCircle, Play, Timer, Trophy } from 'lucide-react'
import { Button } from '../components/Button'
import { ChipGroup } from '../components/ChipGroup'
import { Card, Screen, SectionLabel, TopBar } from '../components/Screen'
import { Toggle } from '../components/Toggle'
import { POOLS } from '../data/wordpack'
import { DIFFICULTIES, ROUND_TIMES, TARGET_SCORES, type DifficultyMeta } from '../game/presets'
import { haptic } from '../lib/haptics'
import { cx } from '../lib/cx'
import { formatNumber, plural } from '../lib/format'
import { sfx } from '../lib/sound'
import { useGame } from '../store/gameStore'
import { usePrefs } from '../store/prefsStore'
import { useUi } from '../store/uiStore'

export function SetupRulesScreen() {
  const settings = useUi((s) => s.setupSettings)
  const setSettings = useUi((s) => s.setSettings)
  const go = useUi((s) => s.go)

  const start = () => {
    const { setupTeams, setupSettings } = useUi.getState()
    sfx.unlock()
    haptic.medium()
    usePrefs.getState().rememberSetup(setupTeams, setupSettings)
    useGame.getState().startGame(setupTeams, setupSettings)
    go('game')
  }

  return (
    <Screen>
      <TopBar title="Правила" subtitle="Шаг 2 из 2" onBack={() => go('setup-teams', -1)} />

      <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-2 pb-4 no-scrollbar">
        <SectionLabel>Сложность слов</SectionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {DIFFICULTIES.map((d) => (
            <DifficultyCard
              key={d.id}
              meta={d}
              active={settings.difficulty === d.id}
              onClick={() => {
                haptic.light()
                setSettings({ difficulty: d.id })
              }}
            />
          ))}
        </div>

        <div className="mt-7">
          <SectionLabel aside={<Timer className="size-3.5" />}>Время раунда</SectionLabel>
          <ChipGroup
            options={ROUND_TIMES}
            value={settings.roundSeconds as (typeof ROUND_TIMES)[number]}
            onChange={(v) => setSettings({ roundSeconds: v })}
            suffix="сек"
          />
        </div>

        <div className="mt-7">
          <SectionLabel aside={<Trophy className="size-3.5" />}>Очки до победы</SectionLabel>
          <ChipGroup
            options={TARGET_SCORES}
            value={settings.targetScore as (typeof TARGET_SCORES)[number]}
            onChange={(v) => setSettings({ targetScore: v })}
            suffix="очков"
          />
        </div>

        <div className="mt-7">
          <SectionLabel>Дополнительно</SectionLabel>
          <Card className="divide-y divide-ink-750">
            <Toggle
              icon={<MinusCircle className="size-5" />}
              label="Штраф за пропуск"
              description="−1 очко за каждое пропущенное слово"
              checked={settings.skipPenalty}
              onChange={(v) => setSettings({ skipPenalty: v })}
            />
            <Toggle
              icon={<Flag className="size-5" />}
              label="Последнее слово — для всех"
              description="Когда время вышло, угадать слово может любая команда"
              checked={settings.lastWordForAll}
              onChange={(v) => setSettings({ lastWordForAll: v })}
            />
          </Card>
        </div>
      </div>

      <div className="pt-2">
        <Button size="xl" block icon={<Play className="size-5 fill-current" />} onClick={start}>
          Начать игру
        </Button>
      </div>
    </Screen>
  )
}

function DifficultyCard({ meta, active, onClick }: { meta: DifficultyMeta; active: boolean; onClick: () => void }) {
  const count = POOLS[meta.id].length
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'flex flex-col items-start rounded-3xl p-4 text-left transition-all duration-150 active:scale-[0.98]',
        active ? 'bg-acid-400 text-ink-950 shadow-[0_12px_32px_-12px_rgb(198_242_78/0.7)]' : 'bg-ink-850 ring-1 ring-inset ring-ink-750',
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="font-display text-[17px] font-bold tracking-tight">{meta.title}</span>
        <Dots n={meta.dots} active={active} />
      </div>
      <span className={cx('mt-1 text-xs leading-snug', active ? 'text-ink-900/75' : 'text-ink-400')}>{meta.hint}</span>
      <span className={cx('mt-3 text-sm font-semibold italic leading-snug', active ? 'text-ink-950' : 'text-ink-200')}>
        {meta.examples.join(', ')}…
      </span>
      <span className={cx('mt-2 text-xs font-bold tabular', active ? 'text-ink-900/70' : 'text-ink-500')}>
        {formatNumber(count)} {plural(count, 'слово', 'слова', 'слов')}
      </span>
    </button>
  )
}

function Dots({ n, active }: { n: number; active: boolean }) {
  if (n === 0) {
    return (
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cx('size-1.5 rounded-full', active ? 'bg-ink-950' : ['bg-acid-400', 'bg-aqua-400', 'bg-hot-400'][i])} />
        ))}
      </span>
    )
  }
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cx('size-1.5 rounded-full', i < n ? (active ? 'bg-ink-950' : 'bg-acid-400') : active ? 'bg-ink-950/25' : 'bg-ink-700')}
        />
      ))}
    </span>
  )
}
