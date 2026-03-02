/**
 * Export File Hook
 * Manages file export workflow with polling, retry logic, and state persistence
 */

import { useReducer, useEffect, useRef, useCallback } from 'react'
import {
  createExportJob,
  checkExportStatus,
  downloadExportFile,
  cancelExportJob,
  EXPORT_STATUS
} from '../utils/mockExportApi'

// ============================================================================
// Constants
// ============================================================================

const CONFIG = {
  MAX_RETRIES: 6,
  POLL_INTERVAL: 3000,
  STORAGE_KEY: 'export_jobs'
}

const INITIAL_STATE = {
  isExporting: false,
  exportId: null,
  status: null,
  progress: 0,
  error: null,
  retryCount: 0,
  fileName: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
}

// ============================================================================
// Storage Utilities
// ============================================================================

const storage = {
  get: () => {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  },

  set: (exportId, jobData) => {
    try {
      const jobs = storage.get()
      jobs[exportId] = { ...jobData, lastUpdated: Date.now() }
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(jobs))
    } catch (error) {
      console.error('Storage save failed:', error)
    }
  },

  remove: (exportId) => {
    try {
      const jobs = storage.get()
      delete jobs[exportId]
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(jobs))
    } catch (error) {
      console.error('Storage remove failed:', error)
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEY)
    } catch (error) {
      console.error('Storage clear failed:', error)
    }
  }
}

// ============================================================================
// State Reducer
// ============================================================================

const actionTypes = {
  RESET: 'RESET',
  UPDATE: 'UPDATE',
  START: 'START',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  RETRY: 'RETRY',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE'
}

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.RESET:
      return { ...INITIAL_STATE, isOnline: state.isOnline }
    
    case actionTypes.UPDATE:
      return { ...state, ...action.payload }
    
    case actionTypes.START:
      return {
        ...state,
        isExporting: true,
        exportId: action.payload.exportId,
        status: EXPORT_STATUS.PROCESSING,
        progress: 0,
        error: null,
        retryCount: 0
      }
    
    case actionTypes.SUCCESS:
      return {
        ...state,
        isExporting: false,
        status: EXPORT_STATUS.SUCCESS,
        progress: 100,
        fileName: action.payload.fileName
      }
    
    case actionTypes.FAILED:
      return {
        ...state,
        isExporting: false,
        status: EXPORT_STATUS.FAILED,
        progress: 100,
        error: action.payload.error
      }
    
    case actionTypes.CANCELLED:
      return {
        ...state,
        isExporting: false,
        status: EXPORT_STATUS.CANCELLED,
        error: 'Export cancelled'
      }
    
    case actionTypes.RETRY:
      return {
        ...state,
        retryCount: state.retryCount + 1,
        error: action.payload?.error || state.error
      }
    
    case actionTypes.ONLINE:
      return { ...state, isOnline: true, error: null }
    
    case actionTypes.OFFLINE:
      return { ...state, isOnline: false, error: 'Network offline' }
    
    default:
      return state
  }
}

// ============================================================================
// File Download Utility
// ============================================================================

/**
 * Trigger browser file download
 * @param {Blob} blob - File blob
 * @param {string} fileName - Download file name
 */
const triggerDownload = (blob, fileName) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Custom hook for managing file export workflow
 * @returns {Object} Export state and control functions
 */
export const useExportFile = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const intervalRef = useRef(null)
  const mountedRef = useRef(true)
  const pollStatusRef = useRef(null)

  // ==========================================================================
  // Polling Control
  // ==========================================================================

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startPolling = useCallback((exportId) => {
    clearPolling()
    intervalRef.current = setInterval(() => {
      if (pollStatusRef.current) {
        pollStatusRef.current(exportId)
      }
    }, CONFIG.POLL_INTERVAL)
  }, [clearPolling])

  // ==========================================================================
  // Export Handlers
  // ==========================================================================

  /**
   * Handle export success - download file and cleanup
   */
  const handleSuccess = useCallback(async (exportId, fileName) => {
    clearPolling()

    try {
      const response = await downloadExportFile(exportId)
      
      if (!response.success) {
        throw new Error('Download failed')
      }

      const { blob, fileName: downloadFileName } = response.data
      
      triggerDownload(blob, downloadFileName || fileName || 'export.xlsx')
      
      dispatch({
        type: actionTypes.SUCCESS,
        payload: { fileName: downloadFileName }
      })

      storage.remove(exportId)
      return true
    } catch (error) {
      console.error('Download error:', error)
      dispatch({
        type: actionTypes.FAILED,
        payload: { error: 'Download failed' }
      })
      storage.remove(exportId)
      return false
    }
  }, [clearPolling])

  /**
   * Handle export failure - cleanup and update state
   */
  const handleFailure = useCallback((error, exportId) => {
    clearPolling()
    dispatch({
      type: actionTypes.FAILED,
      payload: { error: error || 'Export failed' }
    })
    if (exportId) storage.remove(exportId)
  }, [clearPolling])

  /**
   * Handle timeout - cancel job and fail
   */
  const handleTimeout = useCallback(async (exportId) => {
    clearPolling()
    
    try {
      await cancelExportJob(exportId)
    } catch (error) {
      console.error('Cancel on timeout failed:', error)
    }

    handleFailure(`Timeout: exceeded ${CONFIG.MAX_RETRIES} retries`, exportId)
  }, [clearPolling, handleFailure])

  // ==========================================================================
  // Status Polling
  // ==========================================================================

  /**
   * Poll export status and handle state transitions
   */
  const pollStatus = useCallback(async (exportId) => {
    if (!mountedRef.current) return

    try {
      const response = await checkExportStatus(exportId)

      if (!response.success) {
        throw new Error(response.error || 'Status check failed')
      }

      const { status, progress, fileName } = response.data

      // Update UI state
      dispatch({
        type: actionTypes.UPDATE,
        payload: { status, progress: progress || 0, fileName }
      })

      // Persist to storage
      storage.set(exportId, {
        exportId,
        status,
        progress,
        fileName,
        retryCount: state.retryCount
      })

      // Handle status transitions
      switch (status) {
        case EXPORT_STATUS.SUCCESS:
          await handleSuccess(exportId, fileName)
          break

        case EXPORT_STATUS.FAILED:
          handleFailure('Processing failed', exportId)
          break

        case EXPORT_STATUS.CANCELLED:
          handleFailure('Export cancelled', exportId)
          break

        case EXPORT_STATUS.PROCESSING: {
          const nextRetryCount = state.retryCount + 1

          console.log('nextRetryCount = ', nextRetryCount);
          
          
          if (nextRetryCount >= CONFIG.MAX_RETRIES) {
            await handleTimeout(exportId)
          } else {
            dispatch({ type: actionTypes.RETRY })
          }
          break
        }

        default:
          break
      }
    } catch (error) {
      console.error('Poll error:', error)
      
      const nextRetryCount = state.retryCount + 1
      
      
      if (nextRetryCount >= CONFIG.MAX_RETRIES) {
        handleFailure(`Network error: ${CONFIG.MAX_RETRIES} retries exceeded`, exportId)
      } else {
        dispatch({
          type: actionTypes.RETRY,
          payload: { error: 'Connection error, retrying...' }
        })
      }
    }
  }, [state.retryCount, handleSuccess, handleFailure, handleTimeout])

  // Store latest pollStatus in ref to avoid stale closure in setInterval
  useEffect(() => {
    pollStatusRef.current = pollStatus
  }, [pollStatus])

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Start new export job
   * @param {Object} params - Export parameters
   * @returns {Promise<string|null>} Export ID or null if failed
   */
  const startExport = useCallback(async (params = {}) => {
    try {
      dispatch({ type: actionTypes.RESET })

      const response = await createExportJob(params)

      if (!response.success) {
        throw new Error(response.error || 'Job creation failed')
      }

      const { exportId } = response.data

      dispatch({
        type: actionTypes.START,
        payload: { exportId }
      })

      storage.set(exportId, {
        exportId,
        status: EXPORT_STATUS.PROCESSING,
        progress: 0,
        params,
        startedAt: Date.now()
      })

      startPolling(exportId)
      
      // Call via ref to ensure we use the latest version with reset state
      if (pollStatusRef.current) {
        await pollStatusRef.current(exportId)
      }

      return exportId
    } catch (error) {
      console.error('Export start failed:', error)
      handleFailure(error.message || 'Failed to start export', null)
      return null
    }
  }, [startPolling, handleFailure])

  /**
   * Cancel active export
   */
  const cancelExport = useCallback(async () => {
    if (!state.exportId) return

    try {
      clearPolling()
      await cancelExportJob(state.exportId)
      
      dispatch({ type: actionTypes.CANCELLED })
      storage.remove(state.exportId)
    } catch (error) {
      console.error('Cancel failed:', error)
      dispatch({
        type: actionTypes.UPDATE,
        payload: { error: 'Failed to cancel' }
      })
    }
  }, [state.exportId, clearPolling])

  // ==========================================================================
  // Effects
  // ==========================================================================

  // Cleanup old exports on mount
  useEffect(() => {
    storage.clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: actionTypes.ONLINE })
      
      // Resume polling if export is active
      if (state.exportId && state.status === EXPORT_STATUS.PROCESSING) {
        startPolling(state.exportId)
      }
    }

    const handleOffline = () => {
      dispatch({ type: actionTypes.OFFLINE })
      clearPolling()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [state.exportId, state.status, clearPolling, startPolling])

  // Warn before leaving during active export
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (state.isExporting && state.status === EXPORT_STATUS.PROCESSING) {
        // Save state before leaving
        if (state.exportId) {
          storage.set(state.exportId, {
            exportId: state.exportId,
            status: state.status,
            progress: state.progress,
            retryCount: state.retryCount
          })
        }

        const message = 'Export in progress. Leave anyway?'
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      clearPolling()
    }
  }, [clearPolling])

  // ==========================================================================
  // Return API
  // ==========================================================================

  return {
    ...state,
    startExport,
    cancelExport
  }
}
