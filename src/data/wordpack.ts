import raw from './words.ru.json'
import type { Difficulty, Level } from '../game/types'

export interface Category {
  id: string
  name: string
  emoji: string
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

const pack = raw as WordPack

export const LEVELS: Level[] = ['easy', 'medium', 'hard']
export const PACK_VERSION = pack.version
export const CATEGORIES: Category[] = pack.categories

const categoryById = new Map(CATEGORIES.map((c) => [c.id, c]))
const info = new Map<string, WordInfo>()
const byLevel: Record<Level, string[]> = { easy: [], medium: [], hard: [] }

for (const level of LEVELS) {
  for (const [category, list] of Object.entries(pack.words[level])) {
    for (const word of list) {
      info.set(word, { level, category })
      byLevel[level].push(word)
    }
  }
}

export const POOLS: Record<Difficulty, readonly string[]> = {
  ...byLevel,
  mixed: [...byLevel.easy, ...byLevel.medium, ...byLevel.hard],
}

export const TOTAL_WORDS = POOLS.mixed.length

export function wordInfo(word: string): WordInfo | undefined {
  return info.get(word)
}

export function categoryOf(word: string): Category | undefined {
  const i = info.get(word)
  return i ? categoryById.get(i.category) : undefined
}
