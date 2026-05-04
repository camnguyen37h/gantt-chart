import React from 'react'
import PropTypes from 'prop-types'
import { Tag } from 'antd'

const SELECTED_TAG_STYLE = {
  marginBottom: 4,
  background: '#deebff',
  borderColor: 'transparent',
  color: '#0647a6',
}

const SelectedCITagList = ({ selectedCIs, onRemove }) => {
  if (selectedCIs.length === 0) return null
  return (
    <div className="bulk-rel-panel-tags">
      {selectedCIs.map((ci) => (
        <Tag
          key={ci.id}
          closable
          onClose={() => onRemove(ci.id)}
          style={SELECTED_TAG_STYLE}
        >
          {ci.name}
        </Tag>
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
