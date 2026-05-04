/**
 * Helpers shared by `RelationshipRulesSection` and its `RuleCard` subcomponent.
 * Pure functions only; safe to import from anywhere.
 */

/** Set of relationship-type values already used by the given rules. */
export const collectUsedTypes = (rules) => {
  const set = new Set()
  rules.forEach((rule) => {
    if (rule.relationshipType) set.add(rule.relationshipType)
  })
  return set
}

/**
 * Returns a human-readable reason explaining why a relationship-type option is
 * unavailable, or `null` when it is selectable.
 */
export const buildOptionDisabledReason = ({
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
    return 'Not available for ' + sourceType + ' → ' + targetType + '.'
  }
  if (optionValue !== ruleRelType && isUsedByOther) {
    return 'Already used by another rule.'
  }
  return null
}
