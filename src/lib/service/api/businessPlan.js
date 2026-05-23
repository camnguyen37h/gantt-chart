import { API_SALE, API_CRM } from '../constant'

const BUSINESS_PLAN_API = {
  getStatus: {
    url: `${API_SALE}/api/business-plan/get-filter-status`,
    method: 'get',
  },
  getVersion: {
    url: `${API_SALE}/api/business-plan/get-filter-version`,
    method: 'get',
  },
  getCustomerName: {
    url: `${API_SALE}/api/business-plan/search-filter-customer-name`,
    method: 'get',
  },
  getBusinessPlanName: {
    url: `${API_SALE}/api/business-plan/search-filter-business-plan-name`,
    method: 'get',
  },
  getProjectCode: {
    url: `${API_SALE}/api/business-plan/search-filter-project-code`,
    method: 'get',
  },
  getApprovalStep: {
    url: `${API_SALE}/api/business-plan/get-filter-approval-step`,
    method: 'get',
  },
  postListBusinessPlanList: {
    url: `${API_SALE}/api/business-plan/search-business-plan-version-list`,
    method: 'post',
  },
  getBusinessPlanWorkflow: {
    url: `${API_SALE}/api/business-plan/get-all-approval-steps`,
    method: 'get',
  },
  approveRejectWO: {
    url: `${API_SALE}/api/business-plan/change-workflow`,
    method: 'post',
  },
  saveDraft: {
    url: `${API_SALE}/api/business-plan/save`,
    method: 'post',
  },
  submit: {
    url: `${API_SALE}/api/business-plan/submit`,
    method: 'post',
  },
  getBusinessPlanDetailComments: {
    url: `${API_CRM}/api/delivery/v1/comment/get-module-comments`,
    method: 'get',
  },
  postBusinessPlanDetailComment: {
    url: `${API_CRM}/api/delivery/v1/comment/submit-comments`,
    method: 'post',
  },
  getBusinessPlanDetail: id => {
    return {
      url: `${API_SALE}/api/business-plan/detail/${id}`,
      method: 'get',
    }
  },

  getUserRoleBusinessPlan: id => {
    return {
      url: `${API_SALE}/api/business-plan/get-user-role-business-plan/${id}`,
      method: 'get',
    }
  },

  getBusinessPlanSettingMaxKPI: {
    url: `${API_SALE}/api/business-plan/get-setting-max-kpi`,
    method: 'get',
  },

  getDocuments: {
    url: `${API_SALE}/api/business-plan/get-file-by-bp-version-id`,
    method: 'get',
  },
  uploadDocuments: {
    url: `${API_SALE}/api/business-plan/uploads`,
    method: 'post',
  },
  deleteDocument: id => {
    return {
      url: `${API_SALE}/api/business-plan/delete-file-by-id/${id}`,
      method: 'delete',
    }
  },
  getIndustryDomain: {
    url: `${API_SALE}/api/business-plan/get-all-industry`,
    method: 'get',
  },
  getIndustryCurrency: {
    url: `${API_SALE}/api/business-plan/get-all-currency`,
    method: 'get',
  },
  getUserAndDepartmentCollaborator: {
    url: `${API_SALE}/api/business-plan/get-user-and-department`,
    method: 'get',
  },
  getMMBillService: {
    url: `${API_SALE}/api/business-plan/business-plan-mm-bills`,
    method: 'get',
  },
  getHistory: id => {
    return {
      url: `${API_SALE}/api/business-plan/history/${id}`,
      method: 'get',
    }
  },
  getMVVBusinessPlanRequest: {
    url: `${API_SALE}/api/business-plan/search-filter-request-list-mvv`,
    method: 'get',
  },
  getVersionBusinessPlanRequest: {
    url: `${API_SALE}/api/business-plan/search-filter-request-list-version`,
    method: 'get',
  },
  getStatusBusinessPlanRequest: {
    url: `${API_SALE}/api/business-plan/search-filter-request-list-status`,
    method: 'get',
  },
  getApprovalStepBusinessPlanRequest: {
    url: `${API_SALE}/api/business-plan/search-filter-request-list-approval-step`,
    method: 'get',
  },
  getBusinessPlanNameBusinessPlanRequest: {
    url: `${API_SALE}/api/business-plan/search-filter-request-list-bp-name`,
    method: 'get',
  },
  getAssigneeBusinessPlanRequest: {
    url: `${API_SALE}/api/business-plan/search-filter-request-list-assignee`,
    method: 'get',
  },
  postBusinessPlanRequestList: {
    url: `${API_SALE}/api/business-plan/search-business-plan-version-request-list`,
    method: 'post',
  },
  getBusinessPlanDU: {
    url: `${API_SALE}`,
    method: 'get',
  },
  createNewVersion: id => {
    return {
      url: `${API_SALE}/api/business-plan/create-new-version/${id}`,
      method: 'post',
    }
  },
  getListDU: {
    url: `${API_SALE}/api/business-plan/get-filter-du`,
    method: 'get',
  },
  getListBU: {
    url: `${API_SALE}/api/business-plan/get-filter-bu`,
    method: 'get',
  },
  getListGroupUpload: {
    url: `${API_SALE}/api/business-plan/get-list-group`,
    method: 'get',
  },
  // Revenue Plan
  getPositionRevenuePlan: {
    url: `${API_SALE}/api/revenue-plan/filter-position`,
    method: 'get',
  },
  getProductionRevenue: {
    url: `${API_SALE}/api/business-plan/production-revenue`,
    method: 'get',
  },
  getHistoryRevenuePlan: (
    businessPlanVersionId,
    deliveryUnit,
    pageNum,
    pageSize,
    isSale
  ) => ({
    url: `${API_SALE}/api/business-plan-user-action-history/get-user-action-history?businessPlanVersionId=${businessPlanVersionId}&deliveryUnit=${deliveryUnit}&pageNum=${pageNum}&pageSize=${pageSize}&module=REVENUE_PLAN&isSale=${isSale}`,
    method: 'get',
  }),
  getHistoryDeliveryPlan: (
    businessPlanVersionId,
    deliveryUnit,
    pageNum,
    pageSize,
    isSale
  ) => ({
    url: `${API_SALE}/api/business-plan-user-action-history/get-user-action-history?businessPlanVersionId=${businessPlanVersionId}&deliveryUnit=${deliveryUnit}&pageNum=${pageNum}&pageSize=${pageSize}&module=DELIVERY_PLAN&isSale=${isSale}`,
    method: 'get',
  }),
  getOtherRevenue: {
    url: `${API_SALE}/api/business-plan/other-revenue`,
    method: 'get',
  },
  updateOtherRevenue: {
    url: `${API_SALE}/api/business-plan/other-revenue`,
    method: 'post',
  },
  getSellingPlan: {
    url: `${API_SALE}/api/business-plan/selling-plan`,
    method: 'get',
  },
  submitBaselineRevenuePlan: {
    url: `${API_SALE}/api/business-plan/base-line-revenue-plan`,
    method: 'post',
  },
  getListDUByVersionRevenue: {
    url: `${API_SALE}/api/delivery-plan/filter-department-by-bp-version`,
    method: 'get',
  },
  getSummaryRevenuePlan: {
    url: `${API_SALE}/api/revenue-plan/revenue-summary`,
    method: 'post',
  },
  // Delivery Plan
  getListDUByVersionDelivery: {
    url: `${API_SALE}/api/delivery-plan/filter-department-by-bp-version`,
    method: 'get',
  },
  getSummaryDeliveryPlan: {
    url: `${API_SALE}/api/delivery-plan/delivery-plan-summary`,
    method: 'get',
  },

  getLocationExchangeRate: {
    url: `${API_SALE}/api/delivery-plan/get-reference-table`,
    method: 'get',
  },
  // Resources Infomation
  getResourcesInformationDeliveryPlan: {
    url: `${API_SALE}/api/delivery-plan/get-list-delivery-plan-member`,
    method: 'post',
  },
  getResourcesInformationReference: {
    url: `${API_SALE}/api/delivery-plan/get-resource-information-reference`,
    method: 'post',
  },
  getListResourceType: {
    url: `${API_SALE}/api/delivery-plan/filter-resource-type`,
    method: 'get',
  },
  getListResource: {
    url: `${API_SALE}/api/delivery-plan/filter-resource`,
    method: 'get',
  },
  getLocation: {
    url: `${API_SALE}/api/delivery-plan/filter-location`,
    method: 'get',
  },
  getEmployeeType: {
    url: `${API_SALE}/api/delivery-plan/filter-employee-type`,
    method: 'get',
  },
  getEmployeePosition: {
    url: `${API_SALE}/api/delivery-plan/filter-position`,
    method: 'get',
  },
  getEmployeeRole: {
    url: `${API_SALE}/api/delivery-plan/filter-role`,
    method: 'get',
  },
  // Other expenses
  getOtherExpensesTable: {
    url: `${API_SALE}/api/delivery-plan/get-other-expenses-table`,
    method: 'post',
  },
  // API Save Draft Delivery Plan
  saveDeliveryPlan: {
    url: `${API_SALE}/api/delivery-plan/save`,
    method: 'post',
  },
  getUserActionHistory: {
    url: `${API_SALE}/api/business-plan-user-action-history/get-user-action-history`,
    method: 'get',
  },
}

export default BUSINESS_PLAN_API

