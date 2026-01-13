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
 * No optional chaining for SonarQube compliance
 * @param {Object} item - Timeline item
 * @returns {string} ITEM_TYPES
 */
export const getItemType = (item) => {
  if (!item) {
    return null;
  }
  
  // Milestones are items with status: 'Milestone'
  if (item.status === 'Milestone') {
    return ITEM_TYPES.MILESTONE;
  }
  
  // Default to range if has startDate and endDate
  if (item.startDate && item.endDate) {
    return ITEM_TYPES.RANGE;
  }
  
  return null;
};

/**
 * Get item date for positioning (handles both range and milestone)
 * No optional chaining for SonarQube compliance
 * @param {Object} item - Timeline item
 * @returns {moment|null} Date for positioning
 */
export const getItemDate = (item) => {
  if (!item) {
    return null;
  }
  
  // All items now have startDate
  if (item.startDate) {
    return moment(item.startDate);
  }
  
  return null;
};

/**
 * Get item end date (for range items)
 * No optional chaining for SonarQube compliance
 * @param {Object} item - Timeline item
 * @returns {moment|null} End date
 */
export const getItemEndDate = (item) => {
  if (!item) {
    return null;
  }
  
  // All items now have endDate (including milestones)
  if (item.endDate) {
    return moment(item.endDate);
  }
  
  return null;
};

/**
 * Format item for tooltip/display
 * No optional chaining for SonarQube compliance
 * @param {Object} item - Timeline item
 * @returns {Object} Formatted item info
 */
export const formatItemInfo = (item) => {
  if (!item) {
    return null;
  }
  
  const type = getItemType(item);
  
  if (type === ITEM_TYPES.MILESTONE) {
    const dateValue = item.createdDate || item.date;
    if (!dateValue) {
      return null;
    }
    
    const date = moment(dateValue);
    return {
      type: 'milestone',
      title: item.name || '',
      date: date.format('DD MMM YYYY'),
      tooltip: `${item.name || 'Unnamed'}\nMilestone: ${date.format('ddd, DD MMM YYYY')}`
    };
  }
  
  if (type === ITEM_TYPES.RANGE) {
    if (!item.startDate || !item.endDate) {
      return null;
    }
    
    const start = moment(item.startDate);
    const end = moment(item.endDate);
    const duration = end.diff(start, 'days');
    
    return {
      type: 'range',
      title: item.name || '',
      startDate: start.format('DD MMM YYYY'),
      endDate: end.format('DD MMM YYYY'),
      duration: `${duration} days`,
      tooltip: `${item.name || 'Unnamed'}\n${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}\nDuration: ${duration} days`
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
 * No optional chaining for SonarQube compliance
 * @param {Object} item - Timeline item
 * @returns {Object} Normalized item
 */
export const normalizeItem = (item) => {
  if (!item) {
    return null;
  }
  
  const type = getItemType(item);
  const itemColor = item.color || DEFAULT_STATUS_COLOR;
  
  return {
    ...item,
    _type: type,
    _isMilestone: type === ITEM_TYPES.MILESTONE,
    _isValid: type !== null,
    // Color should already be set by parent component
    color: itemColor
  };
};
