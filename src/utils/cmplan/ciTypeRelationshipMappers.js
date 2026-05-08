/**
 * Build a unique-by-key list of CI Type options sorted alphabetically by label.
 */
const buildUniqueOptions = (rows, valueKey, labelKey) => {
  const map = new Map()
  rows.forEach((row) => {
    const value = row[valueKey]
    if (map.has(value)) return
    map.set(value, { value, label: row[labelKey] || value })
  })
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
}

/** Distinct source CI types (value + label). */
export const extractUniqueSourceTypes = (ciTypeRelationships) =>
  buildUniqueOptions(ciTypeRelationships, 'ciTypeSource', 'ciTypeSourceValue')

/** Distinct target CI types (value + label). */
export const extractUniqueTargetTypes = (ciTypeRelationships) =>
  buildUniqueOptions(ciTypeRelationships, 'ciTypeTarget', 'ciTypeTargetValue')

/** Distinct relationship-type options across the full matrix. */
export const extractAllRelationshipTypeOptions = (ciTypeRelationships) =>
  buildUniqueOptions(ciTypeRelationships, 'typeConnection', 'typeConnectionValue')

/**
 * Set of relationship types that are valid for a given (source, target) pair.
 * Returns an empty Set when either side is missing.
 */
export const getValidRelationshipTypes = (ciTypeRelationships, sourceType, targetType) => {
  const set = new Set()
  if (!sourceType || !targetType) return set
  ciTypeRelationships.forEach((r) => {
    if (r.ciTypeSource === sourceType && r.ciTypeTarget === targetType) {
      set.add(r.typeConnection)
    }
  })
  return set
}

/** Resolve a relationship type's display label, falling back to the raw value. */
export const getRelTypeLabel = (value, relTypeOptions) => {
  if (!relTypeOptions || relTypeOptions.length === 0) return value
  const found = relTypeOptions.find((option) => option.value === value)
  return found ? found.label : value
}

/**
 * Build a map from relationshipType → { issueType, issueTypeValue } for a
 * specific (sourceType, targetType) pair. Used to include issue type info in
 * the submit payload.
 */
export const buildIssueTypeLookup = (ciTypeRelationships, sourceType, targetType) => {
  const map = new Map()
  if (!sourceType || !targetType) return map
  ciTypeRelationships.forEach((r) => {
    if (r.ciTypeSource === sourceType && r.ciTypeTarget === targetType) {
      map.set(r.typeConnection, {
        issueType:      r.issueType      || null,
        issueTypeValue: r.issueTypeValue || null,
      })
    }
  })
  return map
}
