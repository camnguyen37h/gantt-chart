import { PERMISSION_MATRIX, COL_CAT } from './policyMatrix'

export const MASKED_VALUE = '*****'

const getColumnCategory = (columnKey, columnTypeMap) => {
  if (columnTypeMap && columnTypeMap[columnKey]) return columnTypeMap[columnKey]
  if (columnKey === 'TOTAL') return COL_CAT.TOTAL
  if (columnKey === 'INTERNAL') return COL_CAT.INTERNAL
  if (columnKey.startsWith('SALE')) return COL_CAT.ONSITE
  if (columnKey.startsWith('DELIVERY_UNIT')) return COL_CAT.OFFSHORE
  return 'unknown'
}

const normalizePolicy = p => ({
  sectionColumns: p.sectionColumns !== undefined ? p.sectionColumns : p.columns,
  dataColumns: p.dataColumns !== undefined ? p.dataColumns : p.columns,
  sections: p.sections,
})

const mergeColArrays = (x, y) => {
  if (x === COL_CAT.ALL || y === COL_CAT.ALL) return COL_CAT.ALL
  return [...new Set([...(x || []), ...(y || [])])]
}

const mergePolicies = (a, b) => ({
  sectionColumns: mergeColArrays(a.sectionColumns, b.sectionColumns),
  dataColumns: mergeColArrays(a.dataColumns, b.dataColumns),
  sections:
    a.sections == null || b.sections == null
      ? null
      : [...new Set([...(a.sections || []), ...(b.sections || [])])],
})

const isFullAccess = p =>
  p.sectionColumns === COL_CAT.ALL && p.dataColumns === COL_CAT.ALL

const resolvePolicy = (allRoles, scope) => {
  let resolved = null
  for (let i = 0; i < allRoles.length; i++) {
    const rolePolicy = PERMISSION_MATRIX[allRoles[i]]
    if (!rolePolicy) continue
    const scopePolicy = rolePolicy[scope] || rolePolicy['*']
    if (!scopePolicy) continue
    const normalized = normalizePolicy(scopePolicy)
    resolved = resolved ? mergePolicies(resolved, normalized) : normalized
    if (isFullAccess(resolved)) break
  }
  return resolved
}

export const canViewColumn = (
  allRoles,
  scope,
  columnKey,
  columnTypeMap,
  isSectionHeader,
  sectionKey
) => {
  const policy = resolvePolicy(allRoles, scope)
  if (!policy) return false

  const columns = isSectionHeader ? policy.sectionColumns : policy.dataColumns
  if (columns === COL_CAT.ALL) return true
  if (!columns || columns.length === 0) return false

  if (policy.sections && sectionKey && !policy.sections.includes(sectionKey)) {
    return false
  }

  return columns.includes(getColumnCategory(columnKey, columnTypeMap))
}

export const canViewSection = (allRoles, scope, sectionKey) => {
  const policy = resolvePolicy(allRoles, scope)
  if (!policy) return false
  if (!policy.sections || isFullAccess(policy)) return true
  return policy.sections.includes(sectionKey)
}
