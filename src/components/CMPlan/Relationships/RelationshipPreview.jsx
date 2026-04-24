import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Empty, Tag } from 'antd'
import { getRelTypeLabel } from '../../../utils/cmplan/bulkRelationshipUtils'

const ARROW = '→'

const countDuplicates = (items) => {
  let count = 0
  items.forEach((item) => {
    if (item.isDuplicate) count += 1
  })
  return count
}

const buildRowKey = (item) =>
  (item.ruleId || 'rule') + ':' + item.sourceId + ':' + item.targetId

const buildRowClassName = (index, isDuplicate) => {
  const classes = ['bulk-rel-preview-row']
  if (index % 2 !== 0) classes.push('bulk-rel-preview-row--alt')
  if (isDuplicate) classes.push('bulk-rel-preview-row--duplicate')
  return classes.join(' ')
}

const RelationshipPreview = ({ previewItems, totalCount, relTypeOptions }) => {
  const duplicateCount = useMemo(() => countDuplicates(previewItems), [previewItems])

  return (
    <div className="bulk-rel-preview-section">
      <div className="bulk-rel-preview-header">
        <span className="bulk-rel-preview-title">PREVIEW</span>
        <span className="bulk-rel-preview-count">
          {totalCount} new relationship{totalCount === 1 ? '' : 's'} to create
          {duplicateCount > 0 && (
            <span style={{ color: '#faad14', marginLeft: 8 }}>
              ({duplicateCount} already exist)
            </span>
          )}
        </span>
      </div>

      <div className="bulk-rel-preview-list">
        {previewItems.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Select source CIs, target CIs, and at least one rule to preview"
            style={{ margin: '30px 0' }}
          />
        ) : (
          <div className="bulk-rel-preview-grid">
            {previewItems.map((item, index) => {
              const relTypeLabel = getRelTypeLabel(item.relationshipType, relTypeOptions)
              return (
                <div key={buildRowKey(item)} className={buildRowClassName(index, item.isDuplicate)}>
                  <Tag className="bulk-rel-tag-source">{item.sourceName}</Tag>
                  <span className="bulk-rel-preview-arrow">{ARROW}</span>
                  <Tag className="bulk-rel-tag-type">{relTypeLabel}</Tag>
                  <span className="bulk-rel-preview-arrow">{ARROW}</span>
                  <Tag className="bulk-rel-tag-target">{item.targetName}</Tag>
                  {item.isDuplicate && (
                    <Tag color="red" style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>
                      Exists
                    </Tag>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

RelationshipPreview.propTypes = {
  previewItems: PropTypes.arrayOf(
    PropTypes.shape({
      sourceId: PropTypes.string,
      targetId: PropTypes.string,
      relationshipType: PropTypes.string.isRequired,
      sourceName: PropTypes.string.isRequired,
      targetName: PropTypes.string.isRequired,
      isDuplicate: PropTypes.bool.isRequired,
      ruleId: PropTypes.string,
    })
  ).isRequired,
  totalCount: PropTypes.number.isRequired,
  relTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
}

RelationshipPreview.defaultProps = {
  relTypeOptions: [],
}

export default RelationshipPreview