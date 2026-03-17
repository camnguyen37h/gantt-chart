import { useMemo } from 'react'
import { SourceConstants } from '../../constants/ActivityKeyConstants'
import {
  COLUMN_RULES,
  CELL_RULES,
} from '../BusinessPlanDetail/BusinessPlanFormSection/permissions'

// ---------------------------------------------------------------------------
// Internal helpers — not exported, no side effects
// ---------------------------------------------------------------------------

function buildActivitySet(perms) {
  if (!Array.isArray(perms)) return {}
  for (let i = 0; i < perms.length; i++) {
    if (
      perms[i].key === SourceConstants.BUSINESS_PLAN_DETAIL &&
      Array.isArray(perms[i].activities)
    ) {
      const result = {}
      for (let j = 0; j < perms[i].activities.length; j++) {
        result[perms[i].activities[j].name] = true
      }
      return result
    }
  }
  return {}
}

function hasAnyActivity(activitySet, rules) {
  if (rules === null) return true
  for (let k = 0; k < rules.length; k++) {
    if (activitySet[rules[k]] === true) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// useBusinessPlanPermission
//
// Parses localStorage once on mount (useMemo). Returns three functions:
//
//   hasActivity(activityKey)          — boolean, check one activity key directly
//   canViewColumn(columnKey)          — use when only columnKey is available
//                                       (e.g. metric header rows, column headers)
//   canViewCell(rowKey, columnKey)    — use in data rows; falls back to canViewColumn
//                                       when no cell-level override exists in CELL_RULES
// ---------------------------------------------------------------------------
export function useBusinessPlanPermission() {
  const activitySet = useMemo(function () {
    return buildActivitySet(JSON.parse(localStorage.getItem('permissions')))
  }, [])

  function hasActivity(activityKey) {
    return activitySet[activityKey] === true
  }

  function canViewColumn(columnKey) {
    const rules = Object.prototype.hasOwnProperty.call(COLUMN_RULES, columnKey)
      ? COLUMN_RULES[columnKey]
      : COLUMN_RULES._DEFAULT
    return hasAnyActivity(activitySet, rules)
  }

  function canViewCell(rowKey, columnKey) {
    const cellKey = rowKey + ':' + columnKey
    if (Object.prototype.hasOwnProperty.call(CELL_RULES, cellKey)) {
      return hasAnyActivity(activitySet, CELL_RULES[cellKey])
    }
    return canViewColumn(columnKey)
  }

  return { hasActivity, canViewColumn, canViewCell }
}
