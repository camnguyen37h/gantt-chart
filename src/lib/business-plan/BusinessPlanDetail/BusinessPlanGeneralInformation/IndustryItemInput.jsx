import { InputNumber, Tooltip } from 'antd'
import { useState } from 'react'

function IndustryItemInput({
  title,
  inputValue,
  handleChangeInputValue,
  isEditInput,
  name,
  validation,
  handleRenderTooltip,
  disabled,
  isSubItem,
  masked
}) {
  const [visible, setVisible] = useState(false)
  const handleFormatInput = value => {
    if (masked) return '*****'
    if (value === null) return ''
    if (value === '-') return value
    const res = value.toString().match(/^-{0,1}\d+\.{0,1}\d{0,2}/)
    return res ? res[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
  }

  return (
    <div className="mb-12">
      <div className="industry-item-input">
        <div className="industry-title">
          <span style={isSubItem ? { marginLeft: 16, fontWeight: 400 } : {}}>
            {title}
          </span>
          <span className="required">*</span>
        </div>

        <div className="industry-input">
          {validation[name] && (
            <span className="text-danger text-left d-block">
              Please input required fields
            </span>
          )}
          <Tooltip
            visible={visible && !isEditInput}
            title={handleRenderTooltip()}>
            <InputNumber
              onMouseOver={() => {
                setVisible(true)
              }}
              onMouseLeave={() => {
                setVisible(false)
              }}
              value={inputValue}
              size="small"
              onChange={value => {
                if (!isNaN(value)) handleChangeInputValue(value, name)
              }}
              disabled={disabled || !isEditInput || masked}
              formatter={handleFormatInput}
              className={`${
                validation[name] && 'input-error'
              } industry-input-number`}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default IndustryItemInput
