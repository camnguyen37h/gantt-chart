import { pluralSuffix } from '../strings'

const formatRelationshipCount = (count) =>
  count + ' relationship' + pluralSuffix(count)

const formatDuplicateClause = (count) =>
  count + ' existing relationship' + pluralSuffix(count) + ' will be skipped.'

/** Plain-text confirmation body for the bulk-create modal. */
export const buildConfirmContent = (newCount, duplicateCount) => {
  const duplicateLine = duplicateCount > 0
    ? duplicateCount + ' existing relationship' + pluralSuffix(duplicateCount) +
      ' found. Thereby, ' + formatRelationshipCount(newCount) + ' will be created.'
    : formatRelationshipCount(newCount) + ' will be created.'
  return duplicateLine + '\nAre you sure you want to create? This action can take some minutes.'
}

/** Success notification body returned after a bulk-create completes. */
export const buildSuccessDescription = (result) => {
  const created = formatRelationshipCount(result.totalCreated) + ' created successfully.'
  if (result.skippedDuplicates <= 0) return created
  const skipped = result.skippedDuplicates +
    ' duplicate' + pluralSuffix(result.skippedDuplicates) + ' skipped.'
  return created + ' ' + skipped
}

/** Numeric breakdown shown in the footer summary. */
export const buildSummaryParts = (sourceIds, targetIds, rules, newItemCount) => ({
  srcCount: sourceIds.length,
  tgtCount: targetIds.length,
  ruleCount: rules.filter((rule) => rule.relationshipType).length,
  total: newItemCount,
})
