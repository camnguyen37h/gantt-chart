import { DateFormat } from '../../../../lib/constants/DateFormat'
import { Tag, DatePicker } from 'antd'
import { FOOTER_CONFIG } from './constants'
import { Fragment, useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledDatePicker = styled(DatePicker)``

const DatePickerFilter = ({
  onChange,
  controlProps,
  value,
  defaultValue,
}) => {
  const handleChangeDate = async value => {
    onChange(value)
  }

  return (
    <StyledDatePicker
      format={DateFormat.DATE_FORWARD_SLASH}
      placeholder="Select Start date"
      value={value}
      defaultValue={defaultValue}
      onChange={value => handleChangeDate(value)}
      className="date-form-picker"
      dropdownClassName="dropdown-date-picker"
      {...controlProps}
    />
  )
}

DatePickerFilter.defaultProps = {
  onChange: () => {},
  controlProps: {},
}

export default DatePickerFilter
