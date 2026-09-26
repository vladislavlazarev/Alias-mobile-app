import { cx } from '../lib/cx'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="4" y="8" width="56" height="38" rx="12" fill="currentColor" />
      <path d="M16 46v12l12-12z" fill="currentColor" />
      <circle cx="21" cy="27" r="4.5" className="fill-ink-950" />
      <circle cx="32" cy="27" r="4.5" className="fill-ink-950" />
      <circle cx="43" cy="27" r="4.5" className="fill-ink-950" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center gap-3', className)}>
      <LogoMark className="size-11 text-acid-400" />
      <span className="font-display text-[2.6rem] font-black leading-none tracking-tight">
        ALIAS
      </span>
    </div>
  )
}
