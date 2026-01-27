/**
 * Date Format Constants
 * Used throughout the Timeline library for consistent date formatting
 */

export const DateFormat = {
  // Year-Month-Day format (ISO standard)
  YYYY_MM_DD: 'YYYY-MM-DD',

  // Day-Month-Year format (display)
  DD_MM_YYYY: 'DD/MM/YYYY',

  // Month-Year format (headers, periods)
  MM_YYYY: 'MMM YYYY',
}

/**
 * Format float number to 2 decimal places
 * @param {number} number - Number to format
 * @returns {string} Formatted number string with 2 decimal places
 */
export const formatFloatNumber = number => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0.00'
  }
  return Number(number).toFixed(2)
}
