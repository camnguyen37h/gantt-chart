import React from 'react'
import PropTypes from 'prop-types'
import { DatePicker } from 'antd'
import { DATE_FORMAT } from '../../../utils/cmplan/ruleDateHelpers'

const FULL_WIDTH_STYLE = { width: '100%' }

const ValidityDateField = ({
  label,
  value,
  onChange,
  onOpenChange,
  disabledDate,
  defaultPickerValue,
  showError,
  errorMessage,
  placeholder,
}) => (
  <div className="bulk-rel-rule-field">
    <span className="bulk-rel-rule-field-label">
      {label}
      <span className="bulk-rel-rule-required">*</span>
    </span>
    <DatePicker
      value={value}
      onChange={onChange}
      onOpenChange={onOpenChange}
      style={FULL_WIDTH_STYLE}
      placeholder={placeholder}
      format={DATE_FORMAT}
      disabledDate={disabledDate}
      defaultPickerValue={defaultPickerValue}
      className={showError ? 'bulk-rel-rule-datepicker--error' : undefined}
    />
    {showError && <span className="bulk-rel-rule-warning">{errorMessage}</span>}
  </div>
)

ValidityDateField.propTypes = {
  label:              PropTypes.string.isRequired,
  value:              PropTypes.object,
  onChange:           PropTypes.func.isRequired,
  onOpenChange:       PropTypes.func.isRequired,
  disabledDate:       PropTypes.func.isRequired,
  defaultPickerValue: PropTypes.object,
  showError:          PropTypes.bool.isRequired,
  errorMessage:       PropTypes.string.isRequired,
  placeholder:        PropTypes.string.isRequired,
}

ValidityDateField.defaultProps = {
  value:              null,
  defaultPickerValue: undefined,
}

export default React.memo(ValidityDateField)
