import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Dices, Plus, Trash2, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/Button'
import { Screen, SectionLabel, TopBar } from '../components/Screen'
import { teamStyle } from '../components/TeamBadge'
import { MAX_PLAYERS_PER_TEAM, MAX_TEAMS, MIN_TEAMS, randomTeamName } from '../game/teams'
import type { Team } from '../game/types'
import { haptic } from '../lib/haptics'
import { useUi } from '../store/uiStore'

export function SetupTeamsScreen() {
  const teams = useUi((s) => s.setupTeams)
  const addTeam = useUi((s) => s.addTeam)
  const go = useUi((s) => s.go)

  const proceed = () => {
    // Пустые названия заменяем случайными, чтобы не блокировать старт.
    const ui = useUi.getState()
    ui.setupTeams.forEach((t) => {
      if (!t.name.trim()) {
        ui.updateTeam(t.id, { name: randomTeamName(ui.setupTeams.map((x) => x.name)) })
      } else if (t.name !== t.name.trim()) {
        ui.updateTeam(t.id, { name: t.name.trim() })
      }
    })
    go('setup-words')
  }

  return (
    <Screen>
      <TopBar title="Команды" subtitle="Шаг 1 из 3" onBack={() => go('home', -1)} />

      <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-2 pb-4 no-scrollbar">
        <SectionLabel aside={`${teams.length} из ${MAX_TEAMS}`}>Кто играет</SectionLabel>
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {teams.map((team, i) => (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              >
                <TeamEditor team={team} index={i} canRemove={teams.length > MIN_TEAMS} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {teams.length < MAX_TEAMS ? (
          <button
            type="button"
            onClick={() => {
              haptic.light()
              addTeam()
            }}
            className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink-700 font-display font-semibold text-ink-300 transition hover:border-ink-600 hover:text-ink-100 active:scale-[0.99]"
          >
            <Plus className="size-5" />
            Добавить команду
          </button>
        ) : null}

        <p className="mt-5 px-2 text-center text-sm leading-relaxed text-ink-500">
          Добавьте игроков — и приложение само подскажет, чья очередь объяснять.
        </p>
      </div>

      <div className="pt-2">
        <Button size="xl" block iconRight={<ArrowRight className="size-5" />} onClick={proceed}>
          Дальше
        </Button>
      </div>
    </Screen>
  )
}

function TeamEditor({ team, index, canRemove }: { team: Team; index: number; canRemove: boolean }) {
  const updateTeam = useUi((s) => s.updateTeam)
  const removeTeam = useUi((s) => s.removeTeam)
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)

  const addPlayer = () => {
    const name = draft.trim()
    if (!name) {
      setAdding(false)
      return
    }
    if (team.players.length < MAX_PLAYERS_PER_TEAM && !team.players.includes(name)) {
      updateTeam(team.id, { players: [...team.players, name] })
    }
    setDraft('')
  }

  return (
    <div
      style={teamStyle(team)}
      className="relative overflow-hidden rounded-3xl bg-ink-850 p-4 pl-5 ring-1 ring-inset ring-ink-750"
    >
      <span className="absolute inset-y-0 left-0 w-1.5 bg-(--team)" />
      <div className="flex items-center gap-2">
        <span className="font-display text-sm font-bold text-(--team) tabular">{index + 1}</span>
        <input
          value={team.name}
          onChange={(e) => updateTeam(team.id, { name: e.target.value.slice(0, 28) })}
          placeholder="Название команды"
          aria-label={`Название команды ${index + 1}`}
          className="min-w-0 flex-1 rounded-xl bg-transparent px-2 py-2 text-lg font-extrabold tracking-tight text-ink-100 outline-none placeholder:text-ink-600 focus:bg-ink-800"
        />
        <button
          type="button"
          aria-label="Случайное название"
          title="Случайное название"
          onClick={() => {
            haptic.light()
            updateTeam(team.id, { name: randomTeamName([team.name]) })
          }}
          className="flex size-10 items-center justify-center rounded-xl text-ink-400 transition hover:bg-ink-800 hover:text-(--team) active:scale-90"
        >
          <Dices className="size-5" />
        </button>
        {canRemove ? (
          <button
            type="button"
            aria-label="Удалить команду"
            title="Удалить команду"
            onClick={() => removeTeam(team.id)}
            className="flex size-10 items-center justify-center rounded-xl text-ink-500 transition hover:bg-ink-800 hover:text-hot-400 active:scale-90"
          >
            <Trash2 className="size-[18px]" />
          </button>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-5">
        {team.players.map((p) => (
          <span
            key={p}
            className="inline-flex items-center gap-1 rounded-full bg-(--team)/12 py-1 pr-1 pl-3 text-sm font-semibold text-ink-100 ring-1 ring-inset ring-(--team)/25"
          >
            {p}
            <button
              type="button"
              aria-label={`Убрать ${p}`}
              onClick={() => updateTeam(team.id, { players: team.players.filter((x) => x !== p) })}
              className="flex size-6 items-center justify-center rounded-full text-ink-400 hover:bg-ink-700 hover:text-ink-100"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        {adding ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 20))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addPlayer()
              if (e.key === 'Escape') {
                setDraft('')
                setAdding(false)
              }
            }}
            onBlur={() => {
              addPlayer()
              setAdding(false)
            }}
            placeholder="Имя игрока"
            enterKeyHint="done"
            className="h-8 w-32 rounded-full bg-ink-800 px-3 text-sm text-ink-100 outline-none ring-1 ring-(--team)/50 placeholder:text-ink-500"
          />
        ) : team.players.length < MAX_PLAYERS_PER_TEAM ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-400 ring-1 ring-inset ring-ink-700 transition hover:text-ink-100 active:scale-95"
          >
            <UserPlus className="size-3.5" />
            {team.players.length === 0 ? 'Игроки (необязательно)' : 'Игрок'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
