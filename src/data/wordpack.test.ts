import { describe, expect, it } from 'vitest'
import { LEVELS } from '../game/presets'
import {
  ALL_WORDS,
  BASE_CATEGORIES,
  BASE_TOTAL,
  CATEGORIES,
  EXTRA_PACKS,
  categoryOf,
  countFor,
  poolFor,
  wordInfo,
} from './wordpack'

const all = { excludedCategories: [], packs: [] as string[] }

describe('словарь', () => {
  it('обычных слов не меньше 5000', () => {
    expect(BASE_TOTAL).toBeGreaterThanOrEqual(5000)
  })

  it('в каждом уровне обычного словаря достаточно слов', () => {
    for (const level of LEVELS) expect(poolFor({ ...all, levels: [level] }).length).toBeGreaterThanOrEqual(1400)
  })

  it('слова уникальны с учётом регистра и ё/е', () => {
    const norm = ALL_WORDS.map((w) => w.toLowerCase().replace(/ё/g, 'е'))
    expect(new Set(norm).size).toBe(norm.length)
  })

  it('обычные слова — строчная кириллица, не длиннее трёх слов', () => {
    for (const w of poolFor({ ...all, levels: LEVELS })) {
      expect(w).toMatch(/^[а-яё]+(?:[ -][а-яё]+)*$/)
      expect(w.split(' ').length).toBeLessThanOrEqual(3)
    }
  })

  it('в наборах — имена с заглавной, не длиннее пяти слов', () => {
    for (const pack of EXTRA_PACKS) {
      for (const w of poolFor({ levels: LEVELS, excludedCategories: BASE_CATEGORIES.map((c) => c.id), packs: [pack.id] })) {
        expect(w).toMatch(/^[А-ЯЁа-яё0-9]+(?:(?: |-|')[А-ЯЁа-яё0-9]+)*$/)
        expect(w.split(' ').length).toBeLessThanOrEqual(5)
        expect(categoryOf(w)?.id).toBe(pack.id)
      }
    }
  })

  it('у каждого слова есть категория', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id))
    for (const w of ALL_WORDS) expect(ids.has(categoryOf(w)!.id)).toBe(true)
  })
})

describe('выбор слов для партии', () => {
  it('фильтрует по уровням', () => {
    const pool = poolFor({ ...all, levels: ['easy', 'hard'] })
    expect(pool.length).toBeGreaterThan(0)
    for (const w of pool) expect(wordInfo(w)!.level).not.toBe('medium')
  })

  it('исключает выключенные темы', () => {
    const off = BASE_CATEGORIES[0].id
    const pool = poolFor({ ...all, levels: LEVELS, excludedCategories: [off] })
    expect(pool.some((w) => categoryOf(w)!.id === off)).toBe(false)
    expect(pool.length).toBe(BASE_TOTAL - countFor(off, LEVELS))
  })

  it('наборы подключаются только по галочке', () => {
    const base = poolFor({ ...all, levels: LEVELS })
    expect(base.some((w) => categoryOf(w)!.group === 'extra')).toBe(false)
    if (EXTRA_PACKS.length > 0) {
      const pack = EXTRA_PACKS[0]
      const withPack = poolFor({ ...all, levels: LEVELS, packs: [pack.id] })
      expect(withPack.length).toBe(base.length + countFor(pack.id, LEVELS))
    }
  })

  it('ничего не выбрано — пустая колода', () => {
    expect(poolFor({ levels: LEVELS, excludedCategories: BASE_CATEGORIES.map((c) => c.id), packs: [] })).toHaveLength(0)
  })
})
