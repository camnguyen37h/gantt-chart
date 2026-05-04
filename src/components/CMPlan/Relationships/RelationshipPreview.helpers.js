/** Number of items flagged as duplicates (already exist). */
export const countDuplicates = (items) => {
  let count = 0
  items.forEach((item) => {
    if (item.isDuplicate) count += 1
  })
  return count
}

/** Stable React key for a preview row. */
export const buildRowKey = (item) =>
  (item.ruleId || 'rule') + ':' + item.sourceId + ':' + item.targetId

/** ClassName composition for alternating rows + duplicate highlighting. */
export const buildRowClassName = (index, isDuplicate) => {
  const classes = ['bulk-rel-preview-row']
  if (index % 2 !== 0) classes.push('bulk-rel-preview-row--alt')
  if (isDuplicate) classes.push('bulk-rel-preview-row--duplicate')
  return classes.join(' ')
}
