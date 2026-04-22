import { Button, Avatar, Input, Popover, message } from 'antd'
import { ReloadOutlined, ExportOutlined, UserOutlined, BgColorsOutlined, MenuOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'
import { useThemeStore, type ThemeName } from '../../store/useThemeStore'
import { useIsMobile } from '../../hooks/useBreakpoint'

const THEMES = [
  { key: 'light-business', label: '🟦 浅色商务（默认）' },
  { key: 'dark-tech', label: '🌑 深色科技' },
  { key: 'light-fresh', label: '🟩 浅色清新' },
]

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { dashboard, setDashboardTitle, setLastUpdate } = useDashboardStore()
  const { theme, setTheme } = useThemeStore() as { theme: ThemeName; setTheme: (t: ThemeName) => void }
  const isMobile = useIsMobile()
  const [themeOpen, setThemeOpen] = useState(false)

  const handleRefresh = () => {
    setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
    message.success('已刷新')
  }

  const handleThemeSelect = (key: ThemeName) => {
    setTheme(key)
    setThemeOpen(false)
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
        <Popover
          open={themeOpen}
          onOpenChange={setThemeOpen}
          trigger="click"
          placement="bottomRight"
          content={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
              {THEMES.map((t) => (
                <Button
                  key={t.key}
                  type={theme === t.key ? 'primary' : 'text'}
                  size="small"
                  block
                  onClick={() => handleThemeSelect(t.key as ThemeName)}
                  style={{ textAlign: 'left' }}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          }
        >
          <Button icon={<BgColorsOutlined />} title="切换主题" />
        </Popover>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>全局刷新</Button>
        <Button icon={<ExportOutlined />}>导出报表</Button>
        <Avatar size="small" icon={<UserOutlined />} />
      </div>
    </header>
  )
}
