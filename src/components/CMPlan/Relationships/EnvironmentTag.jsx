import React from 'react'
import PropTypes from 'prop-types'
import { Tag } from 'antd'
import { CI_ENVIRONMENT_LABELS } from '../../../utils/cmplan/cmplanConstants'

const TAG_STYLE = {
  marginLeft: 'auto',
  marginBottom: 0,
  fontSize: 11,
  background: '#deebff',
  borderColor: 'transparent',
  color: '#0647a6',
}

const EnvironmentTag = ({ environment }) => {
  const label = CI_ENVIRONMENT_LABELS[environment]
  if (!label) return null
  return <Tag style={TAG_STYLE}>{label}</Tag>
}

EnvironmentTag.propTypes = { environment: PropTypes.string }
EnvironmentTag.defaultProps = { environment: undefined }

export default React.memo(EnvironmentTag)
