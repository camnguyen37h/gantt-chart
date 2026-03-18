import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  canViewColumn,
  canViewSection,
  MASKED_VALUE,
} from '../permissions/viewPermissions'
import { formatNumber } from '../utils'

const getSystemRoles = () => {
  try {
    const permissions = JSON.parse(localStorage.getItem('LoginRole')) || []
    return permissions.flatMap(p => p.activities || []).map(a => a.name)
  } catch (error) {
    return []
  }
}

const useBusinessPlanPermission = (scope, columnTypeMap) => {
  const { userRoles } = useSelector(state => state.businessGeneralInformation)

  const allRoles = useMemo(() => {
    const apiRoles = Array.isArray(userRoles) ? userRoles : []
    return [...apiRoles, ...getSystemRoles()]
  }, [userRoles])

  const resolvedMap = columnTypeMap || null

  useEffect(() => {
    console.log('allRoles = ', allRoles)
  }, [])

  return useMemo(
    () => ({
      canViewColumn: (columnKey, isSectionHeader) =>
        canViewColumn(allRoles, scope, columnKey, resolvedMap, isSectionHeader),

      canViewCell: (item, columnKey, isSectionHeader) => {
        if (item != null && item.permissionView === false) return false
        return canViewColumn(
          allRoles,
          scope,
          columnKey,
          resolvedMap,
          isSectionHeader
        )
      },

      canViewSection: sectionKey => canViewSection(allRoles, scope, sectionKey),

      filterSections: sectionList => {
        if (!sectionList) return []
        return sectionList.filter(s =>
          canViewSection(allRoles, scope, s.sectionKey || s)
        )
      },

      maskedValue: MASKED_VALUE,

      renderColumn: (columnKey, value, percent, isSectionHeader) =>
        canViewColumn(allRoles, scope, columnKey, resolvedMap, isSectionHeader)
          ? formatNumber(value, percent)
          : MASKED_VALUE,

      renderCell: (item, columnKey, value, percent, isSectionHeader) => {
        if (item != null && item.permissionView === false) return MASKED_VALUE
        return canViewColumn(
          allRoles,
          scope,
          columnKey,
          resolvedMap,
          isSectionHeader
        )
          ? formatNumber(value, percent)
          : MASKED_VALUE
      },
    }),
    [allRoles, scope, resolvedMap]
  )
}

export default useBusinessPlanPermission
