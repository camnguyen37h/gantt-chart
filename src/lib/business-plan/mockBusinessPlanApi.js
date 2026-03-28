/**
 * Mock API for Business Plan Module
 * Simulates network delay and provides CRUD operations for Business Plan
 */

import {
  mockBusinessPlanDetail,
  mockBusinessPlanDetail437,
  mockBusinessPlanDetail464,
  mockBusinessPlanDetail468,
  mockBusinessPlanDetail494,
  mockBusinessPlanDetailReal,
  mockBusinessPlanEdgeCaseDetail,
  mockProductionRevenue,
  mockOtherRevenue,
  mockSellingPlan,
  mockRevenueSummary,
  mockMMBillsService,
  mockDeliveryPlanSummary,
  mockDepartmentsByVersion,
  mockDepartmentsByVersionDelivery,
  mockPositions,
  mockCurrencies,
  mockIndustries,
  mockApprovalSteps,
  getBusinessPlanDataByViewMode,
  mockProductionRevenue468,
  mockOtherRevenue468,
  mockSellingPlan468,
  mockRevenueSummary468,
  mockOtherExpensesTable468,
  mockListDeliveryPlanMember468,
  mockUserActionHistory468,
  mockUserActionHistoryDelivery468,
  mockMaxKPISetting,
  mockUserAndDepartment,
} from '../../utils/mockBusinessPlanData';

// Simulate network delay
const NETWORK_DELAY_MS = 500;
const delay = (ms = NETWORK_DELAY_MS) => 
  new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for business plans
// 448 = Version 1: GLBOD2500102 (Onsite) side - DB-DUL-Onsite
// 437 = Version 2: GLBTM2500093 (Onsite) side  
// 438 = Version 2: GLBOD2500087 (Offshore, DJ2+BJ2) side
const mockBusinessPlanDetail438 = JSON.parse(JSON.stringify({
  ...mockBusinessPlanDetail437,
  data: {
    ...mockBusinessPlanDetail437.data,
    id: 438,
    projectCode: "GLBOD2500087",
  }
}));

const businessPlansStore = new Map([
  [448, JSON.parse(JSON.stringify(mockBusinessPlanDetail464))],
  [437, JSON.parse(JSON.stringify(mockBusinessPlanDetail437))],
  [438, JSON.parse(JSON.stringify(mockBusinessPlanDetail438))],
  [454, JSON.parse(JSON.stringify(mockBusinessPlanDetailReal))],
  [455, JSON.parse(JSON.stringify(mockBusinessPlanDetailReal))],
  [463, JSON.parse(JSON.stringify(mockBusinessPlanDetail464))],
  [464, JSON.parse(JSON.stringify(mockBusinessPlanDetail464))],
  [468, JSON.parse(JSON.stringify(mockBusinessPlanDetail468))],
  [494, JSON.parse(JSON.stringify(mockBusinessPlanDetail494))],
  [495, JSON.parse(JSON.stringify(mockBusinessPlanDetail494))],
  [500, JSON.parse(JSON.stringify(mockBusinessPlanEdgeCaseDetail))],
]);

// In-memory storage for production revenue
const productionRevenueStore = new Map([
  [448, JSON.parse(JSON.stringify(mockProductionRevenue))],
  [468, JSON.parse(JSON.stringify(mockProductionRevenue468))],
]);

// In-memory storage for other revenue
const otherRevenueStore = new Map([
  [448, JSON.parse(JSON.stringify(mockOtherRevenue))],
  [468, JSON.parse(JSON.stringify(mockOtherRevenue468))],
]);

// In-memory storage for selling plan
const sellingPlanStore = new Map([
  [448, JSON.parse(JSON.stringify(mockSellingPlan))],
  [468, JSON.parse(JSON.stringify(mockSellingPlan468))],
]);

// In-memory storage for revenue summary
const revenueSummaryStore = new Map([
  [448, JSON.parse(JSON.stringify(mockRevenueSummary))],
  [468, JSON.parse(JSON.stringify(mockRevenueSummary468))],
]);

// Counter for generating new IDs
let businessPlanIdCounter = 1000;

/**
 * Get Business Plan Detail
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<Object>} Business plan detail with generalInfos
 */
export const getBusinessPlanDetail = async (businessPlanId) => {
  await delay();
  
  // Convert to number to match Map keys
  const id = Number(businessPlanId);
  const businessPlan = businessPlansStore.get(id);
  
  if (!businessPlan) {
    throw new Error(`Business Plan with ID ${businessPlanId} not found`);
  }
  
  // businessPlan has structure: { httpStatus: 200, data: {...} }
  // Return the whole structure for API wrapper to normalize
  return JSON.parse(JSON.stringify(businessPlan));
};

/**
 * Get Business Plan Detail By View Mode
 * @param {number} businessPlanId - Business Plan ID
 * @param {string} viewMode - View mode ('Total', 'OB', 'Onsite', 'Offshore')
 * @returns {Promise<Object>} Business plan detail with columnLabels and sectionList based on view mode
 */
export const getBusinessPlanDetailByViewMode = async (businessPlanId, viewModeOrParams) => {
  await delay();

  // Handle both string viewMode and params object like { view: 'Offshore' }
  var viewMode = 'Total';
  if (viewModeOrParams && typeof viewModeOrParams === 'object') {
    viewMode = viewModeOrParams.view || 'Total';
  } else if (viewModeOrParams) {
    viewMode = viewModeOrParams;
  }

  // Convert to number to match Map keys
  const id = Number(businessPlanId);

  // Get view mode specific mock data from Mock API/Business plan folder
  const viewModeData = getBusinessPlanDataByViewMode(viewMode, id);

  return JSON.parse(JSON.stringify(viewModeData));
};

/**
 * Get Production Revenue
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<Object>} Production revenue data
 */
export const getProductionRevenue = async (businessPlanId) => {
  await delay();
  
  const revenue = productionRevenueStore.get(businessPlanId);
  
  if (!revenue) {
    return {
      startDate: null,
      endDate: null,
      revenueInfos: []
    };
  }
  
  return JSON.parse(JSON.stringify(revenue));
};

/**
 * Save Production Revenue
 * @param {number} businessPlanId - Business Plan ID
 * @param {Object} revenueData - Production revenue data
 * @returns {Promise<Object>} Saved revenue data
 */
export const saveProductionRevenue = async (businessPlanId, revenueData) => {
  await delay();
  
  productionRevenueStore.set(businessPlanId, JSON.parse(JSON.stringify(revenueData)));
  
  // Recalculate revenue summary
  await recalculateRevenueSummary(businessPlanId);
  
  return {
    success: true,
    message: 'Production revenue saved successfully',
    data: revenueData
  };
};

/**
 * Get Other Revenue
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<Object>} Other revenue data
 */
export const getOtherRevenue = async (businessPlanId) => {
  await delay();
  
  const revenue = otherRevenueStore.get(businessPlanId);
  
  if (!revenue) {
    return {
      startDate: null,
      endDate: null,
      otherRevenueInfos: []
    };
  }
  
  return JSON.parse(JSON.stringify(revenue));
};

/**
 * Save Other Revenue
 * @param {number} businessPlanId - Business Plan ID
 * @param {Object} revenueData - Other revenue data
 * @returns {Promise<Object>} Saved revenue data
 */
export const saveOtherRevenue = async (businessPlanId, revenueData) => {
  await delay();
  
  otherRevenueStore.set(businessPlanId, JSON.parse(JSON.stringify(revenueData)));
  
  // Recalculate revenue summary
  await recalculateRevenueSummary(businessPlanId);
  
  return {
    success: true,
    message: 'Other revenue saved successfully',
    data: revenueData
  };
};

/**
 * Get Selling Plan (Expenses)
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<Object>} Selling plan data
 */
export const getSellingPlan = async (businessPlanId) => {
  await delay();
  
  const sellingPlan = sellingPlanStore.get(businessPlanId);
  
  if (!sellingPlan) {
    return {
      startDate: null,
      endDate: null,
      sellingExpenseInfos: []
    };
  }
  
  return JSON.parse(JSON.stringify(sellingPlan));
};

/**
 * Save Selling Plan
 * @param {number} businessPlanId - Business Plan ID
 * @param {Object} sellingPlanData - Selling plan data
 * @returns {Promise<Object>} Saved selling plan data
 */
export const saveSellingPlan = async (businessPlanId, sellingPlanData) => {
  await delay();
  
  sellingPlanStore.set(businessPlanId, JSON.parse(JSON.stringify(sellingPlanData)));
  
  // Recalculate revenue summary
  await recalculateRevenueSummary(businessPlanId);
  
  return {
    success: true,
    message: 'Selling plan saved successfully',
    data: sellingPlanData
  };
};

/**
 * Get Revenue Summary
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<Object>} Revenue summary
 */
export const getRevenueSummary = async (businessPlanId) => {
  await delay();
  
  const summary = revenueSummaryStore.get(businessPlanId);
  
  if (!summary) {
    return {
      businessPlanVersionId: businessPlanId,
      totalProductionRevenue: 0,
      totalOtherRevenue: 0,
      totalRevenue: 0,
      totalSellingExpense: 0,
      netRevenue: 0,
      profitMargin: 0,
    };
  }
  
  return JSON.parse(JSON.stringify(summary));
};

/**
 * Recalculate Revenue Summary
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<void>}
 */
const recalculateRevenueSummary = async (businessPlanId) => {
  const productionRevenue = productionRevenueStore.get(businessPlanId) || { revenueInfos: [] };
  const otherRevenue = otherRevenueStore.get(businessPlanId) || { otherRevenueInfos: [] };
  const sellingPlan = sellingPlanStore.get(businessPlanId) || { sellingExpenseInfos: [] };
  
  // Calculate total production revenue
  const totalProductionRevenue = productionRevenue.revenueInfos.reduce(
    (sum, info) => sum + (info.totalRevenue || 0),
    0
  );
  
  // Calculate total other revenue
  const totalOtherRevenue = otherRevenue.otherRevenueInfos.reduce(
    (sum, info) => sum + (info.totalRevenue || 0),
    0
  );
  
  // Calculate total selling expense
  const totalSellingExpense = sellingPlan.sellingExpenseInfos.reduce(
    (sum, info) => sum + (info.totalExpense || 0),
    0
  );
  
  const totalRevenue = totalProductionRevenue + totalOtherRevenue;
  const netRevenue = totalRevenue - totalSellingExpense;
  const profitMargin = totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0;
  
  const summary = {
    businessPlanVersionId: businessPlanId,
    totalProductionRevenue,
    totalOtherRevenue,
    totalRevenue,
    totalSellingExpense,
    netRevenue,
    profitMargin: Math.round(profitMargin * 100) / 100,
  };
  
  revenueSummaryStore.set(businessPlanId, summary);
};

/**
 * Get MM Bills
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<Object>} MM Bills data
 */
export const getMMBills = async (businessPlanId) => {
  await delay();
  
  return JSON.parse(JSON.stringify(mockMMBillsService));
};

/**
 * Get Delivery Plan Summary
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<Object>} Delivery plan summary
 */
export const getDeliveryPlanSummary = async (businessPlanId) => {
  await delay();
  
  return JSON.parse(JSON.stringify(mockDeliveryPlanSummary));
};

/**
 * Save Business Plan
 * @param {number} businessPlanId - Business Plan ID
 * @param {Object} businessPlanData - Business plan data to save
 * @returns {Promise<Object>} Saved business plan
 */
export const saveBusinessPlan = async (businessPlanId, businessPlanData) => {
  await delay(800); // Longer delay for save operation
  
  if (businessPlanId) {
    // Update existing business plan
    const existingPlan = businessPlansStore.get(businessPlanId);
    if (!existingPlan) {
      throw new Error(`Business Plan with ID ${businessPlanId} not found`);
    }
    
    const updatedPlan = {
      ...existingPlan,
      ...businessPlanData,
      id: businessPlanId,
    };
    
    businessPlansStore.set(businessPlanId, updatedPlan);
    
    return {
      success: true,
      message: 'Business plan updated successfully',
      data: JSON.parse(JSON.stringify(updatedPlan))
    };
  } else {
    // Create new business plan
    const newId = ++businessPlanIdCounter;
    const newPlan = {
      ...businessPlanData,
      id: newId,
      createdDate: Date.now(),
    };
    
    businessPlansStore.set(newId, newPlan);
    
    return {
      success: true,
      message: 'Business plan created successfully',
      data: JSON.parse(JSON.stringify(newPlan))
    };
  }
};

/**
 * Export Business Plan
 * @param {number} businessPlanId - Business Plan ID
 * @param {string} format - Export format (pdf, excel)
 * @returns {Promise<Object>} Export result
 */
export const exportBusinessPlan = async (businessPlanId, format = 'excel') => {
  await delay(1500); // Longer delay for export operation
  
  const businessPlan = businessPlansStore.get(businessPlanId);
  
  if (!businessPlan) {
    throw new Error(`Business Plan with ID ${businessPlanId} not found`);
  }
  
  // Simulate file generation
  const fileName = `BusinessPlan_${businessPlan.projectCode}_${Date.now()}.${format}`;
  
  return {
    success: true,
    message: 'Business plan exported successfully',
    data: {
      fileName,
      fileUrl: `/mock-files/${fileName}`,
      fileSize: 245678, // Mock file size in bytes
    }
  };
};

/**
 * Get Departments by Business Plan Version
 * @param {number} businessPlanVersionId - Business Plan Version ID
 * @returns {Promise<Array>} List of departments
 */
export const getDepartmentsByBPVersion = async (businessPlanVersionId) => {
  await delay(300);
  
  return JSON.parse(JSON.stringify(mockDepartmentsByVersion));
};

/**
 * Get All Positions (alias: getPositionRevenuePlan)
 * @returns {Promise<Object>} List of positions
 */
export const getAllPositions = async () => {
  await delay(300);

  return JSON.parse(JSON.stringify(mockPositions));
};

export const getPositionRevenuePlan = getAllPositions;

/**
 * Get User And Department Collaborator
 * @param {Object} params - search params
 * @returns {Promise<Object>} Users and departments
 */
export const getUserAndDepartmentCollaborator = async (params) => {
  await delay(300);

  return JSON.parse(JSON.stringify(mockUserAndDepartment));
};

/**
 * Get Business Plan Setting Max KPI
 * @returns {Promise<Object>} Max KPI settings
 */
export const getBusinessPlanSettingMaxKPI = async (params) => {
  await delay(300);

  return JSON.parse(JSON.stringify(mockMaxKPISetting));
};

/**
 * Get All Currencies (alias: getIndustryCurrency) (alias: getIndustryCurrency)
 * @returns {Promise<Object>} List of currencies
 */
export const getAllCurrencies = async () => {
  await delay(300);

  return JSON.parse(JSON.stringify(mockCurrencies));
};

export const getIndustryCurrency = getAllCurrencies;

/**
 * Get All Industries (alias: getIndustryDomain)
 * @returns {Promise<Object>} List of industries
 */
export const getAllIndustries = async () => {
  await delay(300);

  return JSON.parse(JSON.stringify(mockIndustries));
};

export const getIndustryDomain = getAllIndustries;

/**
 * Get All Approval Steps
 * @returns {Promise<Array>} List of approval steps
 */
export const getAllApprovalSteps = async () => {
  await delay(300);
  
  return JSON.parse(JSON.stringify(mockApprovalSteps));
};

/**
 * Get Business Plan Workflow (single combined workflow for all MVV groups)
 * @param {Object} params - { referenceId, mvv }
 * @returns {Promise<Object>} Combined workflow steps and work order
 */
export const getBusinessPlanWorkflow = async (params) => {
  await delay(300);
  return JSON.parse(JSON.stringify(mockApprovalSteps));
};

/**
 * Upload Document
 * @param {number} businessPlanId - Business Plan ID
 * @param {File} file - File to upload
 * @returns {Promise<Object>} Upload result
 */
export const uploadDocument = async (businessPlanId, file) => {
  await delay(1000);
  
  return {
    success: true,
    message: 'Document uploaded successfully',
    data: {
      documentId: Date.now(),
      fileName: file.name,
      fileSize: file.size,
      uploadDate: Date.now(),
      businessPlanId,
    }
  };
};

/**
 * Get User Action History (unified replacement for getHistoryDeliveryPlan & getHistoryRevenuePlan)
 * @param {number} businessPlanVersionId
 * @param {string} deliveryUnit
 * @param {number} pageNum
 * @param {number} pageSize
 * @param {string} module - 'DELIVERY_PLAN' | 'REVENUE_PLAN'
 * @param {boolean} isSale
 * @returns {Promise<Object>} Action history
 */
export const getUserActionHistory = async (businessPlanVersionId, deliveryUnit, pageNum, pageSize, module, isSale) => {
  return getHistoryDeliveryPlan(businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale);
};

/**
 * Get List DU By Version Revenue
 * @param {Object} params - { businessPlanVersionId, type }
 * @returns {Promise<Object>} List of delivery units for revenue
 */
export const getListDUByVersionRevenue = async (params) => {
  await delay(300);
  
  return mockDepartmentsByVersion;
};

/**
 * Get List DU By Version Delivery
 * @param {Object} params - { businessPlanVersionId, type }
 * @returns {Promise<Object>} List of delivery units for delivery
 */
export const getListDUByVersionDelivery = async (params) => {
  await delay(300);
  
  return mockDepartmentsByVersionDelivery;
};

// ========== Delivery Plan APIs ==========

/**
 * Get Summary Delivery Plan
 * @param {Object} params - { businessPlanVersionId, groupId }
 * @returns {Promise<Object>} Delivery plan summary metrics
 */
export const getSummaryDeliveryPlan = async (params) => {
  await delay();

  return {
    httpStatus: 200,
    data: {
      mmEffort: 8,
      directLaborCost: 134523552,
      outsourcingCost: null,
      equipmentExpense: 400000,
      onsiteExpense: 400000,
      overtime: 400000,
      other: 400000,
      nonDeductibleInputVAT: 400000,
    },
    messageId: "Success",
    errorMessage: "",
  };
};

/**
 * Get Location Exchange Rate
 * @param {Object} params - { businessPlanVersionId, groupId }
 * @returns {Promise<Object>} Exchange rates and salary/expense indices per location
 */
export const getLocationExchangeRate = async (params) => {
  await delay();

  return {
    httpStatus: 200,
    data: {
      locationExchangeRateData: [
        { location: 'Vietnam', exchangeRate: 25000 },
        { location: 'Japan', exchangeRate: 170 },
      ],
      locationSalaryExpenseIndexData: [
        { location: 'Vietnam', salaryIndex: 1.0, expenseIndex: 1.0 },
        { location: 'Japan', salaryIndex: 3.5, expenseIndex: 3.0 },
      ],
    },
    messageId: "Success",
    errorMessage: "",
  };
};

// In-memory store for delivery plan resources (headcount table)
const deliveryPlanResourcesStore = new Map([
  [
    448,
    {
      total: 1,
      body: {
        listLabelMonth: ['Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26'],
        listBudgetMMForEachMonth: {
          'Feb-26': 1, 'Mar-26': 1, 'Apr-26': 1, 'May-26': 1, 'Jun-26': 1, 'Jul-26': 1,
        },
        deliveryPlanByHeadCountList: [
          {
            deliveryMemberId: 1000110,
            userId: 3860,
            resourceType: 'User',
            resourceFullName: 'Lam. Tran Tung  - CMCGlobal DJ2',
            location: 'Vietnam',
            ldap: 'ttlam1',
            employeeType: 'In-house',
            originalGrossSalary: 5000000,
            grossSalary: 5000000,
            position: 'SE02',
            role: 'Member',
            rowTotal: 6,
            budgetMMValue: null,
            budgetMMValueDTO: {
              'Feb-26': { id: 1000283, deliveryMemberId: 1000110, month: 2, year: 2026, value: 1 },
              'Mar-26': { id: 1000284, deliveryMemberId: 1000110, month: 3, year: 2026, value: 1 },
              'Apr-26': { id: 1000285, deliveryMemberId: 1000110, month: 4, year: 2026, value: 1 },
              'May-26': { id: 1000286, deliveryMemberId: 1000110, month: 5, year: 2026, value: 1 },
              'Jun-26': { id: 1000287, deliveryMemberId: 1000110, month: 6, year: 2026, value: 1 },
              'Jul-26': { id: 1000288, deliveryMemberId: 1000110, month: 7, year: 2026, value: 1 },
            },
            groupId: 2,
            groupName: 'DJ2',
          },
        ],
        totalRecord: 1,
      },
      page: 1,
      size: 20,
    },
  ],
  [468, JSON.parse(JSON.stringify(mockListDeliveryPlanMember468.data))],
]);

/**
 * Get Resources Information Delivery Plan (headcount table)
 * @param {Object} params - { businessPlanVersionId, deliveryUnit, pageNum, pageSize, ... }
 * @returns {Promise<Object>} Paginated resources information
 */
export const getResourcesInformationDeliveryPlan = async (params) => {
  await delay();

  const { businessPlanVersionId } = params || {};
  const id = Number(businessPlanVersionId);
  const stored = deliveryPlanResourcesStore.get(id);

  if (stored) {
    return {
      httpStatus: 200,
      data: JSON.parse(JSON.stringify(stored)),
      messageId: "Success",
      errorMessage: "",
    };
  }

  return {
    httpStatus: 200,
    data: {
      total: 0,
      body: {
        listLabelMonth: [],
        listBudgetMMForEachMonth: {},
        deliveryPlanByHeadCountList: [],
        totalRecord: 0,
      },
      page: 1,
      size: 20,
    },
    messageId: "Success",
    errorMessage: "",
  };
};

/**
 * Get List Resource Type
 * @returns {Promise<Object>} List of resource types (User, Generic Resource)
 */
export const getListResourceType = async () => {
  await delay(200);

  return {
    httpStatus: 200,
    data: [
      { value: 'User' },
      { value: 'Generic Resource' },
    ],
    messageId: "Success",
    errorMessage: "",
  };
};

/**
 * Get List Resource (search employees/users)
 * @param {Object} params - { name } optional search filter
 * @returns {Promise<Object>} List of employees
 */
export const getListResource = async (params) => {
  await delay(300);

  const { name } = params || {};
  const allResources = [
    { id: 3860, value: 'ttlam1', location: 'Vietnam', employeeType: 'In-house', groupId: 2 },
    { id: 3861, value: 'nthanh1', location: 'Vietnam', employeeType: 'In-house', groupId: 2 },
    { id: 3862, value: 'pvhung1', location: 'Japan', employeeType: 'In-house', groupId: 3 },
    { id: 3863, value: 'lmtuan1', location: 'Vietnam', employeeType: 'Outsource', groupId: 2 },
  ];

  const filtered = name
    ? allResources.filter(r => r.value.toLowerCase().includes(name.toLowerCase()))
    : allResources;

  return {
    httpStatus: 200,
    data: filtered,
    messageId: "Success",
    errorMessage: "",
  };
};

/**
 * Get Location list
 * @returns {Promise<Object>} List of locations
 */
export const getLocation = async () => {
  await delay(200);

  return {
    httpStatus: 200,
    data: [
      { name: 'Vietnam' },
      { name: 'Japan' },
      { name: 'USA' },
    ],
    messageId: "Success",
    errorMessage: "",
  };
};

/**
 * Get Employee Type list
 * @returns {Promise<Object>} List of employee types
 */
export const getEmployeeType = async () => {
  await delay(200);

  return {
    httpStatus: 200,
    data: [
      { value: 'In-house' },
      { value: 'Outsource' },
    ],
    messageId: "Success",
    errorMessage: "",
  };
};

/**
 * Get Employee Position list
 * @param {Object} params - { mvv } optional filter
 * @returns {Promise<Object>} List of positions
 */
export const getEmployeePosition = async (params) => {
  await delay(200);

  return {
    httpStatus: 200,
    data: [
      { id: 803, idStr: null, name: 'SE02', value: 'SE02' },
      { id: 804, idStr: null, name: 'SE01', value: 'SE01' },
      { id: 805, idStr: null, name: 'TEST03', value: 'TEST03' },
      { id: 806, idStr: null, name: 'PM01', value: 'PM01' },
      { id: 807, idStr: null, name: 'SA01', value: 'SA01' },
      { id: 808, idStr: null, name: 'SE04', value: 'SE04' },
      { id: 809, idStr: null, name: 'TEST02', value: 'TEST02' },
      { id: 810, idStr: null, name: 'COMTOR02', value: 'COMTOR02' },
      { id: 811, idStr: null, name: 'SYE02', value: 'SYE02' },
      { id: 812, idStr: null, name: 'SYE01', value: 'SYE01' },
    ],
    messageId: "Success",
    errorMessage: "",
  };
};

/**
 * Get Employee Role list
 * @returns {Promise<Object>} List of roles
 */
export const getEmployeeRole = async () => {
  await delay(200);

  return {
    httpStatus: 200,
    data: [
      { value: 'Member' },
      { value: 'Leader' },
      { value: 'PM' },
      { value: 'BA' },
      { value: 'QA' },
    ],
    messageId: "Success",
    errorMessage: "",
  };
};

// In-memory store for other expenses
const otherExpensesStore = new Map([
  [
    448,
    {
      total: 5,
      body: {
        labelMonth: ['Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26'],
        dataList: [
          { otherExpenseId: null, expenseCategoriesEnum: 'Onsite', categoriesDataList: null, totalExpenseValue: null },
          { otherExpenseId: null, expenseCategoriesEnum: 'Equipment', categoriesDataList: null, totalExpenseValue: null },
          { otherExpenseId: null, expenseCategoriesEnum: 'Overtime', categoriesDataList: null, totalExpenseValue: null },
          { otherExpenseId: null, expenseCategoriesEnum: 'Non-deductible input VAT', categoriesDataList: null, totalExpenseValue: null },
          { otherExpenseId: null, expenseCategoriesEnum: 'Others', categoriesDataList: null, totalExpenseValue: null },
        ],
        totalRecords: 5,
      },
      page: 1,
      size: 10,
    },
  ],
  [468, JSON.parse(JSON.stringify(mockOtherExpensesTable468.data))],
]);

/**
 * Get Other Expenses Table
 * @param {Object} params - { businessPlanVersionId, deliveryUnit, pageNum, pageSize }
 * @returns {Promise<Object>} Paginated other expenses table
 */
export const getOtherExpensesTable = async (params) => {
  await delay();

  const { businessPlanVersionId } = params || {};
  const id = Number(businessPlanVersionId);
  const stored = otherExpensesStore.get(id);

  if (stored) {
    return {
      httpStatus: 200,
      data: JSON.parse(JSON.stringify(stored)),
      messageId: "Success",
      errorMessage: "",
    };
  }

  return {
    httpStatus: 200,
    data: {
      total: 5,
      body: {
        labelMonth: [],
        dataList: [
          { otherExpenseId: null, expenseCategoriesEnum: 'Onsite', categoriesDataList: null, totalExpenseValue: null },
          { otherExpenseId: null, expenseCategoriesEnum: 'Equipment', categoriesDataList: null, totalExpenseValue: null },
          { otherExpenseId: null, expenseCategoriesEnum: 'Overtime', categoriesDataList: null, totalExpenseValue: null },
          { otherExpenseId: null, expenseCategoriesEnum: 'Non-deductible input VAT', categoriesDataList: null, totalExpenseValue: null },
          { otherExpenseId: null, expenseCategoriesEnum: 'Others', categoriesDataList: null, totalExpenseValue: null },
        ],
        totalRecords: 5,
      },
      page: 1,
      size: 10,
    },
    messageId: "Success",
    errorMessage: "",
  };
};

/**
 * Save Delivery Plan
 * @param {Object} params - Save payload
 * @returns {Promise<Object>} Save result
 */
export const saveDeliveryPlan = async (params) => {
  await delay(800);

  return {
    httpStatus: 200,
    data: 'Delivery plan saved successfully',
    messageId: "Success",
    errorMessage: "",
  };
};

/**
 * Get Resources Information Reference
 * Returns reference-type (Actual TS / Allocated / Book / Available) data per resource
 * @param {Object} params - { businessPlanVersionId, deliveryUnit, userId, ... }
 * @returns {Promise<Object>} Reference data keyed by type
 */
export const getResourcesInformationReference = async (params) => {
  await delay();

  const labelMonth = { 'Feb-26': 1.0, 'Mar-26': 1.0, 'Apr-26': 1.0, 'May-26': 1.0, 'Jun-26': 1.0, 'Jul-26': 1.0 };

  return {
    httpStatus: 200,
    data: {
      actualTS: { resourceType: 'Actual TS', labelMonth, total: 6 },
      allocated: { resourceType: 'Allocated', labelMonth: {}, total: 0 },
      book: { resourceType: 'Book', labelMonth: {}, total: 0 },
      available: { resourceType: 'Available', labelMonth: {}, total: 0 },
    },
    messageId: "Success",
    errorMessage: "",
  };
};

// In-memory store for delivery plan history
const deliveryHistoryStore = new Map([
  [
    448,
    {
      total: 2,
      body: {
        userActionHistoryDtoList: [
          {
            id: 116603,
            actionTime: '10/Feb/26 14:33 PM',
            author: 'ttlam1',
            historyType: 'DELIVERY_PLAN',
            oldValueString: '{"id":1000110,"items":{}}',
            newValueString: '{"id":1000110,"items":{"04-2026":1.0,"05-2026":1.0,"06-2026":1.0,"07-2026":1.0}}',
            entity: 'Resource Info - ttlam1',
          },
          {
            id: 116572,
            actionTime: '10/Feb/26 14:30 PM',
            author: 'ttlam1',
            historyType: 'DELIVERY_PLAN',
            oldValueString: null,
            newValueString: '{"employeeType":"In-house","grossSalaryVnd":5000000.0,"role":"Member","location":"Vietnam","id":1000110,"position":"SE02","userName":"ttlam1","items":{"02-2026":1.0,"03-2026":1.0},"originalGrossSalary":5000000.0,"resourceType":"User"}',
            entity: 'Resource Info - ttlam1',
          },
        ],
        total: 2,
        pageNum: 1,
        pageSize: 10,
      },
      page: 1,
      size: 10,
    },
  ],
  [468, JSON.parse(JSON.stringify(mockUserActionHistoryDelivery468.data))],
]);

/**
 * Get History Delivery Plan
 * @param {number} businessPlanVersionId
 * @param {string} deliveryUnit
 * @param {number} pageNum
 * @param {number} pageSize
 * @param {boolean} isSale
 * @returns {Promise<Object>} Action history for delivery plan
 */
export const getHistoryDeliveryPlan = async (businessPlanVersionId, deliveryUnit, pageNum, pageSize, isSale) => {
  await delay();

  const id = Number(businessPlanVersionId);
  const stored = deliveryHistoryStore.get(id);

  return {
    httpStatus: 200,
    data: stored
      ? JSON.parse(JSON.stringify(stored))
      : { total: 0, body: { userActionHistoryDtoList: [], total: 0, pageNum: 1, pageSize: 10 }, page: 1, size: 10 },
    messageId: "Success",
    errorMessage: "",
  };
};

// Export all mock API functions as default
const mockBusinessPlanApi = {
  getBusinessPlanDetail,
  getBusinessPlanDetailByViewMode,
  getProductionRevenue,
  saveProductionRevenue,
  getOtherRevenue,
  saveOtherRevenue,
  getSellingPlan,
  saveSellingPlan,
  getRevenueSummary,
  getMMBills,
  getDeliveryPlanSummary,
  saveBusinessPlan,
  exportBusinessPlan,
  getDepartmentsByBPVersion,
  getListDUByVersionRevenue,
  getListDUByVersionDelivery,
  getAllPositions,
  getPositionRevenuePlan,
  getAllCurrencies,
  getIndustryCurrency,
  getAllIndustries,
  getIndustryDomain,
  getUserAndDepartmentCollaborator,
  getBusinessPlanSettingMaxKPI,
  getAllApprovalSteps,
  getBusinessPlanWorkflow,
  uploadDocument,
  getUserActionHistory,
  // Delivery Plan APIs
  getSummaryDeliveryPlan,
  getLocationExchangeRate,
  getResourcesInformationDeliveryPlan,
  getListResourceType,
  getListResource,
  getLocation,
  getEmployeeType,
  getEmployeePosition,
  getEmployeeRole,
  getOtherExpensesTable,
  saveDeliveryPlan,
  getResourcesInformationReference,
  getHistoryDeliveryPlan,
};

export default mockBusinessPlanApi;
