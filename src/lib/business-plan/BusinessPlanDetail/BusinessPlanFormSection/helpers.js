import Decimal from 'decimal.js'

const findCell = (dataArray, columnKey) => {
  if (!dataArray) return null
  for (var i = 0; i < dataArray.length; i++) {
    if (dataArray[i].columnKey === columnKey) return dataArray[i]
  }
  return null
}

const getCellValue = (dataArray, columnKey) => {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.value : null
}

const getCellFloor = (dataArray, columnKey) => {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.normUnitPriceFloor : null
}

const getCellCeiling = (dataArray, columnKey) => {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.normUnitPriceCeiling : null
}

const getCellNormConfig = (dataArray, columnKey) => {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.normUnitPriceConfig : null
}

const getCellPercentage = (dataArray, columnKey) => {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.normBusinessPlanConfig : null
}

const findCellIn = (businessPlanItems, sectionKey, rowKey, columnKey) => {
  var section = businessPlanItems[sectionKey]
  if (!section) return null
  var row = section.data[rowKey]
  if (!row) return null
  return findCell(row.data, columnKey)
}

const resolveValue = (item, formulaValue, isSpecialSectionFormula) => {
  if (!item) return null
  if (formulaValue !== undefined && isSpecialSectionFormula(item.sectionKey)) {
    return formulaValue
  }
  return item.value
}

const getResultCompare = (current, compare, isCompare) => {
  if (!isCompare) return null
  const validCurrent =
    current !== null &&
    current !== undefined &&
    isFinite(current) &&
    !isNaN(current)
  const validCompare =
    compare !== null &&
    compare !== undefined &&
    isFinite(compare) &&
    !isNaN(compare)
  if (!validCurrent && !validCompare) return null
  if (!validCompare) return new Decimal(current).toNumber()
  if (!validCurrent) return new Decimal(compare).negated().toNumber()
  return new Decimal(current).minus(new Decimal(compare)).toNumber()
}

const makeCellKey = mergedCol => {
  var idPart =
    mergedCol.id !== null && mergedCol.id !== undefined ? mergedCol.id : 'null'
  return (
    mergedCol.columnKey + '_' + idPart + (mergedCol.isCompareOnly ? '_cmp' : '')
  )
}

const getMergedColumns = (
  currentCols,
  compareCols,
  compareBusinessPlanItems
) => {
  if (!compareCols || !compareBusinessPlanItems) {
    return (currentCols || []).map(function (col) {
      return {
        id: col.id,
        label: col.label,
        index: col.index,
        columnKey: col.columnKey,
        currentColumnKey: col.columnKey,
        compareColumnKey: null,
        isCurrentOnly: false,
        isCompareOnly: false,
      }
    })
  }

  var result = []
  var insertedCompareKeys = {}

  ;(currentCols || []).forEach(function (col) {
    var matchedCmp = null
    for (var i = 0; i < compareCols.length; i++) {
      var c = compareCols[i]
      if (col.id === null || col.id === undefined) {
        if (c.columnKey === col.columnKey) {
          matchedCmp = c
          break
        }
      } else {
        if (c.id === col.id) {
          matchedCmp = c
          break
        }
      }
    }

    result.push({
      id: col.id,
      label: col.label,
      index: col.index,
      columnKey: col.columnKey,
      currentColumnKey: col.columnKey,
      compareColumnKey: matchedCmp ? matchedCmp.columnKey : null,
      isCurrentOnly: !matchedCmp,
      isCompareOnly: false,
    })

    if (matchedCmp) {
      var matchedKey =
        matchedCmp.columnKey +
        '_' +
        (matchedCmp.id !== null && matchedCmp.id !== undefined
          ? matchedCmp.id
          : 'null')
      insertedCompareKeys[matchedKey] = true
    }

    for (var j = 0; j < compareCols.length; j++) {
      var cmpA = compareCols[j]
      if (cmpA.id === null || cmpA.id === undefined) continue
      if (cmpA.columnKey !== col.columnKey) continue
      var keyA = cmpA.columnKey + '_' + cmpA.id
      if (insertedCompareKeys[keyA]) continue
      result.push({
        id: cmpA.id,
        label: cmpA.label,
        index: cmpA.index,
        columnKey: cmpA.columnKey,
        currentColumnKey: null,
        compareColumnKey: cmpA.columnKey,
        isCurrentOnly: false,
        isCompareOnly: true,
      })
      insertedCompareKeys[keyA] = true
    }
  })

  for (var k = 0; k < compareCols.length; k++) {
    var cmpB = compareCols[k]
    var keyB =
      cmpB.columnKey +
      '_' +
      (cmpB.id !== null && cmpB.id !== undefined ? cmpB.id : 'null')
    if (!insertedCompareKeys[keyB]) {
      result.push({
        id: cmpB.id,
        label: cmpB.label,
        index: cmpB.index,
        columnKey: cmpB.columnKey,
        currentColumnKey: null,
        compareColumnKey: cmpB.columnKey,
        isCurrentOnly: false,
        isCompareOnly: true,
      })
    }
  }

  return result
}

export {
  findCell,
  getCellValue,
  getCellFloor,
  getCellCeiling,
  getCellNormConfig,
  getCellPercentage,
  findCellIn,
  resolveValue,
  getResultCompare,
  makeCellKey,
  getMergedColumns,
}
