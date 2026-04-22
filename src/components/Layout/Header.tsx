import { Button, Avatar, Input, Popover, message, Tooltip } from 'antd'
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
  const { dashboard, setDashboardTitle } = useDashboardStore()
  const isMobile = useIsMobile()

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
    </header>
  )
}

/** 右上角悬浮工具栏 */
export function TopRightToolbar() {
  const { theme, setTheme } = useThemeStore() as { theme: ThemeName; setTheme: (t: ThemeName) => void }
  const { setLastUpdate } = useDashboardStore()
  const [themeOpen, setThemeOpen] = useState(false)

  const handleRefresh = () => {
    setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
    message.success('已刷新')
  }

  return (
    <div className="top-right-toolbar">
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
                onClick={() => { setTheme(t.key as ThemeName); setThemeOpen(false) }}
                style={{ textAlign: 'left' }}
              >
                {t.label}
              </Button>
            ))}
          </div>
        }
      >
        <Tooltip title="切换主题" placement="left">
          <Button icon={<BgColorsOutlined />} />
        </Tooltip>
      </Popover>

      <Tooltip title="全局刷新" placement="left">
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
      </Tooltip>

      <Tooltip title="导出报表" placement="left">
        <Button icon={<ExportOutlined />} />
      </Tooltip>

      <Tooltip title="个人信息" placement="left">
        <Avatar size="small" icon={<UserOutlined />} />
      </Tooltip>
    </div>
  )
}
