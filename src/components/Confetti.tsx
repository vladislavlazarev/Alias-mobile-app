import { useEffect, useRef } from 'react'

const COLORS = ['#c6f24e', '#36d6f0', '#ff6b9a', '#ffd23f', '#34d399', '#e7eef0']

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vr: number
  color: string
  shape: 0 | 1
}

/** Лёгкое конфетти на canvas без зависимостей. */
export function Confetti({ pieces = 140 }: { pieces?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const w = () => canvas.width
    const h = () => canvas.height
    const items: Piece[] = Array.from({ length: pieces }, () => ({
      x: w() / 2 + (Math.random() - 0.5) * w() * 0.3,
      y: h() * 0.35,
      vx: (Math.random() - 0.5) * 16 * dpr,
      vy: (-Math.random() * 16 - 6) * dpr,
      size: (Math.random() * 7 + 5) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? 1 : 0,
    }))

    let raf = 0
    const started = performance.now()
    const tick = (t: number) => {
      ctx.clearRect(0, 0, w(), h())
      const fade = Math.max(0, 1 - (t - started - 3500) / 1500)
      for (const p of items) {
        p.vy += 0.35 * dpr
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.shape) ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2.6, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
      if (fade > 0) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [pieces])

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden />
}
