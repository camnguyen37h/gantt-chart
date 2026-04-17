// CMPlan Constants — enums, label maps, color maps
// Convention: all values are snake_case strings matching DB enums

export const CI_CLASS_ICONS = {
  server: 'hdd',
  database: 'database',
  application: 'appstore',
  network_device: 'cluster',
  cloud_service: 'cloud',
  virtual_machine: 'desktop',
  storage: 'save',
  middleware: 'api',
}

export const CI_CLASS_COLORS = {
  server: '#1890ff',
  database: '#722ed1',
  application: '#13c2c2',
  network_device: '#fa8c16',
  cloud_service: '#52c41a',
  virtual_machine: '#eb2f96',
  storage: '#a0d911',
  middleware: '#096dd9',
}

// ── CI Status ────────────────────────────────────────────────────────────────
export const CI_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
  PENDING: 'pending',
}

export const CI_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  maintenance: 'Maintenance',
  retired: 'Retired',
  pending: 'Pending',
}

export const CI_STATUS_COLORS = {
  active: '#52c41a',
  inactive: '#bfbfbf',
  maintenance: '#faad14',
  retired: '#f5222d',
  pending: '#1890ff',
}

// ── CI Criticality ───────────────────────────────────────────────────────────
export const CI_CRITICALITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

export const CI_CRITICALITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const CI_CRITICALITY_COLORS = {
  low: '#a0d911',
  medium: '#faad14',
  high: '#fa8c16',
  critical: '#f5222d',
}

// ── Environment ──────────────────────────────────────────────────────────────
export const CI_ENVIRONMENT = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  DR: 'dr',
}

export const CI_ENVIRONMENT_LABELS = {
  production: 'Production',
  staging: 'Staging',
  development: 'Development',
  testing: 'Testing',
  dr: 'DR',
}

export const CI_ENVIRONMENT_COLORS = {
  production: '#f5222d',
  staging: '#faad14',
  development: '#1890ff',
  testing: '#13c2c2',
  dr: '#722ed1',
}

// ── Attribute Types ──────────────────────────────────────────────────────────
export const ATTR_TYPES = [
  { value: 'text', label: 'Text', icon: 'font-size' },
  { value: 'number', label: 'Number', icon: 'number' },
  { value: 'date', label: 'Date', icon: 'calendar' },
  { value: 'datetime', label: 'Date & Time', icon: 'clock-circle' },
  { value: 'select', label: 'Select (single)', icon: 'unordered-list' },
  { value: 'multiselect', label: 'Multi-select', icon: 'bars' },
  { value: 'checkbox', label: 'Checkbox (boolean)', icon: 'check-square' },
  { value: 'textarea', label: 'Textarea', icon: 'align-left' },
  { value: 'url', label: 'URL', icon: 'link' },
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'ip_address', label: 'IP Address', icon: 'wifi' },
]

export const ATTR_TYPE_LABELS = Object.fromEntries(
  ATTR_TYPES.map(({ value, label }) => [value, label])
)

export const ATTR_TYPE_ICONS = Object.fromEntries(
  ATTR_TYPES.map(({ value, icon }) => [value, icon])
)

// ── Relationship Types ───────────────────────────────────────────────────────
export const RELATIONSHIP_TYPES = [
  { value: 'depends_on', label: 'Depends On' },
  { value: 'runs_on', label: 'Runs On' },
  { value: 'hosts', label: 'Hosts' },
  { value: 'connects_to', label: 'Connects To' },
  { value: 'contains', label: 'Contains' },
  { value: 'uses', label: 'Uses' },
  { value: 'monitors', label: 'Monitors' },
  { value: 'backs_up', label: 'Backs Up' },
]

// ── Compliance ───────────────────────────────────────────────────────────────
export const COMPLIANCE_STATUS = {
  COMPLIANT: 'compliant',
  NON_COMPLIANT: 'non_compliant',
  UNKNOWN: 'unknown',
  EXEMPT: 'exempt',
}

export const COMPLIANCE_STATUS_LABELS = {
  compliant: 'Compliant',
  non_compliant: 'Non-Compliant',
  unknown: 'Unknown',
  exempt: 'Exempt',
}

export const COMPLIANCE_STATUS_COLORS = {
  compliant: '#52c41a',
  non_compliant: '#f5222d',
  unknown: '#bfbfbf',
  exempt: '#faad14',
}

export const POLICY_OPERATORS = [
  { value: 'not_empty', label: 'Is Not Empty' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'in', label: 'In List' },
  { value: 'regex', label: 'Matches Regex' },
]

// ── CI Group Types ────────────────────────────────────────────────────────────
export const GROUP_TYPES = [
  { value: 'service',     label: 'Service',     icon: 'api',           color: '#13c2c2', description: 'CIs forming an end-to-end service or product' },
  { value: 'team',        label: 'Team',         icon: 'team',          color: '#1890ff', description: 'CIs owned or managed by a specific team' },
  { value: 'environment', label: 'Environment',  icon: 'global',        color: '#f5222d', description: 'CIs belonging to an environment (prod, staging…)' },
  { value: 'application', label: 'Application',  icon: 'appstore',      color: '#722ed1', description: 'CIs that compose an application stack' },
  { value: 'location',    label: 'Location',     icon: 'environment',   color: '#fa8c16', description: 'CIs grouped by physical or cloud location' },
  { value: 'custom',      label: 'Custom',       icon: 'tag',           color: '#8c8c8c', description: 'User-defined grouping criteria' },
]

export const GROUP_TYPE_MAP = Object.fromEntries(
  GROUP_TYPES.map((t) => [t.value, t])
)

// ── CI Rule Config ───────────────────────────────────────────────────────────
export const RULE_CONFIG_CATEGORY_VALUES = {
  VALIDATION_RULE: 'validation_rule',
  RELATIONSHIP_TYPE: 'relationship_type',
}

export const RULE_CONFIG_CATEGORIES = [
  { value: RULE_CONFIG_CATEGORY_VALUES.VALIDATION_RULE,   label: 'Validation Rule' },
  { value: RULE_CONFIG_CATEGORY_VALUES.RELATIONSHIP_TYPE, label: 'Relationship Type' },
]

export const RULE_CONFIG_CATEGORY_COLORS = {
  [RULE_CONFIG_CATEGORY_VALUES.VALIDATION_RULE]:   'geekblue',
  [RULE_CONFIG_CATEGORY_VALUES.RELATIONSHIP_TYPE]: 'purple',
}

// ── CRM Direction ────────────────────────────────────────────────────────────
export const CRM_SOURCE_CI_TYPES = [
  { value: 'user',          label: 'User' },
  { value: 'email',         label: 'Email' },
  { value: 'account',       label: 'Account' },
  { value: 'contact',       label: 'Contact' },
  { value: 'lead',          label: 'Lead' },
  { value: 'opportunity',   label: 'Opportunity' },
]

export const CRM_DESTINATION_CI_TYPES = [
  { value: 'user',          label: 'User' },
  { value: 'email',         label: 'Email' },
  { value: 'account',       label: 'Account' },
  { value: 'contact',       label: 'Contact' },
  { value: 'lead',          label: 'Lead' },
  { value: 'opportunity',   label: 'Opportunity' },
]

export const CRM_JIRA_TYPES = [
  { value: 'user',    label: 'User' },
  { value: 'bug',     label: 'Bug' },
  { value: 'task',    label: 'Task' },
  { value: 'story',   label: 'Story' },
  { value: 'epic',    label: 'Epic' },
  { value: 'subtask', label: 'Sub-task' },
]
