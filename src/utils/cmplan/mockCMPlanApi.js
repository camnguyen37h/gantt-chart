// CMPlan Mock API — simulates async REST API calls
// All functions return Promises to mirror real API behavior

import { v4 as uuidv4 } from 'uuid'
import {
  MOCK_CI_CLASSES,
  MOCK_ATTRIBUTE_DEFINITIONS,
  MOCK_CONFIGURATION_ITEMS,
  MOCK_CI_RELATIONSHIPS,
  MOCK_CI_GROUPS,
  MOCK_COMPLIANCE_POLICIES,
  MOCK_CI_AUDIT_LOG,
  MOCK_CI_RULE_CONFIGS,
} from './mockCMPlanData'

// In-memory mutable stores (reset on page refresh)
let ciClasses = [...MOCK_CI_CLASSES]
let attributeDefinitions = [...MOCK_ATTRIBUTE_DEFINITIONS]
let configurationItems = [...MOCK_CONFIGURATION_ITEMS]
let ciRelationships = [...MOCK_CI_RELATIONSHIPS]
let ciGroups = [...MOCK_CI_GROUPS]
let ciRuleConfigs = [...MOCK_CI_RULE_CONFIGS]
let compliancePolicies = [...MOCK_COMPLIANCE_POLICIES]
let ciAuditLog = [...MOCK_CI_AUDIT_LOG]

// Helper: append an audit log entry
const addAuditEntry = (partial) => {
  ciAuditLog = [
    ...ciAuditLog,
    {
      id: `log-${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      actor: 'current_user',
      ...partial,
    },
  ]
}

const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 200))

const successResponse = (data, extra = {}) => ({
  success: true,
  data,
  ...extra,
})

const errorResponse = (message, code = 400) => ({
  success: false,
  error: { message, code },
})

// ── CI Classes ───────────────────────────────────────────────────────────────
const ciClassesApi = {
  getAll: async () => {
    await delay()
    return successResponse([...ciClasses].sort((a, b) => a.sortOrder - b.sortOrder))
  },

  create: async (payload) => {
    await delay()
    const exists = ciClasses.find((c) => c.name === payload.name)
    if (exists) return errorResponse('A CI class with this name already exists.', 409)
    const newClass = {
      id: `class-${uuidv4().slice(0, 6)}`,
      ...payload,
      sortOrder: ciClasses.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    ciClasses = [...ciClasses, newClass]
    return successResponse(newClass)
  },

  update: async (id, payload) => {
    await delay()
    const index = ciClasses.findIndex((c) => c.id === id)
    if (index === -1) return errorResponse('CI class not found.', 404)
    ciClasses = ciClasses.map((c) =>
      c.id === id ? { ...c, ...payload, updatedAt: new Date().toISOString() } : c
    )
    return successResponse(ciClasses.find((c) => c.id === id))
  },

  remove: async (id) => {
    await delay()
    const hasItems = configurationItems.some((ci) => ci.ciClassId === id)
    if (hasItems)
      return errorResponse(
        'Cannot delete CI class: there are existing Configuration Items of this class.',
        409
      )
    ciClasses = ciClasses.filter((c) => c.id !== id)
    return successResponse({ id })
  },
}

// ── Attribute Definitions ─────────────────────────────────────────────────────
const attributeDefinitionsApi = {
  getAll: async (filters = {}) => {
    await delay()
    let result = [...attributeDefinitions]
    if (filters.ciClassId !== undefined) {
      result = result.filter(
        (a) => a.ciClassId === filters.ciClassId || a.ciClassId === null
      )
    }
    if (filters.isActive !== undefined) {
      result = result.filter((a) => a.isActive === filters.isActive)
    }
    return successResponse(result.sort((a, b) => a.sortOrder - b.sortOrder))
  },

  getByClassId: async (ciClassId) => {
    await delay()
    const result = attributeDefinitions
      .filter((a) => a.ciClassId === ciClassId || a.ciClassId === null)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    return successResponse(result)
  },

  create: async (payload) => {
    await delay()
    const newAttr = {
      id: `attr-${uuidv4().slice(0, 8)}`,
      ...payload,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    attributeDefinitions = [...attributeDefinitions, newAttr]
    return successResponse(newAttr)
  },

  update: async (id, payload) => {
    await delay()
    const index = attributeDefinitions.findIndex((a) => a.id === id)
    if (index === -1) return errorResponse('Attribute definition not found.', 404)
    attributeDefinitions = attributeDefinitions.map((a) =>
      a.id === id ? { ...a, ...payload, updatedAt: new Date().toISOString() } : a
    )
    return successResponse(attributeDefinitions.find((a) => a.id === id))
  },

  remove: async (id) => {
    await delay()
    attributeDefinitions = attributeDefinitions.filter((a) => a.id !== id)
    return successResponse({ id })
  },
}

// ── Configuration Items ───────────────────────────────────────────────────────
const configurationItemsApi = {
  getAll: async (params = {}) => {
    await delay()
    const {
      ciClassId,
      status,
      criticality,
      environment,
      search,
      page = 1,
      pageSize = 20,
    } = params

    let result = [...configurationItems].filter((ci) => ci.status !== 'retired' || status === 'retired')

    if (ciClassId) result = result.filter((ci) => ci.ciClassId === ciClassId)
    if (status) result = result.filter((ci) => ci.status === status)
    if (criticality) result = result.filter((ci) => ci.criticality === criticality)
    if (environment) result = result.filter((ci) => ci.environment === environment)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (ci) =>
          ci.name.toLowerCase().includes(q) ||
          (ci.shortDescription || '').toLowerCase().includes(q) ||
          (ci.owner || '').toLowerCase().includes(q) ||
          ci.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    result = result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    const total = result.length
    const paginated = result.slice((page - 1) * pageSize, page * pageSize)

    return successResponse(paginated, { total, page, pageSize })
  },

  getById: async (id) => {
    await delay()
    const ci = configurationItems.find((c) => c.id === id)
    if (!ci) return errorResponse('Configuration Item not found.', 404)
    const relations = ciRelationships.filter(
      (r) => r.sourceId === id || r.targetId === id
    )
    return successResponse({ ...ci, relations })
  },

  create: async (payload) => {
    await delay()
    const newCI = {
      id: `ci-${uuidv4().slice(0, 8)}`,
      ...payload,
      tags: payload.tags || [],
      attributes: payload.attributes || {},
      complianceStatus: 'unknown',
      complianceScore: null,
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    configurationItems = [newCI, ...configurationItems]
    addAuditEntry({ ciId: newCI.id, action: 'ci_created', meta: {} })
    return successResponse(newCI)
  },

  update: async (id, payload) => {
    await delay()
    const index = configurationItems.findIndex((c) => c.id === id)
    if (index === -1) return errorResponse('Configuration Item not found.', 404)
    const old = configurationItems[index]
    configurationItems = configurationItems.map((ci) =>
      ci.id === id
        ? { ...ci, ...payload, updatedAt: new Date().toISOString() }
        : ci
    )
    // Audit 1: CI class changed
    if (payload.ciClassId !== undefined && payload.ciClassId !== old.ciClassId) {
      const fromClass = ciClasses.find((c) => c.id === old.ciClassId)
      const toClass = ciClasses.find((c) => c.id === payload.ciClassId)
      addAuditEntry({
        ciId: id,
        action: 'ci_class_changed',
        meta: {
          fromClassId: old.ciClassId,
          fromClassName: fromClass?.label || old.ciClassId,
          toClassId: payload.ciClassId,
          toClassName: toClass?.label || payload.ciClassId,
        },
      })
    }

    // Audit 2: Status changed (own entry)
    if (payload.status !== undefined && payload.status !== old.status) {
      addAuditEntry({
        ciId: id,
        action: 'ci_status_changed',
        meta: { changes: [{ field: 'status', from: old.status, to: payload.status }] },
      })
    }

    // Audit 3: Basic info fields changed
    const BASIC_FIELDS = ['name', 'owner', 'department', 'environment', 'location', 'shortDescription', 'criticality']
    const basicChanges = BASIC_FIELDS.reduce((acc, f) => {
      if (payload[f] !== undefined && payload[f] !== old[f]) {
        acc.push({ field: f, from: old[f], to: payload[f] })
      }
      return acc
    }, [])
    if (basicChanges.length > 0) {
      addAuditEntry({ ciId: id, action: 'ci_updated', meta: { changes: basicChanges } })
    }

    // Audit 4: Attribute fields changed
    if (payload.attributes !== undefined) {
      const oldAttrs = old.attributes || {}
      const newAttrs = payload.attributes || {}
      const allKeys = new Set([...Object.keys(oldAttrs), ...Object.keys(newAttrs)])
      const attrChanges = []
      for (const key of allKeys) {
        if (JSON.stringify(oldAttrs[key]) !== JSON.stringify(newAttrs[key])) {
          const attrDef = attributeDefinitions.find((a) => a.name === key)
          attrChanges.push({ field: key, label: attrDef?.label || key, from: oldAttrs[key], to: newAttrs[key] })
        }
      }
      if (attrChanges.length > 0) {
        const ciClass = ciClasses.find((c) => c.id === (payload.ciClassId || old.ciClassId))
        addAuditEntry({
          ciId: id,
          action: 'ci_attr_updated',
          meta: { classLabel: ciClass?.label || '', changes: attrChanges },
        })
      }
    }

    return successResponse(configurationItems.find((c) => c.id === id))
  },

  remove: async (id) => {
    await delay()
    // Soft delete — set status to retired
    configurationItems = configurationItems.map((ci) =>
      ci.id === id
        ? { ...ci, status: 'retired', updatedAt: new Date().toISOString() }
        : ci
    )
    return successResponse({ id })
  },
}

// ── Relationships ─────────────────────────────────────────────────────────────
const relationshipsApi = {
  getAll: async () => {
    await delay()
    return successResponse([...ciRelationships])
  },

  getByCI: async (ciId) => {
    await delay()
    const result = ciRelationships.filter(
      (r) => r.sourceId === ciId || r.targetId === ciId
    )
    return successResponse(result)
  },

  create: async (payload) => {
    await delay()
    const newRel = {
      id: `rel-${uuidv4().slice(0, 8)}`,
      ...payload,
      expiredDate: payload.expiredDate || null,
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
    }
    ciRelationships = [...ciRelationships, newRel]
    // Audit for both sides
    const srcCI = configurationItems.find((c) => c.id === payload.sourceId)
    const tgtCI = configurationItems.find((c) => c.id === payload.targetId)
    addAuditEntry({
      ciId: payload.sourceId, action: 'rel_added',
      meta: { relId: newRel.id, relType: payload.relationshipType, peerId: payload.targetId, peerName: tgtCI?.name || payload.targetId, direction: 'outbound', expiredDate: newRel.expiredDate },
    })
    addAuditEntry({
      ciId: payload.targetId, action: 'rel_added',
      meta: { relId: newRel.id, relType: payload.relationshipType, peerId: payload.sourceId, peerName: srcCI?.name || payload.sourceId, direction: 'inbound', expiredDate: newRel.expiredDate },
    })
    return successResponse(newRel)
  },

  update: async (id, payload) => {
    await delay()
    const rel = ciRelationships.find((r) => r.id === id)
    if (!rel) return errorResponse('Relationship not found.', 404)
    ciRelationships = ciRelationships.map((r) =>
      r.id === id ? { ...r, ...payload } : r
    )
    if (payload.expiredDate !== undefined && payload.expiredDate !== rel.expiredDate) {
      const srcCI = configurationItems.find((c) => c.id === rel.sourceId)
      const tgtCI = configurationItems.find((c) => c.id === rel.targetId)
      addAuditEntry({
        ciId: rel.sourceId, action: 'rel_updated',
        meta: { relId: id, relType: rel.relationshipType, peerId: rel.targetId, peerName: tgtCI?.name || rel.targetId, direction: 'outbound', changes: [{ field: 'expiredDate', from: rel.expiredDate, to: payload.expiredDate }] },
      })
      addAuditEntry({
        ciId: rel.targetId, action: 'rel_updated',
        meta: { relId: id, relType: rel.relationshipType, peerId: rel.sourceId, peerName: srcCI?.name || rel.sourceId, direction: 'inbound', changes: [{ field: 'expiredDate', from: rel.expiredDate, to: payload.expiredDate }] },
      })
    }
    return successResponse(ciRelationships.find((r) => r.id === id))
  },

  remove: async (id) => {
    await delay()
    const rel = ciRelationships.find((r) => r.id === id)
    ciRelationships = ciRelationships.filter((r) => r.id !== id)
    if (rel) {
      const srcCI = configurationItems.find((c) => c.id === rel.sourceId)
      const tgtCI = configurationItems.find((c) => c.id === rel.targetId)
      addAuditEntry({
        ciId: rel.sourceId, action: 'rel_removed',
        meta: { relId: id, relType: rel.relationshipType, peerId: rel.targetId, peerName: tgtCI?.name || rel.targetId, direction: 'outbound' },
      })
      addAuditEntry({
        ciId: rel.targetId, action: 'rel_removed',
        meta: { relId: id, relType: rel.relationshipType, peerId: rel.sourceId, peerName: srcCI?.name || rel.sourceId, direction: 'inbound' },
      })
    }
    return successResponse({ id })
  },
}

// ── Groups ────────────────────────────────────────────────────────────────────
const groupsApi = {
  getAll: async () => {
    await delay()
    return successResponse([...ciGroups])
  },

  create: async (payload) => {
    await delay()
    const newGroup = {
      id: `grp-${uuidv4().slice(0, 8)}`,
      ...payload,
      ciIds: payload.ciIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    ciGroups = [...ciGroups, newGroup]
    return successResponse(newGroup)
  },

  update: async (id, payload) => {
    await delay()
    ciGroups = ciGroups.map((g) =>
      g.id === id ? { ...g, ...payload, updatedAt: new Date().toISOString() } : g
    )
    return successResponse(ciGroups.find((g) => g.id === id))
  },

  remove: async (id) => {
    await delay()
    ciGroups = ciGroups.filter((g) => g.id !== id)
    return successResponse({ id })
  },
}

// ── Compliance ────────────────────────────────────────────────────────────────
const complianceApi = {
  getPolicies: async () => {
    await delay()
    return successResponse([...compliancePolicies])
  },

  createPolicy: async (payload) => {
    await delay()
    const newPolicy = {
      id: `pol-${uuidv4().slice(0, 8)}`,
      ...payload,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    compliancePolicies = [...compliancePolicies, newPolicy]
    return successResponse(newPolicy)
  },

  getSummary: async () => {
    await delay()
    const activeCIs = configurationItems.filter((ci) => ci.status !== 'retired')
    const compliant = activeCIs.filter((ci) => ci.complianceStatus === 'compliant').length
    const nonCompliant = activeCIs.filter((ci) => ci.complianceStatus === 'non_compliant').length
    const unknown = activeCIs.filter((ci) => ci.complianceStatus === 'unknown').length
    const total = activeCIs.length
    const scores = activeCIs
      .map((ci) => ci.complianceScore)
      .filter((s) => s !== null && s !== undefined)
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null

    return successResponse({
      total,
      compliant,
      nonCompliant,
      unknown,
      averageScore: avgScore,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
    })
  },

  getStats: async () => {
    await delay()
    const activeCIs = configurationItems.filter((ci) => ci.status !== 'retired')

    const byClass = ciClasses.map((cls) => ({
      classId: cls.id,
      className: cls.label,
      color: cls.color,
      count: activeCIs.filter((ci) => ci.ciClassId === cls.id).length,
    }))

    const byStatus = ['active', 'inactive', 'maintenance', 'pending'].map((s) => ({
      status: s,
      count: activeCIs.filter((ci) => ci.status === s).length,
    }))

    const byCriticality = ['low', 'medium', 'high', 'critical'].map((c) => ({
      criticality: c,
      count: activeCIs.filter((ci) => ci.criticality === c).length,
    }))

    const byEnvironment = ['production', 'staging', 'development', 'testing', 'dr'].map(
      (e) => ({
        environment: e,
        count: activeCIs.filter((ci) => ci.environment === e).length,
      })
    )

    const recent = [...activeCIs]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)

    return successResponse({
      total: activeCIs.length,
      byClass,
      byStatus,
      byCriticality,
      byEnvironment,
      recent,
    })
  },
}

// ── CI Audit Log ─────────────────────────────────────────────────────────────
const ciAuditLogApi = {
  getByCI: async (ciId) => {
    await delay()
    const result = ciAuditLog
      .filter((e) => e.ciId === ciId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    return successResponse(result)
  },
}

// ── CI Rule Config ───────────────────────────────────────────────────────────
const ciRuleConfigApi = {
  getAll: async ({ category, name, value } = {}) => {
    await delay()
    let result = [...ciRuleConfigs]
    if (category) result = result.filter((r) => r.category === category)
    if (name) result = result.filter((r) => r.name.toLowerCase().includes(name.toLowerCase()))
    if (value) result = result.filter((r) => r.value.toLowerCase().includes(value.toLowerCase()))
    return successResponse(result.sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
  },

  create: async (payload) => {
    await delay()
    const now = new Date().toISOString()
    const created = { id: `cr-${uuidv4().slice(0, 8)}`, ...payload, createdAt: now, updatedAt: now }
    ciRuleConfigs = [...ciRuleConfigs, created]
    return successResponse(created)
  },

  update: async (id, payload) => {
    await delay()
    const idx = ciRuleConfigs.findIndex((r) => r.id === id)
    if (idx === -1) return errorResponse('Rule config not found', 404)
    const updated = { ...ciRuleConfigs[idx], ...payload, updatedAt: new Date().toISOString() }
    ciRuleConfigs = ciRuleConfigs.map((r) => (r.id === id ? updated : r))
    return successResponse(updated)
  },

  remove: async (id) => {
    await delay()
    const exists = ciRuleConfigs.find((r) => r.id === id)
    if (!exists) return errorResponse('Rule config not found', 404)
    ciRuleConfigs = ciRuleConfigs.filter((r) => r.id !== id)
    return successResponse({ id })
  },
}

export const cmplanApi = {
  ciClasses: ciClassesApi,
  attributeDefinitions: attributeDefinitionsApi,
  configurationItems: configurationItemsApi,
  relationships: relationshipsApi,
  groups: groupsApi,
  compliance: complianceApi,
  auditLog: ciAuditLogApi,
  ciRuleConfig: ciRuleConfigApi,
}
