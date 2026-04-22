import html2canvas from 'html2canvas'

/** 将页面某个元素导出为 PNG 图片 */
export async function exportElementToPng(
  element: HTMLElement,
  filename = 'dashboard.png',
  scale = 2
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg-page')
      .trim() || '#F0F2F5',
    useCORS: true,
    logging: false,
    allowTaint: true,
  })

  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

/** 将整个 dashboard 导出为 JSON（配置备份） */
export function exportDashboardJson(dashboard: {
  id: string
  title: string
  cards: unknown[]
}, dataSources: unknown[]): void {
  const payload = JSON.stringify({ dashboard, dataSources }, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const link = document.createElement('a')
  link.download = `${dashboard.title || 'dashboard'}_${new Date().toISOString().slice(0, 10)}.json`
  link.href = URL.createObjectURL(blob)
  link.click()
  URL.revokeObjectURL(link.href)
}

/** 导入 dashboard JSON */
export function importDashboardJson(): Promise<{ dashboard: unknown; dataSources: unknown[] } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        resolve(data)
      } catch {
        resolve(null)
      }
    }
    input.click()
  })
}
