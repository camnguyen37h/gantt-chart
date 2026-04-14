import React from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Divider,
  Button,
  Icon,
  Alert,
  Row,
  Col,
} from 'antd'
import { ATTR_TYPES } from '../../../utils/cmplan/cmplanConstants'

const { Option } = Select
const { TextArea } = Input

/**
 * Modal for creating or editing an Attribute Definition.
 * Uses AntD v3 Form.create() pattern passed via wrappedComponentRef.
 */
class AttributeFormModalInner extends React.Component {
  state = {
    optionInput: '',
    options: [],
  }

  componentDidUpdate(prevProps) {
    const { visible, editingRecord, form } = this.props
    if (visible && !prevProps.visible) {
      if (editingRecord) {
        const { options, ...rest } = editingRecord
        this.setState({ options: options || [] })
        form.setFieldsValue({
          name: rest.name,
          label: rest.label,
          type: rest.type,
          isRequired: rest.isRequired,
          defaultValue: rest.defaultValue || '',
          placeholder: rest.placeholder || '',
          description: rest.description || '',
          sortOrder: rest.sortOrder,
        })
      } else {
        this.setState({ options: [] })
        form.resetFields()
      }
    }
  }

  handleAddOption = () => {
    const { optionInput } = this.state
    if (!optionInput.trim()) return
    const newOption = {
      label: optionInput.trim(),
      value: optionInput.trim().toLowerCase().replace(/\s+/g, '_'),
    }
    this.setState((prev) => ({
      options: [...prev.options, newOption],
      optionInput: '',
    }))
  }

  handleRemoveOption = (value) => {
    this.setState((prev) => ({
      options: prev.options.filter((o) => o.value !== value),
    }))
  }

  handleSubmit = () => {
    const { form, onSubmit, editingRecord, ciClassId } = this.props
    const { options } = this.state
    form.validateFields((err, values) => {
      if (err) return
      const hasOptions = ['select', 'multiselect'].includes(values.type)
      onSubmit({
        ...values,
        ciClassId: ciClassId || null,
        options: hasOptions ? options : null,
        ...(editingRecord ? { id: editingRecord.id } : {}),
      })
    })
  }

  render() {
    const {
      visible,
      onCancel,
      editingRecord,
      form,
      submitting,
      ciClassLabel,
    } = this.props
    const { getFieldDecorator, getFieldValue } = form
    const { options, optionInput } = this.state
    const isEditing = Boolean(editingRecord)
    const currentType = getFieldValue('type')
    const showOptions = ['select', 'multiselect'].includes(currentType)

    return (
      <Modal
        visible={visible}
        title={
          <span>
            <Icon
              type={isEditing ? 'edit' : 'plus-circle'}
              style={{ marginRight: 8, color: '#1890ff' }}
            />
            {isEditing ? 'Edit Attribute Definition' : 'New Attribute Definition'}
            {ciClassLabel && (
              <span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>
                — {ciClassLabel}
              </span>
            )}
          </span>
        }
        width={640}
        onCancel={onCancel}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={this.handleSubmit}
          >
            {isEditing ? 'Save Changes' : 'Create Attribute'}
          </Button>,
        ]}
      >
        <Form layout="vertical" colon={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Attribute Name (key)"
                extra="Machine-readable key. Used in CI JSON. No spaces."
              >
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: 'Attribute name is required' },
                    {
                      pattern: /^[a-z][a-z0-9_]*$/,
                      message: 'Lowercase letters, numbers, underscores only',
                    },
                  ],
                })(
                  <Input
                    prefix={<Icon type="key" style={{ color: '#bfbfbf' }} />}
                    placeholder="e.g. cpu_cores"
                    disabled={isEditing}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Display Label">
                {getFieldDecorator('label', {
                  rules: [{ required: true, message: 'Display label is required' }],
                })(
                  <Input
                    prefix={<Icon type="font-size" style={{ color: '#bfbfbf' }} />}
                    placeholder="e.g. CPU Cores"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Attribute Type">
                {getFieldDecorator('type', {
                  rules: [{ required: true, message: 'Please select a type' }],
                })(
                  <Select placeholder="Select type" showSearch>
                    {ATTR_TYPES.map(({ value, label, icon }) => (
                      <Option key={value} value={value}>
                        <Icon type={icon} style={{ marginRight: 6 }} />
                        {label}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Sort Order">
                {getFieldDecorator('sortOrder', {
                  initialValue: 99,
                  rules: [{ required: true }],
                })(<InputNumber min={1} max={999} style={{ width: '100%' }} />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Required">
                {getFieldDecorator('isRequired', {
                  valuePropName: 'checked',
                  initialValue: false,
                })(<Switch checkedChildren="Yes" unCheckedChildren="No" />)}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Placeholder Text">
                {getFieldDecorator('placeholder')(
                  <Input placeholder="e.g. Enter value..." />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Default Value">
                {getFieldDecorator('defaultValue')(
                  <Input placeholder="Optional default value" />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Helper / Description">
            {getFieldDecorator('description')(
              <TextArea
                rows={2}
                placeholder="Brief description shown below the field in forms"
              />
            )}
          </Form.Item>

          {showOptions && (
            <>
              <Divider orientation="left" style={{ fontSize: 13 }}>
                <Icon type="unordered-list" style={{ marginRight: 4 }} />
                Select Options
              </Divider>

              {options.length === 0 && (
                <Alert
                  type="warning"
                  message="No options defined yet. Add at least one option below."
                  showIcon
                  style={{ marginBottom: 12 }}
                />
              )}

              <div style={{ marginBottom: 10 }}>
                {options.map((opt) => (
                  <div
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      marginBottom: 4,
                      background: '#fafafa',
                      border: '1px solid #d9d9d9',
                      borderRadius: 4,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 500 }}>{opt.label}</span>
                      <code
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          color: '#8c8c8c',
                          background: '#f0f0f0',
                          padding: '1px 4px',
                          borderRadius: 2,
                        }}
                      >
                        {opt.value}
                      </code>
                    </div>
                    <Icon
                      type="close-circle"
                      style={{ color: '#f5222d', cursor: 'pointer' }}
                      onClick={() => this.handleRemoveOption(opt.value)}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  placeholder="Add option label (e.g. Production)"
                  value={optionInput}
                  onChange={(e) => this.setState({ optionInput: e.target.value })}
                  onPressEnter={this.handleAddOption}
                />
                <Button onClick={this.handleAddOption} icon="plus">
                  Add
                </Button>
              </div>
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                Press Enter or click Add. Value key is auto-generated from label.
              </div>
            </>
          )}
        </Form>
      </Modal>
    )
  }
}

const AttributeFormModal = Form.create({ name: 'attribute_form' })(
  AttributeFormModalInner
)

export default AttributeFormModal
