/**
 * useExportFile Hook
 * Manages export file workflow with polling, retries, and persistence
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  createExportJob,
  checkExportStatus,
  downloadExportFile,
  cancelExportJob,
  EXPORT_STATUS
} from '../utils/mockExportApi'

// Constants
const MAX_RETRY_COUNT = 6
const POLL_INTERVAL = 3000 // 3 seconds
const STORAGE_KEY = 'export_jobs'

/**
 * Get stored export jobs from localStorage
 */
const getStoredJobs = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to parse stored export jobs:', error)
    return {}
  }
}

/**
 * Save export job to localStorage
 */
const saveJobToStorage = (exportId, jobData) => {
  try {
    const jobs = getStoredJobs()
    jobs[exportId] = {
      ...jobData,
      lastUpdated: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  } catch (error) {
    console.error('Failed to save export job:', error)
  }
}

/**
 * Remove export job from localStorage
 */
const removeJobFromStorage = (exportId) => {
  try {
    const jobs = getStoredJobs()
    delete jobs[exportId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  } catch (error) {
    console.error('Failed to remove export job:', error)
  }
}

export const useExportFile = () => {
  const [exportState, setExportState] = useState({
    isExporting: false,
    exportId: null,
    status: null,
    progress: 0,
    error: null,
    retryCount: 0,
    fileName: null,
    isOnline: navigator.onlineState !== undefined ? navigator.onLine : true
  })

  const intervalRef = useRef(null)
  const mountedRef = useRef(true)

  /**
   * Update state safely (only if component is mounted)
   */
  const updateState = useCallback((updates) => {
    if (mountedRef.current) {
      setExportState(prev => ({ ...prev, ...updates }))
    }
  }, [])

  /**
   * Clear polling interval
   */
  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  /**
   * Handle export failure
   */
  const handleExportFailure = useCallback((error, exportId) => {
    clearPolling()
    updateState({
      isExporting: false,
      status: EXPORT_STATUS.FAILED,
      error: error || 'Export failed',
      progress: 100
    })

    if (exportId) {
      removeJobFromStorage(exportId)
    }
  }, [clearPolling, updateState])

  /**
   * Handle export success and download file
   */
  const handleExportSuccess = useCallback(async (exportId, fileName) => {
    clearPolling()
    
    try {
      updateState({
        status: EXPORT_STATUS.SUCCESS,
        progress: 100
      })

      // Download file
      const response = await downloadExportFile(exportId)
      
      if (response.success) {
        const { blob, fileName: downloadFileName } = response.data
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = downloadFileName || fileName || 'export.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        // Update state
        updateState({
          isExporting: false,
          fileName: downloadFileName
        })

        // Clean up storage
        removeJobFromStorage(exportId)

        return true
      } else {
        throw new Error('Download failed')
      }
    } catch (error) {
      console.error('Download error:', error)
      handleExportFailure('Failed to download file', exportId)
      return false
    }
  }, [clearPolling, updateState, handleExportFailure])

  /**
   * Poll export status
   */
  const pollExportStatus = useCallback(async (exportId) => {
    try {
      const response = await checkExportStatus(exportId)

      if (!response.success) {
        throw new Error(response.error || 'Failed to check status')
      }

      const { status, progress, fileName } = response.data

      // Update state
      updateState({
        status,
        progress: progress || 0,
        fileName: fileName || null
      })

      // Save to storage
      saveJobToStorage(exportId, {
        exportId,
        status,
        progress,
        fileName,
        retryCount: exportState.retryCount
      })

      // Handle status
      if (status === EXPORT_STATUS.SUCCESS) {
        await handleExportSuccess(exportId, fileName)
      } else if (status === EXPORT_STATUS.FAILED) {
        handleExportFailure('Export processing failed', exportId)
      } else if (status === EXPORT_STATUS.CANCELLED) {
        handleExportFailure('Export was cancelled', exportId)
      } else if (status === EXPORT_STATUS.PROCESSING) {
        // Increment retry count
        const newRetryCount = exportState.retryCount + 1
        
        updateState({
          retryCount: newRetryCount
        })

        // Check max retries
        if (newRetryCount >= MAX_RETRY_COUNT) {
          clearPolling()
          
          // Cancel the job
          try {
            await cancelExportJob(exportId)
          } catch (cancelError) {
            console.error('Failed to cancel job:', cancelError)
          }

          handleExportFailure(
            `Export timeout: exceeded maximum retry attempts (${MAX_RETRY_COUNT})`,
            exportId
          )
        }
      }
    } catch (error) {
      console.error('Polling error:', error)
      
      // Increment retry count on error
      const newRetryCount = exportState.retryCount + 1
      
      if (newRetryCount >= MAX_RETRY_COUNT) {
        handleExportFailure(
          `Network error: exceeded maximum retry attempts (${MAX_RETRY_COUNT})`,
          exportId
        )
      } else {
        updateState({
          retryCount: newRetryCount,
          error: 'Connection error, retrying...'
        })
      }
    }
  }, [exportState.retryCount, updateState, handleExportSuccess, handleExportFailure, clearPolling])

  /**
   * Start export process
   */
  const startExport = useCallback(async (params = {}) => {
    try {
      // Reset state
      updateState({
        isExporting: true,
        exportId: null,
        status: null,
        progress: 0,
        error: null,
        retryCount: 0,
        fileName: null
      })

      // Create export job
      const response = await createExportJob(params)

      if (!response.success) {
        throw new Error(response.error || 'Failed to create export job')
      }

      const { exportId } = response.data

      // Update state
      updateState({
        exportId,
        status: EXPORT_STATUS.PROCESSING
      })

      // Save to storage
      saveJobToStorage(exportId, {
        exportId,
        status: EXPORT_STATUS.PROCESSING,
        progress: 0,
        params,
        startedAt: Date.now()
      })

      // Start polling
      clearPolling()
      intervalRef.current = setInterval(() => {
        pollExportStatus(exportId)
      }, POLL_INTERVAL)

      // Initial status check
      await pollExportStatus(exportId)

      return exportId
    } catch (error) {
      console.error('Export start error:', error)
      handleExportFailure(error.message || 'Failed to start export', null)
      return null
    }
  }, [updateState, clearPolling, pollExportStatus, handleExportFailure])

  /**
   * Cancel export
   */
  const cancelExport = useCallback(async () => {
    if (exportState.exportId) {
      try {
        clearPolling()
        await cancelExportJob(exportState.exportId)
        
        updateState({
          isExporting: false,
          status: EXPORT_STATUS.CANCELLED,
          error: 'Export cancelled by user'
        })

        removeJobFromStorage(exportState.exportId)
      } catch (error) {
        console.error('Cancel error:', error)
        updateState({
          error: 'Failed to cancel export'
        })
      }
    }
  }, [exportState.exportId, clearPolling, updateState])

  /**
   * Cleanup old export jobs from storage (on page reload)
   * Remove all PROCESSING jobs since exportId is no longer valid after reload
   */
  const cleanupOldExports = useCallback(() => {
    const jobs = getStoredJobs()
    const activeJobs = Object.values(jobs).filter(
      job => job.status === EXPORT_STATUS.PROCESSING
    )

    if (activeJobs.length > 0) {
      console.log(`Cleaning up ${activeJobs.length} incomplete export(s) from previous session`)
      
      // Remove all PROCESSING jobs
      activeJobs.forEach(job => {
        removeJobFromStorage(job.exportId)
      })
    }
  }, [])

  /**
   * Handle online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      updateState({ isOnline: true, error: null })
      
      // Resume polling if there's an active export
      if (exportState.exportId && exportState.status === EXPORT_STATUS.PROCESSING) {
        clearPolling()
        intervalRef.current = setInterval(() => {
          pollExportStatus(exportState.exportId)
        }, POLL_INTERVAL)
      }
    }

    const handleOffline = () => {
      updateState({
        isOnline: false,
        error: 'Network connection lost'
      })
      clearPolling()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [exportState.exportId, exportState.status, updateState, clearPolling, pollExportStatus])

  /**
   * Handle beforeunload event (browser close/refresh)
   */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (exportState.isExporting && exportState.status === EXPORT_STATUS.PROCESSING) {
        // Save current state
        if (exportState.exportId) {
          saveJobToStorage(exportState.exportId, {
            exportId: exportState.exportId,
            status: exportState.status,
            progress: exportState.progress,
            retryCount: exportState.retryCount
          })
        }

        // Show confirmation dialog
        const message = 'Export is in progress. Are you sure you want to leave?'
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [exportState])

  /**
   * Cleanup old exports on mount
   */
  useEffect(() => {
    cleanupOldExports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false
      clearPolling()
    }
  }, [clearPolling])

  return {
    ...exportState,
    startExport,
    cancelExport
  }
}
