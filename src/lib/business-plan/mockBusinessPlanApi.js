/**
 * Mock API for Business Plan Module
 * Simulates network delay and provides CRUD operations for Business Plan
 */

import {
  mockBusinessPlanDetail,
  mockProductionRevenue,
  mockOtherRevenue,
  mockSellingPlan,
  mockRevenueSummary,
  mockMMBills,
  mockDeliveryPlanSummary,
  mockDepartments,
  mockPositions,
  mockCurrencies,
  mockIndustries,
  mockApprovalSteps,
} from './mockBusinessPlanData';

// Simulate network delay
const NETWORK_DELAY_MS = 500;
const delay = (ms = NETWORK_DELAY_MS) => 
  new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for business plans
const businessPlansStore = new Map([
  [436, JSON.parse(JSON.stringify(mockBusinessPlanDetail))]
]);

// In-memory storage for production revenue
const productionRevenueStore = new Map([
  [436, JSON.parse(JSON.stringify(mockProductionRevenue))]
]);

// In-memory storage for other revenue
const otherRevenueStore = new Map([
  [436, JSON.parse(JSON.stringify(mockOtherRevenue))]
]);

// In-memory storage for selling plan
const sellingPlanStore = new Map([
  [436, JSON.parse(JSON.stringify(mockSellingPlan))]
]);

// In-memory storage for revenue summary
const revenueSummaryStore = new Map([
  [436, JSON.parse(JSON.stringify(mockRevenueSummary))]
]);

// Counter for generating new IDs
let businessPlanIdCounter = 1000;

/**
 * Get Business Plan Detail
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<Object>} Business plan detail
 */
export const getBusinessPlanDetail = async (businessPlanId) => {
  await delay();
  
  const businessPlan = businessPlansStore.get(businessPlanId);
  
  if (!businessPlan) {
    throw new Error(`Business Plan with ID ${businessPlanId} not found`);
  }
  
  return JSON.parse(JSON.stringify(businessPlan));
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
  
  return JSON.parse(JSON.stringify(mockMMBills));
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
  
  return JSON.parse(JSON.stringify(mockDepartments));
};

/**
 * Get All Positions
 * @returns {Promise<Array>} List of positions
 */
export const getAllPositions = async () => {
  await delay(300);
  
  return JSON.parse(JSON.stringify(mockPositions));
};

/**
 * Get All Currencies
 * @returns {Promise<Array>} List of currencies
 */
export const getAllCurrencies = async () => {
  await delay(300);
  
  return JSON.parse(JSON.stringify(mockCurrencies));
};

/**
 * Get All Industries
 * @returns {Promise<Array>} List of industries
 */
export const getAllIndustries = async () => {
  await delay(300);
  
  return JSON.parse(JSON.stringify(mockIndustries));
};

/**
 * Get All Approval Steps
 * @returns {Promise<Array>} List of approval steps
 */
export const getAllApprovalSteps = async () => {
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
 * Get User Action History
 * @param {number} businessPlanId - Business Plan ID
 * @returns {Promise<Array>} Action history
 */
export const getUserActionHistory = async (businessPlanId) => {
  await delay(500);
  
  return [
    {
      id: 1,
      action: 'Created',
      user: 'John Doe',
      ldap: 'jdoe',
      timestamp: Date.now() - 86400000 * 7,
      details: 'Created business plan',
    },
    {
      id: 2,
      action: 'Updated',
      user: 'Jane Smith',
      ldap: 'jsmith',
      timestamp: Date.now() - 86400000 * 5,
      details: 'Updated production revenue',
    },
    {
      id: 3,
      action: 'Approved',
      user: 'Bob Johnson',
      ldap: 'bjohnson',
      timestamp: Date.now() - 86400000 * 2,
      details: 'Approved business plan version 1',
    },
  ];
};

// Export all mock API functions as default
const mockBusinessPlanApi = {
  getBusinessPlanDetail,
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
  getAllPositions,
  getAllCurrencies,
  getAllIndustries,
  getAllApprovalSteps,
  uploadDocument,
  getUserActionHistory,
};

export default mockBusinessPlanApi;
