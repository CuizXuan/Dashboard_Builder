import { Drawer } from 'antd'
import { useState } from 'react'
import { useDashboardStore } from './store/useDashboardStore'
import Header, { TopRightToolbar } from './components/Layout/Header'
import DashboardTabs from './components/Layout/DashboardTabs'
import LeftPanel from './components/Layout/LeftPanel'
import Canvas from './components/Layout/Canvas'
import RightPanel from './components/RightPanel/RightPanel'
import StatusBar from './components/Layout/StatusBar'
import { useIsMobile } from './hooks/useBreakpoint'

export default function App() {
  const { ui } = useDashboardStore()
  const isMobile = useIsMobile()
  const [leftOpen, setLeftOpen] = useState(false)

  return (
    <div className="app">
      <Header onMenuClick={() => setLeftOpen(true)} />
      <div className="app-body">
        {!isMobile && <LeftPanel collapsed={ui.isLeftPanelCollapsed} />}

        <Drawer
          placement="left"
          open={leftOpen}
          onClose={() => setLeftOpen(false)}
          width={240}
          title="数据源管理"
          styles={{ body: { padding: 0 } }}
          className="mobile-drawer"
        >
          <LeftPanel collapsed={false} onClose={() => setLeftOpen(false)} />
        </Drawer>

        <main className="app-main">
          <DashboardTabs />
          <Canvas />
          <TopRightToolbar />
        </main>

        {!isMobile && <RightPanel />}
      </div>

      <StatusBar />
    </div>
  )
}
