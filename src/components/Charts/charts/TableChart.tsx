import { Empty } from 'antd'
import type { ChartConfig } from '../../../types'
import { useDashboardStore } from '../../../store/useDashboardStore'
import { useDataSource } from '../../../hooks/useDataSource'

export default function TableChart({ config }: { config: ChartConfig; fullscreen?: boolean }) {
  const { dataSources } = useDashboardStore()

  const selectedDs = dataSources.find((ds) => ds.id === (config.dataMapping as any).sourceId)
  const { data: dataset } = useDataSource(
    (config.dataMapping as any).sourceId,
    selectedDs?.config as any
  )

  if (!dataset || dataset.data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)' }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先配置数据源" />
      </div>
    )
  }

  const columns = dataset.dimensions.map((d) => d.name)
  const rows = dataset.data.slice(0, config.limit || 20)

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#FAFAFA', borderBottom: '2px solid #1890FF' }}>
            {columns.map((col) => (
              <th key={col} style={{ padding: '8px 12px', textAlign: 'left', color: '#262626', fontWeight: 500 }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: '1px solid #F0F0F0',
                background: i % 2 === 0 ? 'white' : '#FAFAFA',
              }}
            >
              {columns.map((col) => (
                <td key={col} style={{ padding: '10px 12px', color: '#595959' }}>
                  {String(row[col] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
