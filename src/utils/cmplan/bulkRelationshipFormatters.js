import { pluralSuffix } from '../strings'

const formatRelationshipCount = (count) =>
  count + ' relationship' + pluralSuffix(count)

const formatDuplicateClause = (count) =>
  count + ' existing relationship' + pluralSuffix(count) + ' will be skipped.'

/** Plain-text confirmation body for the bulk-create modal. */
export const buildConfirmContent = (newCount, duplicateCount) => {
  const head = 'Create ' + formatRelationshipCount(newCount) + '?'
  if (duplicateCount <= 0) return head
  return head + '\n' + formatDuplicateClause(duplicateCount)
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
