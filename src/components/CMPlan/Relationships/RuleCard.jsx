import React, { useCallback, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'antd'
import RelationshipTypeField from './RelationshipTypeField'
import ValidityPeriodFields from './ValidityPeriodFields'
import {
  toMoment,
  toIso,
  snapDateIntoRange,
  buildAppliedDateGuard,
  buildExpiredDateGuard,
} from '../../../utils/cmplan/ruleDateHelpers'
import useProjectBasicInfo from '../../../hooks/cmplan/useProjectBasicInfo'

const collectInitialDateUpdates = (rule, pStartMoment, pEndMoment) => {
  const updates = {}
  if (!rule.appliedDate && pStartMoment) updates.appliedDate = toIso(pStartMoment)
  if (!rule.expiredDate && pEndMoment)   updates.expiredDate = toIso(pEndMoment)
  return updates
}

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
  const pStartMoment  = useMemo(() => toMoment(pStartDate),       [pStartDate])
  const pEndMoment    = useMemo(() => toMoment(pEndDate),         [pEndDate])
  const appliedMoment = useMemo(() => toMoment(rule.appliedDate), [rule.appliedDate])
  const expiredMoment = useMemo(() => toMoment(rule.expiredDate), [rule.expiredDate])

  const [touched, setTouched] = React.useState({ type: false, applied: false, expired: false })
  const markType    = useCallback(() => setTouched((p) => p.type    ? p : { ...p, type:    true }), [])
  const markApplied = useCallback(() => setTouched((p) => p.applied ? p : { ...p, applied: true }), [])
  const markExpired = useCallback(() => setTouched((p) => p.expired ? p : { ...p, expired: true }), [])

  // Pre-fill defaults from the project window when available.
  useEffect(() => {
    if (!pStartMoment && !pEndMoment) return
    const updates = collectInitialDateUpdates(rule, pStartMoment, pEndMoment)
    if (Object.keys(updates).length > 0) onUpdate(rule.id, updates)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pStartMoment, pEndMoment])

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
      // null → user cleared → snap to pStart
      if (!date) {
        onUpdate(rule.id, { appliedDate: toIso(pStartMoment) })
        return
      }
      let resolved = snapDateIntoRange(date, pStartMoment, pStartMoment, pEndMoment)
      // date is after expiredDate → snap to expiredDate (not pStart)
      if (resolved && expiredMoment && resolved.isAfter(expiredMoment.clone().endOf('day'))) {
        resolved = expiredMoment
      }
      onUpdate(rule.id, { appliedDate: toIso(resolved) })
    },
    [rule.id, onUpdate, markApplied, pStartMoment, pEndMoment, expiredMoment]
  )

  const handleExpiredDateChange = useCallback(
    (date) => {
      markExpired()
      // null → user cleared → allow it so showExpiredError triggers (required)
      if (!date) {
        onUpdate(rule.id, { expiredDate: null })
        return
      }
      let resolved = snapDateIntoRange(date, pEndMoment, pStartMoment, pEndMoment)
      // date is before appliedDate → snap to appliedDate (not pEnd)
      if (resolved && appliedMoment && resolved.isBefore(appliedMoment.clone().startOf('day'))) {
        resolved = appliedMoment
      }
      onUpdate(rule.id, { expiredDate: toIso(resolved) })
    },
    [rule.id, onUpdate, markExpired, pStartMoment, pEndMoment, appliedMoment]
  )

  const handleAppliedOpenChange = useCallback(
    (open) => { if (!open) markApplied() },
    [markApplied]
  )
  const handleExpiredOpenChange = useCallback(
    (open) => { if (!open) markExpired() },
    [markExpired]
  )

  const disabledAppliedDate = useMemo(
    () => buildAppliedDateGuard({ pStartMoment, pEndMoment, expiredMoment }),
    [pStartMoment, pEndMoment, expiredMoment]
  )
  const disabledExpiredDate = useMemo(
    () => buildExpiredDateGuard({ pStartMoment, pEndMoment, appliedMoment }),
    [pStartMoment, pEndMoment, appliedMoment]
  )

  const isCurrentInvalid = Boolean(
    rule.relationshipType && sourceType && targetType && !validRelTypes.has(rule.relationshipType)
  )
  const showTypeRequiredError = touched.type    && !rule.relationshipType
  const showAppliedError      = touched.applied && !rule.appliedDate
  const showExpiredError      = touched.expired && !rule.expiredDate

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
          <RelationshipTypeField
            rule={rule}
            relTypeOptions={relTypeOptions}
            validRelTypes={validRelTypes}
            usedTypes={usedTypes}
            sourceType={sourceType}
            targetType={targetType}
            showRequiredError={showTypeRequiredError}
            isCurrentInvalid={isCurrentInvalid}
            onChange={handleTypeChange}
            onBlur={markType}
          />
        </div>

        <div className="bulk-rel-rule-section">
          <div className="bulk-rel-rule-section-title">
            <Icon type="clock-circle" />
            <span>Validity Period</span>
          </div>
          <ValidityPeriodFields
            appliedMoment={appliedMoment}
            expiredMoment={expiredMoment}
            appliedDefaultPickerValue={pStartMoment || undefined}
            expiredDefaultPickerValue={pEndMoment || undefined}
            disabledAppliedDate={disabledAppliedDate}
            disabledExpiredDate={disabledExpiredDate}
            onAppliedDateChange={handleAppliedDateChange}
            onExpiredDateChange={handleExpiredDateChange}
            onAppliedOpenChange={handleAppliedOpenChange}
            onExpiredOpenChange={handleExpiredOpenChange}
            showAppliedError={showAppliedError}
            showExpiredError={showExpiredError}
          />
        </div>
      </div>
    </div>
  )
}

RuleCard.propTypes = {
  rule: PropTypes.shape({
    id:               PropTypes.string.isRequired,
    relationshipType: PropTypes.string,
    appliedDate:      PropTypes.string,
    expiredDate:      PropTypes.string,
  }).isRequired,
  index:    PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
  relTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  validRelTypes: PropTypes.instanceOf(Set).isRequired,
  usedTypes:     PropTypes.instanceOf(Set).isRequired,
  sourceType:    PropTypes.string,
  targetType:    PropTypes.string,
}

RuleCard.defaultProps = {
  sourceType: undefined,
  targetType: undefined,
}

export default React.memo(RuleCard)
