import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Empty, Spin } from 'antd'
import { getRelTypeLabel } from '../../../utils/cmplan/ciTypeRelationshipMappers'
import { pluralSuffix } from '../../../utils/strings'
import RelationshipPreviewRow from './RelationshipPreviewRow'
import { buildRowKey, countDuplicates } from './RelationshipPreview.helpers'

const EMPTY_DESCRIPTION = 'Select source CIs, target CIs, and at least one rule to preview'
const DUPLICATE_HINT_STYLE = { color: '#faad14', marginLeft: 8 }

const RelationshipPreview = ({ previewItems, totalCount, relTypeOptions, loading }) => {
  const duplicateCount = useMemo(() => countDuplicates(previewItems), [previewItems])
  const hasItems = previewItems.length > 0

  return (
    <div className="bulk-rel-preview-section">
      <div className="bulk-rel-preview-header">
        <span className="bulk-rel-preview-title">PREVIEW</span>
        <span className="bulk-rel-preview-count">
          {totalCount} new relationship{pluralSuffix(totalCount)} to create
          {duplicateCount > 0 && (
            <span style={DUPLICATE_HINT_STYLE}>
              ({duplicateCount} already exist)
            </span>
          )}
        </span>
      </div>

      <div className="bulk-rel-preview-list">
        <Spin spinning={loading}>
          {!hasItems ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={EMPTY_DESCRIPTION}
              style={{ margin: '30px 0' }}
            />
          ) : (
            <div className="bulk-rel-preview-grid">
              {previewItems.map((item, index) => (
                <RelationshipPreviewRow
                  key={buildRowKey(item)}
                  item={item}
                  index={index}
                  relTypeLabel={getRelTypeLabel(item.relationshipType, relTypeOptions)}
                />
              ))}
            </div>
          )}
        </Spin>
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
  loading: PropTypes.bool,
  relTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
}

RelationshipPreview.defaultProps = { relTypeOptions: [], loading: false }

export default RelationshipPreview
