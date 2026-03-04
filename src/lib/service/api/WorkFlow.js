import { API_SALE } from '../constant'

const WORK_FLOW_API = {
  getSpecificPermission: {
    url: `${API_SALE}/api/business-plan/get-filter-status`,
    method: 'get',
  },
  getUserInWorkflow: {
    url: `${API_SALE}/api/business-plan/get-filter-version`,
    method: 'get',
  },
}

export { WORK_FLOW_API }
