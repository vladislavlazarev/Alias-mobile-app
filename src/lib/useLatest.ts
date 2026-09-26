import { useRef } from 'react'

/**
 * Возвращает последнее непустое значение. Нужен экранам, которые ещё анимируются на выход,
 * когда стор уже перешёл дальше (например, ход завершён и turn стал null).
 */
export function useLatest<T>(value: T | null | undefined): T {
  const ref = useRef(value)
  if (value !== null && value !== undefined) ref.current = value
  return ref.current as T
}
