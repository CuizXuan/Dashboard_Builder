import type { ChartConfig } from '../../../types'

const DEMO_DATA = [
  { name: '联合调度决策', value: 27 },
  { name: '水库优化', value: 21 },
  { name: '航道应急', value: 18 },
  { name: '水资源配置', value: 15 },
]

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF']

export default function BarChart({ fullscreen }: { config: ChartConfig; fullscreen?: boolean }) {
  const max = Math.max(...DEMO_DATA.map((d) => d.value))
  const barHeight = fullscreen ? 30 : 20

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
      {DEMO_DATA.map((item, i) => {
        const widthPct = (item.value / max) * 100
        return (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 70, fontSize: 11, color: '#595959', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </div>
            <div style={{ flex: 1, height: barHeight, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  background: COLORS[i % COLORS.length],
                  borderRadius: 4,
                  transition: 'width 0.5s ease',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 8,
                }}
              >
                <span style={{ fontSize: 11, color: 'white', fontWeight: 600 }}>{item.value}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
