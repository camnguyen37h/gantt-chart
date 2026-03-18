import { BP_ROLES } from './roles'

/** Placeholder shown instead of real data when user lacks view permission */
export const MASKED_VALUE = '*****'

// ─── Role groups — edit here only; downstream logic auto-updates ───────────

const GLOBAL_ADMIN_ROLES    = new Set([BP_ROLES.DB_ADMIN, BP_ROLES.DB_BOM, BP_ROLES.DB_FC])
const TOTAL_ONLY_ROLES      = new Set([BP_ROLES.SALE_ONSITE, BP_ROLES.BUL_ONSITE, BP_ROLES.DUL_ONSITE, BP_ROLES.G_LEAD_OB, BP_ROLES.G_LEAD_ONSITE])
const DU_ONSITE_ROLES       = new Set([BP_ROLES.DU_ONSITE])
const DU_OFFSHORE_ROLES     = new Set([BP_ROLES.DU_OFFSHORE])
const MARGIN_OFFSHORE_ROLES = new Set([BP_ROLES.MARGIN_OFFSHORE])

// ─── Helpers ───────────────────────────────────────────────────────────────

/** @param {string[]} userRoles @param {Set<string>} roleSet @returns {boolean} */
const hasAnyRole = (userRoles, roleSet) => userRoles.some(r => roleSet.has(r))

/** Checks system roles stored in localStorage; flattened to a single `.some` pass */
const hasSystemRole = (roleSet) => {
  try {
    const permissions = JSON.parse(localStorage.getItem('permissions')) || []
    return permissions.flatMap(p => p.activities || []).some(a => roleSet.has(a.name))
  } catch {
    return false
  }
}

// ─── Column category ───────────────────────────────────────────────────────

/**
 * Maps a columnKey to its display category.
 * @param {string} columnKey
 * @param {Object|null} columnTypeMap  explicit override e.g. `{ DELIVERY_UNIT_34: 'onsite' }`
 * @returns {'total'|'internal'|'onsite'|'offshore'|'unknown'}
 */
export const getColumnCategory = (columnKey, columnTypeMap) => {
  if (columnTypeMap?.[columnKey]) return columnTypeMap[columnKey]
  if (columnKey === 'TOTAL')                return 'total'
  if (columnKey === 'INTERNAL')             return 'internal'
  if (columnKey.startsWith('SALE'))         return 'onsite'
  if (columnKey.startsWith('DELIVERY_UNIT')) return 'offshore'
  return 'unknown'
}

// ─── Permission computation ────────────────────────────────────────────────

/**
 * Derives Total-tab permission flags from API roles + localStorage system roles.
 * Priority: canViewAll > canViewTotalOnly > canViewDU* > canViewMarginOffshore
 * @param {string[]} apiUserRoles  from `data.userRoles` in Redux state
 * @returns {TotalTabPermissions}
 */
const computeTotalTabPermissions = (apiUserRoles) => {
  const roles = Array.isArray(apiUserRoles) ? apiUserRoles : []
  const canViewAll = hasAnyRole(roles, GLOBAL_ADMIN_ROLES) || hasSystemRole(GLOBAL_ADMIN_ROLES)

  return {
    canViewAll,
    canViewTotalOnly:      !canViewAll && hasAnyRole(roles, TOTAL_ONLY_ROLES),
    canViewDUOnsite:       !canViewAll && hasAnyRole(roles, DU_ONSITE_ROLES),
    canViewDUOffshore:     !canViewAll && hasAnyRole(roles, DU_OFFSHORE_ROLES),
    canViewMarginOffshore: !canViewAll && hasAnyRole(roles, MARGIN_OFFSHORE_ROLES),
  }
}

/**
 * Returns true if the column should show real data; false → render MASKED_VALUE.
 * `isSectionHeader`: canViewTotalOnly users see TOTAL only on section header rows, not data rows.
 * @param {string} columnKey
 * @param {TotalTabPermissions} totalPerms
 * @param {Object|null} columnTypeMap
 * @param {boolean} [isSectionHeader=false]
 * @returns {boolean}
 */
export const isColumnVisible = (columnKey, totalPerms, columnTypeMap, isSectionHeader) => {
  if (totalPerms.canViewAll) return true

  const cat = getColumnCategory(columnKey, columnTypeMap)

  if (totalPerms.canViewTotalOnly)      return isSectionHeader === true && cat === 'total'
  if (totalPerms.canViewDUOnsite)       return cat === 'total' || cat === 'onsite' || cat === 'internal'
  if (totalPerms.canViewDUOffshore)     return cat === 'total' || cat === 'offshore'
  if (totalPerms.canViewMarginOffshore) return cat === 'total' || cat === 'offshore'

  return false
}

/**
 * Returns restricted section keys, or null = all sections visible.
 * @param {TotalTabPermissions} totalPerms
 * @returns {string[]|null}
 */
export const getAllowedSections = (totalPerms) =>
  totalPerms.canViewMarginOffshore ? ['MARGIN'] : null

/**
 * Entry point — extend with OB / Onsite / Offshore tab permissions when ready.
 * @param {string[]} apiUserRoles
 * @returns {{ total: TotalTabPermissions }}
 */
export const computeViewPermissions = (apiUserRoles) => ({
  total: computeTotalTabPermissions(apiUserRoles),
  // ob:       computeOBTabPermissions(apiUserRoles),
  // onsite:   computeOnsiteTabPermissions(apiUserRoles),
  // offshore: computeOffshoreTabPermissions(apiUserRoles),
})

