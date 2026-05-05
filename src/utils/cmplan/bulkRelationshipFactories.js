import { v4 as uuidv4 } from 'uuid'

/**
 * Build a deterministic key identifying a (source, type, target) relationship.
 */
export const buildRelationshipKey = (sourceId, relType, targetId) =>
  sourceId + '-' + relType + '-' + targetId

/**
 * Create an empty rule shape used by the Bulk Add Relationships form.
 */
export const createEmptyRule = () => ({
  id: uuidv4(),
  relationshipType: undefined,
  appliedDate: undefined,
  expiredDate: undefined,
})
