import React, { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Divider,
  Alert,
  Icon,
  Button,
} from 'antd'
import { useSelector } from 'react-redux'
import {
  selectCIClasses,
  selectAttrDefsByClassId,
  selectCIRuleConfigs,
} from '../../../store/cmplan'
import CIDynamicFields from './CIDynamicFields'
import {
  CI_STATUS,
  CI_CRITICALITY,
  CI_ENVIRONMENT,
  CI_STATUS_LABELS,
  CI_CRITICALITY_LABELS,
  CI_ENVIRONMENT_LABELS,
} from '../../../utils/cmplan/cmplanConstants'

const { Option } = Select
const { TextArea } = Input

/**
 * Modal form for creating or editing a Configuration Item.
 * Renders dynamic attribute fields based on the selected CI class.
 */
const CIFormModalInner = ({ form, visible, editingRecord, onSubmit, onCancel, submitting }) => {
  const ciClasses = useSelector(selectCIClasses)
  const allRuleConfigs = useSelector(selectCIRuleConfigs)
  const [selectedClassId, setSelectedClassId] = useState(null)

  useEffect(() => {
    if (visible && editingRecord) {
      setSelectedClassId(editingRecord.ciClassId)
    } else if (!visible) {
      setSelectedClassId(null)
    }
  }, [visible, editingRecord])

  const attrDefs = useSelector(selectAttrDefsByClassId(selectedClassId))
  const validationRules = allRuleConfigs.filter((r) => r.category === 'validation_rule')

  const { getFieldDecorator } = form
  const isEditing = Boolean(editingRecord)
  const selectedClass = ciClasses.find((c) => c.id === selectedClassId)

  useEffect(() => {
    if (!visible) return
    if (editingRecord) {
      const { attributes = {}, tags = [], ...rest } = editingRecord
      form.setFieldsValue({
        ciClassId: rest.ciClassId,
        name: rest.name,
        shortDescription: rest.shortDescription || '',
        status: rest.status,
        criticality: rest.criticality,
        owner: rest.owner || '',
        department: rest.department || '',
        location: rest.location || '',
        environment: rest.environment,
        tags,
        ...Object.fromEntries(
          Object.entries(attributes).map(([k, v]) => [`attributes.${k}`, v])
        ),
      })
    } else {
      form.resetFields()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const handleClassChange = (classId) => {
    setSelectedClassId(classId)
    const attrKeys = Object.keys(form.getFieldsValue()).filter((k) => k.startsWith('attributes.'))
    const cleared = Object.fromEntries(attrKeys.map((k) => [k, undefined]))
    form.setFieldsValue(cleared)
  }

  const handleSubmit = () => {
    form.validateFields((err, values) => {
      if (err) return
      const attributes = {}
      const topLevel = {}
      Object.entries(values).forEach(([key, val]) => {
        if (key.startsWith('attributes.')) {
          const attrKey = key.replace('attributes.', '')
          if (val !== undefined && val !== null && val !== '') {
            attributes[attrKey] = val
          }
        } else {
          topLevel[key] = val
        }
      })
      onSubmit({
        ...topLevel,
        attributes,
        ...(editingRecord ? { id: editingRecord.id } : {}),
      })
    })
  }

  return (
      <Modal
        visible={visible}
        title={
          <span>
            <Icon
              type={isEditing ? 'edit' : 'plus-circle'}
              style={{ marginRight: 8, color: '#1890ff' }}
            />
            {isEditing ? 'Edit Configuration Item' : 'New Configuration Item'}
          </span>
        }
        width={780}
        onCancel={onCancel}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
          >
            {isEditing ? 'Save Changes' : 'Create CI'}
          </Button>,
        ]}
        bodyStyle={{ maxHeight: '72vh', overflowY: 'auto' }}
      >
        <Form layout="vertical" colon={false}>
          {/* ── Core Fields ─────────────────────────────────────────────────── */}
          <Divider orientation="left" style={{ fontSize: 13, marginTop: 0 }}>
            <Icon type="info-circle" style={{ marginRight: 4 }} />
            Basic Information
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="CI Class">
                {getFieldDecorator('ciClassId', {
                  rules: [{ required: true, message: 'CI class is required' }],
                })(
                  <Select
                    placeholder="Select class..."
                    onChange={handleClassChange}
                    disabled={isEditing}
                    showSearch
                    optionFilterProp="children"
                  >
                    {ciClasses.map((cls) => (
                      <Option key={cls.id} value={cls.id}>
                        <Icon
                          type={cls.icon}
                          style={{ color: cls.color, marginRight: 6 }}
                        />
                        {cls.label}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="CI Name">
                {getFieldDecorator('name', {
                  rules: [
                    { required: true, message: 'CI name is required' },
                    { max: 300, message: 'Name must be under 300 characters' },
                  ],
                })(
                  <Input
                    prefix={<Icon type="tag" style={{ color: '#bfbfbf' }} />}
                    placeholder="e.g. prod-web-01"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Short Description">
            {getFieldDecorator('shortDescription')(
              <TextArea rows={2} placeholder="Brief description of this CI..." />
            )}
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Status">
                {getFieldDecorator('status', {
                  initialValue: CI_STATUS.ACTIVE,
                  rules: [{ required: true }],
                })(
                  <Select>
                    {Object.entries(CI_STATUS_LABELS).map(([v, l]) => (
                      <Option key={v} value={v}>
                        {l}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Criticality">
                {getFieldDecorator('criticality', {
                  initialValue: CI_CRITICALITY.MEDIUM,
                  rules: [{ required: true }],
                })(
                  <Select>
                    {Object.entries(CI_CRITICALITY_LABELS).map(([v, l]) => (
                      <Option key={v} value={v}>
                        {l}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Environment">
                {getFieldDecorator('environment', {
                  initialValue: CI_ENVIRONMENT.PRODUCTION,
                  rules: [{ required: true }],
                })(
                  <Select>
                    {Object.entries(CI_ENVIRONMENT_LABELS).map(([v, l]) => (
                      <Option key={v} value={v}>
                        {l}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Owner">
                {getFieldDecorator('owner')(
                  <Input
                    prefix={<Icon type="user" style={{ color: '#bfbfbf' }} />}
                    placeholder="Owner name"
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Department">
                {getFieldDecorator('department')(
                  <Input
                    prefix={<Icon type="bank" style={{ color: '#bfbfbf' }} />}
                    placeholder="e.g. Platform Engineering"
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Location">
                {getFieldDecorator('location')(
                  <Input
                    prefix={<Icon type="environment" style={{ color: '#bfbfbf' }} />}
                    placeholder="e.g. DC1 - Rack A3"
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tags">
                {getFieldDecorator('tags', { initialValue: [] })(
                  <Select
                    mode="tags"
                    placeholder="Type and press Enter to add tags"
                    style={{ width: '100%' }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          {/* ── Dynamic Class Attributes ─────────────────────────────────── */}
          {selectedClassId && attrDefs.length > 0 && (
            <>
              <Divider orientation="left" style={{ fontSize: 13 }}>
                <Icon
                  type={(selectedClass && selectedClass.icon) || 'profile'}
                  style={{ marginRight: 4, color: selectedClass && selectedClass.color }}
                />
                {selectedClass && selectedClass.label} Attributes
              </Divider>
              <CIDynamicFields
                attrDefs={attrDefs}
                form={form}
                initialValues={(editingRecord && editingRecord.attributes) || {}}
                validationRules={validationRules}
              />
            </>
          )}

          {selectedClassId && attrDefs.length === 0 && (
            <Alert
              type="info"
              showIcon
              message="No custom attributes defined for this CI class yet."
              description="You can define attributes in the Attribute Settings page."
              style={{ marginTop: 8 }}
            />
          )}
        </Form>
      </Modal>
  )
}

// HoC wrapping for Form.create
const CIFormModal = Form.create({ name: 'ci_form' })(CIFormModalInner)

export default CIFormModal
