import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { cx } from '../lib/cx'
import { IconButton } from './Button'

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('relative mx-auto flex h-full w-full max-w-lg flex-col px-safe pt-safe pb-safe', className)}>
      {children}
    </div>
  )
}

export function TopBar({
  title,
  subtitle,
  onBack,
  right,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <header className="flex min-h-14 items-center gap-3 pb-2">
      {onBack ? (
        <IconButton label="Назад" onClick={onBack}>
          <ChevronLeft className="size-6" />
        </IconButton>
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? <h1 className="truncate font-display text-xl font-bold tracking-tight">{title}</h1> : null}
        {subtitle ? <p className="truncate text-sm text-ink-400">{subtitle}</p> : null}
      </div>
      {right}
    </header>
  )
}

export function SectionLabel({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between px-1">
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">{children}</h2>
      {aside ? <span className="text-xs text-ink-500">{aside}</span> : null}
    </div>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-3xl bg-ink-850 ring-1 ring-inset ring-ink-750', className)}>{children}</div>
}
