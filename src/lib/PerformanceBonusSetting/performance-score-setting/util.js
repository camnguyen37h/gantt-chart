const isRealId = id => {
  if (id === null || id === undefined) return false
  const s = String(id)
  return /^\d+$/.test(s)
}
const isTempId = id => !isRealId(id)

/**
 * Compares baseline data with current form state to generate change payloads.
 *
 * This function categorizes changes into creation, deletion, and update requests
 * by mapping records based on their `scoreId` and comparing relevant fields.
 *
 * @param {number|string} roleId - The ID of the project role associated with the data.
 * @param {Array<Object>} baseline - The original list of records fetched from the server.
 * @param {Array<Object>} current - The current list of records from the UI form.
 * @returns {Object} An object containing three arrays:
 *   - @property {Array} requestCreateData: New records (with temporary IDs) to be added.
 *   - @property {Array} requestDeleteData: Existing records removed from the current list.
 *   - @property {Array} requestUpdateData: Existing records that have modified field values.
 */
export const buildDiffPayload = (roleId, baseline = [], current = []) => {
  const baseById = new Map(
    baseline.filter(r => isRealId(r.scoreId)).map(r => [String(r.scoreId), r])
  )

  const curById = new Map(
    current.filter(r => isRealId(r.scoreId)).map(r => [String(r.scoreId), r])
  )

  const requestCreateData = current
    .filter(r => isTempId(r.scoreId))
    .map(r => ({
      projectRoleId: roleId,
      level: String(r.level || ''),
      baseScore:
        r.baseScore === null || r.baseScore === undefined
          ? 0
          : Number(r.baseScore),
      status: !!r.status,
      description: r.description || '',
    }))

  const requestDeleteData = []
  baseById.forEach((baseRow, id) => {
    if (!curById.has(id)) {
      requestDeleteData.push({
        scoreId: Number(id),
        projectRoleId: roleId,
      })
    }
  })

  const requestUpdateData = []
  curById.forEach((curRow, id) => {
    const baseRow = baseById.get(id)
    if (!baseRow) return
    const toNum = v =>
      v === '' || v === null || v === undefined ? 0 : Number(v)

    const changed =
      String(curRow.level || '') !== String(baseRow.level || '') ||
      toNum(curRow.baseScore) !== toNum(baseRow.baseScore) ||
      !!curRow.status !== !!baseRow.status ||
      String(curRow.description || '') !== String(baseRow.description || '')

    if (changed) {
      requestUpdateData.push({
        scoreId: Number(id),
        projectRoleId: roleId,
        level: String(curRow.level || ''),
        baseScore: toNum(curRow.baseScore),
        status: !!curRow.status,
        description: curRow.description || '',
      })
    }
  })

  return { requestCreateData, requestDeleteData, requestUpdateData }
}
