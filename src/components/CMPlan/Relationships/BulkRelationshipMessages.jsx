import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'

const WARNING_CLASS = 'bulk-rel-warning bulk-rel-warning--error'

export const InvalidRelTypeWarning = ({ sourceType, targetType }) => (
  <div className={WARNING_CLASS}>
    <Icon type="close-circle" style={{ marginRight: 8 }} />
    One or more rules use a relationship type that is not allowed between
    <strong style={{ margin: '0 4px' }}>{sourceType}</strong>
    and
    <strong style={{ margin: '0 4px' }}>{targetType}</strong>.
    Pick a different type or change the CI Types above.
  </div>
)

InvalidRelTypeWarning.propTypes = {
  sourceType: PropTypes.string,
  targetType: PropTypes.string,
}

InvalidRelTypeWarning.defaultProps = {
  sourceType: undefined,
  targetType: undefined,
}

export const ValidationErrorList = ({ errors }) => {
  if (!errors || errors.length === 0) return null
  return (
    <div className={WARNING_CLASS}>
      <Icon type="exclamation-circle" style={{ marginRight: 8 }} />
      <div>
        <strong>Please fix the following:</strong>
        <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

ValidationErrorList.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string),
}

ValidationErrorList.defaultProps = {
  errors: [],
}
