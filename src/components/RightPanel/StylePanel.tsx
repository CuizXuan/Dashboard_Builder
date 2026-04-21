import { Select, Switch, Divider } from 'antd'
import type { Card } from '../../types'

interface Props {
  card: Card
  onUpdate: (updates: Partial<Card['chartConfig']>) => void
}

export default function StylePanel({ card, onUpdate }: Props) {
  const { chartConfig } = card

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 图例 */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8, display: 'block' }}>图例</label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13 }}>显示图例</span>
          <Switch
            size="small"
            checked={chartConfig.style.showLegend}
            onChange={(checked) => onUpdate({ style: { ...chartConfig.style, showLegend: checked } })}
          />
        </div>
        {chartConfig.style.showLegend && (
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>图例位置</label>
            <Select
              style={{ width: '100%' }}
              value={chartConfig.style.legendPosition}
              onChange={(val) => onUpdate({ style: { ...chartConfig.style, legendPosition: val } })}
              options={[
                { value: 'right', label: '右侧' },
                { value: 'bottom', label: '底部' },
              ]}
            />
          </div>
        )}
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* 图表类型 */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>图表类型</label>
        <Select
          style={{ width: '100%' }}
          value={chartConfig.type}
          onChange={(val) => onUpdate({ type: val })}
          options={[
            { value: 'pie', label: '饼图 / 环形图' },
            { value: 'line', label: '折线图' },
            { value: 'bar', label: '柱状图' },
            { value: 'table', label: '数据表格' },
          ]}
        />
      </div>

      {/* 显示模式 */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8, display: 'block' }}>显示模式</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>显示图表</span>
            <Switch
              size="small"
              checked={chartConfig.style.showChart}
              onChange={(checked) => onUpdate({ style: { ...chartConfig.style, showChart: checked } })}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>显示表格</span>
            <Switch
              size="small"
              checked={chartConfig.style.showTable}
              onChange={(checked) => onUpdate({ style: { ...chartConfig.style, showTable: checked } })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
