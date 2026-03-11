import moment from 'moment'
import Decimal from 'decimal.js'

export const formatNumber = (value, percent) => {
  return value === null || value === undefined
    ? null
    : value === 0
      ? '-'
      : value < 0
        ? `(${new Decimal(parseFloat(-value))
            .toFixed(3)
            .replace(/\.+0*$/, '')
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')})${percent ? '%' : ''}`
        : `${new Decimal(parseFloat(value))
            .toFixed(3)
            .replace(/\.+0*$/, '')
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      ${percent ? '%' : ''}`
}

export const formatNumberCompare = (value, percent) => {
  return !value
    ? null
    : `${new Decimal(parseFloat(Math.abs(value)))
        .toFixed(3)
        .replace(/\.+0*$/, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${percent ? '%' : ''}`
}

export const renderColorCompareNorm = data => {
  const { value, normFloor, normCeiling, rowKey, normPercentage } = data || {}

  let color

  switch (rowKey) {
    case 'UNIT_PRICE':
      if (value < normFloor) color = '#FF2121'
      if (normFloor <= value && value <= normCeiling) color = '#525559'
      if (value > normCeiling) color = '#22A664'
      break
    case 'BILLABLE_RATE':
    case 'DIRECT_MARGIN_BONUS_RATE':
      if (value < normPercentage) color = '#FF2121'
      if (value === normPercentage) color = '#525559'
      if (value > normPercentage) color = '#22A664'
      break
    default:
      color = '#525559'
      break
  }

  return color
}

/**
 * @example
 * convertDateTextFormat('01-2023');
 * returns 'Jan-2023'
 */
export const convertDateTextFormat = dateStr => {
  return moment(dateStr, 'MM-YYYY').format('MMM-YYYY')
}

/**
 * @example
 * getMonthsBetweenTimestamps(1706720400000, 1714512000000);
 * returns ['02-2024', '03-2024', '04-2024', '05-2024']
 */
export const getMonthsBetweenTimestamps = (startDate, endDate) => {
  const start = moment(startDate)
  const end = moment(endDate)
  const months = []

  let current = start.clone()

  while (current.isSameOrBefore(end, 'month')) {
    months.push(current.format('MM-YYYY'))
    current.add(1, 'month')
  }
  return months
}

export const formatInputNumber = value => {
  if (value === null) return value
  if (value === '-') return null
  if (value === '') return value

  const res = value.toString().match(/^(\d{1,15})(\.(\d{0,2})?)?/)
  if (!res) return ''

  const intPart = res[1]
  const decimalPart = res[3] || ''
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decimalPart !== ''
    ? `${formattedInt}.${decimalPart}`
    : `${formattedInt}${res[2] ? '.' : ''}`
}

export const parseInputNumber = value => {
  if (value === null || value === '') return ''

  const cleaned = value.replace(/[-,]/g, '')
  const res = cleaned.match(/^(\d{1,15})(\.(\d{0,2})?)?/)
  return res ? `${res[1]}${res[2] || ''}` : ''
}

const getProjectCodeByViewMode = (viewMode, arrayMap) => {
  if (arrayMap && arrayMap[viewMode]) {
    return arrayMap[viewMode]
  }
  return viewMode
}
