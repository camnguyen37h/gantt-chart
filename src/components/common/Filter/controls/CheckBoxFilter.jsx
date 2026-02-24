import { Checkbox } from 'antd'
import React from 'react'
import styled from 'styled-components'

const StyledCheckBox = styled(Checkbox)`
  /* background-color: #fff;
  border: 1px solid #d9d9d9;
  border-top-width: 1.02px;
  border-radius: 4px;
  outline: none;
  padding: 3px !important;
  width: 100%; */
`
function CheckBoxFilter({ onChange, controlProps, value, defaultValue }) {
  const handleChangeValue = value => {
    onChange(value.target.checked)
  }
  return (
    <div>
      <StyledCheckBox
        checked={value}
        defaultChecked-={defaultValue}
        value={value}
        onChange={value => handleChangeValue(value)}
        {...controlProps}>
        Only show the latest sendings
      </StyledCheckBox>
    </div>
  )
}

export default CheckBoxFilter
