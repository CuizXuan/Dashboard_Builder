import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { BarChart as BarChartType } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMemo } from 'react'
import type { ChartConfig } from '../../../types'
import { CHART_COLORS, TOOLTIP_COMMON } from '../../../utils/chartConfig'

echarts.use([BarChartType, GridComponent, TooltipComponent, CanvasRenderer])

const DEMO_DATA = [
  { name: '联合调度决策', value: 27 },
  { name: '水库优化', value: 21 },
  { name: '航道应急', value: 18 },
  { name: '水资源配置', value: 15 },
  { name: '其他', value: 24 },
]

export default function BarChart({ fullscreen }: { config: ChartConfig; fullscreen?: boolean }) {
  const option = useMemo(() => ({
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
      data: DEMO_DATA.map((d) => d.name).reverse(),
      axisLine: { lineStyle: { color: '#E8E8E8' } },
      axisTick: { show: false },
      axisLabel: { fontSize: 12, color: '#595959' },
    },
    series: [
      {
        type: 'bar',
        data: DEMO_DATA.map((d, i) => ({
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
  }), [fullscreen])

  return (
    <ReactEChartsCore echarts={echarts} option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
  )
}
