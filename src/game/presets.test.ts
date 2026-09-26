import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, levelsLabel, normalizeSettings } from './presets'

describe('миграция настроек', () => {
  it('одиночная сложность превращается в набор уровней', () => {
    expect(normalizeSettings({ difficulty: 'hard', roundSeconds: 90 })).toMatchObject({
      levels: ['hard'],
      roundSeconds: 90,
      excludedCategories: [],
      packs: [],
    })
  })

  it('«микс» — все уровни', () => {
    expect(normalizeSettings({ difficulty: 'mixed' }).levels).toEqual(['easy', 'medium', 'hard'])
  })

  it('мусор заменяется значениями по умолчанию', () => {
    expect(normalizeSettings({ levels: ['nope'], packs: [1, 'actors'] })).toEqual({
      ...DEFAULT_SETTINGS,
      packs: ['actors'],
    })
  })

  it('подписи уровней', () => {
    expect(levelsLabel(['hard', 'easy'])).toBe('Лёгкий + Сложный')
    expect(levelsLabel(['easy', 'medium', 'hard'])).toBe('Все уровни')
  })
})
