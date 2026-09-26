import { useSyncExternalStore } from 'react'
import { storage } from './storage'

/**
 * История показанных слов — главный механизм против повторов.
 * Хранится отдельно от игры и переживает любые партии, пока пользователь её не сбросит.
 */
const KEY = 'alias:seen-words'

let seen = new Set<string>()
let version = 0
let saveTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<() => void>()

function emit() {
  version++
  listeners.forEach((l) => l())
}

export async function loadSeen(): Promise<void> {
  const raw = await storage.getItem(KEY)
  if (!raw) return
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) seen = new Set(parsed.filter((w) => typeof w === 'string'))
  } catch {
    seen = new Set()
  }
  emit()
}

export function getSeen(): Set<string> {
  return seen
}

export function markSeen(word: string): void {
  seen.add(word)
  scheduleSave()
  emit()
}

/** Вызывается после того, как pickWord сбросил часть истории. */
export function seenChanged(): void {
  scheduleSave()
  emit()
}

export function resetSeen(): void {
  seen = new Set()
  void storage.setItem(KEY, '[]')
  emit()
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(flushSeen, 700)
}

export function flushSeen(): void {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  void storage.setItem(KEY, JSON.stringify([...seen]))
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Перерисовывает компонент, когда история меняется. */
export function useSeenVersion(): number {
  return useSyncExternalStore(subscribe, () => version)
}
