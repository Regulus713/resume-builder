import { useEffect, useState } from 'react'

/**
 * @param mergeBase Defaults merged under a stored object so fields added later
 *   exist on old saves. Defaults to `initial`; pass an "empty" value when
 *   `initial` is demo content that shouldn't leak into existing saves.
 */
export function usePersistentState<T>(key: string, initial: T, mergeBase: T = initial) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return initial
      const parsed = JSON.parse(stored) as T
      // Merge over defaults so newly added fields exist on old saves.
      if (
        mergeBase !== null &&
        typeof mergeBase === 'object' &&
        !Array.isArray(mergeBase) &&
        parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return { ...mergeBase, ...parsed }
      }
      return parsed
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable — ignore
    }
  }, [key, value])

  return [value, setValue] as const
}
