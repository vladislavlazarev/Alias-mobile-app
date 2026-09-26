import { useLayoutEffect, useRef } from 'react'
import { cx } from '../lib/cx'

/**
 * Текст максимально крупно, но без переноса посреди слова:
 * уменьшаем шрифт, пока самое длинное слово не влезет по ширине
 * (и, если задано, пока текст не займёт не больше maxHeightShare высоты родителя).
 */
export function FitText({
  text,
  max,
  min = 16,
  maxHeightShare,
  className,
}: {
  text: string
  max: number
  min?: number
  maxHeightShare?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const tooBig = () =>
      el.scrollWidth > el.clientWidth + 1 ||
      (maxHeightShare !== undefined && el.scrollHeight > el.parentElement!.clientHeight * maxHeightShare)
    const fit = () => {
      let size = max
      el.style.fontSize = `${size}px`
      while (size > min && tooBig()) {
        size -= 2
        el.style.fontSize = `${size}px`
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement!)
    void document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [text, max, min, maxHeightShare])

  return (
    <div
      ref={ref}
      lang="ru"
      className={cx('w-full text-center text-balance [overflow-wrap:normal] [word-break:normal]', className)}
    >
      {text}
    </div>
  )
}

export function FitWord({ word }: { word: string }) {
  return (
    <FitText
      text={word}
      max={58}
      min={18}
      maxHeightShare={0.7}
      className="font-display font-bold leading-[1.12] tracking-tight text-ink-100"
    />
  )
}
