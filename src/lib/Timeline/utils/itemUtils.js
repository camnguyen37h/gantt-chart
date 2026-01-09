/**
 * Item Utilities
 * Helper functions for timeline items
 */

import moment from 'moment';

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
  // Milestones are items with status: 'Milestone'
  if (item && item.status === 'Milestone') {
    return ITEM_TYPES.MILESTONE;
  }
  // Default to range if has startDate and endDate
  if (item && item.startDate && item.endDate) {
    return ITEM_TYPES.RANGE;
  }
  return null;
};

/**
 * Validate item has required date fields
 * @param {Object} item - Timeline item
 * @returns {boolean} True if item is valid
 */
export const isValidItem = (item) => {
  const type = getItemType(item);
  return type !== null;
};

/**
 * Get item date for positioning (handles both range and milestone)
 * @param {Object} item - Timeline item
 * @returns {moment|null} Date for positioning
 */
export const getItemDate = (item) => {
  // All items now have startDate
  if (item.startDate) {
    return moment(item.startDate);
  }
  
  return null;
};

/**
 * Get item end date (for range items)
 * @param {Object} item - Timeline item
 * @returns {moment|null} End date
 */
export const getItemEndDate = (item) => {
  // All items now have endDate (including milestones)
  if (item.endDate) {
    return moment(item.endDate);
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
    const date = moment(item.createdDate || item.date);
    return {
      type: 'milestone',
      title: item.name,
      date: date.format('DD MMM YYYY'),
      tooltip: `${item.name}\nMilestone: ${date.format('ddd, DD MMM YYYY')}`
    };
  }
  
  if (type === ITEM_TYPES.RANGE) {
    const start = moment(item.startDate);
    const end = moment(item.endDate);
    const duration = end.diff(start, 'days');
    
    return {
      type: 'range',
      title: item.name,
      startDate: start.format('DD MMM YYYY'),
      endDate: end.format('DD MMM YYYY'),
      duration: `${duration} days`,
      tooltip: `${item.name}\n${start.format('DD MMM')} - ${end.format('DD MMM YYYY')}\nDuration: ${duration} days`
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
 * Get default color for item type
 * @param {Object} item - Timeline item
 * @returns {string} Hex color
 */
export const getDefaultItemColor = (item) => {
  // Color should come from item.color property set by parent
  if (item && item.color) {
    return item.color;
  }
  
  // Fallback to default blue
  return '#1890ff';
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
    _isMilestone: type === ITEM_TYPES.MILESTONE,
    _isValid: type !== null,
    color: item.color || getDefaultItemColor(item)
  };
};
