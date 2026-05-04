import React from 'react'
import PropTypes from 'prop-types'
import { Tag } from 'antd'
import { buildRowClassName } from './RelationshipPreview.helpers'

const ARROW = '→'
const EXISTS_TAG_STYLE = { marginLeft: 'auto', fontSize: 11, fontWeight: 600 }

const RelationshipPreviewRow = ({ item, index, relTypeLabel }) => (
  <div className={buildRowClassName(index, item.isDuplicate)}>
    <Tag className="bulk-rel-tag-source">{item.sourceName}</Tag>
    <span className="bulk-rel-preview-arrow">{ARROW}</span>
    <Tag className="bulk-rel-tag-type">{relTypeLabel}</Tag>
    <span className="bulk-rel-preview-arrow">{ARROW}</span>
    <Tag className="bulk-rel-tag-target">{item.targetName}</Tag>
    {item.isDuplicate && (
      <Tag color="red" style={EXISTS_TAG_STYLE}>Exists</Tag>
    )}
  </div>
)

RelationshipPreviewRow.propTypes = {
  item: PropTypes.shape({
    sourceName: PropTypes.string.isRequired,
    targetName: PropTypes.string.isRequired,
    isDuplicate: PropTypes.bool.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  relTypeLabel: PropTypes.string.isRequired,
}

export default React.memo(RelationshipPreviewRow)
