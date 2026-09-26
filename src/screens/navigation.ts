import type { Game, TurnDraft } from '../game/types'
import { useGame } from '../store/gameStore'
import { useUi } from '../store/uiStore'

export type GameScreen = 'intro' | 'play' | 'review' | 'scoreboard' | 'winner'

export function gameScreenOf(game: Game, turn: TurnDraft | null): GameScreen {
  if (!turn) return game.winnerId ? 'winner' : 'scoreboard'
  switch (turn.phase) {
    case 'ready':
      return 'intro'
    case 'review':
      return 'review'
    default:
      return 'play'
  }
}

/** Выход из партии в меню — партия сохраняется, её можно продолжить с главного экрана. */
export function exitToMenu(): void {
  const { turn, pause } = useGame.getState()
  if (turn?.phase === 'running') pause()
  useUi.getState().go('home', -1)
}

export function startNewGameFlow(): void {
  const { game } = useGame.getState()
  const ui = useUi.getState()
  if (game && !game.winnerId) {
    ui.askConfirm({
      title: 'Начать новую игру?',
      message: 'Текущая партия будет удалена без возможности продолжить.',
      confirmLabel: 'Начать заново',
      danger: true,
      onConfirm: () => {
        useGame.getState().quitGame()
        useUi.getState().beginSetup()
      },
    })
    return
  }
  if (game?.winnerId) useGame.getState().quitGame()
  ui.beginSetup()
}

/** Логика аппаратной кнопки «Назад». Возвращает false, когда уходить уже некуда. */
export function handleBack(): boolean {
  const ui = useUi.getState()
  if (ui.confirm) {
    ui.closeConfirm()
    return true
  }
  switch (ui.route) {
    case 'home':
      return false
    case 'setup-rules':
      ui.go('setup-teams', -1)
      return true
    case 'setup-teams':
    case 'rules':
    case 'settings':
      ui.go('home', -1)
      return true
    case 'game': {
      const { game, turn, pause } = useGame.getState()
      if (!game) {
        ui.go('home', -1)
        return true
      }
      const screen = gameScreenOf(game, turn)
      if (screen === 'play') {
        if (turn?.phase === 'running') pause()
        return true
      }
      if (screen === 'review') return true
      exitToMenu()
      return true
    }
  }
}
