import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { PieChart as EChartsPieChart } from 'echarts/charts'
import { TooltipComponent, TitleComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMemo, useState, useCallback } from 'react'
import { Empty } from 'antd'
import type { ChartConfig } from '../../../types'
import { CHART_COLORS, TOOLTIP_COMMON } from '../../../utils/chartConfig'
import LegendPanel from '../LegendPanel'
import { useDashboardStore } from '../../../store/useDashboardStore'
import { useDataSource, useChartData } from '../../../hooks/useDataSource'

echarts.use([EChartsPieChart, TooltipComponent, TitleComponent, CanvasRenderer])

interface Props {
  config: ChartConfig
  fullscreen?: boolean
  onLegendClick?: (name: string) => void
}

export default function PieChart({ config, fullscreen, onLegendClick }: Props) {
  const { dataSources } = useDashboardStore()
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set())

  const selectedDs = dataSources.find((ds) => ds.id === (config.dataMapping as any).sourceId)
  const { data: dataset } = useDataSource(
    (config.dataMapping as any).sourceId,
    selectedDs?.config as any
  )

  const chartData = useChartData(
    dataset,
    config.dataMapping.dimensionField,
    config.dataMapping.measureField,
    config.dataMapping.aggregation,
    config.sortBy,
    config.limit
  )

  const total = chartData.reduce((s, d) => s + d.value, 0)

  const toggleItem = useCallback((name: string) => {
    setHiddenItems((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
    onLegendClick?.(name)
  }, [onLegendClick])

  const option = useMemo(() => {
    if (chartData.length === 0) return null
    return {
      ...TOOLTIP_COMMON,
      formatter: (params: any) => {
        const pct = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0.0'
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
          data: chartData.map((d, i) => ({
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
    }
  }, [chartData, fullscreen, hiddenItems, total])

  if (chartData.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)' }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先配置数据源" />
      </div>
    )
  }

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
          items={chartData.map((d, i) => ({
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
