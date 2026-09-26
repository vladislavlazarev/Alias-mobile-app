import { motion } from 'motion/react'
import { Check, Flag, X } from 'lucide-react'
import { Button } from '../../components/Button'
import { Screen, SectionLabel, TopBar } from '../../components/Screen'
import { teamStyle } from '../../components/TeamBadge'
import { draftPoints } from '../../game/engine'
import { cx } from '../../lib/cx'
import { plural, signed } from '../../lib/format'
import { useLatest } from '../../lib/useLatest'
import { haptic } from '../../lib/haptics'
import { sfx } from '../../lib/sound'
import { useGame } from '../../store/gameStore'

export function ReviewScreen() {
  const game = useLatest(useGame((s) => s.game))
  const turn = useLatest(useGame((s) => s.turn))
  const toggleResult = useGame((s) => s.toggleResult)
  const setLastWordGuesser = useGame((s) => s.setLastWordGuesser)
  const finishTurn = useGame((s) => s.finishTurn)

  const team = game.teams.find((t) => t.id === turn.teamId)!
  const guessed = turn.results.filter((r) => r.status === 'guessed').length
  const skipped = turn.results.length - guessed
  const ownLastWord = turn.lastWord?.guessedBy === team.id ? 1 : 0
  const points = draftPoints(turn.results, game.settings) + ownLastWord

  return (
    <Screen>
      <TopBar title="Итоги хода" subtitle={team.name} />

      <div className="-mx-1 flex-1 overflow-y-auto px-1 pb-4 no-scrollbar">
        <div style={teamStyle(team)} className="flex items-center justify-between rounded-3xl bg-ink-850 p-5 ring-1 ring-inset ring-ink-750">
          <div>
            <motion.div
              key={points}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-display text-5xl font-black tabular tracking-tight text-(--team)"
            >
              {signed(points)}
            </motion.div>
            <div className="mt-1 text-sm text-ink-400">{plural(points, 'очко', 'очка', 'очков')} за ход</div>
          </div>
          <div className="flex flex-col items-end gap-1.5 text-sm font-bold tabular">
            <span className="flex items-center gap-1.5 text-acid-400">
              <Check className="size-4" strokeWidth={3} /> {guessed} угадано
            </span>
            <span className="flex items-center gap-1.5 text-hot-400">
              <X className="size-4" strokeWidth={3} /> {skipped} {plural(skipped, 'пропуск', 'пропуска', 'пропусков')}
            </span>
          </div>
        </div>

        {turn.results.length > 0 ? (
          <>
            <div className="mt-6">
              <SectionLabel aside="нажмите, чтобы исправить">Слова</SectionLabel>
            </div>
            <ul className="flex flex-col gap-1.5">
              {turn.results.map((r, i) => {
                const ok = r.status === 'guessed'
                return (
                  <li key={`${i}:${r.word}`}>
                    <button
                      type="button"
                      onClick={() => {
                        haptic.light()
                        toggleResult(i)
                      }}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 ring-inset transition active:scale-[0.99]',
                        ok ? 'bg-acid-400/8 ring-acid-400/20' : 'bg-hot-400/6 ring-hot-400/15',
                      )}
                    >
                      <span
                        className={cx(
                          'flex size-7 shrink-0 items-center justify-center rounded-full',
                          ok ? 'bg-acid-400 text-ink-950' : 'bg-hot-400/20 text-hot-400',
                        )}
                      >
                        {ok ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
                      </span>
                      <span className={cx('min-w-0 flex-1 truncate text-[17px] font-semibold', ok ? 'text-ink-100' : 'text-ink-400 line-through decoration-hot-400/50')}>
                        {r.word}
                      </span>
                      <span className={cx('font-display text-sm font-bold tabular', ok ? 'text-acid-400' : 'text-hot-400')}>
                        {ok ? '+1' : game.settings.skipPenalty ? '−1' : '0'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <p className="mt-8 text-center text-ink-500">В этом ходе не было слов.</p>
        )}

        {turn.lastWord ? (
          <div className="mt-6">
            <SectionLabel>Последнее слово</SectionLabel>
            <div className="rounded-3xl bg-ink-850 p-4 ring-1 ring-inset ring-sun-400/30">
              <div className="flex items-center gap-2 text-[17px] font-semibold">
                <Flag className="size-4 text-sun-400" />
                {turn.lastWord.word}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(game.settings.lastWordForAll ? game.teams : [team]).map((t) => {
                  const active = turn.lastWord?.guessedBy === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      style={teamStyle(t)}
                      onClick={() => setLastWordGuesser(t.id)}
                      className={cx(
                        'max-w-full truncate rounded-full px-3 py-1.5 text-sm font-bold ring-1 ring-inset transition active:scale-95',
                        active ? 'bg-(--team) text-ink-950 ring-(--team)' : 'text-(--team) ring-(--team)/35',
                      )}
                    >
                      {game.settings.lastWordForAll ? t.name : 'Угадали'}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setLastWordGuesser(null)}
                  className={cx(
                    'rounded-full px-3 py-1.5 text-sm font-bold ring-1 ring-inset transition active:scale-95',
                    turn.lastWord.guessedBy === null ? 'bg-ink-200 text-ink-950 ring-ink-200' : 'text-ink-300 ring-ink-600',
                  )}
                >
                  Никто
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="pt-2">
        <Button
          size="xl"
          block
          onClick={() => {
            haptic.medium()
            const before = useGame.getState().game?.winnerId
            finishTurn()
            if (!before && useGame.getState().game?.winnerId) sfx.win()
          }}
        >
          Подтвердить
        </Button>
      </div>
    </Screen>
  )
}
