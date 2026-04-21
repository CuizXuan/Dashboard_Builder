import type { ChartConfig } from '../../../types'

const DEMO_DATA = [
  { name: '联合调度决策/防洪调度', module: '调度模块', count: 27, resolved: 22 },
  { name: '水库优化调度', module: '水库模块', count: 21, resolved: 18 },
  { name: '航道应急保障', module: '航道模块', count: 18, resolved: 15 },
  { name: '水资源配置', module: '配置模块', count: 15, resolved: 12 },
  { name: '其他', module: '通用模块', count: 24, resolved: 20 },
]

export default function TableChart({}: { config: ChartConfig; fullscreen?: boolean }) {
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#FAFAFA', borderBottom: '2px solid #1890FF' }}>
            {['名称', '模块', '数量', '已解决', '解决率'].map((col) => (
              <th key={col} style={{ padding: '8px 12px', textAlign: 'left', color: '#262626', fontWeight: 500 }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEMO_DATA.map((row, i) => (
            <tr
              key={row.name}
              style={{
                borderBottom: '1px solid #F0F0F0',
                background: i % 2 === 0 ? 'white' : '#FAFAFA',
              }}
            >
              <td style={{ padding: '10px 12px', color: '#595959' }}>{row.name}</td>
              <td style={{ padding: '10px 12px', color: '#595959' }}>{row.module}</td>
              <td style={{ padding: '10px 12px', fontWeight: 600, color: '#262626' }}>{row.count}</td>
              <td style={{ padding: '10px 12px', color: '#595959' }}>{row.resolved}</td>
              <td style={{ padding: '10px 12px', color: '#8C8C8C' }}>
                {((row.resolved / row.count) * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
