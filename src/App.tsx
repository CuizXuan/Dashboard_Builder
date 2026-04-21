import { useDashboardStore } from './store/useDashboardStore'
import Header from './components/Layout/Header'
import LeftPanel from './components/Layout/LeftPanel'
import Canvas from './components/Layout/Canvas'
import RightPanel from './components/Layout/RightPanel'
import StatusBar from './components/Layout/StatusBar'

export default function App() {
  const { ui } = useDashboardStore()

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <LeftPanel collapsed={ui.isLeftPanelCollapsed} />
        <main className="app-main">
          <Canvas />
        </main>
        <RightPanel />
      </div>
      <StatusBar />
    </div>
  )
}
