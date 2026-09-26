export interface Pick {
  word: string
  /** true — непросмотренные слова закончились, и колода этого уровня перемешана заново. */
  reshuffled: boolean
}

/**
 * Берёт случайное слово, которое игрок ещё не видел (история хранится между играми).
 * Когда все слова уровня просмотрены, история по этому уровню сбрасывается,
 * но слова текущей партии всё равно не повторяются.
 */
export function pickWord(
  pool: readonly string[],
  seen: Set<string>,
  used: ReadonlySet<string>,
  rng: () => number = Math.random,
): Pick {
  let candidates = pool.filter((w) => !seen.has(w) && !used.has(w))
  let reshuffled = false
  if (candidates.length === 0) {
    reshuffled = true
    for (const w of pool) if (!used.has(w)) seen.delete(w)
    candidates = pool.filter((w) => !used.has(w))
    if (candidates.length === 0) candidates = [...pool]
  }
  const word = candidates[Math.floor(rng() * candidates.length)]
  return { word, reshuffled }
}

export function unseenCount(pool: readonly string[], seen: ReadonlySet<string>): number {
  let n = 0
  for (const w of pool) if (!seen.has(w)) n++
  return n
}
