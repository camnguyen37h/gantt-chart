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
 * Merges two policies, keeping the most permissive value for each field.
 * Full access ('*') short-circuits immediately.
 */
const mergePolicies = (a, b) => {
  if (a.columns === COL_CAT.ALL || b.columns === COL_CAT.ALL) return { columns: COL_CAT.ALL }
  return {
    columns:           [...new Set([...(a.columns || []), ...(b.columns || [])])],
    // null means "no section restriction" — if either policy is unrestricted, result is unrestricted
    sections:          (a.sections == null || b.sections == null)
                         ? null
                         : [...new Set([...(a.sections || []), ...(b.sections || [])])],
    // sectionHeaderOnly only applies when ALL matching roles require it
    sectionHeaderOnly: !!(a.sectionHeaderOnly && b.sectionHeaderOnly),
  }
}

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
    resolved = resolved ? mergePolicies(resolved, scopePolicy) : scopePolicy
    if (resolved.columns === COL_CAT.ALL) break // max privilege reached
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
  if (policy.columns === COL_CAT.ALL) return true
  const cat = getColumnCategory(columnKey, columnTypeMap)
  if (!policy.columns.includes(cat)) return false
  if (policy.sectionHeaderOnly && isSectionHeader !== true) return false
  return true
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
  if (!policy.sections || policy.columns === COL_CAT.ALL) return true
  return policy.sections.includes(sectionKey)
}


