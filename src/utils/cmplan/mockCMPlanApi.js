// CMPlan Mock API — simulates async REST API calls
// All functions return Promises to mirror real API behavior

import { v4 as uuidv4 } from 'uuid'
import {
  MOCK_CI_TYPES,
  MOCK_ATTRIBUTE_DEFINITIONS,
  MOCK_CONFIGURATION_ITEMS,
  MOCK_CI_RELATIONSHIPS,
  MOCK_CI_GROUPS,
  MOCK_COMPLIANCE_POLICIES,
  MOCK_CI_AUDIT_LOG,
  MOCK_CI_RULE_CONFIGS,
  MOCK_CRM_DIRECTIONS,
  MOCK_CI_TYPE_RELATIONSHIPS,
} from './mockCMPlanData'

// In-memory mutable stores (reset on page refresh)
let ciTypes = [...MOCK_CI_TYPES]
let attributeDefinitions = [...MOCK_ATTRIBUTE_DEFINITIONS]
let configurationItems = [...MOCK_CONFIGURATION_ITEMS]
let ciRelationships = [...MOCK_CI_RELATIONSHIPS]
let ciGroups = [...MOCK_CI_GROUPS]
let ciRuleConfigs = [...MOCK_CI_RULE_CONFIGS]
let crmDirections = [...MOCK_CRM_DIRECTIONS]
let compliancePolicies = [...MOCK_COMPLIANCE_POLICIES]
let ciAuditLog = [...MOCK_CI_AUDIT_LOG]
let ciTypeRelationships = [...MOCK_CI_TYPE_RELATIONSHIPS]

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
const ciTypesApi = {
  getAll: async () => {
    await delay()
    return successResponse([...ciTypes].sort((a, b) => a.sortOrder - b.sortOrder))
  },

  create: async (payload) => {
    await delay()
    const exists = ciTypes.find((c) => c.name === payload.name)
    if (exists) return errorResponse('A CI class with this name already exists.', 409)
    const newClass = {
      id: `class-${uuidv4().slice(0, 6)}`,
      ...payload,
      sortOrder: ciTypes.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    ciTypes = [...ciTypes, newClass]
    return successResponse(newClass)
  },

  update: async (id, payload) => {
    await delay()
    const index = ciTypes.findIndex((c) => c.id === id)
    if (index === -1) return errorResponse('CI class not found.', 404)
    ciTypes = ciTypes.map((c) =>
      c.id === id ? { ...c, ...payload, updatedAt: new Date().toISOString() } : c
    )
    return successResponse(ciTypes.find((c) => c.id === id))
  },

  remove: async (id) => {
    await delay()
    const hasItems = configurationItems.some((ci) => ci.ciTypeId === id)
    if (hasItems)
      return errorResponse(
        'Cannot delete CI class: there are existing Configuration Items of this class.',
        409
      )
    ciTypes = ciTypes.filter((c) => c.id !== id)
    return successResponse({ id })
  },
}

// ── Attribute Definitions ─────────────────────────────────────────────────────
const attributeDefinitionsApi = {
  getAll: async (filters = {}) => {
    await delay()
    let result = [...attributeDefinitions]
    if (filters.ciTypeId !== undefined) {
      result = result.filter(
        (a) => a.ciTypeId === filters.ciTypeId || a.ciTypeId === null
      )
    }
    if (filters.isActive !== undefined) {
      result = result.filter((a) => a.isActive === filters.isActive)
    }
    return successResponse(result.sort((a, b) => a.sortOrder - b.sortOrder))
  },

  getByClassId: async (ciTypeId) => {
    await delay()
    const result = attributeDefinitions
      .filter((a) => a.ciTypeId === ciTypeId || a.ciTypeId === null)
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
      ciTypeId,
      status,
      criticality,
      environment,
      search,
      page = 1,
      pageSize = 20,
    } = params

    let result = [...configurationItems].filter((ci) => ci.status !== 'retired' || status === 'retired')

    if (ciTypeId) result = result.filter((ci) => ci.ciTypeId === ciTypeId)
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

  /**
   * Mirrors the "Ci By Ci Type" mock API — returns CIs whose ciTypeId matches the given ciType name.
   * ciType is a type name string (e.g. 'server', 'application').
   */
  getByType: async (ciType) => {
    await delay()
    if (!ciType) return successResponse([])
    const result = configurationItems
      .filter((ci) => ci.ciTypeId === ciType && ci.status !== 'retired')
      .sort((a, b) => a.name.localeCompare(b.name))
    return successResponse(result)
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
    if (payload.ciTypeId !== undefined && payload.ciTypeId !== old.ciTypeId) {
      const fromType = ciTypes.find((c) => c.id === old.ciTypeId)
      const toType = ciTypes.find((c) => c.id === payload.ciTypeId)
      addAuditEntry({
        ciId: id,
        action: 'ci_type_changed',
        meta: {
          fromTypeId: old.ciTypeId,
          fromTypeName: fromType?.label || old.ciTypeId,
          toTypeId: payload.ciTypeId,
          toTypeName: toType?.label || payload.ciTypeId,
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
        const ciType = ciTypes.find((c) => c.id === (payload.ciTypeId || old.ciTypeId))
        addAuditEntry({
          ciId: id,
          action: 'ci_attr_updated',
          meta: { typeLabel: ciType?.label || '', changes: attrChanges },
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

  /**
   * Lightweight endpoint — returns existing relationship keys as string[]
   * Format: "sourceId-relationshipType-targetId"
   */
  getExistingPairs: async () => {
    await delay()
    const pairs = ciRelationships.map(
      (r) => r.sourceId + '-' + r.relationshipType + '-' + r.targetId
    )
    return successResponse(pairs)
  },

  bulkCreate: async (relationships) => {
    await delay(500)
    if (!Array.isArray(relationships) || relationships.length === 0) {
      return errorResponse('No relationships provided.', 400)
    }
    const created = []
    const skippedDuplicates = []
    for (const payload of relationships) {
      const duplicate = ciRelationships.find(
        (r) =>
          r.sourceId === payload.sourceId &&
          r.targetId === payload.targetId &&
          r.relationshipType === payload.relationshipType
      )
      if (duplicate) {
        skippedDuplicates.push(payload)
        continue
      }
      const newRel = {
        id: 'rel-' + uuidv4().slice(0, 8),
        sourceId: payload.sourceId,
        targetId: payload.targetId,
        relationshipType: payload.relationshipType,
        description: payload.description || '',
        expiredDate: payload.expiredDate || null,
        createdBy: 'current_user',
        createdAt: new Date().toISOString(),
      }
      ciRelationships = [...ciRelationships, newRel]
      created.push(newRel)
      const srcCI = configurationItems.find((c) => c.id === payload.sourceId)
      const tgtCI = configurationItems.find((c) => c.id === payload.targetId)
      addAuditEntry({
        ciId: payload.sourceId, action: 'rel_added',
        meta: { relId: newRel.id, relType: payload.relationshipType, peerId: payload.targetId, peerName: (tgtCI && tgtCI.name) || payload.targetId, direction: 'outbound' },
      })
      addAuditEntry({
        ciId: payload.targetId, action: 'rel_added',
        meta: { relId: newRel.id, relType: payload.relationshipType, peerId: payload.sourceId, peerName: (srcCI && srcCI.name) || payload.sourceId, direction: 'inbound' },
      })
    }
    return successResponse({
      created,
      createdPairs: created.map(
        (r) => r.sourceId + '-' + r.relationshipType + '-' + r.targetId
      ),
      skippedDuplicates: skippedDuplicates.length,
      totalCreated: created.length,
      totalRequested: relationships.length,
    })
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

    const byClass = ciTypes.map((cls) => ({
      classId: cls.id,
      className: cls.label,
      color: cls.color,
      count: activeCIs.filter((ci) => ci.ciTypeId === cls.id).length,
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

// ── CRM Directions ───────────────────────────────────────────────────────────
const crmDirectionApi = {
  getAll: async ({ sourceCIType, destinationCIType, jiraType } = {}) => {
    await delay()
    let result = [...crmDirections]
    if (sourceCIType) result = result.filter((d) => d.sourceCIType === sourceCIType)
    if (destinationCIType) result = result.filter((d) => d.destinationCIType === destinationCIType)
    if (jiraType) result = result.filter((d) => d.jiraType === jiraType)
    return successResponse(result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
  },

  create: async (payload) => {
    await delay()
    const now = new Date().toISOString()
    const created = {
      id: 'crm-dir-' + uuidv4().slice(0, 8),
      ...payload,
      createdBy: 'current_user',
      updatedBy: 'current_user',
      createdAt: now,
      updatedAt: now,
    }
    crmDirections = [...crmDirections, created]
    return successResponse(created)
  },

  update: async (id, payload) => {
    await delay()
    const index = crmDirections.findIndex((d) => d.id === id)
    if (index === -1) return errorResponse('CRM direction not found', 404)
    const updated = {
      ...crmDirections[index],
      ...payload,
      updatedBy: 'current_user',
      updatedAt: new Date().toISOString(),
    }
    crmDirections = crmDirections.map((d) => (d.id === id ? updated : d))
    return successResponse(updated)
  },

  remove: async (id) => {
    await delay()
    const exists = crmDirections.find((d) => d.id === id)
    if (!exists) return errorResponse('CRM direction not found', 404)
    crmDirections = crmDirections.filter((d) => d.id !== id)
    return successResponse({ id })
  },
}

// ── CI Type Relationships ─────────────────────────────────────────────────────
const ciTypeRelationshipsApi = {
  /**
   * Mirrors the "Ci Type Relationship" mock API — returns the full matrix of
   * (ciTypeSource, typeConnection, ciTypeTarget) triples the system considers valid.
   */
  getAll: async () => {
    await delay()
    return successResponse([...ciTypeRelationships])
  },
}

export const cmplanApi = {
  ciTypes: ciTypesApi,
  attributeDefinitions: attributeDefinitionsApi,
  configurationItems: configurationItemsApi,
  relationships: relationshipsApi,
  groups: groupsApi,
  compliance: complianceApi,
  auditLog: ciAuditLogApi,
  ciRuleConfig: ciRuleConfigApi,
  crmDirection: crmDirectionApi,
  ciTypeRelationships: ciTypeRelationshipsApi,
}
