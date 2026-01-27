import moment from 'moment'
import { DEFAULT_STATUS_CONFIG, ITEM_TYPES, STATUS_CONFIG } from '../constants'

/**
 * Determine if item is milestone or range type
 *
 * @param {Object} item - Timeline item
 *
 * @return {string|null} ITEM_TYPES.MILESTONE, ITEM_TYPES.RANGE, or null
 */
export const getItemType = item => {
  if (!item) {
    return null
  }

  if (item._originallyMilestone === true) {
    return ITEM_TYPES.MILESTONE
  }

  return ITEM_TYPES.RANGE
}

/**
 * Convert date string to a moment object for positioning
 *
 * @param {string|Date|null} date - Date value
 *
 * @return {moment|null} Moment object or null
 */
export const getItemDate = date => {
  if (!date) {
    return null
  }

  return moment(date)
}

/**
 * Check if an item represents a milestone
 *
 * @param {Object} item - Timeline item
 *
 * @return {boolean} True if item is a milestone
 */
export const isMilestone = item => {
  return getItemType(item) === ITEM_TYPES.MILESTONE
}

/**
 * Get color for status from STATUS_CONFIG
 *
 * @param {string} status - Status name
 *
 * @return {string} Hex color code for background
 */
export const getStatusColor = (status) => {
  if (!status) {
    return DEFAULT_STATUS_CONFIG.backgroundColor
  }

  const config = STATUS_CONFIG[status]
  if (config) {
    return config.backgroundColor
  }

  return DEFAULT_STATUS_CONFIG.backgroundColor
}

/**
 * Normalize the item structure with consistent properties and metadata
 *
 * @param {Object} item - Raw timeline item
 *
 * @return {Object} Normalized item with _type and _isValid flags
 */
export const normalizeItem = item => {
  const type = getItemType(item)
  const color = item.color || getStatusColor(item.status)

  return {
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
    duration: item.duration,
    lateTime: item.lateTime,
    color: color,
    _originallyMilestone: item._originallyMilestone,
    _type: type,
    _isValid: type !== null,
  }
}
