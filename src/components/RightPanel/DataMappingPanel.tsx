import { Select, Input, Button, Divider } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useCallback } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'
import { useDataSource, useChartData } from '../../hooks/useDataSource'
import type { Card} from '../../types'

interface Props {
  card: Card
  onUpdate: (updates: Partial<Card['chartConfig']>) => void
}

export default function DataMappingPanel({ card, onUpdate }: Props) {
  const { dataSources } = useDashboardStore()
  const { chartConfig } = card
  const { dataMapping } = chartConfig

  // 获取选中的数据源
  const selectedDs = dataSources.find((ds) => ds.id === (dataMapping as any).sourceId)
  const { data: dataset } = useDataSource(
    (dataMapping as any).sourceId,
    selectedDs?.config as any
  )

  // 字段列表（用于下拉选择）
  const fields = dataset?.dimensions || []

  // 图表数据（用于显示预览）
  const chartData = useChartData(
    dataset,
    dataMapping.dimensionField,
    dataMapping.measureField,
    dataMapping.aggregation,
    chartConfig.sortBy,
    chartConfig.limit
  )

  const handleFieldChange = useCallback((field: string, value: string) => {
    onUpdate({ dataMapping: { ...dataMapping, [field]: value } })
  }, [dataMapping, onUpdate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 图表标题 */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>图表标题</label>
        <Input
          value={chartConfig.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>

      {/* 数据源选择 */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>数据源</label>
        <Select
          style={{ width: '100%' }}
          placeholder="选择数据源"
          allowClear
          value={(dataMapping as any).sourceId}
          onChange={(val) => onUpdate({ dataMapping: { ...dataMapping, sourceId: val } } as any)}
          options={dataSources.map((ds) => ({ value: ds.id, label: ds.name }))}
        />
      </div>

      {/* 字段映射 */}
      {fields.length > 0 ? (
        <>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>维度字段（分类）</label>
            <Select
              style={{ width: '100%' }}
              placeholder="选择维度字段"
              allowClear
              value={dataMapping.dimensionField || undefined}
              onChange={(val) => handleFieldChange('dimensionField', val || '')}
              options={fields.map((f: any) => ({ value: (f as any).name, label: `${f.name}（${f.type}）` }))}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>度量字段（数值）</label>
            <Select
              style={{ width: '100%' }}
              placeholder="选择度量字段"
              allowClear
              value={dataMapping.measureField || undefined}
              onChange={(val) => handleFieldChange('measureField', val || '')}
              options={fields.filter((f: any) => (f as any).type === 'number').map((f) => ({ value: f.name, label: f.name }))}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>聚合方式</label>
            <Select
              style={{ width: '100%' }}
              value={dataMapping.aggregation}
              onChange={(val) => handleFieldChange('aggregation', val)}
              options={[
                { value: 'sum', label: '求和' },
                { value: 'count', label: '计数' },
                { value: 'avg', label: '平均值' },
                { value: 'max', label: '最大值' },
                { value: 'min', label: '最小值' },
              ]}
            />
          </div>
        </>
      ) : (
        <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
          {selectedDs ? '选择数据源后即可配置字段映射' : '请先在左侧添加数据源'}
        </div>
      )}

      <Divider style={{ margin: '8px 0' }} />

      {/* 排序 */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>排序方式</label>
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

      {/* 限制条数 */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 4, display: 'block' }}>显示条数（前 N 项）</label>
        <Input
          type="number"
          min={1}
          max={100}
          value={chartConfig.limit}
          onChange={(e) => onUpdate({ limit: parseInt(e.target.value) || 10 })}
        />
      </div>

      {/* 筛选条件 */}
      <div>
        <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8, display: 'block' }}>筛选条件</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chartConfig.filters.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Input style={{ flex: 1 }} size="small" value={f.field} placeholder="字段" readOnly />
              <Input style={{ flex: 1 }} size="small" value={f.operator} placeholder="运算符" readOnly />
              <Input style={{ flex: 1 }} size="small" value={f.value} placeholder="值" readOnly />
              <Button size="small" type="text" icon={<DeleteOutlined />} danger onClick={() => {
                const newFilters = chartConfig.filters.filter((_f: any, idx: any) => idx !== i)
                onUpdate({ filters: newFilters })
              }} />
            </div>
          ))}
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onUpdate({ filters: [...chartConfig.filters, { field: '', operator: 'eq', value: '' }] })}
          >
            添加条件
          </Button>
        </div>
      </div>

      {/* 数据预览 */}
      {chartData.length > 0 && (
        <>
          <Divider style={{ margin: '8px 0' }} />
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8, display: 'block' }}>
              数据预览（共 {chartData.length} 条）
            </label>
            <div style={{ background: '#FAFAFA', borderRadius: 4, padding: 8, fontSize: 11, fontFamily: 'monospace' }}>
              {chartData.slice(0, 5).map((d: any) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ color: '#595959' }}>{d.name}</span>
                  <span style={{ color: '#262626', fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
              {chartData.length > 5 && <div style={{ color: '#8C8C8C', marginTop: 4 }}>...还有 {chartData.length - 5} 条</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
