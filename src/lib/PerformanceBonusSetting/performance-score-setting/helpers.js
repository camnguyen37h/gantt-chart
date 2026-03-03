/**
 * Performance Score Setting Utilities
 * Helper functions and utilities for data transformation and validation
 */

import { SCORE_LEVEL } from './constants'

/**
 * Check if a score level is N/A
 * @param {Object|string} record - Score record or level string
 * @returns {boolean}
 */
export const isNAScore = (record) => {
  const level = typeof record === 'string' ? record : record?.level
  return String(level || '').trim().toUpperCase() === SCORE_LEVEL.NA_VALUE
}

/**
 * Check if an ID is temporary (not yet saved to server)
 * @param {string|number} id
 * @returns {boolean}
 */
export const isTempId = (id) => {
  return String(id).startsWith(SCORE_LEVEL.TEMP_ID_PREFIX)
}

/**
 * Check if an ID is a real server ID
 * @param {string|number} id
 * @returns {boolean}
 */
export const isRealId = (id) => {
  if (id === null || id === undefined) return false
  const str = String(id)
  return /^\d+$/.test(str) && !isTempId(id)
}

/**
 * Generate a unique temporary ID
 * @returns {string}
 */
export const generateTempId = () => {
  return `${SCORE_LEVEL.TEMP_ID_PREFIX}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Sort scores: N/A first, then others
 * @param {Array} scores
 * @returns {Array}
 */
export const sortScores = (scores) => {
  const naScore = scores.find(isNAScore)
  const otherScores = scores.filter(s => !isNAScore(s))
  return naScore ? [naScore, ...otherScores] : otherScores
}

/**
 * Validate score level format
 * @param {string} level
 * @returns {boolean}
 */
export const isValidScoreLevel = (level) => {
  if (!level || typeof level !== 'string') return false
  if (isNAScore(level)) return true
  return /^[A-Za-z0-9]+$/.test(level.trim())
}

/**
 * Build field name for form
 * @param {string|number} id
 * @param {string} field
 * @returns {string}
 */
export const buildFieldName = (id, field) => {
  return `rows[${id}].${field}`
}

/**
 * Parse field name to get ID
 * @param {string} fieldName - Format: "rows[{id}].{field}"
 * @returns {string|null}
 */
export const parseFieldId = (fieldName) => {
  const match = fieldName.match(/rows\[(.+?)\]/)
  return match ? match[1] : null
}

/**
 * Normalize number value (handle null, undefined, empty string)
 * @param {any} value
 * @param {number} defaultValue
 * @returns {number}
 */
export const normalizeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Compare two score objects for equality
 * @param {Object} score1
 * @param {Object} score2
 * @returns {boolean}
 */
export const areScoresEqual = (score1, score2) => {
  if (!score1 || !score2) return false
  
  return (
    String(score1.level || '') === String(score2.level || '') &&
    normalizeNumber(score1.baseScore) === normalizeNumber(score2.baseScore) &&
    !!score1.status === !!score2.status &&
    String(score1.description || '') === String(score2.description || '')
  )
}

/**
 * Build diff payload for save operation
 * Compares baseline (server data) with current (form data)
 * @param {number} roleId
 * @param {Array} baseline - Original data from server
 * @param {Array} current - Current form data
 * @returns {Object} { requestCreateData, requestUpdateData, requestDeleteData }
 */
export const buildDiffPayload = (roleId, baseline = [], current = []) => {
  // Create maps for quick lookup
  const baselineMap = new Map(
    baseline.filter(r => isRealId(r.scoreId)).map(r => [String(r.scoreId), r])
  )
  
  const currentMap = new Map(
    current.filter(r => isRealId(r.scoreId)).map(r => [String(r.scoreId), r])
  )

  // Find new scores (temporary IDs)
  const requestCreateData = current
    .filter(r => isTempId(r.scoreId))
    .map(r => ({
      projectRoleId: roleId,
      level: String(r.level || ''),
      baseScore: normalizeNumber(r.baseScore),
      status: !!r.status,
      description: r.description || '',
    }))

  // Find deleted scores (in baseline but not in current)
  const requestDeleteData = []
  baselineMap.forEach((baseScore, id) => {
    if (!currentMap.has(id)) {
      requestDeleteData.push({
        scoreId: Number(id),
        projectRoleId: roleId,
      })
    }
  })

  // Find modified scores (in both but values changed)
  const requestUpdateData = []
  currentMap.forEach((currentScore, id) => {
    const baseScore = baselineMap.get(id)
    if (baseScore && !areScoresEqual(baseScore, currentScore)) {
      requestUpdateData.push({
        scoreId: Number(id),
        projectRoleId: roleId,
        level: String(currentScore.level || ''),
        baseScore: normalizeNumber(currentScore.baseScore),
        status: !!currentScore.status,
        description: currentScore.description || '',
      })
    }
  })

  return {
    requestCreateData,
    requestUpdateData,
    requestDeleteData,
  }
}

/**
 * Check if there are any changes to save
 * @param {Object} diffPayload
 * @returns {boolean}
 */
export const hasChanges = (diffPayload) => {
  return (
    diffPayload.requestCreateData.length > 0 ||
    diffPayload.requestUpdateData.length > 0 ||
    diffPayload.requestDeleteData.length > 0
  )
}

/**
 * Validate all scores in a list
 * @param {Array} scores
 * @returns {Object} { valid: boolean, errors: Array }
 */
export const validateScores = (scores) => {
  const errors = []
  const levels = new Set()

  scores.forEach((score, index) => {
    // Check level
    if (!score.level || !isValidScoreLevel(score.level)) {
      errors.push({
        index,
        field: 'level',
        message: 'Invalid score level format',
      })
    }

    // Check duplicates
    if (score.level && levels.has(score.level.toUpperCase())) {
      errors.push({
        index,
        field: 'level',
        message: `Duplicate score level: ${score.level}`,
      })
    }
    levels.add(score.level?.toUpperCase())

    // Check base score
    if (isNaN(score.baseScore) || score.baseScore < 0) {
      errors.push({
        index,
        field: 'baseScore',
        message: 'Base score must be a positive number',
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
