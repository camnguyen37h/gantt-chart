import { v4 as uuidv4 } from 'uuid'

/**
 * Build a deterministic key identifying a (source, type, target) relationship.
 */
export const buildRelationshipKey = (sourceId, relType, targetId) =>
  sourceId + '-' + relType + '-' + targetId

/**
 * Create an empty rule shape used by the Bulk Add Relationships form.
 * Optionally pre-fill appliedDate / expiredDate with project-range defaults.
 */
export const createEmptyRule = ({ appliedDate, expiredDate } = {}) => ({
  id: uuidv4(),
  relationshipType: undefined,
  appliedDate: appliedDate || undefined,
  expiredDate: expiredDate || undefined,
})
