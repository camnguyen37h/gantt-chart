import Decimal from 'decimal.js'

const safeAdd = (a, b) => {
  if (a == null && b == null) return null
  return new Decimal(a || 0).plus(b || 0).toNumber()
}

const isDUCol = key => key.startsWith('DELIVERY_UNIT')
const isSaleKey = key => key.startsWith('SALE')

export const mergeColumnLabels = (onsiteCols, offshoreCols) => {
  const result = []

  const totalCol = onsiteCols.find(c => c.columnKey === 'TOTAL')
  if (totalCol) result.push({ ...totalCol })

  const onsiteSaleIds = new Set(
    onsiteCols
      .filter(c => isSaleKey(c.columnKey) && c.id != null)
      .map(c => c.id)
  )
  const offshoreSaleIds = new Set(
    offshoreCols
      .filter(c => isSaleKey(c.columnKey) && c.id != null)
      .map(c => c.id)
  )
  const seenSaleIds = new Set()
  for (const col of [...onsiteCols, ...offshoreCols]) {
    if (
      isSaleKey(col.columnKey) &&
      col.id != null &&
      !seenSaleIds.has(col.id)
    ) {
      seenSaleIds.add(col.id)
      const shared = onsiteSaleIds.has(col.id) && offshoreSaleIds.has(col.id)
      const saleLocType = shared
        ? null
        : onsiteSaleIds.has(col.id)
          ? 'Onsite'
          : 'Offshore'
      result.push({ ...col, columnKey: `SALE_${col.id}`, saleLocType })
    }
  }

  const internalCol = onsiteCols.find(c => c.columnKey === 'INTERNAL')
  if (internalCol) result.push({ ...internalCol })

  for (const col of onsiteCols) {
    if (isDUCol(col.columnKey)) result.push({ ...col, mvvType: 'Onsite' })
  }

  for (const col of offshoreCols) {
    if (isDUCol(col.columnKey)) result.push({ ...col, mvvType: 'Offshore' })
  }

  return result
}

const mergeSectionLists = (onsiteList, offshoreList) => {
  const offshoreMap = {}
  for (const sec of offshoreList) {
    offshoreMap[sec.sectionKey] = {}
    for (const row of sec.rowLabels) {
      offshoreMap[sec.sectionKey][row.rowKey] = row
    }
  }

  return onsiteList.map(onsiteSec => {
    const offshoreRowsByKey = offshoreMap[onsiteSec.sectionKey] || {}
    const rowKeysSeen = new Set()
    const mergedRows = []

    for (const onsiteRow of onsiteSec.rowLabels) {
      rowKeysSeen.add(onsiteRow.rowKey)
      mergedRows.push({
        onsiteRow,
        offshoreRow: offshoreRowsByKey[onsiteRow.rowKey] || null,
      })
    }

    if (offshoreMap[onsiteSec.sectionKey]) {
      for (const offRow of Object.values(offshoreMap[onsiteSec.sectionKey])) {
        if (!rowKeysSeen.has(offRow.rowKey)) {
          mergedRows.push({ onsiteRow: null, offshoreRow: offRow })
        }
      }
    }

    return { section: onsiteSec, mergedRows }
  })
}

const buildCellMap = cellList => {
  const map = {}
  for (const cell of cellList || []) map[cell.columnKey] = cell
  return map
}

const deriveCellValue = (mergedCol, onsiteCellMap, offshoreCellMap) => {
  const colKey = mergedCol.columnKey

  if (colKey === 'TOTAL' || colKey === 'INTERNAL') {
    return safeAdd(
      (onsiteCellMap[colKey] || {}).value,
      (offshoreCellMap[colKey] || {}).value
    )
  }

  if (isSaleKey(colKey)) {
    if (mergedCol.saleLocType === 'Onsite') {
      const v = (onsiteCellMap['SALE'] || {}).value
      return v !== undefined ? v : null
    }
    if (mergedCol.saleLocType === 'Offshore') {
      const v = (offshoreCellMap['SALE'] || {}).value
      return v !== undefined ? v : null
    }
    return safeAdd(
      (onsiteCellMap['SALE'] || {}).value,
      (offshoreCellMap['SALE'] || {}).value
    )
  }

  if (isDUCol(colKey)) {
    if (mergedCol.mvvType === 'Onsite') {
      const v1 = (onsiteCellMap[colKey] || {}).value
      return v1 !== undefined ? v1 : null
    }
    const v2 = (offshoreCellMap[colKey] || {}).value
    return v2 !== undefined ? v2 : null
  }

  return null
}

export const buildDerivedRawData = (onsiteRaw, offshoreRaw) => {
  const onsiteCols = onsiteRaw.columnLabels || []
  const offshoreCols = offshoreRaw.columnLabels || []

  const mergedCols = mergeColumnLabels(onsiteCols, offshoreCols)
  const sectionPairs = mergeSectionLists(
    onsiteRaw.sectionList || [],
    offshoreRaw.sectionList || []
  )

  const sectionList = sectionPairs.map(({ section, mergedRows }) => {
    const rowLabels = mergedRows.map(({ onsiteRow, offshoreRow }) => {
      const baseRow = onsiteRow || offshoreRow
      const rowKey = baseRow.rowKey
      const sectionKey = section.sectionKey

      const onsiteCellMap = buildCellMap((onsiteRow || {}).cellList)
      const offshoreCellMap = buildCellMap((offshoreRow || {}).cellList)

      const cellList = mergedCols.map(mergedCol => {
        const value = deriveCellValue(mergedCol, onsiteCellMap, offshoreCellMap)
        const srcColKey =
          mergedCol.columnKey === 'TOTAL' || mergedCol.columnKey === 'INTERNAL'
            ? mergedCol.columnKey
            : isSaleKey(mergedCol.columnKey)
              ? 'SALE'
              : mergedCol.columnKey
        const refCell =
          onsiteCellMap[srcColKey] || offshoreCellMap[srcColKey] || {}

        return {
          ...refCell,
          columnKey: mergedCol.columnKey,
          rowKey,
          sectionKey,
          value,
          editable: false,
        }
      })

      return { ...baseRow, cellList }
    })

    return { ...section, rowLabels }
  })

  return {
    ...onsiteRaw,
    columnLabels: mergedCols,
    sectionList,
    generalInfos: null,
  }
}
