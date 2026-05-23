import { DateFormat } from '../../../../lib/constants/DateFormat'
import { Tag, DatePicker } from 'antd'
import { FOOTER_CONFIG } from './constants'
import { Fragment, useState } from 'react'
import styled from 'styled-components'

const StyledDatePicker = styled(DatePicker)`
`

const DatePickerWithFooter = ({
  type,
  onChangeType,
  onChange,
  controlProps,
  value,
  defaultValue

}) => {
  const footerConfig = FOOTER_CONFIG[type || 'default'] || FOOTER_CONFIG.default
  const defaultTypeItem = footerConfig.find(item => item.isDefault)
  const [typeValue, setTypeValue] = useState(
    defaultTypeItem ? defaultTypeItem.value : ''
  )
  // const [value, setValue] = useState()

  const handleChangeType = value => {
    onChangeType(value)
    setTypeValue(value)
  }

  const handleChangeDate = async value => {
    onChange(value)
    // setValue(value)
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
      renderExtraFooter={() => {
        return (
          <Fragment>
            {footerConfig.map(config => (
              <Tag
                key={config.value}
                style={{ marginRight: 5 }}
                color={typeValue === config.value ? '#2db7f5' : 'blue'}
                onClick={() => handleChangeType(config.value)}>
                {config.title}
              </Tag>
            ))}
          </Fragment>
        )
      }}
    />
  )
}

DatePickerWithFooter.defaultProps = {
  type: '',
  onChangeType: () => { },
  onChange: () => { },
  controlProps: {},
}

export default DatePickerWithFooter
