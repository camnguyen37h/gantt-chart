import React, { useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Icon,
  Tag,
} from 'antd'
import { GROUP_TYPES } from '../../../utils/cmplan/cmplanConstants'

const { Option } = Select
const { TextArea } = Input

const COLOR_PRESETS = [
  '#13c2c2', '#1890ff', '#722ed1', '#f5222d',
  '#fa8c16', '#52c41a', '#eb2f96', '#a0d911',
  '#096dd9', '#595959',
]

/**
 * Modal for creating / editing a CI Group.
 * Props: visible, editingRecord, allCIs, submitting, onSubmit, onCancel
 */
class GroupFormModalInner extends React.Component {
  componentDidUpdate(prevProps) {
    const { visible, editingRecord, form } = this.props
    if (visible && !prevProps.visible) {
      if (editingRecord) {
        form.setFieldsValue({
          name: editingRecord.name,
          groupType: editingRecord.groupType,
          owner: editingRecord.owner || '',
          color: editingRecord.color || '#1890ff',
          description: editingRecord.description || '',
          ciIds: editingRecord.ciIds || [],
        })
      } else {
        form.resetFields()
        form.setFieldsValue({ color: '#1890ff' })
      }
    }
    if (!visible && prevProps.visible) {
      form.resetFields()
    }
  }

  handleOk = () => {
    const { form, onSubmit, editingRecord } = this.props
    form.validateFields((err, values) => {
      if (err) return
      onSubmit({ ...(editingRecord ? { id: editingRecord.id } : {}), ...values })
    })
  }

  render() {
    const { visible, editingRecord, allCIs = [], submitting, onCancel, form } = this.props
    const { getFieldDecorator, getFieldValue } = form
    const selectedColor = getFieldValue('color') || '#1890ff'
    const isEdit = !!editingRecord

    return (
      <Modal
        visible={visible}
        title={
          <span>
            <Icon
              type="cluster"
              style={{ marginRight: 8, color: '#722ed1' }}
            />
            {isEdit ? 'Edit Group' : 'Create Group'}
          </span>
        }
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={submitting}
        okText={isEdit ? 'Save Changes' : 'Create'}
        destroyOnClose
        width={620}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            {/* Name */}
            <Col span={16}>
              <Form.Item label="Group Name">
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: 'Group name is required' },
                    { max: 80, message: 'Max 80 characters' },
                  ],
                })(<Input placeholder="e.g. CRM Business Service" maxLength={80} />)}
              </Form.Item>
            </Col>

            {/* Type */}
            <Col span={8}>
              <Form.Item label="Group Type">
                {getFieldDecorator('groupType', {
                  rules: [{ required: true, message: 'Select a type' }],
                })(
                  <Select placeholder="Select type">
                    {GROUP_TYPES.map((t) => (
                      <Option key={t.value} value={t.value}>
                        <Icon
                          type={t.icon}
                          style={{ color: t.color, marginRight: 6 }}
                        />
                        {t.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Owner */}
            <Col span={14}>
              <Form.Item label="Owner">
                {getFieldDecorator('owner')(
                  <Input placeholder="Owner name or team" />
                )}
              </Form.Item>
            </Col>

            {/* Color */}
            <Col span={10}>
              <Form.Item label="Group Color">
                {getFieldDecorator('color')(
                  <Select
                    style={{ width: '100%' }}
                    dropdownMatchSelectWidth={false}
                  >
                    {COLOR_PRESETS.map((c) => (
                      <Option key={c} value={c}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: c,
                            marginRight: 8,
                            verticalAlign: 'middle',
                          }}
                        />
                        {c}
                      </Option>
                    ))}
                  </Select>
                )}
                <div
                  style={{
                    marginTop: 4,
                    width: 24,
                    height: 6,
                    borderRadius: 3,
                    background: selectedColor,
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Description */}
          <Form.Item label="Description">
            {getFieldDecorator('description')(
              <TextArea
                rows={2}
                placeholder="What does this group represent?"
                maxLength={200}
              />
            )}
          </Form.Item>

          {/* CI assignment */}
          <Form.Item
            label={
              <span>
                Assign Configuration Items
                {getFieldValue('ciIds')?.length > 0 && (
                  <Tag
                    color={selectedColor}
                    style={{ marginLeft: 8, fontWeight: 600 }}
                  >
                    {getFieldValue('ciIds').length} selected
                  </Tag>
                )}
              </span>
            }
          >
            {getFieldDecorator('ciIds', { initialValue: [] })(
              <Select
                mode="multiple"
                showSearch
                placeholder="Search and select CIs..."
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                maxTagCount={6}
                maxTagPlaceholder={(omitted) => `+${omitted} more`}
              >
                {allCIs.map((ci) => (
                  <Option key={ci.id} value={ci.id}>
                    {ci.name}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

const GroupFormModal = Form.create({ name: 'group_form' })(GroupFormModalInner)

export default GroupFormModal
