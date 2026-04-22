import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { RadarChart as RadarChartType } from 'echarts/charts'
import { RadarComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMemo } from 'react'
import { Empty } from 'antd'
import type { ChartConfig } from '../../../types'
import { CHART_COLORS, TOOLTIP_COMMON } from '../../../utils/chartConfig'
import { useDashboardStore } from '../../../store/useDashboardStore'
import { useDataSource, useChartData } from '../../../hooks/useDataSource'

echarts.use([RadarChartType, RadarComponent, TooltipComponent, CanvasRenderer])

export default function RadarChart({ config, fullscreen }: { config: ChartConfig; fullscreen?: boolean }) {
  const { dataSources } = useDashboardStore()

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

  const maxVal = useMemo(() => Math.max(...chartData.map((d) => d.value), 1), [chartData])

  const option = useMemo(() => {
    if (chartData.length === 0) return null
    return {
      ...TOOLTIP_COMMON,
      radar: {
        indicator: chartData.map((d) => ({ name: d.name, max: maxVal * 1.2 })),
        radius: fullscreen ? '65%' : '55%',
        axisName: { color: '#595959', fontSize: 12 },
        splitArea: { areaStyle: { color: ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.05)'] } },
        axisLine: { lineStyle: { color: '#E8E8E8' } },
        splitLine: { lineStyle: { color: '#F0F0F0' } },
      },
      series: [{
        type: 'radar',
        data: [{
          value: chartData.map((d) => d.value),
          name: '指标',
          lineStyle: { color: CHART_COLORS[0], width: 2 },
          areaStyle: { color: CHART_COLORS[0], opacity: 0.2 },
          itemStyle: { color: CHART_COLORS[0] },
          label: { show: true, color: '#262626', fontSize: 11 },
        }],
      }],
    }
  }, [chartData, fullscreen, maxVal])

  if (chartData.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)' }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先配置数据源" />
      </div>
    )
  }

  return (
    <ReactEChartsCore echarts={echarts} option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
  )
}
