import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const scriptDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)))
const projectRoot = resolve(scriptDirectory, '..')
const sourceDirectory = resolve(projectRoot, '..', 'outputs', 'defect_statistics_20260713')
const workbookName = (await readdir(sourceDirectory)).find((name) => name.endsWith('.xlsx') && !name.startsWith('~$'))

if (!workbookName) throw new Error('未找到缺陷统计 Excel 文件')

const workbook = XLSX.readFile(resolve(sourceDirectory, workbookName))
const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' })

if (rawRows.length !== 45) throw new Error(`期望 45 条缺陷记录，实际读取到 ${rawRows.length} 条`)

const activityCounts = [
  ...Array(11).fill(1),
  ...Array(21).fill(2),
  ...Array(11).fill(3),
  ...Array(2).fill(4),
]

// 固定随机顺序，避免激活次数与 Excel 中的记录顺序形成误导性关联。
let seed = 20260713
for (let index = activityCounts.length - 1; index > 0; index -= 1) {
  seed = (seed * 48271) % 2147483647
  const target = seed % (index + 1)
  ;[activityCounts[index], activityCounts[target]] = [activityCounts[target], activityCounts[index]]
}

const records = rawRows.map((row, index) => ({
  模块: row.模块,
  严重程度: row.严重程度,
  类型: row.类型,
  激活次数: activityCounts[index],
  记录数: 1,
}))

const sourceId = 'ganfu-defects'
const dashboardId = 'ganfu-defect-dashboard'
const state = {
  state: {
    dashboards: [{
      id: dashboardId,
      title: '赣抚平原灌区测试缺陷看板',
      globalFilters: [],
      cards: [
        {
          id: 'module-defects', x: 0, y: 0, w: 6, h: 4,
          chartConfig: {
            type: 'bar', title: '模块缺陷数量',
            dataMapping: { sourceId, dimensionField: '模块', measureField: '记录数', aggregation: 'sum' },
            filters: [], sortBy: 'value_desc', limit: 20,
            style: { showLegend: true, legendPosition: 'right', showChart: true, showTable: false },
          },
        },
        {
          id: 'severity-defects', x: 6, y: 0, w: 6, h: 4,
          chartConfig: {
            type: 'pie', title: '严重程度分布',
            dataMapping: { sourceId, dimensionField: '严重程度', measureField: '记录数', aggregation: 'sum' },
            filters: [], sortBy: 'value_desc', limit: 10,
            style: { showLegend: true, legendPosition: 'right', showChart: true, showTable: false },
          },
        },
        {
          id: 'type-defects', x: 0, y: 4, w: 6, h: 4,
          chartConfig: {
            type: 'pie', title: '缺陷类型分布',
            dataMapping: { sourceId, dimensionField: '类型', measureField: '记录数', aggregation: 'sum' },
            filters: [], sortBy: 'value_desc', limit: 10,
            style: { showLegend: true, legendPosition: 'right', showChart: true, showTable: false },
          },
        },
        {
          id: 'activation-defects', x: 6, y: 4, w: 6, h: 4,
          chartConfig: {
            type: 'bar', title: '激活次数分布（模拟）',
            dataMapping: { sourceId, dimensionField: '激活次数', measureField: '记录数', aggregation: 'sum' },
            filters: [], sortBy: 'value_desc', limit: 10,
            style: { showLegend: true, legendPosition: 'right', showChart: true, showTable: false },
          },
        },
      ],
    }],
    activeDashboardId: dashboardId,
    dataSources: [{
      id: sourceId,
      name: '赣抚灌区测试缺陷（模拟）',
      type: 'json',
      status: 'online',
      config: { data: records },
      lastUpdate: new Date().toISOString(),
      pollInterval: 0,
    }],
    lastUpdate: new Date().toISOString(),
  },
  version: 0,
}

const outputDirectory = resolve(projectRoot, 'data')
await mkdir(outputDirectory, { recursive: true })
await writeFile(resolve(outputDirectory, 'dashboard-state.seed.json'), `${JSON.stringify(state, null, 2)}\n`, 'utf8')
console.log(`已生成共享看板种子数据：${records.length} 条缺陷记录`)
