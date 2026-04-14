import React, { Component } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Icon,
  Row,
  Col,
  Switch,
  InputNumber,
  Tooltip,
} from 'antd'

const { Option } = Select
const { TextArea } = Input

// Available AntD v3 icon names for CI classes
const ICON_OPTIONS = [
  { value: 'hdd',         label: 'HDD / Server' },
  { value: 'database',    label: 'Database' },
  { value: 'appstore',    label: 'Appstore / App' },
  { value: 'cluster',     label: 'Cluster / Network' },
  { value: 'cloud',       label: 'Cloud' },
  { value: 'desktop',     label: 'Desktop / VM' },
  { value: 'api',         label: 'API' },
  { value: 'save',        label: 'Storage' },
  { value: 'laptop',      label: 'Laptop' },
  { value: 'mobile',      label: 'Mobile' },
  { value: 'wifi',        label: 'Wi-Fi' },
  { value: 'global',      label: 'Global / Web' },
  { value: 'mail',        label: 'Mail / Email' },
  { value: 'printer',     label: 'Printer' },
  { value: 'usb',         label: 'USB / Device' },
  { value: 'container',   label: 'Container' },
  { value: 'deployment-unit', label: 'Deployment' },
  { value: 'code',        label: 'Code / Script' },
  { value: 'lock',        label: 'Security' },
  { value: 'audit',       label: 'Audit / Compliance' },
  { value: 'tool',        label: 'Tool' },
  { value: 'experiment',  label: 'Lab / Test' },
  { value: 'monitor',     label: 'Monitor' },
  { value: 'fund',        label: 'Finance / Cost' },
  { value: 'team',        label: 'Team / People' },
]

const COLOR_PRESETS = [
  '#1890ff', '#13c2c2', '#722ed1', '#52c41a',
  '#fa8c16', '#f5222d', '#eb2f96', '#a0d911',
  '#096dd9', '#595959', '#faad14', '#2f54eb',
]

// Converts display label → slug (lowercase, spaces → underscores, strip special chars)
function labelToSlug(label = '') {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

class CIClassFormModalInner extends Component {
  handleSubmit = (e) => {
    e.preventDefault()
    const { form, onSubmit } = this.props
    form.validateFields((err, values) => {
      if (err) return
      onSubmit(values)
    })
  }

  handleLabelChange = (e) => {
    const { form, editingRecord } = this.props
    // Only auto-fill name if this is a new record
    if (!editingRecord) {
      form.setFieldsValue({ name: labelToSlug(e.target.value) })
    }
  }

  render() {
    const { form, visible, onCancel, submitting, editingRecord } = this.props
    const { getFieldDecorator, getFieldValue } = form
    const isEdit = !!editingRecord
    const previewIcon = getFieldValue('icon') || 'appstore'
    const previewColor = getFieldValue('color') || '#1890ff'

    return (
      <Modal
        title={
          <span>
            <Icon type={previewIcon} style={{ color: previewColor, marginRight: 8 }} />
            {isEdit ? `Edit CI Class: ${editingRecord.label}` : 'New CI Class'}
          </span>
        }
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={onCancel}
        confirmLoading={submitting}
        okText={isEdit ? 'Save Changes' : 'Create Class'}
        destroyOnClose
        width={560}
      >
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item label="Display Label">
                {getFieldDecorator('label', {
                  rules: [
                    { required: true, message: 'Label is required' },
                    { max: 60, message: 'Max 60 characters' },
                  ],
                })(
                  <Input
                    placeholder="e.g. Virtual Machine"
                    onChange={this.handleLabelChange}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                label={
                  <span>
                    Class Key&nbsp;
                    <Tooltip title="Unique slug used internally. Auto-generated from label. Cannot be changed after creation.">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
              >
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: 'Key is required' },
                    {
                      pattern: /^[a-z0-9_]+$/,
                      message: 'Lowercase letters, numbers and underscores only',
                    },
                  ],
                })(
                  <Input
                    placeholder="virtual_machine"
                    disabled={isEdit}
                    style={{ fontFamily: 'monospace' }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Icon">
                {getFieldDecorator('icon', {
                  initialValue: 'appstore',
                  rules: [{ required: true, message: 'Pick an icon' }],
                })(
                  <Select
                    showSearch
                    optionFilterProp="children"
                    placeholder="Select icon"
                  >
                    {ICON_OPTIONS.map(({ value, label }) => (
                      <Option key={value} value={value}>
                        <Icon type={value} style={{ marginRight: 6 }} />
                        {label}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Color">
                {getFieldDecorator('color', {
                  initialValue: '#1890ff',
                  rules: [{ required: true, message: 'Pick a color' }],
                })(
                  <Select placeholder="Select color">
                    {COLOR_PRESETS.map((hex) => (
                      <Option key={hex} value={hex}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 14,
                            height: 14,
                            borderRadius: 2,
                            background: hex,
                            marginRight: 8,
                            verticalAlign: 'middle',
                          }}
                        />
                        {hex}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>

          {/* Live preview */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: '#fafafa',
              borderRadius: 4,
              border: '1px solid #f0f0f0',
              marginBottom: 16,
            }}
          >
            <span style={{ color: '#8c8c8c', fontSize: 12 }}>Preview:</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 10px',
                background: previewColor + '18',
                border: `1px solid ${previewColor}`,
                borderRadius: 4,
                color: previewColor,
                fontWeight: 500,
              }}
            >
              <Icon type={previewIcon} />
              {getFieldValue('label') || 'Class Label'}
            </span>
          </div>

          <Form.Item label="Description">
            {getFieldDecorator('description')(
              <TextArea
                rows={2}
                placeholder="Brief description of this CI class..."
                maxLength={200}
                showCount
              />
            )}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Sort Order">
                {getFieldDecorator('sortOrder', { initialValue: 99 })(
                  <InputNumber min={1} max={999} style={{ width: '100%' }} />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Active">
                {getFieldDecorator('isActive', {
                  valuePropName: 'checked',
                  initialValue: true,
                })(<Switch checkedChildren="Active" unCheckedChildren="Inactive" />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

const CIClassFormModal = Form.create({ name: 'ci_class_form' })(CIClassFormModalInner)
export default CIClassFormModal
