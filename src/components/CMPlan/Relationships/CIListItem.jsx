import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Checkbox, Icon, Tag, Tooltip, Typography } from 'antd'
import EnvironmentTag from './EnvironmentTag'

const ICON_TYPE = 'profile'
const ICON_STYLE = { color: '#0647a6', fontSize: 16, marginRight: 8, marginTop: 2 }
const CHECKBOX_STYLE = { marginRight: 10, marginTop: 2 }
const TAG_STYLE = { fontSize: 11, marginBottom: 0 }

const CIListItem = ({ ci, isSelected, disabled, onToggle }) => {
  const handleClick = useCallback(() => { if (!disabled) onToggle(ci.id) }, [ci.id, disabled, onToggle])
  const className =
    'bulk-rel-panel-item' +
    (isSelected ? ' bulk-rel-panel-item--selected' : '') +
    (disabled ? ' bulk-rel-panel-item--disabled' : '')

  const displayName = ci.primaryDetailValue || ci.name

  return (
    <div className={className} onClick={handleClick}>
      <Checkbox checked={isSelected} disabled={disabled} style={CHECKBOX_STYLE} />
      <Icon type={ICON_TYPE} style={ICON_STYLE} />
      <div className="bulk-rel-panel-item-info">
        <Typography.Paragraph
          ellipsis={{ rows: 2, tooltip: displayName }}
          className="bulk-rel-panel-item-name"
        >
          {displayName}
        </Typography.Paragraph>
        <span className="bulk-rel-panel-item-class">
          {(ci.infoDetailValues || []).map((val, idx) => (
            <Tooltip key={idx} title={val} placement="topLeft" mouseEnterDelay={0.5}>
              <Tag style={TAG_STYLE}>{val}</Tag>
            </Tooltip>
          ))}
        </span>
      </div>
      <EnvironmentTag environment={ci.environment} />
    </div>
  )
}

CIListItem.propTypes = {
  ci: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    primaryDetailValue: PropTypes.string,
    infoDetailValues: PropTypes.arrayOf(PropTypes.string),
    environment: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
}

CIListItem.defaultProps = { disabled: false }

export default React.memo(CIListItem)
