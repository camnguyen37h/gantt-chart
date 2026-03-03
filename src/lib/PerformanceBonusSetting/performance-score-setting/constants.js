/**
 * Performance Score Setting Constants
 * Centralized configuration for magic numbers, strings, and API endpoints
 */

// API Endpoints
export const API_ENDPOINTS = {
  GET_ALL_ROLES: '/ranking/get-all-roles',
  GET_SCORE_LEVEL_BY_ROLE: '/ranking/get-score-level-by-role',
  SAVE_CRITERIA_BY_ROLE: '/ranking/save-criteria-by-role',
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE_NUM: 1,
}

// Score Level
export const SCORE_LEVEL = {
  NA_VALUE: 'N/A',
  TEMP_ID_PREFIX: 'tmp-',
}

// Validation
export const VALIDATION = {
  MAX_LENGTH: 250,
  SCORE_PATTERN: /^[A-Za-z0-9]+$/,
}

// Form Field Names
export const FIELD_NAMES = {
  LEVEL: 'level',
  BASE_SCORE: 'baseScore',
  STATUS: 'status',
  DESCRIPTION: 'description',
}

// Messages
export const MESSAGES = {
  ERROR: {
    FETCH_ROLES_FAILED: 'Failed to fetch roles',
    FETCH_SCORE_FAILED: 'Failed to fetch score levels',
    SAVE_FAILED: 'Failed to save configuration',
    REQUIRED_SCORE: 'Score is required',
    INVALID_SCORE: 'Score only allows A–Z, a–z, 0–9 characters',
    MAX_LENGTH_SCORE: 'Score cannot exceed 250 characters',
    MAX_LENGTH_DESC: 'Description cannot exceed 250 characters',
    DUPLICATE_SCORE: 'This score name already exists',
    NA_NOT_ALLOWED: 'Single N/A record allowed at the top only',
    NUMERIC_SCORE: 'Base score must be numeric',
  },
  SUCCESS: {
    SAVE_SUCCESS: 'Configuration saved successfully',
  },
  CONFIRM: {
    DELETE_SCORE: 'Are you sure you want to delete this score?',
  },
  TOOLTIP: {
    DELETE_NA: 'Cannot delete N/A record',
    DELETE: 'Delete record',
    ADD: 'Add new score',
  },
}

// UI
export const UI = {
  TABLE_SCROLL_HEIGHT: 250,
  MIN_SPIN_HEIGHT: 32,
  COLUMN_WIDTH: {
    SCORE: '24%',
    BASE_SCORE: 140,
    STATUS: 120,
  },
  INPUT_WIDTH: {
    BASE_SCORE: 100,
  },
  FORM_ITEM_STYLE: {
    marginBottom: 0,
  },
  FORM_ITEM_FLEX_STYLE: {
    marginBottom: 0,
    flex: 1,
  },
  SCORE_ROW_STYLE: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  TABLE_STYLE: {
    marginTop: 8,
  },
  ALLOWED_KEYS: [
    'Backspace',
    'Delete',
    'Tab',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
  ],
  PLACEHOLDER: {
    SCORE: 'Ex: L0, L1...',
    DESCRIPTION: 'A score of 0 means',
  },
}

// Response Status
export const RESPONSE_STATUS = {
  SUCCESS: 200,
}
