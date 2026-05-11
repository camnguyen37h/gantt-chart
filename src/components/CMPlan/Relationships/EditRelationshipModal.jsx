import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Icon, Tag, Tooltip, DatePicker } from 'antd'
import moment from 'moment'
import { RELATIONSHIP_TYPES } from '../../../utils/cmplan/cmplanConstants'
import { RELATIONSHIP_TYPE_COLORS } from '../../../utils/cmplan/bulkRelationshipConstants'
import './EditRelationshipModal.css'

const DATE_FMT = 'MM/DD/YYYY'

const getRelLabel = (value) => {
  const found = RELATIONSHIP_TYPES.find((t) => t.value === value)
  return found ? found.label : value
}

const LockedField = ({ label, value, tag, tagColor }) => (
  <Form.Item label={label}>
    <Tooltip title="Editing is disabled to preserve data integrity" placement="topRight">
      <div className="edit-rel-locked-field">
        <span className="edit-rel-locked-field__value">{value || '—'}</span>
        {tag && (
          <Tag color={tagColor || 'blue'} className="edit-rel-locked-field__tag" title={tag}>
            {tag}
          </Tag>
        )}
        <Icon type="lock" className="edit-rel-locked-field__lock-icon" />
      </div>
    </Tooltip>
  </Form.Item>
)

LockedField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  tag: PropTypes.string,
  tagColor: PropTypes.string,
}

LockedField.defaultProps = {
  value: '',
  tag: null,
  tagColor: null,
}

const EditRelationshipModalInner = ({
  form, visible, record, submitting, onSubmit, onClose,
}) => {
  const { getFieldDecorator, validateFields, resetFields, getFieldValue, setFieldsValue } = form

  // Initialize form values whenever the record changes
  useEffect(() => {
    if (visible && record) {
      setFieldsValue({
        applyDate:   record.applyDate ? moment(record.applyDate) : null,
        expiredDate: record.expiredDate ? moment(record.expiredDate) : null,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, record && record.id])

  const handleOk = () => {
    validateFields((err, values) => {
      if (err) return
      onSubmit({
        id: record.id,
        applyDate:   values.applyDate ? values.applyDate.toISOString() : null,
        expiredDate: values.expiredDate ? values.expiredDate.toISOString() : null,
      })
    })
  }

  const handleCancel = () => {
    resetFields()
    onClose()
  }

  // Disable expire dates that are in the past OR on/before applyDate.
  // Today is allowed (so user can set Expire = today).
  const disableExpireBeforeApply = (current) => {
    if (!current) return false
    if (current.isBefore(moment().startOf('day'))) return true
    const applyDate = getFieldValue('applyDate')
    if (applyDate && current.isSameOrBefore(applyDate.clone().endOf('day'))) return true
    return false
  }

  if (!record) return null

  return (
    <Modal
      visible={visible}
      title={
        <span>
          <Icon type="edit" className="edit-rel-modal-title-icon" />
          Edit Relationship
        </span>
      }
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText="Save"
      cancelText="Cancel"
      destroyOnClose
      width={520}
      maskClosable={false}
    >
      <Form layout="vertical">
        <LockedField
          label="Source CI"
          value={record.sourceName}
          tag={record.sourceCIType}
          tagColor="blue"
        />

        <LockedField
          label="Relationship"
          value={getRelLabel(record.relationshipType)}
          tagColor={RELATIONSHIP_TYPE_COLORS[record.relationshipType] || 'purple'}
        />

        <LockedField
          label="Destination CI"
          value={record.targetName}
          tag={record.targetCIType}
          tagColor="geekblue"
        />

        <Form.Item label="Apply Date">
          {getFieldDecorator('applyDate', {
            rules: [
              { required: true, message: 'Apply Date is required' },
              {
                validator: (_, value, cb) => {
                  if (!value) return cb()
                  const expire = getFieldValue('expiredDate')
                  if (expire && value.isSameOrAfter(expire.clone().startOf('day'))) {
                    return cb('Apply Date must be before Expire Date')
                  }
                  return cb()
                },
              },
            ],
          })(
            <DatePicker
              className="edit-rel-datepicker"
              format={DATE_FMT}
              placeholder="Select apply date"
              onChange={() => {
                // Re-validate expire field when apply changes
                if (getFieldValue('expiredDate')) {
                  setTimeout(() => form.validateFields(['expiredDate'], { force: true }), 0)
                }
              }}
            />
          )}
        </Form.Item>

        <Form.Item label="Expire Date" extra="Leave blank if the relationship has no expiry">
          {getFieldDecorator('expiredDate', {
            rules: [
              {
                validator: (_, value, cb) => {
                  if (!value) return cb()
                  if (value.isBefore(moment().startOf('day'))) {
                    return cb('Expire Date cannot be in the past')
                  }
                  const apply = getFieldValue('applyDate')
                  if (apply && value.isSameOrBefore(apply.clone().endOf('day'))) {
                    return cb('Expire Date must be after Apply Date')
                  }
                  return cb()
                },
              },
            ],
          })(
            <DatePicker
              className="edit-rel-datepicker"
              format={DATE_FMT}
              placeholder="No expiry"
              disabledDate={disableExpireBeforeApply}
              allowClear
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}

EditRelationshipModalInner.propTypes = {
  form: PropTypes.shape({
    getFieldDecorator: PropTypes.func.isRequired,
    validateFields:    PropTypes.func.isRequired,
    resetFields:       PropTypes.func.isRequired,
    getFieldValue:     PropTypes.func.isRequired,
    setFieldsValue:    PropTypes.func.isRequired,
  }).isRequired,
  visible:    PropTypes.bool.isRequired,
  record:     PropTypes.object,
  submitting: PropTypes.bool,
  onSubmit:   PropTypes.func.isRequired,
  onClose:    PropTypes.func.isRequired,
}

EditRelationshipModalInner.defaultProps = {
  record:     null,
  submitting: false,
}

const EditRelationshipModal = Form.create({ name: 'edit_relationship_form' })(
  EditRelationshipModalInner
)

EditRelationshipModal.propTypes = {
  visible:    PropTypes.bool.isRequired,
  record:     PropTypes.object,
  submitting: PropTypes.bool,
  onSubmit:   PropTypes.func.isRequired,
  onClose:    PropTypes.func.isRequired,
}

EditRelationshipModal.defaultProps = {
  record:     null,
  submitting: false,
}

export default EditRelationshipModal
