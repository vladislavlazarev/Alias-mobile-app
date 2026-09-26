import { AnimatePresence, motion } from 'motion/react'
import { useUi } from '../store/uiStore'
import { Button } from './Button'

export function ConfirmSheet() {
  const confirm = useUi((s) => s.confirm)
  const close = useUi((s) => s.closeConfirm)

  return (
    <AnimatePresence>
      {confirm ? (
        <motion.div
          key="confirm"
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg rounded-t-[2rem] bg-ink-850 px-safe pt-3 pb-safe ring-1 ring-ink-700"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-ink-600" />
            <h2 className="font-display text-xl font-bold tracking-tight text-balance">{confirm.title}</h2>
            {confirm.message ? <p className="mt-2 leading-relaxed text-ink-300">{confirm.message}</p> : null}
            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                variant={confirm.danger ? 'danger' : 'primary'}
                block
                onClick={() => {
                  close()
                  confirm.onConfirm()
                }}
              >
                {confirm.confirmLabel}
              </Button>
              <Button variant="ghost" block onClick={close}>
                {confirm.cancelLabel ?? 'Отмена'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
