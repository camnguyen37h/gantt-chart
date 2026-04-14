import React from 'react'
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Checkbox,
} from 'antd'
const { Option } = Select
const { TextArea } = Input

/**
 * Renders dynamic form fields based on attribute definitions.
 * Used inside CIFormModal when a CI class is selected.
 *
 * @param {Object} props
 * @param {Array}  props.attrDefs   - Attribute definitions for the selected class
 * @param {Object} props.form       - AntD Form instance
 * @param {Object} props.initialValues - Existing CI attributes for edit mode
 */
const CIDynamicFields = ({ attrDefs, form, initialValues = {} }) => {
  const { getFieldDecorator } = form

  if (!attrDefs || attrDefs.length === 0) return null

  const renderField = (attr) => {
    const {
      name,
      label,
      type,
      isRequired,
      defaultValue,
      options,
      placeholder,
      description,
    } = attr

    const fieldKey = `attributes.${name}`
    const initialValue = initialValues[name] ?? defaultValue ?? undefined

    const rules = []
    if (isRequired) {
      rules.push({ required: true, message: `${label} is required` })
    }

    let fieldElement

    switch (type) {
      case 'number':
        fieldElement = (
          <InputNumber
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            style={{ width: '100%' }}
          />
        )
        break

      case 'date':
        fieldElement = <DatePicker style={{ width: '100%' }} placeholder={placeholder} />
        break

      case 'datetime':
        fieldElement = (
          <DatePicker showTime style={{ width: '100%' }} placeholder={placeholder} />
        )
        break

      case 'select':
        fieldElement = (
          <Select placeholder={placeholder || `Select ${label.toLowerCase()}`} allowClear>
            {(options || []).map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )
        break

      case 'multiselect':
        fieldElement = (
          <Select
            mode="multiple"
            placeholder={placeholder || `Select ${label.toLowerCase()}`}
            allowClear
          >
            {(options || []).map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )
        break

      case 'checkbox':
        return (
          <Form.Item key={fieldKey} style={{ marginBottom: 16 }}>
            {getFieldDecorator(fieldKey, {
              valuePropName: 'checked',
              initialValue: initialValue === 'true' || initialValue === true,
              rules,
            })(<Checkbox>{label}</Checkbox>)}
            {description && (
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                {description}
              </div>
            )}
          </Form.Item>
        )

      case 'textarea':
        fieldElement = (
          <TextArea
            rows={3}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          />
        )
        break

      case 'url':
        fieldElement = (
          <Input
            prefix="🔗"
            type="url"
            placeholder={placeholder || 'https://...'}
          />
        )
        if (isRequired) {
          rules.push({ type: 'url', message: 'Please enter a valid URL' })
        }
        break

      case 'email':
        fieldElement = (
          <Input
            prefix="✉️"
            type="email"
            placeholder={placeholder || 'user@example.com'}
          />
        )
        if (isRequired) {
          rules.push({ type: 'email', message: 'Please enter a valid email' })
        }
        break

      case 'ip_address':
        fieldElement = (
          <Input
            placeholder={placeholder || '192.168.1.1'}
          />
        )
        rules.push({
          pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
          message: 'Enter a valid IPv4 address',
        })
        break

      case 'text':
      default:
        fieldElement = (
          <Input placeholder={placeholder || `Enter ${label.toLowerCase()}`} />
        )
    }

    return (
      <Form.Item
        key={fieldKey}
        label={label}
        extra={description}
        style={{ marginBottom: 16 }}
      >
        {getFieldDecorator(fieldKey, {
          initialValue,
          rules,
        })(fieldElement)}
      </Form.Item>
    )
  }

  return (
    <div>
      {attrDefs.map((attr) => renderField(attr))}
    </div>
  )
}

export default CIDynamicFields
