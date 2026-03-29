import { decryptValue } from './aesGcm'

/**
 * Decrypt all encrypted cell values inside a `sectionList` array.
 *
 * Strategy (optimised for throughput):
 *  1. Walk every section → row → cell in a single pass, collecting a flat
 *     array of {location, promise} for every string-valued cell.
 *  2. Await all promises in one `Promise.all` — the browser can schedule as
 *     many WebCrypto operations in parallel as it supports.
 *  3. Rebuild the sectionList with shallow copies only where needed; cells
 *     that were already null or numeric are not touched.
 *
 * Returns a *new* sectionList with decrypted numeric `value` fields.
 * The original `rawData` is never mutated.
 */
export const decryptSectionList = async sectionList => {
  if (!sectionList?.length) return sectionList

  // ── Phase 1: collect all tasks ──────────────────────────────────────────
  const tasks = []   // { si, ri, ci, promise }

  for (let si = 0; si < sectionList.length; si++) {
    const rows = sectionList[si].rowLabels
    if (!rows) continue
    for (let ri = 0; ri < rows.length; ri++) {
      const cells = rows[ri].cellList
      if (!cells) continue
      for (let ci = 0; ci < cells.length; ci++) {
        if (typeof cells[ci].value === 'string') {
          tasks.push({ si, ri, ci, promise: decryptValue(cells[ci].value) })
        }
      }
    }
  }

  if (!tasks.length) return sectionList   // nothing encrypted, return as-is

  // ── Phase 2: decrypt all cells in parallel ──────────────────────────────
  const decrypted = await Promise.all(tasks.map(t => t.promise))

  // ── Phase 3: rebuild sectionList with decrypted values ──────────────────
  // Shallow-copy only the sections/rows/cells that contain encrypted values
  // to minimise allocations for large payloads.
  const touchedSections = new Set(tasks.map(t => t.si))
  const touchedRows = new Map()
  tasks.forEach(({ si, ri }) => {
    const key = `${si}-${ri}`
    if (!touchedRows.has(key)) touchedRows.set(key, { si, ri })
  })

  const result = sectionList.map((section, si) => {
    if (!touchedSections.has(si)) return section
    return {
      ...section,
      rowLabels: section.rowLabels.map((row, ri) => {
        if (!touchedRows.has(`${si}-${ri}`)) return row
        return { ...row, cellList: [...row.cellList] }
      }),
    }
  })

  tasks.forEach(({ si, ri, ci }, idx) => {
    result[si].rowLabels[ri].cellList[ci] = {
      ...result[si].rowLabels[ri].cellList[ci],
      value: decrypted[idx],
    }
  })

  return result
}

/**
 * Decrypt all cell values in a raw Business Plan API response object.
 * Handles missing / empty `sectionList` gracefully.
 * Returns a new object — the original is not mutated.
 */
export const decryptRawBpData = async rawData => {
  if (!rawData?.sectionList?.length) return rawData
  const sectionList = await decryptSectionList(rawData.sectionList)
  return { ...rawData, sectionList }
}
