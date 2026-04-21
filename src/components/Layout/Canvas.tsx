import { Button, Modal } from 'antd'
import { BarChartOutlined, LineChartOutlined, PieChartOutlined, TableOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useDashboardStore } from '../../store/useDashboardStore'
import ChartCard from '../Charts/ChartCard'
import type { ChartType } from '../../types'

const CHART_TYPE_OPTIONS: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: 'pie', label: '饼图', icon: <PieChartOutlined /> },
  { type: 'line', label: '折线图', icon: <LineChartOutlined /> },
  { type: 'bar', label: '柱状图', icon: <BarChartOutlined /> },
  { type: 'table', label: '表格', icon: <TableOutlined /> },
]

export default function Canvas() {
  const { dashboard, addCard, updateCardLayout, selectCard, ui } = useDashboardStore()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [pendingPosition, setPendingPosition] = useState({ x: 0, y: 0 })

  const handleAddChart = (type: ChartType) => {
    addCard(type, pendingPosition.x, pendingPosition.y)
    setAddModalOpen(false)
  }

  const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
    for (const item of newLayout) {
      updateCardLayout(item.i, { x: item.x, y: item.y, w: item.w, h: item.h })
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('canvas') ||
        (e.target as HTMLElement).closest('.canvas')) {
      selectCard(null)
    }
  }

  return (
    <div className="canvas" onClick={handleCanvasClick}>
      {dashboard.cards.length === 0 ? (
        <div className="canvas-empty">
          <div className="canvas-empty__icon">📊</div>
          <div className="canvas-empty__text">点击下方按钮添加第一个图表</div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              // 自动定位到第一个可用位置
              setPendingPosition({ x: 0, y: 0 })
              setAddModalOpen(true)
            }}
          >
            添加图表
          </Button>
        </div>
      ) : (
        <>
          <GridLayout
            className="react-grid-layout"
            layout={dashboard.cards.map((c) => ({ i: c.id, x: c.x, y: c.y, w: c.w, h: c.h }))}
            cols={12}
            rowHeight={80}
            width={1200}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".chart-card__header"
            isResizable
            isDraggable
          >
            {dashboard.cards.map((card) => (
              <div key={card.id}>
                <ChartCard
                  card={card}
                  isSelected={ui.selectedCardId === card.id}
                  onClick={() => selectCard(card.id)}
                />
              </div>
            ))}
          </GridLayout>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                // 计算最大 y 值
                const maxY = Math.max(...dashboard.cards.map((c) => c.y + c.h), 0)
                setPendingPosition({ x: 0, y: maxY })
                setAddModalOpen(true)
              }}
            >
              添加图表
            </Button>
          </div>
        </>
      )}

      <Modal
        title="选择图表类型"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {CHART_TYPE_OPTIONS.map(({ type, label, icon }) => (
            <Button
              key={type}
              style={{ height: 64, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center' }}
              onClick={() => handleAddChart(type)}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
