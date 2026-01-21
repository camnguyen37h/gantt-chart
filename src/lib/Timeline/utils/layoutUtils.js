/**
 * Layout Engine for Timeline Items
 * Handles positioning and auto-layout to prevent overlapping
 */

import { getItemDate, getItemEndDate } from './itemUtils';

/**
 * Sort items by date (handles both range and milestone)
 * PERFORMANCE: O(n log n) - optimized sort without spread operator
 * @param {Array} items - Timeline items
 * @returns {Array} Sorted items
 */
export const sortItemsByDate = (items) => {
  // Use slice() instead of spread for better performance
  return items.slice().sort((a, b) => {
    const dateA = getItemDate(a);
    const dateB = getItemDate(b);
    
    if (!dateA || !dateB) {
      return 0;
    }
    
    return dateA.valueOf() - dateB.valueOf();
  });
};

/**
 * Advanced layout with conflict resolution
 * PERFORMANCE: O(n * m) where n = items, m = rows (typically m << n)
 * Optimized for big data with early termination and minimal allocations
 * @param {Array} items - Timeline items
 * @returns {Array} Items with row assignments
 */
export const calculateAdvancedLayout = (items) => {
  if (!items || items.length === 0) {
    return [];
  }

  const sortedItems = sortItemsByDate(items);
  const rows = []; // Each row stores {endTime} of last item
  const result = [];
  const itemCount = sortedItems.length;

  for (let i = 0; i < itemCount; i++) {
    const item = sortedItems[i];
    const startDate = getItemDate(item);
    
    if (!startDate) {
      continue; // Skip invalid items
    }

    const endDate = getItemEndDate(item);
    
    // OPTIMIZATION: Avoid clone() - calculate timestamp directly
    const itemStartTime = startDate.valueOf();
    const itemEndTime = endDate 
      ? endDate.valueOf() 
      : startDate.valueOf() + 86400000; // +1 day in milliseconds
    
    // Find first row where this item fits (greedy first-fit)
    let targetRow = -1;
    const rowCount = rows.length;
    
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
      const rowEndTime = rows[rowIdx];
      
      // No overlap if: rowEndTime < itemStartTime (strictly less than)
      if (rowEndTime < itemStartTime) {
        targetRow = rowIdx;
        break; // OPTIMIZATION: Early exit - found suitable row
      }
    }

    // Create new row if no suitable row found
    if (targetRow === -1) {
      targetRow = rowCount; // Use current length before push
      rows.push(itemEndTime);
    } else {
      // Update row's end time
      rows[targetRow] = itemEndTime;
    }

    // OPTIMIZATION: Direct property assignment instead of spread
    result.push({
      id: item.id,
      name: item.name,
      startDate: item.startDate,
      dueDate: item.dueDate,
      createdDate: item.createdDate,
      date: item.date,
      status: item.status,
      progress: item.progress,
      color: item.color,
      duration: item.duration,
      lateTime: item.lateTime,
      _isValid: item._isValid,
      _originallyMilestone: item._originallyMilestone,
      row: targetRow
    });
  }

  return result;
};

/**
 * Calculate minimum grid height needed
 * PERFORMANCE: O(n) single pass
 * @param {Array} layoutItems - Items with row assignments
 * @param {number} rowHeight - Height of each row
 * @returns {number} Minimum height in pixels
 */
export const calculateGridHeight = (layoutItems, rowHeight) => {
  if (!layoutItems || layoutItems.length === 0) {
    return rowHeight;
  }
  
  // OPTIMIZATION: Single pass instead of map + Math.max
  let maxRow = 0;
  const itemCount = layoutItems.length;
  
  for (let i = 0; i < itemCount; i++) {
    const itemRow = layoutItems[i].row;
    if (itemRow !== undefined && itemRow !== null && itemRow > maxRow) {
      maxRow = itemRow;
    }
  }
  
  return (maxRow + 1) * rowHeight + 40; // +40 for padding
};

/**
 * Filter items based on criteria
 * PERFORMANCE: O(n * f) where f = filter count (typically small)
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

  // OPTIMIZATION: Pre-process filter entries once
  const filterEntries = Object.entries(filters);
  const filterCount = filterEntries.length;
  
  return items.filter(item => {
    for (let i = 0; i < filterCount; i++) {
      const [key, value] = filterEntries[i];
      
      // Skip empty filters
      if (value === null || value === undefined || value === '') {
        continue;
      }
      
      // Fail fast if filter doesn't match
      if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });
};

/**
 * Search items by text
 * PERFORMANCE: O(n * s) where s = search fields (typically small)
 * Optimized with early returns and toLowerCase caching
 * @param {Array} items - Timeline items
 * @param {string} searchText - Search query
 * @param {Array} searchFields - Fields to search in (default: ['name'])
 * @returns {Array} Matching items
 */
export const searchItems = (items, searchText, searchFields = ['name']) => {
  if (!items) {
    return [];
  }
  
  if (!searchText) {
    return items;
  }

  const query = searchText.toLowerCase().trim();
  
  if (query === '') {
    return items;
  }

  const fieldCount = searchFields.length;
  
  return items.filter(item => {
    // OPTIMIZATION: Early return on first match
    for (let i = 0; i < fieldCount; i++) {
      const field = searchFields[i];
      const value = item[field];
      
      if (value !== null && value !== undefined) {
        const strValue = String(value).toLowerCase();
        if (strValue.includes(query)) {
          return true; // Early exit - found match
        }
      }
    }
    return false;
  });
};
