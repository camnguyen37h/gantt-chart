/**
 * Layout Engine for Timeline Items
 * Handles positioning and auto-layout to prevent overlapping
 */

import { rangesOverlap } from './dateUtils';
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
 */
export const calculateItemLayout = (items) => {
  if (!items || items.length === 0) return [];

  const sortedItems = sortItemsByDate(items);
  const rows = [];

  sortedItems.forEach(item => {
    const startDate = getItemDate(item);
    
    if (!startDate) return; // Skip invalid items

    // Find a row where this item doesn't overlap
    let rowIndex = rows.findIndex(row => {
      if (row.length === 0) return true;
      const lastItem = row[row.length - 1];
      const lastEndDate = getItemEndDate(lastItem) || getItemDate(lastItem).clone().add(1, 'day');
      
      // Check if item starts after the last item in this row ends
      return startDate.isAfter(lastEndDate);
    });

    // If no suitable row found, create a new one
    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push([]);
    }

    // Add item to the row
    const layoutItem = { ...item, row: rowIndex };
    rows[rowIndex].push(layoutItem);
  });

  return rows.flat();
};

/**
 * Advanced layout with conflict resolution
 * Uses sophisticated overlap checking, handles milestones
 * @param {Array} items - Timeline items
 * @returns {Array} Items with row assignments
 */
export const calculateAdvancedLayout = (items) => {
  if (!items || items.length === 0) return [];

  const sortedItems = sortItemsByDate(items);
  const result = [];
  const rows = []; // Array of arrays, each containing items in that row

  sortedItems.forEach(item => {
    const startDate = getItemDate(item);
    const endDate = getItemEndDate(item);
    
    if (!startDate) return; // Skip invalid items

    // For milestones, treat as having 1 day duration
    const itemEndDate = endDate || startDate.clone().add(1, 'day');

    // Find the first row where this item doesn't overlap with any existing item
    let targetRow = -1;
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const rowItems = rows[rowIdx];
      
      // Check if item overlaps with any item in this row
      const hasOverlap = rowItems.some(existingItem => {
        const existingStart = getItemDate(existingItem);
        const existingEnd = getItemEndDate(existingItem) || existingStart.clone().add(1, 'day');
        
        return rangesOverlap(
          { start: startDate.format('YYYY-MM-DD'), end: itemEndDate.format('YYYY-MM-DD') },
          { start: existingStart.format('YYYY-MM-DD'), end: existingEnd.format('YYYY-MM-DD') }
        );
      });

      if (!hasOverlap) {
        targetRow = rowIdx;
        break;
      }
    }

    // If no suitable row found, create a new one
    if (targetRow === -1) {
      targetRow = rows.length;
      rows.push([]);
    }

    // Add item to the row
    const layoutItem = { ...item, row: targetRow };
    rows[targetRow].push(layoutItem);
    result.push(layoutItem);
  });

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
