import type { ChartConfig } from '../../../types'

const DEMO_DATA = [
  { month: '1月', value: 42 },
  { month: '2月', value: 55 },
  { month: '3月', value: 38 },
  { month: '4月', value: 67 },
  { month: '5月', value: 73 },
  { month: '6月', value: 61 },
]

export default function LineChart({ fullscreen }: { config: ChartConfig; fullscreen?: boolean }) {
  const max = Math.max(...DEMO_DATA.map((d) => d.value))
  const height = fullscreen ? 400 : 160

  const points = DEMO_DATA.map((d, i) => ({
    x: (i / (DEMO_DATA.length - 1)) * 100,
    y: 100 - (d.value / max) * 80,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L 100 100 L 0 100 Z`

  return (
    <div style={{ padding: '8px 0' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height }}>
        {/* 网格线 */}
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#E8E8E8" strokeDasharray="2" />
        ))}
        {/* 面积 */}
        <path d={areaD} fill="rgba(24, 144, 255, 0.1)" />
        {/* 折线 */}
        <path d={pathD} fill="none" stroke="#1890FF" strokeWidth="2" strokeLinecap="round" />
        {/* 数据点 */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#1890FF" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#8C8C8C' }}>
        {DEMO_DATA.map((d) => (
          <span key={d.month}>{d.month}</span>
        ))}
      </div>
    </div>
  )
}
