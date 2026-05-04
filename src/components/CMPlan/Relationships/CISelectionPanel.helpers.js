/**
 * Compute select-all state for a list of CIs against the current selection set.
 */
export const computeSelectionState = (cis, selectedIdSet) => {
  if (cis.length === 0) return { allSelected: false, indeterminate: false }
  let selectedCount = 0
  for (let i = 0; i < cis.length; i += 1) {
    if (selectedIdSet.has(cis[i].id)) selectedCount += 1
  }
  return {
    allSelected: selectedCount === cis.length,
    indeterminate: selectedCount > 0 && selectedCount < cis.length,
  }
}

/**
 * Merge `additionalIds` into `currentIds`, preserving order and removing
 * duplicates.
 */
export const mergeUniqueIds = (currentIds, additionalIds) =>
  Array.from(new Set(currentIds.concat(additionalIds)))

/** Remove every id in `idsToRemove` from `currentIds`. */
export const removeIds = (currentIds, idsToRemove) => {
  const removalSet = new Set(idsToRemove)
  return currentIds.filter((id) => !removalSet.has(id))
}
