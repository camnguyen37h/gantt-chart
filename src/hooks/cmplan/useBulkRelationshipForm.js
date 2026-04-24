import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  bulkCreateRelationships,
  fetchCIsByType,
  fetchCITypeRelationships,
  fetchExistingRelationshipPairs,
} from '../../store/cmplan'
import {
  buildSummaryParts,
  createEmptyRule,
  extractAllRelationshipTypeOptions,
  extractUniqueSourceTypes,
  extractUniqueTargetTypes,
  generatePreviewItems,
  getValidRelationshipTypes,
  validateBulkRelationships,
} from '../../utils/cmplan/bulkRelationshipUtils'

const EMPTY_LIST = []
const EMPTY_CI_TYPE_SLICE = { items: EMPTY_LIST, loading: false }

const mergeCIsById = (primary, secondary) => {
  const map = new Map()
  primary.forEach((ci) => map.set(ci.id, ci))
  secondary.forEach((ci) => map.set(ci.id, ci))
  return Array.from(map.values())
}

// Centralized state + derived data for the Bulk Add Relationships screen.
const useBulkRelationshipForm = () => {
  const dispatch = useDispatch()

  // ── Redux selectors ──
  const existingPairs = useSelector(state => state.cmplan.ciRelationships.existingPairs)
  const relsLoading = useSelector(state => state.cmplan.ciRelationships.loading)
  const submitting = useSelector(state => state.cmplan.ciRelationships.submitting)
  const ciTypeRels = useSelector(state => state.cmplan.ciTypeRelationships.items)
  const typeRelsLoading = useSelector(state => state.cmplan.ciTypeRelationships.loading)
  const cisByType = useSelector(state => state.cmplan.ciTypeRelationships.cisByType)

  // ── Local form state ──
  const [sourceType, setSourceType] = useState(undefined)
  const [targetType, setTargetType] = useState(undefined)
  const [sourceIds, setSourceIds] = useState(EMPTY_LIST)
  const [targetIds, setTargetIds] = useState(EMPTY_LIST)
  const [rules, setRules] = useState(() => [createEmptyRule()])

  // ── Derived: CI type catalogues and valid relationship types ──
  const sourceTypes = useMemo(() => extractUniqueSourceTypes(ciTypeRels), [ciTypeRels])
  const targetTypes = useMemo(() => extractUniqueTargetTypes(ciTypeRels), [ciTypeRels])
  const relTypeOptions = useMemo(() => extractAllRelationshipTypeOptions(ciTypeRels), [ciTypeRels])
  const validRelTypes = useMemo(
    () => getValidRelationshipTypes(ciTypeRels, sourceType, targetType),
    [ciTypeRels, sourceType, targetType]
  )

  // ── Per-type CI lists from redux cache ──
  const sourceSlice = useMemo(
    () => (sourceType && cisByType[sourceType]) || EMPTY_CI_TYPE_SLICE,
    [cisByType, sourceType]
  )
  const targetSlice = useMemo(
    () => (targetType && cisByType[targetType]) || EMPTY_CI_TYPE_SLICE,
    [cisByType, targetType]
  )

  // ── Bootstrap catalogues once ──
  useEffect(() => {
    dispatch(fetchExistingRelationshipPairs())
    dispatch(fetchCITypeRelationships())
  }, [dispatch])

  // ── Auto-select first source/target type after catalogue is ready ──
  useEffect(() => {
    if (!sourceType && sourceTypes.length > 0) setSourceType(sourceTypes[0].value)
  }, [sourceType, sourceTypes])

  useEffect(() => {
    if (!targetType && targetTypes.length > 0) setTargetType(targetTypes[0].value)
  }, [targetType, targetTypes])

  // ── Load CIs per selected type and reset its current selection ──
  useEffect(() => {
    if (!sourceType) return
    dispatch(fetchCIsByType(sourceType))
    setSourceIds(EMPTY_LIST)
  }, [sourceType, dispatch])

  useEffect(() => {
    if (!targetType) return
    dispatch(fetchCIsByType(targetType))
    setTargetIds(EMPTY_LIST)
  }, [targetType, dispatch])

  // ── Reset rules when the pair changes (old rule may be invalid) ──
  useEffect(() => {
    setRules([createEmptyRule()])
  }, [sourceType, targetType])

  // ── CI catalogue used by the preview to resolve labels ──
  const previewCIs = useMemo(
    () => mergeCIsById(sourceSlice.items, targetSlice.items),
    [sourceSlice.items, targetSlice.items]
  )

  // ── Rule handlers ──
  const updateRule = useCallback((ruleId, updates) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? Object.assign({}, r, updates) : r)))
  }, [])

  // ── Preview & validation ──
  const previewItems = useMemo(
    () => generatePreviewItems(sourceIds, targetIds, rules, existingPairs, previewCIs),
    [sourceIds, targetIds, rules, existingPairs, previewCIs]
  )

  const { newItems, duplicateCount } = useMemo(() => {
    const news = []
    let duplicates = 0
    previewItems.forEach((item) => {
      if (item.isDuplicate) duplicates += 1
      else news.push(item)
    })
    return { newItems: news, duplicateCount: duplicates }
  }, [previewItems])

  const validationErrors = useMemo(
    () =>
      validateBulkRelationships({
        sourceType,
        targetType,
        sourceIds,
        targetIds,
        rules,
        newItemCount: newItems.length,
        validRelTypes,
      }),
    [sourceType, targetType, sourceIds, targetIds, rules, newItems.length, validRelTypes]
  )

  const hasInvalidRelType = useMemo(() => {
    if (!sourceType || !targetType) return false
    return rules.some((r) => r.relationshipType && !validRelTypes.has(r.relationshipType))
  }, [rules, sourceType, targetType, validRelTypes])

  const summaryParts = useMemo(
    () => buildSummaryParts(sourceIds, targetIds, rules, newItems.length),
    [sourceIds, targetIds, rules, newItems.length]
  )

  const applyDisabled = validationErrors.length > 0 || hasInvalidRelType
  const isBootstrapping = relsLoading || typeRelsLoading

  // ── Reset whole form to initial ──
  const resetForm = useCallback(() => {
    setSourceIds(EMPTY_LIST)
    setTargetIds(EMPTY_LIST)
    setRules([createEmptyRule()])
  }, [])

  // ── Submit ──
  const submitBulkRelationships = useCallback(() => {
    const payload = newItems.map((item) => ({
      sourceId: item.sourceId,
      targetId: item.targetId,
      relationshipType: item.relationshipType,
      appliedDate: item.appliedDate,
      expiredDate: item.expiredDate,
    }))
    return dispatch(bulkCreateRelationships(payload))
  }, [dispatch, newItems])

  return {
    // data
    sourceType,
    targetType,
    sourceTypes,
    targetTypes,
    sourceCIs: sourceSlice.items,
    targetCIs: targetSlice.items,
    sourceLoading: sourceSlice.loading,
    targetLoading: targetSlice.loading,
    sourceIds,
    targetIds,
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
    isBootstrapping,
    applyDisabled,
    // handlers
    setSourceType,
    setTargetType,
    setSourceSelection: setSourceIds,
    setTargetSelection: setTargetIds,
    updateRule,
    resetForm,
    submitBulkRelationships,
  }
}

export default useBulkRelationshipForm
