import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'

const WARNING_CLASS = 'bulk-rel-warning bulk-rel-warning--error'
const ICON_STYLE = { marginRight: 8 }
const STRONG_STYLE = { margin: '0 4px' }

const InvalidRelTypeWarning = ({ sourceType, targetType }) => (
  <div className={WARNING_CLASS}>
    <Icon type="close-circle" style={ICON_STYLE} />
    One or more rules use a relationship type that is not allowed between
    <strong style={STRONG_STYLE}>{sourceType}</strong>
    and
    <strong style={STRONG_STYLE}>{targetType}</strong>.
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

export default InvalidRelTypeWarning
