import { Button, Modal, Form, Input, Select, message } from 'antd'
import { ApiOutlined, FileTextOutlined, DatabaseOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { DataSource, DataSourceType, JsonConfig } from '../../types'

const TYPE_ICONS: Record<DataSourceType, React.ReactNode> = {
  api: <ApiOutlined />,
  json: <FileTextOutlined />,
  database: <DatabaseOutlined />,
  graphql: <ApiOutlined />,
  websocket: <ApiOutlined />,
}

interface AddDataSourceForm {
  name: string
  type: DataSourceType
  url?: string
  method?: 'GET' | 'POST'
  jsonData?: string
  pollInterval?: number
}

export default function LeftPanel({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const { dataSources, addDataSource, updateDataSource, removeDataSource } = useDashboardStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<AddDataSourceForm>()

  const handleAdd = (values: AddDataSourceForm) => {
    if (values.type === 'api') {
      addDataSource({
        name: values.name,
        type: 'api',
        status: 'offline',
        config: { url: values.url || '', method: values.method || 'GET' },
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
    }
    setModalOpen(false)
    form.resetFields()
    onClose?.()
  }

  const handleTest = (ds: DataSource) => {
    updateDataSource(ds.id, { status: 'online', lastUpdate: new Date().toISOString() })
    message.success(`${ds.name} 连接成功`)
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

      <Modal title="新建数据源" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="创建">
        <Form form={form} layout="vertical" onFinish={handleAdd} initialValues={{ type: 'api', method: 'GET', pollInterval: 0 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="例如：Bug统计接口" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select>
              <Select.Option value="api">REST API</Select.Option>
              <Select.Option value="json">静态JSON</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 'api' && (
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
                  <Form.Item name="pollInterval" label="轮询间隔（秒，0表示不轮询）">
                    <Input type="number" min={0} />
                  </Form.Item>
                </>
              )
            }
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 'json' && (
                <Form.Item name="jsonData" label="JSON 数据">
                  <Input.TextArea rows={6} placeholder='[{"name": "未设定", "value": 105}]' />
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    </aside>
  )
}
