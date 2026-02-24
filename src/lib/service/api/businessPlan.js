const BUSINESS_PLAN_API = {
  getStatus: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-filter-status`),
    method: 'get',
  },
  getVersion: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-filter-version`),
    method: 'get',
  },
  getCustomerName: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-filter-customer-name`
    ),
    method: 'get',
  },
  getBusinessPlanName: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-filter-business-plan-name`
    ),
    method: 'get',
  },
  getProjectCode: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-filter-project-code`
    ),
    method: 'get',
  },
  getApprovalStep: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/get-filter-approval-step`
    ),
    method: 'get',
  },
  postListBusinessPlanList: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-business-plan-version-list`
    ),
    method: 'post',
  },
  getBusinessPlanWorkflow: {
    url: process.env.API_SALE.concat(
      '/api/business-plan/get-all-approval-steps'
    ),
    method: 'get',
  },
  approveRejectWO: {
    url: process.env.API_SALE.concat('/api/business-plan/change-workflow'),
    method: 'post',
  },
  saveDraft: {
    url: process.env.API_SALE.concat('/api/business-plan/save'),
    method: 'post',
  },
  submit: {
    url: process.env.API_SALE.concat('/api/business-plan/submit'),
    method: 'post',
  },
  getBusinessPlanDetailComments: {
    url: process.env.API_CRM.concat(
      '/api/delivery/v1/comment/get-module-comments'
    ),
    method: 'get',
  },
  postBusinessPlanDetailComment: {
    url: process.env.API_CRM.concat('/api/delivery/v1/comment/submit-comments'),
    method: 'post',
  },
  getBusinessPlanDetail: id => {
    return {
      url: process.env.API_SALE.concat(`/api/business-plan/detail/${id}`),
      method: 'get',
    }
  },

  getBusinessPlanSettingMaxKPI: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-setting-max-kpi`),
    method: 'get',
  },

  getDocuments: {
    url: process.env.API_SALE.concat(
      '/api/business-plan/get-file-by-bp-version-id'
    ),
    method: 'get',
  },
  uploadDocuments: {
    url: process.env.API_SALE.concat('/api/business-plan/uploads'),
    method: 'post',
  },
  deleteDocument: id => {
    return {
      url: process.env.API_SALE.concat(
        `/api/business-plan/delete-file-by-id/${id}`
      ),
      method: 'delete',
    }
  },
  getIndustryDomain: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-all-industry`),
    method: 'get',
  },
  getIndustryCurrency: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-all-currency`),
    method: 'get',
  },
  getUserAndDepartmentCollaborator: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/get-user-and-department`
    ),
    method: 'get',
  },
  getMMBillService: {
    url: process.env.API_SALE.concat(
      '/api/business-plan/business-plan-mm-bills'
    ),
    method: 'get',
  },
  getHistory: id => {
    return {
      url: process.env.API_SALE.concat(`/api/business-plan/history/${id}`),
      method: 'get',
    }
  },
  getMVVBusinessPlanRequest: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-filter-request-list-mvv`
    ),
    method: 'get',
  },
  getVersionBusinessPlanRequest: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-filter-request-list-version`
    ),
    method: 'get',
  },
  getStatusBusinessPlanRequest: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-filter-request-list-status`
    ),
    method: 'get',
  },
  getApprovalStepBusinessPlanRequest: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-filter-request-list-approval-step`
    ),
    method: 'get',
  },
  getBusinessPlanNameBusinessPlanRequest: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-filter-request-list-bp-name`
    ),
    method: 'get',
  },
  getAssigneeBusinessPlanRequest: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-filter-request-list-assignee`
    ),
    method: 'get',
  },
  postBusinessPlanRequestList: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/search-business-plan-version-request-list`
    ),
    method: 'post',
  },
  getBusinessPlanDU: {
    url: process.env.API_SALE.concat(``),
    method: 'get',
  },
  createNewVersion: id => {
    return {
      url: process.env.API_SALE.concat(
        `/api/business-plan/create-new-version/${id}`
      ),
      method: 'post',
    }
  },
  getListDU: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-filter-du`),
    method: 'get',
  },
  getListBU: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-filter-bu`),
    method: 'get',
  },
  getListGroupUpload: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-list-group`),
    method: 'get',
  },
  // Revenue Plan
  getPositionRevenuePlan: {
    url: process.env.API_SALE.concat(`/api/revenue-plan/filter-position`),
    method: 'get',
  },
  getProductionRevenue: {
    url: process.env.API_SALE.concat(`/api/business-plan/production-revenue`),
    method: 'get',
  },
  getHistoryRevenuePlan: (
    businessPlanVersionId,
    deliveryUnit,
    pageNum,
    pageSize,
    isSale
  ) => ({
    url: process.env.API_SALE.concat(
      `/api/business-plan-user-action-history/get-user-action-history?businessPlanVersionId=${businessPlanVersionId}&deliveryUnit=${deliveryUnit}&pageNum=${pageNum}&pageSize=${pageSize}&module=REVENUE_PLAN&isSale=${isSale}`
    ),
    method: 'get',
  }),
  getHistoryDeliveryPlan: (
    businessPlanVersionId,
    deliveryUnit,
    pageNum,
    pageSize,
    isSale
  ) => ({
    url: process.env.API_SALE.concat(
      `/api/business-plan-user-action-history/get-user-action-history?businessPlanVersionId=${businessPlanVersionId}&deliveryUnit=${deliveryUnit}&pageNum=${pageNum}&pageSize=${pageSize}&module=DELIVERY_PLAN&isSale=${isSale}`
    ),
    method: 'get',
  }),
  getOtherRevenue: {
    url: process.env.API_SALE.concat(`/api/business-plan/other-revenue`),
    method: 'get',
  },
  updateOtherRevenue: {
    url: process.env.API_SALE.concat(`/api/business-plan/other-revenue`),
    method: 'post',
  },
  getSellingPlan: {
    url: process.env.API_SALE.concat(`/api/business-plan/selling-plan`),
    method: 'get',
  },
  submitBaselineRevenuePlan: {
    url: process.env.API_SALE.concat(
      `/api/business-plan/base-line-revenue-plan`
    ),
    method: 'post',
  },
  getListDUByVersionRevenue: {
    url: process.env.API_SALE.concat(
      `/api/delivery-plan/filter-department-by-bp-version`
    ),
    method: 'get',
  },
  getSummaryRevenuePlan: {
    url: process.env.API_SALE.concat(`/api/revenue-plan/revenue-summary`),
    method: 'post',
  },
  // Delivery Plan
  getListDUByVersionDelivery: {
    url: process.env.API_SALE.concat(
      `/api/delivery-plan/filter-department-by-bp-version`
    ),
    method: 'get',
  },
  getSummaryDeliveryPlan: {
    url: process.env.API_SALE.concat(
      `/api/delivery-plan/delivery-plan-summary`
    ),
    method: 'get',
  },

  getLocationExchangeRate: {
    url: process.env.API_SALE.concat(`/api/delivery-plan/get-reference-table`),
    method: 'get',
  },
  // Resources Infomation
  getResourcesInformationDeliveryPlan: {
    url: process.env.API_SALE.concat(
      `/api/delivery-plan/get-list-delivery-plan-member`
    ),
    method: 'post',
  },
  getResourcesInformationReference: {
    url: process.env.API_SALE.concat(
      `/api/delivery-plan/get-resource-information-reference`
    ),
    method: 'post',
  },
  getListResourceType: {
    url: process.env.API_SALE.concat(`/api/delivery-plan/filter-resource-type`),
    method: 'get',
  },
  getListResource: {
    url: process.env.API_SALE.concat(`/api/delivery-plan/filter-resource`),
    method: 'get',
  },
  getLocation: {
    url: process.env.API_SALE.concat(`/api/delivery-plan/filter-location`),
    method: 'get',
  },
  getEmployeeType: {
    url: process.env.API_SALE.concat(`/api/delivery-plan/filter-employee-type`),
    method: 'get',
  },
  getEmployeePosition: {
    url: process.env.API_SALE.concat(`/api/delivery-plan/filter-position`),
    method: 'get',
  },
  getEmployeeRole: {
    url: process.env.API_SALE.concat(`/api/delivery-plan/filter-role`),
    method: 'get',
  },
  // Other expenses
  getOtherExpensesTable: {
    url: process.env.API_SALE.concat(
      `/api/delivery-plan/get-other-expenses-table`
    ),
    method: 'post',
  },
  // API Save Draft Delivery Plan
  saveDeliveryPlan: {
    url: process.env.API_SALE.concat(`/api/delivery-plan/save`),
    method: 'post',
  },
}

export default BUSINESS_PLAN_API
