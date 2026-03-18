import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { canViewColumn, canViewSection, MASKED_VALUE } from '../permissions/viewPermissions'
import { formatNumber } from '../utils'

/** Reads activity names from localStorage permissions (system roles). */
const getSystemRoles = () => {
  try {
    const permissions = JSON.parse(localStorage.getItem('permissions')) || []
    return permissions.flatMap(p => p.activities || []).map(a => a.name)
  } catch {
    return []
  }
}

/**
 * Returns permission helpers scoped to a specific module / view-mode tab.
 *
 * Usage:
 *   const perms = useBusinessPlanPermission(SCOPE.TOTAL)
 *   const revenuePerms = useBusinessPlanPermission(SCOPE.REVENUE, columnTypeMap)
 *
 * To extend to a new module: just pass its SCOPE constant — no new functions needed.
 *
 * @param {string}      scope          SCOPE.TOTAL | SCOPE.REVENUE | SCOPE.DELIVERY | …
 * @param {Object|null} [columnTypeMap] optional { [columnKey]: 'onsite'|'offshore' } override
 */
function useBusinessPlanPermission(scope, columnTypeMap) {
  const userRoles = useSelector(state => state.businessGeneralInformation.userRoles)

  // Merge api roles + system roles once; recomputed only when userRoles changes
  const allRoles = useMemo(() => {
    const apiRoles = Array.isArray(userRoles) ? userRoles : []
    return [...apiRoles, ...getSystemRoles()]
  }, [userRoles])

  const resolvedMap = columnTypeMap || null

  return useMemo(() => ({
    /**
     * True if this column should show real data.
     * @param {string}  columnKey
     * @param {boolean} [isSectionHeader=false]
     */
    canViewColumn: (columnKey, isSectionHeader) =>
      canViewColumn(allRoles, scope, columnKey, resolvedMap, isSectionHeader),

    /**
     * True if this cell should show real data.
     * Masks when column is restricted OR item.permissionView === false (API-level restriction).
     * @param {{ permissionView?: boolean }|null} item
     * @param {string}  columnKey
     * @param {boolean} [isSectionHeader=false]
     */
    canViewCell: (item, columnKey, isSectionHeader) => {
      if (item != null && item.permissionView === false) return false
      return canViewColumn(allRoles, scope, columnKey, resolvedMap, isSectionHeader)
    },

    /**
     * True if this section is visible for the current user.
     * @param {string} sectionKey
     */
    canViewSection: (sectionKey) => canViewSection(allRoles, scope, sectionKey),

    /**
     * Filters a sectionList array to only sections visible for the current user.
     * @param {Array} sectionList
     */
    filterSections: (sectionList) => {
      if (!sectionList) return []
      return sectionList.filter(s => canViewSection(allRoles, scope, s.sectionKey || s))
    },

    maskedValue: MASKED_VALUE,

    /**
     * Returns formatted value if the column is visible, otherwise the masked placeholder.
     * @param {string}  columnKey
     * @param {*}       value
     * @param {boolean} [percent=false]
     * @param {boolean} [isSectionHeader=false]
     */
    renderColumn: (columnKey, value, percent, isSectionHeader) =>
      canViewColumn(allRoles, scope, columnKey, resolvedMap, isSectionHeader)
        ? formatNumber(value, percent)
        : MASKED_VALUE,

    /**
     * Returns formatted value if the cell is visible, otherwise the masked placeholder.
     * Masks when column is restricted OR item.permissionView === false.
     * @param {{ permissionView?: boolean }|null} item
     * @param {string}  columnKey
     * @param {*}       value
     * @param {boolean} [percent=false]
     * @param {boolean} [isSectionHeader=false]
     */
    renderCell: (item, columnKey, value, percent, isSectionHeader) => {
      if (item != null && item.permissionView === false) return MASKED_VALUE
      return canViewColumn(allRoles, scope, columnKey, resolvedMap, isSectionHeader)
        ? formatNumber(value, percent)
        : MASKED_VALUE
    },
  }), [allRoles, scope, resolvedMap])
}

export default useBusinessPlanPermission

