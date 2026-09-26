/** Русское склонение по числу: plural(5, 'слово', 'слова', 'слов') → 'слов'. */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n)
  const n10 = abs % 10
  const n100 = abs % 100
  if (n10 === 1 && n100 !== 11) return one
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few
  return many
}

export function formatNumber(n: number): string {
  return n.toLocaleString('ru-RU')
}

export function pluralCount(n: number, one: string, few: string, many: string): string {
  return `${formatNumber(n)} ${plural(n, one, few, many)}`
}

export function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`
}
