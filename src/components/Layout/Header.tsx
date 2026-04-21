import { Button, Space, Avatar, Input } from 'antd'
import { ReloadOutlined, ExportOutlined, UserOutlined } from '@ant-design/icons'
import { useDashboardStore } from '../../store/useDashboardStore'

export default function Header() {
  const { dashboard, setDashboardTitle, setLastUpdate } = useDashboardStore()

  const handleRefresh = () => {
    setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
  }

  return (
    <header className="app-header">
      <span className="app-header__logo">📊</span>
      <Input
        className="app-header__title"
        value={dashboard.title}
        onChange={(e) => setDashboardTitle(e.target.value)}
        variant="borderless"
        style={{ maxWidth: 300 }}
      />
      <div className="app-header__actions">
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            全局刷新
          </Button>
          <Button icon={<ExportOutlined />}>
            导出报表
          </Button>
          <Avatar size="small" icon={<UserOutlined />} />
        </Space>
      </div>
    </header>
  )
}
