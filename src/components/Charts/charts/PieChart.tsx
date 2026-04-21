import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { PieChart as EChartsPieChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMemo, useState, useCallback } from 'react'
import type { ChartConfig } from '../../../types'
import { CHART_COLORS, TOOLTIP_COMMON } from '../../../utils/chartConfig'
import LegendPanel from '../LegendPanel'

echarts.use([EChartsPieChart, TooltipComponent, TitleComponent, CanvasRenderer])

const DEMO_DATA = [
  { name: '联合调度决策/防洪调度', value: 27 },
  { name: '水库优化调度', value: 21 },
  { name: '航道应急保障', value: 18 },
  { name: '水资源配置', value: 15 },
  { name: '其他', value: 24 },
]

interface Props {
  config: ChartConfig
  fullscreen?: boolean
  onLegendClick?: (name: string) => void
}

export default function PieChart({ fullscreen, onLegendClick }: Props) {
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set())
  const total = DEMO_DATA.reduce((s, d) => s + d.value, 0)

  const toggleItem = useCallback((name: string) => {
    setHiddenItems((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
    onLegendClick?.(name)
  }, [onLegendClick])

  const option = useMemo(() => ({
    ...TOOLTIP_COMMON,
    formatter: (params: any) => {
      const pct = ((params.value / total) * 100).toFixed(1)
      return `<b>${params.name}</b><br/>数值：${params.value}（${pct}%）`
    },
    series: [
      {
        type: 'pie',
        radius: fullscreen ? ['35%', '60%'] : ['42%', '68%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data: DEMO_DATA.map((d, i) => ({
          value: d.value,
          name: d.name,
          itemStyle: {
            color: CHART_COLORS[i % CHART_COLORS.length],
            opacity: hiddenItems.has(d.name) ? 0.15 : 1,
            borderColor: '#fff',
            borderWidth: 2,
          },
        })),
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.15)' },
        },
      },
    ],
  }), [fullscreen, hiddenItems, total])

  return (
    <div style={{ display: 'flex', gap: 8, height: '100%', width: '100%' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
      <div style={{ width: '35%', minWidth: 80 }}>
        <LegendPanel
          items={DEMO_DATA.map((d, i) => ({
            name: d.name,
            value: d.value,
            color: CHART_COLORS[i % CHART_COLORS.length],
          }))}
          onItemClick={toggleItem}
        />
      </div>
    </div>
  )
}
