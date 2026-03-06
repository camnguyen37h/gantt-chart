/**
 * Mock Request Adapter
 * Wraps Mock API responses to match the format expected by Request() utility
 * 
 * Real API Response Format:
 * {
 *   status: 200,
 *   message: 'Success',
 *   data: {...}
 * }
 */

/**
 * Wraps a mock API function to return response in Request() format
 * @param {Function} mockApiFunction - Mock API function to wrap
 * @returns {Function} Wrapped function that returns Promise<Response>
 */
export const wrapMockApiCall = (mockApiFunction) => {
  return async (...args) => {
    try {
      const data = await mockApiFunction(...args);
      
      return {
        status: 200,
        message: 'Success',
        data: data,
        errorMessage: null
      };
    } catch (error) {
      console.error('Mock API Error:', error);
      
      return {
        status: 500,
        message: error.message || 'Mock API Error',
        data: null,
        errorMessage: error.message
      };
    }
  };
};

/**
 * Create a mock API endpoint object compatible with Request() utility
 * This mimics the Real API endpoint structure { url, method }
 * 
 * @param {Function} mockFunction - The mock API function
 * @param {string} mockName - Name for debugging
 * @returns {Function} Function that returns endpoint config
 */
export const createMockEndpoint = (mockFunction, mockName) => {
  const wrappedFunction = wrapMockApiCall(mockFunction);
  
  return (...args) => ({
    url: `MOCK_API:${mockName}`,
    method: 'mock',
    __isMock: true,
    __mockFunction: () => wrappedFunction(...args)
  });
};

/**
 * Mock Request Handler
 * Intercepts Request() calls and redirects to Mock API if needed
 * 
 * Usage:
 *   import { MockRequest } from './mockRequestAdapter';
 *   const result = await MockRequest(api, data);
 * 
 * @param {Object} api - API endpoint config (may be real or mock)
 * @param {*} data - Request data (unused for mock)
 * @returns {Promise<Response>} Response in standard format
 */
export const MockRequest = async (api, data) => {
  // Check if this is a mock API call
  if (api && api.__isMock && typeof api.__mockFunction === 'function') {
    try {
      return await api.__mockFunction();
    } catch (error) {
      return {
        status: 500,
        message: error.message || 'Mock API Error',
        data: null,
        errorMessage: error.message
      };
    }
  }
  
  // If not a mock call, this shouldn't happen
  // Return error to indicate misconfiguration
  console.error('MockRequest called with non-mock API config:', api);
  return {
    status: 500,
    message: 'Invalid Mock API configuration',
    data: null,
    errorMessage: 'API is not configured for mock'
  };
};
