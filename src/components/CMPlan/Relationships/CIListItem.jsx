import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Checkbox, Icon } from 'antd'
import EnvironmentTag from './EnvironmentTag'

const ICON_TYPE = 'profile'
const ICON_STYLE = { color: '#0647a6', fontSize: 16, marginRight: 8 }
const CHECKBOX_STYLE = { marginRight: 10 }

const CIListItem = ({ ci, ciTypeLabel, isSelected, disabled, onToggle }) => {
  const handleClick = useCallback(() => { if (!disabled) onToggle(ci.id) }, [ci.id, disabled, onToggle])
  const className =
    'bulk-rel-panel-item' +
    (isSelected ? ' bulk-rel-panel-item--selected' : '') +
    (disabled ? ' bulk-rel-panel-item--disabled' : '')

  return (
    <div className={className} onClick={handleClick}>
      <Checkbox checked={isSelected} disabled={disabled} style={CHECKBOX_STYLE} />
      <Icon type={ICON_TYPE} style={ICON_STYLE} />
      <div className="bulk-rel-panel-item-info">
        <span className="bulk-rel-panel-item-name">{ci.name}</span>
        <span className="bulk-rel-panel-item-class">{ciTypeLabel}</span>
      </div>
      <EnvironmentTag environment={ci.environment} />
    </div>
  )
}

CIListItem.propTypes = {
  ci: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    environment: PropTypes.string,
  }).isRequired,
  ciTypeLabel: PropTypes.string,
  isSelected: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
}

CIListItem.defaultProps = { ciTypeLabel: '', disabled: false }

export default React.memo(CIListItem)
