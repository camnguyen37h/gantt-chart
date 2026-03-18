/**
 * Business Plan role name constants.
 * These strings are returned by the API in data.userRoles[].
 *
 * To add a new role: add one entry here and reference it in viewPermissions.js.
 * To rename a role: update only this file, all permission rules update automatically.
 */
var BP_ROLES = {
  // ── Admin tier ── can view/edit everything ─────────────────────────────────
  DB_ADMIN: 'DB-ADMIN',
  DB_BOM: 'DB-BOM',
  DB_FC: 'DB-FC',

  // ── Sale roles ─────────────────────────────────────────────────────────────
  SALE_ONSITE: 'DB-Sale-Onsite',
  SALE_OFFSHORE: 'DB-Sale-Offshore',

  // ── BUL (Business Unit Lead) roles ────────────────────────────────────────
  BUL_ONSITE: 'DB-BUL-Onsite',
  BUL_OFFSHORE: 'DB-BUL-Offshore',

  // ── DUL (Delivery Unit Lead) roles ────────────────────────────────────────
  DUL_ONSITE: 'DB-DUL-Onsite',
  DUL_OFFSHORE: 'DB-DUL-Offshore',

  // ── G Lead roles ──────────────────────────────────────────────────────────
  G_LEAD_OB: 'DB-GL-OB',
  G_LEAD_ONSITE: 'DB-GL-Onsite',
  G_LEAD_OFFSHORE: 'DB-GL-Offshore',

  // ── DU-level restricted roles (limited column visibility) ─────────────────
  DU_ONSITE: 'DB-DU-Onsite',
  DU_OFFSHORE: 'DB-DU-Offshore',

  // ── Special section-restricted roles ──────────────────────────────────────
  MARGIN_OFFSHORE: 'DB-Margin-Offshore',
}

module.exports = { BP_ROLES: BP_ROLES }
