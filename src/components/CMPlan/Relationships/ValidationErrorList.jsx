import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'

const WARNING_CLASS = 'bulk-rel-warning bulk-rel-warning--error'
const ICON_STYLE = { marginRight: 8 }
const LIST_STYLE = { margin: '6px 0 0 18px', padding: 0 }

const ValidationErrorList = ({ errors }) => {
  if (!errors || errors.length === 0) return null
  return (
    <div className={WARNING_CLASS}>
      <Icon type="exclamation-circle" style={ICON_STYLE} />
      <div>
        <strong>Please fix the following:</strong>
        <ul style={LIST_STYLE}>
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

export default ValidationErrorList
