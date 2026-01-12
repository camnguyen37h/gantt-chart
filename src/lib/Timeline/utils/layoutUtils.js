/**
 * Layout Engine for Timeline Items
 * Handles positioning and auto-layout to prevent overlapping
 */

import { getItemDate, getItemEndDate } from './itemUtils';

/**
 * Sort items by date (handles both range and milestone)
 * @param {Array} items - Timeline items
 * @returns {Array} Sorted items
 */
export const sortItemsByDate = (items) => {
  return [...items].sort((a, b) => {
    const dateA = getItemDate(a);
    const dateB = getItemDate(b);
    if (!dateA || !dateB) return 0;
    return dateA.valueOf() - dateB.valueOf();
  });
};

/**
 * Auto-layout algorithm - assigns row indices to prevent overlapping
 * Handles both range items and milestones
 * @param {Array} items - Timeline items
 * @returns {Array} Items with added 'row' property
 * 
 * Complexity: O(n × m) where n = items, m = rows
 */
export const calculateItemLayout = (items) => {
  if (!items || items.length === 0) return [];

  const sortedItems = sortItemsByDate(items);
  const rows = []; // Each element stores endTime of last item
  const result = [];

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const startDate = getItemDate(item);
    
    if (!startDate) continue;

    const endDate = getItemEndDate(item);
    const itemEnd = endDate || startDate.clone().add(1, 'day');
    const itemStartTime = startDate.valueOf();
    const itemEndTime = itemEnd.valueOf();

    // Find first available row (greedy first-fit)
    let rowIndex = -1;
    
    for (let r = 0; r < rows.length; r++) {
      if (rows[r] < itemStartTime) {
        rowIndex = r;
        break;
      }
    }

    // Create new row if needed
    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push(itemEndTime);
    } else {
      rows[rowIndex] = itemEndTime;
    }

    result.push({ ...item, row: rowIndex });
  }

  return result;
};

/**
 * Advanced layout with conflict resolution
 * Uses greedy first-fit algorithm for optimal performance
 * @param {Array} items - Timeline items
 * @returns {Array} Items with row assignments
 * 
 * Complexity: O(n × m) where n = items, m = rows (typically m << n)
 */
export const calculateAdvancedLayout = (items) => {
  if (!items || items.length === 0) return [];

  const sortedItems = sortItemsByDate(items);
  const rows = []; // Each row stores {endTime} of last item
  const result = [];

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const startDate = getItemDate(item);
    
    if (!startDate) continue; // Skip invalid items

    const endDate = getItemEndDate(item);
    const itemEnd = endDate || startDate.clone().add(1, 'day');
    
    // Cache timestamps for fast comparison
    const itemStartTime = startDate.valueOf();
    const itemEndTime = itemEnd.valueOf();

    // Find first row where this item fits (greedy first-fit)
    let targetRow = -1;
    
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const rowEndTime = rows[rowIdx].endTime;
      
      // Check overlap: endA >= startB means overlap
      // No overlap if: rowEndTime < itemStartTime (strictly less than)
      if (rowEndTime < itemStartTime) {
        targetRow = rowIdx;
        break; // Early exit - found suitable row
      }
    }

    // Create new row if no suitable row found
    if (targetRow === -1) {
      targetRow = rows.length;
      rows.push({ endTime: itemEndTime });
    } else {
      // Update row's end time
      rows[targetRow].endTime = itemEndTime;
    }

    // Add item with row assignment
    result.push({ ...item, row: targetRow });
  }

  return result;
};

/**
 * Calculate minimum grid height needed
 * @param {Array} layoutItems - Items with row assignments
 * @param {number} rowHeight - Height of each row
 * @returns {number} Minimum height in pixels
 */
export const calculateGridHeight = (layoutItems, rowHeight) => {
  if (!layoutItems || layoutItems.length === 0) return rowHeight;
  
  const maxRow = Math.max(...layoutItems.map(item => item.row || 0));
  return (maxRow + 1) * rowHeight + 40; // +40 for padding
};

/**
 * Group items by a property (e.g., category, status, resource)
 * @param {Array} items - Timeline items
 * @param {string} groupBy - Property name to group by
 * @returns {Object} Grouped items {groupName: [items]}
 */
export const groupItems = (items, groupBy) => {
  if (!items || !groupBy) return { 'All Items': items };

  return items.reduce((groups, item) => {
    const key = item[groupBy] || 'Uncategorized';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Filter items based on criteria
 * @param {Array} items - Timeline items
 * @param {Object} filters - Filter criteria {property: value}
 * @returns {Array} Filtered items
 */
export const filterItems = (items, filters) => {
  if (!items || !filters || Object.keys(filters).length === 0) return items;

  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') return true;
      return item[key] === value;
    });
  });
};

/**
 * Search items by text
 * @param {Array} items - Timeline items
 * @param {string} searchText - Search query
 * @param {Array} searchFields - Fields to search in (default: ['name'])
 * @returns {Array} Matching items
 */
export const searchItems = (items, searchText, searchFields = ['name']) => {
  if (!items || !searchText) return items;

  const query = searchText.toLowerCase().trim();
  if (query === '') return items;

  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (!value) return false;
      return String(value).toLowerCase().includes(query);
    });
  });
};
