import { levelsLabel } from '../game/presets'
import type { GameSettings } from '../game/types'
import { pluralCount } from '../lib/format'
import { BASE_CATEGORIES, EXTRA_PACKS } from './wordpack'

/** Короткое описание выбранных слов: «Средний · 20 из 28 тем · + 2 набора». */
export function wordsSummary(settings: Pick<GameSettings, 'levels' | 'excludedCategories' | 'packs'>): string {
  const parts = [levelsLabel(settings.levels)]
  const themesOff = BASE_CATEGORIES.filter((c) => settings.excludedCategories.includes(c.id)).length
  if (themesOff === BASE_CATEGORIES.length) parts.push('без обычных слов')
  else if (themesOff > 0) parts.push(`${BASE_CATEGORIES.length - themesOff} из ${BASE_CATEGORIES.length} тем`)
  const packs = EXTRA_PACKS.filter((p) => settings.packs.includes(p.id)).length
  if (packs > 0) parts.push(`+ ${pluralCount(packs, 'набор', 'набора', 'наборов')}`)
  return parts.join(' · ')
}
