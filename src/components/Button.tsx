import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../lib/cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'xl' | 'lg' | 'md' | 'sm'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
  block?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-acid-400 text-ink-950 shadow-[0_10px_30px_-10px_rgb(198_242_78/0.6)] hover:bg-acid-300 disabled:bg-ink-700 disabled:text-ink-400 disabled:shadow-none',
  secondary: 'bg-ink-800 text-ink-100 ring-1 ring-inset ring-ink-700 hover:bg-ink-750 disabled:text-ink-500',
  ghost: 'text-ink-300 hover:text-ink-100 hover:bg-ink-800/60 disabled:text-ink-600',
  danger: 'bg-hot-400/12 text-hot-300 ring-1 ring-inset ring-hot-400/30 hover:bg-hot-400/20',
}

const sizes: Record<Size, string> = {
  xl: 'h-16 rounded-2xl px-7 text-lg gap-3',
  lg: 'h-14 rounded-2xl px-6 text-base gap-2.5',
  md: 'h-11 rounded-xl px-4 text-sm gap-2',
  sm: 'h-9 rounded-lg px-3 text-sm gap-1.5',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  block,
  className,
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex select-none items-center justify-center font-display font-semibold tracking-tight transition-[transform,background-color,color] duration-150 active:scale-[0.97] disabled:active:scale-100',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
}

export function IconButton({
  className,
  children,
  label,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-800/80 text-ink-200 ring-1 ring-inset ring-ink-700 transition active:scale-95 hover:text-ink-100',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
