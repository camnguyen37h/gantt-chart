import React, { useState } from 'react'
import {
  Modal, Form, Input, Select, Row, Col, Icon, Tooltip, Button,
} from 'antd'
import {
  RULE_CONFIG_CATEGORIES,
  RULE_CONFIG_CATEGORY_VALUES,
} from '../../../utils/cmplan/cmplanConstants'

const { Option } = Select
const { TextArea } = Input

// ── Regex helpers ────────────────────────────────────────────────────────────

const isSlashRegexFormat = (raw) => {
  return /^\/.*\/[gimsuy]*$/.test(String(raw || ''))
}

const tryBuildRegex = (raw) => {
  if (!raw) return null
  const regexParts = String(raw).match(/^\/(.+)\/([gimsuy]*)$/)
  if (!regexParts) return null
  try {
    return new RegExp(regexParts[1], regexParts[2])
  } catch (error) {
    return null
  }
}

/**
 * Modal form for creating or editing a CI Rule Config.
 * Props: visible, editingRecord, submitting, onSubmit, onCancel
 */
const CIConfigFormModalInner = ({ form, visible, editingRecord, submitting, onSubmit, onCancel }) => {
  const { getFieldDecorator, validateFields, getFieldValue } = form
  const isEdit = !!editingRecord

  const [currentCategory, setCurrentCategory] = useState(
    editingRecord ? editingRecord.category : null
  )
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState(null)

  const isValidationRule = currentCategory === RULE_CONFIG_CATEGORY_VALUES.VALIDATION_RULE

  const handleCategoryChange = (value) => {
    setCurrentCategory(value)
    setTestInput('')
    setTestResult(null)
    const currentValue = getFieldValue('value')
    if (currentValue) {
      setTimeout(() => validateFields(['value'], { force: true }), 0)
    }
  }


  const handleValueChange = (event) => {
    setTimeout(() => validateFields(['value'], { force: true }), 0)
    if (testInput) {
      const regex = tryBuildRegex(event.target.value)
      setTestResult(regex ? regex.test(testInput) : null)
    }
  }


  const handleTestInput = (event) => {
    const input = event.target.value
    const rawValue = getFieldValue('value')
    if (!input || !rawValue) {
      setTestInput(input)
      setTestResult(null)
      return
    }
    const regex = tryBuildRegex(rawValue)
    setTestInput(input)
    setTestResult(regex ? regex.test(input) : null)
  }


  const handleOk = () => {
    validateFields((err, values) => {
      if (err) return
      onSubmit(values)
    })
  }

  let testBorderColor
  let testIcon
  if (testResult === true) {
    testBorderColor = '#52c41a'
    testIcon = <Icon type="check-circle" style={{ color: '#52c41a' }} />
  } else if (testResult === false) {
    testBorderColor = '#ff4d4f'
    testIcon = <Icon type="close-circle" style={{ color: '#ff4d4f' }} />
  } else {
    testBorderColor = undefined
    testIcon = null
  }

  const valueRules = [
    { required: true, message: 'Please enter a value' },
    {
      validator: (rule, fieldValue, callback) => {
        if (currentCategory === RULE_CONFIG_CATEGORY_VALUES.VALIDATION_RULE && fieldValue) {
          if (!isSlashRegexFormat(fieldValue)) {
            callback('Must use /pattern/flags format, e.g. /^[a-z]+$/i')
            return
          }
          if (!tryBuildRegex(fieldValue)) {
            callback('Invalid regex syntax — check your pattern')
            return
          }
        }
        callback()
      },
    },
  ]

  return (
    <Modal
      visible={visible}
      title={
        <span>
          <Icon type={isEdit ? 'edit' : 'plus-circle'} style={{ marginRight: 8, color: '#1890ff' }} />
          {isEdit ? 'Edit CI RuleConfig' : 'New CI RuleConfig'}
        </span>
      }
      width={720}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={submitting}>Cancel</Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleOk}>Save</Button>,
      ]}
    >
      <Form layout="vertical">
        {/* Row 1: Category + Value */}
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Category">
              {getFieldDecorator('category', {
                initialValue: editingRecord ? editingRecord.category : undefined,
                rules: [{ required: true, message: 'Please select a category' }],
              })(
                <Select
                  placeholder="Select category"
                  style={{ width: '100%' }}
                  onChange={handleCategoryChange}
                >
                  {RULE_CONFIG_CATEGORIES.map((category) => {
                    return <Option key={category.value} value={category.value}>{category.label}</Option>
                  })}
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
                    <Tooltip title="Must be a valid JavaScript regular expression, e.g. /^[a-z]+$/i">
                      <Icon type="question-circle" style={{ marginLeft: 6, color: '#bfbfbf', fontSize: 12 }} />
                    </Tooltip>
                  )}
                </span>
              }
              extra={
                isValidationRule
                  ? <span style={{ fontSize: 11, color: '#bfbfbf' }}>Format: <code>/pattern/flags</code></span>
                  : null
              }
            >
              {getFieldDecorator('value', {
                initialValue: editingRecord ? editingRecord.value : undefined,
                rules: valueRules,
              })(
                <Input
                  placeholder={isValidationRule ? '/^[a-zA-Z0-9]+$/i' : 'e.g. connected_to'}
                  onChange={handleValueChange}
                />
              )}
            </Form.Item>
          </Col>
        </Row>

        {/* Regex live test (Validation Rule only) */}
        {isValidationRule && (
          <Row gutter={24} style={{ marginBottom: 4 }}>
            <Col span={24}>
              <Form.Item
                label={
                  <span style={{ fontWeight: 400, color: '#595959' }}>
                    <Icon type="experiment" style={{ marginRight: 5, color: '#1890ff' }} />
                    Test regex
                    <span style={{ fontSize: 11, color: '#bfbfbf', marginLeft: 8 }}>
                      Type a sample value to verify the pattern
                    </span>
                  </span>
                }
                style={{ marginBottom: 0 }}
              >
                <Input
                  value={testInput}
                  onChange={handleTestInput}
                  placeholder="e.g. user@example.com"
                  suffix={testIcon}
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

        {/* Row 2: Display Name + Description */}
        <Row gutter={24} style={{ marginTop: isValidationRule ? 12 : 0 }}>
          <Col span={12}>
            <Form.Item
              label="Display Name"
              extra={<span style={{ fontSize: 11, color: '#bfbfbf' }}>Max 200 characters</span>}
            >
              {getFieldDecorator('name', {
                initialValue: editingRecord ? editingRecord.name : undefined,
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
            <Form.Item
              label="Description"
              extra={<span style={{ fontSize: 11, color: '#bfbfbf' }}>Max 200 characters</span>}
            >
              {getFieldDecorator('description', {
                initialValue: editingRecord ? (editingRecord.description || '') : undefined,
                rules: [{ max: 200, message: 'Max 200 characters' }],
              })(
                <TextArea rows={3} placeholder="Describe this config..." maxLength={200} />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

const CIConfigFormModal = Form.create({ name: 'ci_config_form' })(CIConfigFormModalInner)

export default CIConfigFormModal
