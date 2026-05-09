import React from 'react'
import PropTypes from 'prop-types'
import { Tag, Tooltip } from 'antd'

const TAG_MAX_WIDTH = 160

const SELECTED_TAG_STYLE = {
  marginBottom: 4,
  background: '#deebff',
  borderColor: 'transparent',
  color: '#0647a6',
  maxWidth: TAG_MAX_WIDTH,
  display: 'inline-flex',
  alignItems: 'center',
}

const TAG_LABEL_STYLE = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
}

const SelectedCITagList = ({ selectedCIs, onRemove }) => {
  if (selectedCIs.length === 0) return null
  return (
    <div className="bulk-rel-panel-tags">
      {selectedCIs.map((ci) => (
        <Tooltip key={ci.id} title={ci.name} placement="top">
          <Tag
            closable
            onClose={() => onRemove(ci.id)}
            style={SELECTED_TAG_STYLE}
          >
            <span style={TAG_LABEL_STYLE}>{ci.name}</span>
          </Tag>
        </Tooltip>
      ))}
    </div>
  )
}

SelectedCITagList.propTypes = {
  selectedCIs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
}

export default React.memo(SelectedCITagList)
