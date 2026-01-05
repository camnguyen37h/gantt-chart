/**
 * Date Utilities for Timeline
 * Handles all date-related calculations and formatting
 */

import moment from 'moment';
import { VIEW_MODES, DATE_FORMATS } from '../constants';

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
  const end = moment.max(allDates).endOf('month').add(2, 'months');

  return { start, end };
};

/**
 * Generate timeline periods based on view mode
 * @param {moment} start - Start date
 * @param {moment} end - End date
 * @param {string} viewMode - View mode (days, weeks, months, etc.)
 * @param {number} pixelsPerDay - Pixels per day for width calculation
 * @returns {Array} Array of period objects with widthPx
 */
export const generatePeriods = (start, end, viewMode, pixelsPerDay = 40) => {
  const periods = [];
  let current = start.clone();

  switch (viewMode) {
    case VIEW_MODES.DAYS: {
      while (current.isBefore(end)) {
        const days = 1;
        const widthPx = days * pixelsPerDay;
        periods.push({
          label: current.format('D'),
          sublabel: current.format('ddd'),
          width: widthPx,
          days: days,
          start: current.clone(),
          type: 'day'
        });
        current.add(1, 'day');
      }
      break;
    }

    case VIEW_MODES.WEEKS: {
      current = start.clone().startOf('week');
      while (current.isBefore(end)) {
        const nextWeek = current.clone().add(1, 'week');
        const periodEnd = nextWeek.isAfter(end) ? end : nextWeek;
        const weekDays = periodEnd.diff(current, 'days', true);
        const widthPx = weekDays * pixelsPerDay;
        periods.push({
          label: `Week ${current.format('W')}`,
          sublabel: current.format('MMM YYYY'),
          width: widthPx,
          days: weekDays,
          start: current.clone(),
          type: 'week'
        });
        current.add(1, 'week');
      }
      break;
    }

    case VIEW_MODES.MONTHS: {
      while (current.isBefore(end)) {
        const nextMonth = current.clone().add(1, 'month');
        const periodEnd = nextMonth.isAfter(end) ? end : nextMonth;
        const monthDays = periodEnd.diff(current, 'days', true);
        const widthPx = monthDays * pixelsPerDay;
        periods.push({
          label: current.format('MMMM'),
          sublabel: current.format('YYYY'),
          width: widthPx,
          days: monthDays,
          start: current.clone(),
          end: periodEnd.clone(),
          type: 'month'
        });
        current = nextMonth;
      }
      break;
    }

    case VIEW_MODES.QUARTERS: {
      current = start.clone().startOf('quarter');
      while (current.isBefore(end)) {
        const quarterEnd = current.clone().endOf('quarter');
        const actualEnd = quarterEnd.isAfter(end) ? end : quarterEnd;
        const quarterDays = actualEnd.diff(current, 'days', true);
        const widthPx = quarterDays * pixelsPerDay;
        periods.push({
          label: `Q${current.format('Q')}`,
          sublabel: current.format('YYYY'),
          width: widthPx,
          days: quarterDays,
          start: current.clone(),
          type: 'quarter'
        });
        current.add(1, 'quarter');
      }
      break;
    }

    case VIEW_MODES.YEARS: {
      current = start.clone().startOf('year');
      while (current.isBefore(end)) {
        const yearEnd = current.clone().endOf('year');
        const actualEnd = yearEnd.isAfter(end) ? end : yearEnd;
        const yearDays = actualEnd.diff(current, 'days', true);
        const widthPx = yearDays * pixelsPerDay;
        periods.push({
          label: current.format('YYYY'),
          sublabel: '',
          width: widthPx,
          days: yearDays,
          start: current.clone(),
          type: 'year'
        });
        current.add(1, 'year');
      }
      break;
    }

    default:
      return generatePeriods(start, end, VIEW_MODES.MONTHS);
  }

  return periods;
};

/**
 * Calculate position percentage on timeline
 * @param {string|Date|moment} date - Target date
 * @param {moment} start - Timeline start
 * @param {number} totalDays - Total days in timeline
 * @returns {number} Position percentage (0-100)
 */
export const calculatePosition = (date, start, totalDays) => {
  const days = moment(date).diff(start, 'days', true); // Use fractional days
  return (days / totalDays) * 100;
};

/**
 * Calculate width percentage on timeline
 * @param {string|Date|moment} startDate - Item start date
 * @param {string|Date|moment} endDate - Item end date
 * @param {number} totalDays - Total days in timeline
 * @returns {number} Width percentage (0-100)
 */
export const calculateWidth = (startDate, endDate, totalDays) => {
  const days = moment(endDate).diff(moment(startDate), 'days', true); // Fractional days
  return Math.max((days / totalDays) * 100, 0.5); // Minimum 0.5% width
};

/**
 * Get current date position
 * @param {moment} start - Timeline start
 * @param {moment} end - Timeline end
 * @param {number} totalDays - Total days
 * @returns {number|null} Position percentage or null if outside range
 */
export const getCurrentDatePosition = (start, end, totalDays) => {
  const now = moment();
  if (now.isBefore(start) || now.isAfter(end)) return null;
  return calculatePosition(now, start, totalDays);
};

/**
 * Format date for display
 * @param {string|Date|moment} date - Date to format
 * @param {string} format - Format string (optional)
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = DATE_FORMATS.display) => {
  return moment(date).format(format);
};

/**
 * Check if two date ranges overlap
 * @param {Object} range1 - {start, end}
 * @param {Object} range2 - {start, end}
 * @returns {boolean} True if ranges overlap
 */
export const rangesOverlap = (range1, range2) => {
  const start1 = moment(range1.start);
  const end1 = moment(range1.end);
  const start2 = moment(range2.start);
  const end2 = moment(range2.end);

  return start1.isBefore(end2) && end1.isAfter(start2);
};

/**
 * Get duration in readable format
 * @param {string|Date|moment} startDate - Start date
 * @param {string|Date|moment} endDate - End date
 * @returns {string} Formatted duration (e.g., "3 months", "2 weeks")
 */
export const getDuration = (startDate, endDate) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const days = end.diff(start, 'days');

  if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''}`;
};
