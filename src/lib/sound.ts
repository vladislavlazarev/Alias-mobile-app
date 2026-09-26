import { usePrefs } from '../store/prefsStore'

/** Все звуки синтезируются на лету через Web Audio — никаких файлов, работает офлайн. */
let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (!usePrefs.getState().sound) return null
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctor()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

interface ToneOpts {
  freq: number
  to?: number
  duration: number
  type?: OscillatorType
  gain?: number
  delay?: number
}

function tone(ac: AudioContext, { freq, to, duration, type = 'sine', gain = 0.18, delay = 0 }: ToneOpts) {
  const start = ac.currentTime + delay
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration)
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(amp).connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function play(fn: (ac: AudioContext) => void) {
  const ac = audio()
  if (ac) fn(ac)
}

export const sfx = {
  /** Разблокировать звук на iOS — вызывать из обработчика нажатия. */
  unlock() {
    play((ac) => tone(ac, { freq: 440, duration: 0.01, gain: 0.0002 }))
  },
  correct() {
    play((ac) => {
      tone(ac, { freq: 660, duration: 0.09, type: 'triangle' })
      tone(ac, { freq: 990, duration: 0.14, type: 'triangle', delay: 0.07 })
    })
  },
  skip() {
    play((ac) => tone(ac, { freq: 320, to: 170, duration: 0.18, type: 'sawtooth', gain: 0.08 }))
  },
  tick() {
    play((ac) => tone(ac, { freq: 1200, duration: 0.05, type: 'square', gain: 0.05 }))
  },
  go() {
    play((ac) => tone(ac, { freq: 880, duration: 0.22, type: 'triangle', gain: 0.2 }))
  },
  countdown() {
    play((ac) => tone(ac, { freq: 520, duration: 0.12, type: 'triangle', gain: 0.15 }))
  },
  timeUp() {
    play((ac) => {
      tone(ac, { freq: 220, duration: 0.5, type: 'sawtooth', gain: 0.12 })
      tone(ac, { freq: 165, duration: 0.6, type: 'square', gain: 0.06, delay: 0.05 })
    })
  },
  win() {
    play((ac) => {
      ;[523, 659, 784, 1047].forEach((f, i) =>
        tone(ac, { freq: f, duration: 0.25, type: 'triangle', delay: i * 0.12, gain: 0.16 }),
      )
    })
  },
}
