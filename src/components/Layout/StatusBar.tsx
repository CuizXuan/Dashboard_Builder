import { useDashboardStore } from '../../store/useDashboardStore'

export default function StatusBar() {
  const { dashboard, lastUpdate } = useDashboardStore()
  const cardCount = dashboard.cards.length

  return (
    <footer className="app-status-bar">
      <div className="app-status-bar__item">
        <span className="app-status-bar__dot" />
        <span>数据正常</span>
      </div>
      <div className="app-status-bar__item">
        图表数量：<strong>{cardCount}</strong>
      </div>
      <div className="app-status-bar__item">
        最后更新：<strong>{lastUpdate || '—'}</strong>
      </div>
    </footer>
  )
}
