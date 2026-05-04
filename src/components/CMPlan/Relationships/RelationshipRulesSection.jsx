import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import RuleCard from './RuleCard'
import { collectUsedTypes } from './RelationshipRulesSection.helpers'

const RelationshipRulesSection = ({
  rules,
  relTypeOptions,
  validRelTypes,
  sourceType,
  targetType,
  onUpdateRule,
}) => {
  const usedTypes = useMemo(() => collectUsedTypes(rules), [rules])
  const visibleRules = useMemo(() => rules.slice(0, 1), [rules])

  return (
    <div className="bulk-rel-rules-section">
      <div className="bulk-rel-rules-header">
        <span className="bulk-rel-rules-title">RELATIONSHIP RULE</span>
      </div>

      <div className="bulk-rel-rules-list">
        {visibleRules.map((rule, index) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            index={index}
            onUpdate={onUpdateRule}
            relTypeOptions={relTypeOptions}
            validRelTypes={validRelTypes}
            usedTypes={usedTypes}
            sourceType={sourceType}
            targetType={targetType}
          />
        ))}
      </div>
    </div>
  )
}

RelationshipRulesSection.propTypes = {
  rules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      relationshipType: PropTypes.string,
      appliedDate: PropTypes.string,
      expiredDate: PropTypes.string,
    })
  ).isRequired,
  relTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  validRelTypes: PropTypes.instanceOf(Set).isRequired,
  sourceType: PropTypes.string,
  targetType: PropTypes.string,
  onUpdateRule: PropTypes.func.isRequired,
}

RelationshipRulesSection.defaultProps = {
  sourceType: undefined,
  targetType: undefined,
}

export default RelationshipRulesSection
