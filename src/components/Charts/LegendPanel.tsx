import { useState, useCallback } from 'react'
import { CHART_COLORS } from '../../utils/chartConfig'

export interface LegendItem {
  name: string
  value: number
  color?: string
}

interface LegendPanelProps {
  items: LegendItem[]
  onItemClick?: (name: string) => void
  onItemHover?: (name: string | null) => void
}

export default function LegendPanel({ items, onItemClick, onItemHover }: LegendPanelProps) {
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set())

  const total = items.reduce((s, d) => s + d.value, 0)

  const toggleItem = useCallback((name: string) => {
    setHiddenItems((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
    onItemClick?.(name)
  }, [onItemClick])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 2,
      height: '100%',
      overflowY: 'auto',
    }}>
      {items.map((item, i) => {
        const hidden = hiddenItems.has(item.name)
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
        const color = item.color || CHART_COLORS[i % CHART_COLORS.length]

        return (
          <div
            key={item.name}
            className="legend-item"
            style={{
              opacity: hidden ? 0.4 : 1,
              cursor: 'pointer',
            }}
            onClick={() => toggleItem(item.name)}
            onMouseEnter={() => onItemHover?.(item.name)}
            onMouseLeave={() => onItemHover?.(null)}
          >
            <span
              className="legend-item__dot"
              style={{
                background: color,
                textDecoration: hidden ? 'line-through' : 'none',
              }}
            />
            <span className="legend-item__name" title={item.name}>
              {item.name}
            </span>
            <span className="legend-item__value">{item.value}</span>
            <span className="legend-item__percent">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}
