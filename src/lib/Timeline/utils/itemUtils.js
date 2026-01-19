/**
 * Item Utilities
 * Helper functions for timeline items
 */

import moment from 'moment';
import { DEFAULT_STATUS_COLOR } from '../../../constants/statusColors'; 

/**
 * Item types
 */
export const ITEM_TYPES = {
  RANGE: 'range',      // Has startDate and endDate
  MILESTONE: 'milestone' // Has only createdDate or single date
};

/**
 * Determine item type
 * PERFORMANCE: Fast type detection with explicit checks
 * @param {Object} item - Timeline item
 * @returns {string} ITEM_TYPES
 */
export const getItemType = (item) => {
  if (!item) {
    return null;
  }
  
  // Check flag from normalizeItem (already processed fake dates)
  // If initially missing dates -> marked as milestone
  if (item._originallyMilestone === true) {
    return ITEM_TYPES.MILESTONE;
  }
  
  // Otherwise -> RANGE (has real dates)
  return ITEM_TYPES.RANGE;
}

/**
 * Get item date for positioning (handles both range and milestone)
 * @param {Object} item - Timeline item
 * @returns {moment|null} Date for positioning
 */
export const getItemDate = (item) => {
  // Priority: startDate > dueDate > createdDate (for milestones)
  const dateValue = item.startDate || item.dueDate || item.createdDate;
  
  if (dateValue) {
    return moment(dateValue);
  }
  
  return null;
};

/**
 * Get item end date (for range items)
 * @param {Object} item - Timeline item
 * @returns {moment|null} End date
 */
export const getItemEndDate = (item) => {
  // Use dueDate as end date
  const dateValue = item.dueDate;
  
  if (dateValue) {
    return moment(dateValue);
  }
  
  return null;
};

/**
 * Check if item is milestone
 * @param {Object} item - Timeline item
 * @returns {boolean} True if milestone
 */
export const isMilestone = (item) => {
  return getItemType(item) === ITEM_TYPES.MILESTONE;
};

/**
 * Normalize item (ensure consistent structure)
 * PERFORMANCE: Optimized - avoid spread operator
 * @param {Object} item - Timeline item
 * @returns {Object} Normalized item
 */
export const normalizeItem = (item) => {
  const type = getItemType(item);
  const color = item.color || DEFAULT_STATUS_COLOR;
  
  // OPTIMIZATION: Direct property assignment instead of spread
  return {
    id: item.id,
    name: item.name,
    startDate: item.startDate,
    dueDate: item.dueDate,
    createdDate: item.createdDate,
    date: item.date,
    status: item.status,
    progress: item.progress,
    duration: item.duration,
    _originallyMilestone: item._originallyMilestone,
    _type: type,
    _isValid: type !== null,
    color: color
  };
};
