/**
 * Pure utility helpers for BusinessPlanFormSection.
 * No React dependencies — safe to import anywhere.
 */

/**
 * Find a cell in a row's data array by columnKey.
 * Returns the cell object or null.
 */
function findCell(dataArray, columnKey) {
  if (!dataArray) return null
  for (var i = 0; i < dataArray.length; i++) {
    if (dataArray[i].columnKey === columnKey) return dataArray[i]
  }
  return null
}

/**
 * Shorthand getters for common cell fields.
 */
function getCellValue(dataArray, columnKey) {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.value : null
}

function getCellFloor(dataArray, columnKey) {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.normUnitPriceFloor : null
}

function getCellCeiling(dataArray, columnKey) {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.normUnitPriceCeiling : null
}

function getCellNormConfig(dataArray, columnKey) {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.normUnitPriceConfig : null
}

function getCellPercentage(dataArray, columnKey) {
  var cell = findCell(dataArray, columnKey)
  return cell ? cell.normBusinessPlanConfig : null
}

/**
 * Navigate businessPlanItems and return a cell by section / row / column.
 * Returns the cell object or null.
 */
function findCellIn(businessPlanItems, sectionKey, rowKey, columnKey) {
  var section = businessPlanItems[sectionKey]
  if (!section) return null
  var row = section.data[rowKey]
  if (!row) return null
  return findCell(row.data, columnKey)
}

/**
 * Resolve the display value for a cell, preferring formula over raw value
 * when isSpecialSectionFormula returns true for the cell's section.
 */
function resolveValue(item, formulaValue, isSpecialSectionFormula) {
  if (!item) return null
  if (formulaValue !== undefined && isSpecialSectionFormula(item.sectionKey)) {
    return formulaValue
  }
  return item.value
}

/**
 * Calculate compare difference (current - compare).
 * Returns null when not in compare mode or both values are absent.
 */
function getResultCompare(current, compare, isCompare) {
  if (!isCompare) return null
  if (!current && !compare) return null
  if (!compare) return parseFloat(current.toFixed(2))
  if (!current) return -parseFloat(compare.toFixed(2))
  return parseFloat(current.toFixed(2)) - parseFloat(compare.toFixed(2))
}

/**
 * Build a stable cell key for React list rendering.
 * Format: "{columnKey}_{id|null}[_cmp]"
 */
function makeCellKey(mergedCol) {
  var idPart = mergedCol.id !== null && mergedCol.id !== undefined ? mergedCol.id : 'null'
  return mergedCol.columnKey + '_' + idPart + (mergedCol.isCompareOnly ? '_cmp' : '')
}

/**
 * Build a merged column list that combines current-version columns and
 * compare-version columns so unique departments from each version appear
 * side-by-side.
 *
 * Each entry has:
 *   { id, label, index, columnKey, currentColumnKey, compareColumnKey,
 *     isCurrentOnly, isCompareOnly }
 *
 * "currentColumnKey" is the key to look up in businessPlanItems.
 * "compareColumnKey" is the key to look up in compareBusinessPlanItems.
 */
function getMergedColumns(currentCols, compareCols, compareBusinessPlanItems) {
  // No compare active: wrap each column in the unified shape
  if (!compareCols || !compareBusinessPlanItems) {
    return (currentCols || []).map(function(col) {
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

  ;(currentCols || []).forEach(function(col) {
    // Match compare column by id (DU columns) or by columnKey (TOTAL / INTERNAL)
    var matchedCmp = null
    for (var i = 0; i < compareCols.length; i++) {
      var c = compareCols[i]
      if (col.id === null || col.id === undefined) {
        if (c.columnKey === col.columnKey) { matchedCmp = c; break }
      } else {
        if (c.id === col.id) { matchedCmp = c; break }
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
      var matchedKey = matchedCmp.columnKey + '_' + (matchedCmp.id !== null && matchedCmp.id !== undefined ? matchedCmp.id : 'null')
      insertedCompareKeys[matchedKey] = true
    }

    // Insert compare-only DU columns that share the same parent columnKey
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

  // Any remaining compare columns not yet inserted
  for (var k = 0; k < compareCols.length; k++) {
    var cmpB = compareCols[k]
    var keyB = cmpB.columnKey + '_' + (cmpB.id !== null && cmpB.id !== undefined ? cmpB.id : 'null')
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
