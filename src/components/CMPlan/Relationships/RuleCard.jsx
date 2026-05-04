import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { DatePicker, Icon, Select, Tooltip } from 'antd'
import moment from 'moment'
import { buildOptionDisabledReason } from './RelationshipRulesSection.helpers'
import useProjectBasicInfo from '../../../hooks/cmplan/useProjectBasicInfo'

const { Option } = Select

const DATE_FORMAT = 'MM/DD/YYYY'
const DISABLED_LABEL_STYLE = { color: '#bfbfbf' }
const INITIAL_TOUCHED = { type: false, applied: false, expired: false }

const toMoment = (iso) => (iso ? moment(iso) : null)
const toIso = (date) => (date ? date.toISOString() : null)

// Returns true if `date` falls outside the inclusive [min, max] day window.
const isOutsideProjectRange = (date, min, max) => {
  if (!date) return false
  if (min && date.isBefore(min.clone().startOf('day'))) return true
  if (max && date.isAfter(max.clone().endOf('day'))) return true
  return false
}

const RelationshipTypeOptionLabel = ({ option, disabledReason }) => {
  const labelNode = (
    <span style={disabledReason ? DISABLED_LABEL_STYLE : undefined}>{option.label}</span>
  )
  if (!disabledReason) return labelNode
  return (
    <Tooltip title={disabledReason} placement="right">
      {labelNode}
    </Tooltip>
  )
}

RelationshipTypeOptionLabel.propTypes = {
  option: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  disabledReason: PropTypes.string,
}

RelationshipTypeOptionLabel.defaultProps = { disabledReason: null }

const RuleCard = ({
  rule,
  index,
  onUpdate,
  relTypeOptions,
  validRelTypes,
  usedTypes,
  sourceType,
  targetType,
}) => {
  const { pStartDate, pEndDate } = useProjectBasicInfo()
  const pStartMoment = useMemo(() => toMoment(pStartDate), [pStartDate])
  const pEndMoment = useMemo(() => toMoment(pEndDate), [pEndDate])

  const [touched, setTouched] = useState(INITIAL_TOUCHED)

  // ── Pre-fill defaults on first load when project dates are available ──
  useEffect(() => {
    if (!pStartMoment && !pEndMoment) return
    const updates = {}
    if (!rule.appliedDate && pStartMoment) updates.appliedDate = toIso(pStartMoment)
    if (!rule.expiredDate && pEndMoment) updates.expiredDate = toIso(pEndMoment)
    if (Object.keys(updates).length > 0) onUpdate(rule.id, updates)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pStartMoment, pEndMoment])
  // ^ intentionally excludes rule.appliedDate / rule.expiredDate so this only
  //   runs when the project range first becomes available, not on every change.

  const markType = useCallback(
    () => setTouched((prev) => (prev.type ? prev : { ...prev, type: true })),
    []
  )
  const markApplied = useCallback(
    () => setTouched((prev) => (prev.applied ? prev : { ...prev, applied: true })),
    []
  )
  const markExpired = useCallback(
    () => setTouched((prev) => (prev.expired ? prev : { ...prev, expired: true })),
    []
  )

  const handleTypeChange = useCallback(
    (value) => {
      markType()
      onUpdate(rule.id, { relationshipType: value || null })
    },
    [rule.id, onUpdate, markType]
  )

  const handleAppliedDateChange = useCallback(
    (date) => {
      markApplied()
      // If manually typed outside [pStart, pEnd] → reset to pStartDate (the default).
      const resolved = isOutsideProjectRange(date, pStartMoment, pEndMoment)
        ? pStartMoment
        : date
      onUpdate(rule.id, { appliedDate: toIso(resolved) })
    },
    [rule.id, onUpdate, markApplied, pStartMoment, pEndMoment]
  )

  const handleExpiredDateChange = useCallback(
    (date) => {
      markExpired()
      // If manually typed outside [pStart, pEnd] → reset to pEndDate (the default).
      const resolved = isOutsideProjectRange(date, pStartMoment, pEndMoment)
        ? pEndMoment
        : date
      onUpdate(rule.id, { expiredDate: toIso(resolved) })
    },
    [rule.id, onUpdate, markExpired, pStartMoment, pEndMoment]
  )

  const handleAppliedOpenChange = useCallback(
    (open) => { if (!open) markApplied() },
    [markApplied]
  )
  const handleExpiredOpenChange = useCallback(
    (open) => { if (!open) markExpired() },
    [markExpired]
  )

  const appliedMoment = useMemo(() => toMoment(rule.appliedDate), [rule.appliedDate])
  const expiredMoment = useMemo(() => toMoment(rule.expiredDate), [rule.expiredDate])

  // Applied date selectable range:
  //   - default = [pStartDate, pEndDate]
  //   - if Expired Date already chosen first => [pStartDate, expiredDate]
  const disabledAppliedDate = useCallback(
    (current) => {
      if (!current) return false
      if (isOutsideProjectRange(current, pStartMoment, pEndMoment)) return true
      if (expiredMoment && current.isAfter(expiredMoment.clone().endOf('day'))) return true
      return false
    },
    [pStartMoment, pEndMoment, expiredMoment]
  )

  // Expired date selectable range:
  //   - default = [pStartDate, pEndDate]
  //   - if Applied Date already chosen first => [appliedDate, pEndDate]
  const disabledExpiredDate = useCallback(
    (current) => {
      if (!current) return false
      if (isOutsideProjectRange(current, pStartMoment, pEndMoment)) return true
      if (appliedMoment && current.isBefore(appliedMoment.clone().startOf('day'))) return true
      return false
    },
    [pStartMoment, pEndMoment, appliedMoment]
  )

  // Open the calendar at pStartDate / pEndDate respectively when no value yet.
  const appliedDefaultPickerValue = pStartMoment || undefined
  const expiredDefaultPickerValue = pEndMoment || undefined

  const computeDisabledReason = useCallback(
    (optionValue) =>
      buildOptionDisabledReason({
        optionValue,
        ruleRelType: rule.relationshipType,
        sourceType,
        targetType,
        validRelTypes,
        isUsedByOther: usedTypes.has(optionValue) && optionValue !== rule.relationshipType,
      }),
    [rule.relationshipType, sourceType, targetType, validRelTypes, usedTypes]
  )

  const isCurrentInvalid = Boolean(
    rule.relationshipType && sourceType && targetType && !validRelTypes.has(rule.relationshipType)
  )

  const showTypeRequiredError = touched.type && !rule.relationshipType
  const showAppliedError = touched.applied && !rule.appliedDate
  const showExpiredError = touched.expired && !rule.expiredDate

  return (
    <div className="bulk-rel-rule-card">
      <div className="bulk-rel-rule-header">
        <span className="bulk-rel-rule-number">{index + 1}</span>
        <span className="bulk-rel-rule-label">Relationship Rule</span>
      </div>

      <div className="bulk-rel-rule-body">
        <div className="bulk-rel-rule-section">
          <div className="bulk-rel-rule-section-title">
            <Icon type="link" />
            <span>Configuration</span>
          </div>
          <div className="bulk-rel-rule-field">
            <span className="bulk-rel-rule-field-label">
              Relationship Type
              <span className="bulk-rel-rule-required">*</span>
            </span>
            <Select
              value={rule.relationshipType || undefined}
              onChange={handleTypeChange}
              onBlur={markType}
              style={{ width: '100%' }}
              placeholder="Select relationship type..."
              allowClear
              className={showTypeRequiredError ? 'bulk-rel-rule-select--error' : undefined}
            >
              {relTypeOptions.map((option) => {
                const reason = computeDisabledReason(option.value)
                return (
                  <Option key={option.value} value={option.value} disabled={Boolean(reason)}>
                    <RelationshipTypeOptionLabel option={option} disabledReason={reason} />
                  </Option>
                )
              })}
            </Select>
            {showTypeRequiredError && (
              <span className="bulk-rel-rule-warning">Relationship Type is required.</span>
            )}
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
                onOpenChange={handleAppliedOpenChange}
                style={{ width: '100%' }}
                placeholder="Select applied date"
                format={DATE_FORMAT}
                disabledDate={disabledAppliedDate}
                defaultPickerValue={appliedDefaultPickerValue}
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
                onOpenChange={handleExpiredOpenChange}
                style={{ width: '100%' }}
                placeholder="Select expired date"
                format={DATE_FORMAT}
                disabledDate={disabledExpiredDate}
                defaultPickerValue={expiredDefaultPickerValue}
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

export default React.memo(RuleCard)
