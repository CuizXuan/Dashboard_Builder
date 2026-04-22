import { Button, Avatar, Input, Popover, message, Tooltip, Dropdown } from 'antd'
import { ReloadOutlined, ExportOutlined, UserOutlined, BgColorsOutlined, MenuOutlined, FolderOpenOutlined, DownloadOutlined, CameraOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'
import { useThemeStore, type ThemeName } from '../../store/useThemeStore'
import { useIsMobile } from '../../hooks/useBreakpoint'
import { exportElementToPng, exportDashboardJson, importDashboardJson } from '../../utils/export'

const THEMES = [
  { key: 'light-business', label: '🟦 浅色商务（默认）' },
  { key: 'dark-tech', label: '🌑 深色科技' },
  { key: 'light-fresh', label: '🟩 浅色清新' },
]

const EXPORT_ITEMS = [
  { key: 'png', icon: <CameraOutlined />, label: '导出为 PNG 图片' },
  { key: 'json', icon: <DownloadOutlined />, label: '导出为 JSON（配置备份）' },
  { key: 'import', icon: <FolderOpenOutlined />, label: '导入 JSON' },
]

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { dashboards, activeDashboardId, renameDashboard } = useDashboardStore()
  const dashboard = dashboards.find((d) => d.id === activeDashboardId)
  const isMobile = useIsMobile()

  return (
    <header className="app-header">
      {isMobile && (
        <Button type="text" icon={<MenuOutlined />} onClick={onMenuClick} />
      )}
      <span className="app-header__logo">📊</span>
      <Input
        className="app-header__title"
        value={dashboard?.title || ''}
        onChange={(e) => {
          if (dashboard) renameDashboard(dashboard.id, e.target.value)
        }}
        variant="borderless"
        style={{ maxWidth: 300 }}
      />
    </header>
  )
}

/** 右上角悬浮工具栏 */
export function TopRightToolbar() {
  const { theme, setTheme } = useThemeStore() as { theme: ThemeName; setTheme: (t: ThemeName) => void }
  const { dashboards, activeDashboardId, dataSources, setLastUpdate } = useDashboardStore()
  const dashboard = dashboards.find((d) => d.id === activeDashboardId)
  const [themeOpen, setThemeOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const handleRefresh = () => {
    setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
    message.success('已刷新')
  }

  const handleExport = async (key: string) => {
    if (key === 'png') {
      setExportLoading(true)
      try {
        const el = document.querySelector('.canvas') as HTMLElement
        if (!el) { message.error('未找到画布'); return }
        await exportElementToPng(el, `${dashboard?.title || 'dashboard'}.png`)
        message.success('PNG 导出成功')
      } catch (e: unknown) {
        message.error('导出失败：' + (e as Error).message)
      } finally {
        setExportLoading(false)
      }
    } else if (key === 'json') {
      if (dashboard) exportDashboardJson(dashboard, dataSources)
      message.success('JSON 导出成功')
    } else if (key === 'import') {
      const data = await importDashboardJson()
      if (!data) { message.error('导入失败，请检查文件格式'); return }
      message.success('导入成功')
    }
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

      <Dropdown
        menu={{ items: EXPORT_ITEMS.map((i) => ({ ...i, onClick: () => handleExport(i.key) })) }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Tooltip title="导出报表" placement="left">
          <Button icon={<ExportOutlined />} loading={exportLoading} />
        </Tooltip>
      </Dropdown>

      <Tooltip title="个人信息" placement="left">
        <Avatar size="small" icon={<UserOutlined />} />
      </Tooltip>
    </div>
  )
}
