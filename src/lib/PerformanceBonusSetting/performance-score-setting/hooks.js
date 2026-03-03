/**
 * Custom Hooks for Performance Score Setting
 * Reusable logic extracted into custom hooks for better organization
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { NotificationManager } from 'react-notifications'
import { Request } from '../performanceBonusApiConfig'
import { API_ENDPOINTS, PAGINATION, RESPONSE_STATUS, MESSAGES } from './constants'
import { isNAScore } from './helpers'

/**
 * Wrapper for API calls with consistent error handling
 * @param {Function} apiCall - Async function to execute
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise} Returns response data on success
 */
const executeApiCall = async (apiCall, onSuccess, onError) => {
  try {
    const response = await apiCall()
    
    if (response.status === RESPONSE_STATUS.SUCCESS) {
      if (onSuccess) onSuccess(response)
      return response.data
    }
    
    const errorMessage = response.message || 'Operation failed'
    if (onError) onError(errorMessage)
    return null
  } catch (error) {
    const errorMessage = error.message || 'An unexpected error occurred'
    if (onError) onError(errorMessage)
    return null
  }
}

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

    await executeApiCall(
      () => Request(
        { url: API_ENDPOINTS.GET_ALL_ROLES, method: 'get' },
        { pageNum, pageSize: PAGINATION.DEFAULT_PAGE_SIZE }
      ),
      (response) => {
        const rolesData = response.data?.roles || []
        const totalCount = response.data?.total || 0
        
        setRoles(rolesData)
        setPagination(previousPagination => ({ 
          ...previousPagination, 
          pageNum, 
          total: totalCount 
        }))
      },
      (errorMessage) => {
        setError(errorMessage)
        NotificationManager.error(errorMessage || MESSAGES.ERROR.FETCH_ROLES_FAILED)
        setRoles([])
        setPagination(previousPagination => ({ 
          ...previousPagination, 
          total: 0 
        }))
      }
    )

    setLoading(false)
  }, [pagination.pageNum])

  const handlePageChange = useCallback((page) => {
    setPagination(previousPagination => ({ 
      ...previousPagination, 
      pageNum: page 
    }))
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
   * Ensures N/A score is always first if present
   */
  const normalizeScoreData = useCallback((rawData, roleId) => {
    const rawScores = Array.isArray(rawData) ? rawData : []
    
    const normalizedScores = rawScores.map((item, index) => ({
      scoreId: item.scoreId || `${roleId}-${index}-${Date.now()}`,
      level: item.level != null ? String(item.level) : item.score || '',
      baseScore: Number(item.baseScore != null ? item.baseScore : item.base_score || 0),
      status: !!item.status,
      description: item.description || '',
    }))

    // Sort: N/A score first, then all other scores
    const naScore = normalizedScores.find(isNAScore)
    const regularScores = normalizedScores.filter(record => !isNAScore(record))

    return naScore ? [naScore, ...regularScores] : regularScores
  }, [])

  /**
   * Fetch score levels for a specific role
   * Uses cache to avoid redundant API calls
   */
  const fetchScoreForRole = useCallback(async (roleId) => {
    // Skip if already fetched
    if (cacheRef.current.has(roleId)) {
      return
    }

    setLoadingMap(previousLoadingMap => ({ 
      ...previousLoadingMap, 
      [roleId]: true 
    }))

    await executeApiCall(
      () => Request(
        { url: API_ENDPOINTS.GET_SCORE_LEVEL_BY_ROLE, method: 'get' },
        { roleId }
      ),
      (response) => {
        const normalizedScores = normalizeScoreData(response.data, roleId)
        setScoreData(previousScoreData => ({ 
          ...previousScoreData, 
          [roleId]: normalizedScores 
        }))
        cacheRef.current.add(roleId)
      },
      (errorMessage) => {
        console.error(`Failed to fetch score for role ${roleId}:`, errorMessage)
        setScoreData(previousScoreData => ({ 
          ...previousScoreData, 
          [roleId]: [] 
        }))
        NotificationManager.error(errorMessage || MESSAGES.ERROR.FETCH_SCORE_FAILED)
      }
    )

    setLoadingMap(previousLoadingMap => ({ 
      ...previousLoadingMap, 
      [roleId]: false 
    }))
  }, [normalizeScoreData])

  /**
   * Clear score data for a role (e.g., when collapsing panel)
   */
  const clearScoreForRole = useCallback((roleId) => {
    setScoreData(previousScoreData => {
      const updatedScoreData = { ...previousScoreData }
      delete updatedScoreData[roleId]
      return updatedScoreData
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
    const previousActiveKeys = activeKeys
    setActiveKeys(keys)

    // Detect which panel was newly opened
    if (keys.length > previousActiveKeys.length) {
      const newlyOpenedKey = keys.find(key => !previousActiveKeys.includes(key))
      if (newlyOpenedKey && onPanelOpen) {
        onPanelOpen(newlyOpenedKey)
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
    setSaveLoadingMap(previousSaveLoadingMap => ({ 
      ...previousSaveLoadingMap, 
      [roleId]: true 
    }))

    const responseData = await executeApiCall(
      () => Request(
        { url: API_ENDPOINTS.SAVE_CRITERIA_BY_ROLE, method: 'post' },
        { roleId, ...data }
      ),
      (response) => {
        NotificationManager.success(MESSAGES.SUCCESS.SAVE_SUCCESS)
      },
      (errorMessage) => {
        NotificationManager.error(errorMessage || MESSAGES.ERROR.SAVE_FAILED)
      }
    )

    setSaveLoadingMap(previousSaveLoadingMap => ({ 
      ...previousSaveLoadingMap, 
      [roleId]: false 
    }))

    return responseData
  }, [])

  return {
    saveLoadingMap,
    handleSave,
  }
}
