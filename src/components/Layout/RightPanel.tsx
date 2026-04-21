import { Tabs, Input, Select, Divider, Empty } from 'antd'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { Card } from '../../types'

export default function RightPanel() {
  const { dashboard, ui, updateCard } = useDashboardStore()

  const selectedCard = dashboard.cards.find((c) => c.id === ui.selectedCardId) as Card | undefined

  return (
    <aside className="app-right-panel">
      <div className="app-right-panel__header">图表配置</div>
      <div className="app-right-panel__content">
        {selectedCard ? (
          <ConfigPanel card={selectedCard} onUpdate={(updates) => updateCard(selectedCard.id, { chartConfig: { ...selectedCard.chartConfig, ...updates } })} />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="点击画布上的图表以编辑"
            style={{ marginTop: 64 }}
          />
        )}
      </div>
    </aside>
  )
}

function ConfigPanel({ card, onUpdate }: { card: Card; onUpdate: (updates: Partial<Card['chartConfig']>) => void }) {
  const { dataSources } = useDashboardStore()
  const { chartConfig } = card

  return (
    <Tabs
      defaultActiveKey="data"
      items={[
        {
          key: 'data',
          label: '数据',
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>图表标题</label>
                <Input
                  value={chartConfig.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>数据源</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="选择数据源"
                  allowClear
                  options={dataSources.map((ds) => ({ value: ds.id, label: ds.name }))}
                  onChange={(val) => onUpdate({ dataMapping: { ...chartConfig.dataMapping, sourceId: val } } as any)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>维度字段（分类/X轴）</label>
                <Input
                  placeholder="例如：模块名称"
                  value={chartConfig.dataMapping.dimensionField}
                  onChange={(e) => onUpdate({ dataMapping: { ...chartConfig.dataMapping, dimensionField: e.target.value } })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>度量字段（数值/Y轴）</label>
                <Input
                  placeholder="例如：Bug数量"
                  value={chartConfig.dataMapping.measureField}
                  onChange={(e) => onUpdate({ dataMapping: { ...chartConfig.dataMapping, measureField: e.target.value } })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>聚合方式</label>
                <Select
                  style={{ width: '100%' }}
                  value={chartConfig.dataMapping.aggregation}
                  onChange={(val) => onUpdate({ dataMapping: { ...chartConfig.dataMapping, aggregation: val } })}
                  options={[
                    { value: 'sum', label: '求和' },
                    { value: 'count', label: '计数' },
                    { value: 'avg', label: '平均值' },
                    { value: 'max', label: '最大值' },
                    { value: 'min', label: '最小值' },
                  ]}
                />
              </div>

              <Divider />

              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>排序</label>
                <Select
                  style={{ width: '100%' }}
                  value={chartConfig.sortBy}
                  onChange={(val) => onUpdate({ sortBy: val })}
                  options={[
                    { value: 'value_desc', label: '按数值降序' },
                    { value: 'value_asc', label: '按数值升序' },
                    { value: 'name_asc', label: '按名称升序' },
                    { value: 'name_desc', label: '按名称降序' },
                  ]}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>显示前 N 项</label>
                <Input
                  type="number"
                  min={1}
                  value={chartConfig.limit}
                  onChange={(e) => onUpdate({ limit: parseInt(e.target.value) || 10 })}
                />
              </div>
            </div>
          ),
        },
        {
          key: 'style',
          label: '样式',
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13 }}>显示图例</span>
                <input
                  type="checkbox"
                  checked={chartConfig.style.showLegend}
                  onChange={(e) => onUpdate({ style: { ...chartConfig.style, showLegend: e.target.checked } })}
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}
