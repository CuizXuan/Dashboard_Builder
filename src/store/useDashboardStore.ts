import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card, DataSource, DashboardState, UIState, ChartConfig, ChartType } from '../types'

// ─── 工具函数 ───────────────────────────────────────────────

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

// ─── 默认图表配置 ────────────────────────────────────────────

function createDefaultChartConfig(type: ChartType): ChartConfig {
  return {
    type,
    title: '新图表',
    dataMapping: {
      dimensionField: '',
      measureField: '',
      aggregation: 'sum',
    },
    filters: [],
    sortBy: 'value_desc',
    limit: 10,
    style: {
      showLegend: true,
      legendPosition: 'right',
      showChart: true,
      showTable: false,
    },
  }
}

// ─── Store 类型 ──────────────────────────────────────────────

interface DashboardStore {
  // 数据
  dashboard: DashboardState
  dataSources: DataSource[]
  ui: UIState
  lastUpdate: string | null

  // Dashboard 操作
  setDashboardTitle: (title: string) => void
  addCard: (type: ChartType, x: number, y: number) => string
  updateCard: (id: string, updates: Partial<Card>) => void
  removeCard: (id: string) => void
  updateCardLayout: (id: string, layout: { x: number; y: number; w: number; h: number }) => void

  // 数据源操作
  addDataSource: (ds: Omit<DataSource, 'id'>) => string
  updateDataSource: (id: string, updates: Partial<DataSource>) => void
  removeDataSource: (id: string) => void

  // UI 操作
  selectCard: (id: string | null) => void
  setRightPanelTab: (tab: UIState['rightPanelTab']) => void
  toggleLeftPanel: () => void
  setLoading: (loading: boolean) => void
  setLastUpdate: (time: string) => void
}

// ─── Store ────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      // ─── 初始状态 ────────────────────────────────────────
      dashboard: {
        id: nanoid(),
        title: '我的看板',
        layout: 'grid',
        cards: [],
        globalFilters: [],
      },

      dataSources: [],

      ui: {
        selectedCardId: null,
        rightPanelTab: 'data',
        isLeftPanelCollapsed: false,
        isLoading: false,
      },

      lastUpdate: null,

      // ─── Dashboard 操作 ──────────────────────────────────
      setDashboardTitle: (title) =>
        set((s) => ({ dashboard: { ...s.dashboard, title } })),

      addCard: (type, x, y) => {
        const id = nanoid()
        const config = createDefaultChartConfig(type)
        const card: Card = { id, chartConfig: config, x, y, w: 4, h: 3 }
        set((s) => ({
          dashboard: { ...s.dashboard, cards: [...s.dashboard.cards, card] },
          ui: { ...s.ui, selectedCardId: id },
        }))
        return id
      },

      updateCard: (id, updates) =>
        set((s) => ({
          dashboard: {
            ...s.dashboard,
            cards: s.dashboard.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
          },
        })),

      removeCard: (id) =>
        set((s) => ({
          dashboard: { ...s.dashboard, cards: s.dashboard.cards.filter((c) => c.id !== id) },
          ui: { ...s.ui, selectedCardId: s.ui.selectedCardId === id ? null : s.ui.selectedCardId },
        })),

      updateCardLayout: (id, layout) =>
        set((s) => ({
          dashboard: {
            ...s.dashboard,
            cards: s.dashboard.cards.map((c) =>
              c.id === id ? { ...c, x: layout.x, y: layout.y, w: layout.w, h: layout.h } : c
            ),
          },
        })),

      // ─── 数据源操作 ─────────────────────────────────────
      addDataSource: (ds) => {
        const id = nanoid()
        set((s) => ({ dataSources: [...s.dataSources, { ...ds, id }] }))
        return id
      },

      updateDataSource: (id, updates) =>
        set((s) => ({
          dataSources: s.dataSources.map((ds) => (ds.id === id ? { ...ds, ...updates } : ds)),
        })),

      removeDataSource: (id) =>
        set((s) => ({ dataSources: s.dataSources.filter((ds) => ds.id !== id) })),

      // ─── UI 操作 ─────────────────────────────────────────
      selectCard: (id) => set((s) => ({ ui: { ...s.ui, selectedCardId: id } })),

      setRightPanelTab: (tab) => set((s) => ({ ui: { ...s.ui, rightPanelTab: tab } })),

      toggleLeftPanel: () =>
        set((s) => ({ ui: { ...s.ui, isLeftPanelCollapsed: !s.ui.isLeftPanelCollapsed } })),

      setLoading: (loading) => set((s) => ({ ui: { ...s.ui, isLoading: loading } })),

      setLastUpdate: (time) => set({ lastUpdate: time }),
    }),
    {
      name: 'dashboard-builder-storage',
      partialize: (s) => ({
        dashboard: s.dashboard,
        dataSources: s.dataSources,
        lastUpdate: s.lastUpdate,
      }),
    }
  )
)
