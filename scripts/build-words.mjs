#!/usr/bin/env node
/**
 * Собирает словарь из words/ru/*.txt в src/data/words.ru.json.
 *
 *   npm run words:build   — пересобрать JSON
 *   npm run words:check   — проверить, что JSON совпадает с исходниками (для CI)
 *
 * Формат txt: одно слово на строку, секции [easy] / [medium] / [hard],
 * строки с # — комментарии.
 *
 * Группы категорий (поле group в meta.json):
 *   base  — обычный словарь: строчная кириллица, до 3 слов;
 *   extra — дополнительные наборы (имена, названия): как принято писать, с заглавными, до 5 слов.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'words', 'ru')
const outFile = join(root, 'src', 'data', 'words.ru.json')
const LEVELS = ['easy', 'medium', 'hard']
const RULES = {
  base: { re: /^[а-яё]+(?:[ -][а-яё]+)*$/, maxWords: 3, lower: true },
  extra: { re: /^[А-ЯЁа-яё0-9]+(?:(?: |-|')[А-ЯЁа-яё0-9]+)*$/, maxWords: 5, lower: false },
}

const meta = JSON.parse(readFileSync(join(srcDir, 'meta.json'), 'utf8'))
const errors = []
const seen = new Map()
const words = Object.fromEntries(LEVELS.map((l) => [l, {}]))

const normalize = (w) => w.replace(/ё/g, 'е')

for (const cat of meta.categories) {
  const rules = RULES[cat.group ?? 'base']
  if (!rules) {
    errors.push(`${cat.id}: неизвестная группа ${cat.group}`)
    continue
  }
  const file = join(srcDir, `${cat.id}.txt`)
  if (!existsSync(file)) {
    errors.push(`${cat.id}: нет файла ${cat.id}.txt`)
    continue
  }
  let level = null
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((raw, i) => {
    const line = raw.trim()
    const where = `${cat.id}.txt:${i + 1}`
    if (!line || line.startsWith('#')) return
    const section = line.match(/^\[(\w+)\]$/)
    if (section) {
      level = section[1]
      if (!LEVELS.includes(level)) errors.push(`${where}: неизвестная секция [${level}]`)
      return
    }
    if (!level) {
      errors.push(`${where}: слово «${line}» вне секции`)
      return
    }
    const spaced = line.replace(/\s+/g, ' ')
    const word = rules.lower ? spaced.toLowerCase() : spaced
    if (!rules.re.test(word)) errors.push(`${where}: недопустимые символы в «${line}»`)
    if (word.split(' ').length > rules.maxWords) errors.push(`${where}: слишком длинная фраза «${line}»`)
    const key = normalize(word.toLowerCase())
    if (seen.has(key)) {
      errors.push(`${where}: дубль «${word}» (уже есть в ${seen.get(key)})`)
      return
    }
    seen.set(key, where)
    ;(words[level][cat.id] ??= []).push(word)
  })
}

if (errors.length) {
  console.error(`✖ Ошибки в словаре (${errors.length}):`)
  for (const e of errors.slice(0, 50)) console.error('  ' + e)
  process.exit(1)
}

const collator = new Intl.Collator('ru')
for (const level of LEVELS) {
  for (const cat of Object.keys(words[level])) words[level][cat].sort(collator.compare)
}

const pack = {
  version: meta.version,
  lang: 'ru',
  categories: meta.categories.map(({ id, name, emoji, group = 'base', description }) =>
    description ? { id, name, emoji, group, description } : { id, name, emoji, group },
  ),
  words,
}
const json = JSON.stringify(pack) + '\n'

const counts = LEVELS.map((l) => [l, Object.values(words[l]).reduce((n, list) => n + list.length, 0)])
const total = counts.reduce((n, [, c]) => n + c, 0)
const summary = `${total} слов (${counts.map(([l, c]) => `${l}: ${c}`).join(', ')}), словарь v${meta.version}`

if (process.argv.includes('--check')) {
  const current = existsSync(outFile) ? readFileSync(outFile, 'utf8') : ''
  if (current !== json) {
    console.error('✖ src/data/words.ru.json устарел — запустите npm run words:build')
    process.exit(1)
  }
  console.log(`✔ Словарь актуален: ${summary}`)
} else {
  writeFileSync(outFile, json)
  console.log(`✔ Собрано: ${summary}`)
}
