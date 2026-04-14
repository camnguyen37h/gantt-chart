import React from 'react'
import { Tag } from 'antd'
import {
  CI_STATUS_LABELS,
  CI_STATUS_COLORS,
} from '../../../utils/cmplan/cmplanConstants'

const CIStatusBadge = ({ status, size = 'default' }) => {
  const label = CI_STATUS_LABELS[status] || status
  const color = CI_STATUS_COLORS[status] || '#bfbfbf'

  if (size === 'sm') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span style={{ color }}>{label}</span>
      </span>
    )
  }

  return <Tag color={color} style={{ fontWeight: 500 }}>{label}</Tag>
}

export default CIStatusBadge
