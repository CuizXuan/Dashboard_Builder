import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart as LineChartType } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMemo } from 'react'
import { Empty } from 'antd'
import type { ChartConfig } from '../../../types'
import { CHART_COLORS, TOOLTIP_COMMON } from '../../../utils/chartConfig'
import { useDashboardStore } from '../../../store/useDashboardStore'
import { useDataSource, useChartData } from '../../../hooks/useDataSource'

echarts.use([LineChartType, GridComponent, TooltipComponent, CanvasRenderer])

export default function LineChart({ config, fullscreen }: { config: ChartConfig; fullscreen?: boolean }) {
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

  const option = useMemo(() => {
    if (chartData.length === 0) return null
    return {
      ...TOOLTIP_COMMON,
      grid: { left: 40, right: 16, top: 16, bottom: 32 },
      xAxis: {
        type: 'category',
        data: chartData.map((d) => d.name),
        axisLine: { lineStyle: { color: '#E8E8E8' } },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: '#8C8C8C' },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#F0F0F0', type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: '#8C8C8C' },
      },
      series: [
        {
          type: 'line',
          data: chartData.map((d) => d.value),
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 2, color: CHART_COLORS[3] },
          itemStyle: { color: CHART_COLORS[3], borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(77,150,255,0.18)' },
                { offset: 1, color: 'rgba(77,150,255,0)' },
              ],
            },
          },
          emphasis: { scale: true, scaleSize: 10 },
        },
      ],
    }
  }, [chartData, fullscreen])

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
