import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'

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
        Pick a source and target CI Type, then choose the CIs and the relationship rules to apply.
      </p>
    </div>
  </div>
)

BulkRelationshipHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
}

export default BulkRelationshipHeader
