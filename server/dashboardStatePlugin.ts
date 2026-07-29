import { copyFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

const MAX_STATE_SIZE = 2 * 1024 * 1024

function sendJson(response: ServerResponse, statusCode: number, value: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(value))
}

async function readBody(request: IncomingMessage) {
  let total = 0
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buffer.length
    if (total > MAX_STATE_SIZE) throw new Error('看板状态文件不能超过 2 MB')
    chunks.push(buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function isPersistedDashboardState(value: unknown): value is { state: object; version: number } {
  if (!value || typeof value !== 'object') return false
  const candidate = value as { state?: unknown; version?: unknown }
  return !!candidate.state && typeof candidate.state === 'object' && typeof candidate.version === 'number'
}

/**
 * 开发环境的轻量文件存储：同一台机器上访问本地看板的所有浏览器共用此文件。
 */
export function dashboardStatePlugin(): Plugin {
  const stateFile = resolve(process.cwd(), 'data', 'dashboard-state.json')
  const seedFile = resolve(process.cwd(), 'data', 'dashboard-state.seed.json')

  async function ensureStateFile() {
    try {
      await readFile(stateFile)
      return true
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }

    try {
      await mkdir(resolve(stateFile, '..'), { recursive: true })
      await copyFile(seedFile, stateFile)
      return true
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
      throw error
    }
  }

  return {
    name: 'dashboard-state-file-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/dashboard-state', async (request, response) => {
        try {
          if (request.method === 'GET') {
            try {
              if (!(await ensureStateFile())) {
                sendJson(response, 404, { message: '尚未创建共享看板状态' })
                return
              }
              const content = await readFile(stateFile, 'utf8')
              response.statusCode = 200
              response.setHeader('Content-Type', 'application/json; charset=utf-8')
              response.end(content)
            } catch (error: unknown) {
              throw error
            }
            return
          }

          if (request.method === 'PUT') {
            const value = JSON.parse(await readBody(request))
            if (!isPersistedDashboardState(value)) {
              sendJson(response, 400, { message: '无效的看板状态' })
              return
            }

            await mkdir(resolve(stateFile, '..'), { recursive: true })
            const temporaryFile = `${stateFile}.${process.pid}.${Date.now()}.tmp`
            try {
              await writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
              // Windows 不会用 rename 覆盖现有文件，需先删除旧状态再替换。
              await rm(stateFile, { force: true })
              await rename(temporaryFile, stateFile)
            } finally {
              await rm(temporaryFile, { force: true })
            }
            sendJson(response, 200, { ok: true })
            return
          }

          if (request.method === 'DELETE') {
            await rm(stateFile, { force: true })
            response.statusCode = 204
            response.end()
            return
          }

          response.setHeader('Allow', 'GET, PUT, DELETE')
          sendJson(response, 405, { message: '不支持的请求方法' })
        } catch (error: unknown) {
          sendJson(response, 500, { message: (error as Error).message || '保存共享看板状态失败' })
        }
      })
    },
  }
}
