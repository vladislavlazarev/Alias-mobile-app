import { useLayoutEffect, useRef } from 'react'

/**
 * Слово максимально крупно, но без переноса посреди слова:
 * уменьшаем шрифт, пока самое длинное слово не влезет по ширине.
 */
export function FitWord({ word, max = 58, min = 18 }: { word: string; max?: number; min?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      let size = max
      el.style.fontSize = `${size}px`
      while (size > min && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.parentElement!.clientHeight * 0.7)) {
        size -= 2
        el.style.fontSize = `${size}px`
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement!)
    void document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [word, max, min])

  return (
    <div
      ref={ref}
      lang="ru"
      data-word
      className="w-full text-center font-display font-bold leading-[1.12] tracking-tight text-balance text-ink-100 [overflow-wrap:normal] [word-break:normal]"
    >
      {word}
    </div>
  )
}
