/**
 * Mock Export API Service
 * Simulates large file export with polling mechanism
 */

// Simulated export storage
const exportJobs = new Map()

// Export status constants
export const EXPORT_STATUS = {
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
}

/**
 * Generate random export ID
 */
const generateExportId = () => {
  return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Simulate processing delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * API 1: Create Export Job
 * Initiates the export process and returns an export ID
 * @param {Object} params - Export parameters (filters, dateRange, etc.)
 * @returns {Promise<{exportId: string, message: string}>}
 */
export const createExportJob = async (params = {}) => {
  await delay(500) // Simulate API call delay

  const exportId = generateExportId()
  
  // Simulate random processing time (2-5 seconds)
  const processingTime = 2000 + Math.random() * 3000
  
  // Simulate 10% chance of failure
  const willFail = Math.random() < 0.1

  exportJobs.set(exportId, {
    id: exportId,
    status: EXPORT_STATUS.PROCESSING,
    createdAt: Date.now(),
    processingTime,
    willFail,
    params,
    progress: 0
  })

  // Simulate background processing
  setTimeout(() => {
    const job = exportJobs.get(exportId)
    if (job && job.status === EXPORT_STATUS.PROCESSING) {
      if (willFail) {
        exportJobs.set(exportId, {
          ...job,
          status: EXPORT_STATUS.FAILED,
          error: 'Export failed due to server error',
          progress: 100
        })
      } else {
        exportJobs.set(exportId, {
          ...job,
          status: EXPORT_STATUS.SUCCESS,
          fileUrl: `/downloads/${exportId}.xlsx`,
          fileName: `export_${new Date().toISOString().split('T')[0]}.xlsx`,
          fileSize: Math.floor(1024 * 1024 * (5 + Math.random() * 20)), // 5-25 MB
          progress: 100
        })
      }
    }
  }, processingTime)

  return {
    success: true,
    data: {
      exportId,
      message: 'Export job created successfully'
    }
  }
}

/**
 * API 2: Check Export Status
 * Polls the export job status
 * @param {string} exportId - Export job ID
 * @returns {Promise<{status: string, progress: number, ...}>}
 */
export const checkExportStatus = async (exportId) => {
  await delay(300) // Simulate API call delay

  const job = exportJobs.get(exportId)

  if (!job) {
    return {
      success: false,
      error: 'Export job not found',
      data: null
    }
  }

  // Calculate progress for PROCESSING status
  if (job.status === EXPORT_STATUS.PROCESSING) {
    const elapsed = Date.now() - job.createdAt
    const progress = Math.min(95, Math.floor((elapsed / job.processingTime) * 100))
    
    exportJobs.set(exportId, {
      ...job,
      progress
    })

    return {
      success: true,
      data: {
        exportId: job.id,
        status: job.status,
        progress,
        createdAt: job.createdAt
      }
    }
  }

  // Return final status
  return {
    success: true,
    data: {
      exportId: job.id,
      status: job.status,
      progress: job.progress,
      createdAt: job.createdAt,
      fileUrl: job.fileUrl,
      fileName: job.fileName,
      fileSize: job.fileSize,
      error: job.error
    }
  }
}

/**
 * API 3: Download Export File
 * Downloads the completed export file
 * @param {string} exportId - Export job ID
 * @returns {Promise<Blob>}
 */
export const downloadExportFile = async (exportId) => {
  await delay(500) // Simulate API call delay

  const job = exportJobs.get(exportId)

  if (!job) {
    throw new Error('Export job not found')
  }

  if (job.status !== EXPORT_STATUS.SUCCESS) {
    throw new Error(`Cannot download file. Current status: ${job.status}`)
  }

  // Simulate file download by creating a mock Excel file
  // In real scenario, this would return the actual file blob
  const mockExcelContent = `Export Data - ${job.id}\nGenerated at: ${new Date(job.createdAt).toISOString()}`
  const blob = new Blob([mockExcelContent], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })

  return {
    success: true,
    data: {
      blob,
      fileName: job.fileName,
      fileSize: job.fileSize
    }
  }
}

/**
 * API 4: Cancel Export Job
 * Cancels and deletes the export job
 * @param {string} exportId - Export job ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const cancelExportJob = async (exportId) => {
  await delay(300) // Simulate API call delay

  const job = exportJobs.get(exportId)

  if (!job) {
    return {
      success: false,
      error: 'Export job not found'
    }
  }

  // Update status to CANCELLED
  exportJobs.set(exportId, {
    ...job,
    status: EXPORT_STATUS.CANCELLED,
    cancelledAt: Date.now()
  })

  // Clean up after 1 minute
  setTimeout(() => {
    exportJobs.delete(exportId)
  }, 60000)

  return {
    success: true,
    data: {
      message: 'Export job cancelled successfully',
      exportId
    }
  }
}

/**
 * Utility: Cleanup old export jobs (optional)
 */
export const cleanupOldExports = () => {
  const now = Date.now()
  const maxAge = 30 * 60 * 1000 // 30 minutes

  for (const [id, job] of exportJobs.entries()) {
    if (now - job.createdAt > maxAge) {
      exportJobs.delete(id)
    }
  }
}

// Auto cleanup every 5 minutes
setInterval(cleanupOldExports, 5 * 60 * 1000)
