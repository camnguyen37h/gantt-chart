import moment from 'moment'
import { DEFAULT_STATUS_COLOR, ITEM_TYPES, STATUS_COLORS } from '../constants'

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
 * Get color for status from predefined color palette
 *
 * @param {string} status - Status name
 * @param {Object} statusColorMap - Map of status to color index
 *
 * @return {string} Hex color code
 */
export const getStatusColor = (status, statusColorMap) => {
  if (!status) {
    return DEFAULT_STATUS_COLOR
  }

  if (status.toLowerCase() === 'cancel') {
    return '#78909C'
  }

  if (status)
    if (statusColorMap && statusColorMap[status] !== undefined) {
      const colorIndex = statusColorMap[status]
      if (colorIndex < STATUS_COLORS.length) {
        return STATUS_COLORS[colorIndex]
      }
    }

  return DEFAULT_STATUS_COLOR
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
  const color = item.color || DEFAULT_STATUS_COLOR

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
