import { v4 as uuidv4 } from 'uuid'
import {
  MAX_RELATIONSHIPS_PER_BATCH,
} from './bulkRelationshipConstants'

// ── Helpers ──────────────────────────────────────────────────────────────────

export const createEmptyRule = () => ({
  id: uuidv4(),
  relationshipType: null,
  appliedDate: null,
  expiredDate: null,
})

export const buildRelationshipKey = (sourceId, relType, targetId) =>
  sourceId + '-' + relType + '-' + targetId

const buildCIMap = (allCIs) => {
  const ciMap = {}
  allCIs.forEach((ci) => {
    ciMap[ci.id] = ci
  })
  return ciMap
}

// ── CI Type Relationship processing ──────────────────────────────────────────

/** Unique list of source CI types (value + label) from the triple matrix. */
export const extractUniqueSourceTypes = (ciTypeRelationships) => {
  const map = new Map()
  ciTypeRelationships.forEach((r) => {
    if (!map.has(r.ciTypeSource)) {
      map.set(r.ciTypeSource, { value: r.ciTypeSource, label: r.ciTypeSourceValue || r.ciTypeSource })
    }
  })
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
}

/** Unique list of target CI types (value + label) from the triple matrix. */
export const extractUniqueTargetTypes = (ciTypeRelationships) => {
  const map = new Map()
  ciTypeRelationships.forEach((r) => {
    if (!map.has(r.ciTypeTarget)) {
      map.set(r.ciTypeTarget, { value: r.ciTypeTarget, label: r.ciTypeTargetValue || r.ciTypeTarget })
    }
  })
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
}

/** Unique relationship-type options (value + label) across the full matrix. */
export const extractAllRelationshipTypeOptions = (ciTypeRelationships) => {
  const map = new Map()
  ciTypeRelationships.forEach((r) => {
    if (!map.has(r.typeConnection)) {
      map.set(r.typeConnection, { value: r.typeConnection, label: r.typeConnectionValue })
    }
  })
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
}

/** Relationship-type values valid for a given (source, target) pair. */
export const getValidRelationshipTypes = (ciTypeRelationships, sourceType, targetType) => {
  if (!sourceType || !targetType) return new Set()
  const set = new Set()
  ciTypeRelationships.forEach((r) => {
    if (r.ciTypeSource === sourceType && r.ciTypeTarget === targetType) {
      set.add(r.typeConnection)
    }
  })
  return set
}

export const getRelTypeLabel = (value, relTypeOptions) => {
  const found = (relTypeOptions || []).find((t) => t.value === value)
  return found ? found.label : value
}

// ── Preview generation ───────────────────────────────────────────────────────

export const generatePreviewItems = (sourceIds, targetIds, rules, existingPairs, allCIs) => {
  const ciMap = buildCIMap(allCIs)
  const existingKeys = new Set(existingPairs)
  const items = []
  const seenKeys = new Set()

  rules.forEach((rule) => {
    if (!rule.relationshipType) return

    sourceIds.forEach((sourceId) => {
      targetIds.forEach((targetId) => {
        if (sourceId === targetId) return

        const key = buildRelationshipKey(sourceId, rule.relationshipType, targetId)
        if (seenKeys.has(key)) return
        seenKeys.add(key)

        const srcCI = ciMap[sourceId]
        const tgtCI = ciMap[targetId]

        items.push({
          sourceId,
          targetId,
          relationshipType: rule.relationshipType,
          appliedDate: rule.appliedDate || null,
          expiredDate: rule.expiredDate || null,
          sourceName: (srcCI && srcCI.name) || sourceId,
          targetName: (tgtCI && tgtCI.name) || targetId,
          isDuplicate: existingKeys.has(key),
          ruleId: rule.id,
        })
      })
    })
  })

  return items
}

// ── Validation ───────────────────────────────────────────────────────────────

export const validateBulkRelationships = ({
  sourceType,
  targetType,
  sourceIds,
  targetIds,
  rules,
  newItemCount,
  validRelTypes,
}) => {
  const errors = []

  if (!sourceType) errors.push('Please select a source CI Type.')
  if (!targetType) errors.push('Please select a target CI Type.')

  if (sourceIds.length === 0) {
    errors.push('Please select at least one source CI.')
  }
  if (targetIds.length === 0) {
    errors.push('Please select at least one target CI.')
  }

  const hasValidRule = rules.some((r) => r.relationshipType)
  if (!hasValidRule) {
    errors.push('At least one rule must have a relationship type selected.')
  }

  // Each rule must reference a relationship type valid for the current (source,target) pair.
  if (sourceType && targetType && validRelTypes) {
    rules.forEach((r, idx) => {
      if (r.relationshipType && !validRelTypes.has(r.relationshipType)) {
        errors.push(
          'Rule #' + (idx + 1) + ': relationship type is not available for the selected source → target CI Types.'
        )
      }
    })
  }

  // Applied Date and Expired Date are required per rule.
  rules.forEach((r, idx) => {
    if (!r.appliedDate) {
      errors.push('Rule #' + (idx + 1) + ': Applied Date is required.')
    }
    if (!r.expiredDate) {
      errors.push('Rule #' + (idx + 1) + ': Expired Date is required.')
    }
    if (r.appliedDate && r.expiredDate && new Date(r.expiredDate) < new Date(r.appliedDate)) {
      errors.push('Rule #' + (idx + 1) + ': Expired Date must be on or after Applied Date.')
    }
  })

  // Disallow duplicate relationship types across rules.
  const seenTypes = new Set()
  rules.forEach((r) => {
    if (r.relationshipType) {
      if (seenTypes.has(r.relationshipType)) {
        errors.push('Duplicate rule detected: same relationship type used more than once.')
      }
      seenTypes.add(r.relationshipType)
    }
  })

  if (newItemCount === 0 && sourceIds.length > 0 && targetIds.length > 0 && hasValidRule) {
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

