import { Button, Space, Avatar, Input, Dropdown, message } from 'antd'
import type { MenuProps } from 'antd'
import { ReloadOutlined, ExportOutlined, UserOutlined, BgColorsOutlined, MenuOutlined } from '@ant-design/icons'
import { useDashboardStore } from '../../store/useDashboardStore'
import { useThemeStore, type ThemeName } from '../../store/useThemeStore'
import { useIsMobile } from '../../hooks/useBreakpoint'

const THEME_ITEMS: MenuProps['items'] = [
  { key: 'light-business', label: '🟦 浅色商务（默认）' },
  { key: 'dark-tech', label: '🌑 深色科技' },
  { key: 'light-fresh', label: '🟩 浅色清新' },
]

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { dashboard, setDashboardTitle, setLastUpdate } = useDashboardStore()
  const { setTheme } = useThemeStore()
  const isMobile = useIsMobile()

  const handleRefresh = () => {
    setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
    message.success('已刷新')
  }

  const handleThemeChange: MenuProps['onClick'] = ({ key }) => {
    setTheme(key as ThemeName)
    message.success('主题已切换')
  }

  return (
    <header className="app-header">
      {isMobile && (
        <Button type="text" icon={<MenuOutlined />} onClick={onMenuClick} />
      )}
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
          <Dropdown menu={{ items: THEME_ITEMS, onClick: handleThemeChange }} trigger={['click']}>
            <Button icon={<BgColorsOutlined />} title="切换主题" />
          </Dropdown>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>全局刷新</Button>
          <Button icon={<ExportOutlined />}>导出报表</Button>
          <Avatar size="small" icon={<UserOutlined />} />
        </Space>
      </div>
    </header>
  )
}
