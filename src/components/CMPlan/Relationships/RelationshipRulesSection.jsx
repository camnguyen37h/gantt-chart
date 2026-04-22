import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Select, Button, Icon, Tag } from 'antd'
import { RELATIONSHIP_TYPES } from '../../../utils/cmplan/cmplanConstants'
import { DIRECTION_OUT, DIRECTION_IN } from '../../../utils/cmplan/bulkRelationshipConstants'

const { Option } = Select

const RelationshipRuleCard = ({
  rule,
  index,
  targetCIs,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const handleTypeChange = useCallback(
    (value) => {
      onUpdate(rule.id, { relationshipType: value })
    },
    [rule.id, onUpdate]
  )

  const handleDirectionChange = useCallback(
    (direction) => {
      onUpdate(rule.id, { direction })
    },
    [rule.id, onUpdate]
  )

  return (
    <div className="bulk-rel-rule-card">
      <div className="bulk-rel-rule-header">
        <span className="bulk-rel-rule-number">{index + 1}</span>
        <span className="bulk-rel-rule-label">Relationship Rule</span>
        {canRemove && (
          <Button
            type="link"
            icon="close"
            size="small"
            onClick={() => onRemove(rule.id)}
            style={{ marginLeft: 'auto', color: '#8c8c8c' }}
          />
        )}
      </div>

      <div className="bulk-rel-rule-body">
        <div className="bulk-rel-rule-field">
          <span className="bulk-rel-rule-field-label">TYPE</span>
          <Select
            value={rule.relationshipType}
            onChange={handleTypeChange}
            style={{ width: 180 }}
            placeholder="Select type..."
          >
            {RELATIONSHIP_TYPES.map((t) => (
              <Option key={t.value} value={t.value}>
                {t.label}
              </Option>
            ))}
          </Select>
        </div>

        <div className="bulk-rel-rule-field">
          <span className="bulk-rel-rule-field-label">DIRECTION</span>
          <div className="bulk-rel-rule-direction-toggle">
            <div
              className={'bulk-rel-dir-btn' + (rule.direction === DIRECTION_OUT ? ' bulk-rel-dir-btn--active' : '')}
              onClick={() => handleDirectionChange(DIRECTION_OUT)}
            >
              <Icon type="arrow-right" /> Out
            </div>
            <div
              className={'bulk-rel-dir-btn' + (rule.direction === DIRECTION_IN ? ' bulk-rel-dir-btn--active' : '')}
              onClick={() => handleDirectionChange(DIRECTION_IN)}
            >
              <Icon type="arrow-left" /> In
            </div>
          </div>
        </div>

        <div className="bulk-rel-rule-field bulk-rel-rule-field--targets">
          <span className="bulk-rel-rule-field-label" style={{ color: '#13c2c2' }}>
            TARGET CIS — OVERRIDDEN BY PANEL SELECTION ABOVE
          </span>
          <div className="bulk-rel-rule-target-tags">
            {targetCIs.length === 0 ? (
              <span style={{ color: '#bfbfbf', fontSize: 12 }}>No target CIs selected</span>
            ) : (
              targetCIs.map((ci) => (
                <Tag key={ci.id} color="cyan" style={{ marginBottom: 4 }}>
                  {ci.name}
                </Tag>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

RelationshipRuleCard.propTypes = {
  rule: PropTypes.shape({
    id: PropTypes.string.isRequired,
    relationshipType: PropTypes.string,
    direction: PropTypes.oneOf([DIRECTION_OUT, DIRECTION_IN]).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  targetCIs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  canRemove: PropTypes.bool.isRequired,
}

const RelationshipRulesSection = ({
  rules,
  targetCIs,
  onUpdateRule,
  onRemoveRule,
  onAddRule,
}) => {
  return (
    <div className="bulk-rel-rules-section">
      <div className="bulk-rel-rules-header">
        <span className="bulk-rel-rules-title">RELATIONSHIP RULES</span>
        <span className="bulk-rel-rules-count">{rules.length} rule{rules.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bulk-rel-rules-list">
        {rules.map((rule, index) => (
          <RelationshipRuleCard
            key={rule.id}
            rule={rule}
            index={index}
            targetCIs={targetCIs}
            onUpdate={onUpdateRule}
            onRemove={onRemoveRule}
            canRemove={rules.length > 1}
          />
        ))}
      </div>

      <div className="bulk-rel-add-rule" onClick={onAddRule}>
        <Icon type="plus" style={{ marginRight: 6, color: '#1890ff' }} />
        <span>Add another rule</span>
      </div>
    </div>
  )
}

RelationshipRulesSection.propTypes = {
  rules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      relationshipType: PropTypes.string,
      direction: PropTypes.oneOf([DIRECTION_OUT, DIRECTION_IN]).isRequired,
    })
  ).isRequired,
  targetCIs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpdateRule: PropTypes.func.isRequired,
  onRemoveRule: PropTypes.func.isRequired,
  onAddRule: PropTypes.func.isRequired,
}

export default RelationshipRulesSection
