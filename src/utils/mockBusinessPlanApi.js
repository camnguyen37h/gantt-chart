/**
 * ========================================
 * MOCK BUSINESS PLAN API - COMPLETE
 * ========================================
 * This file implements ALL Business Plan API endpoints
 * Based on src/lib/service/api/businessPlan.js
 */

import {
  mockBusinessPlanDetail,
  mockProductionRevenue,
  mockOtherRevenue,
  mockSellingPlan,
  mockRevenueSummary,
  mockMMBillsService,
  mockDeliveryPlanSummary,
  mockDeliveryPlanMembers,
  mockOtherExpensesTable,
  mockDepartmentsByVersion,
  mockPositions,
  mockCurrencies,
  mockIndustries,
  mockMaxKPISetting,
  mockApprovalSteps,
  mockUserActionHistory,
  mockDocuments,
  mockStatusList,
  mockResourceTypes,
  mockLocations,
  mockEmployeeTypes,
  mockRoles,
  mockBusinessPlanList,
  mockResourceList,
  mockUserAndDepartment,
  getBusinessPlanById,
  updateBusinessPlan,
  createBusinessPlanVersion
} from './mockBusinessPlanData';

// ==================== HELPER FUNCTIONS ====================
const successResponse = (data) => ({
  httpStatus: 200,
  data,
  messageId: 'Success',
  errorMessage: ''
});

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== BUSINESS PLAN LIST & FILTERS ====================

/**
 * Get status filter list
 * GET /api/business-plan/get-filter-status
 */
export const getStatus = async () => {
  await delay();
  return successResponse(mockStatusList.data);
};

/**
 * Get version filter list
 * GET /api/business-plan/get-filter-version
 */
export const getVersion = async (params) => {
  await delay();
  const { businessPlanId } = params || {};
  
  if (businessPlanId) {
    const bp = getBusinessPlanById(businessPlanId);
    return successResponse(bp?.versions || []);
  }
  
  return successResponse([
    { versionId: 436, versionName: "Version 1", status: "APPROVED", statusName: "Approved" },
    { versionId: 437, versionName: "Version 2", status: "DRAFT", statusName: "Draft" }
  ]);
};

/**
 * Search customer name filter
 * GET /api/business-plan/search-filter-customer-name
 */
export const getCustomerName = async (params) => {
  await delay();
  const { keyword } = params || {};
  
  const customers = [
    "MyFirstMillion",
    "TechCorp Japan",
    "Singapore Solutions",
    "Global Enterprise"
  ];
  
  const filtered = keyword 
    ? customers.filter(c => c.toLowerCase().includes(keyword.toLowerCase()))
    : customers;
    
  return successResponse(filtered.map((name, idx) => ({ id: idx + 1, name })));
};

/**
 * Search business plan name filter
 * GET /api/business-plan/search-filter-business-plan-name
 */
export const getBusinessPlanName = async (params) => {
  await delay();
  const { keyword } = params || {};
  
  const bpNames = [
    "Myfirstmillion Onsite",
    "CMC Global Services",
    "Digital Transformation Project"
  ];
  
  const filtered = keyword
    ? bpNames.filter(n => n.toLowerCase().includes(keyword.toLowerCase()))
    : bpNames;
    
  return successResponse(filtered.map((name, idx) => ({ id: idx + 1, name })));
};

/**
 * Search project code filter
 * GET /api/business-plan/search-filter-project-code
 */
export const getProjectCode = async (params) => {
  await delay();
  const { keyword } = params || {};
  
  const codes = [
    "GLBTM2500093",
    "GLBTM2500094",
    "GLBTM2500095"
  ];
  
  const filtered = keyword
    ? codes.filter(c => c.includes(keyword.toUpperCase()))
    : codes;
    
  return successResponse(filtered.map((code, idx) => ({ id: idx + 1, code })));
};

/**
 * Get approval step filter
 * GET /api/business-plan/get-filter-approval-step
 */
export const getApprovalStep = async () => {
  await delay();
  return successResponse([
    { id: 1, name: "Draft", value: "DRAFT" },
    { id: 2, name: "BU/DU Lead Pending Approval", value: "BU_DU_LEAD_PENDING" },
    { id: 3, name: "G Lead Pending Approval", value: "G_LEAD_PENDING" },
    { id: 4, name: "FC Pending Approval", value: "FC_PENDING" },
    { id: 5, name: "BOM Pending Approval", value: "BOM_PENDING" },
    { id: 6, name: "CEO Pending Approval", value: "CEO_PENDING" },
    { id: 7, name: "Approved", value: "APPROVED" }
  ]);
};

/**
 * Search business plan list
 * POST /api/business-plan/search-business-plan-version-list
 */
export const postListBusinessPlanList = async (params) => {
  await delay();
  const { page = 1, size = 20 } = params || {};
  return {
    ...mockBusinessPlanList,
    data: {
      ...mockBusinessPlanList.data,
      page,
      size
    }
  };
};

// ==================== BUSINESS PLAN DETAIL ====================

/**
 * Get business plan detail
 * GET /api/business-plan/detail/{id}
 */
export const getBusinessPlanDetail = async (id) => {
  await delay();
  const bp = getBusinessPlanById(id);
  
  if (!bp) {
    return mockBusinessPlanDetail; // Return default if not found
  }
  
  return successResponse(bp);
};

/**
 * Save business plan draft
 * POST /api/business-plan/save
 */
export const saveDraft = async (data) => {
  await delay(500);
  const businessPlanVersionId =
    (data.generalInformation && data.generalInformation.businessPlanVersionId) ||
    data.businessPlanVersionId;

  updateBusinessPlan(businessPlanVersionId, data);
  return successResponse({
    id: businessPlanVersionId,
    message: "Business plan saved successfully"
  });
};

/**
 * Submit business plan
 * POST /api/business-plan/submit
 */
export const submit = async (data) => {
  await delay(500);
  const { businessPlanVersionId } = data;
  
  updateBusinessPlan(businessPlanVersionId, {
    status: "Pending Approval",
    lastModifiedDate: Date.now()
  });
  
  return successResponse({
    id: businessPlanVersionId,
    message: "Business plan submitted successfully"
  });
};

/**
 * Create new version
 * POST /api/business-plan/create-new-version/{id}
 */
export const createNewVersion = async (id) => {
  await delay(500);
  const newVersion = createBusinessPlanVersion(id);
  return successResponse({
    id: newVersion.id,
    version: newVersion.version,
    message: "New version created successfully"
  });
};

// ==================== WORKFLOW & APPROVAL ====================

/**
 * Get all approval steps
 * GET /api/business-plan/get-all-approval-steps
 */
export const getBusinessPlanWorkflow = async (params) => {
  await delay();
  // eslint-disable-next-line no-unused-vars
  const { businessPlanVersionId } = params || {};
  return mockApprovalSteps;
};

/**
 * Approve/Reject workflow
 * POST /api/business-plan/change-workflow
 */
export const approveRejectWO = async (data) => {
  await delay(500);
  // eslint-disable-next-line no-unused-vars
  const { businessPlanVersionId, action, comment } = data;
  
  return successResponse({
    id: businessPlanVersionId,
    action,
    message: `Workflow ${action} successfully`
  });
};

// ==================== COMMENTS ====================

/**
 * Get business plan comments
 * GET /api/delivery/v1/comment/get-module-comments
 */
export const getBusinessPlanDetailComments = async (params) => {
  await delay();
  return successResponse({
    total: 0,
    comments: []
  });
};

/**
 * Post business plan comment
 * POST /api/delivery/v1/comment/submit-comments
 */
export const postBusinessPlanDetailComment = async (data) => {
  await delay(500);
  return successResponse({
    id: Date.now(),
    message: "Comment posted successfully"
  });
};

// ==================== DOCUMENTS ====================

/**
 * Get documents by BP version ID
 * GET /api/business-plan/get-file-by-bp-version-id
 */
export const getDocuments = async (params) => {
  await delay();
  return mockDocuments;
};

/**
 * Upload documents
 * POST /api/business-plan/uploads
 */
export const uploadDocuments = async (formData) => {
  await delay(1000);
  return successResponse({
    fileId: Date.now(),
    fileName: "document.pdf",
    message: "File uploaded successfully"
  });
};

/**
 * Delete document by ID
 * DELETE /api/business-plan/delete-file-by-id/{id}
 */
export const deleteDocument = async (id) => {
  await delay(500);
  return successResponse({
    id,
    message: "Document deleted successfully"
  });
};

// ==================== LOOKUPS & SETTINGS ====================

/**
 * Get all industries
 * GET /api/business-plan/get-all-industry
 */
export const getIndustryDomain = async () => {
  await delay();
  return mockIndustries;
};

/**
 * Get all currencies
 * GET /api/business-plan/get-all-currency
 */
export const getIndustryCurrency = async () => {
  await delay();
  return mockCurrencies;
};

/**
 * Get user and department collaborators
 * GET /api/business-plan/get-user-and-department
 */
export const getUserAndDepartmentCollaborator = async (params) => {
  await delay();
  return mockUserAndDepartment;
};

/**
 * Get MM Bills Service data
 * GET /api/business-plan/business-plan-mm-bills
 */
export const getMMBillService = async (params) => {
  await delay();
  return mockMMBillsService;
};

/**
 * Get max KPI settings
 * GET /api/business-plan/get-setting-max-kpi
 */
export const getBusinessPlanSettingMaxKPI = async () => {
  await delay();
  return mockMaxKPISetting;
};

/**
 * Get history
 * GET /api/business-plan/history/{id}
 */
export const getHistory = async (id) => {
  await delay();
  return successResponse({
    total: 0,
    history: []
  });
};

// ==================== BUSINESS PLAN REQUEST LIST ====================

/**
 * Get MVV for BP request list
 * GET /api/business-plan/search-filter-request-list-mvv
 */
export const getMVVBusinessPlanRequest = async (params) => {
  await delay();
  return successResponse([
    { id: 1, name: "MVV 1" },
    { id: 2, name: "MVV 2" }
  ]);
};

/**
 * Get version for BP request list
 * GET /api/business-plan/search-filter-request-list-version
 */
export const getVersionBusinessPlanRequest = async (params) => {
  await delay();
  return successResponse([
    { id: 1, name: "Version 1" },
    { id: 2, name: "Version 2" }
  ]);
};

/**
 * Get status for BP request list
 * GET /api/business-plan/search-filter-request-list-status
 */
export const getStatusBusinessPlanRequest = async () => {
  await delay();
  return mockStatusList;
};

/**
 * Get approval step for BP request list
 * GET /api/business-plan/search-filter-request-list-approval-step
 */
export const getApprovalStepBusinessPlanRequest = async () => {
  await delay();
  return getApprovalStep();
};

/**
 * Get BP name for BP request list
 * GET /api/business-plan/search-filter-request-list-bp-name
 */
export const getBusinessPlanNameBusinessPlanRequest = async (params) => {
  await delay();
  return getBusinessPlanName(params);
};

/**
 * Get assignee for BP request list
 * GET /api/business-plan/search-filter-request-list-assignee
 */
export const getAssigneeBusinessPlanRequest = async (params) => {
  await delay();
  return successResponse(mockResourceList.data);
};

/**
 * Search BP request list
 * POST /api/business-plan/search-business-plan-version-request-list
 */
export const postBusinessPlanRequestList = async (params) => {
  await delay();
  const { page = 1, size = 20 } = params || {};
  return {
    httpStatus: 200,
    data: {
      total: 0,
      body: [],
      page,
      size
    },
    messageId: "Success",
    errorMessage: ""
  };
};

// ==================== DU/BU FILTERS ====================

/**
 * Get list of DUs
 * GET /api/business-plan/get-filter-du
 */
export const getListDU = async () => {
  await delay();
  return successResponse([
    { id: 2, name: "DJ2", code: "DJ2" },
    { id: 66, name: "BJ3", code: "BJ3" },
    { id: 3, name: "DU1.3", code: "DU1.3" }
  ]);
};

/**
 * Get list of BUs
 * GET /api/business-plan/get-filter-bu
 */
export const getListBU = async () => {
  await delay();
  return successResponse([
    { id: 40, name: "BU3", code: "BU3" },
    { id: 41, name: "BU1", code: "BU1" },
    { id: 42, name: "BU2", code: "BU2" }
  ]);
};

/**
 * Get list of groups for upload
 * GET /api/business-plan/get-list-group
 */
export const getListGroupUpload = async () => {
  await delay();
  return successResponse([
    { id: 1, name: "Group A" },
    { id: 2, name: "Group B" }
  ]);
};

// ==================== REVENUE PLAN ====================

/**
 * Get position for revenue plan
 * GET /api/revenue-plan/filter-position
 */
export const getPositionRevenuePlan = async () => {
  await delay();
  return mockPositions;
};

/**
 * Get production revenue
 * GET /api/business-plan/production-revenue
 */
export const getProductionRevenue = async (params) => {
  await delay();
  return mockProductionRevenue;
};

/**
 * Get other revenue
 * GET /api/business-plan/other-revenue
 */
export const getOtherRevenue = async (params) => {
  await delay();
  return mockOtherRevenue;
};

/**
 * Update other revenue
 * POST /api/business-plan/other-revenue
 */
export const updateOtherRevenue = async (data) => {
  await delay(500);
  return successResponse({
    message: "Other revenue updated successfully"
  });
};

/**
 * Get selling plan
 * GET /api/business-plan/selling-plan
 */
export const getSellingPlan = async (params) => {
  await delay();
  return mockSellingPlan;
};

/**
 * Submit baseline revenue plan
 * POST /api/business-plan/base-line-revenue-plan
 */
export const submitBaselineRevenuePlan = async (data) => {
  await delay(500);
  return successResponse({
    message: "Baseline revenue plan submitted successfully"
  });
};

/**
 * Get DU list by version for revenue
 * GET /api/delivery-plan/filter-department-by-bp-version
 */
export const getListDUByVersionRevenue = async (params) => {
  await delay();
  return mockDepartmentsByVersion;
};

/**
 * Get revenue summary
 * POST /api/revenue-plan/revenue-summary
 */
export const getSummaryRevenuePlan = async (data) => {
  await delay();
  return mockRevenueSummary;
};

/**
 * Get history for revenue plan
 * GET /api/business-plan-user-action-history/get-user-action-history
 */
export const getHistoryRevenuePlan = async (params) => {
  await delay();
  return mockUserActionHistory;
};

// ==================== DELIVERY PLAN ====================

/**
 * Get DU list by version for delivery
 * GET /api/delivery-plan/filter-department-by-bp-version
 */
export const getListDUByVersionDelivery = async (params) => {
  await delay();
  return mockDepartmentsByVersion;
};

/**
 * Get delivery plan summary
 * GET /api/delivery-plan/delivery-plan-summary
 */
export const getSummaryDeliveryPlan = async (params) => {
  await delay();
  return mockDeliveryPlanSummary;
};

/**
 * Get location and exchange rate reference
 * GET /api/delivery-plan/get-reference-table
 */
export const getLocationExchangeRate = async () => {
  await delay();
  return successResponse({
    locations: mockLocations.data,
    exchangeRates: {
      "Vietnam": 1,
      "Japan": 0.0065,
      "Singapore": 0.000034
    }
  });
};

/**
 * Get resources information for delivery plan
 * POST /api/delivery-plan/get-list-delivery-plan-member
 */
export const getResourcesInformationDeliveryPlan = async (data) => {
  await delay();
  return mockDeliveryPlanMembers;
};

/**
 * Get resources information reference
 * POST /api/delivery-plan/get-resource-information-reference
 */
export const getResourcesInformationReference = async (data) => {
  await delay();
  return successResponse({
    averageSalary: 15000000,
    averageRate: 85
  });
};

/**
 * Get resource type list
 * GET /api/delivery-plan/filter-resource-type
 */
export const getListResourceType = async () => {
  await delay();
  return mockResourceTypes;
};

/**
 * Get resource list
 * GET /api/delivery-plan/filter-resource
 */
export const getListResource = async (params) => {
  await delay();
  return successResponse(mockResourceList.data);
};

/**
 * Get location list
 * GET /api/delivery-plan/filter-location
 */
export const getLocation = async () => {
  await delay();
  return mockLocations;
};

/**
 * Get employee type list
 * GET /api/delivery-plan/filter-employee-type
 */
export const getEmployeeType = async () => {
  await delay();
  return mockEmployeeTypes;
};

/**
 * Get employee position list
 * GET /api/delivery-plan/filter-position
 */
export const getEmployeePosition = async () => {
  await delay();
  return mockPositions;
};

/**
 * Get employee role list
 * GET /api/delivery-plan/filter-role
 */
export const getEmployeeRole = async () => {
  await delay();
  return mockRoles;
};

/**
 * Get other expenses table
 * POST /api/delivery-plan/get-other-expenses-table
 */
export const getOtherExpensesTable = async (data) => {
  await delay();
  return mockOtherExpensesTable;
};

/**
 * Save delivery plan
 * POST /api/delivery-plan/save
 */
export const saveDeliveryPlan = async (data) => {
  await delay(500);
  return successResponse({
    message: "Delivery plan saved successfully"
  });
};

/**
 * Get history for delivery plan
 * GET /api/business-plan-user-action-history/get-user-action-history
 */
export const getHistoryDeliveryPlan = async (params) => {
  await delay();
  return mockUserActionHistory;
};

// ==================== EXPORT ALL FUNCTIONS ====================
const mockBusinessPlanApi = {
  // Filters & Lists
  getStatus,
  getVersion,
  getCustomerName,
  getBusinessPlanName,
  getProjectCode,
  getApprovalStep,
  postListBusinessPlanList,
  
  // Business Plan Detail
  getBusinessPlanDetail,
  saveDraft,
  submit,
  createNewVersion,
  
  // Workflow
  getBusinessPlanWorkflow,
  approveRejectWO,
  
  // Comments
  getBusinessPlanDetailComments,
  postBusinessPlanDetailComment,
  
  // Documents
  getDocuments,
  uploadDocuments,
  deleteDocument,
  
  // Lookups
  getIndustryDomain,
  getIndustryCurrency,
  getUserAndDepartmentCollaborator,
  getMMBillService,
  getBusinessPlanSettingMaxKPI,
  getHistory,
  
  // BP Request List
  getMVVBusinessPlanRequest,
  getVersionBusinessPlanRequest,
  getStatusBusinessPlanRequest,
  getApprovalStepBusinessPlanRequest,
  getBusinessPlanNameBusinessPlanRequest,
  getAssigneeBusinessPlanRequest,
  postBusinessPlanRequestList,
  
  // DU/BU
  getListDU,
  getListBU,
  getListGroupUpload,
  
  // Revenue Plan
  getPositionRevenuePlan,
  getProductionRevenue,
  getOtherRevenue,
  updateOtherRevenue,
  getSellingPlan,
  submitBaselineRevenuePlan,
  getListDUByVersionRevenue,
  getSummaryRevenuePlan,
  getHistoryRevenuePlan,
  
  // Delivery Plan
  getListDUByVersionDelivery,
  getSummaryDeliveryPlan,
  getLocationExchangeRate,
  getResourcesInformationDeliveryPlan,
  getResourcesInformationReference,
  getListResourceType,
  getListResource,
  getLocation,
  getEmployeeType,
  getEmployeePosition,
  getEmployeeRole,
  getOtherExpensesTable,
  saveDeliveryPlan,
  getHistoryDeliveryPlan
};

export default mockBusinessPlanApi;
