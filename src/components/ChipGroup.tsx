import { cx } from '../lib/cx'

export function ChipGroup<T extends string | number>({
  options,
  value,
  onChange,
  format = (v) => String(v),
  suffix,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  format?: (v: T) => string
  suffix?: string
}) {
  return (
    <div className="grid gap-1.5 rounded-2xl bg-ink-900 p-1.5 ring-1 ring-inset ring-ink-750" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={cx(
              'flex h-12 flex-col items-center justify-center rounded-xl font-display text-base font-semibold transition-all duration-150 active:scale-95',
              active ? 'bg-acid-400 text-ink-950 shadow-[0_6px_20px_-8px_rgb(198_242_78/0.7)]' : 'text-ink-300 hover:bg-ink-800',
            )}
          >
            <span className="tabular leading-none">{format(opt)}</span>
            {suffix ? (
              <span className={cx('mt-0.5 font-sans text-[10px] font-semibold leading-none', active ? 'text-ink-900/70' : 'text-ink-500')}>
                {suffix}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
