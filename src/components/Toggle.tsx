import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  description?: ReactNode
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
    >
      {icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-ink-300">{icon}</span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink-100">{label}</span>
        {description ? <span className="mt-0.5 block text-sm leading-snug text-ink-400">{description}</span> : null}
      </span>
      <span
        className={cx(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-acid-400' : 'bg-ink-700',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 size-6 rounded-full shadow transition-all duration-200 ease-(--ease-spring)',
            checked ? 'left-[22px] bg-ink-950' : 'left-0.5 bg-ink-300',
          )}
        />
      </span>
    </button>
  )
}
