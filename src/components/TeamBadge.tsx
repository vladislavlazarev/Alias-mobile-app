import type { CSSProperties } from 'react'
import type { Team } from '../game/types'
import { teamColor } from '../game/teams'
import { cx } from '../lib/cx'

export function teamStyle(team: Pick<Team, 'color'>): CSSProperties {
  return { '--team': teamColor(team) } as CSSProperties
}

export function TeamDot({ team, className }: { team: Pick<Team, 'color'>; className?: string }) {
  return <span className={cx('inline-block size-3 shrink-0 rounded-full bg-(--team)', className)} style={teamStyle(team)} />
}

export function TeamPill({ team, className }: { team: Team; className?: string }) {
  return (
    <span
      style={teamStyle(team)}
      className={cx(
        'inline-flex max-w-full items-center gap-2 truncate rounded-full bg-(--team)/12 px-3 py-1.5 text-sm font-bold text-(--team) ring-1 ring-inset ring-(--team)/30',
        className,
      )}
    >
      <span className="size-2 shrink-0 rounded-full bg-(--team)" />
      <span className="truncate">{team.name}</span>
    </span>
  )
}
