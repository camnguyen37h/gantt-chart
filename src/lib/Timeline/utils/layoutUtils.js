/**
 * Layout Engine for Timeline Items
 * Handles positioning and auto-layout to prevent overlapping
 * Optimized for million-scale datasets
 * 
 * Performance Optimizations:
 * - Timestamp caching to avoid repeated moment() calls
 * - Greedy first-fit algorithm O(n×m) where m << n
 * - No optional chaining for better performance
 * - Early exit optimizations
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
 * Advanced layout with conflict resolution and performance optimization
 * Uses greedy first-fit algorithm with timestamp caching
 * @param {Array} items - Timeline items
 * @returns {Array} Items with row assignments
 * 
 * Complexity: O(n × m) where n = items, m = rows (typically m << n)
 * Optimizations:
 * - Cache timestamps to avoid moment() calls in loop
 * - Use valueOf() for fast numeric comparison
 * - Early exit when suitable row found
 */
export const calculateAdvancedLayout = (items) => {
  if (!items || items.length === 0) {
    return [];
  }

  // Pre-process: cache timestamps for all items
  const itemsWithTimestamps = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const startDate = getItemDate(item);
    
    if (!startDate) {
      continue; // Skip invalid items
    }

    const endDate = getItemEndDate(item);
    const itemEnd = endDate || startDate.clone().add(1, 'day');
    
    itemsWithTimestamps.push({
      item: item,
      startTime: startDate.valueOf(),
      endTime: itemEnd.valueOf()
    });
  }

  // Sort by start time for optimal layout
  itemsWithTimestamps.sort((a, b) => a.startTime - b.startTime);

  const rows = []; // Track end time for each row
  const result = [];

  for (let i = 0; i < itemsWithTimestamps.length; i++) {
    const data = itemsWithTimestamps[i];
    const item = data.item;
    const itemStartTime = data.startTime;
    const itemEndTime = data.endTime;

    // Find first row where this item fits (greedy first-fit)
    let targetRow = -1;
    
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const rowEndTime = rows[rowIdx];
      
      // No overlap if: rowEndTime < itemStartTime (strictly less than)
      if (rowEndTime < itemStartTime) {
        targetRow = rowIdx;
        break; // Early exit - found suitable row
      }
    }

    // Create new row if no suitable row found
    if (targetRow === -1) {
      targetRow = rows.length;
      rows.push(itemEndTime);
    } else {
      // Update row's end time
      rows[targetRow] = itemEndTime;
    }

    // Add item with row assignment
    result.push({
      ...item,
      row: targetRow,
      _startTime: itemStartTime,
      _endTime: itemEndTime
    });
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
  if (!layoutItems || layoutItems.length === 0) {
    return rowHeight;
  }
  
  let maxRow = 0;
  
  for (let i = 0; i < layoutItems.length; i++) {
    const item = layoutItems[i];
    const row = item.row;
    
    if (typeof row === 'number' && row > maxRow) {
      maxRow = row;
    }
  }
  
  return (maxRow + 1) * rowHeight + 40; // +40 for padding
};

/**
 * Group items by a property (e.g., category, status, resource)
 * @param {Array} items - Timeline items
 * @param {string} groupBy - Property name to group by
 * @returns {Object} Grouped items {groupName: [items]}
 */
export const groupItems = (items, groupBy) => {
  if (!items || !groupBy) {
    return { 'All Items': items };
  }

  const groups = {};
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const key = item[groupBy] || 'Uncategorized';
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(item);
  }
  
  return groups;
};

/**
 * Filter items based on criteria
 * No optional chaining for performance
 * @param {Array} items - Timeline items
 * @param {Object} filters - Filter criteria {property: value}
 * @returns {Array} Filtered items
 */
export const filterItems = (items, filters) => {
  if (!items) {
    return [];
  }
  
  if (!filters || Object.keys(filters).length === 0) {
    return items;
  }

  const result = [];
  const filterEntries = Object.entries(filters);
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let passesAllFilters = true;
    
    for (let j = 0; j < filterEntries.length; j++) {
      const [key, value] = filterEntries[j];
      
      if (value === null || value === undefined || value === '') {
        continue;
      }
      
      if (item[key] !== value) {
        passesAllFilters = false;
        break;
      }
    }
    
    if (passesAllFilters) {
      result.push(item);
    }
  }
  
  return result;
};

/**
 * Search items by text (optimized for performance)
 * @param {Array} items - Timeline items
 * @param {string} searchText - Search query
 * @param {Array} searchFields - Fields to search in (default: ['name'])
 * @returns {Array} Matching items
 */
export const searchItems = (items, searchText, searchFields) => {
  if (!items) {
    return [];
  }
  
  if (!searchText) {
    return items;
  }

  const fields = searchFields || ['name'];
  const query = searchText.toLowerCase().trim();
  
  if (query === '') {
    return items;
  }

  const result = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let found = false;
    
    for (let j = 0; j < fields.length; j++) {
      const field = fields[j];
      const value = item[field];
      
      if (value && String(value).toLowerCase().includes(query)) {
        found = true;
        break;
      }
    }
    
    if (found) {
      result.push(item);
    }
  }
  
  return result;
};
