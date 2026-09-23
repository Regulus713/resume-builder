import { useEffect, useState } from 'react'

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return initial
      const parsed = JSON.parse(stored) as T
      // Merge over defaults so newly added fields exist on old saves.
      if (
        initial !== null &&
        typeof initial === 'object' &&
        !Array.isArray(initial) &&
        parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return { ...initial, ...parsed }
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
