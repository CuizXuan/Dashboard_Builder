import type { ChartConfig } from '../../../types'

const DEMO_DATA = [
  { name: '联合调度决策/防洪调度', value: 27 },
  { name: '水库优化调度', value: 21 },
  { name: '航道应急保障', value: 18 },
  { name: '水资源配置', value: 15 },
  { name: '其他', value: 24 },
]

const DEMO_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6']

export default function PieChart({ fullscreen }: { config: ChartConfig; fullscreen?: boolean }) {
  const total = DEMO_DATA.reduce((s, d) => s + d.value, 0)

  return (
    <div style={{ display: 'flex', gap: 12, height: '100%' }}>
      {/* 饼图区域 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', maxWidth: fullscreen ? 300 : 160 }}>
          {DEMO_DATA.reduce<React.ReactElement[]>((acc, item, i) => {
            const startAngle = DEMO_DATA.slice(0, i).reduce((s, d) => s + (d.value / total) * 360, 0)
            const angle = (item.value / total) * 360
            const startRad = (startAngle - 90) * Math.PI / 180
            const endRad = (startAngle + angle - 90) * Math.PI / 180
            const cx = 50, cy = 50, r = 40
            const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad)
            const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad)
            const largeArc = angle > 180 ? 1 : 0
            acc.push(
              <path
                key={item.name}
                d={`M 50 50 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={DEMO_COLORS[i % DEMO_COLORS.length]}
                opacity={0.9}
                stroke="white"
                strokeWidth={1}
              />
            )
            return acc
          }, [])}
          <circle cx="50" cy="50" r="20" fill="white" />
          <text x="50" y="53" textAnchor="middle" fontSize="7" fontWeight="600" fill="#262626">
            {total}
          </text>
        </svg>
      </div>

      {/* 图例 */}
      <div style={{ width: '35%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
        {DEMO_DATA.map((item, i) => {
          const pct = ((item.value / total) * 100).toFixed(1)
          return (
            <div
              key={item.name}
              style={{
                height: 36,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 8px',
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: DEMO_COLORS[i % DEMO_COLORS.length],
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: 11, color: '#595959', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#262626', fontVariantNumeric: 'tabular-nums' }}>
                {item.value}
              </span>
              <span style={{ fontSize: 11, color: '#8c8c8c', minWidth: 36, textAlign: 'right' }}>
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
