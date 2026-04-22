import { Button, Modal, Form, Input, Select, message, InputNumber, Collapse, Upload, Switch } from 'antd'
import { ApiOutlined, FileTextOutlined, DatabaseOutlined, PlusOutlined, MinusOutlined, CloudUploadOutlined, CodeOutlined } from '@ant-design/icons'
import { useState, useRef } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'
import { parseExcel } from '../../hooks/useDataSource'
import type { DataSource, DataSourceType, JsonConfig, ApiConfig, JsonStringConfig, ExcelConfig } from '../../types'

const TYPE_ICONS: Record<DataSourceType, React.ReactNode> = {
  api: <ApiOutlined />,
  json: <FileTextOutlined />,
  'json-string': <CodeOutlined />,
  excel: <CloudUploadOutlined />,
  database: <DatabaseOutlined />,
  graphql: <ApiOutlined />,
  websocket: <ApiOutlined />,
}

interface HeaderItem { key: string; value: string }

interface AddDataSourceForm {
  name: string
  type: DataSourceType
  url?: string
  method?: 'GET' | 'POST'
  headers?: HeaderItem[]
  authType?: 'none' | 'bearer' | 'basic'
  authToken?: string
  body?: string
  responsePath?: string
  responseType?: 'json' | 'text'
  jsonData?: string
  jsonString?: string
  sheetIndex?: number
  hasHeader?: boolean
  pollInterval?: number
}

export default function LeftPanel({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const { dataSources, addDataSource, updateDataSource, removeDataSource } = useDashboardStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<AddDataSourceForm>()
  const [excelFileName, setExcelFileName] = useState<string>('')
  const [selectedType, setSelectedType] = useState<DataSourceType>('api')
  const excelFileRef = useRef<File | null>(null)

  const handleAdd = async (values: AddDataSourceForm) => {
    if (values.type === 'api') {
      const headers: Record<string, string> = {}
      if (values.headers) {
        for (const h of values.headers) {
          if (h.key.trim()) headers[h.key.trim()] = h.value
        }
      }
      const config: ApiConfig = {
        url: values.url || '',
        method: values.method || 'GET',
        headers: Object.keys(headers).length ? headers : undefined,
        body: values.method === 'POST' ? values.body : undefined,
        responsePath: values.responsePath || undefined,
        responseType: values.responseType || 'json',
      }
      if (values.authType && values.authType !== 'none' && values.authToken) {
        config.auth = { type: values.authType as 'bearer' | 'basic', token: values.authToken }
      }
      addDataSource({
        name: values.name,
        type: 'api',
        status: 'offline',
        config,
        pollInterval: values.pollInterval || 0,
      })
    } else if (values.type === 'json') {
      let parsed: unknown = []
      try {
        parsed = JSON.parse(values.jsonData || '[]')
      } catch {
        message.error('JSON 格式错误')
        return
      }
      addDataSource({
        name: values.name,
        type: 'json',
        status: 'online',
        config: { data: parsed } as JsonConfig,
        pollInterval: 0,
      })
    } else if (values.type === 'json-string') {
      try {
        JSON.parse(values.jsonString || '[]')
      } catch {
        message.error('JSON 格式错误，请检查字符串是否合法')
        return
      }
      addDataSource({
        name: values.name,
        type: 'json-string',
        status: 'online',
        config: { jsonString: values.jsonString } as JsonStringConfig,
        pollInterval: 0,
      })
    } else if (values.type === 'excel') {
      if (!excelFileRef.current) {
        message.error('请先上传 Excel 文件')
        return
      }
      try {
        const buffer = await excelFileRef.current.arrayBuffer()
        const rows = parseExcel(buffer, values.sheetIndex || 0, values.hasHeader !== false)
        const config: ExcelConfig & { _fileData: unknown } = {
          fileName: excelFileRef.current.name,
          sheetIndex: values.sheetIndex || 0,
          hasHeader: values.hasHeader !== false,
          _fileData: rows,
        }
        addDataSource({
          name: values.name,
          type: 'excel',
          status: 'online',
          config,
          lastUpdate: new Date().toISOString(),
          pollInterval: 0,
        })
        message.success(`Excel 解析成功，共 ${rows.length} 行`)
      } catch (e: unknown) {
        message.error('Excel 解析失败：' + (e as Error).message)
        return
      }
    }
    setModalOpen(false)
    form.resetFields()
    setExcelFileName('')
    excelFileRef.current = null
    onClose?.()
  }

  const handleTest = (ds: DataSource) => {
    updateDataSource(ds.id, { status: 'online', lastUpdate: new Date().toISOString() })
    message.success(`${ds.name} 连接成功`)
  }

  const renderApiFields = () => (
    <>
      <Form.Item name="url" label="URL" rules={[{ required: true }]}>
        <Input placeholder="https://api.example.com/data" />
      </Form.Item>
      <Form.Item name="method" label="请求方法">
        <Select>
          <Select.Option value="GET">GET</Select.Option>
          <Select.Option value="POST">POST</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="请求头">
        <Form.List name="headers">
          {(fields, { add, remove }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {fields.map(({ key, name }) => (
                <div key={key} style={{ display: 'flex', gap: 4 }}>
                  <Input placeholder="Key" style={{ flex: 1 }} size="small" />
                  <Input placeholder="Value" style={{ flex: 1 }} size="small" />
                  <Button size="small" type="text" danger icon={<MinusOutlined />} onClick={() => remove(name)} />
                </div>
              ))}
              <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => add({ key: '', value: '' })}>
                添加请求头
              </Button>
            </div>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item name="authType" label="认证方式">
        <Select>
          <Select.Option value="none">无</Select.Option>
          <Select.Option value="bearer">Bearer Token</Select.Option>
          <Select.Option value="basic">Basic Auth</Select.Option>
        </Select>
      </Form.Item>
      {selectedType === 'api' && form.getFieldValue('authType') !== 'none' && (
        <Form.Item name="authToken" label="Token / 凭证">
          <Input.Password placeholder="输入 token 或 basic 凭证" />
        </Form.Item>
      )}

      {selectedType === 'api' && form.getFieldValue('method') === 'POST' && (
        <Form.Item name="body" label="请求体（POST）">
          <Input.TextArea rows={3} placeholder='{"key": "value"}' />
        </Form.Item>
      )}

      <Collapse
        size="small"
        ghost
        items={[{
          key: 'response',
          label: '响应数据提取',
          children: (
            <>
              <Form.Item name="responseType" label="响应类型" style={{ marginBottom: 8 }}>
                <Select>
                  <Select.Option value="json">JSON</Select.Option>
                  <Select.Option value="text">纯文本</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="responsePath" label="提取路径">
                <Input placeholder="$.data.items  或  /regex pattern/" />
              </Form.Item>
            </>
          )
        }]}
      />

      <Form.Item name="pollInterval" label="轮询间隔（秒，0表示不轮询）" style={{ marginTop: 8 }}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
    </>
  )

  const renderJsonFields = () => (
    <Form.Item name="jsonData" label="JSON 数据">
      <Input.TextArea rows={6} placeholder='[{"name": "未设定", "value": 105}]' />
    </Form.Item>
  )

  const renderJsonStringFields = () => (
    <Form.Item name="jsonString" label="JSON 字符串" rules={[{ required: true, message: '请输入 JSON 字符串' }]}>
      <Input.TextArea
        rows={10}
        placeholder={'[\n  {"name": "未设定", "value": 105}\n]'}
      />
    </Form.Item>
  )

  const renderExcelFields = () => (
    <>
      <Form.Item label="上传 Excel 文件" required>
        <Upload
          accept=".xlsx,.xls,.csv"
          showUploadList={false}
          beforeUpload={(file) => {
            setExcelFileName(file.name)
            excelFileRef.current = file
            return false
          }}
        >
          <Button icon={<CloudUploadOutlined />}>
            {excelFileName || '选择文件'}
          </Button>
        </Upload>
      </Form.Item>
      <Form.Item name="sheetIndex" label="工作表索引" style={{ marginBottom: 8 }}>
        <InputNumber min={0} max={20} defaultValue={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="hasHeader" label="含表头" valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
      <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
        支持 .xlsx、.xls、.csv 格式
      </div>
    </>
  )

  const renderTypeFields = () => {
    switch (selectedType) {
      case 'api': return renderApiFields()
      case 'json': return renderJsonFields()
      case 'json-string': return renderJsonStringFields()
      case 'excel': return renderExcelFields()
      default: return null
    }
  }

  return (
    <aside className={`app-left-panel ${collapsed ? 'app-left-panel--collapsed' : ''}`}>
      <div className="app-left-panel__header">
        <span>数据源管理</span>
        <Button type="text" size="small" icon={<ApiOutlined />} onClick={() => setModalOpen(true)} />
      </div>

      <div className="app-left-panel__content">
        {dataSources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
            暂无数据源<br />
            <Button type="link" size="small" onClick={() => setModalOpen(true)}>点击添加</Button>
          </div>
        ) : (
          <div className="data-source-list">
            {dataSources.map((ds) => (
              <div key={ds.id} className="data-source-item">
                <div className="data-source-item__header">
                  <span className={`data-source-item__status data-source-item__status--${ds.status}`} />
                  <span className="data-source-item__name">{ds.name}</span>
                  <span className="data-source-item__type">{TYPE_ICONS[ds.type]}</span>
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                  <Button size="small" type="text" onClick={() => handleTest(ds)}>测试</Button>
                  <Button size="small" type="text" danger onClick={() => removeDataSource(ds.id)}>删除</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        title="新建数据源"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); setExcelFileName(''); excelFileRef.current = null }}
        onOk={() => form.submit()}
        okText="创建"
        width={560}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          initialValues={{ type: 'api', method: 'GET', pollInterval: 0, authType: 'none', responseType: 'json', hasHeader: true }}
          onValuesChange={(changed) => {
            if (changed.type) setSelectedType(changed.type)
          }}
        >
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="例如：Bug统计接口" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select>
              <Select.Option value="api">REST API</Select.Option>
              <Select.Option value="json">静态 JSON（编辑器）</Select.Option>
              <Select.Option value="json-string">粘贴 JSON 字符串</Select.Option>
              <Select.Option value="excel">上传 Excel 文件</Select.Option>
            </Select>
          </Form.Item>

          {renderTypeFields()}
        </Form>
      </Modal>
    </aside>
  )
}
