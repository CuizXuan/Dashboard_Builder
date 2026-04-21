import { useCallback, useRef } from 'react'

interface LinkageState {
  activeCardId: string | null
  activeItemName: string | null
}

export function useChartLinkage() {
  const stateRef = useRef<LinkageState>({ activeCardId: null, activeItemName: null })

  const handleLegendClick = useCallback((cardId: string, itemName: string) => {
    stateRef.current = { activeCardId: cardId, activeItemName: itemName }
  }, [])

  const isItemHighlighted = useCallback((cardId: string, itemName: string): boolean => {
    const { activeCardId, activeItemName } = stateRef.current
    if (!activeItemName || activeCardId === cardId) return true
    return activeItemName === itemName
  }, [])

  const isItemDimmed = useCallback((cardId: string, itemName: string): boolean => {
    const { activeCardId, activeItemName } = stateRef.current
    if (!activeItemName || activeCardId === cardId) return false
    return activeItemName !== itemName
  }, [])

  return { handleLegendClick, isItemHighlighted, isItemDimmed }
}
