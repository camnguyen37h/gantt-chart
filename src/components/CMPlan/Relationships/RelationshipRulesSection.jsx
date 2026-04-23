import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Button, Icon, Select, Tooltip } from 'antd'

const { Option } = Select

const TYPE_SELECT_WIDTH = 260
const DISABLED_LABEL_STYLE = { color: '#bfbfbf' }

// --- Pure helpers ---------------------------------------------------------

const collectUsedTypes = (rules) => {
  const set = new Set()
  rules.forEach((r) => {
    if (r.relationshipType) set.add(r.relationshipType)
  })
  return set
}

const buildOptionDisabledReason = ({
  optionValue,
  ruleRelType,
  sourceType,
  targetType,
  validRelTypes,
  isUsedByOther,
}) => {
  if (!sourceType || !targetType) {
    return 'Select both source and target CI Types first.'
  }
  if (!validRelTypes.has(optionValue)) {
    return 'Not available for ' + sourceType + ' \u2192 ' + targetType + '.'
  }
  if (optionValue !== ruleRelType && isUsedByOther) {
    return 'Already used by another rule.'
  }
  return null
}

// --- Internal subcomponents ----------------------------------------------

const TypeOption = ({ option, ruleRelType, sourceType, targetType, validRelTypes, usedTypes }) => {
  const isUsedByOther = usedTypes.has(option.value) && option.value !== ruleRelType
  const disabledReason = buildOptionDisabledReason({
    optionValue: option.value,
    ruleRelType,
    sourceType,
    targetType,
    validRelTypes,
    isUsedByOther,
  })
  const isDisabled = Boolean(disabledReason)
  const labelNode = (
    <span style={isDisabled ? DISABLED_LABEL_STYLE : undefined}>{option.label}</span>
  )

  if (!isDisabled) return labelNode
  return (
    <Tooltip title={disabledReason} placement="right">
      {labelNode}
    </Tooltip>
  )
}

TypeOption.propTypes = {
  option: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  ruleRelType: PropTypes.string,
  sourceType: PropTypes.string,
  targetType: PropTypes.string,
  validRelTypes: PropTypes.instanceOf(Set).isRequired,
  usedTypes: PropTypes.instanceOf(Set).isRequired,
}

TypeOption.defaultProps = {
  ruleRelType: null,
  sourceType: undefined,
  targetType: undefined,
}

const RuleCard = ({
  rule,
  index,
  onUpdate,
  onRemove,
  canRemove,
  relTypeOptions,
  validRelTypes,
  usedTypes,
  sourceType,
  targetType,
}) => {
  const handleTypeChange = useCallback(
    (value) => {
      onUpdate(rule.id, { relationshipType: value || null })
    },
    [rule.id, onUpdate]
  )

  const handleRemove = useCallback(() => {
    onRemove(rule.id)
  }, [rule.id, onRemove])

  const isCurrentInvalid = Boolean(
    rule.relationshipType
      && sourceType
      && targetType
      && !validRelTypes.has(rule.relationshipType)
  )

  const isOptionDisabled = (optionValue) => {
    const reason = buildOptionDisabledReason({
      optionValue,
      ruleRelType: rule.relationshipType,
      sourceType,
      targetType,
      validRelTypes,
      isUsedByOther: usedTypes.has(optionValue) && optionValue !== rule.relationshipType,
    })
    return Boolean(reason)
  }

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
            onClick={handleRemove}
            style={{ marginLeft: 'auto', color: '#8c8c8c' }}
          />
        )}
      </div>

      <div className="bulk-rel-rule-body">
        <div className="bulk-rel-rule-field bulk-rel-rule-field--type">
          <span className="bulk-rel-rule-field-label">RELATIONSHIP TYPE</span>
          <Select
            value={rule.relationshipType || undefined}
            onChange={handleTypeChange}
            style={{ width: TYPE_SELECT_WIDTH }}
            placeholder="Select relationship type..."
            allowClear
          >
            {relTypeOptions.map((opt) => (
              <Option key={opt.value} value={opt.value} disabled={isOptionDisabled(opt.value)}>
                <TypeOption
                  option={opt}
                  ruleRelType={rule.relationshipType}
                  sourceType={sourceType}
                  targetType={targetType}
                  validRelTypes={validRelTypes}
                  usedTypes={usedTypes}
                />
              </Option>
            ))}
          </Select>
          {isCurrentInvalid && (
            <span className="bulk-rel-rule-warning">
              <Icon type="warning" style={{ marginRight: 4 }} />
              This relationship type is not valid for the selected CI Types.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

RuleCard.propTypes = {
  rule: PropTypes.shape({
    id: PropTypes.string.isRequired,
    relationshipType: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  canRemove: PropTypes.bool.isRequired,
  relTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  validRelTypes: PropTypes.instanceOf(Set).isRequired,
  usedTypes: PropTypes.instanceOf(Set).isRequired,
  sourceType: PropTypes.string,
  targetType: PropTypes.string,
}

RuleCard.defaultProps = {
  sourceType: undefined,
  targetType: undefined,
}

// --- Main component -------------------------------------------------------

const RelationshipRulesSection = ({
  rules,
  relTypeOptions,
  validRelTypes,
  sourceType,
  targetType,
  onUpdateRule,
  onRemoveRule,
  onAddRule,
}) => {
  const usedTypes = useMemo(() => collectUsedTypes(rules), [rules])

  const canAddRule = useMemo(() => {
    if (!sourceType || !targetType) return false
    if (validRelTypes.size === 0) return false
    return usedTypes.size < validRelTypes.size
  }, [sourceType, targetType, validRelTypes, usedTypes])

  const ruleCountLabel = rules.length === 1 ? 'rule' : 'rules'

  return (
    <div className="bulk-rel-rules-section">
      <div className="bulk-rel-rules-header">
        <span className="bulk-rel-rules-title">RELATIONSHIP RULES</span>
        <span className="bulk-rel-rules-count">{rules.length} {ruleCountLabel}</span>
      </div>

      <div className="bulk-rel-rules-list">
        {rules.map((rule, index) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            index={index}
            onUpdate={onUpdateRule}
            onRemove={onRemoveRule}
            canRemove={rules.length > 1}
            relTypeOptions={relTypeOptions}
            validRelTypes={validRelTypes}
            usedTypes={usedTypes}
            sourceType={sourceType}
            targetType={targetType}
          />
        ))}
      </div>

      <div
        className={'bulk-rel-add-rule' + (canAddRule ? '' : ' bulk-rel-add-rule--disabled')}
        onClick={canAddRule ? onAddRule : undefined}
      >
        <Icon type="plus" style={{ marginRight: 6, color: canAddRule ? '#1890ff' : '#bfbfbf' }} />
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
  onRemoveRule: PropTypes.func.isRequired,
  onAddRule: PropTypes.func.isRequired,
}

RelationshipRulesSection.defaultProps = {
  sourceType: undefined,
  targetType: undefined,
}

export default RelationshipRulesSection