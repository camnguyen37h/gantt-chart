import { buildRelationshipKey } from './bulkRelationshipFactories'

const indexCIsById = (cis) => {
  const map = new Map()
  cis.forEach((ci) => map.set(ci.id, ci))
  return map
}

const buildPreviewItem = ({ rule, sourceId, targetId, ciIndex, existingKeys }) => {
  const srcCI = ciIndex.get(sourceId)
  const tgtCI = ciIndex.get(targetId)
  const key = buildRelationshipKey(sourceId, rule.relationshipType, targetId)
  return {
    sourceId,
    targetId,
    relationshipType: rule.relationshipType,
    appliedDate: rule.appliedDate || null,
    expiredDate: rule.expiredDate || null,
    sourceName: (srcCI && srcCI.name) || sourceId,
    targetName: (tgtCI && tgtCI.name) || targetId,
    isDuplicate: existingKeys.has(key),
    ruleId: rule.id,
  }
}

/**
 * Generate the cartesian product of (rule × source × target), deduplicated and
 * annotated with an `isDuplicate` flag against existing relationship keys.
 */
export const generatePreviewItems = (sourceIds, targetIds, rules, existingPairs, allCIs) => {
  const ciIndex = indexCIsById(allCIs)
  const existingKeys = new Set(existingPairs)
  const seenKeys = new Set()
  const items = []

  rules.forEach((rule) => {
    if (!rule.relationshipType) return
    sourceIds.forEach((sourceId) => {
      targetIds.forEach((targetId) => {
        if (sourceId === targetId) return
        const key = buildRelationshipKey(sourceId, rule.relationshipType, targetId)
        if (seenKeys.has(key)) return
        seenKeys.add(key)
        items.push(buildPreviewItem({ rule, sourceId, targetId, ciIndex, existingKeys }))
      })
    })
  })

  return items
}
