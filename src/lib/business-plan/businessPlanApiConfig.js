/**
 * ========================================
 * BUSINESS PLAN API CONFIGURATION - COMPLETE
 * ========================================
 * Switch between mock and real API implementations
 * All 55+ endpoints are now available
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
 * Normalize response structure
 * Mock API returns {httpStatus, data, ...} but async thunks expect {status, data, ...}
 * This wrapper ensures consistent response structure
 */
const normalizeResponse = async (apiCall) => {
  const result = await apiCall;
  if (result && result.httpStatus !== undefined && result.status === undefined) {
    return { ...result, status: result.httpStatus };
  }
  return result;
};

/**
 * Create API wrapper that normalizes responses
 */
const createApiWrapper = (mockApi) => {
  const wrapper = {};
  for (const key in mockApi) {
    if (typeof mockApi[key] === 'function') {
      wrapper[key] = async (...args) => normalizeResponse(mockApi[key](...args));
    } else {
      wrapper[key] = mockApi[key];
    }
  }
  return wrapper;
};

/**
 * API instance - switches between mock and real based on configuration
 */
const api = USE_MOCK_API ? createApiWrapper(mockApi) : null; // Replace null with realApi when available

// ==================== EXPORT ALL API FUNCTIONS ====================

// ========== Business Plan List & Filters ==========
export const getStatus = api.getStatus;
export const getVersion = api.getVersion;
export const getCustomerName = api.getCustomerName;
export const getBusinessPlanName = api.getBusinessPlanName;
export const getProjectCode = api.getProjectCode;
export const getApprovalStep = api.getApprovalStep;
export const postListBusinessPlanList = api.postListBusinessPlanList;

// ========== Business Plan Detail ==========
export const getBusinessPlanDetail = api.getBusinessPlanDetail;
export const getBusinessPlanDetailByViewMode = api.getBusinessPlanDetailByViewMode;
export const saveDraft = api.saveDraft;
export const saveBusinessPlan = api.saveDraft; // Alias
export const submit = api.submit;
export const createNewVersion = api.createNewVersion;

// ========== Workflow & Approval ==========
export const getBusinessPlanWorkflow = api.getBusinessPlanWorkflow;
export const getAllApprovalSteps = api.getBusinessPlanWorkflow; // Alias
export const approveRejectWO = api.approveRejectWO;

// ========== Comments ==========
export const getBusinessPlanDetailComments = api.getBusinessPlanDetailComments;
export const postBusinessPlanDetailComment = api.postBusinessPlanDetailComment;

// ========== Documents ==========
export const getDocuments = api.getDocuments;
export const uploadDocuments = api.uploadDocuments;
export const uploadDocument = api.uploadDocuments; // Alias
export const deleteDocument = api.deleteDocument;

// ========== Lookups & Settings ==========
export const getIndustryDomain = api.getIndustryDomain;
export const getAllIndustries = api.getIndustryDomain; // Alias
export const getIndustryCurrency = api.getIndustryCurrency;
export const getAllCurrencies = api.getIndustryCurrency; // Alias
export const getUserAndDepartmentCollaborator = api.getUserAndDepartmentCollaborator;
export const getMMBillService = api.getMMBills;
export const getMMBills = api.getMMBills; // Alias
export const getBusinessPlanSettingMaxKPI = api.getBusinessPlanSettingMaxKPI;
export const getHistory = api.getHistory;

// ========== Business Plan Request List ==========
export const getMVVBusinessPlanRequest = api.getMVVBusinessPlanRequest;
export const getVersionBusinessPlanRequest = api.getVersionBusinessPlanRequest;
export const getStatusBusinessPlanRequest = api.getStatusBusinessPlanRequest;
export const getApprovalStepBusinessPlanRequest = api.getApprovalStepBusinessPlanRequest;
export const getBusinessPlanNameBusinessPlanRequest = api.getBusinessPlanNameBusinessPlanRequest;
export const getAssigneeBusinessPlanRequest = api.getAssigneeBusinessPlanRequest;
export const postBusinessPlanRequestList = api.postBusinessPlanRequestList;

// ========== DU/BU Filters ==========
export const getListDU = api.getListDU;
export const getListBU = api.getListBU;
export const getListGroupUpload = api.getListGroupUpload;

// ========== Revenue Plan ==========
export const getPositionRevenuePlan = api.getPositionRevenuePlan;
export const getAllPositions = api.getPositionRevenuePlan; // Alias
export const getProductionRevenue = api.getProductionRevenue;
export const saveProductionRevenue = api.updateOtherRevenue; // Alias for consistency
export const getOtherRevenue = api.getOtherRevenue;
export const updateOtherRevenue = api.updateOtherRevenue;
export const saveOtherRevenue = api.updateOtherRevenue; // Alias
export const getSellingPlan = api.getSellingPlan;
export const saveSellingPlan = api.updateOtherRevenue; // Alias
export const submitBaselineRevenuePlan = api.submitBaselineRevenuePlan;
export const getListDUByVersionRevenue = api.getListDUByVersionRevenue;
export const getDepartmentsByBPVersion = api.getListDUByVersionRevenue; // Alias
export const getSummaryRevenuePlan = api.getSummaryRevenuePlan;
export const getRevenueSummary = api.getSummaryRevenuePlan; // Alias
export const getHistoryRevenuePlan = api.getHistoryRevenuePlan;

// ========== Delivery Plan ==========
export const getListDUByVersionDelivery = api.getListDUByVersionDelivery;
export const getSummaryDeliveryPlan = api.getSummaryDeliveryPlan;
export const getDeliveryPlanSummary = api.getSummaryDeliveryPlan; // Alias
export const getLocationExchangeRate = api.getLocationExchangeRate;
export const getResourcesInformationDeliveryPlan = api.getResourcesInformationDeliveryPlan;
export const getResourcesInformationReference = api.getResourcesInformationReference;
export const getListResourceType = api.getListResourceType;
export const getListResource = api.getListResource;
export const getLocation = api.getLocation;
export const getEmployeeType = api.getEmployeeType;
export const getEmployeePosition = api.getEmployeePosition;
export const getEmployeeRole = api.getEmployeeRole;
export const getOtherExpensesTable = api.getOtherExpensesTable;
export const saveDeliveryPlan = api.saveDeliveryPlan;
export const getHistoryDeliveryPlan = api.getHistoryDeliveryPlan;
export const getUserActionHistory = api.getHistoryDeliveryPlan; // Alias

// ========== Export Functionality ==========
export const exportBusinessPlan = async (id) => {
  // Mock export - return success
  return {
    httpStatus: 200,
    data: { message: "Export initiated" },
    messageId: "Success",
    errorMessage: ""
  };
};

// Export default API object with all functions
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
