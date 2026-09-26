import { ChevronRight, Flag, MinusCircle, Play, Timer, Trophy } from 'lucide-react'
import { Button } from '../components/Button'
import { ChipGroup } from '../components/ChipGroup'
import { Card, Screen, SectionLabel, TopBar } from '../components/Screen'
import { Toggle } from '../components/Toggle'
import { wordsSummary } from '../data/summary'
import { poolFor } from '../data/wordpack'
import { ROUND_TIMES, TARGET_SCORES } from '../game/presets'
import { haptic } from '../lib/haptics'
import { pluralCount } from '../lib/format'
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
      <TopBar title="Правила" subtitle="Шаг 3 из 3" onBack={() => go('setup-words', -1)} />

      <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-2 pb-4 no-scrollbar">
        <SectionLabel>Слова</SectionLabel>
        <button
          type="button"
          onClick={() => go('setup-words', -1)}
          className="flex w-full items-center gap-3 rounded-3xl bg-ink-850 p-4 text-left ring-1 ring-inset ring-ink-750 transition active:scale-[0.99]"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-display font-bold">{wordsSummary(settings)}</span>
            <span className="mt-0.5 block text-sm text-ink-400">
              {pluralCount(poolFor(settings).length, 'слово', 'слова', 'слов')} в колоде
            </span>
          </span>
          <ChevronRight className="size-5 text-ink-500" />
        </button>

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

