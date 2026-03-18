import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  computeViewPermissions,
  isColumnVisible,
  getAllowedSections,
  MASKED_VALUE,
} from '../permissions/viewPermissions'

/**
 * Provides view permissions for the current user in Business Plan Detail.
 *
 * Combines two permission sources:
 *   1. data.userRoles from the API  → stored in businessGeneralInformation.userRoles
 *   2. System roles in localStorage → checked inside viewPermissions.js via hasSystemRole
 * Default when no role matches: data is masked as '*****'.
 *
 * Usage:
 *   var perms = useBusinessPlanPermission()
 *   if (perms.canViewCell(item, columnKey)) { ... } else { render MASKED_VALUE }
 *   if (perms.total.canViewAll) { ... }
 *
 * @param {Object|null} [columnTypeMap]
 *   Optional { [columnKey]: 'onsite'|'offshore' } override map.
 *   Provide this when column locationType is known from generalInfos.
 */
function useBusinessPlanPermission(columnTypeMap) {
  var userRoles = useSelector(function (state) {
    return state.businessGeneralInformation.userRoles
  })

  // Recompute only when userRoles changes — guaranteed by Redux immutability
  var permissions = useMemo(
    function () {
      return computeViewPermissions(userRoles)
    },
    [userRoles]
  )

  var resolvedColumnTypeMap = columnTypeMap || null

  /**
   * Returns true if the column should display real data for this user.
   * Returns false → show MASKED_VALUE.
   *
   * @param {string} columnKey
   * @returns {boolean}
   */
  function checkColumnVisible(columnKey, isSectionHeader) {
    return isColumnVisible(columnKey, permissions.total, resolvedColumnTypeMap, isSectionHeader)
  }

  /**
   * Returns true if a specific cell should display real data.
   * A cell is masked when EITHER:
   *   - its column is not visible to the user, OR
   *   - permissionView === false on the cell itself (API-level restriction)
   *
   * @param {{ permissionView: boolean }} item  - cell object from businessPlanItems
   * @param {string}                     columnKey
   * @param {boolean}                    [isSectionHeader=false]
   * @returns {boolean}
   */
  function canViewCell(item, columnKey, isSectionHeader) {
    // null/undefined item means no API-level restriction — only column visibility matters
    if (item != null && item.permissionView === false) return false
    return checkColumnVisible(columnKey, isSectionHeader)
  }

  /**
   * Returns sections visible for the current user (Total tab).
   * Returns the original array unchanged when no section restriction applies.
   *
   * @param {Array} sectionList
   * @returns {Array}
   */
  function getVisibleSections(sectionList) {
    var allowedKeys = getAllowedSections(permissions.total)
    if (!allowedKeys) return sectionList
    if (!sectionList) return []
    return sectionList.filter(function (section) {
      return allowedKeys.indexOf(section.sectionKey) > -1
    })
  }

  return {
    total: permissions.total,
    canViewCell: canViewCell,
    checkColumnVisible: checkColumnVisible,
    getVisibleSections: getVisibleSections,
    MASKED_VALUE: MASKED_VALUE,
  }
}

export default useBusinessPlanPermission
