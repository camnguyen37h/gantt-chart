import { MAX_RELATIONSHIPS_PER_BATCH } from './bulkRelationshipConstants'

const ruleLabel = (index) => 'Rule #' + (index + 1)

const validateTypeSelection = (sourceType, targetType) => {
  const errors = []
  if (!sourceType) errors.push('Please select a source CI Type.')
  if (!targetType) errors.push('Please select a target CI Type.')
  return errors
}

const validateCISelection = (sourceIds, targetIds) => {
  const errors = []
  if (sourceIds.length === 0) errors.push('Please select at least one source CI.')
  if (targetIds.length === 0) errors.push('Please select at least one target CI.')
  return errors
}

const validateSingleRule = (rule, index, validRelTypes, hasTypePair, projectRange) => {
  const errors = []
  const prefix = ruleLabel(index) + ': '

  if (hasTypePair && rule.relationshipType && !validRelTypes.has(rule.relationshipType)) {
    errors.push(prefix + 'relationship type is not available for the selected source → target CI Types.')
  }
  if (!rule.appliedDate) errors.push(prefix + 'Applied Date is required.')
  if (!rule.expiredDate) errors.push(prefix + 'Expired Date is required.')
  if (
    rule.appliedDate &&
    rule.expiredDate &&
    new Date(rule.expiredDate) < new Date(rule.appliedDate)
  ) {
    errors.push(prefix + 'Expired Date must be on or after Applied Date.')
  }
  if (projectRange) {
    const { pStart, pEnd } = projectRange
    if (rule.appliedDate && pStart && new Date(rule.appliedDate) < pStart) {
      errors.push(prefix + 'Applied Date must be on or after the project start date.')
    }
    if (rule.appliedDate && pEnd && new Date(rule.appliedDate) > pEnd) {
      errors.push(prefix + 'Applied Date must be on or before the project end date.')
    }
    if (rule.expiredDate && pStart && new Date(rule.expiredDate) < pStart) {
      errors.push(prefix + 'Expired Date must be on or after the project start date.')
    }
    if (rule.expiredDate && pEnd && new Date(rule.expiredDate) > pEnd) {
      errors.push(prefix + 'Expired Date must be on or before the project end date.')
    }
  }
  return errors
}

const validateRules = (rules, validRelTypes, hasTypePair, projectRange) => {
  const errors = []
  const seenTypes = new Set()
  let hasAnyType = false

  rules.forEach((rule, index) => {
    if (rule.relationshipType) {
      hasAnyType = true
      if (seenTypes.has(rule.relationshipType)) {
        errors.push('Duplicate rule detected: same relationship type used more than once.')
      }
      seenTypes.add(rule.relationshipType)
    }
    errors.push(...validateSingleRule(rule, index, validRelTypes, hasTypePair, projectRange))
  })

  if (!hasAnyType) {
    errors.unshift('At least one rule must have a relationship type selected.')
  }
  return { errors, hasAnyType }
}

const validateBatchSize = (sourceIds, targetIds, hasAnyType, newItemCount) => {
  const errors = []
  if (newItemCount === 0 && sourceIds.length > 0 && targetIds.length > 0 && hasAnyType) {
    errors.push('All generated relationships already exist. Nothing new to create.')
  }
  if (newItemCount > MAX_RELATIONSHIPS_PER_BATCH) {
    errors.push(
      'Too many relationships (' + newItemCount + '). Maximum ' +
        MAX_RELATIONSHIPS_PER_BATCH + ' per batch. Reduce selections.'
    )
  }
  return errors
}

/**
 * Run all validation rules for the bulk-add form. Returns a flat string[] of
 * user-facing error messages (empty array means valid).
 */
export const validateBulkRelationships = ({
  sourceType,
  targetType,
  sourceIds,
  targetIds,
  rules,
  newItemCount,
  validRelTypes,
  pStartDate,
  pEndDate,
}) => {
  const hasTypePair = Boolean(sourceType && targetType && validRelTypes)
  const projectRange = (pStartDate || pEndDate)
    ? {
        pStart: pStartDate ? new Date(pStartDate) : null,
        pEnd: pEndDate ? new Date(pEndDate) : null,
      }
    : null
  const ruleResult = validateRules(rules, validRelTypes, hasTypePair, projectRange)
  return [
    ...validateTypeSelection(sourceType, targetType),
    ...validateCISelection(sourceIds, targetIds),
    ...ruleResult.errors,
    ...validateBatchSize(sourceIds, targetIds, ruleResult.hasAnyType, newItemCount),
  ]
}
