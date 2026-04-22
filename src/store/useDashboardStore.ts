import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card, DataSource, ChartConfig, ChartType } from '../types'

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

function createDefaultChartConfig(type: ChartType): ChartConfig {
  return {
    type,
    title: '新图表',
    dataMapping: { dimensionField: '', measureField: '', aggregation: 'sum' },
    filters: [],
    sortBy: 'value_desc',
    limit: 10,
    style: { showLegend: true, legendPosition: 'right', showChart: true, showTable: false },
  }
}

interface DashboardStore {
  dashboard: {
    id: string; title: string; cards: Card[]; globalFilters: never[]
  }
  dataSources: DataSource[]
  ui: {
    selectedCardId: string | null
    rightPanelTab: 'data' | 'style' | 'interaction'
    isLeftPanelCollapsed: boolean
    isLoading: boolean
  }
  lastUpdate: string | null

  // 撤销/重做
  _history: { cards: Card[]; dataSources: DataSource[] }[]
  _historyIndex: number
  _maxHistory: number

  // 操作
  setDashboardTitle: (title: string) => void
  addCard: (type: ChartType, x: number, y: number) => string
  updateCard: (id: string, updates: Partial<Card>) => void
  removeCard: (id: string) => void
  updateCardLayout: (id: string, layout: { x: number; y: number; w: number; h: number }) => void

  addDataSource: (ds: Omit<DataSource, 'id'>) => string
  updateDataSource: (id: string, updates: Partial<DataSource>) => void
  removeDataSource: (id: string) => void

  selectCard: (id: string | null) => void
  setRightPanelTab: (tab: 'data' | 'style' | 'interaction') => void
  toggleLeftPanel: () => void
  setLoading: (loading: boolean) => void
  setLastUpdate: (time: string) => void

  // 撤销重做
  undo: () => void
  redo: () => void
  _saveHistory: () => void
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      dashboard: { id: nanoid(), title: '我的看板', cards: [], globalFilters: [] },
      dataSources: [],
      ui: { selectedCardId: null, rightPanelTab: 'data', isLeftPanelCollapsed: false, isLoading: false },
      lastUpdate: null,
      _history: [],
      _historyIndex: -1,
      _maxHistory: 50,

      _saveHistory: () => {
        const { dashboard, dataSources, _historyIndex, _history } = get()
        const snapshot = { cards: dashboard.cards, dataSources }
        // 截断当前位置之后的历史
        const newHistory = _history.slice(0, _historyIndex + 1)
        newHistory.push(snapshot)
        if (newHistory.length > get()._maxHistory) newHistory.shift()
        set({ _history: newHistory, _historyIndex: newHistory.length - 1 })
      },

      undo: () => {
        const { _historyIndex, _history } = get()
        if (_historyIndex <= 0) return
        const prev = _history[_historyIndex - 1]
        set({
          dashboard: { ...get().dashboard, cards: prev.cards },
          dataSources: prev.dataSources,
          _historyIndex: _historyIndex - 1,
        })
      },

      redo: () => {
        const { _historyIndex, _history } = get()
        if (_historyIndex >= _history.length - 1) return
        const next = _history[_historyIndex + 1]
        set({
          dashboard: { ...get().dashboard, cards: next.cards },
          dataSources: next.dataSources,
          _historyIndex: _historyIndex + 1,
        })
      },

      setDashboardTitle: (title) => set((s) => ({ dashboard: { ...s.dashboard, title } })),

      addCard: (type, x, y) => {
        get()._saveHistory()
        const id = nanoid()
        const card: Card = { id, chartConfig: createDefaultChartConfig(type), x, y, w: 4, h: 3 }
        set((s) => ({ dashboard: { ...s.dashboard, cards: [...s.dashboard.cards, card] }, ui: { ...s.ui, selectedCardId: id } }))
        return id
      },

      updateCard: (id, updates) => {
        get()._saveHistory()
        set((s) => ({
          dashboard: {
            ...s.dashboard,
            cards: s.dashboard.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
          },
        }))
      },

      removeCard: (id) => {
        get()._saveHistory()
        set((s) => ({
          dashboard: { ...s.dashboard, cards: s.dashboard.cards.filter((c) => c.id !== id) },
          ui: { ...s.ui, selectedCardId: s.ui.selectedCardId === id ? null : s.ui.selectedCardId },
        }))
      },

      updateCardLayout: (id, layout) =>
        set((s) => ({
          dashboard: {
            ...s.dashboard,
            cards: s.dashboard.cards.map((c) => c.id === id ? { ...c, x: layout.x, y: layout.y, w: layout.w, h: layout.h } : c),
          },
        })),

      addDataSource: (ds) => {
        get()._saveHistory()
        const id = nanoid()
        set((s) => ({ dataSources: [...s.dataSources, { ...ds, id }] }))
        return id
      },

      updateDataSource: (id, updates) => {
        get()._saveHistory()
        set((s) => ({ dataSources: s.dataSources.map((ds) => ds.id === id ? { ...ds, ...updates } : ds) }))
      },

      removeDataSource: (id) => {
        get()._saveHistory()
        set((s) => ({ dataSources: s.dataSources.filter((ds) => ds.id !== id) }))
      },

      selectCard: (id) => set((s) => ({ ui: { ...s.ui, selectedCardId: id, rightPanelTab: 'data' } })),
      setRightPanelTab: (tab) => set((s) => ({ ui: { ...s.ui, rightPanelTab: tab } })),
      toggleLeftPanel: () => set((s) => ({ ui: { ...s.ui, isLeftPanelCollapsed: !s.ui.isLeftPanelCollapsed } })),
      setLoading: (loading) => set((s) => ({ ui: { ...s.ui, isLoading: loading } })),
      setLastUpdate: (time) => set({ lastUpdate: time }),
    }),
    {
      name: 'dashboard-builder-storage',
      partialize: (s) => ({ dashboard: s.dashboard, dataSources: s.dataSources, lastUpdate: s.lastUpdate }),
    }
  )
)
