import { History, Smartphone, Volume2 } from 'lucide-react'
import { Button } from '../components/Button'
import { Card, Screen, SectionLabel, TopBar } from '../components/Screen'
import { Toggle } from '../components/Toggle'
import { ALL_WORDS, BASE_TOTAL, EXTRA_TOTAL, LEVEL_POOLS, PACK_VERSION, TOTAL_WORDS } from '../data/wordpack'
import { unseenCount } from '../game/deck'
import { LEVEL_META } from '../game/presets'
import { formatNumber } from '../lib/format'
import { usePrefs } from '../store/prefsStore'
import { getSeen, resetSeen, useSeenVersion } from '../store/seenWords'
import { useUi } from '../store/uiStore'

export function SettingsScreen() {
  useSeenVersion()
  const go = useUi((s) => s.go)
  const { sound, vibration, setSound, setVibration } = usePrefs()
  const seen = getSeen()
  const totalSeen = TOTAL_WORDS - unseenCount(ALL_WORDS, seen)

  return (
    <Screen>
      <TopBar title="Настройки" onBack={() => go('home', -1)} />
      <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-2 pb-6 no-scrollbar">
        <SectionLabel>Звук и отклик</SectionLabel>
        <Card className="divide-y divide-ink-750">
          <Toggle
            icon={<Volume2 className="size-5" />}
            label="Звуки"
            description="Сигналы таймера и ответов"
            checked={sound}
            onChange={setSound}
          />
          <Toggle
            icon={<Smartphone className="size-5" />}
            label="Вибрация"
            description="Тактильный отклик на свайпы"
            checked={vibration}
            onChange={setVibration}
          />
        </Card>

        <div className="mt-7">
          <SectionLabel aside={`${formatNumber(totalSeen)} из ${formatNumber(TOTAL_WORDS)}`}>История слов</SectionLabel>
          <Card className="p-4">
            <p className="text-sm leading-relaxed text-ink-300">
              Мы запоминаем, какие слова вам уже выпадали, и не показываем их снова, пока не закончится весь уровень.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {LEVEL_META.map((meta) => {
                const pool = LEVEL_POOLS[meta.id]
                const used = pool.length - unseenCount(pool, seen)
                return (
                  <div key={meta.id}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{meta.title}</span>
                      <span className="tabular text-ink-400">
                        {formatNumber(used)} / {formatNumber(pool.length)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-750">
                      <div
                        className="h-full rounded-full bg-aqua-400"
                        style={{ width: `${pool.length ? (used / pool.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <Button
              variant="danger"
              size="md"
              block
              className="mt-5"
              icon={<History className="size-4" />}
              disabled={totalSeen === 0}
              onClick={() =>
                useUi.getState().askConfirm({
                  title: 'Сбросить историю слов?',
                  message: 'Все слова снова станут «новыми» и могут выпасть в ближайших играх.',
                  confirmLabel: 'Сбросить',
                  danger: true,
                  onConfirm: () => {
                    resetSeen()
                    useUi.getState().showToast('История слов очищена')
                  },
                })
              }
            >
              Сбросить историю
            </Button>
          </Card>
        </div>

        <div className="mt-7">
          <SectionLabel>О приложении</SectionLabel>
          <Card className="divide-y divide-ink-750 text-sm">
            <Row label="Версия приложения" value={__APP_VERSION__} />
            <Row label="Версия словаря" value={`v${PACK_VERSION}`} />
            <Row label="Обычные слова" value={formatNumber(BASE_TOTAL)} />
            {EXTRA_TOTAL > 0 ? <Row label="Дополнительные наборы" value={formatNumber(EXTRA_TOTAL)} /> : null}
            <Row label="Интернет" value="не нужен" />
          </Card>
        </div>
      </div>
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-ink-300">{label}</span>
      <span className="font-semibold tabular">{value}</span>
    </div>
  )
}
