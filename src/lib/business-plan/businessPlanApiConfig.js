/**
 * Business Plan API Configuration
 * Switch between mock and real API implementations
 */

import * as mockApi from './mockBusinessPlanApi';
// Uncomment this when real API is ready
// import * as realApi from './realBusinessPlanApi';

/**
 * Configuration flag to use mock API or real API
 * Set to true to use mock API, false to use real API
 */
const USE_MOCK_API = true;

/**
 * API instance - switches between mock and real based on configuration
 */
const api = USE_MOCK_API ? mockApi : null; // Replace null with realApi when available

// Export individual API functions for direct import
export const getBusinessPlanDetail = api.getBusinessPlanDetail;
export const getProductionRevenue = api.getProductionRevenue;
export const saveProductionRevenue = api.saveProductionRevenue;
export const getOtherRevenue = api.getOtherRevenue;
export const saveOtherRevenue = api.saveOtherRevenue;
export const getSellingPlan = api.getSellingPlan;
export const saveSellingPlan = api.saveSellingPlan;
export const getRevenueSummary = api.getRevenueSummary;
export const getMMBills = api.getMMBills;
export const getDeliveryPlanSummary = api.getDeliveryPlanSummary;
export const saveBusinessPlan = api.saveBusinessPlan;
export const exportBusinessPlan = api.exportBusinessPlan;
export const getDepartmentsByBPVersion = api.getDepartmentsByBPVersion;
export const getAllPositions = api.getAllPositions;
export const getAllCurrencies = api.getAllCurrencies;
export const getAllIndustries = api.getAllIndustries;
export const getAllApprovalSteps = api.getAllApprovalSteps;
export const uploadDocument = api.uploadDocument;
export const getUserActionHistory = api.getUserActionHistory;

// Export default API object
export default api;

/**
 * HOW TO USE:
 * 
 * 1. Using Mock API (current setup):
 *    - Set USE_MOCK_API = true
 *    - Import functions from this file:
 *      import { getBusinessPlanDetail, saveBusinessPlan } from './businessPlanApiConfig';
 * 
 * 2. Switching to Real API:
 *    - Create realBusinessPlanApi.js with the same function signatures
 *    - Uncomment the realApi import at the top
 *    - Set USE_MOCK_API = false
 *    - Update the api constant: const api = USE_MOCK_API ? mockApi : realApi;
 * 
 * 3. Example usage in components:
 *    import { getBusinessPlanDetail, saveProductionRevenue } from '@/lib/business-plan/businessPlanApiConfig';
 * 
 *    const fetchData = async () => {
 *      try {
 *        const data = await getBusinessPlanDetail(436);
 *        console.log(data);
 *      } catch (error) {
 *        console.error('Error fetching business plan:', error);
 *      }
 *    };
 * 
 * 4. Example usage in Redux AsyncThunk:
 *    import { getBusinessPlanDetail } from '@/lib/business-plan/businessPlanApiConfig';
 * 
 *    export const fetchBusinessPlanThunk = createAsyncThunk(
 *      'businessPlan/fetch',
 *      async (businessPlanId) => {
 *        const data = await getBusinessPlanDetail(businessPlanId);
 *        return data;
 *      }
 *    );
 * 
 * BENEFITS:
 * - Single source of truth for API configuration
 * - Easy switching between mock and real API
 * - No code changes needed in components when switching
 * - Consistent API interface across mock and real implementations
 * - Enables offline development and testing
 */
