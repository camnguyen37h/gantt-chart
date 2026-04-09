import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  resolvePolicy,
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
  const { userRoles, generalInfos } = useSelector(state => state.businessGeneralInformation)

  const isSingleCode = useMemo(
    () => Array.isArray(generalInfos) && generalInfos.length === 1,
    [generalInfos]
  )

  const allRoles = useMemo(() => {
    // const apiRoles = Array.isArray(userRoles) ? userRoles : []
    // return [...apiRoles, ...getSystemRoles()]
    return ['DB-ADMIN']
  }, [userRoles])

  const resolvedMap = columnTypeMap || null

  const policy = useMemo(
    () => resolvePolicy(allRoles, normalizedScope),
    [allRoles, normalizedScope]
  )

  return useMemo(
    () => {
      if (isSingleCode) {
        return {
          canViewColumn: () => true,
          canViewCell: () => true,
          canViewSection: () => true,
          filterSections: sectionList => sectionList || [],
          canEditScope: true,
          canViewScope: true,
          canViewDetails: true,
          maskedValue: MASKED_VALUE,
          renderColumn: (columnKey, value, percent) => formatNumber(value, percent),
          renderCell: (item, columnKey, value, percent) => formatNumber(value, percent),
        }
      }

      return {
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

        canEditScope: !!(policy && policy.edit),

        canViewScope: policy !== null,

        canViewDetails: !!(policy && !policy.summaryOnly),

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
      }
    },
    [allRoles, normalizedScope, resolvedMap, policy, isSingleCode]
  )
}

export default useBusinessPlanPermission
