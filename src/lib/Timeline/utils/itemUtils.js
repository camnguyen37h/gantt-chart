import moment from 'moment'
import { DEFAULT_STATUS_CONFIG, ITEM_TYPES, STATUS_CONFIG } from '../constants'

/**
 * Convert date string to moment object
 *
 * @param {string|Date|null} date - Date value
 *
 * @return {moment.Moment} Moment object or null
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
  return item.type === ITEM_TYPES.MILESTONE
}

/**
 * Get color configuration for status from STATUS_CONFIG
 *
 * @param {string} status - Status name
 *
 * @return {Object} Status color configuration object
 */
export const getStatusColor = status => {
  if (!status) {
    return DEFAULT_STATUS_CONFIG
  }

  const config = STATUS_CONFIG[status]
  if (config) {
    return config
  }

  return DEFAULT_STATUS_CONFIG
}

/**
 * Normalize item structure with consistent properties
 *
 * @param {Object} item - Raw timeline item
 *
 * @return {Object} Normalized item
 */
export const normalizeItem = item => {
  const { color } = getStatusColor(item.status)

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
    color: item.color || color,
    type: item.type,
    _isValid: item.type !== null,
  }
}
