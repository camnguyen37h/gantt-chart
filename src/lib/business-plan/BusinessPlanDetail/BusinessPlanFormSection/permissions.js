import { ActivityKeyConstants } from '../../../constants/ActivityKeyConstants'

// ---------------------------------------------------------------------------
// COLUMN_RULES
// Keyed by columnKey. Value = array of activities (ANY match → visible) | null (always visible).
// _DEFAULT applies to every columnKey not explicitly listed (i.e. all DU columns).
// ---------------------------------------------------------------------------
export const COLUMN_RULES = {
  TOTAL: [
    ActivityKeyConstants.EDIT_BUSINESS_PLAN_ALL,
    ActivityKeyConstants.VIEW_BUSINESS_PLAN_TOTAL,
  ],
  INTERNAL: null, // always visible — no permission required
  _DEFAULT: [
    ActivityKeyConstants.DB_SPECIAL_VIEW_DU_ONSITE,
    ActivityKeyConstants.DB_SPECIAL_VIEW_DU_OFFSHORE,
    ActivityKeyConstants.DB_SPECIAL_VIEW_MARGIN_OFFSHORE,
  ],
}

// ---------------------------------------------------------------------------
// CELL_RULES
// Keyed by 'ROWKEY:COLKEY'. Defined entries take precedence over COLUMN_RULES.
// null  → always visible for that specific cell.
// array → any matching activity grants visibility for that specific cell.
//
// Add cell-level overrides here when a specific row+column combination needs
// different rules from the column default.
// Example:
//   'DIRECT_MARGIN_BONUS_RATE:TOTAL': [ActivityKeyConstants.VIEW_BUSINESS_PLAN_TOTAL],
// ---------------------------------------------------------------------------
export const CELL_RULES = {}
