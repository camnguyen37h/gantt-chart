import { v4 as uuidv4 } from 'uuid'
import { RELATIONSHIP_TYPES } from './cmplanConstants'
import {
  DEFAULT_RELATIONSHIP_TYPE,
  DIRECTION_OUT,
  MAX_SOURCE_CIS,
  MAX_TARGET_CIS,
  MAX_RELATIONSHIPS_PER_BATCH,
} from './bulkRelationshipConstants'

// ── Helpers ──────────────────────────────────────────────────────────────────

export const createEmptyRule = () => ({
  id: uuidv4(),
  relationshipType: DEFAULT_RELATIONSHIP_TYPE,
  direction: DIRECTION_OUT,
})

export const buildRelationshipKey = (sourceId, relType, targetId) =>
  sourceId + '-' + relType + '-' + targetId

export const getRelTypeLabel = (value) => {
  const found = RELATIONSHIP_TYPES.find((t) => t.value === value)
  return found ? found.label : value
}

const buildCIMap = (allCIs) => {
  const ciMap = {}
  allCIs.forEach((ci) => {
    ciMap[ci.id] = ci
  })
  return ciMap
}

// ── Preview generation ───────────────────────────────────────────────────────

export const generatePreviewItems = (sourceCIs, targetCIs, rules, existingPairs, allCIs) => {
  const ciMap = buildCIMap(allCIs)
  const existingKeys = new Set(existingPairs)
  const items = []
  const seenKeys = new Set()

  rules.forEach((rule) => {
    if (!rule.relationshipType) return

    sourceCIs.forEach((sourceId) => {
      targetCIs.forEach((targetId) => {
        if (sourceId === targetId) return

        const actualSource = rule.direction === DIRECTION_OUT ? sourceId : targetId
        const actualTarget = rule.direction === DIRECTION_OUT ? targetId : sourceId
        const key = buildRelationshipKey(actualSource, rule.relationshipType, actualTarget)

        if (seenKeys.has(key)) return
        seenKeys.add(key)

        const srcCI = ciMap[actualSource]
        const tgtCI = ciMap[actualTarget]

        items.push({
          sourceId: actualSource,
          targetId: actualTarget,
          relationshipType: rule.relationshipType,
          sourceName: (srcCI && srcCI.name) || actualSource,
          targetName: (tgtCI && tgtCI.name) || actualTarget,
          isDuplicate: existingKeys.has(key),
          ruleId: rule.id,
        })
      })
    })
  })

  return items
}

// ── Validation ───────────────────────────────────────────────────────────────

export const validateBulkRelationships = (sourceIds, targetIds, rules, newItemCount) => {
  const errors = []

  if (sourceIds.length === 0) {
    errors.push('Please select at least one source CI.')
  }
  if (targetIds.length === 0) {
    errors.push('Please select at least one target CI.')
  }
  if (sourceIds.length > MAX_SOURCE_CIS) {
    errors.push('Maximum ' + MAX_SOURCE_CIS + ' source CIs allowed.')
  }
  if (targetIds.length > MAX_TARGET_CIS) {
    errors.push('Maximum ' + MAX_TARGET_CIS + ' target CIs allowed.')
  }

  const hasValidRule = rules.some((r) => r.relationshipType)
  if (!hasValidRule) {
    errors.push('At least one rule must have a relationship type selected.')
  }

  const ruleKeys = new Set()
  rules.forEach((r) => {
    if (r.relationshipType) {
      const rKey = r.relationshipType + '|' + r.direction
      if (ruleKeys.has(rKey)) {
        errors.push('Duplicate rule detected: same type and direction. Remove or change one.')
      }
      ruleKeys.add(rKey)
    }
  })

  if (newItemCount === 0 && sourceIds.length > 0 && targetIds.length > 0) {
    errors.push('All generated relationships already exist. Nothing new to create.')
  }

  if (newItemCount > MAX_RELATIONSHIPS_PER_BATCH) {
    errors.push(
      'Too many relationships (' + newItemCount + '). Maximum ' + MAX_RELATIONSHIPS_PER_BATCH + ' per batch. Reduce selections.'
    )
  }

  return errors
}

// ── Notification text builders ───────────────────────────────────────────────

export const buildConfirmContent = (newCount, duplicateCount) => {
  const message = 'Create ' + newCount + ' new relationship' + (newCount !== 1 ? 's' : '') + '?'
  if (duplicateCount <= 0) return message
  return message + '\n' + duplicateCount + ' existing relationship' + (duplicateCount !== 1 ? 's' : '') + ' will be skipped.'
}

export const buildSuccessDescription = (result) => {
  const created = result.totalCreated + ' relationship' + (result.totalCreated !== 1 ? 's' : '') + ' created successfully.'
  if (result.skippedDuplicates <= 0) return created
  return created + ' ' + result.skippedDuplicates + ' duplicate' + (result.skippedDuplicates !== 1 ? 's' : '') + ' skipped.'
}

// ── Summary ──────────────────────────────────────────────────────────────────

export const buildSummaryParts = (sourceIds, targetIds, rules, newItemCount) => {
  return {
    srcCount: sourceIds.length,
    tgtCount: targetIds.length,
    ruleCount: rules.filter((r) => r.relationshipType).length,
    total: newItemCount,
  }
}
