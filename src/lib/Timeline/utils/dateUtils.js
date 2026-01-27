import { DateFormat } from '../constants/DateFormat'
import moment from 'moment'
import { NOT_AVAILABLE } from '../constants'

/**
 * Get default date range spanning three months
 *
 * @return {Object} Date range {start, end}
 */
const getDefaultDateRange = () => {
  const today = moment()
  return {
    start: today.clone().subtract(1, 'month').startOf('month'),
    end: today.clone().add(1, 'months').startOf('month'),
  }
}

/**
 * Extract start and end timestamps from item
 *
 * @param {Object} item - Timeline item
 *
 * @return {Object|null} Timestamps {start, end} or null
 */
const getItemTimestamps = item => {
  if (item.startDateAfter && item.dueDateAfter) {
    return {
      start: moment(item.startDateAfter).valueOf(),
      end: moment(item.dueDateAfter).valueOf(),
    }
  }

  if (item.createdDate) {
    const timestamp = moment(item.createdDate).valueOf()
    return { start: timestamp, end: timestamp }
  }

  return null
}

/**
 * Calculate end date with month boundary handling
 *
 * @param {number} maxTimestamp - Maximum timestamp
 *
 * @return {moment} End date
 */
const calculateEndDate = maxTimestamp => {
  const maxDate = moment(maxTimestamp)
  return maxDate.date() === 1
    ? maxDate.clone().startOf('month')
    : maxDate.clone().add(1, 'month').startOf('month')
}

/**
 * Calculate date range from timeline items
 *
 * @param {Array} items - Timeline items array
 *
 * @return {Object} Date range {start, end}
 */
export const getDateRangeFromItems = items => {
  if (!items || items.length === 0) {
    return getDefaultDateRange()
  }

  let minTimestamp = Number.MAX_SAFE_INTEGER
  let maxTimestamp = Number.MIN_SAFE_INTEGER
  let hasValidDate = false

  for (const item of items) {
    const timestamps = getItemTimestamps(item)

    if (timestamps) {
      hasValidDate = true
      minTimestamp = Math.min(minTimestamp, timestamps.start)
      maxTimestamp = Math.max(maxTimestamp, timestamps.end)
    }
  }

  if (!hasValidDate) {
    return getDefaultDateRange()
  }

  return {
    start: moment(minTimestamp).startOf('month'),
    end: calculateEndDate(maxTimestamp),
  }
}

/**
 * Generate monthly periods for timeline header
 *
 * @param {moment} start - Start date
 * @param {moment} end - End date
 * @param {number} pixelsPerDay - Pixels per day
 *
 * @return {Array} Array of period objects
 */
export const generatePeriods = (start, end, pixelsPerDay = 40) => {
  const periods = []
  const current = start.clone().startOf('month')
  const endMonth = end.clone().startOf('month')

  while (current.isBefore(endMonth, 'month')) {
    const nextMonth = current.clone().add(1, 'month')
    const monthDays = nextMonth.diff(current, 'days', true)

    periods.push({
      label: current.format(DateFormat.MM_YYYY),
      width: monthDays * pixelsPerDay,
      days: monthDays,
      start: current.clone(),
      end: nextMonth,
      type: 'month',
    })

    current.add(1, 'month')
  }

  periods.push({
    label: endMonth.format(DateFormat.MM_YYYY),
    width: 0,
    days: 0,
    start: endMonth,
    end: endMonth,
    type: 'marker',
  })

  return periods
}

/**
 * Format date to DD/MM/YYYY or return N/A if invalid
 *
 * @param {string|Date|null} date - Date to format
 *
 * @return {string} Formatted date string
 */
export const formatDate = date => {
  return moment(date).isValid()
    ? moment(date).format(DateFormat.DD_MM_YYYY)
    : NOT_AVAILABLE
}

/**
 * Get singular or plural form of 'day' based on count
 *
 * @param {number} count - Number of days
 * @return {string} 'day' or 'days'
 */
const pluralizeDays = count => {
  return Math.abs(count) === 1 ? 'day' : 'days'
}

/**
 * Format duration with late/on-time status
 *
 * @param {number|undefined} diffDate - Duration in days
 * @param {boolean} onlyPositive - Return only positive count
 *
 * @return {string} Formatted duration
 */
export const formatDiffDate = (diffDate, onlyPositive = false) => {
  if (diffDate === undefined) {
    return NOT_AVAILABLE
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
