import Decimal from 'decimal.js'
import { REGEX_FLOAT_NUM } from '../regex/Regex'

export const formatFloatNumber = (
  value,
  minimum = 0,
  maximum = 2,
  isZeroDigit = false
) => {
  try {
    const numberStr = value.toString().replaceAll(',', '')
    const parsedNumber = parseFloat(numberStr)

    if (isNaN(parsedNumber)) return value

    const isInteger = Number.isInteger(parsedNumber)

    // Trường hợp cần hiển thị số 0 sau dấu thập phân (ví dụ: 1.00)
    if (isInteger && isZeroDigit) {
      return new Decimal(parsedNumber).toFixed(maximum)
    }

    // Định dạng số theo locale
    return new Intl.NumberFormat('es-US', {
      minimumFractionDigits: minimum,
      maximumFractionDigits: maximum,
    }).format(new Decimal(parsedNumber).toNumber())
  } catch (error) {
    return value
  }
}

export const onKeyPressInputFloat = e => {
  const { value } = e.target
  if (!REGEX_FLOAT_NUM.test(e.key)) {
    e.preventDefault()
  }
  if (e.key === '.' && value.includes('.')) {
    e.preventDefault()
  }
}

export const formatCurrencyNegative = value => {
  if (!value) return ''
  if (String(value).includes('-')) {
    return `(${String(value).replace('-', '').trim()})`
  }
  return value
}

export const createNumberFormatter = (options = {}) => {
  const {
    maxIntegerDigits = 4,
    maxDecimalDigits = 2,
    thousandsSeparator = ',',
    decimalSeparator = '.',
    allowNegative = false,
  } = options

  const addThousandsSeparator = (num, separator) => {
    if (!num || !separator) return num

    const formatted = new Intl.NumberFormat('en-US', {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(Number(num))

    if (separator === ',') {
      return formatted
    }

    return formatted.replaceAll(',', separator)
  }

  const processValue = value => {
    const valueStr = value.toString()
    const isNegative = allowNegative && valueStr.startsWith('-')
    const absoluteValue = isNegative ? valueStr.slice(1) : valueStr

    const cleanValue = absoluteValue.replaceAll(thousandsSeparator, '')
    const parts = cleanValue.split(decimalSeparator)

    let integerPart = (parts[0] || '').replaceAll(/\D/g, '')
    let decimalPart = parts[1] === undefined ? null : parts[1]

    integerPart = integerPart.slice(0, maxIntegerDigits)

    if (decimalPart !== null && maxDecimalDigits > 0) {
      decimalPart = decimalPart.replaceAll(/\D/g, '').slice(0, maxDecimalDigits)
    }

    return { integerPart, decimalPart, isNegative }
  }

  const buildResult = (
    integerPart,
    decimalPart,
    isNegative,
    addSeparator = false
  ) => {
    if (!integerPart && (decimalPart === null || !decimalPart)) return ''

    let processedInteger = integerPart
    if (addSeparator && thousandsSeparator && integerPart) {
      processedInteger = addThousandsSeparator(integerPart, thousandsSeparator)
    }

    let result = processedInteger
    if (decimalPart !== null && maxDecimalDigits > 0) {
      result += decimalSeparator + decimalPart
    }

    return isNegative ? '-' + result : result
  }

  const formatter = value => {
    if (value === null) return value
    if (value === '-') return allowNegative ? value : null
    if (value === '') return value

    const { integerPart, decimalPart, isNegative } = processValue(value)
    return buildResult(integerPart, decimalPart, isNegative, true)
  }

  const parser = value => {
    if (value === undefined || value === null || value === '') return ''
    if (value === '-') return allowNegative ? '-' : ''

    const { integerPart, decimalPart, isNegative } = processValue(value)
    return buildResult(integerPart, decimalPart, isNegative, false)
  }

  return { formatter, parser }
}

/**
 * Format a number to a string with thousand separators and
 * two decimal places, and prefix with a negative sign if
 * the number is negative.
 * @param {string|number} number - The number to format.
 * @returns {string} The formatted number string.
 */

export const formatMoneyUnit = (number = '') => {
  if (typeof number !== 'string' && typeof number !== 'number') return '-'
  if (number === null || number === undefined || isNaN(number)) return '-'

  const isNegative = number < 0
  const newValue = Number(number) / 1000
  const roundedNumber = Math.round(newValue * 100) / 100

  try {
    const fraction = roundedNumber % 1 === 0 ? 0 : 2
    const formatedNumber = Intl.NumberFormat('en-US', {
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    }).format(roundedNumber)

    return isNegative ? `(${formatedNumber.replace('-', '')})` : formatedNumber
  } catch (error) {
    console.error(error)
    return '-'
  }
}
