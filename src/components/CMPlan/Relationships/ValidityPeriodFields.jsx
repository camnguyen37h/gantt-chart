import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'
import ValidityDateField from './ValidityDateField'

const APPLIED_ERROR_MESSAGE = 'Applied Date is required.'
const EXPIRED_ERROR_MESSAGE = 'Expired Date is required.'

const ValidityPeriodFields = ({
  appliedMoment,
  expiredMoment,
  appliedDefaultPickerValue,
  expiredDefaultPickerValue,
  disabledAppliedDate,
  disabledExpiredDate,
  onAppliedDateChange,
  onExpiredDateChange,
  onAppliedOpenChange,
  onExpiredOpenChange,
  showAppliedError,
  showExpiredError,
}) => (
  <div className="bulk-rel-rule-validity">
    <ValidityDateField
      label="Applied Date"
      placeholder="Select applied date"
      value={appliedMoment}
      onChange={onAppliedDateChange}
      onOpenChange={onAppliedOpenChange}
      disabledDate={disabledAppliedDate}
      defaultPickerValue={appliedDefaultPickerValue}
      showError={showAppliedError}
      errorMessage={APPLIED_ERROR_MESSAGE}
    />

    <Icon type="arrow-right" className="bulk-rel-rule-validity-arrow" />

    <ValidityDateField
      label="Expired Date"
      placeholder="Select expired date"
      value={expiredMoment}
      onChange={onExpiredDateChange}
      onOpenChange={onExpiredOpenChange}
      disabledDate={disabledExpiredDate}
      defaultPickerValue={expiredDefaultPickerValue}
      showError={showExpiredError}
      errorMessage={EXPIRED_ERROR_MESSAGE}
    />
  </div>
)

ValidityPeriodFields.propTypes = {
  appliedMoment:             PropTypes.object,
  expiredMoment:             PropTypes.object,
  appliedDefaultPickerValue: PropTypes.object,
  expiredDefaultPickerValue: PropTypes.object,
  disabledAppliedDate:       PropTypes.func.isRequired,
  disabledExpiredDate:       PropTypes.func.isRequired,
  onAppliedDateChange:       PropTypes.func.isRequired,
  onExpiredDateChange:       PropTypes.func.isRequired,
  onAppliedOpenChange:       PropTypes.func.isRequired,
  onExpiredOpenChange:       PropTypes.func.isRequired,
  showAppliedError:          PropTypes.bool.isRequired,
  showExpiredError:          PropTypes.bool.isRequired,
}

ValidityPeriodFields.defaultProps = {
  appliedMoment:             null,
  expiredMoment:             null,
  appliedDefaultPickerValue: undefined,
  expiredDefaultPickerValue: undefined,
}

export default React.memo(ValidityPeriodFields)
