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
    onsiteCols.filter(c => isSaleKey(c.columnKey) && c.id != null).map(c => c.id)
  )
  const offshoreSaleIds = new Set(
    offshoreCols.filter(c => isSaleKey(c.columnKey) && c.id != null).map(c => c.id)
  )
  const seenSaleIds = new Set()
  for (const col of [...onsiteCols, ...offshoreCols]) {
    if (isSaleKey(col.columnKey) && col.id != null && !seenSaleIds.has(col.id)) {
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

  // DU columns: each unique DU (by columnKey) appears exactly once.
  // If a DU exists on only one side, tag it with that side's mvvType.
  // If the same DU key appears in both sides (shared DU), add it once (Onsite takes
  // precedence for the column label) and sum contributions from both sides in deriveCellValue.
  const onsiteDuKeys = new Set(
    onsiteCols.filter(c => isDUCol(c.columnKey)).map(c => c.columnKey)
  )
  const offshoreDuKeys = new Set(
    offshoreCols.filter(c => isDUCol(c.columnKey)).map(c => c.columnKey)
  )
  const seenDuKeys = new Set()
  for (const col of [...onsiteCols, ...offshoreCols]) {
    if (!isDUCol(col.columnKey) || seenDuKeys.has(col.columnKey)) continue
    seenDuKeys.add(col.columnKey)
    const inOnsite = onsiteDuKeys.has(col.columnKey)
    const inOffshore = offshoreDuKeys.has(col.columnKey)
    result.push({ ...col, mvvType: inOnsite ? 'Onsite' : 'Offshore' })
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

  const seenSectionKeys = new Set()
  const result = []

  for (const onsiteSec of onsiteList) {
    seenSectionKeys.add(onsiteSec.sectionKey)
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

    result.push({ section: onsiteSec, mergedRows })
  }

  // Add Offshore-only sections not present in Onsite
  for (const offshoreSec of offshoreList) {
    if (seenSectionKeys.has(offshoreSec.sectionKey)) continue
    const mergedRows = offshoreSec.rowLabels.map(offRow => ({
      onsiteRow: null,
      offshoreRow: offRow,
    }))
    result.push({ section: offshoreSec, mergedRows })
  }

  return result
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
    // Always sum both sides for each DU: for a DU that exists on only one side,
    // the other side's cell map returns undefined and safeAdd treats it as 0.
    return safeAdd(
      (onsiteCellMap[colKey] || {}).value,
      (offshoreCellMap[colKey] || {}).value
    )
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
        const refCell = onsiteCellMap[srcColKey] || offshoreCellMap[srcColKey] || {}

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
