// ECharts 全局主题配置 — 与设计文档 02_UI设计方案 色彩体系一致

export const CHART_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#E67E22', '#1ABC9C', '#34495E',
]

export const BASE_CHART_OPTIONS = {
  color: CHART_COLORS,
  textStyle: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
  },
}

// 统一图例样式
export const LEGEND_COMMON = {
  itemWidth: 8,
  itemHeight: 8,
  borderRadius: 4,
  textStyle: {
    fontSize: 12,
    color: '#595959',
  },
}

// 统一 Tooltip 样式
export const TOOLTIP_COMMON = {
  trigger: 'item',
  backgroundColor: 'rgba(255,255,255,0.96)',
  borderColor: '#E8E8E8',
  borderWidth: 1,
  textStyle: { color: '#262626', fontSize: 12 },
  extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-radius: 4px;',
}
