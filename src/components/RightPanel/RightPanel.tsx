import { Tabs, Empty, message } from 'antd'
import { useEffect } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { Card } from '../../types'
import DataMappingPanel from './DataMappingPanel'
import StylePanel from './StylePanel'

export default function RightPanel() {
  const { dashboards, activeDashboardId, ui, updateCard, undo, redo } = useDashboardStore()

  const dashboard = dashboards.find((d) => d.id === activeDashboardId)
  const selectedCard = dashboard?.cards.find((c) => c.id === ui.selectedCardId) as Card | undefined

  // 键盘快捷键：Ctrl+Z 撤销，Ctrl+Shift+Z 重做
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          undo()
          message.success('已撤销')
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault()
          redo()
          message.success('已重做')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const handleUpdate = (updates: Partial<Card['chartConfig']>) => {
    if (selectedCard) updateCard(selectedCard.id, { chartConfig: { ...selectedCard.chartConfig, ...updates } })
  }

  return (
    <aside className="app-right-panel">
      <div className="app-right-panel__header">图表配置</div>
      <div className="app-right-panel__content">
        {selectedCard ? (
          <Tabs
            activeKey={ui.rightPanelTab}
            onChange={(key) => useDashboardStore.getState().setRightPanelTab(key as any)}
            items={[
              { key: 'data', label: '数据', children: <DataMappingPanel card={selectedCard} onUpdate={handleUpdate} /> },
              { key: 'style', label: '样式', children: <StylePanel card={selectedCard} onUpdate={handleUpdate} /> },
            ]}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="点击画布上的图表以编辑" style={{ marginTop: 64 }} />
        )}
      </div>
    </aside>
  )
}
