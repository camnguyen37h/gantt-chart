// ── Limits ───────────────────────────────────────────────────────────────────

export const MAX_SOURCE_CIS = 50
export const MAX_TARGET_CIS = 50
export const MAX_RULES = 10
export const MAX_RELATIONSHIPS_PER_BATCH = 500

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_RELATIONSHIP_TYPE = 'contains'

export const DIRECTION_OUT = 'out'
export const DIRECTION_IN = 'in'

// ── Display ──────────────────────────────────────────────────────────────────

export const RELATIONSHIP_TYPE_COLORS = {
  depends_on: '#f5222d',
  runs_on: '#fa8c16',
  hosts: '#52c41a',
  connects_to: '#1890ff',
  contains: '#faad14',
  uses: '#13c2c2',
  monitors: '#722ed1',
  backs_up: '#eb2f96',
}
