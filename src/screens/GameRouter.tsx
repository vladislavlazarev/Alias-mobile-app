import { AnimatePresence, motion } from 'motion/react'
import { useGame } from '../store/gameStore'
import { gameScreenOf } from './navigation'
import { PlayScreen } from './game/PlayScreen'
import { ReviewScreen } from './game/ReviewScreen'
import { ScoreboardScreen } from './game/ScoreboardScreen'
import { TurnIntroScreen } from './game/TurnIntroScreen'
import { WinnerScreen } from './game/WinnerScreen'

export function GameRouter() {
  const game = useGame((s) => s.game)
  const turn = useGame((s) => s.turn)
  if (!game) return null
  const screen = gameScreenOf(game, turn)

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={screen}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {screen === 'intro' && <TurnIntroScreen />}
        {screen === 'play' && <PlayScreen />}
        {screen === 'review' && <ReviewScreen />}
        {screen === 'scoreboard' && <ScoreboardScreen />}
        {screen === 'winner' && <WinnerScreen />}
      </motion.div>
    </AnimatePresence>
  )
}
