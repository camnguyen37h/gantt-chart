/**
 * Mock API Service for Performance Bonus Setting
 * 
 * This service simulates network requests for development/testing.
 * It provides the same interface as the real Request service,
 * making it easy to switch between mock and real APIs.
 * 
 * Usage:
 * - Import this service instead of the real Request service
 * - Or use a config flag to conditionally import mock/real service
 */

import { mockRoles, mockScoreLevels } from './mockPerformanceBonusData'
import { ResponseStatusCode } from '../service/constant'

// Config
const CONFIG = {
  ENABLE_MOCK: true, // Set to false to use real API
  SIMULATE_DELAY: true, // Simulate network delay
  MIN_DELAY: 300, // Minimum delay in ms
  MAX_DELAY: 800, // Maximum delay in ms
  ERROR_RATE: 0, // Probability of random errors (0 = no errors, 0.1 = 10% error rate)
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Simulate network delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Get random delay time
 */
const getRandomDelay = () => {
  if (!CONFIG.SIMULATE_DELAY) return 0
  return Math.random() * (CONFIG.MAX_DELAY - CONFIG.MIN_DELAY) + CONFIG.MIN_DELAY
}

/**
 * Simulate random errors for testing
 */
const shouldSimulateError = () => {
  return CONFIG.ERROR_RATE > 0 && Math.random() < CONFIG.ERROR_RATE
}

/**
 * Create success response matching backend format
 */
const createSuccessResponse = (data, message = 'Success') => ({
  status: ResponseStatusCode.success,
  message,
  data,
})

/**
 * Create error response
 */
const createErrorResponse = (message = 'Error occurred') => ({
  status: ResponseStatusCode.error,
  message,
  data: null,
})

// ============================================================================
// In-Memory Storage (simulates database)
// ============================================================================

// Clone data to avoid mutation
let rolesStorage = JSON.parse(JSON.stringify(mockRoles))
let scoreLevelsStorage = JSON.parse(JSON.stringify(mockScoreLevels))

// Auto-increment IDs (reserved for future use)
let nextScoreId = Math.max(
  ...Object.values(scoreLevelsStorage)
    .flat()
    .map(s => s.scoreId)
) + 1

// ============================================================================
// Mock API Functions
// ============================================================================

/**
 * Get list of roles with pagination
 * @param {Object} params - { pageNum, pageSize }
 * @returns {Promise<Object>} Response with roles and total count
 */
export const mockGetListRoles = async (params = {}) => {
  await delay(getRandomDelay())

  if (shouldSimulateError()) {
    throw new Error('Network error: Failed to fetch roles')
  }

  const { pageNum = 1, pageSize = 10 } = params
  const startIndex = (pageNum - 1) * pageSize
  const endIndex = startIndex + pageSize

  const paginatedRoles = rolesStorage.slice(startIndex, endIndex)

  return createSuccessResponse({
    roles: paginatedRoles,
    total: rolesStorage.length,
  })
}

/**
 * Get score levels for a specific role
 * @param {Object} params - { roleId }
 * @returns {Promise<Object>} Response with score levels array
 */
export const mockGetListScoreLevel = async (params = {}) => {
  await delay(getRandomDelay())

  if (shouldSimulateError()) {
    throw new Error('Network error: Failed to fetch score levels')
  }

  const { roleId } = params

  if (!roleId) {
    return createErrorResponse('Role ID is required')
  }

  const scoreLevels = scoreLevelsStorage[roleId] || []

  return createSuccessResponse(scoreLevels)
}

/**
 * Create new score levels
 * @param {Object} data - { roleId, scores: [] }
 * @returns {Promise<Object>} Response with created scores
 */
export const mockCreateScoreLevels = async (data = {}) => {
  await delay(getRandomDelay())

  if (shouldSimulateError()) {
    throw new Error('Network error: Failed to create score levels')
  }

  const { roleId, scores = [] } = data

  if (!roleId) {
    return createErrorResponse('Role ID is required')
  }

  if (!Array.isArray(scores) || scores.length === 0) {
    return createErrorResponse('Scores array is required')
  }

  // Assign IDs to new scores
  const newScores = scores.map(score => ({
    ...score,
    scoreId: nextScoreId++,
  }))

  // Add to storage
  if (!scoreLevelsStorage[roleId]) {
    scoreLevelsStorage[roleId] = []
  }
  scoreLevelsStorage[roleId].push(...newScores)

  return createSuccessResponse(newScores, 'Score levels created successfully')
}

/**
 * Update existing score levels
 * @param {Object} data - { roleId, scores: [] }
 * @returns {Promise<Object>} Response with updated scores
 */
export const mockUpdateScoreLevels = async (data = {}) => {
  await delay(getRandomDelay())

  if (shouldSimulateError()) {
    throw new Error('Network error: Failed to update score levels')
  }

  const { roleId, scores = [] } = data

  if (!roleId) {
    return createErrorResponse('Role ID is required')
  }

  const roleScores = scoreLevelsStorage[roleId] || []

  scores.forEach(updatedScore => {
    const index = roleScores.findIndex(s => s.scoreId === updatedScore.scoreId)
    if (index !== -1) {
      roleScores[index] = { ...roleScores[index], ...updatedScore }
    }
  })

  scoreLevelsStorage[roleId] = roleScores

  return createSuccessResponse(scores, 'Score levels updated successfully')
}

/**
 * Delete score levels
 * @param {Object} data - { roleId, scoreIds: [] }
 * @returns {Promise<Object>} Response confirming deletion
 */
export const mockDeleteScoreLevels = async (data = {}) => {
  await delay(getRandomDelay())

  if (shouldSimulateError()) {
    throw new Error('Network error: Failed to delete score levels')
  }

  const { roleId, scoreIds = [] } = data

  if (!roleId) {
    return createErrorResponse('Role ID is required')
  }

  if (!scoreLevelsStorage[roleId]) {
    return createErrorResponse('Role not found')
  }

  scoreLevelsStorage[roleId] = scoreLevelsStorage[roleId].filter(
    score => !scoreIds.includes(score.scoreId)
  )

  return createSuccessResponse(
    { deletedCount: scoreIds.length },
    'Score levels deleted successfully'
  )
}

/**
 * Save complete score configuration for a role
 * Handles create, update, and delete in one transaction
 * @param {Object} data - { roleId, create: [], update: [], delete: [] }
 * @returns {Promise<Object>} Response with operation results
 */
export const mockSaveScoreConfiguration = async (data = {}) => {
  await delay(getRandomDelay())

  if (shouldSimulateError()) {
    throw new Error('Network error: Failed to save configuration')
  }

  const {
    roleId,
    requestCreateData = [],
    requestUpdateData = [],
    requestDeleteData = [],
  } = data

  if (!roleId) {
    return createErrorResponse('Role ID is required')
  }

  const results = {
    created: [],
    updated: [],
    deleted: [],
  }

  // Initialize storage for role if not exists
  if (!scoreLevelsStorage[roleId]) {
    scoreLevelsStorage[roleId] = []
  }

  // Handle deletions
  if (requestDeleteData.length > 0) {
    const deleteIds = requestDeleteData.map(d => d.scoreId)
    scoreLevelsStorage[roleId] = scoreLevelsStorage[roleId].filter(
      score => !deleteIds.includes(score.scoreId)
    )
    results.deleted = deleteIds
  }

  // Handle updates
  if (requestUpdateData.length > 0) {
    requestUpdateData.forEach(updatedScore => {
      const index = scoreLevelsStorage[roleId].findIndex(
        s => s.scoreId === updatedScore.scoreId
      )
      if (index !== -1) {
        scoreLevelsStorage[roleId][index] = {
          ...scoreLevelsStorage[roleId][index],
          ...updatedScore,
        }
        results.updated.push(updatedScore.scoreId)
      }
    })
  }

  // Handle creations
  if (requestCreateData.length > 0) {
    const newScores = requestCreateData.map(score => ({
      ...score,
      scoreId: nextScoreId++,
    }))
    scoreLevelsStorage[roleId].push(...newScores)
    results.created = newScores.map(s => s.scoreId)
  }

  return createSuccessResponse(
    {
      ...results,
      totalCreated: results.created.length,
      totalUpdated: results.updated.length,
      totalDeleted: results.deleted.length,
    },
    'Configuration saved successfully'
  )
}

// ============================================================================
// Mock Request Wrapper (Compatible with existing Request service)
// ============================================================================

/**
 * Mock Request function that mimics the real Request service
 * This function can be used as a drop-in replacement
 * 
 * @param {Object} config - { url, method }
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} Response data
 */
export const MockRequest = async (config = {}, params = {}) => {
  const { url = '' } = config

  // Route to appropriate mock function based on URL
  if (url.includes('/ranking/get-all-roles')) {
    return mockGetListRoles(params)
  }

  if (url.includes('/ranking/get-score-level-by-role')) {
    return mockGetListScoreLevel(params)
  }

  if (url.includes('/ranking/save-criteria-by-role')) {
    return mockSaveScoreConfiguration(params)
  }

  // Default: return error for unhandled endpoints
  return createErrorResponse(`Mock not implemented for: ${url}`)
}

// ============================================================================
// Storage Management (for testing/development)
// ============================================================================

/**
 * Reset mock data to initial state
 */
export const resetMockData = () => {
  rolesStorage = JSON.parse(JSON.stringify(mockRoles))
  scoreLevelsStorage = JSON.parse(JSON.stringify(mockScoreLevels))
  nextScoreId = Math.max(
    ...Object.values(scoreLevelsStorage)
      .flat()
      .map(s => s.scoreId)
  ) + 1
}

/**
 * Get current mock data (for debugging)
 */
export const getMockData = () => ({
  roles: rolesStorage,
  scoreLevels: scoreLevelsStorage,
})

/**
 * Update mock config
 */
export const updateMockConfig = (newConfig) => {
  Object.assign(CONFIG, newConfig)
}

/**
 * Get current mock config
 */
export const getMockConfig = () => ({ ...CONFIG })

// ============================================================================
// Export default as drop-in replacement for Request
// ============================================================================

export default MockRequest
