import moment from 'moment'
import Decimal from 'decimal.js'

export const formatNumber = (value, percent) => {
  if (value === null || value === undefined || !isFinite(value) || isNaN(value))
    return null

  return value === 0
    ? '-'
    : value < 0
      ? `(${new Decimal(parseFloat(-value))
          .toFixed(3)
          .replace(/\.+0*$/, '')
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')})${percent ? '%' : ''}`
      : `${new Decimal(parseFloat(value))
          .toFixed(3)
          .replace(/\.+0*$/, '')
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${percent ? '%' : ''}`
}

export const formatNumberCompare = (value, percent) => {
  if (!value || !isFinite(value) || isNaN(value)) return null
  return `${new Decimal(parseFloat(Math.abs(value)))
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

const mergeApprovers = (existing, incoming, gKey, currentBuId) => {
  const result = existing.slice()
  const ldapIndexMap = {}
  result.forEach((approver, i) => {
    ldapIndexMap[approver.ldap] = i
  })

  incoming.forEach(approver => {
    const idx = ldapIndexMap[approver.ldap]
    if (idx !== undefined) {
      // Same LDAP exists in both MVVs → mark as mergeApprove
      if (approver.referenceId != null && String(approver.referenceId) === String(currentBuId)) {
        result[idx] = { ...approver, mergeApprove: true }
      } else {
        result[idx] = { ...result[idx], mergeApprove: true }
      }
    } else {
      ldapIndexMap[approver.ldap] = result.length
      result.push({ ...approver })
    }
  })

  return result
}

export const mergeStepsByPosition = (steps, currentBuId) => {
  const positionMap = {}
  steps.forEach(step => {
    const posKey = `${step.stateOrder}|${step.order}`
    if (!positionMap[posKey]) {
      positionMap[posKey] = { ...step, map: {} }
    }
    const target = positionMap[posKey]
    Object.keys(step.map).forEach(gKey => {
      target.map[gKey] = mergeApprovers(
        target.map[gKey] || [],
        step.map[gKey],
        gKey,
        currentBuId
      )
    })
  })
  return Object.values(positionMap).sort((a, b) =>
    a.stateOrder !== b.stateOrder
      ? a.stateOrder - b.stateOrder
      : a.order - b.order
  )
}

export const getDisplayKey = item => item && item.compareKey

export const normalizeColumnKeys = (columnLabels, sectionList, viewMode) => {
  const keyCounts = {}
  for (const col of columnLabels) {
    keyCounts[col.columnKey] = (keyCounts[col.columnKey] || 0) + 1
  }

  let saleCount = 0
  const duOccurrence = {}

  const normalizedView = viewMode ? viewMode.toLowerCase() : null

  const resultColumns = columnLabels.map(col => {
    const isDuplicate = keyCounts[col.columnKey] > 1

    // Compute colCategory first so it can inform compareKey for duplicate DU columns.
    let colCategory
    if (col.id != null) {
      if (col.columnKey.startsWith('SALE')) {
        if (normalizedView === 'offshore') {
          colCategory = 'bu_offshore'
        } else if (normalizedView === 'onsite') {
          colCategory = 'bu_onsite'
        } else {
          colCategory = saleCount++ === 0 ? 'bu_onsite' : 'bu_offshore'
        }
      } else if (col.columnKey.startsWith('DELIVERY_UNIT')) {
        if (normalizedView === 'offshore') {
          colCategory = 'du_offshore'
        } else if (normalizedView === 'onsite') {
          colCategory = 'du_onsite'
        } else if (col.mvvType === 'Offshore') {
          colCategory = 'du_offshore'
        } else if (col.mvvType === 'Onsite') {
          colCategory = 'du_onsite'
        } else if (isDuplicate) {
          const occ = (duOccurrence[col.columnKey] =
            (duOccurrence[col.columnKey] || 0) + 1)
          colCategory =
            occ === keyCounts[col.columnKey] ? 'du_offshore' : 'du_onsite'
        } else {
          colCategory = 'du_onsite'
        }
      }
    }

    // Compute compareKey:
    // - explicit mvvType takes priority
    // - duplicate DU columns without mvvType use their colCategory suffix to stay unique
    // - everything else keeps the raw columnKey
    let newKey
    if (col.mvvType) {
      newKey = `${col.columnKey}_${col.mvvType.toLowerCase()}`
    } else if (isDuplicate && col.columnKey.startsWith('DELIVERY_UNIT') && colCategory) {
      const suffix = colCategory.endsWith('offshore') ? 'offshore' : 'onsite'
      newKey = `${col.columnKey}_${suffix}`
    } else {
      newKey = col.columnKey
    }

    return {
      ...col,
      compareKey: newKey,
      ...(colCategory && { colCategory }),
    }
  })

  // Build a map: originalColumnKey → [compareKey, ...] in order of appearance
  const compareKeysByOriginal = new Map()
  for (let i = 0; i < columnLabels.length; i++) {
    const orig = columnLabels[i].columnKey
    const ck = resultColumns[i].compareKey
    const arr = compareKeysByOriginal.get(orig)
    if (arr) arr.push(ck)
    else compareKeysByOriginal.set(orig, [ck])
  }

  const resultSections = sectionList.map(section => ({
    ...section,
    rowLabels: section.rowLabels.map(row => {
      const cellOcc = {}
      return {
        ...row,
        cellList: row.cellList.map(cell => {
          const cks = compareKeysByOriginal.get(cell.columnKey)
          if (!cks) return cell
          const occ = (cellOcc[cell.columnKey] = (cellOcc[cell.columnKey] || 0) + 1)
          return { ...cell, compareKey: cks[occ - 1] }
        }),
      }
    }),
  }))

  return { columnLabels: resultColumns, sectionList: resultSections }
}
