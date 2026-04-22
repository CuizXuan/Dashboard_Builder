import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { GaugeChart as GaugeChartType } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMemo } from 'react'
import { Empty } from 'antd'
import type { ChartConfig } from '../../../types'
import { CHART_COLORS } from '../../../utils/chartConfig'
import { useDashboardStore } from '../../../store/useDashboardStore'
import { useDataSource, useChartData } from '../../../hooks/useDataSource'

echarts.use([GaugeChartType, TooltipComponent, CanvasRenderer])

export default function GaugeChart({ config, fullscreen }: { config: ChartConfig; fullscreen?: boolean }) {
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

  // 取第一个数据作为仪表值
  const value = chartData[0]?.value ?? 0
  const name = chartData[0]?.name ?? config.title
  const max = Math.max(...chartData.map((d) => d.value), 1) * 1.5

  const option = useMemo(() => ({
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -160,
      radius: fullscreen ? '85%' : '75%',
      center: ['50%', '55%'],
      min: 0,
      max,
      splitNumber: 5,
      axisLine: {
        lineStyle: {
          width: fullscreen ? 20 : 14,
          color: [
            [0.3, CHART_COLORS[2]],
            [0.7, CHART_COLORS[0]],
            [1, CHART_COLORS[1]],
          ],
        },
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '48%',
        width: 8,
        itemStyle: { color: '#595959' },
      },
      axisTick: { length: 6, lineStyle: { color: '#E8E8E8', width: 1 } },
      splitLine: { length: fullscreen ? 14 : 10, lineStyle: { color: '#E8E8E8', width: 2 } },
      axisLabel: { color: '#8C8C8C', fontSize: 11, distance: 16 },
      detail: {
        valueAnimation: true,
        formatter: '{value}',
        color: '#262626',
        fontSize: fullscreen ? 28 : 22,
        offsetCenter: [0, '30%'],
        fontWeight: 600,
      },
      title: {
        offsetCenter: [0, '70%'],
        fontSize: 13,
        color: '#595959',
      },
      data: [{ value, name }],
    }],
  }), [value, name, max, fullscreen])

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
