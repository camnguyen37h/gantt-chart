/**
 * Date Utilities for Timeline
 * Handles all date-related calculations and formatting
 */

import moment from 'moment';

/**
 * Get date range from items (handles both range and milestone items)
 * PERFORMANCE: O(n) single pass - optimized for big data
 * @param {Array} items - Timeline items
 * @returns {Object} {start, end} moment objects
 */
export const getDateRangeFromItems = (items) => {
  // Default range: 3 months (previous month, current month, next month)
  if (!items || items.length === 0) {
    const today = moment();
    return {
      start: today.clone().subtract(1, 'month').startOf('month'),
      end: today.clone().add(1, 'months').startOf('month')
    };
  }

  // OPTIMIZATION: Single pass O(n) instead of moment.min/max O(n) twice
  // Track min/max timestamps directly without creating moment arrays
  let minTimestamp = Number.MAX_SAFE_INTEGER;
  let maxTimestamp = Number.MIN_SAFE_INTEGER;
  let hasValidDate = false;
  
  const itemCount = items.length;
  for (let i = 0; i < itemCount; i++) {
    const item = items[i];
    let startTimestamp = null;
    let endTimestamp = null;
    
    // Handle range items
    if (item.startDate && item.dueDate) {
      startTimestamp = moment(item.startDate).valueOf();
      endTimestamp = moment(item.dueDate).valueOf();
      hasValidDate = true;
    }
    // Handle milestone items
    else if (item.createdDate) {
      startTimestamp = moment(item.createdDate).valueOf();
      endTimestamp = startTimestamp;
      hasValidDate = true;
    }
    else if (item.date) {
      startTimestamp = moment(item.date).valueOf();
      endTimestamp = startTimestamp;
      hasValidDate = true;
    }
    
    // Update min/max in single pass
    if (startTimestamp !== null) {
      if (startTimestamp < minTimestamp) {
        minTimestamp = startTimestamp;
      }
      if (endTimestamp > maxTimestamp) {
        maxTimestamp = endTimestamp;
      }
    }
  }

  // Fallback if no valid dates found
  if (!hasValidDate) {
    const today = moment();
    return {
      start: today.clone().subtract(1, 'month').startOf('month'),
      end: today.clone().add(1, 'months').startOf('month')
    };
  }

  // Convert timestamps back to moment only once
  const start = moment(minTimestamp).startOf('month');
  const maxDate = moment(maxTimestamp);
  
  // Add buffer month only if maxDate is not 1st day of month
  const end = maxDate.date() === 1 
    ? maxDate.clone().startOf('month')
    : maxDate.clone().add(1, 'month').startOf('month');

  return { start, end };
};

/**
 * Generate timeline periods (months only)
 * PERFORMANCE: Optimized - minimize clone() operations
 * @param {moment} start - Start date
 * @param {moment} end - End date
 * @param {number} pixelsPerDay - Pixels per day for width calculation
 * @returns {Array} Array of period objects with widthPx
 */
export const generatePeriods = (start, end, pixelsPerDay = 40) => {
  const periods = [];
  const current = start.clone().startOf('month');
  const endMonth = end.clone().startOf('month');

  // Generate month-by-month periods for full months
  while (current.isBefore(endMonth, 'month')) {
    const nextMonth = current.clone().add(1, 'month');
    const monthDays = nextMonth.diff(current, 'days', true);
    
    // OPTIMIZATION: Store moment objects without extra clones
    // These are used for comparison only, safe to reference
    periods.push({
      label: current.format('M/YYYY'),
      width: monthDays * pixelsPerDay,
      days: monthDays,
      start: current.clone(),
      end: nextMonth,
      type: 'month'
    });
    
    // Mutate current instead of creating new instance
    current.add(1, 'month');
  }

  // Add final period marker at 'end' with zero width (just for label)
  periods.push({
    label: endMonth.format('M/YYYY'),
    width: 0,
    days: 0,
    start: endMonth,
    end: endMonth,
    type: 'marker'
  });

  return periods;
};

/**
 * Format date to display format or return N/A
 *
 * @param {string|Date|null} date - Date to format
 *
 * @returns {string}
 */
export const formatDate = date => {
  return moment(date).isValid()
    ? moment(date).format('YYYY-MM-DD')
    : 'N/A'
}

/**
 * Pluralize 'day' based on count
 *
 * @param {number} count - Number of days
 *
 * @returns {string} 'day' or 'days'
 */
const pluralizeDays = count => {
  return Math.abs(count) === 1 ? 'day' : 'days'
}

/**
 * Format duration with proper pluralization
 *
 * @param {number|undefined} diffDate - Duration in days
 * @param {boolean} onlyPositive - Positive values
 *
 * @returns {string}
 */
export const formatDiffDate = (diffDate, onlyPositive = false) => {
  if (diffDate === undefined) {
    return 'N/A'
  }

  const unit = pluralizeDays(diffDate)

  if (!onlyPositive) {
    if (diffDate < 0) {
      return `Late (${diffDate} ${unit})`
    }

    const sign = diffDate > 0 ? '+' : ''
    return `On-time (${sign}${diffDate} ${unit})`
  }

  return [diffDate, unit].join(' ')
}
