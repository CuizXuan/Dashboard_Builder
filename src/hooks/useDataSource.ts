import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { UnifiedDataset, ApiConfig, JsonConfig } from '../types'

export function useDataSource(sourceId: string | undefined, config: ApiConfig | JsonConfig | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['datasource', sourceId],
    queryFn: async (): Promise<UnifiedDataset> => {
      if (!config) throw new Error('No config')
      if ('url' in config) {
        const res = await fetch(config.url, {
          method: config.method || 'GET',
          headers: config.headers,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const raw = await res.json()
        return normalizeData(raw, sourceId!)
      } else if ('data' in config) {
        return normalizeData(config.data, sourceId!)
      }
      throw new Error('Unknown config type')
    },
    enabled: !!sourceId && !!config,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
  return { data, isLoading, error, refetch }
}

function normalizeData(raw: unknown, sourceId: string): UnifiedDataset {
  let data: Record<string, unknown>[] = []
  if (Array.isArray(raw)) data = raw
  else if (raw && typeof raw === 'object' && 'data' in (raw as any)) data = (raw as any).data || []

  const sample = data[0] || {}
  const dimensions = Object.keys(sample).map((name) => {
    const val = sample[name]
    let type: 'string' | 'number' | 'date' | 'boolean' = 'string'
    let role: 'category' | 'series' | 'value' | 'time' = 'value'
    if (typeof val === 'number') { type = 'number'; role = 'value' }
    else if (typeof val === 'boolean') { type = 'boolean' }
    else if (typeof val === 'string') {
      if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(val)) { type = 'date'; role = 'time' }
      else { role = 'category' }
    }
    return { name, type, role }
  })

  return { meta: { sourceId, updateTime: new Date().toISOString(), totalCount: data.length }, dimensions, data }
}

export function useChartData(
  dataset: UnifiedDataset | undefined,
  dimensionField: string,
  measureField: string,
  aggregation: 'sum' | 'count' | 'avg' | 'max' | 'min',
  sortBy: string,
  limit: number
) {
  return useMemo(() => {
    if (!dataset || !dimensionField || !measureField) return []

    const grouped: Record<string, number> = {}
    for (const row of dataset.data) {
      const key = String(row[dimensionField] ?? '未知')
      const val = Number(row[measureField] ?? 0)
      if (!grouped[key]) grouped[key] = 0
      if (aggregation === 'sum' || aggregation === 'count') grouped[key] += aggregation === 'count' ? 1 : val
      else if (aggregation === 'avg') grouped[key] = (grouped[key] + val) / 2
      else if (aggregation === 'max') grouped[key] = Math.max(grouped[key], val)
      else if (aggregation === 'min') grouped[key] = grouped[key] === 0 ? val : Math.min(grouped[key], val)
    }

    let entries = Object.entries(grouped)
    if (sortBy === 'value_desc') entries.sort((a, b) => b[1] - a[1])
    else if (sortBy === 'value_asc') entries.sort((a, b) => a[1] - b[1])
    else if (sortBy === 'name_asc') entries.sort((a, b) => a[0].localeCompare(b[0]))
    else if (sortBy === 'name_desc') entries.sort((a, b) => b[0].localeCompare(a[0]))

    if (limit > 0 && entries.length > limit) {
      const top = entries.slice(0, limit)
      const rest = entries.slice(limit).reduce((s, [, v]) => s + v, 0)
      if (rest > 0) top.push(['其他', rest])
      entries = top
    }
    return entries.map(([name, value]) => ({ name, value }))
  }, [dataset, dimensionField, measureField, aggregation, sortBy, limit])
}
