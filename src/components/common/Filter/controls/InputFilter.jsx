import { Input } from 'antd'
import React from 'react'

function InputFilter({ value, onChange, controlProps, defaultValue }) {
  const handleChangeInput = event => {
    onChange(event.target.value)
  }
  return (
    <div>
      <Input
        placeholder={controlProps.placeholder}
        onChange={handleChangeInput}
        defaultValue={defaultValue}
        value={value}
      />
    </div>
  )
}

export default InputFilter
