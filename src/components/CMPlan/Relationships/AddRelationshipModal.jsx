import React from 'react'
import { Modal, Form, Select, Input, Icon, Tag, DatePicker } from 'antd'
import { RELATIONSHIP_TYPES } from '../../../utils/cmplan/cmplanConstants'
import moment from 'moment'

const { Option } = Select
const { TextArea } = Input

/**
 * Modal form for adding a directed relationship between two CIs.
 *
 * Props:
 *  - visible: bool
 *  - sourceCI: { id, name, classIcon?, classColor? }
 *  - allCIs: array of all CIs (for target selection)
 *  - submitting: bool
 *  - onSubmit({ sourceId, targetId, relationshipType, description, expiredDate })
 *  - onClose()
 */
class AddRelationshipModalInner extends React.Component {
  handleOk = () => {
    const { form, onSubmit, sourceCI } = this.props
    form.validateFields((err, values) => {
      if (err) return
      onSubmit({
        sourceId: sourceCI.id,
        targetId: values.targetId,
        relationshipType: values.relationshipType,
        description: values.description || '',
        expiredDate: values.expiredDate ? values.expiredDate.toISOString() : null,
      })
    })
  }

  handleCancel = () => {
    this.props.form.resetFields()
    this.props.onClose()
  }

  render() {
    const { visible, sourceCI, allCIs = [], submitting, form } = this.props
    const { getFieldDecorator } = form

    return (
      <Modal
        visible={visible}
        title={
          <span>
            <Icon type="share-alt" style={{ marginRight: 8, color: '#722ed1' }} />
            Add Relationship
          </span>
        }
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        confirmLoading={submitting}
        okText="Add"
        destroyOnClose
        width={480}
      >
        <Form layout="vertical">
          {/* Source (locked) */}
          <Form.Item label="Source CI (this)">
            <div
              style={{
                padding: '6px 11px',
                background: '#f5f5f5',
                borderRadius: 4,
                border: '1px solid #d9d9d9',
                color: '#595959',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon
                type={sourceCI?.classIcon || 'profile'}
                style={{ color: sourceCI?.classColor || '#1890ff' }}
              />
              <span style={{ fontWeight: 500 }}>{sourceCI?.name}</span>
              <Tag color="blue" style={{ marginLeft: 'auto', marginBottom: 0 }}>
                Source
              </Tag>
            </div>
          </Form.Item>

          {/* Relationship type */}
          <Form.Item label="Relationship Type">
            {getFieldDecorator('relationshipType', {
              rules: [{ required: true, message: 'Please select a relationship type' }],
            })(
              <Select placeholder="Select type...">
                {RELATIONSHIP_TYPES.map((t) => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          {/* Arrow indicator */}
          <div
            style={{
              textAlign: 'center',
              margin: '-4px 0 8px',
              color: '#8c8c8c',
              fontSize: 18,
            }}
          >
            <Icon type="arrow-down" />
          </div>

          {/* Target CI */}
          <Form.Item label="Target CI">
            {getFieldDecorator('targetId', {
              rules: [{ required: true, message: 'Please select the target CI' }],
            })(
              <Select
                showSearch
                placeholder="Search and select target CI..."
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {allCIs
                  .filter((c) => c.id !== sourceCI?.id)
                  .map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>

          {/* Description */}
          <Form.Item label="Description (optional)">
            {getFieldDecorator('description')(
              <TextArea
                rows={2}
                placeholder="Describe this relationship..."
                maxLength={200}
              />
            )}
          </Form.Item>

          {/* Expired Date */}
          <Form.Item label="Expired Date (optional)">
            {getFieldDecorator('expiredDate')(
              <DatePicker
                style={{ width: '100%' }}
                placeholder="No expiry"
                disabledDate={(d) => d && d.isBefore(moment().startOf('day'))}
                format="MM/DD/YYYY"
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

const AddRelationshipModal = Form.create({ name: 'add_relationship_form' })(
  AddRelationshipModalInner
)

export default AddRelationshipModal
