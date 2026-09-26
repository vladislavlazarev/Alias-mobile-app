import { useEffect } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ConfirmSheet } from './components/ConfirmSheet'
import { Toast } from './components/Toast'
import { onBackButton, setKeepAwake } from './lib/native'
import { GameRouter } from './screens/GameRouter'
import { HomeScreen } from './screens/HomeScreen'
import { RulesScreen } from './screens/RulesScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { SetupRulesScreen } from './screens/SetupRulesScreen'
import { SetupTeamsScreen } from './screens/SetupTeamsScreen'
import { handleBack } from './screens/navigation'
import { useGame } from './store/gameStore'
import { useUi } from './store/uiStore'

export function App() {
  const route = useUi((s) => s.route)
  const direction = useUi((s) => s.direction)
  const hasGame = useGame((s) => s.game !== null)

  useEffect(() => onBackButton(handleBack), [])

  useEffect(() => {
    setKeepAwake(route === 'game' && hasGame)
  }, [route, hasGame])

  // Партия пропала (например, вышли в меню) — возвращаемся на главный экран.
  useEffect(() => {
    if (route === 'game' && !hasGame) useUi.getState().go('home', -1)
  }, [route, hasGame])

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-full overflow-hidden bg-ink-950">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={route}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d * 48, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -48, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {route === 'home' && <HomeScreen />}
            {route === 'setup-teams' && <SetupTeamsScreen />}
            {route === 'setup-rules' && <SetupRulesScreen />}
            {route === 'rules' && <RulesScreen />}
            {route === 'settings' && <SettingsScreen />}
            {route === 'game' && <GameRouter />}
          </motion.div>
        </AnimatePresence>
        <ConfirmSheet />
        <Toast />
      </div>
    </MotionConfig>
  )
}
