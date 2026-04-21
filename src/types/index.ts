// ============================================================
// 图表相关类型
// ============================================================

export type ChartType = 'pie' | 'line' | 'bar' | 'table'

export interface DataMapping {
  dimensionField: string      // 维度字段（X轴/分类）
  measureField: string         // 度量字段（Y轴/数值）
  aggregation: 'sum' | 'count' | 'avg' | 'max' | 'min'
}

export interface FilterCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains'
  value: string
}

export interface ChartConfig {
  type: ChartType
  title: string
  dataMapping: DataMapping
  filters: FilterCondition[]
  sortBy: 'value_asc' | 'value_desc' | 'name_asc' | 'name_desc'
  limit: number               // 前N项，其余归入"其他"
  style: {
    showLegend: boolean
    legendPosition: 'right' | 'bottom'
    showChart: boolean
    showTable: boolean
  }
}

// ============================================================
// 图表卡片类型
// ============================================================

export interface Card {
  id: string
  chartConfig: ChartConfig
  // react-grid-layout 位置
  x: number
  y: number
  w: number
  h: number
}

// ============================================================
// 数据源类型
// ============================================================

export type DataSourceType = 'api' | 'graphql' | 'json' | 'websocket' | 'database'

export type DataSourceStatus = 'online' | 'offline' | 'error'

export interface DataSource {
  id: string
  name: string
  type: DataSourceType
  status: DataSourceStatus
  config: ApiConfig | JsonConfig | DatabaseConfig | WebSocketConfig
  pollInterval?: number        // 轮询间隔（毫秒），0表示不轮询
  lastUpdate?: string
}

export interface ApiConfig {
  url: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  auth?: { type: 'bearer' | 'basic'; token?: string }
}

export interface JsonConfig {
  data: unknown
}

export interface DatabaseConfig {
  connectionString: string
  sql: string
}

export interface WebSocketConfig {
  url: string
  reconnectInterval: number
}

// ============================================================
// 统一数据格式 (UDF)
// ============================================================

export type FieldRole = 'category' | 'series' | 'value' | 'time'
export type FieldType = 'string' | 'number' | 'date' | 'boolean'

export interface FieldMeta {
  name: string
  type: FieldType
  role: FieldRole
}

export interface UnifiedDataset {
  meta: {
    sourceId: string
    updateTime: string
    totalCount?: number
  }
  dimensions: FieldMeta[]
  data: Record<string, unknown>[]
}

// ============================================================
// 状态类型
// ============================================================

export interface DashboardState {
  id: string
  title: string
  layout: 'grid' | 'free'
  cards: Card[]
  globalFilters: FilterCondition[]
}

export interface UIState {
  selectedCardId: string | null
  rightPanelTab: 'data' | 'style' | 'interaction'
  isLeftPanelCollapsed: boolean
  isLoading: boolean
}

export interface CacheState {
  datasets: Record<string, UnifiedDataset>
}

// ============================================================
// 主题类型
// ============================================================

export type ThemeName = 'light-business' | 'dark-tech' | 'light-fresh'

export interface ThemeConfig {
  name: ThemeName
  label: string
}
