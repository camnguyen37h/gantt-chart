import { getItemDate } from './itemUtils'

/**
 * Sort timeline items by start date in ascending order
 *
 * @param {Array} items - Array of timeline items
 *
 * @return {Array} Sorted items array
 */
export const sortItemsByDate = items => {
  return items.slice().sort((a, b) => {
    const dateA = getItemDate(a.startDateAfter)
    const dateB = getItemDate(b.startDateAfter)
    if (!dateA || !dateB) {
      return 0
    }

    return dateA.valueOf() - dateB.valueOf()
  })
}

/**
 * Calculate row assignments to prevent overlapping
 *
 * @param {Array} items - Timeline items array
 *
 * @return {Array} Items with assigned rows
 */
export const calculateAdvancedLayout = items => {
  if (!items || items.length === 0) {
    return []
  }

  const sortedItems = sortItemsByDate(items)
  const rows = []
  const result = []
  const itemCount = sortedItems.length

  for (let i = 0; i < itemCount; i++) {
    const item = sortedItems[i]
    const startDate = getItemDate(item.startDateAfter)

    if (!startDate) {
      continue
    }

    const dueDate = getItemDate(item.dueDateAfter)

    const itemStartTime = startDate.valueOf()
    const itemEndTime = dueDate
      ? dueDate.valueOf()
      : startDate.valueOf() + 86400000

    let targetRow = -1
    const rowCount = rows.length

    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const rowEndTime = rows[rowIdx]

      // Check No overlap if: rowEndTime < itemStartTime
      if (rowEndTime < itemStartTime) {
        targetRow = rowIdx
        break
      }
    }

    if (targetRow === -1) {
      targetRow = rowCount
      rows.push(itemEndTime)
    } else {
      rows[targetRow] = itemEndTime
    }

    result.push({
      id: item.id,
      name: item.name,
      issueKey: item.issueKey,
      startDateBefore: item.startDateBefore,
      dueDateBefore: item.dueDateBefore,
      startDateAfter: item.startDateAfter,
      dueDateAfter: item.dueDateAfter,
      resolvedDate: item.resolvedDate,
      createdDate: item.createdDate,
      status: item.status,
      color: item.color,
      duration: item.duration,
      lateTime: item.lateTime,
      row: targetRow,
      type: item.type,
      _isValid: item._isValid,
    })
  }

  return result
}

/**
 * Calculate minimum grid height for all rows
 *
 * @param {Array} layoutItems - Items with row assignments
 * @param {number} rowHeight - Height of each row
 *
 * @return {number} Total grid height
 */
export const calculateGridHeight = (layoutItems, rowHeight) => {
  if (!layoutItems || layoutItems.length === 0) {
    return rowHeight
  }

  let maxRow = 0
  const itemCount = layoutItems.length

  for (let i = 0; i < itemCount; i++) {
    const itemRow = layoutItems[i].row
    if (itemRow !== undefined && itemRow !== null && itemRow > maxRow) {
      maxRow = itemRow
    }
  }

  return (maxRow + 1) * rowHeight + 16
}

/**
 * Filter items by multiple criteria
 *
 * @param {Array} items - Timeline items array
 * @param {Object} filters - Filter criteria
 *
 * @return {Array} Filtered items
 */
export const filterItems = (items, filters) => {
  if (!items) {
    return []
  }

  if (!filters || Object.keys(filters).length === 0) {
    return items
  }

  const filterEntries = Object.entries(filters)
  const filterCount = filterEntries.length

  return items.filter(item => {
    for (let i = 0; i < filterCount; i++) {
      const [key, value] = filterEntries[i]

      if (value === null || value === undefined || value === '') {
        continue
      }

      if (item[key] !== value) {
        return false
      }
    }
    return true
  })
}
