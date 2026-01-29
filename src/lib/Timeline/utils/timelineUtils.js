import { DateFormat } from '../constants/DateFormat'
import { isArray, isEmpty, isObject } from 'lodash'
import moment from 'moment'
import { ITEM_TYPES, PROJECT_CHARTS, STATUS_CONFIG } from '../constants'

/**
 * Transform API item to normalized structure
 *
 * @param {Object} item - API response item
 *
 * @return {Object|null} Normalized item or null
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
  let normalizedType = ITEM_TYPES.RANGE

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
    normalizedType = ITEM_TYPES.MILESTONE
  }

  if (!normalizedStartDate || !normalizedDueDate) {
    return null
  }

  const duration = calculateDiffDay(startDate, dueDate, true)

  let lateTime
  if (resolvedDate) {
    lateTime = calculateDiffDay(resolvedDate, dueDate, false)
  } else {
    const today = moment().format(DateFormat.YYYY_MM_DD)
    const diffFromToday = calculateDiffDay(today, dueDate, false)

    if (diffFromToday > 0) {
      lateTime = undefined
    } else {
      lateTime = diffFromToday
    }
  }

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
    type: normalizedType,
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
 * Extract and sort unique status values
 *
 * @param {Array} items - Timeline items array
 *
 * @return {Array} Sorted unique statuses
 */
export const extractUniqueStatuses = items => {
  if (!items || !Array.isArray(items)) {
    return []
  }

  const statusSet = new Set()

  for (const item of items) {
    if (!item || !item.type) continue

    statusSet.add(item.status)
  }

  const uniqueStatuses = Array.from(statusSet)

  uniqueStatuses.sort((a, b) => {
    const orderA = STATUS_CONFIG[a] ? STATUS_CONFIG[a].order : 999
    const orderB = STATUS_CONFIG[b] ? STATUS_CONFIG[b].order : 999
    if (orderA !== orderB) {
      return orderA - orderB
    }

    return a.localeCompare(b)
  })

  return uniqueStatuses
}

/**
 * Extract unique types from timeline items
 *
 * @param {Array} items - Array of timeline items
 *
 * @returns {Array} Array of unique types
 */
export const extractUniqueTypeTimeline = items => {
  if (!items || !Array.isArray(items)) {
    return []
  }

  const typeTimelineSet = new Set()
  const maxTypes = Object.keys(PROJECT_CHARTS).length

  for (const item of items) {
    if (!item || !item.type) continue

    typeTimelineSet.add(item.type)

    if (typeTimelineSet.size >= maxTypes) {
      break
    }
  }

  return Array.from(typeTimelineSet)
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
 * Normalize array of API items
 *
 * @param {Array} data - API response items array
 *
 * @return {Array} Normalized timeline items
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
