import { describe, expect, it } from 'vitest'
import { pickWord, unseenCount } from './deck'

const pool = ['кот', 'дом', 'мяч', 'сыр']

describe('колода без повторов', () => {
  it('выдаёт только непросмотренные слова', () => {
    const seen = new Set(['кот', 'дом', 'мяч'])
    for (let i = 0; i < 20; i++) {
      expect(pickWord(pool, seen, new Set()).word).toBe('сыр')
    }
  })

  it('не повторяет слова текущей партии', () => {
    const used = new Set(['кот', 'дом'])
    const picked = new Set<string>()
    for (let i = 0; i < 50; i++) picked.add(pickWord(pool, new Set(), used).word)
    expect([...picked].sort()).toEqual(['мяч', 'сыр'])
  })

  it('когда всё просмотрено — перемешивает заново, кроме слов партии', () => {
    const seen = new Set(pool)
    const used = new Set(['кот'])
    const res = pickWord(pool, seen, used, () => 0)
    expect(res.reshuffled).toBe(true)
    expect(res.word).not.toBe('кот')
    expect(seen.has('кот')).toBe(true)
    expect(unseenCount(pool, seen)).toBe(3)
  })

  it('каждое слово выпадает ровно один раз за проход колоды', () => {
    const seen = new Set<string>()
    const got: string[] = []
    for (let i = 0; i < pool.length; i++) {
      const { word, reshuffled } = pickWord(pool, seen, new Set())
      expect(reshuffled).toBe(false)
      seen.add(word)
      got.push(word)
    }
    expect(got.sort()).toEqual([...pool].sort())
  })
})
