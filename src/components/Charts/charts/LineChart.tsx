import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart as LineChartType } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useMemo } from 'react'
import { CHART_COLORS, TOOLTIP_COMMON } from '../../../utils/chartConfig'

echarts.use([LineChartType, GridComponent, TooltipComponent, CanvasRenderer])

const DEMO_DATA = [
  { month: '1月', value: 42 },
  { month: '2月', value: 55 },
  { month: '3月', value: 38 },
  { month: '4月', value: 67 },
  { month: '5月', value: 73 },
  { month: '6月', value: 61 },
]

export default function LineChart({ fullscreen }: { config: unknown; fullscreen?: boolean }) {
  const option = useMemo(() => ({
    ...TOOLTIP_COMMON,
    grid: { left: 40, right: 16, top: 16, bottom: 32 },
    xAxis: {
      type: 'category',
      data: DEMO_DATA.map((d) => d.month),
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
        data: DEMO_DATA.map((d) => d.value),
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
  }), [fullscreen])

  return (
    <ReactEChartsCore echarts={echarts} option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
  )
}
