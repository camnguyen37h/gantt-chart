import { DateFormat } from '../constants/DateFormat'
import { isArray, isEmpty, isObject } from 'lodash'
import moment from 'moment'

/**
 * Transform API response item to normalized timeline item structure
 *
 * @param {Object} item - API response item
 *
 * @return {Object|null} Normalized item or null if invalid
 */
export const normalizeTimelineItem = item => {
  if (!item) {
    return null
  }

  const {
    issueId,
    issueName,
    issueKey,
    startDate,
    dueDate,
    resolvedDate,
    createdDate,
    status,
  } = item

  if (!issueId || !issueName) {
    return null
  }

  let normalizedStartDate = startDate
  let normalizedDueDate = dueDate
  let originallyMilestone = false

  // startDate or dueDate are null or dueDate >= startDate, but createdDate exists
  if (
    (!startDate ||
      !dueDate ||
      moment(dueDate).isSameOrBefore(moment(startDate), 'day')) &&
    createdDate
  ) {
    const created = moment(createdDate)
    normalizedStartDate = created
      .clone()
      .subtract(1, 'day')
      .format(DateFormat.YYYY_MM_DD)
    normalizedDueDate = created
      .clone()
      .add(1, 'day')
      .format(DateFormat.YYYY_MM_DD)
    originallyMilestone = true
  }

  if (!normalizedStartDate || !normalizedDueDate) {
    return null
  }

  const duration = calculateDiffDay(startDate, dueDate, true)
  const lateTime = calculateDiffDay(resolvedDate, dueDate, false)

  return {
    id: issueId,
    name: issueName,
    issueKey: issueKey,
    startDateBefore: startDate,
    dueDateBefore: dueDate,
    startDateAfter: normalizedStartDate,
    dueDateAfter: normalizedDueDate,
    resolvedDate: resolvedDate || null,
    createdDate: createdDate || null,
    status: status || 'Unknown',
    duration: duration,
    lateTime: lateTime,
    _originallyMilestone: originallyMilestone,
  }
}

/**
 * Calculate day difference between two dates
 *
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} dueDate - Due date (YYYY-MM-DD)
 * @param {boolean} onlyPositive - Return only positive values
 *
 * @return {number|undefined} Day difference or undefined if invalid
 */
export const calculateDiffDay = (startDate, dueDate, onlyPositive = false) => {
  if (
    !startDate ||
    !dueDate ||
    (moment(dueDate).isBefore(moment(startDate), 'day') && onlyPositive)
  ) {
    return undefined
  }

  const start = moment(startDate)
  const due = moment(dueDate)

  if (!start.isValid() || !due.isValid()) {
    return undefined
  }

  const diffDays = due.diff(start, 'days')

  return onlyPositive ? Math.max(0, diffDays) : diffDays
}

/**
 * Extract and sort unique status values from items
 *
 * @param {Array} items - Array of timeline items
 *
 * @return {Array} Sorted array of unique status strings
 */
export const extractUniqueStatuses = items => {
  if (!items || !Array.isArray(items)) {
    return []
  }

  const statusSet = new Set()

  for (const item of items) {
    if (item && item.status) {
      statusSet.add(item.status)
    }
  }

  const uniqueStatuses = Array.from(statusSet)
  uniqueStatuses.sort((a, b) => a.localeCompare(b))

  return uniqueStatuses
}

/**
 * Create mapping from status to color palette index
 *
 * @param {Array} statuses - Array of unique status strings
 *
 * @return {Object} Map of status to color index
 */
export const buildStatusColorMap = statuses => {
  const map = {}

  if (!statuses || !Array.isArray(statuses)) {
    return map
  }

  for (const [index, status] of statuses.entries()) {
    if (status && typeof status === 'string') {
      map[status] = index
    }
  }

  return map
}

/**
 * Normalize array of API items with performance optimization
 *
 * @param {Array} data - Array of API response items
 *
 * @return {Array} Array of normalized timeline items
 */
export const normalizeTimelineData = data => {
  if (isEmpty(data) || !isArray(data)) {
    return []
  }

  const normalized = []

  for (const item of data) {
    const normalizeItem = normalizeTimelineItem(item)
    if (!isEmpty(normalizeItem)) {
      normalized.push(normalizeItem)
    }
  }

  return normalized
}

/**
 * Filter items by status visibility map
 *
 * @param {Array} items - Array of timeline items
 * @param {Object} visibleStatuses - Map of status to visibility boolean
 *
 * @return {Array} Filtered items array
 */
export const filterByVisibleStatuses = (items, visibleStatuses) => {
  if (!items || !Array.isArray(items)) {
    return []
  }

  if (!visibleStatuses || !isObject(visibleStatuses)) {
    return items
  }

  const hasHiddenStatus = Object.values(visibleStatuses).includes(false)

  if (!hasHiddenStatus) {
    return items
  }

  return items.filter(
    item => item && item.status && visibleStatuses[item.status] !== false
  )
}
