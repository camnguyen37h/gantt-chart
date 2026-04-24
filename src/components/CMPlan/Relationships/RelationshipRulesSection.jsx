import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, DatePicker, Icon, Select, Tooltip } from 'antd'
import moment from 'moment'

const { Option } = Select

const DATE_FORMAT = 'MM/DD/YYYY'
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

  const [touched, setTouched] = useState({ applied: false, expired: false })
  const touchApplied = useCallback(() => setTouched((t) => (t.applied ? t : { ...t, applied: true })), [])
  const touchExpired = useCallback(() => setTouched((t) => (t.expired ? t : { ...t, expired: true })), [])

  const handleAppliedDateChange = useCallback(
    (date) => {
      setTouched((t) => (t.applied ? t : { ...t, applied: true }))
      onUpdate(rule.id, { appliedDate: date ? date.toISOString() : null })
    },
    [rule.id, onUpdate]
  )

  const handleExpiredDateChange = useCallback(
    (date) => {
      setTouched((t) => (t.expired ? t : { ...t, expired: true }))
      onUpdate(rule.id, { expiredDate: date ? date.toISOString() : null })
    },
    [rule.id, onUpdate]
  )

  const appliedMoment = rule.appliedDate ? moment(rule.appliedDate) : null
  const expiredMoment = rule.expiredDate ? moment(rule.expiredDate) : null

  const disabledExpiredDate = useCallback(
    (current) => {
      if (!current) return false
      const startOfToday = moment().startOf('day')
      if (current.isBefore(startOfToday)) return true
      if (appliedMoment && current.isBefore(appliedMoment.startOf('day'))) return true
      return false
    },
    [appliedMoment]
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

  const hasRelType = Boolean(rule.relationshipType)
  const showAppliedError = hasRelType && touched.applied && !rule.appliedDate
  const showExpiredError = hasRelType && touched.expired && !rule.expiredDate

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

  const renderTypeOptionLabel = (opt) => {
    const isUsedByOther = usedTypes.has(opt.value) && opt.value !== rule.relationshipType
    const disabledReason = buildOptionDisabledReason({
      optionValue: opt.value,
      ruleRelType: rule.relationshipType,
      sourceType,
      targetType,
      validRelTypes,
      isUsedByOther,
    })
    const labelNode = (
      <span style={disabledReason ? DISABLED_LABEL_STYLE : undefined}>{opt.label}</span>
    )
    if (!disabledReason) return labelNode
    return (
      <Tooltip title={disabledReason} placement="right">
        {labelNode}
      </Tooltip>
    )
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
            className="bulk-rel-rule-remove"
          />
        )}
      </div>

      <div className="bulk-rel-rule-body">
        <div className="bulk-rel-rule-section">
          <div className="bulk-rel-rule-section-title">
            <Icon type="link" />
            <span>Configuration</span>
          </div>
          <div className="bulk-rel-rule-field">
            <span className="bulk-rel-rule-field-label">Relationship Type</span>
            <Select
              value={rule.relationshipType || undefined}
              onChange={handleTypeChange}
              style={{ width: '100%' }}
              placeholder="Select relationship type..."
              allowClear
            >
              {relTypeOptions.map((opt) => (
                <Option key={opt.value} value={opt.value} disabled={isOptionDisabled(opt.value)}>
                  {renderTypeOptionLabel(opt)}
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

        <div className="bulk-rel-rule-section">
          <div className="bulk-rel-rule-section-title">
            <Icon type="clock-circle" />
            <span>Validity Period</span>
          </div>
          <div className="bulk-rel-rule-validity">
            <div className="bulk-rel-rule-field">
              <span className="bulk-rel-rule-field-label">
                Applied Date
                <span className="bulk-rel-rule-required">*</span>
              </span>
              <DatePicker
                value={appliedMoment}
                onChange={handleAppliedDateChange}
                onOpenChange={(open) => { if (!open) touchApplied() }}
                style={{ width: '100%' }}
                placeholder="Select applied date"
                format={DATE_FORMAT}
                className={showAppliedError ? 'bulk-rel-rule-datepicker--error' : undefined}
              />
              {showAppliedError && (
                <span className="bulk-rel-rule-warning">Applied Date is required.</span>
              )}
            </div>

            <Icon type="arrow-right" className="bulk-rel-rule-validity-arrow" />

            <div className="bulk-rel-rule-field">
              <span className="bulk-rel-rule-field-label">
                Expired Date
                <span className="bulk-rel-rule-required">*</span>
              </span>
              <DatePicker
                value={expiredMoment}
                onChange={handleExpiredDateChange}
                onOpenChange={(open) => { if (!open) touchExpired() }}
                style={{ width: '100%' }}
                placeholder="Select expired date"
                format={DATE_FORMAT}
                disabledDate={disabledExpiredDate}
                className={showExpiredError ? 'bulk-rel-rule-datepicker--error' : undefined}
              />
              {showExpiredError && (
                <span className="bulk-rel-rule-warning">Expired Date is required.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

RuleCard.propTypes = {
  rule: PropTypes.shape({
    id: PropTypes.string.isRequired,
    relationshipType: PropTypes.string,
    appliedDate: PropTypes.string,
    expiredDate: PropTypes.string,
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
  onRemoveRule: PropTypes.func.isRequired,
  onAddRule: PropTypes.func.isRequired,
}

RelationshipRulesSection.defaultProps = {
  sourceType: undefined,
  targetType: undefined,
}

export default RelationshipRulesSection