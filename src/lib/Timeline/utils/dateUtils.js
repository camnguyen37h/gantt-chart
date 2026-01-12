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
    if (item.startDate && item.endDate) {
      allDates.push(moment(item.startDate), moment(item.endDate));
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
  const end = moment.max(allDates);

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
  let current = start.clone().startOf('month');
  const endMonth = end.clone().endOf('month');

  // Generate month-by-month periods
  while (current.isSameOrBefore(endMonth, 'month')) {
    const nextMonth = current.clone().add(1, 'month').startOf('month');
    const periodEnd = nextMonth.isAfter(endMonth) ? end : nextMonth;
    const monthDays = periodEnd.diff(current, 'days', true);
    const widthPx = monthDays * pixelsPerDay;
    
    periods.push({
      label: current.format('M/YYYY'),  // e.g., "1/2026", "2/2026"
      width: widthPx,
      days: monthDays,
      start: current.clone(),
      end: periodEnd.clone(),
      type: 'month'
    });
    
    current = nextMonth;
  }

  return periods;
};
