import { Button, Input, Modal, message, Dropdown } from 'antd'
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

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (dashboards.length <= 1) {
      message.warning('至少保留一个画布')
      return
    }
    removeDashboard(id)
  }

  const handleAdd = () => {
    createDashboard()
  }

  return (
    <>
      <div className="dashboard-tabs">
        <div className="dashboard-tabs__list">
          {dashboards.map((d) => {
            const isActive = d.id === activeDashboardId
            return (
              <div
                key={d.id}
                className={`dashboard-tab ${isActive ? 'dashboard-tab--active' : ''}`}
                onClick={() => setActiveDashboard(d.id)}
              >
                <Dropdown
                  menu={{
                    items: [
                      { key: 'rename', icon: <EditOutlined />, label: '重命名', onClick: () => openRename(d.id, d.title) },
                      { key: 'delete', icon: <CloseOutlined />, label: '删除', danger: true, onClick: () => { if (dashboards.length > 1) removeDashboard(d.id) } },
                    ],
                  }}
                  trigger={['click']}
                  placement="bottomLeft"
                >
                  <span
                    className="dashboard-tab__title"
                    onClick={(e) => { e.stopPropagation() }}
                  >
                    {d.title}
                    {dashboards.length > 1 && (
                      <CloseOutlined
                        className="dashboard-tab__close"
                        onClick={(e) => handleRemove(d.id, e)}
                      />
                    )}
                  </span>
                </Dropdown>
              </div>
            )
          })}

          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="dashboard-tabs__add"
            title="新建画布"
          />
        </div>
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
