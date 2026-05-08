import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'
import {
  MAX_CI_SELECTION,
  MAX_RELATIONSHIPS_PER_BATCH,
} from '../../../utils/cmplan/bulkRelationshipConstants'

const BulkRelationshipHeader = ({ onBack }) => (
  <div className="bulk-rel-page-header">
    <Button
      shape="circle"
      icon="arrow-left"
      onClick={onBack}
      style={{
        marginRight: 12,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
    <div>
      <h2 className="bulk-rel-page-title">Bulk Add Relationships</h2>
      <p className="bulk-rel-page-subtitle">
        Pick a source and target CI Type, select up to <strong>{MAX_CI_SELECTION}</strong> CIs
        from each side, then add relationship rules to apply.
        {' '}Maximum <strong>{MAX_RELATIONSHIPS_PER_BATCH}</strong> relationships can be created per batch.
      </p>
    </div>
  </div>
)

BulkRelationshipHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
}

export default BulkRelationshipHeader
