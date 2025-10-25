import { useState, useCallback, useEffect, Dispatch, SetStateAction } from "react"

/**
 * Hook for managing expandable sections state
 * Consolidates duplicate logic from Step2Form and Step3Form
 *
 * @param itemCount Number of items in the array
 * @param defaultExpanded Whether sections should be expanded by default (default: true)
 * @returns Object with expanded state, toggle function, and setter
 */
export const useExpandableSections = (itemCount: number, defaultExpanded = true) => {
  const [expanded, setExpanded] = useState<boolean[]>(() =>
    Array(itemCount).fill(defaultExpanded)
  )

  // Sync with itemCount changes (when items are added/removed)
  useEffect(() => {
    setExpanded((prev) => {
      const newLength = itemCount
      const oldLength = prev.length

      if (newLength === oldLength) return prev

      if (newLength > oldLength) {
        // Items added - expand new items by default
        return [...prev, ...Array(newLength - oldLength).fill(defaultExpanded)]
      } else {
        // Items removed - truncate array
        return prev.slice(0, newLength)
      }
    })
  }, [itemCount, defaultExpanded])

  /**
   * Toggle the expanded state of a specific section
   * @param index Index of the section to toggle
   */
  const toggle = useCallback((index: number) => {
    setExpanded((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }, [])

  /**
   * Expand all sections
   */
  const expandAll = useCallback(() => {
    setExpanded((prev) => prev.map(() => true))
  }, [])

  /**
   * Collapse all sections
   */
  const collapseAll = useCallback(() => {
    setExpanded((prev) => prev.map(() => false))
  }, [])

  return {
    expanded,
    setExpanded,
    toggle,
    expandAll,
    collapseAll,
  }
}

export type UseExpandableSectionsReturn = ReturnType<typeof useExpandableSections>
