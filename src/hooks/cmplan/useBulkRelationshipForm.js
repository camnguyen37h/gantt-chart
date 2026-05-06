import { useCallback, useEffect, useMemo, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import {
  bulkCreateRelationships,
  fetchCITypeRelationships,
  fetchExistingRelationshipPairs,
} from '../../store/cmplan'
import {
  extractAllRelationshipTypeOptions,
  extractUniqueSourceTypes,
  extractUniqueTargetTypes,
  getValidRelationshipTypes,
} from '../../utils/cmplan/ciTypeRelationshipMappers'
import { generatePreviewItems } from '../../utils/cmplan/bulkRelationshipPreview'
import { validateBulkRelationships } from '../../utils/cmplan/bulkRelationshipValidation'
import { buildSummaryParts } from '../../utils/cmplan/bulkRelationshipFormatters'
import { createEmptyRule } from '../../utils/cmplan/bulkRelationshipFactories'
import useCIPanel from './useCIPanel'
import useProjectBasicInfo from './useProjectBasicInfo'

const buildInitialRules = () => [createEmptyRule()]

const selectFormState = (state) => ({
  existingPairs:    state.cmplan.ciRelationships.existingPairs,
  relsLoading:      state.cmplan.ciRelationships.loading,
  submitting:       state.cmplan.ciRelationships.submitting,
  ciTypeRels:       state.cmplan.ciTypeRelationships.items,
  typeRelsLoading:  state.cmplan.ciTypeRelationships.loading,
  cisByType:        state.cmplan.ciTypeRelationships.cisByType,
})

const mergeCIsById = (primary, secondary) => {
  const map = new Map()
  primary.forEach((ci) => map.set(ci.id, ci))
  secondary.forEach((ci) => map.set(ci.id, ci))
  return Array.from(map.values())
}

const splitNewAndDuplicates = (previewItems) => {
  const newItems = []
  let duplicateCount = 0
  previewItems.forEach((item) => {
    if (item.isDuplicate) duplicateCount += 1
    else newItems.push(item)
  })
  return { newItems, duplicateCount }
}

const toBulkPayload = (items) =>
  items.map((item) => ({
    sourceId:         item.sourceId,
    targetId:         item.targetId,
    relationshipType: item.relationshipType,
    appliedDate:      item.appliedDate || null,
    expiredDate:      item.expiredDate || null,
  }))

/**
 * Aggregates state for the Bulk Add Relationships screen: source/target
 * panels, rules, derived preview/validation, and the submit flow.
 */
const useBulkRelationshipForm = () => {
  const dispatch = useDispatch()
  const {
    existingPairs,
    relsLoading,
    submitting,
    ciTypeRels,
    typeRelsLoading,
    cisByType,
  } = useSelector(selectFormState, shallowEqual)
  const { pStartDate, pEndDate } = useProjectBasicInfo()

  const sourceTypes    = useMemo(() => extractUniqueSourceTypes(ciTypeRels), [ciTypeRels])
  const targetTypes    = useMemo(() => extractUniqueTargetTypes(ciTypeRels), [ciTypeRels])
  const relTypeOptions = useMemo(() => extractAllRelationshipTypeOptions(ciTypeRels), [ciTypeRels])

  const cisLoading = useSelector((state) => state.cmplan.ciTypeRelationships.loading)
  const sourcePanel = useCIPanel('source', sourceTypes, cisByType, cisLoading)
  const targetPanel = useCIPanel('target', targetTypes, cisByType, cisLoading)

  const [rules, setRules] = useState(buildInitialRules)

  const updateRule = useCallback((ruleId, updates) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    )
  }, [])
  const resetRules = useCallback(() => setRules(buildInitialRules()), [])

  // Bootstrap reference data once on mount.
  useEffect(() => {
    dispatch(fetchExistingRelationshipPairs())
    dispatch(fetchCITypeRelationships())
  }, [dispatch])

  // Reset rules whenever the (source, target) type pair changes.
  useEffect(() => {
    resetRules()
  }, [sourcePanel.ciType, targetPanel.ciType, resetRules])

  const validRelTypes = useMemo(
    () => getValidRelationshipTypes(ciTypeRels, sourcePanel.ciType, targetPanel.ciType),
    [ciTypeRels, sourcePanel.ciType, targetPanel.ciType]
  )

  const previewCIs = useMemo(
    () => mergeCIsById(sourcePanel.cis, targetPanel.cis),
    [sourcePanel.cis, targetPanel.cis]
  )

  const previewItems = useMemo(
    () => generatePreviewItems(
      sourcePanel.selectedIds,
      targetPanel.selectedIds,
      rules,
      existingPairs,
      previewCIs
    ),
    [sourcePanel.selectedIds, targetPanel.selectedIds, rules, existingPairs, previewCIs]
  )

  const { newItems, duplicateCount } = useMemo(
    () => splitNewAndDuplicates(previewItems),
    [previewItems]
  )

  const validationErrors = useMemo(
    () => validateBulkRelationships({
      sourceType:   sourcePanel.ciType,
      targetType:   targetPanel.ciType,
      sourceIds:    sourcePanel.selectedIds,
      targetIds:    targetPanel.selectedIds,
      rules,
      newItemCount: newItems.length,
      validRelTypes,
      pStartDate,
      pEndDate,
    }),
    [
      sourcePanel.ciType, targetPanel.ciType,
      sourcePanel.selectedIds, targetPanel.selectedIds,
      rules, newItems.length, validRelTypes,
      pStartDate, pEndDate,
    ]
  )

  const hasInvalidRelType = useMemo(() => {
    if (!sourcePanel.ciType || !targetPanel.ciType) return false
    return rules.some(
      (rule) => rule.relationshipType && !validRelTypes.has(rule.relationshipType)
    )
  }, [rules, sourcePanel.ciType, targetPanel.ciType, validRelTypes])

  const summaryParts = useMemo(
    () => buildSummaryParts(
      sourcePanel.selectedIds,
      targetPanel.selectedIds,
      rules,
      newItems.length
    ),
    [sourcePanel.selectedIds, targetPanel.selectedIds, rules, newItems.length]
  )

  const resetForm = useCallback(() => {
    sourcePanel.reset()
    targetPanel.reset()
    resetRules()
  }, [sourcePanel, targetPanel, resetRules])

  const submitBulkRelationships = useCallback(
    () => dispatch(bulkCreateRelationships(toBulkPayload(newItems))),
    [dispatch, newItems]
  )

  return {
    // CI Type catalogues
    sourceType:        sourcePanel.ciType,
    targetType:        targetPanel.ciType,
    sourceTypes,
    targetTypes,
    // CI lists
    sourceCIs:         sourcePanel.cis,
    targetCIs:         targetPanel.cis,
    sourceLoading:     sourcePanel.loading,
    targetLoading:     targetPanel.loading,
    // Selections
    sourceIds:         sourcePanel.selectedIds,
    targetIds:         targetPanel.selectedIds,
    // Search
    sourceSearch:      sourcePanel.searchText,
    targetSearch:      targetPanel.searchText,
    // Rules + derived
    rules,
    relTypeOptions,
    validRelTypes,
    previewItems,
    newItems,
    duplicateCount,
    validationErrors,
    hasInvalidRelType,
    summaryParts,
    submitting,
    isBootstrapping:   relsLoading || typeRelsLoading,
    applyDisabled:     validationErrors.length > 0 || hasInvalidRelType,
    // Handlers
    setSourceType:      sourcePanel.setType,
    setTargetType:      targetPanel.setType,
    setSourceSelection: sourcePanel.setSelectedIds,
    setTargetSelection: targetPanel.setSelectedIds,
    setSourceSearch:    sourcePanel.setSearch,
    setTargetSearch:    targetPanel.setSearch,
    updateRule,
    resetForm,
    submitBulkRelationships,
  }
}

export default useBulkRelationshipForm
