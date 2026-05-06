import { useCallback, useEffect, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import { useDispatch } from 'react-redux'
import { fetchCIsByType } from '../../store/cmplan'
import { CI_FETCH_DEBOUNCE_MS } from '../../utils/cmplan/bulkRelationshipConstants'

const EMPTY_LIST = Object.freeze([])
const INITIAL_FILTER = Object.freeze({ ciType: undefined, searchText: '' })

const buildSliceKey = (ciType, searchText) =>
  `${ciType}|${searchText}`

/**
 * Encapsulates all per-panel state for one side of the bulk-add screen
 * (Source or Target): CI-type filter, search text, selected CI ids, and the
 * debounced API fetch that keeps the list in sync with the current filter.
 */
const useCIPanel = (availableTypes, cisByType) => {
  const dispatch = useDispatch()
  const [filter, setFilter] = useState(INITIAL_FILTER)
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState(EMPTY_LIST)

  const cis = useMemo(() => {
    if (!filter.ciType) return EMPTY_LIST
    return cisByType[buildSliceKey(filter.ciType, filter.searchText)] || EMPTY_LIST
  }, [cisByType, filter.ciType, filter.searchText])

  // Auto-pick the first CI type once the catalogue is populated.
  useEffect(() => {
    if (filter.ciType || availableTypes.length === 0) return
    setFilter({ ciType: availableTypes[0].value, searchText: '' })
  }, [filter.ciType, availableTypes])

  // Clear selections whenever the panel switches CI type.
  useEffect(() => {
    if (!filter.ciType) return
    setSelectedIds(EMPTY_LIST)
  }, [filter.ciType])

  const debouncedFetch = useMemo(
    () =>
      debounce(
        (params) => dispatch(fetchCIsByType(params)).finally(() => setLoading(false)),
        CI_FETCH_DEBOUNCE_MS
      ),
    [dispatch]
  )
  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch])

  useEffect(() => {
    if (!filter.ciType) return
    setLoading(true)
    debouncedFetch({ ciType: filter.ciType, searchText: filter.searchText })
  }, [filter.ciType, filter.searchText, debouncedFetch])

  const setType = useCallback((ciType) => {
    setFilter({ ciType, searchText: '' })
  }, [])

  const setSearch = useCallback((searchText) => {
    setFilter((prev) => ({ ...prev, searchText }))
  }, [])

  const reset = useCallback(() => {
    setSelectedIds(EMPTY_LIST)
    setFilter((prev) => ({ ...prev, searchText: '' }))
  }, [])

  return {
    ciType: filter.ciType,
    searchText: filter.searchText,
    selectedIds,
    setSelectedIds,
    cis,
    loading,
    setType,
    setSearch,
    reset,
  }
}

export default useCIPanel
