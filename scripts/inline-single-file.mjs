#!/usr/bin/env node
/**
 * Дожимает сборку `vite build --mode single` до одного самодостаточного HTML:
 * встраивает JS, CSS и иконку, убирает ссылки на внешние файлы.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(process.cwd(), 'dist-single')
const read = (href) => readFileSync(join(dir, href.replace(/^\.\//, '')))
let html = readFileSync(join(dir, 'index.html'), 'utf8')

html = html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, (_, src) => {
  const js = read(src).toString('utf8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">${js}</script>`
})
html = html.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, (_, href) => `<style>${read(href).toString('utf8')}</style>`)
html = html.replace(/<link rel="(icon|apple-touch-icon)"[^>]*href="([^"]+\.svg)"[^>]*>/g, (_, rel, href) => {
  const data = read(href).toString('base64')
  return `<link rel="${rel}" type="image/svg+xml" href="data:image/svg+xml;base64,${data}">`
})
html = html.replace(/\s*<link rel="manifest"[^>]*>/, '')

if (/(src|href)="\.\/assets\//.test(html)) {
  console.error('✖ В HTML остались ссылки на ./assets — встраивание не сработало')
  process.exit(1)
}

writeFileSync(join(dir, 'index.html'), html)
for (const extra of ['assets', 'icon.svg', 'manifest.webmanifest']) rmSync(join(dir, extra), { recursive: true, force: true })
console.log(`✔ dist-single/index.html — ${(Buffer.byteLength(html) / 1024).toFixed(0)} КБ, один файл`)
