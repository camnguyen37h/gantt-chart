import { isEmpty } from 'lodash'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { SCOPE } from '../permissions/policyMatrix'
import {
  canViewColumn,
  canViewSection,
  MASKED_VALUE,
  resolvePolicy,
} from '../permissions/viewPermissions'
import { formatNumber } from '../utils'

export const getSystemRoles = () => {
  try {
    const permissions = JSON.parse(localStorage.getItem('LoginRole')) || []
    return permissions.flatMap(p => p.activities || []).map(a => a.name)
  } catch (error) {
    return []
  }
}

const ENFORCED_POLICY_SCOPES = [SCOPE.KPI_BONUS]

const useBusinessPlanPermission = (scope, columnTypeMap) => {
  const normalizedScope = scope ? scope.toLowerCase() : scope
  const { userRoles, mvvLocationTypeIdMap } = useSelector(
    state => state.businessGeneralInformation
  )

  const isSingleCode = useMemo(
    () =>
      !isEmpty(mvvLocationTypeIdMap) &&
      Object.values(mvvLocationTypeIdMap).length === 1,
    [mvvLocationTypeIdMap]
  )

  const allRoles = useMemo(() => {
    const apiRoles = Array.isArray(userRoles) ? userRoles : []
    return ['DB-ADMIN']
  }, [userRoles])

  const resolvedMap = columnTypeMap || null

  const policy = useMemo(
    () => resolvePolicy(allRoles, normalizedScope),
    [allRoles, normalizedScope]
  )

  return useMemo(() => {
    if (isSingleCode) {
      return {
        userRoles: allRoles,
        canViewColumn: () => true,
        canViewCell: () => true,
        canViewSection: () => true,
        filterSections: sectionList => sectionList || [],
        canEditScope: ENFORCED_POLICY_SCOPES.includes(normalizedScope)
          ? !!(policy && policy.edit)
          : true,
        canViewScope: true,
        canViewDetails: true,
        maskedValue: MASKED_VALUE,
        renderColumn: (columnKey, value, percent) =>
          formatNumber(value, percent),
        renderCell: (item, columnKey, value, percent) =>
          formatNumber(value, percent),
      }
    }

    return {
      userRoles: allRoles,
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
  }, [allRoles, normalizedScope, resolvedMap, policy, isSingleCode])
}

export default useBusinessPlanPermission
