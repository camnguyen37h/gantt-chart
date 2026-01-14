/**
 * Date Utilities for Timeline
 * Handles all date-related calculations and formatting
 */

import moment from 'moment';

/**
 * Get date range from items (handles both range and milestone items)
 * @param {Array} items - Timeline items
 * @returns {Object} {start, end} moment objects
 */
export const getDateRangeFromItems = (items) => {
  if (!items || items.length === 0) return null;

  const allDates = [];
  
  items.forEach(item => {
    // Handle range items
    if (item.startDate && item.dueDate) {
      allDates.push(moment(item.startDate), moment(item.dueDate));
    }
    // Handle milestone items
    else if (item.createdDate) {
      allDates.push(moment(item.createdDate));
    }
    else if (item.date) {
      allDates.push(moment(item.date));
    }
  });

  if (allDates.length === 0) return null;

  const start = moment.min(allDates).startOf('month');
  const maxDate = moment.max(allDates);
  
  // Only add buffer month if maxDate is NOT the 1st day of month
  // If maxDate is 1st day (e.g., 2024-06-01), timeline ends at that month start
  // If maxDate is > 1st day (e.g., 2024-06-15), add buffer to next month start
  const end = maxDate.date() === 1 
    ? maxDate.clone().startOf('month')
    : maxDate.clone().add(1, 'month').startOf('month');

  return { start, end };
};

/**
 * Generate timeline periods (months only)
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
    
    periods.push({
      label: current.format('M/YYYY'),
      width: monthDays * pixelsPerDay,
      days: monthDays,
      start: current.clone(),
      end: nextMonth.clone(),
      type: 'month'
    });
    
    current.add(1, 'month');
  }

  // Add final period marker at 'end' with zero width (just for label)
  periods.push({
    label: endMonth.format('M/YYYY'),
    width: 0,
    days: 0,
    start: endMonth.clone(),
    end: endMonth.clone(),
    type: 'marker'
  });

  return periods;
};
