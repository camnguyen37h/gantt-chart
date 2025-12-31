/**
 * Date Utilities for Timeline
 * Handles all date-related calculations and formatting
 */

import moment from 'moment';
import { VIEW_MODES, DATE_FORMATS } from '../constants';

/**
 * Get date range from items
 * @param {Array} items - Timeline items
 * @returns {Object} {start, end} moment objects
 */
export const getDateRangeFromItems = (items) => {
  if (!items || items.length === 0) return null;

  const validItems = items.filter(item => item.startDate && item.endDate);
  if (validItems.length === 0) return null;

  const allDates = validItems.flatMap(item => [
    moment(item.startDate),
    moment(item.endDate)
  ]);

  const start = moment.min(allDates).startOf('month');
  const end = moment.max(allDates).endOf('month').add(2, 'months');

  return { start, end };
};

/**
 * Generate timeline periods based on view mode
 * @param {moment} start - Start date
 * @param {moment} end - End date
 * @param {string} viewMode - View mode (days, weeks, months, etc.)
 * @returns {Array} Array of period objects
 */
export const generatePeriods = (start, end, viewMode) => {
  const periods = [];
  let current = start.clone();
  const totalDays = end.diff(start, 'days');

  switch (viewMode) {
    case VIEW_MODES.DAYS: {
      while (current.isBefore(end)) {
        const widthPercent = (1 / totalDays) * 100;
        periods.push({
          label: current.format('D'),
          sublabel: current.format('ddd'),
          width: widthPercent,
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
        const weekDays = 7;
        const widthPercent = (weekDays / totalDays) * 100;
        periods.push({
          label: `Week ${current.format('W')}`,
          sublabel: current.format('MMM YYYY'),
          width: widthPercent,
          start: current.clone(),
          type: 'week'
        });
        current.add(1, 'week');
      }
      break;
    }

    case VIEW_MODES.MONTHS: {
      while (current.isBefore(end)) {
        const monthDays = current.daysInMonth();
        const widthPercent = (monthDays / totalDays) * 100;
        periods.push({
          label: current.format('MMMM'),
          sublabel: current.format('YYYY'),
          width: widthPercent,
          start: current.clone(),
          type: 'month'
        });
        current.add(1, 'month');
      }
      break;
    }

    case VIEW_MODES.QUARTERS: {
      current = start.clone().startOf('quarter');
      while (current.isBefore(end)) {
        const quarterEnd = current.clone().endOf('quarter');
        const quarterDays = quarterEnd.diff(current, 'days');
        const widthPercent = (quarterDays / totalDays) * 100;
        periods.push({
          label: `Q${current.format('Q')}`,
          sublabel: current.format('YYYY'),
          width: widthPercent,
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
        const yearDays = current.isLeapYear() ? 366 : 365;
        const widthPercent = (yearDays / totalDays) * 100;
        periods.push({
          label: current.format('YYYY'),
          sublabel: '',
          width: widthPercent,
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
  const days = moment(date).diff(start, 'days');
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
  const days = moment(endDate).diff(moment(startDate), 'days');
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
