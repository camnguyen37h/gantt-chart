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
 * @param {Object} item - Timeline item
 * @returns {string} ITEM_TYPES
 */
export const getItemType = (item) => {
  if (!item) {
    return null;
  }
  
  // Check flag từ normalizeTimelineItem (đã xử lý fake dates)
  // Nếu ban đầu thiếu dates → đã được đánh dấu là milestone
  if (item._originallyMilestone === true) {
    return ITEM_TYPES.MILESTONE;
  }
  
  // Còn lại → RANGE (có đủ dates thực sự)
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
 * Format item for tooltip/display
 * @param {Object} item - Timeline item
 * @returns {Object} Formatted item info
 */
export const formatItemInfo = (item) => {
  const type = getItemType(item);
  
  if (type === ITEM_TYPES.MILESTONE) {
    const date = getItemDate(item);
    if (!date) return null;
    
    return {
      type: 'milestone',
      title: item.issueName || item.name,
      date: date.format('DD MMM YYYY'),
      tooltip: `${item.issueName || item.name}\nMilestone: ${date.format('ddd, DD MMM YYYY')}`
    };
  }
  
  if (type === ITEM_TYPES.RANGE) {
    const start = moment(item.startDate);
    const end = moment(item.dueDate);
    const duration = end.diff(start, 'days');
    
    return {
      type: 'range',
      title: item.issueName || item.name,
      startDate: start.format('DD MMM YYYY'),
      dueDate: end.format('DD MMM YYYY'),
      duration: `${duration} days`,
      tooltip: `${item.issueName || item.name}\n${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}\nDuration: ${duration} days`
    };
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
 * @param {Object} item - Timeline item
 * @returns {Object} Normalized item
 */
export const normalizeItem = (item) => {
  const type = getItemType(item);
  
  return {
    ...item,
    _type: type,
    _isValid: type !== null,
    color: item.color || DEFAULT_STATUS_COLOR
  };
};
