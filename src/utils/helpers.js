import moment from 'moment';

/**
 * Format date to display format
 * @param {string|Date} date - Date to format
 * @param {string} format - Moment format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'DD-MM-YYYY') => {
  return moment(date).format(format);
};

/**
 * Calculate days between two dates
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} Number of days
 */
export const daysBetween = (startDate, endDate) => {
  return moment(endDate).diff(moment(startDate), 'days');
};

/**
 * Calculate percentage position on timeline
 * @param {string|Date} date - Target date
 * @param {string|Date} startDate - Timeline start date
 * @param {string|Date} endDate - Timeline end date
 * @returns {number} Percentage (0-100)
 */
export const calculateTimelinePosition = (date, startDate, endDate) => {
  const totalDays = daysBetween(startDate, endDate);
  const daysFromStart = daysBetween(startDate, date);
  return (daysFromStart / totalDays) * 100;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 20) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
