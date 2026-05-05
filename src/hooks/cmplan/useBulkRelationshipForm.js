import { useCallback, useEffect, useMemo, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import {
  bulkCreateRelationships,
  fetchCIsByType,
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
import useProjectBasicInfo from './useProjectBasicInfo'

const EMPTY_LIST = Object.freeze([])
const EMPTY_CI_TYPE_SLICE = Object.freeze({ items: EMPTY_LIST, loading: false, hasMore: false, page: 1 })
const INITIAL_FILTER = Object.freeze({ ciType: undefined, searchText: '' })
const CI_FETCH_DEBOUNCE_MS = 300

const selectFormState = state => ({
  existingPairs: state.cmplan.ciRelationships.existingPairs,
  relsLoading: state.cmplan.ciRelationships.loading,
  submitting: state.cmplan.ciRelationships.submitting,
  ciTypeRels: state.cmplan.ciTypeRelationships.items,
  typeRelsLoading: state.cmplan.ciTypeRelationships.loading,
  cisByType: state.cmplan.ciTypeRelationships.cisByType,
})

const buildInitialRules = () => [createEmptyRule()]

const mergeCIsById = (primary, secondary) => {
  const map = new Map()
  primary.forEach(ci => map.set(ci.id, ci))
  secondary.forEach(ci => map.set(ci.id, ci))
  return Array.from(map.values())
}

const splitNewAndDuplicates = previewItems => {
  const newItems = []
  let duplicateCount = 0
  previewItems.forEach(item => {
    if (item.isDuplicate) duplicateCount += 1
    else newItems.push(item)
  })
  return { newItems, duplicateCount }
}

const toBulkPayload = items =>
  items.map(item => ({
    sourceId: item.sourceId,
    targetId: item.targetId,
    relationshipType: item.relationshipType,
    appliedDate: item.appliedDate ?? null,
    expiredDate: item.expiredDate ?? null,
  }))

const resolveSlice = (cisByType, ciType) =>
  (ciType && cisByType[ciType]) || EMPTY_CI_TYPE_SLICE

/**
 * Aggregates all state for the Bulk Add Relationships screen: source/target
 * CI selection, rules, derived preview/validation, and the confirm-and-submit
 * flow. Returns the full data + handlers shape consumed by the page.
 *
 * @param {Object} options
 * @param {Function} options.onSubmitSuccess Invoked after a successful bulk
 *   create completes (typically used to navigate away from the page).
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

  // ── CI Type catalogues ────────────────────────────────────────────────
  const sourceTypes = useMemo(
    () => extractUniqueSourceTypes(ciTypeRels),
    [ciTypeRels]
  )
  const targetTypes = useMemo(
    () => extractUniqueTargetTypes(ciTypeRels),
    [ciTypeRels]
  )
  const relTypeOptions = useMemo(
    () => extractAllRelationshipTypeOptions(ciTypeRels),
    [ciTypeRels]
  )

  // ── Source / Target panel state ───────────────────────────────────────
  const [sourceFilter, setSourceFilter] = useState(INITIAL_FILTER)
  const [targetFilter, setTargetFilter] = useState(INITIAL_FILTER)
  const [sourceIds, setSourceIds] = useState(EMPTY_LIST)
  const [targetIds, setTargetIds] = useState(EMPTY_LIST)

  const sourceSlice = useMemo(
    () => resolveSlice(cisByType, sourceFilter.ciType),
    [cisByType, sourceFilter.ciType]
  )
  const targetSlice = useMemo(
    () => resolveSlice(cisByType, targetFilter.ciType),
    [cisByType, targetFilter.ciType]
  )

  // ── Rules state ───────────────────────────────────────────────────────
  const [rules, setRules] = useState(buildInitialRules)
  const updateRule = useCallback((ruleId, updates) => {
    setRules(prev =>
      prev.map(rule => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    )
  }, [])
  const resetRules = useCallback(() => setRules(buildInitialRules()), [])

  // ── Bootstrap reference data once on mount ────────────────────────────
  useEffect(() => {
    dispatch(fetchExistingRelationshipPairs())
    dispatch(fetchCITypeRelationships())
  }, [dispatch])

  // ── Auto-pick the first CI type once each catalogue is loaded ─────────
  useEffect(() => {
    if (sourceFilter.ciType || sourceTypes.length === 0) return
    setSourceFilter({ ciType: sourceTypes[0].value, searchText: '' })
  }, [sourceFilter.ciType, sourceTypes])

  useEffect(() => {
    if (targetFilter.ciType || targetTypes.length === 0) return
    setTargetFilter({ ciType: targetTypes[0].value, searchText: '' })
  }, [targetFilter.ciType, targetTypes])

  // ── Reset selected CIs whenever the panel's CI type changes ───────────
  useEffect(() => {
    if (!sourceFilter.ciType) return
    setSourceIds(EMPTY_LIST)
  }, [sourceFilter.ciType])

  useEffect(() => {
    if (!targetFilter.ciType) return
    setTargetIds(EMPTY_LIST)
  }, [targetFilter.ciType])

  // ── Reset rules when the (source, target) type pair changes ───────────
  useEffect(() => {
    resetRules()
  }, [sourceFilter.ciType, targetFilter.ciType, resetRules])

  // ── Debounced CI list fetches on any filter change ────────────────────
  useEffect(() => {
    if (!sourceFilter.ciType) return undefined
    const timer = setTimeout(
      () =>
        dispatch(
          fetchCIsByType({
            ciType: sourceFilter.ciType,
            searchText: sourceFilter.searchText,
            page: 1,
          })
        ),
      CI_FETCH_DEBOUNCE_MS
    )
    return () => clearTimeout(timer)
  }, [sourceFilter.ciType, sourceFilter.searchText, dispatch])

  useEffect(() => {
    if (!targetFilter.ciType) return undefined
    const timer = setTimeout(
      () =>
        dispatch(
          fetchCIsByType({
            ciType: targetFilter.ciType,
            searchText: targetFilter.searchText,
            page: 1,
          })
        ),
      CI_FETCH_DEBOUNCE_MS
    )
    return () => clearTimeout(timer)
  }, [targetFilter.ciType, targetFilter.searchText, dispatch])

  // ── Filter handlers ───────────────────────────────────────────────────
  const setSourceType = useCallback(ciType => {
    setSourceFilter({ ciType, searchText: '' })
  }, [])
  const setTargetType = useCallback(ciType => {
    setTargetFilter({ ciType, searchText: '' })
  }, [])
  const setSourceSearch = useCallback(searchText => {
    setSourceFilter(prev => ({ ...prev, searchText }))
  }, [])
  const setTargetSearch = useCallback(searchText => {
    setTargetFilter(prev => ({ ...prev, searchText }))
  }, [])

  // ── Derived: valid relationship types + preview catalogues ────────────
  const validRelTypes = useMemo(
    () =>
      getValidRelationshipTypes(
        ciTypeRels,
        sourceFilter.ciType,
        targetFilter.ciType
      ),
    [ciTypeRels, sourceFilter.ciType, targetFilter.ciType]
  )

  const previewCIs = useMemo(
    () => mergeCIsById(sourceSlice.items, targetSlice.items),
    [sourceSlice.items, targetSlice.items]
  )

  const previewItems = useMemo(
    () =>
      generatePreviewItems(
        sourceIds,
        targetIds,
        rules,
        existingPairs,
        previewCIs
      ),
    [sourceIds, targetIds, rules, existingPairs, previewCIs]
  )

  const { newItems, duplicateCount } = useMemo(
    () => splitNewAndDuplicates(previewItems),
    [previewItems]
  )

  const validationErrors = useMemo(
    () =>
      validateBulkRelationships({
        sourceType: sourceFilter.ciType,
        targetType: targetFilter.ciType,
        sourceIds,
        targetIds,
        rules,
        newItemCount: newItems.length,
        validRelTypes,
        pStartDate,
        pEndDate,
      }),
    [
      sourceFilter.ciType,
      targetFilter.ciType,
      sourceIds,
      targetIds,
      rules,
      newItems.length,
      validRelTypes,
      pStartDate,
      pEndDate,
    ]
  )

  const hasInvalidRelType = useMemo(() => {
    if (!sourceFilter.ciType || !targetFilter.ciType) return false
    return rules.some(
      rule => rule.relationshipType && !validRelTypes.has(rule.relationshipType)
    )
  }, [rules, sourceFilter.ciType, targetFilter.ciType, validRelTypes])

  const summaryParts = useMemo(
    () => buildSummaryParts(sourceIds, targetIds, rules, newItems.length),
    [sourceIds, targetIds, rules, newItems.length]
  )

  // ── Reset & submit ────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setSourceIds(EMPTY_LIST)
    setTargetIds(EMPTY_LIST)
    setSourceFilter(prev => ({ ...prev, searchText: '' }))
    setTargetFilter(prev => ({ ...prev, searchText: '' }))
    resetRules()
  }, [resetRules])

  const submitBulkRelationships = useCallback(
    () => dispatch(bulkCreateRelationships(toBulkPayload(newItems))),
    [dispatch, newItems]
  )

  return {
    // CI Type catalogues
    sourceType: sourceFilter.ciType,
    targetType: targetFilter.ciType,
    sourceTypes,
    targetTypes,
    // CI lists
    sourceCIs: sourceSlice.items,
    targetCIs: targetSlice.items,
    sourceLoading: sourceSlice.loading,
    targetLoading: targetSlice.loading,
    sourceHasMore: sourceSlice.hasMore,
    targetHasMore: targetSlice.hasMore,
    sourceCurrentPage: sourceSlice.page,
    targetCurrentPage: targetSlice.page,
    // Selections
    sourceIds,
    targetIds,
    // Search
    sourceSearch: sourceFilter.searchText,
    targetSearch: targetFilter.searchText,
    // Rules
    rules,
    relTypeOptions,
    validRelTypes,
    // Derived
    previewItems,
    newItems,
    duplicateCount,
    validationErrors,
    hasInvalidRelType,
    summaryParts,
    submitting,
    isBootstrapping: relsLoading || typeRelsLoading,
    applyDisabled: validationErrors.length > 0 || hasInvalidRelType,
    // Handlers
    setSourceType,
    setTargetType,
    setSourceSelection: setSourceIds,
    setTargetSelection: setTargetIds,
    setSourceSearch,
    setTargetSearch,
    updateRule,
    resetForm,
    submitBulkRelationships,
  }
}

export default useBulkRelationshipForm
