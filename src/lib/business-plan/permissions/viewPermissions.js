import { PERMISSION_MATRIX, COL_CAT } from './policyMatrix'

export { SCOPE, COL_CAT } from './policyMatrix'

/** Placeholder shown instead of real data when user lacks view permission. */
export const MASKED_VALUE = '*****'

/**
 * Maps a columnKey to its display category.
 * @param {string} columnKey
 * @param {Object|null} columnTypeMap  optional override e.g. { DELIVERY_UNIT_34: 'onsite' }
 * @returns {'total'|'internal'|'onsite'|'offshore'|'unknown'}
 */
export const getColumnCategory = (columnKey, columnTypeMap) => {
  if (columnTypeMap && columnTypeMap[columnKey]) return columnTypeMap[columnKey]
  if (columnKey === 'TOTAL')                 return COL_CAT.TOTAL
  if (columnKey === 'INTERNAL')              return COL_CAT.INTERNAL
  if (columnKey.startsWith('SALE'))          return COL_CAT.ONSITE
  if (columnKey.startsWith('DELIVERY_UNIT')) return COL_CAT.OFFSHORE
  return 'unknown'
}

/**
 * Normalize a raw policy entry to always have sectionColumns + dataColumns.
 * `columns` is a shorthand when both row types share the same visibility.
 *
 * Examples:
 *   { columns: COL_CAT.ALL }                              → sectionColumns: ALL,    dataColumns: ALL
 *   { sectionColumns: [TOTAL], dataColumns: [] }          → header: [TOTAL], data: []
 *   { columns: [TOTAL], sectionColumns: [TOTAL, ONSITE] } → header: [TOTAL,ONSITE], data: [TOTAL]
 */
const normalizePolicy = (p) => ({
  sectionColumns: p.sectionColumns !== undefined ? p.sectionColumns : p.columns,
  dataColumns:    p.dataColumns    !== undefined ? p.dataColumns    : p.columns,
  sections:       p.sections,
})

/** Union two column arrays; COL_CAT.ALL dominates. */
const mergeColArrays = (x, y) => {
  if (x === COL_CAT.ALL || y === COL_CAT.ALL) return COL_CAT.ALL
  return [...new Set([...(x || []), ...(y || [])])]
}

/**
 * Merges two normalized policies, keeping the most permissive value for each field.
 */
const mergePolicies = (a, b) => ({
  sectionColumns: mergeColArrays(a.sectionColumns, b.sectionColumns),
  dataColumns:    mergeColArrays(a.dataColumns,    b.dataColumns),
  // null means "no section restriction" — if either policy is unrestricted, result is unrestricted
  sections: (a.sections == null || b.sections == null)
    ? null
    : [...new Set([...(a.sections || []), ...(b.sections || [])])],
})

const isFullAccess = (p) =>
  p.sectionColumns === COL_CAT.ALL && p.dataColumns === COL_CAT.ALL

/**
 * Resolves the effective merged policy for a list of roles in a given scope.
 * Returns null when no role matches — default is to mask everything.
 * @param {string[]} allRoles
 * @param {string} scope
 * @returns {Object|null}
 */
const resolvePolicy = (allRoles, scope) => {
  let resolved = null
  for (let i = 0; i < allRoles.length; i++) {
    const rolePolicy = PERMISSION_MATRIX[allRoles[i]]
    if (!rolePolicy) continue
    const scopePolicy = rolePolicy[scope] || rolePolicy['*']
    if (!scopePolicy) continue
    const normalized = normalizePolicy(scopePolicy)
    resolved = resolved ? mergePolicies(resolved, normalized) : normalized
    if (isFullAccess(resolved)) break // max privilege reached
  }
  return resolved
}

/**
 * Returns true if this column should display real data for the given roles in a scope.
 * @param {string[]} allRoles      pre-merged api roles + system roles
 * @param {string}   scope         e.g. SCOPE.TOTAL, SCOPE.REVENUE
 * @param {string}   columnKey
 * @param {Object|null} columnTypeMap
 * @param {boolean}  [isSectionHeader=false]
 * @returns {boolean}
 */
export const canViewColumn = (allRoles, scope, columnKey, columnTypeMap, isSectionHeader) => {
  const policy = resolvePolicy(allRoles, scope)
  if (!policy) return false

  const columns = isSectionHeader ? policy.sectionColumns : policy.dataColumns
  if (columns === COL_CAT.ALL) return true
  if (!columns || columns.length === 0) return false

  const cat = getColumnCategory(columnKey, columnTypeMap)
  return columns.includes(cat)
}

/**
 * Returns true if this section is visible for the given roles in a scope.
 * @param {string[]} allRoles
 * @param {string}   scope
 * @param {string}   sectionKey
 * @returns {boolean}
 */
export const canViewSection = (allRoles, scope, sectionKey) => {
  const policy = resolvePolicy(allRoles, scope)
  if (!policy) return false
  if (!policy.sections || isFullAccess(policy)) return true
  return policy.sections.includes(sectionKey)
}


