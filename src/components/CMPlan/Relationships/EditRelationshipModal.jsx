import React, { useEffect, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Icon, Tag, Tooltip, DatePicker } from 'antd'
import moment from 'moment'
import { RELATIONSHIP_TYPES } from '../../../utils/cmplan/cmplanConstants'
import { RELATIONSHIP_TYPE_COLORS } from '../../../utils/cmplan/bulkRelationshipConstants'
import useProjectBasicInfo from '../../../hooks/cmplan/useProjectBasicInfo'
import {
  toMoment,
  isOutsideProjectRange,
  buildAppliedDateGuard,
} from '../../../utils/cmplan/ruleDateHelpers'
import './EditRelationshipModal.css'

const DATE_FMT = 'MM/DD/YYYY'

const getRelLabel = (value) => {
  const found = RELATIONSHIP_TYPES.find((t) => t.value === value)
  return found ? found.label : value
}

const LockedField = ({ label, value, tag, tagColor }) => (
  <Form.Item label={label}>
    <Tooltip title="Editing is disabled to preserve data integrity" placement="topRight">
      <div className="ant-input ant-input-disabled edit-rel-locked-field">
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

  const { pStartDate, pEndDate } = useProjectBasicInfo()
  const pStartMoment = useMemo(() => toMoment(pStartDate), [pStartDate])
  const pEndMoment   = useMemo(() => toMoment(pEndDate),   [pEndDate])

  // Snap a typed-in date back to the nearest project boundary.
  // Applied: snap below → pStart, snap above → pEnd.
  // Expired: same boundaries (past/before-apply still caught by validators).
  const snapToRange = useCallback((val, fallbackBelow, fallbackAbove) => {
    if (!val) return val
    if (pStartMoment && val.isBefore(pStartMoment.clone().startOf('day'))) return fallbackBelow ? fallbackBelow.clone() : val
    if (pEndMoment   && val.isAfter(pEndMoment.clone().endOf('day')))     return fallbackAbove ? fallbackAbove.clone() : val
    return val
  }, [pStartMoment, pEndMoment])

  const disabledApplyDate = useMemo(
    () => buildAppliedDateGuard({ pStartMoment, pEndMoment }),
    [pStartMoment, pEndMoment]
  )

  // Expire date: blocks project-range violations + past dates + on/before applyDate.
  const disabledExpireDate = useCallback((current) => {
    if (!current) return false
    if (isOutsideProjectRange(current, pStartMoment, pEndMoment)) return true
    if (current.isBefore(moment().startOf('day'))) return true
    const applyDate = getFieldValue('applyDate')
    if (applyDate && current.isSameOrBefore(applyDate.clone().endOf('day'))) return true
    return false
  }, [pStartMoment, pEndMoment, getFieldValue])

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

  // Disable expire dates that are in the past OR on/before applyDate OR outside project range.
  // Today is allowed (so user can set Expire = today).
  if (!record) return null

  return (
    <Modal
      visible={visible}
      className="edit-rel-modal"
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
      <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} colon={false}>
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
            normalize: (val) => snapToRange(val, pStartMoment, pEndMoment),
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
              disabledDate={disabledApplyDate}
              onChange={() => {
                // Re-validate expire field when apply changes
                if (getFieldValue('expiredDate')) {
                  form.validateFields(['expiredDate'], { force: true })
                }
              }}
            />
          )}
        </Form.Item>

        <Form.Item label="Expire Date">
          {getFieldDecorator('expiredDate', {
            normalize: (val) => snapToRange(val, pStartMoment, pEndMoment),
            rules: [
              { required: true, message: 'Expire Date is required' },
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
              placeholder="Select expire date"
              disabledDate={disabledExpireDate}
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
