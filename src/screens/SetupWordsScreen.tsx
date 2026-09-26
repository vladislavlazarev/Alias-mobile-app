import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, ArrowRight, Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Screen, SectionLabel, TopBar } from '../components/Screen'
import { BASE_CATEGORIES, EXTRA_PACKS, countFor, isCategoryActive, poolFor, type Category } from '../data/wordpack'
import { LEVEL_META, type LevelMeta } from '../game/presets'
import type { GameSettings } from '../game/types'
import { cx } from '../lib/cx'
import { formatNumber, plural, pluralCount } from '../lib/format'
import { haptic } from '../lib/haptics'
import { useUi } from '../store/uiStore'

/** Меньше этого — слова начнут повторяться уже в одной партии. */
const SMALL_POOL = 80

export function SetupWordsScreen() {
  const settings = useUi((s) => s.setupSettings)
  const go = useUi((s) => s.go)
  const total = poolFor(settings).length
  const themesOn = BASE_CATEGORIES.filter((c) => isCategoryActive(c, settings)).length
  const allBase = themesOn === BASE_CATEGORIES.length
  const baseCount = BASE_CATEGORIES.filter((c) => isCategoryActive(c, settings)).reduce(
    (n, c) => n + countFor(c.id, settings.levels),
    0,
  )
  const [showThemes, setShowThemes] = useState(() => !allBase)
  const packsOn = settings.packs.filter((id) => EXTRA_PACKS.some((p) => p.id === id)).length

  return (
    <Screen>
      <TopBar title="Слова" subtitle="Шаг 2 из 3" onBack={() => go('setup-teams', -1)} />

      <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-2 pb-4 no-scrollbar">
        <SectionLabel aside="можно несколько">Сложность</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {LEVEL_META.map((meta) => (
            <LevelCard key={meta.id} meta={meta} settings={settings} />
          ))}
        </div>

        <div className="mt-7">
          <SectionLabel
            aside={
              <button
                type="button"
                onClick={() => {
                  haptic.light()
                  useUi.getState().setAllCategories(!allBase)
                }}
                className="font-bold text-acid-400"
              >
                {allBase ? 'Снять все' : 'Выбрать все'}
              </button>
            }
          >
            Обычные слова
          </SectionLabel>
          <button
            type="button"
            aria-expanded={showThemes}
            onClick={() => setShowThemes(!showThemes)}
            className="flex w-full items-center gap-3 rounded-3xl bg-ink-850 p-4 text-left ring-1 ring-inset ring-ink-750 transition active:scale-[0.99]"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15px] font-bold">
                {themesOn === BASE_CATEGORIES.length
                  ? `Все ${BASE_CATEGORIES.length} тем`
                  : themesOn === 0
                    ? 'Темы выключены'
                    : `${themesOn} из ${BASE_CATEGORIES.length} тем`}
              </span>
              <span className="mt-0.5 block text-xs text-ink-400">
                {pluralCount(baseCount, 'слово', 'слова', 'слов')} · животные, еда, спорт, наука…
              </span>
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-ink-300">
              {showThemes ? 'Скрыть' : 'Настроить'}
              <ChevronDown className={cx('size-4 transition-transform', showThemes && 'rotate-180')} />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {showThemes ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {BASE_CATEGORIES.map((c) => (
                    <CategoryChip key={c.id} category={c} settings={settings} />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mt-7">
          <SectionLabel aside={packsOn > 0 ? `включено ${packsOn}` : 'имена и названия'}>Дополнительные наборы</SectionLabel>
          <div className="flex flex-col gap-2">
            {EXTRA_PACKS.map((p) => (
              <PackRow key={p.id} pack={p} settings={settings} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          {total === 0 ? (
            <span className="flex items-center gap-1.5 font-semibold text-hot-400">
              <AlertTriangle className="size-4" /> Выберите хотя бы одну тему или набор
            </span>
          ) : total < SMALL_POOL ? (
            <span className="flex items-center gap-1.5 font-semibold text-sun-300">
              <AlertTriangle className="size-4" /> {pluralCount(total, 'слово', 'слова', 'слов')} — возможны повторы
            </span>
          ) : (
            <span className="text-ink-400">
              В игре{' '}
              <motion.span key={total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-bold text-ink-100 tabular">
                {formatNumber(total)}
              </motion.span>{' '}
              {plural(total, 'слово', 'слова', 'слов')}
            </span>
          )}
        </div>
        <Button size="xl" block disabled={total === 0} iconRight={<ArrowRight className="size-5" />} onClick={() => go('setup-rules')}>
          Дальше
        </Button>
      </div>
    </Screen>
  )
}

function LevelCard({ meta, settings }: { meta: LevelMeta; settings: GameSettings }) {
  const active = settings.levels.includes(meta.id)
  const count = [...BASE_CATEGORIES, ...EXTRA_PACKS]
    .filter((c) => isCategoryActive(c, settings))
    .reduce((n, c) => n + countFor(c.id, [meta.id]), 0)

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => {
        if (useUi.getState().toggleLevel(meta.id)) haptic.light()
        else {
          haptic.warning()
          useUi.getState().showToast('Нужен хотя бы один уровень сложности')
        }
      }}
      className={cx(
        'relative flex flex-col items-start rounded-3xl p-3.5 text-left transition-all duration-150 active:scale-[0.97]',
        active ? 'bg-acid-400 text-ink-950 shadow-[0_12px_32px_-14px_rgb(198_242_78/0.7)]' : 'bg-ink-850 ring-1 ring-inset ring-ink-750',
      )}
    >
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cx(
              'size-1.5 rounded-full',
              i < meta.dots ? (active ? 'bg-ink-950' : 'bg-acid-400') : active ? 'bg-ink-950/25' : 'bg-ink-700',
            )}
          />
        ))}
      </span>
      <span className="mt-2.5 font-display text-sm font-bold tracking-tight">{meta.title}</span>
      <span className={cx('mt-0.5 text-[11px] leading-snug', active ? 'text-ink-900/70' : 'text-ink-400')}>{meta.hint}</span>
      <span className={cx('mt-2 text-xs font-bold tabular', active ? 'text-ink-900/70' : 'text-ink-500')}>
        {formatNumber(count)}
      </span>
      <span
        className={cx(
          'absolute top-3 right-3 flex size-5 items-center justify-center rounded-full',
          active ? 'bg-ink-950 text-acid-400' : 'ring-1 ring-inset ring-ink-600',
        )}
      >
        {active ? <Check className="size-3" strokeWidth={3.5} /> : null}
      </span>
    </button>
  )
}

function CategoryChip({ category, settings }: { category: Category; settings: GameSettings }) {
  const active = isCategoryActive(category, settings)
  const count = countFor(category.id, settings.levels)
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => {
        haptic.light()
        useUi.getState().toggleCategory(category.id)
      }}
      className={cx(
        'inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold ring-1 ring-inset transition active:scale-95',
        active ? 'bg-acid-400/12 text-ink-100 ring-acid-400/40' : 'bg-ink-900 text-ink-500 ring-ink-750',
      )}
    >
      <span className={cx(!active && 'opacity-40 grayscale')}>{category.emoji}</span>
      {category.name}
      <span className={cx('text-xs tabular', active ? 'text-acid-400' : 'text-ink-600')}>{count}</span>
    </button>
  )
}

function PackRow({ pack, settings }: { pack: Category; settings: GameSettings }) {
  const active = isCategoryActive(pack, settings)
  const count = countFor(pack.id, settings.levels)
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => {
        haptic.light()
        useUi.getState().togglePack(pack.id)
      }}
      className={cx(
        'flex w-full items-center gap-3 rounded-3xl p-3 pr-4 text-left ring-1 ring-inset transition active:scale-[0.99]',
        active ? 'bg-acid-400/10 ring-acid-400/45' : 'bg-ink-850 ring-ink-750',
      )}
    >
      <span
        className={cx(
          'flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl',
          active ? 'bg-acid-400/15' : 'bg-ink-800',
        )}
      >
        {pack.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-bold tracking-tight">{pack.name}</span>
        {pack.description ? <span className="mt-0.5 block truncate text-xs text-ink-400">{pack.description}</span> : null}
      </span>
      <span className={cx('text-xs font-bold tabular', active ? 'text-acid-400' : 'text-ink-500')}>{count}</span>
      <span
        className={cx(
          'flex size-6 shrink-0 items-center justify-center rounded-lg transition',
          active ? 'bg-acid-400 text-ink-950' : 'ring-1 ring-inset ring-ink-600',
        )}
      >
        {active ? <Check className="size-4" strokeWidth={3.5} /> : null}
      </span>
    </button>
  )
}
