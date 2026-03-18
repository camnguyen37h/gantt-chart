import { BP_ROLES } from './roles'

/**
 * Scope constants — one entry per module / view-mode tab that has column-level access control.
 * To add a new module: add its constant here, then add policy entries in PERMISSION_MATRIX below.
 */
export const SCOPE = {
  TOTAL:    'total',
  OB:       'OB',
  ONSITE:   'Onsite',
  OFFSHORE: 'Offshore',
  GENERAL:  'generalInformation',
  REVENUE:  'revenuePlan',
  DELIVERY: 'deliveryPlan',
}

/**
 * Column display categories derived from columnKey patterns.
 * '*' is a special sentinel meaning "all categories".
 */
export const COL_CAT = {
  ALL:      '*',
  TOTAL:    'total',
  INTERNAL: 'internal',
  ONSITE:   'onsite',
  OFFSHORE: 'offshore',
}

/**
 * Declarative permission matrix — the single source of truth for all module access.
 *
 * Structure:  role → scope → policy
 *
 * Policy fields:
 *   columns          {string[]|'*'}   Shorthand — applies to BOTH section-header rows and data rows.
 *   sectionColumns   {string[]|'*'}   Columns visible on section-header rows. Overrides `columns`.
 *   dataColumns      {string[]|'*'}   Columns visible on data rows. Overrides `columns`.
 *   sections         {string[]|null}  null = all sections; string[] = restricted to listed sectionKeys.
 *
 * Rule: if only `columns` is set → both row types use it.
 *       if `sectionColumns`/`dataColumns` are set → each row type uses its own list.
 *       Mix is allowed: e.g. `columns + sectionColumns` overrides only the header.
 *
 * Scope '*' acts as wildcard fallback for any scope not explicitly listed for that role.
 *
 * ─── How to extend ────────────────────────────────────────────────────────────────────────────
 * To add Revenue Plan permissions for BUL_ONSITE:
 *   [BP_ROLES.BUL_ONSITE]: {
 *     [SCOPE.TOTAL]:   { columns: [COL_CAT.TOTAL], sectionHeaderOnly: true },
 *     [SCOPE.REVENUE]: { columns: COL_CAT.ALL },   ← just add this line
 *   },
 * No new functions needed anywhere else.
 * ──────────────────────────────────────────────────────────────────────────────────────────────
 */
export const PERMISSION_MATRIX = {
  // ── Full access across all modules ──────────────────────────────────────────
  [BP_ROLES.DB_ADMIN]: { '*': { columns: COL_CAT.ALL } },
  [BP_ROLES.DB_BOM]:   { '*': { columns: COL_CAT.ALL } },
  [BP_ROLES.DB_FC]:    { '*': { columns: COL_CAT.ALL } },

  // ── Total tab: TOTAL column on section-header rows only; data rows hidden ───
  [BP_ROLES.SALE_ONSITE]:   { [SCOPE.TOTAL]: { sectionColumns: [COL_CAT.TOTAL], dataColumns: [] } },
  [BP_ROLES.BUL_ONSITE]:    { [SCOPE.TOTAL]: { sectionColumns: [COL_CAT.TOTAL], dataColumns: [] } },
  [BP_ROLES.DUL_ONSITE]:    { [SCOPE.TOTAL]: { sectionColumns: [COL_CAT.TOTAL], dataColumns: [] } },
  [BP_ROLES.G_LEAD_OB]:     { [SCOPE.TOTAL]: { sectionColumns: [COL_CAT.TOTAL], dataColumns: [] } },
  [BP_ROLES.G_LEAD_ONSITE]: { [SCOPE.TOTAL]: { sectionColumns: [COL_CAT.TOTAL], dataColumns: [] } },

  // ── DU Onsite: Total + Onsite + Internal ────────────────────────────────────
  [BP_ROLES.DU_ONSITE]: { [SCOPE.TOTAL]: { columns: [COL_CAT.TOTAL, COL_CAT.ONSITE, COL_CAT.INTERNAL] } },

  // ── DU Offshore: Total + Offshore ───────────────────────────────────────────
  [BP_ROLES.DU_OFFSHORE]: { [SCOPE.TOTAL]: { columns: [COL_CAT.TOTAL, COL_CAT.OFFSHORE] } },

  // ── Margin Offshore: Total + Offshore, MARGIN section only ──────────────────
  [BP_ROLES.MARGIN_OFFSHORE]: {
    [SCOPE.TOTAL]: { columns: [COL_CAT.TOTAL, COL_CAT.OFFSHORE], sections: ['MARGIN'] },
  },
}
