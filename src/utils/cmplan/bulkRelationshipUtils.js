/**
 * Barrel re-export for the Bulk Add Relationships feature. Prefer importing
 * from the focused modules directly; this file exists for backward
 * compatibility with existing call sites.
 */
export { buildRelationshipKey, createEmptyRule } from './bulkRelationshipFactories'
export {
  extractAllRelationshipTypeOptions,
  extractUniqueSourceTypes,
  extractUniqueTargetTypes,
  getRelTypeLabel,
  getValidRelationshipTypes,
} from './ciTypeRelationshipMappers'
export { generatePreviewItems } from './bulkRelationshipPreview'
export { validateBulkRelationships } from './bulkRelationshipValidation'
export {
  buildConfirmContent,
  buildSuccessDescription,
  buildSummaryParts,
} from './bulkRelationshipFormatters'
