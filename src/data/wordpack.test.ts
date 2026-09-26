import { describe, expect, it } from 'vitest'
import { CATEGORIES, LEVELS, POOLS, TOTAL_WORDS, categoryOf } from './wordpack'

describe('словарь', () => {
  it('содержит не меньше 5000 слов', () => {
    expect(TOTAL_WORDS).toBeGreaterThanOrEqual(5000)
  })

  it('в каждом уровне достаточно слов', () => {
    for (const level of LEVELS) expect(POOLS[level].length).toBeGreaterThanOrEqual(1400)
  })

  it('слова уникальны с учётом ё/е', () => {
    const norm = POOLS.mixed.map((w) => w.replace(/ё/g, 'е'))
    expect(new Set(norm).size).toBe(norm.length)
  })

  it('слова — строчная кириллица, не длиннее трёх слов', () => {
    for (const w of POOLS.mixed) {
      expect(w).toMatch(/^[а-яё]+(?:[ -][а-яё]+)*$/)
      expect(w.split(' ').length).toBeLessThanOrEqual(3)
    }
  })

  it('у каждого слова есть категория', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id))
    for (const w of POOLS.mixed) expect(ids.has(categoryOf(w)!.id)).toBe(true)
  })
})
