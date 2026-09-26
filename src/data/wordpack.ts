import raw from './words.ru.json'
import type { GameSettings, Level } from '../game/types'
import { LEVELS } from '../game/presets'

export type CategoryGroup = 'base' | 'extra'

export interface Category {
  id: string
  name: string
  emoji: string
  group: CategoryGroup
  /** Примеры для наборов — показываются на экране выбора. */
  description?: string
}

export interface WordPack {
  version: number
  lang: string
  categories: Category[]
  words: Record<Level, Record<string, string[]>>
}

export interface WordInfo {
  level: Level
  category: string
}

type WordSelection = Pick<GameSettings, 'levels' | 'excludedCategories' | 'packs'>

const pack = raw as WordPack

export const PACK_VERSION = pack.version
export const CATEGORIES: Category[] = pack.categories
/** Темы обычного словаря. */
export const BASE_CATEGORIES = CATEGORIES.filter((c) => c.group === 'base')
/** Дополнительные наборы: персонажи, личности, фильмы и т. п. */
export const EXTRA_PACKS = CATEGORIES.filter((c) => c.group === 'extra')

const categoryById = new Map(CATEGORIES.map((c) => [c.id, c]))
const info = new Map<string, WordInfo>()
const index = new Map<string, Record<Level, string[]>>(
  CATEGORIES.map((c) => [c.id, { easy: [], medium: [], hard: [] }]),
)

for (const level of LEVELS) {
  for (const [category, list] of Object.entries(pack.words[level])) {
    for (const word of list) {
      info.set(word, { level, category })
      index.get(category)?.[level].push(word)
    }
  }
}

/** Все слова уровня — по всем темам и наборам (для статистики истории). */
export const LEVEL_POOLS: Record<Level, readonly string[]> = {
  easy: CATEGORIES.flatMap((c) => index.get(c.id)!.easy),
  medium: CATEGORIES.flatMap((c) => index.get(c.id)!.medium),
  hard: CATEGORIES.flatMap((c) => index.get(c.id)!.hard),
}

export const ALL_WORDS: readonly string[] = [...LEVEL_POOLS.easy, ...LEVEL_POOLS.medium, ...LEVEL_POOLS.hard]
export const TOTAL_WORDS = ALL_WORDS.length

function countIn(categories: Category[]): number {
  return categories.reduce((n, c) => n + LEVELS.reduce((m, l) => m + index.get(c.id)![l].length, 0), 0)
}

export const BASE_TOTAL = countIn(BASE_CATEGORIES)
export const EXTRA_TOTAL = countIn(EXTRA_PACKS)

export function isCategoryActive(category: Category, s: Pick<WordSelection, 'excludedCategories' | 'packs'>): boolean {
  return category.group === 'base' ? !s.excludedCategories.includes(category.id) : s.packs.includes(category.id)
}

/** Сколько слов категории попадёт в игру при выбранных уровнях. */
export function countFor(categoryId: string, levels: Level[]): number {
  const byLevel = index.get(categoryId)
  return byLevel ? levels.reduce((n, l) => n + byLevel[l].length, 0) : 0
}

let cacheKey = ''
let cachePool: readonly string[] = []

/** Колода для партии: выбранные уровни × включённые темы и наборы. */
export function poolFor(s: WordSelection): readonly string[] {
  const key = `${s.levels.join()}|${s.excludedCategories.join()}|${s.packs.join()}`
  if (key === cacheKey) return cachePool
  const pool: string[] = []
  for (const c of CATEGORIES) {
    if (!isCategoryActive(c, s)) continue
    const byLevel = index.get(c.id)!
    for (const l of s.levels) pool.push(...byLevel[l])
  }
  cacheKey = key
  cachePool = pool
  return pool
}

export function wordInfo(word: string): WordInfo | undefined {
  return info.get(word)
}

export function categoryOf(word: string): Category | undefined {
  const i = info.get(word)
  return i ? categoryById.get(i.category) : undefined
}
