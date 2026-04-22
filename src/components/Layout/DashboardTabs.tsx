import { Tabs, Button, Input, Dropdown, Modal, message } from 'antd'
import { PlusOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'

export default function DashboardTabs() {
  const {
    dashboards,
    activeDashboardId,
    setActiveDashboard,
    createDashboard,
    removeDashboard,
    renameDashboard,
  } = useDashboardStore()

  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const handleAdd = () => {
    createDashboard()
  }

  const handleRemove = (id: string) => {
    if (dashboards.length <= 1) {
      message.warning('至少保留一个画布')
      return
    }
    removeDashboard(id)
    message.success('画布已删除')
  }

  const openRename = (id: string, title: string) => {
    setRenameTarget({ id, title })
    setNewTitle(title)
    setRenameModalOpen(true)
  }

  const handleRename = () => {
    if (!renameTarget || !newTitle.trim()) return
    renameDashboard(renameTarget.id, newTitle.trim())
    setRenameModalOpen(false)
    setRenameTarget(null)
  }

  const tabItems = dashboards.map((d) => ({
    key: d.id,
    label: (
      <Dropdown
        menu={{
          items: [
            { key: 'rename', icon: <EditOutlined />, label: '重命名', onClick: () => openRename(d.id, d.title) },
            { key: 'delete', icon: <CloseOutlined />, label: '删除', danger: true, onClick: () => handleRemove(d.id) },
          ],
        }}
        trigger={['contextMenu']}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {d.title}
          {dashboards.length > 1 && (
            <CloseOutlined
              style={{ fontSize: 10, opacity: 0.5 }}
              onClick={(e) => { e.stopPropagation(); handleRemove(d.id) }}
            />
          )}
        </span>
      </Dropdown>
    ),
  }))

  return (
    <>
      <div className="dashboard-tabs">
        <Tabs
          activeKey={activeDashboardId}
          onChange={setActiveDashboard}
          type="editable-card"
          hideAdd
          items={tabItems}
          tabBarExtraContent={
            <Button type="text" icon={<PlusOutlined />} onClick={handleAdd} title="新建画布" size="small" />
          }
          onEdit={(id) => {
            if (id === 'add') handleAdd()
            else if (typeof id === 'string' && id !== activeDashboardId) handleRemove(id)
          }}
        />
      </div>

      <Modal
        title="重命名画布"
        open={renameModalOpen}
        onOk={handleRename}
        onCancel={() => setRenameModalOpen(false)}
        okText="确定"
      >
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onPressEnter={handleRename}
          placeholder="输入画布名称"
          autoFocus
        />
      </Modal>
    </>
  )
}
