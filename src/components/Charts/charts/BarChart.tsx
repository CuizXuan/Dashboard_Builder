import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart as BarChartType } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMemo } from 'react'
import { Empty } from 'antd'
import type { ChartConfig } from '../../../types'
import { CHART_COLORS, TOOLTIP_COMMON } from '../../../utils/chartConfig'
import { useDashboardStore } from '../../../store/useDashboardStore'
import { useDataSource, useChartData } from '../../../hooks/useDataSource'

echarts.use([BarChartType, GridComponent, TooltipComponent, CanvasRenderer])

export default function BarChart({ config, fullscreen }: { config: ChartConfig; fullscreen?: boolean }) {
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
      grid: { left: 80, right: 48, top: 16, bottom: 32 },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#F0F0F0', type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: '#8C8C8C' },
      },
      yAxis: {
        type: 'category',
        data: chartData.map((d) => d.name).reverse(),
        axisLine: { lineStyle: { color: '#E8E8E8' } },
        axisTick: { show: false },
        axisLabel: { fontSize: 12, color: '#595959' },
      },
      series: [
        {
          type: 'bar',
          data: chartData.map((d, i) => ({
            value: d.value,
            itemStyle: {
              color: CHART_COLORS[i % CHART_COLORS.length],
              borderRadius: [0, 4, 4, 0],
            },
          })).reverse(),
          barMaxWidth: fullscreen ? 40 : 24,
          label: {
            show: true,
            position: 'right',
            fontSize: 12,
            color: '#262626',
            fontWeight: 600,
            formatter: '{c}',
          },
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.1)' },
          },
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
