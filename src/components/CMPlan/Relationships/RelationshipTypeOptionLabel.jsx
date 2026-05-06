import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'antd'

const DISABLED_LABEL_STYLE = { color: '#bfbfbf' }

const RelationshipTypeOptionLabel = ({ option, disabledReason }) => {
  const labelStyle = disabledReason ? DISABLED_LABEL_STYLE : undefined
  const labelNode = <span style={labelStyle}>{option.label}</span>
  if (!disabledReason) return labelNode
  return (
    <Tooltip title={disabledReason} placement="right">
      {labelNode}
    </Tooltip>
  )
}

RelationshipTypeOptionLabel.propTypes = {
  option: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  disabledReason: PropTypes.string,
}

RelationshipTypeOptionLabel.defaultProps = { disabledReason: null }

export default React.memo(RelationshipTypeOptionLabel)
