import { Dropdown, Modal, Button, message } from 'antd'
import { ReloadOutlined, FullscreenOutlined, MoreOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { Card } from '../../types'
import PieChart from './charts/PieChart'
import LineChart from './charts/LineChart'
import BarChart from './charts/BarChart'
import TableChart from './charts/TableChart'

const CHART_MAP = {
  pie: PieChart,
  line: LineChart,
  bar: BarChart,
  table: TableChart,
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

  const menuItems = [
    { key: 'config', icon: <SettingOutlined />, label: '图表配置', onClick: () => { onClick() } },
    { key: 'fullscreen', icon: <FullscreenOutlined />, label: '全屏查看', onClick: () => setFullscreenOpen(true) },
    { key: 'refresh', icon: <ReloadOutlined />, label: '刷新数据' },
    { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: handleDelete },
  ]

  return (
    <>
      <div
        className={`chart-card ${isSelected ? 'chart-card--selected' : ''}`}
        onClick={onClick}
      >
        {/* 卡片头部 */}
        <div className="chart-card__header">
          <span className="chart-card__title">{chartConfig.title}</span>
          <div className="chart-card__actions">
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        </div>

        {/* 卡片主体 — 渲染对应图表 */}
        <div className="chart-card__body">
          <div className="chart-card__chart">
            <ChartComponent config={chartConfig} />
          </div>
        </div>

        {/* 卡片底部 */}
        <div className="chart-card__footer">
          <span className="chart-card__update-time">
            更新时间：{new Date().toLocaleTimeString('zh-CN')}
          </span>
          <div className="chart-card__footer-actions">
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              title="图表配置"
              onClick={(e) => { e.stopPropagation(); onClick() }}
            />
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              type="text"
              size="small"
              icon={<FullscreenOutlined />}
              onClick={(e) => { e.stopPropagation(); setFullscreenOpen(true) }}
            />
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
