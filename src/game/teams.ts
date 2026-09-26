import { uid } from './engine'
import type { Team, TeamColor } from './types'

export const MIN_TEAMS = 2
export const MAX_TEAMS = 6
export const MAX_PLAYERS_PER_TEAM = 8

export const TEAM_COLORS: Record<TeamColor, string> = {
  lime: '#c6f24e',
  cyan: '#36d6f0',
  pink: '#ff6b9a',
  yellow: '#ffd23f',
  green: '#34d399',
  blue: '#6b95ff',
}

const COLOR_ORDER: TeamColor[] = ['lime', 'cyan', 'pink', 'yellow', 'green', 'blue']

export const TEAM_NAMES = [
  'Бешеные ёжики',
  'Сонные совы',
  'Ленивые панды',
  'Хитрые лисы',
  'Космические котики',
  'Дикие пельмени',
  'Шустрые улитки',
  'Тайные агенты',
  'Мудрые черепахи',
  'Весёлые пингвины',
  'Отважные хомяки',
  'Грозные тапки',
  'Боевые пончики',
  'Гениальные еноты',
  'Быстрые ленивцы',
  'Звёздные барсуки',
  'Неудержимые кабачки',
  'Словесные ниндзя',
  'Мастера намёков',
  'Лига болтунов',
  'Клуб умников',
  'Сырные бароны',
  'Полярные медведи',
  'Бодрые кроты',
  'Суровые зайки',
  'Вежливые акулы',
  'Капитаны очевидность',
  'Громкие чайки',
  'Хрустящие огурчики',
  'Пушистые тигры',
  'Ночные филины',
  'Танцующие ламы',
  'Летучие тапочки',
  'Весёлые гуси',
  'Тихие омуты',
  'Пылкие кактусы',
  'Сладкие булочки',
  'Храбрые морковки',
  'Ураганные улитки',
  'Команда мечты',
]

export function randomTeamName(exclude: string[] = []): string {
  const free = TEAM_NAMES.filter((n) => !exclude.includes(n))
  const list = free.length > 0 ? free : TEAM_NAMES
  return list[Math.floor(Math.random() * list.length)]
}

export function nextColor(teams: Team[]): TeamColor {
  const used = new Set(teams.map((t) => t.color))
  return COLOR_ORDER.find((c) => !used.has(c)) ?? COLOR_ORDER[teams.length % COLOR_ORDER.length]
}

export function makeTeam(existing: Team[]): Team {
  return {
    id: uid(),
    name: randomTeamName(existing.map((t) => t.name)),
    color: nextColor(existing),
    players: [],
  }
}

export function defaultTeams(): Team[] {
  const first = makeTeam([])
  return [first, makeTeam([first])]
}

export function teamColor(team: Pick<Team, 'color'>): string {
  return TEAM_COLORS[team.color]
}
