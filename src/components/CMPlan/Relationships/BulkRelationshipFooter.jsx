import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'antd'

const pluralSuffix = (count) => (count === 1 ? '' : 's')

const BulkRelationshipFooter = ({
  summaryParts,
  duplicateCount,
  onReset,
  onApply,
  applyDisabled,
  submitting,
}) => {
  const { srcCount, tgtCount, ruleCount, total } = summaryParts

  return (
    <div className="bulk-rel-footer">
      <div className="bulk-rel-footer-summary">
        <span>
          <strong>{srcCount}</strong> source CI{pluralSuffix(srcCount)}
          {' \u00D7 '}
          <strong>{tgtCount}</strong> target CI{pluralSuffix(tgtCount)}
          {' \u00D7 '}
          <strong>{ruleCount}</strong> rule{pluralSuffix(ruleCount)}
          {' = '}
          <strong>{total}</strong> relationship{pluralSuffix(total)}
        </span>
        {duplicateCount > 0 && (
          <span style={{ color: '#faad14', marginLeft: 12 }}>
            ({duplicateCount} existing will be skipped)
          </span>
        )}
      </div>
      <div className="bulk-rel-footer-actions">
        <Button
          icon="reload"
          onClick={onReset}
          style={{ marginRight: 8, display: 'inline-flex', alignItems: 'center' }}
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={onApply}
          loading={submitting}
          disabled={applyDisabled}
          className="bulk-rel-apply-btn"
          style={{ display: 'inline-flex', alignItems: 'center' }}
        >
          Apply Relationships {'\u2192'}
        </Button>
      </div>
    </div>
  )
}

BulkRelationshipFooter.propTypes = {
  summaryParts: PropTypes.shape({
    srcCount: PropTypes.number.isRequired,
    tgtCount: PropTypes.number.isRequired,
    ruleCount: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
  duplicateCount: PropTypes.number.isRequired,
  onReset: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  applyDisabled: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
}

export default BulkRelationshipFooter
