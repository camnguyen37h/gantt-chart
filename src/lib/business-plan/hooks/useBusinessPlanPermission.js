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
  const normalizedScope = scope ? scope.toLowerCase() : scope
  const { userRoles } = useSelector(state => state.businessGeneralInformation)

  const allRoles = useMemo(() => {
    // const apiRoles = Array.isArray(userRoles) ? userRoles : []
    return ['DB-DUL-Onsite']
  }, [userRoles])

  const resolvedMap = columnTypeMap || null

  useEffect(() => {
    console.log('allRoles = ', allRoles)
  }, [])

  return useMemo(
    () => ({
      canViewColumn: (columnKey, isSectionHeader, sectionKey) =>
        canViewColumn(
          allRoles,
          normalizedScope,
          columnKey,
          resolvedMap,
          isSectionHeader,
          sectionKey
        ),

      canViewCell: (item, columnKey, isSectionHeader, sectionKey) => {
        if (item && item.permissionView === false) return false
        return canViewColumn(
          allRoles,
          normalizedScope,
          columnKey,
          resolvedMap,
          isSectionHeader,
          sectionKey
        )
      },

      canViewSection: sectionKey =>
        canViewSection(allRoles, normalizedScope, sectionKey),

      filterSections: sectionList => {
        if (!sectionList) return []
        return sectionList.filter(s =>
          canViewSection(allRoles, normalizedScope, s.sectionKey || s)
        )
      },

      maskedValue: MASKED_VALUE,

      renderColumn: (columnKey, value, percent, isSectionHeader, sectionKey) =>
        canViewColumn(
          allRoles,
          normalizedScope,
          columnKey,
          resolvedMap,
          isSectionHeader,
          sectionKey
        )
          ? formatNumber(value, percent)
          : MASKED_VALUE,

      renderCell: (
        item,
        columnKey,
        value,
        percent,
        isSectionHeader,
        sectionKey
      ) => {
        if (item && item.permissionView === false) return MASKED_VALUE
        return canViewColumn(
          allRoles,
          normalizedScope,
          columnKey,
          resolvedMap,
          isSectionHeader,
          sectionKey
        )
          ? formatNumber(value, percent)
          : MASKED_VALUE
      },
    }),
    [allRoles, normalizedScope, resolvedMap]
  )
}

export default useBusinessPlanPermission
