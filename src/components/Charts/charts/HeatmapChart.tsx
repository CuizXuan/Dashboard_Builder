import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { HeatmapChart as HeatmapChartType } from 'echarts/charts'
import { GridComponent, VisualMapComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMemo } from 'react'
import { Empty } from 'antd'
import type { ChartConfig } from '../../../types'
import { useDashboardStore } from '../../../store/useDashboardStore'
import { useDataSource } from '../../../hooks/useDataSource'

echarts.use([HeatmapChartType, GridComponent, VisualMapComponent, TooltipComponent, CanvasRenderer])

export default function HeatmapChart({ config, fullscreen }: { config: ChartConfig; fullscreen?: boolean }) {
  const { dataSources } = useDashboardStore()

  const selectedDs = dataSources.find((ds) => ds.id === (config.dataMapping as any).sourceId)
  const { data: dataset } = useDataSource(
    (config.dataMapping as any).sourceId,
    selectedDs?.config as any
  )

  const chartData = useMemo(() => {
    if (!dataset || dataset.data.length === 0) return []
    return dataset.data.slice(0, config.limit || 30).map((row, i) => {
      const dims = dataset.dimensions
      const xField = dims[0]?.name
      const yField = dims[1]?.name || dims[0]?.name
      const vField = config.dataMapping.measureField || dims.find((d) => d.type === 'number')?.name || dims[dims.length - 1]?.name
      return [
        String(row[xField as string] ?? i),
        String(row[yField as string] ?? i),
        Number(row[vField as string] ?? 0),
      ]
    })
  }, [dataset, config])

  const xData = [...new Set(chartData.map((d) => d[0]))]
  const yData = [...new Set(chartData.map((d) => d[1]))]
  const maxVal = Math.max(...chartData.map((d) => d[2] as number), 1)

  const option = useMemo(() => {
    if (chartData.length === 0) return null
    return {
      tooltip: { trigger: 'item' },
      grid: { left: 60, right: 48, top: 16, bottom: 40 },
      xAxis: {
        type: 'category',
        data: xData,
        axisLine: { lineStyle: { color: '#E8E8E8' } },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: '#8C8C8C', rotate: 30 },
        splitArea: { show: false },
      },
      yAxis: {
        type: 'category',
        data: yData,
        axisLine: { lineStyle: { color: '#E8E8E8' } },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: '#8C8C8C' },
        splitArea: { show: false },
      },
      visualMap: {
        min: 0,
        max: maxVal,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: {
          color: ['#E8F7FF', '#1890FF', '#0050B3'],
        },
        textStyle: { fontSize: 10, color: '#8C8C8C' },
      },
      series: [{
        type: 'heatmap',
        data: chartData,
        label: { show: fullscreen, fontSize: 10, color: '#fff' },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
          borderRadius: 2,
        },
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.2)' },
        },
      }],
    }
  }, [chartData, xData, yData, maxVal, fullscreen])

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
