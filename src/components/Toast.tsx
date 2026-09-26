import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { useUi } from '../store/uiStore'

export function Toast() {
  const toast = useUi((s) => s.toast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => useUi.setState({ toast: null }), 3200)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-safe">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 8, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="flex max-w-sm items-center gap-2.5 rounded-2xl bg-ink-800/95 px-4 py-3 text-sm font-semibold text-ink-100 shadow-2xl ring-1 ring-ink-600 backdrop-blur"
          >
            <Sparkles className="size-4 shrink-0 text-acid-400" />
            {toast.text}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
