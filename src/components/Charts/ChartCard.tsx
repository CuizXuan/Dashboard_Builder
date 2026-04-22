import { Dropdown, Modal, Button, message } from 'antd'
import { ReloadOutlined, FullscreenOutlined, MoreOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { Card } from '../../types'
import PieChart from './charts/PieChart'
import LineChart from './charts/LineChart'
import BarChart from './charts/BarChart'
import TableChart from './charts/TableChart'
import ScatterChart from './charts/ScatterChart'
import RadarChart from './charts/RadarChart'
import GaugeChart from './charts/GaugeChart'
import HeatmapChart from './charts/HeatmapChart'

const CHART_MAP = {
  pie: PieChart,
  line: LineChart,
  bar: BarChart,
  table: TableChart,
  scatter: ScatterChart,
  radar: RadarChart,
  gauge: GaugeChart,
  heatmap: HeatmapChart,
}

interface ChartCardProps {
  card: Card
  isSelected: boolean
  onClick: () => void
}

export default function ChartCard({ card, isSelected, onClick }: ChartCardProps) {
  const { chartConfig } = card
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const { removeCard } = useDashboardStore()

  const ChartComponent = CHART_MAP[chartConfig.type]

  const handleDelete = () => {
    removeCard(card.id)
    message.success('图表已删除')
  }

  // 下拉菜单 — 全部放在 footer，完全不受 GridLayout dragHandle 影响
  const menuItems = [
    { key: 'fullscreen', icon: <FullscreenOutlined />, label: '全屏查看', onClick: () => setFullscreenOpen(true) },
    { key: 'refresh', icon: <ReloadOutlined />, label: '刷新数据' },
    { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: handleDelete },
  ]

  return (
    <>
      {/* 最外层不加 onClick，避免和内部冲突 */}
      <div className={`chart-card ${isSelected ? 'chart-card--selected' : ''}`}>

        {/* 头部 — 仅标题，GridLayout dragHandle */}
        <div className="chart-card__header">
          <span className="chart-card__title">{chartConfig.title}</span>
        </div>

        {/* 主体 — 点击选中卡片 */}
        <div
          className="chart-card__body"
          onClick={(e) => { e.stopPropagation(); onClick() }}
        >
          <div className="chart-card__chart">
            <ChartComponent config={chartConfig} />
          </div>
        </div>

        {/* 底部 — 操作按钮 + 更多菜单 */}
        <div className="chart-card__footer">
          <span className="chart-card__update-time">
            更新时间：{new Date().toLocaleTimeString('zh-CN')}
          </span>
          <div className="chart-card__footer-actions">
            <Button type="text" size="small" icon={<SettingOutlined />} title="图表配置" onClick={(e) => { e.stopPropagation(); onClick() }} />
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="topRight"
            >
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        </div>

      </div>

      {/* 全屏弹窗 */}
      <Modal
        open={fullscreenOpen}
        onCancel={() => setFullscreenOpen(false)}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        title={chartConfig.title}
      >
        <div style={{ height: '70vh' }}>
          <ChartComponent config={chartConfig} fullscreen />
        </div>
      </Modal>
    </>
  )
}
