import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Tag, Empty } from 'antd'
import { RELATIONSHIP_TYPE_COLORS } from '../../../utils/cmplan/bulkRelationshipConstants'
import { getRelTypeLabel } from '../../../utils/cmplan/bulkRelationshipUtils'

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildRowClassName = (index, isDuplicate) => {
  let className = 'bulk-rel-preview-row'
  if (index % 2 !== 0) className += ' bulk-rel-preview-row--alt'
  if (isDuplicate) className += ' bulk-rel-preview-row--duplicate'
  return className
}

// ── Component ────────────────────────────────────────────────────────────────

const RelationshipPreview = ({
  previewItems,
  totalCount,
}) => {
  const duplicateCount = useMemo(
    () => previewItems.filter((item) => item.isDuplicate).length,
    [previewItems]
  )

  return (
    <div className="bulk-rel-preview-section">
      <div className="bulk-rel-preview-header">
        <span className="bulk-rel-preview-title">PREVIEW</span>
        <span className="bulk-rel-preview-count">
          {totalCount} new relationship{totalCount !== 1 ? 's' : ''} to create
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
              const typeColor = RELATIONSHIP_TYPE_COLORS[item.relationshipType] || '#1890ff'
              return (
                <div key={index} className={buildRowClassName(index, item.isDuplicate)}>
                  <Tag className="bulk-rel-tag-source">{item.sourceName}</Tag>
                  <span className="bulk-rel-preview-arrow">→</span>
                  <Tag color={typeColor} className="bulk-rel-tag-type">{getRelTypeLabel(item.relationshipType)}</Tag>
                  <span className="bulk-rel-preview-arrow">→</span>
                  <Tag className="bulk-rel-tag-target">{item.targetName}</Tag>
                  {item.isDuplicate && (
                    <Tag color="red" style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>Exists</Tag>
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
}

export default RelationshipPreview
