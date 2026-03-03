/**
 * Custom Hooks for Performance Score Setting
 * Reusable logic extracted into custom hooks for better organization
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { NotificationManager } from 'react-notifications'
import { Request } from '../performanceBonusApiConfig'
import { API_ENDPOINTS, PAGINATION, RESPONSE_STATUS, SCORE_LEVEL, MESSAGES } from './constants'

/**
 * Hook for fetching paginated roles
 * @returns {Object} { roles, pagination, loading, error, fetchRoles, handlePageChange }
 */
export const useRolesPagination = () => {
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState([])
  const [pagination, setPagination] = useState({
    pageNum: PAGINATION.DEFAULT_PAGE_NUM,
    total: 0,
  })
  const [error, setError] = useState(null)

  const fetchRoles = useCallback(async (pageNum = pagination.pageNum) => {
    setLoading(true)
    setError(null)

    try {
      const response = await Request(
        { url: API_ENDPOINTS.GET_ALL_ROLES, method: 'get' },
        { pageNum, pageSize: PAGINATION.DEFAULT_PAGE_SIZE }
      )

      if (response.status !== RESPONSE_STATUS.SUCCESS) {
        throw new Error(response.message || MESSAGES.ERROR.FETCH_ROLES_FAILED)
      }

      const rolesData = response.data?.roles || []
      const totalCount = response.data?.total || 0

      setRoles(rolesData)
      setPagination(prev => ({ ...prev, pageNum, total: totalCount }))
    } catch (err) {
      setError(err.message)
      NotificationManager.error(err.message)
      setRoles([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }, [pagination.pageNum])

  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, pageNum: page }))
  }, [])

  useEffect(() => {
    fetchRoles(pagination.pageNum)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageNum])

  return {
    roles,
    pagination,
    loading,
    error,
    fetchRoles,
    handlePageChange,
  }
}

/**
 * Hook for managing score data for multiple roles
 * @returns {Object} { scoreData, loadingMap, fetchScoreForRole, clearScoreForRole }
 */
export const useScoreData = () => {
  const [scoreData, setScoreData] = useState({})
  const [loadingMap, setLoadingMap] = useState({})
  const cacheRef = useRef(new Set()) // Track which roles have been fetched

  /**
   * Normalize raw score data from API
   */
  const normalizeScoreData = useCallback((rawData, roleId) => {
    const list = Array.isArray(rawData) ? rawData : []
    const mapped = list.map((item, idx) => ({
      scoreId: item.scoreId || `${roleId}-${idx}-${Date.now()}`,
      level: item.level != null ? String(item.level) : item.score || '',
      baseScore: Number(item.baseScore != null ? item.baseScore : item.base_score || 0),
      status: !!item.status,
      description: item.description || '',
    }))

    // Sort: N/A first, then others
    const isNA = (r) => String(r.level || '').trim().toUpperCase() === SCORE_LEVEL.NA_VALUE
    const naRecord = mapped.find(isNA)
    const otherRecords = mapped.filter(r => !isNA(r))

    return naRecord ? [naRecord, ...otherRecords] : otherRecords
  }, [])

  /**
   * Fetch score levels for a specific role
   */
  const fetchScoreForRole = useCallback(async (roleId) => {
    // Skip if already fetched
    if (cacheRef.current.has(roleId)) {
      return
    }

    setLoadingMap(prev => ({ ...prev, [roleId]: true }))

    try {
      const response = await Request(
        { url: API_ENDPOINTS.GET_SCORE_LEVEL_BY_ROLE, method: 'get' },
        { roleId }
      )

      if (response.status === RESPONSE_STATUS.SUCCESS) {
        const normalized = normalizeScoreData(response.data, roleId)
        setScoreData(prev => ({ ...prev, [roleId]: normalized }))
        cacheRef.current.add(roleId)
      } else {
        throw new Error(response.message || MESSAGES.ERROR.FETCH_SCORE_FAILED)
      }
    } catch (err) {
      console.error(`Failed to fetch score for role ${roleId}:`, err)
      setScoreData(prev => ({ ...prev, [roleId]: [] }))
      NotificationManager.error(err.message)
    } finally {
      setLoadingMap(prev => ({ ...prev, [roleId]: false }))
    }
  }, [normalizeScoreData])

  /**
   * Clear score data for a role (e.g., when collapsing panel)
   */
  const clearScoreForRole = useCallback((roleId) => {
    setScoreData(prev => {
      const newData = { ...prev }
      delete newData[roleId]
      return newData
    })
    cacheRef.current.delete(roleId)
  }, [])

  /**
   * Clear all cache
   */
  const clearAllCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  return {
    scoreData,
    loadingMap,
    fetchScoreForRole,
    clearScoreForRole,
    clearAllCache,
  }
}

/**
 * Hook for managing collapse panel state
 * @returns {Object} { activeKeys, handleCollapseChange }
 */
export const useCollapseState = (onPanelOpen) => {
  const [activeKeys, setActiveKeys] = useState([])

  const handleCollapseChange = useCallback((keys) => {
    const prevKeys = activeKeys
    setActiveKeys(keys)

    // Detect which panel was opened
    if (keys.length > prevKeys.length) {
      const newKey = keys.find(k => !prevKeys.includes(k))
      if (newKey && onPanelOpen) {
        onPanelOpen(newKey)
      }
    }
  }, [activeKeys, onPanelOpen])

  return {
    activeKeys,
    setActiveKeys,
    handleCollapseChange,
  }
}

/**
 * Hook for managing save operations per role
 * @returns {Object} { saveLoadingMap, handleSave }
 */
export const useSaveScoreConfiguration = () => {
  const [saveLoadingMap, setSaveLoadingMap] = useState({})

  const handleSave = useCallback(async (roleId, data) => {
    setSaveLoadingMap(prev => ({ ...prev, [roleId]: true }))

    try {
      const response = await Request(
        { url: API_ENDPOINTS.SAVE_CRITERIA_BY_ROLE, method: 'post' },
        { roleId, ...data }
      )

      if (response.status === RESPONSE_STATUS.SUCCESS) {
        NotificationManager.success(MESSAGES.SUCCESS.SAVE_SUCCESS)
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || MESSAGES.ERROR.SAVE_FAILED)
      }
    } catch (err) {
      NotificationManager.error(err.message)
      return { success: false, error: err.message }
    } finally {
      setSaveLoadingMap(prev => ({ ...prev, [roleId]: false }))
    }
  }, [])

  return {
    saveLoadingMap,
    handleSave,
  }
}
