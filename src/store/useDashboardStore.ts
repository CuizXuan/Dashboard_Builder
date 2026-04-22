import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card, DataSource, ChartConfig, ChartType } from '../types'

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

function createDashboard(title = '新画布'): Omit<Dashboard, 'id'> & { id: string } {
  return {
    id: nanoid(),
    title,
    cards: [],
    globalFilters: [],
  }
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

interface Dashboard {
  id: string
  title: string
  cards: Card[]
  globalFilters: never[]
}

interface DashboardStore {
  // 多画布
  dashboards: Dashboard[]
  activeDashboardId: string

  // 数据源（全局共享）
  dataSources: DataSource[]

  ui: {
    selectedCardId: string | null
    rightPanelTab: 'data' | 'style' | 'interaction'
    isLeftPanelCollapsed: boolean
    isLoading: boolean
  }
  lastUpdate: string | null

  // 撤销/重做（基于当前画布）
  _history: { cards: Card[]; dataSources: DataSource[] }[]
  _historyIndex: number
  _maxHistory: number

  // ========== 画布操作 ==========
  createDashboard: (title?: string) => string
  removeDashboard: (id: string) => void
  renameDashboard: (id: string, title: string) => void
  setActiveDashboard: (id: string) => void

  // ========== 当前画布操作 ==========
  addCard: (type: ChartType, x: number, y: number) => string
  updateCard: (id: string, updates: Partial<Card>) => void
  removeCard: (id: string) => void
  updateCardLayout: (id: string, layout: { x: number; y: number; w: number; h: number }) => void

  // ========== 数据源操作 ==========
  addDataSource: (ds: Omit<DataSource, 'id'>) => string
  updateDataSource: (id: string, updates: Partial<DataSource>) => void
  removeDataSource: (id: string) => void

  // ========== UI 操作 ==========
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
    (set, get) => {
      const DEFAULT_DASHBOARD_ID = nanoid()

      return {
        dashboards: [{ id: DEFAULT_DASHBOARD_ID, title: '我的看板', cards: [], globalFilters: [] }],
        activeDashboardId: DEFAULT_DASHBOARD_ID,
        dataSources: [],
        ui: { selectedCardId: null, rightPanelTab: 'data', isLeftPanelCollapsed: false, isLoading: false },
        lastUpdate: null,
        _history: [],
        _historyIndex: -1,
        _maxHistory: 50,

        // ── 工具方法 ──────────────────────────────────────
        _saveHistory: () => {
          const state = get()
          const dash = state.dashboards.find((d) => d.id === state.activeDashboardId)
          if (!dash) return
          const snapshot = { cards: dash.cards, dataSources: state.dataSources }
          const newHistory = state._history.slice(0, state._historyIndex + 1)
          newHistory.push(snapshot)
          if (newHistory.length > state._maxHistory) newHistory.shift()
          set({ _history: newHistory, _historyIndex: newHistory.length - 1 })
        },

        undo: () => {
          const { _historyIndex, _history } = get()
          if (_historyIndex <= 0) return
          const prev = _history[_historyIndex - 1]
          set((s) => ({
            dashboards: s.dashboards.map((d) =>
              d.id === s.activeDashboardId ? { ...d, cards: prev.cards } : d
            ),
            dataSources: prev.dataSources,
            _historyIndex: _historyIndex - 1,
          }))
        },

        redo: () => {
          const { _historyIndex, _history } = get()
          if (_historyIndex >= _history.length - 1) return
          const next = _history[_historyIndex + 1]
          set((s) => ({
            dashboards: s.dashboards.map((d) =>
              d.id === s.activeDashboardId ? { ...d, cards: next.cards } : d
            ),
            dataSources: next.dataSources,
            _historyIndex: _historyIndex + 1,
          }))
        },

        // ── 画布 CRUD ──────────────────────────────────────
        createDashboard: (title) => {
          const id = nanoid()
          const dashboards = [...get().dashboards, createDashboard(title || `画布 ${get().dashboards.length + 1}`)]
          set({ dashboards, activeDashboardId: id, ui: { ...get().ui, selectedCardId: null } })
          return id
        },

        removeDashboard: (id) => {
          const { dashboards, activeDashboardId } = get()
          if (dashboards.length <= 1) { alert('至少保留一个画布'); return }
          const idx = dashboards.findIndex((d) => d.id === id)
          const next = dashboards.filter((d) => d.id !== id)
          const newActive = activeDashboardId === id
            ? next[Math.min(idx, next.length - 1)].id
            : activeDashboardId
          set({ dashboards: next, activeDashboardId: newActive, ui: { ...get().ui, selectedCardId: null } })
        },

        renameDashboard: (id, title) => {
          set((s) => ({
            dashboards: s.dashboards.map((d) => d.id === id ? { ...d, title } : d),
          }))
        },

        setActiveDashboard: (id) => {
          set({ activeDashboardId: id, ui: { ...get().ui, selectedCardId: null } })
        },

        // ── 当前画布卡片操作 ────────────────────────────────
        addCard: (type, x, y) => {
          get()._saveHistory()
          const id = nanoid()
          const card: Card = { id, chartConfig: createDefaultChartConfig(type), x, y, w: 4, h: 3 }
          set((s) => ({
            dashboards: s.dashboards.map((d) =>
              d.id === s.activeDashboardId ? { ...d, cards: [...d.cards, card] } : d
            ),
            ui: { ...s.ui, selectedCardId: id },
          }))
          return id
        },

        updateCard: (id, updates) => {
          get()._saveHistory()
          set((s) => ({
            dashboards: s.dashboards.map((d) =>
              d.id === s.activeDashboardId
                ? { ...d, cards: d.cards.map((c) => c.id === id ? { ...c, ...updates } : c) }
                : d
            ),
          }))
        },

        removeCard: (id) => {
          get()._saveHistory()
          set((s) => ({
            dashboards: s.dashboards.map((d) =>
              d.id === s.activeDashboardId
                ? { ...d, cards: d.cards.filter((c) => c.id !== id) }
                : d
            ),
            ui: { ...s.ui, selectedCardId: s.ui.selectedCardId === id ? null : s.ui.selectedCardId },
          }))
        },

        updateCardLayout: (id, layout) =>
          set((s) => ({
            dashboards: s.dashboards.map((d) =>
              d.id === s.activeDashboardId
                ? { ...d, cards: d.cards.map((c) => c.id === id ? { ...c, x: layout.x, y: layout.y, w: layout.w, h: layout.h } : c) }
                : d
            ),
          })),

        // ── 数据源操作 ─────────────────────────────────────
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

        // ── UI ────────────────────────────────────────────
        selectCard: (id) => set((s) => ({ ui: { ...s.ui, selectedCardId: id, rightPanelTab: 'data' } })),
        setRightPanelTab: (tab) => set((s) => ({ ui: { ...s.ui, rightPanelTab: tab } })),
        toggleLeftPanel: () => set((s) => ({ ui: { ...s.ui, isLeftPanelCollapsed: !s.ui.isLeftPanelCollapsed } })),
        setLoading: (loading) => set((s) => ({ ui: { ...s.ui, isLoading: loading } })),
        setLastUpdate: (time) => set({ lastUpdate: time }),
      }
    },
    {
      name: 'dashboard-builder-storage',
      partialize: (s) => ({
        dashboards: s.dashboards,
        activeDashboardId: s.activeDashboardId,
        dataSources: s.dataSources,
        lastUpdate: s.lastUpdate,
      }),
    }
  )
)
