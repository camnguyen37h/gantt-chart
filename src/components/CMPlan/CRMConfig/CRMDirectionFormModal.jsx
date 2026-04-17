import React from 'react'
import { Modal, Form, Select, Button, Icon } from 'antd'
import {
  CRM_SOURCE_CI_TYPES,
  CRM_DESTINATION_CI_TYPES,
  CRM_JIRA_TYPES,
} from '../../../utils/cmplan/cmplanConstants'

const { Option } = Select

const CRMDirectionFormModalInner = ({ form, visible, editingRecord, submitting, onSubmit, onCancel }) => {
  const { getFieldDecorator, validateFields } = form
  const isEdit = !!editingRecord

  const handleOk = () => {
    validateFields((error, values) => {
      if (error) return
      onSubmit(values)
    })
  }

  return (
    <Modal
      visible={visible}
      title={
        <span>
          <Icon type={isEdit ? 'edit' : 'plus-circle'} style={{ marginRight: 8, color: '#1890ff' }} />
          {isEdit ? 'Edit Direction' : 'Create Direction'}
        </span>
      }
      width={520}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={submitting}>Cancel</Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleOk}>Save</Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Choose Source CI Type">
          {getFieldDecorator('sourceCIType', {
            initialValue: editingRecord ? editingRecord.sourceCIType : undefined,
            rules: [{ required: true, message: 'Please select a source CI type' }],
          })(
            <Select placeholder="Select source CI type" style={{ width: '100%' }}>
              {CRM_SOURCE_CI_TYPES.map((ciType) => (
                <Option key={ciType.value} value={ciType.value}>{ciType.label}</Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item label="Choose Destination CI Type">
          {getFieldDecorator('destinationCIType', {
            initialValue: editingRecord ? editingRecord.destinationCIType : undefined,
            rules: [{ required: true, message: 'Please select a destination CI type' }],
          })(
            <Select placeholder="Select destination CI type" style={{ width: '100%' }}>
              {CRM_DESTINATION_CI_TYPES.map((ciType) => (
                <Option key={ciType.value} value={ciType.value}>{ciType.label}</Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item label="Choose Jira ticket type">
          {getFieldDecorator('jiraType', {
            initialValue: editingRecord ? editingRecord.jiraType : undefined,
            rules: [{ required: true, message: 'Please select a Jira ticket type' }],
          })(
            <Select placeholder="Select Jira ticket type" style={{ width: '100%' }}>
              {CRM_JIRA_TYPES.map((jiraType) => (
                <Option key={jiraType.value} value={jiraType.value}>{jiraType.label}</Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}

const CRMDirectionFormModal = Form.create({ name: 'crm_direction_form' })(CRMDirectionFormModalInner)

export default CRMDirectionFormModal
