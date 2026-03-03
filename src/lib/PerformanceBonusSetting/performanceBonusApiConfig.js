/**
 * Performance Bonus Setting API Configuration
 *
 * This file uses MOCK API by default for development.
 * When integrating with real backend:
 * 1. Import real Request service
 * 2. Update Request export to use real API
 */

import MockRequest from './mockPerformanceBonusApi'

// ============================================================================
// Configuration
// ============================================================================

/**
 * Currently using MOCK API
 * To use real API: manually import and export the real Request service
 */
export const USE_MOCK_API = true

// ============================================================================
// Request Service
// ============================================================================

/**
 * Request service - currently using mock API
 *
 * Usage in components:
 * ```js
 * import { Request } from './performanceBonusApiConfig'
 *
 * // Direct URL usage (works with both mock and real API)
 * Request(
 *   { url: '/ranking/get-all-roles', method: 'get' },
 *   { pageNum: 1, pageSize: 10 }
 * )
 * ```
 */
export const Request = MockRequest

// When switching to real API, uncomment this:
// import RealRequest from '../service/request'
// export const Request = RealRequest

/**
 * Get current API mode
 */
export const getApiMode = () => (USE_MOCK_API ? 'MOCK' : 'REAL')
// ============================================================================
// Re-export mock utilities for testing/development
// ============================================================================

export {
  resetMockData,
  getMockData,
  updateMockConfig,
  getMockConfig,
} from './mockPerformanceBonusApi'
