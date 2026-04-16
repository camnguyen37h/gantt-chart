import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Table, Button, Input, Select, Form, Textarea,
  Popconfirm, notification, Tag, Icon, Divider,
  Row, Col, Card, Spin, Tooltip,
} from 'antd'
import {
  fetchCIRuleConfigs,
  createCIRuleConfig,
  updateCIRuleConfig,
  deleteCIRuleConfig,
  selectCIRuleConfigs,
  selectCIRuleConfigLoading,
  selectCIRuleConfigSubmitting,
} from '../../store/cmplan'
import './CMPlan.css'

const { Option } = Select
const { TextArea } = Input

const PAGE_SIZE = 10

const CATEGORIES = [
  { value: 'validation_rule',  label: 'Validation Rule' },
  { value: 'relationship_type', label: 'Relationship Type' },
]

const CATEGORY_COLOR = {
  validation_rule:  'geekblue',
  relationship_type: 'purple',
}

// ── Regex helpers ─────────────────────────────────────────────────────────────
function isSlashRegexFormat(raw) {
  return /^\/.*\/[gimsuy]*$/.test(String(raw || ''))
}

function tryBuildRegex(raw) {
  if (!raw) return null
  const m = String(raw).match(/^\/(.+)\/([gimsuy]*)$/)
  if (!m) return null
  try {
    return new RegExp(m[1], m[2])
  } catch (e) {
    return null
  }
}

// ── Inline form (create / edit) ───────────────────────────────────────────────
const CIConfigFormInner = ({ form, editing, onCancel, submitting, saveSucceeded, onSave }) => {
  const [currentCategory, setCurrentCategory] = useState(null)
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState(null) // null | true | false

  const { getFieldDecorator } = form

  useEffect(() => {
    setCurrentCategory(editing ? editing.category : null)
    setTestInput('')
    setTestResult(null)
  }, [editing])

  const handleCategoryChange = (value) => {
    setCurrentCategory(value)
    setTestInput('')
    setTestResult(null)
    // Only re-validate value if it already has content (avoid spurious "required" error)
    const currentValue = form.getFieldValue('value')
    if (currentValue) {
      setTimeout(() => form.validateFields(['value'], { force: true }), 0)
    }
  }

  const handleValueChange = (e) => {
    // Trigger live field validation so error shows while typing
    setTimeout(() => form.validateFields(['value'], { force: true }), 0)
    // Re-run test box
    if (testInput) {
      const re = tryBuildRegex(e.target.value)
      setTestResult(re ? re.test(testInput) : null)
    }
  }

  const runTest = (input) => {
    const rawValue = form.getFieldValue('value')
    if (!input || !rawValue) {
      setTestInput(input)
      setTestResult(null)
      return
    }
    const re = tryBuildRegex(rawValue)
    setTestInput(input)
    setTestResult(re ? re.test(input) : null)
  }

  const handleTestInput = (e) => {
    runTest(e.target.value)
  }

  const handleSave = () => {
    form.validateFields((err, values) => {
      if (err) return
      onSave(values)
    })
  }

  const isValidationRule = currentCategory === 'validation_rule'

  // Determine test input border/icon state
  const testBorderColor = testResult === null ? undefined : testResult ? '#52c41a' : '#ff4d4f'
  const testSuffix = testResult === null
    ? null
    : testResult
      ? <Icon type="check-circle" style={{ color: '#52c41a' }} />
      : <Icon type="close-circle" style={{ color: '#ff4d4f' }} />

  return (
      <div style={{ maxWidth: 860 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Button
            type="link"
            icon="arrow-left"
            style={{ padding: 0, fontSize: 14, color: '#1890ff' }}
            onClick={onCancel}
          >
            Back
          </Button>
          {saveSucceeded && (
            <Tag color="green" style={{ fontSize: 13, padding: '4px 12px' }}>
              <Icon type="check-circle" style={{ marginRight: 4 }} />
              Save Successfully
            </Tag>
          )}
        </div>

        <h2 style={{ marginBottom: 24, fontWeight: 600 }}>
          {editing ? 'Edit CI Config' : 'New CI Config'}
        </h2>

        <Form layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Category" required>
                {getFieldDecorator('category', {
                  rules: [{ required: true, message: 'Please select a category' }],
                })(
                  <Select
                    placeholder="Select category"
                    style={{ width: '100%' }}
                    onChange={handleCategoryChange}
                  >
                    {CATEGORIES.map((c) => (
                      <Option key={c.value} value={c.value}>{c.label}</Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    Value
                    {isValidationRule && (
                      <Tooltip title="Must be a valid JavaScript regular expression. Supports /pattern/flags format (e.g. /^[a-z]+$/i) or plain pattern (e.g. ^[a-z]+$).">
                        <Icon type="question-circle" style={{ marginLeft: 6, color: '#bfbfbf', fontSize: 12 }} />
                      </Tooltip>
                    )}
                  </span>
                }
                extra={
                  isValidationRule
                    ? <span style={{ fontSize: 11, color: '#bfbfbf' }}>Format: <code>/pattern/flags</code> &nbsp;e.g. <code>/^\w+$/i</code></span>
                    : null
                }
                required
              >
                {getFieldDecorator('value', {
                  rules: [
                    { required: true, message: 'Please enter a value' },
                    {
                      validator: (rule, val, callback) => {
                        if (currentCategory === 'validation_rule' && val) {
                          if (!isSlashRegexFormat(val)) {
                            callback('Must use /pattern/flags format, e.g. /^[a-z]+$/i')
                            return
                          }
                          if (!tryBuildRegex(val)) {
                            callback('Invalid regex syntax — check your pattern')
                            return
                          }
                        }
                        callback()
                      },
                    },
                  ],
                })(
                  <Input
                    placeholder={isValidationRule ? '/^[a-zA-Z0-9]+$/i' : 'e.g. connected_to'}
                    onChange={handleValueChange}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          {/* ── Regex live test (only for Validation Rule) ────────────── */}
          {isValidationRule && (
            <Row gutter={24} style={{ marginBottom: 4 }}>
              <Col span={24}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: 400, color: '#595959' }}>
                      <Icon type="experiment" style={{ marginRight: 5, color: '#1890ff' }} />
                      Test regex
                      <span style={{ fontSize: 11, color: '#bfbfbf', marginLeft: 8 }}>
                        Type a value to test if it matches the pattern above
                      </span>
                    </span>
                  }
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    value={testInput}
                    onChange={handleTestInput}
                    placeholder="e.g.  user@example.com"
                    suffix={testSuffix}
                    style={{ borderColor: testBorderColor, maxWidth: 400 }}
                  />
                  {testInput && testResult !== null && (
                    <div style={{ marginTop: 6, fontSize: 12 }}>
                      {testResult
                        ? <span style={{ color: '#52c41a', fontWeight: 500 }}><Icon type="check" /> Match</span>
                        : <span style={{ color: '#ff4d4f', fontWeight: 500 }}><Icon type="close" /> No match</span>
                      }
                    </div>
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={24} style={{ marginTop: isValidationRule ? 12 : 0 }}>
            <Col span={12}>
              <Form.Item label="Display Name" required extra={
                <span style={{ fontSize: 11, color: '#bfbfbf' }}>Max 200 characters</span>
              }>
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: 'Please enter a display name' },
                    { max: 200, message: 'Max 200 characters' },
                  ],
                })(
                  <Input placeholder="e.g. Email, Depends On" maxLength={200} />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Description" extra={
                <span style={{ fontSize: 11, color: '#bfbfbf' }}>Max 200 characters</span>
              }>
                {getFieldDecorator('description', {
                  rules: [{ max: 200, message: 'Max 200 characters' }],
                })(
                  <TextArea rows={3} placeholder="Describe this config..." maxLength={200} />
                )}
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onCancel} disabled={submitting}>Cancel</Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </Form>
      </div>
  )
}

const CIConfigForm = Form.create({ name: 'ci_config_form' })(CIConfigFormInner)

// ── Main Page ─────────────────────────────────────────────────────────────────
const CIConfigPage = () => {
  const dispatch = useDispatch()
  const allItems = useSelector(selectCIRuleConfigs)
  const loading = useSelector(selectCIRuleConfigLoading)
  const submitting = useSelector(selectCIRuleConfigSubmitting)

  // List filters
  const [filterCategory, setFilterCategory] = useState(undefined)
  const [filterName, setFilterName]         = useState('')
  const [filterValue, setFilterValue]       = useState('')
  const [page, setPage]                     = useState(1)

  // Form state
  const [showForm, setShowForm]         = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [saveSucceeded, setSaveSucceeded] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    dispatch(fetchCIRuleConfigs())
  }, [dispatch])

  // ── Filtered + paginated data ───────────────────────────────────────────
  const filtered = allItems.filter((item) => {
    if (filterCategory && item.category !== filterCategory) return false
    if (filterName && !item.name.toLowerCase().includes(filterName.toLowerCase())) return false
    if (filterValue && !item.value.toLowerCase().includes(filterValue.toLowerCase())) return false
    return true
  })

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleCreate = useCallback(() => {
    setEditingRecord(null)
    setSaveSucceeded(false)
    setShowForm(true)
  }, [])

  const handleEdit = useCallback((record) => {
    setEditingRecord(record)
    setSaveSucceeded(false)
    setShowForm(true)
  }, [])

  const handleBack = useCallback(() => {
    setShowForm(false)
    setEditingRecord(null)
    setSaveSucceeded(false)
  }, [])

  const handleDelete = useCallback(async (id) => {
    const res = await dispatch(deleteCIRuleConfig(id))
    if (res.error) {
      notification.error({ message: 'Delete failed', description: res.payload && res.payload.message })
    } else {
      notification.success({ message: 'Deleted successfully' })
    }
  }, [dispatch])

  const handleSave = useCallback(async (values) => {
    let res
    if (editingRecord) {
      res = await dispatch(updateCIRuleConfig({ id: editingRecord.id, payload: values }))
    } else {
      res = await dispatch(createCIRuleConfig(values))
    }

    if (res.error) {
      notification.error({ message: 'Save failed', description: res.payload && res.payload.message })
      return
    }

    setSaveSucceeded(true)
    setTimeout(() => setSaveSucceeded(false), 3000)

    if (!editingRecord) {
      // After create, reset form for another entry
      if (formRef.current) {
        const form = formRef.current.getForm ? formRef.current.getForm() : null
        if (form) form.resetFields()
      }
    }

    notification.success({ message: editingRecord ? 'Updated successfully' : 'Created successfully' })
  }, [dispatch, editingRecord])

  // Populate form when switching to edit
  useEffect(() => {
    if (showForm && editingRecord && formRef.current) {
      const form = formRef.current.getForm ? formRef.current.getForm() : null
      if (form) {
        setTimeout(() => {
          form.setFieldsValue({
            category:    editingRecord.category,
            value:       editingRecord.value,
            name:        editingRecord.name,
            description: editingRecord.description || '',
          })
        }, 0)
      }
    }
  }, [showForm, editingRecord])

  // ── Table columns ───────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      width: 160,
      render: (val) => {
        const cat = CATEGORIES.find((c) => c.value === val)
        return (
          <Tag color={CATEGORY_COLOR[val]} style={{ fontSize: 11 }}>
            {cat ? cat.label : val}
          </Tag>
        )
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 160,
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (v, row) => (
        <code style={{
          fontSize: 11,
          background: row.category === 'validation_rule' ? '#f6ffed' : '#f9f0ff',
          color:      row.category === 'validation_rule' ? '#389e0d' : '#531dab',
          padding: '2px 6px',
          borderRadius: 3,
          wordBreak: 'break-all',
        }}>
          {v}
        </code>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      render: (v) => <span style={{ color: '#8c8c8c', fontSize: 12 }}>{v || '—'}</span>,
    },
    {
      title: 'Action',
      width: 100,
      render: (_, record) => (
        <span>
          <Button
            type="link"
            size="small"
            style={{ padding: 0 }}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Divider type="vertical" />
          <Popconfirm
            title="Delete this config?"
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" style={{ padding: 0, color: '#ff4d4f' }}>
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '0 4px' }}>
      {/* Breadcrumb title */}
      <div style={{ marginBottom: 16, color: '#8c8c8c', fontSize: 13 }}>
        Customization - CMDB - CI Rule Config
      </div>

      {showForm ? (
        <CIConfigForm
          wrappedComponentRef={formRef}
          editing={editingRecord}
          onCancel={handleBack}
          onSave={handleSave}
          submitting={submitting}
          saveSucceeded={saveSucceeded}
        />
      ) : (
        <>
          {/* ── Search bar ─────────────────────────────────────────────── */}
          <Row gutter={8} style={{ marginBottom: 12 }}>
            <Col span={5}>
              <Select
                allowClear
                placeholder="Search Category"
                style={{ width: '100%' }}
                value={filterCategory}
                onChange={(val) => { setFilterCategory(val); setPage(1) }}
              >
                {CATEGORIES.map((c) => (
                  <Option key={c.value} value={c.value}>{c.label}</Option>
                ))}
              </Select>
            </Col>
            <Col span={5}>
              <Input
                placeholder="Name"
                prefix={<Icon type="search" style={{ color: '#bfbfbf' }} />}
                allowClear
                value={filterName}
                onChange={(e) => { setFilterName(e.target.value); setPage(1) }}
              />
            </Col>
            <Col span={5}>
              <Input
                placeholder="Value"
                prefix={<Icon type="search" style={{ color: '#bfbfbf' }} />}
                allowClear
                value={filterValue}
                onChange={(e) => { setFilterValue(e.target.value); setPage(1) }}
              />
            </Col>
            <Col span={9} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon="plus"
                onClick={handleCreate}
              >
                Create new CI RuleConfig
              </Button>
            </Col>
          </Row>

          {/* ── Table ──────────────────────────────────────────────────── */}
          <Spin spinning={loading}>
            <Table
              size="small"
              bordered
              rowKey="id"
              dataSource={paginated}
              columns={columns}
              pagination={{
                current: page,
                pageSize: PAGE_SIZE,
                total: filtered.length,
                onChange: (p) => setPage(p),
                showTotal: (total) => `${total} records`,
                size: 'small',
              }}
              locale={{ emptyText: 'No records found' }}
            />
          </Spin>
        </>
      )}
    </div>
  )
}

export default CIConfigPage
