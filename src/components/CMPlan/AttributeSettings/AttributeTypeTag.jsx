import React from 'react'
import { Tag, Icon, Tooltip } from 'antd'
import { ATTR_TYPE_ICONS, ATTR_TYPE_LABELS } from '../../../utils/cmplan/cmplanConstants'

const AttributeTypeTag = ({ type, showLabel = true }) => {
  const icon = ATTR_TYPE_ICONS[type] || 'question-circle'
  const label = ATTR_TYPE_LABELS[type] || type

  const colorMap = {
    text: 'blue',
    number: 'purple',
    date: 'cyan',
    datetime: 'geekblue',
    select: 'orange',
    multiselect: 'volcano',
    checkbox: 'green',
    textarea: 'blue',
    url: 'magenta',
    email: 'gold',
    ip_address: 'lime',
  }

  return (
    <Tooltip title={label}>
      <Tag color={colorMap[type] || 'default'} style={{ margin: 0 }}>
        <Icon type={icon} style={{ marginRight: showLabel ? 4 : 0 }} />
        {showLabel && label}
      </Tag>
    </Tooltip>
  )
}

export default AttributeTypeTag
