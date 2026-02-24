const WORK_FLOW_API = {
  getSpecificPermission: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-filter-status`),
    method: 'get',
  },
  getUserInWorkflow: {
    url: process.env.API_SALE.concat(`/api/business-plan/get-filter-version`),
    method: 'get',
  },
}

export { WORK_FLOW_API }
